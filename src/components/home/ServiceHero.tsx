'use client';

/**
 * ServiceHero — SERVICE-FIRST homepage hero.
 *
 * Strategy: the money is in Patna service calls, not spare-part orders.
 * So the hero sells ONE thing — book a technician — and leads with the
 * strongest competitive weapon: ₹200 visit charge when every competitor
 * in Patna charges ₹299–₹399.
 *
 * The e-commerce side is still reachable (nav + a strip lower down) but it
 * no longer competes for attention above the fold.
 */
import Image from 'next/image';
import Link from 'next/link';
import { CONTACT, SERVICE } from '@/lib/constants';

export default function ServiceHero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(118deg,#0B2545_0%,#13315C_42%,#0E7490_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(255,255,255,.13),transparent_58%)]" />

      <div className="container relative mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[1.08fr,.92fr] lg:py-16">
        {/* ── Copy ── */}
        <div className="text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-cta-green/16 px-4 py-1.5 text-sm font-semibold text-emerald-300 ring-1 ring-cta-green/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ripple rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Technicians available now across Patna
          </span>

          <h1 className="mt-5 font-display text-[2rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            RO Service in Patna
            <span className="mt-2 block text-orange-300">Visit Charge Only ₹{SERVICE.visitCharge}</span>
          </h1>

          {/* Price anchor — the single strongest differentiator */}
          <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 ring-1 ring-white/20">
            <span className="text-sm text-navy-100">Others in Patna charge</span>
            <span className="font-display text-lg font-bold text-red-300 line-through">₹299–₹399</span>
            <span className="text-sm text-navy-100">· We charge</span>
            <span className="font-display text-xl font-extrabold text-emerald-300">₹{SERVICE.visitCharge}</span>
          </div>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">
            Not getting water? Leakage, bad taste, or noise? A certified technician
            reaches your door within {SERVICE.responseTime} with genuine spare parts.
            You pay only after the job is done.
          </p>

          {/* Primary CTAs */}
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={CONTACT.primaryTel}
              data-analytics="hero_call_primary"
              className="inline-flex items-center gap-2 rounded-xl bg-cta-green px-7 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-cta-greenDark active:scale-[.98]"
            >
              📞 Call {CONTACT.primaryPhone}
            </a>
            <a
              href={CONTACT.whatsappLink('Hi, I need RO service in Patna.')}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics="hero_whatsapp"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-7 py-4 text-lg font-bold text-white shadow-lg transition hover:brightness-95 active:scale-[.98]"
            >
              💬 WhatsApp
            </a>
          </div>

          <p className="mt-3 text-sm text-navy-100">
            Or call{' '}
            <a href={CONTACT.secondaryTel} className="font-bold text-white underline decoration-aqua-400 underline-offset-4">
              {CONTACT.secondaryPhone}
            </a>{' '}
            · {CONTACT.hours}, all 7 days
          </p>

          {/* Trust row */}
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            {[
              { n: '10+', l: 'Years experience' },
              { n: '5,000+', l: 'Homes served' },
              { n: '90 min', l: 'Average response' },
              { n: '30-day', l: 'Repair warranty' },
            ].map((s) => (
              <li key={s.l}>
                <p className="font-display text-xl font-extrabold text-aqua-300">{s.n}</p>
                <p className="text-xs text-navy-100">{s.l}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Visual + quick issue picker ── */}
        <div className="lg:pt-2">
          <div className="relative overflow-hidden rounded-3xl bg-white/95 shadow-2xl ring-1 ring-white/30">
            <Image
              src="/banners/service-tech.png"
              alt="AquaNexa technician repairing an RO water purifier at a home in Patna"
              width={640}
              height={480}
              priority
              fetchPriority="high"
              sizes="(max-width:1024px) 90vw, 520px"
              className="h-auto w-full object-cover"
            />
          </div>

          {/* One-tap issue shortcuts — reduces friction vs a long form */}
          <div className="mt-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur">
            <p className="text-sm font-bold text-white">What&apos;s the problem?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { icon: '💧', label: 'No water', msg: 'My RO is not giving any water.' },
                { icon: '🚰', label: 'Leakage', msg: 'My RO is leaking water.' },
                { icon: '😖', label: 'Bad taste', msg: 'Water from my RO tastes bad.' },
                { icon: '🔊', label: 'Noise', msg: 'My RO is making noise.' },
              ].map((i) => (
                <a
                  key={i.label}
                  href={CONTACT.whatsappLink(`${i.msg} I need service in Patna.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2.5 text-sm font-semibold text-navy-700 transition hover:bg-white"
                >
                  <span>{i.icon}</span> {i.label}
                </a>
              ))}
            </div>
            <Link
              href="#book-service"
              className="mt-3 block rounded-lg bg-cta-orange py-2.5 text-center text-sm font-bold text-white transition hover:bg-cta-orangeDark"
            >
              Or fill the booking form ↓
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
