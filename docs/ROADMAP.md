# AquaNexa — Delivery Roadmap

**Stack decision: Next.js 14 (App Router) + TypeScript + PostgreSQL + Prisma + Redis**

## Why this stack over MERN or Laravel

| Requirement | Why Next.js wins |
|---|---|
| **Dual SEO (local + global)** | Server-side rendering + per-route `generateMetadata()` + streaming JSON-LD. A MERN SPA needs a separate SSR layer to rank at all; this is the single biggest factor. |
| **Amazon/Flipkart-grade speed** | React Server Components ship near-zero JS for content pages; ISR gives static-file speed on product pages that still update from the DB. |
| **One codebase, one deploy** | API routes = your backend. No separate Express server to host, secure, and scale. Smaller team, lower cost. |
| **Relational integrity** | Orders, payments, inventory and service tickets are deeply relational with money involved — PostgreSQL + Prisma gives transactions and type-safe queries. MongoDB would fight you here. |
| **Hiring in India** | Large Next.js/React talent pool; Laravel is fine but you'd lose the SEO/perf edge and split frontend/backend. |

**Hosting:** Vercel (app) + Neon/Supabase (Postgres, `ap-south-1`) + Upstash (Redis) + Cloudinary (images). Total starting cost ≈ ₹2,000–4,000/month, scaling with traffic.

---

## Phase 0 — Foundation (Week 1)

- [ ] Repo, TypeScript strict mode, ESLint/Prettier, Husky pre-commit
- [ ] Provision Postgres (`ap-south-1`), Redis, Cloudinary
- [ ] Run `db/schema.sql`, generate `prisma/schema.prisma` via `prisma db pull`
- [ ] Seed: categories, brands, 20 demo products, Patna pincodes, admin user
- [ ] Tailwind design tokens, base UI kit (Button, Input, Badge, Dialog, Table)
- [ ] Deploy skeleton to Vercel preview + connect `rokadoctor.in`

**Exit:** `npm run dev` renders a themed homepage shell; DB queryable.

## Phase 1 — Storefront MVP (Weeks 2–3)

- [ ] Navbar (mega-menu, autosuggest), Footer, FloatingCallWidget
- [ ] Homepage: dual hero, trust bar, category tiles, best sellers, FAQ
- [ ] Category grid + faceted filters (price, brand, tech, rating, stock)
- [ ] PDP: zoom gallery, spec table, pincode checker, related products
- [ ] Search page with Postgres full-text + trigram fuzzy fallback
- [ ] Cart (Zustand + Redis persistence for guests)

**Exit:** A visitor can browse, filter, and add to cart on mobile and desktop.

## Phase 2 — Service Booking + Local SEO (Week 4) ⚡ *revenue first*

- [ ] `ServiceBookingForm` with live pincode gating and validation
- [ ] `POST /api/service-requests` → ticket, CRM upsert, WhatsApp fan-out
- [ ] WhatsApp Cloud API setup + get 6 templates approved by Meta
- [ ] `/service-patna` pillar page + programmatic `/service-patna/[area]` pages
- [ ] LocalBusiness + FAQ JSON-LD, Google Business Profile linkage
- [ ] Click-to-call tracking on both numbers (GA4 events)

> **Ship this before checkout.** Service leads convert on day one and need no payment infrastructure — it funds the rest of the build.

**Exit:** Patna customers can book online; you get a WhatsApp alert per lead.

## Phase 3 — Checkout & Payments (Weeks 5–6)

- [ ] Multi-step checkout: Address → Shipping → Payment → Review
- [ ] Razorpay order creation + checkout modal + signature verification
- [ ] Signature-verified webhook → order confirm, stock decrement (transactional)
- [ ] COD with pincode + order-value rules
- [ ] Coupon engine, GST-compliant invoice PDF
- [ ] Order confirmation page + WhatsApp/email receipt

**Exit:** A real payment lands in your Razorpay account end to end.

## Phase 4 — Admin Panel (Weeks 7–8)

- [ ] RBAC layout + admin auth (`STAFF` / `ADMIN` / `SUPER_ADMIN`)
- [ ] Dashboard: KPI cards, 30-day revenue chart, service pipeline, low stock
- [ ] Product CRUD: tabbed form, multi-image uploader with reorder, spec builder
- [ ] Order manager: status pipeline, courier + AWB entry, timeline, refunds
- [ ] Service manager: Kanban board, technician assignment, parts + resolution
- [ ] CRM: customer 360°, LTV, segments, order + ticket history
- [ ] SEO manager: per-entity meta editing, redirects, sitemap ping

**Exit:** You can run the entire business without touching the database.

## Phase 5 — Growth Automation (Weeks 9–10)

- [ ] Abandoned-cart cron: 3-stage WhatsApp cadence + auto-coupon at stage 3
- [ ] AMC renewal reminders, post-service review requests
- [ ] Shiprocket integration: auto-manifest + tracking sync
- [ ] Dynamic `sitemap.xml`, `robots.txt`, Search Console + GA4 + Meta Pixel
- [ ] Nightly metrics rollup into `daily_metrics`
- [ ] Blog for content SEO ("How to change an RO membrane", etc.)

**Exit:** Recovery revenue is measurable; organic traffic compounding.

## Phase 6 — Hardening & Scale (Ongoing)

- [ ] Lighthouse ≥ 90 on mobile for Home / Category / PDP
- [ ] Playwright E2E: browse → cart → pay → order; book → assign → complete
- [ ] Rate limiting on all public POSTs, Zod validation everywhere, CSP headers
- [ ] Sentry error tracking, uptime monitoring, nightly DB backups
- [ ] Read replica + `daily_metrics` materialised views when traffic demands
- [ ] Technician mobile PWA for job updates from the field

---

## Suggested sequencing note

Phases 2 and 3 can run in parallel if you have two developers — the service arm and the e-commerce arm share only the CRM tables. If you're solo, ship Phase 2 first: it monetises immediately with zero payment-gateway dependency.
