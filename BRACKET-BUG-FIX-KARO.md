# 🔴 Mil Gaya — Square Bracket Wali Files Copy Nahi Ho Rahi

**10 Sep 2026** · root cause confirmed

---

# Tera screenshot ne bata diya

```
5 files changed:
  GSC-REPORT-KA-JAWAB.md          ✅
  SEARCH-CONSOLE-KYA-DAALNA-HAI.md ✅
  scripts/verify-all.sh            ✅
  scripts/verify-robots-media.sh   ✅
  src/app/robots.ts                ✅
```

**8 files badli thi, sirf 5 gayi.** Aur jo 3 chhoot gayi unme ek cheez common hai:

| File | Naam me `[ ]`? | Gaya? |
|---|---|---|
| `robots.ts` | ❌ nahi | ✅ |
| `verify-all.sh` | ❌ nahi | ✅ |
| `verify-robots-media.sh` | ❌ nahi | ✅ |
| `patna-service-data.ts` | ❌ nahi | ✅ |
| **`[area]/page.tsx`** | ✅ **haan** | ❌ |
| **`[intent]/page.tsx`** | ✅ **haan** | ❌ |
| `AreaWorkProof.tsx` | ❌ nahi | ❌ * |

\* AreaWorkProof isliye nahi gaya kyunki wo **nayi file** thi aur uske bina
`[area]/page.tsx` compile nahi hota — to shayad tune wo bhi skip kar diya, ya
robocopy ne dono ek saath chhode.

## Asli wajah

**PowerShell square bracket ko wildcard samajhta hai.**

`[area]` ka matlab PowerShell ke liye "a, r, e ya a me se koi ek letter" hota
hai — literal folder naam `[area]` nahi.

Ye **wahi bug hai** jo pehle `Test-Path` me aaya tha, jab teen dynamic-route
folders jhoothi "MISSING" dikha rahe the. Tab `-LiteralPath` se theek hua tha.

`Expand-Archive` aur `robocopy` bhi kabhi-kabhi yahi karte hain.

**Zip bilkul theek hai** — maine abhi check kiya, saari files andar hain:
```
✅ src/app/(shop)/ro-service-patna/[area]/page.tsx   (AreaWorkProof present)
✅ src/app/(shop)/[intent]/page.tsx                  (serviceShots present)
✅ src/components/home/AreaWorkProof.tsx             (imageObjectSchema present)
✅ src/lib/seo/patna-service-data.ts                 (SUB_LOCALITIES present)
```

---

# ✅ FIX — ye 3 block chala, bas

Robocopy/Expand-Archive ko chhod de. Seedha **.NET se extract** karenge, jo
bracket ko literal treat karta hai.

## BLOCK 1 — .NET se extract (bracket-safe)

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project

Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force -ErrorAction SilentlyContinue
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory(
  "$HOME\Downloads\aquanexa-project.zip",
  "$HOME\Downloads\aqp-new"
)
"extract done"
```

## BLOCK 2 — 🔴 3 missing files ko FORCE copy karo

```powershell
$src = "$HOME\Downloads\aqp-new"
$dst = "C:\Users\SUDHA\Downloads\ro-Project\Ro-project"

$files = @(
  "src\components\home\AreaWorkProof.tsx",
  "src\app\(shop)\ro-service-patna\[area]\page.tsx",
  "src\app\(shop)\[intent]\page.tsx",
  "src\lib\seo\patna-service-data.ts",
  "scripts\verify-images-titles.sh",
  "scripts\verify-new-areas.sh",
  "scripts\verify-titles-and-schema.sh",
  "scripts\verify-all.sh"
)

foreach ($f in $files) {
  $s = Join-Path $src $f
  $d = Join-Path $dst $f
  $dir = Split-Path $d -Parent
  if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  Copy-Item -LiteralPath $s -Destination $d -Force
  $size = (Get-Item -LiteralPath $d).Length
  "  copied ($size bytes): $f"
}
```

> `-LiteralPath` har jagah lagaya hai — yahi wo cheez hai jo bracket ko
> wildcard banne se rokti hai.

## BLOCK 3 — 🔴 CONTENT check karo (sirf git status pe bharosa mat karo)

```powershell
"--- ye 4 lines me match aana CHAHIYE ---"
Select-String -LiteralPath "src\components\home\AreaWorkProof.tsx" -Pattern "imageObjectSchema" | Select-Object -First 1
Select-String -LiteralPath "src\app\(shop)\ro-service-patna\[area]\page.tsx" -Pattern "AreaWorkProof" | Select-Object -First 1
Select-String -LiteralPath "src\app\(shop)\ro-service-patna\[area]\page.tsx" -Pattern "absolute: title" | Select-Object -First 1
Select-String -LiteralPath "src\lib\seo\patna-service-data.ts" -Pattern "SUB_LOCALITIES" | Select-Object -First 1
```

**Chaaron me match dikhna chahiye.** Ek bhi khali aaya to mujhe batao.

## BLOCK 4 — push

```powershell
git add -A
git status --short
```

Chahiye: **4-5 modified** aur **1-2 naye** (AreaWorkProof + verify-images-titles).

```powershell
git commit -m "SEO: per-area job photos with ImageObject schema, phone in area titles, sub-locality sections"
git push origin main
git show --stat HEAD
```

🔴 **`git show --stat HEAD` me 6-8 files dikhni chahiye.** 5 se kam dikhe to
phir se aadha push hua hai — batao.

---

# ✅ Deploy ke baad — 2 minute me khud check

Vercel 🟢 Ready → **incognito** me:

```
rokadoctor.in/ro-service-patna/kankarbagh
```

**1. Browser tab ka title dekh:**
```
ABHI :  RO Repair in Kankarbagh, Patna — ₹200 Visit | Aqua Perl
BAAD :  RO Service Kankarbagh Patna ₹200 · 8969821440
```

**2. Neeche scroll kar** → *"Kankarbagh me hamara kaam"* — **3 photos**

**3. Aur neeche** → *"Kankarbagh ke andar ye jagah bhi"*

Teeno dikhe to poora push ho gaya.

---

# 📌 Aage ke liye — hamesha ye tarika use kar

Robocopy aur Expand-Archive dono bracket pe gadbad karte hain. Is project me
**39 files** aisi hain jinke path me bracket hai — saare Next.js dynamic
routes.

**Isliye aage se sirf BLOCK 1 ka `.NET ExtractToDirectory` use kar**, aur
copy ke liye `Copy-Item -LiteralPath`.

Aur har push ke baad:
```powershell
git show --stat HEAD
```
File count match kar. Ye 5 second ka check hai aur aadha-push turant pakad
leta hai.
