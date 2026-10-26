#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# RATE SYNC GATE — 26 Oct 2026
#
# 🔴 KYUN: owner ne /admin/rates se rate badla aur /ro-filter-change-patna par
# wo badla hi nahi. Jaanch me mila — `/admin/rates` sirf PART_RATES badalta
# tha aur wo sirf ads-landing ke ServicePriceGrid me dikhte the. Service page
# ki price table (53 row, 7 page) POORI HARDCODED thi.
#
# Ab un row par `rateKey` hai jo PART_RATES ke `part` se match karta hai.
# Ye gate har baar jaanchta hai:
#   A. bina override ke daam BILKUL wahi (refactor ne kuch bigaada to nahi)
#   B. admin me badalne par HAR us page par badla
#   C. jis row ka rateKey nahi (Free/Quoted/AMC) wo NAHI badla
#   D. override hatane par daam wapas bilkul default
# ═══════════════════════════════════════════════════════════════════════════
set -u
cd /home/user/aquanexa
export DATABASE_URL="postgresql://postgres@localhost:5432/aqn"
export DIRECT_URL="$DATABASE_URL"
export NEXTAUTH_SECRET="test-secret-for-local-verification-only-32chars"
export NEXTAUTH_URL="http://127.0.0.1:3100"
export NODE_ENV=production
B=http://127.0.0.1:3100
pkill -9 -f "nex[t]-server" 2>/dev/null; sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/rs.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/rs.log; kill -9 $SRV 2>/dev/null
  echo "  PASS: 0    FAIL: 1"; exit 1; fi
OUT=$(python3 scripts/rate-sync-test.py "$B" 2>&1); EC=$?
echo "$OUT"
kill -9 $SRV 2>/dev/null; wait $SRV 2>/dev/null
if ! echo "$OUT" | grep -qE "^  PASS: [0-9]+ +FAIL: [0-9]+"; then
  echo ""; echo "  FAIL  rate-sync-test.py chala hi nahi"; echo "  PASS: 0    FAIL: 1"; exit 1; fi
exit $EC
