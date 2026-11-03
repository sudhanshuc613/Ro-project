#!/usr/bin/env python3
"""
BRAND NOTICE GATE  —  36th gate, 3 Nov 2026

🔴 Ye gate kyun bana (asli ghatna)

   2 Nov ko Google Ads appeal 6452978648 bheja gaya. 3 Nov ko REJECT ho gaya.
   Reject hone ke baad live site dobara naapi to teen cheezein nikli jo
   pehle chhoot gayi thi:

     1. 21 BRAND PAGE par poora disclaimer tha hi NAHI.
        /service-patna/brand/kent par "Kent" shabd 121 baar, title aur H1
        dono me "Kent RO Service in Patna" — aur upar koi inkaar nahi.
        Sirf footer ki 51-character wali line, page ke bilkul neeche.

     2. 83 AREA PAGE + /ro-customer-care-patna par brand naam 82-84 baar,
        wahan bhi poora disclaimer nahi.

     3. 🔴 JO THA WO POORA HINGLISH ME THA.
        "Aqua Perl ek swatantra RO service centre hai..." — Google ka policy
        reviewer aam taur par India me nahi hota. Jis ek aadmi ke liye wo
        line likhi gayi thi, usi ko samajh nahi aayi.

   Teeno galti ek hi kism ki hai: "disclaimer laga diya" maan liya gaya,
   naapa nahi gaya ki HAR page par hai ya nahi, aur PADHA JA SAKTA hai ya
   nahi. Isliye ab test hai.

── Ye gate kya jaanchta hai ───────────────────────────────────────────────

  A. Source me: dono component maujood, dono me English bhi hai, trademark
     attribution bhi, aur BRAND_DISCLAIMER ke purane Hinglish phrase bhi
     salamat (unhe ads-policy-test dhoondhta hai).
  B. 🔴 Compact wali har line 60 CHARACTER SE CHHOTI ho. Isse bada hua to
     verify-area-depth ka duplicate-sentence gate 83 page par toot jayega.
  C. Live: jis bhi page par brand naam THRESHOLD se zyada baar aaye, us par
     ya to poora notice ho ya compact notice ho.
  D. Live: footer wala chhota note HAR page par ho.
  E. Brand page par notice H1 ke BAAD aur asli content se PEHLE aaye —
     yaani scroll kiye bina dikhe.
  F. Detector khud sahi hai — do banawati case par sabit karta hai.

Chalao:  python3 scripts/brand-notice-test.py [BASE_URL]
"""
import html as H
import os
import re
import sys
import urllib.request

BASE = (sys.argv[1].rstrip('/') if len(sys.argv) > 1 else 'http://127.0.0.1:3100')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                    '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'}

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


def get(path):
    try:
        r = urllib.request.urlopen(urllib.request.Request(BASE + path, headers=UA), timeout=40)
        return r.status, r.read().decode('utf8', 'ignore')
    except Exception:
        return 0, ''


def text_of(h):
    """Dikhne wala text. React ke <!-- --> pehle hatao (gotcha #1)."""
    h = re.sub(r'<!--.*?-->', '', h, flags=re.S)
    h = re.sub(r'<script\b[^>]*>.*?</script>', '', h, flags=re.S)
    h = re.sub(r'<style\b[^>]*>.*?</style>', '', h, flags=re.S)
    return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', h)))


BRANDS = ['Kent', 'Aquaguard', 'Pureit', 'Livpure', 'AO Smith', 'Eureka Forbes',
          'Nasaka', 'Blue Star', 'Havells', 'Whirlpool', 'V-Guard', 'Tata Swach',
          'Panasonic', 'Zero B', 'AquaSure', 'Faber']

# Itne se zyada brand mention = page ka vishay hi brand hai -> disclaimer laazmi.
THRESHOLD = 25

print('=' * 74)
print('  BRAND NOTICE  —  jahan brand ka naam hai, wahan inkaar bhi hai?')
print('=' * 74)

# ── A. SOURCE ──────────────────────────────────────────────────────────────
print('\n── A. Component source ──')
bar_p = os.path.join(ROOT, 'src', 'components', 'service', 'BrandNoticeBar.tsx')
cmp_p = os.path.join(ROOT, 'src', 'components', 'service', 'BrandNoticeCompact.tsx')
chk('BrandNoticeBar.tsx maujood', os.path.exists(bar_p))
chk('BrandNoticeCompact.tsx maujood', os.path.exists(cmp_p))

bar = open(bar_p, encoding='utf-8').read() if os.path.exists(bar_p) else ''
cmp_ = open(cmp_p, encoding='utf-8').read() if os.path.exists(cmp_p) else ''

chk('🔴 BrandNoticeBar me ENGLISH inkaar', 'We are NOT an authorised' in bar)
chk('🔴 BrandNoticeBar me trademark attribution',
    'property of their respective owners' in bar)
chk('BrandNoticeBar me dealer/distributor/partner bhi',
    all(w in bar for w in ('dealer', 'distributor', 'partner')))
chk('BrandNoticeBar me Hinglish bhi', 'authorised service centre ya dealer NAHI' in bar)
# 🔴 Comment-aware hona ZAROORI hai (bug class 14). Pehla version seedha
# poori file me 'hidden' dhoondhta tha aur component ke APNE COMMENT me likhe
# "Koi hidden ... nahi" ko pakad leta tha — jhootha FAIL. Ab pehle comment
# hatao, phir asli code me dekho.
def code_only(src):
    src = re.sub(r'/\*.*?\*/', '', src, flags=re.S)
    return re.sub(r'//[^\n]*', '', src)


bar_code = code_only(bar)
chk('BrandNoticeBar chhupa hua nahi',
    'hidden' not in bar_code and 'display:none' not in bar_code.replace(' ', ''),
    'comment-aware')
chk('detector: comment ko CHHODTA hai',
    'hidden' not in code_only('/* yahan hidden likha hai */ const a = 1;'))
chk('detector: asli code ko PAKADTA hai',
    'hidden' in code_only('const a = "hidden";'))
chk('BrandNoticeCompact me ENGLISH inkaar', 'not an authorised centre' in cmp_)
chk('BrandNoticeCompact me Hinglish bhi', 'authorised centre nahi hain' in cmp_)

# ── B. 60-char niyam ───────────────────────────────────────────────────────
print('\n── B. Compact ki har line 60 char se chhoti (area-depth gate) ──')
lines = re.findall(r"^\s*'([^']+)',\s*$", cmp_, re.M)
chk('compact lines mili', len(lines) >= 5, f'{len(lines)} line')
longs = [(len(x), x) for x in lines if len(x) >= 60]
chk('🔴 har compact line 60 char se chhoti', not longs,
    f'sabse lambi {max([len(x) for x in lines], default=0)} · 60+: {longs[:2]}')

disc_p = os.path.join(ROOT, 'src', 'lib', 'seo', 'brand-logos.ts')
disc = open(disc_p, encoding='utf-8').read()
chk('🔴 BRAND_DISCLAIMER me ENGLISH pehle',
    disc.find('is an independent water purifier repair business') <
    disc.find('ek swatantra (independent) RO service centre'))
chk('🔴 BRAND_DISCLAIMER me purana phrase 1 salamat', 'maalikon ki property' in disc)
chk('🔴 BRAND_DISCLAIMER me purana phrase 2 salamat',
    'authorised service centre ya dealer NAHI' in disc)

# ── F. Detector khud ───────────────────────────────────────────────────────
print('\n── F. Detector khud sahi hai ──')
FAKE_OK = 'blah We are NOT an authorised Kent service centre blah'
FAKE_BAD = 'Kent Kent Kent ' * 20


def has_notice(t):
    return ('We are NOT an authorised' in t) or ('not an authorised centre for any brand' in t)


chk('detector: inkaar wale ko CHHODTA hai', has_notice(FAKE_OK))
chk('detector: bina inkaar wale ko PAKADTA hai', not has_notice(FAKE_BAD))
chk('detector: brand ginti sahi', sum(FAKE_BAD.count(b) for b in BRANDS) == 60,
    str(sum(FAKE_BAD.count(b) for b in BRANDS)))

# ── C/D/E. LIVE ────────────────────────────────────────────────────────────
print(f'\n── C. Live — har page jaancha ({BASE}) ──')
st, smx = get('/sitemap.xml')
paths = [re.sub(r'^https?://[^/]+', '', u) or '/'
         for u in re.findall(r'<loc>\s*([^<\s]+)\s*</loc>', smx)]
chk('sitemap mili', len(paths) > 100, f'{len(paths)} URL')

unread, missing_notice, missing_footer, heavy = [], [], [], 0
for p in paths:
    stp, h = get(p)
    if stp != 200 or not h:
        unread.append(p)
        continue
    t = text_of(h)
    n = sum(t.count(b) for b in BRANDS)
    if 'Independent repairer' not in t:
        missing_footer.append(p)
    if n >= THRESHOLD:
        heavy += 1
        if not has_notice(t):
            missing_notice.append(f'{p} ({n})')

chk('🔴 saare sitemap page padhe gaye', not unread,
    f'{len(paths) - len(unread)}/{len(paths)} · chhoote: {unread[:4]}')
chk(f'🔴 {THRESHOLD}+ brand-mention wale HAR page par notice', not missing_notice,
    f'{heavy} bhaari page · bina notice: {missing_notice[:5]}')

# ══════════════════════════════════════════════════════════════════════════
# 🔴 G. NOTICE KA TEXT AREA PAGE PAR DUPLICATE SENTENCE NA BANAYE
#
# Ye check 3 Nov 2026 ko isliye joda gaya kyunki maine wahi galti ki thi:
# compact notice ki saari LINES 60 char se chhoti thi, par HEADING ke aage
# period nahi tha. Flatten hone par heading pichhle button ke text se chipak
# gayi aur ek 118-character ka vaakya ban gaya, jo 83 area page par ek jaisa
# tha. verify-area-depth ka duplicate count 53 se 66 ho gaya (limit 55).
#
# Us gate ne pakad to liya, par FAIL wahan aaya aur wajah yahan thi. Ab wajah
# wali jagah par hi check hai, saaf message ke saath.
# ══════════════════════════════════════════════════════════════════════════
print('\n── G. Notice se area page par 60+ char duplicate na bane ──')
area_paths = [p for p in paths if p.startswith('/ro-service-patna/')][:12]
NOTICE_WORDS = ('brand-authorised centre', 'independent repair business',
                'authorised centre for any brand', 'belong to their owners',
                'authorised centre nahi hain')
seen = {}
long_dupes = []
for p in area_paths:
    stp, h = get(p)
    if stp != 200 or not h:
        continue
    hh = re.sub(r'<!--.*?-->', '', h, flags=re.S)
    for pat in (r'<script.*?</script>', r'<style.*?</style>', r'<header.*?</header>',
                r'<footer.*?</footer>', r'<nav.*?</nav>',
                r'<form[^>]*data-shared-ui[^>]*>.*?</form>'):
        hh = re.sub(pat, ' ', hh, flags=re.S)
    m = re.search(r'<main.*?</main>', hh, flags=re.S)
    flat = H.unescape(re.sub(r'<[^>]+>', ' ', m.group(0) if m else hh))
    for sent in re.split(r'(?<=[.!?])\s+', flat):
        sent = ' '.join(sent.split())
        if len(sent) < 60:
            continue
        if not any(w in sent for w in NOTICE_WORDS):
            continue
        if sent in seen and seen[sent] != p:
            long_dupes.append((len(sent), sent[:90]))
        seen[sent] = p
chk('area page padhe gaye', len(area_paths) >= 8, f'{len(area_paths)} page')
chk('🔴 notice ka koi 60+ char vaakya area page par duplicate nahi',
    not long_dupes,
    f'{len(long_dupes)} mile: {long_dupes[:2]}')

print('\n── D. Footer ka chhota note har page par ──')
chk('🔴 HAR page par footer note', not missing_footer,
    f'{len(paths) - len(missing_footer)}/{len(paths)} · miss: {missing_footer[:4]}')

print('\n── E. Brand page par notice H1 ke BAAD, content se PEHLE ──')
for b in ['kent', 'aquaguard', 'livpure', 'pureit', 'ao-smith']:
    stb, hb = get(f'/service-patna/brand/{b}')
    if stb != 200:
        chk(f'/service-patna/brand/{b} khula', False, f'HTTP {stb}')
        continue
    hb2 = re.sub(r'<!--.*?-->', '', hb, flags=re.S)
    h1 = re.search(r'<h1', hb2)
    note = re.search(r'data-brand-notice', hb2)
    body = re.search(r'<section class="py-14"', hb2)
    ok = bool(h1 and note and body and h1.start() < note.start() < body.start())
    chk(f'/service-patna/brand/{b} — notice sahi jagah', ok,
        f'H1@{h1.start() if h1 else "-"} notice@{note.start() if note else "NAHI"} '
        f'content@{body.start() if body else "-"}')
    chk(f'/service-patna/brand/{b} — brand ka naam le kar inkaar',
        bool(re.search(r'We are NOT an authorised \w', hb2)))

print()
print('=' * 74)
print(f'  PASS: {passed}    FAIL: {failed}')
print('=' * 74)
sys.exit(1 if failed else 0)
