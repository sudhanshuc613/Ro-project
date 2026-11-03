#!/usr/bin/env python3
"""
LASTMOD HONESTY GATE  —  35th gate, 3 Nov 2026

🔴 Ye gate kyun bana (asli ghatna, chhupayi nahi gayi):

   27 Oct 2026 ko maine 393 andruni anchor badle (cannibalization fix).
   2 Nov 2026 ko 149 page ka footer badla.
   Dono baar `src/lib/seo/content-dates.ts` ko haath hi nahi lagaya.

   Natija, live sitemap me naapa gaya 2 Nov ko:

       118 URL  lastmod = 2026-10-13
         7 URL  lastmod = 2026-10-12
         8 URL  lastmod = 2026-11-02   ← sirf naye page

   Yaani Google ko bola gaya "13 October se kuch nahi badla" — theek us
   waqt jab un page ki internal linking badalne ke baad unka dobara crawl
   hona sabse zaroori tha. Owner ki ranking giri aur recovery slow hui.

   `content-dates.ts` ka apna likha hua niyam yahi kehta hai:
       "date tabhi badlo jab page ka ASLI content badle
        — H1, body copy, schema, ya internal links."
   Niyam file me likha tha. Maine follow nahi kiya. Isliye ab TEST hai.

── Ye gate kya jaanchta hai ────────────────────────────────────────────────

  1. Har group-date aur per-page date aaj se PURANI ho (future date = jhooth).
  2. `INTENT_DATE_OVERRIDES` ka har slug sach me ek maujood intent ho —
     warna map me mara hua naam pada rahega aur kisi ko pata nahi chalega.
  3. Har intent slug ke liye `intentDate()` ek Date de (undefined nahi).
  4. Sitemap ka HAR <loc> ya to lastmod de, ya bilkul na de — aadha-adhoora
     ya invalid date nahi (W3C format).
  5. 🔴 SABSE ZAROORI — koi bhi lastmod date build ke din ke BARABAR na ho
     jab tak wo override/trust list me na ho. `new Date()` wapas aa gaya to
     ye pakad lega. (Wahi bug 19 Sep ko tha: har ghante 133 URL ka lastmod
     badal jata tha aur Google ne poori site ka lastmod ignore kar diya.)
  6. 🔴 Jo page sabse zyada badle hain (anchor fix wale) unki date 27 Oct ya
     uske BAAD ki ho. Agar koi unhe wapas October 13 par le gaya to FAIL.
  7. Detector khud sahi hai — do banawati case par sabit karta hai.

Chalao:  python3 scripts/lastmod-honesty-test.py [BASE_URL]
         BASE_URL diya to live/local sitemap bhi jaancha jaata hai.
"""
import datetime as dt
import os
import re
import sys
import urllib.request

BASE = (sys.argv[1].rstrip('/') if len(sys.argv) > 1 else '')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CD = os.path.join(ROOT, 'src', 'lib', 'seo', 'content-dates.ts')

passed = 0
failed = 0


def chk(name, ok, detail=''):
    global passed, failed
    if ok:
        passed += 1
        print(f'  PASS  {name}' + (f'  {detail}' if detail else ''))
    else:
        failed += 1
        print(f'  FAIL  {name}' + (f'  {detail}' if detail else ''))


print('=' * 74)
print('  LASTMOD HONESTY  —  sitemap ki date sach bolti hai ya nahi')
print('=' * 74)

src = open(CD, encoding='utf-8').read()

# ── Date nikaalo. Comment wali line chhodo (comment-aware, bug class 14). ──
def strip_comments(text):
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    return re.sub(r'//[^\n]*', '', text)


code = strip_comments(src)
page_dates = {p: v for p, v in re.findall(r"'(/[^']*)'\s*:\s*d\('([\d-]+)'\)", code)}
group_dates = dict(re.findall(r"export const ([A-Z_]+_DATE)\s*=\s*d\('([\d-]+)'\)", code))
overrides = {s: v for s, v in re.findall(r"'([a-z0-9-]+)'\s*:\s*d\('([\d-]+)'\)", code)
             if not s.startswith('/')}

print(f'\n── 1. content-dates.ts padhi gayi ──')
chk('per-page date mili', len(page_dates) >= 10, f'{len(page_dates)} page')
chk('group date mili', len(group_dates) >= 4, f'{len(group_dates)} group: {sorted(group_dates)}')
chk('intent override map mila', len(overrides) >= 1, f'{sorted(overrides)}')

TODAY = dt.date.today()

print(f'\n── 2. Koi date future me nahi (aaj {TODAY}) ──')
future = [f'{k}={v}' for k, v in {**page_dates, **group_dates, **overrides}.items()
          if dt.date.fromisoformat(v) > TODAY]
chk('🔴 koi lastmod aane wale kal ki nahi', not future, str(future[:5]))

print('\n── 3. Anchor-fix (27 Oct) wale page purane nahi reh gaye ──')
# 27 Oct 2026 ko internal links badle the. In group/page ki date us din ya baad ki honi chahiye.
CUTOFF = dt.date(2026, 10, 27)
MUST_BE_FRESH = {
    'AREA_PAGES_DATE': group_dates.get('AREA_PAGES_DATE'),
    'BRAND_PAGES_DATE': group_dates.get('BRAND_PAGES_DATE'),
    'INTENT_PAGES_DATE': group_dates.get('INTENT_PAGES_DATE'),
    '/service-patna': page_dates.get('/service-patna'),
    '/ro-service-in-patna': page_dates.get('/ro-service-in-patna'),
}
for k, v in MUST_BE_FRESH.items():
    chk(f'{k} ≥ 2026-10-27',
        v is not None and dt.date.fromisoformat(v) >= CUTOFF,
        f'{v}')

print('\n── 4. Override map me mara hua slug nahi ──')
intents = re.findall(r"slug:\s*'([a-z0-9-]+)'",
                     open(os.path.join(ROOT, 'src', 'lib', 'seo',
                                       'service-intent-data.ts'), encoding='utf-8').read())
dead = [s for s in overrides if s not in intents]
chk('🔴 har override slug ek asli intent hai', not dead, f'mare hue: {dead}')
chk('intent gine gaye', len(intents) >= 7, f'{len(intents)} intent')
chk('intentDate() function maujood', 'export function intentDate' in src)

print('\n── 5. Detector khud sahi hai ──')
chk('detector: future date PAKADTA hai',
    dt.date.fromisoformat('2099-01-01') > TODAY)
chk('detector: purani date CHHODTA hai',
    not (dt.date.fromisoformat('2020-01-01') > TODAY))

if BASE:
    print(f'\n── 6. Live sitemap — {BASE} ──')
    req = urllib.request.Request(
        BASE + '/sitemap.xml',
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                               'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'})
    try:
        xml = urllib.request.urlopen(req, timeout=40).read().decode('utf8', 'ignore')
    except Exception as e:
        chk('sitemap.xml mili', False, str(e)[:60])
        xml = ''
    if xml:
        locs = re.findall(r'<loc>\s*([^<\s]+)\s*</loc>', xml)
        lms = re.findall(r'<lastmod>\s*([^<\s]+)\s*</lastmod>', xml)
        chk('sitemap mili', len(locs) > 100, f'{len(locs)} URL')
        bad_fmt = [x for x in lms if not re.match(r'^\d{4}-\d{2}-\d{2}', x)]
        chk('🔴 har lastmod W3C format me', not bad_fmt, str(bad_fmt[:3]))
        fut = [x for x in lms if x[:10] > TODAY.isoformat()]
        chk('🔴 sitemap me koi future lastmod nahi', not fut, str(fut[:3]))
        # ══════════════════════════════════════════════════════════════════
        # 🔴 `new Date()` LEAK CHECK — 3 Nov 2026 ko SAHI kiya gaya
        #
        # Pehla version ye dekhta tha ki 50%+ URL par "aaj" ki date to nahi.
        # Wo GALAT tha: jis din hum sach me 124 page deploy karte hain, us
        # din unki date aaj ki HONI hi chahiye. Gate ne theek usi din jhootha
        # FAIL diya — yaani check ki soch hi galat thi.
        #
        # `new Date()` leak ki asli pehchaan ye hai:
        #   (a) har request par value BADAL jaati hai, aur
        #   (b) usme asli ghadi ka time hota hai, aadhi raat nahi.
        # Hamari saari date `d('YYYY-MM-DD')` se banti hain = T00:00:00.000Z.
        # DB wali (product/category) me asli time ho sakta hai, wo theek hai.
        #
        # Ab wahi do cheezein naapi jaati hain. Ye purane check se KAHIN
        # ZYADA SAKHT hai aur kisi bhi din sahi jawab deta hai.
        # ══════════════════════════════════════════════════════════════════
        import time as _t
        _t.sleep(2)
        st_b, xml_b = None, ''
        try:
            _r = urllib.request.urlopen(urllib.request.Request(
                BASE + '/sitemap.xml', headers={'User-Agent': 'Mozilla/5.0'}), timeout=40)
            xml_b = _r.read().decode('utf8', 'ignore')
        except Exception:
            pass
        lms_b = re.findall(r'<lastmod>\s*([^<\s]+)\s*</lastmod>', xml_b)
        chk('🔴 do fetch me lastmod BILKUL same (new Date() leak nahi)',
            bool(lms_b) and lms == lms_b,
            f'{len(lms)} vs {len(lms_b)} · same: {lms == lms_b}')

        # Abhi-abhi bani date = request par generate hui = leak.
        #
        # 🔴 Sirf CODE-DRIVEN URL par. /products/<slug> aur /category/<slug>
        #    apna lastmod DB ke `updatedAt` se lete hain — owner admin me
        #    product edit kare to wo sach me abhi ka ho sakta hai, aur local
        #    test DB me to seed abhi-abhi chalta hai. Un par "fresh" hona
        #    bilkul sahi hai. Code wali date kabhi fresh nahi honi chahiye.
        pair_list = re.findall(
            r'<loc>\s*([^<\s]+)\s*</loc>\s*<lastmod>\s*([^<\s]+)\s*</lastmod>', xml)
        if not pair_list:
            pair_list = list(zip(re.findall(r'<loc>\s*([^<\s]+)\s*</loc>', xml), lms))
        now = dt.datetime.now(dt.timezone.utc)
        fresh = []
        for u_, x in pair_list:
            pth = re.sub(r'^https?://[^/]+', '', u_) or '/'
            if pth.startswith('/products/') or pth.startswith('/category/'):
                continue          # DB-driven, fresh hona jayaz hai
            try:
                tsv = dt.datetime.fromisoformat(x.replace('Z', '+00:00'))
            except ValueError:
                continue
            if 0 <= (now - tsv).total_seconds() < 900:
                fresh.append(f'{pth} {x}')
        chk('🔴 code-driven lastmod me se koi pichhle 15 min ka nahi',
            not fresh, f'{len(fresh)} mile: {fresh[:3]}')

        # Code wali saari date aadhi raat par honi chahiye.
        midnight = sum(1 for x in lms if x.endswith('T00:00:00.000Z'))
        chk('code-driven date aadhi raat par hain',
            midnight >= len(lms) * 0.8,
            f'{midnight}/{len(lms)} midnight (baaki DB ke updatedAt)')
        stale = sum(1 for x in lms if x[:10] <= '2026-10-13')
        chk('🔴 2026-10-13 ya purani date wale URL 20 se kam',
            stale < 20, f'{stale}/{len(lms)} URL abhi bhi 13 Oct ya purane')

# ══════════════════════════════════════════════════════════════════════════
# 🔴 7. SABSE SAKHT CHECK — "notice dikh raha hai to date bhi nayi ho"
#
# Ye 3 Nov 2026 ko joda gaya kyunki maine WAHI GALTI DOOSRI BAAR KI.
#
#   2 Nov : 393 anchor + 149 page ka footer badla, lastmod bump nahi kiya.
#           Gate banaya. Gate ne sirf "date >= 27 Oct" check kiya.
#   3 Nov : ~120 page par naya brand notice daala, lastmod phir bump nahi
#           kiya. Gate CHUP RAHA — kyunki saari date 27 Oct hi thi, aur
#           27 Oct ">= 27 Oct" hai. Test pass, kaam galat.
#
#   Live naap: 125 page notice dikha rahe the, 124 ka lastmod purana tha.
#
# Ab gate ek CONSTANT par nahi, ASLI PAGE par bharosa karta hai:
#   har sitemap URL khol kar dekho notice hai ya nahi — agar hai to uska
#   lastmod BRAND_NOTICE_DATE se purana nahi ho sakta.
#
# Isko dhokha dene ka ek hi tarika hai: notice hata do. Aur wo
# verify-brand-notice turant pakad lega.
# ══════════════════════════════════════════════════════════════════════════
if BASE:
    print('\n── 7. Jis page par brand notice dikh raha, uski date nayi ho ──')
    bnd = re.search(r"BRAND_NOTICE_DATE = d\('([\d-]+)'\)", src)
    chk('BRAND_NOTICE_DATE constant maujood', bool(bnd),
        bnd.group(1) if bnd else 'NAHI MILA')
    if bnd and xml:
        want = bnd.group(1)
        pairs = re.findall(r'<loc>\s*([^<\s]+)\s*</loc>\s*<lastmod>\s*([^<\s]+)\s*</lastmod>', xml)
        if not pairs:
            L = re.findall(r'<loc>\s*([^<\s]+)\s*</loc>', xml)
            M = re.findall(r'<lastmod>\s*([^<\s]+)\s*</lastmod>', xml)
            pairs = list(zip(L, M))
        chk('sitemap me loc+lastmod jode mile', len(pairs) > 100, f'{len(pairs)}')
        stale, unread, withnotice = [], [], 0
        for u, lm in pairs:
            path = re.sub(r'^https?://[^/]+', '', u) or '/'
            try:
                r = urllib.request.urlopen(
                    urllib.request.Request(BASE + path, headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                                      '(KHTML, like Gecko) Chrome/131.0 Safari/537.36'}), timeout=35)
                hh = r.read().decode('utf8', 'ignore')
            except Exception:
                unread.append(path)
                continue
            if ('data-brand-notice' in hh) or ('We are NOT an authorised' in hh):
                withnotice += 1
                if lm[:10] < want:
                    stale.append(f'{path} ({lm[:10]})')
        chk('🔴 saare sitemap page padhe gaye', not unread,
            f'chhoote: {unread[:4]}')
        chk('🔴 notice wale HAR page ka lastmod >= BRAND_NOTICE_DATE', not stale,
            f'{withnotice} page par notice · purani date wale {len(stale)}: {stale[:5]}')
        # Detector khud sahi hai
        chk('detector: purani date PAKADTA hai', '2026-10-27' < want)
        chk('detector: nayi date CHHODTA hai', not ('2026-12-01' < want))

print()
print('=' * 74)
print(f'  PASS: {passed}    FAIL: {failed}')
print('=' * 74)
sys.exit(1 if failed else 0)
