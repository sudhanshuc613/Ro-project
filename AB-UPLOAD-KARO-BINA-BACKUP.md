# 📤 Files Replace Ho Chuki — Ab Sirf Push

Tune zip nikaal ke seedha destination me replace kar diya. **Theek hai.**
Ab sirf 4 block bache hain.

**Backup ki fikar mat kar:**
- Teri poori purani code GitHub pe already hai (`git` history)
- Vercel pe purana deployment 30 second me wapas aa sakta hai
- Aur agar kuch galat hua to `git checkout .` sab wapas le aayega

---

# ⚠️ PowerShell kholna — CMD nahi

Windows key → `powershell` type karo → Enter.

(CMD me `$x`, `Select-String`, `Get-Date` kuch nahi chalta — pichhli baar
`'Write-Host' is not recognized` isi wajah se aaya tha.)

---

# 🟦 BLOCK 1 — Check karo sab files pahunchi ya nahi

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project

$need = @(
 "src\lib\seo\area-url.ts",
 "src\lib\seo\blog-data.ts",
 "src\lib\seo\service-intent-data.ts",
 "src\lib\reviews\review-request.ts",
 "src\app\(shop)\ro-service-patna\[area]\page.tsx",
 "src\app\(shop)\blog\page.tsx",
 "src\app\(shop)\about\[person]\page.tsx",
 "src\app\(shop)\[intent]\page.tsx",
 "src\app\(shop)\ro-services-patna\page.tsx",
 "src\components\admin\ReviewRequestButton.tsx",
 "src\components\admin\ReviewTracker.tsx",
 "scripts\verify-new-areas.sh",
 "scripts\verify-service-intent.sh"
)
$miss = 0
foreach ($f in $need) {
  if (Test-Path -LiteralPath $f) { "  OK      $f" }
  else { "  MISSING $f"; $miss++ }
}
""
"MISSING COUNT: $miss"
```

> 🔴 **`-LiteralPath` zaroori hai.** Bina iske PowerShell `[area]`, `[person]`,
> `[intent]` ko wildcard samajh leta hai (bracket = character set) aur file
> maujood hote hue bhi "MISSING" bolta hai. Ye galti pehli baar ho chuki hai —
> teen Next.js dynamic-route folders jhoothi MISSING dikha rahe the.

**Chahiye: `MISSING COUNT: 0`**

🔴 Agar kuch MISSING hai → zip theek se copy nahi hui. Mujhe batao, ya
BLOCK 1B chala do (neeche).

---

## 🟦 BLOCK 1B — Sirf agar kuch MISSING tha

Zip dobara nikaal ke robocopy se copy karo (`/IS /IT` zaroori hai):

```powershell
Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path "$HOME\Downloads\aquanexa-project.zip" -DestinationPath "$HOME\Downloads\aqp-new" -Force
robocopy "$HOME\Downloads\aqp-new" "C:\Users\SUDHA\Downloads\ro-Project\Ro-project" /E /IS /IT /NFL /NDL /NJH /NJS
```

Phir BLOCK 1 dobara chalao.

---

# 🟦 BLOCK 2 — 🔴 RUKO, ye dekhna zaroori hai

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
Modified: 20 se 28
Naye:     12 se 18
.env wali line KHALI
```

🔴 **Agar `.env` ya `node_modules` dikhe — RUKO, mujhe batao.**

🟡 Agar `Naye: 0` aur `Modified: 0` dikhe → files copy hui hi nahi,
BLOCK 1B chalao.

---

# 🟦 BLOCK 3 — Stage karo

```powershell
git add -A
```

> **`-A` hi likhna, `.` nahi.** Purana `ro-service-[area]-patna` folder
> delete hua hai. `git add .` delete ko register nahi karta, aur wo folder
> wapas chala gaya to **saare 63 area page live pe 404 denge**.

Check karo delete register hui:

```powershell
git status --short | Select-String '^D'
```

`D  src/app/(shop)/ro-service-[area]-patna/...` jaisi line dikhni chahiye —
**agar wo folder tere paas tha**. Na dikhe to bhi theek hai.

---

# 🟦 BLOCK 4 — Push

```powershell
git commit -m "SEO: 8 verified Patna localities (55->63), 6 service-intent pages + hub, blog with Article/Person schema, keyword-first area URLs with 301s, fix 404 footer links and LocalBusiness schema url, review request system, product query caching"
git push origin main
```

**Last line me `main -> main` dikhna chahiye.**

Agar `rejected` aaye:
```powershell
git pull --rebase origin main
git push origin main
```

---

# 🟦 BLOCK 5 — Vercel (2-3 minute baad)

`vercel.com` → project **`ro-project`** → **Deployments**

- 🟢 **Ready** → ho gaya
- 🔴 **Error** → build log ki last 30 line mujhe bhej de

Phir **incognito** me (Ctrl+Shift+N) ye 5 kholo:

```
rokadoctor.in/ro-service-patna/jakkanpur
rokadoctor.in/ro-service-patna/marufganj
rokadoctor.in/ro-repair-patna
rokadoctor.in/ro-services-patna
rokadoctor.in/blog
```

Paanchon khulne chahiye. Koi 404 de to turant batao.

Aur ye purana URL bhi check karo — **redirect hona chahiye, 404 nahi**:
```
rokadoctor.in/service-patna/kankarbagh
```
(Ye `rokadoctor.in/ro-service-patna/kankarbagh` pe le jayega.)

---

# 🔙 Kuch toot jaye to — 30 second, git ki zaroorat nahi

1. `vercel.com` → `ro-project` → **Deployments**
2. Purana 🟢 **Ready** wala dhundo (aaj se pehle ka)
3. Uske aage `⋯` → **Promote to Production**

Site 30 second me wapas purani. Ye tera asli backup hai.

**Ya git se:**
```powershell
git revert HEAD --no-edit
git push origin main
```

---

# ✅ Push ke baad — Search Console

## Aaj
`search.google.com/search-console` → **Sitemaps** → `sitemap.xml` → Submit
(**114 URLs** dikhega, pehle 73 tha)

Phir **URL Inspection** me ye 4 daalo → *Request Indexing*:
```
rokadoctor.in/ro-services-patna
rokadoctor.in/ro-repair-patna
rokadoctor.in/ro-service-patna/jakkanpur
rokadoctor.in/ro-service-patna/naya-tola
```

## Kal
```
rokadoctor.in/ro-installation-patna
rokadoctor.in/ro-amc-patna
rokadoctor.in/ro-filter-change-patna
rokadoctor.in/ro-membrane-replacement-patna
rokadoctor.in/commercial-ro-service-patna
rokadoctor.in/ro-service-patna/marufganj
```

## Parso
```
rokadoctor.in/ro-service-patna/begampur
rokadoctor.in/ro-service-patna/bairia
rokadoctor.in/ro-service-patna/chandmari
rokadoctor.in/ro-service-patna/sadikpur
rokadoctor.in/ro-service-patna/anandpur
rokadoctor.in/blog
rokadoctor.in/about/sudhanshu-choudhary
```

---

# ⚠️ Hafta 1-2 me ranking hil sakti hai

URL badle hain (`/service-patna/x` → `/ro-service-patna/x`).

```
Hafta 1-2   Google redirects crawl karega — ranking THODI HIL SAKTI HAI
Hafta 3-4   naye URL index honge
Hafta 6-8   asli asar
```

**Ghabrana mat, rollback mat karna.** 301 se ranking pass hoti hai, bas time
lagta hai. Do baar URL badalna sabse bada nuksaan hota hai.

---

# 🔴 Deploy ke baad ka asli kaam

```
□ /admin pe roz ⭐ Review maango dabao    ← SABSE ZYADA ASAR (36% weight)
□ Google Place ID daalo                   2 min
□ GBP naam → "Aqua Perl RO Service Centre"
□ GBP hours 7 AM – 10 PM
□ Neon SQL chalao (admin_alerts)          NOTIFICATION-FIX-KARO.md
□ VAPID env vars Vercel me
□ aqua-perl Vercel project DELETE         (ro-project MAT delete karna)
□ Google Ads ₹31.8/day band karo
```
