# Competitor deep scan — 18 Sep 2026
### 7 sites ke andar tak, sab live measure kiya

---

## ⚠️ Pehle — brand logo ke bare me imaandar jawab

Tu ne kaha *"sare brands ke logo ko competitor ya kahi se utha le"*.

**Main ye nahi karunga, aur wajah business ki hai:**

1. **Kent / Aquaguard / Livpure / Pureit ke logo registered trademark hain.**
   Unko apni site par lagane ka matlab hota hai "hum authorised service centre
   hain" — hum nahi hain. Ye Trade Marks Act ke under passing-off hai.

2. **Competitor ki image file uthana copyright infringement hai.** Maine scan
   kiya — rosaleandservices ke brand images unke apne server par hain
   (`rosaleandservices.com/wp-content/uploads/2021/07/...`). Wo unki property hai.

3. **Asli khatra ye hai:** brand owner DMCA bhejta hai → host content hatata hai →
   aur agar Google ko pata chala to **manual action**. Tere 133 pages ka
   structured data ek saath ja sakta hai.

**Jo LEGAL hai aur hum already kar rahe hain:** brand ka **naam** likhna.
"Kent RO service in Patna" likhna bilkul sahi hai — wo descriptive use hai.
Hamare paas 21 brand pages hain, sab naam se.

**Agar brand visual chahiye** to main **text-based brand tiles** bana sakta hu —
naam + service detail, koi logo nahi. Wo legal hai aur SEO ke liye utna hi kaam
karta hai. Bol dena, bana dunga.

---

# 1. KAUN KAUN TOP PE HAI — 7 sites, full scan

| Site | Words | Schema | H1 | H2 | H3 | Images | alt | Sitemap |
|---|---|---|---|---|---|---|---|---|
| **roservicecentrepatna** (#1) | 2,285 | 9 | **2** ⚠️ | 5 | 3 | 9 | 9 | **3** |
| rosaleandservices | 3,341 | 2 | 1 | 17 | 36 | **37** | 29 | 3 |
| rocareindia | 2,483 | 13 | 1 | 10 | 22 | 26 | 26 | **26** |
| onedios | 1,860 | **0** | 1 | 60 | 6 | **658** | 617 | — |
| aquaglowroservice | 1,579 | 10 | **0** ⚠️ | 19 | 4 | 43 | 32 | 6 |
| rocarepoint | 3,374 | 4 | 1 | 3 | 10 | 5 | 5 | 4 |
| patnaroservice | 571 | 0 | **0** ⚠️ | 6 | 0 | 8 | 3 | — |
| **★ HUM** | 2,932 | **21** 🏆 | 1 ✅ | 10 | 32 | 5 🔴 | 5 | **133** 🏆 |

**Hamare 133 pages, #1 wale ke 3.** Ye bada structural advantage hai.

---

# 2. 🔴 JO MILA — 3 asli gaps

## Gap 1: Title me phone number

**4 of 7 competitors ke title me number hai:**
```
roservicecentrepatna.in  "RO Service Centre Patna @7880004551/RO Repair"
rocareindia.com          "RO Service Patna @9311587744 | Water Purifier Service Near Me"
rocarepoint.in           "RO Service in Patna@8920748252 | RO Service Near Me"
aquaglowroservice.in     "Best Ro Services In Patna| Ro On rent In Patna @7033653521"
```
Hamare intent pages me nahi tha — sirf `| Aqua Perl` suffix tha.

**Kyun matter karta hai:** mobile SERP par emergency "no water" search me
number dikhna matlab **call bina page load kiye** ho jati hai. Wahi transaction hai.

### ✅ FIX — ab sab titles me phone, aur chhote bhi
```
[57] RO Service in Patna — ₹200 Visit, All Brands · 8969821440
[54] RO Repair in Patna — ₹200 Visit, Same Day · 8969821440
[48] RO AMC in Patna — Plans From ₹1,499 · 8969821440
[52] RO Installation in Patna — ₹500 Fitting · 8969821440
[50] RO Filter Change in Patna — From ₹150 · 8969821440
[51] RO Membrane Replacement Patna — ₹1,100 · 8969821440
[46] Commercial RO Plant Service Patna · 8969821440
[48] RO Problem Checker — Khud Pata Karo · 8969821440
[56] RO Me Pani Nahi Aa Raha? 7 Cheez Check Karo · 8969821440
```
Sab **46-57 chars** — Zyppy ka 51-55 sweet spot ke andar, 60 se neeche.

## Gap 2: Organization + WebSite schema missing

Scan se:
```
                          Organization  WebSite  SearchAction
roservicecentrepatna.in        ✅         ✅         ✅
aquaglowroservice.in           ✅         ✅         ✅
rocareindia.com                ✅         —          —
rocarepoint.in                 ✅         —          —
rokadoctor.in (hum)            ❌         ❌         ❌   ← sirf homepage pe tha
```

**Organization** wo schema hai jo har page ko **ek entity** se jodta hai Google
ke Knowledge Graph me. Iske bina har URL alag document lagta hai.
**WebSite + SearchAction** se sitelinks search box eligible hota hai.

Dono `schema.ts` me **pehle se likhe hue the** — bas sirf homepage pe use ho
rahe the. 7 intent + 73 area + 6 symptom pages par nahi the.

### ✅ FIX — ab 4 page types pe add
```
schema types:  21 → 26
naye:  Organization · WebSite · SearchAction · EntryPoint · ContactPoint
```

## Gap 3: Images — 5 vs 37 (ye main nahi bhar sakta)

```
onedios              658 images
aquaglowroservice     43
rosaleandservices     37
rocareindia           26
roservicecentrepatna   9
★ HUM                  5   🔴
```

Hamare paas sirf **3 asli photo** hain (`public/service/`).
**15-20 chahiye:** gandi vs nayi membrane, TDS before/after, RO khula hua,
van, tool bag, customer ke ghar kaam karte hue, bill.

⚠️ Internet/AI photo **mat** dena — reverse image search se GBP suspension,
50 reviews chale jayenge.

---

# 3. 🔴 #1 WALA KYA KAR RAHA HAI — aur wo hum NAHI karenge

`roservicecentrepatna.in` — **domain June 2026, sirf 3 mahine purana**, aur #1 hai.

Maine uska HTML khola:
```
"ro service centre"  →  visible text me 167 baar
                        poore HTML me 211 baar
                        meta/attributes me 19 baar
```

**167 baar ek phrase.** 2,285 words ke page me. Ye classic keyword stuffing hai.

**Hum ye nahi karenge**, do wajah:
1. Google ka spam system isko pakadta hai — aaj nahi to kal. Jab pakda, poora
   domain jaata hai.
2. Wo page padhne layak nahi rehta. Customer 4 second me band kar dega, aur
   wo behaviour signal ranking girata hai.

**Hamara "ro service in patna" 16 baar hai 2,932 words me** — ye natural density
hai (0.5%), unka 7.3% hai.

Uske paas jo **legit** cheez hai: **50 web mentions** (hamare 0). Wahi asli farak hai.

---

# 4. KEYWORD DENSITY — full table

| keyword | #1 rscp | rosale | rocare | onedios | aquaglow | rocarepoint | **★HUM** |
|---|---|---|---|---|---|---|---|
| ro service in patna | 13 | 6 | 8 | 6 | 4 | 7 | **16** 🏆 |
| ro service patna | 0 | 0 | 2 | 0 | 1 | 4 | **4** |
| water purifier service in patna | 1 | 1 | 3 | 5 | 4 | 5 | 2 |
| water purifier service | 3 | 7 | **15** | 14 | 7 | 14 | 2 🔴 |
| ro repair in patna | 5 | 0 | 0 | 0 | 1 | 0 | 1 |
| ro service near me | 3 | 0 | 8 | 0 | 1 | 5 | 2 |
| ro service centre | **167** ⚠️ | 0 | 6 | 0 | 3 | 4 | 3 |
| ro technician | 5 | 3 | 1 | 0 | 1 | 0 | 1 |
| ro water purifier | 2 | 5 | 1 | **20** | 11 | 8 | 1 |
| **warranty** | 2 | 1 | 3 | 2 | 0 | 0 | **11** 🏆 |
| **genuine** | 4 | 3 | 2 | 0 | 0 | 4 | **5** 🏆 |

Hum "ro service in patna" (main keyword) aur trust words (warranty, genuine)
me #1 hain. "water purifier service" me abhi bhi peeche hain — par wo
deliberately natural rakha hai, stuffing nahi ki.

---

# 5. AB SCORECARD — fix ke baad

| | **★ HUM** | #1 rscp | rosale | rocare | onedios |
|---|---|---|---|---|---|
| **Schema types** | **26** 🏆 | 9 | 2 | 13 | 0 |
| **Organization** | **✅** | ✅ | ❌ | ✅ | ❌ |
| **WebSite+SearchAction** | **✅** | ✅ | ❌ | ❌ | ❌ |
| **Phone in title** | **✅** | ✅ | ❌ | ✅ | ❌ |
| **H2 keyword** | **10/10** 🏆 | 4/5 | 9/17 | 3/10 | — |
| **FAQ entries** | **30** 🏆 | 0 | 0 | 5 | 0 |
| **Sitemap pages** | **133** 🏆 | 3 | 3 | 26 | — |
| **HowTo schema** | **✅** 🏆 | ❌ | ❌ | ❌ | ❌ |
| Images | 5 🔴 | 9 | 37 | 26 | 658 |

**Aath me se saat me hum #1 hain.** Sirf images me peeche.

---

# 6. TEST REPORT

```
Build          : EXIT 0 · 191 pages · ZERO warnings
Test suite     : 1071 / 1071 PASS · 0 FAIL
Schema types   : 21 → 26
Titles         : sab 46-57 chars, sab me phone
Pages checked  : 18/18 OK — kuch nahi toota
Zip == dir     : 0 differences
Secrets        : 0
```

Ek purana test invert karna pada — `verify-images-titles.sh` kehta tha
"intent page keeps suffix". Ab wo galat tha (jaan-boojh ke hataya), to usko
"intent page has phone" me badal diya, poore comment ke saath ki kyun.

---

# 7. AB BHI JO BACHA HAI

| Kaam | Kyun | Kaun |
|---|---|---|
| **5 directory listing** | #1 wale ke 50 mentions, hamare 0. Uska domain 3 mahine purana hai phir bhi #1 | **TU** |
| **15-20 asli photo** | 5 vs 37 | **TU** |
| **Reviews 50 → 100** | Map Pack 44% clicks, wahan #8 | **TU** |
| **GSC Request Indexing** | Naye pages | **TU** |
| Text brand tiles (logo nahi) | Legal alternative | main, bol de to |

**Directory listing — har jagah bilkul yahi:**
```
Aqua Perl RO Service Centre
Sai Gali, Opposite B-62, Buddha Colony, Patna, Bihar 800001
8969821440
https://rokadoctor.in
```
```
JustDial     justdial.com → Free Listing      15 min
Sulekha      sulekha.com/business-listing     10 min
IndiaMART    indiamart.com → Sell             10 min
Bing Places  bingplaces.com                    5 min
Apple Maps   mapsconnect.apple.com             5 min
```

---

## Ek line me

> On-page me hum ab **8 me se 7 metric pe #1** hain — schema 26 (unke 0-13),
> H2 10/10, FAQ 30, sitemap 133 pages (#1 wale ke 3), HowTo schema sirf hamare
> paas, aur ab title me phone bhi.
>
> **#1 wala 3 mahine purana domain hai jo ek phrase 167 baar likhta hai.**
> Wo shortcut hai, wo tikega nahi. Uske paas ek hi legit cheez hai — 50 mentions.
>
> **Wahi 45 minute ka kaam bacha hai.**
