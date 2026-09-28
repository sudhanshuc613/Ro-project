#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# verify-serp-hygiene.sh
#
# KYU BANA (22 Sep 2026)
# ──────────────────────
# Live site ke SAARE 143 URLs ka full sweep chalaya. Teen asli problem mile
# jo kisi bhi purane test me nahi pakde ja rahe the:
#
#   1. 🔴 DUPLICATE TITLE — do brand pages ka title BILKUL ek jaisa tha:
#        /service-patna/brand/commercial-ro  → "All Brands RO Service Patna…"
#        /service-patna/brand/other-brands   → "All Brands RO Service Patna…"
#      Wajah: `short.length > 22 ? 'All Brands' : short` — dono brand ka naam
#      22 se lamba tha, isliye dono 'All Brands' ban gaye. Ye cannibalization
#      hai — Google do same-title pages me se ek hi dikhata hai.
#
#   2. ⚠️ 5 TITLES 62 CHAR SE LAMBE — SERP me kat jaate hain.
#      Zyppy ka 2026 data: 61-70 char = Google 70% baar apna title likh deta
#      hai. 51-55 char sabse behtar (~40% rewrite).
#
#   3. ⚠️ 6 DESCRIPTIONS 160 SE LAMBI — snippet kat jaata hai.
#
# Ye script har deploy pe poore sitemap pe ye teeno check karti hai, taaki
# naya page banane par koi dobara ye galti na kare.
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-serp.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-serp.log; kill -9 $SRV 2>/dev/null; exit 1
fi

echo "════ SERP hygiene — poore sitemap pe ════"

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
        return p, None, None
    t = re.findall(r'<title>(.*?)</title>', h, re.S)
    t = html.unescape(re.sub(r'<[^>]+>', '', t[0])).strip() if t else ''
    d = re.findall(r'name="description" content="([^"]*)"', h)
    d = html.unescape(d[0]).strip() if d else ''
    return p, t, d

rows = []
with cf.ThreadPoolExecutor(12) as ex:
    rows = [r for r in ex.map(grab, paths)]

fetched = [r for r in rows if r[1] is not None]
print(f"  ....  {len(fetched)}/{len(paths)} pages fetched")

# ── 1) har page ka title ho ────────────────────────────────────────────────
miss = [p for p, t, d in fetched if not t]
if miss: bad(f"{len(miss)} pages bina title: {miss[:3]}")
else: ok(f"sab {len(fetched)} pages me title hai")

# ── 2) har page ka description ho ──────────────────────────────────────────
missd = [p for p, t, d in fetched if not d]
if missd: bad(f"{len(missd)} pages bina description: {missd[:3]}")
else: ok("sab pages me meta description hai")

# ── 3) 🔴 DUPLICATE TITLES — ye sabse zaroori check hai ────────────────────
seen = {}
for p, t, d in fetched:
    if t: seen.setdefault(t, []).append(p)
dups = {k: v for k, v in seen.items() if len(v) > 1}
if dups:
    bad(f"{len(dups)} duplicate title(s) — cannibalization")
    for k, v in list(dups.items())[:4]:
        print(f"        '{k[:50]}' → {v[:3]}")
else:
    ok(f"{len(seen)} unique titles, ZERO duplicate")

# ── 4) duplicate descriptions ──────────────────────────────────────────────
seend = {}
for p, t, d in fetched:
    if d: seend.setdefault(d, []).append(p)
dupd = {k: v for k, v in seend.items() if len(v) > 1}
if dupd:
    bad(f"{len(dupd)} duplicate description(s)")
    for k, v in list(dupd.items())[:3]:
        print(f"        '{k[:50]}' → {v[:3]}")
else:
    ok("ZERO duplicate descriptions")

# ── 5) title length — 62 tak theek, usse upar SERP me kat jaata hai ────────
longt = [(p, len(t), t) for p, t, d in fetched if len(t) > 62]
if longt:
    bad(f"{len(longt)} titles 62 char se lambe (SERP me katenge)")
    for p, n, t in sorted(longt, key=lambda x: -x[1])[:6]:
        print(f"        {n}ch  {p}  →  {t[:52]}")
else:
    mx = max((len(t) for p, t, d in fetched if t), default=0)
    ok(f"sab titles <=62 char (sabse lamba {mx})")

# ── 6) title bahut chhota bhi na ho ────────────────────────────────────────
shortt = [(p, len(t)) for p, t, d in fetched if 0 < len(t) < 30]
if shortt: bad(f"{len(shortt)} titles 30 char se chhote: {shortt[:3]}")
else: ok("koi title 30 char se chhota nahi")

# ── 7) description length ──────────────────────────────────────────────────
longd = [(p, len(d)) for p, t, d in fetched if len(d) > 160]
if longd:
    bad(f"{len(longd)} descriptions 160 se lambi")
    for p, n in sorted(longd, key=lambda x: -x[1])[:6]:
        print(f"        {n}ch  {p}")
else:
    mx = max((len(d) for p, t, d in fetched if d), default=0)
    ok(f"sab descriptions <=160 (sabse lambi {mx})")

shortd = [(p, len(d)) for p, t, d in fetched if 0 < len(d) < 70]
if shortd: bad(f"{len(shortd)} descriptions 70 se chhoti: {shortd[:3]}")
else: ok("koi description 70 se chhoti nahi")

# ── 8) har title me brand ya Patna ho (relevance sanity) ───────────────────
weak = [p for p, t, d in fetched if t and 'patna' not in t.lower() and 'aqua perl' not in t.lower()]
if len(weak) > 12:
    bad(f"{len(weak)} titles me na 'Patna' na 'Aqua Perl': {weak[:4]}")
else:
    ok(f"titles me brand/geo signal theek ({len(weak)} exceptions, e-commerce pages)")

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
