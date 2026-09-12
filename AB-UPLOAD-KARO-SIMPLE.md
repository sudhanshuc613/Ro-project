# ✅ Ab Upload Karo — 3 Step

**Tera tarika sahi hai.** File Explorer se select-all → replace karna robocopy
aur Expand-Archive dono se **behtar** hai, kyunki Explorer square bracket ko
wildcard nahi samajhta. Wahi bug tha jo hum pakad rahe the.

Bas ek check pehle — kyunki pata nahi tune nayi zip se copy kiya ya purane
`aqp-new` folder se.

---

# 🔴 STEP 1 — Size check (ye gate hai, skip mat karna)

PowerShell me:

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project

$want = @{
  "src\lib\seo\patna-service-data.ts"               = 140115
  "src\components\home\AreaWorkProof.tsx"           =   7852
  "src\app\(shop)\ro-service-patna\[area]\page.tsx" =  28123
  "src\app\(shop)\[intent]\page.tsx"                =  19953
  "scripts\verify-images-titles.sh"                 =  10318
}
$bad = 0
foreach ($k in $want.Keys) {
  $p = Join-Path (Get-Location) $k
  if (Test-Path -LiteralPath $p) {
    $s = (Get-Item -LiteralPath $p).Length
    if ($s -eq $want[$k]) { "  OK      $s  $k" }
    else { "  WRONG   $s  (chahiye $($want[$k]))  $k"; $bad++ }
  } else { "  MISSING       $k"; $bad++ }
}
""
"BAD COUNT: $bad"
```

## Result ka matlab

**`BAD COUNT: 0`** → sab sahi, STEP 2 pe jao ✅

**`BAD COUNT` 1 ya zyada** → 🔴 **RUKO.** Purani files hain. Ye chala:

```powershell
git checkout -- .
git clean -fd
cmd /c rmdir /s /q "%USERPROFILE%\Downloads\aqp-new"
```

Phir `aquaperl-FINAL-11sep.zip` ko **fresh folder** me extract karke dobara
copy karo, aur STEP 1 phir se chalao.

> 🔴 **Sabse zaroori: `patna-service-data.ts` = 140,115 bytes.**
> Ye 73 areas wali file hai. 88,777 bytes wali purani hai (55 areas) — usse
> commit karne pe live site se **18 area delete ho jayenge**.

---

# STEP 2 — Git status dekho

```powershell
"Modified: " + (git status --short | Select-String '^ M').Count
"Naye:     " + (git status --short | Select-String '^\?\?').Count
""
"--- .env ya node_modules to nahi ja raha? ---"
git status --short | Select-String '\.env$|node_modules'
"--- (upar khali = sahi) ---"
```

**Chahiye:**
```
Modified: 5 se 9
Naye:     2 se 4
.env wali line KHALI
```

🔴 `.env` ya `node_modules` dikhe to ruk jao, mujhe batao.

🟡 `Modified: 0` aaye to files copy hi nahi hui — STEP 1 ka recovery chalao.

---

# STEP 3 — Push

```powershell
git add -A
git commit -m "SEO: per-area job photos with ImageObject schema, phone in area titles, sub-locality sections"
git push origin main
git show --stat HEAD
```

## `git show --stat HEAD` me kya dikhna chahiye

**7 se 10 files.** Aur inme ye zaroor hon:

```
src/components/home/AreaWorkProof.tsx              (naya)
src/app/(shop)/ro-service-patna/[area]/page.tsx
src/app/(shop)/[intent]/page.tsx
src/lib/seo/patna-service-data.ts
scripts/verify-images-titles.sh                    (naya)
```

🔴 **5 se kam file dikhe = phir aadha push hua.** Screenshot bhej dena.

---

# ✅ STEP 4 — Deploy ke baad (2-3 min wait)

Vercel → `ro-project` → 🟢 **Ready**

Phir **incognito** (Ctrl+Shift+N) me:

```
rokadoctor.in/ro-service-patna/kankarbagh
```

Ye **3 cheez** dikhni chahiye:

**1. Browser tab ka title**
```
ABHI :  RO Repair in Kankarbagh, Patna — ₹200 Visit | Aqua Perl
BAAD :  RO Service Kankarbagh Patna ₹200 · 8969821440
```

**2. Neeche scroll** → *"Kankarbagh me hamara kaam"* — **3 photos**

**3. Aur neeche** → *"Kankarbagh ke andar ye jagah bhi"*

Aur ye page bhi khulna chahiye (73 areas ka proof):
```
rokadoctor.in/ro-service-patna/machhuatoli
```

---

# 🟡 Aur ek kaam — GSC me

`robots.txt` fix pichhle push me **live ho chuka hai**. Ab Google ko batao:

```
Search Console → Pages → "Blocked by robots.txt" (10 pages)
→ upar "VALIDATE FIX" button dabao
```

1-2 hafte me tere 48 product images Google ke liye khul jayengi.

---

# 📌 Aage se — tera tarika hi rakh, bas ye 2 cheez

**1. Zip hamesha KHALI folder me extract karo.** Purane folder ke upar extract
karne se purani files bachi rah jaati hain — wahi abhi hua tha.

**2. Copy ke baad ye ek line chalao:**

```powershell
Get-ChildItem -LiteralPath "src\lib\seo\patna-service-data.ts" | Select-Object Length
```

Ye file sabse zyada badalti hai, to yahi sabse achha indicator hai. Jo number
main zip ke saath bataun, wahi aana chahiye. Abhi: **140115**.
