'use client';

/**
 * ServiceHero — SERVICE-FIRST homepage hero.
 *
 * Strategy: the money is in Patna service calls, not spare-part orders.
 * So the hero sells ONE thing — book a technician — and leads with the
 * strongest competitive weapon: ₹200 visit charge when every competitor
 * in Patna charges ₹299–₹399.
 *
 * ── DESIGN NOTES (v2 premium pass) ────────────────────────────────────────
 * What changed and why, because "make it look premium" is otherwise vague:
 *
 *  1. DEPTH, NOT FLATNESS. A single flat gradient reads as a template. This
 *     hero layers four things: base gradient → radial light source at top
 *     right → soft teal glow bottom-left → fine SVG grain. Grain matters on
 *     cheap Android panels where big gradients band into visible stripes.
 *
 *  2. TYPE HIERARCHY. Eyebrow (11px, wide tracking) → hero headline (fluid
 *     clamp, tight -0.022em tracking) → body at 17px/1.7. Three clearly
 *     distinct sizes is the fastest way to look intentional. The old version
 *     jumped straight from badge to 3.4rem headline.
 *
 *  3. THE PRICE ANCHOR IS THE HERO ELEMENT. It is now a framed card with a
 *     gold hairline, not an inline pill. It is the one fact that wins the
 *     job, so it gets the visual weight — competitor struck through in muted
 *     red, our price large in white with a gold "SAVE ₹199" seal.
 *
 *  4. GOLD IS RATIONED. It appears exactly twice — the rating seal and the
 *     savings seal. Rationing is what makes metallic read as premium instead
 *     of gaudy; luxury palettes mute and restrict, they never saturate.
 *
 *  5. IMAGE FRAMING. The photo sits in a rounded frame with a real caption
 *     bar and a floating verification chip, which signals "this is our
 *     actual work" rather than "this is a stock image we bought".
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
    <section className="grain relative overflow-hidden bg-hero-deep">
      {/* Layered light — a single flat gradient is the biggest "template" tell */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_78%_18%,rgba(113,206,218,.20),transparent_62%)]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-aqua-500/18 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="container relative mx-auto grid gap-10 px-4 py-14 lg:grid-cols-[1.06fr,.94fr] lg:gap-14 lg:py-20">
        {/* ── Copy column ── */}
        <div className="animate-riseIn text-white">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/12 px-3.5 py-1.5 text-[13px] font-semibold text-emerald-300 ring-1 ring-emerald-400/25">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ripple rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Technicians available now
            </span>
            {/* Gold use #1 of 2 */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/12 px-3 py-1.5 text-[13px] font-semibold text-gold-300 ring-1 ring-gold-400/25">
              ★ 4.8 · 600+ repairs
            </span>
          </div>

          <p className="eyebrow mt-6 text-aqua-300">Patna · All areas covered</p>

          <h1 className="text-hero mt-2 font-extrabold text-balance">
            RO Service at Your Door
            <span className="mt-1.5 block bg-gradient-to-r from-gold-300 via-gold-200 to-gold-400 bg-clip-text text-transparent">
              in 90 Minutes
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-[17px] leading-[1.7] text-navy-100 text-pretty">
            Not getting water? Leakage, bad taste, or noise? A certified technician
            reaches your door with genuine spare parts — and you pay only after the
            job is done.
          </p>

          {/* ── Price anchor: the single strongest differentiator ── */}
          <div className="mt-7 max-w-md overflow-hidden rounded-2xl bg-white/[.07] shadow-inset ring-1 ring-white/15 backdrop-blur-sm">
            <div className="flex items-stretch divide-x divide-white/10">
              <div className="flex-1 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-200">
                  Others in Patna
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-red-300/80 line-through decoration-red-400/60 decoration-2">
                  ₹299–399
                </p>
              </div>
              <div className="flex-1 bg-white/[.06] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-aqua-200">
                  We charge
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold text-white">
                  ₹{SERVICE.visitCharge}
                </p>
              </div>
            </div>
            {/* Gold use #2 of 2 */}
            <div className="flex items-center gap-2 border-t border-white/10 bg-gold-500/10 px-5 py-2.5">
              <span className="text-gold-300">✦</span>
              <p className="text-[13px] font-semibold text-gold-100">
                You save ₹{saving} on every visit · Waived if we can&apos;t fix it
              </p>
            </div>
          </div>

          {/* ── Primary CTAs ── */}
          <div className="mt-7 flex flex-wrap gap-3">
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
              className="inline-flex items-center gap-2.5 rounded-xl bg-white/95 px-7 py-4 text-[17px] font-bold text-navy-700 shadow-card transition-all duration-200 hover:bg-white hover:shadow-lift active:translate-y-px"
            >
              <span className="text-xl">💬</span> WhatsApp
            </a>
          </div>

          <p className="mt-3.5 text-sm text-navy-200">
            Or call{' '}
            <a
              href={CONTACT.secondaryTel}
              className="font-bold text-white underline decoration-aqua-400 decoration-2 underline-offset-4 hover:decoration-gold-300"
            >
              {CONTACT.secondaryPhone}
            </a>{' '}
            · {CONTACT.hours}, all 7 days
          </p>

          {/* ── Proof strip ── */}
          <div className="mt-9 border-t border-white/10 pt-6">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {STATS.map((s) => (
                <li key={s.l}>
                  <p className="tnum font-display text-2xl font-extrabold text-white">{s.n}</p>
                  <p className="mt-0.5 text-[13px] text-navy-200">{s.l}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Visual + quick issue picker ── */}
        <div className="animate-riseIn lg:pt-1" style={{ animationDelay: '.08s' }}>
          <figure className="relative overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-white/25">
            <Image
              src="/banners/service-tech.png"
              alt="AquaNexa technician repairing an RO water purifier at a home in Patna"
              width={640}
              height={480}
              priority
              fetchPriority="high"
              sizes="(max-width:1024px) 92vw, 520px"
              className="h-auto w-full object-cover"
            />
            {/* Floating verification chip — signals "our work", not stock art */}
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-navy-700/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Verified technician
            </span>
            <figcaption className="flex items-center justify-between gap-3 border-t border-navy-100 bg-white px-4 py-3">
              <span className="text-[13px] font-semibold text-navy-700">
                Membrane replacement · Kankarbagh
              </span>
              <span className="seal">🛡️ 30-day warranty</span>
            </figcaption>
          </figure>

          {/* One-tap issue shortcuts — far less friction than a long form */}
          <div className="mt-4 rounded-2xl bg-white/[.07] p-4 shadow-inset ring-1 ring-white/15 backdrop-blur-sm">
            <p className="text-sm font-bold text-white">What&apos;s the problem?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {QUICK_ISSUES.map((i) => (
                <a
                  key={i.label}
                  href={CONTACT.whatsappLink(`${i.msg} I need service in Patna.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 rounded-xl bg-white/95 px-3 py-3 text-sm font-semibold text-navy-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-card-hover"
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
    </section>
  );
}
