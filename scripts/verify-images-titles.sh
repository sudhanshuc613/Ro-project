#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Verification for the 10 Sep 2026 competitor-gap round.
#
# TWO GAPS FOUND BY MEASURING THE COMPETITION, NOT BY GUESSING
# ────────────────────────────────────────────────────────────
# 1. IMAGES. Live scrape of the page outranking us for
#    "ro service kankarbagh patna":
#        rocareindia  26 images, every one with alt text
#        rokadoctor    2 images, both the logo
#    All 73 area pages and 7 service pages shipped without a single photo of
#    the work. The three real photos in public/service/ existed but were only
#    rendered by RealWork on the homepage. Google Images had nothing to index
#    for any locality query, and a wall of text with no photograph reads as a
#    template to a visitor deciding whether to let a stranger into the kitchen.
#
# 2. PHONE NUMBER IN THE TITLE. Every competitor above us does this:
#        roservicecentrepatna.in  "…Patna @7880004551/RO Repair"
#        rocareindia              "…Patna @9311587744 | Water Purifier Service"
#        ro-service-patna.co.in   "…Patna @ 9162281169 | …"
#    We had none. On mobile a number in the SERP is a call that never needs
#    the page to load — for an emergency "no water" search that IS the
#    transaction.
#
#    The blocker was character budget: price + phone + a long area name ran to
#    63-65 chars, past the 56-60 band where Google rewrites ~55% of titles.
#    `title.absolute` drops the layout's ' | Aqua Perl' (12 chars) and both
#    hooks fit at 45-51 — inside the 51-55 window Zyppy measured as the lowest
#    rewrite rate.
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-it.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-it.log; kill -9 $SRV 2>/dev/null; exit 1
fi
echo "server UP"

SAMPLE="kankarbagh boring-road machhuatoli sri-krishna-puri beur danapur-cantonment ag-colony khemnichak"
rm -f /tmp/it_*.html
for a in $SAMPLE; do curl -sS -m 25 $B/ro-service-patna/$a -o /tmp/it_$a.html; done
for s in ro-repair-patna ro-amc-patna ro-installation-patna; do curl -sS -m 25 $B/$s -o /tmp/it_$s.html; done

echo
echo "════ 🔴 A) IMAGES on area pages (was 2, competitor 26) ════"
for a in kankarbagh machhuatoli beur; do
  N=$(grep -o '<img' /tmp/it_$a.html | wc -l)
  gt "$a image count" "$N" 5
  ALT=$(grep -oE '<img[^>]+alt="[^"]{20,}"' /tmp/it_$a.html | wc -l)
  gt "$a images with real alt" "$ALT" 3
done

echo
echo "════ B) Alt text is PER-AREA, not one repeated string ════"
# The whole point: 73 pages must not share an identical alt attribute.
python3 - <<'PY'
import re, glob
alts = {}
for f in glob.glob('/tmp/it_*.html'):
    n = f.split('it_')[1][:-5]
    for m in re.findall(r'<img[^>]+alt="([^"]{20,})"', f and open(f, encoding='utf-8', errors='ignore').read()):
        alts.setdefault(m, set()).add(n)
shared = {a: p for a, p in alts.items() if len(p) > 2 and 'Aqua Perl —' not in a}
print(f"  distinct alt strings: {len(alts)}")
print(f"  alt strings shared by >2 pages (excluding logo): {len(shared)}")
for a in list(shared)[:3]:
    print(f"    shared: {a[:70]}")
print(f"ALT_SHARED={len(shared)}")
PY
SH=$(python3 -c "
import re, glob
alts={}
for f in glob.glob('/tmp/it_*.html'):
    n=f.split('it_')[1][:-5]
    h=open(f,encoding='utf-8',errors='ignore').read()
    for m in re.findall(r'<img[^>]+alt=\"([^\"]{20,})\"',h):
        alts.setdefault(m,set()).add(n)
print(len({a for a,p in alts.items() if len(p)>2 and 'Aqua Perl —' not in a}))")
chk "no alt string shared across pages" "${SH:-9}" "0"
# and each area's alt must name that area
hasf "kankarbagh alt names the area"   /tmp/it_kankarbagh.html 'in Kankarbagh, Patna'
hasf "machhuatoli alt names the area"  /tmp/it_machhuatoli.html 'in Machhuatoli, Patna'
hasf "kankarbagh alt carries its TDS"  /tmp/it_kankarbagh.html '450–900 ppm water'
hasf "beur alt carries its own TDS"    /tmp/it_beur.html '700–1300 ppm water'

echo
echo "════ C) ImageObject schema (neither competitor ships it) ════"
for a in kankarbagh machhuatoli; do
  hasf "$a ImageObject" /tmp/it_$a.html '"@type":"ImageObject"'
  hasf "$a contentUrl"  /tmp/it_$a.html '"contentUrl"'
done
hasf "intent page ImageObject" /tmp/it_ro-repair-patna.html '"@type":"ImageObject"'

echo
echo "════ 🔴 D) TITLE — phone number in, length in the safe band ════"
python3 - <<'PY'
import re, html, glob
bad=0
for f in sorted(glob.glob('/tmp/it_*.html')):
    n=f.split('it_')[1][:-5]
    h=open(f,encoding='utf-8',errors='ignore').read()
    m=re.search(r'<title>(.*?)</title>',h,re.S)
    if not m: continue
    t=html.unescape(m.group(1)).strip()
    if not n.startswith('ro-'):
        ok_phone='8969821440' in t
        ok_price='₹200' in t
        ok_len=len(t)<=60
        ok_nosuffix='| Aqua Perl' not in t
        flag='' if (ok_phone and ok_price and ok_len and ok_nosuffix) else '  <-- CHECK'
        if flag: bad+=1
        print(f"  {len(t):3d}  {t}{flag}")
print(f"TITLE_BAD={bad}")
PY
TB=$(python3 -c "
import re,html,glob
bad=0
for f in glob.glob('/tmp/it_*.html'):
    n=f.split('it_')[1][:-5]
    if n.startswith('ro-'): continue
    h=open(f,encoding='utf-8',errors='ignore').read()
    m=re.search(r'<title>(.*?)</title>',h,re.S)
    if not m: continue
    t=html.unescape(m.group(1)).strip()
    if not ('8969821440' in t and '₹200' in t and len(t)<=60 and '| Aqua Perl' not in t): bad+=1
print(bad)")
chk "every area title has phone + price and fits" "${TB:-9}" "0"

# Longest area name is the stress case for the character budget.
LEN=$(python3 -c "
import re,html
h=open('/tmp/it_danapur-cantonment.html',encoding='utf-8',errors='ignore').read()
m=re.search(r'<title>(.*?)</title>',h,re.S)
print(len(html.unescape(m.group(1)).strip()) if m else 999)")
lt "longest area name title length" "$LEN" 60

echo
echo "════ E) Title strategy per page type ════"
# 18 Sep 2026 — this assertion was INVERTED.
#
# It used to require the intent pages to keep " | Aqua Perl". A live scan of
# the seven pages outranking us for "ro service in patna" showed four of them
# carry the PHONE NUMBER in the title instead:
#
#   roservicecentrepatna.in  "RO Service Centre Patna @7880004551/RO Repair"
#   rocareindia.com          "RO Service Patna @9311587744 | Water Purifier…"
#   rocarepoint.in           "RO Service in Patna@8920748252 | RO Service Near Me"
#   aquaglowroservice.in     "…Ro On rent In Patna @7033653521 - AquaGlow"
#
# On mobile an emergency "no water" search converts on the number itself —
# the click never has to load the page. The 12-char " | Aqua Perl" suffix was
# spending the character budget that the number needs, and pushing titles past
# the 60-char mark where Google rewrites ~55% of them.
#
# So intent pages now use title.absolute with the phone, exactly like the area
# pages already did. The homepage still carries the brand, because a brand
# query must still resolve.
hasf "intent page has phone"     /tmp/it_ro-repair-patna.html '8969821440</title>'
hasntf "intent page drops suffix" /tmp/it_ro-repair-patna.html '| Aqua Perl</title>'
curl -sS -m 20 $B/ -o /tmp/it_home.html
hasf "homepage keeps brand"      /tmp/it_home.html 'Aqua Perl'

echo
echo "════ F) Doorway ratchet still holds after adding images ════"
# Adding the same three photos to 73 pages could push shared vocabulary up.
OV=$(python3 -c "
import re,html,glob,itertools
def body(p):
    t=open(p,encoding='utf-8',errors='ignore').read()
    for pat in (r'<script.*?</script>', r'<style.*?</style>', r'<header.*?</header>',
                r'<footer.*?</footer>', r'<nav.*?</nav>', r'<form[^>]*data-shared-ui[^>]*>.*?</form>'):
        t=re.sub(pat,' ',t,flags=re.S)
    m=re.search(r'<main.*?</main>',t,flags=re.S)
    return html.unescape(re.sub(r'<[^>]+>',' ',m.group(0) if m else t))
P={f:set(re.findall(r'[a-z]{4,}',body(f).lower())) for f in glob.glob('/tmp/it_*.html') if 'ro-' not in f.split('it_')[1] and 'home' not in f}
print(int(max(len(P[a]&P[b])/max(len(P[a]|P[b]),1)*100 for a,b in itertools.combinations(P,2))))")
lt "max body overlap (baseline 84.7)" "$OV" 84

echo
echo "════ G) Nothing else broke ════"
for u in / /products /service-patna /ro-services-patna /ro-service-patna-faq \
         /blog /contact /amc-plans /cart /checkout /about/sudhanshu-choudhary \
         /ro-service-patna/kankarbagh /ro-service-patna/machhuatoli \
         /service-patna/brand/kent /ro-repair-patna; do
  chk "200 $u" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B$u)" "200"
done
chk "legacy redirect" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/service-patna/kankarbagh)" "308"
chk "unknown 404"     "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/nope-xyz)" "404"

JB=$(python3 -c "
import json,re,glob
bad=0
for f in glob.glob('/tmp/it_*.html'):
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
