#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# verify-og-image.sh
#
# KYU BANA (30 Sep 2026)
# ──────────────────────
# Poore site ka page-by-page audit chalaya. 143 pages me se **136 pe
# `og:image` tha hi nahi.** Sirf homepage aur /service-patna pe tha.
#
# Matlab: jab koi customer WhatsApp pe link bhejta —
#     rokadoctor.in/ro-service-patna/kankarbagh
# — to sirf suna-sa text link dikhta tha, koi photo nahi. Patna me kaam
# WhatsApp se failta hai; photo wala link kai guna zyada khulta hai.
# Ye SEO se pehle seedha leads ka nuksan tha.
#
# Aur do pages (/amc-plans, /contact) ka `og:url` HOMEPAGE bata raha tha,
# kyunki unhone apna openGraph likha hi nahi tha aur Next.js root layout
# wala use kar raha tha.
#
# Wajah: Next.js App Router me child page ka `openGraph` parent ko REPLACE
# karta hai, merge nahi. Isliye har page ko khud `images` dena padta hai.
#
# Ye script har page pe check karti hai:
#   1. og:image maujood ho
#   2. og:image ka URL sach me 200 de (dead image nahi)
#   3. og:url us page ka ho, homepage ka nahi
#   4. og:title aur og:description ho
#   5. twitter:card ho
# ─────────────────────────────────────────────────────────────────────────────
set -u

cd /home/user/aquanexa
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/aqn}"
export DIRECT_URL="$DATABASE_URL"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-test-secret-for-local-verification-only-32chars}"
export NEXTAUTH_URL="http://127.0.0.1:3100"
export NODE_ENV=production
B=http://127.0.0.1:3100

pkill -9 -f "next-server" 2>/dev/null
sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-og.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-og.log; kill -9 $SRV 2>/dev/null; exit 1
fi

echo "════ Open Graph image coverage ════"

python3 - "$B" <<'PY'
import sys, re, html, urllib.request, concurrent.futures as cf

B = sys.argv[1]
P = F = 0
def ok(m):
    global P; print(f"  PASS  {m}"); P += 1
def bad(m):
    global F; print(f"  FAIL  {m}"); F += 1

try:
    sm = urllib.request.urlopen(B + '/sitemap.xml', timeout=30).read().decode('utf-8', 'ignore')
except Exception as e:
    print(f"  FAIL  sitemap fetch nahi hua: {e}")
    print("  PASS: 0    FAIL: 1"); sys.exit(1)

paths = [u.replace('https://rokadoctor.in', '') or '/' for u in re.findall(r'<loc>([^<]*)</loc>', sm)]

def grab(p):
    try:
        r = urllib.request.Request(B + p, headers={'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)'})
        h = urllib.request.urlopen(r, timeout=20).read().decode('utf-8', 'ignore')
    except Exception:
        return None
    def meta(prop):
        m = re.findall(rf'<meta property="{prop}" content="([^"]*)"', h)
        return html.unescape(m[0]) if m else ''
    return dict(p=p,
                img=meta('og:image'), url=meta('og:url'),
                title=meta('og:title'), desc=meta('og:description'),
                tw='twitter:card' in h)

rows = [r for r in cf.ThreadPoolExecutor(12).map(grab, paths) if r]
print(f"  ....  {len(rows)}/{len(paths)} pages fetched")

# 1) og:image har page pe
noimg = [r['p'] for r in rows if not r['img']]
if noimg:
    bad(f"{len(noimg)} pages pe og:image NAHI")
    for p in noimg[:8]: print(f"        {p}")
else:
    ok(f"sab {len(rows)} pages pe og:image hai")

# 2) og:url sahi page ka ho
wrong = [(r['p'], r['url']) for r in rows
         if r['url'] and r['p'] != '/' and not r['url'].rstrip('/').endswith(r['p'].rstrip('/'))]
if wrong:
    bad(f"{len(wrong)} pages ka og:url galat")
    for p, u in wrong[:6]: print(f"        {p}  →  {u}")
else:
    ok("sab pages ka og:url apne page ka hai")

# 3) og:title + og:description
not_ = [r['p'] for r in rows if not r['title']]
nod = [r['p'] for r in rows if not r['desc']]
if not_: bad(f"{len(not_)} pages pe og:title nahi: {not_[:3]}")
else: ok("sab pages pe og:title hai")
if nod: bad(f"{len(nod)} pages pe og:description nahi: {nod[:3]}")
else: ok("sab pages pe og:description hai")

# 4) twitter:card
notw = [r['p'] for r in rows if not r['tw']]
if notw: bad(f"{len(notw)} pages pe twitter:card nahi: {notw[:3]}")
else: ok("sab pages pe twitter:card hai")

# 5) og:image URL sach me 200 deta hai
imgs = sorted({r['img'] for r in rows if r['img']})
dead = []
for u in imgs:
    test = u.replace('https://rokadoctor.in', B)
    try:
        req = urllib.request.Request(test, headers={'User-Agent': 'Mozilla/5.0'})
        if urllib.request.urlopen(req, timeout=15).status != 200:
            dead.append(u)
    except Exception:
        dead.append(u)
if dead:
    bad(f"{len(dead)} og:image URL dead hain: {dead[:3]}")
else:
    ok(f"{len(imgs)} unique og:image, sab 200 dete hain")

print()
print("════════════════════════════════════")
print(f"  PASS: {P}    FAIL: {F}")
print("════════════════════════════════════")
sys.exit(F)
PY
RC=$?
kill -9 $SRV 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
exit $RC
