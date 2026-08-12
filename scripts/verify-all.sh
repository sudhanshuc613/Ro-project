#!/usr/bin/env bash
# Runs every verification script in a safe order and prints one summary.
# Each script starts and stops its own server, so they must run sequentially.
set -u
cd /home/user/aquanexa

TOTAL_P=0; TOTAL_F=0
for s in verify-product-admin verify-titles-and-schema verify-brand-rename \
         verify-admin-full verify-password-features; do
  OUT=$(bash "scripts/$s.sh" 2>&1)
  LINE=$(echo "$OUT" | grep -E "^  PASS: " | tail -1)
  P=$(echo "$LINE" | sed -n 's/.*PASS: \([0-9]*\).*/\1/p')
  F=$(echo "$LINE" | sed -n 's/.*FAIL: \([0-9]*\).*/\1/p')
  P=${P:-0}; F=${F:-0}
  printf '%-30s PASS %3s   FAIL %3s\n' "$s" "$P" "$F"
  if [ "$F" != "0" ]; then echo "$OUT" | grep "  FAIL " | head -10; fi
  TOTAL_P=$((TOTAL_P + P)); TOTAL_F=$((TOTAL_F + F))
done

echo "──────────────────────────────────────────────"
printf '%-30s PASS %3s   FAIL %3s\n' "TOTAL" "$TOTAL_P" "$TOTAL_F"
echo "──────────────────────────────────────────────"
[ "$TOTAL_F" -eq 0 ] || exit 1
