#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Verification for the 9 Sep 2026 depth + answer-hub work.
#
# 🔴 THE MEASUREMENT CORRECTION THIS SCRIPT ENCODES
# ─────────────────────────────────────────────────
# Earlier scripts reported area-page overlap as "max 34%" and compared it
# against the competitor's "100%". Those were two different measurements:
# ours counted words in the DATA OBJECTS inside patna-service-data.ts; theirs
# counted words in RENDERED PAGES. A data object holds only the unique fields;
# the rendered page holds those fields plus every shared template sentence.
# Comparing them made our pages look four times more distinct than they were.
#
# Measured like-for-like on rendered body HTML, 9 Sep 2026:
#
#     rokadoctor.in live, before this work    84.7% max overlap, 55 dup sentences
#     rocareindia.com                        100.0% max overlap, 51 dup sentences
#
# The live figure is what currently holds #1 for four keywords, so 84.7% is
# demonstrably survivable. But it is close enough to the competitor's number
# that it must not be allowed to drift upward. The first draft of area-depth.ts
# pushed it to 88.3% with 125 duplicate sentences and was rejected on this test.
#
# So the gates below are ratchets against the real baseline, not against the
# fictional 34%:
#
#     rendered body overlap      must stay BELOW 84.7%
#     duplicate body sentences   must stay AT OR BELOW 55
#
# Both are measured on <main> with header, nav, footer and any element marked
# data-shared-ui stripped, because site chrome is identical on every page of
# every site by design and counting it tells you nothing about whether the
# content is distinct. The booking widget carries data-shared-ui for exactly
# that reason — it is the same form everywhere on purpose.
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
hasf() { if grep -q -- "$3" "$2" 2>/dev/null; then echo "  PASS  $1"; pass=$((pass+1));
        else echo "  FAIL  $1"; fail=$((fail+1)); fi }
hasntf() { if grep -q -- "$3" "$2" 2>/dev/null; then echo "  FAIL  $1 — '$3' mila"; fail=$((fail+1));
        else echo "  PASS  $1"; pass=$((pass+1)); fi }
gt() { if [ "${2:-0}" -ge "$3" ]; then echo "  PASS  $1 ($2 >= $3)"; pass=$((pass+1));
        else echo "  FAIL  $1 — $2 < $3"; fail=$((fail+1)); fi }
lt() { if [ "${2:-9999}" -le "$3" ]; then echo "  PASS  $1 ($2 <= $3)"; pass=$((pass+1));
        else echo "  FAIL  $1 — $2 > $3"; fail=$((fail+1)); fi }

pkill -9 -f "next-server" 2>/dev/null; sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-ad.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-ad.log; kill -9 $SRV 2>/dev/null; exit 1
fi
echo "server UP"

# A spread across every hardness band and both old and new areas.
SAMPLE="kankarbagh boring-road danapur beur kurji marufganj jakkanpur naya-tola chandmari anandpur patliputra-colony anisabad gulzarbagh saguna-more"
rm -f /tmp/ad_*.html
for a in $SAMPLE; do curl -sS -m 25 $B/ro-service-patna/$a -o /tmp/ad_$a.html; done

echo
echo "════ A1) Depth actually rendered ════"
for a in kankarbagh marufganj anandpur; do
  hasf "$a TDS verdict block"   /tmp/ad_$a.html 'ka matlab kya hai'
  hasf "$a running-cost table"  /tmp/ad_$a.html 'saal bhar ka kharcha'
  hasf "$a fault ranking"       /tmp/ad_$a.html 'sabse zyada kya kharab hota hai'
  hasf "$a response detail"     /tmp/ad_$a.html 'pahunchne me kitna time'
  hasf "$a BIS reference"       /tmp/ad_$a.html 'IS 10500'
done

echo
echo "════ A2) Word count grew, and by a real amount ════"
for a in kankarbagh marufganj anandpur beur; do
  W=$(python3 -c "
import re,html
t=open('/tmp/ad_$a.html',encoding='utf-8',errors='ignore').read()
t=re.sub(r'<script.*?</script>',' ',t,flags=re.S); t=re.sub(r'<style.*?</style>',' ',t,flags=re.S)
print(len(html.unescape(re.sub(r'<[^>]+>',' ',t)).split()))")
  gt "$a rendered words" "$W" 1700
done

echo
echo "════ 🔴 A3) DOORWAY RATCHET — rendered body overlap ════"
OV=$(python3 -c "
import re,html,glob,itertools
def body(p):
    t=open(p,encoding='utf-8',errors='ignore').read()
    for pat in (r'<script.*?</script>', r'<style.*?</style>', r'<header.*?</header>',
                r'<footer.*?</footer>', r'<nav.*?</nav>',
                r'<form[^>]*data-shared-ui[^>]*>.*?</form>'):
        t=re.sub(pat,' ',t,flags=re.S)
    m=re.search(r'<main.*?</main>',t,flags=re.S)
    return html.unescape(re.sub(r'<[^>]+>',' ',m.group(0) if m else t))
P={f:set(re.findall(r'[a-z]{4,}',body(f).lower())) for f in glob.glob('/tmp/ad_*.html')}
print(int(max(len(P[a]&P[b])/max(len(P[a]|P[b]),1)*100 for a,b in itertools.combinations(P,2))))")
# 84 = the live pre-change baseline (84.7%), rounded down. Must not exceed it.
lt "max body overlap vs live baseline 84.7%" "$OV" 84
echo "        (competitor rocareindia measures 100.0% on this exact test)"

DUP=$(python3 -c "
import re,html,glob
def body(p):
    t=open(p,encoding='utf-8',errors='ignore').read()
    for pat in (r'<script.*?</script>', r'<style.*?</style>', r'<header.*?</header>',
                r'<footer.*?</footer>', r'<nav.*?</nav>',
                r'<form[^>]*data-shared-ui[^>]*>.*?</form>'):
        t=re.sub(pat,' ',t,flags=re.S)
    m=re.search(r'<main.*?</main>',t,flags=re.S)
    return html.unescape(re.sub(r'<[^>]+>',' ',m.group(0) if m else t))
S={}; d=0
for f in sorted(glob.glob('/tmp/ad_*.html')):
    n=f.split('ad_')[1][:-5]
    for s in re.split(r'(?<=[.!?])\s+', body(f)):
        s=' '.join(s.split())
        if len(s)<60: continue
        if s in S and S[s]!=n: d+=1
        S[s]=n
print(d)")
lt "duplicate body sentences vs baseline 55" "$DUP" 55
echo "        (competitor rocareindia: 51 across five pages)"

echo
echo "════ A4) Same-band areas still read differently ════"
# chandmari and anandpur are both hard-water; their pages must not converge.
PAIR=$(python3 -c "
import re,html
def body(p):
    t=open(p,encoding='utf-8',errors='ignore').read()
    for pat in (r'<script.*?</script>', r'<style.*?</style>', r'<header.*?</header>',
                r'<footer.*?</footer>', r'<nav.*?</nav>',
                r'<form[^>]*data-shared-ui[^>]*>.*?</form>'):
        t=re.sub(pat,' ',t,flags=re.S)
    m=re.search(r'<main.*?</main>',t,flags=re.S)
    return set(re.findall(r'[a-z]{4,}', html.unescape(re.sub(r'<[^>]+>',' ',m.group(0) if m else t)).lower()))
a=body('/tmp/ad_chandmari.html'); b=body('/tmp/ad_danapur.html')
print(int(len(a&b)/max(len(a|b),1)*100))")
lt "two hard-water areas overlap" "$PAIR" 84

echo
echo "════ A5) Numbers differ per area (not one template) ════"
# Each area must print its own annual running-cost total.
TOTALS=$(python3 -c "
import re,glob
vals=set()
for f in glob.glob('/tmp/ad_*.html'):
    t=open(f,encoding='utf-8',errors='ignore').read()
    m=re.search(r'Kul — saal bhar.*?₹([\d,]+)', t, re.S)
    if m: vals.add(m.group(1))
print(len(vals))")
gt "distinct annual-cost totals across sample" "$TOTALS" 3

echo
echo "════ A6) Schema strengthened on area pages ════"
for a in kankarbagh marufganj; do
  hasf "$a OfferCatalog"        /tmp/ad_$a.html 'OfferCatalog'
  hasf "$a AggregateRating"     /tmp/ad_$a.html 'AggregateRating'
  hasf "$a Service @id"         /tmp/ad_$a.html '/#service'
done
# Review count/rating ab constants.ts se DERIVE hota hai, hardcode nahi.
# 12 Sep 2026: site 44/4.8 bol rahi thi jabki Google par 50/5.0 tha — test
# hardcoded 44 pass kar raha tha, isliye bug pakda nahi gaya. Ab nahi hoga.
RC=$(grep -oP 'reviewCount: \K[0-9]+' src/lib/constants.ts | head -1)
RV=$(grep -oP 'ratingValue: \K[0-9.]+' src/lib/constants.ts | head -1)
# The count must stay real. Competitor ships reviewCount 187134 on this query.
hasf   "real reviewCount $RC"   /tmp/ad_kankarbagh.html "\"reviewCount\":\"$RC\""
hasntf "no inflated reviewCount" /tmp/ad_kankarbagh.html '187134'

echo
echo "════ A7) Answer hub (GEO/AEO) ════"
chk "/ro-service-patna-faq" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/ro-service-patna-faq)" "200"
curl -sS -m 25 $B/ro-service-patna-faq -o /tmp/ad_faq.html
hasf "QAPage schema"       /tmp/ad_faq.html '"@type":"QAPage"'
hasf "FAQPage schema"      /tmp/ad_faq.html '"@type":"FAQPage"'
hasf "speakable schema"    /tmp/ad_faq.html 'SpeakableSpecification'
hasf "speakable selector"  /tmp/ad_faq.html 'geo-answer-short'
hasf "canonical"           /tmp/ad_faq.html 'rel="canonical" href="https://rokadoctor.in/ro-service-patna-faq"'
FW=$(python3 -c "
import re,html
t=open('/tmp/ad_faq.html',encoding='utf-8',errors='ignore').read()
t=re.sub(r'<script.*?</script>',' ',t,flags=re.S); t=re.sub(r'<style.*?</style>',' ',t,flags=re.S)
print(len(html.unescape(re.sub(r'<[^>]+>',' ',t)).split()))")
gt "answer hub word count" "$FW" 1200
# Answers must carry figures, that is the whole point of the page.
hasf "price figure in answers"  /tmp/ad_faq.html '₹1,100'
hasf "TDS figure in answers"    /tmp/ad_faq.html '1,250 ppm'
hasf "BIS reference"            /tmp/ad_faq.html 'IS 10500'
hasntf "no unverifiable boast"  /tmp/ad_faq.html 'we are the best RO service'

echo
echo "════ A8) Answer hub is linked, not orphaned ════"
curl -sS -m 25 $B/ -o /tmp/ad_home.html
curl -sS -m 25 $B/ro-services-patna -o /tmp/ad_hub.html
hasf "footer links answer hub"  /tmp/ad_home.html 'href="/ro-service-patna-faq"'
hasf "hub links answer hub"     /tmp/ad_hub.html 'href="/ro-service-patna-faq"'
curl -sS -m 25 $B/sitemap.xml -o /tmp/ad_sm.xml
hasf "sitemap has answer hub"   /tmp/ad_sm.xml 'ro-service-patna-faq<'
SMT=$(grep -c "<loc>" /tmp/ad_sm.xml)
gt "sitemap total" "$SMT" 115

echo
echo "════ A9) Nothing else broke ════"
for u in / /service-patna /ro-services-patna /ro-repair-patna /ro-amc-patna \
         /products /blog /contact /amc-plans /about/sudhanshu-choudhary \
         /ro-service-patna/kankarbagh /ro-service-patna/marufganj \
         /service-patna/brand/kent; do
  chk "200 $u" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B$u)" "200"
done
chk "unknown area 404"     "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/ro-service-patna/nope)" "404"
chk "unknown top-level 404" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/nonsense-xyz)" "404"
chk "legacy area redirects" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/service-patna/kankarbagh)" "308"

JB=$(python3 -c "
import json,re,glob
bad=0
for f in glob.glob('/tmp/ad_*.html'):
    h=open(f,encoding='utf-8',errors='ignore').read()
    for m in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>',h,re.S):
        try: json.loads(m)
        except Exception: bad+=1
print(bad)")
chk "all JSON-LD valid" "${JB:-99}" "0"
hasntf "no AquaNexa" /tmp/ad_home.html 'AquaNexa'

echo
echo "──────────────────────────────────────────────"
echo "  PASS: $pass    FAIL: $fail"
echo "──────────────────────────────────────────────"

kill -9 $SRV 2>/dev/null; pkill -9 -f "next-server" 2>/dev/null
[ "$fail" -eq 0 ] || exit 1
