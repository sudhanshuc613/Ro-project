# 🎯 Mil gaya! Tera stash hi asli wajah hai

Tere screenshot ne poori paheli solve kar di:

```
stash@{0}: WIP on main: fd451be product admin: 29 brands + custom brand, SEO coach, HSN, spec templates, GTIN schema
```

---

# Kya hua tha — poori kahani

Maine GitHub ke commits check kiye:

```
0ec4d5f  18 Aug 18:59  SEO: 301 redirects, lowercase slugs, pan-India...  ← tera kal ka push
fd451be  12 Aug 17:08  product admin: 29 brands + custom brand...        ← stash isi se juda hai
```

## Order galat ho gaya

Tune (meri guide follow karte hue) ye kiya:

```
1. Files copy ki       → 12 modified + 16 naye  ✅
2. git stash chalaya   → 🔴 12 modified files WAPAS PURANI ho gayi
                          (naye 16 files bach gaye — stash unhe nahi chhuta)
3. git add . + commit  → sirf 16 naye files gaye
4. git push            → GitHub pe aadha code
```

**`git stash` sirf tracked files ko chhuta hai.** Naye (untracked) files ko chhodta hai. Isliye:

| | Kya hua |
|---|---|
| **16 naye files** | stash ne nahi chhua → push ho gaye ✅ |
| **12 modified files** | stash ne purani kar di → push nahi hui ❌ |

Bilkul wahi jo maine live measure kiya tha.

## Meri galti

Meri guide me `git stash` **STEP 4** me tha (files copy karne se pehle). Par tune shayad copy pehle kar li thi, ya ek command dobara chal gayi. Guide me ye trap chhoda — **wo mera dosh hai**, maine warning nahi likhi thi ki "copy ke baad stash mat chalana".

## 🎁 Achhi khabar

**Tera saara kaam stash me SAFE hai.** Kuch mita nahi. Sirf ek command se wapas aa jayega.

---

# ✅ FIX — 4 command, 2 minute

CMD ya PowerShell, dono me chalega.

## Command 1 — folder me jao

```
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
```

## Command 2 — 🔴 Stash wapas nikalo

```
git stash pop
```

### Dikhna chahiye

```
On branch main
Changes not staged for commit:
        modified:   prisma/seed.ts
        modified:   src/app/(shop)/category/[slug]/page.tsx
        modified:   src/app/(shop)/products/page.tsx
        modified:   src/components/admin/ProductForm.tsx
        modified:   src/components/admin/Sidebar.tsx
        modified:   src/lib/seo/metadata.ts
        modified:   src/lib/seo/schema.ts
        ...
Dropped refs/stash@{0} (abc123...)
```

**`Dropped refs/stash` dikha = kaam ho gaya ✅**

### Agar CONFLICT aaye

```
CONFLICT (content): Merge conflict in src/lib/seo/schema.ts
```

Ghabrana nahi. Ye chala — zip wala version rakh lega:

```
git checkout --theirs .
git add .
```

## Command 3 — Check karo (yahan ruk ke dekho)

```
git status --short
```

**Ab `M` wali lines dikhni chahiye.** Kam se kam ye 7:

```
 M prisma/seed.ts
 M src/app/(shop)/category/[slug]/page.tsx
 M src/app/(shop)/products/page.tsx
 M src/app/(shop)/products/[slug]/page.tsx
 M src/components/admin/ProductForm.tsx
 M src/components/admin/Sidebar.tsx
 M src/lib/seo/metadata.ts
 M src/lib/seo/schema.ts
```

### PowerShell me ginti (aasan)

```powershell
"Modified: " + (git status --short | Select-String '^ M').Count
```

**12 ke aas-paas aana chahiye.**

### 🔴 Safety check

```powershell
git status --short | Select-String '\.env|node_modules'
```
**Khali aana chahiye.** Kuch dikhe to ruk ja, batao.

### ❌ Agar `M` ek bhi nahi dikha

Matlab stash purana tha. Tab zip se dobara copy karo (`/IS /IT` flag ke saath):

```powershell
Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path "$HOME\Downloads\aquanexa-project.zip" -DestinationPath "$HOME\Downloads\aqp-new" -Force
robocopy "$HOME\Downloads\aqp-new" "C:\Users\SUDHA\Downloads\ro-Project\Ro-project" /E /IS /IT /NFL /NDL /NJH /NJS
git status --short
```

## Command 4 — Push

```
git add .
```
```
git commit -m "fix: modified files restore from stash - schema, metadata, sidebar, category, products"
```
```
git push origin main
```

**`main -> main` dikha = ho gaya ✅**

---

# 🔴 Ab se rule — ye yaad rakhna

```
git stash  →  SIRF files copy karne se PEHLE chalana
              copy ke BAAD chalaya to naya kaam ud jayega
```

Agar bhool jaye ki chalaya ya nahi:
```
git stash list
```
Khali = safe. Kuch dikhe = `git stash pop` karke wapas le lo.

---

# Deploy ke 4 min baad — verify

PowerShell me poora paste karo:

```powershell
Write-Host "`n--- Purane URL (301 chahiye) ---"
foreach ($u in @("ro-booster-pump-100-gpd-24v","aquanexa-pure-8l-ro-uv-uf-water-purifier","aquafresh")) {
  $c = curl.exe -s -o NUL -w "%{http_code}" "https://rokadoctor.in/products/$u"
  if ($c -eq "301") { Write-Host "  OK   $u" -ForegroundColor Green } else { Write-Host "  FAIL $u -> $c" -ForegroundColor Red }
}

Write-Host "`n--- lowercase slug (200 chahiye) ---"
$c = curl.exe -s -o NUL -w "%{http_code}" "https://rokadoctor.in/products/grand-forest-ro-booster-pump-75-gpd-24v"
if ($c -eq "200") { Write-Host "  OK   lowercase" -ForegroundColor Green } else { Write-Host "  FAIL -> $c" -ForegroundColor Red }

Write-Host "`n--- Category page naya content ---"
$h = curl.exe -s "https://rokadoctor.in/category/spare-parts"
if ($h -match "Buying Guide") { Write-Host "  OK   buying guide" -ForegroundColor Green } else { Write-Host "  FAIL nahi mila" -ForegroundColor Red }
if ($h -match "Price Range in India") { Write-Host "  OK   price table" -ForegroundColor Green } else { Write-Host "  FAIL nahi mila" -ForegroundColor Red }

Write-Host "`n--- /products schema ---"
$p = curl.exe -s "https://rokadoctor.in/products"
if ($p -match "ItemList") { Write-Host "  OK   ItemList schema" -ForegroundColor Green } else { Write-Host "  FAIL nahi mila" -ForegroundColor Red }

Write-Host "`n--- Title fix ---"
$t = curl.exe -s "https://rokadoctor.in/products/aquapearl-alkaline-copper-12l-ro-purifier"
if ($t -match "Price in India") { Write-Host "  OK   title fix laga" -ForegroundColor Green } else { Write-Host "  FAIL purana title" -ForegroundColor Red }
```

**Sab hara = poora kaam ho gaya.**

---

# 📍 Admin panel — abhi bhi kaam karta hai

Fix se pehle bhi ye chalega (sidebar link nahi dikhega, par page hai):

| Kya | URL |
|---|---|
| **Competitor Watch** | `rokadoctor.in/admin/competitors` |
| **Redirect Manager** | `rokadoctor.in/admin/seo` → sabse neeche |
| **SEO Coach** | product edit page → tab bar |

Pehle `/admin` pe login (phone `8969821440`), phir address bar me URL type karo.

**Fix ke baad sidebar me 🎯 Competitor Watch link apne aap aa jayega.**

---

# ✅ Yaad rakh — jo pehle se chal raha hai

Ye kaam **already ho chuka hai**, fix se pehle bhi:

```
✅ 4 purane URL → 301 redirect (ranking bach gayi)
✅ Uppercase slug → 301
✅ /shop, /spare-parts → 301
✅ IndexNow key file live
✅ Admin ke naye pages bane hue
```

**Sabse bada kaam — 404 wala — solve hai.** Ye fix sirf content aur UI polish ke liye hai.
