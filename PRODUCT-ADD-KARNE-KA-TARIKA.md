# 📦 Product Add Karne Ka Sahi Tarika — Aqua Perl

**Kab likha:** 12 Aug 2026
**Kis liye:** Aaj tu products add kar raha hai. Ye padh ke add karega to har product Google me chance rakhega. Bina padhe add karega to product bana to jayega, par koi dhoondh nahi payega.

---

# 🔴 Pehle: 2 galtiyan jo maine kar rakhi thi

## Galti 1 — Brand dropdown me sirf 5 brand the

Tune screenshot bheja, usme dikha:
```
No brand · AquaNexa · Aquaguard · Kent · Livpure · Pureit
```

**Ye meri galti thi.** Seed file me maine sirf 5 brand daale the. Matlab AO Smith ka membrane, Havells ka SMPS, Blue Star ka purifier — kisi ka brand tag hi nahi ho sakta tha.

### ✅ Ab theek

**29 brands pehle se list me hain:**

| | | | |
|---|---|---|---|
| Aqua Perl | Kent | Aquaguard | Eureka Forbes |
| Pureit | Livpure | AO Smith | Blue Star |
| Havells | V-Guard | Faber | LG |
| Whirlpool | Panasonic | Atomberg | Kenstar |
| Tata Swach | Zero B | Nasaka | Aquasure |
| Aquafresh | Aqua Grand | AquaUltra | Konvio Neer |
| Wellon | Vontron | CSM | Dow Filmtec |
| Compatible / Universal | | | |

**Aur ab tu apna brand khud bhi likh sakta hai.** Brand box pe click → naam type kar → `+ "naam" se naya brand banao` dabao. Bas.

Vontron, CSM, Dow Filmtec deliberately daale — **membrane bechte waqt log inhi ke naam se search karte hain.**

## Galti 2 — Title bich mein kat raha tha

Tera live product page abhi ye title de raha hai:
```
AquaNexa Alkaline Copper 10L RO Purifier —… | Buy Online
```

Dekh — **"—…" bich me kat gaya.** Purana code letter ginn ke kaat deta tha, word dekhta hi nahi tha.

Ye kyun bura hai: Zyppy ki 2026 study ke hisaab se **70 se lambe title Google 100% baar khud badal deta hai.** Toota hua title aur pakka rewrite hota hai. Ab word boundary pe katta hai:
```
AquaNexa Alkaline Copper 10L RO Purifier…
```

> ⚠️ Aur haan — us page pe abhi bhi **"AquaNexa" 41 baar** likha hai. Wo naam **database me** hai, code me nahi. Neeche STEP 6 me theek karne ka tarika hai.

---

# 🎯 Naya: SEO Coach tab

Product form me ab **6 tab** hain. Aakhri naya hai:

```
Basic · Pricing · Images · Specs · SEO · SEO Coach [ 72 ]
                                              ↑ live score
```

Score ka rang:
- 🔴 **0–59** — abhi live mat karo
- 🟡 **60–84** — chal jayega
- 🟢 **85+** — publish karo

## SEO Coach kya deta hai

**1. Kya-kya galat hai — Hinglish me, number ke saath**
```
🔴 Meta title 45–60 characters
   Abhi 31 chars. 51–55 pe Google sabse kam rewrite karta hai (~40%).

🔴 3 ya zyada images
   Abhi 1. Google 3–5 images ko sweet spot maanta hai.

🟡 Full description 500+ characters
   Abhi 210. Google spec 500–1,000 chars recommend karta hai.
```

**2. Teen ready-made title — har ek pe "Lagao" button**
```
Kent 8L RO + UV + UF Water Purifier — Buy Online
  52 chars · Buy intent · Matches "buy kent 8l ro online"          [Lagao]

Kent 8L RO Water Purifier Price ₹12,999
  39 chars · Price intent · Matches "kent ro price"                [Lagao]
```

**3. Meta description** — 158 char ke andar, ek click me lag jata hai

**4. Keyword bank** — jo log actually type karte hain, chip pe click karke add

**5. Google preview** — sach me kitna dikhega, kahan kategа

---

# 📝 Product add karne ka order (yahi order follow kar)

## STEP 1 — Basic tab

### Product Name — sabse important field

**Formula (yahi Flipkart, Amazon aur Google Shopping use karte hain):**
```
Brand → kya cheez hai → khaas feature → size/variant
```

| ❌ Aise mat likh | ✅ Aise likh |
|---|---|
| `Alkaline Copper Purifier` | `Kent Alkaline Copper 10L RO + UV Water Purifier` |
| `Booster Pump` | `RO Booster Pump 100 GPD 24V DC for Kent, Aquaguard` |
| `Membrane` | `Vontron 80 GPD RO Membrane for Domestic Water Purifier` |

**Kyun:** Google product ke title se decide karta hai ki kaunsi search me dikhana hai. Title me "purifier" word hi nahi hoga to "water purifier" search me kabhi nahi aayega.

> SEO Coach khud 2-3 behtar naam suggest karega. Pasand aaye to **Lagao** daba de.

### Brand
- List me mil jaye → click
- Na mile → type karke `+ naya brand banao`
- **Kabhi khaali mat chhodo** agar brand pata hai. Google Merchant Center me brand har naye product ke liye zaroori hai.

### Type
| Kya bech raha hai | Type |
|---|---|
| Poora purifier | New RO Purifier |
| Membrane, filter, SMPS, pump | Spare Part |
| Shop/hotel ka bada plant | Commercial Plant |
| Pipe, tap, elbow, tank | Accessory |

### Short Description — 80 se 300 character
Product card pe aur Google search me yahi dikhta hai. 2 line likh de, kya hai aur kiske liye.

### Full Description — 500 character se zyada
Google ka apna spec **500–1,000 characters** kehta hai. Sabse important baat **pehle 160 characters** me likh.

Ye 5 baat likhega to enough ho jayega:
1. Kya hai aur kis paani ke liye (municipal / borewell / tanker)
2. Purification kitne stage
3. Kaun se ghar ke liye (kitne log)
4. Kya-kya saath aata hai
5. **Patna me installation ₹200 me** ← ye line har product pe daal

---

## STEP 2 — Pricing tab

| Field | Kya bharna |
|---|---|
| **MRP** | Selling price se **zyada** rakho — tabhi discount % dikhega |
| Selling Price | Asli rate |
| Cost Price | Tera cost. Sirf tujhe dikhta hai, margin calculate karta hai |
| **HSN Code** | 🆕 Neeche button se chunno |
| Stock Quantity | 0 rakhoge to "Out of Stock" dikhega |
| Warranty | Months me |

### 🆕 HSN buttons — ek click me code + GST dono

```
84213900 — Water purifier / RO system (domestic)      GST 18%
84212190 — Water filtering & purifying machinery      GST 18%
84219900 — RO membrane, filter cartridge, spare parts GST 18%
84137010 — Booster pump / centrifugal pump            GST 18%
85043100 — SMPS / adaptor / transformer               GST 18%
39172390 — PVC / PE tubing and pipe fittings          GST 18%
```

GST invoice me HSN mandatory hai. Ab dhoondhna nahi padega.

> **MRP = Selling price mat rakhna.** Discount % rich result me dikhta hai, CTR badhata hai.

---

## STEP 3 — Images tab

**Kam se kam 3 images.** Google 3–5 ko sweet spot maanta hai.

- Photo phone se seedha upload ho jati hai (drag-drop / Ctrl+V bhi)
- **1500×1500 px ya bada** rakh (Merchant Center 31 Jan 2027 se 500×500 minimum enforce karega)
- Photo pe **"SALE", "50% OFF", watermark mat lagana** → Merchant Center turant reject karta hai
- Product frame ka 75–90% bhare

### 🆕 Alt text ka button
`Khaali alt text bhar do` — har image ka alag, descriptive alt text apne aap bhar jata hai:
```
Kent Alkaline Copper 10L RO — RO + UV + Copper — front view
Kent Alkaline Copper 10L RO — side view
Kent Alkaline Copper 10L RO — installed on wall
```
Google Images se bhi customer aate hain. Ye 10 second ka kaam hai.

---

## STEP 4 — Specs tab

### 🆕 Template button

`RO purifier ka template bharo` daba — **15 row** apne aap aa jayengi:
```
General      → Model Name, Storage Capacity, Installation Type, Suitable For
Purification → Stages, Technology, Max TDS, Membrane Type, Purification Rate
Electrical   → Power Consumption, Operating Voltage
Dimensions   → W×D×H, Weight
General      → Warranty, EAN / Barcode (GTIN)
```

Spare part ka type select hoga to spare part ka template aayega. Bas value bharni hai.

**Kyun zaroori:** "8 litre ro purifier", "2000 tds ro", "24v booster pump" — ye long-tail searches spec table se hi match hoti hain.

### 🔥 GTIN row ko halke me mat lena

Template me ek row hai: **`EAN / Barcode (GTIN)`**

Product ke dabbe pe jo **barcode number** hai, wahi. 8, 12, 13 ya 14 digit.

**Google ka apna data:** sahi GTIN wale products ko **average 20% zyada clicks** milte hain.

Bharoge to Product schema me apne aap `gtin13` chala jayega. Nahi hai to khaali chhod do — **galat number mat daalna**, listing disapprove ho jayegi.

---

## STEP 5 — SEO tab + SEO Coach

1. **SEO Coach** tab khol
2. Jo 🔴 laal dikhe wo theek kar
3. Title me se ek chunn ke **Lagao**
4. Description **Lagao**
5. Keywords me se relevant chips click kar
6. Score **85+** aa jaye → Basic tab → Status **Active** → **Create Product**

---

# 🔴 STEP 6 — Purane 2 product ka naam theek kar

Ye product abhi bhi **AquaNexa** naam se live hain:

```
rokadoctor.in/products/aquanexa-pure-8l-ro-uv-uf-water-purifier
rokadoctor.in/products/aquanexa-alkaline-copper-10l-ro-purifier
```

Us page pe **AquaNexa 41 baar** likha hai. Ye database me hai, code me nahi — isliye rename se theek nahi hua.

### Kaise theek kare — GUI se (safe)

`/admin/products` → product khol → **Basic** tab:

| Field | Abhi | Kar do |
|---|---|---|
| Product Name | `AquaNexa Alkaline Copper 10L RO Purifier — Mineral Guard` | `Aqua Perl Alkaline Copper 10L RO + UV Water Purifier` |
| URL Slug | `aquanexa-alkaline-copper-10l-ro-purifier` | **⚠️ MAT BADALNA** |

> **🔴 Slug kabhi mat badalna.** Ye URL hai. Badla to Google ka indexed page 404 ho jayega aur ranking gir jayegi. Naam badalna theek hai, slug nahi.

Dusra product:
| Abhi | Kar do |
|---|---|
| `AquaNexa Pure 8L RO + UV + UF Water Purifier with TDS Controller` | `Aqua Perl Pure 8L RO + UV + UF Water Purifier with TDS Control` |

Phir **SEO Coach** khol ke title/description dobara **Lagao** kar de.

---

# 📊 Competitor kya kar rahe hain — measured, guess nahi

## Flipkart ka title pattern (live scrape se)
```
EUREKA FORBES Aquaguard 6 L RO + UV Water Purifier 2 Year Filter Life |
3-in-1 Active Copper Technology | 9 Stage Purification | 6L storage
```
Dekh: **Brand → Litre → Tech → Product Type → phir features**. Yahi formula.

## Google Shopping ka official rule
| Rule | Number |
|---|---|
| Title max | 150 characters |
| Actually dikhta | pehle ~70 characters |
| Description recommended | 500–1,000 characters |
| Critical zone | pehle 160–500 characters |
| Images | 3–5 sweet spot |
| GTIN ka fayda | +20% clicks (Google ka apna benchmark) |

## Title me ye words BAN hain
```
sale · best price · lowest price · free shipping · free delivery
discount · offer · cheap · best deal · buy now · limited time
hurry · act now · clearance · ALL CAPS
```
Merchant Center in par listing **reject** kar deta hai ya title khud rewrite kar deta hai. SEO Coach ye check karta hai.

## Spare parts market (TradeIndia se)
Tere competitor spare parts aise bechte hain:
```
Blue Mount Purity Replacement KIT              ₹2,999
Complete inline filter set (all brands)        ₹1,000
Water purifier sensor                          ₹350
12 Ltr RO Body                                 ₹800
THUNDERWELL 100 GPD Membrane                   —
```
Aur ek line jo pearlwater.in ne likhi hai:
> *"A local RO service with spare parts typically costs ₹1,500–3,500 in Indian cities in 2026"*

**Iska matlab tere liye:** part bechna hi asli kaam nahi hai — part ke saath **₹200 me fitting** offer karna asli kaam hai. Isliye maine har spare part ki auto-description me ye line daal di:

> *"Free fitting in Patna with our ₹200 visit. Call 8969821440."*

Part ka margin ₹200-500 hai. Fitting visit se service ka kaam khulta hai — **tera asli paisa wahi hai.**

---

# ✅ Har product publish karne se pehle — 10 second checklist

```
□ Naam me: brand + kya cheez hai + size    (e.g. "Kent 8L RO + UV Water Purifier")
□ Brand select kiya
□ MRP > selling price
□ HSN code bhara
□ 3 se zyada image
□ Alt text bhara (button daba de)
□ Spec template bhara, value daali
□ GTIN/barcode bhara (dabbe se dekh ke)
□ Full description 500+ chars
□ SEO Coach score 85+
□ Status = Active
```

---

# 🧪 Test report — maine chalaya, 12 Aug 2026

```
npm install (clean, node_modules delete karke)  EXIT 0  ✅
prisma generate                                 EXIT 0  ✅
tsc --noEmit                                    EXIT 0  ✅
npm run build                                   EXIT 0  ✅  (128 static pages)
prisma db push + seed                           EXIT 0  ✅  (29 brands seed hue)

verify-product-admin.sh      68/68   ✅  ← naya
verify-titles-and-schema.sh  44/44   ✅
verify-brand-rename.sh       51/51   ✅
verify-admin-full.sh         44/44   ✅
verify-password-features.sh  30/30   ✅
──────────────────────────────────────
TOTAL                      237/237   ✅

Public pages:  / · /products · /service-patna · /service-patna/kankarbagh
               /category/spare-parts · /contact  → sab 200
Sitemap:       72 URLs
Product JSON-LD: valid, GTIN + category + shippingDetails + returnPolicy
Homepage:      "AquaNexa" 0 baar
```

## Naye test jo add hue (68)
```
brands API bina login          → 401  ✅
brand create                   → created:true  ✅
same naam dobara (case alag)   → created:false, duplicate nahi bana  ✅
1-letter naam                  → 422 reject  ✅
DB me 29 brand, 0 duplicate    ✅
14 zaroori brand BRAND_SEED me ✅
edit page ke 6 tab render      ✅
Product schema me GTIN+category ✅
title word-boundary pe katta   ✅
```

---

# 📁 Kaunsi files badli

## Naya banaya (4)
```
src/lib/seo/product-seo.ts            SEO brain — brand list, title formula,
                                      score, keywords, spec templates, HSN
src/components/admin/BrandPicker.tsx  search + create brand box
src/components/admin/SeoAssistant.tsx SEO Coach panel
src/app/api/admin/brands/route.ts     GET + POST brands (admin only)
scripts/verify-product-admin.sh       68 checks
PRODUCT-ADD-KARNE-KA-TARIKA.md        ye file
```

## Chhua (6) — sirf add kiya, hataya kuch nahi
```
src/components/admin/ProductForm.tsx        BrandPicker + SEO Coach tab + HSN
                                            + spec template + alt fill
src/app/api/products/[id]/route.ts          hsnCode save hone laga
src/app/admin/(dashboard)/products/[id]/page.tsx   hsnCode load hone laga
src/lib/seo/schema.ts                       productSchema me gtin + category
src/lib/seo/metadata.ts                     fit() ab word boundary pe katta hai
src/app/(shop)/products/[slug]/page.tsx     gtin + category schema me bhejta hai
prisma/seed.ts                              5 → 29 brands
```

**Ek bhi purani cheez delete nahi hui.** Brand dropdown `<select>` sirf ek behtar component se replace hua — value (brandId) waise ka waisa jata hai.

---

# 📦 Zip details

```
aquanexa-project.zip   14,668,616 bytes (14 MB)   403 files
MD5                    90eae5a59750e7b7f23b43d5c69c2acd
integrity              No errors detected
.env leak              koi nahi (sirf .env.example)
images                 original size — 2.6 MB / 1.7 MB / 1.2 MB chhui nahi
```

**Sab test ek command me chalane ke liye:**
```bash
bash scripts/verify-all.sh
```

---

# ⛔ Rollback

Kuch bhi ulta ho:
```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git revert HEAD --no-edit
git push origin main
```
Ya Vercel → Deployments → purana 🟢 Ready → **⋯ → Promote to Production** (30 second)

---

# 🔴 Ek baat jo abhi bhi pending hai

**`aqua-perl-53b8.vercel.app`** — abhi 503 hai (tune pause kiya, achha kiya), **par DNS ab bhi resolve karta hai** (`216.198.79.195`).

Google ke index se tabhi hatega jab **project poora delete** hoga:
```
Vercel → aqua-perl project → Settings → niche scroll → Delete Project
```
> ⚠️ `ro-project` **mat** delete karna — wahi asli site hai.
