#!/usr/bin/env bash
# LASTMOD HONESTY — 35th gate (3 Nov 2026)
#
# Apna server khud uthata hai, test chalata hai, phir band karta hai —
# baaki verify-*.sh ki tarah, taaki verify-all.sh me seedha chal sake.
#
# 🔴 Agar server start hi na ho to ye FAIL karega, PASS nahi.
#    (Bug class N: jo test chala hi nahi wo PASS nahi ginana.)
set -u
cd /home/user/aquanexa

PORT=3100
BASE="http://127.0.0.1:${PORT}"

export DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/aqn}"
export DIRECT_URL="${DIRECT_URL:-postgresql://postgres@localhost:5432/aqn}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-test-secret-for-local-verification-only-32chars}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-$BASE}"
export NEXT_TELEMETRY_DISABLED=1

pkill -9 -f "nex[t]-server" 2>/dev/null || true
sleep 1

if [ ! -d .next ]; then
  echo "  FAIL  .next nahi hai — pehle build karo"
  echo "  PASS: 0   FAIL: 1"
  exit 1
fi

./node_modules/.bin/next start -p "$PORT" -H 127.0.0.1 > /tmp/lastmod-srv.log 2>&1 &
SRV=$!

UP=0
for _ in $(seq 1 40); do
  if curl -s -o /dev/null --max-time 3 "$BASE/sitemap.xml"; then UP=1; break; fi
  sleep 1
done

if [ "$UP" != "1" ]; then
  echo "  FAIL  server start nahi hua — ye test CHALA HI NAHI."
  tail -5 /tmp/lastmod-srv.log 2>/dev/null
  kill -9 "$SRV" 2>/dev/null || true
  echo "  PASS: 0   FAIL: 1"
  exit 1
fi

python3 scripts/lastmod-honesty-test.py "$BASE"
RC=$?

kill -9 "$SRV" 2>/dev/null || true
pkill -9 -f "nex[t]-server" 2>/dev/null || true
exit $RC
