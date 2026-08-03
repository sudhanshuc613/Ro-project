/**
 * AquaNexa — HOMEPAGE  (Server Component)
 * Dual-purpose landing: Pan-India e-commerce + Patna local service booking.
 * Renders LocalBusiness + Website + FAQ JSON-LD for dual SEO.
 */
import type { Metadata } from 'next';
import { Suspense } from 'react';
import HeroCarousel from '@/components/home/HeroCarousel';
import TrustBar from '@/components/home/TrustBar';
import CategoryTiles from '@/components/home/CategoryTiles';
import ServiceBookingForm from '@/components/home/ServiceBookingForm';
import BestSellers from '@/components/home/BestSellers';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import FaqAccordion from '@/components/home/FaqAccordion';
import ProductGridSkeleton from '@/components/product/ProductGridSkeleton';
import { buildMetadata } from '@/lib/seo/metadata';
import { localBusinessSchema, websiteSchema, organizationSchema, faqSchema, jsonLd } from '@/lib/seo/schema';
import { getFeaturedProducts, getBestSellers } from '@/server/services/product.service';
import { CONTACT, SERVICE } from '@/lib/constants';

export const revalidate = 3600; // ISR — rebuild hourly

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    entityType: 'STATIC_PAGE',
    path: '/',
    fallback: {
      title: 'RO Purifiers Online India | RO Service Patna ₹100 — AquaNexa',
      description:
        'Buy RO purifiers, commercial plants & spare parts — delivered across India. Expert RO repair in Patna, ₹100 visit charge. Call 8969821440.',
      keywords: [
        'RO water purifier online', 'buy RO purifier India', 'RO service in Patna',
        'RO repair Patna', 'commercial RO plant', 'RO spare parts online',
        'water purifier service Patna', 'RO installation Patna',
      ],
    },
  });
}

const HOMEPAGE_FAQS = [
  { q: 'What is the visit charge for RO service in Patna?',
    a: `Our RO technician visit charge in Patna is only ₹${SERVICE.visitCharge}. This covers complete inspection and diagnosis. Repair parts and labour are quoted separately with your approval before any work begins.` },
  { q: 'Do you deliver water purifiers outside Patna?',
    a: 'Yes. We ship RO purifiers, commercial plants and spare parts to every serviceable pincode across India. Standard delivery is 3–7 business days with free shipping on orders above ₹1,999.' },
  { q: 'How soon can a technician reach my home in Patna?',
    a: `For requests placed before 5 PM we typically reach within ${SERVICE.responseTime} on the same day. You can also call ${CONTACT.primaryPhone} or ${CONTACT.secondaryPhone} for emergency service.` },
  { q: 'Do you use genuine spare parts?',
    a: `Yes. We use only genuine or OEM-grade membranes, filters and pumps, and every repair carries a ${SERVICE.warrantyDays}-day service warranty.` },
  { q: 'Do you service all RO brands?',
    a: 'We service all major brands including Kent, Aquaguard, Livpure, Pureit, Blue Star, Havells, AO Smith and local assembled units.' },
];

export default async function HomePage() {
  const [featured, bestSellers] = await Promise.all([
    getFeaturedProducts(8),
    getBestSellers(8),
  ]);

  return (
    <>
      {/* ── Structured data: dual SEO payload ───────────────────────────── */}
      <script {...jsonLd([
        organizationSchema(),
        websiteSchema(),
        localBusinessSchema(),
        faqSchema(HOMEPAGE_FAQS),
      ])} />

      <main className="flex flex-col">
        {/* 1 — DUAL HERO: Banner 1 (e-commerce) + Banner 2 (Patna service) */}
        <HeroCarousel />

        {/* 2 — Trust signals immediately below the fold */}
        <TrustBar />

        {/* 3 — Shop by category */}
        <CategoryTiles />

        {/* 4 — SERVICE BOOKING PORTAL (Patna) — sticky conversion block */}
        <section
          id="book-service"
          className="relative overflow-hidden bg-navy-700 py-16 md:py-24"
          aria-labelledby="book-service-heading"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,.25),transparent_55%)]" />
          <div className="container relative mx-auto grid gap-12 px-4 lg:grid-cols-2 lg:items-center">
            <div className="text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-cta-green/15 px-4 py-1.5 text-sm font-semibold text-emerald-300 ring-1 ring-cta-green/30">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ripple rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Technicians available now in Patna
              </span>

              <h2 id="book-service-heading" className="mt-5 font-display text-3xl font-bold leading-tight md:text-5xl">
                Expert RO Service in Patna
                <span className="mt-2 block text-aqua-300">Visit Charge Only ₹{SERVICE.visitCharge}</span>
              </h2>

              <p className="mt-5 max-w-xl text-lg text-navy-100">
                Not getting water? Bad taste? Leakage? Our certified technicians reach you
                within {SERVICE.responseTime} with genuine spare parts and a{' '}
                {SERVICE.warrantyDays}-day service warranty.
              </p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {['All brands serviced', 'Genuine spare parts', 'Same-day visit', 'Transparent pricing'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-navy-50">
                    <svg className="h-5 w-5 shrink-0 text-aqua-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Direct-contact escalation path */}
              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href={CONTACT.primaryTel}
                  className="inline-flex items-center gap-2 rounded-xl bg-cta-green px-7 py-4 font-bold text-white shadow-lg transition hover:bg-cta-greenDark active:scale-[.98]"
                  data-analytics="hero_call_primary"
                >
                  <PhoneIcon /> Call {CONTACT.primaryPhone}
                </a>
                <a
                  href={CONTACT.whatsappLink()}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-7 py-4 font-bold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20"
                  data-analytics="hero_whatsapp"
                >
                  <WhatsAppIcon /> WhatsApp Us
                </a>
              </div>
            </div>

            {/* The actual booking form — client component */}
            <ServiceBookingForm />
          </div>
        </section>

        {/* 5 — Best sellers / featured catalog */}
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <BestSellers
            title="Best Selling Water Purifiers"
            subtitle="Trusted by 10,000+ homes across India"
            products={bestSellers}
            viewAllHref="/category/new-ro-purifiers"
          />
        </Suspense>

        <HowItWorks />

        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <BestSellers
            title="Genuine Spare Parts & Filters"
            subtitle="Membranes, pumps, housings & more — shipped pan-India"
            products={featured}
            viewAllHref="/category/spare-parts"
            variant="compact"
          />
        </Suspense>

        <Testimonials />
        <FaqAccordion faqs={HOMEPAGE_FAQS} />
      </main>
    </>
  );
}

/* ── Inline icons (avoid extra client JS on the critical path) ───────────── */
function PhoneIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
      <path d="M2 3a1 1 0 011-1h2.2a1 1 0 01.98.8l.83 4.1a1 1 0 01-.54 1.1L5.1 8.7a12.3 12.3 0 006.2 6.2l.7-1.37a1 1 0 011.1-.54l4.1.83a1 1 0 01.8.98V17a1 1 0 01-1 1h-1C8.6 18 2 11.4 2 4V3z" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.1s-.7 1-.9 1.2c-.2.2-.3.2-.6.1a8.2 8.2 0 01-4-3.5c-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4a3 3 0 00-.9 2.2c0 1.3.9 2.5 1.1 2.7.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.2-.3-.2-.6-.4zM12 2a10 10 0 00-8.6 15L2 22l5.1-1.3A10 10 0 1012 2z" />
    </svg>
  );
}
