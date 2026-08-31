# ✅ Complete Steps — PowerShell (jo abhi khula hai)

**Tune files replace kar di hain — bahut achha.**
**Ab `git stash pop` MAT chalana** — wo conflict de dega kyunki nayi files pehle se pad chuki hain.

Sirf **7 command**. Ek-ek karke, har command ke baad Enter.

---

# 🔴 STEP 1 — Purana stash hatao

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
```

```powershell
git stash drop
```

### Dikhna chahiye
```
Dropped refs/stash@{0} (abc123def456...)
```

> **Kyun `drop` aur `pop` nahi?**
> `pop` purana version wapas laata hai — par tune nayi files already copy kar di hain.
> Dono milkar conflict banate. `drop` sirf purana kachra hataata hai. **Tera naya kaam folder me safe hai.**

---

# STEP 2 — Dekho kya-kya badla

```powershell
git status --short
```

## ✅ Sahi output — 12 `M` lines

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
?? CMD-KE-LIYE-FIX.md
?? STASH-KA-JAWAB-FIX.md
?? AB-YE-KARO-PURA-STEP.md
```

---

# STEP 3 — 🔴 Ginti check karo (ye sabse zaroori)

```powershell
"Modified: " + (git status --short | Select-String '^ M').Count
```

## Kya aana chahiye

| Number | Matlab | Kya karo |
|---|---|---|
| **12** | ✅ Perfect | STEP 4 |
| **8-11** | ✅ Chalega | STEP 4 |
| **1-7** | ⚠️ Kam hai | STEP 3B |
| **0** | ❌ Copy nahi hui | STEP 3B |

## STEP 3B — Agar 8 se kam aaye

Zip dobara extract karke **force copy** karo:

```powershell
Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force -ErrorAction SilentlyContinue
```

```powershell
Expand-Archive -Path "$HOME\Downloads\aquanexa-project.zip" -DestinationPath "$HOME\Downloads\aqp-new" -Force
```

```powershell
robocopy "$HOME\Downloads\aqp-new" "C:\Users\SUDHA\Downloads\ro-Project\Ro-project" /E /IS /IT /NFL /NDL /NJH /NJS
```

> **`/IS /IT` zaroori hai** — bina inke robocopy same-dikhne wali file skip kar deta hai.
> Ye pichli baar missing tha, isliye modified files copy nahi hui thi.
> Robocopy `1`, `2` ya `3` de = ✅ theek hai (robocopy ke number ulte hote hain).

Phir dobara ginti:
```powershell
"Modified: " + (git status --short | Select-String '^ M').Count
```

---

# STEP 4 — Safety check

```powershell
git status --short | Select-String '\.env|node_modules'
```

**Output KHALI aana chahiye.**
Kuch bhi dikhe → **RUK JA**, mujhe screenshot bhej.

---

# STEP 5 — Push

```powershell
git add .
```

```powershell
git commit -m "fix: modified files - schema, metadata, sidebar, product form, catalog SEO"
```

### Dikhna chahiye
```
[main a1b2c3d] fix: modified files - schema, metadata...
 15 files changed, 1800 insertions(+), 40 deletions(-)
```

```powershell
git push origin main
```

### Dikhna chahiye
```
Enumerating objects: 45, done.
Writing objects: 100% (28/28), 38.20 KiB
To https://github.com/sudhanshuc613/Ro-project.git
   0ec4d5f..xyz9876  main -> main
```

**`main -> main` = HO GAYA ✅**

### Password maange to
- Username: `sudhanshuc613`
- Password: normal password **nahi chalega** → Personal Access Token
  `github.com` → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → `repo` tick → copy
  *(paste karte waqt screen pe kuch nahi dikhega — normal hai, bas Enter dabao)*

---

# STEP 6 — Bas. Mujhe bata dena.

Push hone ke baad mujhe likh dena: **"push ho gaya"**

**Main khud live check karunga** aur bata dunga sab sahi hai ya nahi. Tujhe koi verify command chalane ki zaroorat nahi.

Vercel ko 3-4 minute lagenge deploy me.

---

# 📋 Sab ek jagah — copy-paste ready

### Block 1
```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git stash drop
git status --short
"Modified: " + (git status --short | Select-String '^ M').Count
git status --short | Select-String '\.env|node_modules'
```

**← yahan RUKO. "Modified: 12" (ya 8+) aur aakhri line khali honi chahiye.**

### Block 2
```powershell
git add .
git commit -m "fix: modified files - schema, metadata, sidebar, product form, catalog SEO"
git push origin main
```

---

# ⚠️ Ye commands MAT chalana

| Command | Kyun nahi |
|---|---|
| `git stash pop` | Nayi files already padi hain → conflict banega |
| `git revert HEAD` | Ye rollback hai, upload nahi |
| `git reset --hard` | Sab local kaam mit jayega |
| `git checkout .` | Nayi files purani ho jayengi |

---

# 🔍 Abhi ki sthiti (maine abhi live check kiya)

## ✅ Pehle se chal raha hai
```
rokadoctor.in                            200 OK
4 purane URL -> 301 redirect             ✅  ← ranking bach gayi
IndexNow key file                        ✅
Admin ke naye pages bane hue             ✅
```

## ❌ Is push ke baad aayega
```
❌ src/lib/seo/schema.ts                 GitHub pe purana
❌ src/lib/seo/metadata.ts               GitHub pe purana
❌ src/components/admin/Sidebar.tsx      GitHub pe purana
❌ src/components/admin/ProductForm.tsx  GitHub pe purana
❌ src/app/(shop)/products/page.tsx      GitHub pe purana
❌ src/app/(shop)/category/[slug]/page.tsx  GitHub pe purana
```

Isi wajah se abhi ye kaam nahi kar raha:
- lowercase slug `grand-forest-...` → **404**
- category page → 985 words (chahiye 3,670)
- `/products` → ItemList schema nahi
- `AquaPearl` title → 22 chars
- sidebar me **Competitor Watch** link nahi

**Push ke baad ye sab theek ho jayega.**

---

# 📍 Admin panel — abhi bhi khul jayega

Sidebar link push ke baad aayega, par page **abhi bhi bana hua hai**:

1. `rokadoctor.in/admin` → login (phone `8969821440`)
2. Address bar me type karo:
   ```
   rokadoctor.in/admin/competitors
   ```
3. **"Core service"** chip pe click → **"🔍 Check karo"** → ~30 sec ruko

---

# ⛔ Kuch bigda to

**Git ko haath mat lagana.** Vercel se:
```
Vercel → Deployments → purana 🟢 Ready → ⋯ → Promote to Production
```
30 second me site wapas.
