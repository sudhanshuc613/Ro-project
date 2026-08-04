/**
 * PILLAR PAGE — /service-patna
 * The main ranking target for "RO service in Patna" / "RO repair Patna".
 * Links out to every area page and every brand page (topical authority hub).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SERVICE_AREAS, SERVICED_BRANDS } from '@/lib/seo/patna-service-data';
import { localBusinessSchema, faqSchema, breadcrumbSchema, jsonLd } from '@/lib/seo/schema';
import ServiceBookingForm from '@/components/home/ServiceBookingForm';
import FaqAccordion from '@/components/home/FaqAccordion';
import HowItWorks from '@/components/home/HowItWorks';
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: `RO Service in Patna — ₹${SERVICE.visitCharge} Visit | Same-Day Repair`,
  description: `RO repair, installation & AMC across Patna. ₹${SERVICE.visitCharge} visit charge, same-day service, 30-day warranty. All brands. Call ${CONTACT.primaryPhone}.`,
  keywords: [
    'RO service in Patna', 'RO repair Patna', 'water purifier service Patna',
    'RO installation Patna', 'RO service near me Patna', 'RO AMC Patna',
    'Kent RO service Patna', 'Aquaguard service Patna', 'RO technician Patna',
    'water purifier repair Patna', 'RO filter change Patna', 'RO membrane replacement Patna',
  ],
  alternates: { canonical: '/service-patna' },
  openGraph: {
    title: `RO Service in Patna — ₹${SERVICE.visitCharge} Visit Charge | AquaNexa`,
    description: 'Same-day RO repair & installation across Patna. All brands serviced. 30-day warranty.',
    url: `${BRAND.url}/service-patna`,
    images: [{ url: '/banners/service-tech.png', width: 1200, height: 630, alt: 'AquaNexa RO technician in Patna' }],
  },
  other: {
    'geo.region': 'IN-BR',
    'geo.placename': 'Patna',
    'geo.position': '25.5941;85.1376',
    ICBM: '25.5941, 85.1376',
  },
};

const FAQS = [
  { q: 'What is the RO service visit charge in Patna?',
    a: `Our technician visit charge anywhere in Patna is only ₹${SERVICE.visitCharge}. This covers complete inspection, TDS testing and diagnosis. Repair parts and labour are quoted separately and only carried out with your approval.` },
  { q: 'Which areas of Patna do you cover?',
    a: 'We cover all of Patna including Kankarbagh, Boring Road, Patliputra Colony, Rajendra Nagar, Bailey Road, Danapur, Saguna More, Khagaul, Rukanpura, Kadamkuan, Bahadurpur and surrounding localities. If you are unsure, just call us with your pincode.' },
  { q: 'Which RO brands do you repair?',
    a: 'All brands — Kent, Aquaguard (Eureka Forbes), Livpure, Pureit (HUL), AO Smith, Blue Star, Havells, Nasaka, Zero B, Tata Swach, and locally assembled RO units. Our technicians carry common spares for every major brand.' },
  { q: 'How quickly will a technician arrive?',
    a: `For requests placed before 5 PM we typically reach within ${SERVICE.responseTime} on the same day. Emergency same-day service is available — call ${CONTACT.primaryPhone} or ${CONTACT.secondaryPhone}.` },
  { q: 'Do you provide a warranty on repairs?',
    a: `Yes. Every repair carries a ${SERVICE.warrantyDays}-day service warranty. Replacement parts additionally carry 6 to 12 months manufacturer warranty depending on the component.` },
  { q: 'How much does an RO membrane replacement cost in Patna?',
    a: 'A genuine 75 GPD membrane typically costs ₹1,200 to ₹1,800 fitted, and a 100 GPD membrane ₹1,600 to ₹2,400. High-TDS areas like Danapur usually need the 100 GPD option. Exact price is confirmed on site before work begins.' },
  { q: 'Do you offer AMC plans?',
    a: 'Yes. Our annual maintenance contracts start at ₹1,499 and include 4 scheduled visits with filter changes, priority response, and discounted parts. Ideal for high-TDS areas where filters need frequent replacement.' },
  { q: 'Do I need to pay in advance?',
    a: 'No advance payment. You pay only after the technician completes the work at your home. We accept cash, UPI, and cards.' },
];

export default function ServicePatnaPillar() {
  return (
    <>
      <script
        {...jsonLd([
          localBusinessSchema(),
          faqSchema(FAQS),
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'RO Service in Patna', url: '/service-patna' },
          ]),
        ])}
      />

      <main className="bg-white">
        <section className="relative overflow-hidden bg-hero-deep">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_28%,rgba(255,255,255,.14),transparent_60%)]" />
          <div className="container relative mx-auto grid gap-10 px-4 py-14 lg:grid-cols-[1.1fr,.9fr] lg:py-20">
            <div className="text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-cta-green/16 px-4 py-1.5 text-sm font-semibold text-emerald-300 ring-1 ring-cta-green/30">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ripple rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Technicians available now across Patna
              </span>

              <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                Expert RO Service in Patna
                <span className="mt-2 block text-orange-300">Visit Charge Only ₹{SERVICE.visitCharge}</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">
                Repair, installation, filter change and AMC for every RO brand.
                Certified technicians reach you within {SERVICE.responseTime} with genuine
                spare parts and a {SERVICE.warrantyDays}-day service warranty.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href={CONTACT.primaryTel} className="rounded-xl bg-cta-green px-7 py-4 font-bold text-white shadow-lg transition hover:bg-cta-greenDark">
                  📞 Call {CONTACT.primaryPhone}
                </a>
                <a href={CONTACT.secondaryTel} className="rounded-xl bg-white/12 px-7 py-4 font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/22">
                  📞 {CONTACT.secondaryPhone}
                </a>
              </div>
              <p className="mt-4 text-sm text-navy-100">{CONTACT.hours} · All 7 days</p>
            </div>

            <div className="lg:pt-2">
              <ServiceBookingForm />
            </div>
          </div>
        </section>

        {/* Areas */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                RO Service Areas in Patna
              </h2>
              <p className="mt-2 text-muted">
                Click your locality for area-specific water details, response times and pricing.
              </p>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICE_AREAS.map((a) => (
                <Link key={a.slug} href={`/service-patna/${a.slug}`}
                  className="group rounded-2xl border border-navy-100 p-5 transition hover:-translate-y-1 hover:border-aqua-400 hover:shadow-card-hover">
                  <h3 className="font-display text-lg font-bold text-navy-700 group-hover:text-aqua-600">
                    RO Service in {a.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted">Pincodes: {a.pincodes.join(', ')}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-navy-600">{a.intro}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs font-semibold">
                    <span className="text-cta-green">⚡ {a.responseMin} min response</span>
                    <span className="text-muted">{a.monthlyJobs}+ jobs/month</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="bg-navy-50 py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                We Repair Every RO Brand
              </h2>
              <p className="mt-2 text-muted">
                Model-specific fault guides with transparent repair pricing for each brand.
              </p>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICED_BRANDS.map((b) => (
                <Link key={b.slug} href={`/service-patna/brand/${b.slug}`}
                  className="rounded-2xl border border-navy-100 bg-white p-5 transition hover:-translate-y-1 hover:border-aqua-400 hover:shadow-card">
                  <h3 className="font-display text-base font-bold text-navy-700">{b.name.split(' (')[0]}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted">
                    {b.popularModels.slice(0, 3).join(', ')}…
                  </p>
                  <p className="mt-3 text-xs font-bold text-aqua-600">Repair costs &amp; guide →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />

        {/* Pricing transparency */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                Transparent Service Pricing
              </h2>
              <p className="mt-2 text-muted">No hidden charges. Every cost is confirmed before work starts.</p>
            </div>

            <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-navy-100">
              <table className="w-full text-sm">
                <thead className="bg-navy-50">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-bold text-navy-700">Service</th>
                    <th className="px-4 py-3 text-right font-bold text-navy-700">Price Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                  {[
                    ['Technician visit & diagnosis', `₹${SERVICE.visitCharge} (fixed)`],
                    ['Sediment / carbon filter change', '₹350 – ₹900'],
                    ['RO membrane replacement (75 GPD)', '₹1,200 – ₹1,800'],
                    ['RO membrane replacement (100 GPD)', '₹1,600 – ₹2,400'],
                    ['Booster pump replacement', '₹1,100 – ₹2,000'],
                    ['SMPS / adaptor replacement', '₹700 – ₹1,300'],
                    ['UV lamp replacement', '₹650 – ₹1,200'],
                    ['New RO installation', '₹500 – ₹900'],
                    ['Annual Maintenance Contract', '₹1,499 – ₹3,999 / year'],
                  ].map(([s, p]) => (
                    <tr key={s}>
                      <td className="px-4 py-3 text-navy-700">{s}</td>
                      <td className="px-4 py-3 text-right font-bold text-cta-green">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <FaqAccordion faqs={FAQS} title="RO Service in Patna — Frequently Asked Questions" />

        <section className="bg-navy-700 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-extrabold text-white md:text-3xl">
              Book Your RO Technician Now
            </h2>
            <p className="mt-2 text-navy-100">
              ₹{SERVICE.visitCharge} visit charge · Same-day service · {SERVICE.warrantyDays}-day warranty · All brands
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a href={CONTACT.primaryTel} className="rounded-xl bg-cta-green px-7 py-4 font-bold text-white hover:bg-cta-greenDark">
                📞 {CONTACT.primaryPhone}
              </a>
              <a href={CONTACT.whatsappLink()} target="_blank" rel="noopener noreferrer"
                className="rounded-xl bg-white/12 px-7 py-4 font-bold text-white ring-1 ring-white/30 hover:bg-white/22">
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
