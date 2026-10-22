# 🔴 "RO service near me" se top pe kyun nahi aate — poora naap

**22 Oct 2026** · Owner ka sawaal: *"'ro service in patna' se top pe aata hoon,
par 'ro service near me' **alag alag jagah** se search karne par nahi aata.
Competitor dono se aate hain. Kyun?"*

Maine andaaz nahi lagaya. 6 competitor page, apne 83 area page, aur 2026 ka
Whitespark + Sterling Sky data — sab naapa. Jawab neeche hai, aur wo wo nahi
hai jo tu soch raha hai.

---

## 1. Sabse pehle: ek galat soch hata deta hoon

**Tu soch raha hai: "unke page me kuch hai jo mere page me nahi hai."**

**Naap:**

| | words | title len | H2 | H3 | JSON-LD | "near me" | tel: |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Aqua Perl home** | **6,303** | 48 | 15 | **124** | 1 blk / **16 type** | **32** | **21** |
| urbancompany | 3,603 | 79 | 9 | 2 | 1 blk / 10 type | **0** | 0 |
| rocareindia | 2,195 | 60 | 8 | 22 | 4 blk | 7 | 6 |
| rosaleandservices | 3,497 | 59 | 18 | 40 | **sirf Breadcrumb** | 1 | 19 |
| roservicecentrepatna (#1) | 2,285 | 45 | 5 | 3 | 3 blk | 3 | 6 |
| patnaroservice.co.in | **569** | 43 | 6 | 0 | **ZERO** | 1 | 4 |
| patnaroservice.in | **670** | — | — | — | **ZERO** | 0 | — |

**`patnaroservice.co.in` ke paas 569 word hain, koi JSON-LD nahi, koi sitemap
nahi — aur wo dikh raha hai.** `urbancompany` ke page par "near me" **ek baar
bhi nahi** hai — aur wo top par hai.

Schema me to hum sabse aage hain. Hamare paas `GeoCircle`, `GeoCoordinates`,
`OpeningHoursSpecification`, `OfferCatalog`, `LocalBusiness+HVACBusiness` hai.
`rosaleandservices` ke paas sirf BreadcrumbList hai. Do sites par JSON-LD hai
hi nahi.

🔴 **Matlab saaf: "near me" ka rank content ya schema se nahi aata.**

---

## 2. Toh phir kahan se aata hai — 2026 ka asli data

"near me" par **do bilkul alag system** chalte hain. Yahi poori baat hai.

```
┌─────────────────────────────────────────────────────────────┐
│  MAP PACK  (map wale 3 result)          42-58% click        │
│  ─────────────────────────────────────────────────────────  │
│  proximity (doori)        ~55%   ← website se NAHI badalta  │
│  GBP signals              ~32%   ← GBP se badalta           │
│  reviews                  ~20%   ← GBP se badalta           │
│  on-page (website)        ~15%                              │
│  links                     ~8%                              │
├─────────────────────────────────────────────────────────────┤
│  LOCAL ORGANIC  (map ke neeche neele link)                  │
│  ─────────────────────────────────────────────────────────  │
│  on-page                   33%   ← yahan hum sabse aage     │
│  LINKS                     24%   ← 🔴 hamare paas ZERO      │
│  behaviour                 10%                              │
│  personalization            8%                              │
│  GBP                        7%                              │
│  citations                  7%                              │
│  reviews                    6%                              │
└─────────────────────────────────────────────────────────────┘
```
*Whitespark 2026 Local Search Ranking Factors — 47 expert, 187 factor,
Nov 2025 me publish.*

**Local organic ke top-5 factor (expert survey):**
1. Har service ka alag page ✅ **hamare paas hai**
2. Area/colony keyword relevance ✅ **hamare paas hai (83 page)**
3. 🔴 **Domain par aane wale link ki quality aur authority — hamare paas 0**
4. GBP landing page ke title me keyword ✅
5. 🔴 **Industry domains se link ki sankhya — hamare paas 0**

---

## 3. 🔴 ASLI WAJAH — maine naapi

### Wajah A — Map Pack: hum geographically door hain

Hamara ek hi pata hai: **Buddha Colony (25.6093, 85.1376)**.
Maine apne 83 area ki haversine doori naapi:

```
0-3 km      23 area   27.7%  █████████████
3-5 km      27 area   32.5%  ████████████████
5-8 km      19 area   22.9%  ███████████
8-12 km     13 area   15.7%  ███████
12+ km       1 area    1.2%

5 km+ door : 33 / 83  (40%)
median     : 4.3 km
sabse door : Danapur 9.5 · Marufganj 9.7 · Chandmari 9.9 ·
             Khagaul 10.1 · AIIMS Patna 11.0 · Anandpur 17.5 km
```

Proximity Map Pack ka **~55%** hai. Jab tu Khagaul (10.1 km) ya AIIMS
(11 km) se "ro service near me" karta hai, to Google ke liye hum **door**
hain. Ek pata poore Patna ke "paas" nahi ho sakta. **Ye code se theek nahi
hota — duniya ka koi code isko theek nahi kar sakta.**

🔴 Aur November 2021 ka **Vicinity update** + March 2026 core update ne
proximity ko aur kas diya: *"Google tightened proximity signals in
competitive categories, reducing the radius within which non-proximate
businesses can rank for high-intent local queries."*

### Wajah B — Local Organic: hamare paas 0 backlink hain

Links local organic ka **24%** hain. Hamare paas **0** hain. Competitor ke
~50. Domain bhi sirf 13.5 mahine purana hai. On-page (33%) me hum jeet rahe
hain, par 24% wala khaana poora khaali hai.

### Wajah C — jo code SACH ME theek kar sakta tha, wo tha hi nahi

LIVE par naapa, 83 area page:

```
title me "near me"     0 / 83   🔴
meta desc me           0 / 83   🔴
H1 me                  0 / 83   🔴
H2 me                  0 / 83   🔴
H3 me                 83 / 83   ← sirf sabse kamzor heading level par
body me                4 baar har page
```

**Sterling Sky ka 8,186-business / 200-city test:**
> "near me" ko **title, header aur URL** me rakhne se **local organic
> uthta hai**. Map Pack par **"didn't move the needle at all."**

Yaani hamare 83 area page par "near me" sirf H3 me pada tha. Ye **ek asli,
theek hone layak gap tha** — aur maine ise theek kar diya.

---

## 4. Jo maine banaya

🔴 **Kuch hataya nahi. Kuch badla nahi. Sirf joda.**
Purana H3 near-me block 83/83 page par **jaisa tha waisa hai** — test isi
ko pakadta hai.

### A. `src/lib/geo/nearest-area.ts` — NAYI FILE
Zero dependency geo library. `patna-service-data.ts` me pehle se maujood
`lat`/`lng` (83 area, 0 duplicate) par haversine chalati hai.
```
haversineKm()   do point ki doori
nearestAreas()  kisi bhi jagah se sabse paas ke N area
areasByPincode() pincode se area
kmFromBase()    hamare pate se doori
patnaBounds()   coverage grid ke liye
```
React import nahi hai, isliye `'use client'` file se import karna safe hai.

### B. `src/components/service/NearMeResolver.tsx` — NAYI FILE
83 area page par **H2** deta hai: `RO Service Near Me — {Area}, Patna`
← yahi Sterling Sky wala organic lever hai.

Saath me kaam ki cheez: visitor "📍 Mera area dhoondo" dabata hai →
browser location → haversine → sabse paas ke 3 area, doori + response time +
TDS ke saath → seedha uske area page ka link. GPS mana kiya to pincode se.

🔴 **Location kabhi server par nahi jaati.** Poora hisaab browser me. Koi
cookie nahi, koi third-party geocoder nahi, koi paisa nahi.

Isse **behaviour signal** sudharta hai (Map Pack ~9%, organic ~10%, 2026 me
"rising sharply"): visitor turant apna area paata hai, Google par wapas nahi
jaata, aur call tak kam step me pahunchta hai.

### C. `scripts/near-me-grid.py` — NAYA measurement tool
Patna par 12×12 grid daal kar naapta hai ki hamara coverage kahan hai aur
kahan geography hamare khilaaf hai. **Andaaz band, naap shuru.**

### D. `scripts/near-me-selftest.mts` + `scripts/verify-near-me.sh` — naye gate
`verify-all.sh` me 27va script ban gaya.

---

## 5. 🔴 Jo maine JAAN-BUJH KAR nahi kiya — aur kyun

### 83 area page ke TITLE nahi badle
"Near Me" title me daalne se organic uthta hai — par ye 83 title abhi
`ro service in patna` wali queries par **rank kar rahe hain**. Unhe chhedna
us jeet ko risk me daalna hai. H2 se wahi faayda bina risk ke mil raha hai.
Jab H2 ka asar GSC me dikh jaye, tab title par baat karenge.

### Schema me 83 area ke naam nahi thoonse
Mujhe research me ye mila: *"Define service areas as cities and regions, not
radius distances — Google's algorithm prefers explicit boundaries over
geometric ones."*

**Par wo baat GBP ke service-area setting ke baare me thi, schema ke baare me
NAHI.** Schema me 83 naam daalne se har page ~10 KB bhaari hota aur iska koi
proof nahi mila. **Bina proof ke main tere live site par kuch nahi daalta.**
Wo kaam **GBP me** karna hai — neeche likha hai.

### Koi naya "near me" page nahi banaya
Homepage ka H1 pehle se `RO Service Near Me in Patna` hai. Ek aur near-me
page banana **cannibalization** hota — do page ek hi query par aapas me
ladte. Aur har area ka alag "near me" page banana **doorway page** hai, jo
Google ki spam policy todta hai.

---

## 6. Ab asli kaam — ye code nahi hai, ye **tera** kaam hai

Map Pack ka 55% proximity hai jo badal nahi sakta. Baaki 45% me hum jeet
sakte hain — par wo sab **GBP** me hai, website me nahi.

| # | Kaam | Kitna asar | Time |
|---|---|---|---|
| 1 | 🔴 **GBP → Service areas**: Patna ke 20 ilaake **naam se** daalo (radius nahi) | Map Pack relevance | 10 min |
| 2 | 🔴 **GBP hours**: "Open 24 hours" hatao → 08:00–21:00 | **top-5 factor** system-wide | 2 min |
| 3 | 🔴 **GBP primary category**: "Water purifier supplier" nahi — **"Water purifier repair service"** | **#1 single factor** | 2 min |
| 4 | 🔴 **Reviews 60 → 200**, mahine me 5–10 ki raftaar se | 20% of Map Pack | chalta rahe |
| 5 | 🔴 **Backlinks 0 → 20**: Udyam, Bing Places, JustDial, IndiaMART, Sulekha | **24% of organic** | 1 din |
| 6 | GBP photos 10 → 100+ | prominence | 1 din |

**#3 par dhyan de** — Whitespark 2026 me *primary GBP category* **sabse bada
akela factor** hai, aur *"choosing the wrong primary category was the single
most damaging negative signal in the entire survey."* Ja ke abhi check kar
tera primary category kya hai.

**#4 ke baare me ek naap:** review velocity par Crawl Theory ka data —
*"steady 5–10 per month beats a one-time burst of 50 — businesses climbed
from position 7–8 to local top 3 from review strategy alone, with no other
changes."* Hum abhi Map Pack me **#8** par hain. Ye hamara exact case hai.

---

## 7. Imaandari se: isse kya hoga aur kya nahi

**Hoga:**
- 83 area page par "near me" ab H2 me hai → **local organic** me sudhaar
  (Sterling Sky ka proven lever)
- Visitor ko 1 second me apna area milega → behaviour signal sudhrega
- Ab hum naap sakte hain ki kahan kamzor hain

**Nahi hoga:**
- 🔴 **Map Pack me #8 se #3 nahi aayega.** Wo GBP ka kaam hai, code ka nahi.
- 🔴 Khagaul ya AIIMS se "near me" karne par turant top par nahi aayenge —
  wo 10-11 km door hai.

Main tujhe jhooti ummeed nahi dunga. Code ne wo sab kar diya jo code kar
sakta tha. **Ab jo bacha hai wo 10 minute ka GBP kaam hai — aur wahi sabse
bada bacha hua lever hai.**
