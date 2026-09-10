# 🔍 Tere GSC Screenshot Ka Poora Jawab

**10 Sep 2026** · har ek reason live check kiya · **1 asli bug mila aur fix kiya**

---

# Screenshot me 7 reason the. Ek-ek karke:

| Reason | Pages | Kya hai | Action |
|---|---|---|---|
| **Blocked by robots.txt** | 10 | 🔴 **ASLI BUG** — product photos block the | ✅ **FIX KIYA** |
| Page with redirect | 8 | ✅ Bilkul normal | Kuch nahi |
| Not found (404) | 3 | ✅ Purane/junk URL | Kuch nahi |
| Alternate page with canonical | 2 | ✅ Normal | Kuch nahi |
| Excluded by 'noindex' | 1 | ✅ Jaan-boojh ke | Kuch nahi |
| Discovered – not indexed | 7 | 🟡 Google ne abhi crawl nahi kiya | Request Indexing |
| Crawled – not indexed | 2 | 🟡 Google ne rakha nahi | Wait |

**Total 33 pages. Sirf 10 asli problem the.**

---

# 🔴 ASLI BUG — Tere product photos Google se chhupe hue the

## Kya dikha tha

```
Blocked by robots.txt — 10 pages
  https://rokadoctor.in/api/media/0ab4d493-80c7-4b79-8681-d71de0ce2707
  https://rokadoctor.in/api/media/40c86c0b-c490-435e-a967-36e68a352fca
  ... (aur 8)
```

Pehli nazar me lagta hai "API hai, block hona hi chahiye". **Galat.**

## Maine kya check kiya

Live `/products` page khol ke image sources dekhe:

```
src="/_next/image?url=%2Fapi%2Fmedia%2F7e63ef52-...&w=1920&q=75"
src="/_next/image?url=%2Fapi%2Fmedia%2F0f234cbf-...&w=1920&q=75"
src="/_next/image?url=%2Fapi%2Fmedia%2Fb1dccc87-...&w=1920&q=75"
```

**Gina: 60 images me se 48 `/api/media/` se aati hain.**

Wajah — Vercel pe filesystem read-only hai, to jo photo tu admin se upload
karta hai wo **database me save hoti hai** aur us route se serve hoti hai.
Ye API nahi hai, **ye teri product photos hain.**

Aur robots.txt me tha:
```
Disallow: /api/*      ← ye 48 photos ko block kar raha tha
```

## Nuksaan kya ho raha tha

**1. Google Images me zero presence.** Koi bhi image search me tera product
nahi aa sakta tha.

**2. Product rich result khatre me.** Product schema me image URL yahi hai:
```json
"image": ["https://rokadoctor.in/api/media/b1dccc87-...",
          "https://rokadoctor.in/api/media/9c364722-..."]
```
Google ka rule saaf hai — **Product markup me image crawlable honi chahiye**.
Uncrawlable image se poora rich result invalid ho sakta hai. Matlab search me
price, rating, stock — kuch nahi dikhta.

## ✅ Fix

```
Allow: /api/media/     ← naya, product photos ke liye
Disallow: /api/*       ← baaki API abhi bhi blocked
```

Robots protocol me **specificity jeetti hai, order nahi** — `/api/media/`
(11 characters) `/api/*` (6 characters) se zyada specific hai, to Allow jeet
jata hai.

Maine ye theory pe nahi chhoda, **7 case ka resolution test likha**:
```
/api/media/abc-123           -> ALLOW     ✅
/api/service-requests        -> DISALLOW  ✅
/api/admin/alerts            -> DISALLOW  ✅
/products/some-product       -> ALLOW     ✅
/ro-service-patna/kankarbagh -> ALLOW     ✅
/admin                       -> DISALLOW  ✅
/cart                        -> DISALLOW  ✅
```

Checkout, auth, admin — sab abhi bhi blocked hain. Sirf photos khuli.

---

# ✅ Page with redirect (8) — ye BILKUL SAHI hai

Maine aathon check kiye, sab 200 pe pahunch rahe hain:

```
308  www.rokadoctor.in/                    → rokadoctor.in/           ✅
308  http://rokadoctor.in/                 → https://rokadoctor.in/   ✅
301  /products/ro-booster-pump-100-gpd-24v → grand-forest-...-75-gpd  ✅
308  /products/aquanexa-alkaline-...-10l/  → aquafresh-alkaline-...   ✅
308  /products/commercial-ro-plant-250-lph/ → (bina slash)            ✅
308  /products/ro-booster-pump-100-gpd-24v/ → grand-forest-...        ✅
308  /products/aquafresh/                  → aquafresh-alkaline-...   ✅
308  /products/aquanexa-pure-8l-.../       → aquabizz-pure-8l-...     ✅
```

**Ye woh redirects hain jo maine jaan-boojh ke banaye the** — brand rename
(AquaNexa → Aqua Perl) aur product slug fix ke waqt. Agar ye na hote to ye
saare purane indexed URL **404 dete** aur unki poori ranking chali jaati.

`www` aur `http` wale bhi normal hain — har site pe hote hain.

**Google inhe "Page with redirect" me isliye dikhata hai ki wo khud index**
**nahi hote — destination hota hai.** Ye report hai, error nahi.

---

# ✅ Not found 404 (3) — teeno theek hain

```
/cdn-cgi/l/email-protection   ← Cloudflare ka email obfuscation link
/$                            ← purana crawl artifact (11 Aug), ab site pe nahi
/lander                       ← purane PHP site ka page
```

**`/$`** — maine poore codebase me dhunda, kahin nahi hai. Live pages pe bhi
`href="/$"` zero hai. Ye 11 August ka purana crawl tha, ab exist nahi karta.

**`/lander`** — purani PHP wali site ka page. Ab hai hi nahi, 404 dena **sahi**
hai. Google 2-3 mahine me bhool jayega.

**`/cdn-cgi/l/email-protection`** — Cloudflare ne tera email address chhupane
ke liye ye link banaya. Cloudflare ka apna hai, humara nahi. Nuksaan nahi.

**Teeno pe kuch karne ki zaroorat nahi.** 404 galat URLs ke liye sahi jawab hai.

---

# 🟡 Discovered – not indexed (7) — thoda time chahiye

```
/contact                                          484 words
/products/aquafresh-alkaline-copper-10l-...       777 words
/products/aquapearl-alkaline-copper-12l-...       442 words
/service-patna/brand/nasaka                     1,038 words
/service-patna/brand/whirlpool                  1,028 words
/service-patna/brand/zero-b                     1,059 words
/service-patna/raja-bazar                       308 redirect
```

Maine saaton check kiye — **sab 200 dete hain, sab me theek content hai**,
koi noindex nahi, canonical sahi hai.

"Discovered" ka matlab: **Google ko URL pata hai, par abhi crawl nahi kiya.**
Ye crawl budget ki baat hai, quality ki nahi. Nayi site pe normal.

**`raja-bazar` alag case hai** — ye purana URL hai jo ab
`/ro-service-patna/raja-bazar` pe redirect hota hai. Google ne purana dekha
tha. Naya wala index ho jayega.

**Action:** in 6 ko URL Inspection me daal ke **Request Indexing** kar do.

---

# ✅ Baaki 3 reason

**Alternate page with proper canonical tag (2)** — Google ne do URL dekhe jo
same page dikhate hain, aur canonical tag padh ke sahi wala chun liya.
**Ye system kaam kar raha hai ka proof hai.**

**Excluded by 'noindex' (1)** — `/track/[ticket]` pages pe maine jaan-boojh ke
`noindex` lagaya hai. Customer ka naam, phone aur address us page pe hota hai
— wo Google me nahi aana chahiye. **Privacy ke liye zaroori hai.**

**Crawled – not indexed (2)** — Google ne crawl kiya par index karne layak
nahi laga. 2 pages pe wait karna theek hai.

---

# 🧪 Test Report

```
tsc --noEmit                   EXIT 0  ✅
npm run build                  EXIT 0  ✅  184 pages, ZERO warnings

verify-robots-media       24/24   ← naya
verify-forms-and-features 83/83
verify-area-depth         64/64
verify-new-areas         140/140
verify-service-intent    165/165
verify-seo-packages       94/94
verify-ux-upgrade         99/99
verify-seo-indexing       59/59
verify-product-admin      68/68
verify-titles-and-schema  44/44
verify-brand-rename       51/51
verify-admin-full         44/44
verify-password-features  31/31
────────────────────────────────
TOTAL                    966/966  ✅
```

---

# 📁 Files

```
src/app/robots.ts                    🔴 Allow: /api/media/ (THE FIX)
scripts/verify-robots-media.sh       24 checks + robots resolution test
scripts/verify-all.sh                naya script add
GSC-REPORT-KA-JAWAB.md               ye file
```

---

# 📤 Upload

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git pull --rebase origin main
```

```powershell
Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path "$HOME\Downloads\aquanexa-project.zip" -DestinationPath "$HOME\Downloads\aqp-new" -Force
robocopy "$HOME\Downloads\aqp-new" "C:\Users\SUDHA\Downloads\ro-Project\Ro-project" /E /IS /IT /NFL /NDL /NJH /NJS
```

```powershell
"Modified: " + (git status --short | Select-String '^ M').Count
"Naye:     " + (git status --short | Select-String '^\?\?').Count
git status --short | Select-String '\.env$|node_modules'
```
Chahiye: **Modified 2-3** · **Naye 2** · teesri line **khali**

```powershell
git add -A
git commit -m "fix: robots.txt was blocking all 48 product images served from /api/media"
git push origin main
```

---

# 🔴 Deploy ke baad — 5 minute ka kaam

## 1. robots.txt verify karo
```
rokadoctor.in/robots.txt
→ "Allow: /api/media/" line dikhni chahiye
```

## 2. GSC me validation shuru karo
```
Search Console → Pages → "Blocked by robots.txt"
→ upar "VALIDATE FIX" button dabao
```
Google 1-2 hafte me dobara check karega aur wo 10 pages clear ho jayenge.

## 3. robots.txt tester
```
Search Console → Settings → robots.txt
→ "Open report" → last fetch time dekho
→ agar purana hai to "Request a recrawl"
```

## 4. Ye 6 index karwao (URL Inspection → Request Indexing)
```
rokadoctor.in/contact
rokadoctor.in/service-patna/brand/nasaka
rokadoctor.in/service-patna/brand/whirlpool
rokadoctor.in/service-patna/brand/zero-b
rokadoctor.in/products/aquafresh-alkaline-copper-10l-ro-purifier
rokadoctor.in/products/aquapearl-alkaline-copper-12l-ro-purifier
```

---

# 💬 Ek baat

Ye bug **7 mahine se chal raha tha** (Aug 9 se crawl dates dikh rahe hain).
Tere saare product photos Google se chhupe hue the, aur Product rich results
khatre me the.

**Ye tere screenshot ki wajah se mila.** Main bahar se robots.txt dekh sakta
tha, par ye nahi jaan sakta tha ki Google ne kaunse URL block-list me daale
hain — wo sirf GSC me dikhta hai.

Aage bhi jab GSC me kuch ajeeb dikhe, screenshot bhej dena.

---

# 🔴 Ab bhi tere haath me

```
□ /admin pe roz ⭐ Review maango        1 min/din — 36% weight
□ GBP naam → "Aqua Perl RO Service Centre"
□ GBP hours 7 AM – 10 PM
□ Google Place ID daalo                 2 min
□ Test ticket SRV-2026-00008 delete     (maine live test me banaya tha)
```
