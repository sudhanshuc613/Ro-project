#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# verify-admin-deep.sh  —  ADMIN PANEL ka LOGIN-KE-BAAD wala test
#
# ── Kyu bana (18 Oct 2026) ──────────────────────────────────────────────────
# `verify-admin-full.sh` aur purana admin-audit.py sirf ITNA dekhte the:
#     • admin page HTTP 200 deta hai
#     • admin API bina login 401 deti hai
#
# Ye ADHURA hai. Ye kabhi nahi batata ki LOGIN KE BAAD panel SACH ME chalta
# hai ya nahi — login toot jaye, koi page white screen de, ya API 500 de, to
# purane test phir bhi PASS dikhate.
#
# Ye script:
#   1. NextAuth se ASLI login (provider id = 'password', NOT 'credentials')
#   2. Session cookie ke saath har admin page kholta hai
#   3. Login par redirect / React error / khaali page pakadta hai
#   4. Har admin API session ke saath (ab data aana chahiye)
#   5. Wahi API bina session (200 NAHI aana chahiye)
#
# 🔴 ROUTE GUESS NAHI — src/app/admin aur src/app/api/admin se nikale jaate
#    hain. 18 Oct ko maine /admin/coupons /admin/reviews /admin/analytics
#    guess kiye the; wo kabhi bane hi nahi the (3 jhoothe FAIL) aur 3 ASLI
#    page (rates, security, site-images) chhoot gaye the.
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-admindeep.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-admindeep.log; kill -9 $SRV 2>/dev/null; exit 1
fi

python3 scripts/admin-deep.py "$B"
RC=$?

kill -9 $SRV 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
exit $RC
