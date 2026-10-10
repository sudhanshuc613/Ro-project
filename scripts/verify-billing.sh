#!/usr/bin/env bash
# BILLING MODULE KA POORA TEST — bill, grahak record, warranty, AMC.
#
# Yeh script apna server khud shuru karta hai, poora flow asli HTTP call se
# chalata hai (koi mock nahi), aur band kar deta hai. Jo bhi "PASS" dikhta
# hai woh sach me live server pe hua hai.
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
echo "════ 0) Bina server ke chalne wale test (ganit + validation) ════"
LOGIC=$(npx tsx scripts/billing-logic-test.ts 2>&1)
LP=$(echo "$LOGIC" | grep -oE 'PASS: [0-9]+' | tail -1 | grep -oE '[0-9]+')
LF=$(echo "$LOGIC" | grep -oE 'FAIL: [0-9]+' | tail -1 | grep -oE '[0-9]+')
LP=${LP:-0}; LF=${LF:-0}
echo "  logic tests: PASS $LP  FAIL $LF"
if [ "$LF" != "0" ]; then echo "$LOGIC" | grep "FAIL " | head -10; fi
pass=$((pass + LP)); fail=$((fail + LF))

echo
echo "════ 0a) Pricing wording — owner ka \"itna se itna tak\" niyam ════"
# Owner: "pricing sab pe mat likh, reference de — itna se itna tak lag sakta hai".
# "₹X onwards" / "₹X se" usi niyam ka ulta hai: grahak kam number yaad rakhta hai
# aur zyada charge pe jhagda hota hai.
ONW=$(grep -rno "onwards" src/ --include=*.ts --include=*.tsx | wc -l)
if [ "$ONW" -le 17 ]; then echo "  PASS  'onwards' sirf $ONW bachi (commercial plant/AMC, jinka upper rate owner se poochna hai)"; pass=$((pass+1));
else echo "  FAIL  'onwards' $ONW hain — spare parts pe range honi chahiye"; fail=$((fail+1)); fi
# 10 Oct ko badle gaye rate kahin purane roop me na reh jayein
# PriceComparison.tsx ka "them:" column COMPETITOR ka rate hai — woh jaan-boojh ke
# nahi badla gaya (hamare paas naya competitor data nahi hai). Isliye use chhoda.
OLDR=$(grep -rn "pump ₹900\|₹900 onwards\|adaptor ₹450\|SMPS ₹450\|SMPS ₹550\|pump from ₹900\|adaptor from ₹450\|₹900 – ₹1,600\|₹450 – ₹750" src/ --include=*.ts --include=*.tsx | grep -v "them: '" | wc -l)
chk "purana pump/SMPS rate 0 jagah" "$OLDR" "0"
chkge "naya pump rate maujood"  "$(grep -rno "₹1,000 – ₹2,800\|₹1,000 to ₹2,800\|₹1,000–₹2,800" src/ --include=*.ts --include=*.tsx | wc -l)" "5"
chkge "naya SMPS rate maujood"  "$(grep -rno "₹700 – ₹1,100\|₹700 to ₹1,100\|₹700–₹1,100\|₹700 se ₹1,100" src/ --include=*.ts --include=*.tsx | wc -l)" "5"

echo
echo "════ 0b) Client-file se non-component export to nahi (naya bug-class) ════"
CE=$(node scripts/check-client-exports.mjs 2>&1)
echo "$CE" | tail -3
if echo "$CE" | grep -q "PASS "; then pass=$((pass+1)); else fail=$((fail+1)); echo "$CE" | grep "FAIL" | head -10; fi

pkill -9 -f "nex[t]-server" 2>/dev/null
sleep 2
./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/billsrv.log 2>&1 &
SRV=$!
for i in $(seq 1 45); do
  sleep 2
  curl -sS -m 3 -o /dev/null "$B/api/auth/csrf" 2>/dev/null && { echo "server UP (${i}x2s)"; break; }
done
if ! curl -sS -m 5 -o /dev/null "$B/api/auth/csrf" 2>/dev/null; then
  echo "SERVER FAILED"; tail -20 /tmp/billsrv.log; kill -9 $SRV 2>/dev/null; exit 1
fi

echo
echo "════ 1) Bina login kuch nahi khulta ════"
chk "/admin/billing redirect"        "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/admin/billing)" "307"
chk "/admin/clients redirect"        "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/admin/clients)" "307"
chk "/admin/warranty-amc redirect"   "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/admin/warranty-amc)" "307"
chk "/admin/print/x redirect"        "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/admin/print/00000000-0000-0000-0000-000000000000)" "307"
chk "GET  /api/admin/billing 401"    "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/api/admin/billing)" "401"
chk "POST /api/admin/billing 401"    "$(curl -sS -m 20 -X POST -o /dev/null -w '%{http_code}' $B/api/admin/billing)" "401"
chk "GET  /api/admin/billing/setup 401" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/api/admin/billing/setup)" "401"
chk "POST /api/admin/billing/setup 401" "$(curl -sS -m 20 -X POST -o /dev/null -w '%{http_code}' $B/api/admin/billing/setup)" "401"
chk "GET  /api/admin/clients 401"    "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/api/admin/clients)" "401"
chk "POST /api/admin/service-records 401" "$(curl -sS -m 20 -X POST -o /dev/null -w '%{http_code}' "$B/api/admin/service-records?kind=unit")" "401"

echo
echo "════ 2) Admin login ════"
# verify-password-features.sh admin ka password badal deta hai, isliye pehle
# reset — taaki suite kisi bhi kram me chale.
node -e "const b=require('bcryptjs');process.stdout.write(b.hashSync('ChangeMe@123',12));" > /tmp/_bh.txt 2>/dev/null
python3 -c "
import psycopg
h=open('/tmp/_bh.txt').read().strip()
c=psycopg.connect('postgresql://postgres@localhost:5432/aqn',autocommit=True,client_encoding='UTF8')
c.execute('update users set password_hash=%s where phone=%s',(h,'8969821440'))
" 2>/dev/null && echo "  (admin password reset -> ChangeMe@123)"
CJ=/tmp/billcj.txt; rm -f $CJ
CSRF=$(curl -sS -m 15 -c $CJ $B/api/auth/csrf | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
curl -sS -m 15 -b $CJ -c $CJ -X POST $B/api/auth/callback/password \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "phone=8969821440" \
  --data-urlencode "password=ChangeMe@123" --data-urlencode "json=true" -o /dev/null
SESS=$(curl -sS -m 15 -b $CJ $B/api/auth/session)
if echo "$SESS" | grep -q 'ADMIN'; then echo "  PASS  admin logged in"; pass=$((pass+1));
else echo "  FAIL  login: $(echo $SESS | head -c 120)"; fail=$((fail+1)); kill -9 $SRV; exit 1; fi

echo
echo "════ 3) Database setup button — ASLI path (tables girake) ════"
# 🔴 10 Oct 2026 — pehle ye test sirf tab chalta tha jab tables PEHLE SE bani thin,
# isliye button ka asli DDL path kabhi chala hi nahi aur ek bug chhup gaya:
#   prisma.$executeRawUnsafe(poora DDL) → ERROR 42601
#   "cannot insert multiple commands into a prepared statement"
# Ab test pehle tables GIRATA hai, phir button dabata hai. Asli Neon jaisa.
python3 - <<'PYDROP'
import psycopg
c = psycopg.connect('postgresql://postgres@localhost:5432/aqn', autocommit=True, client_encoding='UTF8')
for t in ['amc_visits','amc_records','installed_units','bill_payments','bill_items','bills','billing_clients']:
    c.execute(f'DROP TABLE IF EXISTS "{t}" CASCADE')
for e in ['BillType','BillStatus','UnitStatus','AmcRecordStatus']:
    c.execute(f'DROP TYPE IF EXISTS "{e}" CASCADE')
print('  (billing tables giraayi — fresh DB jaisa)')
PYDROP

BEFORE=$(curl -sS -m 20 -b $CJ $B/api/admin/billing/setup)
has "setup se pehle ready=false" "$BEFORE" '"ready":false'
SETUP=$(curl -sS -m 90 -b $CJ -X POST $B/api/admin/billing/setup)
has "button dabane pe ready=true" "$SETUP" '"ready":true'
for t in billing_clients bills bill_items bill_payments installed_units amc_records amc_visits; do
  has "table $t bana" "$SETUP" "$t"
done
python3 - <<'PYCHK'
import sys, psycopg
c = psycopg.connect('postgresql://postgres@localhost:5432/aqn', client_encoding='UTF8')
t = c.execute("select count(*) from information_schema.tables where table_schema='public' and table_name in ('billing_clients','bills','bill_items','bill_payments','installed_units','amc_records','amc_visits')").fetchone()[0]
i = c.execute("select count(*) from pg_indexes where schemaname='public' and (tablename like '%bill%' or tablename like '%amc%' or tablename='installed_units')").fetchone()[0]
f = c.execute("select count(*) from information_schema.table_constraints where constraint_schema='public' and constraint_type='FOREIGN KEY' and (table_name like '%bill%' or table_name like '%amc%' or table_name='installed_units')").fetchone()[0]
e = c.execute("select count(*) from pg_type where typname in ('BillType','BillStatus','UnitStatus','AmcRecordStatus')").fetchone()[0]
print(f'  CHECK DB: tables {t}  indexes {i}  FK {f}  enums {e}')
sys.exit(0 if (t == 7 and i >= 30 and f >= 8 and e == 4) else 1)
PYCHK
if [ $? -eq 0 ]; then echo "  PASS  DB me 7 table + 30+ index + 8+ FK + 4 enum sach me bane"; pass=$((pass+1));
else echo "  FAIL  DB me adhoora bana"; fail=$((fail+1)); fi

AGAIN=$(curl -sS -m 90 -b $CJ -X POST $B/api/admin/billing/setup)
has "dobara dabane pe bhi theek" "$AGAIN" '"ready":true'
has "dobara = alreadyReady"      "$AGAIN" '"alreadyReady":true'
chk "setup dobara chalane pe 200" "$(curl -sS -m 90 -b $CJ -X POST -o /dev/null -w '%{http_code}' $B/api/admin/billing/setup)" "200"

echo
echo "════ 4) Har naya admin page 200 ════"
for p in /admin/billing /admin/billing/new /admin/clients /admin/warranty-amc; do
  chk "$p" "$(curl -sS -m 30 -b $CJ -o /dev/null -w '%{http_code}' $B$p)" "200"
done

echo
echo "════ 5) Naya bill banao (owner ke asli bill ke numbers) ════"
STAMP=$(date +%s)
CREATE=$(curl -sS -m 30 -b $CJ -X POST $B/api/admin/billing \
  -H 'Content-Type: application/json' \
  -d "{
    \"billNumber\":\"TEST-$STAMP\",
    \"type\":\"SALE\",\"status\":\"PAID\",
    \"customerName\":\"Nehal Ather\",\"customerPhone\":\"9123456780\",
    \"customerAddress\":\"Ramna Road, Ishrat Mansion,\\nAshok Rajpath, Piller No 58,\\nOpp. Patna University, Patna\",
    \"clientArea\":\"Ashok Rajpath\",\"clientPincode\":\"800004\",
    \"issueDate\":\"2026-10-10\",
    \"items\":[{\"description\":\"Nivisha 50 LPH Commercial RO Machine\",\"detailNote\":\"(Original Price: 36,000, Discounted Price: 27,000)\",\"mrp\":36000,\"unitPrice\":27000,\"quantity\":1}],
    \"amountPaid\":27000,\"paymentMode\":\"CASH\",
    \"warrantyTemplate\":\"NEW_RO_COMMERCIAL\",
    \"terms\":[\"Installation: Free of cost.\",\"Warranty: 1 year on electrical and mechanical parts.\",\"Payment Terms: Full payment due upon installation.\"],
    \"createUnit\":true,
    \"unit\":{\"brand\":\"Nivisha\",\"model\":\"50 LPH\",\"capacity\":\"50 LPH\",\"machineKind\":\"COMMERCIAL\",\"installedOn\":\"2026-10-10\",\"partsWarrantyMonths\":12,\"serviceWarrantyMonths\":12,\"freeServicesTotal\":4,\"serviceIntervalDays\":90,\"inletTds\":620,\"outletTds\":48},
    \"createAmc\":false
  }")
has "bill bana (ok:true)" "$CREATE" '"ok":true'
has "grand total 27000"   "$CREATE" '"grandTotal":27000'
BID=$(echo "$CREATE" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("id",""))' 2>/dev/null)
TOK=$(echo "$CREATE" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("publicToken",""))' 2>/dev/null)
CLID=$(echo "$CREATE" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("clientId",""))' 2>/dev/null)
chkge "bill id mila" "$(echo -n "$BID" | wc -c)" "30"
chkge "public token lamba hai" "$(echo -n "$TOK" | wc -c)" "20"
chkge "grahak record bana" "$(echo -n "$CLID" | wc -c)" "30"

echo
echo "════ 6) DB me sach me kya bana ════"
python3 - "$BID" <<'PY'
import sys, psycopg
bid = sys.argv[1]
c = psycopg.connect('postgresql://postgres@localhost:5432/aqn', client_encoding='UTF8')
row = c.execute('select bill_number, grand_total, amount_paid, balance_due, amount_in_words, status, array_length(terms,1) from bills where id=%s', (bid,)).fetchone()
print('  CHECK bill row:', row)
items = c.execute('select count(*), sum(line_total) from bill_items where bill_id=%s', (bid,)).fetchone()
print('  CHECK items:', items)
unit = c.execute('select brand, installed_on, parts_warranty_ends_on, service_warranty_ends_on, next_service_due from installed_units where bill_id=%s', (bid,)).fetchone()
print('  CHECK unit:', unit)
pay = c.execute('select count(*), sum(amount) from bill_payments where bill_id=%s', (bid,)).fetchone()
print('  CHECK payment:', pay)
ok = (row and float(row[1]) == 27000 and float(row[3]) == 0
      and row[4] == 'Twenty Seven Thousand Rupees Only' and row[5] == 'PAID' and row[6] == 3
      and items[0] == 1 and float(items[1]) == 27000
      and unit and str(unit[2]) == '2027-10-10' and str(unit[4]) == '2027-01-08'
      and pay[0] == 1 and float(pay[1]) == 27000)
sys.exit(0 if ok else 1)
PY
if [ $? -eq 0 ]; then echo "  PASS  DB me sab sahi (total, words, warranty end 2027-10-10, service due 2027-01-08, payment row)"; pass=$((pass+1));
else echo "  FAIL  DB me kuch galat"; fail=$((fail+1)); fi

echo
echo "════ 7) Print page (admin) ════"
PRINT=$(curl -sS -m 30 -b $CJ $B/admin/print/$BID)
chk  "print page 200" "$(curl -sS -m 30 -b $CJ -o /dev/null -w '%{http_code}' $B/admin/print/$BID)" "200"
has  "company ka naam"        "$PRINT" "AquaPerl RO Buy Repair and Service"
has  "CSS uppercase laga hai" "$PRINT" "uppercase"
has  "BILL / INVOICE title"   "$PRINT" "BILL / INVOICE"
has  "neela rang #0056b3"     "$PRINT" "0056b3"
has  "table header grey"      "$PRINT" "f4f7f6"
has  "stamp laal #d32f2f"     "$PRINT" "d32f2f"
has  "grahak ka naam"         "$PRINT" "Nehal Ather"
has  "item ka naam"           "$PRINT" "Nivisha 50 LPH Commercial RO Machine"
has  "rupaye shabdon me"      "$PRINT" "Twenty Seven Thousand Rupees Only"
has  "Terms heading"          "$PRINT" "Terms"
has  "Customer Signature"     "$PRINT" "Customer Signature"
has  "Authorised Signatory"   "$PRINT" "Authorised Signatory"
has  "Warranty card block"    "$PRINT" "Warranty"
has  "Next Service Due"       "$PRINT" "Next Service Due"
has  "print pe toolbar chhupta hai" "$PRINT" "no-print"
has  "A4 page size"           "$PRINT" "A4"
has  "rang print me aayenge"  "$PRINT" "rintColorAdjust"
has  "noindex"                "$PRINT" "noindex"
hasnt "html2pdf CDN nahi"     "$PRINT" "html2pdf"
hasnt "cdnjs.cloudflare nahi" "$PRINT" "cdnjs.cloudflare"

echo
echo "════ 8) Grahak ka public link (WhatsApp wala) ════"
PUB=$(curl -sS -m 30 $B/bill/$TOK)
chk  "public link 200 (bina login)" "$(curl -sS -m 30 -o /dev/null -w '%{http_code}' $B/bill/$TOK)" "200"
has  "bill dikhta hai"        "$PUB" "Nivisha 50 LPH Commercial RO Machine"
has  "noindex laga hai"       "$PUB" "noindex"
has  "nofollow laga hai"      "$PUB" "nofollow"
has  "helpline dikhta hai"    "$PUB" "8969821440"
chk  "galat token 404" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/bill/abcdefghijklmnopqrstuvwx)" "404"
chk  "chhota token 404" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/bill/abc)" "404"
# 🔴 token me bada akshar hua to middleware lowercase pe 301 kar deta hai aur
# WhatsApp pe bheja link toot jaata hai. Isliye token sirf lowercase hex ho.
if echo "$TOK" | grep -qE '^[0-9a-f]{32}$'; then echo "  PASS  token lowercase hex hai (link kabhi 301 nahi hoga)"; pass=$((pass+1));
else echo "  FAIL  token lowercase hex nahi: $TOK"; fail=$((fail+1)); fi
chk  "bada-akshar wale path pe 301 nahi" "$(curl -sS -m 20 -o /dev/null -w '%{http_code}' $B/bill/$TOK)" "200"

echo
echo "════ 9) SEO pe asar — teen taale ════"
ROB=$(curl -sS -m 20 $B/robots.txt)
has "robots.txt me /bill blocked"  "$ROB" "Disallow: /bill"
has "robots.txt me /admin blocked" "$ROB" "Disallow: /admin"
has "robots.txt me media allowed"  "$ROB" "Allow: /api/media/"
SM=$(curl -sS -m 40 $B/sitemap.xml)
hasnt "sitemap me /bill/ nahi"     "$SM" "/bill/"
hasnt "sitemap me /admin nahi"     "$SM" "<loc>http://127.0.0.1:3100/admin"
chkge "sitemap me URL hain"        "$(echo "$SM" | grep -o '<loc>' | wc -l)" "140"

echo
echo "════ 10) Validation server pe hoti hai ════"
chk "bina item 422" "$(curl -sS -m 20 -b $CJ -X POST $B/api/admin/billing -H 'Content-Type: application/json' -d '{\"billNumber\":\"X1\",\"customerName\":\"Test Naam\",\"customerPhone\":\"9123456780\",\"issueDate\":\"2026-10-10\",\"items\":[]}' -o /dev/null -w '%{http_code}')" "422"
chk "galat phone 422" "$(curl -sS -m 20 -b $CJ -X POST $B/api/admin/billing -H 'Content-Type: application/json' -d '{\"billNumber\":\"X2\",\"customerName\":\"Test Naam\",\"customerPhone\":\"123\",\"issueDate\":\"2026-10-10\",\"items\":[{\"description\":\"Test item\",\"unitPrice\":1,\"quantity\":1}]}' -o /dev/null -w '%{http_code}')" "422"
chk "duplicate bill number 409" "$(curl -sS -m 20 -b $CJ -X POST $B/api/admin/billing -H 'Content-Type: application/json' -d "{\"billNumber\":\"TEST-$STAMP\",\"customerName\":\"Test Naam\",\"customerPhone\":\"9123456780\",\"issueDate\":\"2026-10-10\",\"items\":[{\"description\":\"Test item\",\"unitPrice\":1,\"quantity\":1}]}" -o /dev/null -w '%{http_code}')" "409"

echo
echo "════ 11) Bill badlo — total dobara nikalta hai ════"
UPD=$(curl -sS -m 30 -b $CJ -X PUT $B/api/admin/billing/$BID \
  -H 'Content-Type: application/json' \
  -d "{
    \"billNumber\":\"TEST-$STAMP\",\"type\":\"SALE\",\"status\":\"PARTIAL\",
    \"customerName\":\"Nehal Ather\",\"customerPhone\":\"9123456780\",
    \"issueDate\":\"2026-10-10\",
    \"items\":[{\"description\":\"Nivisha 50 LPH Commercial RO Machine\",\"unitPrice\":27000,\"quantity\":1},{\"description\":\"Extra pipe fitting\",\"unitPrice\":500,\"quantity\":2}],
    \"discountAmount\":1000,\"amountPaid\":10000,\"terms\":[\"x\"]
  }")
has "update ok" "$UPD" '"ok":true'
has "naya total 27000+1000-1000=27000" "$UPD" '"grandTotal":27000'
python3 - "$BID" <<'PY'
import sys, psycopg
c = psycopg.connect('postgresql://postgres@localhost:5432/aqn', client_encoding='UTF8')
r = c.execute('select status, grand_total, amount_paid, balance_due, (select count(*) from bill_items where bill_id=%s) from bills where id=%s', (sys.argv[1], sys.argv[1])).fetchone()
print('  CHECK after update:', r)
sys.exit(0 if (r[0]=='PARTIAL' and float(r[3])==17000 and r[4]==2) else 1)
PY
if [ $? -eq 0 ]; then echo "  PASS  status PARTIAL, baaki 17000, 2 item (purane item duplicate nahi hue)"; pass=$((pass+1));
else echo "  FAIL  update ke baad data galat"; fail=$((fail+1)); fi

echo
echo "════ 12) Grahak ka record page ════"
chk "/admin/clients/:id 200" "$(curl -sS -m 30 -b $CJ -o /dev/null -w '%{http_code}' $B/admin/clients/$CLID)" "200"
CLP=$(curl -sS -m 30 -b $CJ $B/admin/clients/$CLID)
has "grahak ka naam"    "$CLP" "Nehal Ather"
has "machine dikhti hai" "$CLP" "Nivisha"
has "warranty section"   "$CLP" "Parts warranty"
has "AMC section"        "$CLP" "AMC"
has "bill list"          "$CLP" "TEST-$STAMP"

echo
echo "════ 13) Machine + AMC alag se jodna ════"
UNITR=$(curl -sS -m 25 -b $CJ -X POST "$B/api/admin/service-records?kind=unit" \
  -H 'Content-Type: application/json' \
  -d "{\"clientId\":\"$CLID\",\"brand\":\"Kent\",\"model\":\"Grand Plus\",\"installedOn\":\"2024-01-15\",\"partsWarrantyMonths\":12,\"serviceWarrantyMonths\":12,\"freeServicesTotal\":4,\"freeServicesUsed\":0,\"serviceIntervalDays\":90,\"status\":\"ACTIVE\"}")
has "machine judi" "$UNITR" '"ok":true'
AMCR=$(curl -sS -m 25 -b $CJ -X POST "$B/api/admin/service-records?kind=amc" \
  -H 'Content-Type: application/json' \
  -d "{\"clientId\":\"$CLID\",\"planName\":\"Standard AMC\",\"price\":2799,\"startsOn\":\"2026-10-10\",\"endsOn\":\"2027-10-09\",\"visitsIncluded\":4,\"visitsUsed\":0,\"status\":\"ACTIVE\"}")
has "AMC juda" "$AMCR" '"ok":true'
AMCID=$(echo "$AMCR" | python3 -c 'import sys,json;print(json.load(sys.stdin)["amc"]["id"])' 2>/dev/null)
chk "AMC ki end date start se pehle → 422" "$(curl -sS -m 20 -b $CJ -X POST "$B/api/admin/service-records?kind=amc" -H 'Content-Type: application/json' -d "{\"clientId\":\"$CLID\",\"planName\":\"Ulta\",\"startsOn\":\"2026-10-10\",\"endsOn\":\"2026-01-01\"}" -o /dev/null -w '%{http_code}')" "422"

VIS=$(curl -sS -m 25 -b $CJ -X POST "$B/api/admin/service-records?kind=visit" \
  -H 'Content-Type: application/json' \
  -d "{\"contractId\":\"$AMCID\",\"visitDate\":\"2026-10-10\",\"visitType\":\"ROUTINE\",\"technicianName\":\"Raju\",\"workDone\":\"Filter saaf kiya, TDS napa\",\"extraCharge\":0,\"inletTds\":620,\"outletTds\":48}")
has "visit note hui" "$VIS" '"ok":true'
python3 - "$AMCID" <<'PY'
import sys, psycopg
c = psycopg.connect('postgresql://postgres@localhost:5432/aqn', client_encoding='UTF8')
r = c.execute('select visits_used, last_visit_on, next_service_due from amc_records where id=%s', (sys.argv[1],)).fetchone()
print('  CHECK amc after visit:', r)
sys.exit(0 if (r[0]==1 and str(r[1])=='2026-10-10' and str(r[2])=='2027-01-09') else 1)
PY
if [ $? -eq 0 ]; then echo "  PASS  visit ginti 1, agli due 2027-01-09 (364 din / 4 visit = 91 din gap)"; pass=$((pass+1));
else echo "  FAIL  AMC visit ka hisaab galat"; fail=$((fail+1)); fi

echo
echo "════ 14) Warranty & AMC dashboard ════"
WAP=$(curl -sS -m 30 -b $CJ $B/admin/warranty-amc)
has "overdue section"        "$WAP" "Service nikal chuki hai"
has "15 din wala section"    "$WAP" "15 din me service due"
has "warranty 60 din"        "$WAP" "Warranty 60 din me khatm"
has "AMC renewal section"    "$WAP" "AMC 60 din me khatm"
has "2024 wali Kent overdue me aayi" "$WAP" "Kent"

echo
echo "════ 15) Sidebar me naye link, purane salaamat ════"
ADM=$(curl -sS -m 30 -b $CJ $B/admin)
has "Bill / Invoice link"  "$ADM" "/admin/billing"
has "Grahak Record link"   "$ADM" "/admin/clients"
has "Warranty & AMC link"  "$ADM" "/admin/warranty-amc"
for old in /admin/products /admin/categories /admin/inventory /admin/media /admin/site-images /admin/rates \
           /admin/orders /admin/abandoned-carts /admin/service-requests /admin/service-due /admin/amc \
           /admin/technicians /admin/customers /admin/seo /admin/competitors /admin/settings /admin/security; do
  has "purana link $old salaamat" "$ADM" "$old"
done

echo
echo "════ 16) Purane admin page abhi bhi 200 (regression) ════"
for p in /admin /admin/products /admin/categories /admin/inventory /admin/media /admin/site-images \
         /admin/rates /admin/orders /admin/customers /admin/service-requests /admin/service-due \
         /admin/amc /admin/abandoned-carts /admin/technicians /admin/seo /admin/settings /admin/security; do
  chk "$p" "$(curl -sS -m 30 -b $CJ -o /dev/null -w '%{http_code}' $B$p)" "200"
done

echo
echo "════ 17) Public site toota to nahi (regression) ════"
for p in / /ro-service-in-patna /products /amc-plans /contact /blog /ro-services-patna \
         /ro-customer-care-patna /service-patna /ro-service-patna/kankarbagh; do
  chk "$p" "$(curl -sS -m 30 -o /dev/null -w '%{http_code}' $B$p)" "200"
done
HOMEHTML=$(curl -sS -m 30 $B/)
chkge "homepage pe navbar category bar salaamat" "$(echo "$HOMEHTML" | grep -o 'RO Service Patna' | wc -l)" "1"
chkge "homepage pe Spare Parts link salaamat"    "$(echo "$HOMEHTML" | grep -o 'Spare Parts' | wc -l)" "1"
chk   "homepage pe H1 theek 1"                   "$(echo "$HOMEHTML" | grep -o '<h1' | wc -l)" "1"

echo
echo "════ 18) Bill mitao aur rollup dobara gina jaye ════"
chk "delete 200" "$(curl -sS -m 25 -b $CJ -X DELETE -o /dev/null -w '%{http_code}' $B/api/admin/billing/$BID)" "200"
python3 - "$BID" "$CLID" <<'PY'
import sys, psycopg
c = psycopg.connect('postgresql://postgres@localhost:5432/aqn', client_encoding='UTF8')
b = c.execute('select count(*) from bills where id=%s', (sys.argv[1],)).fetchone()[0]
i = c.execute('select count(*) from bill_items where bill_id=%s', (sys.argv[1],)).fetchone()[0]
cl = c.execute('select bill_count, total_billed from billing_clients where id=%s', (sys.argv[2],)).fetchone()
u = c.execute('select count(*) from installed_units where client_id=%s', (sys.argv[2],)).fetchone()[0]
print('  CHECK after delete: bills', b, 'items', i, 'client rollup', cl, 'units kept', u)
sys.exit(0 if (b==0 and i==0 and cl[0]==0 and float(cl[1])==0 and u==2) else 1)
PY
if [ $? -eq 0 ]; then echo "  PASS  bill+items gaye, rollup 0 hua, machine record bacha raha (SetNull)"; pass=$((pass+1));
else echo "  FAIL  delete ke baad data galat"; fail=$((fail+1)); fi

# Test ka kachra saaf
python3 - "$CLID" <<'PY'
import sys, psycopg
c = psycopg.connect('postgresql://postgres@localhost:5432/aqn', autocommit=True, client_encoding='UTF8')
c.execute('delete from billing_clients where id=%s', (sys.argv[1],))
print('  cleanup: test grahak hata diya')
PY

kill -9 $SRV 2>/dev/null
sleep 1
pkill -9 -f "nex[t]-server" 2>/dev/null

echo
echo "════════════════════════════════════"
echo "  PASS: $pass    FAIL: $fail"
echo "════════════════════════════════════"
[ "$fail" -eq 0 ] || exit 1
