# BRUTAL VERIFY — push ke baad, 18 Oct 2026 (raat)

Owner: *"maine push kar diya hai tu ek baar dobara check kar le … koi keyword ya kuch bhi
reh to nhi gaya n … ek ek cheez khud se tu test kar sab page sahi se working kar rahe hai n …
pura brutal test kar"*

---

## 0. TL;DR

| | |
|---|---|
| Tera push | **safal — sab kuch live hai** |
| Live 144 sitemap URL | **144/144 HTTP 200** · non-200 **0** |
| **Toote hue internal link** | **0** (156 link khol kar dekhe) |
| JSON-LD parent (Bug H) LIVE | **1624 PASS / 0 FAIL** |
| GBP consistency LIVE | **258 PASS / 0 FAIL** — schema 5.0/58 == page 5.0/58 |
| Deep audit LIVE | **FAIL 0** |
| Admin LIVE | 23/23 page guarded · 18/18 API guarded |
| Keyword (baseline script) | **MISS 0 / 94** · area 996/996 · brand×area 1577/1577 |
| Local test suite | **3408 PASS / 0 FAIL** (25 script) |
| **Mila aur theek kiya** | 5 internal link par 308-redirect hop |

---

## 1. Tera push live par pahunch gaya — file-by-file confirm

GitHub ke deployed code se seedha padha:

```
ro-problem/[symptom]/page.tsx :81   export const dynamicParams = true     ✅ (404 bug ka fix)
constants.ts                  :259  reviewCount: 58                       ✅
src/lib/seo/gbp-overrides.ts        HTTP 200 — file maujood               ✅
scripts/gbp-consistency.py          HTTP 200 — file maujood               ✅
components/home/ServiceHero.tsx     hardcoded `4.9` ka count = 0          ✅
```

Live HTML se:
```
schema reviewCount  →  "58"     (126 page)
schema ratingValue  →  "5.0"    (126 page)
```
*(`"4"` aur `"5"` bhi dikhte hain — wo teen testimonial ke apne Review node hain, 5★ 5★ 4★. Sahi hai.)*

---

## 2. Har page chal raha hai — naap

### Sitemap ka har URL (Googlebot UA se)
```
144 URL → {200: 144}      non-200: 0
```

### 🆕 HAR PAGE KA HAR INTERNAL LINK (ye pehli baar kiya)
Naya `tools/linkcheck.py` — 147 page se nikle **156 unique andruni link**, har ek khola:

```
status baant : {200: 155, 308: 1}
🔴 TOOTE LINK : 0
```

Wo akela 308 — neeche section 3.

### Public API — asli endpoint, waise hi jaise UI bulata hai
```
GET /api/pincode/check?pincode=800001&type=service
      → 200  {"city":"Patna","deliveryAvailable":true,"serviceAvailable":true,"codAvailable":true}
GET /api/pincode/check?pincode=110001&type=service
      → 200  {"city":"New Delhi","deliveryAvailable":true,"serviceAvailable":false}   ← dual model sahi
GET /api/pincode/check?pincode=abc            → 400 {"message":"Invalid pincode"}
GET /api/search/suggest?q=membrane            → 200  product list aayi
GET /api/products                             → 200  items aaye
POST /api/service-requests  {}                → 422  {"customerName":["Required"], …}
POST /api/service-requests  galat phone       → 422  proper field errors
```
**Kahin 500 nahi.** Koi asli record nahi banaya — sirf validation path chhua.

### Page load
```
/cart 200 · /checkout 200 · /track-order 200 · /search?q=kent 200
/login 200 · /register 200 · /forgot-password 200
/admin/settings → 307 → /admin/login   (sahi — guarded)
```

---

## 3. 🔴 MILA AUR THEEK KIYA — 5 internal link par faltu redirect hop

Link-check ne pakda:
```
308  /ro-service-patna  →  /service-patna
     ye link in page par tha: /, /contact, /ro-customer-care-patna,
                              /ro-service-in-patna, /ro-services-patna   (5 page)
```

`/ro-service-patna` ka apna koi page nahi hai — `next.config.mjs:76` me
**permanent 308 redirect** hai `/service-patna` par. Sitemap me bhi nahi hai (sahi).

Par hamare apne 5 page us redirect wale URL par link kar rahe the. Matlab har user-click
aur har Googlebot visit **ek extra hop** le rahi thi. Crawl budget ka seedha nuksaan,
aur link equity ka thoda sa.

**Fix:** sirf **2 source file** me href badla —
`contact/page.tsx:224` aur `NearMeBlock.tsx:204` (NearMeBlock 4 page par render hota hai).

🔴 **Redirect rule CHHUA NAHI** — `next.config.mjs` ka md5 waisa hi
(`82284724deba3e1acf2964e5e955d079`). Purana URL kisi ne bookmark kiya ho ya kahin
bahar link ho, to wo abhi bhi kaam karega.

### Fix ke baad naap (sirf common 145 page par, taaki hisaab saaf ho)
```
href="/ro-service-patna"  (308 wala)   live 5  →  local 0     (-5)
href="/service-patna"     (seedha)     live 417 → local 422   (+5)
➜ 5 hata, 5 juda — EK BHI LINK GAYA NAHI  ✅

local link check: 150/150 → 200 · redirect 0 · toote 0
```

---

## 4. Keyword — ek bhi nahi chhoota

`/home/user/kwscan/` ke **original baseline script** se (naya scanner alag number deta hai):

```
127-keyword scan   TOTAL 94   T1-HEADING 22 · T2-BODY 71 · T3-WEAK 1 · MISS 0
  PRIMARY (14)  T1:6 T2:7 T3:1  MISS:0
  INTENT  (21)  T1:2 T2:19     MISS:0
  SHOP    (17)  T1:1 T2:16     MISS:0
  BRAND   (22)  T1:8 T2:14     MISS:0
  NEARME  (12)  T1:1 T2:11     MISS:0
  TRUST   (8)   T1:4 T2:4      MISS:0

area 12 pattern × 83 area  →  82 area 12/12, 1 area 11/12 *
brand × area               →  1577/1577 (100%)
brand 10 × 21              →  205/210
94-keyword heading         →  93/94
72-gap keyword             →  69/72
```

\* wo 11/12 `kadamkuan-mahendru` hai — **scanner ka artifact, site ki galti nahi**.
Area ka asli naam "Kadamkuan Mahendru **Belt**" hai; scanner URL slug se phrase banata hai
jisme "Belt" nahi hota. Asli phrase page par maujood hai (16 Oct ko naap kar confirm kiya).

---

## 5. Live par saare detector

```
JSON-LD parent (Bug Class H)   1624 PASS / 0 FAIL
   aggregateRating kahan: LocalBusiness+HVACBusiness 126 · Product 4 · LocalBusiness 1
   Service par: 0  ✅

GBP consistency                 258 PASS / 0 FAIL
   schema ratingValue  1 value → 5.0  (126 page)
   schema reviewCount  1 value → 58   (126 page)
   page par rating     1 value → 5.0  (349 jagah)
   page par count      1 value → 58   (155 jagah)
   ✅ schema == page

Deep audit (144 page)           FAIL 0
   H1==1 144/144 · title 39–62 · desc 103–160
   canonical/og:image/og:title/viewport/lang missing 0
   noindex 0 · thin page 0 · duplicate title/desc/canonical/H1 0
   invalid JSON-LD 0 · 47 schema type
   img bina alt 0 · WhatsApp missing 0 · TOTAL WORDS 434,358

Admin (live)                    23/23 page guarded · 18/18 API guarded
   /admin → 307 → /admin/login?callbackUrl=/admin
   purane password se login → 401  (tu badal chuka hai ✅)
```

---

## 6. Local — build khud kiya

```
clean install          up to date
prisma db push         in sync · generate ✅ · seed ✅
tsc --noEmit           EXIT 0
check-client-exports   PASS (94 server→client import)
next build             EXIT 0 — 210 static page
verify-all             3408 PASS / 0 FAIL  (25 script)
```

Har script zero FAIL: h1-keyword 66 · keyword-coverage 27 · images-titles 40 ·
robots-media 24 · forms 83 · area-depth 64 · new-areas 140 · service-intent 166 ·
seo-packages 94 · ux-upgrade 99 · seo-indexing 59 · product-admin 68 ·
titles-schema 46 · brand-rename 51 · admin-full 44 · password 31 · sitemap-lastmod 8 ·
search-queries 22 · serp-hygiene 9 · og-image 6 · billing 262 · banner-upload 48 ·
**jsonld-parents 1609** · **admin-deep 84** · **gbp-consistency 258**

---

## 7. Kuch toota to nahi — poora hisaab

132 code-driven page (DB wale alag, kyunki live DB me 1 extra product hai):

```
content loss          : 0
H1 + H2 + H3          : live 6,021  =  local 6,021
tel: links            : live 2,252  =  local 2,252
<a> links             : live 14,260  local 14,128   antar -132
```

**-132 ka poora hisaab:** Cloudflare live par har page me ek extra
`<a href="/cdn-cgi/l/email-protection">` daalta hai (email chhupane ke liye).
132 code page × 1 = **132**. Bilkul match — **mera koi link nahi gaya**.

```
Cloudflare ka extra /cdn-cgi <a>  : 132  (sirf live par)
mailto: <a>                        : live 0, local 1   ← wahi email, Cloudflare ne badla
```

### Protected files
```
next.config.mjs       82284724deba3e1acf2964e5e955d079   SAME
package.json          76cbce312634e7ba6e8f363250eeb1a7   SAME
package-lock.json     f28a291d2cc4d9450585c9dc5632e0d4   SAME
prisma/seed.ts        27789bec8cef9964a6cbc11cd9d3b28e   SAME
src/lib/constants.ts  7441b863e20b6d16e94ddcf562042046   SAME (18 Oct ka naya baseline)

Navbar.tsx     19,454 bytes · isServicePage 0
service-tech.png 2,706,298 · hero-technician 1,847,335 · patna-service-hero 1,538,045
ro-commercial 1,707,554 · ro-domestic 1,186,500        SAB SAME

glue bug 0 · cyrillic/greek homoglyph 0
```

---

## 8. Is zip me kya badla — sirf 3 file

| file | bytes | kya |
|---|---:|---|
| `src/app/(shop)/contact/page.tsx` | **12,844** | href `/ro-service-patna` → `/service-patna` |
| `src/components/service/NearMeBlock.tsx` | **11,858** | wahi (ye 4 page par render hota hai) |
| `APPLY.ps1` | **10,865** | 2 nayi file byte-check me |
| `VERIFY-18OCT-BRUTAL.md` | ye file | report |

Aur `tools/linkcheck.py` (mere paas, project me nahi) — har page ka har link checker.

🔴 **Koi keyword, heading, text, schema, rate, area data, brand data NAHI badla.**
Sirf 5 link ka raasta chhota hua.

---

## 9. Jo ab bhi baaki hai — sirf tu kar sakta hai

| # | Kaam | Kyun |
|---|---|---|
| 1 | 🔴 **Backlink 0** — Udyam → Bing Places → JustDial → IndiaMART | indexing ka **sabse bada** rukawat |
| 2 | 🔴 **GBP "Open 24 hours"** vs site 08:00–21:00 | top-5 local ranking factor · **2 minute** |
| 3 | 🔴 GBP review 58 → 200+, photo ~10 → 100+ | Map Pack #8 ka asli karan |
| 4 | 🔴 **GitHub PUBLIC** (dono repo) → Private | poora source + strategy khuli kitaab |
| 5 | 🔴 Google Ads **call** + **form** conversion label | abhi bhi `adsCallLabel:""` |
| 6 | 🟡 GSC → Review snippets → **VALIDATE FIX** | fix live hai, Google ko batana hai |
| 7 | 🟡 6 naye area (bihta/fatuha/punpun/naubatpur/didarganj/sampatchak) ka asli data | Google #1 ke paas hain, hamare paas nahi |
| 8 | 🟡 Homepage ke 3 testimonial asli customer hain? | nakli review markup = manual action |

---

## 10. Rollback
* **Vercel** → Deployments → purana 🟢 Ready → ⋯ → **Promote to Production** (30 sec)
* **Git** → `git reset --hard backup-<date>`
