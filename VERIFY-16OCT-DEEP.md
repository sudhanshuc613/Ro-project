# DEEP VERIFY — 16 Oct 2026

Owner ne kaha: *"ek baar or deep verify kar … ek ek page sab kuch sitemap wagreh admin wagreh sab kuch verify karna fir zip dena"*.

Ye file har claim ka **naap** hai. Jo nahi hua wo bhi likha hai.

---

## 0. TL;DR

| Cheez | Natija |
|---|---|
| Test suite | **3065 PASS / 0 FAIL** (23 script, pehle 1456/22) |
| `tsc --noEmit` | **EXIT 0** |
| `next build` | **EXIT 0** — 210 static pages |
| `check-client-exports.mjs` | **PASS** — 94 server→client import jaanche |
| Local deep audit (143 page) | **FAIL 0** |
| Live deep audit (144 page) | **FAIL 0** |
| Admin | **23/23 page clean · 15/15 API guarded** |
| Purana content gaya? | **0 page** — hisaab neeche |
| Protected files | **5/5 md5 same · Navbar 19,454 B · 5 image byte-same** |

---

## 1. 🔴 ASLI ERROR KYA THA — Search Console wala

### Google ne kya bheja
```
URL Inspection → Review snippets
❗ 2 items detected: Some are invalid
   aggregateRating → Invalid object type for field "<parent_node>"
   type: Service
   @id : https://rokadoctor.in/ro-service-patna/mahendru/#service
```

### Wajah (do alag cheezein — dono zaroori hain)

**schema.org kehta hai:** `Service` par `aggregateRating` lagana ALLOWED hai.
**Google kehta hai:** Review-Snippet *rich result* ke liye parent sirf ye 17 ho sakte hain —

```
Book · Course · CreativeWorkSeason · CreativeWorkSeries · Episode · Event
Game · HowTo · LocalBusiness · MediaObject · Movie · MusicPlaylist
MusicRecording · Organization · Product · Recipe · SoftwareApplication
```

`Service` is list me **nahi** hai. Isliye JSON bilkul valid tha, par Google ke liye
invalid item tha. Hamara purana schema test sirf "JSON parse hota hai ya nahi"
dekhta tha — wo PASS ho raha tha. Galti **semantic** thi, syntax ki nahi.

### Naap — detector ne kya kaha

| | aggregateRating kis type par | Count |
|---|---|---|
| **LIVE (abhi, push nahi hua)** | `Service` 🔴 | **83** |
| | `LocalBusiness+HVACBusiness` ✅ | 126 |
| | `Product` ✅ | 4 |
| | `LocalBusiness` ✅ | 1 |
| **LOCAL (is zip me)** | `Service` | **0** ✅ |
| | `LocalBusiness+HVACBusiness` ✅ | 126 |
| | `Product` ✅ | 4 |
| | `LocalBusiness` ✅ | 1 |

83 = thik utne hi area page jitne GSC ne flag kiye.

### 🔴 IMAANDAR BAAT — stars phir bhi nahi aayenge

Google ka apna doc (`developers.google.com/.../review-snippet`):

> "Local business (**only for sites that capture reviews about other local
> businesses**; see the guidelines about self-serving reviews)"

Yaani: apni hi website par apne hi business ki rating daalna = **self-serving**,
aur uspe Google **kabhi bhi star nahi dikhata** (Sep 2019 se, Dec 2025 me dobara
confirm kiya).

To fir ye fix kiya kyun?

1. **GSC ka ERROR jata hai.** "Invalid object type" ek *critical issue* hai jo
   poore page ki rich-result eligibility par baithta hai. Ab wo 0 ho jayega.
2. **Manual action ka risk 0.** Google ka FAQ: *"You won't get a manual action
   just for this."* Par *invalid markup* alag cheez hai — wo saaf karna hi hai.
3. **AI / Bing / voice** `aggregateRating` padhte hain — wo band nahi karna.

**Star Google par kahan aayega:** Maps + Local Pack me, **GBP se** — website ke
schema se nahi. Isliye GBP ke reviews 50 → 200 le jana ab aur zaroori hai.
Wahi asli lever hai, website ka schema nahi.

---

## 2. 🔴 DO AUR BUG — isi verify me naye mile

### Bug 1 — homepage par ek hi `@id` ke do naam

```
block0[2]  @type ["LocalBusiness","HVACBusiness"]  @id .../#localbusiness
           name  "Aqua Perl RO Service Patna"   image /banners/service-tech.png
block0[3]  @type "LocalBusiness"                  @id .../#localbusiness
           name  "Aqua Perl"                    image /brand/logo.png
```

28 Sep ko `@id` jaan-bujh kar ek kiya gaya tha taaki Google dono node ko **ek
entity** maane — wo soch bilkul sahi hai. Par us node me `name`, `image`,
`telephone`, `address` BHI ja rahe the, aur wo main node se **mel nahi khate the**.

JSON-LD me ek `@id` ke node merge hote hain. Ek hi property ki do value aane par
wo multi-value ban jati hai — matlab Google ke paas business ka **naam do** aur
**image do**. Local SEO me naam ka ek hona (NAP consistency) seedha ranking
factor hai.

**Fix:** ab wo node sirf `aggregateRating` + `review` bhejta hai (jo main node me
nahi hai). Naam/pata/phone main node se aate hain. **Koi data kam nahi hua.**

Naap:
| | pehle | ab |
|---|---|---|
| duplicate-@id conflict | 1 | **0** |
| `"reviewCount":"50"` homepage par | 2 | **2** (test exactly 2 maangta hai) |
| `@type:"Review"` | 3 | **3** |
| `@type:"Person"` | 3 | **3** |
| `postalCode 800001` | 2 | 1 (test `>=1` maangta hai) |

### Bug 2 — blog ka lastmod jhooth bol raha tha

12 Oct ko `ro-service-charge-patna-rate-list` post ka **asli content badla** tha:

```
"₹450 ka SMPS"                     → "₹700 se ₹1,100"
"SMPS / adaptor … hamara"          → "₹700 – ₹1,100"
"Booster pump / motor … hamara"    → "₹1,000 – ₹2,800"
```

Live par naya text maujood hai (16 Oct check: `₹450` = **0 hits**).
Par `updated` abhi bhi `2026-09-03` pada tha. Natija:

* sitemap `lastmod` = 2026-09-03 → Google ko signal "kuch nahi badla, mat aao"
* Article `dateModified` = 2026-09-03 → **structured data me galat tareekh**

Ye **wahi bug** hai jo 15 Oct ko 83 area page par pakda tha — blog par bacha reh gaya.

**Fix:** `updated: '2026-10-12'`.
**Baaki 4 post ki date CHHUI NAHI** — unka content 3 Sep ke baad badla nahi.
Jhoothi nayi date dena bhi utna hi bada bug hai.

| blog post | dateModified |
|---|---|
| ro-service-charge-patna-rate-list | **2026-10-12** ← badla |
| ro-membrane-kab-badalna-chahiye | 2026-09-03 |
| patna-me-tds-kitna-hona-chahiye | 2026-09-03 |
| ro-me-paani-nahi-aa-raha-kya-kare | 2026-09-03 |
| ro-uv-uf-me-kya-farak-hai | 2026-09-03 |

---

## 3. NAYA PERMANENT TEST — ye bug dobara nahi aa sakta

`scripts/jsonld-parents.py` (18,076 B) + `scripts/verify-jsonld-parents.sh` (2,676 B)
→ `verify-all.sh` me jud gaya (ab 23 script).

Ye **rendered JSON-LD ka poora tree walk** karta hai, JSON-parse check nahi:

1. har `<script type="application/ld+json">` valid JSON
2. har node me `@type`
3. 🔴 `aggregateRating` ka parent Google-supported hai — **BUG CLASS H**
4. `review` ka parent bhi Google-supported
5. `AggregateRating` me `ratingValue` + (`reviewCount`|`ratingCount`)
6. `reviewCount > 0` (0 review pe rating = invalid item)
7. `ratingValue` `worstRating`–`bestRating` ke andar
8. `Review` me `author` + `reviewRating`
9. `BreadcrumbList` ke har item me `position` + `name`
10. `FAQPage` ke har `Question` me `name` + `acceptedAnswer.text`
11. `Product.offers` me `price` + `priceCurrency`
12. top-level `LocalBusiness` me `name` + `address` + `telephone` (**@id merge ke baad**)
13. ek `@id` par takraati `name` / `image` / `url` / `telephone`

Subtype bhi samajhta hai: `HVACBusiness → LocalBusiness`, `ProductModel → Product`, etc.

**Natija:** local **PASS 1618 / FAIL 0** · live (bina push) **FAIL 85**.

---

## 4. PURANA CONTENT GAYA? — poora hisaab

Local (naya build) vs Live (purana), 150 common page, Cloudflare normalize karke:

```
code-driven pages compared : 133
content-loss pages         : 0
words  live=429,756  local=429,622  diff = -134
```

**-134 kahan se aaya — poora hisaab:**

Cloudflare live par email obfuscate karta hai:
`support@rokadoctor.in` (1 word) → `[email protected]` (2 words) = **+1 word per page, sirf live par**.

```
133 page × 1 word          = 133
/contact par 2 email       = +1
                           ──────
                             134   ✅ bilkul match
```

Aur `/blog` par local me **"12 Oct"** extra hai — wahi to blog date ka fix hai.

**Matlab: ek bhi shabd, ek bhi heading, ek bhi tel: link nahi gaya.**

```
TOTAL H2     live 1373   local 1373   (same)
TOTAL tel:   live 2387   local 2387   (same)
```

### Jo 5 page alag dikhe — wo DB ka antar hai, code ka nahi

`/products`, `/category/*`, 3 PDP — kyunki **live DB me ek extra product hai**
(`apple-alfa-alkaline-copper-12l-ro-purifier`) jo local seed me nahi hai.
Sitemap se proof:

```
LOCAL  4 product URL
LIVE   5 product URL  (+apple-alfa)
```

Ye data ka antar hai. Push ke baad live DB waisa hi rahega — koi product nahi jayega.

---

## 5. SITEMAP

| | LIVE | LOCAL |
|---|---|---|
| URL count | 144 | 143 (+1 = apple-alfa, DB me) |
| duplicate URL | 0 | 0 |
| robots-blocked URL | 0 | 0 |
| build-time stamp | 0 | 0 |
| future date | 0 | 0 |

`lastmod` baant:
```
2026-10-13  118   (area 83 + brand 21 + intent + hubs)
2026-10-12    6
2026-10-11    2
2026-10-09    1
2026-09-15    1   /about/sudhanshu-choudhary
2026-09-03    4   blog (4 post — 5th ab 10-12)
2026-08-03    6   /category/*  (DB updatedAt — sach me tab se nahi badle)
```

`2026-08-03` wali category pages **bug nahi hai** — wo DB ki asli `updatedAt` hai.
Google purani lastmod se naraz nahi hota; wo **jhoothi** lastmod se naraz hota hai.

`verify-sitemap-lastmod` 8/8 PASS.

---

## 6. SERP HYGIENE (live par naapa)

```
http://rokadoctor.in/                      308 → https://rokadoctor.in/
https://www.rokadoctor.in/                 308 → https://rokadoctor.in/
/RO-Service-Patna/Kankarbagh               301 → /ro-service-patna/kankarbagh
/service-patna/kankarbagh                  308 → /ro-service-patna/kankarbagh
/ro-service-patna/kankarbagh/              308 → /ro-service-patna/kankarbagh
/ro-service-patna/koi-nahi-hai             404  ✅
/aise-hi-kuch                              404  ✅
```

canonical: **146 page check · missing 0 · mismatch 2** — dono jaan-bujh ke:

* `/cart` → canonical homepage. robots.txt me Disallow, sitemap me nahi. Sahi.
* `/ro-service-patna` → canonical `/service-patna`. Ye **alias page** hai,
  sitemap me nahi. Sahi handle hua hai.

🟡 **Ek chhoti baat (maine badli NAHI):** 5 page andar se `/ro-service-patna`
(non-canonical alias) par link karte hain — `/`, `/contact`,
`/ro-customer-care-patna`, `/ro-service-in-patna`, `/ro-services-patna`.
Google canonical follow kar lega, toota kuch nahi. Par technically ek hop zyada
hai. 5 file chhedne ka risk is chhote fayde se zyada hai — **isliye report kiya,
badla nahi**. Aap bolo to agle push me kar dunga.

---

## 7. KEYWORD COVERAGE — baseline script se (comparable numbers)

`/home/user/kwscan/` ke **original** script chalaye (naye se number alag aate hain):

```
127-keyword scan    TOTAL 94   T1-HEADING 22 · T2-BODY 71 · T3-WEAK 1 · MISS 0
  PRIMARY (14)      T1:6  T2:7  T3:1  MISS:0
  INTENT  (21)      T1:2  T2:19 T3:0  MISS:0
  SHOP    (17)      T1:1  T2:16 T3:0  MISS:0
  BRAND   (22)      T1:8  T2:14 T3:0  MISS:0
  NEARME  (12)      T1:1  T2:11 T3:0  MISS:0
  TRUST   (8)       T1:4  T2:4  T3:0  MISS:0

area 12 pattern × 83 area   →  har page 12/12   (996/996)
brand × area                →  1577/1577  (100%)
brand 10 × 21               →  205/210    (5 = template artifact, neeche)
72-gap keyword              →  69/72
94-keyword heading          →  93/94
```

---

## 8. ADMIN

```
23/23 admin page   HTTP 200 · h1=1 · react error 0
15/15 admin API    bina login 401 / 403 / 404 / 405  (koi 200 nahi)
```

---

## 9. BUG-CLASS DETECTOR — sab chalaye

| Class | Kya | Natija |
|---|---|---|
| A | GLUE BUG (JSX inline node chipakna) — source-level | **0** |
| B | Cyrillic/Greek homoglyph | **0** |
| C | client file se non-component export | **0** (94 import jaanche) |
| D | `revalidatePath('/','layout')` + `dynamicParams=false` | `dynamicParams = true` ✅ |
| H | aggregateRating galat parent par | **0** local · 83 live |
| NEW | ek `@id` par takraata naam | **0** local · 1 live |

Area-depth doorway gate:
```
max body overlap        83 ≤ 84   PASS
duplicate body sentence 53 ≤ 55   PASS
do hard-water area ka overlap  78 ≤ 84  PASS
```

---

## 10. COMPETITOR — 16 Oct live naap

| site | words | H1 | H2 | H3 | schema | **brand-h** | **area-h** | tel | sitemap URL |
|---|---|---|---|---|---|---|---|---|---|
| roservicecentrepatna.in *(Google #1)* | 2,285 | 2 | 5 | 3 | 3 | **0** | **0** | 6 | **67** |
| rocareindia /patna | 3,700 | 1 | 19 | 17 | 7 | 0 | 0 | 9 | 5,473 |
| serviceondoors /patna | 1,782 | 1 | 14 | 5 | 4 | 4 | 0 | 5 | 20,302 |
| rosaleandservices | 2,182 | 0 | 15 | 20 | 2 | 0 | 0 | 19 | 120 |
| waterix.in | 1,893 | 0 | 28 | 6 | 2 | 1 | 0 | 6 | – |
| roservice.org.in | 1,490 | 1 | 13 | 5 | 4 | 0 | 0 | 13 | – |
| 24x7patnarocare.in | 937 | 2 | 6 | 14 | 0 | 0 | 0 | 7 | – |
| patnaroservice.in | 669 | 1 | 14 | 8 | 0 | 0 | 0 | 10 | – |
| roservicecenterpatna.com | 609 | 1 | 4 | 19 | 0 | 0 | 0 | 4 | 7 |
| **AQUA PERL (ads page)** | **5,574** | 1 | 18 | 62 | 2 | **6** | **2** | 32 | **144** |
| **AQUA PERL (area)** | **3,559** | 1 | 10 | 38 | 2 | **19** | **1** | 9 | |
| **AQUA PERL (brand)** | **2,610** | 1 | 11 | 28 | 2 | **1** | **7** | 12 | |

**15 Oct se delta:**
* `roservicecentrepatna.in` TTFB **3.21s → 4.29s** (aur slow hua)
* `aquasolutionindia` TTFB 1.52s → 3.11s
* `rocareindia` home 4,643 → 4,686 words
* `patnaroservice.in` 651 → 669 · `24x7patnarocare.in` 927 → 937 · `roservicecenterpatna.com` 599 → 609 (chhote edits)
* `roservicecenterpatna.com` ka naya Ads account **AW-17844432811** abhi bhi chalu
* `rosaleandservices` do Ads account — **AW-17207229898, AW-17711651150**
* `serviceondoors` ka GA4 naya dikha — **G-G238BYYCD8**

**Sabse bada farq, aaj bhi:**
> **Patna ke kisi bhi competitor ke heading me brand ya area ka naam NAHI hai — ZERO.**
> Hamare paas 1,577 brand×area combination heading me hain.
> Aur Google ka #1 (roservicecentrepatna.in) ke paas **sirf 67 URL** hain, hamare 144 ke against.
> Unka TTFB 4.29s, hamara 0.20–0.66s.

**To hum #1 kyun nahi hain?** Website nahi — **GBP + backlink**. Wahi aage ka kaam hai.

---

## 11. PROTECTED FILES — chhue nahi gaye

```
next.config.mjs       82284724deba3e1acf2964e5e955d079   SAME
package.json          76cbce312634e7ba6e8f363250eeb1a7   SAME
package-lock.json     f28a291d2cc4d9450585c9dc5632e0d4   SAME
prisma/seed.ts        27789bec8cef9964a6cbc11cd9d3b28e   SAME
src/lib/constants.ts  41a293d2f18c3fa9541671e5c9e22d5e   SAME

Navbar.tsx            19,454 bytes · isServicePage 0     SAME
service-tech.png      2,706,298                          SAME
hero-technician.png   1,847,335                          SAME
patna-service-hero.png 1,538,045                         SAME
ro-commercial.png     1,707,554                          SAME
ro-domestic.png       1,186,500                          SAME
```

---

## 12. IS ZIP ME KYA BADLA — har file, byte ke saath

| file | pehle | ab | kya |
|---|---|---|---|
| `src/app/(shop)/ro-service-patna/[area]/page.tsx` | 30,289 | **32,965** | Service se aggregateRating hataya (15 Oct) |
| `src/lib/seo/schema.ts` | 22,635 | **23,779** | `reviewSchema()` ka @id conflict fix |
| `src/lib/seo/blog-data.ts` | 34,811 | **35,669** | blog `updated` 09-03 → 10-12 |
| `scripts/jsonld-parents.py` | — | **18,076** | 🆕 Bug Class H detector |
| `scripts/verify-jsonld-parents.sh` | — | **2,676** | 🆕 test wrapper |
| `scripts/verify-all.sh` | 1,479 | **1,567** | naya test jod diya |
| `APPLY.ps1` | 9,239 | **9,854** | byte list update + naya commit message |
| `VERIFY-16OCT-DEEP.md` | — | ye file | report |

`src/lib/seo/content-dates.ts` **6,504** — 15 Oct wala lastmod fix, waise hi.

---

## 13. JO ABHI BHI NAHI HUA (imaandari se)

| # | Cheez | Kaun kar sakta hai |
|---|---|---|
| 1 | 🔴 GBP "Open 24 hours" vs site 08:00–21:00 | **aap — 2 minute** |
| 2 | 🔴 GBP reviews 50 (chahiye 200+), photo ~10 (chahiye 100+) | **aap** |
| 3 | 🔴 Backlink 0 vs competitor ~50 | **aap** (Udyam → Bing Places → JustDial) |
| 4 | 🔴 Google Ads **call** + **form** conversion label | **aap** — abhi tak nahi mile |
| 5 | 🔴 GitHub repo PUBLIC · admin password `ChangeMe@123` · 2FA off | **aap** |
| 6 | 🟡 `kadamkuan` vs `kadamkuan-mahendru` — ek hi mohalla? | **aap batao** |
| 7 | 🟡 Homepage ke 3 testimonial (Rajesh Kumar / Sunita Prasad / Md. Arshad) — **asli customer hain?** Nakli review markup par manual action lagta hai. Maine kuch nahi hataya, bas pooch raha hoon. | **aap batao** |
| 8 | 🟡 17 `₹X onwards` commercial rate ka upper bound | **aap batao** |
| 9 | 🟡 Kent "Water not filling in tank" ₹850–₹2,400 (membrane OR pump — ₹850 dono ke floor se neeche) | **aap batao** |
| 10 | 🟡 Apple Alfa product ke 3 galat spec live par | admin se theek ho sakta hai |
| 11 | 🟡 5 internal link non-canonical `/ro-service-patna` par | agle push me, bolo to |
| 12 | 🟡 `SOCIAL` array khaali · 6 dead product image · carouselHero par competitor "ROCARE" shirt | aap batao |

---

## 14. ROLLBACK

* **Vercel** → Deployments → purana 🟢 Ready → ⋯ → **Promote to Production** (30 sec)
* **Git** → `git reset --hard backup-<date>` (APPLY.ps1 push se pehle backup branch banata hai)
