#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# verify-search-queries.sh
#
# KYU BANA (19 Sep 2026)
# ──────────────────────
# Google Autocomplete (gl=in) se live scrape kiya. Jo phrases Google KHUD
# suggest karta hai (matlab jinke peeche asli search volume hai):
#
#     ro service patna              ro service in patna
#     ro service patna near me      ro service centre patna
#     ro repair patna               kent ro service patna
#     aquaguard ro service patna    water purifier service patna
#
# Phir poori 133-page LIVE site pe in exact phrases ko gina:
#
#     ro service patna near me        0   🔴
#     ro service centre patna         0   🔴
#     ro repair patna                 0   🔴
#     kent ro service patna           0   🔴
#     aquaguard ro service patna      0   🔴
#     water purifier service patna    0   🔴
#
# Chhe phrases, jinhe Google khud suggest karta hai, site pe EK BAAR BHI nahi.
#
# Wajah grammar thi: hum "RO Repair in Patna" likhte hain, log "ro repair
# patna" type karte hain. Ye test us gap ko dobara khulne nahi dega.
#
# NOTE: ye test count ka FLOOR check karta hai, ceiling nahi. Zyada count
# achha nahi hai — #1 competitor "ro service centre" 167 baar daalta hai aur
# wo stuffing hai. Isliye har phrase ka upper bound bhi check hota hai.
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-sq.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-sq.log; kill -9 $SRV 2>/dev/null; exit 1
fi

pass=0; fail=0
ok()  { echo "  PASS  $1"; pass=$((pass+1)); }
bad() { echo "  FAIL  $1"; fail=$((fail+1)); }

# visible body text nikaalo (jaisa Google padhta hai)
body() {
  curl -sS -m 25 "$B$1" 2>/dev/null | python3 -c "
import sys,re,html
h=sys.stdin.read()
h=re.sub(r'<script.*?</script>','',h,flags=re.S|re.I)
h=re.sub(r'<style.*?</style>','',h,flags=re.S|re.I)
print(re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',h))).lower())
"
}

echo "════ A) Autocomplete phrases homepage pe maujood ════"
HOME=$(body /)
# phrase | minimum | maximum (max = stuffing guard)
while IFS='|' read -r phrase lo hi; do
  [ -z "$phrase" ] && continue
  n=$(echo "$HOME" | grep -o "$phrase" | wc -l)
  if [ "$n" -lt "$lo" ]; then
    bad "homepage '$phrase' — mila ${n}x, kam se kam ${lo}x chahiye"
  elif [ "$n" -gt "$hi" ]; then
    bad "homepage '$phrase' — ${n}x, ye stuffing hai (max ${hi}x)"
  else
    ok "homepage '$phrase' ${n}x (${lo}-${hi})"
  fi
done <<'ROWS'
ro service patna near me|1|6
ro service centre patna|1|6
ro repair patna|1|6
water purifier service patna|1|6
ro service patna|2|25
ro service near me|1|10
ROWS

echo
echo "════ B) Brand queries brand pages pe ════"
while IFS='|' read -r slug phrase; do
  [ -z "$slug" ] && continue
  n=$(body "/service-patna/brand/$slug" | grep -o "$phrase" | wc -l)
  if [ "$n" -ge 1 ]; then ok "/brand/$slug — '$phrase' ${n}x"
  else bad "/brand/$slug — '$phrase' NAHI mila"; fi
done <<'ROWS'
kent|kent ro service patna
aquaguard|aquaguard ro service patna
aquafresh|aquafresh ro service patna
livpure|livpure ro service patna
pureit|pureit ro service patna
ROWS

echo
echo "════ C) Footer coverage line har page type pe ════"
for p in / /service-patna /ro-service-in-patna /ro-repair-patna /products /blog; do
  n=$(body "$p" | grep -o "ro service, ro repair aur water purifier service" | wc -l)
  if [ "$n" -ge 1 ]; then ok "$p — footer coverage line maujood"
  else bad "$p — footer coverage line GAYAB"; fi
done

echo
echo "════ D) Naya content asli page ko nuksan to nahi kar raha ════"
# H1 abhi bhi wahi, title abhi bhi wahi, page abhi bhi 200
for p in / /service-patna/brand/kent; do
  c=$(curl -sS -m 20 -o /dev/null -w '%{http_code}' "$B$p")
  [ "$c" = "200" ] && ok "$p still 200" || bad "$p → $c"
done
H1=$(curl -sS -m 20 "$B/" | python3 -c "
import sys,re,html
h=sys.stdin.read()
m=re.search(r'<h1[^>]*>(.*?)</h1>',h,re.S)
print(html.unescape(re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',m.group(1)))).strip() if m else '')
")
[ "$H1" = "RO Service Near Me in Patna" ] && ok "homepage H1 badla nahi" || bad "homepage H1 badal gaya: '$H1'"

# glue guard — naya text kahin H1 me to nahi ghusa
GL=$(python3 -c "
import re,sys
t=sys.argv[1]
allow={'AquaPerl','AquaGuard','AquaFresh','AquaSure','AquaUltra'}
print(','.join(m.group(0) for m in re.finditer(r'[a-z]{2,}[A-Z][a-z]{2,}',t) if m.group(0) not in allow))
" "$H1")
[ -z "$GL" ] && ok "homepage H1 me glue nahi" || bad "H1 glue: $GL"

echo
echo "════ E) FAQ schema me naye jawab hain ════"
# Retry — pichhla test apna server band karte waqt kabhi-kabhi is fetch ko
# beech me kaat deta hai. Ek khaali response ko code ka bug samajh lena
# galti hogi (ye 19 Sep 2026 ko ek baar hua tha).
SC=0
for _ in 1 2 3; do
  SC=$(curl -sS -m 25 "$B/" 2>/dev/null | grep -o '"@type":"Question"' | wc -l)
  [ "$SC" -ge 12 ] && break
  sleep 3
done
if [ "$SC" -ge 12 ]; then ok "homepage FAQPage me $SC Question (>=12)"
else bad "homepage FAQPage me sirf $SC Question"; fi

echo
echo "════════════════════════════════════"
echo "  PASS: $pass    FAIL: $fail"
echo "════════════════════════════════════"

kill -9 $SRV 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
exit $fail
