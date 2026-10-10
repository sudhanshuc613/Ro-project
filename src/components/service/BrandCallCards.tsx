/**
 * BRAND CALL CARDS — logo grid + har brand ka card, SIRF HAMARE NUMBER KE SAATH.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 OWNER KA SEEDHA ORDER (9 Oct 2026)
 * ─────────────────────────────────────
 * "jo tune customer ke no add kiya hai alag alag brand ka waha pe mera
 *  phone no rakh ... kiyuki ye page add pe show hoga"
 *
 * Ye bilkul sahi faisla hai, aur wajah paison ki hai:
 *
 * Ye page Google Ads ka landing page hai. Har click par owner paisa deta
 * hai (Google ka apna forecast: ₹8.16 avg CPC). Agar is page par Kent ka
 * official helpline likha ho, to jo banda ₹8 ka click bana kar aaya wo
 * Kent ko call kar ke chala jayega. Matlab hum ne paisa de kar competitor
 * ko lead di.
 *
 * Isliye is page par:
 *     ✅ sirf 8969821440 / 9661288308
 *     ❌ kisi brand ka customer care number NAHI
 *     ❌ brand ki website ka koi bahar jaane wala link NAHI
 *
 * Brand ke official number sirf `/ro-customer-care-patna` par hain. Wo
 * ORGANIC page hai — wahan wo number hi page ko rank karate hain, kyunki
 * log wahi dhoondh rahe hote hain. Do page, do alag kaam. Paid page par
 * conversion, organic page par visibility.
 *
 * LOGO
 * ────
 * `BRAND_LOGOS` se — 10 asli logo jo owner ne diye the. Baaki brands
 * `BRAND_TEXT_ONLY` se text tile ke roop me. Logo par koi external link
 * nahi, sirf hamare apne brand page ka internal link.
 *
 * ⚖️ `BRAND_DISCLAIMER` HATANA MAT. Wahi ek line hai jo "nominative fair
 *    use" ko trademark infringement banne se rokti hai. Poori wajah
 *    src/lib/seo/brand-logos.ts me likhi hai.
 */
import Image from 'next/image';
import Link from 'next/link';
import { BRAND_LOGOS, BRAND_TEXT_ONLY, BRAND_DISCLAIMER } from '@/lib/seo/brand-logos';
import type { BrandServiceContent } from '@/lib/seo/patna-service-data';
import { CONTACT, SERVICE } from '@/lib/constants';
import { shortBrandName } from '@/lib/seo/brand-hub';

export default function BrandCallCards({ brands }: { brands: BrandServiceContent[] }) {
  /* Top 6 brands jinke card detail ke saath dikhenge — baaki logo grid me. */
  const featured = brands
    .filter((b) => !['commercial-ro', 'other-brands'].includes(b.slug))
    .slice(0, 4);

  return (
    <section className="bg-white px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-2xl font-black text-navy-900 md:text-3xl">
          Har Brand Ki RO Service &mdash; Ek Hi Number
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-navy-600">
          Kent, Aquaguard, Pureit ya bina sticker wali local machine &mdash; sabke liye{' '}
          <a
            href={CONTACT.primaryTel}
            data-analytics="ads-brand-intro-call"
            className="font-black text-aqua-700 underline decoration-aqua-300 decoration-2 underline-offset-2 hover:text-aqua-800"
          >
            {CONTACT.primaryPhone}
          </a>
          .
        </p>

        {/* ── LOGO GRID ── */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {BRAND_LOGOS.map((b) => {
            const tile = (
              <>
                <div className="relative h-14 w-full md:h-16">
                  <Image
                    src={b.logo as string}
                    alt={b.alt}
                    fill
                    sizes="(max-width: 768px) 40vw, 18vw"
                    className="object-contain"
                  />
                </div>
                <p className="mt-2 text-center text-xs font-bold text-navy-700">{b.name}</p>
              </>
            );
            return b.href ? (
              <Link
                key={b.name}
                href={b.href}
                className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-100 transition hover:ring-aqua-300"
              >
                {tile}
              </Link>
            ) : (
              <div
                key={b.name}
                className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-100"
              >
                {tile}
              </div>
            );
          })}

          {BRAND_TEXT_ONLY.slice(0, 10).map((b) =>
            b.href ? (
              <Link
                key={b.name}
                href={b.href}
                className="flex min-h-[88px] items-center justify-center rounded-2xl bg-navy-50 p-4 text-center text-sm font-black text-navy-700 ring-1 ring-navy-100 transition hover:bg-white hover:ring-aqua-300"
              >
                {b.name}
              </Link>
            ) : (
              <div
                key={b.name}
                className="flex min-h-[88px] items-center justify-center rounded-2xl bg-navy-50 p-4 text-center text-sm font-black text-navy-700 ring-1 ring-navy-100"
              >
                {b.name}
              </div>
            ),
          )}
        </div>

        {/* ── BRAND CARDS — sabse aam fault + rate + HAMARA number ── */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((b) => {
            const short = shortBrandName(b.name);
            const top = b.commonIssues[0];
            return (
              <article
                key={b.slug}
                className="flex flex-col rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"
              >
                <h3 className="font-display text-lg font-black text-navy-900">
                  {short} RO Service {SERVICE.city}
                </h3>

                {top && (
                  <div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                      Is brand me sabse aam
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-navy-900">{top.issue}</p>
                    <p className="mt-1 text-xs leading-relaxed text-navy-600">{top.cause}</p>
                    <p className="mt-1.5 text-sm font-black text-amber-700">{top.typicalCost}</p>
                  </div>
                )}

                <p className="mt-3 flex-1 text-xs leading-relaxed text-navy-600">
                  {b.popularModels.slice(0, 3).join(' · ')}
                  {b.popularModels.length > 3 ? ' aur baaki models' : ''}
                </p>

                {/* 🔴 SIRF HAMARA NUMBER. Brand ka helpline yahan nahi. */}
                <a
                  href={CONTACT.primaryTel}
                  data-analytics={`ads-brand-call-${b.slug}`}
                  className="mt-4 rounded-xl bg-navy-900 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-navy-800"
                >
                  {short} ke liye call: {CONTACT.primaryPhone}
                </a>
                <Link
                  href={`/service-patna/brand/${b.slug}`}
                  className="mt-2 text-center text-xs font-bold text-aqua-600 hover:underline"
                >
                  {short} ki poori detail &rarr;
                </Link>
              </article>
            );
          })}
        </div>

        {/* Local / no-brand machine — Patna ka sabse bada segment */}
        <div className="mt-6 rounded-3xl bg-navy-900 p-6 md:p-8">
          <h3 className="font-display text-xl font-black text-white">
            Machine par koi brand nahi likha? Koi baat nahi.
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-aqua-50">
            {SERVICE.city} me bika hua har doosra purifier assembled hota hai &mdash; bina
            sticker, bina manual, aur dealer aksar gaayab. Par inka membrane, filter, pump aur
            SMPS sab <strong className="text-white">standard size</strong> ke hote hain. Theek
            karna mushkil nahi &mdash; bas koi mana na kare. Hum nahi karte.
          </p>
          <a
            href={CONTACT.primaryTel}
            data-analytics="ads-brand-local-call"
            className="mt-5 inline-block rounded-2xl bg-aqua-400 px-7 py-3.5 text-base font-black text-navy-900 transition hover:bg-aqua-300"
          >
            Call {CONTACT.primaryPhone}
          </a>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted">{BRAND_DISCLAIMER}</p>
      </div>
    </section>
  );
}
