/**
 * KEYWORD-FIRST AREA PAGE — /ro-service-patna/[area]
 * ────────────────────────────────────────────────────────────────────────────
 * Measured 3 Sep 2026: the competitor outranking us for
 * "ro service kankarbagh patna" used /ro-service-centre-kankarbagh-patna/,
 * while ours was /service-patna/kankarbagh. Our page beat theirs on every
 * content metric — 1,528 words to 1,426, 42 schema blocks to 19 — and still
 * sat at #3. The URL was the clearest remaining difference: theirs carried
 * every query term, ours did not contain "ro" at all.
 *
 * Google treats "/" and "-" alike as word separators, so this path now carries
 * all four terms: ro · service · patna · {area}.
 *
 * Migration safety:
 *   • This is the canonical URL and owns the markup.
 *   • /service-patna/[area] stays alive and 301s here, so every indexed URL
 *     keeps its ranking instead of 404ing.
 *   • The sitemap lists only this URL, and canonical points here, so there is
 *     never a duplicate-content signal.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SERVICE_AREAS, SERVICED_BRANDS, buildAreaFaqs } from '@/lib/seo/patna-service-data';
import { localBusinessSchema, faqSchema, breadcrumbSchema, jsonLd } from '@/lib/seo/schema';
import FaqAccordion from '@/components/home/FaqAccordion';
import QuickBookForm from '@/components/home/QuickBookForm';
import TrustBadges from '@/components/ui/TrustBadges';
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';
import { areaPath } from '@/lib/seo/area-url';

export const revalidate = 86400;

export function generateStaticParams() {
  return SERVICE_AREAS.map((a) => ({ area: a.slug }));
}

export function generateMetadata({ params }: { params: { area: string } }): Metadata {
  const area = SERVICE_AREAS.find((a) => a.slug === params.area);
  if (!area) return { title: 'Area Not Found' };

  /* The layout appends ' | Aqua Perl' (12 chars), so the base stays under ~48
     to land in the 51-60 window with the lowest measured rewrite rate. Long
     names fall back to a shorter form rather than truncating mid-word. */
  const full = `RO Repair in ${area.name}, Patna — ₹${SERVICE.visitCharge} Visit`;
  const title = full.length <= 48 ? full : `RO Repair in ${area.name} — ₹${SERVICE.visitCharge} Visit`;
  const description = `RO repair & installation in ${area.name}, Patna. ₹${SERVICE.visitCharge} visit charge, technician in ${area.responseMin} min. All brands. Call ${CONTACT.primaryPhone}.`;

  return {
    title,
    description,
    keywords: [
      `RO service in ${area.name}`,
      `RO repair ${area.name} Patna`,
      `RO service centre ${area.name}`,
      `water purifier service ${area.name}`,
      `RO installation ${area.name}`,
      `RO technician near me ${area.name}`,
      `Kent RO service ${area.name}`,
      `Aquaguard service ${area.name} Patna`,
      ...area.pincodes.map((p) => `RO service ${p}`),
    ],
    alternates: { canonical: areaPath(area.slug) },
    openGraph: { title, description, url: areaPath(area.slug), type: 'website' },
  };
}

export default function AreaPage({ params }: { params: { area: string } }) {
  const area = SERVICE_AREAS.find((a) => a.slug === params.area);
  if (!area) notFound();

  const faqs = buildAreaFaqs(area);
  const nearby = SERVICE_AREAS.filter(
    (a) => a.slug !== area.slug &&
      area.nearbyAreas.some((n) => a.name.toLowerCase().includes(n.toLowerCase().split(' ')[0])),
  ).slice(0, 6);

  /* Keep the internal link graph dense even when the named neighbours are not
     themselves service pages. */
  const linkOut = nearby.length >= 4
    ? nearby
    : [...nearby, ...SERVICE_AREAS.filter((a) => a.slug !== area.slug && !nearby.includes(a)).slice(0, 6 - nearby.length)];

  return (
    <>
      <script {...jsonLd([
        localBusinessSchema({
          name: area.name, lat: area.lat, lng: area.lng,
          pincodes: area.pincodes, path: areaPath(area.slug),
        }),
        faqSchema(faqs),
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'RO Service in Patna', url: '/service-patna' },
          { name: area.name, url: areaPath(area.slug) },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: `RO Water Purifier Repair in ${area.name}`,
          provider: { '@type': 'LocalBusiness', name: BRAND.name, telephone: CONTACT.primaryPhone },
          areaServed: {
            '@type': 'City',
            name: `${area.name}, Patna`,
            containedInPlace: { '@type': 'State', name: 'Bihar' },
          },
          offers: {
            '@type': 'Offer',
            price: String(SERVICE.visitCharge),
            priceCurrency: 'INR',
            description: `Visit charge ₹${SERVICE.visitCharge} in ${area.name}`,
          },
        },
      ])} />

      <main className="bg-white">
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex flex-wrap gap-2 px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li><Link href="/service-patna" className="text-navy-600 hover:text-aqua-600">RO Service Patna</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">{area.name}</li>
          </ol>
        </nav>

        <section className="relative overflow-hidden bg-navy-700 py-12 md:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(6,182,212,.26),transparent_55%)]" />
          <div className="container relative mx-auto grid gap-8 px-4 lg:grid-cols-2 lg:items-center">
            <div className="text-white">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
                📍 {area.name}, Patna · {area.pincodes.join(' / ')}
              </p>
              <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight md:text-4xl">
                RO Service in {area.name}, Patna
                <span className="mt-1 block text-xl text-aqua-300 md:text-2xl">
                  Visit Charge Only ₹{SERVICE.visitCharge}
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-navy-100">{area.intro}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a href={CONTACT.primaryTel}
                  className="rounded-xl bg-cta-green px-6 py-3.5 font-bold text-white transition hover:bg-cta-greenDark">
                  📞 Call {CONTACT.primaryPhone}
                </a>
                <a href={`https://wa.me/91${CONTACT.primaryPhone}?text=${encodeURIComponent(`Namaste, ${area.name} me RO service chahiye`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="rounded-xl bg-[#25D366] px-6 py-3.5 font-bold text-white">
                  💬 WhatsApp
                </a>
              </div>

              <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
                  <dt className="text-[10px] uppercase tracking-wide text-navy-200">Response</dt>
                  <dd className="font-display text-xl font-extrabold">{area.responseMin} min</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
                  <dt className="text-[10px] uppercase tracking-wide text-navy-200">Technicians</dt>
                  <dd className="font-display text-xl font-extrabold">{area.technicians}</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
                  <dt className="text-[10px] uppercase tracking-wide text-navy-200">Jobs/month</dt>
                  <dd className="font-display text-xl font-extrabold">{area.monthlyJobs}</dd>
                </div>
              </dl>
            </div>

            <QuickBookForm />
          </div>
        </section>

        <section className="py-12 md:py-14">
          <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.4fr,1fr]">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-navy-700">
                {area.name} ka paani aur uski problem
              </h2>
              <p className="mt-3 leading-relaxed text-navy-600">{area.waterProfile}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-sand-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Typical TDS here</p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-navy-700">{area.tdsRange}</p>
                </div>
                <div className="rounded-xl bg-sand-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Most common repair</p>
                  <p className="mt-1 text-sm font-bold text-navy-700">{area.commonRepair}</p>
                </div>
              </div>

              <h3 className="mt-8 font-display text-lg font-bold text-navy-700">
                {area.name} me hum yahan aate hain
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {area.landmarks.map((l) => (
                  <li key={l} className="rounded-lg bg-aqua-50 px-3 py-1.5 text-sm font-medium text-aqua-800">
                    📍 {l}
                  </li>
                ))}
              </ul>

              <TrustBadges className="mt-6" />
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-navy-100 bg-white p-5">
                <h3 className="font-display text-base font-bold text-navy-700">Rate card</h3>
                {/* Rate rows link to the job page that explains them. Added
                    8 Sep 2026 — the numbers were here already but there was
                    nowhere to go to find out what they buy. */}
                <dl className="mt-3 space-y-2 text-sm">
                  {[
                    ['Visit + diagnosis', `₹${SERVICE.visitCharge}`, '/ro-repair-patna'],
                    ['Filter change (set)', '₹350 se', '/ro-filter-change-patna'],
                    ['Membrane replacement', '₹1,100 se', '/ro-membrane-replacement-patna'],
                    ['SMPS / adaptor', '₹450 se', '/ro-repair-patna'],
                    ['Booster pump', '₹900 se', '/ro-repair-patna'],
                    ['New installation', '₹500 se', '/ro-installation-patna'],
                    ['AMC (saal bhar)', '₹1,499 se', '/ro-amc-patna'],
                  ].map(([k, v, href]) => (
                    <div key={k} className="flex justify-between border-b border-navy-50 pb-1.5">
                      <dt>
                        <Link href={href} className="text-navy-600 transition hover:text-aqua-600 hover:underline">
                          {k}
                        </Link>
                      </dt>
                      <dd className="font-bold text-navy-700">{v}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href="/ro-services-patna"
                  className="mt-3 inline-block text-xs font-bold text-aqua-600 hover:underline"
                >
                  Har kaam ka poora rate list →
                </Link>
                <p className="mt-3 text-xs text-muted">
                  Parts aapki permission ke baad hi. {SERVICE.warrantyDays}-din warranty.
                </p>
              </div>

              <div className="rounded-2xl bg-navy-700 p-5 text-white">
                <h3 className="font-display text-base font-bold">Sab brand theek karte hain</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {SERVICED_BRANDS.slice(0, 12).map((b) => (
                    <Link key={b.slug} href={`/service-patna/brand/${b.slug}`}
                      className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/15 transition hover:bg-white/20">
                      {b.name}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-t border-navy-50 bg-sand-100 py-10">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-xl font-bold text-navy-700">
              {area.name} ke aas-paas ke area
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {linkOut.map((a) => (
                <Link key={a.slug} href={areaPath(a.slug)}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-navy-700 ring-1 ring-navy-100 transition hover:ring-aqua-300">
                  RO Service in {a.name}
                </Link>
              ))}
            </div>
            <Link href="/service-patna" className="mt-4 inline-block text-sm font-bold text-aqua-600 hover:underline">
              Patna ke saare {SERVICE_AREAS.length} area dekho →
            </Link>
          </div>
        </section>

        <FaqAccordion faqs={faqs} title={`${area.name} me RO service — aam sawaal`} />
      </main>
    </>
  );
}
