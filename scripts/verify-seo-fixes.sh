#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# SEO FIXES GATE — 26 Oct 2026
#
# Do cheezein jo is round me theek hui, dono ka permanent detector:
#
#   A. Cloudflare email obfuscation ka 404 — 149/149 page par tha.
#      Fix: <!--email_off--> (src/components/common/EmailOff.tsx)
#
#   B. 5 Hinglish keyword jo kisi heading me nahi the.
#      Fix: src/lib/seo/hinglish-longtail.ts — ek keyword, ek page.
#      🔴 Gate pakka karta hai ki koi phrase DOOSRE page par na chala jaaye
#         (site par pehle se "ro service near me" 86 page par hai).
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/sf.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/sf.log; kill -9 $SRV 2>/dev/null
  echo "  PASS: 0    FAIL: 1"; exit 1
fi

OUT=$(python3 scripts/seo-fixes-test.py "$B" 2>&1); EC=$?
echo "$OUT"
kill -9 $SRV 2>/dev/null; wait $SRV 2>/dev/null

if ! echo "$OUT" | grep -qE "^  PASS: [0-9]+ +FAIL: [0-9]+"; then
  echo ""; echo "  FAIL  seo-fixes-test.py chala hi nahi"
  echo "  PASS: 0    FAIL: 1"; exit 1
fi
exit $EC
