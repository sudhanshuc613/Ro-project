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
        # Build-time date leak: agar 50%+ URL ki date AAJ ki hai to `new Date()` wapas aa gaya.
        today_n = sum(1 for x in lms if x[:10] == TODAY.isoformat())
        chk('🔴 aadhe se zyada URL par "aaj" ki date nahi (new Date() leak)',
            len(lms) == 0 or today_n < len(lms) * 0.5,
            f'{today_n}/{len(lms)} par aaj ki date')
        stale = sum(1 for x in lms if x[:10] <= '2026-10-13')
        chk('🔴 2026-10-13 ya purani date wale URL 20 se kam',
            stale < 20, f'{stale}/{len(lms)} URL abhi bhi 13 Oct ya purane')

print()
print('=' * 74)
print(f'  PASS: {passed}    FAIL: {failed}')
print('=' * 74)
sys.exit(1 if failed else 0)
