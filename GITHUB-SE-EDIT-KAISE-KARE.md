# GitHub se Direct Edit — Live Site Auto-Update

**Haan bhai, bilkul ho sakta hai.** Laptop kholne ki zaroorat nahi.

```
GitHub pe edit → Commit → Vercel apne aap deploy → 2-3 min mein live ✅
```

---

## Basic tareeka (har file ke liye same)

1. **github.com/sudhanshuc613/Ro-project** kholo
2. File tak jao (folder pe click karte jao)
3. Upar right mein **✏️ pencil icon** dabao
4. Line badlo
5. Neeche scroll → **Commit changes** dabao
6. Bas — Vercel apne aap deploy kar dega

Deploy dekhne ke liye: vercel.com → `ro-project` → **Deployments**

---

# Sabse zaroori file — `src/lib/constants.ts`

Ye **ek file** poori website control karti hai. Phone number yahan badlo,
poori site pe badal jayega — homepage, footer, har area page, sab jagah.

**Path:** `src` → `lib` → `constants.ts`

## Line 17-18 — Phone numbers

```typescript
primaryPhone: '8969821440',
secondaryPhone: '9661288308',
```

⚠️ **Yahan badlne ke baad line 19-21 bhi badalni padegi:**

```typescript
primaryTel: 'tel:+918969821440',      // yahan bhi
secondaryTel: 'tel:+919661288308',    // yahan bhi
whatsapp: '918969821440',             // yahan bhi (91 ke saath)
```

## Line 34 — Timing

```typescript
hours: 'Mon–Sun 08:00–21:00',
```

## Line 38 — Visit charge

```typescript
visitCharge: 100,
```

> Ye badla to poori site pe ₹100 badal jayega. **Par** `PriceComparison.tsx`
> aur `ProblemSolver.tsx` mein alag se likha hai — wo bhi badalna padega.

## Line 41-42 — Response time aur warranty

```typescript
responseTime: '90 minutes',
warrantyDays: 30,
```

## Line 22-32 — Address

```typescript
address: {
  street: 'Kankarbagh Main Road',
  locality: 'Kankarbagh',
  city: 'Patna',
  state: 'Bihar',
  pincode: '800020',
}
```

⚠️ Address badlo to **Google Business Profile pe bhi wahi likhna** — NAP
consistency ranking factor hai.

---

# Service ke daam badalne hain

**Path:** `src` → `components` → `home` → `PriceComparison.tsx`

Line 14 se shuru hoti hai list:

```typescript
{ service: 'Technician visit & diagnosis', us: '₹100', them: '₹299 – ₹399', highlight: true },
{ service: 'Sediment / carbon filter change', us: '₹350 – ₹900', them: '₹500 – ₹1,200' },
{ service: 'RO membrane (75 GPD)', us: '₹1,200 – ₹1,800', them: '₹1,500 – ₹2,500' },
```

- `us:` = aapka rate
- `them:` = competitor ka rate
- `highlight: true` = green "LOWEST" badge

**Nayi service add karni ho?** Ek line copy karke neeche paste kar do, values badal do.

---

# Problem cards badalne hain

**Path:** `src` → `components` → `home` → `ProblemSolver.tsx`

Line 35 ke aas-paas:

```typescript
{
  id: 'no-water',
  emoji: '🚱',
  title: 'No water coming out',
  hindi: 'पानी नहीं आ रहा',
  symptoms: ['Machine runs but tank stays empty', 'Very slow drip from tap'],
  likelyCause: 'Choked RO membrane or a failed booster pump...',
  cost: '₹850 – ₹2,400',        // ← daam yahan
  fixTime: '30–45 min',
  diy: 'Check the inlet tap is fully open...',
},
```

Sirf `cost` badalna hai to us line ko edit kar do.

---

# Area ka content badalna hai

**Path:** `src` → `lib` → `seo` → `patna-service-data.ts`

Har area ka block aisa dikhta hai:

```typescript
{
  slug: 'kankarbagh',
  name: 'Kankarbagh',
  pincodes: ['800020', '800026'],
  responseMin: 45,                    // ← response time
  landmarks: ['Ashiana More', ...],   // ← landmarks
  tdsRange: '450–900 ppm',            // ← TDS
  waterProfile: '...',                // ← area ka description
  commonRepair: 'Membrane choking...',
  technicians: 2,
  monthlyJobs: 180,
},
```

## Naya area add karna hai?

Poora block copy karke neeche paste karo, `},` ke baad. Phir values badal do.

⚠️ `slug` unique hona chahiye aur usmein **space nahi**, dash use karo:
`rajendra-nagar` ✅ · `Rajendra Nagar` ❌

Naya area add karte hi uska page apne aap ban jayega:
`/service-patna/aapka-naya-area`

---

# Testimonials badalne hain

**Path:** `src` → `components` → `home` → `Testimonials.tsx`

```typescript
{
  stars: 5,
  body: 'Called at 11 AM, technician reached Kankarbagh by 12:30...',
  name: 'Rajesh Kumar',
  place: 'Kankarbagh, Patna',
  initials: 'RK',
},
```

> **Salaah:** yahan **asli customers** ke reviews daalo. Abhi jo hain wo
> sample hain. Asli naam + asli area zyada trust banata hai.

---

# Asli photos lagani hain

**Path:** `public` → `service`

Abhi 3 AI photos hain:
- `technician-working.jpg`
- `tds-testing.jpg`
- `membrane-old-new.jpg`

## Apni photo kaise lagayein

1. GitHub pe `public/service` folder kholo
2. **Add file** → **Upload files**
3. Apni photo ka naam **bilkul same** rakho (`technician-working.jpg`)
4. Purani replace ho jayegi, code badalne ki zaroorat nahi ✅

⚠️ Photo ka size 500 KB se kam rakhna, warna site slow hogi.

---

# ⚠️ Ek cheez GitHub se NAHI badal sakte

## Homepage ka SEO title/description

Wo **database mein** hai, code mein nahi. Uske liye Neon SQL Editor use karo:

```sql
UPDATE seo_metadata
SET meta_title = 'Naya title yahan',
    meta_description = 'Nayi description yahan'
WHERE path = '/';
```

Phir Vercel pe **Redeploy** karna padega.

> Ye design hi aisa hai — taaki aap SEO title bina code chhue badal sako.
> Baaki pages ka title code mein hai, wo GitHub se badal sakte ho.

---

# 🛑 Safety rules — ye 5 baatein yaad rakho

### 1. Quote hamesha band karo

```typescript
✅ visitCharge: 150,
✅ primaryPhone: '9876543210',
❌ primaryPhone: '9876543210,      ← quote missing = site TOOT jayegi
```

### 2. Comma mat bhoolna

```typescript
✅ { service: 'X', us: '₹100' },   ← last mein comma
❌ { service: 'X', us: '₹100' }    ← comma missing
```

### 3. Bracket mat hatao

`{`, `}`, `[`, `]` — inko haath mat lagao. Sirf quotes ke **andar** ka text badlo.

### 4. Ek baar mein ek change

10 files ek saath mat badlo. Ek badlo → deploy dekho → theek hai → agla badlo.

Kuch toota to pata chalega kis change se toota.

### 5. Build fail hone se live site nahi tootegi

Ye sabse achhi baat hai. Agar aapse galti ho gayi:
- Vercel build **fail** hoga
- **Purana version chalta rahega** ✅
- Aap galti sudhaar ke dobara push kar do

Live site kabhi blank nahi hogi.

---

# Galti ho jaye to wapas kaise laayein

## Tareeka 1: Vercel se instant rollback (30 second)

1. vercel.com → `ro-project` → **Deployments**
2. Purana working deployment dhundo (green ✅)
3. Uske aage **⋯** → **Promote to Production**
4. Turant purana version live ✅

## Tareeka 2: GitHub se undo

1. Repo → **Commits** pe click
2. Jo commit galat tha, uspe click
3. Upar right → **Revert**
4. Vercel apne aap purana version deploy kar dega

---

# Deploy status kaise dekhein

**vercel.com** → `ro-project` → **Deployments**

| Status | Matlab |
|---|---|
| 🟡 Building | Chal raha hai, 2-3 min ruko |
| ✅ Ready | Live ho gaya |
| ❌ Error | Fail — click karke **Build Logs** dekho |

Error aaye to log ka screenshot bhejna, main bata dunga kya galat hua.

---

# Cheat sheet — kya kahan hai

| Kya badalna hai | File |
|---|---|
| Phone number | `src/lib/constants.ts` (line 17-21) |
| Visit charge | `src/lib/constants.ts` (line 38) |
| Timing | `src/lib/constants.ts` (line 34) |
| Address | `src/lib/constants.ts` (line 22-32) |
| Service ke daam | `src/components/home/PriceComparison.tsx` |
| Problem cards | `src/components/home/ProblemSolver.tsx` |
| Area content | `src/lib/seo/patna-service-data.ts` |
| Naya area | `src/lib/seo/patna-service-data.ts` |
| Brand info | `src/lib/seo/patna-service-data.ts` (neeche) |
| Testimonials | `src/components/home/Testimonials.tsx` |
| AMC plans | `src/app/(shop)/amc-plans/page.tsx` |
| Photos | `public/service/` (upload karo) |
| Homepage SEO title | ⚠️ Neon SQL Editor |

---

# Pehla practice — abhi try karo

Chhoti si cheez badal ke dekho ki poora flow samajh aa jaye:

1. GitHub → `src/lib/constants.ts`
2. ✏️ pencil dabao
3. Line 41: `responseTime: '90 minutes'` → `'60 minutes'` kar do
4. **Commit changes**
5. Vercel → Deployments → 2-3 min ruko
6. Live site kholo → homepage pe "60 minutes" dikhega

Ho gaya? Ab aap khud manage kar sakte ho. 🎉
