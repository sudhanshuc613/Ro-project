# Deploy — Sirf Vercel (Localhost Skip)

Total time: **~10 minute**

---

## STEP 1 — Zip replace karo (3 min)

### 1.1 Node band karo (agar chal raha ho)

```cmd
taskkill /F /IM node.exe
```

### 1.2 `.env` backup

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
copy .env ..\env-backup.txt
```

> `.env` git pe jaati nahi hai, par local pe rehni chahiye. Backup safety ke liye.

### 1.3 Extract — REPLACE mode

1. Naya `aquanexa-project.zip` download karo
2. Right-click → **Extract All**
3. Destination:
   ```
   C:\Users\SUDHA\Downloads\ro-Project\Ro-project
   ```
4. **"Replace the files in the destination"** chuno

### 1.4 Verify (10 second)

```cmd
dir src\components\home
```
6 nayi files dikhni chahiye: `ServiceHero.tsx`, `ProblemSolver.tsx`, `RealWork.tsx`,
`PriceComparison.tsx`, `AreaCoverage.tsx`, `ShopStrip.tsx`

```cmd
dir public\service
```
3 jpg files: `technician-working.jpg`, `tds-testing.jpg`, `membrane-old-new.jpg`

---

## STEP 2 — Push karo (2 min)

```cmd
git add .
```

```cmd
git commit -m "Service-first homepage, 16 area pages, problem solver"
```

### 🛑 Safety check

```cmd
git remote -v
```

Dikhna chahiye:
```
origin  https://github.com/sudhanshuc613/Ro-project.git (fetch)
origin  https://github.com/sudhanshuc613/Ro-project.git (push)
```

### 🛑 `.env` leak check

```cmd
git status
```

`.env` list mein **nahi** hona chahiye.

### Push

```cmd
git push
```

---

## STEP 3 — Vercel apne aap build karega (4 min)

vercel.com → `ro-project` → **Deployments** tab

Status **Building** → **Ready** hona chahiye.

### ❌ Agar build FAIL ho jaye

Failed deployment pe click → **Build Logs** → error ka screenshot bhejo.

> Ghabrao mat — build fail hone se **live site nahi tootegi**. Vercel purana
> working version chalata rahega jab tak naya build pass na ho.

---

## STEP 4 — Database ka 1 line update (1 min) ⚠️

Homepage ka SEO title database mein save hai. Purana title abhi bhi wahan hai.

**Ye Neon website se karna hai — laptop ki zaroorat nahi.**

1. console.neon.tech kholo
2. `aquanexa` project → **SQL Editor**
3. Jo likha hai wo saaf karo (`Ctrl+A` → `Delete`)
4. Ye paste karo:

```sql
UPDATE seo_metadata
SET meta_title = 'RO Service in Patna — ₹200 Visit | Same-Day Repair',
    meta_description = 'Expert RO repair & installation across Patna at ₹200 visit charge — others charge ₹299+. All brands, 90-min response, 30-day warranty. Call 8969821440.'
WHERE path = '/';
```

5. **Run** dabao → `UPDATE 1` aana chahiye

### Verify

```sql
SELECT meta_title FROM seo_metadata WHERE path = '/';
```

`RO Service in Patna — ₹200 Visit | Same-Day Repair` dikhna chahiye ✅

### Phir Vercel pe redeploy

Vercel → Deployments → latest → **⋯** menu → **Redeploy**

> Ye zaroori hai kyunki homepage cached hai. Redeploy ke bina purana title dikhta rahega.

---

## STEP 5 — Live test (2 min)

Apna Vercel URL kholo:

| Kya check karo | Hona chahiye |
|---|---|
| Hero heading | "RO Service in Patna — Visit Charge Only ₹200" |
| Price anchor | "Others charge ₹299–₹399 · We charge ₹200" |
| Scroll neeche | 6 problem cards Hindi mein (पानी नहीं आ रहा) |
| Card pe click | Cost + cause + "free mein ye try karo" |
| Aur neeche | 3 asli photos |
| Area section | **16 areas** with TDS levels |
| Sabse neeche | Shop strip |

Ye URLs bhi kholke dekho:
```
/service-patna/kadamkuan
/service-patna/phulwari-sharif
/service-patna/kumhrar
/service-patna/digha
```

### 🛑 Aur ye zaroor

**rokadoctor.in** kholo — purani PHP site chal rahi hai? ✅
Chalni chahiye, humne DNS ko haath hi nahi lagaya.

---

## Aage se update kaise (localhost ke bina)

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git add .
git commit -m "kya badla"
git remote -v          REM 🛑 hamesha check
git push
```

Bas. Vercel apne aap deploy kar dega.

---

## ⚠️ Ek nuksan jo aapko pata hona chahiye

Localhost skip karne se **build error pehle nahi pata chalega** — Vercel pe
jaake pata chalega. 4 minute waste honge har baar.

Maine ye code pehle hi test kar liya hai (59 pages, 0 errors), isliye is baar
problem nahi aani chahiye. Par future mein bade change karo to ek baar
`npm run build` local pe chala lena behtar hai.

---

## Checklist

- [ ] `taskkill /F /IM node.exe`
- [ ] `.env` backup
- [ ] Zip extract — **Replace** mode
- [ ] `dir src\components\home` → 6 files
- [ ] `dir public\service` → 3 jpg
- [ ] `git add .` + `commit`
- [ ] `git remote -v` 🛑
- [ ] `git status` → `.env` nahi
- [ ] `git push`
- [ ] Vercel Deployments → Ready
- [ ] Neon SQL Editor → UPDATE chalao ⚠️
- [ ] Vercel → Redeploy
- [ ] Live URL test
- [ ] rokadoctor.in → purani site chal rahi hai?
