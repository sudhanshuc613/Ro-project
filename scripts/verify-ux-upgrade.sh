#!/usr/bin/env bash
# NOTE (3 Sep 2026): area pages moved to /ro-service-patna/{slug}.
# The old path now 308s there on purpose, so these assert the new URL.
# Verification for the Phase 1+2+3 UX upgrade:
#   Phase 1 — proof stats, review showcase, sticky bar, quick form, exit intent
#   Phase 2 — motion system, glass, skeleton, reduced-motion safety
#   Phase 3 — command palette, action center, notification bell, push
#   Plus    — owner alerts fire on new service request and new order
# Starts its own server, checks everything, shuts down. One process.
set -u

cd /home/user/aquanexa
export DATABASE_URL="postgresql://postgres@localhost:5432/aqn"
export DIRECT_URL="$DATABASE_URL"
export NEXTAUTH_SECRET="test-secret-for-local-verification-only-32chars"
export NEXTAUTH_URL="http://127.0.0.1:3100"
export NODE_ENV=production
B=http://127.0.0.1:3100

pass=0; fail=0
chk() { if [ "$2" = "$3" ]; then echo "  PASS  $1 ($2)"; pass=$((pass+1));
        else echo "  FAIL  $1 — mila '$2', chahiye '$3'"; fail=$((fail+1)); fi }
has() { if echo "$2" | grep -q -- "$3"; then echo "  PASS  $1"; pass=$((pass+1));
        else echo "  FAIL  $1"; fail=$((fail+1)); fi }
hasf() { if grep -q -- "$2" "$3" 2>/dev/null; then echo "  PASS  $1"; pass=$((pass+1));
        else echo "  FAIL  $1"; fail=$((fail+1)); fi }
hasnt() { if echo "$2" | grep -q -- "$3"; then echo "  FAIL  $1 — '$3' mila"; fail=$((fail+1));
        else echo "  PASS  $1"; pass=$((pass+1)); fi }

# order-independent: reset admin password
node -e "process.stdout.write(require('bcryptjs').hashSync('ChangeMe@123',12))" > /tmp/_h3.txt 2>/dev/null
python3 -c "
import psycopg
h=open('/tmp/_h3.txt').read().strip()
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute('update users set password_hash=%s where phone=%s',(h,'8969821440'))" 2>/dev/null

pkill -9 -f "next-server" 2>/dev/null; sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s8.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s8.log; kill -9 $SRV 2>/dev/null; exit 1
fi
echo "server UP"

HOME_HTML=$(curl -sS -m 25 $B/)

echo
echo "════ 1) PHASE 1 — Proof stats (44 ko bada dikhana) ════"
has "ProofStats section render"      "$HOME_HTML" "Our track record"
has "2,400+ repairs dikha"           "$HOME_HTML" "2,400"
has "35 areas dikha"                 "$HOME_HTML" "Areas covered"
has "21 brands dikha"                "$HOME_HTML" "Brands serviced"
has "4.8 rating dikha"               "$HOME_HTML" "Google rating"
hasf "REPAIRS_COMPLETED constant"    "REPAIRS_COMPLETED = 2400" src/lib/social-proof.ts
hasf "CountUp component"             "IntersectionObserver" src/components/ui/CountUp.tsx

echo
echo "════ 2) 🔴 Review count IMAANDAR hai (fake nahi) ════"
# The visible count and the schema count must both be the real GBP number.
SCHEMA_COUNT=$(echo "$HOME_HTML" | grep -oP '"reviewCount":"?\d+' | grep -oP '\d+' | head -1)
chk "schema reviewCount = 44 (asli)" "${SCHEMA_COUNT:-none}" "44"
hasnt "koi fake 300 count nahi"      "$HOME_HTML" '"reviewCount":"300"'
hasnt "koi fake 312 count nahi"      "$HOME_HTML" '"reviewCount":"312"'
has "44 verified likha hai"          "$HOME_HTML" "44"
has "hum review nahi kharidte line"  "$HOME_HTML" "review kharidte"

echo
echo "════ 3) PHASE 1 — Review showcase ════"
has "ReviewShowcase render"          "$HOME_HTML" "Patna ke log kya kehte hain"
has "rating panel 4.8 bada"          "$HOME_HTML" "out of 5"
has "star breakdown bar"             "$HOME_HTML" "86"
has "Google reviews link"            "$HOME_HTML" "google.com/search"
has "Verified badge"                 "$HOME_HTML" "Verified"

echo
echo "════ 4) PHASE 1 — Sticky bar, quick form, exit intent ════"
has "StickyActionBar render"         "$HOME_HTML" "sticky_call"
has "sticky WhatsApp"                "$HOME_HTML" "sticky_whatsapp"
has "QuickBookForm render"           "$HOME_HTML" "30 second me booking"
has "3 field: phone"                 "$HOME_HTML" "Aapka mobile number"
has "3 field: area"                  "$HOME_HTML" "Aapka area"
has "3 field: problem"               "$HOME_HTML" "Kya problem hai"
has "trust badges"                   "$HOME_HTML" "30-day warranty"
hasf "ExitIntent desktop-only guard" "pointer: coarse" src/components/layout/ExitIntent.tsx
hasf "ExitIntent once per session"   "sessionStorage" src/components/layout/ExitIntent.tsx
hasf "ExitIntent 12s delay"          "12_000" src/components/layout/ExitIntent.tsx

echo
echo "════ 5) PHASE 2 — Motion + glass + skeleton ════"
CSS=$(cat src/app/globals.css)
has "fade-up keyframe"               "$CSS" "aqp-fade-up"
has "shimmer keyframe"               "$CSS" "aqp-shimmer"
has "pulse-ring keyframe"            "$CSS" "aqp-pulse-ring"
has "shake keyframe"                 "$CSS" "aqp-shake"
has "glass utility"                  "$CSS" "backdrop-filter"
has "lift utility"                   "$CSS" ".lift"
has "skeleton utility"               "$CSS" ".skeleton"
has "sticky bar body padding"        "$CSS" "has-sticky-bar"
has "reduced-motion reveal safety"   "$CSS" "reveal { opacity: 1 !important"
hasf "useRevealOnScroll hook"        "IntersectionObserver" src/lib/hooks/useRevealOnScroll.ts
hasf "reduced-motion respected"      "prefers-reduced-motion" src/lib/hooks/useRevealOnScroll.ts

echo
echo "════ 6) PHASE 3 — Admin login + new pages ════"
CJ=/tmp/cux.txt; rm -f $CJ
CSRF=$(curl -sS -m 15 -c $CJ $B/api/auth/csrf | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
curl -sS -m 15 -b $CJ -c $CJ -X POST $B/api/auth/callback/password \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "phone=8969821440" \
  --data-urlencode "password=ChangeMe@123" --data-urlencode "json=true" -o /dev/null
SESS=$(curl -sS -m 15 -b $CJ $B/api/auth/session)
has "admin login" "$SESS" "ADMIN"

DASH=$(curl -sS -m 25 -b $CJ $B/admin)
has "Command palette button"         "$DASH" "Ctrl K"
has "NotificationBell render"        "$DASH" "Notifications"
has "Today pulse — kamai"            "$DASH" "Aaj ki kamai"
has "Today pulse — service"          "$DASH" "Nayi service request"
has "ActionCenter render"            "$DASH" "control me hai\|Abhi dhyan do"

echo
echo "════ 7) PHASE 3 — Naye API endpoints ════"
chk "GET /api/admin/alerts bina login 401" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/api/admin/alerts)" "401"
chk "GET /api/admin/push bina login 401"   "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/api/admin/push)" "401"
chk "GET /api/admin/search bina login 401" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/api/admin/search?q=test)" "401"

R=$(curl -sS -m 15 -b $CJ $B/api/admin/alerts)
has "alerts endpoint response"  "$R" '"alerts"'
has "unread count field"        "$R" '"unread"'

R=$(curl -sS -m 15 -b $CJ $B/api/admin/push)
has "push config endpoint"      "$R" '"configured"'

R=$(curl -sS -m 15 -b $CJ "$B/api/admin/search?q=aqua")
has "search endpoint works"     "$R" '"hits"'

echo
echo "════ 8) 🔴 NOTIFICATION — service request pe alert banta hai? ════"
python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute('delete from admin_alerts')" 2>/dev/null

REQ=$(curl -sS -m 25 -X POST $B/api/service-requests -H 'Content-Type: application/json' -d '{
  "customerName":"Test Customer","customerPhone":"9876543210","pincode":"800001",
  "area":"Kankarbagh","addressLine":"Test address Patna","serviceType":"REPAIR",
  "issueCategory":"NO_WATER","issueDescription":"Paani nahi aa raha","source":"WEBSITE"}')
has "service request bana" "$REQ" '"success":true'

sleep 2
ALERT_COUNT=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn')
cur=c.cursor(); cur.execute(\"select count(*) from admin_alerts where kind='SERVICE_REQUEST'\")
print(cur.fetchone()[0])" 2>/dev/null)
chk "🔔 admin alert DB me bana" "${ALERT_COUNT:-0}" "1"

ALERT_ROW=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn')
cur=c.cursor(); cur.execute(\"select title,phone,priority from admin_alerts limit 1\")
r=cur.fetchone()
d=lambda v: v.decode() if isinstance(v,bytes) else str(v)
print('|'.join(d(x) for x in r))" 2>/dev/null)
has "alert me area naam"      "$ALERT_ROW" "Kankarbagh"
has "alert me phone (1-tap call)" "$ALERT_ROW" "9876543210"
has "NO_WATER = high priority" "$ALERT_ROW" "high"

R=$(curl -sS -m 15 -b $CJ $B/api/admin/alerts)
has "bell API me alert dikha"  "$R" "Kankarbagh"
has "unread count 1"           "$R" '"unread":1'

# mark read works
curl -sS -m 15 -b $CJ -X POST $B/api/admin/alerts -H 'Content-Type: application/json' -d '{}' -o /dev/null
R=$(curl -sS -m 15 -b $CJ $B/api/admin/alerts)
has "mark-read ne unread 0 kiya" "$R" '"unread":0'

echo
echo "════ 9) Service worker + push plumbing ════"
chk "/sw.js serve hota hai" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/sw.js)" "200"
SW=$(curl -sS -m 15 $B/sw.js)
has "push event handler"   "$SW" "addEventListener('push'"
has "notificationclick"    "$SW" "notificationclick"
has "high priority vibrate" "$SW" "requireInteraction"
hasf "alert.service push fn" "sendPushToOwner" src/server/services/alert.service.ts
hasf "web-push lazy import"  "await import('web-push')" src/server/services/alert.service.ts
hasf "dead subscription cleanup" "410" src/server/services/alert.service.ts

echo
echo "════ 10) Order pe bhi alert lagta hai ════"
hasf "orders route alertNewOrder"        "alertNewOrder" src/app/api/orders/route.ts
hasf "COD high priority"                 "cod ? 'high'" src/server/services/alert.service.ts
hasf "service-requests route alert"      "alertNewServiceRequest" src/app/api/service-requests/route.ts

echo
echo "════ 11) Kuch toota to nahi — public pages ════"
for p in / /products /service-patna /ro-service-patna/kankarbagh /service-patna/brand/kent \
         /category/spare-parts /contact /amc-plans /cart /login /track-order; do
  chk "$p" "$(curl -sS -m 25 -o /dev/null -w '%{http_code}' $B$p)" "200"
done

echo
echo "════ 12) Admin pages ════"
for p in /admin /admin/products /admin/products/new /admin/orders /admin/service-requests \
         /admin/competitors /admin/seo /admin/customers /admin/inventory /admin/settings; do
  chk "$p" "$(curl -sS -m 25 -b $CJ -o /dev/null -w '%{http_code}' $B$p)" "200"
done

echo
echo "════ 13) SEO abhi bhi intact ════"
SM=$(curl -sS -m 20 $B/sitemap.xml | grep -c "<loc>")
if [ "$SM" -ge 55 ]; then echo "  PASS  sitemap $SM URLs"; pass=$((pass+1));
else echo "  FAIL  sitemap sirf $SM URLs"; fail=$((fail+1)); fi

has "homepage LocalBusiness schema" "$HOME_HTML" "LocalBusiness"
has "homepage FAQPage schema"       "$HOME_HTML" "FAQPage"
has "homepage Review schema"        "$HOME_HTML" '"@type":"Review"'
curl -sS -m 20 $B/ -o /tmp/h8.html
if grep -q "AquaNexa" /tmp/h8.html; then echo "  FAIL  AquaNexa mila"; fail=$((fail+1));
else echo "  PASS  AquaNexa nahi"; pass=$((pass+1)); fi

BAD=$(for p in / /products /category/spare-parts /service-patna /admin; do
  curl -sS -m 20 $B$p | python3 -c "
import sys,re,json
h=sys.stdin.read(); bad=0
for m in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', h, re.S):
    try: json.loads(m)
    except Exception: bad+=1
print(bad)"
done | python3 -c "import sys;print(sum(int(x) for x in sys.stdin.read().split()))")
chk "sab JSON-LD valid" "$BAD" "0"

echo
echo "════ 14) Mobile-specific ════"
MOB=$(curl -sS -m 25 -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15" $B/)
has "mobile pe sticky bar"    "$MOB" "sticky_call"
has "tel: links maujood"      "$MOB" 'href="tel:'
has "safe-area inset"         "$MOB" "safe-area-inset-bottom"

# cleanup test data
python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute('delete from admin_alerts')
c.execute(\"delete from service_status_history where request_id in (select id from service_requests where customer_phone='9876543210')\")
c.execute(\"delete from service_requests where customer_phone='9876543210'\")" 2>/dev/null

kill -9 $SRV 2>/dev/null; pkill -9 -f "next-server" 2>/dev/null

echo
echo "════════════════════════════════════"
echo "  PASS: $pass    FAIL: $fail"
echo "════════════════════════════════════"
[ "$fail" -eq 0 ] || exit 1
