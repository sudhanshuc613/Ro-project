# 🗺️ Aqua Perl — Poora System Roadmap

**Banaya:** 13 Aug 2026 · **Site:** rokadoctor.in · **Repo:** github.com/sudhanshuc613/Ro-project

Ye document sirf wahi likhta hai jo **sach me code me maujood hai** — maine har cheez file se ginn ke nikali hai, yaad se nahi likhi.

---

# 📊 System ek nazar me

```
Kul code                29,562 lines
TypeScript files        188
Pages                   49
API endpoints           37
React components        69
Database models         36
Database enums          15
Backend services        10
Live URLs (sitemap)     72
Test checks             237 (sab pass)
```

**Stack:** Next.js 14.2.35 (App Router) · TypeScript · Tailwind 3.4.9 · Prisma 5.22 · PostgreSQL (Neon) · NextAuth 4.24 · Vercel (region `bom1` — Mumbai)

---

# 🏢 Business model — 2 dhande ek site pe

| | Patna Local Service | Pan-India E-commerce |
|---|---|---|
| **Kya** | RO repair, installation, AMC | Purifier, spare parts, commercial plants |
| **Rate** | ₹200 visit charge | Product price + shipping |
| **Priority** | 🔴 **PRIMARY** — yahi kamai hai | 🟡 Secondary |
| **SEO focus** | 35 area pages + 21 brand pages | Product pages + category pages |
| **Kaise aata hai** | Google local search, Map Pack, phone call | Google Shopping, organic product search |

> Tera apna statement: *"mujhe kamane ke liye service chahiye, bahut kam log hote hain jo parts bhi kharidte hain."*
> Poora system isi hisaab se bana hai — e-commerce bhi service ka **lead generator** hai.

---

# 🌐 PART 1 — Public Website (customer jo dekhta hai)

## 1.1 Homepage `/` — service-first landing

10 section, upar se neeche:

| # | Component | Kya karta hai |
|---|---|---|
| 1 | `ServiceHero` | ₹200 visit charge, call button, 90-min response |
| 2 | `TrustBar` | 4.8★ · 44 reviews · 30-day warranty · genuine parts |
| 3 | `ProblemSolver` | 8 common RO problem → click → booking |
| 4 | `RealWork` | Asli kaam ki photos |
| 5 | `ServiceBookingForm` | Naam + phone + area + problem → lead |
| 6 | `PriceComparison` | Tera ₹200 vs competitor ₹350–399 |
| 7 | `AreaCoverage` | 35 area ka grid, har ek apne page pe link |
| 8 | `HowItWorks` | 4 step: call → visit → repair → warranty |
| 9 | `ShopStrip` | Products ka strip (e-commerce ka entry) |
| 10 | `FaqAccordion` | 20 FAQ (FAQ schema ke saath) |

## 1.2 Service pages — SEO ki asli taaqat

```
/service-patna                    ← Pillar page, 5,488 words
/service-patna/[area]             ← 35 area pages
/service-patna/brand              ← Brand index
/service-patna/brand/[brand]      ← 21 brand pages
```

**35 areas** (har ek ka apna pincode, TDS band, common failure, landmarks):
```
Kankarbagh · Boring Road · Patliputra Colony · Rajendra Nagar · Danapur
Bailey Road · Kadamkuan · Ashiana Nagar · Rajiv Nagar · Gola Road
Gandhi Maidan · Phulwari Sharif · Khagaul · Digha · Patna City · Kumhrar
Buddha Colony · Kurji · Rukanpura · Shastri Nagar · Mithapur · Bankipur
Anisabad · Gardanibagh · Kidwaipuri · Lodipur · Lohia Nagar · Keshri Nagar
Khajpura · Hanuman Nagar · Raja Bazar · Rajapur · Sheikhpura · Mahendru
New Punaichak
```

**21 brands** (service ke liye):
```
Kent · Aquaguard · Livpure · Pureit · AO Smith · Blue Star · Havells
Aquafresh · Aquasure · Nasaka · Zero B · Tata Swach · LG · Whirlpool
Panasonic · Faber · V-Guard · Konvio Neer · AquaUltra · Commercial Plants
Other Brands
```

**Ye pages copy-paste nahi hain** — maine measure kiya:
| | Tera site | rocareindia.com (competitor) |
|---|---|---|
| Area pages ka vocabulary overlap | **7.5% average** | **100% (kurji vs rukanpura same)** |
| Identical sentences | **0** | **67 of 136 (49%)** |

Google doorway pages ko penalise karta hai. Tere pages safe hain.

## 1.3 E-commerce pages

```
/products                  Catalog + filters
/products/[slug]           Product detail (PDP)
/category/[slug]           6 categories
/search                    Search results
/cart                      Cart
/checkout                  Checkout
/checkout/success          Order confirm
/amc-plans                 3 AMC plans
/track-order               Order tracking (phone se)
/track/[ticket]            Service ticket tracking
/contact                   Contact + form
```

**PDP pe kya hai:**
- Zoomable image gallery (2–5 images)
- Price / MRP / discount % / stock status
- Pincode checker — delivery ETA + Patna install offer
- Spec table (grouped: General / Purification / Electrical / Dimensions)
- Related products
- Review summary
- Sticky add-to-cart bar (mobile)

## 1.4 Auth + Account

```
/login  /register  /forgot-password
/account                          Dashboard
/account/orders                   Order history
/account/orders/[no]/invoice      GST invoice (printable)
/account/services                 Service requests
/account/machines                 Registered RO machines
/account/amc                      AMC subscriptions
/account/addresses                Saved addresses
/account/wishlist                 Wishlist
/account/reviews                  Reviews likhna
/account/profile                  Profile edit
/account/notifications            Notifications
```

---

# 🔐 PART 2 — Admin Panel (`/admin`)

18 pages. Login: phone `8969821440`.

## 2.1 Overview
| Page | Kya karta hai |
|---|---|
| `/admin` | Dashboard — revenue chart, live feed, low stock, recent orders |

## 2.2 Catalog
| Page | Kya karta hai |
|---|---|
| `/admin/products` | Product list, search, filter |
| `/admin/products/new` | **Naya product add** (6 tabs — neeche detail) |
| `/admin/products/[id]` | Product edit |
| `/admin/categories` | Category manage |
| `/admin/inventory` | Stock levels, low-stock alerts |
| `/admin/media` | Image library |

## 2.3 Sales (Pan-India)
| Page | Kya karta hai |
|---|---|
| `/admin/orders` | Order list |
| `/admin/orders/[id]` | Order detail + status change |
| `/admin/abandoned-carts` | Chhode hue cart — follow-up ke liye |

## 2.4 Service (Patna)
| Page | Kya karta hai |
|---|---|
| `/admin/service-requests` | Lead pipeline — NEW → COMPLETED |
| `/admin/service-due` | Kis customer ka filter change due hai |
| `/admin/amc` | AMC contracts |
| `/admin/technicians` | Technician manage |

## 2.5 System
| Page | Kya karta hai |
|---|---|
| `/admin/customers` | Customer list + password reset (SUPER_ADMIN) |
| `/admin/seo` | Har page ka meta title/description **GUI se** edit |
| `/admin/settings` | Phone numbers, site settings |
| `/admin/security` | Apna password badlo (strength meter ke saath) |

## 2.6 🆕 Product Form — 6 tabs (12 Aug ko upgrade hua)

```
Basic · Pricing · Images · Specs · SEO · SEO Coach [ 72 ]
                                                    ↑ live score
```

### Basic
- Product name (SEO Coach behtar naam suggest karta hai)
- SKU, URL slug (auto-fill)
- Type: New RO / Spare Part / Commercial Plant / Accessory
- Category
- **Brand — 29 brands + naya khud bana sakte ho** 🆕
- Short + full description
- Purification tech chips (RO, UV, UF, TDS, Alkaline, Copper, Mineral)
- Status: Draft / Active / Out of Stock / Archived
- Toggles: Featured / Pan-India / Requires installation / Free shipping

### Pricing
- MRP, selling price, cost price (margin auto-calc)
- GST rate
- **HSN code — 6 button, ek click me code + GST dono** 🆕
- Stock quantity, low-stock threshold
- Warranty months
- Storage litres (ya capacity LPH commercial ke liye)

### Images
- Phone/computer se seedha upload (drag-drop, Ctrl+V)
- 2–5 images, primary select
- **Alt text auto-fill button** 🆕

### Specs
- **Template button — type ke hisaab se 15 rows auto** 🆕
- Grouped: General / Purification / Electrical / Dimensions
- **GTIN/EAN row** → Product schema me `gtin13` jata hai

### SEO
- Meta title, description, keywords
- Live Google preview

### 🆕 SEO Coach
- Live score 0–100
- 14 checks, har fail pe Hinglish explanation + number
- 3 ready-made titles (Google Shopping formula), `Lagao` button
- Meta description (158 char)
- Keyword bank (jo log actually type karte hain)

---

# 🔍 PART 3 — SEO System

## 3.1 Schema markup (JSON-LD) — 7 types

| Function | Kahan lagta hai | Kya deta hai |
|---|---|---|
| `organizationSchema()` | Har page | Company identity |
| `localBusinessSchema()` | Home, service pages | **Map Pack ke liye** — address, geo, hours, rating |
| `productSchema()` | PDP | Price, stock, **GTIN**, shipping, return policy |
| `reviewSchema()` | Homepage | 3 asli review + rating |
| `faqSchema()` | Service pages | FAQ rich result |
| `breadcrumbSchema()` | Sab | Breadcrumb trail |
| `websiteSchema()` | Root | Sitelinks search box |

**Product schema me 2026 ke mandatory fields hain:**
```json
"shippingDetails":         { rate, destination, handling 0-1 day, transit 2-7 days }
"hasMerchantReturnPolicy": { India, 7 days, free return }
"priceValidUntil":         auto +1 year
"gtin13":                  admin bhare to
```
Ye teeno 2026 me Google ke retail rich result ke liye practically required ho gaye hain.

## 3.2 Title system

| Page type | Format | Length |
|---|---|---|
| Layout default | `RO Service Patna & Water Purifier Repair — Aqua Perl` | 52 |
| Homepage | `RO Service in Patna — Water Purifier Repair ₹200` | 48 |
| `/service-patna` | same | 48 |
| Area page | `RO Repair in {area}, Patna — ₹200 Visit` | ≤48 |
| Brand page | `{Brand} RO Service in Patna — Repair & Filters` | ≤48 |
| Product | `{name} — Buy Online` (word boundary pe cut) | ≤60 |

**Research base (Zyppy 2026):**
| Length | Google rewrite rate |
|---|---|
| <50 | ~50% |
| **51–55** | **~40% ← sabse kam** |
| 56–60 | ~55% |
| 61–70 | ~70% |
| >70 | ~100% |

## 3.3 Admin-editable SEO
`seo_metadata` table har page ka title/description hold karta hai. **DB code ko override karta hai** — matlab tu `/admin/seo` se kuch bhi badal sakta hai bina code chhue.

> ⚠️ Isi wajah se homepage ka title code push karne se nahi badla tha — DB me purana pada tha.

## 3.4 Content assets
```
SERVICE_AREAS     35 areas (pincode, TDS, failure mode, landmarks)
SERVICED_BRANDS   21 brands
RO_PROBLEMS       8 problems + solution
FILTER_GUIDE      5 filter types
TDS_ZONES         4 Patna TDS zones
BUYING_GUIDE      5 buying tips
WHY_LOCAL         4 local-vs-company reasons
buildAreaFaqs()   Har area ke unique FAQ
```

## 3.5 Jo deliberately NAHI kiya

| Cheez | Kyun nahi |
|---|---|
| `llms.txt` | Ahrefs ne 137,000 domain study kiye — **97% files ko ZERO request aayi**. Google ke Gary Illyes/John Mueller ne confirm kiya Google use nahi karta. |
| Fake reviews | Pehle `reviewCount: 312` tha (asli 44). Hata diya — "spammy structured markup" penalty risk. |
| Fake social links | `facebook.com/aquanexa` etc. sab 404 the. Hata diye. |
| Doorway pages | Competitor 100% duplicate area pages banata hai. Tere 7.5% overlap pe hain. |

---

# 🗄️ PART 4 — Database (36 models)

## Users & Auth
```
User · Address · OtpChallenge · AuditLog
```
Roles: `CUSTOMER · TECHNICIAN · ADMIN · SUPER_ADMIN`

## Catalog
```
Brand · Category · Product · ProductImage · ProductSpecification
ProductVariant · ProductCompatibility · ProductReview
```

## Orders
```
Cart · CartItem · Wishlist · Coupon · CouponRedemption
Order · OrderItem · OrderStatusHistory · Payment
```

**Order state machine** (galat transition block hota hai):
```
PENDING → CONFIRMED → PACKED → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
                                              ↓
                                    RETURN_REQUESTED → RETURNED → REFUNDED
(CANCELLED har jagah se possible, DELIVERED tak)
```

## Service
```
Technician · ServiceRequest · ServiceStatusHistory
CustomerMachine · AmcSubscription · ServiceArea
```

**Service flow:** `NEW → CONTACTED → SCHEDULED → ASSIGNED → IN_PROGRESS → COMPLETED`

## System
```
SeoMetadata · Redirect · NotificationTemplate · Notification
DailyMetric · SearchQuery · SiteSetting · MediaAsset · Pincode
```

---

# ⚙️ PART 5 — Backend Services (10)

| Service | Kya karta hai |
|---|---|
| `product.service.ts` | Product fetch, related products, view counter, cache |
| `catalog.service.ts` | Faceted filtering, brand/category list |
| `order.service.ts` | Order create, state machine, stock deduct |
| `service.service.ts` | Service request lifecycle, technician assign |
| `amc.service.ts` | AMC subscriptions, renewal dates |
| `machine.service.ts` | Customer machine registry, service-due calc |
| `otp.service.ts` | **4-channel OTP** — WhatsApp, WhatsApp-reverse, SMS, DEV |
| `media.service.ts` | Image upload → WebP → Vercel Blob ya Postgres |
| `analytics.service.ts` | Daily metrics, search queries |
| `audit.service.ts` | Har admin action ka log |

## OTP system — 4 purposes
```
LOGIN · ORDER_COD · SERVICE_BOOKING · PASSWORD_RESET
```

## Cron jobs (Vercel)
```
0 4 * * *   /api/cron/amc-reminders     Roz 4 AM UTC (9:30 AM IST)
0 5 * * *   /api/cron/abandoned-cart    Roz 5 AM UTC (10:30 AM IST)
```

---

# 📱 PART 6 — Mobile fixes (jo bug the, ab theek)

| Bug | Fix |
|---|---|
| Filter sidebar + grid mobile pe side-by-side (cluttered) | Filter/sort ab grid ke upar (`lg:hidden` control bar) |
| Drawer khulne pe background scroll hota tha | `useBodyScrollLock.ts` — position:fixed technique (iOS Safari ke liye) |
| Product card mobile pe bada | Padding 16→10px, gap 20→12px, tech chips 4→2 |
| Category navigation | `CategoryChips.tsx` — swipeable strip |
| Password field | `PasswordInput.tsx` — show/hide toggle, 6 jagah |

---

# 📈 PART 7 — Analytics

**GA4 `G-JP9HDZ9SE3`** live hai (3 JS chunks me verify kiya).

Events track hote hain:
```
phone_call_click     tel: link pe click
whatsapp_click       wa.me link pe click
generate_lead        Form submit
purchase             Order complete
```

> ⚠️ Pehle GA4 code tha hi nahi — `window.gtag?.()` call hota tha par script load hi nahi hoti thi. **Months tak zero lead track hua.** Ab theek hai.

---

# 🧪 PART 8 — Testing

```bash
bash scripts/verify-all.sh      # sab ek saath
```

| Script | Checks |
|---|---|
| `verify-product-admin.sh` | 68 |
| `verify-brand-rename.sh` | 51 |
| `verify-titles-and-schema.sh` | 44 |
| `verify-admin-full.sh` | 44 |
| `verify-password-features.sh` | 30 |
| **TOTAL** | **237** |

Plus: `scripts/rank-tracker.mjs` — 22 keywords × 10 competitors track karta hai.

---

# 🏆 PART 9 — Competitor position

**Live measured (11 Aug 2026), `"ro service in patna"`:**
```
 1. rokadoctor.in            ← TU YAHAN HAI
 2. roservicecentrepatna.in
 3. patnaaquacare.com
 4. justdial.com
 5. roservicecenterpatna.com
 6. rosaleandservices.com
 7. rocareindia.com
```

**Content depth comparison:**
| Domain | Registered | Words | Schema | Internal links |
|---|---|---|---|---|
| **rokadoctor.in** | 2025-09-04 | **5,488** | **20+** | **47** |
| rocareindia.com | 2012-10-11 | 8,719 | 13 | 107 |
| rosaleandservices.com | 2021-07-02 | 3,443 | 1 | 70 |
| patnaaquacare.com | 2026-01-26 | 804 | 14 | 0 |
| roserviceinpatna.com | 2026-01-31 | 664 | 15 | 0 |
| roservicecenterpatna.com | 2025-12-31 | 542 | **0** | 9 |
| roservicebihar.com | 2025-10-17 | **417** | **0** | 21 |

**Sirf rocareindia tujhse aage hai content me — aur wo 14 saal purana domain hai aur uske area pages 49% duplicate hain.**

---

# ✅ PART 10 — Ab kya kaam baaki hai

## 🔴 Turant (tere haath me hai, code ka kaam nahi)

| # | Kaam | Kyun zaroori | Time |
|---|---|---|---|
| 1 | **Naya zip push karo** | 29 brands + SEO Coach abhi live nahi hai | 10 min |
| 2 | **`aqua-perl` Vercel project DELETE karo** | Duplicate content Google index me — 503 hai par DNS resolve karta hai. Settings → Delete Project. **`ro-project` mat delete karna** | 2 min |
| 3 | **2 purane product ka naam badlo** | `AquaNexa` DB me hai (41 baar us page pe). `/admin/products` → naam badlo → **SLUG MAT BADALNA** | 5 min |
| 4 | **GBP naam theek karo** | Abhi `Aqua Perl \| Ro Service Centre - Best Ro Service in Patna` — "Best" + keyword stuffing = suspension risk. 44 reviews ud sakte hain | 5 min |
| 5 | **Asli photos bhejo** | `public/service/*.jpg` AI-generated hain. GBP reverse image search se pakad sakta hai | — |

## 🟡 Is hafte

| # | Kaam | Impact |
|---|---|---|
| 6 | **Google Ads budget ₹31.8 → ₹150/day** | Abhi 1.3 click/day. Google ko sikhne ke liye 10-15 click/day chahiye. 1 saal se zero call isi wajah se |
| 7 | **Ads conversion tag lagao** | `AW-` tag install nahi hai. Google ko pata hi nahi kaunsa click call banta hai. Conversion ID + Label bhejo, main laga dunga |
| 8 | **URL Inspection** baaki area pages | 10/day limit. List `AB-AAGE-KYA-KARNA.md` me hai |
| 9 | **GBP posting 2-3×/week** | 2026 policy: 30 din inactive = visibility drop |

## 🟢 Jab time mile — mere paas ready hai, bolo to bana dunga

| # | Feature | Kya milega | Effort |
|---|---|---|---|
| 10 | **Blog system** | rocareindia ke 193 posts hain, tere 0. Informational keywords ("ro me kya kharab hota hai") pakadne ke liye | Medium |
| 11 | **`.vercel.app` → apex redirect** | Duplicate content permanently band | Chhota |
| 12 | **Service-as-Product pages** | Rosale `/product/water-purifier-service ₹299` bechta hai Merchant Center me. Grey area par kaam karta hai | Medium |
| 13 | **Merchant Center feed** | Free product listings. Refund/Shipping/Terms pages chahiye pehle | Medium |
| 14 | **EMD domain** | `ropatna.in` ₹800-1500/yr → 301 redirect. Top 5 me 3 EMD hain | Chhota |
| 15 | **Review request system** | Reviews = local ranking ka 20%. Order complete pe auto WhatsApp | Medium |
| 16 | **Live technician tracking** | Customer ko dikhe technician kahan hai | Bada |

## ⚫ Business decisions (paisa lagega)

| # | Cheez | Detail |
|---|---|---|
| 17 | **Razorpay live keys** | Abhi MOCK MODE. Real payment ke liye KYC + `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` |
| 18 | **WhatsApp Business API** | Code poora ready. Meta app + 4 env vars chahiye |
| 19 | **MX record / Zoho Mail** | `support@rokadoctor.in` **bounce karta hai** — MX record hai hi nahi. Site pe email dikha rahe hain jo kaam nahi karta |
| 20 | **Vercel Pro plan** | Hobby plan pe commercial use technically violation hai (payment gateway ke saath) |

---

# 🎯 Priority — agar sirf 3 kaam kar sake

```
1. aqua-perl Vercel project delete          → duplicate content khatam
2. Google Ads ₹150/day + conversion tag     → 1 saal se zero call ka ilaaj
3. GBP naam theek + 2-3 post/week           → local ranking ka 32% wahi hai
```

Local SEO weights (Whitespark 2026):
```
Google Business Profile   32%   ← sabse bada
Reviews                   20%
On-page (website)         15%   ← ye maine kar diya
Behavioral signals         9%
Backlinks                  8%
Citations                  6%
```

**Website ka 15% mera kaam tha — wo ho gaya. Bacha 52% (GBP + reviews) tere haath me hai.**

Map Pack = 44% clicks · Organic = 29% · Ads = 19%

---

# 🔑 Zaroori info ek jagah

```
Domain          rokadoctor.in (GoDaddy)
A record        @ → 216.198.79.1 (Vercel)
Rollback IP     65.108.44.247 (purana PHP host)
SSL valid       3 Nov 2026
Vercel project  ro-project (team: Choudhary, Hobby plan)
GA4             G-JP9HDZ9SE3
Admin login     8969821440
Visit charge    ₹200
Phones          8969821440 (primary) · 9661288308
Address         Sai Gali, Opposite B-62, Buddha Colony, Patna 800001
GBP             4.8★ · 44 reviews (asli data — kabhi mat badhana)
```

## ⛔ Kabhi mat karna
```
npm audit fix --force      ← build tod chuka hai
git revert HEAD            ← rollback hai, upload nahi
git reset --hard           ← sab local kaam mit jayega
GitHub pe pencil ✏️ icon    ← 2 baar merge conflict de chuka hai
Product ka SLUG badalna    ← indexed URL 404 ho jayega
reviewCount badhana        ← spammy markup penalty
```

## ✅ Rollback ka sahi tarika
```
Vercel → Deployments → purana 🟢 Ready → ⋯ → Promote to Production
```
30 second, git ko haath lagaye bina.
