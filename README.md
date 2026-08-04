# AquaNexa — rokadoctor.in

Dual-model water business platform:
1. **Pan-India e-commerce** — RO purifiers, commercial plants, spare parts
2. **Patna local service** — RO repair & installation, ₹200 visit charge

**Stack:** Next.js 14 (App Router) · TypeScript · PostgreSQL · Prisma · Redis · Tailwind · Razorpay · WhatsApp Cloud API

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local     # fill DATABASE_URL, REDIS_URL, RAZORPAY_*, WHATSAPP_*

# 3. Database — either raw SQL or Prisma
psql $DATABASE_URL -f db/schema.sql    # full DDL: enums, triggers, views, seed
npx prisma db pull && npx prisma generate

# 4. Seed demo catalog
npm run db:seed

# 5. Run
npm run dev                     # → http://localhost:3000
```

**Visual mockup (no build required):** open `mockup/index.html` in any browser to see the finished homepage design — dual hero carousel, mega-menu, booking form with live pincode check, product grid, FAQ.

---

## Documentation

| File | Contents |
|---|---|
| `docs/ROADMAP.md` | 6-phase build plan, stack rationale, hosting costs |
| `docs/DIRECTORY_STRUCTURE.md` | Full annotated file tree + architectural decisions |
| `docs/SEO_STRATEGY.md` | Dual local + global SEO playbook |
| `db/schema.sql` | 30+ tables, enums, triggers, reporting views, seed data |

---

## Key business contacts (wired throughout the code)

| Purpose | Number |
|---|---|
| Primary service line | **8969821440** |
| Secondary line | **9661288308** |
| WhatsApp | wa.me/918969821440 |

All defined once in `src/lib/constants.ts` — change there, updates everywhere.

---

## Implemented core files

**Storefront**
- `src/app/page.tsx` — homepage with dual hero + booking portal + JSON-LD
- `src/components/home/HeroCarousel.tsx` — 2-slide accessible carousel
- `src/components/home/ServiceBookingForm.tsx` — Patna lead capture, no login required
- `src/components/layout/Navbar.tsx` — 3-tier nav, mega-menus, autosuggest, cart badge
- `src/app/(shop)/products/[slug]/page.tsx` — PDP with specs, reviews, cross-sell
- `src/components/product/ImageZoomGallery.tsx` — hover magnifier + lightbox
- `src/components/product/PincodeChecker.tsx` — delivery ETA + service eligibility

**Admin**
- `src/app/admin/(dashboard)/layout.tsx` — RBAC gate for all admin routes
- `src/app/admin/(dashboard)/page.tsx` — analytics dashboard
- `src/components/admin/Sidebar.tsx` — role-filtered navigation

**API**
- `src/app/api/service-requests/route.ts` — booking + WhatsApp fan-out
- `src/app/api/pincode/check/route.ts` — dual delivery/service lookup
- `src/app/api/products/route.ts` — faceted catalog + admin create
- `src/app/api/cron/abandoned-cart/route.ts` — 3-stage recovery

**Libraries**
- `src/lib/seo/schema.ts` — LocalBusiness, Product, FAQ, Breadcrumb JSON-LD
- `src/lib/seo/metadata.ts` — DB-driven, admin-editable meta tags
- `src/lib/integrations/whatsapp.ts` — Meta Cloud API with outbox logging
- `src/lib/constants.ts` — brand, contacts, colors, filter facets

---

**Infrastructure (verified)**
- `prisma/schema.prisma` — 33 models, `prisma validate` passes
- `prisma/seed.ts` — admin, 5 brands, 6 categories, 4 products, 3 technicians
- `src/lib/db/prisma.ts` · `redis.ts` — singletons, cache + rate limiting (fails open)
- `src/lib/auth.ts` — NextAuth, password + phone OTP, RBAC helpers
- `src/server/services/` — product, analytics, service, audit

---

## Verification status

| Check | Result |
|---|---|
| `prisma validate` | ✅ schema valid |
| SQL DDL parsed by real PostgreSQL parser (`pglast`) | ✅ 117/117 statements |
| Prisma models vs SQL tables | ✅ 33 = 33, perfectly aligned |
| `tsc --strict` on all service/lib/seed files | ✅ 0 errors against generated client |

Typechecking was confirmed genuine by injecting a deliberate type error and
observing it fail, then reverting.

---

## Still to scaffold

`src/store/cart.ts`, the remaining UI components referenced by the pages
(`StatCard`, `RevenueChart`, `ProductCard`, `SpecTable`, `Topbar`, etc.),
the multi-step checkout with Razorpay, and the admin CRUD forms.

The app will not `npm run dev` until those components exist — the pages import
them. Ask and I'll generate any of these next.
