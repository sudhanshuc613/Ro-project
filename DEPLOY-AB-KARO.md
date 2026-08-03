# AquaNexa — Ab Deploy Karo (Step by Step)

> Aapka plan sahi hai: zip replace karo → cmd se push karo.
> Bas 2 extra step hain jo miss ho sakte the. Neeche sab hai.

---

## ⚠️ Pehle ye jaan lo — 2 cheezein zip mein NAHI hain

| Cheez | Kyun nahi | Kya hoga |
|---|---|---|
| `.env` | Secrets zip mein nahi daalte | Aapki purani `.env` bachi rahegi ✅ |
| `node_modules` | 400 MB, bekaar | `npm install` ek baar chalana hoga |

Isliye **overwrite karo, delete mat karo.** Neeche wahi tareeka diya hai.

---

# STEP 1 — Zip replace karo (overwrite mode)

## 1.1 Pehle server band karo

Agar `npm run dev` chal raha hai to `Ctrl+C`. Ya seedha:

```cmd
taskkill /F /IM node.exe
```

> Ye zaroori hai — warna Windows "file in use" error dega.

## 1.2 `.env` ka backup lelo (30 second, safety)

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
copy .env ..\env-backup.txt
```

## 1.3 Naya zip extract karo — REPLACE mode

1. Naya `aquanexa-project.zip` download karo
2. Right-click → **Extract All**
3. Destination:
   ```
   C:\Users\SUDHA\Downloads\ro-Project\Ro-project
   ```
4. Windows poochhega **"Replace files?"** → **"Replace the files in the destination"**

Purani `.tsx` files replace ho jayengi. `.env` aur `node_modules` chhoot jayenge ✅

## 1.4 Verify karo

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
type .env | findstr DATABASE_URL
```

Neon wali string dikhni chahiye. Agar `localhost:5432` dikhe:
```cmd
copy ..\env-backup.txt .env
```

Nayi files aa gayin?
```cmd
dir src\components\home
```

Ye 6 dikhne chahiye: `ServiceHero.tsx`, `ProblemSolver.tsx`, `RealWork.tsx`, `PriceComparison.tsx`, `AreaCoverage.tsx`, `ShopStrip.tsx`

Nayi photos?
```cmd
dir public\service
```
3 jpg files dikhni chahiye.

---

# STEP 2 — Install + Build

```cmd
npm install
```

(Tez hoga, zyada tar packages already hain)

```cmd
npm run build
```

**Ye dikhna chahiye:**
```
✓ Compiled successfully
✓ Generating static pages (59/59)
```

> ❌ `EPERM` error aaye to: `taskkill /F /IM node.exe` phir `rmdir /s /q node_modules\.prisma` phir dobara build.

---

# STEP 3 — Database update (⚠️ ye naya step hai)

Homepage ka SEO title database mein save hai. Purana title abhi bhi wahan hai,
isliye ek baar seed dobara chalao:

```cmd
npx tsx prisma/seed.ts
```

Ye safe hai — upsert use karta hai, purana data delete nahi hoga.

**Ye dikhega:**
```
✓ 24 serviceable + 11 delivery-only pincodes
✓ 4 products with images, specs and SEO
✅ Seed complete.
```

> Ye step skip kiya to homepage pe purana title "RO Purifiers Online India"
> dikhta rahega, naya service-first title nahi aayega.

---

# STEP 4 — Local pe dekh lo (2 min)

```cmd
npm run dev
```

`http://localhost:3000` kholo aur ye check karo:

| Kya dekhna hai | Hona chahiye |
|---|---|
| Hero | "RO Service in Patna — Visit Charge Only ₹100" |
| Hero mein price anchor | "Others charge ₹299–₹399 · We charge ₹100" |
| Neeche scroll | 6 problem cards Hindi mein (पानी नहीं आ रहा) |
| Problem card pe click | Cost, cause, "free mein ye try karo" khulega |
| Aur neeche | 3 asli photos (technician, membrane, TDS meter) |
| Area section | **16 areas** with TDS levels |
| Sabse neeche | Shop strip (e-commerce) |

Sab theek? `Ctrl+C` karke aage badho.

---

# STEP 5 — GitHub pe push

```cmd
git add .
```

```cmd
git commit -m "Service-first homepage, 16 area pages, problem solver"
```

## 🛑 Push se pehle SAFETY CHECK

```cmd
git remote -v
```

**Ye dikhna chahiye:**
```
origin  https://github.com/sudhanshuc613/Ro-project.git (fetch)
origin  https://github.com/sudhanshuc613/Ro-project.git (push)
```

Purani website ka naam dikhe → 🛑 **RUKO**, mujhe batao.

## 🛑 `.env` leak check

```cmd
git status
```

`.env` is list mein **nahi** hona chahiye.

## Push karo

```cmd
git push
```

---

# STEP 6 — Vercel apne aap deploy karega

Push hote hi Vercel build shuru kar dega. 3-4 minute.

**Dekhne ke liye:** vercel.com → `ro-project` → Deployments tab

## 🛑 Deploy ke baad turant

Apni **purani PHP website** browser mein kholo — `rokadoctor.in`

Chal rahi hai? ✅ Chalni chahiye — humne DNS ko haath hi nahi lagaya.

---

# STEP 7 — Live site test karo

Apna Vercel URL kholo (`https://ro-project.vercel.app`):

```
/                                    → service-first homepage
/service-patna                       → pillar page, 16 areas
/service-patna/kadamkuan             → naya area page
/service-patna/phulwari-sharif       → naya area page
/service-patna/kumhrar               → naya area page
/service-patna/brand/kent            → brand page
```

Problem solver test karo — koi bhi card pe click karke dekho ki cost aur
WhatsApp button aa raha hai.

---

# Aage domain kab lagana hai

Abhi **mat lagana**. Pehle 3-4 din Vercel URL pe chala ke dekho.

Jab confidence aa jaye, tab **subdomain** se shuru karo:

```
rokadoctor.in        → purani PHP site (chalti rahegi)
new.rokadoctor.in    → nayi site (testing)
```

Vercel → Settings → Domains → `new.rokadoctor.in` add karo → jo CNAME mile
wo apne domain provider mein daal do.

> 🛑 Purane `A` record ko haath mat lagana — wahi PHP site ko zinda rakhe hue hai.

2-3 hafte baad, jab nayi site pe reviews aur traffic aane lage, tab main
domain switch karenge.

---

# Aage se update kaise karein

Ab har change ke liye bas:

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git add .
git commit -m "kya badla"
git remote -v          REM 🛑 hamesha check
git push
```

Vercel apne aap deploy kar dega.

---

# Troubleshooting

### ❌ `EPERM: operation not permitted`
```cmd
taskkill /F /IM node.exe
rmdir /s /q node_modules\.prisma
npm run build
```
Phir bhi aaye → OneDrive pause karo (taskbar → OneDrive icon → Settings → Pause syncing)

### ❌ Vercel build fail
Vercel → Deployments → failed build pe click → **Build Logs** dekho.
Error ka screenshot bhejo.

### ❌ Homepage pe purana title dikh raha hai
Step 3 (`npx tsx prisma/seed.ts`) skip ho gaya. Chala ke Vercel pe **Redeploy** karo.

### ❌ Nayi photos nahi dikh rahin
```cmd
dir public\service
```
3 jpg files honi chahiye. Nahi hain to zip dobara extract karo.

---

# Checklist

- [ ] `taskkill /F /IM node.exe`
- [ ] `.env` backup
- [ ] Zip extract (Replace mode)
- [ ] `.env` verify (Neon string)
- [ ] `dir src\components\home` → 6 files
- [ ] `dir public\service` → 3 jpg
- [ ] `npm install`
- [ ] `npm run build` → 59 pages
- [ ] `npx tsx prisma/seed.ts` ⚠️ mat bhoolna
- [ ] `npm run dev` → local pe dekho
- [ ] `git add .` + `commit`
- [ ] `git remote -v` 🛑
- [ ] `git status` → `.env` nahi
- [ ] `git push`
- [ ] Purani website check → chal rahi hai?
- [ ] Vercel URL test
