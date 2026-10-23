#!/usr/bin/env python3
"""
PRODUCT VISIBILITY TEST — "add kiya par website pe dikh nahi raha" ka gate.
════════════════════════════════════════════════════════════════════════════

🔴 KYUN (25 Oct 2026)
Owner ne Spare Parts me membrane add kiya aur wo website par dikha hi nahi.

Ye script poora rasta naapti hai — DRAFT banao, har public jagah check karo,
phir ACTIVE karo aur TURANT dobara check karo. Jahan na dikhe wahi asli bug.

Jo jagah check hoti hain:
  /products               (shop listing)
  /category/{slug}        (category listing)
  /products/{slug}        (product detail page)
  /sitemap.xml            (Google ke liye)
  /api/products           (public API)
  /api/search/suggest     (search box)
  /search?q=              (search page)

🔴 NIYAM: DRAFT kahin NAHI dikhna chahiye (product page 404 de).
   ACTIVE har jagah TURANT dikhna chahiye — 5 minute ka ISR intezaar NAHI.

Usage: python3 scripts/product-visibility-test.py [BASE]
"""
import http.cookiejar
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:3100').rstrip('/')
PHONE = '8969821440'
PASSWORD = 'ChangeMe@123'

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


cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
op.addheaders = [('User-Agent', 'AquaPerlVisTest/1.0')]


def req(path, data=None, method=None, form=False):
    body = None
    headers = {}
    if data is not None:
        if form:
            body = urllib.parse.urlencode(data).encode()
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
        else:
            body = json.dumps(data).encode()
            headers['Content-Type'] = 'application/json'
    r = urllib.request.Request(BASE + path, data=body, headers=headers, method=method)
    try:
        with op.open(r, timeout=60) as x:
            return x.status, x.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace')
    except Exception as e:
        return 0, f'ERR {e}'


print('=' * 72)
print(f'  PRODUCT VISIBILITY TEST  —  {BASE}')
print('=' * 72)
print()

st, b = req('/api/auth/csrf')
tok = json.loads(b).get('csrfToken') if st == 200 else None
req('/api/auth/callback/password',
    {'phone': PHONE, 'password': PASSWORD, 'csrfToken': tok,
     'json': 'true', 'callbackUrl': BASE + '/admin'}, form=True)
st, b = req('/api/auth/session')
chk('admin login', st == 200 and '"user"' in b)
if '"user"' not in b:
    print(f'\n  PASS: {P}    FAIL: {F + 1}')
    sys.exit(1)

# category list — 🔴 URL guess mat karo, admin page se padho
st, b = req('/admin/products/new')
sel = re.search(r'<select[^>]*name="categoryId"[^>]*>(.*?)</select>', b, re.S)
if not sel:
    i = b.find('Category')
    sel = re.search(r'<select[^>]*>(.*?)</select>', b[i:i + 4000], re.S) if i > 0 else None
opts = re.findall(r'<option value="([^"]+)"[^>]*>([^<]*)</option>', sel.group(1)) if sel else []
opts = [(v, n.strip()) for v, n in opts if v]
chk('category list mili', bool(opts), f'{len(opts)} category')
if not opts:
    print(f'\n  PASS: {P}    FAIL: {F + 1}')
    sys.exit(1)

# "Spare Parts" category dhoondo — wahi jisme owner ne daala tha
spare = next((o for o in opts if 'spare' in o[1].lower()), opts[0])
CAT_ID, CAT_NAME = spare
# category ka slug URL banane ke liye
CAT_SLUG = CAT_NAME.lower().replace(' ', '-')
print(f'        category: {CAT_NAME}  ->  /category/{CAT_SLUG}')

STAMP = str(int(time.time()))
SKU = f'VISTEST-{STAMP}'
SLUG = f'vistest-membrane-{STAMP}'
NAME = f'Vistest RO Membrane 80 GPD {STAMP}'


def payload(status):
    return {
        'name': NAME, 'sku': SKU, 'slug': SLUG, 'type': 'SPARE_PART',
        'categoryId': CAT_ID, 'brandId': '', 'status': status,
        'shortDescription': 'Visibility test ke liye banaya gaya product.',
        'description': 'Ye product sirf automated test ke liye hai.',
        'mrp': 1200, 'sellingPrice': 999, 'costPrice': 600, 'taxRate': 18,
        'hsnCode': '', 'stockQuantity': 10, 'lowStockThreshold': 2,
        'allowBackorder': False, 'weightGrams': 300,
        'purificationTech': [], 'isPanIndia': True,
        'requiresInstallation': False, 'freeShipping': False, 'isFeatured': False,
        # 🔴 schema images.min(2) — khali [] bhejo to 422 aata hai
        'images': [
            {'url': '/products/ro-domestic.png', 'altText': 'test 1', 'isPrimary': True},
            {'url': '/products/ro-commercial.png', 'altText': 'test 2', 'isPrimary': False},
        ],
        'seo': {'metaTitle': '', 'metaDescription': '', 'metaKeywords': ''},
    }


# 🔴 `suggestProducts()` Postgres ke `search_vector` column aur `pg_trgm`
#    extension par chalta hai. Ye `db/schema.sql` +
#    `prisma/migrations/00_search_extensions/` se aate hain — `prisma db push`
#    inhe NAHI banata. Isliye local test DB me wo column hota hi nahi, query
#    fail hoti hai aur route chup-chaap `{items:[]}` lauta deta hai.
#    LIVE par ye maujood hai (naapa: booster 1 · membrane 1 · purifier 3).
#    Agar column na ho to ye check SKIP karo — warna jhootha FAIL milta hai.
def search_works():
    _, b = req('/api/search/suggest?q=' + urllib.parse.quote('RO'))
    try:
        return len(json.loads(b).get('items', [])) > 0
    except Exception:
        return False


SEARCH_OK = search_works()
if not SEARCH_OK:
    print('  SKIP  /api/search/suggest — is DB me search_vector/pg_trgm nahi'
          ' (prisma db push se nahi banta). LIVE par ye chalta hai.')


def visible_where():
    """Har public jagah dekho ki product dikh raha hai ya nahi."""
    out = {}
    _, b = req('/products')
    out['/products'] = SLUG in b
    _, b = req(f'/category/{CAT_SLUG}')
    out[f'/category/{CAT_SLUG}'] = SLUG in b
    s, _ = req(f'/products/{SLUG}')
    out[f'/products/{SLUG}'] = s == 200
    _, b = req('/sitemap.xml')
    out['/sitemap.xml'] = SLUG in b
    _, b = req('/api/products?limit=100')
    out['/api/products'] = SLUG in b
    # 🔴 suggestProducts SIRF name/search_vector par chalta hai, SKU par NAHI.
    #    Pehle maine SKU se query kiya tha aur ek jhootha FAIL mila tha.
    #    Isliye ab product ke NAAM ka hissa bhejte hain.
    if SEARCH_OK:
        _, b = req('/api/search/suggest?q=' + urllib.parse.quote('Vistest RO Membrane'))
        out['/api/search/suggest'] = SLUG in b
    return out


# ── 1. DRAFT ────────────────────────────────────────────────────────────────
print()
print('── 1. DRAFT banao — kahin dikhna NAHI chahiye ──')
st, b = req('/api/products', payload('DRAFT'))
chk('DRAFT product bana (201)', st == 201, f'HTTP {st} {b[:140]}')
pid = json.loads(b)['product']['id'] if st == 201 else None
if not pid:
    print(f'\n  PASS: {P}    FAIL: {F + 1}')
    sys.exit(1)

time.sleep(2)
v = visible_where()
for k, shown in v.items():
    chk(f'DRAFT {k} par NAHI dikhta', not shown, 'DIKHA 🔴' if shown else '')

# ── 2. ACTIVE karo ──────────────────────────────────────────────────────────
print()
print('── 2. ACTIVE karo — har jagah TURANT dikhna chahiye ──')
st, b = req(f'/api/products/{pid}', payload('ACTIVE'), method='PATCH')
chk('ACTIVE me badla (200)', st == 200, f'HTTP {st} {b[:140]}')

time.sleep(3)
v = visible_where()
for k, shown in v.items():
    if k == '/sitemap.xml':
        # 🔴 sitemap metadata route hai — turant ki ummeed GALAT hai.
        #    Uska check neeche ISR poll me hota hai.
        continue
    chk(f'ACTIVE {k} par TURANT dikhta hai', shown, 'NAHI DIKHA 🔴' if not shown else '')

# 🔴 /sitemap.xml Next.js ka METADATA ROUTE hai. `revalidatePath('/sitemap.xml')`
#    aur `revalidatePath('/sitemap.xml','page')` — DONO naape, dono us par kaam
#    NAHI karte. Sitemap sirf apne ISR se refresh hota hai, jo ab 60 second hai
#    (pehle 3600 = 1 ghanta tha, isliye naya product ghanto gayab rehta tha).
#    Isliye yahan 90 second tak poll karte hain.
late = [k for k, s in v.items() if not s] or (['/sitemap.xml'] if not v.get('/sitemap.xml') else [])
if late:
    print()
    print('   /sitemap.xml ISR window (60s) ka intezaar — 90s tak poll:')
    t0 = time.time()
    still = set(late)
    while time.time() - t0 < 90 and still:
        time.sleep(10)
        v2 = visible_where()
        for k in list(still):
            if v2.get(k):
                P += 1
                print(f'      PASS  {k}  ->  +{int(time.time() - t0)}s par aa gaya')
                still.discard(k)
    for k in still:
        F += 1
        FAILS.append(f'{k} 90s me bhi nahi aaya')
        print(f'      FAIL  {k}  ->  90s me bhi NAHI 🔴')

# ── 3. safai ────────────────────────────────────────────────────────────────
req(f'/api/products/{pid}', method='DELETE')
time.sleep(3)
v3 = visible_where()
print()
print('── 3. DELETE ke baad hat gaya? ──')
for k, shown in v3.items():
    if k == '/sitemap.xml' and shown:
        # sitemap ISR se chalta hai — 90s tak mauka do
        t0 = time.time()
        while time.time() - t0 < 90:
            time.sleep(10)
            if not visible_where()['/sitemap.xml']:
                shown = False
                print(f'        (sitemap +{int(time.time() - t0)}s par saaf hua)')
                break
    chk(f'DELETE {k} se hat gaya', not shown, 'ABHI BHI DIKH RAHA 🔴' if shown else '')

print()
print('=' * 72)
print(f'  PASS: {P}    FAIL: {F}')
print('=' * 72)
if F:
    for x in FAILS:
        print(f'   🔴 {x}')
sys.exit(0 if F == 0 else 1)
