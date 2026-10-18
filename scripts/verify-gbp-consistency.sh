#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# verify-gbp-consistency.sh — rating/review count HAR JAGAH EK HO
#
# ── Kyu bana (18 Oct 2026) ──────────────────────────────────────────────────
# Owner: "mera ab google index pe rating 58 ho chuki hai usko bhi update kar
#         dena or admin se option de dena ki mai badal saku rating ko"
#
# Us badlav me ye number 20+ jagah se padha jaata tha — schema, hero, footer,
# review section, trust badges, FAQ, symptom page, author page, ads landing,
# admin tracker. Ek bhi jagah chhoot jaati to page par 58 aur schema me 50
# jaata — Google ka saaf niyam todta ("markup must match visible content"),
# jiska natija poore domain ke rich result band hona ho sakta hai.
#
# Pehli hi baar chalane par is detector ne 3 ASLI galtiyan pakdi:
#   1. ServiceHero.tsx me `4.9` HARDCODED tha (schema 5.0 bolta tha) — PURANI
#      galti, aaj tak kisi test ne nahi pakdi
#   2. ads-landing-data.ts WHY_POINTS me "50 review" hardcoded
#   3. blog-data.ts AUTHOR.credentials me "50 verified reviews" hardcoded
#
# 🔴 Isliye ye test ab permanent hai. "Maine sab jagah badal diya" ab naapa
#    jaata hai, maana nahi jaata.
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-gbp.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-gbp.log; kill -9 $SRV 2>/dev/null; exit 1
fi

python3 scripts/gbp-consistency.py "$B"
RC=$?

kill -9 $SRV 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
exit $RC
