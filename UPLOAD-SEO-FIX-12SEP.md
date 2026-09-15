# Upload karo — SEO FIX, 12 Sep 2026

**Zip:** `aquaperl-SEO-FIX-12SEP.zip` · 14.43 MB · MD5 `741acc5ca0b99537cc16e233c32cf0bd` · 526 files

---

## Test report — asli numbers

```
Build               : EXIT 0 · 185 pages · ZERO warnings
Test suite          : 1033 / 1033 PASS · 0 FAIL   (15 scripts, naya H1 test 27 pass)
Zip vs working dir  : 0 differences
Secrets in zip      : 0 (sirf .env.example placeholders)
Bracket files       : 19 — sab sahi
Images              : sab original size, ek byte nahi chhua
                      service-tech.png    2,706,298
                      hero-technician.png 1,847,335
                      ro-commercial.png   1,707,554
                      ro-domestic.png     1,186,500
```

Verify-all breakdown:
```
verify-h1-keyword          27  ← NAYA
verify-images-titles       39
verify-robots-media        24
verify-forms-and-features  83
verify-area-depth          64
verify-new-areas          140
verify-service-intent     165
verify-seo-packages        94
verify-ux-upgrade          99
verify-seo-indexing        59
verify-product-admin       68
verify-titles-and-schema   45
verify-brand-rename        51
verify-admin-full          44   ← admin login + 15 admin page + 9 account page
verify-password-features   31
─────────────────────────────
TOTAL                    1033  FAIL 0
```

---

## 32 files badlengi (22 badli + 10 nayi)

⚠️ **Pichhle 2 zip push nahi hue the**, isliye teenon ka kaam ek saath ja raha hai:
Google Ads tracking + GBP 5.0/50 fix + aaj ka SEO fix.

```
[BADLI] src/components/home/ServiceHero.tsx          ← H1 BUG FIX (asli cheez)
[BADLI] src/lib/seo/service-intent-data.ts           ← naya page (78,622 bytes)
[BADLI] src/lib/constants.ts                         ← 5.0 / 50 + ads IDs
[BADLI] src/lib/social-proof.ts
[BADLI] src/lib/seo/schema.ts
[BADLI] src/lib/seo/geo-answers.ts
[BADLI] src/lib/seo/blog-data.ts
[BADLI] src/components/analytics/Analytics.tsx       ← Google Ads conversion
[BADLI] src/components/home/QuickBookForm.tsx        ← Google Ads conversion
[BADLI] src/components/home/ServiceBookingForm.tsx   ← Google Ads conversion
[BADLI] src/components/home/Testimonials.tsx
[BADLI] src/components/admin/ReviewTracker.tsx
[BADLI] src/app/(shop)/page.tsx
[BADLI] src/app/(shop)/about/[person]/page.tsx
[BADLI] src/app/(shop)/ro-service-patna-faq/page.tsx
[BADLI] src/app/(shop)/ro-service-patna/[area]/page.tsx
[BADLI] scripts/verify-all.sh
[BADLI] scripts/verify-area-depth.sh
[BADLI] scripts/verify-brand-rename.sh
[BADLI] scripts/verify-service-intent.sh
[BADLI] scripts/verify-titles-and-schema.sh
[BADLI] scripts/verify-ux-upgrade.sh

[NAYI]  scripts/verify-h1-keyword.sh                 ← bug dobara na ho iske liye
[NAYI]  MERI-GALTI-AUR-FIX-12-SEP.md
[NAYI]  ADS-BUDGET-AUR-GBP-PLAN-12-SEP.md
[NAYI]  FACEBOOK-ADS-KA-SACH-12-SEP.md
[NAYI]  GBP-KA-ASLI-SACH-12-SEP.md
[NAYI]  UPLOAD-KARO-12-SEP.md
[NAYI]  ADS-KA-ASLI-SACH.md
[NAYI]  AB-UPLOAD-KARO-SIMPLE.md
[NAYI]  RUKO-PEHLE-YE-PADHO.md
[NAYI]  UPLOAD-SEO-FIX-12SEP.md
```

**`patna-service-data.ts` list me NAHI hai — sahi hai.** Wo change nahi hui,
140,115 bytes waisi ki waisi. 73 area page safe hain.

---

## Upload steps

### 1. Extract
`aquaperl-SEO-FIX-12SEP.zip` → **Right-click → Extract All** → `C:\Users\SUDHA\Downloads\aqp-seo\`

⚠️ PowerShell `Expand-Archive` **mat** — `[area]`, `[intent]` wali files skip ho jati hain.

### 2. Copy
Extract folder me jao → **Ctrl+A** → **Ctrl+C**
→ `C:\Users\SUDHA\Downloads\ro-Project\Ro-project` me **Ctrl+V**
→ **"Replace the files in the destination"**

### 3. Verify (PowerShell, `-LiteralPath` ke saath)

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
$want = @{
  "src\lib\seo\service-intent-data.ts"  = 78622
  "src\components\home\ServiceHero.tsx" = 15834
  "src\lib\constants.ts"                = 11764
  "src\lib\seo\patna-service-data.ts"   = 140115
  "scripts\verify-h1-keyword.sh"        = 6701
}
foreach ($k in $want.Keys) {
  $sz = (Get-Item -LiteralPath $k).Length
  if ($sz -eq $want[$k]) { Write-Host "OK   $k ($sz)" -f Green }
  else { Write-Host "GALAT $k — mila $sz, chahiye $($want[$k])" -f Red }
}
```

**Agar `patna-service-data.ts` 88,777 dikhe to ROKO** — purani 55-area file hai,
18 live area page delete ho jayenge.

### 4. Push
GitHub Desktop → **32 files** dikhengi → commit:
```
fix: H1 keyword bug + new /ro-service-in-patna head-term page + GBP 5.0/50
```
→ **Commit to main** → **Push origin**

### 5. Confirm
```powershell
git show --stat HEAD
```
**32 files changed** dikhna chahiye. Kam dikhe to aadha push hua — bata dena.

---

## Deploy ke baad — 3 cheez khud check kar (Ctrl+Shift+R)

| # | Kahan | Kya dikhna chahiye |
|---|---|---|
| 1 | `rokadoctor.in` | Hero: **"RO Service & Repair in Patna"** — `RepairNow` nahi |
| 2 | `rokadoctor.in/ro-service-in-patna` | **NAYA PAGE** khulna chahiye, H1 = "RO Service in Patna" |
| 3 | `rokadoctor.in` | Badge: **⭐ 5.0 · 50 Google reviews** |

Teeno sahi = deploy safal.

---

## Deploy ke TURANT baad — GSC me ye karo

```
search.google.com/search-console
→ URL Inspection → https://rokadoctor.in/ro-service-in-patna
→ Request Indexing

→ URL Inspection → https://rokadoctor.in
→ Request Indexing        (H1 fix Google ko dobara dikhana hai)

→ Sitemaps → https://rokadoctor.in/sitemap.xml → Submit
```

---

## Uske baad — ye sabse bada kaam bacha hai (₹0)

`ro service in patna` ke top 10 me **4 directory** hain jin pe hum nahi hain.
Aaj hi ye 5 free listing bana:

| Site | Kaha | Time |
|---|---|---|
| JustDial | justdial.com → Free Listing | 15 min |
| Sulekha | sulekha.com/business-listing | 10 min |
| IndiaMART | indiamart.com → Sell | 10 min |
| Bing Places | bingplaces.com | 5 min |
| Apple Maps | mapsconnect.apple.com | 5 min |

**Har jagah bilkul yahi (ek akshar bhi alag nahi):**
```
Aqua Perl RO Service Centre
Sai Gali, Opposite B-62, Buddha Colony, Patna, Bihar 800001
8969821440
https://rokadoctor.in
```

---

## Rollback
Vercel → Deployments → purana 🟢 Ready → ⋯ → **Promote to Production** (30 sec)

## ⚠️ GitHub pe pencil ✏️ icon kabhi mat use karna
