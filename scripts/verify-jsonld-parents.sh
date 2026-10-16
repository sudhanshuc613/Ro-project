#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# verify-jsonld-parents.sh  —  BUG CLASS H ka PERMANENT test
#
# ── Kyu bana (16 Oct 2026) ──────────────────────────────────────────────────
# 15 Oct ko Google Search Console ne 83 area page par ye diya:
#
#     Review snippets — 2 items detected: Some are invalid
#     aggregateRating → Invalid object type for field "<parent_node>"
#
# Hamara purana schema test sirf itna dekhta tha ki "JSON-LD valid JSON hai
# ya nahi". Wo PASS ho raha tha — kyunki JSON bilkul valid tha. Galti
# SEMANTIC thi: `aggregateRating` `Service` node par laga tha, aur Google ka
# Review-Snippet rich result `Service` ko parent ke roop me support hi nahi
# karta (schema.org allow karta hai, Google nahi).
#
# 🔴 SEEKH: "JSON parse ho gaya" = test NAHI hai. Rendered JSON-LD ka POORA
#    TREE WALK karo aur har property ko uske asli parent type ke against
#    check karo.
#
# Ye script 143+ page crawl karke scripts/jsonld-parents.py chalati hai:
#   • aggregateRating / review ka parent Google-supported hai ya nahi
#   • AggregateRating ke required field + range
#   • Review me author + reviewRating
#   • BreadcrumbList / FAQPage / Product-offers / LocalBusiness ke fields
#   • ek hi @id par takraati hui name/image/url/telephone (entity ambiguity)
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-jsonld.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-jsonld.log; kill -9 $SRV 2>/dev/null; exit 1
fi

python3 scripts/jsonld-parents.py --base "$B"
RC=$?

kill -9 $SRV 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
exit $RC
