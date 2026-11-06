#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# GOOGLE TAG GATE — 6 Nov 2026
#
# 🔴 KYUN: owner ne naya Google tag (GTM-WZHCV54L) bheja aur kaha
#    "admin panel mai ek aisa option bhi de dena taki mai future mai khud
#     se tag ka code badal saku"
#
# Tag lagana aasaan hai. Galti ye hoti hai:
#   • Tag CLIENT par lagta hai aur hostname check karta hai. Server ke HTML
#     me script tag hota hi nahi — matlab curl se ye KABHI verify nahi ho
#     sakta. Bilkul wahi bug class jisne 18 Oct ko React #329 chhupa liya.
#     Jawab: Chromium ko --host-resolver-rules dekar rokadoctor.in ko
#     127.0.0.1 par resolve karana, taaki host check SACH ME chale.
#   • Admin se ID badalne par purani GA4 tracking chup-chaap mar sakti hai.
#     Jawab: har scenario me GA4 alag se naapa jaata hai.
#
# DO SCENARIO:
#   default  DB me analytics row hai hi nahi — deploy ke turant baad wali
#            haalat. GTM + GA4 dono constants.ts se chalne chahiye.
#   admin    Asli admin panel se ID badlo (login -> PUT -> revalidatePath)
#            aur naapo ki page par NAYI id gayi. Switch OFF, galat ID
#            reject, aur wapas ON — sab isi me.
#
# 🔴 6 Nov: pehle maine DB me seedha row daal kar test kiya tha. Us tarike
#    se GTM kabhi load hi nahi hua — kyunki 217 page BUILD ke waqt static
#    ban chuke hote hain aur tag ki ID wahin pak jaati hai. Yahi test ne
#    bataya ki (a) gtmId ka default constants.ts me hona chahiye, aur
#    (b) admin save par revalidatePath zaroori hai. Isliye ab test asli
#    admin API se guzarta hai, DB me chupke se nahi likhta.
# ═══════════════════════════════════════════════════════════════════════════
set -u
cd /home/user/aquanexa
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/aqn}"
export DIRECT_URL="$DATABASE_URL"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-test-secret-for-local-verification-only-32chars}"
export NEXTAUTH_URL="http://127.0.0.1:3100"
export NODE_ENV=production
B=http://127.0.0.1:3100

TP=0; TF=0
note() { TP=$((TP + ${1:-0})); TF=$((TF + ${2:-0})); }

# ── 0. Pure logic (server ki zaroorat nahi) ────────────────────────────────
OUT=$(npx tsx scripts/analytics-tag-unit.mts 2>&1)
echo "$OUT" | grep "  FAIL " || true
L=$(echo "$OUT" | grep -E "^  PASS: " | tail -1)
if [ -z "$L" ]; then
  echo "  FAIL  analytics-tag-unit.mts chala hi nahi"
  echo "$OUT" | tail -15
  note 0 1
else
  note "$(echo "$L" | sed -n 's/.*PASS: \([0-9]*\).*/\1/p')" \
       "$(echo "$L" | sed -n 's/.*FAIL: \([0-9]*\).*/\1/p')"
fi

# ── helper: analytics row DB se hatao ──────────────────────────────────────
clear_row() { python3 scripts/analytics-row.py clear; }

run_scenario() {
  SC=$1
  pkill -9 -f "nex[t]-server" 2>/dev/null; sleep 2
  # 🔴 -H 0.0.0.0 zaroori hai: browser `rokadoctor.in` naam se aata hai
  # (host-resolver-rules se), aur 127.0.0.1-only server us request ko
  # nahi uthata.
  ./node_modules/.bin/next start -H 0.0.0.0 -p 3100 > "/tmp/s-gtm-$SC.log" 2>&1 &
  SRV=$!
  for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
  if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
    echo "  FAIL  server start nahi hua ($SC)"; tail -15 "/tmp/s-gtm-$SC.log"
    kill -9 $SRV 2>/dev/null; note 0 1; return
  fi

  OUT=$(node scripts/analytics-tag-browser.mjs "$SC" 3100 2>&1)
  echo "$OUT" | grep -E "^── |  FAIL |^  PASS: " || true
  L=$(echo "$OUT" | grep -E "^  PASS: " | tail -1)
  if [ -z "$L" ]; then
    echo "  FAIL  analytics-tag-browser.mjs chala hi nahi ($SC)"
    echo "$OUT" | tail -20
    note 0 1
  else
    note "$(echo "$L" | sed -n 's/.*PASS: \([0-9]*\).*/\1/p')" \
         "$(echo "$L" | sed -n 's/.*FAIL: \([0-9]*\).*/\1/p')"
  fi

  # HTTP + source checks sirf 'default' par — baaki me ye same rehte hain
  if [ "$SC" = "default" ]; then
    OUT2=$(python3 scripts/analytics-tag-test.py "$B" 2>&1)
    echo "$OUT2" | grep -E "  FAIL |^  PASS: " || true
    L2=$(echo "$OUT2" | grep -E "^  PASS: " | tail -1)
    if [ -z "$L2" ]; then
      echo "  FAIL  analytics-tag-test.py chala hi nahi"
      echo "$OUT2" | tail -20
      note 0 1
    else
      note "$(echo "$L2" | sed -n 's/.*PASS: \([0-9]*\).*/\1/p')" \
           "$(echo "$L2" | sed -n 's/.*FAIL: \([0-9]*\).*/\1/p')"
    fi
  fi

  kill -9 $SRV 2>/dev/null; wait $SRV 2>/dev/null
  pkill -9 -f "nex[t]-server" 2>/dev/null; sleep 1
}

clear_row || { echo "  FAIL  db clear failed"; note 0 1; }
run_scenario default
run_scenario admin

# Test ke baad DB khaali chhodo — asli default wahi hai (constants.ts se),
# aur agla gate ganda data na uthaye.
clear_row >/dev/null 2>&1

echo
echo "════════════════════════════════════"
echo "  PASS: $TP    FAIL: $TF"
echo "════════════════════════════════════"
[ "$TF" -eq 0 ] || exit 1
