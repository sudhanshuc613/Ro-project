# FULL DEEP VERIFY — 18 Oct 2026

Owner: *"har ek pages keyword or admin panel or sitemap url sab kuch verify karke de … competior ko deep analyis kar … khud build karke check karke de"*

Sandbox poora wipe ho gaya tha (node, postgres, swap, node_modules — sab).
**Shuru se khada kiya, clean install kiya, khud build kiya, phir naapa.** Har number neeche hai.

---

## 0. SABSE BADI KHABAR — tera 16-Oct zip LIVE HAI ✅

Maine maana tha ki push baaki hai. **Naap kar dekha — tu push kar chuka hai.** Proof:

| check | live par mila |
|---|---|
| blog `dateModified` | **2026-10-12** ← 16-Oct ka fix |
| sitemap lastmod (wahi blog) | **2026-10-12** |
| homepage node3 keys | `['@context','@id','@type','aggregateRating','review']` ← bilkul @id fix |
| area page `Service` node | `aggregateRating` **NAHI hai** |
| JSON-LD detector, LIVE | **1624 PASS / 0 FAIL** |
| LIVE par `aggregateRating on Service` | **0** (pehle 83 tha) |

**Matlab Search Console ka "Invalid object type" error ab theek ho chuka hai.**
Ab sirf Google ke dobara crawl karne ka intezaar hai.

---

## 1. KHUD BUILD KIYA — numbers

```
clean install          633 packages
prisma db push         in sync
prisma generate        Client v5.22.0
seed                   complete
tsc --noEmit           EXIT 0
check-client-exports   PASS (94 server→client import)
next build             EXIT 0 — 210 static page
```

### Test suite — **3149 PASS / 0 FAIL** (24 script)

| script | PASS | FAIL |
|---|---:|---:|
| verify-h1-keyword | 66 | 0 |
| verify-keyword-coverage | 27 | 0 |
| verify-images-titles | 40 | 0 |
| verify-robots-media | 24 | 0 |
| verify-forms-and-features | 83 | 0 |
| verify-area-depth | 64 | 0 |
| verify-new-areas | 140 | 0 |
| verify-service-intent | 165 | 0 |
| verify-seo-packages | 94 | 0 |
| verify-ux-upgrade | 99 | 0 |
| verify-seo-indexing | 59 | 0 |
| verify-product-admin | 68 | 0 |
| verify-titles-and-schema | 46 | 0 |
| verify-brand-rename | 51 | 0 |
| verify-admin-full | 44 | 0 |
| verify-password-features | 31 | 0 |
| verify-sitemap-lastmod | 8 | 0 |
| verify-search-queries | 22 | 0 |
| verify-serp-hygiene | 9 | 0 |
| verify-og-image | 6 | 0 |
| verify-billing | 262 | 0 |
| verify-banner-upload | 48 | 0 |
| verify-jsonld-parents | 1609 | 0 |
| **verify-admin-deep** 🆕 | **84** | **0** |
| **TOTAL** | **3149** | **0** |

---

## 2. 🆕 ADMIN PANEL — ab LOGIN KARKE test hota hai

Purana `verify-admin-full.sh` sirf itna dekhta tha: page 200 deta hai, API bina
login 401 deti hai. **Wo kabhi nahi batata tha ki login ke BAAD panel chalta hai ya nahi.**
Login toot jata, koi page white screen deta, API 500 deti — purana test phir bhi PASS.

Naya `scripts/verify-admin-deep.sh` + `scripts/admin-deep.py`:

```
1) BINA LOGIN — 23/23 admin page guarded (login par bhejte hain)
2) BINA LOGIN — 18/18 admin API: koi 200 NAHI
      alerts 401 · billing 401 · billing/setup 401 · brands 401
      change-password 405 · clients 401 · live 401 · media 401 · push 401
      rank-check 401 · rates 401 · redirects 401 · search 401 · seo 405
      service-records 405 · settings 401 · site-images 401 · technicians 405

3) ASLI LOGIN (NextAuth provider id = 'password')
      csrf mila → POST /api/auth/callback/password → 200
      session: role = SUPER_ADMIN, phone = 8969821440   ✅

4) LOGIN KE BAAD — 23/23 page sach me render hote hain
```

| admin page | h1 | words | input | button |
|---|---:|---:|---:|---:|
| /admin | 1 | 398 | 1 | 4 |
| /admin/abandoned-carts | 1 | 120 | 1 | 4 |
| /admin/amc | 1 | 150 | 1 | 4 |
| /admin/billing | 1 | 203 | 4 | 5 |
| /admin/billing/new | 1 | 685 | 41 | 16 |
| /admin/categories | 1 | 143 | 1 | 4 |
| /admin/clients | 1 | 142 | 2 | 5 |
| /admin/competitors | 1 | 192 | 1 | 5 |
| /admin/customers | 1 | 178 | 3 | 11 |
| /admin/inventory | 1 | 167 | 1 | 4 |
| /admin/media | 1 | 198 | 4 | 5 |
| /admin/orders | 1 | 122 | 1 | 4 |
| /admin/products | 1 | 188 | 1 | 4 |
| /admin/products/new | 1 | 265 | 13 | 20 |
| /admin/rates | 1 | 369 | 1 | 16 |
| /admin/security | 1 | 306 | 4 | 8 |
| /admin/seo | 1 | 199 | 4 | 10 |
| /admin/service-due | 1 | 176 | 1 | 4 |
| /admin/service-requests | 1 | 131 | 1 | 4 |
| /admin/settings | 1 | 671 | 25 | 17 |
| /admin/site-images | 1 | 868 | 1 | 18 |
| /admin/technicians | 1 | 218 | 1 | 5 |
| /admin/warranty-amc | 1 | 326 | 1 | 4 |

**5) LOGIN KE BAAD — API sach me data deti hai:**
```
alerts         200  {unread, setupNeeded, alerts}
billing        200  {bills}
billing/setup  200  {ready, present, missing}
brands         200  {brands}
clients        200  {clients}
live           200  {serverTime, newOrders, newServices, counters}
media          200  {items}
push           200  {configured, publicKey, deviceCount, devices}
rank-check     200  {history, keywords, competitors, groups}
rates          200  {overrides}
redirects      200  {redirects}
search         200  {hits}
settings       200  {contact, service, banner}
site-images    200  {overrides}
change-password / seo / service-records / technicians  → 405 (sirf POST, sahi hai)
```

### 🔴 Is test ko banate waqt MAINE KHUD GALTI KI — aur theek ki
Pehli baar maine 3 admin URL **guess** kiye: `/admin/coupons`, `/admin/reviews`,
`/admin/analytics`. Wo kabhi bane hi nahi the → 3 **jhoothe FAIL**.
Aur 3 **ASLI** page chhoot gaye the: `/admin/rates`, `/admin/security`, `/admin/site-images`.

Ab script route `src/app/admin/` aur `src/app/api/admin/` se **khud nikalti hai**.
Dono galtiyan ab namumkin hain. *(Wahi niyam jo competitor URL par laga tha —
guess mat karo — apni site par bhi laga.)*

---

## 3. HAR PAGE — SEO audit

```
sitemap            HTTP 200 · 143 URL (local) / 144 (live)
crawl              143/143 HTTP 200
H1 == 1            143/143
title length       39–62
desc length        103–160
canonical missing  0
og:image missing   0 · og:title 0 · viewport 0 · html lang 0
noindex leak       0
thin (<650 words)  0

duplicate title 0 · desc 0 · canonical 0 · H1 0

invalid JSON-LD    0 · distinct schema types 47
LocalBusiness 126 · BreadcrumbList 142 · FAQPage 136 · Service 125
Organization 110 · WebSite 99

tel: links         min 4 · median 9 · max 32
WhatsApp missing   0
img bina alt       0
internal links     min 42 · median 96
words              min 688 · median 3,567 · max 8,624
TOTAL WORDS        433,591
```

---

## 4. SITEMAP — har URL ka asli status (live, Googlebot UA se)

```
sitemap URLs        144   (duplicate 0)
HTTP 200            144/144
🔴 non-200          0
🔴 canonical ≠ self 0
🔴 noindex          0
response time       min 0.10s · median 0.14s · max 2.57s
```

**Har ek URL khola gaya, guess nahi.**

---

## 5. KEYWORD — baseline script se (comparable numbers)

`/home/user/kwscan/` ke **original** script (naya scanner alag number deta hai):

```
127-keyword scan   TOTAL 94   T1-HEADING 22 · T2-BODY 71 · T3-WEAK 1 · MISS 0
  PRIMARY (14)     T1:6 T2:7 T3:1  MISS:0
  INTENT  (21)     T1:2 T2:19     MISS:0
  SHOP    (17)     T1:1 T2:16     MISS:0
  BRAND   (22)     T1:8 T2:14     MISS:0
  NEARME  (12)     T1:1 T2:11     MISS:0
  TRUST   (8)      T1:4 T2:4      MISS:0

area 12 pattern × 83 area  →  82 area par 12/12,  1 area par 11/12
brand × area               →  1577/1577 (100%)
brand 10 × 21              →  205/210
94-keyword heading         →  93/94
72-gap keyword             →  69/72
```

### Wo ek 11/12 — jaancha, **scanner ki galti hai, site ki nahi**

`kadamkuan-mahendru` par `{A} Patna RO repair` pattern MISS dikha.

Wajah: area ka asli naam **"Kadamkuan Mahendru Belt"** hai, par scanner URL slug se
phrase banata hai (`kadamkuan-mahendru` → "kadamkuan mahendru"), jisme **"Belt" nahi hai**.
Us roop me phrase bolchaal me hai hi nahi.

Naap kar confirm:
```
"kadamkuan mahendru belt patna ro repair"  → HIT (kadamkuan-mahendru page par)
"kadamkuan patna ro repair"                → HIT (/kadamkuan page par)
"mahendru patna ro repair"                 → HIT (/mahendru page par)
"ro repair in kadamkuan"                   → HIT (do page par)
"ro repair in mahendru"                    → HIT
```
**Asli koi gap nahi. Kuch nahi badla** — artifact ke liye awkward English daalna wahi
galti hoti jo pehle 5 brand-template artifacts me pakdi thi.

---

## 6. LIVE vs LOCAL — content kahin kam to nahi

133 code-driven page (DB wale alag, kyunki live DB me 1 extra product hai):

```
🔴 content loss pages : 0
words     live 429,755  local 429,622   diff = -133
H1/H2/H3  live 6,201    local 6,201     (bilkul barabar)
tel:      live 2,266    local 2,266     (bilkul barabar)
```

**-133 ka poora hisaab:** Cloudflare live par email chhupata hai —
`support@rokadoctor.in` (1 word) → `[email protected]` (2 words) = 133 page × 1 word.
**Ek bhi shabd, heading ya phone link nahi gaya.**

---

## 7. BUG-CLASS DETECTOR

| Class | Kya | Natija |
|---|---|---|
| A | GLUE BUG (JSX inline chipakna) — source-level | **0** |
| B | Cyrillic / Greek homoglyph | **0** |
| C | client file se non-component export | **0** (94 import) |
| H | aggregateRating galat parent par | **0** local · **0 LIVE** ✅ |
| I | ek @id par takraata naam/image | **0** local · **0 LIVE** ✅ |

Area-depth doorway gate: overlap **83 ≤ 84** · duplicate sentence **53 ≤ 55** · hard-water pair **78 ≤ 84**

---

## 8. COMPETITOR — poora sitemap dhaancha (18 Oct)

URL kahin guess nahi — har site ka `robots.txt` → `sitemap.xml` se nikale.

| site | sitemap URL | Patna area URL | brand URL | brand-in-heading | area-in-heading |
|---|---:|---:|---:|---:|---:|
| **roservicecentrepatna.in** *(Google #1)* | **67** | **61** | 4 | **0** | **0** |
| rocareindia.com | 8,230 | 15 | 221 | 4 | 1 |
| serviceondoors.com | **50,302** | 135 | **14,935** | 0 | 0 |
| rosaleandservices.com | 119 | 0 | 23 | 0 | 0 |
| aquasolutionindia.com | 500 | 0 | 15 | 0 | 0 |
| roservicecenterpatna.com | 7 | 0 | 0 | 0 | 0 |
| waterix.in · roservice.org.in · 24x7patnarocare.in · patnaroservice.in | **0 (sitemap hi nahi)** | – | – | – | – |
| **AQUA PERL (hum)** | **144** | 83 | 21 | 1 | **22** |

### 🔴 ASLI GAP — Google #1 ke paas 6 jagah hain, hamare paas nahi

```
bihta · didarganj · fatuha · naubatpur · punpun · sampatchak
```

Ye Patna **zile** ke block/kasbe hain (20–35 km door). Unka URL pattern:
`/ro-service-centre-{area}-patna/`

**Unki quality naapi:**
```
bihta       1,426 words
fatuha      1,426 words
punpun      1,426 words
naubatpur   1,428 words
didarganj   1,427 words
sampatchak  1,427 words

aapas me overlap: HAR JODI par 48.9% — 22 bilkul same vaakya
title pattern   : "RO Service Centre {Area} Patna @7880004551"  (sirf naam badalta hai)

hamara kankarbagh page: 3,579 words
```

Yaani unke 6 page **template hain** — aadha content copy. Phir bhi wo #1 hain,
kyunki unki domain purani hai aur backlink hain. **Content ki wajah se nahi.**

### 🔴 Maine ye 6 page BANAYE NAHI — aur kyun

Do wajah, dono seedhi:

1. **Hume pata hi nahi ki tu wahan jaata hai ya nahi.** Bihta Buddha Colony se ~30 km hai,
   hamara schema `geoRadius: 25000` (25 km) bolta hai aur site "90 minute response"
   ka vaada karti hai. Jis jagah ka kaam nahi lete, uska page banana jhooth hai —
   aur customer book karke nahi aane par review bhi kharab hoga.
2. **Area-depth gate ke liye ASLI data chahiye** — har area ka `tdsRange`,
   `pincode`, `landmarks`, `technicians`, `monthlyJobs`, `commonRepair`.
   Bina iske page gate pe fail hoga (yahi `BrandAreaBlock` ke pehle draft me hua tha).

**Tu bata de** in 6 me se kaunse area me sach me service dete ho — aur unka TDS
range + 2–3 landmark + pincode. Main agle push me asli-data wale page bana dunga,
template nahi.

### Baaki competitor delta
* `serviceondoors.com` ab **50,302 URL** (16 Oct par 20,302 the) — 14,935 brand URL.
  Ye `{brand} ro service in {city}` ka mass-generated doorway pattern hai.
  Ye wahi cheez hai jo maine banane se **mana kiya tha** (Google spam policy:
  scaled content abuse). Unke liye ye risk hai, hamare liye nahi.
* `rocareindia.com` ka pattern dikha: `{brand}-water-purifier-service`,
  `{brand}-water-purifier-amc`, `{brand}-water-purifier-installation` — alag-alag URL.
  Hum wahi teen cheezein **ek brand page ke 3 H3 section** me rakhte hain
  (`BrandKeywordBlock`) — doorway risk ke bina.
* `waterix.in`, `roservice.org.in`, `24x7patnarocare.in`, `patnaroservice.in` ka
  **sitemap hi nahi hai** — Google ko unke page dhoondhne me dikkat hogi.
* `roservicecentrepatna.in` ke sitemap me `hello-world` (WordPress ka default post)
  aur ek khaali URL pada hai — unki site maintained nahi hai.

**Aaj bhi sabse bada farq:** heading me area ka naam — hum **22**, saare competitor
milakar **1**. Brand×area heading hum **1577/1577**, competitor **0**.

---

## 9. PROTECTED FILES — kuch nahi chhua

```
next.config.mjs       82284724deba3e1acf2964e5e955d079   SAME
package.json          76cbce312634e7ba6e8f363250eeb1a7   SAME
package-lock.json     f28a291d2cc4d9450585c9dc5632e0d4   SAME
prisma/seed.ts        27789bec8cef9964a6cbc11cd9d3b28e   SAME
src/lib/constants.ts  41a293d2f18c3fa9541671e5c9e22d5e   SAME
Navbar.tsx            19,454 bytes · isServicePage 0     SAME
service-tech.png      2,706,298   hero-technician.png 1,847,335
patna-service-hero    1,538,045   ro-commercial.png   1,707,554
ro-domestic.png       1,186,500                          SAB SAME
```

---

## 10. IS ZIP ME KYA NAYA — sirf 3 file

| file | bytes | kya |
|---|---:|---|
| `scripts/admin-deep.py` | **7,838** | 🆕 login karke admin panel test |
| `scripts/verify-admin-deep.sh` | **2,529** | 🆕 wrapper |
| `scripts/verify-all.sh` | 1,567 → **1,585** | naya test jod diya (24 script) |
| `VERIFY-18OCT-FULL.md` | ye file | report |

**Baaki poora project bilkul wahi hai jo abhi live chal raha hai.**
Site ka koi bhi page, text, keyword, schema, image — kuch nahi badla.
Ye zip sirf **test coverage** badhata hai.

---

## 11. JO ABHI BHI BAAKI HAI (sirf tu kar sakta hai)

| # | Cheez | Kyun zaroori |
|---|---|---|
| 1 | 🔴 **Backlink 0** → Udyam, Bing Places, JustDial, IndiaMART | indexing + ranking ka **sabse bada** rukawat |
| 2 | 🔴 **GBP "Open 24 hours"** vs site 08:00–21:00 | "open at time of search" = top-5 local factor · **2 minute** |
| 3 | 🔴 GBP review 50 → 200+ · photo ~10 → 100+ | Map Pack #8 ka asli karan |
| 4 | 🔴 GitHub repo **PUBLIC** (search me aata hai) → Private | poora DB schema public hai |
| 5 | 🔴 admin password `ChangeMe@123` + 2FA off | `/admin/security` se badal |
| 6 | 🔴 Google Ads **call** + **form** conversion label | abhi tak nahi mile |
| 7 | 🟡 6 naye area (bihta/fatuha/punpun/naubatpur/didarganj/sampatchak) ka data | upar section 8 |
| 8 | 🟡 Homepage ke 3 testimonial asli customer hain? | nakli review markup = manual action |
| 9 | 🟡 `kadamkuan` vs `kadamkuan-mahendru` — ek hi mohalla? | tu decide kar |
| 10 | 🟡 17 `₹X onwards` commercial rate ka upper bound | tu bata |

---

## 12. ROLLBACK

* **Vercel** → Deployments → purana 🟢 Ready → ⋯ → **Promote to Production** (30 sec)
* **Git** → `git reset --hard backup-<date>` (APPLY.ps1 push se pehle backup branch banata hai)
