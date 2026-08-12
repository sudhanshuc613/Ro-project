# 📦 Zip Upload — Step by Step (11 Aug 2026)

**Zip:** `aquanexa-project.zip` — **14 MB** (12 MB se thoda upar, ek baar mein download ho jana chahiye)
**Tera folder:** `C:\Users\SUDHA\Downloads\ro-Project\Ro-project`
**Time:** ~10 minute

---

## ⚠️ Pehle 3 rule (30 second padh le)

| ❌ Kabhi mat karna | Kyun |
|---|---|
| GitHub pe **pencil ✏️ icon** se edit | 2 baar merge conflict ho chuka hai |
| `npm audit fix --force` | pichli baar poora build tod diya tha |
| `package.json` se `overrides` block hatana | Vercel build fail ho jayega |

---

# STEP 1 — Backup (1 min, skip mat karna)

File Explorer mein:

1. `C:\Users\SUDHA\Downloads\ro-Project` folder khol
2. `Ro-project` folder pe **right-click → Copy**
3. Khali jagah pe **right-click → Paste**
4. `Ro-project - Copy` ban jayega — **isko rehne de**

Kuch bhi bigda to yahi wapas laayega.

---

# STEP 2 — Zip download + extract

1. Zip download kar → `aquanexa-project.zip`
2. Us pe **right-click → Extract All… → Extract**
3. Folder khulega jisme `src`, `public`, `prisma`, `package.json` dikhega

**Abhi copy MAT karna.** Pehle STEP 3.

---

# STEP 3 — 🔴 Git pull (SABSE ZAROORI)

CMD khol: **Windows key → `cmd` → Enter**

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
```

```cmd
git pull --rebase origin main
```

### Output ka matlab

| Dikhe | Matlab |
|---|---|
| `Already up to date.` | ✅ aage badh |
| `Successfully rebased` | ✅ aage badh |
| `Fast-forward` | ✅ aage badh |
| `cannot pull with rebase: You have unstaged changes` | 👇 neeche |

**Agar "unstaged changes" aaye:**
```cmd
git stash
git pull --rebase origin main
git stash drop
```

---

# STEP 4 — Files copy

1. Extract wale folder ke **andar** ja
2. **Ctrl + A** → **Ctrl + C**
3. `C:\Users\SUDHA\Downloads\ro-Project\Ro-project` khol
4. **Ctrl + V**
5. Popup → **"Replace the files in the destination"**

> ⚠️ **"Skip these files" mat dabana** — Replace hi karna hai.

---

# STEP 5 — Check kar ki sahi files aayi

```cmd
git status
```

**Exactly ye 13 naam dikhne chahiye** (aur kuch nahi):

```
modified:   TITLE-SEO-UPDATE.md
modified:   package-lock.json
modified:   prisma/seed.ts
modified:   scripts/verify-brand-rename.sh
modified:   scripts/verify-titles-and-schema.sh
modified:   src/app/(shop)/page.tsx
modified:   src/app/(shop)/service-patna/[area]/page.tsx
modified:   src/app/(shop)/service-patna/brand/[brand]/page.tsx
modified:   src/app/(shop)/service-patna/page.tsx
modified:   src/app/layout.tsx
modified:   src/components/home/Testimonials.tsx
modified:   src/lib/seo/schema.ts

Untracked files:
        scripts/rank-tracker.mjs
        ZIP-UPLOAD-KARO-AB.md
```

| Kya dikha | Kya kar |
|---|---|
| Upar wale naam | ✅ STEP 6 |
| `nothing to commit, working tree clean` | ❌ files copy nahi hui — STEP 4 dobara |
| **50-100 files modified** | ❌ ruk ja, mujhe screenshot bhej |

> Zyada files dikhna matlab GitHub pe kuch alag hai. Aage mat badhna.

---

# STEP 6 — Push

```cmd
git add .
```

```cmd
git commit -m "SEO: title tags optimized (48-52 chars), Review schema, rank tracker script"
```

```cmd
git push origin main
```

### Password maange to
- **Username:** `sudhanshuc613`
- **Password:** normal password **NAHI chalega** → Personal Access Token chahiye
  `github.com` → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → `repo` tick → Generate → copy

---

# STEP 7 — Vercel deploy dekh

Vercel → project **`ro-project`** → **Deployments** → sabse upar wala

| Rang | Matlab |
|---|---|
| 🟡 Building | 3-4 min ruk |
| 🟢 Ready | ✅ ho gaya |
| 🔴 Error | **Logs** khol → screenshot bhej |

---

# STEP 8 — 🔴 Neon SQL chala (ye BHOOLNA mat)

**Kyun zaroori:** Homepage aur `/service-patna` ka title **database se** aata hai, code se nahi. Code push karne se ye 2 page nahi badlenge. Baaki 56 page apne aap badal jayenge.

**Abhi live:** `RO Service in Patna — ₹200 Visit | Same-Day Repair` (50 char)
**Naya:** `RO Service in Patna — Water Purifier Repair ₹200` (48 char)

1. `console.neon.tech` khol → apna project → **SQL Editor**
2. Ye paste kar → **Run**

```sql
UPDATE seo_metadata
SET meta_title = 'RO Service in Patna — Water Purifier Repair ₹200',
    updated_at = now()
WHERE path IN ('/', '/service-patna');
```

3. `UPDATE 2` dikhna chahiye

> Ya bina SQL ke: `/admin/seo` → homepage row → title paste → Save. Wahi kaam.

---

# STEP 9 — Test kar (Incognito: Ctrl+Shift+N)

| Test | Kaise | Sahi jawab |
|---|---|---|
| Site zinda | `rokadoctor.in` | khul jaye |
| Naya title | Ctrl+U → upar `<title>` dekh | `RO Service in Patna — Water Purifier Repair ₹200` |
| Area page | `rokadoctor.in/service-patna/kankarbagh` | title mein **"RO Repair in Kankarbagh"** |
| Review schema | Ctrl+U → `Ctrl+F` → `"Review"` | mile |
| Login | `/login` phone `8969821440` | chal jaye |
| Logout | logout dabao | `rokadoctor.in` pe hi rahe |

---

# ⛔ Kuch bigad gaya to — Rollback

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git log --oneline -3
git revert HEAD --no-edit
git push origin main
```

Ya Vercel → Deployments → purana 🟢 Ready wala → **⋯ → Promote to Production** (30 second mein wapas)

---

# 🧪 Ye zip ka test report (maine chalaya, 11 Aug 2026)

```
npm run build                      EXIT 0   ✅
tsc --noEmit                       EXIT 0   ✅
verify-titles-and-schema.sh        44/44    ✅
verify-brand-rename.sh             51/51    ✅
verify-admin-full.sh               44/44    ✅
verify-password-features.sh        30/30    ✅
──────────────────────────────────────────────
TOTAL                            169/169    ✅

35/35 area pages       200 OK
21/21 brand pages      200 OK
sitemap                72 URLs
zip integrity          No errors detected
.env leak              koi nahi (sirf .env.example)
image size             original (2.6 MB / 1.7 MB / 1.2 MB — chhui nahi)
package.json overrides intact
```

**Zip:** 14,640,131 bytes (14 MB) · MD5 `2edd45b58af52843cad28eef46d7bc19` · 395 files

---

# Problem aaye to

### ❌ `'git' is not recognized`
`git-scm.com/download/win` → install → CMD band karke dobara khol

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
