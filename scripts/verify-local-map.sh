#!/usr/bin/env bash
#
# verify-local-map.sh — LocalMapSection ka gate (18 Nov 2026)
#
# KYUN:
#   Owner ne roservicecentrepatna.in dekh kar map maanga tha. Unka map
#   POORE PATNA SHEHAR ka hai (pin hi nahi) — bilkul bekaar. Humara map
#   HAMARI DUKAAN ka pin dikhata hai.
#
#   Ye gate pakka karta hai ki wo farak kabhi galti se mit na jaaye:
#     1. map homepage par maujood ho
#     2. usme HAMARA address ho — sirf "Patna" nahi (unki wali galti)
#     3. lazy ho (warna homepage 745 KB bhaari ho jaayegi)
#     4. address/phone/hours SAAF TEXT me ho — sirf iframe ke andar nahi,
#        kyunki Googlebot iframe ke andar nahi padhta. Asli SEO yahi text hai.
#     5. hours me "24 Hours" ka jhooth na ho (competitor ki galti)
#     6. address constants.ts se aaye — hardcode na ho (GBP mismatch se bachav)
#
# Ye build ke BAAD chalta hai — .next/server/app/index.html padhta hai.
#
set -u
cd "$(dirname "$0")/.." || exit 1

PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }
no(){ FAIL=$((FAIL+1)); printf '  FAIL  %s  -> %s\n' "$1" "${2:-}"; }

HTML=".next/server/app/index.html"
SRC="src/components/home/LocalMapSection.tsx"
PAGE="src/app/(shop)/page.tsx"

echo "── LOCAL MAP SECTION ──"

if [ ! -f "$HTML" ]; then
  no "build maujood" "$HTML nahi mila — pehle npm run build chalao"
  echo "  PASS: $PASS   FAIL: $FAIL"
  exit 1
fi
ok "build maujood"

cnt(){ python3 -c "
import re,sys
h=open(sys.argv[1],encoding='utf-8',errors='ignore').read()
print(len(re.findall(sys.argv[2],h,re.I|re.S)))
" "$1" "$2" 2>/dev/null || echo 0; }

# ── 1. source file maujood + homepage me juda hai ──
[ -f "$SRC" ] && ok "component file maujood" || no "component file maujood" "$SRC"
[ "$(cnt "$PAGE" '<LocalMapSection')" -ge 1 ] \
  && ok "homepage me <LocalMapSection /> laga" \
  || no "homepage me <LocalMapSection /> laga" "page.tsx me nahi mila"

# ── 2. render hua ──
N_IFRAME=$(cnt "$HTML" '<iframe')
[ "$N_IFRAME" -ge 1 ] && ok "homepage par iframe render hua ($N_IFRAME)" \
  || no "homepage par iframe render hua" "0 iframe"

[ "$(cnt "$HTML" 'maps\.google\.com')" -ge 1 ] \
  && ok "Google Maps embed URL maujood" || no "Google Maps embed URL maujood" "0"

# ── 3. 🔴 HAMARA pin — competitor wali 'poora shehar' galti NAHI ──
HASADDR=$(cnt "$HTML" 'maps\.google\.com/maps\?q=[^"]*Buddha')
[ "$HASADDR" -ge 1 ] \
  && ok "🔴 map query me HAMARA address (sirf 'Patna' nahi)" \
  || no "🔴 map query me HAMARA address" "query me Buddha Colony nahi — competitor jaisi city-map galti"

[ "$(cnt "$HTML" 'maps\.google\.com/maps\?q=[^"]*z=16')" -ge 1 ] \
  && ok "zoom z=16 (gali level, 115 KM nahi)" || no "zoom z=16" "z=16 nahi mila"

# competitor-style generic city embed kahin na ho
BADEMBED=$(cnt "$HTML" '/maps/embed\?pb=')
[ "$BADEMBED" -eq 0 ] \
  && ok "🔴 generic '/maps/embed?pb=' city-map NAHI hai" \
  || no "🔴 generic city-map mil gaya" "$BADEMBED — ye competitor wali bekaar wali cheez hai"

# ── 4. speed: lazy hona chahiye ──
[ "$(cnt "$HTML" '<iframe[^>]*loading="lazy"')" -ge 1 ] \
  && ok "iframe lazy hai (pehli screen par 0 cost)" \
  || no "iframe lazy hai" 'loading="lazy" nahi mila — homepage bhaari ho jaayegi'

[ "$(cnt "$HTML" '<iframe[^>]*title="')" -ge 1 ] \
  && ok "iframe par title (a11y)" || no "iframe par title" "screen-reader ke liye zaroori"

# ── 5. 🔴 asli SEO: NAP saaf TEXT me (iframe ke andar nahi) ──
python3 - <<'PY'
import re,sys
h=open('.next/server/app/index.html',encoding='utf-8',errors='ignore').read()
# iframe tags hata do — jo bacha wo asli readable text hai
t=re.sub(r'<iframe.*?</iframe>','',h,flags=re.S|re.I)
t=re.sub(r'<iframe[^>]*/?>','',t,flags=re.I)
need=[('address',r'Sai Gali'),('locality',r'Buddha Colony'),('pincode',r'800001'),
      ('phone1',r'8969821440'),('phone2',r'9661288308'),('hours',r'05:00')]
bad=[n for n,p in need if not re.search(p,t,re.I)]
print('  PASS  🔴 NAP iframe ke BAHAR text me hai' if not bad
      else '  FAIL  🔴 NAP text me nahi: '+', '.join(bad))
sys.exit(1 if bad else 0)
PY
if [ $? -eq 0 ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); fi

# ── 6. 🔴 competitor wala "24 Hours" jhooth na ho ──
LIE=$(cnt "$HTML" '24\s*Hours')
[ "$LIE" -eq 0 ] \
  && ok "🔴 '24 Hours' ka jhooth homepage par NAHI" \
  || no "🔴 '24 Hours' mil gaya" "$LIE baar — GBP par bhi 05:00-22:00 hona chahiye"

# ── 7. hardcode na ho — constants se aaye ──
HARD=$(cnt "$SRC" "'8969821440'|'9661288308'|'Buddha Colony'|'800001'")
[ "$HARD" -eq 0 ] \
  && ok "component me phone/address hardcode NAHI (constants se)" \
  || no "component me hardcode mila" "$HARD — GBP mismatch ka khatra"

[ "$(cnt "$SRC" 'from .@/lib/constants.')" -ge 1 ] \
  && ok "constants.ts se import karta hai" || no "constants.ts se import" "nahi"

# ── 8. API key leak na ho ──
#
# NOTE (18 Nov 2026): pehla version `key=` dhoondhta tha aur React ke
# `key={p.num}` prop par jhootha FAIL de raha tha. Test ko kamzor karne
# ke bajay ZYADA SAKHT kiya gaya hai — ab do jagah check hoti hai:
#   (a) source me asli API-key naam (AIza.., apiKey, api_key)
#   (b) BUILD KI HUI HTML me koi bhi `?key=` / `&key=` URL parameter
# (b) pehle se zyada mazboot hai: jo asli me browser tak jaata hai wahi
# dekha jaata hai, chahe key kisi bhi file se aayi ho.
KEY_SRC=$(cnt "$SRC" 'AIza[0-9A-Za-z_-]{10}|api_key|apiKey')
[ "$KEY_SRC" -eq 0 ] && ok "source me koi Google API key nahi" \
  || no "source me API key mila" "$KEY_SRC"

KEY_OUT=$(cnt "$HTML" 'AIza[0-9A-Za-z_-]{10}|[?&]key=')
[ "$KEY_OUT" -eq 0 ] && ok "built HTML me koi ?key= URL param nahi (paisa 0)" \
  || no "built HTML me API key mila" "$KEY_OUT"

echo
echo "  PASS: $PASS   FAIL: $FAIL"
[ "$FAIL" -eq 0 ] || exit 1
