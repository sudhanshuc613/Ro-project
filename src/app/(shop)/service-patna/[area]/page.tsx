/**
 * LOCAL SEO LANDING PAGE — /service-patna/[area]
 *
 * One indexable, genuinely unique page per Patna locality. Targets:
 *   "RO service in Kankarbagh", "RO repair Boring Road Patna", etc.
 *
 * Ships LocalBusiness + Service + FAQPage + BreadcrumbList JSON-LD.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SERVICE_AREAS, SERVICED_BRANDS, buildAreaFaqs } from '@/lib/seo/patna-service-data';
import { localBusinessSchema, faqSchema, breadcrumbSchema, jsonLd } from '@/lib/seo/schema';
import FaqAccordion from '@/components/home/FaqAccordion';
import ServiceBookingForm from '@/components/home/ServiceBookingForm';
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';

export const revalidate = 86400;

export function generateStaticParams() {
  return SERVICE_AREAS.map((a) => ({ area: a.slug }));
}

export function generateMetadata({ params }: { params: { area: string } }): Metadata {
  const area = SERVICE_AREAS.find((a) => a.slug === params.area);
  if (!area) return { title: 'Area Not Found' };

  /* Title length: the layout template appends ' | Aqua Perl' (12 chars), so the
     base must stay under ~48 to land in the 51-60 window Zyppy's 2026 study found
     has the lowest Google rewrite rate.

     "Repair" instead of "Service": competitor titles ranking above us all carry
     "Repair" and/or "Water Purifier"; ours carried neither. Longest area name
     (Patliputra Colony) is checked first so nothing truncates. */
  const full = `RO Repair in ${area.name}, Patna — ₹${SERVICE.visitCharge} Visit`;
  const title = full.length <= 48 ? full : `RO Repair in ${area.name} — ₹${SERVICE.visitCharge} Visit`;
  const description = `RO repair & installation in ${area.name}, Patna. ₹${SERVICE.visitCharge} visit charge, technician in ${area.responseMin} min. All brands. Call ${CONTACT.primaryPhone}.`;

  return {
    title,
    description,
    keywords: [
      `RO service in ${area.name}`,
      `RO repair ${area.name} Patna`,
      `water purifier service ${area.name}`,
      `RO installation ${area.name}`,
      `RO technician near me ${area.name}`,
      `Kent RO service ${area.name}`,
      `Aquaguard service ${area.name} Patna`,
      ...area.pincodes.map((p) => `RO service ${p}`),
    ],
    alternates: { canonical: `/service-patna/${area.slug}` },
    openGraph: {
      title,
      description,
      url: `${BRAND.url}/service-patna/${area.slug}`,
      images: [{ url: '/banners/service-tech.png', width: 1200, height: 630, alt: `RO service technician in ${area.name}, Patna` }],
    },
    other: {
      'geo.region': 'IN-BR',
      'geo.placename': `${area.name}, Patna`,
      'geo.position': `${area.lat};${area.lng}`,
      ICBM: `${area.lat}, ${area.lng}`,
    },
  };
}

export default function AreaServicePage({ params }: { params: { area: string } }) {
  const area = SERVICE_AREAS.find((a) => a.slug === params.area);
  if (!area) notFound();

  const faqs = buildAreaFaqs(area);
  const others = SERVICE_AREAS.filter((a) => a.slug !== area.slug);

  return (
    <>
      <script
        {...jsonLd([
          localBusinessSchema({ name: area.name, pincodes: area.pincodes, lat: area.lat, lng: area.lng }),
          faqSchema(faqs),
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'RO Service in Patna', url: '/service-patna' },
            { name: area.name, url: `/service-patna/${area.slug}` },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            serviceType: 'RO Water Purifier Repair and Installation',
            provider: { '@type': 'LocalBusiness', name: BRAND.name, telephone: `+91${CONTACT.primaryPhone}` },
            areaServed: {
              '@type': 'City',
              name: `${area.name}, Patna`,
              containedInPlace: { '@type': 'State', name: 'Bihar' },
            },
            offers: {
              '@type': 'Offer',
              price: SERVICE.visitCharge,
              priceCurrency: 'INR',
              description: `RO technician visit charge in ${area.name}, Patna`,
            },
          },
        ])}
      />

      <main className="bg-white">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex gap-2 overflow-x-auto whitespace-nowrap px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li><Link href="/service-patna" className="text-navy-600 hover:text-aqua-600">RO Service in Patna</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">{area.name}</li>
          </ol>
        </nav>

        {/* HERO */}
        <section className="relative overflow-hidden bg-hero-deep">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(255,255,255,.13),transparent_60%)]" />
          <div className="container relative mx-auto grid gap-10 px-4 py-14 lg:grid-cols-[1.1fr,.9fr] lg:py-20">
            <div className="text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-cta-orange/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-200 ring-1 ring-cta-orange/40">
                📍 {area.name}, Patna — {area.pincodes.join(' / ')}
              </span>

              <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                RO Service in {area.name}, Patna
                <span className="mt-2 block text-orange-300">Visit Charge Only ₹{SERVICE.visitCharge}</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">
                {area.intro}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href={CONTACT.primaryTel} className="inline-flex items-center gap-2 rounded-xl bg-cta-green px-7 py-4 font-bold text-white shadow-lg transition hover:bg-cta-greenDark">
                  📞 Call {CONTACT.primaryPhone}
                </a>
                <a href={CONTACT.whatsappLink(`Hi, I need RO service in ${area.name}, Patna.`)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/12 px-7 py-4 font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/22">
                  💬 WhatsApp
                </a>
              </div>

              <dl className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { k: 'Response', v: `${area.responseMin} min` },
                  { k: 'Technicians', v: `${area.technicians} in area` },
                  { k: 'Jobs / month', v: `${area.monthlyJobs}+` },
                  { k: 'Warranty', v: `${SERVICE.warrantyDays} days` },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-aqua-200">{s.k}</dt>
                    <dd className="mt-0.5 font-display text-lg font-extrabold text-white">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="overflow-hidden rounded-3xl bg-white/95 shadow-2xl ring-1 ring-white/30">
                <Image src="/banners/service-tech.png" alt={`Aqua Perl RO technician repairing a water purifier in ${area.name}, Patna`}
                  width={600} height={450} priority className="h-auto w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* WATER PROFILE — unique per area, this is the SEO differentiator */}
        <section className="py-14">
          <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[1.4fr,1fr]">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy-700 md:text-3xl">
                Water Quality in {area.name} — What We See on Site
              </h2>

              {/* Area-specific data: this is what makes each page genuinely unique */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-aqua-100 bg-aqua-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-aqua-700">Typical TDS here</p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-navy-700">{area.tdsRange}</p>
                </div>
                <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-700">Most common repair</p>
                  <p className="mt-1 text-sm font-bold text-navy-700">{area.commonRepair}</p>
                </div>
              </div>

              <p className="mt-4 leading-relaxed text-navy-600">{area.waterProfile}</p>

              <h3 className="mt-8 font-display text-xl font-bold text-navy-700">Areas We Cover Around {area.name}</h3>
              <p className="mt-2 text-navy-600">
                Our {area.name} team also serves{' '}
                {area.nearbyAreas.map((n, i) => (
                  <span key={n}>
                    <strong className="text-navy-700">{n}</strong>
                    {i < area.nearbyAreas.length - 1 ? ', ' : ''}
                  </span>
                ))}
                {' '}— and every street around{' '}
                {area.landmarks.slice(0, 3).map((l, i) => (
                  <span key={l}>
                    <strong className="text-navy-700">{l}</strong>
                    {i < 2 ? ', ' : ''}
                  </span>
                ))}.
              </p>

              <h3 className="mt-8 font-display text-xl font-bold text-navy-700">Landmarks We Service Near</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {area.landmarks.map((l) => (
                  <li key={l} className="rounded-lg bg-aqua-50 px-3 py-1.5 text-sm font-medium text-aqua-700 ring-1 ring-aqua-100">
                    📍 {l}
                  </li>
                ))}
              </ul>

              <h3 className="mt-8 font-display text-xl font-bold text-navy-700">Services We Provide in {area.name}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { t: 'RO Repair', d: 'No water, low flow, leakage, noise — diagnosed and fixed on site.' },
                  { t: 'New Installation', d: 'Wall mounting, plumbing, tap fitting and TDS calibration.' },
                  { t: 'Filter & Membrane Change', d: 'Genuine sediment, carbon, RO membrane and UV lamp replacement.' },
                  { t: 'Annual Maintenance (AMC)', d: 'Scheduled visits with filter changes included from ₹1,499/year.' },
                  { t: 'Water TDS Testing', d: 'Free TDS check during every visit, before and after purification.' },
                  { t: 'Uninstall & Shifting', d: 'Safe removal and reinstallation when you move house.' },
                ].map((s) => (
                  <div key={s.t} className="rounded-xl border border-navy-100 p-4">
                    <p className="font-bold text-navy-700">{s.t}</p>
                    <p className="mt-1 text-sm text-muted">{s.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <ServiceBookingForm />
            </div>
          </div>
        </section>

        {/* BRANDS — internal linking to brand pages */}
        <section className="bg-navy-50 py-14">
          <div className="container mx-auto px-4">
            <h2 className="text-center font-display text-2xl font-bold text-navy-700 md:text-3xl">
              All RO Brands Repaired in {area.name}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-muted">
              Our technicians are trained on every major brand and carry common spare parts on each visit.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SERVICED_BRANDS.map((b) => (
                <Link key={b.slug} href={`/service-patna/brand/${b.slug}`}
                  className="rounded-xl border border-navy-100 bg-white p-4 text-center transition hover:-translate-y-1 hover:border-aqua-400 hover:shadow-card">
                  <p className="font-bold text-navy-700">{b.name.split(' (')[0]}</p>
                  <p className="mt-1 text-xs text-aqua-600">View repair guide →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <FaqAccordion faqs={faqs} title={`RO Service in ${area.name} — Common Questions`} />

        {/* Other areas — internal link mesh boosts every page */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-navy-700">Other Areas We Serve in Patna</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <Link key={o.slug} href={`/service-patna/${o.slug}`}
                  className="flex items-center justify-between rounded-xl border border-navy-100 p-4 transition hover:border-aqua-400 hover:bg-aqua-50">
                  <span>
                    <span className="block font-bold text-navy-700">RO Service in {o.name}</span>
                    <span className="block text-xs text-muted">{o.pincodes.join(', ')} · {o.responseMin} min response</span>
                  </span>
                  <span className="text-aqua-600">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-navy-700 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-extrabold text-white md:text-3xl">
              Need an RO technician in {area.name} today?
            </h2>
            <p className="mt-2 text-navy-100">
              Visit charge ₹{SERVICE.visitCharge} · Reaches in {area.responseMin} minutes · {SERVICE.warrantyDays}-day warranty
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a href={CONTACT.primaryTel} className="rounded-xl bg-cta-green px-7 py-4 font-bold text-white hover:bg-cta-greenDark">
                📞 {CONTACT.primaryPhone}
              </a>
              <a href={CONTACT.secondaryTel} className="rounded-xl bg-white/12 px-7 py-4 font-bold text-white ring-1 ring-white/30 hover:bg-white/22">
                📞 {CONTACT.secondaryPhone}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
