# 📤 Upload — Phase 1+2+3

**PowerShell** kholo: Windows key → `powershell` → Enter

---

# ⚠️ Ye 3 rule

| ❌ Mat chalana | Kyun |
|---|---|
| `git stash` files copy karne ke **BAAD** | Pichli baar isi se aadha push hua tha |
| `git revert HEAD` | Rollback hai, upload nahi |
| `npm audit fix --force` | Build tod chuka hai |

---

# STEP 1 — Backup

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
```

```powershell
$stamp = Get-Date -Format "ddMMM-HHmm"
git bundle create "$HOME\Downloads\backup-$stamp.bundle" --all
```

Poore git history ka backup, ek file me.

---

# STEP 2 — Purana kachra saaf

```powershell
git stash list
```

Kuch dikhe to:
```powershell
git stash drop
```

Khali ho to aage badho.

---

# STEP 3 — Pull

```powershell
git pull --rebase origin main
```

`Already up to date.` ya `Successfully rebased` = ✅

---

# STEP 4 — Zip extract + copy

```powershell
Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force -ErrorAction SilentlyContinue
```

```powershell
Expand-Archive -Path "$HOME\Downloads\aquanexa-project.zip" -DestinationPath "$HOME\Downloads\aqp-new" -Force
```

```powershell
robocopy "$HOME\Downloads\aqp-new" "C:\Users\SUDHA\Downloads\ro-Project\Ro-project" /E /IS /IT /NFL /NDL /NJH /NJS
```

> 🔴 **`/IS /IT` zaroori hai.** Bina inke robocopy same-dikhne wali file skip kar deta hai — pichli baar yahi problem thi.
>
> Robocopy `1`, `2` ya `3` de = ✅ **success** (robocopy ke numbers ulte hote hain).

---

# STEP 5 — 🔴 Check (yahan RUKO)

```powershell
"Modified: " + (git status --short | Select-String '^ M').Count
"Naye:     " + (git status --short | Select-String '^\?\?').Count
git status --short | Select-String '\.env$|node_modules'
```

| Chahiye | |
|---|---|
| Modified | **10–12** |
| Naye | **18–22** |
| Teesri line | **khali** |

Modified me ye dikhni chahiye:
```
 M prisma/schema.prisma
 M package.json
 M src/app/globals.css
 M src/app/(shop)/page.tsx
 M src/app/(shop)/layout.tsx
 M src/app/admin/(dashboard)/page.tsx
 M src/app/api/orders/route.ts
 M src/app/api/service-requests/route.ts
 M src/components/admin/Topbar.tsx
 M scripts/verify-all.sh
 M .env.example
```

**50-100 files dikhe ya `.env` aaye → RUK JA, screenshot bhej.**

---

# STEP 6 — Push

```powershell
git add .
```

```powershell
git commit -m "UX: proof stats, review showcase, sticky mobile bar, quick form, motion system, command palette, action center, owner notifications"
```

```powershell
git push origin main
```

`main -> main` = ✅ ho gaya

---

# STEP 7 — 🔴 Vercel me 3 env var (phone notification ke liye)

Vercel → `ro-project` → **Settings** → **Environment Variables** → **Add New**

Teen alag-alag entry, har ek me teeno checkbox (Production/Preview/Development) tick:

**1.**
```
Name:  VAPID_PUBLIC_KEY
Value: BICnLLsOsSbdV5VG42SOjfbhF84k-Ar94RBzcC3kIJZ8ooOMHciI2NBTv5ayFnVBJJtF5Myo8YhyN8I55lySseI
```

**2.**
```
Name:  VAPID_PRIVATE_KEY
Value: _HMSnEmO7WIS8Ghg6yeBU6u3tpQYR0apsSDXyYyqkPc
```

**3.**
```
Name:  VAPID_SUBJECT
Value: mailto:support@rokadoctor.in
```

Save karke → **Deployments** → sabse upar wale pe **⋯** → **Redeploy**

> Ye na karo to bell to chalega (alerts dikhenge), par **phone pe notification nahi aayegi**.
>
> 🔴 Private key kisi ko mat bhejna, kahin paste mat karna.

---

# STEP 8 — Deploy dekho

Vercel → **Deployments** → sabse upar

| Rang | Matlab |
|---|---|
| 🟡 Building | 3-4 min |
| 🟢 Ready | ✅ |
| 🔴 Error | Logs khol → screenshot |

---

# STEP 9 — 📱 Phone pe notification chalu karo

**Ye sabse mazedaar step hai.**

## Android
1. Phone ke Chrome me `rokadoctor.in/admin` khol
2. Login (phone `8969821440`)
3. Upar right me 🔔 **bell** pe tap
4. **"📱 Phone pe notification chalu karo"** dabao
5. Chrome permission maangega → **Allow**
6. **Test notification turant aayegi** ✅

## iPhone
1. Safari me `rokadoctor.in/admin` khol
2. Neeche **Share** button → **"Add to Home Screen"**
3. Ab **home screen wale icon** se kholo (Safari se nahi)
4. Login → 🔔 → **chalu karo** → Allow

> iOS sirf installed web app ko push deta hai, isliye ye extra step zaroori hai.

## Test karo
Doosre phone se (ya incognito me) `rokadoctor.in` khol ke **ek dummy booking** kar do.
**Tere phone pe turant notification aani chahiye.**

---

# STEP 10 — Sab check karo

## Website (incognito, phone se)
```
□ Hero ke neeche 6 numbers dikhe, animate hue?     (4.8★, 2400+, 35, 21...)
□ Uske neeche 4.8 rating bada + review carousel?
□ Neeche Call + WhatsApp bar chipka hua?
□ Booking form sirf 3 field ka?
□ Scroll karo — sections fade-up ho ke aa rahe?
```

## Admin (laptop se)
```
□ Ctrl+K daba ke dekho — palette khula?
□ Usme apna phone number type karo — customer mila?
□ Dashboard pe upar 4 cards (kamai/service/order/queue)?
□ Neeche "Abhi dhyan do" list?
□ 🔔 bell pe badge dikha?
```

---

# ⛔ Rollback

```
Vercel → Deployments → purana 🟢 Ready → ⋯ → Promote to Production
```
30 second. Git ko haath mat lagana.

---

# 🧪 Test report

```
npm install (clean)               EXIT 0  ✅
prisma generate / db push / seed  EXIT 0  ✅
tsc --noEmit                      EXIT 0  ✅
npm run build                     EXIT 0  ✅  131 pages, ZERO warnings

verify-ux-upgrade.sh       99/99  ← naya
verify-seo-indexing.sh     59/59
verify-product-admin.sh    68/68
verify-titles-and-schema   44/44
verify-brand-rename        51/51
verify-admin-full          44/44
verify-password-features   31/31
────────────────────────────────
TOTAL                    396/396  ✅
```

---

# 📋 Copy-paste ready

### Block 1
```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
$stamp = Get-Date -Format "ddMMM-HHmm"
git bundle create "$HOME\Downloads\backup-$stamp.bundle" --all
git stash list
git pull --rebase origin main
```

### Block 2
```powershell
Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path "$HOME\Downloads\aquanexa-project.zip" -DestinationPath "$HOME\Downloads\aqp-new" -Force
robocopy "$HOME\Downloads\aqp-new" "C:\Users\SUDHA\Downloads\ro-Project\Ro-project" /E /IS /IT /NFL /NDL /NJH /NJS
```

### Block 3 — 🔴 RUKO aur dekho
```powershell
"Modified: " + (git status --short | Select-String '^ M').Count
"Naye:     " + (git status --short | Select-String '^\?\?').Count
git status --short | Select-String '\.env$|node_modules'
```

### Block 4
```powershell
git add .
git commit -m "UX: proof stats, review showcase, sticky mobile bar, quick form, motion system, command palette, action center, owner notifications"
git push origin main
```

### Block 5 — Vercel env vars (STEP 7) → Redeploy

---

Push karke bata dena — **main live check karke bataunga**.
