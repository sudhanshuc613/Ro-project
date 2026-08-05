'use client';

/**
 * ServiceHero — SERVICE-FIRST homepage hero, "Now in Patna" banner style.
 *
 * ── WHY THIS LAYOUT ───────────────────────────────────────────────────────
 * Modelled on the ad-creative format that works for Indian service brands:
 * a huge city name, a smiling technician holding a tool, and floating
 * credibility chips (rating, support number, expertise). That format works
 * because a person scanning for two seconds gets four facts at once —
 * WHERE, WHO, HOW GOOD, and HOW TO CALL.
 *
 * ── THE KEY DECISION: TEXT IS HTML, NOT BAKED INTO THE IMAGE ──────────────
 * Ad creatives put the text inside the JPG. We deliberately do not, because:
 *   1. Google cannot read text inside an image. "RO Service in Patna" as
 *      pixels contributes nothing to ranking; as an <h1> it is the single
 *      strongest on-page signal.
 *   2. Baked text does not reflow — a 1080px creative shrunk onto a 360px
 *      phone makes the phone number unreadable.
 *   3. Prices change. ₹200 lives in one constant and updates everywhere,
 *      instead of needing a new image export.
 *   4. Screen readers get real text.
 * So the photo carries ONLY the person and the appliance; every word is
 * live HTML positioned over it.
 *
 * ── COLOUR ────────────────────────────────────────────────────────────────
 * The reference creative is white-background with cyan waves. Pure white
 * reads "template", so the canvas is warm sand with a deep-navy content card
 * behind the copy — the contrast is what makes the ₹200 pop, and navy is the
 * trust anchor of the palette. Gold appears exactly twice (rating chip and
 * savings strip) because rationing is what keeps metallic feeling premium.
 */
import Image from 'next/image';
import Link from 'next/link';
import { CONTACT, SERVICE } from '@/lib/constants';

const STATS = [
  { n: '10+', l: 'Years in Patna' },
  { n: '5,000+', l: 'Homes served' },
  { n: '90 min', l: 'Avg. response' },
  { n: '30-day', l: 'Repair warranty' },
];

const QUICK_ISSUES = [
  { icon: '💧', label: 'No water', msg: 'My RO is not giving any water.' },
  { icon: '🚰', label: 'Leakage', msg: 'My RO is leaking water.' },
  { icon: '😖', label: 'Bad taste', msg: 'Water from my RO tastes bad.' },
  { icon: '🔊', label: 'Noise', msg: 'My RO is making noise.' },
];

export default function ServiceHero() {
  const competitorLow = 299;
  const saving = competitorLow - SERVICE.visitCharge;

  return (
    <section className="relative overflow-hidden bg-sand-100">
      {/* Cyan wave field — the signature of the reference creative, done as
          CSS/SVG so it scales cleanly instead of being part of the photo. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <svg className="absolute -right-24 top-0 h-full w-[70%] opacity-[.55]" viewBox="0 0 600 700" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M120 0C210 130 60 250 150 380s170 190 90 320" stroke="#A8E4EA" strokeWidth="58" strokeLinecap="round" opacity=".5" />
          <path d="M300 -40C400 120 250 240 350 380s160 200 80 360" stroke="#D2F2F5" strokeWidth="76" strokeLinecap="round" opacity=".7" />
          <path d="M470 20C540 160 430 260 500 400" stroke="#71CEDA" strokeWidth="34" strokeLinecap="round" opacity=".35" />
        </svg>
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-aqua-200/35 blur-3xl" />
      </div>

      <div className="container relative mx-auto grid items-center gap-8 px-4 py-10 lg:grid-cols-[1.02fr,.98fr] lg:gap-10 lg:py-14">
        {/* ── Copy column ── */}
        <div className="animate-riseIn">
          {/* Availability + rating chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[13px] font-bold text-emerald-700 ring-1 ring-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ripple rounded-full bg-emerald-500" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Technicians available now
            </span>
            {/* Gold use 1 of 2 */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1.5 text-[13px] font-bold text-gold-700 ring-1 ring-gold-200">
              ⭐ 4.9 · 600+ repairs
            </span>
          </div>

          {/* The "Now in Patna" moment — city name is the loudest element,
              exactly like the reference creative, but as a real <h1>. */}
          <h1 className="mt-5 font-display font-extrabold leading-[0.95] tracking-[-0.03em] text-navy-700">
            <span className="block text-[clamp(1.4rem,1.1rem+1.4vw,2rem)] font-bold text-muted">
              RO Service &amp; Repair
            </span>
            <span className="mt-1 block text-[clamp(3.2rem,2.2rem+5.4vw,6rem)]">
              Now in{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Patna</span>
                {/* Hand-drawn underline — the detail that separates designed
                    from templated. */}
                <svg aria-hidden className="absolute -bottom-2 left-0 z-0 w-full" height="14" viewBox="0 0 300 14" fill="none" preserveAspectRatio="none">
                  <path d="M3 9c60-6 130-8 294-4" stroke="#22D3EE" strokeWidth="7" strokeLinecap="round" opacity=".55" />
                </svg>
              </span>
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-[17px] leading-[1.7] text-navy-600 text-pretty">
            Not getting water? Leakage, bad taste, or noise? A certified technician reaches
            your door in {SERVICE.responseTime} with genuine spare parts — and you pay only
            after the job is done.
          </p>

          {/* Price anchor */}
          <div className="mt-6 inline-flex max-w-md flex-col overflow-hidden rounded-2xl bg-navy-700 shadow-lift">
            <div className="flex items-stretch divide-x divide-white/10">
              <div className="flex-1 px-5 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-navy-300">
                  Others in Patna
                </p>
                <p className="tnum mt-0.5 font-display text-xl font-bold text-red-300/85 line-through decoration-red-400/60 decoration-2">
                  ₹299–399
                </p>
              </div>
              <div className="flex-1 bg-white/[.07] px-5 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-aqua-200">
                  Our visit charge
                </p>
                <p className="tnum mt-0.5 font-display text-3xl font-extrabold text-white">
                  ₹{SERVICE.visitCharge}
                </p>
              </div>
            </div>
            {/* Gold use 2 of 2 */}
            <div className="flex items-center gap-2 bg-gold-sheen px-5 py-2">
              <span className="text-navy-900">✦</span>
              <p className="text-[13px] font-bold text-navy-900">
                Save ₹{saving} every visit · Waived if we can&apos;t fix it
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={CONTACT.primaryTel}
              data-analytics="hero_call_primary"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-cta-green px-7 py-4 text-[17px] font-bold text-white shadow-call transition-all duration-200 hover:bg-cta-greenDark hover:shadow-lift active:translate-y-px"
            >
              <span className="text-xl transition-transform group-hover:rotate-12">📞</span>
              Call {CONTACT.primaryPhone}
            </a>
            <a
              href={CONTACT.whatsappLink('Hi, I need RO service in Patna.')}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics="hero_whatsapp"
              className="inline-flex items-center gap-2.5 rounded-xl bg-white px-7 py-4 text-[17px] font-bold text-navy-700 shadow-card ring-1 ring-navy-100 transition-all duration-200 hover:shadow-lift active:translate-y-px"
            >
              <span className="text-xl">💬</span> WhatsApp
            </a>
          </div>

          <p className="mt-3 text-sm text-muted">
            Or call{' '}
            <a href={CONTACT.secondaryTel} className="font-bold text-navy-700 underline decoration-aqua-400 decoration-2 underline-offset-4 hover:decoration-gold-400">
              {CONTACT.secondaryPhone}
            </a>{' '}
            · {CONTACT.hours}, all 7 days
          </p>

          {/* Proof strip */}
          <div className="mt-8 border-t border-navy-200/60 pt-5">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {STATS.map((s) => (
                <li key={s.l}>
                  <p className="tnum font-display text-2xl font-extrabold text-navy-700">{s.n}</p>
                  <p className="mt-0.5 text-[13px] text-muted">{s.l}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Visual column ── */}
        <div className="animate-riseIn lg:pt-1" style={{ animationDelay: '.08s' }}>
          <div className="relative mx-auto max-w-[520px]">
            <Image
              src="/banners/hero-technician.png"
              alt="AquaNexa RO service technician in Patna holding a wrench beside a wall-mounted RO water purifier"
              width={1024}
              height={1024}
              priority
              fetchPriority="high"
              sizes="(max-width:1024px) 92vw, 520px"
              className="h-auto w-full object-contain"
            />

            {/* Floating credibility chips — the reference creative's signature.
                Hidden below xs so they never cover the technician's face on a
                small phone. */}
            <span className="absolute left-0 top-[26%] hidden items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[13px] font-extrabold text-navy-700 shadow-card-hover ring-1 ring-navy-100 xs:inline-flex">
              <span className="rounded-md bg-aqua-500 px-1.5 py-0.5 text-[11px] text-white">RO</span>
              EXPERT
            </span>

            <span className="absolute right-0 top-[44%] hidden items-center gap-1.5 rounded-xl bg-white px-3 py-2 shadow-card-hover ring-1 ring-navy-100 xs:inline-flex">
              <span className="text-base">⭐</span>
              <span className="text-[15px] font-extrabold text-navy-700">4.9</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted">rating</span>
            </span>

            <a
              href={CONTACT.primaryTel}
              className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 shadow-card-hover ring-1 ring-navy-100 transition hover:shadow-lift"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-cta-green text-white">📞</span>
              <span className="leading-tight">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-muted">
                  Customer support
                </span>
                <span className="tnum block text-[15px] font-extrabold text-navy-700">
                  {CONTACT.primaryPhone}
                </span>
              </span>
            </a>
          </div>

          {/* One-tap issue shortcuts */}
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-navy-100">
            <p className="text-sm font-bold text-navy-700">What&apos;s the problem?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {QUICK_ISSUES.map((i) => (
                <a
                  key={i.label}
                  href={CONTACT.whatsappLink(`${i.msg} I need service in Patna.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 rounded-xl bg-sand-100 px-3 py-3 text-sm font-semibold text-navy-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-aqua-50 hover:shadow-card"
                >
                  <span className="text-base transition-transform group-hover:scale-110">{i.icon}</span>
                  {i.label}
                </a>
              ))}
            </div>
            <Link
              href="#book-service"
              className="mt-3 block rounded-xl bg-cta-orange py-3 text-center text-sm font-bold text-white shadow-cta transition-all duration-200 hover:bg-cta-orangeDark active:translate-y-px"
            >
              Or fill the booking form ↓
            </Link>
          </div>
        </div>
      </div>

      {/* Brand marquee — every brand name in the hero area is a keyword
          Google associates with this page, and it answers the visitor's
          real first question: "do they even handle MY brand?" */}
      <div className="relative border-y border-navy-100 bg-white/70 py-3.5 backdrop-blur-sm">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            We repair all brands
          </span>
          {['Kent', 'Aquaguard', 'Aquafresh', 'Livpure', 'Pureit', 'AO Smith', 'Blue Star', 'Havells', 'Nasaka', 'Zero B'].map((b) => (
            <span key={b} className="text-[13px] font-bold text-navy-600">{b}</span>
          ))}
          <Link href="/service-patna/brand" className="text-[13px] font-bold text-aqua-600 hover:underline">
            +11 more →
          </Link>
        </div>
      </div>
    </section>
  );
}
