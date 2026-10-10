#!/usr/bin/env bash
# BANNER UPLOAD + PHONE-FLOAT KA TEST (11 Oct 2026)
#
# Do cheez pakadta hai:
#   1. Bada image upload fail hone wala bug — browser me hi chhota hona chahiye
#   2. Har banner ke UPAR clickable phone number — image me chhapa nahi
set -u
cd /home/user/aquanexa
export DATABASE_URL="postgresql://postgres@localhost:5432/aqn"
export DIRECT_URL="$DATABASE_URL"
export NEXTAUTH_SECRET="test-secret-for-local-verification-only-32chars"
export NEXTAUTH_URL="http://127.0.0.1:3100"
export NODE_ENV=production
B=http://127.0.0.1:3100

pass=0; fail=0
chk()   { if [ "$2" = "$3" ];   then echo "  PASS  $1 ($2)"; pass=$((pass+1)); else echo "  FAIL  $1 — mila '$2', chahiye '$3'"; fail=$((fail+1)); fi; }
chkge() { if [ "$2" -ge "$3" ]; then echo "  PASS  $1 ($2)"; pass=$((pass+1)); else echo "  FAIL  $1 — mila $2, chahiye >=$3"; fail=$((fail+1)); fi; }
has()   { if echo "$2" | grep -q -- "$3"; then echo "  PASS  $1"; pass=$((pass+1)); else echo "  FAIL  $1 — '$3' nahi mila"; fail=$((fail+1)); fi; }
hasnt() { if echo "$2" | grep -q -- "$3"; then echo "  FAIL  $1 — '$3' mil gaya"; fail=$((fail+1)); else echo "  PASS  $1"; pass=$((pass+1)); fi; }

echo
echo "════ 1) Slot registry me machine-readable size ════"
node -e "
const { IMAGE_SLOTS } = require('./.next/server/chunks/noop.js');
" 2>/dev/null
SLOTS=$(npx tsx -e "
import { IMAGE_SLOTS } from '@/lib/seo/site-images';
const bad = IMAGE_SLOTS.filter(s => !s.targetW || !s.targetH || !s.fit);
const ov  = IMAGE_SLOTS.filter(s => s.overlayPhone).map(s => s.key);
console.log(JSON.stringify({ total: IMAGE_SLOTS.length, bad: bad.map(b=>b.key), overlay: ov }));
" 2>/dev/null | tail -1)
echo "  $SLOTS"
chk "har slot pe targetW/H/fit"  "$(echo "$SLOTS" | python3 -c 'import sys,json;print(len(json.load(sys.stdin)["bad"]))')" "0"
chk "14 slot"                    "$(echo "$SLOTS" | python3 -c 'import sys,json;print(json.load(sys.stdin)["total"])')" "14"
chkge "banner slots pe overlayPhone" "$(echo "$SLOTS" | python3 -c 'import sys,json;print(len(json.load(sys.stdin)["overlay"]))')" "3"

echo
echo "════ 2) Browser-side taiyaari ka code maujood ════"
SRC=$(cat src/components/admin/ImageUploader.tsx)
has "prepareImageForUpload call hota hai" "$SRC" "prepareImageForUpload"
has "4 MB se badi par saaf error"         "$SRC" "4_000_000"
has "HTTP 413 ka asli matlab"             "$SRC" "413"
has "HTTP 504 ka asli matlab"             "$SRC" "504"
# Comment me ye line likhi hai (bug ka itihaas), isliye sirf ASLI CODE dekho.
CODESRC=$(grep -v "^\s*\*" src/components/admin/ImageUploader.tsx | grep -v "^\s*//")
hasnt "purana bemtlab wala error code me nahi" "$CODESRC" "reject(new Error('Server sent an unreadable"
hasnt "jhoota '12 MB' ka waada gaya"      "$SRC" "up to 12 MB"
MGR=$(cat src/components/admin/SiteImageManager.tsx)
has "slot ki size uploader ko jaati hai"  "$MGR" "targetW={r.targetW}"
has "fit bhi jaata hai"                   "$MGR" "fit={r.fit}"

echo
echo "════ 3) prepare-upload ka logic (pure, bina browser) ════"
npx tsx -e "
import fs from 'node:fs';
const src = fs.readFileSync('src/lib/images/prepare-upload.ts','utf8');
const must = ['createImageBitmap','toBlob','cover','contain','imageSmoothingQuality','skipped'];
const missing = must.filter(m => !src.includes(m));
if (missing.length) { console.log('MISSING ' + missing.join(',')); process.exit(1); }
if (!/catch[\s\S]{0,200}bail\(/.test(src)) { console.log('NO-FALLBACK'); process.exit(1); }
console.log('LOGIC-OK');
" 2>/dev/null | tail -1 | grep -q "LOGIC-OK" \
  && { echo "  PASS  cover/contain + fallback dono maujood"; pass=$((pass+1)); } \
  || { echo "  FAIL  prepare-upload ka logic adhoora"; fail=$((fail+1)); }

pkill -9 -f "nex[t]-server" 2>/dev/null; sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/bu.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do sleep 2; curl -sS -m 3 -o /dev/null "$B/" 2>/dev/null && { echo "server UP"; break; }; done
if ! curl -sS -m 5 -o /dev/null "$B/" 2>/dev/null; then echo "SERVER FAILED"; tail -20 /tmp/bu.log; kill -9 $SRV; exit 1; fi

echo
echo "════ 4) Phone number har banner ke UPAR — live HTML ════"
for p in / /ro-service-in-patna /ro-services-patna; do
  H=$(curl -sS -m 30 "$B$p")
  CNT=$(echo "$H" | grep -o 'data-phone-badge' | wc -l)
  TEL=$(echo "$H" | grep -o 'href="tel:+918969821440"' | wc -l)
  if [ "$CNT" -ge 1 ]; then echo "  PASS  $p — phone badge ($CNT)"; pass=$((pass+1));
  else echo "  FAIL  $p — banner par phone badge nahi mila"; fail=$((fail+1)); fi
  chkge "$p tel: links" "$TEL" "3"
done

echo
echo "════ 5) Badge HTML me hai, image me nahi ════"
ADS=$(curl -sS -m 30 "$B/ro-service-in-patna")
has "badge ek <a> tag hai"        "$ADS" 'data-phone-badge="1"'
has "aria-label bhi hai"          "$ADS" "Call Aqua Perl Patna on 8969821440"
has "number plain text me padha jaa sakta hai" "$ADS" "8969821440"

echo
echo "════ 6) homeHero slot ab sach me zinda hai ════"
HTML_HOME=$(curl -sS -m 30 "$B/")
has "homepage hero image render hui" "$HTML_HOME" "hero-technician"
RSP=$(curl -sS -m 30 "$B/ro-services-patna")
has "/ro-services-patna poster render hua" "$RSP" "hero-technician"

# Ab ASLI flow: admin login → API se banner badlo → turant check.
# Yahi flow revalidatePath ko bhi test karta hai (pehle sirf revalidateTag tha
# aur /ro-services-patna 24 ghante purana dikhata tha).
CJ2=/tmp/bucj.txt; rm -f $CJ2
node -e "const b=require('bcryptjs');process.stdout.write(b.hashSync('ChangeMe@123',12));" > /tmp/_bh2.txt 2>/dev/null
python3 -c "
import psycopg
h=open('/tmp/_bh2.txt').read().strip()
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True,client_encoding='UTF8')
c.execute('update users set password_hash=%s where phone=%s',(h,'8969821440'))" 2>/dev/null
CSRF2=$(curl -sS -m 15 -c $CJ2 $B/api/auth/csrf | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
curl -sS -m 15 -b $CJ2 -c $CJ2 -X POST $B/api/auth/callback/password \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "csrfToken=$CSRF2" --data-urlencode "phone=8969821440" \
  --data-urlencode "password=ChangeMe@123" --data-urlencode "json=true" -o /dev/null
SESS2=$(curl -sS -m 15 -b $CJ2 $B/api/auth/session)
if echo "$SESS2" | grep -q 'ADMIN'; then echo "  PASS  admin login"; pass=$((pass+1)); else echo "  FAIL  login"; fail=$((fail+1)); fi

SAVE=$(curl -sS -m 30 -b $CJ2 -X PUT $B/api/admin/site-images \
  -H 'Content-Type: application/json' \
  -d '{"key":"homeHero","url":"/banners/__test-banner.png","alt":"Test banner alt text"}')
has "API se banner save hua" "$SAVE" '"ok":true'
sleep 2
HTML_HOME2=$(curl -sS -m 30 "$B/")
has "homepage par TURANT nayi image"  "$HTML_HOME2" "__test-banner.png"
has "nayi alt bhi aayi"               "$HTML_HOME2" "Test banner alt text"
RSP2=$(curl -sS -m 30 "$B/ro-services-patna")
has "/ro-services-patna par bhi TURANT (24 ghante nahi)" "$RSP2" "__test-banner.png"
has "nayi image ke upar bhi phone badge" "$RSP2" "data-phone-badge"

# 🔴🔴 REGRESSION GUARD — 11 Oct 2026
# Ek baar maine cache purge ke liye `revalidatePath('/', 'layout')` likha tha.
# Usne `dynamicParams = false` wale saare intent pages ka prerender uda diya
# aur wo PERMANENTLY 404 ho gaye — yaani banner badalte hi Google Ads ka
# landing page mar jaata. Isliye ab har banner-change ke baad ye check hota hai.
echo "  -- banner badalne ke BAAD bhi pages zinda hain? --"
for p in /ro-service-in-patna /ro-repair-patna /ro-amc-patna /ro-installation-patna \
         /ro-filter-change-patna /ro-membrane-replacement-patna /commercial-ro-service-patna \
         / /ro-services-patna /products /contact /blog /ro-service-patna/kankarbagh; do
  chk "banner badalne ke baad $p" "$(curl -sS -m 30 -o /dev/null -w '%{http_code}' $B$p)" "200"
done

RST=$(curl -sS -m 30 -b $CJ2 -X DELETE "$B/api/admin/site-images?key=homeHero")
has "purani wali wapas" "$RST" '"reset":true'
sleep 2
HTML_HOME3=$(curl -sS -m 30 "$B/")
has "reset ke baad default wapas" "$HTML_HOME3" "hero-technician"
hasnt "test image hat gayi"        "$HTML_HOME3" "__test-banner.png"

echo "════ 7) Upload API zinda aur guarded ════"
chk "POST /api/admin/media bina login 401" "$(curl -sS -m 20 -X POST -o /dev/null -w '%{http_code}' $B/api/admin/media)" "401"
chk "GET  /api/admin/media bina login 401" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/api/admin/media)" "401"
chk "/admin/site-images redirect"          "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/admin/site-images)" "307"

kill -9 $SRV 2>/dev/null; sleep 1; pkill -9 -f "nex[t]-server" 2>/dev/null

echo
echo "════════════════════════════════════"
echo "  PASS: $pass    FAIL: $fail"
echo "════════════════════════════════════"
[ "$fail" -eq 0 ] || exit 1
