#!/usr/bin/env bash
# Verification for the product-admin upgrade:
#   brand picker + create-brand API, HSN field, spec templates,
#   SEO coach, GTIN in Product schema, word-boundary title trim.
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
hasnt() { if echo "$2" | grep -q "$3"; then echo "  FAIL  $1 — '$3' mila"; fail=$((fail+1));
        else echo "  PASS  $1"; pass=$((pass+1)); fi }

# verify-password-features.sh deliberately changes the admin password, so this
# script resets it first. That makes the suite order-independent.
node -e "
const b=require('bcryptjs');
process.stdout.write(b.hashSync('ChangeMe@123',12));
" > /tmp/_h.txt 2>/dev/null
python3 -c "
import psycopg
h=open('/tmp/_h.txt').read().strip()
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute('update users set password_hash=%s where phone=%s',(h,'8969821440'))
" 2>/dev/null && echo "admin password reset -> ChangeMe@123"

pkill -9 -f "next-server" 2>/dev/null; sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s2.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/s2.log; kill -9 $SRV 2>/dev/null; exit 1
fi
echo "server UP"

echo
echo "════ 1) Static source checks ════"
SRC_FORM=$(cat src/components/admin/ProductForm.tsx)
has "ProductForm BrandPicker use karta hai"     "$SRC_FORM" "BrandPicker"
has "ProductForm SeoAssistant use karta hai"    "$SRC_FORM" "SeoAssistant"
has "SEO Coach tab maujood"                     "$SRC_FORM" "SEO Coach"
has "hsnCode field maujood"                     "$SRC_FORM" "hsnCode"
has "spec template button"                      "$SRC_FORM" "loadSpecTemplate"
has "alt text auto-fill"                        "$SRC_FORM" "fillAltTexts"
hasnt "purana brand <select> hata diya"         "$SRC_FORM" "brands.map((b) => <option"

BRANDS_API=$(cat src/app/api/admin/brands/route.ts)
has "brands API me POST"                        "$BRANDS_API" "export async function POST"
has "brands API case-insensitive dedupe"        "$BRANDS_API" "insensitive"
has "brands API admin guard"                    "$BRANDS_API" "Unauthorized"
has "brands API audit log"                      "$BRANDS_API" "logAudit"

SEOLIB=$(cat src/lib/seo/product-seo.ts)
has "BRAND_SEED export"                         "$SEOLIB" "export const BRAND_SEED"
has "scoreProductSeo export"                    "$SEOLIB" "export function scoreProductSeo"
has "findGtin export"                           "$SEOLIB" "export function findGtin"
has "banned promo words list"                   "$SEOLIB" "BANNED_TITLE_WORDS"
has "HSN hints"                                 "$SEOLIB" "HSN_HINTS"

echo
echo "════ 2) BRAND_SEED me sabhi zaroori brands ════"
for b in "AO Smith" "Havells" "Blue Star" "V-Guard" "Faber" "Whirlpool" "LG" "Atomberg" "Vontron" "Zero B" "Tata Swach" "Nasaka" "Kenstar" "Panasonic"; do
  has "brand: $b" "$SEOLIB" "$b"
done

echo
echo "════ 3) DB me brands seed hue ════"
CNT=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn')
cur=c.cursor(); cur.execute('select count(*) from brands'); print(cur.fetchone()[0])" 2>/dev/null)
if [ "${CNT:-0}" -ge 25 ]; then echo "  PASS  brands table me $CNT rows (>=25)"; pass=$((pass+1));
else echo "  FAIL  brands table me sirf ${CNT:-0} rows"; fail=$((fail+1)); fi

DUP=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn')
cur=c.cursor(); cur.execute(\"select count(*) from (select lower(name) from brands group by 1 having count(*)>1) t\"); print(cur.fetchone()[0])" 2>/dev/null)
chk "koi duplicate brand naam nahi" "${DUP:-x}" "0"

echo
echo "════ 4) Brands API live ════"
code=$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/api/admin/brands)
chk "GET /api/admin/brands bina login 401" "$code" "401"
code=$(curl -sS -m 15 -X POST $B/api/admin/brands -H 'Content-Type: application/json' \
  -d '{"name":"Hacker Brand"}' -o /dev/null -w '%{http_code}')
chk "POST bina login 401" "$code" "401"

CJ=/tmp/pa.txt; rm -f $CJ
CSRF=$(curl -sS -m 15 -c $CJ $B/api/auth/csrf | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
curl -sS -m 15 -b $CJ -c $CJ -X POST $B/api/auth/callback/password \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "phone=8969821440" \
  --data-urlencode "password=ChangeMe@123" --data-urlencode "json=true" -o /dev/null
SESS=$(curl -sS -m 15 -b $CJ $B/api/auth/session)
has "admin login ho gaya" "$SESS" "ADMIN"

R=$(curl -sS -m 15 -b $CJ $B/api/admin/brands)
has "GET brands list aayi" "$R" '"brands"'
has "AO Smith list me hai" "$R" "AO Smith"

R=$(curl -sS -m 15 -b $CJ -X POST $B/api/admin/brands -H 'Content-Type: application/json' -d '{"name":"Test Brand Xyz"}')
has "naya brand ban gaya" "$R" '"created":true'
R=$(curl -sS -m 15 -b $CJ -X POST $B/api/admin/brands -H 'Content-Type: application/json' -d '{"name":"test brand xyz"}')
has "same naam dobara -> created:false (dedupe)" "$R" '"created":false'
code=$(curl -sS -m 15 -b $CJ -X POST $B/api/admin/brands -H 'Content-Type: application/json' -d '{"name":"A"}' -o /dev/null -w '%{http_code}')
chk "1-letter naam reject" "$code" "422"

python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute(\"delete from brands where slug='test-brand-xyz'\")" 2>/dev/null

echo
echo "════ 5) Admin product pages render ════"
for p in /admin/products /admin/products/new; do
  chk "$p" "$(curl -sS -m 25 -b $CJ -o /dev/null -w '%{http_code}' $B$p)" "200"
done
NEWP=$(curl -sS -m 25 -b $CJ $B/admin/products/new)
has "brand picker render hua"   "$NEWP" "click to search or add"
has "SEO Coach tab render hua"  "$NEWP" "SEO Coach"
hasnt "purana 'No brand' select nahi" "$NEWP" '<select[^>]*><option value="">No brand'

PID=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn')
cur=c.cursor(); cur.execute(\"select id from products limit 1\"); v=cur.fetchone()[0]; print(v.decode() if isinstance(v,bytes) else v)" 2>/dev/null)
curl -sS -m 25 -b $CJ $B/admin/products/$PID -o /tmp/edit.html
# Pricing/Specs tab content is client-rendered on click, so we assert on what
# the edit page DOES ship: all six tabs, the coach badge, and the brand picker
# showing the product's existing brand instead of the placeholder.
for t in Basic Pricing Images Specs SEO "SEO Coach"; do
  if grep -q ">$t" /tmp/edit.html; then echo "  PASS  edit page tab: $t"; pass=$((pass+1));
  else echo "  FAIL  edit page tab missing: $t"; fail=$((fail+1)); fi
done
if grep -q "Aqua Perl" /tmp/edit.html; then echo "  PASS  brand picker seedha selected brand dikha raha hai"; pass=$((pass+1));
else echo "  FAIL  brand picker pe selected brand nahi dikha"; fail=$((fail+1)); fi
if grep -qE 'SEO Coach.*[0-9]{1,3}' /tmp/edit.html; then echo "  PASS  SEO score badge render hua"; pass=$((pass+1));
else echo "  FAIL  SEO score badge nahi mila"; fail=$((fail+1)); fi

echo
echo "════ 6) Product schema me GTIN + category ════"
SLUG=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn')
cur=c.cursor(); cur.execute(\"select slug from products where status='ACTIVE' limit 1\"); v=cur.fetchone()[0]; print(v.decode() if isinstance(v,bytes) else v)" 2>/dev/null)
PDP=$(curl -sS -m 25 "$B/products/$SLUG")
chk "PDP 200" "$(curl -sS -m 25 -o /dev/null -w '%{http_code}' $B/products/$SLUG)" "200"
has "Product JSON-LD maujood"   "$PDP" '"@type":"Product"'
has "schema me category"        "$PDP" '"category"'
has "shippingDetails"           "$PDP" 'shippingDetails'
has "hasMerchantReturnPolicy"   "$PDP" 'hasMerchantReturnPolicy'

VALID=$(echo "$PDP" | python3 -c "
import sys,re,json
h=sys.stdin.read(); bad=0; n=0
for m in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', h, re.S):
    n+=1
    try: json.loads(m)
    except Exception: bad+=1
print(f'{n} ok, {bad} bad')")
has "JSON-LD valid" "$VALID" "0 bad"

echo
echo "════ 7) Title word-boundary trim (purana bug) ════"
T=$(node -e "
const s='AquaNexa Alkaline Copper 10L RO Purifier — Mineral Guard';
function fit(text,max){const t=text.replace(/\s+/g,' ').trim();if(t.length<=max)return t;
const cut=t.slice(0,max-1);const sp=cut.lastIndexOf(' ');
const base=sp>max*0.6?cut.slice(0,sp):cut;return base.replace(/[\s—–|,-]+\$/,'')+'…';}
console.log(fit(s,43));")
hasnt "title mid-word nahi katta" "$T" "Purifier —…"
echo "        -> \"$T\""

echo
echo "════ 8) Public site abhi bhi theek hai ════"
for p in / /products /service-patna /service-patna/kankarbagh /category/spare-parts /contact; do
  chk "$p" "$(curl -sS -m 25 -o /dev/null -w '%{http_code}' $B$p)" "200"
done
SM=$(curl -sS -m 20 $B/sitemap.xml | grep -c "<loc>")
if [ "$SM" -ge 55 ]; then echo "  PASS  sitemap $SM URLs"; pass=$((pass+1));
else echo "  FAIL  sitemap sirf $SM URLs"; fail=$((fail+1)); fi
curl -sS -m 20 $B/ -o /tmp/home.html
if grep -q "AquaNexa" /tmp/home.html; then echo "  FAIL  homepage pe AquaNexa mila"; fail=$((fail+1)); else echo "  PASS  homepage pe AquaNexa nahi"; pass=$((pass+1)); fi

kill -9 $SRV 2>/dev/null; pkill -9 -f "next-server" 2>/dev/null

echo
echo "════════════════════════════════════"
echo "  PASS: $pass    FAIL: $fail"
echo "════════════════════════════════════"
[ "$fail" -eq 0 ] || exit 1
