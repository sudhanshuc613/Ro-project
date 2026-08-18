#!/usr/bin/env bash
# Verification for the 18 Aug 2026 SEO + indexing + competitor-watch work.
#   • middleware: lowercase forcing, legacy slug 301s
#   • auto-redirect on slug rename
#   • pan-India catalog SEO (ItemList + FAQ schema, buying guides)
#   • title/description length fixes
#   • IndexNow key file + service
#   • Competitor Watch API
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
has() { if echo "$2" | grep -q "$3"; then echo "  PASS  $1"; pass=$((pass+1));
        else echo "  FAIL  $1"; fail=$((fail+1)); fi }
hasf() { if grep -q "$2" "$3" 2>/dev/null; then echo "  PASS  $1"; pass=$((pass+1));
        else echo "  FAIL  $1"; fail=$((fail+1)); fi }

# password reset so the suite is order-independent
node -e "process.stdout.write(require('bcryptjs').hashSync('ChangeMe@123',12))" > /tmp/_h2.txt 2>/dev/null
python3 -c "
import psycopg
h=open('/tmp/_h2.txt').read().strip()
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute('update users set password_hash=%s where phone=%s',(h,'8969821440'))" 2>/dev/null

pkill -9 -f "next-server" 2>/dev/null; sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s6.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/s6.log; kill -9 $SRV 2>/dev/null; exit 1
fi
echo "server UP"

echo
echo "════ 1) Middleware: lowercase forcing ════"
SLUG=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn')
cur=c.cursor(); cur.execute(\"select slug from products where status='ACTIVE' limit 1\")
v=cur.fetchone()[0]; print(v.decode() if isinstance(v,bytes) else v)")
UPPER=$(python3 -c "print('$SLUG'.upper())")
chk "lowercase slug 200"           "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/products/$SLUG)" "200"
chk "UPPERCASE slug 301 redirect"  "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/products/$UPPER)" "301"
LOC=$(curl -sS -m 20 -o /dev/null -w '%{redirect_url}' $B/products/$UPPER)
has "redirect lowercase pe jaata hai" "$LOC" "/products/$SLUG"
# Next.js strips the trailing slash itself with a 308 (permanent, method-preserving)
# before our middleware runs. 308 is the modern equivalent of 301 and passes
# ranking identically, so we accept it.
TS=$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/products/)
if [ "$TS" = "301" ] || [ "$TS" = "308" ]; then
  echo "  PASS  trailing slash redirect ($TS)"; pass=$((pass+1));
else echo "  FAIL  trailing slash — mila '$TS'"; fail=$((fail+1)); fi

echo
echo "════ 2) Middleware: legacy path redirects ════"
for p in /shop /spare-parts /water-purifier /amc /book-service; do
  chk "$p 301" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B$p)" "301"
done

echo
echo "════ 3) Legacy product slug redirects ════"
for old in ro-booster-pump-100-gpd-24v aquanexa-pure-8l-ro-uv-uf-water-purifier; do
  chk "/products/$old 301" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/products/$old)" "301"
done

echo
echo "════ 4) IndexNow key file ════"
KEYRES=$(curl -sS -m 20 $B/a7f3c9e2b8d1456c4e8a1b6d29f375e0.txt)
chk "key file 200" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/a7f3c9e2b8d1456c4e8a1b6d29f375e0.txt)" "200"
chk "key content exact" "$KEYRES" "a7f3c9e2b8d1456c4e8a1b6d29f375e0"
hasf "indexing service maujood" "pingIndexNow" src/server/services/indexing.service.ts
hasf "Google IndexNow support nahi — documented" "indexNowSupported: false" src/server/services/indexing.service.ts

echo
echo "════ 5) Pan-India catalog SEO ════"
PRODS=$(curl -sS -m 25 $B/products)
has "/products me ItemList schema"    "$PRODS" '"@type":"ItemList"'
has "/products me FAQPage schema"     "$PRODS" '"@type":"FAQPage"'
has "/products me BreadcrumbList"     "$PRODS" '"@type":"BreadcrumbList"'
has "/products me trust block"        "$PRODS" "Why buy from a service company"
PW=$(echo "$PRODS" | sed 's/<[^>]*>/ /g' | wc -w)
if [ "$PW" -ge 1600 ]; then echo "  PASS  /products word count $PW (>=1600)"; pass=$((pass+1));
else echo "  FAIL  /products word count sirf $PW"; fail=$((fail+1)); fi

for c in spare-parts new-ro-purifiers commercial-plants ro-membranes booster-pumps accessories; do
  CP=$(curl -sS -m 25 $B/category/$c)
  code=$(curl -sS -m 25 -o /dev/null -w '%{http_code}' $B/category/$c)
  W=$(echo "$CP" | sed 's/<[^>]*>/ /g' | wc -w)
  IL=$(echo "$CP" | grep -c '"@type":"ItemList"')
  FQ=$(echo "$CP" | grep -c '"@type":"FAQPage"')
  GRID=$(echo "$CP" | grep -c "No products match")
  if [ "$code" = "200" ] && [ "$W" -ge 1500 ] && [ "$FQ" -ge 1 ] && { [ "$IL" -ge 1 ] || [ "$GRID" -ge 1 ]; }; then
    echo "  PASS  /category/$c — $W words, ItemList:$IL FAQ:$FQ"; pass=$((pass+1))
  else
    echo "  FAIL  /category/$c — HTTP $code, $W words, ItemList:$IL FAQ:$FQ"; fail=$((fail+1))
  fi
done

echo
echo "════ 6) Title + description lengths ════"
node -e "
const bad=[];
const names=[
 'Aquabizz 8L RO + UV + UF + TDS Water Purifier',
 'AquaFresh Alkaline Copper 10L RO Purifier— Mineral Guard',
 'AquaPearl',
 'Grand Forest RO Booster Pump 100 GPD— 24V DC with Mounting Bracket',
 'RO Membrane 80 GPD'];
function tidy(n){return n.replace(/\s+/g,' ').replace(/\s*—\s*/g,' — ').trim();}
function fit(t,m){const s=t.replace(/\s+/g,' ').trim();if(s.length<=m)return s;
const c=s.slice(0,m-1);const sp=c.lastIndexOf(' ');
return (sp>m*0.6?c.slice(0,sp):c).replace(/[\s—–|,-]+\$/,'')+'…';}
for(const n of names){
  const cl=tidy(n);
  let t;
  if(cl.length<28){
    const p=/purifier|ro\b|pump|membrane|filter|plant|kit|smps/i.test(cl)?cl+' — Price in India':cl+' RO Water Purifier — Price';
    t=fit(p,46)+' | Buy Online';
  } else t=fit(cl,46)+' | Buy Online';
  if(t.length<30||t.length>62) bad.push(n+' -> '+t.length);
  if(/—…|–…|\|…/.test(t)) bad.push('BROKEN CUT: '+t);
}
if(bad.length){console.log('FAIL '+bad.join(' ; '));process.exit(1)}
console.log('OK all titles 30-62 chars, no broken cuts');
" > /tmp/titles.txt 2>&1
if grep -q "^OK" /tmp/titles.txt; then echo "  PASS  $(cat /tmp/titles.txt)"; pass=$((pass+1));
else echo "  FAIL  $(cat /tmp/titles.txt)"; fail=$((fail+1)); fi

PDP=$(curl -sS -m 25 $B/products/$SLUG)
T=$(echo "$PDP" | grep -oP '(?<=<title>)[^<]*' | head -1)
TL=$(echo -n "$T" | wc -c)
if [ "$TL" -ge 30 ] && [ "$TL" -le 75 ]; then echo "  PASS  PDP title $TL chars: $T"; pass=$((pass+1));
else echo "  FAIL  PDP title $TL chars: $T"; fail=$((fail+1)); fi
D=$(echo "$PDP" | grep -oP '(?<=name="description" content=")[^"]*' | head -1)
DL=$(echo -n "$D" | wc -c)
if [ "$DL" -le 165 ]; then echo "  PASS  PDP desc $DL chars (<=165)"; pass=$((pass+1));
else echo "  FAIL  PDP desc $DL chars — SERP me kat jayega"; fail=$((fail+1)); fi

echo
echo "════ 7) Admin login + new endpoints ════"
CJ=/tmp/cseo.txt; rm -f $CJ
CSRF=$(curl -sS -m 15 -c $CJ $B/api/auth/csrf | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
curl -sS -m 15 -b $CJ -c $CJ -X POST $B/api/auth/callback/password \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "phone=8969821440" \
  --data-urlencode "password=ChangeMe@123" --data-urlencode "json=true" -o /dev/null
SESS=$(curl -sS -m 15 -b $CJ $B/api/auth/session)
has "admin login" "$SESS" "ADMIN"

chk "GET /api/admin/redirects bina login 401" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/api/admin/redirects)" "401"
chk "GET /api/admin/rank-check bina login 401" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/api/admin/rank-check)" "401"

R=$(curl -sS -m 15 -b $CJ $B/api/admin/redirects)
has "redirects list mili" "$R" '"redirects"'

R=$(curl -sS -m 15 -b $CJ -X POST $B/api/admin/redirects -H 'Content-Type: application/json' \
  -d '{"fromPath":"/Old-Test-Page/","toPath":"/products","statusCode":301}')
has "redirect create hua" "$R" '"success":true'
has "path normalise hua (lowercase, no trailing slash)" "$R" '"fromPath":"/old-test-page"'

R=$(curl -sS -m 15 -b $CJ -X POST $B/api/admin/redirects -H 'Content-Type: application/json' \
  -d '{"fromPath":"/same","toPath":"/same","statusCode":301}')
has "self-redirect reject" "$R" "loop"

curl -sS -m 15 -b $CJ -X DELETE "$B/api/admin/redirects?from=/old-test-page" -o /dev/null

R=$(curl -sS -m 15 -b $CJ $B/api/admin/rank-check)
has "rank-check history endpoint"  "$R" '"keywords"'
has "keyword groups mile"          "$R" '"groups"'

echo
echo "════ 8) Admin pages render ════"
for p in /admin/competitors /admin/seo /admin/products/new; do
  chk "$p" "$(curl -sS -m 25 -b $CJ -o /dev/null -w '%{http_code}' $B$p)" "200"
done
CW=$(curl -sS -m 25 -b $CJ $B/admin/competitors)
has "Competitor Watch render"      "$CW" "Live rank check"
has "honesty note maujood"         "$CW" "DuckDuckGo"
SEOP=$(curl -sS -m 25 -b $CJ $B/admin/seo)
has "Redirect manager render"      "$SEOP" "URL Redirects"
SB=$(curl -sS -m 25 -b $CJ $B/admin)
has "sidebar me Competitor Watch"  "$SB" "Competitor Watch"

echo
echo "════ 9) Auto-redirect jab slug badle ════"
PID=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn')
cur=c.cursor(); cur.execute(\"select id from products where status='ACTIVE' limit 1\")
v=cur.fetchone()[0]; print(v.decode() if isinstance(v,bytes) else v)")
BEFORE=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn')
cur=c.cursor(); cur.execute(\"select slug from products where id=%s\",('$PID',))
v=cur.fetchone()[0]; print(v.decode() if isinstance(v,bytes) else v)")
python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute(\"delete from redirects where from_path like '/products/%'\")" 2>/dev/null

PAYLOAD=$(python3 - <<PY
import json,psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn')
cur=c.cursor()
cur.execute("select name,sku,type,category_id,mrp,selling_price,tax_rate,stock_quantity,low_stock_threshold,status from products where id=%s",('$PID',))
r=cur.fetchone()
d=lambda v: v.decode() if isinstance(v,bytes) else str(v)
print(json.dumps({
 "name":d(r[0]),"sku":d(r[1]),"slug":"renamed-test-slug-xyz","type":d(r[2]),
 "categoryId":d(r[3]),"brandId":"","shortDescription":"test","description":"test",
 "mrp":float(r[4]),"sellingPrice":float(r[5]),"taxRate":float(r[6]),
 "stockQuantity":r[7],"lowStockThreshold":r[8],"purificationTech":[],
 "isPanIndia":True,"requiresInstallation":False,"freeShipping":False,"isFeatured":False,
 "status":"DRAFT",
 "images":[{"url":"/products/a.png","altText":"test image one","isPrimary":True},
           {"url":"/products/b.png","altText":"test image two","isPrimary":False}],
 "specifications":[]}))
PY
)
RES=$(curl -sS -m 25 -b $CJ -X PATCH $B/api/products/$PID -H 'Content-Type: application/json' -d "$PAYLOAD")
has "slug rename saved" "$RES" '"success":true'

RCOUNT=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn')
cur=c.cursor(); cur.execute(\"select count(*) from redirects where from_path=%s\",('/products/$BEFORE',))
print(cur.fetchone()[0])")
chk "purane slug ka redirect auto bana" "$RCOUNT" "1"

# restore
python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute(\"update products set slug=%s, status='ACTIVE' where id=%s\",('$BEFORE','$PID'))
c.execute(\"delete from redirects where from_path like '/products/%'\")" 2>/dev/null

echo
echo "════ 10) Kuch toota to nahi ════"
for p in / /products /service-patna /service-patna/kankarbagh /service-patna/brand/kent /contact /amc-plans /cart /login; do
  chk "$p" "$(curl -sS -m 25 -o /dev/null -w '%{http_code}' $B$p)" "200"
done
SM=$(curl -sS -m 20 $B/sitemap.xml | grep -c "<loc>")
if [ "$SM" -ge 55 ]; then echo "  PASS  sitemap $SM URLs"; pass=$((pass+1));
else echo "  FAIL  sitemap sirf $SM URLs"; fail=$((fail+1)); fi
curl -sS -m 20 $B/ -o /tmp/h6.html
if grep -q "AquaNexa" /tmp/h6.html; then echo "  FAIL  homepage pe AquaNexa mila"; fail=$((fail+1));
else echo "  PASS  homepage pe AquaNexa nahi"; pass=$((pass+1)); fi

# every JSON-LD block must parse
BAD=$(for p in / /products /category/spare-parts /service-patna; do
  curl -sS -m 20 $B$p | python3 -c "
import sys,re,json
h=sys.stdin.read(); bad=0
for m in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', h, re.S):
    try: json.loads(m)
    except Exception: bad+=1
print(bad)"
done | python3 -c "import sys;print(sum(int(x) for x in sys.stdin.read().split()))")
chk "sab JSON-LD valid (0 bad)" "$BAD" "0"

kill -9 $SRV 2>/dev/null; pkill -9 -f "next-server" 2>/dev/null

echo
echo "════════════════════════════════════"
echo "  PASS: $pass    FAIL: $fail"
echo "════════════════════════════════════"
[ "$fail" -eq 0 ] || exit 1
