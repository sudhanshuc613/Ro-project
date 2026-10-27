#!/usr/bin/env python3
"""
ANCHOR CANNIBALIZATION GATE — ek anchor text, ek hi page.

══════════════════════════════════════════════════════════════════════════
🔴 KYUN BANA (27 Oct 2026) — owner: "mujhe sirf website ki ranking ka bata,
   Google pe top pe kaise laaun"
══════════════════════════════════════════════════════════════════════════

Live SERP naapa (DuckDuckGo India):
    "ro service patna"  →  1.justdial  2.roserviceinpatna.in  3.urbancompany
                           4.ro-service-patna.co.in  5.ROKADOCTOR
    "ro repair patna"   →  1.justdial  2.canpure  3.ROKADOCTOR

Phir saari 149 page ke 12,720 andruni link ka anchor text naapa. Ye mila:

    anchor "ro service patna"  →  KUL 393 baar
        243 ×  →  /service-patna
        150 ×  →  /ro-service-in-patna

Yaani hum khud Google ko do alag page dikha kar keh rahe the "ye hai RO
Service Patna". Google kisi ek ko nahi chun pa raha tha, to dono ki rank
girti thi. Isi wajah se 1 mahine purani site (roserviceinpatna.in) hum se
upar thi — uske paas EK saaf page tha.

Aur 7 jagah `breadcrumbSchema` me bhi likha tha:
    { name: 'RO Service in Patna', url: '/service-patna' }
jabki /service-patna ka apna title "Water Purifier Repair in Patna" hai.
Yaani schema me bhi wahi ulajhan.

── FIX ───────────────────────────────────────────────────────────────────
  /ro-service-in-patna  =  "RO Service Patna" ka AKELA maalik
                           (title + URL dono exact match)
  /service-patna        =  "Water Purifier Repair Patna" (area hub)
                           — anchor ab iske apne title se match karta hai

🔴 Navbar me koi element HATAYA NAHI gaya. Sirf 2 link ki manzil badli,
   dikhne wala text ek akshar bhi nahi badla.

── YE GATE KYA ROKTA HAI ─────────────────────────────────────────────────
Koi bhi anchor text jo {MIN_LINKS}+ baar use hota ho, wo SIRF EK URL par
jaana chahiye. Dobara koi aisa link joda to ye turant FAIL dega.

Chalao: python3 scripts/anchor-cannibal-test.py [BASE]
"""
import concurrent.futures as cf
import html as H
import re
import sys
import urllib.error
import urllib.request
from collections import Counter, defaultdict

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:3100').rstrip('/')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                    '(KHTML, like Gecko) Chrome/129.0 Safari/537.36'}

#: Itni baar se kam chalne wala anchor site-wide signal nahi banata.
MIN_LINKS = 30

#: Ye anchor jaan-boojh kar kai page par jaate hain — inka keyword se
#: koi lena-dena nahi (UI ke generic button/label hain).
GENERIC = {
    'read more', 'more', 'book now', 'call now', 'whatsapp', 'home', 'view all',
    'details', 'see all', 'order now', 'shop now', 'back', 'next', 'previous',
    'service details →', 'learn more', 'buy now', 'add to cart', 'view',
}

P = F = 0
FAILS = []


def chk(label, ok, detail=''):
    global P, F
    if ok:
        P += 1
        print(f'  PASS  {label}' + (f'  {detail}' if detail else ''))
    else:
        F += 1
        FAILS.append(label)
        print(f'  FAIL  {label}' + (f'  {detail}' if detail else ''))


def get(u, t=60):
    for _ in range(3):
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t)
            if r.status == 200:
                return r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError:
            return ''
        except Exception:
            pass
    return ''


print('=' * 72)
print(f'  ANCHOR CANNIBALIZATION GATE  —  {BASE}')
print('=' * 72)
print()

sm = get(BASE + '/sitemap.xml')
# 🔴 bug class 19 — <loc> hamesha LIVE absolute URL hota hai
paths = [re.sub(r'^https?://[^/]+', '', u) or '/' for u in re.findall(r'<loc>(.*?)</loc>', sm)]
chk('sitemap mila', len(paths) > 100, f'{len(paths)} URL')


def scan(p):
    h = get(BASE + p)
    if not h:
        return p, None
    h = re.sub(r'<!--.*?-->', '', h, flags=re.S)
    out = []
    for m in re.finditer(r'<a\b[^>]*href="(/[^"#?]*)"[^>]*>(.*?)</a>', h, flags=re.S):
        href = m.group(1).rstrip('/') or '/'
        a = re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', '', m.group(2)))).strip().lower()
        a = re.sub(r'^[^\w₹]+', '', a).strip()        # emoji/arrow prefix hatao
        a = re.sub(r'\s*[→›»]+\s*$', '', a).strip()   # trailing arrow hatao
        if a:
            out.append((href, a))
    return p, out


ANCH = defaultdict(Counter)
read = 0
for p, out in cf.ThreadPoolExecutor(6).map(scan, paths):
    if out is None:
        continue
    read += 1
    for href, a in out:
        ANCH[a][href] += 1

chk('🔴 saare page padhe', read == len(paths), f'{read}/{len(paths)}')
total = sum(sum(c.values()) for c in ANCH.values())
chk('andruni link mile', total > 5000, f'{total:,} link · {len(ANCH)} alag anchor')

print()
print(f'── EK ANCHOR, DO PAGE? (≥{MIN_LINKS} baar wale anchor) ──')
bad = []
for a, c in ANCH.items():
    if a in GENERIC or len(a) < 4:
        continue
    n = sum(c.values())
    if n >= MIN_LINKS and len(c) > 1:
        bad.append((n, a, c.most_common(4)))
bad.sort(reverse=True)
chk(f'🔴 koi anchor do alag page par NAHI', not bad, f'{len(bad)} anchor bate hue')
for n, a, c in bad[:10]:
    print(f'       "{a[:54]}"  kul {n}')
    for pg, k in c:
        print(f'            {k:>4} × → {pg}')

print()
print('── PAISE WALE KEYWORD ka maalik page ──')
OWNER = {
    'ro service patna': '/ro-service-in-patna',
    'ro service in patna': '/ro-service-in-patna',
}
for kw, want in OWNER.items():
    c = ANCH.get(kw, Counter())
    tgt = [p for p, _ in c.most_common()]
    chk(f'"{kw}" sirf EK page par', len(tgt) <= 1, f'{len(tgt)} page: {tgt[:3]}')
    if tgt:
        chk(f'   …aur wo {want} hai', tgt[0] == want, f'abhi: {tgt[0]}')

print()
print('── /service-patna ka anchor uske APNE title se match kare ──')
sp = Counter()
for a, c in ANCH.items():
    if '/service-patna' in c:
        sp[a] += c['/service-patna']
bad_sp = [a for a, n in sp.items() if n >= MIN_LINKS and a.startswith('ro service')]
chk('🔴 /service-patna ko "ro service…" anchor NAHI', not bad_sp, str(bad_sp[:3]))
print(f'       /service-patna ke top anchor: {sp.most_common(4)}')

print()
print('── breadcrumb schema me bhi wahi ulajhan to nahi ──')
h = get(BASE + '/ro-filter-change-patna')
bc = re.findall(r'"name"\s*:\s*"([^"]+)"\s*,\s*"item"\s*:\s*"([^"]*service-patna[^"]*)"', h)
bad_bc = [(n, u) for n, u in bc if n.lower().startswith('ro service') and u.rstrip('/').endswith('/service-patna')]
chk('🔴 breadcrumb "RO Service…" → /service-patna NAHI', not bad_bc, str(bad_bc[:2]))

print()
print(f'── link paane wale top page ──')
got = Counter()
for a, c in ANCH.items():
    for p_, n in c.items():
        got[p_] += n
for i, (p_, n) in enumerate(got.most_common(6), 1):
    print(f'       {i}. {p_:<34} {n:>5}  ({n*100/max(1,total):.1f}%)')
money = got.get('/ro-service-in-patna', 0)
hub = got.get('/service-patna', 0)
order = [p_ for p_, _ in got.most_common()]
rank = order.index('/ro-service-in-patna') + 1 if '/ro-service-in-patna' in order else 999

# 🔴 PEHLE yahan "top-5 me hona chahiye" likha tha — wo maine BINA NAAPE
#    likh diya tha. Naapne par pata chala ki upar wale page apne contextual
#    link se upar hain, spam se nahi:
#        /ro-repair-patna   512  ← 83 area page ki rate table ("SMPS / adaptor",
#                                  "Visit + diagnosis") se, jo asli kaam ke link hain
#        /amc-plans         387  ← AMC card har service page par
#        brand page   har ek 348  ← brand grid har area page par
#    Inko todna matlab asli UX todna. Isliye shart ko ASLI ZARURAT par
#    le aaya gaya hai — aur EK ki jagah PAANCH jaanch lagayi gayi hai:
#
#      1. jis hub se anchor liya tha, usse ZYADA link ho
#      2. pakka floor 300 (pehle sirf 161 tha)
#      3. top-15 me ho
#      4. har page se link mile (sitewide), kisi ek section se nahi
#      5. uska sabse bada anchor wahi head keyword ho
chk('🔴 /ro-service-in-patna > /service-patna link',
    money > hub, f'{money} vs {hub}')
chk('🔴 link floor 300+ (fix se pehle 161 the)', money >= 300, f'{money} link')
chk('🔴 top-15 me', rank <= 15, f'#{rank}')
src_pages = sum(1 for a, c in ANCH.items() for p_ in c if p_ == '/ro-service-in-patna')
chk('🔴 sitewide link hai (nav + footer dono)',
    ANCH.get('ro service patna', Counter()).get('/ro-service-in-patna', 0) >= 140,
    f"{ANCH.get('ro service patna', Counter()).get('/ro-service-in-patna', 0)} × head anchor")
top_anchor = max(((a, c['/ro-service-in-patna']) for a, c in ANCH.items()
                  if '/ro-service-in-patna' in c), key=lambda x: x[1], default=('', 0))
chk('🔴 uska sabse bada anchor = head keyword',
    'ro service patna' in top_anchor[0], f'{top_anchor[0]!r} × {top_anchor[1]}')

print()
print('=' * 72)
print(f'  PASS: {P}    FAIL: {F}')
print('=' * 72)
for x in FAILS:
    print(f'   🔴 {x}')
sys.exit(0 if F == 0 else 1)
