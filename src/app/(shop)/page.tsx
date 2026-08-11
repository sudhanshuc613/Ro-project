/**
 * HOMEPAGE — SERVICE-FIRST.
 *
 * Business reality: Patna service calls generate the revenue; spare-part
 * orders are a small minority. So the page is ordered by money, not by
 * feature parity:
 *
 *   1. Service hero (₹200 hook + call/WhatsApp)
 *   2. Trust bar
 *   3. Booking form            ← primary conversion
 *   4. Services we provide
 *   5. Transparent pricing vs competitors
 *   6. Area coverage           ← internal links to 6 area pages
 *   7. Brands we repair        ← internal links to 8 brand pages
 *   8. How it works
 *   9. Testimonials
 *  10. Shop strip              ← e-commerce, deliberately below the fold
 *  11. FAQ (FAQPage schema)
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import ServiceHero from '@/components/home/ServiceHero';
import TrustBar from '@/components/home/TrustBar';
import ProblemSolver from '@/components/home/ProblemSolver';
import RealWork from '@/components/home/RealWork';
import ServiceBookingForm from '@/components/home/ServiceBookingForm';
import PriceComparison from '@/components/home/PriceComparison';
import AreaCoverage from '@/components/home/AreaCoverage';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials, { REVIEWS } from '@/components/home/Testimonials';
import ShopStrip from '@/components/home/ShopStrip';
import FaqAccordion from '@/components/home/FaqAccordion';

import { buildMetadata } from '@/lib/seo/metadata';
import {
  localBusinessSchema, websiteSchema, organizationSchema, faqSchema, reviewSchema, jsonLd,
} from '@/lib/seo/schema';
import { SERVICED_BRANDS } from '@/lib/seo/patna-service-data';
import { CONTACT, SERVICE } from '@/lib/constants';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    entityType: 'STATIC_PAGE',
    path: '/',
    fallback: {
      title: 'RO Service in Patna — Water Purifier Repair ₹200',
      description:
        'Expert RO repair & installation across Patna at ₹200 visit charge — others charge ₹350+. All brands, 90-min response, 30-day warranty. Call 8969821440.',
      keywords: [
        'RO service in Patna', 'RO repair Patna', 'water purifier service Patna',
        'RO service near me', 'RO technician Patna', 'RO installation Patna',
        'Kent RO service Patna', 'Aquaguard service Patna', 'RO AMC Patna',
        'water purifier repair near me Patna',
      ],
    },
  });
}

const SERVICES = [
  { icon: '🔧', title: 'RO Repair', desc: 'No water, low flow, leakage, noise, bad taste — diagnosed and fixed on site.', price: 'From ₹350' },
  { icon: '🛠️', title: 'New Installation', desc: 'Wall mounting, plumbing, tap fitting and TDS calibration by trained fitters.', price: 'From ₹500' },
  { icon: '💧', title: 'Filter & Membrane Change', desc: 'Genuine sediment, carbon, RO membrane and UV lamp replacement.', price: 'From ₹350' },
  { icon: '📋', title: 'Annual Maintenance (AMC)', desc: 'Scheduled visits with filters included. Cheaper than paying per service.', price: 'From ₹1,499/yr', href: '/amc-plans' },
  { icon: '🧪', title: 'Water TDS Testing', desc: 'Free TDS check before and after purification on every visit.', price: 'FREE' },
  { icon: '📦', title: 'Uninstall & Shifting', desc: 'Safe removal and reinstallation when you move home or office.', price: 'From ₹399' },
];

const FAQS = [
  { q: 'What is the RO service visit charge in Patna?',
    a: `Our technician visit charge anywhere in Patna is only ₹${SERVICE.visitCharge} — most other providers in Patna charge ₹350 to ₹399. The ₹${SERVICE.visitCharge} covers complete inspection, TDS testing and diagnosis. Repair parts and labour are quoted separately and only carried out after you approve.` },
  { q: 'How quickly will a technician reach my home?',
    a: `For calls placed before 5 PM we typically reach within ${SERVICE.responseTime} on the same day. Kankarbagh and Boring Road are usually under an hour because we station technicians there. For emergencies call ${CONTACT.primaryPhone} directly.` },
  { q: 'Which RO brands do you repair?',
    a: 'All brands — Kent, Aquaguard (Eureka Forbes), Livpure, Pureit (HUL), AO Smith, Blue Star, Havells, Nasaka, Zero B, Tata Swach, and locally assembled units. Our technicians carry common spares for every major brand.' },
  { q: 'Do I need to pay anything in advance?',
    a: 'No advance payment. You pay only after the technician completes the work at your home. Cash, UPI and cards all accepted.' },
  { q: 'Do you give a warranty on repairs?',
    a: `Yes — a ${SERVICE.warrantyDays}-day service warranty on every repair. Replacement parts additionally carry 6 to 12 months manufacturer warranty depending on the component.` },
  { q: 'How much does an RO membrane replacement cost in Patna?',
    a: 'A genuine 75 GPD membrane costs ₹1,200–₹1,800 fitted, and a 100 GPD membrane ₹1,600–₹2,400. High-TDS areas like Danapur and Saguna More usually need the 100 GPD option. Exact price is confirmed on site before work begins.' },
  { q: 'Which areas of Patna do you cover?',
    a: 'All of Patna — Kankarbagh, Boring Road, Patliputra, Rajendra Nagar, Bailey Road, Danapur, Kadamkuan, Ashiana Nagar, Rajiv Nagar, Gola Road, Phulwari Sharif, Khagaul and everywhere within 25 km of the city.' },
  { q: 'Do you sell water purifiers and spare parts too?',
    a: 'Yes. We stock new RO purifiers, commercial plants and genuine spare parts, delivered across India. In Patna we also install what you buy from us.' },
];

export default function HomePage() {
  return (
    <>
      <script {...jsonLd([
        organizationSchema(),
        websiteSchema(),
        localBusinessSchema(),
        // Individual Review objects — AI engines (ChatGPT, Perplexity, Gemini)
        // read these when deciding which local business to name.
        reviewSchema(REVIEWS),
        faqSchema(FAQS),
      ])} />

      <main className="flex flex-col">
        {/* 1 — Service hero */}
        <ServiceHero />

        {/* 2 — Trust signals */}
        <TrustBar />

        {/* 3 — PROBLEM SOLVER: customer ki asli bhasha mein */}
        <ProblemSolver />

        {/* 3 — BOOKING FORM: the primary conversion point */}
        <section id="book-service" className="relative overflow-hidden bg-navy-700 py-14 md:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(6,182,212,.26),transparent_55%)]" />
          <div className="container relative mx-auto grid gap-10 px-4 lg:grid-cols-2 lg:items-center">
            <div className="text-white">
              <h2 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">
                Book a Technician in 40 Seconds
              </h2>
              <p className="mt-4 max-w-lg text-lg text-navy-100">
                Fill the form and we call you back within 30 minutes to confirm your slot.
                No advance payment — pay ₹{SERVICE.visitCharge} only after the technician arrives.
              </p>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {['All brands serviced', 'Genuine spare parts', 'Same-day visit', `${SERVICE.warrantyDays}-day warranty`].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-navy-50">
                    <svg className="h-5 w-5 shrink-0 text-aqua-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href={CONTACT.primaryTel} className="rounded-xl bg-cta-green px-6 py-3.5 font-bold text-white transition hover:bg-cta-greenDark">
                  📞 {CONTACT.primaryPhone}
                </a>
                <a href={CONTACT.secondaryTel} className="rounded-xl bg-white/12 px-6 py-3.5 font-bold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/22">
                  📞 {CONTACT.secondaryPhone}
                </a>
              </div>
            </div>

            <ServiceBookingForm />
          </div>
        </section>

        {/* 4 — Services */}
        <section className="py-14 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                Complete RO Solutions in Patna
              </h2>
              <p className="mt-2 text-muted">
                Every water purifier problem handled at your doorstep by trained technicians.
              </p>
            </div>

            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s) => {
                const inner = (
                  <>
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-aqua-50 text-2xl">{s.icon}</span>
                    <h3 className="mt-4 font-display text-lg font-bold text-navy-700">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted">{s.desc}</p>
                    <p className="mt-3 text-sm font-bold text-cta-green">{s.price}</p>
                  </>
                );
                return s.href ? (
                  <Link key={s.title} href={s.href} className="rounded-2xl border border-navy-100 p-6 transition hover:-translate-y-1 hover:border-aqua-400 hover:shadow-card-hover">
                    {inner}
                  </Link>
                ) : (
                  <div key={s.title} className="rounded-2xl border border-navy-100 p-6">{inner}</div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6 — Pricing vs competitors */}
        <PriceComparison />

        {/* 7 — Real work proof */}
        <RealWork />

        {/* 6 — Area coverage (internal links) */}
        <AreaCoverage />

        {/* 7 — Brands we repair (internal links) */}
        <section className="bg-navy-50 py-14 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                We Repair Every RO Brand
              </h2>
              <p className="mt-2 text-muted">
                Model-specific fault guides with transparent repair pricing for each brand.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {SERVICED_BRANDS.map((b) => (
                <Link
                  key={b.slug}
                  href={`/service-patna/brand/${b.slug}`}
                  className="rounded-2xl border border-navy-100 bg-white p-5 text-center transition hover:-translate-y-1 hover:border-aqua-400 hover:shadow-card"
                >
                  <p className="font-display font-bold text-navy-700">{b.name.split(' (')[0]}</p>
                  <p className="mt-1 text-xs text-aqua-600">Repair costs →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 8 — Process */}
        <HowItWorks />

        {/* 9 — Social proof */}
        <Testimonials />

        {/* 10 — E-commerce (deliberately last) */}
        <ShopStrip />

        {/* 11 — FAQ */}
        <FaqAccordion faqs={FAQS} title="RO Service in Patna — Common Questions" />
      </main>
    </>
  );
}
