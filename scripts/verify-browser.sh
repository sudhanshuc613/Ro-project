#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# verify-browser.sh — har page ASLI CHROMIUM me kholo, console error pakdo
#
# ── Kyu bana (18 Oct 2026) — MERI GALTI ──────────────────────────────────────
# Maine `TrustBadges` ko `async` server component bana diya. Uska ek caller
# `QuickBookForm.tsx` hai jo `'use client'` hai. Client component ke andar
# async server component render nahi ho sakta → browser me React error #329
# ("Objects are not valid as a React child (found: Promise)") → poora page
# "Application error: a client-side exception has occurred" dikhata hai.
#
# 🔴 SABSE ZAROORI BAAT: server ne phir bhi HTTP 200 aur poora sahi HTML
#    bheja. Isliye mere SAARE 3408 test PASS ho rahe the — curl, crawl,
#    deep-audit, jsonld-parents, gbp-consistency. Wo sab sirf SERVER ka HTML
#    padhte hain. Ye bug SIRF asli browser me, hydration ke waqt phatta hai.
#
#    Live par naapa (fix se pehle): 25 me se 5 template FAIL —
#      /  ·  /ro-services-patna  ·  /ro-service-in-patna
#      /ro-service-patna/kankarbagh (yani saare 83 area page)
#      /ro-problem/ro-leakage-problem (yani saare 5 symptom page)
#
# Isliye ab ye test suite ka hissa hai. "Page khulta hai" ab naapa jaata hai,
# maana nahi jaata.
#
# Pehli baar chalane par: npx playwright install chromium
# (aur system libs: libnspr4 libnss3 libatk1.0-0 libgbm1 libasound2t64 …)
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-browser.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-browser.log; kill -9 $SRV 2>/dev/null; exit 1
fi

OUT=$(node scripts/browser-check.mjs "$B" 2>&1)
RC=$?
echo "$OUT"
P=$(echo "$OUT" | sed -n 's/.*PASS: \([0-9]*\).*/\1/p' | tail -1)
F=$(echo "$OUT" | sed -n 's/.*FAIL: \([0-9]*\).*/\1/p' | tail -1)
echo
echo "════════════════════════════════════"
echo "  PASS: ${P:-0}    FAIL: ${F:-0}"
echo "════════════════════════════════════"

kill -9 $SRV 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
exit $RC
