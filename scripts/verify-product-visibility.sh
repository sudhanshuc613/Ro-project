#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# PRODUCT VISIBILITY GATE — 25 Oct 2026
#
# 🔴 KYUN: owner ne Spare Parts me membrane add kiya aur wo website par dikha
# hi nahi. Jaanch me 3 ASLI BUG mile:
#
#   1. DRAFT product ka page PUBLIC 200 deta tha (ARCHIVED hi block tha).
#      Adhoora product Google crawl kar sakta tha.
#   2. Product add/edit par sitemap 1 GHANTE tak purana rehta tha.
#      `revalidatePath('/sitemap.xml')` metadata route par kaam KARTA HI NAHI
#      (dono tarike naape). ISR 3600 -> 60 kiya.
#   3. DELETE ke baad product /products aur /category par dikhta rehta tha —
#      DELETE handler me `revalidateTag('products')` thi hi nahi.
#
# Ye gate poora rasta chalata hai: DRAFT -> har jagah check -> ACTIVE ->
# dobara check -> DELETE -> dobara check.
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/pv.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/pv.log; kill -9 $SRV 2>/dev/null
  echo "  PASS: 0    FAIL: 1"; exit 1
fi

OUT=$(python3 scripts/product-visibility-test.py "$B" 2>&1)
EC=$?
echo "$OUT"
kill -9 $SRV 2>/dev/null; wait $SRV 2>/dev/null

# 🔴 script crash ho jaye to 0/0 chhap kar "pass" jaisa NAHI dikhna chahiye
if ! echo "$OUT" | grep -qE "^  PASS: [0-9]+ +FAIL: [0-9]+"; then
  echo ""; echo "  FAIL  product-visibility-test.py chala hi nahi"
  echo "  PASS: 0    FAIL: 1"; exit 1
fi
exit $EC
