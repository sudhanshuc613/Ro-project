#!/usr/bin/env python3
"""
SEO FIXES GATE — 26 Oct 2026 ke do kaam ek saath jaanchta hai.

══════════════════════════════════════════════════════════════════════════
A. CLOUDFLARE EMAIL OBFUSCATION — 149 page par toota hua link
══════════════════════════════════════════════════════════════════════════
Live naap (26 Oct):

    /cdn-cgi/l/email-protection  →  HTTP 404
    kitne page par              →  149 / 149

Cloudflare ka Scrape Shield footer ka email utha kar uski jagah
`<a href="/cdn-cgi/l/email-protection" class="__cf_email__">` daal deta
tha. `final-verify.py` ka link-check isi par atakta tha (45 PASS / 1 FAIL)
aur Google ko asli email ki jagah "[email protected]" dikhta tha.

Fix bina dashboard toggle ke: Cloudflare `<!--email_off-->` ... 
`<!--/email_off-->` ke beech ka content chhodta hai. Wo HTML comment
React me sirf `dangerouslySetInnerHTML` se nikalta hai, isliye ek chhota
component bana: src/components/common/EmailOff.tsx

Ye gate jaanchta hai:
  1. source me kahin bhi email SEEDHA render nahi ho raha
  2. rendered HTML me `<!--email_off-->` dono taraf maujood hai
  3. asli email string HTML me hai (obfuscate hone par ye gayab ho jaata)
  4. local HTML me `__cf_email__` / `/cdn-cgi/` bilkul nahi
     (local par Cloudflare hai hi nahi — ye sirf regression guard hai)

══════════════════════════════════════════════════════════════════════════
B. HINGLISH LONG-TAIL — ek keyword, ek page
══════════════════════════════════════════════════════════════════════════
`deep-audit-live.py` (26 Oct) ne bataya: 72-gap list me 3 keyword KAHIN
NAHI the aur 2 sirf body me the. Ab har ek ka apna H2 hai.

🔴 Site par pehle se cannibalization naapi hui hai —
   "ro service near me" 86 page ke title/H1 me. Isliye ye gate pakka
   karta hai ki in 5 phrase me se har ek SIRF EK page ke heading me ho.
   Do page par chala gaya to FAIL.

Usage: python3 scripts/seo-fixes-test.py [BASE]
"""
import io
import json
import os
import re
import sys
import urllib.error
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:3100').rstrip('/')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                    '(KHTML, like Gecko) Chrome/129.0 Safari/537.36'}

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


def get(path):
    try:
        r = urllib.request.urlopen(urllib.request.Request(BASE + path, headers=UA), timeout=60)
        return r.status, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, ''
    except Exception:
        return 0, ''


def rd(rel):
    return io.open(os.path.join(ROOT, rel), encoding='utf-8').read()


print('=' * 72)
print(f'  SEO FIXES GATE  —  {BASE}')
print('=' * 72)
print()

# ══════════════════════════════════════════════════════════════════════════
print('── A. CLOUDFLARE EMAIL OBFUSCATION ──')

comp = rd('src/components/common/EmailOff.tsx')
chk('EmailOff component maujood', len(comp) > 500, f'{len(comp)} B')
chk('EmailOff me <!--email_off--> hai', 'email_off' in comp and '/email_off' in comp)
chk('EmailOff allow-list se saaf karta hai', 'A-Za-z0-9@._+-' in comp)

# 🔴 SOURCE GATE — email JSX ke TEXT CHILD ki tarah render na ho.
#
#    Pehli koshish me regex `\{CONTACT\.email\}` tha aur usne
#    `email={CONTACT.email}` (prop) ko bhi pakad liya — jhootha FAIL.
#    Test ko kamzor karne ke bajaye PRECISE kiya gaya hai:
#      • `=` ke baad aane wala {CONTACT.email} = PROP, wo theek hai
#      • baaki har jagah {CONTACT.email} = TEXT CHILD, wo leak hai
#    Aur saath me ek NAYI jaanch judi: EmailOff.tsx ke bahar koi
#    `mailto:` anchor nahi hona chahiye.
TEXT_CHILD = re.compile(r'(?<![=\w])\{\s*(?:CONTACT|contact)\.email\s*\}')
MAILTO_ANCHOR = re.compile(r'href\s*=\s*[{"\'`]+\s*(?:`?)mailto:')
leaks = []
mailtos = []
for dirpath, _dirs, files in os.walk(os.path.join(ROOT, 'src')):
    for fn in files:
        if not fn.endswith('.tsx'):
            continue
        fp = os.path.join(dirpath, fn)
        if fp.endswith('EmailOff.tsx'):
            continue
        txt = io.open(fp, encoding='utf-8').read()
        rel = os.path.relpath(fp, ROOT)
        for m in TEXT_CHILD.finditer(txt):
            leaks.append(f'{rel}:{txt[:m.start()].count(chr(10)) + 1}')
        for m in MAILTO_ANCHOR.finditer(txt):
            mailtos.append(f'{rel}:{txt[:m.start()].count(chr(10)) + 1}')
chk('🔴 .tsx me email TEXT CHILD ki tarah nahi', not leaks, str(leaks[:4]))
chk('🔴 EmailOff ke bahar koi mailto: anchor nahi', not mailtos, str(mailtos[:4]))

# detector khud sahi hai? (jaan-boojh kar do galat line par chalaya jaata hai)
chk('detector prop ko chhodta hai',
    not TEXT_CHILD.search('<EmailOff email={CONTACT.email} />'))
chk('detector text-child ko pakadta hai',
    bool(TEXT_CHILD.search('<p> \u00b7 {CONTACT.email}</p>')))

st, home = get('/')
chk('homepage 200', st == 200, f'HTTP {st}')
if home:
    chk('🔴 homepage me <!--email_off--> hai', '<!--email_off-->' in home)
    chk('🔴 homepage me <!--/email_off--> hai', '<!--/email_off-->' in home)
    chk('🔴 asli email HTML me dikh raha', 'support@rokadoctor.in' in home)
    chk('__cf_email__ local par nahi', '__cf_email__' not in home)
    chk('/cdn-cgi/l/email-protection local par nahi',
        '/cdn-cgi/l/email-protection' not in home)
    chk('email_off ke andar hi email hai',
        re.search(r'<!--email_off-->.{0,200}?support@rokadoctor\.in.{0,200}?<!--/email_off-->',
                  home, re.S) is not None)

# 🔴 RUNTIME GATE — rendered HTML me har email fence ke ANDAR hona chahiye.
#    Ye source grep se zyada sakht hai: agar kal koi naya component email
#    chhap de, source regex use miss kar sakta hai, ye nahi.
def email_outside_fence(html):
    """Fence ke bahar, aur <script> ke bahar — wahi ginti jo maayne rakhti hai.

    🔴 PEHLE YE GATE GALAT THA aur maine use SAACH se theek kiya, apne code
       se nahi. Pehla version har <script> ke andar wala email bhi ginta tha
       aur FAIL deta tha (Next.js ka RSC flight payload me email aata hai).

       LIVE PAR NAAPA (26 Oct 2026, https://rokadoctor.in/ ka asli HTML,
       jab Email Obfuscation ON tha):

           raw "support@rokadoctor.in"  →  1 baar
              aur wo 1 baar <script> ke ANDAR tha (flight payload)
           __cf_email__                 →  1 baar
              aur wo <address> ke andar, yaani dikhne wale HTML me

       Yaani Cloudflare ne <script> ke andar wale email ko haath hi nahi
       lagaya, sirf dikhne wale HTML ko badla. Isliye script ke andar ka
       email na 404 banata hai, na Google ko "[email protected]" dikhata hai.

       Jo cheez maayne rakhti hai wo ye: DIKHNE WALE HTML me har email
       <!--email_off--> fence ke andar ho.
    """
    stripped = re.sub(r'<!--email_off-->.*?<!--/email_off-->', '', html, flags=re.S)
    stripped = re.sub(r'<script\b[^>]*>.*?</script>', '', stripped, flags=re.S)
    return stripped.count('support@rokadoctor.in')

if home:
    chk('🔴 homepage: fence ke BAHAR koi email nahi',
        email_outside_fence(home) == 0, str(email_outside_fence(home)))

st, ct = get('/contact')
chk('/contact 200', st == 200, f'HTTP {st}')
if ct:
    chk('/contact par email_off (2 jagah: footer + body)',
        ct.count('<!--email_off-->') >= 2, f"{ct.count('<!--email_off-->')}")
    chk('/contact par mailto: anchor salamat', 'href="mailto:support@rokadoctor.in"' in ct)
    chk('🔴 /contact: fence ke BAHAR koi email nahi',
        email_outside_fence(ct) == 0, str(email_outside_fence(ct)))

# ══════════════════════════════════════════════════════════════════════════
print()
print('── B. HINGLISH LONG-TAIL (ek keyword, ek page) ──')

src = rd('src/lib/seo/hinglish-longtail.ts')
blocks = dict(re.findall(r"phrase:\s*'([^']+)',\s*\n\s*heading:\s*'([^']+)'", src))
alts = dict(re.findall(r"altPhrase:\s*'([^']+)',\s*\n\s*altHeading:\s*'([^']+)'", src))
blocks.update(alts)
chk('hinglish-longtail.ts me 9 phrase (8 block + 1 alt spelling)',
    len(blocks) == 9, str(len(blocks)))

for phrase, heading in blocks.items():
    chk(f'"{phrase}" heading ke andar hai',
        phrase.lower() in heading.lower(), heading[:60])

MOUNT = {
    'ro service wala near me': '/ro-service-in-patna',
    'ro mistri near me': '/ro-repair-patna',
    'ro service centre number patna': '/ro-customer-care-patna',
    'ro banane wala patna': '/service-patna/brand/other-brands',
    'aquaguard aura service patna': '/service-patna/brand/aquaguard',
    # 🔴 27 Oct — ye 3 live naap me nikle: kisi page ke title/H1/H2 me nahi the,
    #    sirf H3 me. Teeno money keyword hain.
    'water purifier service patna': '/service-patna',
    'ro service centre patna': '/contact',
    'ro service center patna': '/contact',   # alt spelling, usi block ka H3
    'ro technician patna': '/ro-services-patna',
}
chk('mount map me 9', len(MOUNT) == 9)

for phrase, path in MOUNT.items():
    st, h = get(path)
    if st != 200:
        chk(f'{path} 200', False, f'HTTP {st}')
        continue
    h2 = re.sub(r'<!--.*?-->', '', h, flags=re.S)
    heads = ' || '.join(
        re.sub(r'<[^>]+>', '', x) for x in re.findall(r'<h2[^>]*>(.*?)</h2>', h2, re.S)
    ).lower()
    if phrase != 'ro service center patna':
        chk(f'{path} → H2 me "{phrase}"', phrase in heads, '')
    # alt spelling ka apna data-attr nahi hota — wo usi block ka H3 hai
    if phrase != 'ro service center patna':
        chk(f'{path} par block render hua',
            f'data-hinglish-longtail="{phrase}"' in h2, '')
    else:
        h3 = ' || '.join(re.sub(r'<[^>]+>', '', x)
                         for x in re.findall(r'<h3[^>]*>(.*?)</h3>', h2, re.S)).lower()
        chk(f'{path} → H3 me "{phrase}"', phrase in h3, '')

# ══════════════════════════════════════════════════════════════════════════
# 🔴 CANNIBALIZATION — "ek keyword, ek page"
#
#    KYA GINNA HAI, YE 27 Oct ko LIVE+LOCAL dono par naap kar tay hua:
#
#    Pehla version H1–H3 + title, sab barabar ginta tha. Usme ye nikla:
#        water purifier service patna → 25 page
#    Lekin un 25 me se 24 BRAND PAGE ke H3 the, aur wahan wo
#    BRAND ke saath likha hai: "Kent water purifier service Patna",
#    "Pureit water purifier service Patna"... Wo alag query hai, aur wo
#    block (BrandKeywordBlock) jaan-boojh kar banaya gaya tha.
#    Unko hatane ka matlab maujooda content todna — wo nahi karenge.
#
#    Asli cannibalization title / H1 / H2 par hoti hai. Isliye gate ab:
#
#      PRIMARY phrase  → THEEK EK page ke title+H1+H2 me hona chahiye
#                        (ye PEHLE SE SAKHT hai: ab H2 me hona ZAROORI hai,
#                         sirf H3 me padda rehna ab PASS nahi hai)
#      ALT spelling    → owner page par H1–H3 me ho, aur kisi DOOSRE page
#                        ke title/H1/H2 me bilkul na ho
#      H3 mentions     → ginti report hoti hai, fail nahi karti
# ══════════════════════════════════════════════════════════════════════════
st, sm = get('/sitemap.xml')
locs = re.findall(r'<loc>(.*?)</loc>', sm)
# 🔴 bug class 19 — <loc> hamesha LIVE absolute URL hota hai
paths = [re.sub(r'^https?://[^/]+', '', u) or '/' for u in locs]
chk('sitemap se path mile', len(paths) > 100, str(len(paths)))

ALT = {'ro service center patna'}
LEV = {}
for path in paths:
    st, h = get(path)
    if st != 200 or not h:
        continue
    h2 = re.sub(r'<!--.*?-->', '', h, flags=re.S)
    h2 = re.sub(r'<script.*?</script>', ' ', h2, flags=re.S)
    tag = lambda t: ' || '.join(
        re.sub(r'<[^>]+>', '', x) for x in re.findall(rf'<{t}[^>]*>(.*?)</{t}>', h2, re.S)
    ).lower()
    ttl = re.search(r'<title[^>]*>(.*?)</title>', h2, re.S)
    LEV[path] = {
        'strong': ((ttl.group(1).lower() if ttl else '') + ' || ' + tag('h1')
                   + ' || ' + tag('h2')),
        'h3': tag('h3'),
    }
chk('cannibalization ke liye page padhe', len(LEV) > 100, str(len(LEV)))

for phrase, want in MOUNT.items():
    strong = [p for p, d in LEV.items() if phrase in d['strong']]
    h3only = [p for p, d in LEV.items() if phrase not in d['strong'] and phrase in d['h3']]
    if phrase in ALT:
        owner_has = (want in LEV and (phrase in LEV[want]['strong']
                                      or phrase in LEV[want]['h3']))
        chk(f'ALT "{phrase}" owner page {want} par hai', owner_has, '')
        chk(f'🔴 ALT "{phrase}" kisi aur ke title/H1/H2 me NAHI',
            not [p for p in strong if p != want], str(strong[:3]))
    else:
        chk(f'🔴 "{phrase}" THEEK 1 page ke title/H1/H2 me',
            len(strong) == 1, f'{len(strong)} page: {strong[:3]}')
        chk(f'   …aur wo page {want} hai', strong == [want], str(strong[:3]))
    if h3only:
        print(f'        (H3 support: {len(h3only)} page — ye fail nahi hai)')

print()
print('=' * 72)
print(f'  PASS: {P}    FAIL: {F}')
print('=' * 72)
for x in FAILS:
    print(f'   🔴 {x}')
sys.exit(0 if F == 0 else 1)
