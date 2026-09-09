# 🔬 Depth + Answer Engine — 9 Sep 2026

Deep research karke jo kami mili, wo poori kar di. Aur ek **purani galti** bhi
pakdi jo main hi kar raha tha.

---

# 🔴 PEHLE: Meri apni galti jo maine pakdi

Pichhle sessions me main tujhe bata raha tha:

```
Hamare area pages ka overlap   16.8% avg / 34.4% max
Competitor rocareindia         100%
```

**Ye comparison galat tha.**

Main hamare `patna-service-data.ts` ke **data objects** naap raha tha — jisme
sirf unique fields hote hain. Aur competitor ka **rendered page** naap raha
tha — jisme wo fields + saare template sentences hote hain.

Ek hi tareeke se dono naapa (rendered body HTML, header/nav/footer hata ke):

```
rokadoctor.in LIVE (jo abhi #1 hai)   84.7% overlap · 55 duplicate sentences
rocareindia.com                      100.0% overlap · 51 duplicate sentences
```

**84.7% — na ki 34%.**

Ye ghabrane ki baat nahi hai, kyunki 84.7% pe hi tu abhi 4 keyword pe #1 hai.
Par ye competitor ke 100% ke kaafi paas hai, aur isko badhne nahi dena.

## 🔴 Aur pehla draft usko BADTAR kar raha tha

Maine jab depth content banaya, pehle version me same TDS band ke areas ko
**bilkul same sentences** mil rahe the:

```
Pehla draft:  88.3% overlap · 125 duplicate sentences   ← LIVE se BADTAR
```

**Maine wo reject kar diya aur dobara likha.** Ab:

```
                     LIVE      Pehla draft    AB
Body overlap        84.7%        88.3%       81%   ✅
Dup sentences         55          125         44   ✅
Words per area      1,215          —        1,870  ✅
```

**Live se behtar, aur content 54% zyada.**

Agar main sirf "34% target" wale purane test pe bharosa karta, to ye pakda hi
nahi jaata aur tera site competitor ki taraf badh jaata.

---

# 📊 PART 1 — Competitor research (jo naya mila)

Maine unka Kankarbagh page poora khol ke padha:

```
rocareindia /ro-service-kankarbagh-patna
  3,392 words · 43 schema · 14 tel links · 26 images · 6 video
  Title: "RO Service Kankarbagh, Patna @9311587744 | Water Purifier Service"

  Schema: Product · Service · OfferCatalog · AggregateRating ·
          FAQPage · Organization · Brand · ContactPoint
```

## Unke 3,392 words me kya hai

```
6 AMC plan blocks · service list catalogue · charges table ·
"why choose us" · "Get 1000 Coins" reward · nearby stores
```

**Aur wahi 6 blocks unke HAR area page pe hain** — isliye 100% overlap.

## 🔴 Unka sabse bada jhoot

```json
"aggregateRating": { "ratingValue": "4.8", "reviewCount": 187134 }
```

Ek Patna locality page pe **1,87,134 reviews** claim kar rahe hain. Ye poore
India ka number hai jo har area page pe chipka diya hai.

**Hamara 44 hi rahega.** Google ka 24 July 2026 review update inflated counts
pe **poori site ka structured data** hata deta hai — tere 174 pages ka har
FAQPage, LocalBusiness, Service block.

## Jo unke paas tha aur hamare paas nahi

| | Unke | Hamare (pehle) | Ab |
|---|---|---|---|
| Words | 3,392 | 1,215 | **1,870** |
| Schema | 43 | 42 | **59** |
| OfferCatalog | ✅ | ❌ | ✅ |
| AggregateRating (area page) | ✅ (fake) | ❌ | ✅ (asli 44) |

---

# ✅ PART 2 — Kya banaya

## 1. Area pages me depth (`area-depth.ts`)

Har area page pe 4 naye block — **sab uske apne naapé hue numbers se bane**:

### TDS ka matlab
BIS IS 10500 ke against uska apna number. Har area alag:
```
Kurji (soft)       "even at its worst 190 mg/L inside the limit"
Kankarbagh (hard)  "1.8× the acceptable limit, 400 mg/L over"
Chandmari (v.hard) "2.5× the acceptable limit, 750 mg/L over"
```

### Saal bhar ka kharcha — ye koi nahi deta
```
Sediment filter      4× a year      ₹640
Carbon (pre+post)    2.2× a year    ₹484
RO membrane          every 1.7 yr   ₹824
Visit charges        2.5× a year    ₹500
─────────────────────────────────────────
Kul                                ₹2,448
```
Har area ka **alag number** (TDS band se calculate hota hai), aur uske hisaab
se AMC ki honest salah — kahin "AMC sasta hai", kahin "mat lo, per visit
cheaper hai".

### Top 3 fault — ranked
Rank 1 = us area ka apna `commonRepair`. Rank 2-3 hardness band se, par
sentences me area ka apna landmark/pincode/job-count hota hai.

### Response detail — imaandar
```
45 min area:  "one of our quicker zones"
90 min area:  "outer edge of our same-day radius, aur hum saaf bolte hain"
```

## 2. Schema strong kiya

Area pages pe ab:
```
✅ OfferCatalog       5 job, har ek ka price + link (competitor jaisa)
✅ AggregateRating    4.8 / 44 — ASLI (unka 187134 fake hai)
✅ Service @id        proper entity
schema: 42 → 59
```

## 3. Answer hub — `/ro-service-patna-faq` (NAYA)

Ye AI search engines ke liye hai. Maine live check kiya — robots.txt me:
```
Googlebot        allowed ✅
Bingbot          allowed ✅
OAI-SearchBot    allowed ✅   (ChatGPT Search)
PerplexityBot    allowed ✅
```

Wo padh sakte hain. Par **quote karne layak kuch nahi tha** — hamare facts
paragraph me bikhre hue the.

AI engine poora page nahi uthata. Wo **ek sentence** uthata hai jisme entity +
jagah + number ek saath ho.

To ab har jawab **do baar** likha hai:
```
SHORT (quote karne layak, ek line):
  "A 75 GPD RO membrane in Patna costs ₹1,100 to ₹2,500 fitted."

LONG (insaan ke liye detail)
```

10 sawaal — RO service cost, membrane price, Patna TDS, filter interval,
"paani nahi aa raha", "RO water safe hai?", best service, brands, installation
cost, AMC worth it.

Schema: **QAPage** (har jawab ka alag) + FAQPage + **speakable** (voice
assistant ke liye).

**Ye doorway page nahi hai** — "Patna" hata do to page girr jaata hai, kyunki
saare numbers Patna ke naapé hue hain.

## 4. Purane FAQ ka boilerplate hataya

`buildAreaFaqs()` me 5 sentences **63 area pages pe byte-identical** the:
```
"Parts and repair work are quoted separately..."       x63
"Every repair carries a 30-day service warranty..."    x63
"You pay only after the technician has completed..."   x63
```
Ye 55 me se **majority duplicates** the. Ab har ek me area ka pincode/landmark/
neighbour hai.

---

# 🧪 PART 3 — Test Report

```
tsc --noEmit                     EXIT 0  ✅
npm run build (.next delete)     EXIT 0  ✅  174 pages, ZERO warnings

verify-area-depth      64/64   ← naya
verify-new-areas      140/140
verify-service-intent 165/165
verify-seo-packages    94/94
verify-ux-upgrade      99/99
verify-seo-indexing    59/59
verify-product-admin   68/68
verify-titles-schema   44/44
verify-brand-rename    51/51
verify-admin-full      44/44
verify-password        31/31
────────────────────────────────
TOTAL                 859/859   ✅
```

## Naya doorway RATCHET

`verify-area-depth.sh` ab permanently guard karta hai:
```
max body overlap        <= 84    (live baseline 84.7%)
duplicate sentences     <= 55    (live baseline 55)
```

**Agar kabhi content copy-paste ho jaye to test turant red hoga.** Ye wahi
test hai jisne mera pehla draft (88.3% / 125) pakda.

---

# 📁 Files

## Naye (3)
```
src/lib/seo/area-depth.ts                     TDS verdict, cost forecast,
                                              fault profile, response detail
src/lib/seo/geo-answers.ts                    10 AI-quotable answers + QAPage
src/app/(shop)/ro-service-patna-faq/page.tsx  answer hub
scripts/verify-area-depth.sh                  64 checks + doorway ratchet
DEPTH-AUR-AEO-9-SEP.md                        ye file
```

## Chhue (5)
```
src/app/(shop)/ro-service-patna/[area]/page.tsx  4 depth blocks + OfferCatalog
src/lib/seo/patna-service-data.ts                FAQ boilerplate hataya
src/app/sitemap.ts                               answer hub
src/components/layout/Footer.tsx                 answer hub link
src/app/(shop)/ro-services-patna/page.tsx        answer hub link
scripts/verify-all.sh                            naya script
```

---

# 📤 Upload

**PowerShell** (CMD nahi):

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
Chahiye: **Modified 6-9** · **Naye 4-6** · teesri line **khali**

```powershell
git add -A
git commit -m "SEO: area page depth from measured TDS data, OfferCatalog schema, answer hub with QAPage for AI search, remove FAQ boilerplate"
git push origin main
```

## Deploy ke baad — Search Console
```
rokadoctor.in/ro-service-patna-faq        ← naya, ye pehle
rokadoctor.in/ro-service-patna/kankarbagh ← re-index (content badla)
rokadoctor.in/ro-service-patna/marufganj
```

---

# 🔴 PART 4 — Jo ABHI BHI code se nahi ho sakta

Maine sab kar diya jo code se hota hai. Ye bache:

## Turant (aaj)
```
□ ro-project.vercel.app REDIRECT karo          2 min  🔴 SABSE BADA
  vercel.com → ro-project → Settings → Domains
  → ⋯ → Edit → Redirect to rokadoctor.in

  Ye abhi bhi LIVE hai aur "ro service boring road patna" pe
  #3 pe hai — tere apne domain se UPAR.

□ /admin pe roz ⭐ Review maango                1 min/din
  44 → 150. Reviews 36% weight hain, on-page 19%.
```

## Is hafte
```
□ GBP naam → "Aqua Perl RO Service Centre"     5 min
□ GBP hours 7 AM – 10 PM                       2 min
□ Google Place ID daalo                        2 min
□ Cloudflare → Google-Extended ALLOW karo      2 min
  (AI Overviews me dikhne ke liye)
□ AI photos hatao public/service/              GBP suspension risk
```

## Jo main nahi kar sakta — ye sach hai
```
✗ Asli photos khinchna              tera phone chahiye
✗ Reviews maangna                   customer se tu baat karega
✗ GBP settings                      tera login
✗ Vercel domain redirect            tera dashboard
✗ Video banana                      tera chehra, tera kaam
✗ JustDial / Sulekha listing        tera verification
```

---

# 💬 Sach — ek baar aur

Ab tera site:
```
174 pages          sabse zyada
1,870 words/area   competitor 3,392 (par unka 100% duplicate)
59 schema/area     competitor 43
81% overlap        competitor 100%
0.11s speed        sabse tez
```

**Website ka kaam ab sach me khatam hai.** Isse aage code likhna sirf padding
hoga.

Bacha hua:
```
Proximity   42%   badal nahi sakta
Reviews     36%   tu 44 pe hai        ← YAHAN SAB KUCH HAI
GBP         32%   naam abhi galat hai
On-page     19%   tu #1 hai isme
```

`ro-project.vercel.app` band kar (2 min), GBP naam theek kar (5 min), aur roz
ek review maang. **Ye 3 kaam 174 pages se zyada farak layenge.**
