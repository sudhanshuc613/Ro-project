#!/usr/bin/env python3
"""
admin-deep.py — ADMIN PANEL ka ASLI audit.   (18 Oct 2026)

Purana admin-audit.py sirf itna dekhta tha ki page 200 deta hai aur API bina
login 401 deti hai. Wo ADHURA hai — wo ye nahi batata ki LOGIN KE BAAD panel
sach me kaam karta hai ya nahi.

Ye script:
  1. NextAuth se ASLI login karta hai (provider id = 'password', NOT 'credentials')
  2. Session cookie ke saath har admin page kholta hai
  3. Dekhta hai page login par REDIRECT to nahi ho gaya
  4. React error / "Application error" / empty shell pakadta hai
  5. Har admin API ko session ke saath hit karta hai (ab 200 aana chahiye)
  6. Bina session wahi API dobara (401/403/404/405 aana chahiye — 200 NAHI)
  7. Form fields, buttons, table headers ginta hai (page khaali to nahi)

Usage: python3 admin-deep.py [BASE]
"""
import sys, re, json, html as H, urllib.request, urllib.parse, http.cookiejar

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:3100').rstrip('/')
PHONE = '8969821440'
PASSWORD = 'ChangeMe@123'

P = 0
F = 0
fails = []


def ok(m):
    global P
    P += 1


def bad(m):
    global F
    F += 1
    fails.append(m)
    print(f'  FAIL  {m}')


cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
op.addheaders = [('User-Agent', 'AquaPerlAdminAudit/1.0')]


def get(path, timeout=60):
    try:
        with op.open(BASE + path, timeout=timeout) as r:
            return r.status, r.read().decode('utf-8', 'replace'), r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace'), BASE + path
    except Exception as e:
        return 0, f'ERR {e}', BASE + path


def post(path, data, timeout=60, form=True):
    body = urllib.parse.urlencode(data).encode() if form else json.dumps(data).encode()
    ct = 'application/x-www-form-urlencoded' if form else 'application/json'
    req = urllib.request.Request(BASE + path, data=body, headers={'Content-Type': ct})
    try:
        with op.open(req, timeout=timeout) as r:
            return r.status, r.read().decode('utf-8', 'replace'), r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace'), BASE + path
    except Exception as e:
        return 0, f'ERR {e}', BASE + path


def text(h):
    h = re.sub(r'<(script|style|noscript)[^>]*>.*?</\1>', ' ', h, flags=re.S | re.I)
    h = re.sub(r'<!--.*?-->', '', h, flags=re.S)
    return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', h))).strip()


# 🔴 ROUTE GUESS MAT KARO — filesystem se nikalo.
# 18 Oct: maine /admin/coupons, /admin/reviews, /admin/analytics guess kiye the.
# Wo kabhi bane hi nahi the → 3 jhoothe FAIL. Aur 3 ASLI page (rates, security,
# site-images) chhoot gaye the. Ab dono galtiyan namumkin hain.
import os

def routes_from_fs(root, leaf):
    out = []
    for dp, _dn, fn in os.walk(root):
        if leaf not in fn:
            continue
        rel = dp.replace(root, '', 1)
        rel = re.sub(r'/\((?:[^/)]+)\)', '', rel)   # (dashboard) jaise group hatao
        if '[' in rel:                               # dynamic route chhodo
            continue
        out.append(rel or '/')
    return sorted(set(out))

# script ke apne location se nikalo — hardcoded path nahi
SRC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'app')
ADMIN_PAGES = [r for r in routes_from_fs(SRC + '/admin', 'page.tsx') ]
ADMIN_PAGES = ['/admin' + (r if r != '/' else '') for r in ADMIN_PAGES]
ADMIN_PAGES = [p for p in ADMIN_PAGES if p != '/admin/login']

ADMIN_APIS = routes_from_fs(SRC + '/api/admin', 'route.ts')
ADMIN_APIS = ['/api/admin' + (r if r != '/' else '') for r in ADMIN_APIS]

print(f'  routes filesystem se: {len(ADMIN_PAGES)} page, {len(ADMIN_APIS)} API')

print('=' * 70)
print(f'  ADMIN DEEP AUDIT  —  {BASE}')
print('=' * 70)

# ── 1. BINA LOGIN — sab band hona chahiye ──────────────────────────────────
print('\n── 1) BINA LOGIN: admin page login par bhejta hai? ──')
guard_fail = 0
for p in ADMIN_PAGES:
    c, h, final = get(p)
    went_login = '/login' in final or 'signin' in final.lower()
    has_form = bool(re.search(r'type="password"', h))
    if went_login or has_form or c in (401, 403, 307, 302):
        ok(p)
    else:
        # page khula aur usme admin data hai?
        t = text(h)
        if len(t) > 400 and 'login' not in t.lower()[:200]:
            bad(f'bina login {p} KHUL GAYA ({c}, {len(t)} chars)')
            guard_fail += 1
        else:
            ok(p)
print(f'  → {len(ADMIN_PAGES) - guard_fail}/{len(ADMIN_PAGES)} page guarded')

print('\n── 2) BINA LOGIN: admin API 200 to nahi deti? ──')
for a in ADMIN_APIS:
    c, h, _ = get(a)
    if c == 200:
        bad(f'bina login {a} → 200 (DATA LEAK)')
    else:
        ok(f'{a} {c}')
        print(f'  OK   {a:36s} {c}')

# ── 3. ASLI LOGIN ──────────────────────────────────────────────────────────
print('\n── 3) ASLI LOGIN (NextAuth provider id = "password") ──')
c, h, _ = get('/api/auth/csrf')
try:
    csrf = json.loads(h)['csrfToken']
    ok('csrf token mila')
    print(f'  OK   csrf token mila ({csrf[:16]}…)')
except Exception:
    bad(f'csrf token nahi mila: {h[:120]}')
    csrf = ''

c, h, final = post('/api/auth/callback/password', {
    'csrfToken': csrf, 'phone': PHONE, 'password': PASSWORD,
    'redirect': 'false', 'json': 'true', 'callbackUrl': BASE + '/admin',
})
print(f'  login POST → {c}')

c, h, _ = get('/api/auth/session')
try:
    sess = json.loads(h)
except Exception:
    sess = {}
if sess.get('user'):
    role = sess['user'].get('role', '?')
    ok('login hua')
    print(f'  OK   LOGIN SAFAL — user role={role} phone={sess["user"].get("phone","?")}')
else:
    bad(f'LOGIN FAIL — session khaali: {h[:200]}')

logged_in = bool(sess.get('user'))

# ── 4. LOGIN KE BAAD — har page sach me render hota hai? ──────────────────
if logged_in:
    print('\n── 4) LOGIN KE BAAD: har admin page ──')
    for p in ADMIN_PAGES:
        c, h, final = get(p)
        t = text(h)
        h1 = len(re.findall(r'<h1', h, re.I))
        err = len(re.findall(r'Application error|Unhandled Runtime|Internal Server Error|a client-side exception', h, re.I))
        inputs = len(re.findall(r'<input|<select|<textarea', h, re.I))
        btns = len(re.findall(r'<button', h, re.I))
        words = len(t.split())
        if c != 200:
            bad(f'{p} → HTTP {c}')
        elif '/login' in final:
            bad(f'{p} → login par redirect (session kaam nahi kiya)')
        elif err:
            bad(f'{p} → React error page')
        elif words < 30:
            bad(f'{p} → khaali page ({words} words)')
        else:
            ok(p)
            print(f'  OK   {p:28s} h1={h1} words={words:5d} input={inputs:3d} btn={btns:3d}')

    print('\n── 5) LOGIN KE BAAD: admin API data deti hai? ──')
    for a in ADMIN_APIS:
        c, h, _ = get(a)
        kind = ''
        if c == 200:
            try:
                j = json.loads(h)
                kind = f'json keys={list(j)[:4]}' if isinstance(j, dict) else f'json list n={len(j)}'
            except Exception:
                kind = f'{len(h)} bytes'
            ok(a)
        elif c in (404, 405):
            kind = '(is method par nahi — GET support nahi)'
            ok(a)
        else:
            bad(f'login ke baad {a} → {c}')
        print(f'  {"OK  " if c in (200,404,405) else "FAIL"} {a:36s} {c}  {kind}')

print()
print('=' * 70)
print(f'  PASS: {P}    FAIL: {F}')
print('=' * 70)
sys.exit(1 if F else 0)
