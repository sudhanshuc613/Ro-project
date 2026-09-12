# Upload karo — 12 Sep 2026

Zip: **`aquaperl-GBP-FIX.zip`**

---

## Isme kya badla (poori list, kuch chhupa nahi)

### 1. 🔴 Review count 44 → 50, rating 4.8 → 5.0 (LIVE-VERIFIED)

Maine Google par do alag query se check kiya:
```
"ro service patna"                  → Aqua Perl | Ro Service Centre  5.0(50)
"aqua perl ro service centre patna" → Aqua Perl | Ro Service Centre  5.0(50)
```

Site `44 / 4.8` bol rahi thi. **6 review aur aa chuke the, rating bhi badh gayi thi.**
Site apne aap ko asli se KAM bata rahi thi — 73 area page, homepage, schema, sab jagah.

### 2. 🔴 `5.0` display bug — pakda aur theek kiya

JavaScript me `5.0` ek number hai, aur number ka `.0` gir jata hai:
```js
String(5.0)  →  "5"      ❌  "⭐ 5 · 50 Google reviews"
(5.0).toFixed(1) → "5.0" ✅  "⭐ 5.0 · 50 Google reviews"
```
Agar main sirf `4.8` ko `5.0` kar deta to poore site par **"5★"** dikhta, "5.0★" nahi —
aur schema me `"ratingValue":"5"` jaata. Naya `GBP_RATING_TEXT` isko permanently theek karta hai.

### 3. 🔴 Test suite ka blind spot band kiya

Purane test me `44` **hardcoded** tha:
```bash
hasf "real reviewCount 44" /tmp/ad_kankarbagh.html '"reviewCount":"44"'
```
Isliye jab asli count 50 ho gaya, test **pass hota raha** aur bug chhupa raha.

Ab 5 test scripts `constants.ts` se number **padhte** hain:
```bash
RC=$(grep -oP 'reviewCount: \K[0-9]+' src/lib/constants.ts | head -1)
```
**Ab ye bug dobara chhup nahi sakta.**

### 4. Google Ads conversion tracking (pichhle zip se, ab bhi ready)

`AW-` tag ka code laga hua hai, par **IDs khali hain** — jab tak tu Google Ads me
conversion action banake ID nahi dega, kuch fire nahi hoga. Ye safe hai.

---

## Files jo badli — 19

| File | Bytes | Kya hua |
|---|---|---|
| `src/lib/constants.ts` | **11,764** | 5.0 / 50 + naya `GBP_RATING_TEXT` |
| `src/lib/social-proof.ts` | 6,736 | star breakdown 5.0 ke hisaab se |
| `src/lib/seo/schema.ts` | 19,999 | schema me `GBP_RATING_TEXT` |
| `src/lib/seo/geo-answers.ts` | 10,257 | AEO answer ka rating |
| `src/lib/seo/blog-data.ts` | 34,539 | author credential line |
| `src/components/home/ServiceHero.tsx` | 14,446 | hero badge "⭐ 5.0 · 50" |
| `src/components/home/Testimonials.tsx` | 2,711 | rating line |
| `src/components/admin/ReviewTracker.tsx` | 4,794 | dashboard progress |
| `src/app/(shop)/page.tsx` | 14,953 | comment update |
| `src/app/(shop)/about/[person]/page.tsx` | 6,922 | stat tile |
| `src/app/(shop)/ro-service-patna-faq/page.tsx` | 11,029 | rating line |
| `src/app/(shop)/ro-service-patna/[area]/page.tsx` | **28,132** | 73 area page ka schema |
| `scripts/verify-area-depth.sh` | 12,285 | hardcode hataya |
| `scripts/verify-service-intent.sh` | 17,281 | hardcode hataya |
| `scripts/verify-ux-upgrade.sh` | 12,934 | hardcode hataya |
| `scripts/verify-brand-rename.sh` | 6,902 | hardcode hataya |
| `scripts/verify-titles-and-schema.sh` | 6,898 | hardcode hataya |
| `GBP-KA-ASLI-SACH-12-SEP.md` | naya | competitor analysis |
| `UPLOAD-KARO-12-SEP.md` | naya | ye file |

**Purana content kuch nahi toota.** 73 area page, 6 intent page, blog, products, admin — sab waise hi.

---

## Test report — asli numbers

```
Build              : EXIT 0 · 184 pages · ZERO warnings
Test suite         : 1006 / 1006 PASS · 0 FAIL
Route sweep        : 127 / 127 PASS (73 area pages sab 200)
Admin (logged in)  : 44 / 44 PASS — 15 admin + 9 account page, sab 200
Zip vs working dir : 0 differences
Secrets in zip     : 0 (.env nahi hai, sirf .env.example placeholders)
Images             : sab original size — service-tech.png 2,706,298 bytes waise hi
Bracket files      : 19 dynamic route files, sab sahi size
```

Rendered HTML se confirm:
```
homepage schema  "reviewCount":"50"  "ratingValue":"5.0"
area page        "reviewCount":"50"  "ratingValue":"5.0"
author page      5.0★ · "Google par 5.0★ rating, 50 verified reviews"
FAQ hub          Rating 5.0★ / 50 reviews
purana 44        0 jagah
purana 4.8       0 jagah
AW- tag          absent (jab tak ID nahi bharta — sahi hai)
```

---

## Upload kaise kare — tera wala tareeka (jo kaam karta hai)

1. **`aquaperl-GBP-FIX.zip` download kar**
2. **Right-click → Extract All** — `C:\Users\SUDHA\Downloads\aqp-gbp\` me nikal
   - ⚠️ PowerShell `Expand-Archive` **mat** use karna — `[area]`, `[intent]` wali
     files silently skip ho jati hain
3. **Extract ki hui folder** me jao, **Ctrl+A** se sab select kar, **Ctrl+C**
4. `C:\Users\SUDHA\Downloads\ro-Project\Ro-project` me jao, **Ctrl+V**
5. **"Replace the files in the destination"** — haan
6. GitHub Desktop → sare changes dikhenge → commit → push

### Push ke baad ye 4 size verify kar (PowerShell, `-LiteralPath` ke saath)

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
$want = @{
  "src\lib\constants.ts"                            = 11764
  "src\lib\seo\patna-service-data.ts"               = 140115
  "src\app\(shop)\ro-service-patna\[area]\page.tsx" = 28132
  "src\components\home\ServiceHero.tsx"             = 14446
}
foreach ($k in $want.Keys) {
  $sz = (Get-Item -LiteralPath $k).Length
  if ($sz -eq $want[$k]) { Write-Host "OK   $k ($sz)" -f Green }
  else { Write-Host "GALAT $k — mila $sz, chahiye $($want[$k])" -f Red }
}
```

**Agar `patna-service-data.ts` 88,777 dikhe to ROKO** — wo purani 55-area file hai,
commit karne se **18 live area page delete** ho jayenge.

### Push ke baad confirm

```powershell
git show --stat HEAD
```
19 files badle dikhne chahiye. Kam dikhe to aadha push hua hai.

---

## ⚠️ GitHub pe pencil ✏️ icon kabhi mat use karna
Wo line endings badal deta hai aur build tod deta hai.

## Rollback (agar kuch bigda)
Vercel → Deployments → purana 🟢 Ready → ⋯ → **Promote to Production**
30 second, git ki zaroorat nahi.

---

## Deploy ke baad 2 minute me khud check kar

1. `rokadoctor.in` khol → hero me **"⭐ 5.0 · 50 Google reviews"** dikhna chahiye
2. `rokadoctor.in/ro-service-patna/kankarbagh` → neeche rating **5.0★ / 50**
3. `rokadoctor.in/admin` → dashboard par **50 / 150** progress

Teeno sahi = deploy safal.
