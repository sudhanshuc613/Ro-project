/**
 * BRAND LOGO GRID
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Owner ne 10 brand logo diye (700×700 PNG/WebP). Ye grid unhe bade,
 * saaf tiles me dikhata hai — har tile ek card, safed background par,
 * taaki har brand ka apna colour saaf dikhe.
 *
 * ⚖️ DISCLAIMER HATANA MAT. Wo `BRAND_DISCLAIMER` se aata hai aur wahi
 * ek line hai jo "nominative fair use" ko "trademark infringement" banne
 * se rokti hai. Poori wajah src/lib/seo/brand-logos.ts me likhi hai.
 *
 * SEO: har logo ek `<Link>` ke andar hai jo us brand ke service page pe
 * jaata hai — matlab 10 naye internal link, jo brand pages ko crawl
 * priority dete hain (crawl demand badhane ka seedha tareeka).
 */

import Image from 'next/image';
import Link from 'next/link';
import {
  BRAND_LOGOS,
  BRAND_TEXT_ONLY,
  BRAND_DISCLAIMER,
} from '@/lib/seo/brand-logos';

export default function BrandLogoGrid() {
  return (
    <section className="bg-navy-50 py-14 md:py-16" aria-labelledby="brands-heading">
      <div className="container mx-auto px-4">
        <h2
          id="brands-heading"
          className="mb-3 text-center font-display text-3xl font-extrabold text-navy-700"
        >
          Har Brand Ki RO Service — Patna Me
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-navy-500">
          Kent se lekar local assembled machine tak — hum sab par kaam karte hain.
          Visit charge ₹200, 30 din warranty, genuine parts.
        </p>

        {/* ── Logo tiles ─────────────────────────────────────────────── */}
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-5">
          {BRAND_LOGOS.map((b) => {
            const tile = (
              <div
                className="flex h-28 items-center justify-center rounded-xl border border-navy-100 bg-white p-4 shadow-sm transition hover:border-aqua-300 hover:shadow-md md:h-32 md:p-5"
              >
                {b.logo ? (
                  <Image
                    src={b.logo}
                    alt={b.alt}
                    width={200}
                    height={200}
                    className="h-full w-auto max-w-full object-contain"
                    loading="lazy"
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                  />
                ) : (
                  <span className="text-center font-display text-lg font-bold text-navy-700">
                    {b.name}
                  </span>
                )}
              </div>
            );

            return b.href ? (
              <Link key={b.name} href={b.href} title={`${b.name} RO service Patna`}>
                {tile}
              </Link>
            ) : (
              <div key={b.name}>{tile}</div>
            );
          })}
        </div>

        {/* ── Baaki brands — text tiles ──────────────────────────────── */}
        <p className="mb-4 mt-9 text-center text-sm font-semibold uppercase tracking-wider text-navy-400">
          Aur in sab par bhi
        </p>
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2">
          {BRAND_TEXT_ONLY.map((b) =>
            b.href ? (
              <Link
                key={b.name}
                href={b.href}
                className="rounded-lg border border-navy-100 bg-white px-4 py-2 text-sm font-semibold text-navy-600 transition hover:border-aqua-300 hover:text-aqua-600"
              >
                {b.name}
              </Link>
            ) : (
              <span
                key={b.name}
                className="rounded-lg border border-navy-100 bg-white px-4 py-2 text-sm font-semibold text-navy-600"
              >
                {b.name}
              </span>
            ),
          )}
        </div>

        {/* ── ⚖️ LEGAL DISCLAIMER — HATANA MAT ───────────────────────── */}
        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-navy-400">
          {BRAND_DISCLAIMER}
        </p>
      </div>
    </section>
  );
}
