#!/usr/bin/env bash
# Title tag + Review schema changes ka verification.
# Ek hi process mein server uthata hai, sab check karta hai, band karta hai.
set -u

cd /home/user/aquanexa
export DATABASE_URL="postgresql://postgres@localhost:5432/aqn"
export DIRECT_URL="$DATABASE_URL"
export NEXTAUTH_SECRET="test-secret-for-local-verification-only-32chars"
export NEXTAUTH_URL="http://127.0.0.1:3100"
export NODE_ENV=production
B=http://127.0.0.1:3100

pkill -9 -f "next-server" 2>/dev/null; sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/s.log; kill -9 $SRV 2>/dev/null; exit 1
fi

pass=0; fail=0
chk(){ if [ "$2" = "$3" ]; then echo "  PASS  $1 ($2)"; pass=$((pass+1)); else echo "  FAIL  $1 — got '$2' want '$3'"; fail=$((fail+1)); fi; }
chkge(){ if [ "$2" -ge "$3" ]; then echo "  PASS  $1 ($2)"; pass=$((pass+1)); else echo "  FAIL  $1 — got $2 want >=$3"; fail=$((fail+1)); fi; }

echo
echo "════ 1) TITLE LENGTHS — research target 45-62 chars ════"
allok=1
for p in / /service-patna /service-patna/kankarbagh /service-patna/buddha-colony \
         /service-patna/patliputra-colony /service-patna/brand/kent \
         /service-patna/brand/aquaguard /amc-plans /products /contact; do
  t=$(curl -sS -m 20 "$B$p" | grep -oiE '<title>[^<]*' | head -1 | sed 's/<title>//')
  # rupee sign is 1 char but 3 bytes — count characters not bytes
  len=$(printf '%s' "$t" | python3 -c "import sys;print(len(sys.stdin.read()))")
  if [ "$len" -ge 40 ] && [ "$len" -le 65 ]; then
    printf "  PASS  [%2d] %-46s %s\n" "$len" "$p" "$t"; pass=$((pass+1))
  else
    printf "  FAIL  [%2d] %-46s %s\n" "$len" "$p" "$t"; fail=$((fail+1)); allok=0
  fi
done

echo
echo "════ 2) NAYE KEYWORD titles mein aa gaye? ════"
curl -sS -m 20 $B/ -o /tmp/h.html
curl -sS -m 20 $B/service-patna -o /tmp/sp.html
curl -sS -m 20 $B/service-patna/kankarbagh -o /tmp/ka.html
chkge "homepage: 'Water Purifier' in title"  "$(grep -oiE '<title>[^<]*Water Purifier[^<]*' /tmp/h.html | wc -l)" "1"
chkge "pillar: 'Water Purifier' in title"    "$(grep -oiE '<title>[^<]*Water Purifier[^<]*' /tmp/sp.html | wc -l)" "1"
chkge "area: 'Repair' in title"              "$(grep -oiE '<title>[^<]*Repair[^<]*' /tmp/ka.html | wc -l)" "1"

echo
echo "════ 3) REVIEW SCHEMA (naya — AI search ke liye) ════"
chkge "Review objects"        "$(grep -o '\"@type\":\"Review\"' /tmp/h.html | wc -l)" "3"
chkge "Rating objects"        "$(grep -o '\"@type\":\"Rating\"' /tmp/h.html | wc -l)" "3"
chkge "Person (reviewers)"    "$(grep -o '\"@type\":\"Person\"' /tmp/h.html | wc -l)" "3"
chkge "AggregateRating"       "$(grep -o 'AggregateRating' /tmp/h.html | wc -l)" "1"
chk   "review count = real 44" "$(grep -o '\"reviewCount\":\"44\"' /tmp/h.html | wc -l)" "2"
chk   "fake 312 gone"          "$(grep -o '312' /tmp/h.html | wc -l)" "0"

echo
echo "════ 4) PURANA SCHEMA abhi bhi hai? (kuch toota to nahi) ════"
chkge "LocalBusiness"   "$(grep -o 'LocalBusiness' /tmp/h.html | wc -l)" "1"
chkge "Organization"    "$(grep -o '\"@type\":\"Organization\"' /tmp/h.html | wc -l)" "1"
chkge "FAQPage"         "$(grep -o 'FAQPage' /tmp/h.html | wc -l)" "1"
chkge "Service"         "$(grep -o '\"@type\":\"Service\"' /tmp/h.html | wc -l)" "1"
chkge "GeoCoordinates"  "$(grep -o 'GeoCoordinates' /tmp/h.html | wc -l)" "1"

echo
echo "════ 5) JSON-LD valid hai? ════"
python3 - <<'PY'
import json, re, sys
bad = ok = 0
for f in ('/tmp/h.html', '/tmp/sp.html', '/tmp/ka.html'):
    html = open(f, encoding='utf-8', errors='ignore').read()
    for m in re.finditer(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S):
        try:
            json.loads(m.group(1)); ok += 1
        except Exception as e:
            bad += 1; print('  FAIL  invalid JSON-LD:', str(e)[:70])
print(f"  {'PASS' if bad==0 else 'FAIL'}  JSON-LD blocks ({ok} valid, {bad} broken)")
sys.exit(1 if bad else 0)
PY
if [ $? -eq 0 ]; then pass=$((pass+1)); else fail=$((fail+1)); fi

echo
echo "════ 6) SAB PAGES abhi bhi 200 ════"
for p in / /service-patna /service-patna/brand /products /amc-plans /contact \
         /cart /login /register /forgot-password /track-order /admin/login \
         /sitemap.xml /robots.txt /category/spare-parts; do
  chk "$p" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B$p)" "200"
done

echo
echo "════ 7) 35 AREA + 21 BRAND pages ════"
ok=0; bad=0
for a in kankarbagh boring-road patliputra-colony rajendra-nagar danapur bailey-road \
         kadamkuan ashiana-nagar rajiv-nagar gola-road gandhi-maidan phulwari-sharif \
         khagaul digha patna-city kumhrar buddha-colony kurji rukanpura shastri-nagar \
         mithapur bankipur anisabad gardanibagh kidwaipuri lodipur lohia-nagar \
         keshri-nagar khajpura hanuman-nagar raja-bazar rajapur sheikhpura mahendru new-punaichak; do
  c=$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/service-patna/$a)
  [ "$c" = "200" ] && ok=$((ok+1)) || { echo "    FAIL $a=$c"; bad=$((bad+1)); }
done
chk "35 area pages" "$ok" "35"

ok=0
for b in kent aquaguard livpure pureit ao-smith blue-star havells aquafresh aquasure \
         nasaka zero-b tata-swach lg whirlpool panasonic faber v-guard konvio-neer \
         aquaultra commercial-ro other-brands; do
  c=$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/service-patna/brand/$b)
  [ "$c" = "200" ] && ok=$((ok+1))
done
chk "21 brand pages" "$ok" "21"

echo
echo "════ 8) SITEMAP + GA ════"
chkge "sitemap URLs" "$(curl -sS -m 25 $B/sitemap.xml | grep -c '<loc>')" "70"
chkge "GA ID in bundle" "$(grep -rl 'G-JP9HDZ9SE3' .next/static/chunks/ 2>/dev/null | wc -l)" "1"

echo
echo "════════════════════════════════════"
echo "  PASS: $pass    FAIL: $fail"
echo "════════════════════════════════════"

kill -9 $SRV 2>/dev/null; pkill -9 -f "next-server" 2>/dev/null
exit $fail
