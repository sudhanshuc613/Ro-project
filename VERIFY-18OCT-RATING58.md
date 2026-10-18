# RATING 58 + ADMIN CONTROL + 2 BUG FIX — 18 Oct 2026

Owner ne teen cheez maangi thi:
1. GSC ka error dobara dekho — purana hai ya naya
2. Rating 58 kar do
3. Admin se rating badalne ka option do — **"kuch bhi galti nhi karna"**

---

## 1. 🟢 GSC ka wo error PURANA HAI — site theek hai

Screenshot me likha hai: **"Crawled successfully on Oct 13, 2026, 11:38:15 PM"**.
Schema fix **16–18 Oct** ko live hua. Yani Google jo dikha raha hai wo **13 Oct ka
cached data** hai, aaj ka nahi.

Live par abhi naap kar dekha — `/ro-service-patna/rps-more`:

```
JSON-LD nodes: 9
  node0 Organization
  node1 WebSite
  node2 LocalBusiness+HVACBusiness   ⬅ aggregateRating YAHAN hai (sahi jagah)
  node3 FAQPage
  node4 BreadcrumbList
  node5-7 ImageObject
  node8 Service   → keys: @context @id @type areaServed hasOfferCatalog name offers provider serviceType
                     aggregateRating? ❌ NAHI HAI  ✅
```

**Saare 83 area page par: `aggregateRating on Service` = 0.**

**Kya karna hai:** us screenshot wale page par upar-daayein **TEST LIVE URL** dabao.
Wo abhi ka asli haal dikhayega — `1 item, 0 invalid` aana chahiye.
Phir **Enhancements → Review snippets → VALIDATE FIX**.

---

## 2. ⭐ Rating 50 → 58, aur ab ADMIN SE BADALTI HAI

### Admin me kahan
```
/admin/settings  →  sabse upar "⭐ Google Rating & Reviews" card
      Google Rating (1.0 – 5.0)     [ 5.0 ]
      Total Google Reviews          [ 58  ]
      → "Site par aisa dikhega: ⭐ 5.0 · 58 Google reviews"
      → Schema preview bhi dikhta hai
      [ Save ]  →  turant live, koi deploy nahi
```

### Jaanch jo galat number rok deti hai
| galti | kya hoga |
|---|---|
| rating 9 daala | **422 reject** — "Google 1 se 5 ke beech hi rating deta hai" |
| review count 0 | **422 reject** — "0 review par rating invalid item ban jaati hai" |
| dashamlav count (58.5) | **422 reject** |
| 1,00,000 se zyada | **422 reject** |

Seema **API par bhi** lagi hai, sirf form par nahi — form bypass ho sakta hai, API nahi.

### End-to-end test (asli, chalake)
```
login                      → SUPER_ADMIN ✅
PUT reviewCount 61         → 200
  homepage schema          → "reviewCount":"61" ✅
  homepage dikhne wala     → "61 Google reviews" ✅
PUT ratingValue 9          → 422 ✅ (reject)
PUT reviewCount 0          → 422 ✅ (reject)
PUT reviewCount 58 wapas   → 200, dono wapas 58 ✅
```

### Kaise bana (architecture)
Wahi pattern jo `rateCard` (10 Oct) aur `siteImages` (10 Oct) me pehle se chal raha hai:

```
src/lib/seo/gbp-overrides.ts   (NAYA)  resolveGbp() + validateGbp()
src/lib/settings.ts            getGbpSettings()  unstable_cache, tag 'settings'
src/app/api/admin/settings     zod schema `gbp`, revalidateTag('settings')
SettingsForm.tsx               naya GbpCard
constants.ts                   ab sirf FALLBACK (DB khaali/band ho to)
```

**7 server component khud DB padhte hain** (TrustBadges, Footer, SearchAnswers,
ProofStats, Testimonials, AdsHeroBanner, NearMeBlock, WhyChooseGrid) — unke
**kisi bhi caller ko chhuna nahi pada**.
**2 client component** (ServiceHero, ReviewShowcase) prop lete hain, default ke saath.

---

## 3. 🔴 BUG 1 — homepage par `4.9` HARDCODED tha (purani galti)

`src/components/home/ServiceHero.tsx:259` par likha tha:

```tsx
<span className="text-[15px] font-extrabold text-navy-700">4.9</span>
```

Yani **homepage ke hero par 4.9 dikh raha tha, jabki schema Google ko 5.0 bhej raha tha.**

Google ka saaf niyam: *"the review content you mark up must be readily available
to users from the marked-up page"*. Markup aur page ka mel na khana
"spammy structured markup" hai — uspe poore domain ke rich result band ho sakte hain.

Ye galti **aaj tak kisi test ne nahi pakdi**. Naye detector ne pehli hi baar pakdi.
Ab ye bhi ek hi source se aata hai.

### Isi detector ne 2 aur hardcoded number pakde
| file | kya tha |
|---|---|
| `ads-landing-data.ts` WHY_POINTS | `'Google par 5.0 rating, 50 review'` — **ads landing page par** |
| `blog-data.ts` AUTHOR.credentials | `'Google par 5.0★ rating, 50 verified reviews'` |

Dono ab dynamic hain.

---

## 4. 🔴 BUG 2 — 5 symptom page 404 ho jaate the (BUG CLASS D, dobara)

Ye **maine khud introduce kiya aur naye test ne turant pakda**. Imaandari se likh raha hoon.

### Kya hua
```
fresh build ke turant baad          → /ro-problem/* paanchon 200 ✅
/api/admin/settings par kuch save   → paanchon 404 🔴   (baaki 139 page 200)
```

### Wajah
Har settings save `revalidateTag('settings')` karta hai. Us tag se jude SSG page
invalidate hote hain. `/ro-problem/[symptom]` par **`dynamicParams = false`** tha —
us setting ke saath Next invalidated path ko dobara banane ke bajay **404** de deta hai.

Yahi galti `(shop)/[intent]/page.tsx` par pehle pakdi ja chuki thi aur wahan `true`
kiya gaya tha. **Symptom page par reh gayi thi.**

### 🔴 Ye bug PEHLE SE LATENT THA
Pehle ye page `settings` wale kisi data ko chhuta hi nahi tha, isliye tag kabhi
yahan tak pahunchta hi nahi tha. Par jis din aap **phone number, visit charge,
banner ya payment setting** badalte — usi din ye paanch page mar jaate, aur kisi
ko pata bhi nahi chalta.

Rating ko admin-editable banane se ye bug **bahar aa gaya aur fix ho gaya**.

### Fix
`export const dynamicParams = true` (bilkul `[intent]` jaisa).
Surakshit hai: `generateStaticParams()` paanchon slug deta hai, aur anjaan slug par
`getSymptom()` null deta hai → `notFound()` → theek 404.

### Fix ke baad naapa
```
fresh build                    → paanchon 200, rc=59
settings save (rc=62) ke baad  → paanchon 200, rc=62  ✅
/ro-problem/koi-galat-slug     → 404 ✅  (galat URL par vyavhaar waisa hi)
```

---

## 5. 🆕 NAYA PERMANENT TEST — ye galti dobara nahi ho sakti

`scripts/verify-gbp-consistency.sh` + `scripts/gbp-consistency.py`

Saare 143 page ka rendered HTML scan karke zidd karta hai ki **har rating aur
har review count EK HI ho** — schema me bhi aur page par dikhne wale text me bhi.

```
schema ratingValue        1 alag value  →  5.0  (126 page)
schema reviewCount        1 alag value  →  58   (126 page)
page par rating           1 alag value  →  5.0  (349 jagah)
page par review count     1 alag value  →  58   (155 jagah)

✅ rating MEL khaata hai   : schema 5.0  ==  page 5.0
✅ review count MEL khaata : schema 58   ==  page 58

PASS 258 / FAIL 0
```

Detector **Product rating alag ginta hai** (har product ka apna 4.4/4.6/4.7/4.8 hota
hai, wo business rating nahi) aur star-breakdown (5,4,3,2,1) ko rating nahi maanta.
Pehli baar chalane par ye dono jhoothe FAIL de rahe the — chhanni lagayi gayi.

---

## 6. POORA TEST — 3408 PASS / 0 FAIL (25 script)

| | |
|---|---|
| clean install | 633 packages |
| `tsc --noEmit` | **EXIT 0** |
| `check-client-exports` | **PASS** (94 server→client import) |
| `next build` | **EXIT 0** — 210 static page |
| **verify-all** | **3408 PASS / 0 FAIL** (pehle 3149/24) |
| naya: verify-gbp-consistency | **258 / 0** |
| verify-admin-deep | 84 / 0 |
| verify-jsonld-parents | 1609 / 0 |

---

## 7. KUCH TOOTA TO NAHI — naap

```
LOCAL (naya) vs LIVE (abhi chal raha), 133 code-driven page:
  heading / phone loss   : 0
  H1+H2+H3  live 6,201   local 6,201      (bilkul barabar)
  tel:      live 2,266   local 2,266      (bilkul barabar)
  words     live 429,756 local 429,622    (-134 = Cloudflare email mask × 133)

glue bug 0 · homoglyph 0
Navbar 19,454 bytes · isServicePage 0
5 image byte-same
```

### Protected files
```
next.config.mjs     82284724deba3e1acf2964e5e955d079   SAME
package.json        76cbce312634e7ba6e8f363250eeb1a7   SAME
package-lock.json   f28a291d2cc4d9450585c9dc5632e0d4   SAME
prisma/seed.ts      27789bec8cef9964a6cbc11cd9d3b28e   SAME

🔴 src/lib/constants.ts  BADLA — naya md5 7441b863e20b6d16e94ddcf562042046
```

**constants.ts me sirf EK code line badli** (live GitHub se diff karke dekha):
```
-  reviewCount: 50,
+  reviewCount: 58,
```
Baaki 14 lines sirf comment hain (kyun badla, aur ab ye sirf fallback hai).

---

## 8. BADLI HUI FILES — har ek, byte ke saath

| file | bytes | kya |
|---|---:|---|
| `src/lib/seo/gbp-overrides.ts` | **5,372** | 🆕 resolveGbp + validateGbp |
| `scripts/gbp-consistency.py` | **8,883** | 🆕 detector |
| `scripts/verify-gbp-consistency.sh` | **2,527** | 🆕 test wrapper |
| `src/lib/constants.ts` | 16,393 | reviewCount 50 → **58** |
| `src/lib/settings.ts` | 9,938 | `getGbpSettings()` |
| `src/app/api/admin/settings/route.ts` | 6,458 | zod schema `gbp` |
| `src/components/admin/SettingsForm.tsx` | 28,178 | naya GbpCard |
| `src/app/admin/(dashboard)/settings/page.tsx` | 1,963 | gbp prop |
| `src/app/(shop)/ro-problem/[symptom]/page.tsx` | 17,472 | 🔴 `dynamicParams` false → **true** |
| `src/components/home/ServiceHero.tsx` | 17,548 | 🔴 hardcoded `4.9` hataya |
| `src/lib/seo/schema.ts` | 24,239 | optional `gbp` param |
| `src/lib/social-proof.ts` | 7,118 | function-ified |
| `src/lib/seo/search-queries.ts` | 13,237 | function-ified |
| `src/lib/seo/geo-answers.ts` | 10,387 | gbp param |
| `src/lib/seo/ads-landing-data.ts` | 19,619 | WHY_POINTS → `whyPoints(gbp)` |
| `src/lib/seo/blog-data.ts` | 36,539 | `authorCredentials(gbp)` |
| `src/components/ui/TrustBadges.tsx` | 1,847 | async, khud padhta hai |
| `src/components/layout/Footer.tsx` | 7,472 | async |
| `src/components/home/SearchAnswers.tsx` | 2,505 | async |
| `src/components/home/ProofStats.tsx` | 2,440 | async |
| `src/components/home/Testimonials.tsx` | 2,923 | async |
| `src/components/home/ReviewShowcase.tsx` | 9,385 | gbp prop |
| `src/components/service/AdsHeroBanner.tsx` | 11,620 | async |
| `src/components/service/NearMeBlock.tsx` | 11,622 | async |
| `src/components/service/WhyChooseGrid.tsx` | 5,773 | async |
| `src/components/admin/ReviewTracker.tsx` | 4,949 | DB se padhta hai |
| `src/app/(shop)/page.tsx` | 18,310 | gbp pass |
| `src/app/(shop)/[intent]/page.tsx` | 29,315 | gbp pass |
| `src/app/(shop)/ro-service-patna/[area]/page.tsx` | 33,151 | gbp pass |
| `src/app/(shop)/about/[person]/page.tsx` | 7,683 | authorCredentials |
| `scripts/verify-all.sh` | 1,608 | naya test joda (25) |
| `scripts/verify-service-intent.sh` | 17,628 | purana assert update |
| `APPLY.ps1` | 10,672 | nayi file list + byte |

**SEO / keyword / content kuch nahi badla** — heading, text, keyword, area data,
brand data, rate, warranty, phone — sab waise ke waise (upar section 7 ka naap).

---

## 9. ROLLBACK
* **Vercel** → Deployments → purana 🟢 Ready → ⋯ → **Promote to Production** (30 sec)
* **Git** → `git reset --hard backup-<date>` (APPLY.ps1 push se pehle backup branch banata hai)
