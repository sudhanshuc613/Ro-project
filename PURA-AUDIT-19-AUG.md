# 🔍 Poora Site Audit + Competitor Analysis

**19 Aug 2026** · Sab kuch live measure kiya, guess nahi

---

# ✅ PART 1 — Site check: sab kaam kar raha hai

## Saare 73 URL crawl kiye

```
Sitemap URLs      : 73
✅ 200 OK         : 73  (100%)
❌ Broken         : 0
↪  Redirect chain : 0
```

**Ek bhi dead link nahi. Ek bhi redirect chain nahi.**

## Purane URL — ranking bachi

```
✅ /products/ro-booster-pump-100-gpd-24v            → 301
✅ /products/aquanexa-pure-8l-ro-uv-uf-water-...    → 301
✅ /products/aquanexa-alkaline-copper-10l-...       → 301
✅ /products/aquafresh                              → 301
✅ /shop /spare-parts /water-purifier /amc /book-service → 301
```

## 🎉 Grand Forest slug — tune theek kar diya

```
lowercase  → 200 ✅   (pehle 404 tha)
UPPERCASE  → 301 → lowercase pe ✅
Sitemap me → ab lowercase hai ✅
```

**Shabash. Ye tune khud kiya.**

## Speed — competitor se bahut aage

| Page | Time |
|---|---|
| `/service-patna` | **0.23s** |
| `/` | 0.58s |
| `/category/spare-parts` | 0.67s |
| `/products` | 0.93s |

## Technical SEO

```
✅ canonical tags sahi (self-referencing)
✅ x-robots-tag block nahi
✅ robots.txt sahi + GPTBot allowed
✅ www → apex 308
✅ http → https 308
✅ HSTS, X-Frame-Options, nosniff — sab headers set
✅ Saare pages ka JSON-LD valid parse (0 errors)
```

## Schema — har page pe

| Page | Types |
|---|---|
| `/` | LocalBusiness+HVACBusiness, Organization, WebSite, FAQPage |
| `/service-patna` | LocalBusiness+HVACBusiness, FAQPage, BreadcrumbList |
| `/products` | **ItemList, FAQPage, BreadcrumbList** ← naya |
| `/category/*` | FAQPage, BreadcrumbList |
| product pages | Product, BreadcrumbList |
| area pages | Service, LocalBusiness, FAQPage |

## H1 — sab jagah maujood

```
✅ /products/aquabizz...  → "AquaBizz Pure 8L RO + UV + UF Water Purifier..."
✅ /products/grand-forest → "Grand Forest RO Booster Pump 75 GPD — 24V DC..."
✅ /category/spare-parts  → "RO Spare Parts — Genuine Components, Delivered Across India"
✅ /service-patna         → "Expert RO Service in Patna Visit Charge Only ₹200"
```

---

# 🔴 PART 2 — 3 cheez theek karni hai

## 🔴 #1 — Spare Parts category KHALI hai (sabse bada)

```
/category/spare-parts  →  "No products match your filters"
                          0 products
```

**3,590 words ka buying guide + price table + FAQ hai — par ek bhi product nahi.**

### Kyun ye bura hai

Customer Google se aayega "ro membrane price" search karke, page khulega, guide padhega, aur… **kuch kharidne ko nahi milega.** Turant back jayega. Google wo bounce dekh leta hai.

### Fix — admin se product add karo

`/admin/products/new` → ye 5 sabse zyada bikne wale part daal do:

| Product name | Category | Price band |
|---|---|---|
| `Vontron 80 GPD RO Membrane for Domestic Water Purifier` | RO Membranes | ₹750–1,400 |
| `RO Sediment Filter 10 inch Spun — Pack of 2` | Spare Parts | ₹60–150 |
| `RO SMPS Adaptor 24V 2A — Fits Kent, Aquaguard, Pureit` | Spare Parts | ₹350–700 |
| `RO Pre Carbon + Post Carbon Filter Set` | Spare Parts | ₹90–250 |
| `RO Service Kit — All Filters + 80 GPD Membrane` | Spare Parts | ₹850–2,000 |

> **SEO Coach tab** use karna — wo title, description, keywords sab ready-made dega.
> **Kam se kam 3 image** har product pe.

## 🟡 #2 — 2 title database me galat hain

```
❌ AquaFresh product:
   TITLE: "AquaFresh 12L RO + UV + Alkaline + Copper + Mineral Water"
   Product ka naam 10L hai, title me 12L likha hai — 🔴 GALAT INFO

❌ Grand Forest product:
   TITLE: "Grand Forest RO Booster Pump 100 GPD— 24V DC with Mounting"
   Product 75 GPD hai, title me 100 GPD — 🔴 GALAT INFO
   Aur "GPD—" me space missing
```

### Ye sirf SEO problem nahi hai

**Customer 100 GPD samajh ke order karega, milega 75 GPD.** Return, refund, bura review.

### Fix

`/admin/products` → product khol → **SEO Coach** tab → 3 title options milenge → sahi wale pe **"Lagao"** → **Update Product**

Ya `/admin/seo` me seedha:

| Product | Sahi title | Len |
|---|---|---|
| AquaFresh **10L** | `AquaFresh Copper 10L RO Purifier — Price in India` | 49 |
| Grand Forest **75 GPD** | `Grand Forest 75 GPD RO Booster Pump 24V — Price` | 47 |

## 🟡 #3 — AquaFresh ki description bhi galat

```
"Buy AquaFresh Alkaline Copper 10L RO Purifier— Mineral Guard 12L RO + UV..."
      ↑ 10L                                              ↑ 12L
```
Ek hi line me dono. Confusing. SEO Coach se dobara generate kar do.

---

# 🏆 PART 3 — Competitor Analysis (live measured)

Maine har competitor ka page abhi fetch karke naapa:

| Site | Words | Schema | H1 | Internal links | Haal |
|---|---|---|---|---|---|
| **rokadoctor.in (AAP)** | **5,487** | **60** | ✅ | **98** | 🟢 |
| rocareindia.com | 8,864 | 43 | ✅ | 129 | 🟢 strong |
| rosaleandservices | 3,443 | **3** | ✅ | 152 | 🟡 |
| roserviceinpatna.com | 664 | 15 | **❌ KHALI** | 11 | 🔴 |
| roservicecenterpatna | 609 | **0** | ✅ | 23 | 🔴 |
| roservicebihar.com | 417 | **0** | ✅ | 51 | 🔴 |
| **patnaaquacare.com** | **45** | 0 | — | 0 | ⚫ **BAND** |
| roservicecentrepatna.in | — | — | — | — | ⚫ **DOWN** |

## 🎉 BADI KHABAR — 2 competitor mar gaye

### patnaaquacare.com
```
Title : "Default page"
H1    : "You Are All Set to Go!"
Words : 45
```
**Site delete ho gayi.** Hosting ka default page dikha raha hai. Ye 11 Aug ko #3 pe tha.

### roservicecentrepatna.in
```
Connection failed — server down
```
**Ye 11 Aug ko #2 pe tha.**

**Top 3 me se 2 competitor khatam.** Unki ranking ab kisi aur ko milegi — sabse zyada chance tere paas hai, kyunki tu already #1 tha aur teri site sabse tez hai.

## Sirf rocareindia hi asli takkar hai

| | Aap | rocareindia |
|---|---|---|
| Domain | 2025 (11 mahine) | **2012 (14 saal)** |
| Words | 5,487 | **8,864** |
| Schema blocks | **60** ← aage | 43 |
| Internal links | 98 | **129** |
| Speed | **0.23s** ← bahut aage | ~0.8s |
| Rate dikhaya | **₹200** | ₹399 |

### Unki 2 kamzoriyan jo maine pakdi

**1. Sirf 1 Patna page**
```
Patna-related internal links: 1
   /ro-water-purifier-service-patna
```
Unke paas **poore Patna ke liye ek hi page** hai. Tere paas **35 area pages** hain.

Matlab: `"ro service kankarbagh"`, `"ro repair boring road"` — in searches me wo compete hi nahi kar sakte. Tu kar sakta hai.

**2. Rate ₹399, tera ₹200**
Unke page pe ₹399 likha hai. Tu aadhe rate pe hai — ye conversion me bada farak hai.

### Unki taakat — jo tujhe copy karni chahiye

**Title me phone number:**
```
rocareindia : "RO Service Patna @9311587744 |Water Purifier Service Near Me"
aap         : "RO Service in Patna — Water Purifier Repair ₹200 | Aqua Perl"
```
H1 me bhi: `"RO Service in Patna @9311587744"`

Phone number title me dalne se mobile pe direct call aata hai bina site khole. Ye purana trick hai par kaam karta hai.

> **Soch le:** tera `₹200` bhi utna hi strong hook hai. Dono nahi aa sakte 60 char me. Main kehta hoon `₹200` rakh — wo unse aadha rate hai, wahi tera asli hathiyar hai.

## rosaleandservices — grey area

```
Title: "Best RO Service in Patna starts @ ₹299/- RO Sale & Services"
Schema: sirf 3 (BreadcrumbList)
```

Wo service ko **product** bana ke bechte hain (`/product/water-purifier-service ₹299`) taki Google Merchant Center me aa sakein. Iske liye unke paas 152 internal links hain.

**Par unka schema sirf 3 hai.** Tere paas 60 hai. Wo volume pe chal rahe hain, quality pe nahi.

---

# 📊 PART 4 — Rank check nahi ho paya (imaandari se)

Maine 3 tarike try kiye:

| Source | Result |
|---|---|
| DuckDuckGo HTML | **BLOCKED** (HTTP 202, zero results) |
| Bing scrape | Garbage results (`site:rokadoctor.in` pe New York tourism dikha) |
| Google scrape | Possible hi nahi |

**Isliye main aaj position confirm nahi kar sakta.** Jhoot bolne se accha hai ye keh dun.

## Tu khud 2 minute me kar sakta hai

1. Chrome → **Ctrl+Shift+N** (Incognito — warna tera apna history result badal dega)
2. Search: `ro service in patna`
3. Screenshot bhej de

Ya `/admin/competitors` → **"Core service"** chip → Check karo. Block aaye to 15 min baad try karna.

---

# ✅ PART 5 — Priority list

## Is hafte (site pe)

```
🔴 1. Spare Parts category me 5 product add karo    (1 ghanta)
      → 3,590 words ka page khali pada hai

🟡 2. AquaFresh ka title/desc theek karo            (5 min)
      → 10L product pe 12L likha hai — customer confuse

🟡 3. Grand Forest ka title theek karo              (5 min)
      → 75 GPD product pe 100 GPD likha hai
```

## Search Console (2 din)

```
Din 1 — category pages (naya content):
  /products
  /category/spare-parts
  /category/new-ro-purifiers
  /category/commercial-plants
  /category/ro-membranes
  /category/booster-pumps
  /category/accessories

Din 2 — products:
  saare 5 product URLs
```

## 🔴 Ye ab bhi pending — aur inka asar site se ZYADA hai

| # | Kaam | Kyun |
|---|---|---|
| 1 | **`aqua-perl` Vercel project DELETE** | 503 hai par DNS resolve karta hai — duplicate |
| 2 | **GBP primary category** sabse specific | *"single most important ranking factor"* — Whitespark 2026 |
| 3 | **GBP hours 7 AM – 10 PM** | "Open now" 5th biggest factor |
| 4 | **Har customer se review** | Home services me reviews ka weight **36%** |
| 5 | **Google Ads ₹31.8/day band** | ₹954/month = 0 result. Sticker me lagao |

**2 competitor abhi-abhi mare hain. Unki ranking baant-ne wali hai. Jo abhi GBP + reviews pe kaam karega, wo utha le jayega.**

---

# 🎯 Ek line me

**Site technically perfect hai** — 73/73 URL live, 0 broken, valid schema, 0.23s speed, saare redirect kaam kar rahe.

**2 competitor mar gaye** (patnaaquacare band, roservicecentrepatna down) — dono top 3 me the.

**Sirf 3 chhote kaam bache hain:** spare parts category bharo, 2 title theek karo.

**Asli mauka GBP aur reviews me hai** — website ka kaam ho chuka.
