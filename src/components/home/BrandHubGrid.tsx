/**
 * BRAND HUB GRID — sirf /service-patna/brand ke liye
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Homepage ke `BrandLogoGrid` se ye JAAN-BUJH KAR alag hai:
 *
 *   Homepage          : 5-column, sirf logo tile, naam tak nahi
 *   Yahan (hub)       : wahi logo UTNE HI SIZE ka (h-28 / md:h-32) par ek
 *                       bade card ke andar — naam, models, fault count aur
 *                       asli "repair ₹X se" ke saath
 *
 * Do page par bilkul same grid lagana do nuksaan karta hai:
 *   1. Google dono ko near-duplicate maanta hai aur ek ko kam dikhata hai
 *   2. Hub par aane wala banda pehle se jaanta hai ki hum multi-brand hain —
 *      use ab "mera brand" aur "kitna lagega" chahiye, dobara logo wall nahi
 *
 * ⚖️ Disclaimer page par alag se aata hai (BRAND_DISCLAIMER). Hatana mat.
 */

import Image from 'next/image';
import Link from 'next/link';
import { SERVICED_BRANDS } from '@/lib/seo/patna-service-data';
import {
  BRAND_SLUG_LOGO,
  EXTRA_LOGO_BRANDS,
  shortBrandName,
  brandMonogram,
  fixCostRange,
} from '@/lib/seo/brand-hub';

/** Commercial aur catch-all alag padhte hain — inka apna row hai. */
const SPECIAL = new Set(['commercial-ro', 'other-brands']);

export default function BrandHubGrid() {
  const consumer = SERVICED_BRANDS.filter((b) => !SPECIAL.has(b.slug));
  const extras = SERVICED_BRANDS.filter((b) => SPECIAL.has(b.slug));

  return (
    <>
      {/* ── Main brand cards ─────────────────────────────────────────── */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {consumer.map((b) => {
          const short = shortBrandName(b.name);
          const logo = BRAND_SLUG_LOGO[b.slug];
          const from = fixCostRange(b.slug);
          const topFault = b.commonIssues?.[0]?.issue;

          return (
            <li key={b.slug}>
              <Link
                href={`/service-patna/brand/${b.slug}`}
                title={`${short} RO service in Patna`}
                className="card-hover group flex h-full flex-col overflow-hidden"
              >
                {/* Logo chip — homepage jitni hi height: h-28 / md:h-32 */}
                <div className="flex h-28 items-center justify-center border-b border-navy-100 bg-white p-4 md:h-32 md:p-5">
                  {logo ? (
                    <Image
                      src={logo}
                      alt={`${short} RO water purifier service in Patna`}
                      width={200}
                      height={200}
                      className="h-full w-auto max-w-full object-contain"
                      loading="lazy"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50 font-display text-xl font-extrabold tracking-tight text-navy-400 ring-1 ring-navy-100 md:h-20 md:w-20 md:text-2xl"
                    >
                      {brandMonogram(b.name)}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-navy-700 group-hover:text-aqua-700">
                      {short} RO Service
                    </h3>
                    <span className="shrink-0 text-aqua-600 transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>

                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
                    {b.popularModels.slice(0, 3).join(' · ')}
                  </p>

                  {topFault ? (
                    <p className="mt-3 text-xs text-navy-500">
                      <span className="font-semibold text-navy-600">Sabse common:</span>{' '}
                      {topFault}
                    </p>
                  ) : null}

                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {b.commonIssues.length} faults · parts in stock
                    </span>
                    {from ? (
                      <span className="rounded-lg bg-sand-100 px-2.5 py-1 text-[11px] font-bold text-navy-700">
                        Repair {from}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* ── Commercial + catch-all ───────────────────────────────────── */}
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {extras.map((b) => (
          <li key={b.slug}>
            <Link
              href={`/service-patna/brand/${b.slug}`}
              className="group flex h-full flex-col rounded-2xl bg-navy-gradient p-6 text-white shadow-card transition hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-bold">{b.name}</h3>
                <span className="shrink-0 text-gold-300 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-navy-200">
                {b.popularModels.slice(0, 5).join(' · ')}
              </p>
              <p className="mt-3 text-[11px] font-semibold text-gold-300">
                {b.commonIssues.length} common faults covered
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {/* ── Jinka page nahi, par service karte hain ──────────────────── */}
      <p className="mb-4 mt-10 text-center text-sm font-semibold uppercase tracking-wider text-navy-400">
        In par bhi kaam karte hain
      </p>
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-4">
        {EXTRA_LOGO_BRANDS.map((b) => (
          <div
            key={b.name}
            className="flex h-20 w-32 items-center justify-center rounded-xl border border-navy-100 bg-white p-3 shadow-sm"
            title={b.alt}
          >
            <Image
              src={b.logo}
              alt={b.alt}
              width={160}
              height={160}
              className="h-full w-auto max-w-full object-contain"
              loading="lazy"
              sizes="128px"
            />
          </div>
        ))}
      </div>
    </>
  );
}
