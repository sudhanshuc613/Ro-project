# AquaNexa — Setup Guide (Hindi + English)

## ⚡ Quick Start — 5 minutes

```bash
# 1. Install dependencies
npm install

# 2. Environment file banao
cp .env.example .env
# .env kholo aur DATABASE_URL bharo (Neon / Supabase free tier chalega)

# 3. Database setup — ye ek command sab kuch karta hai
npm run db:setup
#   ├─ prisma db push        (33 tables)
#   ├─ npm run db:search     (⚠️ ZAROORI — search + extensions)
#   └─ npm run db:seed       (pincodes, products, technicians, admin)

# 4. Chalao
npm run dev        # → http://localhost:3000
```

**Admin login:** phone `8969821440` / password `ChangeMe@123`
→ ⚠️ Live jaane se pehle ye password zaroor badlo.

---

## ⚠️ CRITICAL — `npm run db:search` kabhi mat bhoolna

Prisma `tsvector` columns, `pg_trgm` extension, aur partial unique indexes
**nahi bana sakta**. Agar ye step skip kiya to:

| Kya toot jayega | Customer ko kya dikhega |
|---|---|
| Search autosuggest | Har search pe 0 results |
| Typo tolerance | "purifer" likhne pe kuch nahi milega |
| Price CHECK constraint | Selling price > MRP save ho jayega |
| Primary image rule | Ek product pe 2 primary images |

Isliye `db:push` script mein `db:search` automatically chalta hai. Manual
`prisma db push` chalao to baad mein `npm run db:search` zaroor chalao.

---

## Deployment — Vercel

```bash
# 1. Database: Neon.tech pe free Postgres banao (region: ap-south-1 Mumbai)
# 2. Redis: Upstash.com pe free Redis banao
# 3. Vercel pe import karo, environment variables set karo:

DATABASE_URL, DIRECT_URL, REDIS_URL,
NEXTAUTH_SECRET (openssl rand -base64 32), NEXTAUTH_URL=https://rokadoctor.in,
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID,
ADMIN_WHATSAPP_NUMBERS=918969821440,919661288308,
CRON_SECRET, NEXT_PUBLIC_SITE_URL=https://rokadoctor.in
```

Deploy ke baad database migrate karo:
```bash
npx prisma db push && npm run db:search && npm run db:seed
```

### Cron jobs (vercel.json)
```json
{
  "crons": [
    { "path": "/api/cron/abandoned-cart",  "schedule": "*/15 * * * *" },
    { "path": "/api/cron/rollup-metrics",  "schedule": "0 1 * * *" },
    { "path": "/api/cron/amc-reminders",   "schedule": "0 9 * * *" }
  ]
}
```

---

## 🔍 Patna SEO — Top pe rank karne ke liye kya karna hai

Code se jo ho sakta tha wo **poora ho chuka hai**. Ab jo bacha hai wo
technical nahi, business kaam hai — aur wahi asli difference banata hai.

### Website mein already hai (verified)

| Cheez | Status |
|---|---|
| 6 area pages (Kankarbagh, Boring Road, Patliputra, Rajendra Nagar, Danapur, Bailey Road) | ✅ |
| 8 brand pages (Kent, Aquaguard, Livpure, Pureit, AO Smith, Blue Star, Havells, All Brands) | ✅ |
| LocalBusiness + Service + FAQPage + Breadcrumb schema har page pe | ✅ |
| GeoCircle 25km radius (Patna metro) | ✅ |
| Titles ≤62 chars, descriptions ≤162 chars — Google truncate nahi karega | ✅ |
| Har page pe exactly 1 H1 | ✅ |
| Dono phone numbers `tel:` links — mobile pe tap-to-call | ✅ |
| Sitemap mein 15 service URLs, robots.txt configured | ✅ |
| Har area ka **alag content** (asli landmarks, TDS data, water problems) | ✅ 79% unique |

### 🚨 Ab aapko ye karna hai (sabse zaroori pehle)

**1. Google Business Profile — sabse bada impact (Week 1)**
Ye website se bhi zyada important hai local ranking ke liye.
- google.com/business pe free listing banao
- Category: "Water Purifier Supplier" + "Water Filter Supplier"
- Service area: Patna + 25km
- Dono numbers, timings 8am–9pm, website rokadoctor.in
- Har hafte 1 post daalo (actual repair photos)
- **Har complete job ke baad customer se review maango** — WhatsApp pe link bhejo

> Map Pack mein aane ka 60% kaam GBP karta hai, 40% website. Dono chahiye.

**2. Reviews — steady flow (ongoing)**
- Har ticket complete hone pe WhatsApp template se GBP review link bhejo
- Target: hafte mein 2–3 naye reviews, ek saath 20 mat lena (spam lagta hai)
- Har review ka reply do, area ka naam mention karo

**3. NAP consistency (Week 1)**
Bilkul same Name / Address / Phone har jagah:
JustDial, Sulekha, IndiaMART, Bing Places, Apple Maps, Facebook

**4. Real photos add karo (Week 2)**
Abhi AI-generated images hain. Apne asli kaam ki photos lagao:
- Technician kaam karte hue
- Before/after repair
- Aapki team, shop
→ Google real photos ko prefer karta hai, aur trust bhi banta hai

**5. Content expand karo (Month 2+)**
Blog likho — ye informational search se traffic laata hai:
- "Patna mein RO ka TDS kitna hona chahiye"
- "RO membrane kab badalna chahiye"
- "Kent vs Aquaguard — Patna ke paani ke liye kaunsa better"

### ⏱️ Realistic timeline

| Kab | Kya expect karo |
|---|---|
| Week 1–2 | Google pages index karega, GBP live hoga |
| Week 4–8 | Map Pack mein dikhna shuru — "RO service near me" |
| Month 3–4 | Area pages rank karengi ("RO service Kankarbagh") |
| Month 4–6 | Product pages organic traffic |

Beech mein Google Ads chalao service keywords pe. ₹100 visit charge
bahut strong ad hook hai — competitors ₹250–400 lete hain.

### ⚠️ Ye galtiyan mat karna

- **40 area pages mat banao.** Abhi 6 hain, sab genuinely alag hain. Google
  templated doorway pages ko demote karta hai. Naya area tab add karo jab
  wahan se asli customers aur reviews aa jayein.
- **Fake reviews mat kharido.** Google detect karta hai, listing suspend ho jaati hai.
- **Keyword stuffing mat karo.** Meta description already optimized hai.

---

## Testing

```bash
npm run typecheck    # TypeScript strict
npm run build        # Production build
npm run lint
```

## Verified status

Sab kuch asli PostgreSQL 16.2 pe test kiya gaya:

| Test | Result |
|---|---|
| `db/schema.sql` real Postgres pe execute | ✅ 33 tables, 104 indexes, 13 triggers |
| Database business logic | ✅ 9/9 pass |
| Prisma schema validate + db push + seed | ✅ pass |
| Production build | ✅ 27 pages, 0 errors |
| Live API + SEO end-to-end | ✅ 32/32 pass |
| SEO audit (title/desc/H1/schema) | ✅ 17/17 pages pass |
