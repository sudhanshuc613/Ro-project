# 💻 Terminal se Upload — Sirf Commands, Koi Mouse Nahi

**Zip:** `aquanexa-project.zip` · ~14.7 MB · 427 files

> **MD5 chat message me diya hai** — yahan isliye nahi likha kyunki ye file khud zip ke andar hai,
> to hash likhte hi hash badal jata hai.
**Kaunsa terminal:** **PowerShell** (Windows 10/11 me pehle se hota hai)

> **CMD kyun nahi?** CMD zip extract nahi kar sakta bina extra software ke.
> PowerShell kar sakta hai. Isliye poora kaam PowerShell me hoga.

---

# STEP 0 — PowerShell kholo

**Windows key** dabao → `powershell` type karo → **Enter**

Kaala ya neela window khulega jisme likha hoga:
```
PS C:\Users\SUDHA>
```

> ⚠️ **"Windows PowerShell" chahiye, "PowerShell ISE" nahi.**

---

# STEP 1 — Zip Downloads me hai ya nahi, check karo

```powershell
dir $HOME\Downloads\aquanexa-project.zip
```

### Dikhna chahiye
```
Mode    LastWriteTime      Length Name
-a---   18-08-2026 18:53  147xxxxx aquanexa-project.zip
```

| Problem | Hal |
|---|---|
| `Cannot find path` | Zip download nahi hui, ya kisi aur folder me hai |
| Length ~1.47 crore (14.7 MB) se bahut kam | Download adhoora hai — dobara download karo |

---

# STEP 2 — Zip sahi hai ya nahi (MD5 check)

```powershell
(Get-FileHash $HOME\Downloads\aquanexa-project.zip -Algorithm MD5).Hash
```

Jo hash aaye usko **chat message wale MD5 se milao**.

> Chhote-bade akshar se farak nahi padta. Match kare = zip theek hai.
> **Match na kare → download adhoora/corrupt hai, dobara download karo.**

---

# STEP 3 — Project folder me jao aur backup banao

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
```

```powershell
$stamp = Get-Date -Format "ddMMM-HHmm"
git bundle create "$HOME\Downloads\backup-$stamp.bundle" --all
```

### Dikhna chahiye
```
Enumerating objects: 850, done.
...
```

Ye ek file bana dega `Downloads` me — **poore git history ka backup**, 1 file me. Kuch bhi bigda to isse sab wapas aa jayega.

---

# STEP 4 — Purana kaam side me rakho + GitHub se latest lo

```powershell
git stash
```

| Output | Matlab |
|---|---|
| `Saved working directory...` | ✅ purana kaam bach gaya |
| `No local changes to save` | ✅ kuch tha hi nahi, aage badho |

```powershell
git pull --rebase origin main
```

| Output | Matlab |
|---|---|
| `Already up to date.` | ✅ |
| `Successfully rebased` | ✅ |
| `Fast-forward` | ✅ |

---

# STEP 5 — Zip extract karo

```powershell
Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path "$HOME\Downloads\aquanexa-project.zip" -DestinationPath "$HOME\Downloads\aqp-new" -Force
```

Kuch output nahi aayega — **yahi sahi hai**. Ab check karo:

```powershell
dir "$HOME\Downloads\aqp-new\package.json"
```

### Dikhna chahiye
```
-a---   18-08-2026 17:55    2416 package.json
```

> ❌ `Cannot find path` aaye to zip andar ek aur folder me hai. Ye chala:
> ```powershell
> dir "$HOME\Downloads\aqp-new"
> ```
> Aur mujhe screenshot bhejo.

---

# STEP 6 — Files copy karo

```powershell
robocopy "$HOME\Downloads\aqp-new" "C:\Users\SUDHA\Downloads\ro-Project\Ro-project" /E /NFL /NDL /NJH /NJS
```

### 🔴 Output samajhna zaroori hai

Aakhir me ek number dikhega. **Robocopy ka number normal error jaisa nahi hota:**

| Number | Matlab |
|---|---|
| **0** | ✅ Kuch copy nahi hua (files pehle se same thi) |
| **1** | ✅ **Files copy ho gayi — YAHI SAHI HAI** |
| **2** | ✅ Extra files mili, theek hai |
| **3** | ✅ Dono — theek hai |
| **8 ya zyada** | ❌ Asli error — mujhe batao |

> **1 dikhna normal hai. Ghabrana mat.**
> Number dekhne ke liye: `echo $LASTEXITCODE`

**`node_modules` aur `.git` safe hain** — zip me wo hain hi nahi, isliye robocopy unhe chhuega bhi nahi.

---

# STEP 7 — Check karo kya-kya badla

```powershell
git status --short
```

### Dikhna chahiye — 12 `M` (modified)

```
 M prisma/seed.ts
 M scripts/verify-all.sh
 M src/app/(shop)/category/[slug]/page.tsx
 M src/app/(shop)/products/[slug]/page.tsx
 M src/app/(shop)/products/page.tsx
 M src/app/admin/(dashboard)/seo/page.tsx
 M src/app/api/products/[id]/route.ts
 M src/app/api/products/route.ts
 M src/components/admin/ProductForm.tsx
 M src/components/admin/Sidebar.tsx
 M src/lib/seo/metadata.ts
 M src/lib/seo/schema.ts
```

### Aur `??` (naye) — ye 16

```
?? SEO-INDEXING-AUR-COMPETITOR-TOOL.md
?? TERMINAL-SE-UPLOAD.md
?? UPLOAD-KARO-18-AUG.md
?? public/a7f3c9e2b8d1456c4e8a1b6d29f375e0.txt
?? scripts/verify-seo-indexing.sh
?? src/app/admin/(dashboard)/competitors/
?? src/app/api/admin/rank-check/
?? src/app/api/admin/redirects/
?? src/app/api/redirects/
?? src/components/admin/CompetitorWatch.tsx
?? src/components/admin/RedirectManager.tsx
?? src/components/product/CategorySeoContent.tsx
?? src/lib/seo/catalog-seo.ts
?? src/lib/seo/redirects.ts
?? src/middleware.ts
?? src/server/services/indexing.service.ts
?? src/server/services/rank.service.ts
```

## Ginti karke confirm karo

```powershell
"Modified: " + (git status --short | Select-String '^ M').Count
"Naye:     " + (git status --short | Select-String '^\?\?').Count
```

**Modified 12 aur Naye 16-17 aana chahiye.**

### 🔴 Rukne wale signal

```powershell
git status --short | Select-String '\.env|node_modules'
```

**Kuch bhi dikhe = RUK JA, mujhe batao.** Khali output = ✅ safe.

| Kya dikha | Kya karo |
|---|---|
| Modified 12, Naye 16 | ✅ STEP 8 |
| Sab khali | ❌ copy nahi hui — STEP 6 dobara |
| Modified 50-100 | ❌ **RUK JA**, screenshot bhejo |
| `.env` dikha | ❌ **RUK JA**, batao |

---

# STEP 8 — Push karo

```powershell
git add .
```

```powershell
git commit -m "SEO: 301 redirects, lowercase slugs, pan-India catalog content, IndexNow, Competitor Watch"
```

### Dikhna chahiye
```
[main a1b2c3d] SEO: 301 redirects, lowercase slugs...
 28 files changed, 2400 insertions(+), 45 deletions(-)
```

```powershell
git push origin main
```

### Dikhna chahiye
```
Enumerating objects: 52, done.
Writing objects: 100% (35/35), 42.15 KiB
To https://github.com/sudhanshuc613/Ro-project.git
   abc1234..def5678  main -> main
```

**`main -> main` = HO GAYA ✅**

### Password maange to
- Username: `sudhanshuc613`
- Password: **normal password nahi chalega** → Personal Access Token chahiye
  `github.com` → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → `repo` tick → Generate → copy karke paste karo
  *(paste karte waqt kuch dikhega nahi — ye normal hai, bas Enter dabao)*

---

# STEP 9 — Safai (optional)

```powershell
Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force
```

---

# STEP 10 — Terminal se hi deploy check karo

Vercel ko 3-4 minute do, phir:

```powershell
curl.exe -s -o NUL -w "Site: %{http_code}`n" https://rokadoctor.in/
```

### 🔴 Purane URL ab redirect hone chahiye

```powershell
$purane = @(
  "ro-booster-pump-100-gpd-24v",
  "aquanexa-pure-8l-ro-uv-uf-water-purifier",
  "aquanexa-alkaline-copper-10l-ro-purifier",
  "aquafresh"
)
foreach ($u in $purane) {
  $code = curl.exe -s -o NUL -w "%{http_code}" "https://rokadoctor.in/products/$u"
  if ($code -eq "301" -or $code -eq "308") { Write-Host "OK   $u -> $code" -ForegroundColor Green }
  else { Write-Host "FAIL $u -> $code" -ForegroundColor Red }
}
```

**Chaaron pe hara `OK ... -> 301` aana chahiye.**
Laal `FAIL ... -> 404` aaye = deploy abhi nahi hua, 2 min aur ruko.

### Lowercase slug test

```powershell
curl.exe -s -o NUL -w "lowercase slug: %{http_code}`n" https://rokadoctor.in/products/grand-forest-ro-booster-pump-75-gpd-24v
```
**200 aana chahiye** (pehle 404 tha).

### IndexNow key file

```powershell
curl.exe -s https://rokadoctor.in/a7f3c9e2b8d1456c4e8a1b6d29f375e0.txt
```
**Ye dikhna chahiye:** `a7f3c9e2b8d1456c4e8a1b6d29f375e0`

### Category page pe naya content aaya?

```powershell
$h = curl.exe -s https://rokadoctor.in/category/spare-parts
if ($h -match "Buying Guide") { Write-Host "OK  buying guide mil gaya" -ForegroundColor Green } else { Write-Host "FAIL  guide nahi mila" -ForegroundColor Red }
if ($h -match "ItemList") { Write-Host "OK  ItemList schema mil gaya" -ForegroundColor Green } else { Write-Host "FAIL  schema nahi mila" -ForegroundColor Red }
```

---

# 📋 Sab ek jagah — copy-paste ready

**Ek-ek block karke chalao, beech me output dekhte raho.**

### Block 1 — check + backup
```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
(Get-FileHash $HOME\Downloads\aquanexa-project.zip -Algorithm MD5).Hash
$stamp = Get-Date -Format "ddMMM-HHmm"
git bundle create "$HOME\Downloads\backup-$stamp.bundle" --all
git stash
git pull --rebase origin main
```

### Block 2 — extract + copy
```powershell
Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path "$HOME\Downloads\aquanexa-project.zip" -DestinationPath "$HOME\Downloads\aqp-new" -Force
robocopy "$HOME\Downloads\aqp-new" "C:\Users\SUDHA\Downloads\ro-Project\Ro-project" /E /NFL /NDL /NJH /NJS
```

### Block 3 — 🔴 CHECK (yahan ruk ke dekho)
```powershell
"Modified: " + (git status --short | Select-String '^ M').Count
"Naye:     " + (git status --short | Select-String '^\?\?').Count
git status --short | Select-String '\.env|node_modules'
```
**Modified 12 · Naye 16 · teesri line khali → aage badho**

### Block 4 — push
```powershell
git add .
git commit -m "SEO: 301 redirects, lowercase slugs, pan-India catalog content, IndexNow, Competitor Watch"
git push origin main
```

### Block 5 — deploy ke 4 min baad, verify
```powershell
foreach ($u in @("ro-booster-pump-100-gpd-24v","aquanexa-pure-8l-ro-uv-uf-water-purifier","aquanexa-alkaline-copper-10l-ro-purifier","aquafresh")) {
  $c = curl.exe -s -o NUL -w "%{http_code}" "https://rokadoctor.in/products/$u"
  Write-Host "$u -> $c"
}
curl.exe -s https://rokadoctor.in/a7f3c9e2b8d1456c4e8a1b6d29f375e0.txt
```

---

# ⛔ Rollback — 2 tarike

## Tarika 1 — Vercel (sabse safe, 30 second)
```
Vercel → Deployments → purana 🟢 Ready → ⋯ → Promote to Production
```
**Git ko haath lagaye bina site wapas.**

## Tarika 2 — Terminal se, agar push ke baad bigda
```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git log --oneline -3
```
Ab **pichle** commit ka code (dusri line) copy karo, phir:
```powershell
git revert HEAD --no-edit
git push origin main
```

> ⚠️ `git revert` **sirf rollback ke liye** hai. Upload ke liye kabhi mat chalana —
> pichli baar isi ne confuse kiya tha.

## Backup bundle se poora restore (sabse aakhri option)
```powershell
cd $HOME\Downloads
git clone backup-18Aug-1838.bundle Ro-project-restored
```

---

# 🚫 Ye commands kabhi mat chalana

```powershell
git reset --hard        # sab local kaam mit jayega
git push --force        # GitHub ka history mit jayega
npm audit fix --force   # pichli baar build tod chuka hai
rm -rf .git             # repo hi khatam
```

---

# ❓ Problem aaye to

### `Expand-Archive : ... running scripts is disabled`
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
Phir dobara chalao. (Ye sirf is window ke liye hai, permanent nahi.)

### `git : The term 'git' is not recognized`
Git install nahi hai → `git-scm.com/download/win` → install → **PowerShell band karke dobara kholo**

### `curl.exe : The term 'curl.exe' is not recognized`
Purana Windows hai. Iski jagah:
```powershell
(Invoke-WebRequest https://rokadoctor.in/products/ro-booster-pump-100-gpd-24v -MaximumRedirection 0 -ErrorAction SilentlyContinue).StatusCode
```

### `! [rejected] non-fast-forward`
STEP 4 skip kiya:
```powershell
git pull --rebase origin main
git push origin main
```

### `CONFLICT (content): Merge conflict in ...`
```powershell
git checkout --theirs .
git add .
git rebase --continue
git push origin main
```

### robocopy ne `8` ya zyada diya
```powershell
echo $LASTEXITCODE
dir "$HOME\Downloads\aqp-new" | Measure-Object
```
Dono ka output mujhe bhejo.

---

# 🧪 Is zip ka test report

```
npm install (node_modules delete karke)   EXIT 0  ✅
prisma generate                            EXIT 0  ✅
tsc --noEmit                               EXIT 0  ✅
npm run build (.next delete karke)         EXIT 0  ✅  131 pages, 0 warning
prisma db push + seed                      EXIT 0  ✅

verify-seo-indexing.sh       59/59   ✅
verify-product-admin.sh      68/68   ✅
verify-titles-and-schema.sh  44/44   ✅
verify-brand-rename.sh       51/51   ✅
verify-admin-full.sh         44/44   ✅
verify-password-features.sh  30/30   ✅
──────────────────────────────────────
TOTAL                      296/296   ✅

zip integrity   No errors detected
.env leak       0
images          original size (2.6 / 1.8 / 1.7 / 1.2 MB)
files           426
```
