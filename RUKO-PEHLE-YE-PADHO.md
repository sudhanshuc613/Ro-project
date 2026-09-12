# 🔴 RUKO — COMMIT MAT KARNA

**Tere copy me PURANI files aa gayi hain. Commit kiya to live site tootegi.**

---

# Byte count ne bata diya

Tere screenshot me jo size aaye, wo naye zip se **match nahi karte**:

| File | Tere paas aaya | Hona chahiye | |
|---|---|---|---|
| `AreaWorkProof.tsx` | **0 bytes** | 7,852 | ❌ file thi hi nahi |
| `verify-images-titles.sh` | **0 bytes** | 10,318 | ❌ file thi hi nahi |
| `[area]/page.tsx` | 25,947 | **28,123** | ❌ purani |
| `[intent]/page.tsx` | 19,486 | **19,953** | ❌ purani |
| **`patna-service-data.ts`** | **88,777** | **140,115** | 🔴 **bahut purani** |
| `verify-new-areas.sh` | 13,523 | 13,882 | ❌ purani |
| `verify-titles-and-schema.sh` | 6,253 | 6,826 | ❌ purani |
| `verify-all.sh` | 1,180 | 1,364 | ❌ purani |

## 🔴 Sabse khatarnak — patna-service-data.ts

```
Tera    :  88,777 bytes
Chahiye : 140,115 bytes   (73 areas wali)
```

**88 KB wali file me 55 areas hain, 73 nahi.**

Agar tu ye commit kar de to live site se **18 area DELETE ho jayenge**:
```
Machhuatoli · Sri Krishna Puri · Shivpuri · Keshari Nagar · Lohanipur
Khemnichak · Sipara · Rupaspur · AG Colony · Bataganj · Marufganj
Jakkanpur · Begampur · Naya Tola · Bairia · Chandmari · Sadikpur · Anandpur
```

Aur `SUB_LOCALITIES` bhi chala jayega.

## Kyun hua

`$HOME\Downloads\aqp-new` folder me **purana extract pada tha**. Jo
`Remove-Item` chalaya wo shayad chala nahi (ya bracket wale folders delete
nahi hue), aur naya extract usi ke upar hua — purani files bachi rah gayi.

`0 bytes` wali do files to naye zip me hi hain, purane me thi hi nahi.

---

# ✅ RECOVERY — 4 block, dhyan se

## BLOCK 1 — 🔴 Pehle jo galat copy hua use WAPAS karo

Tune abhi commit nahi kiya, to git se saaf wapas aa jayega:

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project

git status --short
```

Agar kuch modified dikhe to sab revert karo:

```powershell
git checkout -- .
git clean -fd
git status --short
```

**Ab `git status --short` bilkul khali hona chahiye.** Ye tere repo ko wapas
usi haalat me le aayega jo aakhri push ke baad tha (robots.txt fix wala).

## BLOCK 2 — Purana extract folder POORI TARAH mitao

```powershell
cmd /c rmdir /s /q "%USERPROFILE%\Downloads\aqp-new"
Test-Path "$HOME\Downloads\aqp-new"
```

**`False` aana chahiye.** `cmd /c rmdir` isliye kyunki PowerShell ka
`Remove-Item` bracket wale folders pe atak jata hai — wahi bug jo hum pakad
chuke hain.

`True` aaye to File Explorer se manually delete kar de.

## BLOCK 3 — NAYI zip download karo aur extract karo

🔴 **Naya file naam hai** — `aquaperl-FINAL-11sep.zip`
Purani `aquanexa-project.zip` ko Downloads se **delete kar de**, warna phir
confusion hoga.

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory(
  "$HOME\Downloads\aquaperl-FINAL-11sep.zip",
  "$HOME\Downloads\aqp-new"
)
"extract done"
```

### 🔴 Ab SIZE check karo — extract sahi hua ya nahi

```powershell
$src = "$HOME\Downloads\aqp-new"
$want = @{
  "src\lib\seo\patna-service-data.ts"                  = 140115
  "src\components\home\AreaWorkProof.tsx"              =   7852
  "src\app\(shop)\ro-service-patna\[area]\page.tsx"    =  28123
  "src\app\(shop)\[intent]\page.tsx"                   =  19953
  "scripts\verify-images-titles.sh"                    =  10318
}
$bad = 0
foreach ($k in $want.Keys) {
  $p = Join-Path $src $k
  if (Test-Path -LiteralPath $p) {
    $s = (Get-Item -LiteralPath $p).Length
    if ($s -eq $want[$k]) { "  OK    $s  $k" }
    else { "  WRONG $s (chahiye $($want[$k]))  $k"; $bad++ }
  } else { "  MISSING  $k"; $bad++ }
}
""
"BAD COUNT: $bad"
```

🔴 **`BAD COUNT: 0` aana chahiye.** Kuch bhi aur aaye to **mujhe batao,
aage mat badho.**

## BLOCK 4 — Copy karo aur size dobara check karo

```powershell
$src = "$HOME\Downloads\aqp-new"
$dst = "C:\Users\SUDHA\Downloads\ro-Project\Ro-project"

# poora project copy — robocopy nahi, .NET-extracted source se
Get-ChildItem -LiteralPath $src -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring($src.Length + 1)
  $d   = Join-Path $dst $rel
  $dir = Split-Path $d -Parent
  if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  Copy-Item -LiteralPath $_.FullName -Destination $d -Force
}
"copy done"
```

Ab destination pe size verify:

```powershell
$dst = "C:\Users\SUDHA\Downloads\ro-Project\Ro-project"
$want = @{
  "src\lib\seo\patna-service-data.ts"               = 140115
  "src\components\home\AreaWorkProof.tsx"           =   7852
  "src\app\(shop)\ro-service-patna\[area]\page.tsx" =  28123
  "src\app\(shop)\[intent]\page.tsx"                =  19953
  "scripts\verify-images-titles.sh"                 =  10318
}
$bad = 0
foreach ($k in $want.Keys) {
  $p = Join-Path $dst $k
  if (Test-Path -LiteralPath $p) {
    $s = (Get-Item -LiteralPath $p).Length
    if ($s -eq $want[$k]) { "  OK    $s  $k" } else { "  WRONG $s  $k"; $bad++ }
  } else { "  MISSING  $k"; $bad++ }
}
""
"BAD COUNT: $bad"
```

🔴 **`BAD COUNT: 0`** — tabhi aage.

## BLOCK 5 — Push

```powershell
git add -A
git status --short
```

Chahiye: **5-8 modified**, **2-3 naye**, koi `.env` nahi.

```powershell
git commit -m "SEO: per-area job photos with ImageObject schema, phone in area titles, sub-locality sections"
git push origin main
git show --stat HEAD
```

**`git show --stat` me 7-9 files dikhni chahiye.**

---

# ✅ Deploy ke baad — 30 second ka check

Vercel 🟢 Ready → incognito me `rokadoctor.in/ro-service-patna/machhuatoli`

- Page khulta hai? → 73 areas gaye ✅
- Tab title: `RO Service Machhuatoli Patna ₹200 · 8969821440` ✅
- Neeche 3 photos ✅

Aur `rokadoctor.in/sitemap.xml` → **126 URLs**

---

# 📌 Aage se — hamesha size check

Ye ek command sab bata deti hai:

```powershell
Get-ChildItem -LiteralPath "src\lib\seo\patna-service-data.ts" | Select-Object Length
```

**140115** = 73 areas wali sahi file.
Isse chhoti = purani file, commit mat karna.
