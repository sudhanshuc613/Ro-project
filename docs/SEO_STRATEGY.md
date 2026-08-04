# AquaNexa — Dual SEO Strategy

Two businesses, two completely different search intents. Treating them the same is the most common way water-purifier sites lose both.

| | **Local Service (Patna)** | **Global E-commerce (India)** |
|---|---|---|
| Intent | "RO service near me", urgent, mobile, click-to-call | "buy X purifier price", research → compare → purchase |
| Winner takes | Google Map Pack + local organic | Product-grid organic + Google Shopping |
| Key schema | `LocalBusiness`, `Service`, `FAQPage` | `Product`, `Offer`, `AggregateRating` |
| KPI | Calls, WhatsApp chats, form fills | Sessions → add-to-cart → orders |
| Content unit | Area landing page | Product page + category page |

---

## 1. Local SEO — owning "RO service in Patna"

### Programmatic area pages
Each row in `service_areas` generates one indexable page at `/service-patna/[slug]`:

```
/service-patna                          ← pillar page
/service-patna/kankarbagh               ← 800020, 800026
/service-patna/boring-road              ← 800001, 800013
/service-patna/patliputra-colony        ← 800013
/service-patna/rajendra-nagar           ← 800016
/service-patna/danapur                  ← 801503
```

Each page needs **genuinely unique content** — never spun templates. Include:
- Real landmarks in that area ("near Ashiana More", "opposite Bypass Road")
- Actual response time for that area (`avg_response_min`)
- 2–3 testimonials from customers *in that area*
- Exact pincodes served
- Locally-worded FAQs

> ⚠️ Google's helpful-content system demotes near-duplicate location pages. Ship 5 excellent pages, not 40 thin ones. Expand only as you collect real reviews per area.

### Title & description patterns
```
RO Service in Kankarbagh, Patna — ₹200 Visit Charge | Same-Day Repair | AquaNexa
Expert RO repair & installation in Kankarbagh, Patna. Visit charge only ₹200.
Same-day service, 30-day warranty, genuine parts. Call 8969821440 now.
```
`₹200` and the phone number in the meta description lift CTR measurably — the price objection is answered before the click.

### Off-page essentials (higher impact than on-page here)
1. **Google Business Profile** — the single highest-ROI action. Complete every field, add the service area, post weekly, upload real job photos.
2. **Review velocity** — ask every completed ticket for a GBP review via the WhatsApp `service_completed` template. Steady flow beats a burst.
3. **NAP consistency** — identical Name/Address/Phone on JustDial, Sulekha, IndiaMART, Bing Places, Apple Maps.
4. **Local backlinks** — Patna business directories, local news, RWA/apartment association pages.

### Technical local signals
- `LocalBusiness` + `GeoCircle` (25 km radius) JSON-LD on homepage and every area page
- `geo.region=IN-BR`, `geo.placename=Patna` meta tags
- Click-to-call anchors (`tel:+91…`) — a ranking-adjacent UX signal on mobile
- Embedded Google Map on the pillar page

---

## 2. Global E-commerce SEO — product & category pages

### URL architecture
```
/category/new-ro-purifiers
/category/new-ro-purifiers?brand=kent&tech=RO,UV     ← canonical → base category
/products/aquanexa-pure-8l-ro-uv-uf-purifier         ← flat, keyword-rich, permanent
/brand/kent
```
Keep product URLs flat (`/products/[slug]`, not `/category/x/products/y`) so recategorisation never breaks links. Filter combinations must canonicalise to the base category to avoid index bloat.

### Product page checklist
- [ ] `Product` + `Offer` + `AggregateRating` + `BreadcrumbList` JSON-LD
- [ ] `price`, `priceCurrency`, `availability`, `shippingDetails`, `hasMerchantReturnPolicy` — required for rich results and Free Google Shopping listings
- [ ] Unique 150+ word description — **never** paste the manufacturer's copy
- [ ] Descriptive `alt` text on all 2–5 images (`altText` column is mandatory in the schema)
- [ ] Real customer reviews rendered server-side (`AggregateRating` without visible reviews = manual penalty)
- [ ] Internal links to compatible spare parts (`product_compatibility` table)

### Category page checklist
- [ ] 200–300 word intro *above* the grid, buying guide *below* it
- [ ] `rel=next/prev` semantics via clean paginated URLs
- [ ] `ItemList` schema for the product grid
- [ ] Filter combos: `noindex,follow` unless the combo has real search volume

### Content moat — the blog
Target informational queries that lead to parts sales, then internally link to products:
- "How to change an RO membrane at home" → membrane category
- "RO water TDS chart: what's safe to drink" → TDS meters
- "Why is my RO purifier making noise?" → booster pumps, **and** the Patna service CTA
- "RO vs UV vs UF: which purifier do you actually need?" → buying guide

This is where the two SEO strategies merge: a national informational article can carry a Patna service CTA for local readers.

---

## 3. Shared technical foundation

| Item | Implementation |
|---|---|
| Dynamic meta | `seo_metadata` table → `buildMetadata()` in `generateMetadata()` |
| Sitemap | `app/sitemap.ts` — products + categories + areas + blog, `lastmod` from `updated_at` |
| Robots | `app/robots.ts` — block `/admin`, `/account`, `/checkout`, `/api` |
| Canonicals | Self-referencing by default; admin override per entity |
| Redirects | `redirects` table → middleware, 301 with hit counting |
| Core Web Vitals | Hero LCP image `priority`, `next/image` everywhere, RSC by default |
| Mobile-first | ~85% of Indian traffic; test every page at 360 px |
| Structured data QA | Validate every template in Google Rich Results Test before launch |

## 4. Measurement

Wire up from day one, not after launch:
- **GA4** with e-commerce events: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, plus custom `generate_lead` for service bookings
- **Search Console** — two property groups so local and product queries are analysed separately
- **Call tracking** — `data-analytics` attributes on every `tel:` link (already present in the components)
- **Rank tracking** — a fixed keyword set: `ro service in patna`, `ro repair patna`, `water purifier service patna`, plus your top 20 product terms

### Realistic timeline
Local Map Pack results typically appear in **4–8 weeks** with an active GBP and steady reviews. Product-page organic rankings take **4–6 months** to mature. Budget for paid search on service keywords in the interim — the ₹200 visit charge is a strong ad hook.
