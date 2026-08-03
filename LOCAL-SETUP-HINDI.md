# AquaNexa — Laptop pe Local Setup (Step by Step)

> **Is guide mein Vercel ko bilkul haath nahi lagayenge.**
> Sirf aapke laptop pe chalayenge. Aapki purani website ko **zero risk**.

Total time: ~20 minute (internet speed pe depend karta hai)

---

## Step 0 — Pehle ye check karo (2 min)

Windows mein **Command Prompt** kholo (Start → `cmd` type karo → Enter).

```cmd
node -v
```

**Kya dikhna chahiye:** `v20.x.x` ya usse upar (jaise `v20.11.0`, `v22.3.0`)

| Aapko kya dikha | Kya karna hai |
|---|---|
| `v20` ya upar | ✅ Aage badho |
| `v18` ya neeche | ⚠️ nodejs.org se **LTS** version install karo |
| `'node' is not recognized` | ❌ Node install hi nahi hai — nodejs.org se LTS lo |

Phir ye bhi check karo:

```cmd
git --version
npm -v
```

Dono ka version number aana chahiye.

---

## Step 1 — Zip download aur extract (3 min)

1. Main jo `aquanexa-project.zip` diya hai, wo download karo
2. Extract karo yahan: **`C:\Projects\aquanexa`**

> ⚠️ **Bahut zaroori:** Ye folder apni **purani website ke folder ke andar mat rakhna.**
>
> ```
> ✅ Sahi:
> C:\Projects\purani-website\
> C:\Projects\aquanexa\           ← bagal mein, alag
>
> ❌ Galat:
> C:\Projects\purani-website\aquanexa\    ← andar mat rakho
> ```

Extract ke baad check karo ki folder mein `package.json` file dikh rahi hai. Agar
`aquanexa\aquanexa\package.json` aisa double folder ban gaya hai, to andar wala
folder bahar nikaal lo.

---

## Step 2 — Folder mein jao aur verify karo (1 min)

```cmd
cd C:\Projects\aquanexa
dir
```

**Ye files dikhni chahiye:**
```
package.json
prisma
src
db
docs
mockup
.env.example
SETUP.md
```

> 🛡️ **Safety check:** Ye command chalao —
> ```cmd
> git remote -v
> ```
> **Kuch bhi output nahi aana chahiye** (ya "not a git repository" error).
> Agar aapki purani website ka naam dikhe → ❌ RUKO, aap galat folder mein ho.

---

## Step 3 — Packages install karo (5-10 min)

```cmd
npm install
```

Ye ~400 MB download karega, thoda time lagega. Chai pee lo. ☕

**Normal hai:**
- `npm warn deprecated ...` — ignore karo
- `X packages are looking for funding` — ignore karo
- `found 0 vulnerabilities` ya kuch low vulnerabilities — theek hai

**Problem hai agar:** `npm error` red mein aaye. To mujhe screenshot bhejo.

---

## Step 4 — Free Database banao (5 min)

Database aapke laptop pe install nahi karna — online free le lete hain.

1. **neon.tech** kholo → **Sign up** (GitHub se login kar sakte ho)
2. **Create a project** dabao
3. Bharo:
   - Project name: `aquanexa`
   - Postgres version: **16** (default)
   - Region: **Asia Pacific (Singapore)** ← India ke sabse paas
4. **Create** dabao
5. Screen pe **Connection String** dikhega, aisa:

```
postgresql://neondb_owner:AbCd1234@ep-cool-name-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

6. Ise **copy** karlo (copy icon dabao)

> 💡 Ye bilkul alag database hai. Aapki purani website ke database se koi lena-dena nahi.

---

## Step 5 — .env file banao (3 min)

```cmd
copy .env.example .env
notepad .env
```

Notepad khulega. Ab **sirf ye 5 lines** dhundh ke badlo:

### 1. DATABASE_URL
```
DATABASE_URL=postgresql://neondb_owner:AbCd1234@ep-cool-name-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```
↑ Neon wala string yahan paste karo

### 2. DIRECT_URL
```
DIRECT_URL=postgresql://neondb_owner:AbCd1234@ep-cool-name-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```
↑ **Wahi string dobara** paste karo

### 3. NEXTAUTH_SECRET
```
NEXTAUTH_SECRET=koi_bhi_lamba_random_text_kam_se_kam_32_character_ka_hona_chahiye
```
↑ Kuch bhi random likh do, bas lamba ho (32+ characters)

### 4. NEXTAUTH_URL
```
NEXTAUTH_URL=http://localhost:3000
```
↑ Local ke liye yahi rakho

### 5. NEXT_PUBLIC_SITE_URL
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Baaki sab lines ko haath mat lagao** — Razorpay, WhatsApp wale abhi
`xxxxx` hi rahne do. Wo baad mein chahiye honge.

**Ctrl+S** dabao, notepad band karo.

---

## Step 6 — Database setup (2 min)

```cmd
npm run db:setup
```

Ye 3 kaam karega:
1. 33 tables banayega
2. Search extensions lagayega (⚠️ ye step zaroori hai)
3. Sample data daalega

**Success pe ye dikhega:**
```
🌱 Seeding AquaNexa…
  ✓ admin user (login: 8969821440 / ChangeMe@123)
  ✓ 24 serviceable + 11 delivery-only pincodes
  ✓ 5 brands
  ✓ 6 categories
  ✓ 4 products with images, specs and SEO
  ✓ 3 technicians
  ✓ coupons
  ✓ 2 static page SEO records

✅ Seed complete.
```

### ⚠️ Agar `db:search` pe error aaye

Windows mein `psql` command shayad na ho. To ye alag se chalao:

```cmd
npx prisma db push
npx tsx prisma/seed.ts
```

Phir search wali SQL Neon ke dashboard se chalao:
1. Neon dashboard → **SQL Editor** kholo
2. File `prisma\migrations\00_search_extensions\migration.sql` notepad mein kholo
3. Poora content copy karke Neon ke SQL Editor mein paste karo
4. **Run** dabao

> Ye step skip kiya to search box mein kuch bhi type karne pe **0 results** aayenge.

---

## Step 7 — Website chalao! (1 min)

```cmd
npm run dev
```

**Ye dikhega:**
```
▲ Next.js 14.2.5
- Local:  http://localhost:3000

✓ Ready in 2.3s
```

Ab browser mein kholo: **http://localhost:3000**

🎉 Aapki website chal rahi hai!

---

## Step 8 — Sab kuch test karo

Ye pages kholke dekho:

| URL | Kya dikhna chahiye |
|---|---|
| `localhost:3000` | Homepage, 2 banner slide hote hue |
| `localhost:3000/service-patna` | Patna service pillar page |
| `localhost:3000/service-patna/kankarbagh` | Kankarbagh ka page |
| `localhost:3000/service-patna/brand/kent` | Kent repair pricing table |
| `localhost:3000/admin/login` | Admin login |

### Booking form test karo
1. Homepage pe neeche scroll karo → "Book a Technician" form
2. Pincode mein `800020` daalo → **green message** aana chahiye:
   `✓ We service Patna — visit charge ₹100`
3. Ab `400001` (Mumbai) daalo → **orange warning** aana chahiye
4. Poora form bharke submit karo → ticket number milega `SRV-2026-00001`

### Admin panel test karo
1. `localhost:3000/admin/login`
2. Phone: `8969821440`
3. Password: `ChangeMe@123`
4. Dashboard khulega — charts, KPIs, service queue

### Search test karo
Navbar ke search box mein `purifier` type karo → suggestions aane chahiye.
`purifer` (galat spelling) bhi try karo → phir bhi result aana chahiye.

---

## Band kaise karein

Command Prompt mein **Ctrl + C** dabao. Phir `Y` → Enter.

Dobara chalane ke liye:
```cmd
cd C:\Projects\aquanexa
npm run dev
```

(`npm install` aur `db:setup` dobara nahi karna — sirf ek baar)

---

## Common problems

### ❌ `Port 3000 is already in use`
Koi aur cheez pehle se 3000 pe chal rahi hai (shayad purani website?).
```cmd
npm run dev -- -p 3001
```
Phir `localhost:3001` kholo.

### ❌ `Can't reach database server`
- `.env` mein DATABASE_URL sahi paste hua? Poora string, `?sslmode=require` samet
- Neon dashboard pe project "Active" hai? (idle ho jata hai, kholne pe jaag jata hai)

### ❌ `Module not found`
```cmd
rmdir /s /q node_modules
npm install
```

### ❌ Page pe images nahi dikh rahin
Normal hai agar `public\products\` folder khaali hai. Zip mein images hain,
check karo ki extract sahi hua.

### ❌ Search mein 0 results
Step 6 ka **search extensions** wala part skip ho gaya. Upar wala fix dekho.

---

## 🛡️ Purani website ki safety — final check

Ye sab karne ke baad bhi aapki purani website ko **kuch nahi hua**:

| Cheez | Status |
|---|---|
| Purani website ka folder | ✅ Chhua hi nahi |
| Purani website ka GitHub repo | ✅ Chhua hi nahi |
| Purani website ka Vercel project | ✅ Chhua hi nahi |
| Purani website ka database | ✅ Chhua hi nahi |
| Purani website live hai? | ✅ Bilkul, chal rahi hai |

Kyunki humne ab tak **sirf ek naya folder** banaya aur **ek naya online database**.
Purani cheezon ko touch hi nahi kiya.

---

## Aage kya?

Jab localhost pe sab theek chal jaye, tab batao. Phir:
1. GitHub pe naya repo banayenge (purane se alag)
2. Vercel pe naya project banayenge (purana project chhuenge hi nahi)
3. Domain `rokadoctor.in` connect karenge

Har step pe safety check batata rahunga.
