#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# verify-h1-keyword.sh
#
# Ye script kyun bani:
#
# 12 Sep 2026 ko owner ne "ro service in patna" search kiya aur site top 30
# me kahin nahi thi. Wajah dhoondhne par pata chala ki homepage ka <h1>
# render ho raha tha:
#
#     "RO Service & RepairNow in Patna"
#                  ^^^^^^^^^^ — "Repair" aur "Now" chipak gaye the
#
# Do <span> ke beech space nahi tha. Browser me dikhta theek tha kyunki wo
# block elements hain aur alag line pe aate hain — par Googlebot text ko
# jod kar padhta hai, aur usne ek juda hua shabd dekha. Matlab site ke sabse
# bade on-page signal me target phrase THA HI NAHI.
#
# Fix karte waqt YE BUG DOBARA HO GAYA — "Repair inPatna". Isliye ye test.
#
# Ye script har page ka <h1> ka PLAIN TEXT nikalta hai (wahi jo Google
# padhta hai) aur check karta hai ki:
#   1. koi do shabd chipke to nahi (lowercase ke baad turant uppercase)
#   2. target keyword phrase poora maujood hai
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
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-h1.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-h1.log; kill -9 $SRV 2>/dev/null; exit 1
fi

pass=0; fail=0

# Ek page ka h1 ka plain text — jaise Google dekhta hai
h1text() {
  curl -sS -m 20 "$B$1" 2>/dev/null | python3 -c "
import re,html,sys
h=sys.stdin.read()
m=re.search(r'<h1[^>]*>(.*?)</h1>', h, re.S|re.I)
if not m:
    print('__NO_H1__'); raise SystemExit
t=re.sub(r'<!--.*?-->','',m.group(1))
t=re.sub(r'<(script|style|svg)[^>]*>.*?</\1>','',t,flags=re.S|re.I)
t=re.sub(r'<[^>]+>','',t)
t=html.unescape(t)
print(re.sub(r'\s+',' ',t).strip())
"
}

# 1) glued-word check — "RepairNow", "inPatna" jaisa kuch
check_glued() {
  local path="$1" txt="$2"
  # lowercase letter turant uppercase letter se mila hua = do shabd chipke hain
  local glued
  glued=$(python3 -c "
import re,sys
t=sys.argv[1]
# ignore known-good camel patterns (brand names)
allow={'AquaPerl','AquaGuard','AquaFresh','AquaSure','AquaUltra','TDS','RO','AMC','GPD','LPH'}
bad=[m.group(0) for m in re.finditer(r'[a-z]{2,}[A-Z][a-z]{2,}', t) if m.group(0) not in allow]
print(','.join(bad))
" "$txt")
  if [ -n "$glued" ]; then
    echo "  FAIL  $path — glued words in H1: $glued"
    echo "        H1 = '$txt'"
    fail=$((fail+1))
  else
    echo "  PASS  $path — no glued words"
    pass=$((pass+1))
  fi
}

# 2) keyword phrase check
check_phrase() {
  local path="$1" txt="$2" want="$3"
  if echo "$txt" | grep -qi "$want"; then
    echo "  PASS  $path — H1 contains '$want'"
    pass=$((pass+1))
  else
    echo "  FAIL  $path — H1 missing '$want'"
    echo "        H1 = '$txt'"
    fail=$((fail+1))
  fi
}

echo "════ H1 keyword integrity ════"

# path | required phrase
while IFS='|' read -r path want; do
  [ -z "$path" ] && continue
  txt=$(h1text "$path")
  if [ "$txt" = "__NO_H1__" ]; then
    echo "  FAIL  $path — NO <h1> on page"; fail=$((fail+1)); continue
  fi
  check_glued  "$path" "$txt"
  check_phrase "$path" "$txt" "$want"
done <<'ROWS'
/|RO Service Near Me in Patna
/ro-service-in-patna|RO Service in Patna
/ro-repair-patna|RO Repair in Patna
/ro-amc-patna|RO AMC in Patna
/ro-installation-patna|RO Installation in Patna
/ro-services-patna|RO Services in Patna
/service-patna|Water Purifier Repair in Patna
/ro-service-patna/kankarbagh|RO Service in Kankarbagh, Patna
/ro-service-patna/boring-road|RO Service in Boring Road, Patna
/ro-service-patna/rajendra-nagar|RO Service in Rajendra Nagar, Patna
/ro-service-patna/danapur|RO Service in Danapur, Patna
/ro-service-patna/machhuatoli|RO Service in Machhuatoli, Patna
/service-patna/brand/kent|Kent RO Service
/service-patna/brand/aquaguard|Aquaguard RO Service
/service-patna/brand/livpure|Livpure RO Service
/service-patna/brand/pureit|Pureit RO Service
/service-patna/brand/ao-smith|AO Smith RO Service
/service-patna/brand/blue-star|Blue Star RO Service
/service-patna/brand/havells|Havells RO Service
/ro-problem-checker|RO Problem Checker
/ro-service-patna-faq|RO Service in Patna
/commercial-ro-service-patna|Commercial RO Plant Service in Patna
/ro-filter-change-patna|RO Filter Change in Patna
/ro-membrane-replacement-patna|RO Membrane Replacement in Patna
/amc-plans|RO Annual Maintenance Plans in Patna
ROWS

# ─────────────────────────────────────────────────────────────────────────────
# SITE-WIDE GLUE SWEEP
#
# Kyu (19 Sep 2026): upar wali list me sirf woh paths the jo kisi ne haath se
# likhe. Isi wajah se glue bug 5 baar bacha nikla — 21 brand pages list me the
# hi nahi, aur /amc-plans bhi nahi tha (wahan "PlansPatna" chipak raha tha,
# yaani us page ke H1 me "Patna" keyword tha hi nahi).
#
# Ab sitemap se HAR URL uthta hai. Naya page banega to wo apne aap is check me
# aa jayega — kisi ko yaad rakh kar list update nahi karni padegi.
# ─────────────────────────────────────────────────────────────────────────────
echo
echo "════ Site-wide H1 glue sweep (sitemap ke har URL pe) ════"

SWEEP=$(curl -sS -m 30 "$B/sitemap.xml" 2>/dev/null \
        | grep -o '<loc>[^<]*</loc>' | sed 's|<[^>]*>||g' \
        | sed "s|https://rokadoctor.in||" | sed 's|^$|/|')

swept=0; glued=0
for path in $SWEEP; do
  txt=$(h1text "$path")
  swept=$((swept+1))
  [ "$txt" = "__NO_H1__" ] && continue
  g=$(python3 -c "
import re,sys
t=sys.argv[1]
allow={'AquaPerl','AquaGuard','AquaFresh','AquaSure','AquaUltra','AquaPearl','AquaBizz','TDS','RO','AMC','GPD','LPH'}
bad=[m.group(0) for m in re.finditer(r'[a-z]{2,}[A-Z][a-z]{2,}', t)
     if m.group(0) not in allow and not any(a[1:] in m.group(0) for a in allow)]
print(','.join(bad))
" "$txt")
  if [ -n "$g" ]; then
    echo "  FAIL  $path — glued: $g"
    echo "        H1 = '$txt'"
    glued=$((glued+1)); fail=$((fail+1))
  fi
done
if [ "$glued" -eq 0 ]; then
  echo "  PASS  $swept pages swept — koi glued H1 nahi"
  pass=$((pass+1))
fi

echo
echo "════ Target phrase in homepage body ════"
BODY=$(curl -sS -m 20 "$B/" | python3 -c "
import re,html,sys
h=sys.stdin.read()
b=re.sub(r'<(script|style|svg)[^>]*>.*?</\1>','',h,flags=re.S|re.I)
b=re.sub(r'<!--.*?-->','',b,flags=re.S)
t=re.sub(r'<[^>]+>',' ',b); t=html.unescape(t)
print(re.sub(r'\s+',' ',t).lower())
")
for kw in "ro service in patna" "ro repair" "visit charge"; do
  n=$(echo "$BODY" | grep -o "$kw" | wc -l)
  if [ "$n" -ge 1 ]; then echo "  PASS  homepage body has '$kw' (${n}x)"; pass=$((pass+1));
  else echo "  FAIL  homepage body missing '$kw'"; fail=$((fail+1)); fi
done

echo
echo "════ New head-term page is real ════"
H=$(curl -sS -m 20 "$B/ro-service-in-patna")
W=$(echo "$H" | python3 -c "
import re,html,sys
h=sys.stdin.read()
b=re.sub(r'<(script|style|svg)[^>]*>.*?</\1>','',h,flags=re.S|re.I)
t=re.sub(r'<[^>]+>',' ',b); t=html.unescape(t)
print(len(re.sub(r'\s+',' ',t).split()))
")
if [ "$W" -ge 1500 ]; then echo "  PASS  word count $W (>=1500)"; pass=$((pass+1));
else echo "  FAIL  word count only $W"; fail=$((fail+1)); fi

# NOTE: intent pages ek hi <script> block me @graph bhejte hain, isliye
# block ginna galat hai. Asli cheez ye hai ki zaroori @type maujood ho.
S=$(echo "$H" | grep -oP '"@type":"\K[A-Za-z]+' | sort -u | wc -l)
if [ "$S" -ge 15 ]; then echo "  PASS  schema types $S (>=15)"; pass=$((pass+1));
else echo "  FAIL  schema types only $S"; fail=$((fail+1)); fi
for ty in LocalBusiness Service FAQPage HowTo BreadcrumbList AggregateRating Offer; do
  if echo "$H" | grep -q "\"@type\":\"$ty\""; then echo "  PASS  schema has $ty"; pass=$((pass+1));
  else echo "  FAIL  schema missing $ty"; fail=$((fail+1)); fi
done

if echo "$H" | grep -q 'rel="canonical"'; then echo "  PASS  canonical present"; pass=$((pass+1));
else echo "  FAIL  no canonical"; fail=$((fail+1)); fi

if echo "$H" | grep -qi 'noindex'; then echo "  FAIL  page is noindex"; fail=$((fail+1));
else echo "  PASS  indexable"; pass=$((pass+1)); fi

if curl -sS -m 20 "$B/sitemap.xml" | grep -q 'ro-service-in-patna'; then
  echo "  PASS  in sitemap"; pass=$((pass+1))
else echo "  FAIL  missing from sitemap"; fail=$((fail+1)); fi

echo
echo "════════════════════════════════════"
echo "  PASS: $pass    FAIL: $fail"
echo "════════════════════════════════════"

kill -9 $SRV 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
exit $fail
