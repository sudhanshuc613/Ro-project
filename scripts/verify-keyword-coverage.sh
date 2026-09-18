#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# verify-keyword-coverage.sh
#
# WHY THIS EXISTS
# ───────────────
# 16 Sep 2026. Owner kept reporting that the site does not appear for
# "ro service in patna". I scraped the four pages that DO rank and counted
# phrase occurrences in the rendered body. Result:
#
#   phrase                              rosale  rocare  onedios   US
#   water purifier service in patna        1       3       4       0
#   ro service near me                     0       8       0       0
#   ro water purifier                      5       1      20       0
#   ro service centre / center             0      10       3       1
#   water purifier repair                  3       1       0       0
#
# Four head synonyms appeared ZERO times on our page. Google treats
# "water purifier service" and "RO service" as related-but-distinct queries.
# A page that literally never contains the other phrasing cannot rank for it,
# no matter how good the schema is.
#
# Second finding, same scan — H2 text:
#   rosaleandservices.com : 10 of 17 H2s contain the target keyword
#   rokadoctor.in         :  5 of 10  ("What the job actually involves",
#                                      "How to tell you need this", …)
# H2s are the strongest structural signal after the H1 and half of ours were
# spending that signal on generic phrasing.
#
# This script locks both fixes in. It fails the build if a head synonym drops
# back to zero, or if fewer than 80% of H2s on a money page carry a keyword.
#
# It deliberately checks the RENDERED page, not the source file — that is the
# only thing Googlebot sees, and it is how the H1 glue bug slipped past 1,006
# passing tests twice.
# ═══════════════════════════════════════════════════════════════════════════
set -u

cd /home/user/aquanexa
export DATABASE_URL="postgresql://postgres@localhost:5432/aqn"
export DIRECT_URL="$DATABASE_URL"
export NEXTAUTH_SECRET="test-secret-for-local-verification-only-32chars"
export NEXTAUTH_URL="http://127.0.0.1:3100"
export NODE_ENV=production
B=http://127.0.0.1:3100

pkill -9 -f "next-server" 2>/dev/null
sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-kw.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-kw.log; kill -9 $SRV 2>/dev/null; exit 1
fi

pass=0; fail=0
ge() { if [ "$2" -ge "$3" ]; then echo "  PASS  $1 ($2)"; pass=$((pass+1));
       else echo "  FAIL  $1 — mila $2, chahiye >=$3"; fail=$((fail+1)); fi }

# Rendered body text of a path, lowercased, tags stripped.
bodytext() {
  curl -sS -m 25 "$B$1" | python3 -c "
import re,html,sys
h=sys.stdin.read()
b=re.sub(r'<(script|style|svg|noscript)[^>]*>.*?</\1>',' ',h,flags=re.S|re.I)
b=re.sub(r'<!--.*?-->',' ',b,flags=re.S)
t=re.sub(r'<[^>]+>',' ',b)
print(re.sub(r'\s+',' ',html.unescape(t)).lower())
"
}

echo "════ A) Head synonyms on /ro-service-in-patna ════"
echo "        (measured 16 Sep 2026 against the 4 pages ranking above us)"
T=$(bodytext /ro-service-in-patna)

# phrase | minimum occurrences | what the competitor scored
while IFS='|' read -r phrase minc note; do
  [ -z "$phrase" ] && continue
  n=$(printf '%s' "$T" | grep -o "$phrase" | wc -l)
  ge "\"$phrase\" $note" "$n" "$minc"
done <<'ROWS'
ro service in patna|10|(rosale 6, rocare 8)
water purifier service|2|(rocare 15, rosale 7)
water purifier service in patna|1|(onedios 4, rocare 3)
ro service near me|1|(rocare 8)
ro service centre|1|(rocare 6)
ro service center|1|(rocare 4)
water purifier repair|1|(rosale 3)
ro water purifier|1|(onedios 20, rosale 5)
ro technician|1|(rosale 3)
ro servicing|1|(rosale 1, rocare 1)
ROWS

echo
echo "════ B) H2 keyword density on the money pages ════"
echo "        (rosaleandservices.com scores 10/17 = 59%)"
for p in /ro-service-in-patna /ro-repair-patna /ro-amc-patna /ro-installation-patna; do
  RES=$(curl -sS -m 25 "$B$p" | python3 -c "
import re,html,sys
h=sys.stdin.read()
hs=[html.unescape(re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',x))).strip()
    for x in re.findall(r'<h2[^>]*>(.*?)</h2>',h,re.S|re.I)]
hs=[x for x in hs if x]
kw=sum(1 for x in hs if re.search(r'(ro service|ro repair|ro amc|ro install|ro filter|ro membrane|water purifier|patna|commercial ro)',x,re.I))
pct = int(100*kw/len(hs)) if hs else 0
print(f'{kw} {len(hs)} {pct}')
")
  set -- $RES
  ge "$p — H2 with keyword ($1/$2 = $3%)" "$3" "80"
done

echo
echo "════ C) Body word count vs the pages ranking above us ════"
echo "        (rosale 3341, rocare 2483, onedios 1860)"
W=$(printf '%s' "$T" | wc -w)
ge "/ro-service-in-patna word count" "$W" "2400"

echo
echo "════ D) FAQ depth — rich-result eligibility ════"
NF=$(curl -sS -m 25 $B/ro-service-in-patna | grep -o 'acceptedAnswer' | wc -l)
ge "FAQ entries in schema" "$NF" "12"

echo
echo "════ E) Nothing regressed ════"
for p in / /ro-service-in-patna /ro-repair-patna /ro-amc-patna /ro-installation-patna \
         /ro-filter-change-patna /ro-membrane-replacement-patna /commercial-ro-service-patna \
         /ro-services-patna /ro-problem-checker /ro-service-patna/kankarbagh; do
  c=$(curl -sS -m 20 -o /dev/null -w '%{http_code}' "$B$p")
  if [ "$c" = "200" ]; then echo "  PASS  $p (200)"; pass=$((pass+1));
  else echo "  FAIL  $p — $c"; fail=$((fail+1)); fi
done

echo
echo "════════════════════════════════════"
echo "  PASS: $pass    FAIL: $fail"
echo "════════════════════════════════════"

kill -9 $SRV 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
exit $fail
