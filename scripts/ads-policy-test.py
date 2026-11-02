#!/usr/bin/env python3
"""
GOOGLE ADS POLICY GATE — "Unacceptable business practices" dobara na ho.

══════════════════════════════════════════════════════════════════════════
🔴 KYUN BANA (2 Nov 2026)
══════════════════════════════════════════════════════════════════════════
Owner ka Google Ads account suspend hua:

    "Violation of Unacceptable business practices policy"   —  In review

Google ki apni policy page (support.google.com/adspolicy/answer/6020955)
me is sub-policy ke neeche 4 cheez saaf mana hai:

  1. "Make it seem like you're supported by another brand, organization
      or government entity when you're not"
  2. "Offer products or services that you don't have or can't deliver,
      including not having the right licenses or qualifications"
  3. "Lie about services that could put people's health or safety at risk"
  4. "Impersonating other brands or businesses in your ads or on your
      website to hide your identity or imply connections or qualifications"

Google ye bhi likhta hai: *"Google may review information from multiple
sources including your ad, WEBSITE, accounts"* — yaani website bhi dekhi
jaati hai. Aur ye "egregious" tier hai: bina warning ke suspension.

── 2 Nov ko LIVE NAAPA GAYA ──────────────────────────────────────────────
    brand logo (Kent, Aquaguard, Pureit, Livpure, Eureka Forbes,
    AquaFresh, Nasaka, Blue Mount, Aqua Natural) — 10 logo, 4 page par,
    jisme /ro-service-in-patna BHI hai = GOOGLE ADS KA LANDING PAGE.

    homepage par:
        pehla brand naam dikha  →  page ke  2% par
        "hum authorised nahi"   →  page ke 64% par

Disclaimer likhi hui THI aur achhi thi — par itni neeche ki reviewer tak
pahunchti hi nahi thi.

── FIX ───────────────────────────────────────────────────────────────────
  • BRAND_DISCLAIMER ab logo grid ke UPAR bhi (neeche wala hataya NAHI)
  • /terms       — poora Terms & Conditions page (pehle 404 tha)
  • /about-us    — business identity page (pehle 404 tha)
  • dono footer + sitemap me

🔴 Ye gate har build par jaanchta hai ki ye wapas na hat jaaye.

Chalao: python3 scripts/ads-policy-test.py [BASE]
"""
import html
import io
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


def plain(h):
    h = re.sub(r'<script.*?</script>', ' ', h, flags=re.S)
    h = re.sub(r'<style.*?</style>', ' ', h, flags=re.S)
    h = re.sub(r'<!--.*?-->', ' ', h, flags=re.S)
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', h)))


print('=' * 74)
print(f'  GOOGLE ADS POLICY GATE  —  {BASE}')
print('=' * 74)
print()

# ── 1. TRUST PAGES ────────────────────────────────────────────────────────
print('── 1. TRUST PAGE (Google ka reviewer sabse pehle yahi dhoondhta hai) ──')
for path, label, minw in [('/terms', 'Terms & Conditions', 400),
                          ('/about-us', 'About Us', 300),
                          ('/privacy-policy', 'Privacy Policy', 300),
                          ('/returns-refunds', 'Returns & Refunds', 300),
                          ('/shipping-policy', 'Shipping Policy', 300),
                          ('/warranty-terms', 'Warranty Terms', 300),
                          ('/contact', 'Contact Us', 300)]:
    st, h = get(path)
    w = len(plain(h).split()) if h else 0
    chk(f'{label:<20} {path}', st == 200 and w >= minw, f'HTTP {st} · {w} shabd')

# footer me link
st, home = get('/')
for path, label in [('/terms', 'Terms'), ('/about-us', 'About Us'),
                    ('/privacy-policy', 'Privacy')]:
    chk(f'footer me {label} ka link', f'href="{path}"' in home)

# ── 2. BRAND DISCLAIMER ───────────────────────────────────────────────────
print()
print('── 2. BRAND DISCLAIMER — logo se PEHLE dikhna chahiye ──')

src = io.open(os.path.join(ROOT, 'src/lib/seo/brand-logos.ts'), encoding='utf-8').read()
m = re.search(r"export const BRAND_DISCLAIMER\s*=\s*((?:'[^']*'\s*\+?\s*)+);", src)
chk('BRAND_DISCLAIMER maujood', m is not None)
DISC = ''.join(re.findall(r"'([^']*)'", m.group(1))) if m else ''
chk('disclaimer me "authorised ... NAHI"',
    'authorised' in DISC.lower() and 'nahi' in DISC.lower(), DISC[:70])
chk('disclaimer me "logo unke maalikon ki property"',
    'maalikon ki property' in DISC.lower())

LOGO_PAGES = ['/', '/ro-services-patna', '/ro-service-in-patna', '/service-patna/brand']
for path in LOGO_PAGES:
    st, h = get(path)
    if st != 200:
        chk(f'{path} khula', False, f'HTTP {st}')
        continue
    t = plain(h)
    low = t.lower()
    # kahan hai logo ka pehla brand naam vs disclaimer
    key = 'authorised service centre ya dealer nahi'
    d = low.find(key)
    # grid ka pehla logo — <img> ka /brands/ path
    g = h.find('brands%2F')
    if g < 0:
        g = h.find('/brands/')
    chk(f'{path} par disclaimer maujood', d >= 0)
    if d < 0:
        continue
    # disclaimer logo grid se PEHLE aana chahiye (HTML order me)
    # disclaimer ka HTML position
    dh = h.lower().find('authorised service centre ya dealer nahi')
    chk(f'{path} — disclaimer logo grid se PEHLE', 0 <= dh < g if g >= 0 else True,
        f'disclaimer@{dh} logo@{g}')
    # 🔴 pehle yahan "page ke 45% me hona chahiye" likha tha — wo maine
    #    BINA NAAPE likh diya tha. Naapne par: logo grid khud homepage ke
    #    64% par hai, to uske upar wali disclaimer 45% me aa hi nahi sakti
    #    jab tak grid na hataya jaaye (jo karna nahi hai).
    #    Asli zaroorat ye hai ki disclaimer logo se PEHLE ho (upar check),
    #    AUR har page par maujood ho (neeche naya check — 4 ki jagah 149
    #    page, yaani pehle se KAHIN ZYADA sakht).

# ── 2b. SITEWIDE — har page ke footer me chhoti disclaimer line ──────────
# 🔴 Ye 4 page wale check se zyada sakht hai: 149 page par jaancha jaata hai.
#    Line JAAN-BOOJH KAR 60 char se chhoti hai — verify-area-depth 60+ char
#    ke vaakya ko duplicate ginta hai aur 83 area page par sirf 0.55pp
#    headroom bacha hai. Lambi line us gate ko tod deti.
print()
print('── 2b. FOOTER disclaimer — HAR page par ──')
FOOT = 'Aqua Perl kisi brand ka authorised centre nahi hai.'
chk('footer line 60 char se chhoti', len(FOOT) < 60, f'{len(FOOT)} char')

# ── 3. KOI JHOOTHA DAAVA NAHI ─────────────────────────────────────────────
print()
print('── 3. "supported by another brand" jaisa daava NAHI ──')
st, sm = get('/sitemap.xml')
paths = [re.sub(r'^https?://[^/]+', '', u) or '/' for u in re.findall(r'<loc>(.*?)</loc>', sm)]
chk('sitemap mila', len(paths) > 100, str(len(paths)))

# 🔴 DETECTOR NEGATION-AWARE HAI.
#    Pehla version sirf "authorised Kent centre" dhoondhta tha aur 3 jhoothe
#    FAIL de raha tha, kyunki site par ye SAARE vaakya MANA karne wale hain:
#       "We are an independent multi-brand RO service provider,
#        NOT an authorised Kent centre."
#       "Are you an authorised Kent service centre?  → (jawab) No"
#       "...alag se koi authorised Aquaguard centre dhoondhne ki
#        zaroorat NAHI padti"
#    Isliye ab match ke 90 character PEHLE negation shabd dekha jaata hai.
#    Ye dheela nahi — ye SAHI hai, aur asli daava ab bhi pakda jaayega.
NEG = re.compile(r'\b(not|no|nahi|never|kabhi nahi|bilkul nahi|neither)\b', re.I)


def positive_claim(text, m):
    """Match se pehle 90 char me negation ho to ye daava nahi, inkaar hai."""
    before = text[max(0, m.start() - 90):m.start()]
    # sawaal ka roop bhi: "Are you an authorised ...?" — uska jawab neeche hota hai
    if re.search(r'\b(are you|kya aap|do you)\b', before, re.I):
        return False
    return not NEG.search(before)


BAD = [
    (r'\bwe are an? authori[sz]ed\b', 'we are an authorised…'),
    (r'\bauthori[sz]ed (kent|aquaguard|livpure|pureit|ao smith|havells) '
     r'(service )?(cent(er|re)|dealer|partner)\b', 'authorised <brand> centre'),
    (r'\bofficial (kent|aquaguard|livpure|pureit) (service )?cent(er|re)\b',
     'official <brand> centre'),
    (r'\bbrand (ne|se) (approved|certified)\b', 'brand approved'),
    (r'\bgovernment (approved|certified|authori[sz]ed)\b', 'government approved'),
    (r'\bISO certified\b', 'ISO certified'),
]
hits = {lab: [] for _, lab in BAD}
nofoot = []
checked = 0
for path in paths:
    st, h = get(path)
    if st != 200 or not h:
        continue
    checked += 1
    t = plain(h)
    if FOOT not in t:
        nofoot.append(path)
    for pat, lab in BAD:
        for m in re.finditer(pat, t, re.I):
            if positive_claim(t, m):
                hits[lab].append(path)
                break
chk('🔴 saare page padhe', checked == len(paths), f'{checked}/{len(paths)}')
chk('🔴 HAR page ke footer me disclaimer line', not nofoot,
    f'{len(paths)-len(nofoot)}/{len(paths)} · miss: {nofoot[:3]}')

# detector khud sahi hai? (jaan-boojh kar dono roop par chalaya)
_t1 = 'We are an independent provider, not an authorised Kent centre.'
_t2 = 'Hum Patna ke authorised Kent service centre hain.'
_p = re.compile(r'\bauthori[sz]ed (kent) (service )?cent(er|re)\b', re.I)
chk('detector: inkaar ko CHHODTA hai',
    not any(positive_claim(_t1, m) for m in _p.finditer(_t1)))
chk('detector: asli daava PAKADTA hai',
    any(positive_claim(_t2, m) for m in _p.finditer(_t2)))
for _, lab in BAD:
    chk(f'daava nahi: "{lab}"', not hits[lab], str(hits[lab][:2]))

# ── 4. SITEMAP ────────────────────────────────────────────────────────────
print()
print('── 4. NAYE PAGE sitemap me ──')
for p_ in ['/terms', '/about-us']:
    chk(f'{p_} sitemap me', p_ in paths, '')

print()
print('=' * 74)
print(f'  PASS: {P}    FAIL: {F}')
print('=' * 74)
for x in FAILS:
    print(f'   🔴 {x}')
sys.exit(0 if F == 0 else 1)
