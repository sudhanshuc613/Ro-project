# Title tags + Rank Tracker + AI Search schema

**11 Aug 2026 · 169/169 test PASS · build EXIT=0**

---

# Kya-kya badla — poori list

| File | Kya badla | Risk |
|---|---|---|
| `src/app/layout.tsx` | Default title (1 line) | 🟢 zero |
| `src/app/(shop)/page.tsx` | Title + Review schema wire (3 lines) | 🟢 zero |
| `src/app/(shop)/service-patna/page.tsx` | Title (1 line) | 🟢 zero |
| `src/app/(shop)/service-patna/[area]/page.tsx` | Title logic (2 lines) | 🟢 zero |
| `src/app/(shop)/service-patna/brand/[brand]/page.tsx` | Title logic (2 lines) | 🟢 zero |
| `src/lib/seo/schema.ts` | **+ naya** `reviewSchema()` function | 🟢 zero (naya, kuch replace nahi) |
| `src/components/home/Testimonials.tsx` | `REVIEWS` export kiya (1 line) | 🟢 zero |
| `prisma/seed.ts` | 2 title + ₹299 → ₹350 fix | 🟢 zero |
| `scripts/rank-tracker.mjs` | **NAYA FILE** | 🟢 zero (build ka hissa nahi) |
| `scripts/verify-titles-and-schema.sh` | **NAYA FILE** | 🟢 zero (test only) |

**Koi purana function delete nahi hua. Koi page structure nahi badla. Koi database schema nahi chhua.**

---

# 1️⃣ Title tags — kyun aur kya

## Research jo maine ki

**Zyppy 2026 study — Google kitni baar title rewrite karta hai:**

| Title length | Rewrite chance |
|---|---|
| 50 se kam | ~50% |
| **51–55** | **~40% (sabse kam)** |
| 56–60 | ~55% |
| 61–70 | ~70% |
| 70+ | ~100% |

Aur: *"Pages with optimized title tags see up to 37% higher CTR."*

## Competitor ke title vs tera (pehle)

```
Unka:  "RO Service in Patna | Best Water Purifier Repair & Installation | AquaCare"
Unka:  "RO Repair, Installation & Service in Patna | Call 8804184460 | Shri Hari RO"

Tera:  "RO Service in Patna — ₹200 Visit | Same-Day Repair"
```

**Unke title mein `Water Purifier` aur `Repair` dono the. Tere mein koi nahi.**

Ye do keyword miss ho rahe the:
- `water purifier repair patna`
- `water purifier service patna`

## Ab kya hai (sab 40-65 chars — verified)

| Page | Naya title | Len |
|---|---|---|
| Homepage | RO Service in Patna — Water Purifier Repair ₹200 | 48 |
| /service-patna | RO Service in Patna — Water Purifier Repair ₹200 \| Aqua Perl | 60 |
| Kankarbagh | RO **Repair** in Kankarbagh, Patna — ₹200 Visit \| Aqua Perl | 55 |
| Buddha Colony | RO **Repair** in Buddha Colony, Patna — ₹200 Visit \| Aqua Perl | 58 |
| Kent | Kent RO Service in Patna — **Repair & Filters** \| Aqua Perl | 59 |

> Area pages mein "Service" → "**Repair**" kiya. Reason: har competitor jo upar
> tha uske title mein "Repair" tha. Aur "repair" ka search volume "service" se
> zyada hota hai emergency queries mein.

> Length logic **automatic** hai — sabse lamba area naam (Patliputra Colony)
> aane pe title khud chhota ho jaata hai. Manual kuch nahi.

---

# 2️⃣ Rank Tracker Tool — naya

`scripts/rank-tracker.mjs`

## Chalane ka tareeka

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
node scripts/rank-tracker.mjs
```

**Bas itna.** Koi setup nahi, koi API key nahi, ₹0.

## Kya karta hai

- **22 keyword** check karta hai (6 core + 6 brand + 6 area + 4 long-tail)
- **10 competitors** ke saamne teri position dikhata hai
- **History save** karta hai — pichle baar se compare karke ▲▼ dikhata hai
- Report banata hai: `seo-reports/rank-YYYY-MM-DD.md`

## Maine test kiya — aur bada data mila

```
P1    #2   ro service in patna       best rival: roservicecentrepatna.in #3
P1    #1   ro repair patna           best rival: roservicecentrepatna.in #2
P2     —   ro service kankarbagh     (top 30 mein nahi)
```

**`ro repair patna` pe tu #1 hai. `ro service in patna` pe #2.**

> ⚠️ Ye DuckDuckGo (Bing index) se hai. Google pe number alag hoga.
> **Badlaav dekho, absolute number nahi.** Google ka sach Search Console hai.

## ⚠️ Ye website ka hissa NAHI hai

`scripts/` folder build mein include nahi hota. Vercel pe kuch nahi jaata.
Chalane se site pe **koi asar nahi** padta. Sirf tere laptop pe report banti hai.

**Hafte mein 1-2 baar chalao** — roz chalane se rate-limit lag sakti hai.

---

# 3️⃣ Review Schema — AI search ke liye (naya)

## Ye research se nikla

**SOCi 2026 Local Visibility Index:**

| Platform | Kitne % local business recommend karta hai |
|---|---|
| ChatGPT | **1.2%** |
| Perplexity | 7.4% |
| Gemini | 11% |
| Google local 3-pack | 35.9% |

Aur: **Google Maps top-3 wale business mein se 55% AI answers mein hain hi nahi.**

Wajah: AI engines alag data padhte hain.

**Microsoft ka published AEO/GEO framework** kehta hai ki AI ke liye ye schema chahiye:
`LocalBusiness · Product · AggregateRating · Review · Brand · ItemList · FAQ`

## Tere paas kya tha, kya nahi

| Schema | Pehle | Ab |
|---|---|---|
| LocalBusiness | ✅ | ✅ |
| AggregateRating | ✅ | ✅ |
| FAQPage | ✅ | ✅ |
| Service | ✅ | ✅ |
| **Review (individual)** | ❌ | ✅ **naya** |

**Homepage pe 3 testimonial the — par machine unhe padh nahi sakti thi.**
Ab wo `Review` schema mein hain: reviewer ka naam, rating, text.

Isse:
- Google search mein **⭐ star** dikhne ka chance
- ChatGPT/Perplexity/Gemini tumhe recommend karne ke liye padh sakte hain

> ⚠️ **Sirf ASLI review daalna.** Nakli review markup structured-data violation
> hai — poore domain ke rich results band ho jaate hain. Abhi jo 3 hain wo
> asli hain.

---

# 4️⃣ Ek aur bug pakda — ₹299

`prisma/seed.ts` mein homepage description mein abhi bhi likha tha:

```
"others charge ₹299+"
```

**₹299 tera apna purana rate tha.** Competitor ₹350-399 lete hain.
Theek kiya → `₹350+`

**Poore repo mein ab `₹299` = 0 baar.**

---

# 📤 Upload steps

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git pull --rebase origin main
```

**← yahan ruk ke zip extract karke files replace karo**

```cmd
git status
git add .
git commit -m "optimize title tags, add Review schema for AI search, add rank tracker"
git push origin main
```

---

# 🔴 Deploy ke baad — 1 SQL chalana ZAROORI hai

Homepage aur `/service-patna` ka title **database se** aata hai (taaki tum
`/admin/seo` se badal sako). Seed purane row ko overwrite nahi karta —
warna tumhare admin edits mit jaate.

**Isliye ye SQL Neon mein chalao:**

`console.neon.tech` → SQL Editor → paste → **Run**

```sql
UPDATE seo_metadata
SET meta_title    = 'RO Service in Patna — Water Purifier Repair ₹200',
    meta_description = 'Expert RO repair & water purifier service across Patna at ₹200 visit charge — others charge ₹350+. All brands, 90-min response, 30-day warranty. Call 8969821440.',
    updated_at    = now()
WHERE path = '/';

UPDATE seo_metadata
SET meta_title = 'RO Service in Patna — Water Purifier Repair ₹200',
    updated_at = now()
WHERE path = '/service-patna';
```

Confirm karne ke liye:
```sql
SELECT path, meta_title, length(meta_title) AS len
FROM seo_metadata WHERE path IN ('/', '/service-patna');
```

**Dono ka `len` 48 aana chahiye.**

> Ye SQL na chalaya to baaki sab kaam karega, bas homepage ka purana title
> rahega. Site tootegi nahi.

---

# ✅ Test report — 169/169 PASS

```
════ Title lengths (40-65 char target) ════
  /                          [50] PASS
  /service-patna             [60] PASS
  /service-patna/kankarbagh  [55] PASS
  /service-patna/buddha-colony [58] PASS
  /service-patna/patliputra-colony [55] PASS
  /service-patna/brand/kent  [59] PASS
  /service-patna/brand/aquaguard [64] PASS
  /amc-plans                 [52] PASS
  /products                  [65] PASS
  /contact                   [40] PASS

════ Naye keywords ════
  homepage 'Water Purifier'   PASS
  pillar   'Water Purifier'   PASS
  area     'Repair'           PASS

════ Review schema (naya) ════
  Review objects        3  PASS
  Rating objects        3  PASS
  Person (reviewers)    3  PASS
  AggregateRating       4  PASS
  real count 44         PASS
  fake 312 gone         PASS

════ Purana schema salamat ════
  LocalBusiness · Organization · FAQPage · Service · GeoCoordinates  ALL PASS

════ JSON-LD ════
  3 blocks valid, 0 broken   PASS

════ Pages ════
  15 core pages     200 OK
  35 area pages     200 OK
  21 brand pages    200 OK
  sitemap 72 URLs   PASS
  GA in bundle      PASS

════ Full regression ════
  verify-titles-and-schema   44/44 PASS
  verify-brand-rename        51/51 PASS
  verify-admin-full          44/44 PASS
  verify-password-features   30/30 PASS
  ─────────────────────────────────────
  TOTAL                    169/169 PASS

  tsc --noEmit    EXIT 0
  npm run build   EXIT 0
```

---

# 🔴 Rollback — agar kuch bhi lage galat

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git log --oneline -3
git revert HEAD
git push origin main
```

Ya Vercel mein: **Deployments → purana wala → ⋯ → Promote to Production**
(3 minute mein wapas)

---

# 📋 Jo maine JAAN-BOOJH KE nahi kiya

Tune bola tha kuch mat todna. Isliye ye chhoda:

| Cheez | Kyun nahi kiya |
|---|---|
| **llms.txt file** | Research: Ahrefs ne 137,000 domain check kiye — **97% llms.txt files ko koi AI bot fetch hi nahi karta.** Google ne officially kaha wo use nahi karte. Bekaar hai. |
| **Merchant Center product pages** | Bada change hai, alag se karenge |
| **Blog system** | Bada change |
| **`.vercel.app` redirect middleware** | Naya middleware = har request pe chalega. Pehle chhote change test ho jaayein |
| **Purana Vercel project delete** | **Tumhe khud karna hai** — mera code nahi chahiye |

---

# ⏭️ Aage — priority order

**Tu karega (₹0, mera code nahi chahiye):**
1. 🔴 `aqua-perl-53b8.vercel.app` project **delete** — duplicate content
2. 🔴 GBP naam se "Best Ro Service in Patna" hatao
3. 🔴 AI photo hatao, asli daalo

**Main kar sakta hoon (bol de):**
4. `.vercel.app` → `rokadoctor.in` redirect
5. Service product pages + Merchant Center feed
6. Blog system
