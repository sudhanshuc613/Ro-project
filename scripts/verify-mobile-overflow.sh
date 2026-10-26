#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# MOBILE OVERFLOW GATE — 26 Oct 2026
#
# 🔴 KYUN
# ───────
# Owner: "thoda mobile optimization acha rakha aur look ui wagreh website
#         wagreh. jo bade bade top competior rakhte hai."
#
# 26 Oct ko LIVE site asli Chrome me 149 page par 360px aur 390px dono par
# naapi gayi. Natija:
#
#     360px me docSW > 360   →  15 page
#        /                       728   (368px bahar — ReviewShowcase carousel)
#        /ro-service-in-patna    728
#        6 product page          415
#        8 intent page           378
#
# Ye "Content wider than screen" hai — Lighthouse aur Search Console dono
# isko mobile usability problem ginte hain, aur India me sabse aam phone
# chaudai 360px hi hai.
#
# Jad ek hi thi: CSS grid child ka `min-width: auto`. Fix: `[&>*]:min-w-0`.
#
# Ye gate asli browser chalata hai (server HTML se ye bug pakda hi nahi ja
# sakta — bug class 16). Agar browser na chale to LOUD FAIL, chup PASS nahi
# (bug class N).
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/mo.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/mo.log; kill -9 $SRV 2>/dev/null
  echo "  PASS: 0    FAIL: 1"; exit 1
fi

OUT=$(node scripts/mobile-overflow-test.mjs "$B" 2>&1); EC=$?
echo "$OUT"
kill -9 $SRV 2>/dev/null; wait $SRV 2>/dev/null

# 🔴 jo test chala hi nahi use PASS mat ginna
if ! echo "$OUT" | grep -qE "^  PASS: [0-9]+ +FAIL: [0-9]+"; then
  echo ""; echo "  FAIL  mobile-overflow-test.mjs chala hi nahi"
  echo "  PASS: 0    FAIL: 1"; exit 1
fi
exit $EC
