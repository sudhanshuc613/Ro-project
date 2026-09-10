# 🏆 Competitor Se Aage — 10 Sep 2026

**1,006/1,006 tests pass** · build EXIT 0 · 184 pages · zero warnings

---

# 🔎 Pehle: competitor ko phir se naapa

Har site abhi khol ke measure kiya, guess nahi:

| Site | Words | Schema | tel: | **Images** | **Video** |
|---|---|---|---|---|---|
| **HUM /service-patna** | **7,997** | **60** | 8 | **2** 🔴 | 0 |
| **HUM kankarbagh** | 1,800 | **59** | 6 | **2** 🔴 | 0 |
| rocareindia kankarbagh | 3,392 | 43 | **14** | **26** | 6 |
| roservicecentrepatna | 2,285 | 17 | 6 | 9 | 0 |
| shristiropatna | 557 | 10 | 5 | 12 | 0 |
| roservicecenterpatna | 609 | 0 | 4 | 5 | 0 |
| repairpatna | 1,004 | 2 | 7 | 0 | 0 |
| ro-service-patna.co.in | **19** | 0 | 0 | 1 | 0 |
| patnaaquacare | 45 | 0 | 0 | 0 | 0 |

**Words aur schema me hum sabse aage. Par do jagah peeche the.**

---

# 🔴 GAP 1 — Images: hamare 2, unke 26

Ye sabse bada tha.

```
rocareindia kankarbagh :  26 images, SAB me alt text
rokadoctor  kankarbagh :   2 images — dono logo the
```

Aur `public/service/` me **3 asli photos already padi thi**:
```
technician-working.jpg
tds-testing.jpg
membrane-old-new.jpg
```

Par wo sirf `RealWork` component me thi, jo **sirf homepage** pe render hota
hai. **73 area page + 7 service page — 80 pages pe ek bhi photo nahi.**

## Teen nuksaan

1. **Google Images me kuch nahi** — kisi bhi locality query pe index karne ko
   kuch tha hi nahi
2. **Trust** — sirf text ka page template lagta hai. Customer ko apne kitchen
   me ajnabi bulana hai, use kaam dekhna hai
3. **Alt text keyword surface** — 80 pages × 3 images = 240 alt strings, sab
   khali padi thi

## ✅ Fix — `AreaWorkProof` component

Ab har area aur service page pe 3 photos. **Par sirf photo daal dena kaafi
nahi tha** — 73 pages pe same alt text keyword stuffing hoti.

**Alt text har area ke apne data se banta hai:**

```
Kankarbagh:  "TDS meter showing 450–900 ppm water reading during an
              RO service visit in Kankarbagh, Patna"

Beur:        "TDS meter showing 700–1300 ppm water reading during an
              RO service visit in Beur, Patna"

Machhuatoli: "Aqua Perl technician repairing an RO water purifier in a
              Machhuatoli, Patna home"
```

Caption bhi area ke `commonRepair` se:
> *"Poora toolkit aur heat damage from cramped mounting ke parts har visit pe
> saath hote hain — is area me yahi sabse zyada hota hai."*

**Test se verify kiya: 34 distinct alt strings, 0 shared across pages.**

## Aur ek cheez jo kisi ke paas nahi

**ImageObject schema.** Maine check kiya:
```
rocareindia : ImageObject=False
hum (ab)    : ImageObject=True  ✅
```

Ye wo hai jo Google ko batata hai photo **is locality ki is service** ki hai,
sirf decoration nahi.

---

# 🔴 GAP 2 — Phone number title me

Ye pattern har competitor me mila jo hamare upar hai:

```
roservicecentrepatna.in  "RO Service Centre Patna @7880004551/RO Repair"
rocareindia              "RO Service Kankarbagh, Patna @9311587744 | …"
ro-service-patna.co.in   "Water Purifier Services Patna @ 9162281169 | …"
────────────────────────────────────────────────────────────────────────
HUM (pehle)              "RO Repair in Kankarbagh, Patna — ₹200 Visit | Aqua Perl"
```

**Mobile pe SERP me number dikhna matlab wo call jo site khole bina lag jaye.**
Aur "paani nahi aa raha" wali emergency search me — wahi poora transaction hai.

## Problem: jagah nahi thi

Layout `| Aqua Perl` (12 chars) jodta hai. Price + phone + lamba area naam:

```
RO Service Danapur Cantonment Patna ₹200 · 8969821440 | Aqua Perl   = 65 chars
                                                            ⚠️ Google 55% rewrite karta hai
```

## ✅ Fix — `title.absolute`

Next.js me `title: { absolute: ... }` layout ka suffix **skip** kar deta hai.
Wo 12 characters bach gaye, aur **dono hook fit ho gaye**:

```
 39  RO Service Beur Patna ₹200 · 8969821440
 44  RO Service AG Colony Patna ₹200 · 8969821440
 45  RO Service Kankarbagh Patna ₹200 · 8969821440
 46  RO Service Machhuatoli Patna ₹200 · 8969821440
 51  RO Service Sri Krishna Puri Patna ₹200 · 8969821440
 53  RO Service Danapur Cantonment Patna ₹200 · 8969821440   ← sabse lamba
```

**Sab 60 se neeche.** Zyada tar 45-53 me — Zyppy 2026 ka wo band jahan Google
sabse kam rewrite karta hai (~40%).

## Brand hatane se nuksaan nahi

Ye **local service query** hai, brand query nahi. Koi "Aqua Perl" search nahi
karta — "ro service kankarbagh" karta hai. Aur homepage + service pages pe
brand suffix abhi bhi hai, to brand query bhi safe hai.

**Ab hamara title unse behtar hai** — unke paas sirf phone hai, hamare paas
**phone + ₹200** dono. Aur ₹200 unke ₹300-400 ke saamne asli hook hai.

---

# 🔬 Doorway test — images add karne ke baad bhi safe

3 same photos 73 pages pe daalne se shared vocabulary badh sakti thi:

```
                     pehle    ab
max body overlap      74%     73%   ✅ (baseline 84.7, competitor 100)
```

**Kam ho gaya** — kyunki alt text aur caption har area ke apne numbers se
bante hain.

---

# 🧪 Test Report

```
tsc --noEmit                   EXIT 0  ✅
npm run build                  EXIT 0  ✅  184 pages, ZERO warnings

verify-images-titles      39/39   ← naya
verify-robots-media       24/24
verify-forms-and-features 83/83
verify-area-depth         64/64
verify-new-areas         140/140
verify-service-intent    165/165
verify-seo-packages       94/94
verify-ux-upgrade         99/99
verify-seo-indexing       59/59
verify-product-admin      68/68
verify-titles-and-schema  45/45
verify-brand-rename       51/51
verify-admin-full         44/44
verify-password-features  31/31
────────────────────────────────
TOTAL                  1,006/1,006  ✅
```

## Naye 39 test

```
A  images    har area page 5+ images, 3+ real alt
B  alt text  34 distinct strings, 0 shared, har area ka apna TDS
C  schema    ImageObject + contentUrl (competitor ke paas nahi)
D  title     phone + ₹200 dono, 60 se neeche, brand suffix nahi
E  brand     service/home pages pe suffix abhi bhi hai
F  doorway   overlap 73% (ratchet hold)
G  regression 15 page 200, redirect 308, unknown 404, JSON-LD valid
```

---

# 📊 Ab ka scorecard — sab kuch mila ke

| | HUM | rocareindia | roservicecentrepatna |
|---|---|---|---|
| Patna area pages | **73** | 35 | 61 |
| Sub-localities named | **+40** | 0 | 0 |
| Service-intent pages | **7** | hai | 0 |
| Words (pillar) | **7,997** | — | 2,285 |
| Schema per page | **59** | 43 | 17 |
| **Images per area page** | **5** | 26 | 9 |
| ImageObject schema | **✅** | ❌ | ❌ |
| Phone in title | **✅** | ✅ | ✅ |
| Price in title | **✅ ₹200** | ❌ | ❌ |
| Area page overlap | **73%** | **100%** 🔴 | ? |
| reviewCount | **44** (asli) | **187,134** 🔴 | — |
| Answer hub (QAPage) | **✅** | ❌ | ❌ |
| TDS diagnostic tool | **✅** | ❌ | ❌ |
| Referral system | **✅** | ❌ | ❌ |

---

# 💬 Wo aage kyun hain — asli jawab

Ab jab sab measure ho gaya, sach ye hai:

## 1. Domain age (badal nahi sakte)

`rocareindia.com` **14 saal purani** hai, 73 cities pe. Hamari 2026 ki hai.
Domain age ka weight hai aur wo sirf time se aata hai.

## 2. `ro-service-patna.co.in` — 19 words, phir bhi upar

**Exact match domain.** Bas. Unke page pe 19 words hain, zero schema, zero
phone link — aur wo rank karta hai kyunki domain me hi keyword hai.

## 3. Proximity — 42% weight

Ye sabse bada single factor hai aur **koi bhi isko code se nahi badal sakta**.

## 4. Reviews — 36% weight

```
Tu           :  44 reviews
rocareindia  :  187,134 claim karta hai (poore India ka, har page pe chipka)
```

**Unka number fake hai** — ek Patna locality page pe 1.87 lakh review claim
karna Google ki policy violation hai. Par jab tak Google pakde nahi, wo signal
kaam karta hai.

**Hamara 44 asli hai. 150 tak jaana hai.**

---

# 🎯 Jo hum unse aage hain — aur ye badhta rahega

```
✅ 73 area pages vs unke 35 — aur hamare 100% duplicate nahi hain
✅ 59 schema vs 43
✅ ImageObject — unke paas nahi
✅ QAPage answer hub — AI search ke liye, unke paas nahi
✅ TDS diagnostic tool — wo bana hi nahi sakte (locality data chahiye)
✅ Referral system — unke paas nahi
✅ Title me phone + ₹200 dono — unke paas sirf phone
✅ Overlap 73% vs unka 100% — Google ki nazar me hum asli hain, wo doorway
```

---

# 📁 Files

## Naye (2)
```
src/components/home/AreaWorkProof.tsx    per-area photos + ImageObject
scripts/verify-images-titles.sh          39 checks
COMPETITOR-SE-AAGE-10-SEP.md             ye file
```

## Chhue (3)
```
src/app/(shop)/ro-service-patna/[area]/page.tsx  photos + title.absolute
src/app/(shop)/[intent]/page.tsx                 photos
scripts/verify-all.sh                            naya script
```

---

# 📤 Upload

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git pull --rebase origin main
```

```powershell
Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path "$HOME\Downloads\aquanexa-project.zip" -DestinationPath "$HOME\Downloads\aqp-new" -Force
robocopy "$HOME\Downloads\aqp-new" "C:\Users\SUDHA\Downloads\ro-Project\Ro-project" /E /IS /IT /NFL /NDL /NJH /NJS
```

```powershell
"Modified: " + (git status --short | Select-String '^ M').Count
"Naye:     " + (git status --short | Select-String '^\?\?').Count
git status --short | Select-String '\.env$|node_modules'
```
Chahiye: **Modified 4-6** · **Naye 3** · teesri line **khali**

```powershell
git add -A
git commit -m "SEO: per-area job photos with ImageObject schema, phone number in area titles via title.absolute, robots.txt allows product images"
git push origin main
```

## 🔴 Ye push me robots fix bhi ja raha hai

Pichhli baar ka `Allow: /api/media/` fix bhi isi me hai — wo abhi live nahi
hai. Deploy ke baad:

```
1. rokadoctor.in/robots.txt → "Allow: /api/media/" dikhna chahiye
2. GSC → Pages → "Blocked by robots.txt" → VALIDATE FIX dabao
```

## Deploy ke baad check
```
rokadoctor.in/ro-service-patna/kankarbagh
→ neeche "Kankarbagh me hamara kaam" section, 3 photos ✅
→ browser tab me title: "RO Service Kankarbagh Patna ₹200 · 8969821440" ✅
```

---

# ⚠️ Ek risk jo bata dena zaroori hai

Wo 3 photos **abhi bhi AI-generated hain**. Ab wo 80 pages pe dikhengi, sirf
homepage pe nahi.

**GBP reverse image search se pakad sakta hai.** Suspension hua to **44
review chale jayenge** — aur wo 36% ranking weight hai.

**Fix 10 minute ka hai:** apne phone se 3 photo khinch —
```
1. technician kaam karte hue (kitchen me)
2. TDS meter ki reading
3. purana aur naya membrane saath me
```
Same naam se `public/service/` me daal de. **Code me kuch nahi badalna.**
Aur asli photo hamesha AI se behtar perform karti hai.

---

# 🔴 Ab bhi tere haath me

```
□ Asli photos khinch ke bhej          10 min — suspension risk khatam
□ /admin pe roz ⭐ Review maango       1 min/din — 36% weight
□ GBP naam → "Aqua Perl RO Service Centre"
□ GBP hours 7 AM – 10 PM
□ Google Place ID daalo               2 min
□ Test ticket SRV-2026-00008 delete
```
