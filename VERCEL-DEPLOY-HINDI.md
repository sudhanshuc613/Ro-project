# AquaNexa — Vercel pe Deploy (Step by Step)

> **Aapki purani website ko kuch nahi hoga.** Har step pe safety check diya hai.
> Kahin bhi 🛑 dikhe — wahan ruk ke verify karo, phir aage badho.

---

## Pehle samjho: kyun safe hai

Aapka Vercel account ek hi hai, par usme projects **poori tarah alag** rehte hain:

```
Aapka Vercel Account
│
├── Project 1: purani-website    ← repo A · apne env vars · apna domain · apna DB
│
└── Project 2: aquanexa (naya)   ← repo B · apne env vars · apna domain · apna DB
```

| Cheez | Share hoti hai? |
|---|---|
| GitHub repo | ❌ Alag |
| Environment variables | ❌ Alag |
| Database | ❌ Alag |
| Domain | ❌ Alag |
| Build | ❌ Alag |
| Deployment history | ❌ Alag |

Naye project ka build **fail bhi ho jaye** to purani website chalti rahegi — ek second ka downtime nahi.

### Neon ke saath bhi wahi baat

Neon mein ek account ke andar **kai projects** ban sakte hain. Naya project banane se purane ka data, connection string, kuch nahi badalta.

```
Aapka Neon Account
├── Project: purani-website-db   ← chhuenge hi nahi
└── Project: aquanexa            ← naya banayenge
```

---

## ⚠️ 3 asli khatre — sirf yahi bigaad sakte hain

| # | Khatra | Bachaav |
|---|---|---|
| 1 | Galat repo mein push | Har push se pehle `git remote -v` |
| 2 | Purane project ki settings kholna | Vercel pe sirf **"Add New Project"** dabana |
| 3 | Purane Neon project mein tables banana | Neon pe naya project banana, purana mat kholna |

Bas itna dhyan rakha to 100% safe.

---

# PART A — GitHub pe code daalo

## Step A1 — Local pe build check karo (5 min)

Vercel pe bhejne se pehle laptop pe hi confirm kar lo ki build pass hoti hai.

```cmd
cd C:\Projects\aquanexa
npm run build
```

**Ye dikhna chahiye:**
```
✓ Compiled successfully
✓ Generating static pages (27/27)
```

❌ Agar error aaye → Vercel pe bhi wahi error aayega. Pehle yahan fix karo, screenshot bhejo.

## Step A2 — GitHub pe naya repo banao (2 min)

github.com → upar right mein **+** → **New repository**

| Field | Kya bharo |
|---|---|
| Repository name | `aquanexa` |
| Visibility | **Private** ✅ (business code hai) |
| Add a README | ❌ **tick mat karo** |
| .gitignore | ❌ **None** |
| License | ❌ **None** |

**Create repository** dabao. Jo URL mile use copy karlo.

> 🛑 **Check:** Repo ka naam `aquanexa` hai na? Purani website ka naam to nahi?

## Step A3 — Git setup (3 min)

```cmd
cd C:\Projects\aquanexa
git init
git add .
git commit -m "AquaNexa initial commit"
git branch -M main
```

Ab remote jodo (apna username daalo):

```cmd
git remote add origin https://github.com/AAPKA-USERNAME/aquanexa.git
```

### 🛑 SAFETY CHECK — ye sabse zaroori step hai

```cmd
git remote -v
```

**Output aisa hona chahiye:**
```
origin  https://github.com/AAPKA-USERNAME/aquanexa.git (fetch)
origin  https://github.com/AAPKA-USERNAME/aquanexa.git (push)
```

| Kya dikha | Kya karo |
|---|---|
| `aquanexa` | ✅ Aage badho |
| Purani website ka naam | 🛑 **RUKO** — `git remote remove origin` phir dobara sahi URL daalo |

### .env leak check

```cmd
git status
```

Is list mein **`.env` nahi hona chahiye** (`.env.example` theek hai).
Agar `.env` dikhe → 🛑 ruko, `.gitignore` check karo.

## Step A4 — Push karo (2 min)

```cmd
git push -u origin main
```

GitHub login maangega — browser khulega, authorize kar do.

Ab github.com pe apna repo kholo, files dikhni chahiye.

---

# PART B — Neon database banao

## Step B1 — Naya Neon project (3 min)

console.neon.tech pe jao.

> 🛑 Purana project **mat kholo**. Seedha **"New Project"** dabao.

| Field | Kya bharo |
|---|---|
| Project name | `aquanexa` |
| Postgres version | 16 |
| Region | **Asia Pacific (Singapore)** |

**Create** dabao.

## Step B2 — Connection string copy karo

Project banne ke baad **Connection Details** dikhega:

```
postgresql://neondb_owner:AbCd1234xyz@ep-cool-name-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Poora copy karlo. Notepad mein paste kar ke rakh lo — abhi chahiye hoga.

> 🛑 **Check:** Neon dashboard mein ab **2 projects** dikhne chahiye — purana + `aquanexa`. Purane ko haath nahi lagaya.

---

# PART C — Vercel pe deploy

## Step C1 — Naya project import karo (3 min)

vercel.com/dashboard kholo.

> 🛑 **Purane project pe click MAT karo.** Uski settings mein jaana hi nahi hai.

Upar right mein **"Add New..."** → **"Project"**

Repo list mein `aquanexa` dhundo → **Import** dabao.

Agar repo nahi dikh raha → **"Adjust GitHub App Permissions"** → `aquanexa` repo ko access do.

## Step C2 — Settings (auto ho jayengi)

| Field | Value |
|---|---|
| Framework Preset | Next.js (auto) |
| Root Directory | `./` (default) |
| Build Command | default rehne do |
| Output Directory | default rehne do |

Kuch badalna nahi hai.

## Step C3 — Environment Variables (5 min)

**"Environment Variables"** section kholo. Ye 5 add karo:

### 1. DATABASE_URL
```
postgresql://neondb_owner:AbCd@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### 2. DIRECT_URL
```
(wahi string dobara)
```

### 3. NEXTAUTH_SECRET

Random 32+ character string chahiye. CMD mein bana lo:
```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Jo output aaye wo paste karo.

### 4. NEXTAUTH_URL
```
https://aquanexa.vercel.app
```
(domain lagane ke baad `https://rokadoctor.in` kar denge)

### 5. NEXT_PUBLIC_SITE_URL
```
https://aquanexa.vercel.app
```

> 💡 Razorpay/WhatsApp waale abhi **mat daalo**. Baad mein jab chahiye honge tab add kar lenge.

## Step C4 — Deploy! (3 min)

**Deploy** dabao. 2-4 minute lagenge.

**Success:** 🎉 confetti + "Congratulations" screen
**Fail:** neeche troubleshooting dekho

> 🛑 **Ab check karo:** Apni purani website kholo browser mein. Chal rahi hai? ✅ Chalni chahiye — uska koi rebuild hua hi nahi.

## Step C5 — Database setup (5 min)

Website deploy ho gayi par database **khaali** hai. Ab bharte hain — **laptop se**.

Local `.env` mein Neon wala string daalo:

```cmd
cd C:\Projects\aquanexa
notepad .env
```

`DATABASE_URL` aur `DIRECT_URL` dono mein Neon wala string paste karo. Save.

Phir:

```cmd
npx prisma db push
npx tsx prisma/seed.ts
```

**Ye dikhna chahiye:**
```
✓ 24 serviceable + 11 delivery-only pincodes
✓ 5 brands
✓ 4 products with images, specs and SEO
✓ 3 technicians
✅ Seed complete.
```

### ⚠️ Search extensions — ye step MAT bhoolna

Prisma `tsvector` aur `pg_trgm` nahi bana sakta. Ye Neon dashboard se karna padega:

1. Neon → `aquanexa` project → **SQL Editor**
2. Laptop pe file kholo: `prisma\migrations\00_search_extensions\migration.sql`
3. Poora content copy karo
4. Neon ke SQL Editor mein paste karo → **Run**

**Skip kiya to:** search box mein kuch bhi type karo → **0 results** aayenge.

Verify karne ke liye SQL Editor mein ye chalao:
```sql
SELECT count(*) FROM products WHERE search_vector IS NOT NULL;
```
Answer `4` aana chahiye.

## Step C6 — Live site test karo (3 min)

Apna Vercel URL kholo (`https://aquanexa.vercel.app`):

| Test | Expected |
|---|---|
| Homepage | 2 banner slides chalte hue |
| `/service-patna` | Pillar page + 6 area cards |
| `/service-patna/kankarbagh` | Kankarbagh page |
| `/service-patna/brand/kent` | Kent pricing table |
| Search box mein `purifier` | Suggestions aayein |
| Booking form pincode `800020` | 🟢 "We service Patna — ₹100" |
| Booking form pincode `400001` | 🟠 warning |
| `/admin/login` | 8969821440 / ChangeMe@123 |

---

# PART D — Domain lagao

## Step D1 — Vercel mein domain add karo

`aquanexa` project → **Settings** → **Domains**

`rokadoctor.in` type karo → **Add**

Vercel DNS records dega:

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

## Step D2 — Domain provider mein daalo

Jahan se domain khareeda (GoDaddy/Hostinger/BigRock) → DNS settings → upar wale records add karo.

15 min – 2 ghante lagenge propagate hone mein.

## Step D3 — Env vars update karo

Domain chalne ke baad Vercel → Settings → Environment Variables:

- `NEXTAUTH_URL` → `https://rokadoctor.in`
- `NEXT_PUBLIC_SITE_URL` → `https://rokadoctor.in`

Phir **Deployments** → latest → **⋯** → **Redeploy**

---

# PART E — Aage se update kaise karein

Ab har change ke liye bas:

```cmd
cd C:\Projects\aquanexa

REM 🛑 hamesha pehle ye
git remote -v

git add .
git commit -m "kya badla"
git push
```

Vercel apne aap deploy kar dega. Purani website ko farak nahi padta.

---

# Troubleshooting

### ❌ Build fail: "Can't reach database server"
Env vars mein `DATABASE_URL` sahi hai? Poora string, `?sslmode=require` samet.
Vercel → Settings → Environment Variables mein check karo.

### ❌ Build fail: "Hobby accounts are limited to daily Cron Jobs"
`vercel.json` mein cron schedule daily se zyada frequent hai.
Maine already fix kar diya hai (1 cron, daily). Agar phir bhi aaye to `vercel.json` se `crons` block hata do.

### ❌ Site khulti hai par products nahi dikhte
Seed nahi chala. Step C5 dobara karo.

### ❌ Search mein 0 results
Search extensions migration skip hua. Step C5 ka warning wala part dekho.

### ❌ 500 error live pe
Vercel → project → **Logs** tab kholo. Wahan asli error dikhega. Screenshot bhejo.

### ❌ Repo Vercel pe dikh nahi raha
Import screen pe **"Adjust GitHub App Permissions"** → `aquanexa` ko access do.

---

# ⚠️ 2 baatein jo pehle jaan lo

## 1. Cron ab sirf 1 hai

Vercel free plan: **max 2 crons, wo bhi din mein ek baar**.

Maine `vercel.json` mein sirf abandoned-cart rakha hai (roz subah 10:30 IST).
Baaki 2 crons (`rollup-metrics`, `amc-reminders`) ke **route files abhi bane hi nahi** —
isliye hata diye, warna roz 404 error aata.

Agar abandoned-cart har 15 min chahiye (jo behtar hai), to **cron-job.org** free
service use karo — wo bahar se aapke URL ko hit karegi.

## 2. Vercel Hobby commercial ke liye nahi hai

Ye seedha bata deta hoon: AquaNexa mein payment gateway hai = commercial project.
Vercel ki fair-use policy Hobby (free) plan ko **sirf personal/non-commercial** ke liye allow karti hai.

| Kab | Kya karo |
|---|---|
| Abhi (testing, SEO indexing) | Free chalega |
| Razorpay live karne se pehle | Pro (~₹1,700/mo) ya VPS (~₹700/mo) |

Aapki purani website bhi agar commercial hai aur chal rahi hai — to shayad abhi tak
flag nahi hui. Par risk hai, jaan lena chahiye.

---

# Final safety checklist

Deploy ke baad ye confirm karo:

- [ ] Purani website abhi bhi live hai
- [ ] Purani website ka Vercel project chhua nahi
- [ ] Purane Neon project mein koi change nahi
- [ ] Vercel pe 2 projects dikh rahe hain (purana + aquanexa)
- [ ] Neon pe 2 projects dikh rahe hain
- [ ] GitHub pe 2 repos dikh rahe hain
- [ ] `git remote -v` mein `aquanexa` hi dikhta hai
