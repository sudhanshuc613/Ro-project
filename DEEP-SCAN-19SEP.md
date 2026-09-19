# Deep Scan — 19 Sep 2026

Sab kuch live measure kiya gaya. Koi andaza nahi.

---

## 1. Tera push — chal gaya ✅

| Path | Live title | Length |
|---|---|---|
| `/` | RO Service Near Me in Patna — ₹200 Visit, 90 Min | 48 |
| `/service-patna` | Water Purifier Repair Patna — RO Service Centre ₹200 \| Aqua Perl | 64 |
| `/ro-service-in-patna` | RO Service in Patna — ₹200 Visit, All Brands · 8969821440 | 57 |

DB rows bhi update ho gaye — warna purane titles dikhte. **Tu ne dono kaam kar diye.**

Site health: **133/133 URLs → HTTP 200**, zero noindex, zero redirect chain, canonical har page pe sahi, `www` → non-www ek hop, uppercase URL → lowercase ek hop.

---

## 2. Teri baat — "competitor ne domain ke aage dedicated page banaya hai"

Maine check kiya. **Tu aadha sahi hai, aur ek jagah main tujhse asehmat hoon.**

| Site | Jo rank karta hai | Structure |
|---|---|---|
| roservicecentrepatna.in (**#1**) | `/` — **HOMEPAGE** | koi dedicated page nahi |
| rosaleandservices.com | `/ro-service-in-patna/` | dedicated page |
| rocareindia.com | `/ro-water-purifier-service-patna` | dedicated page |
| onedios.com | `/ro-service-in-patna` | dedicated page |
| **hum** | `/ro-service-in-patna` | **12 Sep se LIVE** |

**Jo #1 pe hai usne dedicated page banaya hi nahi — uska homepage rank karta hai.**

Aur hamara dedicated page 7 din se live hai. To dedicated page wali baat asli wajah nahi hai.

### Asli wajah: DOMAIN KA NAAM

```
roservicecentrepatna.in  → ro + service + centre + patna   ← 4 keyword
patnaroservice.co.in     → ro + service + patna            ← 3 keyword
aquaglowroservice.in     → ro + service + aqua             ← 3 keyword
rocarepoint.in           → ro + care + point               ← 3 keyword
rokadoctor.in            → ro                              ← 1 keyword  ← HUM
```

Hamara domain keyword-free hai. Ye ek nuksan hai jo on-page se poora nahi hota.

**Par domain mat badalna.** Naya domain = phir se 0 se shuru, jo 133 pages abhi index hone ki line me hain wo mar jayenge. Iska ilaaj neeche hai (#5).

---

## 3. 🔴 NAYA BUG #1 — H1 GLUE, PAANCHVI BAAR — 21 pages

Sab 21 brand pages pe Googlebot ye padh raha tha:

```
Kent RO Service & Repair in PatnaVisit Charge Only ₹200
                              ^^^^^^^^^^ chipka hua
```

Matlab **"Patna" shabd 21 pages pe target keyword ke roop me tha hi nahi** — "PatnaVisit" ek bekaar shabd hai jo koi search nahi karta.

**Source:** `src/app/(shop)/service-patna/brand/[brand]/page.tsx:117`

Test suite ne ye kyu nahi pakda? Kyunki `verify-h1-keyword.sh` sirf 12 paths check karta tha — brand pages list me the hi nahi. Maine 13 aur paths add kiye, ab 63 checks (pehle 39).

**Fix:** `{' '}` JSX whitespace guard.

---

## 4. 🔴 NAYA BUG #2 — SITEMAP KA lastmod JHOOTH BOL RAHA THA

Ye sabse bada technical bug hai jo mila. Isi ne indexing dhimi kar rakhi thi.

```ts
const now = new Date();                    // ← build ka time
{ url: '/', lastModified: now, ... }       // ← 120+ URLs pe wahi time
export const revalidate = 3600;            // ← har ghante naya time
```

**Matlab:** har ghante saare 133 URLs bolte the "abhi-abhi badla hoon" — jabki content mahino se same tha.

Google ka rule: `lastmod` tabhi use hota hai jab wo *consistently accurate* ho. Jo site har baar sab kuch "naya" bolti hai, uska lastmod Google **puri site ke liye ignore kar deta hai**. Yaani jab tu sach me kuch update karta tha, Google ko farq dikhta hi nahi tha.

**Live proof:**

| Site | URLs | Alag lastmod values |
|---|---|---|
| roservicecentrepatna.in (#1) | 66 | **66** — har page ki apni asli date |
| rosaleandservices.com | 88 | **85** |
| **hum (pehle)** | 133 | **13** — sab build-time 🔴 |
| **hum (ab)** | 132 | **7 asli dates** ✅ |

**Fix:** nayi file `src/lib/seo/content-dates.ts` — har page ki asli content-change date (12/16/18/19 Sep, jab wo page sach me badla). Blog posts pehle se apni asli date bhejte the, products apna `updatedAt` — wo sahi the, chhua nahi.

**Naya test:** `scripts/verify-sitemap-lastmod.sh` — 8 checks. Do baar sitemap fetch karke compare karta hai; agar timestamp badla to FAIL.

---

## 5. 🔴 NAYA BUG #3 — /service-patna khud se lad raha tha

Tere push ke baad:

```
TITLE : Water Purifier Repair Patna — RO Service Centre ₹200
H1    : Expert RO Service in Patna          ← alag phrase!
```

Title kuch aur bolta tha, H1 kuch aur. Aur H1 wala phrase `/ro-service-in-patna` ka hai — yaani cannibalization poori tarah khatam nahi hui thi, sirf title level pe hui thi.

**Fix:** H1 → `Water Purifier Repair in Patna`. Ab title aur H1 ek hi phrase pe.

### Cannibalization — pehle vs ab

| Page | title | H1 | body count |
|---|---|---|---|
| `/ro-service-in-patna` | ✅ | ✅ | 16 ← **isko rank karna hai** |
| `/service-patna` | ❌ | ~~✅~~ → ❌ | 7 |
| `/ro-services-patna` | ❌ | ❌ | 5 |
| `/` | ❌ | ❌ | 3 |

Ab sirf **ek** page ka title aur H1 dono "ro service in patna" bolte hain. Baaki support karte hain.

---

## 6. ⚠️ Jo tu screenshot me dekh raha hai — stars ka sach

Tune 6 screenshot bheje. Char me stars hain:

```
rocareindia.com    4.8 ★ (1,88,992)
serviceonwheel.com 4.9 ★ (7,89,586)
sulekha.com        4.9 ★ (17)
```

**Hum wo stars kabhi nahi la sakte, aur ye hamari galti nahi hai.**

Google ka niyam (Sept 2019, Dec 2025 me dobara confirm): apni hi website pe apne hi business ka `LocalBusiness`/`Organization` rating daalo to Google **stars nahi dikhata** — use "self-serving" kehte hain.

Hamare paas `aggregateRating: 5.0 / 50` `LocalBusiness` pe hai → **hamesha ineligible**.

To wo log kaise dikha rahe hain?

| Site | Kaise |
|---|---|
| rocareindia.com | rating `Product` schema pe daala, `LocalBusiness` pe nahi — Product abhi bhi eligible hai |
| sulekha / serviceonwheel / IndiaMART | **directory hain** — wo *doosre* businesses ko rate karte hain, isliye allowed |

**Ye mat karna:** apna LocalBusiness rating `Product` schema pe shift karna Google ki policy tod hai → manual action → saare 133 pages ka structured data band. 1,88,992 reviews wala number bhi shaq ke daayre me hai.

**Jo kar sakte hain — aur behtar hai:**
- Product pages pe **asli** customer ratings (jo log RO khareedte hain) → wo legal stars, aur wo pan-India e-commerce me kaam aate hain
- Sulekha aur IndiaMART pe **hamari listing** — unke stars, hamara naam (free)
- Map Pack me hamare GBP ke 5.0 ★ (50) already dikhte hain — **wahi asli star surface hai local ke liye**

Screenshot #5 (IndiaMART) aur #6 (Sulekha) tujhe ek aur cheez bata rahe hain: **ye directories "ro service patna" pe rank karti hain.** Inpe hamari listing hogi to hum unke through bhi dikhenge, aur backlink bhi milega.

---

## 7. Jahan hum competitor se AAGE hain

| Metric | hum | #1 (rscp) | rosale | rocare |
|---|---|---|---|---|
| Schema types (`/`) | **22** | 10 | 11 | 13 |
| Schema types (head page) | **27** | — | **2** | 13 |
| Sitemap URLs | **133** | 66 | 88 | 26 |
| Homepage internal links | **129** | 79 | 218 | 128 |
| Homepage words | **4,645** | 2,285 | 3,341 | 2,483 |
| Speed (TTFB) | **0.11s** | — | — | — |
| `tel:` links homepage | **20** | 6 | 19 | 6 |
| WhatsApp mentions | **13** | 1 | 2 | 0 |

**rosale ka wo page jo hamse upar hai uske paas sirf 2 schema types hain. Hamare 27.**

On-page pe hum jeet rahe hain. Isliye asli gap on-page nahi hai.

---

## 8. Jahan hum PEECHE hain — sach

| Gap | hum | #1 | kitna bura |
|---|---|---|---|
| **Web mentions / backlinks** | **0** | ~50 | 🔴🔴🔴 sabse bada |
| Domain me keyword | 1 | 4 | 🔴🔴 |
| Images | 5 | 9 | 🔴 |
| GBP reviews | 50 | 564 (Nishant) | 🔴🔴 |
| Domain age | Sep 2025 | Jun 2026 | ✅ hum purane |

**#1 ranker ka domain hamse NAYA hai.** Jun 2026 ka. On-page pe hamse har metric me kamzor hai. Uske paas sirf do cheezein hain: naam me keyword, aur 50 mentions.

Pehli cheez badalne layak nahi. **Doosri cheez ₹0 me theek hoti hai, aur wo tere haath me hai — mere nahi.**

---

## 9. Kya BADLA is push me

```
[NAYI]  src/lib/seo/content-dates.ts                       3,778   asli lastmod dates
[NAYI]  scripts/verify-sitemap-lastmod.sh                  5,475   8 naye checks
[NAYI]  DEEP-SCAN-19SEP.md                                         ye file

[BADLI] src/app/sitemap.ts                                 6,639   lastmod ab sach
[BADLI] src/app/(shop)/service-patna/brand/[brand]/page.tsx 13,099  glue fix (21 pages)
[BADLI] src/app/(shop)/service-patna/page.tsx              27,825   H1 title se align
[BADLI] scripts/verify-h1-keyword.sh                        7,656   39 → 63 checks
[BADLI] scripts/verify-all.sh                               1,440   naya script register
```

**Kuch delete nahi hua. Purana content bilkul nahi chhua.** Images ko haath nahi lagaya.

---

## 10. Rollback

Agar kuch bhi galat lage:

**Vercel → Deployments → pichhla 🟢 Ready → ⋯ → Promote to Production** (30 second, git ki zarurat nahi)
