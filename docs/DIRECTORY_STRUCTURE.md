# AquaNexa — Directory Structure

Stack: **Next.js 14 (App Router) + TypeScript + Tailwind + Prisma + PostgreSQL + Redis**

```
aquanexa/
├── public/
│   ├── brand/                       # logo.png, favicon, og-default.jpg
│   ├── banners/                     # hero slides, service imagery
│   ├── products/                    # seeded catalog imagery (prod → S3/Cloudinary)
│   ├── robots.txt
│   └── manifest.json
│
├── prisma/
│   ├── schema.prisma                # single source of truth → mirrors db/schema.sql
│   ├── seed.ts                      # categories, brands, pincodes, demo catalog, admin user
│   └── migrations/
│
├── db/
│   ├── schema.sql                   # raw PostgreSQL DDL (enums, triggers, views, seed)
│   ├── views.sql                    # reporting views used by admin charts
│   └── rollback.sql
│
├── src/
│   ├── app/
│   │   ├── layout.tsx               # root shell: fonts, providers, JSON-LD Organization
│   │   ├── page.tsx                 # HOMEPAGE (dual hero: e-commerce + Patna service)
│   │   ├── globals.css
│   │   ├── sitemap.ts               # dynamic: products + categories + service areas
│   │   ├── robots.ts
│   │   ├── not-found.tsx
│   │   │
│   │   ├── (shop)/                  # customer storefront group
│   │   │   ├── layout.tsx           # Navbar + Footer + FloatingCallWidget
│   │   │   ├── products/
│   │   │   │   ├── page.tsx         # all products + smart filters
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx     # PDP — zoom gallery, specs, pincode checker
│   │   │   │       ├── opengraph-image.tsx
│   │   │   │       └── loading.tsx
│   │   │   ├── category/[slug]/page.tsx     # grid + faceted filtering
│   │   │   ├── search/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx         # multi-step: Address → Shipping → Payment → Review
│   │   │   │   └── success/page.tsx
│   │   │   └── order/[orderNumber]/page.tsx # tracking view
│   │   │
│   │   ├── (marketing)/
│   │   │   ├── service-patna/page.tsx           # local SEO pillar page
│   │   │   ├── service-patna/[area]/page.tsx    # /service-patna/kankarbagh (LocalBusiness schema)
│   │   │   ├── amc-plans/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── blog/[slug]/page.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # phone OTP + password
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── account/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # profile
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   ├── service-requests/page.tsx
│   │   │   ├── addresses/page.tsx
│   │   │   └── wishlist/page.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx        # RBAC guard + Sidebar + Topbar  ← ADMIN ROUTING CORE
│   │   │       ├── page.tsx          # analytics: revenue chart, KPIs, pending services
│   │   │       ├── products/
│   │   │       │   ├── page.tsx      # data-table: search, bulk actions, stock badges
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [id]/page.tsx # tabs: Basic|Media|Specs|Pricing|Inventory|SEO
│   │   │       ├── categories/page.tsx
│   │   │       ├── inventory/page.tsx
│   │   │       ├── orders/
│   │   │       │   ├── page.tsx      # status pipeline board
│   │   │       │   └── [id]/page.tsx # timeline, courier + AWB, invoice
│   │   │       ├── service-requests/
│   │   │       │   ├── page.tsx      # Kanban: NEW→ASSIGNED→IN_PROGRESS→COMPLETED
│   │   │       │   └── [id]/page.tsx # assign technician, parts, resolution
│   │   │       ├── technicians/page.tsx
│   │   │       ├── customers/
│   │   │       │   ├── page.tsx      # CRM list + segments + LTV
│   │   │       │   └── [id]/page.tsx # 360° profile
│   │   │       ├── coupons/page.tsx
│   │   │       ├── abandoned-carts/page.tsx
│   │   │       ├── seo/
│   │   │       │   ├── page.tsx      # global defaults + templates
│   │   │       │   ├── pages/page.tsx
│   │   │       │   └── redirects/page.tsx
│   │   │       ├── reviews/page.tsx
│   │   │       ├── notifications/page.tsx     # WhatsApp template + outbox log
│   │   │       └── settings/page.tsx
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── products/route.ts               # GET list (filters) | POST (admin)
│   │       ├── products/[id]/route.ts          # GET | PATCH | DELETE
│   │       ├── search/suggest/route.ts         # autosuggest (trigram + tsvector)
│   │       ├── categories/route.ts
│   │       ├── cart/route.ts
│   │       ├── cart/items/route.ts
│   │       ├── pincode/check/route.ts          # serviceability + ETA + visit charge
│   │       ├── service-requests/route.ts       # public POST (booking form)
│   │       ├── checkout/razorpay/route.ts      # create gateway order
│   │       ├── webhooks/razorpay/route.ts      # signature-verified payment events
│   │       ├── webhooks/whatsapp/route.ts      # delivery receipts / inbound
│   │       ├── admin/analytics/route.ts        # dashboard aggregates
│   │       ├── admin/orders/[id]/status/route.ts
│   │       ├── admin/service-requests/[id]/assign/route.ts
│   │       ├── admin/seo/route.ts
│   │       ├── upload/route.ts                 # signed S3/Cloudinary upload
│   │       └── cron/
│   │           ├── abandoned-cart/route.ts     # 3-stage recovery sweep
│   │           ├── amc-reminders/route.ts
│   │           └── rollup-metrics/route.ts
│   │
│   ├── components/
│   │   ├── ui/                     # Button, Input, Badge, Dialog, Sheet, Table, Tabs, Toast
│   │   ├── layout/                 # Navbar, MegaMenu, SearchBar, Footer, MobileNav,
│   │   │                           # FloatingCallWidget, WhatsAppButton, TopStrip
│   │   ├── home/                   # HeroCarousel, ServiceBookingForm, CategoryTiles,
│   │   │                           # TrustBar, BestSellers, HowItWorks, Testimonials, FAQ
│   │   ├── product/                # ProductCard, ProductGrid, FilterSidebar, SortDropdown,
│   │   │                           # ImageZoomGallery, SpecTable, PincodeChecker,
│   │   │                           # AddToCartBar, ReviewList, RelatedProducts
│   │   ├── cart/                   # CartLineItem, OrderSummary, CouponBox, CheckoutStepper
│   │   ├── service/                # ServiceCard, BookingStepper, AreaCoverageMap
│   │   └── admin/                  # Sidebar, Topbar, StatCard, RevenueChart, PipelineBoard,
│   │                               # DataTable, ProductForm, MediaUploader, SeoPanel,
│   │                               # OrderTimeline, TechnicianAssignSheet
│   │
│   ├── lib/
│   │   ├── db/prisma.ts            # singleton client
│   │   ├── db/redis.ts             # cache + rate-limit + cart sessions
│   │   ├── auth.ts                 # NextAuth config (credentials + OTP)
│   │   ├── rbac.ts                 # role guards for admin routes
│   │   ├── seo/metadata.ts         # buildMetadata() from seo_metadata table
│   │   ├── seo/schema.ts           # JSON-LD: Product, LocalBusiness, FAQ, Breadcrumb
│   │   ├── payments/razorpay.ts    # order create + signature verify + refunds
│   │   ├── integrations/whatsapp.ts# Meta Cloud API client (templates)
│   │   ├── integrations/shiprocket.ts
│   │   ├── integrations/storage.ts # image upload + variant generation
│   │   ├── validators/             # Zod schemas (product, order, serviceRequest, checkout)
│   │   ├── utils/format.ts         # INR currency, dates, order numbers
│   │   └── constants.ts            # BRAND, PHONES, COLORS, FILTER_FACETS
│   │
│   ├── server/
│   │   ├── services/               # business logic: order, cart, service, inventory,
│   │   │                           # pricing, notification, analytics, recovery
│   │   └── repositories/           # Prisma data access, keeps services testable
│   │
│   ├── hooks/                      # useCart, useDebounce, useSuggest, usePincode
│   ├── store/                      # Zustand: cart, ui, filters
│   ├── types/                      # shared TS types
│   └── styles/                     # tailwind layers, theme tokens
│
├── mockup/
│   └── index.html                  # zero-dependency visual mockup of the homepage
│
├── docs/
│   ├── ROADMAP.md                  # 6-phase delivery plan
│   ├── ARCHITECTURE.md             # stack rationale, data flow, scaling
│   ├── DIRECTORY_STRUCTURE.md      # this file
│   └── SEO_STRATEGY.md             # dual local + global SEO playbook
│
├── scripts/                        # backup.sh, reindex.ts, import-pincodes.ts
├── tests/                          # unit (vitest) + e2e (playwright)
├── .github/workflows/ci.yml
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Why this layout

| Decision | Rationale |
|---|---|
| **Route groups** `(shop)` `(marketing)` `(auth)` | Separate layouts without polluting URLs — storefront gets Navbar+CallWidget, admin gets Sidebar shell. |
| **`admin/(dashboard)`** wrapper | One `layout.tsx` enforces RBAC for *every* nested admin route. Add a folder → it's automatically protected. |
| **`server/services` + `repositories`** | Business rules live outside React. Same `OrderService` is callable from an API route, a Server Action, or a cron job. |
| **Snapshot columns in `order_items`** | Historical invoices never change when a product is renamed or repriced. |
| **`seo_metadata` as a table** | Admin edits meta title/description live; `generateMetadata()` reads DB with ISR caching. |
| **`service_areas` table** | Programmatic local-SEO landing pages — one row = one indexable "RO service in {area}" page. |
