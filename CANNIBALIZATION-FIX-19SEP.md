# 🔴 Asli problem mil gayi — keyword cannibalization
### 19 Sep 2026

---

## Tera shak sahi tha, par wajah alag thi

Tu ne kaha *"mera dedicated page hai hi nahi"*.

**Page hai** — `rokadoctor.in/ro-service-in-patna`, 200 OK, live.

**Par asli problem ye mili, jo isse bhi buri hai:**

```
HAMARE CHAR PAGE EK HI KEYWORD PE LAD RAHE THE

  /                     "RO Service in Patna — Water Purifier Repair ₹200"
  /service-patna        "RO Service in Patna — Water Purifier Repair ₹200 | Aqua Perl"
  /ro-service-in-patna  "RO Service in Patna — ₹200 Visit, All Brands"
  /ro-services-patna    "RO Services in Patna — All Jobs, Rates From ₹200"
```

Homepage aur `/service-patna` ka title **bilkul same** tha. Aksar-aksar same.

### Iska matlab kya hota hai

Jab ek domain ke kai URL ek hi query chase karte hain, Google ko **choose
karna padta hai** ki kaunsa canonical hai us query ke liye. Wo aksar homepage
chunta hai (kyunki sab links wahan aate hain) aur baaki ko **demote** kar deta hai.

Aur ranking signal **baant jaata hai** — char page me se koi bhi utna strong
nahi ban pata jitna ek page ban sakta tha.

**Ye wahi hai jo tu dekh raha tha: "mera page dikhta hi nahi."**

---

## Competitor ye kaise handle karte hain

Maine `rosaleandservices.com` check kiya — jo hamse upar hai:

```
/                      "RO Service Near Me | RO Water Purifier Repair & Service"
/ro-service-in-patna   "Best RO Service in Patna starts @ ₹299/-"
```

**Do alag query. Koi internal ladai nahi.** Homepage "near me" pe, city page
"in patna" pe.

Hum dono ko "in patna" pe rakhe hue the.

---

## ✅ FIX — teen page, teen alag query

| URL | Pehle | **Ab** | Kyun |
|---|---|---|---|
| `/` | RO Service in Patna — Water Purifier Repair ₹200 | **RO Service Near Me in Patna — ₹200 Visit, 90 Min** | "ro service near me" ke 10 autocomplete variants hain, hum kisi pe rank nahi karte the |
| `/service-patna` | RO Service in Patna — Water Purifier Repair ₹200 | **Water Purifier Repair Patna — RO Service Centre** | rocareindia isko 15 baar use karta hai, hum 2 baar |
| `/ro-service-in-patna` | RO Service in Patna — ₹200 Visit | **RO Service in Patna — ₹200 Visit, All Brands · 8969821440** | badla nahi — ab ye akela city phrase ka malik hai |

Homepage ka H1 bhi badla: `RO Service & Repair in Patna` → **`RO Service Near Me in Patna`**

---

## 🔴 Ek aur glue bug mila — `/service-patna`

```
Pehle : "Expert RO Service in PatnaVisit Charge Only ₹200"
                                  ^^^^^^^^^^^ chipka hua
Ab    : "Expert RO Service in Patna Visit Charge Only ₹200"
```

Ye **chautha page** tha jahan ye bug mila (homepage, 73 area pages, aur ab ye).
`scripts/verify-h1-keyword.sh` me `/service-patna` add kar diya — ab pakda jayega.

---

## ⚠️ Ek cheez jo zip se automatic NAHI hogi

Site ka title **do jagah se** aata hai:
1. Code ka `fallback` (zip me hai)
2. **Database ki `seo_metadata` table** — ye code ko override karti hai

Tera production DB me abhi purane title baithe hain. Zip push karne se wo
**nahi badlenge**.

### Isliye push ke baad ye 2 minute ka kaam karna hai

**Option A — Admin panel se (aasan)**
```
rokadoctor.in/admin/seo  → login
  path "/" wali row → Meta Title badlo:
     RO Service Near Me in Patna — ₹200 Visit, 90 Min
  Meta Description:
     RO service near me in Patna — technician at your door in 90 minutes,
     ₹200 visit charge, all brands, 30-day warranty. Call 8969821440.
  Save

  path "/service-patna" wali row → Meta Title:
     Water Purifier Repair Patna — RO Service Centre
  Meta Description:
     Water purifier repair in Patna by a local RO service centre. ₹200 visit,
     same-day, genuine parts, 30-day warranty on the work. Call 8969821440.
  Save
```

**Option B — Neon SQL editor se**
```sql
UPDATE seo_metadata
SET meta_title = 'RO Service Near Me in Patna — ₹200 Visit, 90 Min',
    meta_description = 'RO service near me in Patna — technician at your door in 90 minutes, ₹200 visit charge, all brands, 30-day warranty. Call 8969821440.'
WHERE path = '/';

UPDATE seo_metadata
SET meta_title = 'Water Purifier Repair Patna — RO Service Centre',
    meta_description = 'Water purifier repair in Patna by a local RO service centre. ₹200 visit, same-day, genuine parts, 30-day warranty on the work. Call 8969821440.'
WHERE path = '/service-patna';
```

**Ye na kiya to homepage ka title purana hi rahega aur cannibalization bani rahegi.**

---

## Test report

```
Build          : EXIT 0 · 191 pages · ZERO warnings
Test suite     : 1074 / 1074 PASS · 0 FAIL
Pages checked  : 20/20 OK — kuch nahi toota
H1 glue        : 5 pages check kiye, sab clean
Zip == dir     : 0 differences
```

Do purane test update karne pade (dono ka poora comment code me hai):
- `verify-titles-and-schema.sh` — homepage ab "Near Me" maangta hai, city phrase **nahi**
- `verify-h1-keyword.sh` — `/service-patna` add hua, homepage H1 badla

---

## Files badli — 6

```
[BADLI] src/app/(shop)/page.tsx                    homepage title
[BADLI] src/app/(shop)/service-patna/page.tsx      title + glue fix
[BADLI] src/components/home/ServiceHero.tsx        homepage H1
[BADLI] prisma/seed.ts                             naye defaults
[BADLI] scripts/verify-titles-and-schema.sh        test update
[BADLI] scripts/verify-h1-keyword.sh               test update
```

---

## Ab expect kya karna

Ye fix **turant rank nahi dega**. Google ko dobara crawl karke samajhna padega
ki ab kaunsa page kis query ka malik hai. **2-4 hafte** lagenge.

Par ab jab wo samajh lega, to `/ro-service-in-patna` ko poora signal milega —
pehle wo homepage ke saath baant raha tha.

**Push ke baad GSC me ye 3 URL Request Indexing zaroor karna:**
```
https://rokadoctor.in/
https://rokadoctor.in/service-patna
https://rokadoctor.in/ro-service-in-patna
```

---

## Aur wahi do kaam jo abhi bhi bache hain

```
#1 wale (roservicecentrepatna.in) ke  : 50 web mentions
hamare                                :  0
Uska domain June 2026 ka — 3 MAHINE purana. Hamara 12 mahine.
```

**Wo sirf mentions se jeet raha hai.** JustDial · Sulekha · IndiaMART ·
Bing Places · Apple Maps — 45 minute, ₹0, har jagah same NAP:
```
Aqua Perl RO Service Centre
Sai Gali, Opposite B-62, Buddha Colony, Patna, Bihar 800001
8969821440
https://rokadoctor.in
```

Aur **15-20 asli photo** — hamare 5, unke 37.
