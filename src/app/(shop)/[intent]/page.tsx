/**
 * SERVICE-INTENT PAGES — /ro-installation-patna, /ro-amc-patna, …
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHY A ROOT-LEVEL DYNAMIC SEGMENT
 * ────────────────────────────────
 * These six URLs are single-segment and keyword-first by design:
 *
 *     /ro-installation-patna          not  /service/installation
 *     /ro-membrane-replacement-patna  not  /service/membrane
 *
 * That is the shape competitors rank with, and unlike the area pages there is
 * no variable part inside the segment — each slug is a complete literal
 * string. So a single [intent] segment expresses all six cleanly, which the
 * abandoned `/ro-service-[area]-patna` attempt could not do.
 *
 * THE SHADOWING RISK, AND HOW IT IS CONTAINED
 * ───────────────────────────────────────────
 * A root-level dynamic segment sits at the same level as /products, /cart,
 * /blog and every other page. Next.js resolves static segments before dynamic
 * ones, so real routes always win — but anything NOT matching a real route
 * would fall in here and could return 200 for a URL that should be a 404.
 *
 * Three guards, in order:
 *   1. generateStaticParams returns exactly the six known slugs.
 *   2. dynamicParams = false — Next refuses to render any param outside that
 *      list and returns a real 404. This is the hard stop.
 *   3. getIntent() + notFound() as a belt-and-braces runtime check.
 *
 * The verification script asserts /some-random-url still 404s, and that every
 * existing top-level route still resolves to its own page rather than to this
 * one. That test exists because this exact class of route is how a catch-all
 * silently eats a site.
 *
 * WHAT THESE PAGES ARE FOR
 * ────────────────────────
 * Measured 8 Sep 2026: rocareindia.com ships separate sitemaps for
 * installation (165 URLs), AMC (165) and repair, totalling 2,369 service-type
 * URLs. We had 55 place pages and 21 brand pages and nothing for the job
 * itself. "ro installation charges in patna" had no page to land on.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  SERVICE_INTENTS, getIntent, intentDuration,
} from '@/lib/seo/service-intent-data';
import { SERVICE_AREAS, SERVICED_BRANDS } from '@/lib/seo/patna-service-data';
import {
  localBusinessSchema, faqSchema, breadcrumbSchema, howToSchema, jsonLd,
} from '@/lib/seo/schema';
import FaqAccordion from '@/components/home/FaqAccordion';
import QuickBookForm from '@/components/home/QuickBookForm';
import TrustBadges from '@/components/ui/TrustBadges';
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';
import { areaPath } from '@/lib/seo/area-url';

export const revalidate = 86400;

/** Only these six slugs exist at this level. */
export function generateStaticParams() {
  return SERVICE_INTENTS.map((s) => ({ intent: s.slug }));
}

/**
 * The guard that makes a root-level dynamic segment safe. Without this, any
 * unmatched top-level URL would be rendered by this route instead of 404ing.
 */
export const dynamicParams = false;

export function generateMetadata({ params }: { params: { intent: string } }): Metadata {
  const intent = getIntent(params.intent);
  if (!intent) return { title: 'Not Found' };

  return {
    title: intent.title,
    description: intent.description,
    keywords: intent.keywords,
    alternates: { canonical: intent.path },
    openGraph: {
      title: intent.title,
      description: intent.description,
      url: `${BRAND.url}${intent.path}`,
      type: 'website',
    },
    other: {
      'geo.region': 'IN-BR',
      'geo.placename': 'Patna',
      'geo.position': `${CONTACT.geo.lat};${CONTACT.geo.lng}`,
      ICBM: `${CONTACT.geo.lat}, ${CONTACT.geo.lng}`,
    },
  };
}

export default function ServiceIntentPage({ params }: { params: { intent: string } }) {
  const intent = getIntent(params.intent);
  if (!intent) notFound();

  const related = intent.related
    .map((slug) => SERVICE_INTENTS.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  /* Link into the area graph. These pages are city-wide, so they point at the
     busiest localities rather than trying to list all 55 — a wall of 55 links
     helps nobody and looks like a link farm. */
  const topAreas = SERVICE_AREAS.slice(0, 12);
  const topBrands = SERVICED_BRANDS.slice(0, 10);

  return (
    <>
      <script {...jsonLd([
        localBusinessSchema({
          name: SERVICE.city,
          pincodes: [CONTACT.address.pincode],
          lat: CONTACT.geo.lat,
          lng: CONTACT.geo.lng,
          path: intent.path,
        }),
        faqSchema(intent.faqs),
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'RO Service in Patna', url: '/service-patna' },
          { name: intent.h1, url: intent.path },
        ]),
        howToSchema({
          name: `${intent.h1} — how the job is done`,
          description: intent.description,
          totalTime: intentDuration(intent),
          steps: intent.steps.map((s) => ({ name: s.title, text: s.detail })),
        }),
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${BRAND.url}${intent.path}/#service`,
          serviceType: intent.serviceType,
          name: intent.h1,
          description: intent.description,
          provider: {
            '@type': 'LocalBusiness',
            name: BRAND.legalName,
            telephone: `+91${CONTACT.primaryPhone}`,
            url: BRAND.url,
          },
          areaServed: {
            '@type': 'City',
            name: 'Patna',
            containedInPlace: { '@type': 'State', name: 'Bihar' },
          },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'INR',
            lowPrice: String(intent.priceFrom),
            highPrice: String(intent.priceTo),
            offerCount: String(intent.prices.length),
            availability: 'https://schema.org/InStock',
          },
        },
      ])} />

      <main className="bg-white">
        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex flex-wrap gap-2 px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li><Link href="/service-patna" className="text-navy-600 hover:text-aqua-600">RO Service Patna</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">{intent.h1}</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="bg-navy-gradient py-12 text-white md:py-16">
          <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h1 className="font-display text-3xl font-extrabold leading-tight md:text-5xl">
                {intent.h1}
              </h1>
              <p className="mt-3 text-lg font-semibold text-aqua-200">{intent.lede}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={CONTACT.primaryTel}
                  className="rounded-xl bg-cta-green px-6 py-3.5 font-bold text-white shadow-lg transition hover:bg-cta-greenDark"
                >
                  📞 Call {CONTACT.primaryPhone}
                </a>
                <a
                  href={CONTACT.whatsappLink(`Hi Aqua Perl, mujhe ${intent.h1} chahiye.`)}
                  className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 font-bold text-white transition hover:bg-white/20"
                >
                  WhatsApp
                </a>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { k: 'Visit charge', v: `₹${SERVICE.visitCharge}` },
                  { k: 'Response', v: SERVICE.responseTime },
                  { k: 'Warranty', v: `${SERVICE.warrantyDays} days` },
                ].map((x) => (
                  <div key={x.k} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-navy-200">{x.k}</p>
                    <p className="font-display text-xl font-extrabold text-white">{x.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-1 shadow-2xl">
              <QuickBookForm />
            </div>
          </div>
        </section>

        {/* ── Intro ── */}
        <section className="py-12 md:py-14">
          <div className="container mx-auto max-w-3xl px-4">
            {intent.intro.map((p) => (
              <p key={p.slice(0, 40)} className="mb-4 text-[17px] leading-relaxed text-navy-700">
                {p}
              </p>
            ))}
            <TrustBadges variant="row" className="mt-6" />
          </div>
        </section>

        {/* ── Steps (mirrors the HowTo schema exactly) ── */}
        <section className="bg-sand-100 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-2 text-center font-display text-3xl font-extrabold text-navy-700">
              What the job actually involves
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-center text-muted">
              Step by step, in the order it is done — so you can check that it was.
            </p>

            <ol className="mx-auto max-w-3xl space-y-4">
              {intent.steps.map((s, i) => (
                <li key={s.title} className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aqua-100 font-display text-base font-extrabold text-aqua-700">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-navy-700">
                      {s.title}
                      {s.minutes ? (
                        <span className="ml-2 align-middle text-xs font-semibold text-muted">
                          ~{s.minutes} min
                        </span>
                      ) : null}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-navy-600">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Price table ── */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-2 text-center font-display text-3xl font-extrabold text-navy-700">
              What it costs in Patna
            </h2>
            <p className="mx-auto mb-9 max-w-2xl text-center text-muted">
              Real 2026 rates. Final price is confirmed on site and you approve it before any work starts.
            </p>

            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-navy-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-navy-700 text-white">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Item</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="hidden px-4 py-3 font-semibold md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {intent.prices.map((row, i) => (
                    <tr key={row.item} className={i % 2 ? 'bg-sand-100' : 'bg-white'}>
                      <td className="px-4 py-3 font-semibold text-navy-700">
                        {row.item}
                        <span className="mt-1 block text-xs font-normal text-muted md:hidden">
                          {row.note}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-display font-extrabold text-cta-green">
                        {row.price}
                      </td>
                      <td className="hidden px-4 py-3 text-navy-600 md:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Signals ── */}
        <section className="bg-navy-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-9 text-center font-display text-3xl font-extrabold text-navy-700">
              How to tell you need this
            </h2>
            <div className="mx-auto grid max-w-4xl gap-3 md:grid-cols-2">
              {intent.signals.map((s) => (
                <div key={s.sign} className="rounded-xl border border-navy-100 bg-white p-4">
                  <p className="font-semibold text-navy-700">{s.sign}</p>
                  <p className="mt-1 text-sm leading-relaxed text-navy-600">{s.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Watch out ── */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="mb-3 font-display text-3xl font-extrabold text-navy-700">
              Where people get overcharged
            </h2>
            <p className="mb-7 text-muted">
              This costs us work sometimes. We would rather you knew.
            </p>
            <ul className="space-y-3">
              {intent.watchOut.map((w) => (
                <li key={w.slice(0, 40)} className="flex gap-3 rounded-xl border-l-4 border-orange-400 bg-orange-50 p-4">
                  <span aria-hidden="true" className="text-lg">⚠️</span>
                  <p className="text-[15px] leading-relaxed text-navy-700">{w}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FAQ (mirrors FAQPage schema) ── */}
        <FaqAccordion faqs={intent.faqs} title={`${intent.h1} — common questions`} />

        {/* ── Internal graph: areas ── */}
        <section className="py-12 md:py-14">
          <div className="container mx-auto px-4">
            <h2 className="mb-2 text-center font-display text-2xl font-extrabold text-navy-700">
              We cover all of Patna
            </h2>
            <p className="mb-7 text-center text-sm text-muted">
              {SERVICE_AREAS.length} localities with area-specific water data and response times.
            </p>
            <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2">
              {topAreas.map((a) => (
                <Link
                  key={a.slug}
                  href={areaPath(a.slug)}
                  className="rounded-full border border-navy-100 bg-white px-4 py-2 text-sm font-semibold text-navy-600 transition hover:border-aqua-300 hover:text-aqua-600"
                >
                  {a.name}
                </Link>
              ))}
              <Link
                href="/service-patna"
                className="rounded-full bg-navy-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-navy-600"
              >
                All {SERVICE_AREAS.length} areas →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Internal graph: brands ── */}
        <section className="bg-sand-100 py-12 md:py-14">
          <div className="container mx-auto px-4">
            <h2 className="mb-7 text-center font-display text-2xl font-extrabold text-navy-700">
              Every brand, same job
            </h2>
            <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2">
              {topBrands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/service-patna/brand/${b.slug}`}
                  className="rounded-full border border-navy-100 bg-white px-4 py-2 text-sm font-semibold text-navy-600 transition hover:border-aqua-300 hover:text-aqua-600"
                >
                  {b.name.split(' (')[0]}
                </Link>
              ))}
              <Link
                href="/service-patna/brand"
                className="rounded-full bg-navy-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-navy-600"
              >
                All brands →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Related services ── */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center font-display text-2xl font-extrabold text-navy-700">
              Other things we do
            </h2>
            <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={r.path}
                  className="group rounded-2xl border border-navy-100 bg-white p-5 transition hover:border-aqua-300 hover:shadow-card-hover"
                >
                  <h3 className="font-display text-lg font-bold text-navy-700 group-hover:text-aqua-600">
                    {r.h1}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">{r.lede}</p>
                  <span className="mt-3 inline-block text-sm font-bold text-aqua-600">Dekho →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="bg-navy-gradient py-14 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">
              {intent.h1} — book abhi
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-navy-200">
              Call karo ya WhatsApp — {SERVICE.responseTime} me technician, ₹{SERVICE.visitCharge} visit charge.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={CONTACT.primaryTel}
                className="rounded-xl bg-cta-green px-7 py-3.5 font-bold text-white shadow-lg transition hover:bg-cta-greenDark"
              >
                📞 {CONTACT.primaryPhone}
              </a>
              <a
                href={CONTACT.secondaryTel}
                className="rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 font-bold text-white transition hover:bg-white/20"
              >
                📞 {CONTACT.secondaryPhone}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
