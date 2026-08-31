# ✅ Push aur Deploy dono ho gaye — ab sirf 2 chhote kaam

**18 Aug 2026, 20:35** · Commit `eba9566` live hai

---

# 🎉 Jo kaam ho gaya

Maine poora live audit chalaya. Ye sab **ab chal raha hai**:

## Site
```
rokadoctor.in                    200 OK · 0.42s
sitemap                          73 URLs
```

## 🔴 404 wala problem — SOLVE (sabse bada kaam)
```
✅ /products/ro-booster-pump-100-gpd-24v            → 301
✅ /products/aquanexa-pure-8l-ro-uv-uf-water-...    → 301
✅ /products/aquanexa-alkaline-copper-10l-...       → 301
✅ /products/aquafresh                              → 301
```
**Chaaron indexed URL ki ranking bach gayi.**

## Legacy paths
```
✅ /shop  /spare-parts  /water-purifier  /amc  /book-service   → sab 301
✅ Uppercase slug → 301
```

## Pan-India content — pehle vs ab

| Page | Pehle | Ab | Schema |
|---|---|---|---|
| `/products` | 1,183 | **2,591** | ItemList + FAQ + Breadcrumb ✅ |
| `/category/spare-parts` | 985 | **3,590** | FAQ + guide + price ✅ |
| `/category/new-ro-purifiers` | 985 | **3,620** | ItemList + FAQ ✅ |
| `/category/commercial-plants` | 985 | **2,841** | ItemList + FAQ ✅ |
| `/category/ro-membranes` | 985 | **2,857** | FAQ + guide ✅ |
| `/category/booster-pumps` | 985 | **2,541** | ItemList + FAQ ✅ |
| `/category/accessories` | 985 | **2,489** | FAQ + guide ✅ |

`/products` ka title bhi naya:
`Buy RO Purifier & Spare Parts Online — India 2026` ✅

## Product schema
```
✅ category field
✅ shippingDetails
✅ hasMerchantReturnPolicy
```

## Admin panel — sab live
```
✅ /admin/competitors     (Competitor Watch)
✅ /admin/seo             (Redirect Manager neeche)
✅ /admin/products/new    (SEO Coach tab)
```

## IndexNow
```
✅ https://rokadoctor.in/a7f3c9e2b8d1456c4e8a1b6d29f375e0.txt
```

---

# 🔴 KAAM 1 — Grand Forest product ka slug (5 min)

## Problem

```
Sitemap me: /products/Grand-Forest-ro-booster-pump-75-gpd-24v
                 ↓ 301 (middleware lowercase karta hai)
            /products/grand-forest-ro-booster-pump-75-gpd-24v
                 ↓ 404  ❌ TOOTA
```

**Wajah:** database me slug abhi bhi UPPERCASE hai (`Grand-Forest`). Naya code lowercase force karta hai — par sirf **naye save** pe, purani row pe nahi.

**Asar:** Google sitemap se ye URL uthayega, redirect follow karega, aur 404 pe pahunchega. **Ye product kabhi index nahi hoga.**

## Fix — admin se

1. `rokadoctor.in/admin` → login (phone `8969821440`)
2. **Products** → `Grand Forest RO Booster Pump` khol
3. **Basic** tab → **URL Slug** box dekh

   Abhi dikhega: `Grand-Forest-ro-booster-pump-75-gpd-24v`

4. Us box me click karke **poora mita do**, phir type karo:
   ```
   grand-forest-ro-booster-pump-75-gpd-24v
   ```
   (sab chhote akshar)

   > Box ab apne aap capital letter block karega — naya code laga hua hai.

5. **Update Product** dabao

**Bas.** System khud:
- Purane uppercase URL ka **301 redirect** bana dega
- Sitemap refresh kar dega
- Bing/Yandex ko ping kar dega

6. **Verify:** browser me khol
   ```
   rokadoctor.in/products/grand-forest-ro-booster-pump-75-gpd-24v
   ```
   Page khulna chahiye. Phir mujhe bata dena, main check kar lunga.

---

# 🟡 KAAM 2 — 3 product ke title theek karo (10 min)

## Problem

| Product | Abhi ka title | Kya galat |
|---|---|---|
| AquaFresh | `AquaFresh Alkaline Copper 12L RO Purifier —… \| Buy Online` | 61 chars, `—…` toota |
| Aquabizz | `Aquabizz 8L RO + UV + UF + TDS Water Purifier— Buy Online` | `Purifier—` space missing |
| Commercial | `Commercial RO Plant 250 LPH — SS Frame wit… \| Buy Online` | `wit…` toota |

## Wajah — aur ye actually acchi baat hai

Ye teeno title **database me** hain (`seo_metadata` table). Database code ko **override** karta hai.

Jab tune admin se product add kiya, title DB me save ho gaya. Naya code un par lagu nahi hota.

**Ye by-design hai** — taki tu admin se koi bhi title badal sake bina code chhue.

> AquaPearl fix ho gaya (22 → 50 chars) kyunki uska DB me title tha hi nahi — wo code se aata tha.

## Fix — SEO Coach se, 3 min per product

Har product ke liye:

1. `/admin/products` → product khol
2. **SEO Coach** tab pe click (aakhri tab, uspe score dikhega)
3. **"Meta title — teen option"** section me 3 ready-made title milenge, har ek pe length likhi hogi
4. Jo 45-60 chars wala ho, uspe **"Lagao"** dabao
5. Neeche **"Meta description"** pe bhi **"Lagao"** dabao
6. **Update Product**

### Ye 3 product karne hain
```
□ AquaFresh Alkaline Copper 10L
□ Aquabizz Pure 8L
□ Commercial RO Plant 250 LPH
```

### Ya haath se — agar SEO Coach na chale

`/admin/seo` → product dhoondho → title box me ye daal do:

| Product | Naya title | Len |
|---|---|---|
| AquaFresh | `AquaFresh Copper 10L RO Purifier — Price in India` | 49 |
| Aquabizz | `Aquabizz 8L RO + UV + UF Water Purifier — Price` | 47 |
| Commercial | `250 LPH Commercial RO Plant — Price in India` | 44 |

> **Product ka NAAM mat badalna, sirf SEO tab ka meta title.**
> Naam badla to slug ka masla dobara aa sakta hai.

---

# 📍 Competitor Watch — ab sidebar me dikhega

1. `rokadoctor.in/admin` → login
2. Sidebar me **🎯 Competitor Watch** (SEO Manager ke neeche)
3. **"Core service"** chip pe click — **sirf ek, sab nahi**
4. **"🔍 Check karo"** → ~30 second

## Agar laal warning aaye

```
⚠ Ye result bharosemand nahi — search engine ne block kar diya
```

**Ye normal hai.** DuckDuckGo free endpoint rate-limit karta hai. 10-15 min baad dobara try karna.

Maine ye warning **jaan-boojh ke** banaya — bina iske tool "sab ranking gayab" dikha ke tujhe daraa deta, jabki asal me kuch nahi hua hota.

**Competitor audit wala hissa hamesha sahi hota hai** — wo unka asli page padhta hai (words, schema, links, speed).

---

# 📊 Kaam 1 aur 2 ke baad — Search Console

Ye tab karna jab upar wale 2 kaam ho jayein.

`search.google.com/search-console` → upar search box → URL daal → **Request Indexing**

## Priority order (roz 10-12 kar sakta hai)

**Din 1 — category pages (naya content aaya hai):**
```
https://rokadoctor.in/products
https://rokadoctor.in/category/spare-parts
https://rokadoctor.in/category/new-ro-purifiers
https://rokadoctor.in/category/commercial-plants
https://rokadoctor.in/category/ro-membranes
https://rokadoctor.in/category/booster-pumps
https://rokadoctor.in/category/accessories
```

**Din 2 — products:**
```
https://rokadoctor.in/products/aquabizz-pure-8l-ro-uv-uf-water-purifier
https://rokadoctor.in/products/aquafresh-alkaline-copper-10l-ro-purifier
https://rokadoctor.in/products/aquapearl-alkaline-copper-12l-ro-purifier
https://rokadoctor.in/products/grand-forest-ro-booster-pump-75-gpd-24v
https://rokadoctor.in/products/commercial-ro-plant-250-lph
```

> Category pages pehle kyun? Unme 2,500-3,600 words ka naya content hai. Wo national search ke liye zyada valuable hain.

---

# ✅ Checklist

```
□ KAAM 1 — Grand Forest ka slug lowercase karo       (5 min)  🔴
□ KAAM 2 — 3 product ke title SEO Coach se theek     (10 min) 🟡
□ Competitor Watch ek baar chala ke dekho            (2 min)
□ Search Console: 7 category page                    (din 1)
□ Search Console: 5 product page                     (din 2)
```

Dono kaam ho jayein to mujhe bata dena — **main live check karke confirm kar dunga.**

---

# 🔴 Aur ye — code se nahi hoga, tere haath me hai

Ye ab bhi pending hain aur inka asar website se **zyada** hai:

| # | Kaam | Kyun |
|---|---|---|
| 1 | **`aqua-perl` Vercel project DELETE** | Duplicate content, DNS ab bhi resolve karta hai |
| 2 | **GBP primary category** sabse specific chunno | Whitespark 2026: *"the single most important ranking factor"* |
| 3 | **GBP hours 7 AM – 10 PM** | "Open now" 5th biggest factor hai |
| 4 | **Har customer se review maango** | Home services me reviews ka weight **36%** |
| 5 | **Google Ads ₹31.8/day band karo** | ₹954/month se kuch nahi hoga — sticker me lagao |

**Local ranking me website ka hissa sirf 19% hai. Wo ho chuka. Bacha 52% (GBP 32% + reviews 20%) tere haath me hai.**
