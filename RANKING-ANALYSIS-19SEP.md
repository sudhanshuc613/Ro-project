# Ranking Deep Analysis — 19 Sep 2026

Sab live measure. Jahan measure nahi kar paya wahan saaf likha hai.

---

## ⚠️ Pehle: pichhla zip PUSH NAHI HUA

```
Live sitemap URLs : 133   (zip ke baad 142 hona chahiye)
Live area pages   : 73    (zip ke baad 83)
/ro-service-patna/ashok-rajpath → 404
/ro-service-patna/zero-mile     → 404
/ro-service-patna/rps-more      → 404
```

**`aquaperl-10-NEW-AREAS.zip` abhi tak live nahi gaya.** Us zip ke 10 area pages aur is zip ka keyword fix — dono ek saath is naye zip me hain.

---

## 🔴 SABSE BADA FINDING — 6 asli keywords poori site pe ZERO

Maine Google Autocomplete (India) se live scrape kiya — jo phrases Google **khud suggest karta hai**, matlab jinke peeche asli search volume hai:

```
ro service patna                  ro service in patna
ro service patna near me          ro service centre patna
ro service centre patna near me   ro repair patna
kent ro service patna             aquaguard ro service patna
aquafresh ro service patna
```

Phir **poori 133-page live site** pe har phrase ko gina:

| Asli keyword (Google ka apna suggestion) | Site pe kitni baar |
|---|---|
| `ro service patna near me` | **0** 🔴 |
| `ro service centre patna` | **0** 🔴 |
| `ro repair patna` | **0** 🔴 |
| `kent ro service patna` | **0** 🔴 |
| `aquaguard ro service patna` | **0** 🔴 |
| `water purifier service patna` | **0** 🔴 |
| `ro service near me` | 4 (2 pages) |

**Chhe phrases jinhe Google khud suggest karta hai, 133 pages me ek baar bhi nahi the.**

### Wajah: grammar ka farq

```
hamare pages  : "RO Repair in Patna"          ← "in" ke saath
log type karte: "ro repair patna"             ← bina "in"

hamare pages  : "RO Service Near Me in Patna"
log type karte: "ro service patna near me"    ← shabd ka order ulta

brand page    : "Kent RO Service in Patna"
log type karte: "kent ro service patna"
```

Hum grammar ke hisaab se sahi likh rahe the. Log search bar me grammar nahi lagate.

---

## Ab asli sawaal: wo top pe kyu hain?

Maine DuckDuckGo se 5 **naye** competitor nikale jo maine pehle kabhi scan nahi kiye, aur unhe measure kiya.

*(Note: DDG ≠ Google. Ye main pehle galti kar chuka hoon aur dobara nahi kahunga ki ye Google ranking hai. Par isse naye domain mile jo asli hain.)*

### On-page comparison — chaunkane wala

| Site | Words | H1 | H2 | Images | Schema | tel: |
|---|---|---|---|---|---|---|
| ro-service-patna.co.in | **19** | 0 | 0 | 1 | **0** | 0 |
| roservicebihar.com | 417 | 2 | 7 | 0 | **0** | 7 |
| patnaroservice.com | 570 | 1 | 0 | 34 | **0** | 17 |
| roservicepatna.com | 789 | **0** | 3 | 20 | **0** | 2 |
| roserviceindia.org | 799 | 1 | 3 | 10 | **0** | 1 |
| roservicecentrepatna.in (#1) | 2,285 | 2 | 5 | 9 | 10 | 6 |
| **★ HUM** | **4,645** | 1 | **12** | 7 | **21** | **20** |

**Ek site 19 words aur ZERO schema ke saath rank kar rahi hai.** Wo ek React app hai jiska content client-side load hota hai — Googlebot ko khaali HTML milta hai.

**Hum on-page pe har ek se aage hain. Phir bhi upar nahi hain. Matlab on-page wajah nahi hai.**

### To phir wajah kya hai — pattern saaf hai

```
roservicecentrepatna.in   ro + service + centre + patna   ← 4 keyword
ro-service-patna.co.in    ro + service + patna            ← 3 keyword
roservicepatna.com        ro + service + patna            ← 3 keyword
patnaroservice.com        ro + service + patna            ← 3 keyword
roservicebihar.com        ro + service + bihar            ← 3 keyword
roserviceindia.org        ro + service + india            ← 3 keyword
──────────────────────────────────────────────────────────────────
rokadoctor.in             ro                              ← 1 keyword  ★ HUM
```

**Har ek jo upar hai uske DOMAIN NAAM me "ro service patna" hai.** Hamare naam me sirf "ro" hai.

### Aur domain umar? — ye maine check kiya

| Domain | SSL first issue |
|---|---|
| roserviceindia.org | Jul 2026 |
| patnaroservice.com | Jul 2026 |
| roservicepatna.com | Aug 2026 |
| roservicebihar.com | Aug 2026 |
| roservicecentrepatna.in | Aug 2026 |
| **rokadoctor.in** | Aug 2026 |

**Sab lagbhag ek hi umar ke hain.** Umar wajah nahi hai.

### Keyword stuffing? — nahi

Maine unke pages pe wahi autocomplete phrases gine:

| keyword | rscp (#1) | rosale | rocare | HUM |
|---|---|---|---|---|
| ro service patna near me | 0 | 0 | 0 | 0 |
| ro service centre patna | 14 | 0 | 0 | 0 |
| ro repair patna | 0 | 0 | 0 | 0 |
| water purifier service patna | 1 | 0 | 0 | 0 |
| kent ro service patna | 0 | 0 | 0 | 0 |

**Unke paas bhi zyadatar ZERO hain.** To stuffing unki ranking ki wajah nahi hai.

---

## Nateeja — hum kyu nahi rank kar rahe

Sach ye hai, tin hisso me:

**1. Domain naam.** Har ranking site ke URL me "ro service patna" hai. Hamare me nahi. Ye ek asli nuksan hai.
→ **Par domain MAT badalna.** 133 pages jo index line me hain wo mar jayenge, aur naye domain ko phir se 0 se shuru karna padega.

**2. Backlinks = 0.** Ye sabse bada hai aur ye code se theek nahi hota. Ye tere haath me hai.

**3. Exact-phrase gap.** Ye maine aaj theek kiya — neeche.

---

## Kya theek kiya (is zip me)

### A) Naya file: `src/lib/seo/search-queries.ts`

Wo 6 phrases ab **poore, sachche vaakya** ke andar hain. Har jawab khud padhne layak hai:

- *"Agar aap RO service Patna near me dhoondh rahe hain — hum 83 mohallon me jaate hain, 90 minute me..."*
- *"Bahut log RO service centre Patna search karte hain. Saaf baat: hum kisi brand ke authorised centre nahi hain..."*
- *"RO repair Patna karane se pehle rate jaan lijiye: visit ₹200, filter ₹150 se, membrane ₹1,100 se..."*

**Ye stuffing nahi hai.** #1 competitor apne homepage pe "ro service centre" 167 baar daalta hai. Hum 1-2 baar, poore vaakya me.

### B) Naya component: `SearchAnswers.tsx` — homepage pe render

6 asli sawaal, 6 seedhe jawab. Schema me bhi jaate hain (FAQPage), aur page pe bhi dikhte hain — dono me same text.

### C) Brand pages pe ek line

`kent ro service patna`, `aquaguard ro service patna` etc. — har brand page pe ek kaam ki line:

> *"Log aksar Kent RO service Patna search karte hain. Hum Kent ke authorised centre nahi hain — hum swatantra hain, isliye original part bhi laga sakte hain aur sasta compatible bhi. Dono ka rate pehle bata dete hain."*

### D) Footer me ek vaakya — har page pe

> *"Aqua Perl Patna me RO service, RO repair aur water purifier service karta hai — Kent, Aquaguard, Livpure, Pureit aur baaki sabhi brand par. Visit charge ₹200, 30 din warranty, 5.0★ (50 reviews)."*

Ek vaakya. **Keyword list nahi** — wo doorway signal hota hai.

### E) Naya test: `verify-search-queries.sh`

Ye test dono taraf check karta hai:
- **Floor** — har phrase kam se kam 1 baar ho (dobara zero na ho)
- **Ceiling** — 6 baar se zyada na ho (**stuffing guard**)

Plus: footer line har page type pe, homepage H1 badla to nahi, glue bug to nahi aaya.

---

## Tere sawaal ka seedha jawab: "sare colony area rank kar rahe hain?"

**Sach: main ye measure nahi kar sakta.** Google apne SERP ko bot se scrape hone se rokta hai (maine try kiya — 202 bot challenge aaya). Jo koi bhi tujhe bina GSC ke ye batayega wo andaza laga raha hoga.

**Ye tu 2 minute me khud dekh sakta hai, aur ye asli data hoga:**

```
Google Search Console → Performance → Search results
  → Date: Last 28 days
  → "Queries" tab   = kis shabd pe log aaye
  → "Pages" tab     = kaun sa page dikha
  → Average position = konsa number pe hain
```

Ye screenshot bhej de — phir main **andaze ke bajaye asli data** pe kaam karunga. Abhi tak hum dono andhere me hain.

---

## Test report

```
Clean build (.next delete)   : EXIT 0, zero warning, 201 pages
Test suite                   : 1131/1131 PASS, ZERO FAIL
                               (pehle 1109 — 22 naye checks jude)

  verify-search-queries      : 22/22  ← NAYA (floor + stuffing ceiling)
  verify-h1-keyword          : 66/66  ← sitemap-driven sweep
  verify-area-depth          : 64/64  ← doorway ratchet
  verify-new-areas           : 140/140
  verify-password-features   : 31/31
  verify-admin-full          : 44/44
  (baaki 12 scripts sab pass)

Sitemap                      : 142 URLs, 83 area pages
Sab 142 URLs                 : HTTP 200, zero glue, zero problem
Admin security               : /admin aur /admin/seo bina session 307 (guarded)
Booking flow                 : POST 201 -> SRV-2026-00001 -> cleanup OK
```

### Keywords ab live (local build)

| keyword | homepage | brand page |
|---|---|---|
| `ro service patna near me` | 2x | - |
| `ro service centre patna` | 3x | - |
| `ro repair patna` | 2x | - |
| `water purifier service patna` | 2x | - |
| `kent ro service patna` | - | 1x |
| footer coverage line | 1x | 1x |

Sab 0 se 1-3 pe. **Stuffing nahi** — ceiling test 6x pe FAIL karta hai.

### Ek aur bug theek hua — seed ka admin password

`prisma/seed.ts` ka upsert `update: { role: 'SUPER_ADMIN' }` tha — `passwordHash` nahi tha. Matlab jis DB me admin row pehle se hai, re-seed karne pe password badalta hi nahi tha. Har test session me 44 tests FAIL hote the aur haath se password reset karna padta tha.

Ab `update` me `passwordHash` bhi hai.

**Production safe hai:** build script `prisma generate && next build` hai — seed usme chalta hi nahi. Seed sirf tab chalta hai jab koi khud `npx tsx prisma/seed.ts` chalaye. Tera badla hua password surakshit hai.

---

## Kya badla

```
[NAYI]  src/lib/seo/search-queries.ts          asli search phrases + jawab
[NAYI]  src/components/home/SearchAnswers.tsx  homepage block
[NAYI]  scripts/verify-search-queries.sh       floor + stuffing-ceiling test
[NAYI]  RANKING-ANALYSIS-19SEP.md              ye file

[BADLI] src/app/(shop)/page.tsx                SearchAnswers + FAQ schema
[BADLI] src/app/(shop)/service-patna/brand/[brand]/page.tsx   brand query line
[BADLI] src/components/layout/Footer.tsx       coverage vaakya
[BADLI] scripts/verify-all.sh                  naya test register

+ pichhle zip ka sab kuch (10 naye area pages, 73 → 83)
```

**Koi existing content delete nahi hua. Images haath nahi lagaye. Admin panel nahi chhua.**
