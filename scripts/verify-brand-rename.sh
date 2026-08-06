#!/usr/bin/env bash
# Naam badalne ke baad sab kuch sahi hai ya nahi — ek hi process mein.
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

curl -sS -m 20 $B/ -o /tmp/home.html

echo
echo "════ 1) Naya naam har jagah ════"
chkge "homepage pe 'Aqua Perl'" "$(grep -o 'Aqua Perl' /tmp/home.html | wc -l)" "5"
chk   "purana 'AquaNexa' bacha"  "$(grep -o 'AquaNexa' /tmp/home.html | wc -l)" "0"
chk   "source mein AquaNexa"     "$(grep -rn 'AquaNexa' src/ prisma/ db/ 2>/dev/null | wc -l)" "0"

echo
echo "════ 2) Address — Service Area Business (street CHHUPA) ════"
chkge "Buddha Colony dikhta"      "$(grep -o 'Buddha Colony' /tmp/home.html | wc -l)" "1"
chk   "street address CHHUPA"     "$(grep -o 'Sai Gali' /tmp/home.html | wc -l)" "0"
chk   "schema mein streetAddress" "$(grep -o 'streetAddress' /tmp/home.html | wc -l)" "0"
chk   "schema postalCode 800001"  "$(grep -o '\"postalCode\":\"800001\"' /tmp/home.html | wc -l)" "1"
chk   "purana B-63"               "$(grep -o 'B-63' /tmp/home.html | wc -l)" "0"

echo
echo "════ 2b) Dead email website pe nahi dikhta ════"
chk "homepage pe email"  "$(grep -o 'support@rokadoctor.in' /tmp/home.html | wc -l)" "0"
curl -sS -m 20 $B/contact -o /tmp/contact.html
chk "contact page pe email" "$(grep -o 'support@rokadoctor.in' /tmp/contact.html | wc -l)" "0"
chkge "contact pe doorstep msg" "$(grep -o 'doorstep service' /tmp/contact.html | wc -l)" "1"

echo
echo "════ 3) ASLI review count har jagah ════"
chk   "fake 312 hata"        "$(grep -o '\"reviewCount\":\"312\"' /tmp/home.html | wc -l)" "0"
chkge "schema mein asli 44"  "$(grep -o '\"reviewCount\":\"44\"' /tmp/home.html | wc -l)" "1"
chkge "schema rating 4.8"    "$(grep -o '\"ratingValue\":\"4.8\"' /tmp/home.html | wc -l)" "1"
chk   "fake '600+ repairs'"  "$(grep -o '600+ repairs' /tmp/home.html | wc -l)" "0"
chk   "fake '4.9' badge"     "$(grep -oE '4\.9 · 600' /tmp/home.html | wc -l)" "0"
chkge "hero pe 44 reviews"   "$(grep -o '44' /tmp/home.html | wc -l)" "1"

echo
echo "════ 4) Fake social links gaye ════"
chk "facebook.com/aquanexa" "$(grep -o 'facebook.com/aquanexa' /tmp/home.html | wc -l)" "0"
chk "instagram.com/aquanexa" "$(grep -o 'instagram.com/aquanexa' /tmp/home.html | wc -l)" "0"

echo
echo "════ 5) LocalBusiness schema homepage pe ════"
chkge "LocalBusiness"  "$(grep -o 'LocalBusiness' /tmp/home.html | wc -l)" "1"
chkge "Organization"   "$(grep -o '\"@type\":\"Organization\"' /tmp/home.html | wc -l)" "1"
chkge "PostalAddress"  "$(grep -o 'PostalAddress' /tmp/home.html | wc -l)" "1"
chkge "GeoCoordinates" "$(grep -o 'GeoCoordinates' /tmp/home.html | wc -l)" "1"

echo
echo "════ 6) Phone bilkul sahi ════"
chkge "8969821440" "$(grep -o '8969821440' /tmp/home.html | wc -l)" "5"

echo
echo "════ 7) Saare page 200 ════"
for p in / /service-patna /service-patna/brand /service-patna/kankarbagh /products /amc-plans /contact /cart /login /register /forgot-password /track-order /admin/login /sitemap.xml /robots.txt; do
  chk "$p" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B$p)" "200"
done

echo
echo "════ 8) Sitemap theek ════"
chkge "sitemap URLs" "$(curl -sS -m 20 $B/sitemap.xml | grep -c '<loc>')" "50"

echo
echo "════ 9) Area page pe bhi naya naam + address ════"
curl -sS -m 20 $B/service-patna/kankarbagh -o /tmp/area.html
chkge "area page 'Aqua Perl'" "$(grep -o 'Aqua Perl' /tmp/area.html | wc -l)" "3"
chk   "area page AquaNexa"    "$(grep -o 'AquaNexa' /tmp/area.html | wc -l)" "0"
chkge "area LocalBusiness"    "$(grep -o 'LocalBusiness' /tmp/area.html | wc -l)" "1"

echo
echo "════ 10) JSON-LD valid JSON hai? ════"
python3 - <<'PY'
import json, re, sys
ok = bad = 0
for f in ('/tmp/home.html', '/tmp/area.html'):
    html = open(f, encoding='utf-8', errors='ignore').read()
    for m in re.finditer(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S):
        raw = m.group(1)
        try:
            json.loads(raw); ok += 1
        except Exception as e:
            bad += 1; print('  FAIL  invalid JSON-LD:', str(e)[:80])
print(f"  {'PASS' if bad==0 else 'FAIL'}  JSON-LD blocks valid ({ok} ok, {bad} bad)")
sys.exit(1 if bad else 0)
PY
if [ $? -eq 0 ]; then pass=$((pass+1)); else fail=$((fail+1)); fi

echo
echo "════════════════════════════════════"
echo "  PASS: $pass    FAIL: $fail"
echo "════════════════════════════════════"

kill -9 $SRV 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
exit $fail
