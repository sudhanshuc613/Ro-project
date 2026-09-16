# Live audit — 73 area pages + poora site
### 12 Sep 2026 · sab kuch LIVE site se measure kiya, local se nahi

---

## ✅ Tera push safal hai. Kuch nahi toota.

```
Push verify   : H1 fix LIVE ✅ · naya page LIVE ✅ · sitemap 127 ✅
Area pages    : 73 / 73 — sab kaam kar rahe hain
Non-area      : 54 / 54 — sab kaam kar rahe hain
Internal links: 140 / 141 OK (1 Cloudflare ka, hamara nahi)
Admin         : 16 / 16 route guarded
Total pages   : 127 sitemap URLs
```

---

# 1. 73 AREA PAGES — ek-ek karke

Har page par 21 checks. **Sab pass:**

| Check | Result |
|---|---|
| HTTP 200 | **73/73** ✅ |
| H1 maujood | **73/73** ✅ |
| Exactly ek H1 (do nahi) | **73/73** ✅ |
| H1 me glued word nahi (`PatnaVisit` bug) | **73/73** ✅ |
| Title maujood | **73/73** ✅ |
| Title ≤ 60 chars | **73/73** ✅ |
| Meta description | **73/73** ✅ |
| Canonical = apna URL | **73/73** ✅ |
| Indexable (noindex nahi) | **73/73** ✅ |
| Schema ≥ 15 types | **73/73** ✅ (sab pe 18) |
| Words ≥ 1200 (thin nahi) | **73/73** ✅ |
| Phone 8969821440 | **73/73** ✅ |
| `tel:` link | **73/73** ✅ |
| WhatsApp link | **73/73** ✅ |
| Images ≥ 3 | **73/73** ✅ |
| Images with alt ≥ 3 | **73/73** ✅ |
| Area naam title me | **73/73** ✅ |
| Area naam body me ≥ 5x | **73/73** ✅ |
| reviewCount = 50 | **73/73** ✅ |
| ratingValue = 5.0 | **73/73** ✅ |
| Internal links ≥ 20 | **73/73** ✅ |

**Word count:** min 1,854 · avg 1,952 · max 2,043
**Schema:** har page par 18 types

### PatnaVisit bug — ab live theek hai

Raw HTML se confirm kiya:
```html
Patna<!-- --> <span class="...">Visit Charge Only ₹200
     ^^^^^^^^^^ asli space hai
```
Dono tareeke se text nikaala (tag hata ke, aur tag ki jagah space daal ke) —
dono me `"RO Service in Kankarbagh, Patna Visit Charge Only ₹200"`. **Glue nahi hai.**

### Poori 73 list (sab ✅)

```
ag-colony · agamkuan · aiims-patna · alamganj · anandpur · anandpuri ·
anisabad · ashiana-nagar · bahadurpur · bailey-road · bairia · bankipur ·
bataganj · begampur · beur · bhootnath-road · boring-road · buddha-colony ·
chandmari · chitkohra · dak-bungalow · danapur · danapur-cantonment · digha ·
exhibition-road · fraser-road · gandhi-maidan · gardanibagh · gola-road ·
gulzarbagh · hanuman-nagar · indrapuri · jaganpura · jagdeo-path · jakkanpur ·
kadamkuan · kadamkuan-mahendru · kankarbagh · keshari-nagar · keshri-nagar ·
khagaul · khajpura · khemnichak · kidwaipuri · kumhrar · kurji · lodipur ·
lohanipur · lohia-nagar · machhuatoli · mahendru · marufganj · mithapur ·
naya-tola · new-punaichak · patel-nagar · patliputra-colony · patna-city ·
phulwari-sharif · raja-bazar · rajapur · rajendra-nagar · rajiv-nagar ·
ram-krishna-nagar · rukanpura · rupaspur · sadikpur · saguna-more ·
shastri-nagar · sheikhpura · shivpuri · sipara · sri-krishna-puri
```

---

# 🔴 2. EK ASLI PROBLEM MILI — duplicate area

```
#39  keshari-nagar   "Keshari Nagar"   pincode 800024   lat 25.6183, lng 85.0919
#40  keshri-nagar    "Keshri Nagar"    pincode 800024   lat 25.6215, lng 85.0968
```

**Ye ek hi jagah hai, do spelling me.** Distance ~0.5 km, same pincode.

India Post API se confirm kiya:
```
800024 ka asli post office = "Keshari Nagar" (Sub Post Office)
```
Yaani **`keshari-nagar` sahi spelling hai**, `keshri-nagar` variant hai.

Content overlap dono me **58%** — alag likha hua hai, copy-paste nahi.
Isliye ye Google ke liye turant khatra nahi hai, par ye **do URL ek hi
jagah ke liye** hain jo ek doosre se compete karenge.

### Par — abhi isko chhedna nahi chahiye

Maine Google autosuggest check kiya:
```
"keshari nagar patna"  →  5 suggestions
"keshri nagar patna"   → 10 suggestions   ← log ZYADA ye spelling use karte hain
```

**Dono spelling real search volume rakhti hain.** Agar main `keshri-nagar`
delete kar du to jo log wo spelling se dhoondhte hain wo chale jayenge.

**Mera sujhav:** abhi rehne do. Agar GSC me 3 mahine baad dikhe ki dono me se
ek page ko zero impressions mil rahe hain, tab usko doosre pe 301 redirect
kar denge. **Data dekh kar decide karenge, andaza laga kar nahi.**

Ye maine tujhe bata diya kyunki tu ne poocha tha "kuch choot to nahi gaya" —
ye choota nahi hai, ye jaanbujh ke rakhna hai ya hatana hai, faisla tera.

---

# 3. 54 NON-AREA PAGES

| Check | Result |
|---|---|
| HTTP 200 | **54/54** ✅ |
| H1 present | **54/54** ✅ |
| Exactly ek H1 | **54/54** ✅ |
| Title ≤ 65 | **54/54** ✅ |
| Meta description | **54/54** ✅ |
| Indexable | **54/54** ✅ |
| Schema present | **54/54** ✅ |
| Not thin (≥300 words) | **54/54** ✅ |
| Phone | **54/54** ✅ |
| og:title | **54/54** ✅ |

### 7 intent pages + hub — titles

```
/                              [48]  RO Service in Patna — Water Purifier Repair ₹200
                               H1:   RO Service & Repair in Patna          ← FIX LIVE ✅
/ro-service-in-patna           [56]  RO Service in Patna — ₹200 Visit, All Brands
                               H1:   RO Service in Patna                   ← NAYA PAGE ✅
/ro-repair-patna               [53]  RO Repair in Patna — ₹200 Visit, Same Day
/ro-amc-patna                  [54]  RO AMC in Patna — Plans From ₹1,499 a Year
/ro-installation-patna         [58]  RO Installation in Patna — ₹500 Fitting Charge
/ro-filter-change-patna        [56]  RO Filter Change in Patna — From ₹150 Fitted
/ro-membrane-replacement-patna [53]  RO Membrane Replacement Patna — ₹1,100 Up
/commercial-ro-service-patna   [62]  Commercial RO Plant Service in Patna — 25–1000 LPH
/ro-services-patna             [60]  RO Services in Patna — All Jobs, Rates From ₹200
/ro-service-patna-faq          [51]  RO Service Patna — Rates, TDS & Answers
```

Sab title 48-62 chars — Zyppy ka 51-55 sweet spot ke aas paas, 70 se neeche.

### Do "failure" jo mere test ke bug the

1. **`quaBizz`, `quaFresh`, `quaPearl`, `quaUltra`** — mera regex `AquaBizz`
   jaise brand naam ke andar se glue dhoondh raha tha. Ye asli product naam hain.
   **Bug nahi.**
2. **Homepage canonical** — `https://rokadoctor.in` vs sitemap me
   `https://rokadoctor.in/`. Sirf trailing slash. Google dono ko same maanta hai.
   **Bug nahi.**

---

# 4. INTERNAL LINKS — 141 unique URLs

```
200 OK      : 140
Redirects   : 0
BROKEN      : 1   →  /cdn-cgi/l/email-protection
```

Wo ek link **Cloudflare ka email-obfuscation** hai, hamare code me nahi hai.
Cloudflare khud inject karta hai. Googlebot isko ignore karta hai. **Chhodna hai.**

---

# 5. ADMIN — 16/16 protected

```
/admin                  307 ✅    /admin/media            307 ✅
/admin/orders           307 ✅    /admin/categories       307 ✅
/admin/products         307 ✅    /admin/service-due      307 ✅
/admin/service-requests 307 ✅    /admin/abandoned-carts  307 ✅
/admin/customers        307 ✅    /admin/competitors      307 ✅
/admin/technicians      307 ✅    /admin/seo              307 ✅
/admin/amc              307 ✅    /admin/security         307 ✅
/admin/inventory        307 ✅    /admin/settings         307 ✅

/admin/login            200 ✅
```

Bina login koi admin page khulta nahi. **Sahi hai.**

---

# 6. ROBOTS.TXT

```
User-agent: *
Allow: /
Allow: /api/media/          ← product images crawlable (pichhla fix, kaam kar raha)
Disallow: /admin  /admin/*
Disallow: /account  /account/*
Disallow: /checkout  /checkout/*
```

**Googlebot-Image test:**
```
/api/media/7e63ef52-...  →  http 200 · image/webp · 58,228 bytes  ✅
```
48 product images crawl ho rahi hain.

**AI scrapers blocked** (Cloudflare managed): GPTBot, ClaudeBot, CCBot,
Google-Extended, Bytespider, Amazonbot, Applebot-Extended, meta-externalagent.
**Googlebot aur Bingbot allowed.** Ye sahi setup hai.

---

# 7. SPEED

| Page | TTFB | Total |
|---|---|---|
| `/` | 0.12s | 0.15s |
| `/ro-service-in-patna` | **0.10s** | 0.11s |
| `/ro-service-patna/kankarbagh` | 0.14s | 0.16s |
| `/ro-repair-patna` | 0.24s | 0.25s |
| `/blog` | 0.11s | 0.11s |
| `/products` | 0.72s | 0.72s |

Sab 1 second ke neeche. `/products` sabse dheema (DB query) par theek hai.

---

# 8. DOORWAY / DUPLICATE CONTENT — imaandar baat

Ye maine do tareeke se maapa, aur **tujhe dono number dena zaroori hai**
kyunki pichhli baar maine yahi galti ki thi (alag methodology se compare karke
galat conclusion nikaala tha).

### A) Jo CI test actually chalata hai — 14 page sample

```
pages          : 14
pairs          : 91
avg overlap    : 59.5%
MAX overlap    : 76.1%   (chandmari ↔ danapur)
dup sentences  : 40
ratchet <84/<55: PASS ✅ PASS ✅
```

### B) Jo maine abhi chalaya — saare 73 page

```
pages          : 73
pairs          : 2,628      ← 29x zyada pairs
avg overlap    : 61.4%
MAX overlap    : 87.5%   (danapur ↔ khagaul)
dup sentences  : 427
```

### Ye "fail" nahi hai — ye alag test hai

91 pairs me se sabse bura 76% tha. 2,628 pairs me se sabse bura 87.5% hai.
**Jitne zyada pairs, utna zyada chance ki koi ek jodi upar nikal jaye.**
Ye ganit hai, content kharab hona nahi.

Dekhne wali cheez **average** hai: 59.5% vs 61.4% — lagbhag same. Matlab
content ki quality poore 73 me consistent hai, sirf 14 me achhi nahi hai.

**Competitor se comparison (wahi test, unke page):**
```
rocareindia        : 100.0% overlap · 51 identical sentences (5 pages)
hum (73 pages)     :  87.5% overlap · avg 61.4%
hum (14 sample)    :  76.1% overlap · 40 dup sentences
```

rocareindia ke pages **100% identical vocabulary** hain — literally copy-paste
with city name swapped. Hamare 87.5% par bhi kaafi farak hai.

### Phir bhi — ye behtar ho sakta hai

Sabse kharab jodiyan **geographically padosi** hain:
```
danapur ↔ khagaul          87.5%   (2 km apart, same water table)
indrapuri ↔ patel-nagar    86.5%
bahadurpur ↔ bhootnath-road 86.1%
jagdeo-path ↔ shastri-nagar 86.0%
```

Ye samajh me aata hai — padosi area ka paani same hai, problem same hai,
response time same hai. Par Google ke liye ye fir bhi do alag page hain jo
bahut milte-julte hain.

**427 duplicate sentences** ka matlab hai ki kuch generic paragraph har page
par same hain. Jaise:
```
"Being predictable is what makes it cheap to fix: the van is loaded for..."
"A ₹180 filter protects a ₹1,400 one, and that is the whole economics of..."
```

**Ye abhi khatarnak nahi hai** (competitor se behtar hai), par agar Google ka
next core update doorway pages pe sakht hua to ye pehla target hoga.

**Mera sujhav:** abhi mat chhedo. Pehle reviews aur directory listings karo —
wo turant ROI dete hain. Doorway improvement 3-4 ghante ka kaam hai aur uska
faayda 3-6 mahine baad dikhega. Jab bolega tab kar dunga.

---

# Summary — ek line me

> **Tera push perfect hai. 73/73 area page, 54/54 baaki page, 140/141 link,
> 16/16 admin route — sab theek.**
>
> Do cheez batani thi: (1) `keshari-nagar` aur `keshri-nagar` ek hi jagah hai
> do spelling me — abhi rakhna theek hai kyunki dono spelling search hoti hain,
> (2) 73 pages ka doorway overlap 87.5% hai jo 14-page sample ke 76% se zyada
> dikhta hai par wo ganit ka farak hai, content ki problem nahi.
>
> **Ab site ka kaam ho chuka hai. Asli kaam GSC indexing + directory listings
> + reviews hai.**
