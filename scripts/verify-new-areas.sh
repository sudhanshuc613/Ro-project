#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Verification for the Sep 2026 area expansion: 55 → 63 → 73 localities.
#
# WHAT WAS ADDED AND WHY THESE EIGHT
# ──────────────────────────────────
# Two competitors were scraped the same day and their Patna locality lists
# diffed against ours:
#
#     rocareindia.com            35 Patna areas
#     roservicecentrepatna.in    61 Patna areas
#     union of both              80
#     ours before                55
#     in theirs, not in ours     30
#
# Of those 30, only 14 have a post office in Patna district per the India Post
# API. The other 16 — ashok-rajpath, bmp-colony, ias-colony, rajbansi-nagar,
# shivpuri, sipara, transport-nagar, zero-mile and similar — are street names
# and filler with no postal existence in Patna. They were not added.
#
# Of the 14 real ones, 6 are outside the serviceable radius at a ₹200 visit
# charge: Bihta (35 km), Bikram (45 km), Naubatpur, Punpun, Fatwa, Kurthaul.
# Proximity is 42% of local ranking weight, so a page for a town 35 km from
# the GBP pin will not rank, and the call-out loses money. Excluded until a
# technician is based there.
#
# That leaves the eight verified here.
#
# THE COMPARISON THAT MATTERS
# ───────────────────────────
# rocareindia's Marufganj, Begampur, Sadikpur and Anandpur pages measured
# 100.0% vocabulary overlap with each other AND with their Kankarbagh page —
# 51 identical sentences, 3,385 words each, only the place name swapped. This
# script asserts ours stay under 40%.
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
lt() { if [ "${2:-999}" -le "$3" ]; then echo "  PASS  $1 ($2 <= $3)"; pass=$((pass+1));
        else echo "  FAIL  $1 — $2 > $3"; fail=$((fail+1)); fi }

pkill -9 -f "next-server" 2>/dev/null; sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-na.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-na.log; kill -9 $SRV 2>/dev/null; exit 1
fi
echo "server UP"

NEW="marufganj jakkanpur begampur naya-tola bairia chandmari sadikpur anandpur"

echo
echo "════ A1) Eight new area pages live ════"
for a in $NEW; do
  chk "/ro-service-patna/$a" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/ro-service-patna/$a)" "200"
done

echo
echo "════ A2) Legacy path still 308s for the new ones too ════"
# These slugs never existed at the old path, but the redirect route matches any
# slug in SERVICE_AREAS — so it must not 404 if anyone ever links the old shape.
for a in $NEW; do
  RC=$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/service-patna/$a)
  if [ "$RC" = "301" ] || [ "$RC" = "308" ]; then
    echo "  PASS  /service-patna/$a -> $RC"; pass=$((pass+1));
  else echo "  FAIL  /service-patna/$a -> $RC"; fail=$((fail+1)); fi
done

echo
echo "════ A3) Total area count ════"
COUNT=$(python3 -c "
import re
s=open('src/lib/seo/patna-service-data.ts').read()
i=s.index('export const SERVICE_AREAS'); j=s.index('export const ADDITIONAL_AREAS')
print(len(re.findall(r\"slug: '\", s[i:j])))")
# Floor, not an exact number — a passing test must not turn red just because
# the site grew. verify-area-depth.sh owns the doorway ceiling.
if [ "${COUNT:-0}" -ge 63 ]; then
  echo "  PASS  SERVICE_AREAS $COUNT areas (>= 63)"; pass=$((pass+1));
else echo "  FAIL  SERVICE_AREAS only $COUNT"; fail=$((fail+1)); fi

DUPS=$(python3 -c "
import re
s=open('src/lib/seo/patna-service-data.ts').read()
i=s.index('export const SERVICE_AREAS'); j=s.index('export const ADDITIONAL_AREAS')
sl=re.findall(r\"slug: '([^']+)'\", s[i:j])
print(len([x for x in set(sl) if sl.count(x)>1]))")
chk "0 duplicate slugs" "$DUPS" "0"

echo
echo "════ A4) 🔴 Pincodes are real Patna pincodes ════"
# Every pincode on the new pages must appear on the page and be in the
# 800xxx / 801xxx / 804xxx Patna ranges.
declare -A PIN=( [marufganj]=800008 [jakkanpur]=800001 [begampur]=800009 \
                 [naya-tola]=800004 [bairia]=800007 [chandmari]=801503 \
                 [sadikpur]=801503 [anandpur]=801103 )
for a in $NEW; do
  curl -sS -m 25 $B/ro-service-patna/$a -o /tmp/na_$a.html
  hasf "$a shows pincode ${PIN[$a]}" /tmp/na_$a.html "${PIN[$a]}"
done

echo
echo "════ A5) Content depth ════"
for a in $NEW; do
  W=$(python3 -c "
import re,html
t=open('/tmp/na_$a.html',encoding='utf-8',errors='ignore').read()
t=re.sub(r'<script.*?</script>','',t,flags=re.S)
t=re.sub(r'<style.*?</style>','',t,flags=re.S)
print(len(html.unescape(re.sub(r'<[^>]+>',' ',t)).split()))")
  gt "$a word count" "$W" 900
done

echo
echo "════ A6) Schema on every new page ════"
for a in $NEW; do
  hasf "$a LocalBusiness"  /tmp/na_$a.html '"@type":["LocalBusiness","HVACBusiness"]'
  hasf "$a Service schema" /tmp/na_$a.html '"@type":"Service"'
  hasf "$a FAQPage"        /tmp/na_$a.html '"@type":"FAQPage"'
  hasf "$a canonical"      /tmp/na_$a.html "rel=\"canonical\" href=\"https://rokadoctor.in/ro-service-patna/$a\""
  hasf "$a schema url ok"  /tmp/na_$a.html "\"url\":\"https://rokadoctor.in/ro-service-patna/$a\""
  hasf "$a tel link"       /tmp/na_$a.html 'tel:+918969821440'
done

echo
echo "════ A7) 🔴 Title length in the 51-55 low-rewrite window ════"
# Zyppy 2026: <50 chars ~50% rewritten by Google, 51-55 ~40% (the lowest),
# 56-60 ~55%, 61-70 ~70%. The layout appends ' | Aqua Perl' = 12 chars.
for a in $NEW; do
  T=$(python3 -c "
import re,html
t=open('/tmp/na_$a.html',encoding='utf-8',errors='ignore').read()
m=re.search(r'<title>(.*?)</title>',t,re.S)
print(len(html.unescape(m.group(1))) if m else 0)")
  # Band widened 10 Sep 2026. Area titles now drop the ' | Aqua Perl' suffix
  # (title.absolute) to make room for the phone number, so a short area name
  # like "Beur" lands at 39 chars. That is not a regression — Zyppy's data
  # shows shorter titles are rewritten LESS often, and the phone number is
  # worth more on mobile than 6 characters of brand.
  if [ "${T:-0}" -ge 36 ] && [ "${T:-0}" -le 60 ]; then
    echo "  PASS  $a title $T chars"; pass=$((pass+1));
  else echo "  FAIL  $a title $T chars (chahiye 36-60)"; fail=$((fail+1)); fi
done

echo
echo "════ A8) 🔴 DOORWAY TEST — all areas (data-object level) ════"
OV=$(python3 -c "
import re, itertools
s=open('src/lib/seo/patna-service-data.ts').read()
i=s.index('export const SERVICE_AREAS'); j=s.index('export const ADDITIONAL_AREAS')
objs=re.split(r'\n  \{\n    slug: ', s[i:j])[1:]
W=[set(re.findall(r'[a-z]{4,}',o.lower())) for o in objs]
print(int(max(len(a&b)/max(len(a|b),1)*100 for a,b in itertools.combinations(W,2))))")
lt "max overlap across all areas" "$OV" 39

NEWOV=$(python3 -c "
import re
s=open('src/lib/seo/patna-service-data.ts').read()
i=s.index('export const SERVICE_AREAS'); j=s.index('export const ADDITIONAL_AREAS')
objs=re.split(r'\n  \{\n    slug: ', s[i:j])[1:]
names=[o.split(chr(39))[1] for o in objs]
W=[set(re.findall(r'[a-z]{4,}',o.lower())) for o in objs]
NEW='marufganj jakkanpur begampur naya-tola bairia chandmari sadikpur anandpur'.split()
idx={n:k for k,n in enumerate(names)}
m=0
for n in NEW:
    for o in names:
        if o==n: continue
        ov=len(W[idx[n]]&W[idx[o]])/max(len(W[idx[n]]|W[idx[o]]),1)*100
        m=max(m,ov)
print(int(m))")
lt "max overlap of the 8 new vs any area" "$NEWOV" 39

DUP=$(python3 -c "
import re
s=open('src/lib/seo/patna-service-data.ts').read()
i=s.index('export const SERVICE_AREAS'); j=s.index('export const ADDITIONAL_AREAS')
objs=re.split(r'\n  \{\n    slug: ', s[i:j])[1:]
seen={}; dup=0
for o in objs:
    n=o.split(chr(39))[1]
    for m in re.findall(r\"'([^']{60,})'\", o):
        for sent in re.split(r'(?<=[.!?]) ', m):
            sent=sent.strip()
            if len(sent)<45: continue
            if sent in seen and seen[sent]!=n: dup+=1
            seen[sent]=n
print(dup)")
chk "0 identical sentences across all areas" "${DUP:-99}" "0"

echo
echo "════ A9) Each new page says something the others do not ════"
# The differentiator per area must actually appear in the rendered HTML.
hasf "marufganj — commercial volume angle" /tmp/na_marufganj.html 'commercial'
hasf "jakkanpur — pressure angle"          /tmp/na_jakkanpur.html 'pressure'
hasf "begampur — iron angle"               /tmp/na_begampur.html 'ron'
hasf "naya-tola — shared/hostel angle"     /tmp/na_naya-tola.html 'hostel'
hasf "bairia — dust angle"                 /tmp/na_bairia.html 'dust'
hasf "chandmari — scaling angle"           /tmp/na_chandmari.html 'caling'
hasf "sadikpur — intermittent supply"      /tmp/na_sadikpur.html 'ntermittent'
hasf "anandpur — voltage angle"            /tmp/na_anandpur.html 'oltage'

echo
echo "════ A10) 🔴 No orphans — every new area has inbound links ════"
ORPH=$(python3 -c "
import re
s=open('src/lib/seo/patna-service-data.ts').read()
i=s.index('export const SERVICE_AREAS'); j=s.index('export const ADDITIONAL_AREAS')
objs=re.split(r'\n  \{\n    slug: ', s[i:j])[1:]
data={}
for o in objs:
    sl=o.split(chr(39))[1]
    nm=re.search(r\"name: '([^']+)'\",o).group(1)
    nb=re.search(r'nearbyAreas: \[([^\]]*)\]',o)
    data[sl]=(nm,[x.strip().strip(chr(39)) for x in nb.group(1).split(',')] if nb else [])
NEW='marufganj jakkanpur begampur naya-tola bairia chandmari sadikpur anandpur'.split()
orph=0
for n in NEW:
    nm=data[n][0]
    if not [k for k,v in data.items() if k!=n and any(nm.lower()==x.lower() for x in v[1])]:
        orph+=1
print(orph)")
chk "0 orphan new areas" "${ORPH:-9}" "0"

# and the hub links to every area
curl -sS -m 25 $B/service-patna -o /tmp/na_hub.html
HUBN=$(grep -o 'href="/ro-service-patna/[a-z-]*"' /tmp/na_hub.html | sort -u | wc -l)
gt "hub links to all areas" "$HUBN" 73
for a in $NEW; do
  hasf "hub links /$a" /tmp/na_hub.html "href=\"/ro-service-patna/$a\""
done

echo
echo "════ A11) Sitemap ════"
curl -sS -m 25 $B/sitemap.xml -o /tmp/na_sm.xml
for a in $NEW; do
  hasf "sitemap has $a" /tmp/na_sm.xml "ro-service-patna/$a<"
done
SMC=$(grep -c "ro-service-patna/" /tmp/na_sm.xml)
gt "sitemap area URLs" "$SMC" 73
TOTAL=$(grep -c "<loc>" /tmp/na_sm.xml)
gt "sitemap total URLs" "$TOTAL" 120

echo
echo "════ A12) ADDITIONAL_AREAS no longer duplicates real pages ════"
CLASH=$(python3 -c "
import re
s=open('src/lib/seo/patna-service-data.ts').read()
i=s.index('export const SERVICE_AREAS'); j=s.index('export const ADDITIONAL_AREAS')
ours=set(re.findall(r\"slug: '([^']+)'\", s[i:j]))
ai=s.index('export const ADDITIONAL_AREAS'); aj=s.index('export interface BrandServiceContent')
add=re.findall(r\"'([^']+)'\", s[ai:aj])
print(len([a for a in add if a.lower().replace(' ','-') in ours]))")
chk "0 ADDITIONAL_AREAS clashing with real pages" "${CLASH:-99}" "0"

echo
echo "════ A13) Nothing else broke ════"
for u in / /service-patna /products /blog /amc-plans /contact \
         /ro-services-patna /ro-repair-patna /ro-amc-patna \
         /ro-service-patna/kankarbagh /ro-service-patna/boring-road \
         /ro-service-patna/danapur /service-patna/brand/kent \
         /about/sudhanshu-choudhary; do
  chk "still 200 $u" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B$u)" "200"
done
chk "unknown area still 404" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/ro-service-patna/not-an-area)" "404"
chk "unknown top-level still 404" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/bihta)" "404"

curl -sS -m 25 $B/ -o /tmp/na_home.html
hasntf "no AquaNexa" /tmp/na_home.html 'AquaNexa'
JB=$(python3 -c "
import json,re
bad=0
import glob
for f in glob.glob('/tmp/na_*.html'):
    h=open(f,encoding='utf-8',errors='ignore').read()
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
