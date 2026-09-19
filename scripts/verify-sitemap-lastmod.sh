#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# verify-sitemap-lastmod.sh
#
# Kyu bana (19 Sep 2026): sitemap har URL pe build-time bhej raha tha
# (`lastModified: new Date()` + `revalidate = 3600`). 133 URLs me sirf 13 alag
# timestamps, aur wo har ghante badal jate the. Google aisa lastmod PURI SITE
# ke liye ignore kar deta hai — matlab hamara recrawl signal mara hua tha.
#
# Checks:
#   1. do fetch ke beech lastmod sthir hai (build-time stamp nahi)
#   2. W3C datetime format
#   3. koi future date nahi
#   4. dates me variety hai (sab ek hi stamp pe nahi)
#   5. pichhle 10 min wale "abhi-abhi badla" stamps nahi
#   6. sab URLs absolute + ek hi canonical host pe
#   7. sitemap ka har URL robots.txt se blocked nahi
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-sitemap.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-sitemap.log; kill -9 $SRV 2>/dev/null; exit 1
fi

echo "════ sitemap lastmod integrity ════"

SM1=/tmp/_sm_lastmod_1.xml
SM2=/tmp/_sm_lastmod_2.xml
curl -sS -m 30 "$B/sitemap.xml" -o "$SM1" 2>/dev/null
sleep 3
curl -sS -m 30 "$B/sitemap.xml" -o "$SM2" 2>/dev/null

if [ ! -s "$SM1" ] || [ ! -s "$SM2" ]; then
  echo "  FAIL  sitemap.xml fetch nahi hua"
  echo "  PASS: 0    FAIL: 1"
  kill -9 $SRV 2>/dev/null; pkill -9 -f "next-server" 2>/dev/null
  exit 1
fi

python3 - "$SM1" "$SM2" <<'PY'
import sys, re, datetime

a = open(sys.argv[1], encoding='utf-8', errors='ignore').read()
b = open(sys.argv[2], encoding='utf-8', errors='ignore').read()

locs = re.findall(r'<loc>([^<]*)</loc>', a)
lms  = [x.strip() for x in re.findall(r'<lastmod>([^<]*)</lastmod>', a)]
lms2 = [x.strip() for x in re.findall(r'<lastmod>([^<]*)</lastmod>', b)]

P = F = 0
def ok(m):
    global P; print(f"  PASS  {m}"); P += 1
def bad(m):
    global F; print(f"  FAIL  {m}"); F += 1

print(f"  ....  {len(locs)} URLs, {len(lms)} lastmod values")

# 1) sthirta
if lms == lms2:
    ok("lastmod do fetch ke beech sthir hai (build-time stamp nahi)")
else:
    diff = sum(1 for x, y in zip(lms, lms2) if x != y)
    bad(f"lastmod har fetch pe badal raha hai ({diff} values badle) — wahi purana bug")

# 2) W3C format
w3c = re.compile(r'^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$')
bad_fmt = [x for x in lms if not w3c.match(x)]
if bad_fmt:
    bad(f"{len(bad_fmt)} lastmod W3C format me nahi: {bad_fmt[:3]}")
else:
    ok("sab lastmod W3C datetime format me hain")

now = datetime.datetime.now(datetime.timezone.utc)

def parse(x):
    s = x.replace('Z', '+00:00')
    try:
        d = datetime.datetime.fromisoformat(s)
        return d if d.tzinfo else d.replace(tzinfo=datetime.timezone.utc)
    except Exception:
        return None

# 3) future date
fut = [x for x in lms if (p := parse(x)) and p > now + datetime.timedelta(days=1)]
if fut:
    bad(f"{len(fut)} lastmod future me hain: {fut[:3]}")
else:
    ok("koi lastmod future me nahi")

# 4) variety
uniq = len(set(x[:10] for x in lms))
if len(lms) >= 20 and uniq < 3:
    bad(f"sirf {uniq} alag date — sab ek hi build-time pe lag rahe hain")
else:
    ok(f"{uniq} alag lastmod dates (build-time stamping nahi)")

# 5) "abhi-abhi" stamps
#
# Sirf STATIC routes pe check karo. /products/* aur /category/* ka lastmod
# DB ke apne `updatedAt` se aata hai — wo bilkul sahi hai. Local test me
# seed abhi-abhi chalta hai, isliye un rows ka updatedAt "abhi" hota hai
# aur ye check jhootha FAIL deta tha (19 Sep 2026 ko pakda gaya).
# Asli bug sirf tab hai jab HARD-CODED static pages build-time stamp bhejein.
pairs = re.findall(r'<loc>([^<]*)</loc>\s*<lastmod>([^<]*)</lastmod>', a)
db_driven = ('/products/', '/category/', '/blog/')
static_pairs = [(u, t) for u, t in pairs if not any(s in u for s in db_driven)]
rec = len([t for _, t in static_pairs if (p := parse(t.strip())) and (now - p).total_seconds() < 600])
if rec > 0:
    bad(f"{rec} static URLs ka lastmod pichhle 10 min ka hai — build-time leak")
else:
    ok(f"build-time leak nahi ({len(static_pairs)} static URLs checked, 0 recent)")

# 6) host
off = [u for u in locs if not u.startswith('https://rokadoctor.in')]
if off:
    bad(f"{len(off)} URLs doosre host/scheme pe: {off[:2]}")
else:
    ok("sab URLs absolute aur ek hi canonical host pe")

# 7) sitemap me koi admin/account/checkout URL na ho (robots.txt inhe block karta hai)
blocked_pat = ('/admin', '/account', '/checkout', '/cart', '/api/')
leaked = [u for u in locs if any(p in u for p in blocked_pat)]
if leaked:
    bad(f"{len(leaked)} robots.txt-blocked URLs sitemap me hain: {leaked[:2]}")
else:
    ok("sitemap me koi robots-blocked URL nahi")

# 8) duplicate URLs
dupes = len(locs) - len(set(locs))
if dupes:
    bad(f"{dupes} duplicate URLs sitemap me")
else:
    ok("koi duplicate URL nahi")

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
