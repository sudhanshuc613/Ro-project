'use client';

/**
 * HeroCarousel — the dual-message hero.
 *  Slide 1: "India's Best RO Purifiers — Deliver Anywhere"   (e-commerce)
 *  Slide 2: "Expert RO Service in Patna — Visit Charge ₹200" (local service)
 *
 * Auto-advances every 6s, pauses on hover/focus, respects prefers-reduced-motion,
 * fully keyboard + swipe navigable. Slide 1 image is priority-loaded for LCP.
 */
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CONTACT, SERVICE } from '@/lib/constants';

interface Slide {
  id: string;
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  theme: 'ecommerce' | 'service';
  primary: { label: string; href: string; external?: boolean };
  secondary: { label: string; href: string; external?: boolean };
  badges: string[];
}

const SLIDES: Slide[] = [
  {
    id: 'ecommerce',
    eyebrow: 'Pan-India Delivery',
    title: "India's Best RO Purifiers",
    highlight: 'Deliver Anywhere',
    subtitle:
      'Domestic purifiers, commercial RO plants and genuine spare parts — shipped to every pincode in India. Free delivery above ₹1,999.',
    image: '/products/ro-domestic.png',
    imageAlt: 'Modern white and blue domestic RO water purifier available for delivery across India',
    theme: 'ecommerce',
    primary: { label: 'Shop Purifiers', href: '/category/new-ro-purifiers' },
    secondary: { label: 'Commercial Plants', href: '/category/commercial-plants' },
    badges: ['7-Day Easy Returns', 'Genuine Products', 'EMI Available'],
  },
  {
    id: 'service',
    eyebrow: 'Patna, Bihar Only',
    title: 'Expert RO Service in Patna',
    highlight: `Visit Charge Only ₹${SERVICE.visitCharge}`,
    subtitle:
      `Repair, installation, filter change & AMC by certified technicians. Same-day visit within ${SERVICE.responseTime} and a ${SERVICE.warrantyDays}-day service warranty.`,
    image: '/banners/service-tech.png',
    imageAlt: 'AquaNexa technician repairing an RO water purifier at a home in Patna',
    theme: 'service',
    primary: { label: `Call ${CONTACT.primaryPhone}`, href: CONTACT.primaryTel, external: true },
    secondary: { label: 'Book Service Online', href: '#book-service' },
    badges: ['All Brands', 'Genuine Parts', '30-Day Warranty'],
  },
];

const AUTOPLAY_MS = 6000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((i: number) => setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length), []);
  const next = useCallback(() => go(index + 1), [index, go]);
  const prev = useCallback(() => go(index - 1), [index, go]);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, next]);

  return (
    <section
      className="relative isolate overflow-hidden bg-navy-700"
      aria-roledescription="carousel"
      aria-label="AquaNexa featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); }}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        touchX.current = null;
      }}
      tabIndex={0}
    >
      {SLIDES.map((s, i) => {
        const active = i === index;
        const isService = s.theme === 'service';
        return (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${SLIDES.length}: ${s.title}`}
            aria-hidden={!active}
            className={[
              'transition-opacity duration-700 ease-out',
              active ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0',
            ].join(' ')}
          >
            {/* Themed background wash */}
            <div
              className={[
                'absolute inset-0 -z-10',
                isService
                  ? 'bg-[linear-gradient(115deg,#0B2545_0%,#13315C_45%,#0E7490_100%)]'
                  : 'bg-[linear-gradient(115deg,#0B2545_0%,#0891B2_60%,#06B6D4_100%)]',
              ].join(' ')}
            />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_30%,rgba(255,255,255,.14),transparent_60%)]" />

            <div className="container mx-auto grid items-center gap-8 px-4 py-14 md:py-20 lg:grid-cols-[1.05fr,.95fr] lg:gap-6">
              {/* ── Copy ── */}
              <div className="text-white">
                <span
                  className={[
                    'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ring-1',
                    isService
                      ? 'bg-cta-orange/20 text-orange-200 ring-cta-orange/40'
                      : 'bg-aqua-400/20 text-aqua-100 ring-aqua-300/40',
                  ].join(' ')}
                >
                  {isService && <LocationPin />}
                  {s.eyebrow}
                </span>

                {/* SEO: only the FIRST slide is the page <h1>. Rendering an h1
                    per slide would give the homepage multiple H1s, which
                    dilutes the primary keyword signal. */}
                {(() => {
                  const Heading = i === 0 ? 'h1' : 'p';
                  return (
                    <Heading className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                      {s.title}
                      <span className={isService ? 'mt-2 block text-orange-300' : 'mt-2 block text-aqua-200'}>
                        {s.highlight}
                      </span>
                    </Heading>
                  );
                })()}

                <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">
                  {s.subtitle}
                </p>

                {/* CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <CTA slide={s} which="primary" />
                  <CTA slide={s} which="secondary" />
                </div>

                {/* Secondary phone for the service slide */}
                {isService && (
                  <p className="mt-5 text-sm text-navy-100">
                    Or call{' '}
                    <a href={CONTACT.secondaryTel} className="font-bold text-white underline decoration-aqua-400 underline-offset-4 hover:text-aqua-200">
                      {CONTACT.secondaryPhone}
                    </a>{' '}
                    · {CONTACT.hours}
                  </p>
                )}

                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                  {s.badges.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm font-medium text-navy-50">
                      <CheckCircle /> {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Visual ── */}
              <div className="relative mx-auto w-full max-w-lg">
                <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-white/10 blur-2xl" />
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white/95 shadow-2xl ring-1 ring-white/30">
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    fill
                    priority={i === 0}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    sizes="(max-width: 1024px) 90vw, 512px"
                    className="object-contain p-5"
                  />
                </div>

                {/* Floating price/offer chip */}
                <div className="absolute -bottom-4 -left-3 animate-floatY rounded-2xl bg-white px-5 py-3 shadow-xl ring-1 ring-navy-100">
                  {isService ? (
                    <>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Visit Charge</p>
                      <p className="font-display text-2xl font-extrabold text-navy-700">
                        ₹{SERVICE.visitCharge}
                        <span className="ml-1 text-xs font-semibold text-cta-green">only</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Starting from</p>
                      <p className="font-display text-2xl font-extrabold text-navy-700">
                        ₹4,999<span className="ml-1 text-xs font-semibold text-cta-orange">+GST</span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Controls ── */}
      <button onClick={prev} aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/15 p-3 text-white backdrop-blur transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:block">
        <Chevron dir="left" />
      </button>
      <button onClick={next} aria-label="Next slide"
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/15 p-3 text-white backdrop-blur transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:block">
        <Chevron dir="right" />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}: ${s.title}`}
            aria-current={i === index}
            className={[
              'h-2.5 rounded-full transition-all duration-300',
              i === index ? 'w-9 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70',
            ].join(' ')}
          />
        ))}
      </div>
    </section>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */
function CTA({ slide, which }: { slide: Slide; which: 'primary' | 'secondary' }) {
  const cfg = slide[which];
  const isService = slide.theme === 'service';
  const base =
    'inline-flex items-center gap-2 rounded-xl px-7 py-4 text-base font-bold transition active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700';

  const cls =
    which === 'primary'
      ? isService
        ? `${base} bg-cta-green text-white shadow-lg hover:bg-cta-greenDark`
        : `${base} bg-cta-orange text-white shadow-cta hover:bg-cta-orangeDark`
      : `${base} bg-white/12 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/22`;

  const content = (
    <>
      {which === 'primary' && isService && <PhoneGlyph />}
      {cfg.label}
      {which === 'primary' && !isService && <ArrowRight />}
    </>
  );

  return cfg.external ? (
    <a href={cfg.href} className={cls} data-analytics={`hero_${slide.id}_${which}`}>{content}</a>
  ) : (
    <Link href={cfg.href} className={cls} data-analytics={`hero_${slide.id}_${which}`}>{content}</Link>
  );
}

const CheckCircle = () => (
  <svg className="h-4 w-4 text-aqua-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clipRule="evenodd" />
  </svg>
);
const LocationPin = () => (
  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
    <path fillRule="evenodd" d="M10 18s6-5.3 6-9.5A6 6 0 004 8.5C4 12.7 10 18 10 18zm0-7.5a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" />
  </svg>
);
const PhoneGlyph = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
    <path d="M2 3a1 1 0 011-1h2.2a1 1 0 01.98.8l.83 4.1a1 1 0 01-.54 1.1L5.1 8.7a12.3 12.3 0 006.2 6.2l.7-1.37a1 1 0 011.1-.54l4.1.83a1 1 0 01.8.98V17a1 1 0 01-1 1h-1C8.6 18 2 11.4 2 4V3z" />
  </svg>
);
const ArrowRight = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);
const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
  </svg>
);
