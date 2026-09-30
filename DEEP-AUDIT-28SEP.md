# Deep Audit — 28 Sep 2026

Sab live measure. Competitors, code, schema, admin — sab.

---

## Pehle: do cheez pending thi, dono abhi bhi pending hain

```
🔴 aquaperl-SERP-FIX.zip        push NAHI hua
     → duplicate title abhi bhi live hai:
       /brand/commercial-ro  "All Brands RO Service Patna — ₹200 Visit"
       /brand/other-brands   "All Brands RO Service Patna — ₹200 Visit"   ← same!

🔴 roserviceinpatna.in          redirect NAHI laga
     → abhi bhi Hostinger parking page (HTTP 200, 0 hops)
```

**Is naye zip me pichhle zip ka sab kuch bhi hai** — dono ek saath push ho jayenge.

---

## 🔴 NAYA BUG #1 — ENTITY FRAGMENTATION (sabse bada)

Homepage par **do alag LocalBusiness entity** ban rahi thi:

```
@id = https://rokadoctor.in/#localbusiness    ← main (geo, offers, hours, rating)
@id = https://rokadoctor.in/#reviews          ← alag (sirf reviews)
```

Google JSON-LD nodes ko **`@id` se merge** karta hai. Do alag `@id` = **do alag business**.

Nateeja: ek node ke paas geo + offers + hours, doosre ke paas reviews — **kisi ek node ke
paas poori tasveer nahi.** Entity signal bat gaya.

Ye 2026 me aur zaroori hai kyunki AI answer engines (Gemini, ChatGPT Search, Perplexity)
entity graph se hi business "samajhte" hain.

**Fix:** `reviewSchema()` ab wahi `@id` use karta hai (`#localbusiness`). Ab dono node
**ek entity me merge** ho jaate hain — reviews seedha main business par lagti hain.

**Verify (local build):**
```
Organization                      @id .../#organization
['LocalBusiness','HVACBusiness']  @id .../#localbusiness   ← geo, offers, rating
LocalBusiness                     @id .../#localbusiness   ← reviews  ✅ SAME @id
```

---

## 🔴 NAYA BUG #2 — Entity fields gayab the

2026 ki local-schema research ke hisaab se ye fields AI engines ke liye zaroori hain.
Hamare paas nahi the:

| Field | Ab kya hai |
|---|---|
| `foundingDate` | `2019` (Organization + LocalBusiness dono pe) |
| `knowsLanguage` | `["hi","en"]` — Patna me Hindi query ke liye |
| `slogan` | "RO service in Patna — ₹200 visit, 30-day warranty" |
| `areaServed` (Org) | `{City: Patna}` |

Har value **asli** hai — banayi nahi.

---

## 🔴 GAP #3 — `sameAs` abhi bhi khali (ye tere haath me hai)

Live measure:
```
rosaleandservices.com  →  facebook · instagram · linkedin · twitter · youtube · pinterest
roservicecentrepatna   →  sirf apna hi URL (bekaar sameAs)
HUM                    →  ZERO
```

`sameAs` wahi field hai jisse Google confirm karta hai ki **website + GBP + social sab EK
business hain.**

Maine `SOCIAL` array ab **LocalBusiness par bhi wire kar diya** (pehle sirf Organization
par tha). Array khali hai isliye field render nahi hoti — jo sahi hai, jhoota link nahi jaana
chahiye.

**Jaise hi tu ye banaye, mujhe URL bhej — usi din schema me chala jayega:**
```
1. Facebook page       20 min
2. Instagram business  10 min
3. GBP share link      2 min   (GBP → Share → copy link)
4. JustDial listing    listing banne ke baad
```

---

## Competitor — 10 din me kuch nahi badla

`roservicecentrepatna.in` (#1) ka **28 Sep fresh scan**:

| | 18 Sep | 28 Sep |
|---|---|---|
| pages | 66 | **66** |
| words | 2,285 | **2,285** |
| schema types | 9 | **9** |
| images | 9 | 9 |
| sameAs | — | sirf apna URL |

**Wo static hai. Hum har hafte aage badh rahe hain.** Ye long game me hamare haq me hai.

### Bade players ko bhi dekha

| Site | Words | Schema | Kaise jeetta hai |
|---|---|---|---|
| UrbanCompany /patna | **425** | 3 | sirf brand authority + backlinks |
| OneDios | 1,861 | **0** | domain authority |
| **★ HUM** | **5,393** | **21** | on-page (par backlinks 0) |

**Sabak:** giants on-page se nahi jeette — authority se jeette hain. Unki nakal karne layak
on-page kuch nahi hai. Hum on-page me unse aage hain.

---

## Code-level SEO audit — jo sahi nikla

```
✅ Service schema me AggregateOffer (lowPrice 200, highPrice 2400) — sahi
✅ areaServed GeoCircle 25 km radius ke saath — 2026 best practice
✅ priceRange, currenciesAccepted, paymentAccepted — sab present
✅ @id har entity par — stable identifier
✅ openingHoursSpecification structured
✅ hasOfferCatalog with Offer + Service
✅ Article schema blog par, Product+Brand+Offer product pages par
✅ 143/143 URLs: 200, 0 noindex, 0 orphan, 0 missing canonical
✅ Brotli on — 395 KB HTML → 40 KB transfer
✅ Images: 7/7 alt text, lazy loading sahi, WebP serve ho rahi
```

### ⚠️ Ek cheez jo main nahi badal sakta — business decision hai

```
GBP par     : "Open 24 hours"
site schema : 08:00 – 21:00
```

Ye mismatch hai. Google GBP aur site ko cross-check karta hai.

**Do raste — tujhe chunna hai:**
1. GBP par asli hours daal do (08:00-21:00) — agar tu 24 ghante nahi jaata
2. Ya site schema 24 hours kar dun — **sirf tab jab tu sach me raat 2 baje bhi jaata ho**

Jhooth bolna yahan ulta padta hai — customer raat me call karega, tu nahi uthayega,
bura review milega.

**Bata de kaunsa sach hai, main usi hisaab se kar dunga.**

---

## 🔴 ADMIN PANEL — ek zaroori baat

Maine admin SEO flow check kiya:

```js
const row = await prisma.seoMetadata.findFirst({ where: { path } });
const title = row?.metaTitle || fallback.title;   // ← DB code ko OVERRIDE karta hai
```

**Matlab:** jo title tune `/admin/seo` me daala hai, wo code se **upar** hai.

Tune pehle `/` aur `/service-patna` ke row haath se update kiye the. Ab maine code me
`/service-patna` ka title chhota kiya (64 → 55 char) — **par DB me purana padha hai,
isliye live pe purana hi dikhega.**

👉 Push ke baad `/admin/seo` me `/service-patna` row ka title ye kar dena:
```
Water Purifier Repair in Patna — ₹200 Visit
```

`/` wali row sahi hai, usko haath mat lagana.

---

## Test report

```
Clean build       : EXIT 0, zero warning
Test suite        : 1140/1140 PASS, ZERO FAIL
Entity merge      : verify kiya — dono node same @id par ✅
Naye fields       : foundingDate, knowsLanguage, slogan, areaServed ✅
Brand titles      : 21/21 unique, sab ≤60 char
Descriptions      : sab ≤160
```

---

## Kya badla is zip me

```
[NAYI]  src/lib/seo/brand-labels.ts          unique brand SERP labels
[NAYI]  scripts/verify-serp-hygiene.sh       9 naye checks
[NAYI]  DEEP-AUDIT-28SEP.md                  ye file

[BADLI] src/lib/seo/schema.ts        21704   entity merge + naye fields
[BADLI] src/lib/constants.ts         13222   SOCIAL array ka guide
[BADLI] brand/[brand]/page.tsx       15079   duplicate title fix
[BADLI] service-patna/page.tsx       28117   title 64 → 55
[BADLI] src/lib/seo/blog-data.ts     34518   2 titles chhote
[BADLI] src/lib/seo/catalog-seo.ts   34332   title + desc
[BADLI] service-intent-data.ts       81163   4 descriptions
[BADLI] symptom-data.ts              32759   1 description
[BADLI] scripts/verify-all.sh         1482   naya test register
```

**Koi content delete nahi. Images nahi chhui. Admin code nahi chhua.**

---

## Priority — ab kya karna hai

| # | Kaam | Asar | Time | Kaun |
|---|---|---|---|---|
| 1 | **Ye zip push** | duplicate title + entity fix | 10 min | tu |
| 2 | **Admin `/service-patna` title** | title fix live hoga | 2 min | tu |
| 3 | **5 directory listings** | 🟢🟢🟢 sabse bada | 52 min | tu |
| 4 | **Facebook + Instagram page** | `sameAs` unlock | 30 min | tu → mujhe URL |
| 5 | **Reviews 50 → 100** | 🟢🟢🟢 | rozana | tu |
| 6 | **GBP hours ka sach** | mismatch fix | 1 min | bata de |
| 7 | **`roserviceinpatna.in` redirect** | defensive | 10 min | tu |
| 8 | **GSC screenshot** | tab main asli data pe kaam karunga | 5 min | tu |

**On-page ka kaam ab lagbhag khatam hai.** #3, #4, #5 — teeno ₹0 hain aur teeno tere
haath me hain. Wahi asli farak layenge.
