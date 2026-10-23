# ============================================================
#  AQUA PERL — APPLY.ps1
#  Ye script naya code project folder me khud daal degi,
#  verify karegi, aur GitHub pe push kar degi.
#  Manual copy-paste ki zaroorat NAHI.
#
#  CHALANE KA TARIKA (PowerShell me, is folder ke andar se):
#      powershell -ExecutionPolicy Bypass -File .\APPLY.ps1
# ============================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "   AQUA PERL  -  AUTO APPLY + PUSH" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# ---------- 1. Ye script kahan se chal rahi hai ----------
$HERE = Split-Path -Parent $MyInvocation.MyCommand.Definition
Write-Host "[1] Naya code yahan hai :" -ForegroundColor Yellow
Write-Host "    $HERE"

if (-not (Test-Path -LiteralPath "$HERE\src")) {
    Write-Host ""
    Write-Host "  RUKO. Is folder me 'src' nahi mila." -ForegroundColor Red
    Write-Host "  Matlab aap script ko galat jagah se chala rahe ho." -ForegroundColor Red
    Write-Host "  Zip ko Extract All karo, us folder ke ANDAR jao, phir chalao." -ForegroundColor Red
    Write-Host ""
    Read-Host "Enter dabao band karne ke liye"
    exit 1
}

# ---------- 2. Project folder dhoondo ----------
$PROJ = "C:\Users\SUDHA\Downloads\ro-Project\Ro-project"

if (-not (Test-Path -LiteralPath "$PROJ\package.json")) {
    Write-Host ""
    Write-Host "  Default project folder nahi mila:" -ForegroundColor Red
    Write-Host "  $PROJ" -ForegroundColor Red
    Write-Host ""
    $PROJ = Read-Host "  Apne project ka poora path likho (jahan package.json hai)"
}

if (-not (Test-Path -LiteralPath "$PROJ\package.json")) {
    Write-Host "  Phir bhi package.json nahi mila. Band kar raha hu." -ForegroundColor Red
    Read-Host "Enter dabao"
    exit 1
}

Write-Host ""
Write-Host "[2] Project folder mila :" -ForegroundColor Yellow
Write-Host "    $PROJ"

# ---------- 3. Backup branch ----------
Write-Host ""
Write-Host "[3] Backup branch bana raha hu..." -ForegroundColor Yellow
Push-Location $PROJ
$stamp = Get-Date -Format "ddMMM-HHmm"
git branch "backup-$stamp" 2>&1 | Out-Null
Write-Host "    backup-$stamp  (kuch bigda to yahan se wapis aa sakte ho)" -ForegroundColor Green
Pop-Location

# ---------- 4. PEHLE ka naap ----------
Write-Host ""
Write-Host "[4] Copy se PEHLE ka naap:" -ForegroundColor Yellow
$before = @{}
$checkList = @(
  "src\components\service\NearMeBlock.tsx",
  "src\components\service\AreaKeywordBlock.tsx",
  "src\app\(shop)\page.tsx",
  "src\app\(shop)\ro-service-patna\[area]\page.tsx",
  "src\components\layout\Navbar.tsx",
  "src\lib\seo\schema.ts",
  "src\lib\seo\blog-data.ts",
  "src\lib\seo\content-dates.ts",
  "scripts\jsonld-parents.py",
  "scripts\verify-jsonld-parents.sh",
  "scripts\verify-all.sh",
  "scripts\admin-deep.py",
  "scripts\verify-admin-deep.sh",
  "src\lib\constants.ts",
  "src\lib\seo\gbp-overrides.ts",
  "src\lib\settings.ts",
  "src\components\admin\SettingsForm.tsx",
  "src\app\(shop)\ro-problem\[symptom]\page.tsx",
  "scripts\gbp-consistency.py",
  "scripts\verify-gbp-consistency.sh",
  "src\app\(shop)\contact\page.tsx",
  "src\components\ui\TrustBadges.tsx",
  "src\components\home\QuickBookForm.tsx",
  "scripts\browser-check.mjs",
  "scripts\verify-browser.sh",
  "scripts\check-async-in-client.mjs",
  "scripts\verify-titles-and-schema.sh",
  "src\lib\geo\nearest-area.ts",
  "src\components\service\NearMeResolver.tsx",
  "scripts\near-me-grid.py",
  "scripts\near-me-selftest.mts",
  "scripts\verify-near-me.sh",
  "src\app\api\products\route.ts",
  "src\app\api\products\[id]\route.ts",
  "scripts\product-duplicate-test.py",
  "scripts\verify-product-duplicate.sh"
)
foreach ($f in $checkList) {
    $p = Join-Path $PROJ $f
    if (Test-Path -LiteralPath $p) { $sz = (Get-Item -LiteralPath $p).Length } else { $sz = 0 }
    $before[$f] = $sz
    $nm = Split-Path $f -Leaf
    if ($sz -eq 0) { Write-Host ("    {0,-28} NAHI HAI" -f $nm) -ForegroundColor DarkGray }
    else           { Write-Host ("    {0,-28} {1} bytes" -f $nm, $sz) }
}

# ---------- 5. ROBOCOPY ----------
# robocopy use kar rahe hain kyunki Copy-Item PowerShell me
# [intent] [area] [slug] jaise bracket wale folder ko WILDCARD samajh
# ke CHUP-CHAAP CHHOD DETA HAI. Yahi pichli baar fail hua tha.
# /E = sab subfolder. DELETE kuch nahi karta, sirf add + overwrite.

Write-Host ""
Write-Host "[5] File copy kar raha hu (robocopy)..." -ForegroundColor Yellow

$folders = @("src", "prisma", "scripts", "public", "mockup", "db", "docs")
foreach ($d in $folders) {
    if (Test-Path -LiteralPath "$HERE\$d") {
        robocopy "$HERE\$d" "$PROJ\$d" /E /NFL /NDL /NJH /NJS /NC /NS /R:2 /W:1 | Out-Null
        if ($LASTEXITCODE -ge 8) {
            Write-Host "    $d  -> ERROR (robocopy code $LASTEXITCODE)" -ForegroundColor Red
        } else {
            Write-Host "    $d  -> OK" -ForegroundColor Green
        }
    }
}

$rootFiles = @("package.json","package-lock.json","next.config.mjs","tsconfig.json",
               "tailwind.config.ts","postcss.config.mjs","vercel.json",
               "next-env.d.ts",".nvmrc",".npmrc",".gitignore")
foreach ($f in $rootFiles) {
    if (Test-Path -LiteralPath "$HERE\$f") {
        Copy-Item -LiteralPath "$HERE\$f" -Destination (Join-Path $PROJ $f) -Force
    }
}
Write-Host "    root config files -> OK" -ForegroundColor Green

# saare .md report files bhi
Get-ChildItem -LiteralPath $HERE -Filter "*.md" | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $PROJ $_.Name) -Force
}
Write-Host "    .md report files  -> OK" -ForegroundColor Green

# ---------- 5b. IMAGE SURAKSHA ----------
Write-Host ""
Write-Host "[5b] Aapki images chhedi to nahi gayi:" -ForegroundColor Yellow
$imgExpect = @{
  "public\banners\service-tech.png"        = 2706298
  "public\banners\hero-technician.png"     = 1847335
  "public\banners\patna-service-hero.png"  = 1538045
  "public\products\ro-commercial.png"      = 1707554
  "public\products\ro-domestic.png"        = 1186500
}
$imgBad = 0
foreach ($k in $imgExpect.Keys) {
    $p = Join-Path $PROJ $k
    if (Test-Path -LiteralPath $p) { $sz = (Get-Item -LiteralPath $p).Length } else { $sz = 0 }
    $nm = Split-Path $k -Leaf
    if ($sz -eq $imgExpect[$k]) { Write-Host ("    {0,-26} {1} bytes  SAHI" -f $nm,$sz) -ForegroundColor Green }
    else { Write-Host ("    {0,-26} {1}  GALAT (chahiye {2})" -f $nm,$sz,$imgExpect[$k]) -ForegroundColor Red; $imgBad = $imgBad + 1 }
}

# ---------- 6. BAAD ka naap ----------
Write-Host ""
Write-Host "[6] Copy ke BAAD ka naap:" -ForegroundColor Yellow
$expected = @{
  "src\components\service\NearMeBlock.tsx"           = 11858
  "src\components\service\AreaKeywordBlock.tsx"      = 14201
  "src\app\(shop)\page.tsx"                          = 18336
  "src\app\(shop)\ro-service-patna\[area]\page.tsx"  = 34054
  "src\components\layout\Navbar.tsx"                 = 19454
  "src\lib\seo\schema.ts"                            = 26209
  "src\lib\seo\blog-data.ts"                         = 36539
  "src\lib\seo\content-dates.ts"                     = 6504
  "scripts\jsonld-parents.py"                        = 19781
  "scripts\verify-jsonld-parents.sh"                 = 2676
  "scripts\verify-all.sh"                            = 1663
  "scripts\admin-deep.py"                            = 7838
  "scripts\verify-admin-deep.sh"                     = 2529
  "src\lib\constants.ts"                             = 16393
  "src\lib\seo\gbp-overrides.ts"                     = 5372
  "src\lib\settings.ts"                              = 9938
  "src\components\admin\SettingsForm.tsx"            = 28178
  "src\app\(shop)\ro-problem\[symptom]\page.tsx"     = 17492
  "scripts\gbp-consistency.py"                       = 8883
  "scripts\verify-gbp-consistency.sh"                = 2527
  "src\app\(shop)\contact\page.tsx"                  = 12844
  "src\components\ui\TrustBadges.tsx"                = 3027
  "src\components\home\QuickBookForm.tsx"            = 12575
  "scripts\browser-check.mjs"                        = 6885
  "scripts\verify-browser.sh"                        = 3154
  "scripts\check-async-in-client.mjs"                = 2703
  "scripts\verify-titles-and-schema.sh"              = 8454
  "src\lib\geo\nearest-area.ts"                      = 6053
  "src\components\service\NearMeResolver.tsx"        = 11142
  "scripts\near-me-grid.py"                          = 9750
  "scripts\near-me-selftest.mts"                     = 5466
  "scripts\verify-near-me.sh"                        = 7126
  "src\app\api\products\route.ts"                    = 12486
  "src\app\api\products\[id]\route.ts"               = 11653
  "scripts\product-duplicate-test.py"                = 10699
  "scripts\verify-product-duplicate.sh"              = 2567
}
$fail = 0
foreach ($f in $checkList) {
    $p = Join-Path $PROJ $f
    if (Test-Path -LiteralPath $p) { $sz = (Get-Item -LiteralPath $p).Length } else { $sz = 0 }
    $want = $expected[$f]
    $nm = Split-Path $f -Leaf
    if ($sz -eq $want) {
        Write-Host ("    {0,-28} {1} bytes   SAHI" -f $nm, $sz) -ForegroundColor Green
    } else {
        Write-Host ("    {0,-28} {1} bytes   GALAT (chahiye {2})" -f $nm, $sz, $want) -ForegroundColor Red
        $fail = $fail + 1
    }
}

# ---------- 7. NAVBAR SURAKSHA ----------
Write-Host ""
Write-Host "[7] Navbar suraksha jaanch:" -ForegroundColor Yellow
$navPath = Join-Path $PROJ "src\components\layout\Navbar.tsx"
$navSize = (Get-Item -LiteralPath $navPath).Length
$navTxt  = [IO.File]::ReadAllText($navPath)
$navHits = ([regex]::Matches($navTxt, "isServicePage")).Count
if ($navSize -eq 19454) { Write-Host "    bytes 19454          SAHI" -ForegroundColor Green }
else { Write-Host "    bytes $navSize   GALAT" -ForegroundColor Red; $fail = $fail + 1 }
if ($navHits -eq 0) { Write-Host "    isServicePage = 0    SAHI" -ForegroundColor Green }
else { Write-Host "    isServicePage = $navHits   GALAT" -ForegroundColor Red; $fail = $fail + 1 }

if ($fail -gt 0) {
    Write-Host ""
    Write-Host "  $fail cheez galat hai. PUSH NAHI karunga." -ForegroundColor Red
    Write-Host "  Ye screen ka photo bhejo." -ForegroundColor Red
    Write-Host ""
    Read-Host "Enter dabao"
    exit 1
}

# ---------- 8. GIT ----------
Write-Host ""
Write-Host "[8] Git kya dekh raha hai:" -ForegroundColor Yellow
Push-Location $PROJ
git add -A 2>&1 | Out-Null
$changed = @(git status --porcelain)
Write-Host "    $($changed.Count) file badli hai" -ForegroundColor Cyan

if ($changed.Count -eq 0) {
    Write-Host ""
    Write-Host "  RUKO. Git keh raha hai kuch nahi badla." -ForegroundColor Red
    Write-Host "  Matlab aapke project me ye code PEHLE SE hai," -ForegroundColor Red
    Write-Host "  ya aap galat folder me ho." -ForegroundColor Red
    Write-Host "  Abhi ka folder: $PROJ" -ForegroundColor Red
    Write-Host ""
    Pop-Location
    Read-Host "Enter dabao"
    exit 1
}

Write-Host ""
Write-Host "    Badli hui files (pehli 25):" -ForegroundColor Cyan
$changed | Select-Object -First 25 | ForEach-Object { Write-Host "      $_" }
if ($changed.Count -gt 25) { Write-Host "      ... aur $($changed.Count - 25) aur" }

Write-Host ""
Write-Host "[9] Commit + push kar raha hu..." -ForegroundColor Yellow
git commit -m "FIX: product duplicate SKU/slug ab saaf batata hai kaun sa field aur kaun sa product (soft-delete trap included)" 2>&1 | Out-Null

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "    branch: $branch" -ForegroundColor Cyan
git push origin $branch 2>&1 | ForEach-Object { Write-Host "    $_" }

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "   HO GAYA" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Ab Vercel apne aap deploy karega (2-3 minute)." -ForegroundColor White
Write-Host "  vercel.com -> ro-project -> Deployments dekho." -ForegroundColor White
Write-Host ""
Write-Host "  Deploy hone ke baad mujhe bolo, main live check karunga." -ForegroundColor White
Write-Host ""
Pop-Location
Read-Host "Enter dabao band karne ke liye"
