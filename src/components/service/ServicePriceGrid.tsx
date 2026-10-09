/**
 * SERVICE PRICE GRID — har kaam ka rate, card me.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN (9 Oct 2026)
 * ─────────────────
 * Reference site (rosale) ke paas 4 service card hain, har card par price
 * bada likha hai: RO Service ₹299, Repair ₹299, Installation ₹499,
 * Un-installation ₹399. Yahi wajah hai ki unka page convert karta hai —
 * aane wale ko 2 second me pata chal jaata hai ki kitna lagega.
 *
 * Hamare page par rate the, par paragraph ke andar chhupe hue. Live scan:
 * unke 37 images aur card layout, hamare 5 images aur lamba lekh.
 *
 * 🔴 EK FARAK JO JAAN BOOJH KAR RAKHA HAI
 * ───────────────────────────────────────
 * Unka "₹299" ek hook hai — asli bill usse bada aata hai. Hamare har card
 * par ek `note` line hai jo saaf batati hai ki us rate me kya SHAAMIL NAHI
 * hai. Lamba game yahi jeetata hai: jo customer ₹299 sun kar bulaata hai
 * aur ₹1,400 ka bill paata hai, wo dobara nahi bulaata aur 1-star deta hai.
 *
 * Saara data `SERVICE_CARDS` se aata hai (ads-landing-data.ts), jo site ke
 * apne SERVICE_INTENTS ke rate se match karta hai.
 */
import Link from 'next/link';
import { SERVICE_CARDS } from '@/lib/seo/ads-landing-data';
import { CONTACT, SERVICE } from '@/lib/constants';

const ICONS: Record<string, React.ReactNode> = {
  service: (
    <path d="M10 2a1 1 0 011 1v1.07a6.01 6.01 0 013.93 3.93H16a1 1 0 110 2h-1.07A6.01 6.01 0 0111 13.93V15a1 1 0 11-2 0v-1.07A6.01 6.01 0 015.07 10H4a1 1 0 110-2h1.07A6.01 6.01 0 019 4.07V3a1 1 0 011-1zm0 4a3 3 0 100 6 3 3 0 000-6z" />
  ),
  repair: (
    <path d="M11.49 3.17a4 4 0 00-5.2 5.2L2.3 12.36a1 1 0 000 1.41l1.94 1.94a1 1 0 001.41 0l3.99-3.99a4 4 0 005.2-5.2l-2.3 2.3-1.77-.35-.35-1.77 2.3-2.3a4.1 4.1 0 00-1.23-.23z" />
  ),
  install: (
    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 4h6a1 1 0 110 2H7a1 1 0 110-2zm0 4h6a1 1 0 110 2H7a1 1 0 110-2z" />
  ),
  filter: (
    <path d="M3 4a1 1 0 011-1h12a1 1 0 01.8 1.6L12 11v4a1 1 0 01-.55.9l-2 1A1 1 0 018 16v-5L3.2 4.6A1 1 0 013 4z" />
  ),
  membrane: (
    <path d="M10 2c-3.3 0-6 1.34-6 3v10c0 1.66 2.7 3 6 3s6-1.34 6-3V5c0-1.66-2.7-3-6-3zm0 2c2.76 0 4 .79 4 1s-1.24 1-4 1-4-.79-4-1 1.24-1 4-1z" />
  ),
  amc: (
    <path d="M10 1l2.4 5.2 5.6.7-4.2 3.9 1.1 5.6L10 13.7 5.1 16.4l1.1-5.6L2 6.9l5.6-.7L10 1z" />
  ),
};

export default function ServicePriceGrid() {
  return (
    <section className="bg-white px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-2xl font-black text-navy-900 md:text-3xl">
          RO Service in {SERVICE.city} &mdash; Har Kaam Ka Rate
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-navy-600">
          Rate pehle, kaam baad me. Neeche har kaam ka range diya hai aur ye bhi likha hai ki
          usme kya <strong>shaamil nahi</strong> hai &mdash; taaki bill dekh kar chaunkna na pade.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CARDS.map((c) => (
            <article
              key={c.title}
              className="group flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100 transition hover:shadow-lg hover:ring-aqua-300"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-aqua-500 text-white">
                  <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    {ICONS[c.icon]}
                  </svg>
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-700 ring-1 ring-amber-200">
                  {c.priceLabel}
                </span>
              </div>

              <h3 className="mt-4 font-display text-lg font-black text-navy-900">{c.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">{c.blurb}</p>

              <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-navy-700 ring-1 ring-slate-200">
                <strong className="text-navy-900">Dhyan dein:</strong> {c.note}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href={CONTACT.primaryTel}
                  data-analytics={`ads-card-call-${c.icon}`}
                  className="rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-navy-800"
                >
                  Call {CONTACT.primaryPhone}
                </a>
                <Link
                  href={c.href}
                  className="text-sm font-bold text-aqua-600 hover:underline"
                >
                  Poora breakup &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-3xl rounded-2xl bg-navy-50 p-4 text-center text-sm leading-relaxed text-navy-700">
          <strong>Ek baat saaf:</strong> range isliye di hai kyunki machine ki umar aur aapke
          mohalle ka TDS dono rate badal dete hain. Exact number inspection ke baad milta hai,
          kaam shuru hone se pehle &mdash; aur aap mana kar dein to sirf ₹{SERVICE.visitCharge}{' '}
          visit charge lagta hai, aur kuch nahi.
        </p>
      </div>
    </section>
  );
}
