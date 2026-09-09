# 📤 Upload Karo — 9 Sep 2026

**Zip:** `aquanexa-project.zip`
**MD5:** `88c7593234d24d8b1ce940ba51cd8d85`
**Size:** 15 MB · 491 files
**Tests:** 795/795 pass · build EXIT 0 · 173 pages · zero warnings

---

# ⚠️ Pehle 3 baat

1. **PowerShell kholna, CMD nahi.** Windows key dabao → `powershell` type karo → Enter.
   (CMD me `$stamp`, `Select-String` kuch nahi chalta — pichhli baar wahi hua tha.)
2. **`git add -A` likhna hai, `git add .` nahi.** Ek folder delete hua hai, `.` usko register nahi karta.
3. **GitHub pe pencil ✏️ icon se edit MAT karna.** Kabhi bhi.

---

# 🟦 BLOCK 1 — Backup + pull

Poora copy karke PowerShell me paste karo:

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
$stamp = Get-Date -Format "ddMMM-HHmm"
git bundle create "$HOME\Downloads\backup-$stamp.bundle" --all
git stash list
git pull --rebase origin main
```

**Dekhna kya:**
- `git stash list` ke baad kuch line dikhe? → `git stash drop` chalao, phir aage badho
- Kuch na dikhe? → seedha aage

> `backup-*.bundle` teri poori history ka backup hai. Kuch bhi galat ho to
> isse wapas la sakte hain.

---

# 🟦 BLOCK 2 — Zip nikaalo aur copy karo

Pehle zip ko `Downloads` folder me daalo (naam `aquanexa-project.zip` hi rakhna).

```powershell
Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path "$HOME\Downloads\aquanexa-project.zip" -DestinationPath "$HOME\Downloads\aqp-new" -Force
robocopy "$HOME\Downloads\aqp-new" "C:\Users\SUDHA\Downloads\ro-Project\Ro-project" /E /IS /IT /NFL /NDL /NJH /NJS
```

**Dekhna kya:**
- Robocopy `0`, `1`, `2`, ya `3` = **sab theek hai**
- `8` ya usse bada = problem, mujhe batao

> `/IS /IT` zaroori hai. Iske bina robocopy "same dikhne wali" files skip kar
> deta hai aur aadha push ho jata hai — ye galti ek baar ho chuki hai.

---

# 🟦 BLOCK 3 — 🔴 RUKO, pehle dekho

```powershell
"Modified: " + (git status --short | Select-String '^ M').Count
"Naye:     " + (git status --short | Select-String '^\?\?').Count
git status --short | Select-String '\.env$|node_modules'
```

**Chahiye:**
```
Modified: 20 se 28 ke beech
Naye:     12 se 18 ke beech
teesri line KHALI honi chahiye
```

🔴 **Agar teesri line me `.env` ya `node_modules` dikhe — RUKO. Mujhe batao.**
Wo push nahi hona chahiye.

> Numbers zyada isliye hain kyunki isme **Package A+B+C bhi hai** (jo abhi tak
> push nahi hua tha) **plus** D+E+F **plus** 8 naye area.

---

# 🟦 BLOCK 4 — Stage karo

```powershell
git add -A
```

> `-A` isliye ki purana `ro-service-[area]-patna` folder delete hua hai.
> Sirf `git add .` se delete register nahi hoti aur build toot jata hai.

---

# 🟦 BLOCK 5 — Push

```powershell
git commit -m "SEO: 8 verified Patna localities (55->63), 6 service-intent pages + hub, blog with Article/Person schema, keyword-first area URLs with 301s, fix 404 footer links and LocalBusiness schema url, review request system, product query caching"
git push origin main
```

**Dekhna kya:** last line me `main -> main` dikhna chahiye.

---

# 🟦 BLOCK 6 — Vercel check (2-3 minute baad)

`vercel.com` → project **`ro-project`** → Deployments

- 🟢 **Ready** = ho gaya
- 🔴 **Error** = build log ka last 30 line mujhe bhej de

Phir browser me kholo (Ctrl+Shift+N incognito me):
```
rokadoctor.in/ro-service-patna/jakkanpur
rokadoctor.in/ro-repair-patna
rokadoctor.in/ro-services-patna
```
Teeno khulne chahiye. Na khulein to batao.

---

# 🔴 Deploy ke baad — 5 minute ka kaam

## 1. Search Console — sitemap
`search.google.com/search-console` → **Sitemaps** → `sitemap.xml` → Submit

**114 URLs** dikhega (pehle 73 tha).

## 2. Naye page index karwao — URL Inspection me daalo

**Aaj (sabse zaroori pehle):**
```
rokadoctor.in/ro-services-patna
rokadoctor.in/ro-repair-patna
rokadoctor.in/ro-service-patna/jakkanpur
rokadoctor.in/ro-service-patna/naya-tola
```

**Kal:**
```
rokadoctor.in/ro-installation-patna
rokadoctor.in/ro-amc-patna
rokadoctor.in/ro-filter-change-patna
rokadoctor.in/ro-membrane-replacement-patna
rokadoctor.in/commercial-ro-service-patna
rokadoctor.in/ro-service-patna/marufganj
```

**Parso:**
```
rokadoctor.in/ro-service-patna/begampur
rokadoctor.in/ro-service-patna/bairia
rokadoctor.in/ro-service-patna/chandmari
rokadoctor.in/ro-service-patna/sadikpur
rokadoctor.in/ro-service-patna/anandpur
rokadoctor.in/blog
rokadoctor.in/about/sudhanshu-choudhary
```

> Jakkanpur aur Naya Tola pehle isliye — ye central Patna hain, sabse zyada
> ghar aur sabse kam distance. Anandpur last, sabse door hai.

## 3. Purane URL check karo
`rokadoctor.in/service-patna/kankarbagh` ko URL Inspection me daalo.
**Redirect dikhna chahiye, 404 nahi.**

---

# 🔴 Ye code se nahi hoga — tera kaam

```
□ Google Place ID daalo                2 min  (neeche steps)
□ /admin pe ⭐ Review maango dabao      roz 1 min — SABSE ZYADA ASAR
□ GBP naam theek karo                  "Aqua Perl RO Service Centre"
□ GBP hours 7 AM – 10 PM
□ Neon SQL chalao (admin_alerts)       NOTIFICATION-FIX-KARO.md
□ VAPID env vars Vercel me             3 variable
□ aqua-perl Vercel project DELETE      (ro-project MAT delete karna)
□ AI photos hatao public/service/
□ Google Ads ₹31.8/day band karo
```

## Google Place ID (2 minute)
1. `developers.google.com/maps/documentation/places/web-service/place-id`
2. Search box me: **Aqua Perl RO Service Centre Patna**
3. Place ID copy karo (`ChIJ` se shuru hoga)
4. File `src/lib/reviews/review-request.ts`, line ~63:
   ```ts
   export const GOOGLE_PLACE_ID = 'ChIJ...';
   ```
5. Save → commit → push

Iske bina bhi review link chalta hai, bas customer ko 2 extra tap lagenge.

---

# 🔙 Agar kuch toot jaye — 30 second me wapas

**Vercel se (git ki zaroorat nahi):**
1. `vercel.com` → `ro-project` → **Deployments**
2. Purana 🟢 **Ready** wala dhundo
3. Uske aage `⋯` → **Promote to Production**

30 second me site wapas purani ho jayegi.

**Git se:**
```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git log --oneline -5
git revert HEAD --no-edit
git push origin main
```

---

# ⚠️ Ek baat pehle se bata deta hoon

URL structure badla hai (`/service-patna/kankarbagh` → `/ro-service-patna/kankarbagh`).

```
Hafta 1-2   Google redirects crawl karega. Ranking THODI HIL SAKTI HAI.
Hafta 3-4   Naye URL index honge
Hafta 6-8   Asli asar dikhega
```

**Ranking hilte dekh ke ghabrana mat aur rollback mat karna.** 301 se signal
pass hota hai, bas Google ko time lagta hai. Rollback karne se ulta nuksaan
hoga — do baar URL badalna sabse bura hai.

---

# 📋 Is push me kya ja raha hai

```
Package A   keyword-first area URLs + 20 area (35→55)
Package B   blog 5 posts + Article/Person/HowTo schema + author page
Package C   /products speed 2,710ms → 21ms
Package D   6 service pages + hub  (/ro-repair-patna, /ro-amc-patna …)
Package E   🔴 3 bug fix — footer ke 404 links, schema ka 404 url,
            next.config ka page kha jaana
Package F   review system — admin button, dashboard tracker, customer CTA
Naya        8 verified Patna area (55→63)
```

**795 test, sab pass. 173 pages. Zero warnings.**
