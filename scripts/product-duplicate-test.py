#!/usr/bin/env python3
"""
PRODUCT DUPLICATE TEST — "A product with this SKU or slug already exists." ka gate.
════════════════════════════════════════════════════════════════════════════════

🔴 KYUN BANA (25 Oct 2026)
──────────────────────────
Owner product add nahi kar paa raha tha. Har baar yahi line aati thi:

    "A product with this SKU or slug already exists."

Us line me DO BADI KAMI thi:
  1. Ye nahi batati ki SKU galat hai ya SLUG.
  2. Ye nahi batati ki takrav KIS product se ho raha hai.

Aur asli jaal isse bhi gehra tha:

  🔴 Product DELETE karne par row DATABASE SE JAATI NAHI.
     `DELETE /api/products/[id]` sirf `deletedAt` set karta hai aur status
     ARCHIVED kar deta hai (soft delete). Admin ki product list
     `where: { deletedAt: null }` karti hai — isliye wo row KAHIN DIKHTI NAHI.
     Par `sku` aur `slug` par Postgres ka UNIQUE constraint us chhupi hui row
     par bhi lagta hai.

     Natija: ek baar delete kiya hua SKU/slug HAMESHA KE LIYE block ho jaata
     hai, aur owner ko kahin koi wajah dikhti hi nahi.

Ye script wahi poora chakra chala kar dekhti hai.

🔴 Unique constraint ko partial (sirf `deletedAt IS NULL`) karna DB migration
   maangta hai. Live data par wo risk nahi liya gaya. Fix sirf jaanch + saaf
   message hai; schema bilkul nahi chhua gaya.

Usage: python3 scripts/product-duplicate-test.py [BASE]
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
op.addheaders = [('User-Agent', 'AquaPerlDupTest/1.0')]


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
print(f'  PRODUCT DUPLICATE TEST  —  {BASE}')
print('=' * 72)
print()

# ── login ────────────────────────────────────────────────────────────────────
# 🔴 NextAuth provider id = 'password' (NOT 'credentials')
st, b = req('/api/auth/csrf')
tok = (json.loads(b).get('csrfToken') if st == 200 else None)
chk('csrf token mila', bool(tok))
st, b = req('/api/auth/callback/password',
            {'phone': PHONE, 'password': PASSWORD, 'csrfToken': tok,
             'json': 'true', 'callbackUrl': BASE + '/admin'}, form=True)
st2, b2 = req('/api/auth/session')
logged = st2 == 200 and '"user"' in b2
chk('admin login', logged, '' if logged else b2[:120])
if not logged:
    print('\n  PASS: %d    FAIL: %d' % (P, F + 1))
    sys.exit(1)

# ── category id chahiye (categoryId required hai) ────────────────────────────
# 🔴 URL GUESS MAT KARO. Maine pehle `/api/admin/categories` guess kiya tha —
#    wo route hai hi nahi (categories server component se props me jaati hain).
#    Ab wahi raasta liya jata hai jo asli admin leta hai: /admin/products/new
#    page ka Category <select> padho.
st, b = req('/admin/products/new')
chk('admin "Add Product" page khula', st == 200, f'HTTP {st}')
sel = re.search(r'<select[^>]*name="categoryId"[^>]*>(.*?)</select>', b, re.S)
if not sel:
    # name attr React me na ho to Category label ke paas wala select lo
    idx = b.find('Category')
    sel = re.search(r'<select[^>]*>(.*?)</select>', b[idx:idx + 4000], re.S) if idx > 0 else None
opts = re.findall(r'<option value="([^"]+)"[^>]*>([^<]*)</option>', sel.group(1)) if sel else []
opts = [(v, n) for v, n in opts if v and v.lower() not in ('', 'select')]
chk('category list mili', bool(opts), f'{len(opts)} category')
if not opts:
    print('\n  PASS: %d    FAIL: %d' % (P, F + 1))
    sys.exit(1)
CAT = opts[0][0]
print(f'        category use kar raha hoon: {opts[0][1]} ({CAT[:8]}…)')

STAMP = str(int(time.time()))
SKU = f'DUPTEST-{STAMP}'
SLUG = f'duptest-product-{STAMP}'


def payload(sku, slug, name):
    return {
        'name': name, 'sku': sku, 'slug': slug, 'type': 'SPARE_PART',
        'categoryId': CAT, 'brandId': '', 'status': 'DRAFT',
        'shortDescription': 'Duplicate test ke liye banaya gaya product.',
        'description': 'Ye product sirf automated test ke liye hai.',
        'mrp': 1000, 'sellingPrice': 900, 'costPrice': 500, 'taxRate': 18,
        'hsnCode': '', 'stockQuantity': 1, 'lowStockThreshold': 1,
        'allowBackorder': False, 'weightGrams': 100,
        'purificationTech': [], 'isPanIndia': True,
        'requiresInstallation': False, 'freeShipping': False,
        'isFeatured': False,
        # 🔴 schema: images.min(2) — "Add at least 2 product images".
        #    Ye test pehle khali [] bhej raha tha -> 422, aur saare duplicate
        #    check jhoothe FAIL de rahe the. Validation duplicate-check se
        #    PEHLE chalti hai, isliye payload poora valid hona zaroori hai.
        'images': [
            {'url': '/products/ro-domestic.png', 'altText': 'test image 1', 'isPrimary': True},
            {'url': '/products/ro-commercial.png', 'altText': 'test image 2', 'isPrimary': False},
        ],
        'seo': {'metaTitle': '', 'metaDescription': '', 'metaKeywords': ''},
    }


# ── 1. pehla product banna chahiye ───────────────────────────────────────────
print()
print('── 1. naya product ──')
st, b = req('/api/products', payload(SKU, SLUG, 'Duptest Product One'))
chk('naya product bana (201)', st == 201, f'HTTP {st} {b[:120]}')
pid = None
if st == 201:
    try:
        pid = json.loads(b)['product']['id']
    except Exception:
        pass
chk('product id mila', bool(pid))

# ── 2. wahi SKU dobara → saaf message ────────────────────────────────────────
print()
print('── 2. WAHI SKU dobara ──')
st, b = req('/api/products', payload(SKU, SLUG + '-alag', 'Duptest Product Two'))
msg = ''
conf = {}
try:
    j = json.loads(b)
    msg = j.get('message', '')
    conf = j.get('conflict') or {}
except Exception:
    pass
chk('409 mila', st == 409, f'HTTP {st}')
chk('message me "SKU" likha hai', 'SKU' in msg, msg[:110])
chk('message me asli value hai', SKU in msg)
chk('message me takrane wale product ka naam hai', 'Duptest Product One' in msg)
chk('conflict.field == sku', conf.get('field') == 'sku', str(conf.get('field')))
chk('conflict.deleted == False', conf.get('deleted') is False, str(conf.get('deleted')))
chk('🔴 purana generic message AB NAHI aata',
    'A product with this SKU or slug already exists.' != msg)

# ── 3. wahi SLUG dobara → saaf message ───────────────────────────────────────
print()
print('── 3. WAHI SLUG dobara ──')
st, b = req('/api/products', payload(SKU + '-ALAG', SLUG, 'Duptest Product Three'))
msg = ''
conf = {}
try:
    j = json.loads(b)
    msg = j.get('message', '')
    conf = j.get('conflict') or {}
except Exception:
    pass
chk('409 mila', st == 409, f'HTTP {st}')
chk('message me "URL Slug" likha hai', 'Slug' in msg, msg[:110])
chk('message me asli slug hai', SLUG in msg)
chk('conflict.field == slug', conf.get('field') == 'slug', str(conf.get('field')))

# ── 4. 🔴 ASLI JAAL — DELETE ke baad bhi SKU block rehta hai ─────────────────
print()
print('── 4. DELETE ke baad (soft delete ka jaal) ──')
st, b = req(f'/api/products/{pid}', method='DELETE')
chk('product delete hua', st in (200, 204), f'HTTP {st}')

st, b = req('/api/admin/products') if False else (0, '')
# admin list page se confirm karo ki delete hua product DIKHTA NAHI
st, b = req('/admin/products')
chk('delete hua product admin list me NAHI dikhta',
    'Duptest Product One' not in b, 'list me abhi bhi dikh raha hai')

st, b = req('/api/products', payload(SKU, SLUG + '-naya', 'Duptest Product Four'))
msg = ''
conf = {}
try:
    j = json.loads(b)
    msg = j.get('message', '')
    conf = j.get('conflict') or {}
except Exception:
    pass
chk('409 mila (SKU abhi bhi reserve hai)', st == 409, f'HTTP {st}')
chk('🔴 message me "DELETE" ka zikr hai', 'DELETE' in msg.upper(), msg[:130])
chk('conflict.deleted == True', conf.get('deleted') is True, str(conf.get('deleted')))
chk('message batata hai ki alag SKU daalo', 'alag' in msg.lower())

# ── 5. thoda alag SKU + slug → ban jana chahiye ──────────────────────────────
print()
print('── 5. thoda alag SKU/slug → banna chahiye ──')
st, b = req('/api/products', payload(SKU + '-2', SLUG + '-2', 'Duptest Product Five'))
chk('alag SKU/slug se product ban gaya (201)', st == 201, f'HTTP {st} {b[:120]}')
pid2 = None
if st == 201:
    try:
        pid2 = json.loads(b)['product']['id']
    except Exception:
        pass

# ── safai ────────────────────────────────────────────────────────────────────
for x in (pid2,):
    if x:
        req(f'/api/products/{x}', method='DELETE')

print()
print('=' * 72)
print(f'  PASS: {P}    FAIL: {F}')
print('=' * 72)
if F:
    for x in FAILS:
        print(f'   🔴 {x}')
sys.exit(0 if F == 0 else 1)
