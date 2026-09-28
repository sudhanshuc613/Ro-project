# Performance Audit — 22 Sep 2026

Poora live scan. 143 URLs, 9 competitors. Sab measure karke, andaza nahi.

---

## ⚠️ Pehle — ek galti jo main karte-karte bacha

Maine Bing se indexing measure karne ki koshish ki. Number aaya:

```
site:rokadoctor.in              → "About 50 results"
site:roservicecentrepatna.in    → "About 575 results"
```

Main ye likhne hi wala tha ki *"hamare sirf 50 pages index hain, unke 575!"*

**Phir control test kiya:**

```
site:rokadoctor.in                          → "About 6,190 results"  (abhi 50 tha!)
site:thisdomaindoesnotexist12345xyz.com     → "About 41 results"     (fake domain!)
site:wikipedia.org                          → "none"
```

**Bing ke numbers bilkul jhoothe hain.** Fake domain bhi 41 results de raha hai.

Ye wahi galti thi jo maine pehle DuckDuckGo ke saath ki thi. **Isliye main tumhe indexing
ke koi number nahi dunga — wo sirf GSC me dikhega.**

---

## ✅ Jo sahi hai (sab live verify kiya)

### Technical health — 143/143 clean

```
non-200            : 0
noindex            : 0
missing canonical  : 0
missing title      : 0
missing description: 0
ORPHAN pages       : 0        ← har page ko internal link milta hai
img without alt    : 0
H1 count           : 1 per page
viewport / lang    : ✅
brotli compression : ✅  383 KB → 40 KB transfer
404 handling       : ✅  fake URLs → 404
uppercase redirect : ✅  301
trailing slash     : ✅  308
```

### Speed (3 baar measure kiya, warm)

```
/                       0.15 – 0.17s  ✅
/ro-service-in-patna    0.10 – 0.11s  ✅
/ro-service-patna/*     0.44 – 0.54s  ✅
/products               0.76 – 0.81s  ⚠️  sabse dhima, par theek
```

Pehla reading 1.2s aaya tha — wo cold start tha, asli nahi.

### On-page — hum har competitor se aage hain

| Site | Words | H2 | Schema | Internal links | tel: | WhatsApp |
|---|---|---|---|---|---|---|
| **★ HUM /** | **5,393** | 13 | **21** | **140** | **20** | **17** |
| rosale | 3,367 | 17 | 2 | 70 | 19 | 1 |
| rocarepoint | 2,824 | 4 | 4 | 18 | 5 | 1 |
| rocare | 2,483 | 10 | 13 | 115 | 6 | 0 |
| rscp (#1) | 2,285 | 5 | 9 | 76 | 6 | 1 |
| aquaglow | 1,581 | 19 | 10 | 40 | 18 | 3 |
| roservicepatna.com | 789 | 3 | 0 | 0 | 2 | 0 |
| patnaroservice.com | 570 | 0 | 0 | 0 | 17 | 0 |
| roservicebihar.com | 417 | 7 | 0 | 0 | 7 | 4 |
| ro-service-patna.co.in | **19** | 0 | **0** | 4 | 0 | 0 |

**Schema ka "gap" jhootha nikla** — maine pehle socha unke paas Article/Product hai hamare
paas nahi. Phir check kiya: hamara blog pe `Article` hai, product pages pe `Product` +
`Brand` + `Offer` + `MerchantReturnPolicy`. Sirf homepage compare karne se galat lag raha tha.

---

## 🔴 3 ASLI BUG MILE — aur teeno fix kar diye

### BUG 1 — DUPLICATE TITLE (cannibalization)

Do brand pages ka title **bilkul ek jaisa** tha:

```
/service-patna/brand/commercial-ro  →  "All Brands RO Service Patna — ₹200 Visit | Aqua Perl"
/service-patna/brand/other-brands   →  "All Brands RO Service Patna — ₹200 Visit | Aqua Perl"
```

Description bhi same. **Google do same-title pages me se ek hi dikhata hai** — matlab ek
page poora waste ho raha tha.

**Wajah — code me ye tha:**
```js
const label = short.length > 22 ? 'All Brands' : short;
```
Do brands ka naam 22 se lamba hai, isliye dono `'All Brands'` ban gaye:
```
"Commercial & Industrial RO Plants"         (33) → All Brands
"All Other Brands & Local Assembled Units"  (40) → All Brands
```

**Aur ek chhupa hua problem:** `/service-patna/brand/commercial-ro` ka apna intent page bhi
hai — `/commercial-ro-service-patna` ("Commercial RO Plant Service Patna"). Agar brand page
bhi wahi phrase leta to **teen** pages ladte.

**Fix:** naya file `src/lib/seo/brand-labels.ts` — har lambe naam ka unique label:
```
commercial-ro  →  "Industrial RO Plant"    (intent page se alag phrase)
other-brands   →  "Local & Assembled RO"
aquaultra      →  "AquaUltra"              (title 64 → 60 char)
```

Ab 21/21 brand titles **unique**, sab 62 char ke andar.

### BUG 2 — 5 titles 62 char se lambe

Zyppy ka 2026 data: **61-70 char titles Google 70% baar khud rewrite kar deta hai.**
51-55 sabse behtar (~40%).

```
64ch  /service-patna                        → 55ch ✅
64ch  /service-patna/brand/aquaultra        → 60ch ✅
65ch  /blog/patna-me-tds-kitna-hona-chahiye → 55ch ✅
64ch  /blog/ro-uv-uf-me-kya-farak-hai       → 53ch ✅
63ch  /category/accessories                 → 57ch ✅
```

⚠️ `/service-patna` ka title badla par **target phrase "water purifier repair patna" poora
bacha hai** — sirf "Centre" shabd hata.

### BUG 3 — 6 descriptions 160 se lambi

SERP me kat jaati hain aur Google apna snippet bana leta hai:

```
170ch  /ro-filter-change-patna       → 136 ✅
167ch  /commercial-ro-service-patna  → 125 ✅
166ch  /ro-problem/ro-leakage-problem → 130 ✅
163ch  /ro-amc-patna                 → 132 ✅
163ch  /category/new-ro-purifiers    → 123 ✅
161ch  /ro-repair-patna              → 134 ✅
```

### Naya test — ye teeno dobara nahi honge

`scripts/verify-serp-hygiene.sh` — poore sitemap pe 9 checks:
duplicate title · duplicate description · title 30-62 char · description 70-160 char ·
missing title/desc · brand-geo signal.

---

## 🔴 EK AUR GAP MILA — social profiles (sameAs)

Maine competitors ke external links dekhe:

```
rosale  →  facebook.com · instagram.com · linkedin.com · twitter.com
           youtube.com · pinterest.com · maps.app.goo.gl
HUM     →  google.com · wa.me                              ← bas itna
```

**Hamare schema me `sameAs` bilkul nahi hai.**

`sameAs` wo field hai jisse Google confirm karta hai ki business asli hai — website,
Facebook page, GBP, YouTube sab ek hi entity hain.

**Par main ye abhi add nahi kar sakta** — kyunki jab tak tere paas asli Facebook/Instagram
page nahi hai, fake link daalna wahi galti hai jo pehle pakdi gayi thi (bug #3: "fake social
links"). Jhoothi `sameAs` Google pakad leta hai.

**Ye tere 52-minute wale kaam ka hissa hai.** Facebook + Instagram business page bana le,
mujhe URL de de — main usi din `sameAs` schema me daal dunga. Tab wo ek asli trust signal
banega.

---

## Ek aur cheez jo dikhi — competitor ka link network

`roservicecentrepatna.in` (#1) `repairservicebro.com` ko link karta hai.

```
rscp                  phone 7880004551
repairservicebro.com  phone 7880007124   ← lagbhag same number pattern
                      title: "Best Ro service | Ac service | Geyser service"
```

Ye lagta hai **ek hi maalik ki do sites** hain jo aapas me link karti hain — chhota
private link network.

**Hum ye nahi karenge.** Google ka link-scheme detection 2026 me ye pakad leta hai, aur
manual action lagta hai. Hum legit directory listings se backlink banayenge.

---

## Keyword density — rscp vs hum (visible text)

| keyword | rscp (#1) | HUM |
|---|---|---|
| ro service | **203** | 28 |
| patna | **209** | 60 |
| ro service centre | **167** | 4 |
| ro repair | 12 | 7 |
| water purifier | 9 | 5 |
| near me | 3 | **6** |
| installation | 3 | **14** |

**Ye stuffing hai, hum copy nahi karenge.** "ro service centre" 167 baar ek page pe —
ye 2026 me ranking factor nahi, risk hai. Par ye samjhata hai ki wo kyu upar hai despite
2,285 words vs hamare 5,393.

---

## Test report

```
Clean build        : EXIT 0
Test suite         : 1140/1140 PASS, ZERO FAIL   (1131 → +9)
  verify-serp-hygiene : 9/9   ← NAYA
Live 143 URLs      : 200, 0 noindex, 0 orphan
Brand titles       : 21/21 unique, sab <=60 char
Descriptions       : sab <=160
```

---

## Kya badla

```
[NAYI]  src/lib/seo/brand-labels.ts              unique brand SERP labels
[NAYI]  scripts/verify-serp-hygiene.sh           9 naye checks
[NAYI]  PERFORMANCE-AUDIT-22SEP.md               ye file

[BADLI] src/app/(shop)/service-patna/brand/[brand]/page.tsx   duplicate title fix
[BADLI] src/app/(shop)/service-patna/page.tsx                 title 64 → 55
[BADLI] src/lib/seo/blog-data.ts                              2 titles chhote
[BADLI] src/lib/seo/catalog-seo.ts                            title + desc
[BADLI] src/lib/seo/service-intent-data.ts                    4 descriptions
[BADLI] src/lib/seo/symptom-data.ts                           1 description
[BADLI] scripts/verify-all.sh                                 naya test register
```

**Koi content delete nahi hua. Images nahi chhui. Admin nahi chhua.**

---

## Ab bacha kya hai — sach

On-page pe **ab koi bug nahi bacha**. Jo bacha hai wo code se theek nahi hota:

```
🔴 Backlinks = 0          (#1 ke ~50)
🔴 sameAs / social = 0    (rosale ke 6)      ← Facebook page banao, main schema me daal dunga
🔴 Reviews = 50           (Nishant 564, Map Pack #1)
🔴 Images = 7             (rosale 37, rocare 26)
⚠️ 6 thin pages           (products 479-568 words)
```

**Aur ek baat jo sabse zaroori hai:**

Main ye measure **nahi kar sakta** ki abhi hum kis keyword pe kis number pe hain. Google
bot-scraping block karta hai, aur Bing ke numbers jhoothe hain (upar proof hai).

```
Search Console → Performance → Last 28 days
  Queries tab  → kis shabd pe log aaye
  Pages tab    → kaun sa page dikha
  Position     → konsa number
```

**Ye screenshot bhej de.** Position 11-20 wale pages sabse aasaan jeet hote hain — thoda
dhakka lagane se page 1 pe aa jaate hain. Uske bina main sirf andaza laga sakta hoon, aur
wo main nahi karunga.
