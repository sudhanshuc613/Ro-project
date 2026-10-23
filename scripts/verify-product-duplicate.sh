#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# PRODUCT DUPLICATE GATE — 25 Oct 2026
#
# 🔴 KYUN
# ───────
# Owner product add nahi kar paa raha tha. Bas yahi line aati thi:
#     "A product with this SKU or slug already exists."
# Usme na ye pata chalta tha ki SKU galat hai ya slug, na ye ki takrav kis
# product se hai.
#
# Aur asli jaal isse gehra tha:
#   DELETE soft hai -> `deletedAt` set hota hai, row DB me hi rehti hai.
#   Admin list `where: { deletedAt: null }` karti hai -> row DIKHTI NAHI.
#   Par sku/slug ka UNIQUE constraint us chhupi row par bhi lagta hai.
#   Natija: delete kiya hua SKU hamesha ke liye block, aur wajah kahin nahi
#   dikhti.
#
# Ab dono API (POST /api/products aur PATCH /api/products/[id]) banane se
# PEHLE jaanchti hain aur saaf batati hain: kaun sa field, kis product se,
# aur wo product delete ho chuka hai ya nahi.
#
# Ye gate asli login karke, asli product bana kar, asli delete karke wahi
# poora chakra dobara chalata hai.
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/pd.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/pd.log; kill -9 $SRV 2>/dev/null
  echo "  PASS: 0    FAIL: 1"; exit 1
fi

# 🔴 Script crash ho jaye to 0/0 chhap kar "pass" jaisa NAHI dikhna chahiye.
#    (19 Oct ko verify-browser ne yahi galti ki thi.)
OUT=$(python3 scripts/product-duplicate-test.py "$B" 2>&1)
EC=$?
echo "$OUT"
kill -9 $SRV 2>/dev/null; wait $SRV 2>/dev/null

if ! echo "$OUT" | grep -qE "^  PASS: [0-9]+ +FAIL: [0-9]+"; then
  echo ""
  echo "  FAIL  product-duplicate-test.py chala hi nahi (ya crash ho gaya)."
  echo "  PASS: 0    FAIL: 1"
  exit 1
fi
exit $EC
