#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# ANCHOR CANNIBALIZATION GATE — 27 Oct 2026
#
# 🔴 KYUN: live naap me mila ki anchor "RO Service Patna" 393 baar DO alag
# page par ja raha tha (243 → /service-patna, 150 → /ro-service-in-patna).
# Google kisi ek ko maalik nahi maan pata tha, dono ki rank girti thi.
# Isi wajah se 1 mahine purani site hum se upar thi.
#
# Ab: /ro-service-in-patna = "RO Service Patna" ka akela maalik
#     /service-patna       = "Water Purifier Repair Patna" (area hub)
#
# Ye gate har baar jaanchta hai ki koi bhi anchor (30+ baar wala) do alag
# page par na jaaye, aur breadcrumb schema me bhi wahi ulajhan na ho.
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/ac.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/ac.log; kill -9 $SRV 2>/dev/null
  echo "  PASS: 0    FAIL: 1"; exit 1
fi
OUT=$(python3 scripts/anchor-cannibal-test.py "$B" 2>&1); EC=$?
echo "$OUT"
kill -9 $SRV 2>/dev/null; wait $SRV 2>/dev/null
if ! echo "$OUT" | grep -qE "^  PASS: [0-9]+ +FAIL: [0-9]+"; then
  echo ""; echo "  FAIL  anchor-cannibal-test.py chala hi nahi"
  echo "  PASS: 0    FAIL: 1"; exit 1
fi
exit $EC
