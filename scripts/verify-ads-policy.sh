#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# GOOGLE ADS POLICY GATE — 2 Nov 2026
#
# 🔴 KYUN: owner ka Google Ads account suspend hua —
#    "Violation of Unacceptable business practices policy"
#
# Google ki policy ke 4 niyam me se do seedha hum par lagte the:
#   #1 "Make it seem like you're supported by another brand when you're not"
#   #4 "Impersonating other brands... to imply connections or qualifications"
#
# Live naapa: 10 brand logo 4 page par (jisme ADS LANDING page bhi), aur
# disclaimer page ke 64% neeche jabki brand naam 2% par.
#
# Fix: disclaimer logo ke UPAR bhi · /terms + /about-us page · footer+sitemap.
# Ye gate pakka karta hai ki ye wapas na hate.
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/ap.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/ap.log; kill -9 $SRV 2>/dev/null
  echo "  PASS: 0    FAIL: 1"; exit 1
fi
OUT=$(python3 scripts/ads-policy-test.py "$B" 2>&1); EC=$?
echo "$OUT"
kill -9 $SRV 2>/dev/null; wait $SRV 2>/dev/null
if ! echo "$OUT" | grep -qE "^  PASS: [0-9]+ +FAIL: [0-9]+"; then
  echo ""; echo "  FAIL  ads-policy-test.py chala hi nahi"
  echo "  PASS: 0    FAIL: 1"; exit 1
fi
exit $EC
