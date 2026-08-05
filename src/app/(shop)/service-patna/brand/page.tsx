/**
 * BRAND HUB — /service-patna/brand
 *
 * Why this page exists:
 *  1. /service-patna/brand/kent existed but /service-patna/brand returned 404.
 *     A 404 on a parent path is a crawl dead-end and wastes link equity.
 *  2. It is the single best internal-linking page on the site — one hop from
 *     here to all 21 brand pages, which is how Google discovers and weights
 *     them. Deeply buried pages get crawled rarely and rank poorly.
 *  3. It targets the plural query itself: "RO service centre Patna all brands",
 *     "water purifier repair Patna any brand".
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { SERVICED_BRANDS } from '@/lib/seo/patna-service-data';
import { breadcrumbSchema, faqSchema, jsonLd } from '@/lib/seo/schema';
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';

export const revalidate = 86400;

const title = `RO Service in Patna — All Brands | ₹${SERVICE.visitCharge} Visit`;
const description = `Kent, Aquaguard, Aquafresh, Livpure, Pureit, AO Smith, Blue Star, Nasaka & 13 more brands repaired in Patna. ₹${SERVICE.visitCharge} visit charge, genuine parts. Call ${CONTACT.primaryPhone}.`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'RO service centre Patna all brands',
    'water purifier repair Patna any brand',
    'RO repair Patna branded and assembled',
    ...SERVICED_BRANDS.map((b) => `${b.name.split(' (')[0]} RO service Patna`),
  ],
  alternates: { canonical: '/service-patna/brand' },
  openGraph: { title, description, url: `${BRAND.url}/service-patna/brand` },
  other: { 'geo.region': 'IN-BR', 'geo.placename': 'Patna' },
};

const FAQS = [
  {
    q: 'Which RO brands do you service in Patna?',
    a: `We service every brand sold in Patna — Kent, Aquaguard, Aquafresh, Aquasure, Livpure, Pureit, AO Smith, Blue Star, Havells, Nasaka, Zero B, Tata Swach, LG, Whirlpool, Panasonic, Faber, V-Guard, Konvio Neer, AquaUltra, plus commercial plants and locally assembled units. No brand is refused.`,
  },
  {
    q: 'Do you charge more for premium brands like AO Smith or LG?',
    a: 'The visit charge is the same ₹200 for every brand. Only the part cost differs, because a genuine LG or AO Smith cartridge genuinely costs more than a standard 10-inch filter. We show you the part and its price before fitting it.',
  },
  {
    q: 'My RO is a local assembled unit. Will you still service it?',
    a: 'Yes, and it is usually cheaper. Assembled units use standard 10-inch housings and 75/80 GPD membranes, so parts are inexpensive and readily available. A large share of Patna homes have these and we service them daily.',
  },
  {
    q: 'Are you the official service centre for these brands?',
    a: 'No, and we say that plainly. We are an independent multi-brand service provider. If your purifier is still under manufacturer warranty, use the brand service centre first — we will tell you so rather than take your money. We are for out-of-warranty units, faster response, and honest pricing.',
  },
  {
    q: 'Do you use genuine spare parts?',
    a: 'We use genuine or OEM-equivalent parts and tell you which one you are getting, with the price difference, before we fit anything. Every part carries its own 6 to 12 month warranty plus our 30-day service warranty.',
  },
];

export default function BrandHubPage() {
  // Commercial and the catch-all bucket read differently from a normal brand
  // card, so they get their own row at the end.
  const special = new Set(['commercial-ro', 'other-brands']);
  const consumer = SERVICED_BRANDS.filter((b) => !special.has(b.slug));
  const extras = SERVICED_BRANDS.filter((b) => special.has(b.slug));

  return (
    <main>
      <script
        {...jsonLd([
          faqSchema(FAQS),
          breadcrumbSchema([
            { name: 'Home', url: BRAND.url },
            { name: 'RO Service Patna', url: `${BRAND.url}/service-patna` },
            { name: 'All Brands', url: `${BRAND.url}/service-patna/brand` },
          ]),
        ])}
      />

      {/* Hero */}
      <section className="grain relative overflow-hidden bg-hero-deep">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_75%_20%,rgba(113,206,218,.18),transparent_60%)]" />
        <div className="container relative mx-auto px-4 py-14">
          <nav className="text-xs text-navy-300" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-1.5">/</span>
            <Link href="/service-patna" className="hover:text-white">RO Service Patna</Link>
            <span className="mx-1.5">/</span>
            <span className="text-navy-100">All Brands</span>
          </nav>

          <p className="eyebrow mt-5 text-aqua-300">{SERVICED_BRANDS.length} brands · every model</p>
          <h1 className="text-hero mt-2 max-w-3xl font-extrabold text-white text-balance">
            We Repair Every RO Brand in Patna
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-navy-100 text-pretty">
            Branded, budget, imported or locally assembled — our technicians carry parts for all
            of them. Same ₹{SERVICE.visitCharge} visit charge whatever you own, and the part price
            is shown to you before anything is fitted.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={CONTACT.primaryTel}
              className="rounded-xl bg-cta-green px-7 py-4 text-[17px] font-bold text-white shadow-call transition hover:bg-cta-greenDark"
            >
              📞 Call {CONTACT.primaryPhone}
            </a>
            <a
              href={CONTACT.whatsappLink('Hi, I need RO service in Patna. My brand is: ')}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white/95 px-7 py-4 text-[17px] font-bold text-navy-700 shadow-card transition hover:bg-white"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Brand grid */}
      <section className="bg-sand-100 py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-h2 font-extrabold text-navy-700">Pick your brand</h2>
          <p className="mt-2 text-muted">
            Each page lists the faults we actually see on that brand, with honest cost ranges.
          </p>

          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {consumer.map((b) => {
              const short = b.name.split(' (')[0];
              return (
                <li key={b.slug}>
                  <Link
                    href={`/service-patna/brand/${b.slug}`}
                    className="card-hover group flex h-full flex-col p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-lg font-bold text-navy-700 group-hover:text-aqua-700">
                        {short}
                      </h3>
                      <span className="shrink-0 text-aqua-600 transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted">
                      {b.popularModels.slice(0, 3).join(' · ')}
                    </p>
                    <p className="mt-3 text-[11px] font-semibold text-emerald-700">
                      {b.commonIssues.length} common faults · parts in stock
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Commercial + catch-all */}
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {extras.map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/service-patna/brand/${b.slug}`}
                  className="group flex h-full flex-col rounded-2xl bg-navy-gradient p-5 text-white shadow-card transition hover:shadow-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-bold">{b.name}</h3>
                    <span className="shrink-0 text-gold-300 transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
                  <p className="mt-1.5 text-xs text-navy-200">
                    {b.popularModels.slice(0, 4).join(' · ')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Honesty block — this is what earns trust and links */}
      <section className="py-14">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
            <h2 className="font-display text-lg font-bold text-amber-900">
              One thing we will always tell you
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900 text-pretty">
              If your purifier is still under the manufacturer&apos;s warranty, call the brand&apos;s own
              service centre first — the repair will be free for you. We are an independent
              multi-brand service, not an authorised centre, and we would rather lose one job than
              charge you for something the brand owes you. Once you are out of warranty, we are
              usually faster and cheaper.
            </p>
          </div>

          <h2 className="text-h2 mt-10 font-extrabold text-navy-700">Common questions</h2>
          <dl className="mt-5 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="card p-5">
                <dt className="font-display font-bold text-navy-700">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-navy-600 text-pretty">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
