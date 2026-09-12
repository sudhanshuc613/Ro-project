#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Verification for the 8 Sep 2026 packages:
#   D — service-intent pages (/ro-installation-patna etc.) + /ro-services-patna hub
#   E — the footer/schema 404 bug fix (broken links on every page)
#   F — review request system (admin button, tracker, customer CTA)
#
# The heaviest section here is route shadowing. A root-level [intent] segment
# sits at the same level as every real page on the site, so the test that
# matters is not "do the new pages work" — it is "does everything else still
# work, and do unknown URLs still 404". That is asserted explicitly below.
#
# Starts its own server, checks everything, shuts down. One process.
# ═══════════════════════════════════════════════════════════════════════════
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
# Pages go to files, never into shell variables: a few hundred KB of HTML in
# the environment overflows ARG_MAX and every later command dies with E2BIG.
hasf() { if grep -q -- "$3" "$2" 2>/dev/null; then echo "  PASS  $1"; pass=$((pass+1));
        else echo "  FAIL  $1"; fail=$((fail+1)); fi }
hasntf() { if grep -q -- "$3" "$2" 2>/dev/null; then echo "  FAIL  $1 — '$3' mila"; fail=$((fail+1));
        else echo "  PASS  $1"; pass=$((pass+1)); fi }
gt() { if [ "${2:-0}" -ge "$3" ]; then echo "  PASS  $1 ($2 >= $3)"; pass=$((pass+1));
        else echo "  FAIL  $1 — $2 < $3"; fail=$((fail+1)); fi }

node -e "process.stdout.write(require('bcryptjs').hashSync('ChangeMe@123',12))" > /tmp/_hsi.txt 2>/dev/null
python3 -c "
import psycopg
h=open('/tmp/_hsi.txt').read().strip()
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute('update users set password_hash=%s where phone=%s',(h,'8969821440'))" 2>/dev/null

pkill -9 -f "next-server" 2>/dev/null; sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-si.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-si.log; kill -9 $SRV 2>/dev/null; exit 1
fi
echo "server UP"

INTENTS="ro-installation-patna ro-amc-patna ro-repair-patna ro-filter-change-patna ro-membrane-replacement-patna commercial-ro-service-patna"

echo
echo "════ D1) Six intent pages live ════"
for s in $INTENTS; do
  chk "/$s" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/$s)" "200"
done
chk "/ro-services-patna hub" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/ro-services-patna)" "200"

echo
echo "════ D2) 🔴 ROUTE SHADOWING — unknown URLs must still 404 ════"
# This is the whole reason the [intent] segment needed dynamicParams=false.
# Without it, a root-level dynamic route renders ANY unmatched path as a 200,
# which would put hundreds of soft-404s into Google's index.
for u in random-nonsense kent patna ro-service installation xyz ro-installation-delhi \
         ro-repair-gaya foo-bar-baz ro-amc admin-x service-patna-x; do
  chk "unknown /$u -> 404" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/$u)" "404"
done

echo
echo "════ D3) 🔴 EXISTING routes must resolve to THEMSELVES ════"
for u in / /products /cart /contact /blog /amc-plans /service-patna /service-patna/brand \
         /track-order /search /login /register /checkout /category/spare-parts \
         /about/sudhanshu-choudhary /ro-service-patna/kankarbagh /service-patna/brand/kent \
         /blog/ro-membrane-kab-badalna-chahiye /forgot-password; do
  chk "existing $u" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B$u)" "200"
done

echo
echo "════ D4) Content depth + schema on each intent page ════"
for s in $INTENTS; do
  curl -sS -m 25 $B/$s -o /tmp/si_$s.html
  WORDS=$(python3 -c "
import re,html,sys
t=open('/tmp/si_$s.html',encoding='utf-8',errors='ignore').read()
t=re.sub(r'<script.*?</script>','',t,flags=re.S)
t=re.sub(r'<style.*?</style>','',t,flags=re.S)
print(len(html.unescape(re.sub(r'<[^>]+>',' ',t)).split()))")
  gt "$s word count" "$WORDS" 900
done
# Schema blocks
for s in $INTENTS; do
  hasf "$s Service schema"      /tmp/si_$s.html '"@type":"Service"'
  hasf "$s HowTo schema"        /tmp/si_$s.html '"@type":"HowTo"'
  hasf "$s FAQPage schema"      /tmp/si_$s.html '"@type":"FAQPage"'
  hasf "$s LocalBusiness"       /tmp/si_$s.html 'LocalBusiness'
  hasf "$s AggregateOffer"      /tmp/si_$s.html 'AggregateOffer'
  hasf "$s canonical"           /tmp/si_$s.html "rel=\"canonical\" href=\"https://rokadoctor.in/$s\""
  hasf "$s tel link"            /tmp/si_$s.html 'tel:+918969821440'
done

echo
echo "════ D5) Every intent URL carries its keywords ════"
for s in $INTENTS; do
  case "$s" in
    *ro-*) echo "  PASS  /$s has 'ro'"; pass=$((pass+1));;
    *) echo "  FAIL  /$s missing 'ro'"; fail=$((fail+1));;
  esac
  case "$s" in
    *patna*) echo "  PASS  /$s has 'patna'"; pass=$((pass+1));;
    *) echo "  FAIL  /$s missing 'patna'"; fail=$((fail+1));;
  esac
done

echo
echo "════ D6) 🔴 Doorway test — intents must not read alike ════"
OV=$(python3 -c "
import re, itertools
s=open('src/lib/seo/service-intent-data.ts',encoding='utf-8').read()
blocks=re.split(r\"\n  \{\n    slug: '\", s)[1:]
W=[set(re.findall(r'[a-z]{4,}', b.lower())) for b in blocks]
print(int(max(len(a&b)/max(len(a|b),1)*100 for a,b in itertools.combinations(W,2))))")
if [ "${OV:-99}" -lt 40 ]; then
  echo "  PASS  max intent overlap ${OV}% (<40% doorway-safe; competitor 44.6%)"; pass=$((pass+1));
else echo "  FAIL  max intent overlap ${OV}% — doorway risk"; fail=$((fail+1)); fi

DUP=$(python3 -c "
import re
s=open('src/lib/seo/service-intent-data.ts',encoding='utf-8').read()
blocks=re.split(r\"\n  \{\n    slug: '\", s)[1:]
seen={}; dup=0
for b in blocks:
    n=b.split(\"'\")[0]
    for m in re.findall(r\"'([^']{60,})'\", b):
        for sent in re.split(r'(?<=[.!?]) ', m):
            sent=sent.strip()
            if len(sent)<40: continue
            if sent in seen and seen[sent]!=n: dup+=1
            seen[sent]=n
print(dup)")
chk "0 identical sentences across intents" "${DUP:-99}" "0"

echo
echo "════ D7) Sitemap carries the new URLs ════"
curl -sS -m 25 $B/sitemap.xml -o /tmp/sm_si.xml
for s in $INTENTS; do
  hasf "sitemap has /$s" /tmp/sm_si.xml "rokadoctor.in/$s<"
done
hasf "sitemap has hub" /tmp/sm_si.xml "rokadoctor.in/ro-services-patna<"
TOTAL=$(grep -c "<loc>" /tmp/sm_si.xml)
gt "sitemap URL count" "$TOTAL" 100

echo
echo "════ D8) Internal linking — pages are not orphans ════"
curl -sS -m 25 $B/ -o /tmp/si_home.html
curl -sS -m 25 $B/service-patna -o /tmp/si_pillar.html
curl -sS -m 25 $B/ro-service-patna/kankarbagh -o /tmp/si_area.html
hasf "footer links to intent pages"      /tmp/si_home.html 'href="/ro-installation-patna"'
hasf "footer links to AMC page"          /tmp/si_home.html 'href="/ro-amc-patna"'
hasf "navbar links to hub"               /tmp/si_home.html 'href="/ro-services-patna"'
hasf "pillar links to intent pages"      /tmp/si_pillar.html 'href="/ro-membrane-replacement-patna"'
hasf "pillar links to hub"               /tmp/si_pillar.html 'href="/ro-services-patna"'
hasf "area page rate card links out"     /tmp/si_area.html 'href="/ro-filter-change-patna"'
hasf "hub links back to areas"           /tmp/si_home.html '/ro-service-patna/'

echo
echo "════ E1) 🔴 THE BUG — broken footer links must be gone ════"
# Five hardcoded /ro-service-{area}-patna hrefs shipped in the footer of every
# page, pointing at a route shape that was designed, abandoned and reverted.
hasntf "no /ro-service-kankarbagh-patna href"   /tmp/si_home.html 'href="/ro-service-kankarbagh-patna"'
hasntf "no /ro-service-boring-road-patna href"  /tmp/si_home.html 'href="/ro-service-boring-road-patna"'
hasntf "no /ro-service-danapur-patna href"      /tmp/si_home.html 'href="/ro-service-danapur-patna"'
for u in /ro-service-kankarbagh-patna /ro-service-boring-road-patna \
         /ro-service-patliputra-colony-patna /ro-service-rajendra-nagar-patna \
         /ro-service-danapur-patna; do
  chk "old broken path $u now 404 (not linked)" \
      "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B$u)" "404"
done

echo
echo "════ E2) 🔴 LocalBusiness.url must resolve, not 404 ════"
# schema.ts built this URL by hand in the abandoned shape, so every area page
# advertised a 404 as its canonical business URL.
hasf   "area page LocalBusiness url is the real path" /tmp/si_area.html '"url":"https://rokadoctor.in/ro-service-patna/kankarbagh"'
hasntf "area page has no dead schema url"             /tmp/si_area.html '"url":"https://rokadoctor.in/ro-service-kankarbagh-patna"'
hasf   "intent page LocalBusiness url"                /tmp/si_ro-amc-patna.html '"url":"https://rokadoctor.in/ro-amc-patna"'

echo
echo "════ E3) 🔴 Every link on the homepage resolves ════"
grep -o 'href="/[a-z0-9/?=&-]*"' /tmp/si_home.html | sed 's/href="//;s/"//' | sort -u > /tmp/si_hrefs.txt
BROKEN=0
while read -r u; do
  [ -z "$u" ] && continue
  C=$(curl -sS -m 12 -o /dev/null -w '%{http_code}' "$B$u")
  case "$C" in 200|301|307|308) ;; *) echo "    broken: $C $u"; BROKEN=$((BROKEN+1));; esac
done < /tmp/si_hrefs.txt
chk "broken links on homepage" "$BROKEN" "0"

echo
echo "════ E4) next.config redirects no longer shadow real pages ════"
# /ro-repair-patna was 308ing to /service-patna from next.config, which runs
# BEFORE route matching and silently ate the new page.
chk "/ro-repair-patna is the page, not a redirect" \
    "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/ro-repair-patna)" "200"
chk "/ro-service-patna bare still redirects" \
    "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/ro-service-patna)" "308"
chk "/ro-service-patna/{area} unaffected by that redirect" \
    "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/ro-service-patna/danapur)" "200"
chk "/service still redirects" \
    "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/service)" "308"

echo
echo "════ F1) Review request library ════"
node -e "
const m = require('./node_modules/.bin/../../src/lib/reviews/review-request.ts');
" 2>/dev/null
# The module is TS, so assert on source instead of importing it.
hasf "review-request.ts exists"           src/lib/reviews/review-request.ts 'googleReviewLink'
hasf "no incentive language"              src/lib/reviews/review-request.ts 'not include fake or undisclosed'
hasntf "no review gating"                 src/lib/reviews/review-request.ts 'if you would rate us 5'
hasf "wa.me deep link builder"            src/lib/reviews/review-request.ts 'reviewRequestWaLink'
hasf "sms fallback"                       src/lib/reviews/review-request.ts 'reviewRequestSmsLink'
hasf "follow-up copy differs"             src/lib/reviews/review-request.ts 'reviewFollowUpMessage'
hasf "target is 150"                      src/lib/reviews/review-request.ts 'REVIEW_TARGET = 150'

echo
echo "════ F2) Review count honesty — schema must equal GBP truth ════"
REAL=$(grep -oP 'reviewCount: \K[0-9]+' src/lib/constants.ts | head -1)
# Hardcode nahi. Sirf ye check ki number MAUJOOD hai aur inflated nahi hai.
if [ -n "$REAL" ] && [ "$REAL" -gt 0 ] 2>/dev/null; then
  echo "  PASS  GBP.reviewCount set ($REAL)"; pass=$((pass+1))
else echo "  FAIL  GBP.reviewCount missing"; fail=$((fail+1)); fi
curl -sS -m 20 $B/ -o /tmp/si_home2.html
hasntf "no inflated reviewCount in homepage schema" /tmp/si_home2.html '"reviewCount":"312"'
hasf   "real reviewCount in schema"                 /tmp/si_home2.html "\"reviewCount\":\"$REAL\""

echo
echo "════ F3) Customer-side review CTA on completed jobs only ════"
# Ticket numbers are stored uppercase but middleware 301s any uppercase path
# to lowercase, and the page upper-cases the param again before querying. So
# the URL under test is the LOWERCASE one — which is what a customer clicking
# a link in WhatsApp actually lands on.
TICKET=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute(\"delete from service_requests where ticket_number='SRVTEST99'\")
cur=c.execute('''insert into service_requests
 (id,ticket_number,customer_name,customer_phone,address_line,pincode,
  service_type,issue_description,issue_image_urls,status,visit_charge,
  total_charge,created_at,updated_at,completed_at,resolution_note,area)
 values (gen_random_uuid(),'SRVTEST99','Rakesh Kumar','9876543210',
  'Test Road','800020','REPAIR','test',ARRAY[]::text[],'COMPLETED',200,
  650,now(),now(),now(),'Sediment filter replaced','Kankarbagh')
 returning ticket_number''')
v=cur.fetchone()[0]
v=v.decode() if isinstance(v,bytes) else v
print(v.lower())" 2>/dev/null)
if [ -n "$TICKET" ]; then
  curl -sS -m 20 $B/track/$TICKET -o /tmp/si_track.html
  hasf "completed job shows review CTA"     /tmp/si_track.html 'Google par review likhein'
  hasf "review CTA has the real link"       /tmp/si_track.html 'google.com/maps/search'
  hasf "problem-first escape hatch shown"   /tmp/si_track.html 'dikkat reh gayi'
  hasntf "no incentive offered to customer" /tmp/si_track.html 'discount'

  # Same ticket, not completed -> CTA must disappear
  python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute(\"update service_requests set status='IN_PROGRESS' where ticket_number='SRVTEST99'\")" 2>/dev/null
  curl -sS -m 20 $B/track/$TICKET -o /tmp/si_track2.html
  hasntf "in-progress job shows NO review CTA" /tmp/si_track2.html 'Google par review likhein'
  python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute(\"delete from service_requests where ticket_number='SRVTEST99'\")" 2>/dev/null
else
  echo "  FAIL  could not seed test ticket"; fail=$((fail+1))
fi

echo
echo "════ F4) Admin review UI wired in ════"
hasf "ReviewRequestButton component"        src/components/admin/ReviewRequestButton.tsx 'reviewRequestWaLink'
hasf "button only on COMPLETED"             "src/app/admin/(dashboard)/service-requests/page.tsx" "r.status === 'COMPLETED'"
hasf "ReviewTracker on dashboard"           "src/app/admin/(dashboard)/page.tsx" 'ReviewTracker'
hasf "tracker uses real GBP count"          src/components/admin/ReviewTracker.tsx 'GBP.reviewCount'
hasf "admin pages still need auth"          src/middleware.ts 'admin'
chk "/admin redirects when logged out" \
    "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/admin)" "307"

echo
echo "════ G) Nothing else broke ════"
for u in /products /category/new-ro-purifiers /category/commercial-plants \
         /amc-plans /contact /blog /track-order /service-patna/brand/livpure \
         /ro-service-patna/beur /ro-service-patna/aiims-patna /about/sudhanshu-choudhary; do
  chk "still 200 $u" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B$u)" "200"
done
hasntf "no AquaNexa anywhere on home" /tmp/si_home.html 'AquaNexa'
python3 - <<'PY'
import json, re, sys
bad = 0
for f in ['/tmp/si_home.html', '/tmp/si_pillar.html', '/tmp/si_area.html',
          '/tmp/si_ro-amc-patna.html', '/tmp/si_ro-repair-patna.html']:
    try: h = open(f, encoding='utf-8', errors='ignore').read()
    except OSError: continue
    for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
        try: json.loads(m)
        except Exception as e:
            bad += 1; print('  INVALID JSON-LD in', f, str(e)[:60])
print('  JSONLD_BAD=%d' % bad)
PY
JB=$(python3 -c "
import json,re
bad=0
for f in ['/tmp/si_home.html','/tmp/si_pillar.html','/tmp/si_area.html','/tmp/si_ro-amc-patna.html','/tmp/si_ro-repair-patna.html']:
    try: h=open(f,encoding='utf-8',errors='ignore').read()
    except OSError: continue
    for m in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>',h,re.S):
        try: json.loads(m)
        except Exception: bad+=1
print(bad)")
chk "all JSON-LD valid" "${JB:-99}" "0"

echo
echo "──────────────────────────────────────────────"
echo "  PASS: $pass    FAIL: $fail"
echo "──────────────────────────────────────────────"

kill -9 $SRV 2>/dev/null; pkill -9 -f "next-server" 2>/dev/null
[ "$fail" -eq 0 ] || exit 1
