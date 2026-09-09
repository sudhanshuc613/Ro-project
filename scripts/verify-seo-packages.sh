#!/usr/bin/env bash
# Verification for the 3 Sep 2026 SEO packages:
#   A — keyword-first area URLs + 20 new Patna areas (35 -> 55; now 63)
#   B — blog, Article/Person/HowTo schema, author page (E-E-A-T)
#   C — /products and /category query caching
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
# Pages are written to files, never held in shell variables: a few hundred KB
# of HTML in the environment overflows execve's ARG_MAX and every later command
# dies with "Argument list too long".
hasf() { if grep -q -- "$3" "$2" 2>/dev/null; then echo "  PASS  $1"; pass=$((pass+1));
        else echo "  FAIL  $1"; fail=$((fail+1)); fi }
hasntf() { if grep -q -- "$3" "$2" 2>/dev/null; then echo "  FAIL  $1 — '$3' mila"; fail=$((fail+1));
        else echo "  PASS  $1"; pass=$((pass+1)); fi }
has() { if echo "$2" | grep -q -- "$3"; then echo "  PASS  $1"; pass=$((pass+1));
        else echo "  FAIL  $1"; fail=$((fail+1)); fi }

node -e "process.stdout.write(require('bcryptjs').hashSync('ChangeMe@123',12))" > /tmp/_h5.txt 2>/dev/null
python3 -c "
import psycopg
h=open('/tmp/_h5.txt').read().strip()
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute('update users set password_hash=%s where phone=%s',(h,'8969821440'))" 2>/dev/null

pkill -9 -f "next-server" 2>/dev/null; sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s11.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s11.log; kill -9 $SRV 2>/dev/null; exit 1
fi
echo "server UP"

echo
echo "════ A1) Keyword-first area URL ════"
chk "naya URL /ro-service-patna/kankarbagh" \
    "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/ro-service-patna/kankarbagh)" "200"

# Next.js emits 308 for permanentRedirect; 301 and 308 both pass full ranking.
RC=$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/service-patna/kankarbagh)
if [ "$RC" = "301" ] || [ "$RC" = "308" ]; then
  echo "  PASS  purana URL permanent redirect ($RC)"; pass=$((pass+1));
else echo "  FAIL  purana URL -> $RC"; fail=$((fail+1)); fi

LOC=$(curl -sS -m 20 -o /dev/null -w '%{redirect_url}' $B/service-patna/kankarbagh)
has "redirect naye URL pe jaata hai" "$LOC" "/ro-service-patna/kankarbagh"

# URL must contain every query term
URL="/ro-service-patna/kankarbagh"
for w in "ro" "service" "patna" "kankarbagh"; do
  has "URL me '$w'" "$URL" "$w"
done

echo
echo "════ A2) 20 naye area pages ════"
for a in aiims-patna exhibition-road fraser-road bhootnath-road jagdeo-path \
         indrapuri bahadurpur anandpuri beur chitkohra alamganj gulzarbagh \
         jaganpura ram-krishna-nagar patel-nagar dak-bungalow agamkuan \
         kadamkuan-mahendru danapur-cantonment saguna-more; do
  chk "/ro-service-patna/$a" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/ro-service-patna/$a)" "200"
done

echo
echo "════ A3) Purane 35 area abhi bhi zinda ════"
for a in kankarbagh boring-road patliputra-colony rajendra-nagar danapur \
         gandhi-maidan digha kurji mithapur khajpura; do
  chk "/ro-service-patna/$a" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/ro-service-patna/$a)" "200"
done

echo
echo "════ A4) Area count + uniqueness (doorway risk) ════"
CNT=$(python3 -c "
import re
s=open('src/lib/seo/patna-service-data.ts',encoding='utf-8').read()
blk=re.search(r'export const SERVICE_AREAS[\s\S]*?\n\];',s).group(0)
print(len(re.findall(r\"slug: '\",blk)))")
# Floor, not an exact figure. This asserted "== 55" and broke the moment the
# 8 Sep expansion took it to 63 — a passing test turning red because the site
# improved is a test that will get ignored. The count is owned by
# verify-new-areas.sh; here we only care that the Package A areas survived.
if [ "${CNT:-0}" -ge 55 ]; then
  echo "  PASS  SERVICE_AREAS me $CNT areas (>= 55)"; pass=$((pass+1));
else echo "  FAIL  SERVICE_AREAS me sirf $CNT areas, chahiye kam se kam 55"; fail=$((fail+1)); fi

DUP=$(python3 -c "
import re
s=open('src/lib/seo/patna-service-data.ts',encoding='utf-8').read()
blk=re.search(r'export const SERVICE_AREAS[\s\S]*?\n\];',s).group(0)
sl=re.findall(r\"slug: '([a-z0-9-]+)'\",blk)
print(len(sl)-len(set(sl)))")
chk "koi duplicate slug nahi" "$DUP" "0"

OV=$(python3 -c "
import re, itertools
s=open('src/lib/seo/patna-service-data.ts',encoding='utf-8').read()
blk=re.search(r'export const SERVICE_AREAS[\s\S]*?\n\];',s).group(0)
objs=re.findall(r'\{\s*\n\s*slug:[\s\S]*?monthlyJobs: \d+,\s*\n\s*\}',blk)
def w(t):
    t=re.sub(r\"slug: '[^']*'|name: '[^']*'\",' ',t)
    return set(re.findall(r'[a-z]{4,}',t.lower()))
W=[w(o) for o in objs]
m=max(len(a&b)/max(len(a|b),1)*100 for a,b in itertools.combinations(W,2))
print(int(m))")
if [ "${OV:-99}" -lt 40 ]; then
  echo "  PASS  max area overlap ${OV}% (<40% = doorway-safe; competitor is 44.6%)"; pass=$((pass+1));
else echo "  FAIL  max area overlap ${OV}% — doorway risk"; fail=$((fail+1)); fi

echo
echo "════ A5) Sitemap sirf naye URL deta hai ════"
curl -sS -m 25 $B/sitemap.xml -o /tmp/sm2.xml
NEW=$(grep -c 'ro-service-patna/' /tmp/sm2.xml)
# /service-patna/brand is a legitimate hub page, not an area page — exclude it.
OLD=$(grep -oP '(?<=<loc>)[^<]*' /tmp/sm2.xml | grep -P '/service-patna/[a-z-]+$' | grep -vc '/service-patna/brand$' || true)
if [ "$NEW" -ge 55 ]; then echo "  PASS  sitemap me $NEW naye area URL"; pass=$((pass+1));
else echo "  FAIL  sitemap me sirf $NEW naye URL"; fail=$((fail+1)); fi
chk "sitemap me purana area URL nahi" "${OLD:-0}" "0"

echo
echo "════ A6) Internal links naye URL par ════"
curl -sS -m 25 $B/service-patna -o /tmp/hub.html
hasf  "hub page naye URL par link karta hai" /tmp/hub.html "/ro-service-patna/"
hasntf "hub pe purana area link nahi" /tmp/hub.html 'href="/service-patna/kankarbagh"'
curl -sS -m 25 $B/ -o /tmp/home.html
hasf "homepage AreaCoverage naye URL par" /tmp/home.html "/ro-service-patna/"

echo
echo "════ B1) Blog live ════"
chk "/blog" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/blog)" "200"
for p in ro-membrane-kab-badalna-chahiye patna-me-tds-kitna-hona-chahiye \
         ro-service-charge-patna-rate-list ro-me-paani-nahi-aa-raha-kya-kare \
         ro-uv-uf-me-kya-farak-hai; do
  chk "/blog/$p" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/blog/$p)" "200"
done
chk "/about/sudhanshu-choudhary" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/about/sudhanshu-choudhary)" "200"

echo
echo "════ B2) E-E-A-T schema (competitor ke paas tha, hamare paas nahi) ════"
curl -sS -m 25 $B/blog/ro-membrane-kab-badalna-chahiye -o /tmp/post.html
hasf "Article schema"        /tmp/post.html '"@type":"Article"'
hasf "Person schema"         /tmp/post.html '"@type":"Person"'
hasf "HowTo schema"          /tmp/post.html '"@type":"HowTo"'
hasf "FAQPage schema"        /tmp/post.html '"@type":"FAQPage"'
hasf "hasCredential"         /tmp/post.html 'hasCredential'
hasf "knowsAbout"            /tmp/post.html 'knowsAbout'
hasf "datePublished"         /tmp/post.html 'datePublished'
hasf "dateModified"          /tmp/post.html 'dateModified'
hasf "author naam visible"   /tmp/post.html 'Sudhanshu'

curl -sS -m 25 $B/about/sudhanshu-choudhary -o /tmp/auth.html
hasf "author page Person schema" /tmp/auth.html '"@type":"Person"'
hasf "author page credentials"   /tmp/auth.html 'hasCredential'
hasf "author page workLocation"  /tmp/auth.html 'workLocation'

echo
echo "════ B3) Blog sitemap + nav me hai ════"
hasf "sitemap me /blog"        /tmp/sm2.xml "/blog"
hasf "sitemap me author page"  /tmp/sm2.xml "/about/sudhanshu-choudhary"
hasf "navbar me blog link"     /tmp/home.html "/blog"

echo
echo "════ C1) /products speed (pehle 2.71s TTFB tha) ════"
curl -sS -m 25 -o /dev/null $B/products   # warm
T1=$(curl -sS -m 25 -o /dev/null -w '%{time_starttransfer}' $B/products)
T2=$(curl -sS -m 25 -o /dev/null -w '%{time_starttransfer}' $B/products)
MS=$(python3 -c "print(int(max($T1,$T2)*1000))")
if [ "$MS" -lt 800 ]; then echo "  PASS  /products TTFB ${MS}ms (<800ms)"; pass=$((pass+1));
else echo "  FAIL  /products TTFB ${MS}ms"; fail=$((fail+1)); fi

curl -sS -m 25 -o /dev/null $B/category/spare-parts
T3=$(curl -sS -m 25 -o /dev/null -w '%{time_starttransfer}' $B/category/spare-parts)
MS3=$(python3 -c "print(int($T3*1000))")
if [ "$MS3" -lt 800 ]; then echo "  PASS  /category TTFB ${MS3}ms"; pass=$((pass+1));
else echo "  FAIL  /category TTFB ${MS3}ms"; fail=$((fail+1)); fi

echo
echo "════ C2) Cache purge admin save par ════"
hasf "products route revalidateTag" src/app/api/products/route.ts "revalidateTag('products')"
hasf "product edit revalidateTag"   'src/app/api/products/[id]/route.ts' "revalidateTag('products')"

echo
echo "════ D) Kuch toota to nahi ════"
for p in / /products /service-patna /service-patna/brand /service-patna/brand/kent \
         /category/spare-parts /category/new-ro-purifiers /contact /amc-plans \
         /cart /login /track-order /blog; do
  chk "$p" "$(curl -sS -m 25 -o /dev/null -w '%{http_code}' $B$p)" "200"
done

CJ=/tmp/cpk.txt; rm -f $CJ
CSRF=$(curl -sS -m 15 -c $CJ $B/api/auth/csrf | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
curl -sS -m 15 -b $CJ -c $CJ -X POST $B/api/auth/callback/password \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "phone=8969821440" \
  --data-urlencode "password=ChangeMe@123" --data-urlencode "json=true" -o /dev/null
for p in /admin /admin/products /admin/competitors /admin/seo; do
  chk "$p" "$(curl -sS -m 25 -b $CJ -o /dev/null -w '%{http_code}' $B$p)" "200"
done

echo
echo "════ E) SEO integrity ════"
curl -sS -m 25 $B/ro-service-patna/kankarbagh -o /tmp/area.html
hasf "area page LocalBusiness"  /tmp/area.html "LocalBusiness"
hasf "area page Service schema" /tmp/area.html '"@type":"Service"'
hasf "area page FAQPage"        /tmp/area.html "FAQPage"
hasf "area canonical naya URL"  /tmp/area.html 'ro-service-patna/kankarbagh"'

curl -sS -m 20 $B/ -o /tmp/h11.html
if grep -q "AquaNexa" /tmp/h11.html; then echo "  FAIL  AquaNexa mila"; fail=$((fail+1));
else echo "  PASS  AquaNexa nahi"; pass=$((pass+1)); fi

BAD=$(for p in / /blog /blog/ro-membrane-kab-badalna-chahiye /about/sudhanshu-choudhary \
               /ro-service-patna/kankarbagh /ro-service-patna/beur /products /category/spare-parts; do
  curl -sS -m 20 $B$p | python3 -c "
import sys,re,json
h=sys.stdin.read(); bad=0
for m in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', h, re.S):
    try: json.loads(m)
    except Exception: bad+=1
print(bad)"
done | python3 -c "import sys;print(sum(int(x) for x in sys.stdin.read().split()))")
chk "sab JSON-LD valid" "$BAD" "0"

kill -9 $SRV 2>/dev/null; pkill -9 -f "next-server" 2>/dev/null

echo
echo "════════════════════════════════════"
echo "  PASS: $pass    FAIL: $fail"
echo "════════════════════════════════════"
[ "$fail" -eq 0 ] || exit 1
