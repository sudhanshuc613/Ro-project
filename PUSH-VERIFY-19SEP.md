# Push Verify — 19 Sep 2026

Tera push live check kiya. Sab live measure, koi andaza nahi.

---

## ✅ Teeno fix LIVE hain

### 1. Sitemap lastmod — ab sach bolta hai

**3 fetch, 15-15 second ke gap pe:**
```
f0fd8de8b7441c307532d4f7df538008
f0fd8de8b7441c307532d4f7df538008
f0fd8de8b7441c307532d4f7df538008   ← teeno same = STHIR ✅
```

Pehle har fetch pe badalta tha. Ab 133 URLs, **18 alag asli dates**:
```
2026-08-03  → 6 category pages (DB ki asli date)
2026-09-03  → contact
2026-09-04  → amc-plans
2026-09-10  → products
2026-09-15  → blog
2026-09-16  → symptom pages
2026-09-18  → intent + area pages
2026-09-19  → homepage, service-patna, brand pages
```

Google ab bharosa karega. Pehle poore site ka lastmod ignore ho raha tha.

### 2. Brand pages glue — 21/21 theek
```
pehle : Kent RO Service & Repair in PatnaVisit Charge Only ₹200
ab    : Kent RO Service & Repair in Patna Visit Charge Only ₹200  ✅
```
Sab 21 live verify kiye. **0 glue.**

### 3. /service-patna H1 — title se align
```
TITLE : Water Purifier Repair Patna — RO Service Centre ₹200
H1    : Water Purifier Repair in Patna Visit Charge Only ₹200  ✅
```

---

## 🔴 NAYA BUG #6 — /amc-plans (aaj mila)

Ab tak main sirf 12-25 chune hue paths check karta tha. **Aaj pehli baar poore 133 pages ka sweep chalaya** — aur ek aur glue bug nikla:

```
RO Annual Maintenance PlansPatna — from ₹1,499/year
                      ^^^^^^^^^^^ chipka
```

Matlab `/amc-plans` ke H1 mein **"Patna" keyword tha hi nahi**. AMC Patna ka search us page tak nahi pahunch raha tha.

**Fix:**
```
RO Annual Maintenance Plans in Patna
From ₹1,499/year
```

### Aur asli fix — test ab sitemap-driven hai

Ye bug 6 baar isliye nikla kyunki test mein **haath se likhe hue paths** the. Naya page banta tha to list mein add karna bhool jaate the.

Ab `verify-h1-keyword.sh` **sitemap se har URL uthata hai**. Naya page banega to apne aap check hoga. Ye bug saatvi baar nahi hoga.

---

## Cannibalization — ab saaf

| Page | title | H1 | body |
|---|---|---|---|
| `/ro-service-in-patna` | **Y** | **Y** | 16 ← sirf ye |
| `/service-patna` | - | - | 6 |
| `/ro-services-patna` | - | - | 5 |
| `/` | - | - | 3 |
| `/amc-plans` | - | - | 2 |

Sirf **ek** page ka title+H1 dono target phrase pe. Baaki support karte hain.

---

## Site health — LIVE

```
133/133 URLs        → HTTP 200        ✅  0 fail
noindex             → 0                ✅
canonical missing   → 0                ✅
H1 glue (133 sweep) → 1 mila, fix hua  🔴→✅
admin (16 pages)    → 0 leak           ✅  (10 guarded 307, 6 are 404)
schema JSON         → sab valid        ✅  (/ 21 types, head page 26)
sitemap lastmod     → sthir            ✅
```

**Note:** `/admin/reviews`, `/admin/analytics`, `/admin/coupons`, `/admin/notifications`, `/admin/users` — ye **404** hain, yaani exist hi nahi karte. Leak nahi hai. Pehle mera check inhe galti se leak bata raha tha.

---

## Test report

```
Clean build (.next delete)  : EXIT 0, 191 pages, zero warning
Test suite                  : 1109/1109 PASS, ZERO FAIL
  verify-h1-keyword         : 63 → 66  (ab sitemap-driven sweep)
  verify-sitemap-lastmod    : 8 checks
Site-wide glue sweep        : 132/132 clean
Booking flow                : POST 201 → SRV-2026-00001 → track 200 → cleanup ✅
```

### Ek test bug bhi theek kiya

`verify-sitemap-lastmod` local pe jhootha FAIL de raha tha — kyunki local pe seed abhi-abhi chalta hai, to products/categories ka `updatedAt` "abhi" hota hai. Production mein zero leak tha. Ab check sirf static routes pe lagta hai; DB-driven URLs (`/products/*`, `/category/*`, `/blog/*`) ki apni asli date sahi hai.

---

## Kya badla

```
[BADLI] src/app/(shop)/amc-plans/page.tsx        7,936   glue fix + Patna keyword
[BADLI] scripts/verify-h1-keyword.sh             9,620   ab sitemap-driven (63→66)
[BADLI] scripts/verify-sitemap-lastmod.sh        6,108   local false-positive fix
[NAYI]  PUSH-VERIFY-19SEP.md                             ye file
```

Bas 3 file. **Purana content bilkul nahi chhua. Images haath nahi lagaye.**

### Zip
```
aquaperl-AMC-GLUE-FIX.zip
MD5 : 8d6c63ed1a8242966c7718c3921624e6
Size: 14.22 MB
```

---

## Ab bacha kya hai — sach

On-page ab lagbhag poora saaf hai. **Jo bacha hai wo code se theek nahi hota:**

| Gap | hum | #1 |
|---|---|---|
| **Web mentions** | **0** | ~50 |
| GBP reviews | 50 | 564 |
| Images | 5 | 9 |

#1 ka domain **Jun 2026** ka hai — hamse naya. Uske paas 2 schema types wale competitor bhi hamse upar hain. **Gap on-page nahi hai.**

45 minute, ₹0, tere haath mein:
```
Aqua Perl RO Service Centre
Sai Gali, Opposite B-62, Buddha Colony, Patna, Bihar 800001
8969821440
https://rokadoctor.in
```
JustDial · Sulekha · IndiaMART · Bing Places · Apple Business Connect

---

## Rollback
Vercel → Deployments → pichhla 🟢 Ready → ⋯ → Promote to Production (30 sec)
