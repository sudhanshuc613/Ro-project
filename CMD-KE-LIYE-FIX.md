# 🔴 Tu CMD me hai — isliye error aa raha hai

Screenshot me dikha:
```
'Write-Host' is not recognized as an internal or external command
'$p' is not recognized as an internal or external command
-match was unexpected at this time
```

**Ye teri galti nahi hai.** Maine PowerShell wale commands diye the, aur tu **CMD** me chala raha hai.

| | CMD (kaala window) | PowerShell |
|---|---|---|
| `Write-Host` | ❌ nahi chalta | ✅ chalta |
| `$p = ...` | ❌ nahi chalta | ✅ chalta |
| `-match` | ❌ nahi chalta | ✅ chalta |
| `git ...` | ✅ chalta | ✅ chalta |

**Achhi baat:** verify wale commands zaroori nahi hain — **main khud check kar leta hoon.** Tujhe sirf 4 `git` command chalani hain, aur wo CMD me bhi chalti hain.

---

# ✅ Sirf ye 4 line — CMD me hi chalegi

Jo window abhi khuli hai, usi me. Ek-ek line, har line ke baad Enter.

## Line 1
```
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
```

## Line 2 — 🔴 sabse zaroori
```
git stash pop
```

### Dikhna chahiye
```
On branch main
Changes not staged for commit:
        modified:   prisma/seed.ts
        modified:   src/components/admin/ProductForm.tsx
        modified:   src/components/admin/Sidebar.tsx
        modified:   src/lib/seo/metadata.ts
        modified:   src/lib/seo/schema.ts
        ...
Dropped refs/stash@{0} (abc123...)
```

**`Dropped refs/stash` dikha = ho gaya ✅**

### Agar CONFLICT aaye
```
CONFLICT (content): Merge conflict in src/lib/seo/schema.ts
```
Ghabrana nahi, ye 2 line chala:
```
git checkout --theirs .
```
```
git add .
```

## Line 3 — check
```
git status --short
```

**`M` wali lines dikhni chahiye** — kam se kam 7-12.

Agar **kuch bhi na dikhe** → mujhe screenshot bhej, aage mat badhna.

## Line 4, 5, 6 — push
```
git add .
```
```
git commit -m "fix: restore modified files from stash"
```
```
git push origin main
```

**`main -> main` dikha = ho gaya ✅**

---

# Bas itna. Verify main kar dunga.

Push hone ke baad mujhe bol dena — **"push ho gaya"**. Main live check karke bata dunga sab sahi hai ya nahi. Tujhe koi verify command chalane ki zaroorat nahi.

---

# 📋 Copy-paste ready (CMD ke liye)

```
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git stash pop
git status --short
```

**← yahan ruk ke dekh, `M` lines aayi ya nahi**

```
git add .
git commit -m "fix: restore modified files from stash"
git push origin main
```

---

# 🔍 Abhi ki sthiti (maine abhi check kiya)

## ✅ Chal raha hai
```
rokadoctor.in                            200 OK
4 purane URL -> 301 redirect             ✅ (ranking bach gayi)
IndexNow key file                        ✅
Admin ke naye pages bane hue             ✅
```

## ❌ stash pop ke baad aayega
```
lowercase slug grand-forest-...          abhi 404
category page buying guide               abhi 985 words
/products ItemList schema                abhi nahi
AquaPearl ka title                       abhi 22 chars
sidebar me Competitor Watch link         abhi nahi
```

**GitHub pe abhi bhi 6 files purani hain** — maine check kiya:
```
❌ src/lib/seo/schema.ts
❌ src/lib/seo/metadata.ts
❌ src/components/admin/Sidebar.tsx
❌ src/components/admin/ProductForm.tsx
❌ src/app/(shop)/products/page.tsx
❌ src/app/(shop)/category/[slug]/page.tsx
```

Ye sab **tere stash ke andar** hain. `git stash pop` se wapas aa jayengi.

---

# 📍 Admin panel — abhi bhi khul jayega

Sidebar me link fix ke baad aayega, par page abhi bhi hai:

1. `rokadoctor.in/admin` khol → login (phone `8969821440`)
2. Address bar me type kar:
   ```
   rokadoctor.in/admin/competitors
   ```
3. Page khulega. **"Core service"** chip pe click → **"🔍 Check karo"**

---

# 💡 Aage ke liye — PowerShell kaise kholte hain

CMD me PowerShell wale commands kabhi nahi chalenge. Agar future me chahiye:

**Windows key** dabao → `powershell` type karo → **Enter**

Farak pehchanne ka tarika:
```
CMD          →  C:\Users\SUDHA>
PowerShell   →  PS C:\Users\SUDHA>     ← shuru me "PS" likha hota hai
```

Par abhi zaroorat nahi — CMD se kaam ho jayega.
