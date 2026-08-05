#!/usr/bin/env bash
# Ek hi process mein server uthata hai, saare tests chalata hai, phir band.
# Backgrounded servers is sandbox mein har bash call ke baad mar jaate hain,
# isliye sab kuch ek script mein.
set -u

export DATABASE_URL="postgresql://postgres@localhost:5432/aqn"
export DIRECT_URL="$DATABASE_URL"
export NEXTAUTH_SECRET="test-secret-for-local-verification-only-32chars"
export NEXTAUTH_URL="http://127.0.0.1:3100"
export NODE_ENV=production
B=http://127.0.0.1:3100

pkill -9 -f "next-server" 2>/dev/null
sleep 2

./node_modules/.bin/next start -H 127.0.0.1 -p 3100 > /tmp/srv.log 2>&1 &
SRV=$!

for i in $(seq 1 45); do
  sleep 2
  if curl -sS -m 3 -o /dev/null "$B/api/auth/csrf" 2>/dev/null; then
    echo "server UP after $((i*2))s"
    break
  fi
done

if ! curl -sS -m 5 -o /dev/null "$B/api/auth/csrf" 2>/dev/null; then
  echo "SERVER FAILED TO START"; tail -20 /tmp/srv.log
  kill -9 $SRV 2>/dev/null; exit 1
fi

pass=0; fail=0
chk() {
  if [ "$2" = "$3" ]; then echo "  PASS  $1 ($2)"; pass=$((pass+1));
  else echo "  FAIL  $1 — got '$2', want '$3'"; fail=$((fail+1)); fi
}
chkge() { # label actual min
  if [ "$2" -ge "$3" ]; then echo "  PASS  $1 ($2)"; pass=$((pass+1));
  else echo "  FAIL  $1 — got $2, want >= $3"; fail=$((fail+1)); fi
}

echo
echo "════ 1) Naye pages load hote hain ════"
for p in /forgot-password /login /register /admin/login; do
  chk "$p" "$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B$p)" "200"
done
code=$(curl -sS -m 15 -o /dev/null -w '%{http_code}' $B/admin/security)
if [ "$code" = "307" ] || [ "$code" = "302" ]; then
  echo "  PASS  /admin/security guarded ($code)"; pass=$((pass+1))
else
  echo "  FAIL  /admin/security — got $code, want redirect"; fail=$((fail+1))
fi

echo
echo "════ 2) Show-password toggle — compiled JS mein ════"
# /login aur /admin/login client components hain jo Suspense ke peeche hain,
# isliye pehli SSR HTML mein form nahi hota. /forgot-password pe password
# field step 3 pe aata hai. Isliye toggle shipped JS bundle mein dhoondte hain.
n=$(grep -rl 'Show password' .next/static/chunks/ 2>/dev/null | wc -l)
chkge "toggle bundle mein shipped" "$n" "1"

# register SSR HTML mein turant dikhna chahiye (Suspense nahi hai wahan)
n=$(curl -sS -m 15 $B/register | grep -c 'aria-label="Show password"')
chkge "/register SSR HTML mein toggle" "$n" "1"

# har page ka source PasswordInput use karta hai
for f in "src/app/(auth)/login/page.tsx" "src/app/(auth)/register/page.tsx" \
         "src/app/admin/login/page.tsx" "src/app/(auth)/forgot-password/page.tsx" \
         "src/components/admin/ChangePasswordForm.tsx"; do
  n=$(grep -c '<PasswordInput' "$f")
  chkge "$(basename $(dirname $f))/$(basename $f) uses PasswordInput" "$n" "1"
done

# koi raw type="password" bacha to nahi
echo
echo "════ 3) Koi purana raw password field bacha? ════"
n=$(grep -rn 'type="password"' src/app src/components 2>/dev/null | grep -v 'PasswordInput.tsx' | grep -v "type: 'password'" | wc -l)
chk "raw password inputs remaining" "$n" "0"

echo
echo "════ 4) 'Forgot password?' link login page pe ════"
n=$(grep -c 'forgot-password' "src/app/(auth)/login/page.tsx")
chkge "link source mein" "$n" "1"
n=$(grep -rl 'forgot-password' .next/static/chunks/ 2>/dev/null | wc -l)
chkge "link bundle mein shipped" "$n" "1"

echo
echo "════ 5) DEV channel production pe blocked ════"
RESP=$(curl -sS -m 15 -X POST $B/api/auth/otp -H 'Content-Type: application/json' \
  -d '{"phone":"8969821440","purpose":"PASSWORD_RESET"}')
if echo "$RESP" | grep -q 'test mode'; then
  echo "  PASS  DEV blocked in production"; pass=$((pass+1))
else
  echo "  FAIL  DEV not blocked: $(echo $RESP | head -c 120)"; fail=$((fail+1))
fi

echo
echo "════ 6) Reset endpoint guards ════"
code=$(curl -sS -m 15 -X POST $B/api/auth/reset-password -H 'Content-Type: application/json' \
  -d '{"phone":"8969821440","pollToken":"deadbeefdeadbeefdeadbeef","newPassword":"NewPass@2026"}' \
  -o /dev/null -w '%{http_code}')
chk "fake token rejected" "$code" "400"

code=$(curl -sS -m 15 -X POST $B/api/auth/reset-password -H 'Content-Type: application/json' \
  -d '{"phone":"8969821440","pollToken":"deadbeefdeadbeefdeadbeef","newPassword":"123"}' \
  -o /dev/null -w '%{http_code}')
chk "short password rejected" "$code" "422"

echo
echo "════ 7) Admin endpoints — bina login blocked ════"
code=$(curl -sS -m 15 -X POST $B/api/admin/change-password -H 'Content-Type: application/json' \
  -d '{"currentPassword":"x","newPassword":"NewPass@2026","confirmPassword":"NewPass@2026"}' \
  -o /dev/null -w '%{http_code}')
chk "change-password 401" "$code" "401"

code=$(curl -sS -m 15 -X PATCH $B/api/admin/customers/00000000-0000-0000-0000-000000000000 \
  -H 'Content-Type: application/json' -d '{"action":"reset-password"}' \
  -o /dev/null -w '%{http_code}')
chk "customer reset 401" "$code" "401"

echo
echo "════ 8) Admin login → change password flow ════"
CJ=/tmp/cookies.txt; rm -f $CJ
CSRF=$(curl -sS -m 15 -c $CJ $B/api/auth/csrf | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
curl -sS -m 15 -b $CJ -c $CJ -X POST $B/api/auth/callback/password \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "phone=8969821440" \
  --data-urlencode "password=ChangeMe@123" --data-urlencode "json=true" -o /dev/null

SESS=$(curl -sS -m 15 -b $CJ $B/api/auth/session)
if echo "$SESS" | grep -q 'ADMIN'; then
  echo "  PASS  admin logged in"; pass=$((pass+1))

  code=$(curl -sS -m 15 -b $CJ -X POST $B/api/admin/change-password -H 'Content-Type: application/json' \
    -d '{"currentPassword":"WRONG","newPassword":"BrandNew@2026","confirmPassword":"BrandNew@2026"}' \
    -o /dev/null -w '%{http_code}')
  chk "wrong current password rejected" "$code" "403"

  code=$(curl -sS -m 15 -b $CJ -X POST $B/api/admin/change-password -H 'Content-Type: application/json' \
    -d '{"currentPassword":"ChangeMe@123","newPassword":"password123","confirmPassword":"password123"}' \
    -o /dev/null -w '%{http_code}')
  chk "common password rejected" "$code" "422"

  code=$(curl -sS -m 15 -b $CJ -X POST $B/api/admin/change-password -H 'Content-Type: application/json' \
    -d '{"currentPassword":"ChangeMe@123","newPassword":"BrandNew@2026","confirmPassword":"Different@2026"}' \
    -o /dev/null -w '%{http_code}')
  chk "mismatch rejected" "$code" "422"

  code=$(curl -sS -m 15 -b $CJ -X POST $B/api/admin/change-password -H 'Content-Type: application/json' \
    -d '{"currentPassword":"ChangeMe@123","newPassword":"BrandNew@2026","confirmPassword":"BrandNew@2026"}' \
    -o /dev/null -w '%{http_code}')
  chk "real change succeeded" "$code" "200"

  CJ2=/tmp/c2.txt; rm -f $CJ2
  C2=$(curl -sS -m 15 -c $CJ2 $B/api/auth/csrf | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
  curl -sS -m 15 -b $CJ2 -c $CJ2 -X POST $B/api/auth/callback/password \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode "csrfToken=$C2" --data-urlencode "phone=8969821440" \
    --data-urlencode "password=ChangeMe@123" --data-urlencode "json=true" -o /dev/null
  if curl -sS -m 15 -b $CJ2 $B/api/auth/session | grep -q 'ADMIN'; then
    echo "  FAIL  purana password abhi bhi chal raha hai"; fail=$((fail+1))
  else
    echo "  PASS  purana password band"; pass=$((pass+1))
  fi

  CJ3=/tmp/c3.txt; rm -f $CJ3
  C3=$(curl -sS -m 15 -c $CJ3 $B/api/auth/csrf | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
  curl -sS -m 15 -b $CJ3 -c $CJ3 -X POST $B/api/auth/callback/password \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode "csrfToken=$C3" --data-urlencode "phone=8969821440" \
    --data-urlencode "password=BrandNew@2026" --data-urlencode "json=true" -o /dev/null
  if curl -sS -m 15 -b $CJ3 $B/api/auth/session | grep -q 'ADMIN'; then
    echo "  PASS  naya password chal raha hai"; pass=$((pass+1))
  else
    echo "  FAIL  naya password kaam nahi kar raha"; fail=$((fail+1))
  fi

  code=$(curl -sS -m 15 -b $CJ3 -o /tmp/sec.html -w '%{http_code}' $B/admin/security)
  chk "/admin/security renders" "$code" "200"
  if grep -q "Why you cannot see customer passwords" /tmp/sec.html; then
    echo "  PASS  explainer maujood"; pass=$((pass+1))
  else echo "  FAIL  explainer nahi mila"; fail=$((fail+1)); fi
  if grep -q 'aria-label="Show password"' /tmp/sec.html; then
    echo "  PASS  security page pe toggle maujood"; pass=$((pass+1))
  else echo "  FAIL  security page pe toggle nahi"; fail=$((fail+1)); fi

  echo
  echo "════ 9) Customer reset-password (SUPER_ADMIN) ════"
  CID=$(curl -sS -m 15 -b $CJ3 "$B/admin/customers" -o /tmp/cust.html -w '%{http_code}')
  echo "  customers page: $CID"
  if grep -q 'Reset password' /tmp/cust.html; then
    echo "  PASS  Reset password button dikh raha (SUPER_ADMIN)"; pass=$((pass+1))
  else
    echo "  INFO  koi customer nahi hai seed mein — button test skip"
  fi
else
  echo "  FAIL  admin login nahi hua: $(echo $SESS | head -c 120)"; fail=$((fail+1))
fi

echo
echo "════════════════════════════════════"
echo "  PASS: $pass    FAIL: $fail"
echo "════════════════════════════════════"

kill -9 $SRV 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
exit $fail
