#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# CACHE TIMER GATE — 8 Nov 2026
#
# 🔴 KYUN: Vercel Fluid Active CPU 3h 51m / 4h = 96% par pahunch gaya tha.
#    Hobby plan limit par project PAUSE kar deta hai aur 30 din site band
#    rehti hai — ranking ke liye isse bada khatra koi nahi.
#
#    Live naap kar wajah mili: settings.ts ke 4 data-cache 300 second ke the.
#    Next.js me page utna hi taaza reh sakta hai jitna uska SABSE CHHOTA
#    data-cache, isliye har page ka apna `revalidate = 86400` bekaar tha aur
#    poori site har 5 minute me dobara ban rahi thi.
#
#    Measured (live, /ro-amc-patna jiska revalidate 86400 hai):
#        age 292s -> HIT          age 322s -> STALE
#
# Ye gate do cheez pakka karta hai:
#   1. Timer wapas 300 na ho jaye (kisi bhi din, kisi bhi merge me)
#   2. 🔴 Timer badhane ke BAAWAJOOD admin se badlav TURANT dikhe —
#      ye asli login + asli PUT + asli page read se jaancha jaata hai,
#      maana nahi jaata. Agar ye fail ho to timer badhana galat tha.
# ═══════════════════════════════════════════════════════════════════════════
set -u
cd /home/user/aquanexa
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/aqn}"
export DIRECT_URL="$DATABASE_URL"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-test-secret-for-local-verification-only-32chars}"
export NEXTAUTH_URL="http://127.0.0.1:3100"
export NODE_ENV=production
B=http://127.0.0.1:3100

pkill -9 -f "nex[t]-server" 2>/dev/null; sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-cache.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/s-cache.log; kill -9 $SRV 2>/dev/null
  echo "  PASS: 0    FAIL: 1"; exit 1
fi

OUT=$(node scripts/cache-timer-test.mjs 3100 2>&1); EC=$?
echo "$OUT"
kill -9 $SRV 2>/dev/null; wait $SRV 2>/dev/null
pkill -9 -f "nex[t]-server" 2>/dev/null

if ! echo "$OUT" | grep -qE "^  PASS: [0-9]+ +FAIL: [0-9]+"; then
  echo ""; echo "  FAIL  cache-timer-test.mjs chala hi nahi"
  echo "  PASS: 0    FAIL: 1"; exit 1
fi
exit $EC
