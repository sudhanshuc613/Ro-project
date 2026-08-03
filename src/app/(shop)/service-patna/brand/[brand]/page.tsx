/**
 * BRAND SERVICE PAGE — /service-patna/brand/[brand]
 *
 * Targets high-intent queries: "Kent RO service Patna", "Aquaguard repair near me".
 * Each page carries genuine model-specific fault data and transparent pricing,
 * which is what earns the ranking rather than keyword repetition.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SERVICED_BRANDS, SERVICE_AREAS } from '@/lib/seo/patna-service-data';
import { localBusinessSchema, faqSchema, breadcrumbSchema, jsonLd } from '@/lib/seo/schema';
import FaqAccordion from '@/components/home/FaqAccordion';
import ServiceBookingForm from '@/components/home/ServiceBookingForm';
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';

export const revalidate = 86400;

export function generateStaticParams() {
  return SERVICED_BRANDS.map((b) => ({ brand: b.slug }));
}

export function generateMetadata({ params }: { params: { brand: string } }): Metadata {
  const brand = SERVICED_BRANDS.find((b) => b.slug === params.brand);
  if (!brand) return { title: 'Brand Not Found' };

  const short = brand.name.split(' (')[0];
  // Keep the SERP title under ~60 chars even for long brand labels
  const label = short.length > 22 ? 'All Brands' : short;
  const title = `${label} RO Service in Patna — ₹${SERVICE.visitCharge} Visit Charge`;
  const description = `${label} RO repair & service in Patna. ₹${SERVICE.visitCharge} visit charge, genuine parts, 30-day warranty, same-day visit. Call ${CONTACT.primaryPhone}.`;

  return {
    title,
    description,
    keywords: [
      `${short} RO service Patna`,
      `${short} water purifier repair Patna`,
      `${short} RO service centre near me`,
      `${short} RO customer care Patna`,
      `${short} filter replacement Patna`,
      ...brand.popularModels.map((m) => `${m} service Patna`),
    ],
    alternates: { canonical: `/service-patna/brand/${brand.slug}` },
    openGraph: { title, description, url: `${BRAND.url}/service-patna/brand/${brand.slug}` },
    other: { 'geo.region': 'IN-BR', 'geo.placename': 'Patna' },
  };
}

export default function BrandServicePage({ params }: { params: { brand: string } }) {
  const brand = SERVICED_BRANDS.find((b) => b.slug === params.brand);
  if (!brand) notFound();

  const short = brand.name.split(' (')[0];

  const faqs = [
    {
      q: `How much does ${short} RO service cost in Patna?`,
      a: `Our visit charge is ₹${SERVICE.visitCharge} which covers full inspection and diagnosis. Repairs typically range from ₹250 to ₹3,000 depending on the part. We always quote the exact cost before starting work and you approve it first.`,
    },
    {
      q: `Are you an authorised ${short} service centre?`,
      a: `We are an independent multi-brand RO service provider, not an authorised ${short} centre. We use genuine or OEM-grade compatible parts and offer a 30-day service warranty. Many customers choose us because we are faster and more affordable than brand service centres, but if your unit is still under manufacturer warranty we will advise you to use the official channel first.`,
    },
    {
      q: `Do you have genuine ${short} spare parts?`,
      a: `Yes. We stock genuine and OEM-grade compatible filters, membranes, pumps and SMPS units for ${short} models including ${brand.popularModels.slice(0, 3).join(', ')}. Tell us your model when booking so we bring the right part on the first visit.`,
    },
    {
      q: `How soon can you repair my ${short} purifier?`,
      a: `For calls before 5 PM we usually reach the same day, typically within 60 to 120 minutes depending on your area in Patna. Most repairs are completed in a single visit.`,
    },
    {
      q: 'Do you service other brands too?',
      a: 'Yes, we repair all brands including Kent, Aquaguard, Livpure, Pureit, AO Smith, Blue Star, Havells, and locally assembled RO units.',
    },
  ];

  return (
    <>
      <script
        {...jsonLd([
          localBusinessSchema(),
          faqSchema(faqs),
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'RO Service in Patna', url: '/service-patna' },
            { name: `${short} Service`, url: `/service-patna/brand/${brand.slug}` },
          ]),
        ])}
      />

      <main className="bg-white">
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex gap-2 overflow-x-auto whitespace-nowrap px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li><Link href="/service-patna" className="text-navy-600 hover:text-aqua-600">RO Service in Patna</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">{short}</li>
          </ol>
        </nav>

        <section className="bg-[linear-gradient(115deg,#0B2545_0%,#13315C_50%,#0E7490_100%)]">
          <div className="container mx-auto px-4 py-14 text-white lg:py-16">
            <span className="inline-flex rounded-full bg-cta-orange/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-200 ring-1 ring-cta-orange/40">
              All Patna areas covered
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              {short} RO Service &amp; Repair in Patna
              <span className="mt-2 block text-orange-300">Visit Charge Only ₹{SERVICE.visitCharge}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-navy-100 sm:text-lg">{brand.note}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={CONTACT.primaryTel} className="rounded-xl bg-cta-green px-7 py-4 font-bold text-white hover:bg-cta-greenDark">
                📞 Call {CONTACT.primaryPhone}
              </a>
              <a href={CONTACT.whatsappLink(`Hi, I need ${short} RO service in Patna.`)} target="_blank" rel="noopener noreferrer"
                className="rounded-xl bg-white/12 px-7 py-4 font-bold text-white ring-1 ring-white/30 hover:bg-white/22">
                💬 WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[1.4fr,1fr]">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy-700 md:text-3xl">
                Common {short} Problems &amp; Repair Costs
              </h2>
              <p className="mt-2 text-muted">
                Transparent pricing. These are the actual ranges we charge in Patna — you approve before we start.
              </p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-navy-100">
                <table className="w-full text-sm">
                  <thead className="bg-navy-50">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-bold text-navy-700">Problem</th>
                      <th className="px-4 py-3 font-bold text-navy-700">Usual Cause</th>
                      <th className="px-4 py-3 text-right font-bold text-navy-700">Typical Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-50">
                    {brand.commonIssues.map((c) => (
                      <tr key={c.issue}>
                        <td className="px-4 py-3 font-semibold text-navy-700">{c.issue}</td>
                        <td className="px-4 py-3 text-muted">{c.cause}</td>
                        <td className="px-4 py-3 text-right font-bold text-cta-green">{c.typicalCost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted">
                Costs shown include parts and labour but exclude the ₹{SERVICE.visitCharge} visit charge. Final price
                is always confirmed on site before any work begins.
              </p>

              <h2 className="mt-10 font-display text-2xl font-bold text-navy-700">
                {short} Models We Service
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {brand.popularModels.map((m) => (
                  <li key={m} className="rounded-lg bg-aqua-50 px-3 py-1.5 text-sm font-medium text-aqua-700 ring-1 ring-aqua-100">
                    {m}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-muted">
                Model not listed? We service every {short} unit — just call us with the model number.
              </p>

              <h2 className="mt-10 font-display text-2xl font-bold text-navy-700">
                {short} Service Across Patna
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {SERVICE_AREAS.map((a) => (
                  <Link key={a.slug} href={`/service-patna/${a.slug}`}
                    className="flex items-center justify-between rounded-xl border border-navy-100 p-3.5 transition hover:border-aqua-400 hover:bg-aqua-50">
                    <span className="text-sm font-semibold text-navy-700">
                      {short} service in {a.name}
                    </span>
                    <span className="text-aqua-600">→</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <ServiceBookingForm />
            </div>
          </div>
        </section>

        <FaqAccordion faqs={faqs} title={`${short} RO Service — Questions`} />

        <section className="py-14">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-navy-700">Other Brands We Repair</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SERVICED_BRANDS.filter((b) => b.slug !== brand.slug).map((b) => (
                <Link key={b.slug} href={`/service-patna/brand/${b.slug}`}
                  className="rounded-xl border border-navy-100 p-4 text-center transition hover:border-aqua-400 hover:bg-aqua-50">
                  <p className="font-bold text-navy-700">{b.name.split(' (')[0]}</p>
                  <p className="mt-1 text-xs text-aqua-600">Service details →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
