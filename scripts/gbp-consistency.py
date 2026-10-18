#!/usr/bin/env python3
# ─────────────────────────────────────────────────────────────────────────────
# gbp-consistency.py — rating/review count HAR JAGAH EK HI HONA CHAHIYE
#
# ── Kyu bana (18 Oct 2026) ──────────────────────────────────────────────────
# Owner ne rating 50 → 58 karwayi aur admin se badalne ka option maanga.
# Us badlav me rating 20+ jagah se padhi jaati thi — schema, hero, footer,
# review section, trust badges, FAQ, symptom page, author page, admin tracker.
#
# 🔴 ASLI KHATRA: ek bhi jagah chhoot jaye to page par 58 dikhega aur schema
#    me 50 jaayega (ya ulta). Google ka saaf niyam hai —
#    "the review content you mark up must be readily available to users from
#     the marked-up page" — aur mel na khane par ye "spammy structured markup"
#    ban jaata hai, jis par poore domain ke rich result band ho sakte hain.
#
# Isliye ye detector rendered HTML se HAR rating aur HAR review-count nikaalta
# hai aur zidd karta hai ki sab ek hon. "Maine saare jagah badal diye" — ye
# claim ab naapi ja sakti hai, maanni nahi padti.
#
# Checks:
#   1. schema ka har `"ratingValue"` ek hi value
#   2. schema ka har `"reviewCount"` ek hi value
#   3. page par dikhne wale "X★" / "X Google reviews" wahi number
#   4. schema ka number == page par dikhne wala number
#   5. reviewCount > 0 aur ratingValue 1–5 ke beech
#
# Usage: python3 gbp-consistency.py <BASE>            (default 127.0.0.1:3100)
# ─────────────────────────────────────────────────────────────────────────────
import sys, re, json, html as H, urllib.request
import concurrent.futures as cf

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:3100').rstrip('/')
UA = {'User-Agent': 'Mozilla/5.0 (compatible; AquaPerlAudit/1.0)'}

P = 0
F = 0
fails = []


def ok():
    global P
    P += 1


def bad(m):
    global F
    F += 1
    fails.append(m)


def get(u, t=60):
    try:
        with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t) as r:
            return r.read().decode('utf-8', 'replace')
    except Exception as e:
        return f'<!-- FETCH FAIL {e} -->'


def text_of(h):
    """Visible text. 🔴 React `<!-- -->` hatana ZAROORI hai — warna
       "5.0 · 58 Google reviews" jaise jude hue text match nahi hote."""
    h = re.sub(r'<script[^>]*>.*?</script>', ' ', h, flags=re.S | re.I)
    h = re.sub(r'<style[^>]*>.*?</style>', ' ', h, flags=re.S | re.I)
    h = re.sub(r'<!--.*?-->', '', h, flags=re.S)
    return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', h)))


def schema_blocks(h):
    out = []
    for raw in re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
                          h, re.S | re.I):
        try:
            out.append(json.loads(raw.strip()))
        except Exception:
            pass
    return out


def walk(n):
    if isinstance(n, dict):
        yield n
        for v in n.values():
            yield from walk(v)
    elif isinstance(n, list):
        for v in n:
            yield from walk(v)


# ── sitemap se URL (guess nahi) ─────────────────────────────────────────────
sm = get(BASE + '/sitemap.xml')
paths = [re.sub(r'^https?://[^/]+', '', u) or '/' for u in re.findall(r'<loc>([^<]+)</loc>', sm)]
print(f'════ GBP rating/review consistency — {len(paths)} page ════')

def pull(p):
    return p, get(BASE + p)

with cf.ThreadPoolExecutor(8) as ex:
    pages = list(ex.map(pull, paths))

schema_ratings = {}   # value -> [paths]
schema_counts = {}
visible_ratings = {}
visible_counts = {}


def note(d, k, p):
    d.setdefault(k, []).append(p)


# "58 Google reviews", "58 reviews", "58 verified Google reviews"
RE_VIS_COUNT = re.compile(r'(\d{1,6})\s+(?:verified\s+)?(?:Google\s+)?reviews?\b', re.I)
# "⭐ 5.0", "5.0★", "★ 5.0", "5.0 out of 5", "Rating 5.0★"
RE_VIS_RATING = re.compile(r'(?:[★⭐]\s*(\d(?:\.\d)?)|(\d(?:\.\d)?)\s*[★⭐]|(\d(?:\.\d)?)\s+out of 5)')

for path, h in pages:
    if 'FETCH FAIL' in h[:60]:
        bad(f'{path}: fetch fail')
        continue

    # ── schema ──
    # 🔴 SIRF BUSINESS ka rating. Product ka apna rating hota hai (har product
    #    ka alag — 4.4, 4.6, 4.7…) aur usse business ke 5.0 se milana GALAT
    #    hoga. 18 Oct ko pehli baar chalane par detector ne yahi jhootha FAIL
    #    diya tha, isliye ye chhanni lagayi gayi.
    BUSINESS = {'LocalBusiness', 'HVACBusiness', 'Organization',
                'ProfessionalService', 'Store', 'HomeAndConstructionBusiness'}
    for blk in schema_blocks(h):
        for node in walk(blk):
            if not isinstance(node, dict):
                continue
            t = node.get('@type')
            tl = [t] if isinstance(t, str) else (t or [])
            if not (set(tl) & BUSINESS):
                continue
            ar = node.get('aggregateRating')
            if not isinstance(ar, dict):
                continue
            rv = str(ar.get('ratingValue', '')).strip()
            rc = str(ar.get('reviewCount', ar.get('ratingCount', ''))).strip()
            if rv:
                note(schema_ratings, rv, path)
                try:
                    f = float(rv)
                    if 1 <= f <= 5:
                        ok()
                    else:
                        bad(f'{path}: schema ratingValue {rv} — 1..5 ke bahar')
                except ValueError:
                    bad(f'{path}: schema ratingValue "{rv}" number nahi')
            if rc:
                note(schema_counts, rc, path)
                try:
                    if int(rc) > 0:
                        ok()
                    else:
                        bad(f'{path}: schema reviewCount {rc} — 0 review par rating invalid item')
                except ValueError:
                    bad(f'{path}: schema reviewCount "{rc}" number nahi')

    # ── page par dikhne wala ──
    t = text_of(h)
    # Product card ke apne rating/count page par bhi dikhte hain (PLP/PDP).
    # Unhe chhod do — wo alag entity hain.
    is_catalog = path.startswith(('/products', '/category'))
    for m in RE_VIS_COUNT.finditer(t):
        if is_catalog:
            continue
        note(visible_counts, m.group(1), path)
    for m in RE_VIS_RATING.finditer(t):
        if is_catalog:
            continue
        v = m.group(1) or m.group(2) or m.group(3)
        # Star-breakdown ("5 stars 96%, 4 stars 4%…") ek rating nahi hai —
        # wo distribution hai. Sirf ek-decimal wale (5.0, 4.8) hi rating hain.
        if v and '.' in v:
            note(visible_ratings, v, path)

print()
def report(label, d, allow_extra=()):
    vals = {k: v for k, v in d.items() if k not in allow_extra}
    if not vals:
        print(f'  {label:28s} — koi nahi mila')
        return None
    print(f'  {label:28s} {len(vals)} alag value')
    for k, v in sorted(vals.items(), key=lambda x: -len(x[1])):
        print(f'      {k:>8s}  →  {len(v):3d} page   e.g. {v[0]}')
    if len(vals) > 1:
        bad(f'{label}: {len(vals)} ALAG value — {sorted(vals)} (sab ek honi chahiye)')
    else:
        ok()
    return next(iter(vals))

sr = report('schema ratingValue', schema_ratings)
sc = report('schema reviewCount', schema_counts)
vr = report('page par rating', visible_ratings)
# "5 out of 5" wala star-breakdown (5,4,3,2,1 stars) alag cheez hai — wo rating nahi
vc = report('page par review count', visible_counts)

print()
# ── schema vs visible ──
if sr and vr:
    if sr == vr or float(sr) == float(vr):
        ok(); print(f'  ✅ rating MEL khaata hai   : schema {sr}  ==  page {vr}')
    else:
        bad(f'rating MEL NAHI: schema {sr} vs page {vr}')
        print(f'  🔴 rating MEL NAHI        : schema {sr}  vs  page {vr}')
if sc and vc:
    if sc == vc:
        ok(); print(f'  ✅ review count MEL khaata: schema {sc}  ==  page {vc}')
    else:
        bad(f'review count MEL NAHI: schema {sc} vs page {vc}')
        print(f'  🔴 review count MEL NAHI  : schema {sc}  vs  page {vc}')

if fails:
    print()
    for m in fails[:25]:
        print('  FAIL ', m)

print()
print('════════════════════════════════════')
print(f'  PASS: {P}    FAIL: {F}')
print('════════════════════════════════════')
sys.exit(1 if F else 0)
