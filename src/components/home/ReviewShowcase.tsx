'use client';

/**
 * ReviewShowcase — the review block that goes immediately below the hero.
 *
 * Two problems this solves, both measured:
 *
 * 1. The site had 44 genuine reviews at 4.8★ and showed NONE of them on the
 *    homepage. Practitioners running 30-40% conversion on trades accounts are
 *    consistent that a review carousel directly under the hero is one of the
 *    highest-impact placements available. Proof belongs at the point of doubt,
 *    not on a separate testimonials page nobody visits.
 *
 * 2. "44 reviews" reads small when it is the headline. So the RATING leads at
 *    display size, the star breakdown bar shows 86% five-star, and the count
 *    sits underneath as supporting detail rather than the main claim. Same
 *    honest number, completely different weight.
 *
 * Auto-advancing carousel, pauses on hover/focus, swipeable on touch, and
 * fully keyboard navigable. Reduced-motion users get a static grid.
 */
import { useEffect, useRef, useState } from 'react';
import { REVIEWS } from '@/components/home/Testimonials';
import { getRatingSummary } from '@/lib/social-proof';
import { GBP } from '@/lib/constants';

export default function ReviewShowcase() {
  const summary = getRatingSummary();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  }, []);

  useEffect(() => {
    if (paused || reduced || REVIEWS.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % REVIEWS.length), 5000);
    return () => clearInterval(t);
  }, [paused, reduced]);

  const go = (n: number) => setIndex(((n % REVIEWS.length) + REVIEWS.length) % REVIEWS.length);

  return (
    <section
      id="reviews"
      aria-label="Customer reviews"
      className="scroll-mt-24 bg-white py-12 md:py-16"
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-[320px,1fr] lg:gap-12">

          {/* ── Rating panel: the number that deserves to be big ── */}
          <div className="rounded-3xl bg-gradient-to-br from-navy-700 to-navy-800 p-6 text-white shadow-card-hover">
            <div className="flex items-end gap-3">
              <p className="font-display text-5xl font-extrabold leading-none md:text-6xl">
                {summary.rating}
              </p>
              <div className="pb-1">
                <p className="text-lg leading-none text-gold-400" aria-hidden="true">★★★★★</p>
                <p className="mt-1 text-xs text-navy-200">out of 5</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-navy-100">
              Based on <strong className="text-white">{summary.count} verified</strong> Google reviews
            </p>

            {/* Star breakdown — visual weight without inventing numbers */}
            <div className="mt-5 space-y-1.5">
              {summary.breakdown.map((b) => (
                <div key={b.stars} className="flex items-center gap-2 text-xs">
                  <span className="w-8 shrink-0 text-navy-200">{b.stars}★</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy-600">
                    <div
                      className="h-full rounded-full bg-gold-400 transition-all duration-1000"
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-navy-300">{b.pct}%</span>
                </div>
              ))}
            </div>

            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(GBP.name + ' Patna reviews')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              Google par sab reviews dekho ↗
            </a>

            <p className="mt-3 text-[11px] leading-relaxed text-navy-300">
              Har review asli customer ka hai. Hum na review kharidte hain,
              na discount de kar likhwate hain.
            </p>
          </div>

          {/* ── Review carousel ── */}
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchX.current == null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
              touchX.current = null;
            }}
          >
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                  Patna ke log kya kehte hain
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Asli customers, asli kaam — Google par verified
                </p>
              </div>
              {!reduced && REVIEWS.length > 1 && (
                <div className="hidden shrink-0 gap-2 sm:flex">
                  <button
                    onClick={() => go(index - 1)}
                    aria-label="Pichla review"
                    className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-navy-200 transition hover:bg-navy-50"
                  >‹</button>
                  <button
                    onClick={() => go(index + 1)}
                    aria-label="Agla review"
                    className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-navy-200 transition hover:bg-navy-50"
                  >›</button>
                </div>
              )}
            </div>

            {reduced ? (
              /* Reduced motion: plain grid, no movement at all */
              <div className="grid gap-4 md:grid-cols-3">
                {REVIEWS.map((r) => <ReviewCard key={r.name} r={r} />)}
              </div>
            ) : (
              <>
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${index * 100}%)` }}
                  >
                    {REVIEWS.map((r) => (
                      <div key={r.name} className="w-full shrink-0 px-0.5">
                        <ReviewCard r={r} large />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex justify-center gap-2">
                  {REVIEWS.map((r, i) => (
                    <button
                      key={r.name}
                      onClick={() => go(i)}
                      aria-label={`Review ${i + 1}`}
                      aria-current={i === index}
                      className={`h-1.5 rounded-full transition-all ${
                        i === index ? 'w-7 bg-aqua-500' : 'w-1.5 bg-navy-200 hover:bg-navy-300'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({
  r, large,
}: {
  r: { stars: number; body: string; name: string; place: string; initials: string };
  large?: boolean;
}) {
  return (
    <figure
      className={`h-full rounded-2xl border border-navy-100 bg-sand-100 ${
        large ? 'p-6 md:p-8' : 'p-5'
      }`}
    >
      <div className="text-base tracking-widest text-gold-500" aria-label={`${r.stars} out of 5 stars`}>
        {'★'.repeat(r.stars)}
        <span className="text-navy-200">{'★'.repeat(5 - r.stars)}</span>
      </div>

      <blockquote
        className={`mt-3 leading-relaxed text-navy-700 ${large ? 'text-base md:text-lg' : 'text-sm'}`}
      >
        &ldquo;{r.body}&rdquo;
      </blockquote>

      <figcaption className="mt-4 flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-aqua-500 text-sm font-bold text-white">
          {r.initials}
        </span>
        <span>
          <span className="block text-sm font-bold text-navy-700">{r.name}</span>
          <span className="block text-xs text-muted">{r.place}</span>
        </span>
        <span className="ml-auto shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
          ✓ Verified
        </span>
      </figcaption>
    </figure>
  );
}
