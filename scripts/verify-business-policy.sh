#!/usr/bin/env bash
#
# verify-business-policy.sh — BusinessPolicyBlock ka gate (28 Nov 2026)
#
# KYUN:
#   Google Ads account AW-610913435 "Misrepresentation -> Unacceptable
#   business practices" ke under reject hua. Google ka policy text:
#     "Make it seem like you're supported by another brand when you're not"
#     "Offer products or services that you don't have or can't deliver"
#
#   Reviewer ad ka landing page (= homepage) kholta hai. 28 Nov ko naapa
#   gaya — homepage par ye 4 cheez GAYAB thi:
#     1. email address
#     2. malik (proprietor) ka naam
#     3. domain "rokadoctor.in" ka business "Aqua Perl RO Service Centre"
#        se rishta  -> Google isko brand/domain mismatch maan kar
#                      impersonation ke shak me suspend karta hai
#     4. policy pages ke link page ke body me (sirf footer me the)
#
#   Ye gate pakka karta hai ki wo chaaron dobara kabhi gayab na hon, aur
#   saath hi koi JHOOTH chup-chaap na ghus jaaye (24-hour, authorised,
#   guaranteed, #1 — ye sab Google ke liye turant suspension hai).
#
# Ye build ke BAAD chalta hai — .next/server/app/index.html padhta hai.
#
set -u
cd "$(dirname "$0")/.." || exit 1

PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }
no(){ FAIL=$((FAIL+1)); printf '  FAIL  %s  -> %s\n' "$1" "${2:-}"; }

HTML=".next/server/app/index.html"
SRC="src/components/home/BusinessPolicyBlock.tsx"
PAGE="src/app/(shop)/page.tsx"

echo "── BUSINESS POLICY BLOCK ──"

if [ ! -f "$HTML" ]; then
  no "build maujood" "$HTML nahi mila — pehle npm run build chalao"
  echo "  PASS: $PASS   FAIL: $FAIL"
  exit 1
fi
ok "build maujood"

# 🔴 28 Nov — sabotage test ne 2 chhed pakde: checks POORE page par chal rahe
#    the, isliye BrandLogoGrid ke disclaimer aur JSON-LD ke "opens":"05:00" se
#    jhoothe PASS mil rahe the. Ab sirf HAMARA section nikaal kar check karte
#    hain — SECT = section ka HTML, TXT = uska dikhne wala saaf text.
SECT="$(mktemp)"; TXT="$(mktemp)"
trap 'rm -f "$SECT" "$TXT"' EXIT
python3 - "$HTML" "$SECT" "$TXT" <<'PY'
import sys,re,html
h=open(sys.argv[1],encoding='utf-8',errors='ignore').read()
i=h.find('id="business-policy"')
seg=''
if i>=0:
    s=h.rfind('<section',0,i); j=h.find('</section>',i)
    seg=h[s if s>=0 else i : j+10 if j>=0 else len(h)]
open(sys.argv[2],'w',encoding='utf-8').write(seg)
t=html.unescape(re.sub(r'<[^>]+>',' ',re.sub(r'<!--.*?-->','',seg,flags=re.S)))
open(sys.argv[3],'w',encoding='utf-8').write(re.sub(r'\s+',' ',t))
PY
if [ -s "$SECT" ]; then
  ok "section HTML se alag nikal aaya"
else
  no "section HTML se alag nikal aaya" "id=business-policy nahi mila"
  echo "  PASS: $PASS   FAIL: $FAIL"; exit 1
fi

# ── 1. Section homepage par hai ──────────────────────────────────────
grep -q 'id="business-policy"' "$HTML" \
  && ok "section homepage par maujood" \
  || no "section homepage par maujood" 'id="business-policy" nahi mila'

grep -q 'business-policy-heading' "$HTML" \
  && ok "H2 ka aria-labelledby juda hai" \
  || no "H2 ka aria-labelledby juda hai"

grep -q 'Business Information' "$HTML" \
  && ok "H2 ka text dikh raha hai" \
  || no "H2 ka text dikh raha hai"

# ── 2. Chaar gayab cheezein ab maujood ───────────────────────────────
grep -q 'support@rokadoctor.in' "$TXT" \
  && ok "GAP-1 email homepage par" \
  || no "GAP-1 email homepage par" "support@rokadoctor.in nahi mila"

grep -q 'mailto:support@rokadoctor.in' "$SECT" \
  && ok "email clickable (mailto)" \
  || no "email clickable (mailto)"

# 🔴 email EmailOff fence ke andar hona CHAHIYE, warna Cloudflare use
#    /cdn-cgi/l/email-protection (404) bana deta hai — homepage par toota link.
grep -q '<!--email_off-->' "$SECT" \
  && ok "email Cloudflare fence ke andar hai (404 se bachav)" \
  || no "email Cloudflare fence ke andar hai" "<!--email_off--> nahi mila"

grep -q 'EmailOff' "$SRC" \
  && ok "component EmailOff use karta hai, raw mailto nahi" \
  || no "component EmailOff use karta hai, raw mailto nahi"

grep -q 'Sudhanshu Choudhary' "$TXT" \
  && ok "GAP-2 proprietor ka naam homepage par" \
  || no "GAP-2 proprietor ka naam homepage par"

grep -q 'Proprietor' "$TXT" \
  && ok "'Proprietor' label maujood" \
  || no "'Proprietor' label maujood"

# ── UDYAM (MSME) REGISTRATION — 20 Nov 2026 ─────────────────────────────────
# Google Ads reviewer ke liye sarkari registration ka saboot. Number
# udyamregistration.gov.in par verify ho sakta hai, isliye akshar-akshar
# sahi hona ZAROORI hai — ek digit galat = verify fail = appeal fail.
grep -q 'UDYAM-BR-26-0233468' "$TXT" \
  && ok "Udyam number homepage par dikhta hai" \
  || no "Udyam number homepage par dikhta hai"

grep -qi 'Udyam' "$TXT" \
  && ok "'Udyam' label maujood" \
  || no "'Udyam' label maujood"

# Poora format: UDYAM-<2 akshar state>-<2 ank>-<7 ank>. Agar koi galti se
# number chhota/bada kar de to ye pakad lega.
grep -qE 'UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}' "$TXT" \
  && ok "Udyam number ka format sahi hai" \
  || no "Udyam number ka format sahi hai"

# 🔴 Certificate par enterprise ka naam "AQUAPERL RO BUY REPAIR" hai, jo site
# ke legal name se alag hai. Dono saath dikhne par reviewer ko naam-mismatch
# dikhega — Misrepresentation case me ye seedha nuksan hai. Isliye wo naam
# kahin render NAHI hona chahiye.
if grep -qi 'AQUAPERL RO BUY REPAIR' "$TXT"; then
  no "Udyam ka alag enterprise naam render NAHI hota (mismatch se bachav)"
else
  ok "Udyam ka alag enterprise naam render NAHI hota (mismatch se bachav)"
fi

grep -q 'rokadoctor.in' "$TXT" \
  && ok "GAP-3 domain ka naam homepage par" \
  || no "GAP-3 domain ka naam homepage par"

# domain aur legal name EK HI vaakya me hone chahiye — yahi mismatch mitata hai
if grep -oE 'rokadoctor\.in[^<]{0,400}Aqua Perl RO Service Centre|rokadoctor\.in</strong>[^!]{0,400}Aqua Perl RO Service Centre' "$HTML" >/dev/null \
   || python3 - "$HTML" <<'PY'
import re,sys,html
t=html.unescape(re.sub(r'<[^>]+>','',open(sys.argv[1],encoding='utf-8',errors='ignore').read()))
i=t.find('rokadoctor.in is the official website of')
sys.exit(0 if i>=0 and 'Aqua Perl RO Service Centre' in t[i:i+200] else 1)
PY
then ok "domain = business ek hi vaakya me (mismatch khatam)"
else no "domain = business ek hi vaakya me (mismatch khatam)"
fi

grep -q 'official website of' "$TXT" \
  && ok "'official website of' saaf likha hai" \
  || no "'official website of' saaf likha hai"

# ── 3. Policy links body me (sirf footer me nahi) ────────────────────
MISSING=""
for slug in terms privacy-policy returns-refunds shipping-policy warranty-terms about-us contact; do
  grep -q "\"/$slug\"" "$HTML" || MISSING="$MISSING $slug"
done
[ -z "$MISSING" ] \
  && ok "GAP-4 saaton policy/info page ka link maujood" \
  || no "GAP-4 saaton policy/info page ka link maujood" "gayab:$MISSING"

# links section ke ANDAR hain? (footer se alag)
python3 - "$HTML" <<'PY'
import sys,re
h=open(sys.argv[1],encoding='utf-8',errors='ignore').read()
i=h.find('id="business-policy"')
seg=h[i:i+14000] if i>=0 else ''
need=['/terms','/privacy-policy','/returns-refunds','/shipping-policy','/warranty-terms']
miss=[n for n in need if f'"{n}"' not in seg]
sys.exit(0 if i>=0 and not miss else 1)
PY
[ $? -eq 0 ] \
  && ok "links section ke ANDAR hain, sirf footer me nahi" \
  || no "links section ke ANDAR hain, sirf footer me nahi"

# ── 4. Brand non-affiliation ─────────────────────────────────────────
grep -qiE 'not +an +authorised (service )?centre' "$TXT" \
  && ok "non-affiliation English me saaf" \
  || no "non-affiliation English me saaf"

grep -q 'authorised centre NAHI hain' "$TXT" \
  && ok "non-affiliation Hinglish me bhi" \
  || no "non-affiliation Hinglish me bhi"

# ── 5. Address/phone/hours constants se (hardcode nahi) ──────────────
grep -q 'CONTACT.address\|CONTACT\.email\|CONTACT\.primaryTel' "$SRC" \
  && ok "contact constants.ts se aata hai (NAP kabhi mismatch nahi)" \
  || no "contact constants.ts se aata hai"

grep -qE "'8969821440'|\"8969821440\"" "$SRC" \
  && no "phone hardcode nahi" "component me number likha hai" \
  || ok "phone hardcode nahi"

grep -q 'Buddha Colony' "$TXT" \
  && ok "poora pata homepage par" \
  || no "poora pata homepage par"

grep -qE '05:00.{1,3}22:00' "$TXT" \
  && ok "working hours saaf text me (poora 05:00-22:00)" \
  || no "working hours saaf text me (poora 05:00-22:00)"

# ── 6. 🔴 JHOOTH GATE — ye sab Google ke liye turant suspension hai ──
python3 - "$SRC" "$TXT" <<'PY'
import sys,re
t=open(sys.argv[1],encoding='utf-8').read()
t=re.sub(r'/\*.*?\*/','',t,flags=re.S)   # source ke comment hata do
t+=' || '+open(sys.argv[2],encoding='utf-8').read()   # + section ka live text          # comment hata do
bad={
 '24 hour/24x7 ka jhooth': r'24\s*[x/*-]?\s*7|24\s*hours?\b|24\s*ghant',
 'guarantee ka daawa': r'\bguarantee',
 '#1 / best ka daawa': r'#1\b|\bno\.?\s*1\b|\bbest in\b|\bcheapest\b',
 '100% ka daawa': r'\b100\s*%',
 'government/ISO ka daawa': r'\bISO\b|\bgovt\b|\bgovernment (approved|certified)',
}
hit=[k for k,p in bad.items() if re.search(p,t,re.I)]

# "authorised" ka zikr sirf TABHI theek hai jab aas-paas negation ho.
# (lookbehind kaam nahi karta — beech me <strong>not</strong> jaise tag aa jaate hain)
for m in re.finditer(r'authoris?z?ed',t,re.I):
    w=t[max(0,m.start()-70):m.end()+45]
    if not re.search(r'\b(not|non|never|nahi)\b',w,re.I):
        hit.append('authorised hone ka daawa'); break
print('  BAD:'+','.join(hit) if hit else '  CLEAN')
sys.exit(1 if hit else 0)
PY
[ $? -eq 0 ] \
  && ok "koi jhootha daawa nahi (24h / authorised / guarantee / #1 / 100%)" \
  || no "koi jhootha daawa nahi" "upar BAD: dekho"

# visit charge ka number constants se, hardcode nahi
grep -q 'SERVICE.visitCharge' "$SRC" \
  && ok "visit charge SERVICE.visitCharge se" \
  || no "visit charge SERVICE.visitCharge se"

grep -q 'chhupa hua' "$TXT" \
  && ok "'koi chhupa charge nahi' likha hai (dishonest-pricing se bachav)" \
  || no "'koi chhupa charge nahi' likha hai"

grep -q 'bill' "$TXT" \
  && ok "bill dene ki baat likhi hai" \
  || no "bill dene ki baat likhi hai"

# ── 7. Page-weight / safety ──────────────────────────────────────────
grep -q 'use client' "$SRC" \
  && no "server component hai (client JS 0)" "'use client' mila" \
  || ok "server component hai (client JS 0)"

grep -qE '<img|<Image|<iframe' "$SRC" \
  && no "koi image/iframe nahi (page bhaari na ho)" \
  || ok "koi image/iframe nahi (page bhaari na ho)"

grep -q 'application/ld\+json' "$SRC" \
  && no "naya JSON-LD nahi joda" "schema joda gaya — jsonld gate tod sakta hai" \
  || ok "naya JSON-LD nahi joda"

# ── 8. Homepage me sirf JODA gaya ────────────────────────────────────
grep -q '<BusinessPolicyBlock />' "$PAGE" \
  && ok "homepage me render hota hai" \
  || no "homepage me render hota hai"

IMP=$(grep -c "^import BusinessPolicyBlock from '@/components/home/BusinessPolicyBlock';" "$PAGE")
REN=$(grep -c '<BusinessPolicyBlock />' "$PAGE")
[ "$IMP" = "1" ] && [ "$REN" = "1" ] \
  && ok "homepage me ek hi import + ek hi render" \
  || no "homepage me ek hi import + ek hi render" "import=$IMP render=$REN"

OTHER=$(grep -rl 'BusinessPolicyBlock' src --include=*.tsx | grep -v 'BusinessPolicyBlock.tsx' | grep -vc '(shop)/page.tsx')
[ "$OTHER" = "0" ] \
  && ok "sirf homepage par — kisi aur page par nahi" \
  || no "sirf homepage par" "$OTHER aur page me mila"

# footer ke links chhede to nahi
grep -q 'POLICY_LINKS' src/components/layout/Footer.tsx \
  && ok "footer ke policy links jaise the waise hain" \
  || no "footer ke policy links jaise the waise hain"

# ── 9. 🔴 "24×7" KABHI AKELA NAHI (28 Nov 2026) ─────────────────────────
#
# Sach: raat ko call/WhatsApp uth jaati hai, par technician subah hi jaata
# hai. Dono baatein saath likhni ZAROORI hain. Agar kabhi sirf "24×7" reh
# gaya to padhne wala samjhega ki raat 2 baje technician aayega — aur wo
# hum de nahi sakte. Google Ads policy:
#   "Offer products or services that you don't have or CAN'T DELIVER."
#
# Niyam: har availability-dawe ke 160 character ke andar visit-window
# (05:00) ya "visit"/"technician" shabd hona hi chahiye.
#
# 🔴 SAVDHAAN (28 Nov 2026 ko seekha) — "24" dikhna violation NAHI hai.
# Pehle is gate ka regex `24\s*ghant` tha aur usne 6 cheezein pakdi, chhe
# ki chhe GALAT:
#   • "shikayat ke 24 ghante ke andar visit"   -> AMC ka deadline
#   • "carbon badal kar 24 ghante dekhiye"     -> customer ko salah
#   • "24 ghante ke andar bataya gaya damage"  -> return policy ki window
#   • "jo '24 hour service' likhte hain ... nahi uthate" -> hamara disclaimer
# "24 ghante KE ANDAR" ek samay-seema hai; "24 ghante KHULA" availability
# ka dawa hai. Sirf doosri wali galat hai. Isliye ab ban sirf un roopon
# par hai jinka matlab hamesha "hamesha khula" hota hai.
python3 - <<'PY'
import glob, re, sys, html as H

# Ye roop hamesha "hamesha khula" ka matlab dete hain — kabhi jayaz nahi.
HARD = re.compile(r'24\s*[x/\\-]\s*7|open\s+24\s*hours?|24\s*(?:hours?|ghante?)\s+(?:khul|available|uplabdh)', re.I)
# Ye roop jayaz ho sakte hain, par aas-paas visit ka daayra likha ho tabhi.
SCOPED = re.compile(r'24\s*[×✕✖]\s*7|24\s*hours?\s+(?:service|seva)', re.I)
NEAR = re.compile(r'05:00|visit|technician', re.I)

pages = sorted(glob.glob('.next/server/app/**/*.html', recursive=True))
bare, banned = [], []
for f in pages:
    raw = open(f, encoding='utf-8', errors='ignore').read()
    raw = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', raw, flags=re.S | re.I)
    t = re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', raw)))
    m = HARD.search(t)
    if m:
        banned.append(f"{f.split('app/')[-1]} :: …{t[max(0,m.start()-60):m.end()+60].strip()}…")
    for m in SCOPED.finditer(t):
        if not NEAR.search(t[max(0, m.start() - 160): m.end() + 160]):
            bare.append(f"{f.split('app/')[-1]} :: …{t[max(0,m.start()-60):m.end()+60].strip()}…")
            break
print(f"  ..... {len(pages)} page scan kiye — 24-availability scoping")
for x in banned[:3]:
    print('  FAIL  🔴 hamesha-khula ka dawa: ' + x)
for x in bare[:3]:
    print('  FAIL  🔴 "24×7" bina visit-window ke: ' + x)
sys.exit(1 if (banned or bare) else 0)
PY
[ $? -eq 0 ] \
  && ok '🔴 har "24×7" ke paas visit-window likha hai (koi akela 24×7 nahi)' \
  || no '🔴 "24×7" scoping' "upar FAIL dekho"

# constants me dono cheez alag-alag rakhi hain
grep -q "callHours: '24×7'" src/lib/constants.ts \
  && ok "CONTACT.callHours constants me hai (hardcode nahi)" \
  || no "CONTACT.callHours constants me hai"

grep -q 'export const HOURS_FULL' src/lib/constants.ts \
  && ok "HOURS_FULL helper maujood (call+visit ek saath)" \
  || no "HOURS_FULL helper maujood"

# visit ke ghante abhi bhi wahi — GBP ke Hours field se match hone chahiye
grep -qE "hours: 'Mon.{1,3}Sun 05:00.{1,3}22:00'" src/lib/constants.ts \
  && ok "visit hours Mon-Sun 05:00-22:00 (GBP se match)" \
  || no "visit hours badal gaye" "GBP ke Hours field se mismatch ho jayega"

echo
echo "  PASS: $PASS   FAIL: $FAIL"
[ "$FAIL" -eq 0 ] || exit 1
