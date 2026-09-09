#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Verification for the 9 Sep 2026 bug fix + feature round.
#
# 🔴 THE REPORTED BUG
# ───────────────────
# "jab service form bharta hai tab area select karte wakt wo white hai, koi
#  areas show nahi ho raha, hover karne pe dikhta hai"
#
# ROOT CAUSE (found, not guessed): no form control anywhere on the site set an
# explicit `color`. Text colour inherits. QuickBookForm renders inside dark
# hero panels (bg-navy-gradient) on /ro-service-patna/[area],
# /ro-services-patna and all six intent pages, so the <select> carried
# bg-white but inherited the hero's WHITE text. White on white. On hover the
# browser paints its own highlight background, which is precisely why the
# text "appeared" only then.
#
# 🔴 THE SECOND BUG, FOUND WHILE FIXING THE FIRST
# ───────────────────────────────────────────────
# The first fix was written inside @layer base. Tailwind tree-shakes anything
# in a @layer it cannot match against scanned content, and bare element
# selectors like `select option` never match a JSX class — so the rule was
# silently dropped from the compiled bundle. Verified by grepping
# .next/static/css after a build: color-scheme was absent.
#
# That is why section B below asserts against the COMPILED CSS, not the
# source file. A CSS fix that only exists in source is not a fix.
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

pkill -9 -f "next-server" 2>/dev/null; sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/s-ff.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null $B/ 2>/dev/null && break; done
if ! curl -sS -m 5 -o /dev/null $B/ 2>/dev/null; then
  echo "SERVER FAILED"; tail -25 /tmp/s-ff.log; kill -9 $SRV 2>/dev/null; exit 1
fi
echo "server UP"

echo
echo "════ 🔴 A) THE BUG — compiled CSS carries the fix ════"
curl -sS -m 20 $B/ -o /tmp/ff_home.html
# A page links MORE THAN ONE css chunk (global + route). Concatenate all of
# them before asserting — grepping only the first one gave a false failure on
# the first run of this script, which is exactly the kind of "test says broken,
# code is fine" that erodes trust in the suite.
rm -f /tmp/ff.css
CSSCOUNT=0
for p in $(grep -o '/_next/static/css/[a-z0-9]*\.css' /tmp/ff_home.html | sort -u); do
  curl -sS -m 20 "$B$p" >> /tmp/ff.css
  CSSCOUNT=$((CSSCOUNT+1))
done
echo "  css bundles fetched: $CSSCOUNT"
if [ "$CSSCOUNT" -gt 0 ]; then
  hasf "color-scheme:light shipped"      /tmp/ff.css 'color-scheme:light'
  hasf "select option rule shipped"      /tmp/ff.css 'select option'
  hasf "input/select/textarea colour"    /tmp/ff.css 'select,textarea'
  hasf "placeholder colour"              /tmp/ff.css '::placeholder'
  hasf "disabled colour"                 /tmp/ff.css 'select:disabled'
else
  echo "  FAIL  no css bundle linked"; fail=$((fail+1))
fi

echo
echo "════ B) Area picker replaced the 63-option select ════"
for u in / /ro-service-patna/kankarbagh /ro-services-patna /ro-repair-patna; do
  curl -sS -m 25 "$B$u" -o /tmp/ff_p.html
  # The combobox is a button, not a select — that removes the bug class entirely.
  if grep -q 'aria-haspopup="listbox"' /tmp/ff_p.html; then
    echo "  PASS  $u has AreaPicker combobox"; pass=$((pass+1))
  else echo "  FAIL  $u missing AreaPicker"; fail=$((fail+1)); fi
done
curl -sS -m 25 $B/ -o /tmp/ff_home.html
hasf "picker keeps a native select fallback" /tmp/ff_home.html 'aria-hidden="true"'
hasf "areas are IN the html (not hover-only)" /tmp/ff_home.html 'Kankarbagh'
hasf "pincode present for search"            /tmp/ff_home.html '800020'
# The search box and the result counter live inside the dropdown, which only
# mounts on click — so they are asserted in the component source, not in the
# server-rendered HTML. Testing for them in the HTML failed on the first run
# for the wrong reason.
hasf "search input implemented"   src/components/home/AreaPicker.tsx 'Area ya pincode likho'
hasf "result counter implemented" src/components/home/AreaPicker.tsx 'of {SERVICE_AREAS.length} areas'
hasf "filters name, pin, landmark" src/components/home/AreaPicker.tsx 'a.landmarks.some'
hasf "keyboard: arrows + enter"    src/components/home/AreaPicker.tsx "e.key === 'ArrowDown'"
hasf "aria activedescendant roles" src/components/home/AreaPicker.tsx 'role="option"'

echo
echo "════ C) Referral system ════"
hasf "referral lib"            src/lib/referral.ts 'referralCode'
hasf "no ambiguous chars"      src/lib/referral.ts "ABCDEFGHJKLMNPQRTUVWXYZ23479"
hasf "referral card component" src/components/home/ReferralCard.tsx 'referralWaLink'
hasf "api accepts code"        src/app/api/service-requests/route.ts 'referralCode'
hasf "stored on internalNote"  src/app/api/service-requests/route.ts 'REFERRAL:'
hasf "admin surfaces it"       "src/app/admin/(dashboard)/service-requests/page.tsx" "startsWith('REFERRAL:')"
hasf "quick form has field"    /tmp/ff_home.html 'Referral code hai'
hasntf "referral not forced open" /tmp/ff_home.html 'AP-XXXX'
# Code generation must be deterministic and phone-derived.
node -e "
const {referralCode,isValidReferral}=require('esbuild-register/dist/node').register?{}:{};
" 2>/dev/null || true
DET=$(npx tsx -e "
import { referralCode, isValidReferral } from './src/lib/referral';
const a = referralCode('9876543210');
const b = referralCode('9876543210');
const c = referralCode('9876543211');
console.log([a===b, a!==c, /^AP-[A-Z0-9]{4}\$/.test(a), isValidReferral(a,'9876543210'), !isValidReferral(a,'9876543211')].every(Boolean) ? 'OK':'BAD', a);
" 2>/dev/null | tail -1)
case "$DET" in OK*) echo "  PASS  code deterministic + validates ($DET)"; pass=$((pass+1));;
  *) echo "  FAIL  code generation — $DET"; fail=$((fail+1));; esac

echo
echo "════ D) TDS checker (lead magnet) ════"
curl -sS -m 25 $B/ro-service-patna-faq -o /tmp/ff_faq.html
hasf "checker on answer hub"      /tmp/ff_faq.html 'Apna RO khud check karo'
hasf "input TDS field"            /tmp/ff_faq.html 'Input TDS'
hasf "output TDS field"           /tmp/ff_faq.html 'Output TDS'
hasf "no-meter fallback copy"     /tmp/ff_faq.html 'Meter nahi hai'
hasf "privacy stated"             /tmp/ff_faq.html 'koi data kahin nahi jaata'
hasf "BIS cited"                  /tmp/ff_faq.html 'IS 10500'
# The tool must be willing to say "do nothing".
hasf "honest good-verdict path"   src/components/home/TdsChecker.tsx 'Paisa bacha lijiye'
hasf "rejection maths"            src/components/home/TdsChecker.tsx 'rejection'

echo
echo "════ E) 🔴 SYNC — public form lands in admin ════"
TICKET=$(curl -sS -m 25 -X POST "$B/api/service-requests" \
  -H 'Content-Type: application/json' \
  -d '{"customerName":"Form Sync Test","customerPhone":"9876500022","addressLine":"Test Road Kankarbagh","pincode":"800020","area":"Kankarbagh","serviceType":"REPAIR","issueCategory":"NO_WATER","issueDescription":"sync verification run","referralCode":"AP-TEST"}' \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('ticketNumber') or 'ERR')" 2>/dev/null)
if [ -n "$TICKET" ] && [ "$TICKET" != "ERR" ]; then
  echo "  PASS  public POST created $TICKET"; pass=$((pass+1))
  # DB row correct?
  python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
r=c.execute(\"select status::text, priority::text, internal_note, area from service_requests where ticket_number=%s\",('$TICKET',)).fetchone()
d=lambda v: v.decode() if isinstance(v,bytes) else v
print('  status/priority:', d(r[0]), d(r[1]))
print('  referral note  :', (d(r[2]) or '')[:48])
print('  area saved     :', d(r[3]))"
  # NO_WATER must escalate priority — that is the rule the code claims
  PRIO=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
v=c.execute(\"select priority::text from service_requests where ticket_number=%s\",('$TICKET',)).fetchone()[0]
print(v.decode() if isinstance(v,bytes) else v)")
  chk "NO_WATER -> HIGH priority" "$PRIO" "HIGH"
  REF=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
v=c.execute(\"select coalesce(internal_note,'') from service_requests where ticket_number=%s\",('$TICKET',)).fetchone()[0]
v=v.decode() if isinstance(v,bytes) else v
print('YES' if v.startswith('REFERRAL:') else 'NO')")
  chk "referral code persisted" "$REF" "YES"
  # Public tracking page shows it
  LT=$(echo "$TICKET" | tr 'A-Z' 'a-z')
  chk "tracking page 200" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/track/$LT)" "200"
  curl -sS -m 20 "$B/track/$LT" -o /tmp/ff_track.html
  hasf "ticket on tracking page" /tmp/ff_track.html "$TICKET"
  # alert row for the owner
  # The alert body carries the customer name and phone, NOT the ticket number.
  # Matching on the ticket produced a false failure on the first run.
  AL=$(python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
try:
    n=c.execute(\"select count(*) from admin_alerts where body ilike %s\",('%9876500022%',)).fetchone()[0]
    print(int(n))
except Exception: print(-1)")
  if [ "${AL:-0}" -ge 1 ]; then echo "  PASS  admin_alerts row created ($AL)"; pass=$((pass+1));
  elif [ "${AL}" = "-1" ]; then echo "  FAIL  admin_alerts table missing"; fail=$((fail+1));
  else echo "  FAIL  no admin_alerts row"; fail=$((fail+1)); fi
  # completed -> referral card + review CTA
  python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute(\"update service_requests set status='COMPLETED', completed_at=now(), resolution_note='Membrane replaced' where ticket_number=%s\",('$TICKET',))" 2>/dev/null
  curl -sS -m 20 "$B/track/$LT" -o /tmp/ff_track2.html
  hasf "completed -> review CTA"    /tmp/ff_track2.html 'Google par review likhein'
  hasf "completed -> referral card" /tmp/ff_track2.html 'Aapka referral code'
  hasf "referral code rendered"     /tmp/ff_track2.html 'AP-'
  python3 -c "
import psycopg
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True)
c.execute(\"delete from service_requests where ticket_number=%s\",('$TICKET',))
c.execute(\"delete from admin_alerts where body ilike %s\",('%9876500022%',))" 2>/dev/null
else
  echo "  FAIL  public POST failed"; fail=$((fail+1))
fi

echo
echo "════ F) Admin panel intact ════"
for p in "" /orders /products /customers /service-requests /technicians /inventory \
         /categories /media /seo /settings /security /amc /abandoned-carts \
         /service-due /competitors; do
  C=$(curl -sS -m 20 -o /dev/null -w '%{http_code}' "$B/admin$p")
  # 307 = redirected to login. That is CORRECT for a logged-out request.
  if [ "$C" = "307" ] || [ "$C" = "200" ]; then
    echo "  PASS  /admin$p guarded ($C)"; pass=$((pass+1))
  else echo "  FAIL  /admin$p -> $C"; fail=$((fail+1)); fi
done
for a in /api/admin/alerts /api/admin/settings /api/admin/brands "/api/admin/search?q=x"; do
  chk "401 without auth $a" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' "$B$a")" "401"
done

echo
echo "════ G) Nothing else broke ════"
for u in / /service-patna /ro-services-patna /ro-service-patna-faq /ro-repair-patna \
         /ro-amc-patna /products /blog /contact /amc-plans /cart /checkout \
         /ro-service-patna/kankarbagh /ro-service-patna/marufganj \
         /service-patna/brand/kent /about/sudhanshu-choudhary /track-order; do
  chk "200 $u" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B$u)" "200"
done
chk "legacy redirect" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/service-patna/kankarbagh)" "308"
chk "unknown 404"     "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/nope-xyz)" "404"

JB=$(python3 -c "
import json,re,glob
bad=0
for f in glob.glob('/tmp/ff_*.html'):
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
