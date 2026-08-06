#!/usr/bin/env bash
# Admin panel ka poora cross-check — logo/naam badalne ke baad kuch toota to nahi.
set -u

export DATABASE_URL="postgresql://postgres@localhost:5432/aqn"
export DIRECT_URL="$DATABASE_URL"
export NEXTAUTH_SECRET="test-secret-for-local-verification-only-32chars"
export NEXTAUTH_URL="http://127.0.0.1:3100"
export NODE_ENV=production
B=http://127.0.0.1:3100

pkill -9 -f "next-server" 2>/dev/null
sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/srv.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do
  sleep 2
  curl -sS -m 3 -o /dev/null "$B/api/auth/csrf" 2>/dev/null && { echo "server UP (${i}x2s)"; break; }
done
if ! curl -sS -m 5 -o /dev/null "$B/api/auth/csrf" 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/srv.log; kill -9 $SRV 2>/dev/null; exit 1
fi

pass=0; fail=0
chk()   { if [ "$2" = "$3" ];   then echo "  PASS  $1 ($2)"; pass=$((pass+1)); else echo "  FAIL  $1 — got '$2' want '$3'"; fail=$((fail+1)); fi; }
chkge() { if [ "$2" -ge "$3" ]; then echo "  PASS  $1 ($2)"; pass=$((pass+1)); else echo "  FAIL  $1 — got $2 want >=$3"; fail=$((fail+1)); fi; }

echo
echo "════ A) Admin login ════"
CJ=/tmp/adm.txt; rm -f $CJ
CSRF=$(curl -sS -m 15 -c $CJ $B/api/auth/csrf | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
curl -sS -m 15 -b $CJ -c $CJ -X POST $B/api/auth/callback/password \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "phone=8969821440" \
  --data-urlencode "password=ChangeMe@123" --data-urlencode "json=true" -o /dev/null
SESS=$(curl -sS -m 15 -b $CJ $B/api/auth/session)
if echo "$SESS" | grep -q 'ADMIN'; then echo "  PASS  admin logged in"; pass=$((pass+1));
else echo "  FAIL  login: $(echo $SESS | head -c 100)"; fail=$((fail+1)); kill -9 $SRV; exit 1; fi

echo
echo "════ B) Har admin page 200 ════"
for p in /admin /admin/products /admin/categories /admin/inventory /admin/media \
         /admin/orders /admin/customers /admin/service-requests /admin/service-due \
         /admin/amc /admin/abandoned-carts /admin/technicians /admin/seo \
         /admin/settings /admin/security; do
  chk "$p" "$(curl -sS -m 25 -b $CJ -o /dev/null -w '%{http_code}' $B$p)" "200"
done

echo
echo "════ C) Admin pe naam/logo sahi ════"
curl -sS -m 20 -b $CJ $B/admin -o /tmp/adm.html
chkge "'Aqua Perl' dikhta"   "$(grep -o 'Aqua Perl' /tmp/adm.html | wc -l)" "1"
chk   "'AquaNexa' bacha"     "$(grep -o 'AquaNexa' /tmp/adm.html | wc -l)" "0"
chkge "naya logo.svg"        "$(grep -o 'brand/logo.svg' /tmp/adm.html | wc -l)" "1"
chkge "Security nav link"    "$(grep -o '/admin/security' /tmp/adm.html | wc -l)" "1"

echo
echo "════ D) Customer-facing pages ════"
for p in /account /account/orders /account/machines /account/profile /account/amc \
         /account/addresses /account/wishlist /account/reviews /account/notifications; do
  code=$(curl -sS -m 20 -b $CJ -o /dev/null -w '%{http_code}' $B$p)
  if [ "$code" = "200" ] || [ "$code" = "307" ]; then
    echo "  PASS  $p ($code)"; pass=$((pass+1))
  else echo "  FAIL  $p — $code"; fail=$((fail+1)); fi
done

echo
echo "════ E) Logo files serve ho rahe ════"
for f in /brand/logo.svg /brand/logo.png /brand/icon.svg /brand/favicon-32.png /brand/apple-icon.png; do
  chk "$f" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B$f)" "200"
done

echo
echo "════ F) Logo SVG valid XML + sahi naam ════"
curl -sS -m 15 $B/brand/logo.svg -o /tmp/logo.svg
python3 - <<'PY'
import xml.dom.minidom, sys
try:
    d = xml.dom.minidom.parse('/tmp/logo.svg')
    txt = ''.join(n.firstChild.nodeValue for n in d.getElementsByTagName('tspan') if n.firstChild)
    ok = 'Aqua' in txt and 'Perl' in txt and 'Nexa' not in txt
    print(f"  {'PASS' if ok else 'FAIL'}  logo text = '{txt.strip()}'")
    sys.exit(0 if ok else 1)
except Exception as e:
    print("  FAIL  invalid SVG:", e); sys.exit(1)
PY
if [ $? -eq 0 ]; then pass=$((pass+1)); else fail=$((fail+1)); fi

echo
echo "════ G) Contact page — poora address + maps ════"
curl -sS -m 20 $B/contact -o /tmp/c.html
chkge "Sai Gali"          "$(grep -o 'Sai Gali' /tmp/c.html | wc -l)" "1"
chkge "Opposite B-62"     "$(grep -o 'Opposite B-62' /tmp/c.html | wc -l)" "1"
chkge "Buddha Colony"     "$(grep -o 'Buddha Colony' /tmp/c.html | wc -l)" "1"
chkge "800001"            "$(grep -o '800001' /tmp/c.html | wc -l)" "1"
chkge "Google Maps link"  "$(grep -o 'google.com/maps' /tmp/c.html | wc -l)" "1"
chk   "purana B-63"       "$(grep -o 'B-63' /tmp/c.html | wc -l)" "0"

echo
echo "════ H) Checkout flow toota to nahi ════"
chk "/cart"            "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/cart)" "200"
chk "/checkout"        "$(curl -sS -m 20 -b $CJ -o /dev/null -w '%{http_code}' $B/checkout)" "200"
# Khali cart 422 dena SAHI hai — validation zinda hai iska proof.
chk "/api/checkout/quote validates" "$(curl -sS -m 20 -X POST $B/api/checkout/quote -H 'Content-Type: application/json' -d '{"items":[]}' -o /dev/null -w '%{http_code}')" "422"

echo
echo "════════════════════════════════════"
echo "  PASS: $pass    FAIL: $fail"
echo "════════════════════════════════════"

kill -9 $SRV 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
exit $fail
