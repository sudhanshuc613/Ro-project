#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# NEAR-ME GATE — 22 Oct 2026
#
# 🔴 KYUN
# ───────
# Owner: "'ro service in patna' se top pe aata hoon, par 'ro service near me'
#         alag-alag jagah se karne par nahi aata."
#
# LIVE naap (22 Oct, 83 area page):
#     title me "near me"   0/83
#     meta desc me         0/83
#     H1 me                0/83
#     H2 me                0/83
#     H3 me               83/83   ← sirf sabse kamzor heading level
#
# Sterling Sky ka 8,186-business / 200-city test: "near me" ko title, header
# aur URL me rakhne se LOCAL ORGANIC uthta hai; MAP PACK bilkul nahi hilta
# ("didn't move the needle at all"). Isliye hum sirf organic wala hissa le
# rahe hain, aur Map Pack ke baare me jhooth nahi bol rahe.
#
# Ye gate pakadta hai:
#   1. har area page par "near me" wala H2 maujood hai
#   2. us H2 me US area ka naam hai (generic nahi)
#   3. block par data-shared-ui hai — warna verify-area-depth.sh ka
#      duplicate-sentence gate (≤55) 83 page par ek jaisa widget dekh kar toot
#      jayega
#   4. purana H3 wala near-me block ABHI BHI maujood hai (kuch hataya nahi)
#   5. geo lib me React nahi hai (client file se import safe rahe)
#   6. haversine ka hisaab sahi hai (jaani-maani doori se milaan)
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/nm.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/nm.log; kill -9 $SRV 2>/dev/null; exit 1
fi

pass=0; fail=0
chk(){ if [ "$2" = "$3" ]; then echo "  PASS  $1 ($2)"; pass=$((pass+1)); else echo "  FAIL  $1 — got '$2' want '$3'"; fail=$((fail+1)); fi; }
ge(){ if [ "$2" -ge "$3" ] 2>/dev/null; then echo "  PASS  $1 ($2 >= $3)"; pass=$((pass+1)); else echo "  FAIL  $1 — got '$2' want >= '$3'"; fail=$((fail+1)); fi; }

echo "── 1. geo lib saaf hai ──"
# 🔴 `$(grep -c X f || echo 0)` "0\n0" deta hai — grep 0 chhapta hai AUR
#    exit 1 karta hai, phir echo ek aur 0 chhapta hai. `|| true` sahi hai.
chk "nearest-area.ts me React import nahi" \
    "$(grep -cE "from 'react'" src/lib/geo/nearest-area.ts || true)" "0"
chk "nearest-area.ts me 'use client' nahi" \
    "$(grep -c "^'use client'" src/lib/geo/nearest-area.ts || true)" "0"
chk "NearMeResolver client component hai" \
    "$(head -1 src/components/service/NearMeResolver.tsx | grep -c "use client" || true)" "1"
chk "NearMeResolver async default export NAHI (Bug K)" \
    "$(grep -c 'export default async function' src/components/service/NearMeResolver.tsx || true)" "0"

echo ""
echo "── 2. geo lib self-test (ASLI TypeScript function) ──"
# 🔴 Pehle maine haversine ka Python me DOBARA likha version test kiya tha.
#    Wo galat hai — us code ko test kar rahe the jo ship nahi ho raha.
#    Ab wahi function chalta hai jo page par chalta hai.
ST=$(npx tsx scripts/near-me-selftest.mts 2>&1)
STP=$(printf '%s' "$ST" | sed -n 's/.*PASS: \([0-9]*\).*/\1/p' | tail -1)
STF=$(printf '%s' "$ST" | sed -n 's/.*FAIL: \([0-9]*\).*/\1/p' | tail -1)
chk "geo self-test me 0 FAIL" "${STF:-X}" "0"
ge "geo self-test ke checks" "${STP:-0}" "30"
if [ "${STF:-1}" != "0" ]; then printf '%s\n' "$ST" | grep '  FAIL' | head -6; fi

echo ""
echo "── 3. har area page par near-me H2 ──"
# 🔴 pehla regex `[\s\S]{0,400}?lat:` tha jo object ki seema paar kar ke
#    127 match de raha tha. Ab pincodes line ko anchor banaya -> theek 83.
SLUGS=$(python3 -c "
import re
s=open('src/lib/seo/patna-service-data.ts').read()
for m in re.finditer(r\"slug: '([^']+)',\s*\n\s*name: '([^']+)',\s*\n\s*pincodes:\", s):
    print(m.group(1)+'|'+m.group(2))")
# 🔴 `for row in $SLUGS` GALAT tha — shell space par split karta hai aur
#    area ke naam me space hai ("Boring Road"), isliye 83 ke bajaye 127
#    chakkar lag rahe the. `while IFS='|' read` line-by-line padhta hai.
TOT=0; H2OK=0; NAMEOK=0; SHARED=0; H3OK=0; RESOLVER=0
printf '%s\n' "$SLUGS" > /tmp/nm_slugs.txt
while IFS='|' read -r slug name; do
  [ -n "$slug" ] || continue
  TOT=$((TOT+1))
  # 🔴 HTML shell variable me mat rakho — 400 KB page par grep/curl
  #    "Argument list too long" se mar jaate hain. File me likho.
  curl -sS -m 25 "$B/ro-service-patna/$slug" -o /tmp/nm_page.html
  python3 - <<'PYEOF' > /tmp/nm_parts.txt
import re
h = open('/tmp/nm_page.html', encoding='utf-8', errors='replace').read()
h = re.sub(r'<!--.*?-->', '', h, flags=re.S)   # React ke <!-- --> hatao
st = lambda x: re.sub(r'<[^>]+>', '', x)
print('H2:' + ' || '.join(st(x) for x in re.findall(r'<h2[^>]*>(.*?)</h2>', h, re.S | re.I)))
print('H3:' + ' || '.join(st(x) for x in re.findall(r'<h3[^>]*>(.*?)</h3>', h, re.S | re.I)))
print('SHARED:' + str(h.count('data-shared-ui="near-me-resolver"')))
print('BTN:' + str(h.count('Mera area dhoondo')))
PYEOF
  grep '^H2:' /tmp/nm_parts.txt | grep -qi 'near me' && H2OK=$((H2OK+1))
  grep '^H2:' /tmp/nm_parts.txt | grep -qi "near me &mdash; $name\|near me — $name" && NAMEOK=$((NAMEOK+1))
  grep -q '^SHARED:1' /tmp/nm_parts.txt && SHARED=$((SHARED+1))
  grep -q '^BTN:1' /tmp/nm_parts.txt && RESOLVER=$((RESOLVER+1))
  grep '^H3:' /tmp/nm_parts.txt | grep -qi 'near me' && H3OK=$((H3OK+1))
done < /tmp/nm_slugs.txt
chk "area page gine gaye" "$TOT" "83"
chk "H2 me 'near me'" "$H2OK" "83"
chk "H2 me US AREA ka naam bhi" "$NAMEOK" "83"
chk "data-shared-ui laga hai (depth gate safe)" "$SHARED" "83"
chk "resolver button render hua" "$RESOLVER" "83"
chk "🔴 purana H3 near-me block ABHI BHI hai (kuch hataya nahi)" "$H3OK" "83"

echo ""
echo "── 4. homepage/service page pe kuch toota to nahi ──"
curl -sS -m 25 "$B/" -o /tmp/nm_home.html
chk "homepage H1 ek hi" "$(grep -o '<h1' /tmp/nm_home.html | wc -l | tr -d ' ')" "1"
ge "homepage me 'near me' pehle jaisa" "$(grep -o -i 'near me' /tmp/nm_home.html | wc -l | tr -d ' ')" "25"
curl -sS -m 25 "$B/ro-services-patna" -o /tmp/nm_svc.html
ge "ro-services-patna me near-me" "$(grep -o -i 'near me' /tmp/nm_svc.html | wc -l | tr -d ' ')" "15"
curl -sS -m 25 "$B/ro-service-patna/kankarbagh" -o /tmp/nm_kb.html
ge "area page ab near-me count badha" "$(grep -o -i 'near me' /tmp/nm_kb.html | wc -l | tr -d ' ')" "6"

kill -9 $SRV 2>/dev/null; wait $SRV 2>/dev/null
echo ""
echo "  PASS: $pass    FAIL: $fail"
[ "$fail" -eq 0 ]
