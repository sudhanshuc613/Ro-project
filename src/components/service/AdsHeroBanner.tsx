/**
 * ADS HERO BANNER — /ro-service-in-patna ka sabse upar ka hissa.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN (9 Oct 2026) — owner ka seedha order
 * ─────────────────────────────────────────
 * "tu bhi banner bana usme clickable phone no rakhna banner ke upper bhi
 *  pricing dekh ... ye page add pe show hoga"
 *
 * Ye Google Ads ka landing page hai (AW-610913435). Har click ka paisa
 * lagta hai. Isliye is block ka ek hi kaam hai: 3 second ke andar
 * visitor ko ye 4 cheez dikhana —
 *     1. kaam kya hai      (RO service, Patna)
 *     2. kitna lagega      (₹200 visit charge, saaf)
 *     3. kitni der me      (90 minute)
 *     4. number kahan hai  (do jagah, dono tappable)
 *
 * 🔴 PHONE NUMBER IMAGE KE ANDAR NAHI HAI — JAAN BOOJH KAR
 * ────────────────────────────────────────────────────────
 * Competitor (rosale) ne apna number banner ki IMAGE me chhapa hai. Usse
 * teen nuksan hote hain:
 *     • mobile par tap nahi hota — user ko number yaad karke dial karna padta hai
 *     • Google uss number ko padh hi nahi sakta (image hai)
 *     • number badla to poora banner dobara banana padega
 * Hamara number asli HTML `<a href="tel:...">` hai — tap karte hi dial
 * khulta hai, Google use entity se jodta hai, aur `data-analytics` ke
 * zariye Google Ads conversion bhi fire hota hai.
 *
 * BANNER IMAGE
 * ────────────
 * public/banners/patna-service-hero.png — apna banaya hua graphic.
 * Koi insaan nahi hai usme, jaan boojh kar:
 *     • AI-generated chehra GBP par reverse-image-search me pakda jaata hai
 *     • purani service-tech.png me technician ki shirt par "ROCARE" likha
 *       hai (competitor ka naam) — isliye wo yahan use NAHI ki
 * Image me koi text bhi nahi hai, isliye spelling galti ka risk zero aur
 * saara text Google ke liye padhne layak HTML me hai.
 *
 * COLOUR — copy nahi
 * ──────────────────
 * rosale: #5ce1e6 + #13c2c2 bright cyan par light-grey background.
 * hum   : navy-900 deep base + aqua accent — jo pehle se hamari site ka
 *         rang hai. Reference se layout ka idea liya, rang nahi.
 */
import Image from 'next/image';
import Link from 'next/link';
import { BRAND, CONTACT, SERVICE, GBP, GBP_RATING_TEXT } from '@/lib/constants';

export default function AdsHeroBanner({
  h1,
  areaCount,
  brandCount,
}: {
  h1: string;
  areaCount: number;
  brandCount: number;
}) {
  const since = new Date().getFullYear() - 2019;

  return (
    <section className="relative overflow-hidden bg-navy-900">
      {/* Banner graphic — right side par, text ke peeche. Mobile par chhupa
          nahi hai, bas opacity kam hai taaki text padha jaaye. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full md:w-[58%] lg:w-[54%]">
        <Image
          src="/banners/patna-service-hero.png"
          alt={`RO service in ${SERVICE.city} — water purifier repair, TDS testing and filter change by ${BRAND.name}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 58vw"
          className="object-cover object-right opacity-25 md:opacity-100"
        />
        {/* Left se gradient taaki text ke peeche image halki ho jaaye */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/85 to-transparent md:from-navy-900 md:via-navy-900/70 md:to-navy-900/10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16 lg:py-20">
        <div className="max-w-2xl">
          {/* Rating strip — asli number, badhaya hua nahi */}
          <div className="mb-4 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-aqua-100 ring-1 ring-white/20">
            <span className="text-amber-300">★ {GBP_RATING_TEXT}</span>
            <span className="text-white/40">|</span>
            <span>{GBP.reviewCount} Google reviews</span>
            <span className="text-white/40">|</span>
            <span>{SERVICE.city} me {since}+ saal</span>
          </div>

          <h1 className="font-display text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            {h1}{' '}
            <span className="mt-2 block bg-gradient-to-r from-aqua-300 via-aqua-200 to-amber-300 bg-clip-text text-transparent">
              Visit Charge Sirf ₹{SERVICE.visitCharge}
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-aqua-50 md:text-lg">
            Ghar par technician, {SERVICE.responseTime} ke andar. Har brand ki machine &mdash;
            Kent, Aquaguard, Pureit, Livpure, AO Smith aur local assembled bhi.
            Rate kaam shuru hone se pehle bataya jaata hai, aur{' '}
            <strong className="text-white">{SERVICE.warrantyDays} din ki warranty bill par likhi</strong>{' '}
            milti hai.
          </p>

          {/* ── 3 PROOF CHIPS — pricing yahin, upar hi ── */}
          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { v: `₹${SERVICE.visitCharge}`, k: 'Visit charge', s: 'TDS test + poora inspection' },
              { v: SERVICE.responseTime.replace(' minutes', ' min'), k: 'Pahunchne ka target', s: `${SERVICE.city} city ke andar` },
              { v: `${SERVICE.warrantyDays} din + 1 saal`, k: 'Warranty', s: `labour ${SERVICE.warrantyDays} din · part ${SERVICE.partsWarrantyMonths} mahine` },
            ].map((x) => (
              <div
                key={x.k}
                className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-sm"
              >
                <dt className="text-2xl font-black text-aqua-300">{x.v}</dt>
                <dd className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-white">{x.k}</dd>
                <dd className="mt-0.5 text-xs text-aqua-100">{x.s}</dd>
              </div>
            ))}
          </dl>

          {/* ── CTA — number bada aur tappable ── */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={CONTACT.primaryTel}
              data-analytics="ads-hero-call-primary"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-aqua-400 px-7 py-4 text-lg font-black text-navy-900 shadow-xl shadow-aqua-900/30 transition hover:bg-aqua-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-aqua-200"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Call {CONTACT.primaryPhone}
            </a>

            <a
              href={CONTACT.whatsappLink(
                `RO service chahiye ${SERVICE.city} me. Machine ka photo bhej raha hoon.`,
              )}
              data-analytics="ads-hero-whatsapp"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-black text-navy-900 shadow-lg transition hover:bg-aqua-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.15h-.01c-1.52 0-3.01-.41-4.31-1.18l-.31-.18-3.2.84.85-3.12-.2-.32a8.2 8.2 0 01-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.17 8.17 0 012.41 5.82c0 4.54-3.69 8.23-8.23 8.23z" />
              </svg>
              WhatsApp par photo bhejein
            </a>
          </div>

          {/* Doosra number — pehla busy ho to */}
          <p className="mt-4 text-sm text-aqua-100">
            Pehla number busy ho to{' '}
            <a
              href={CONTACT.secondaryTel}
              data-analytics="ads-hero-call-secondary"
              className="font-black text-white underline decoration-aqua-400 decoration-2 underline-offset-4 hover:text-aqua-200"
            >
              {CONTACT.secondaryPhone}
            </a>{' '}
            par kijiye &mdash; dono {CONTACT.address.locality} office par bajte hain, koi IVR nahi.
          </p>

          <p className="mt-3 text-xs text-aqua-200">
            {areaCount} mohalle &middot; {brandCount}+ brand &middot; Sai Gali, {CONTACT.address.locality},{' '}
            {SERVICE.city} {CONTACT.address.pincode} &middot;{' '}
            <Link href="/ro-service-patna-faq" className="underline hover:text-white">
              poora rate card dekho
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
