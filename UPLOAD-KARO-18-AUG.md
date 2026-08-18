# 📤 Upload — Step by Step (18 Aug 2026)

**Zip:** `aquanexa-project.zip` — **15 MB** · MD5 `19feaa1263afce047713285e393d5964` · 425 files
**Tera folder:** `C:\Users\SUDHA\Downloads\ro-Project\Ro-project`
**Time lagega:** ~15 minute (deploy ke 4 min milaake)

---

# ⚠️ 3 rule — 20 second me padh le

| ❌ Kabhi mat karna | Kyun |
|---|---|
| `git revert HEAD` | **Ye rollback hai, upload nahi.** Pichli baar tune yahi chala diya tha |
| `git reset --hard` | Sab local kaam mit jayega |
| GitHub pe **pencil ✏️ icon** | 2 baar merge conflict de chuka hai |
| `npm audit fix --force` | Pichli baar poora build tod diya tha |

---

# STEP 1 — Backup (1 min, skip mat karna)

File Explorer:
1. `C:\Users\SUDHA\Downloads\ro-Project` khol
2. `Ro-project` folder pe **right-click → Copy**
3. Khali jagah pe **right-click → Paste**
4. `Ro-project - Copy` ban jayega — **rehne do**

---

# STEP 2 — Zip download + extract

1. Zip download kar → `aquanexa-project.zip`
2. Us pe **right-click → Extract All… → Extract**
3. Folder khulega jisme `src`, `public`, `prisma`, `package.json` dikhega

**Abhi copy MAT karna.** Pehle STEP 3.

---

# STEP 3 — Git pull (ye skip kiya to error aayega)

CMD khol: **Windows key → `cmd` → Enter**

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
```

```cmd
git stash
```

```cmd
git pull --rebase origin main
```

### Output ka matlab

| Dikhe | Matlab |
|---|---|
| `Already up to date.` | ✅ aage |
| `Successfully rebased` | ✅ aage |
| `Fast-forward` | ✅ aage |
| `No local changes to save` | ✅ normal hai, aage |

---

# STEP 4 — Files copy

1. Extract wale folder ke **andar** ja
2. **Ctrl + A** → **Ctrl + C**
3. `C:\Users\SUDHA\Downloads\ro-Project\Ro-project` khol
4. **Ctrl + V**
5. Popup → **"Replace the files in the destination"**

> ⚠️ **"Skip these files" MAT dabana**

---

# STEP 5 — Check karo (zaroori)

```cmd
git status
```

## Ye 12 file "modified" dikhni chahiye

```
modified:   prisma/seed.ts
modified:   scripts/verify-all.sh
modified:   src/app/(shop)/category/[slug]/page.tsx
modified:   src/app/(shop)/products/[slug]/page.tsx
modified:   src/app/(shop)/products/page.tsx
modified:   src/app/admin/(dashboard)/seo/page.tsx
modified:   src/app/api/products/[id]/route.ts
modified:   src/app/api/products/route.ts
modified:   src/components/admin/ProductForm.tsx
modified:   src/components/admin/Sidebar.tsx
modified:   src/lib/seo/metadata.ts
modified:   src/lib/seo/schema.ts
```

## Aur ye 15 "Untracked" (naye)

```
Untracked files:
        SEO-INDEXING-AUR-COMPETITOR-TOOL.md
        UPLOAD-KARO-18-AUG.md
        public/a7f3c9e2b8d1456c4e8a1b6d29f375e0.txt
        scripts/verify-seo-indexing.sh
        src/app/admin/(dashboard)/competitors/
        src/app/api/admin/rank-check/
        src/app/api/admin/redirects/
        src/app/api/redirects/
        src/components/admin/CompetitorWatch.tsx
        src/components/admin/RedirectManager.tsx
        src/components/product/CategorySeoContent.tsx
        src/lib/seo/catalog-seo.ts
        src/lib/seo/redirects.ts
        src/middleware.ts
        src/server/services/indexing.service.ts
        src/server/services/rank.service.ts
```

### 🔴 Rukne wale signal

| Kya dikha | Kya karo |
|---|---|
| Upar wali list | ✅ STEP 6 |
| `nothing to commit, working tree clean` | ❌ files copy nahi hui → STEP 4 dobara |
| **50-100 files modified** | ❌ **RUK JA**, screenshot bhej |
| `.env` ya `node_modules` dikhe | ❌ **RUK JA**, mujhe batao |

---

# STEP 6 — Push

Teen line, ek-ek karke:

```cmd
git add .
```

```cmd
git commit -m "SEO: 301 redirects, lowercase slugs, pan-India catalog content, IndexNow, Competitor Watch"
```

```cmd
git push origin main
```

### Sahi output

```
Enumerating objects: 52, done.
...
To https://github.com/sudhanshuc613/Ro-project.git
   abc1234..def5678  main -> main
```

**`main -> main` dikha = ho gaya ✅**

> `Everything up-to-date` aaye → commit bana hi nahi. `git status` dobara chala.

### Password maange
- Username: `sudhanshuc613`
- Password: normal password **nahi chalega** → Personal Access Token
  `github.com` → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → `repo` tick → copy

---

# STEP 7 — Vercel env var (optional, 1 min)

Vercel → `ro-project` → **Settings** → **Environment Variables** → Add:

```
Name:   INDEXNOW_KEY
Value:  a7f3c9e2b8d1456c4e8a1b6d29f375e0
```

Teeno checkbox tick → **Save**

> Na bhi karo to default key se kaam karega. Karoge to aage key badalna aasan.

---

# STEP 8 — Deploy dekho

Vercel → **Deployments** → sabse upar wala

| Rang | Matlab |
|---|---|
| 🟡 Building | 3-4 min ruk |
| 🟢 Ready | ✅ ho gaya |
| 🔴 Error | **Logs** khol → screenshot bhej |

---

# STEP 9 — 🔴 Test karo (Incognito: Ctrl+Shift+N)

## Test 1 — Purane URL ab redirect hote hain (SABSE ZAROORI)

Ye 4 URL browser me daal. **Har ek naye product page pe pahunchna chahiye, 404 nahi:**

```
https://rokadoctor.in/products/ro-booster-pump-100-gpd-24v
https://rokadoctor.in/products/aquanexa-pure-8l-ro-uv-uf-water-purifier
https://rokadoctor.in/products/aquanexa-alkaline-copper-10l-ro-purifier
https://rokadoctor.in/products/aquafresh
```

✅ Product page khula = **theek**
❌ 404 dikha = **mujhe batao**

## Test 2 — Lowercase URL

```
https://rokadoctor.in/products/grand-forest-ro-booster-pump-75-gpd-24v
```
(chhote akshar mein — pehle ye 404 deta tha)

✅ Page khula = theek

## Test 3 — IndexNow key file

```
https://rokadoctor.in/a7f3c9e2b8d1456c4e8a1b6d29f375e0.txt
```

Screen pe sirf ye dikhna chahiye:
```
a7f3c9e2b8d1456c4e8a1b6d29f375e0
```

## Test 4 — Category page ka naya content

```
https://rokadoctor.in/category/spare-parts
```

Neeche scroll kar — dikhna chahiye:
- **Buying Guide** (kaun sa part kharab hua, GPD ka matlab…)
- **Price Range in India (2026)** — table
- **Frequently Asked Questions**

## Test 5 — Competitor Watch

```
https://rokadoctor.in/admin  → login → sidebar me 🎯 Competitor Watch
```

- **"Core service"** chip pe click (sirf ek, sab nahi)
- **"🔍 Check karo"** dabao
- ~30 second ruk

Result aayega. **Agar laal warning aaye "search engine ne block kar diya"** — ye normal hai, 10-15 min baad dobara try karna. Wo warning maine jaan-boojh ke banaya hai taki tool jhooth na bole.

## Test 6 — Redirect Manager

```
/admin/seo → sabse neeche scroll → "URL Redirects"
```

Table dikhni chahiye.

---

# STEP 10 — Search Console (10 min, ek baar)

Google ko batao ki purane URL shift ho gaye:

1. `search.google.com/search-console` khol
2. Upar search box me ye URL daal, Enter:
   ```
   https://rokadoctor.in/products/ro-booster-pump-100-gpd-24v
   ```
3. Ab **"URL is not on Google"** ki jagah redirect dikhega
4. Yahi 3 aur URL ke liye karo

Phir **naye product** index karwao:
```
https://rokadoctor.in/products/aquabizz-pure-8l-ro-uv-uf-water-purifier
https://rokadoctor.in/products/aquafresh-alkaline-copper-10l-ro-purifier
https://rokadoctor.in/products/aquapearl-alkaline-copper-12l-ro-purifier
https://rokadoctor.in/products/grand-forest-ro-booster-pump-75-gpd-24v
```
Har ek pe: URL Inspection → **Request Indexing**

Aur ye 6 category page (naya content aaya hai, dobara crawl karwao):
```
https://rokadoctor.in/products
https://rokadoctor.in/category/spare-parts
https://rokadoctor.in/category/new-ro-purifiers
https://rokadoctor.in/category/commercial-plants
https://rokadoctor.in/category/ro-membranes
https://rokadoctor.in/category/booster-pumps
```

> Din me 10-12 se zyada request nahi kar sakte. 2 din me poora ho jayega.

---

# ⛔ Kuch bigda to — Rollback

**Git ko haath mat lagana.** Vercel se karo:

```
Vercel → Deployments → purana 🟢 Ready wala → ⋯ → Promote to Production
```

30 second me wapas. Phir mujhe batao kya hua.

---

# 🧪 Ye zip ka test report

```
npm install (node_modules delete karke)   EXIT 0  ✅
prisma generate                            EXIT 0  ✅
tsc --noEmit                               EXIT 0  ✅
npm run build (.next delete karke)         EXIT 0  ✅  131 pages, zero warning
prisma db push + seed                      EXIT 0  ✅

verify-seo-indexing.sh       59/59   ✅  ← naya
verify-product-admin.sh      68/68   ✅
verify-titles-and-schema.sh  44/44   ✅
verify-brand-rename.sh       51/51   ✅
verify-admin-full.sh         44/44   ✅
verify-password-features.sh  30/30   ✅
──────────────────────────────────────
TOTAL                      296/296   ✅

zip integrity   No errors detected
.env leak       koi nahi (sirf .env.example)
images          original size — 2.6 / 1.8 / 1.7 / 1.2 MB, chhui nahi
files           425
```

---

# Problem aaye to

### ❌ `! [rejected] non-fast-forward`
STEP 3 skip kiya:
```cmd
git pull --rebase origin main
git push origin main
```

### ❌ `CONFLICT (content): Merge conflict in ...`
```cmd
git checkout --theirs .
git add .
git rebase --continue
git push origin main
```

### ❌ Vercel build fail
```cmd
findstr "overrides" package.json
```
Kuch na dikhe → zip se `package.json` dobara copy kar.

### ❌ `'git' is not recognized`
`git-scm.com/download/win` → install → CMD band karke dobara khol
