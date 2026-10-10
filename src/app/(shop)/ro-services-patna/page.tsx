/**
 * SERVICE HUB — /ro-services-patna
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The site had two hubs already: /service-patna links out to all 55 localities
 * (the PLACE axis) and /service-patna/brand links to all 21 brands (the BRAND
 * axis). The six new intent pages are a third axis — the JOB — and without a
 * hub they would each be one hop from the footer and nothing else.
 *
 * Hub pages matter for a measurable reason: internal links are how PageRank
 * moves inside a site, and the audit on 3 Sep 2026 put us at 99 internal links
 * against Urban Company's 266. A hub that links six ways and is itself linked
 * from the navbar, the footer and the pillar page turns six orphans into a
 * connected cluster.
 *
 * Deliberately NOT a doorway: this page carries a comparison the individual
 * pages cannot — which job you actually need, side by side, with what each one
 * costs. Someone who does not yet know whether they need a filter change or a
 * membrane lands here and leaves knowing.
 */
/**
 * 🔴 8 Oct 2026 — ye page ab ek PAID LANDING PAGE bhi hai.
 * Google Ads ka sitelink "All RO Services We Do" seedha yahan bhejta hai.
 * Isliye teen cheezein add hui:
 *   1. Hero me asli technician poster (/banners/hero-technician.png — wahi
 *      jo homepage ServiceHero use karta hai, competitor-branding wali
 *      service-tech.png NAHI)
 *   2. Teen proof cards pehli screen par — ₹200 / 90 min / 30 din
 *   3. Homepage wala poora BrandLogoGrid (10 logo + 12 text tile + disclaimer)
 * QuickBookForm hero se nikaal ke apne section me daala — hero me image aur
 * form dono rakhne se mobile par dono chhote ho jaate the.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SERVICE_INTENTS } from '@/lib/seo/service-intent-data';
import { SERVICE_AREAS, SERVICED_BRANDS } from '@/lib/seo/patna-service-data';
import BrandLogoGrid from '@/components/home/BrandLogoGrid';
import {
  localBusinessSchema, faqSchema, breadcrumbSchema, serviceListSchema, jsonLd,
} from '@/lib/seo/schema';
import FaqAccordion from '@/components/home/FaqAccordion';
import QuickBookForm from '@/components/home/QuickBookForm';
import TrustBadges from '@/components/ui/TrustBadges';
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';
import { areaPath } from '@/lib/seo/area-url';
import { ogImage } from '@/lib/seo/og-image';
/* 9 Oct 2026 — 94-keyword audit: SERVICE-INTENT category me 13 keywords ka
   exact phrase kahin nahi tha (rate card / visit charge / pump repair wala
   cluster). Naya block, purana kuch nahi badla. */
import ServiceRateCard from '@/components/service/ServiceRateCard';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: `RO Services in Patna — All Jobs, Rates From ₹${SERVICE.visitCharge}`,
  description:
    `Every RO job in Patna with its real 2026 rate — repair, installation, filter change, membrane, AMC, commercial plants. ₹${SERVICE.visitCharge} visit. Call ${CONTACT.primaryPhone}.`,
  keywords: [
    'ro services patna', 'ro service list patna', 'ro service rate patna',
    'water purifier services patna', 'ro repair installation amc patna',
    'ro service charges patna', 'ro service near me patna',
  ],
  alternates: { canonical: '/ro-services-patna' },
  openGraph: {
    title: `RO Services in Patna — All Jobs & Rates | ${BRAND.name}`,
    description: 'Repair, installation, filter change, membrane, AMC and commercial plant service — with real Patna rates.',
    url: `${BRAND.url}/ro-services-patna`,
    type: 'website',
    images: ogImage(),
  },
  other: {
    'geo.region': 'IN-BR',
    'geo.placename': 'Patna',
    'geo.position': `${CONTACT.geo.lat};${CONTACT.geo.lng}`,
    ICBM: `${CONTACT.geo.lat}, ${CONTACT.geo.lng}`,
  },
};

/* Hub-only content. These questions are about CHOOSING between jobs, which is
   exactly what no individual intent page can answer — so there is no overlap
   with the FAQs on the six pages. */
const HUB_FAQS = [
  {
    q: 'Which RO service do I actually need?',
    a: 'Work from the symptom. No water at all or a leak means a repair visit — that is a diagnosis job, ₹200 including the TDS test. Water is fine but it has been three to four months means a filter change, ₹350 to ₹900. Water tastes heavy and your TDS reading has climbed means a membrane, ₹1,100 to ₹2,400. A new machine or one you are shifting means installation, ₹500. If you are calling more than twice a year, an AMC from ₹1,499 works out cheaper than the individual visits.',
  },
  {
    q: 'What is the cheapest RO service in Patna?',
    a: `Our visit charge is ₹${SERVICE.visitCharge} against a market rate of ₹300 to ₹400, and it includes the full diagnosis and a TDS test rather than being a charge just for showing up. But the cheapest visit charge is not the same as the cheapest job — a ₹150 visit followed by an unnecessary ₹2,400 membrane costs far more than a ₹200 visit followed by a ₹450 adaptor. Ask what the diagnosis includes, not just what the visit costs.`,
  },
  {
    q: 'Do you charge the visit fee if I only need a filter change?',
    a: 'No. The ₹200 visit charge is waived when a full filter set is fitted, so a complete filter change is ₹350 for most domestic machines with nothing added on top. The visit charge exists to cover a technician travelling out to diagnose something — when the job is already known and being done, it does not apply.',
  },
  {
    q: 'Can one visit cover more than one job?',
    a: 'Yes, and it is usually cheaper that way. Membrane plus a full filter set together is ₹1,400 to ₹2,400 rather than two separate visits, and it is also better practice — a new membrane behind exhausted carbon does not last, because chlorine passes straight through to it. Tell us the symptom when you call and we will bring parts for the likely combination.',
  },
  {
    q: 'How fast can someone reach me in Patna?',
    a: `Same day for calls before 5 PM, typically ${SERVICE.responseTime}, and faster in Kankarbagh, Boring Road and Rajendra Nagar where technicians are stationed. We work all seven days, 8 AM to 9 PM. Commercial plant breakdowns are prioritised over domestic calls because the cost of downtime is different.`,
  },
  {
    q: 'Is there a warranty on any of this?',
    a: `Every repair carries a ${SERVICE.warrantyDays}-day service warranty on our workmanship, and any replacement part carries its own manufacturer warranty of 6 to 12 months depending on the component. The part name is written on your bill, which is what makes a warranty claim straightforward instead of an argument.`,
  },
  {
    q: 'Do you service purifiers you did not sell?',
    a: 'Yes — the large majority of what we service was bought somewhere else. Online, a local shop, second-hand, or a locally assembled unit with no brand on it at all. We are an independent multi-brand service provider, not an authorised centre for any manufacturer. If your machine is still inside its manufacturer warranty we will tell you to use the official channel first rather than take your money.',
  },
];

export default function ServiceHubPage() {
  return (
    <>
      <script {...jsonLd([
        localBusinessSchema({
          name: SERVICE.city,
          pincodes: [CONTACT.address.pincode],
          lat: CONTACT.geo.lat,
          lng: CONTACT.geo.lng,
          path: '/ro-services-patna',
        }),
        faqSchema(HUB_FAQS),
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'RO Service in Patna', url: '/service-patna' },
          { name: 'All RO Services', url: '/ro-services-patna' },
        ]),
        serviceListSchema(
          SERVICE_INTENTS.map((s) => ({
            name: s.h1,
            url: `${BRAND.url}${s.path}`,
            description: s.description,
            priceFrom: s.priceFrom,
          })),
          'RO services available in Patna',
        ),
      ])} />

      <main className="bg-white">
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex flex-wrap gap-2 px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li><Link href="/service-patna" className="text-navy-600 hover:text-aqua-600">RO Service Patna</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">All Services</li>
          </ol>
        </nav>

        {/* ── Hero — poster + proof cards ── */}
        <section className="bg-navy-gradient py-12 text-white md:py-16">
          <div className="container mx-auto grid items-center gap-10 px-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-aqua-300">
                Best RO Service in Patna
              </p>
              <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight md:text-5xl">
                RO Services in Patna
              </h1>
              <p className="mt-3 text-lg font-semibold text-aqua-200">
                Har kaam, uska asli rate · ₹{SERVICE.visitCharge} visit charge
              </p>
              <p className="mt-4 max-w-xl leading-relaxed text-navy-100">
                Repair, installation, filter change, membrane, AMC aur commercial
                plant — chhe alag kaam, chhe alag daam. Zyadatar site sab ek page
                par daal ke ek range likh deti hai. Yahan har kaam ka apna page hai,
                uska kaam kya hota hai, kitna lagta hai, aur kaise pata chale ki
                aapko wahi chahiye.
              </p>

              {/* Proof cards — pehli screen par number chahiye */}
              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { icon: '₹', t: `₹${SERVICE.visitCharge} Visit Charge`, s: 'Inspection + TDS test' },
                  { icon: '⏱', t: `${SERVICE.responseTime} Response`, s: 'Zyadatar Patna areas' },
                  { icon: '🛡', t: `${SERVICE.warrantyDays}-Day Warranty`, s: 'Har repair par' },
                ].map((f) => (
                  <div
                    key={f.t}
                    className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur-sm"
                  >
                    <span aria-hidden="true" className="text-lg text-aqua-300">{f.icon}</span>
                    <p className="mt-0.5 font-display text-sm font-extrabold text-white">{f.t}</p>
                    <p className="text-[11px] text-navy-300">{f.s}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={CONTACT.primaryTel}
                  className="rounded-xl bg-cta-green px-6 py-3.5 font-bold text-white shadow-lg transition hover:bg-cta-greenDark"
                >
                  📞 Call {CONTACT.primaryPhone}
                </a>
                <a
                  href={CONTACT.whatsappLink()}
                  className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 font-bold text-white transition hover:bg-white/20"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Poster — wahi image jo homepage hero me hai */}
            <div className="relative mx-auto w-full max-w-lg">
              <Image
                src="/banners/hero-technician.png"
                alt={`Aqua Perl RO technician in Patna — ₹${SERVICE.visitCharge} visit charge, ${SERVICE.responseTime} response`}
                width={760}
                height={760}
                className="h-auto w-full object-contain drop-shadow-2xl"
                priority
                sizes="(max-width: 1024px) 90vw, 46vw"
              />
            </div>
          </div>
        </section>

        {/* ── Booking form — hero se nikaal ke apna section ── */}
        <section className="bg-sand-100 py-12 md:py-14">
          <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                Abhi book kar lijiye
              </h2>
              <p className="mt-3 leading-relaxed text-navy-600">
                Form bharne me ek minute lagta hai. Problem likh dijiye, hum phone
                par hi bata denge ki kaam kya hai aur kitna lagega — technician
                bhejne se pehle. Jaldi ho to seedha{' '}
                <a href={CONTACT.primaryTel} className="font-bold text-aqua-700 underline-offset-2 hover:underline">
                  {CONTACT.primaryPhone}
                </a>{' '}
                par call kar dijiye.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-navy-600">
                <li>✅ Rate kaam shuru hone se pehle bataya jaata hai</li>
                <li>✅ Genuine ya OEM part — dono ka daam dikhate hain</li>
                <li>✅ Warranty me ho to hum khud brand centre bhejte hain</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-1 shadow-2xl">
              <QuickBookForm />
            </div>
          </div>
        </section>

        {/* ── The six services ── */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-2 text-center font-display text-3xl font-extrabold text-navy-700">
              Every job we do, with its rate
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-center text-muted">
              Click any one for the full breakdown — steps, prices, and the signs you need it.
            </p>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {SERVICE_INTENTS.map((s) => (
                <Link
                  key={s.slug}
                  href={s.path}
                  className="group flex flex-col rounded-2xl border border-navy-100 bg-white p-6 transition hover:border-aqua-300 hover:shadow-card-hover"
                >
                  <h3 className="font-display text-xl font-extrabold text-navy-700 group-hover:text-aqua-600">
                    {s.h1}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-cta-green">{s.lede}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600">
                    {s.intro[0].slice(0, 165)}…
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-navy-50 pt-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {s.prices.length} rates listed
                    </span>
                    <span className="text-sm font-bold text-aqua-600">Dekho →</span>
                  </div>
                </Link>
              ))}
            </div>

            <TrustBadges variant="row" className="mt-9 justify-center" />
          </div>
        </section>

        {/* ── "Which one do I need" decision table ── */}
        <section className="bg-sand-100 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-2 text-center font-display text-3xl font-extrabold text-navy-700">
              Kaunsa kaam chahiye — seedha jawab
            </h2>
            <p className="mx-auto mb-9 max-w-2xl text-center text-muted">
              Symptom dekho, uske saamne wala page kholo.
            </p>

            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-navy-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-navy-700 text-white">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Aapki problem</th>
                    <th className="px-4 py-3 font-semibold">Kaam</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Kitna</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { p: 'Paani bilkul nahi aa raha, ya leak ho raha hai', s: 'ro-repair-patna', label: 'RO Repair', c: `₹${SERVICE.visitCharge} visit` },
                    { p: 'Paani theek hai, 3-4 mahine ho gaye', s: 'ro-filter-change-patna', label: 'Filter Change', c: '₹350 – ₹900' },
                    { p: 'Swad bhaari lag raha hai, TDS badh gaya', s: 'ro-membrane-replacement-patna', label: 'Membrane', c: '₹1,100 – ₹2,400' },
                    { p: 'Naya machine hai, ya ghar shift kiya', s: 'ro-installation-patna', label: 'Installation', c: '₹500' },
                    { p: 'Saal me 2 se zyada baar bulate ho', s: 'ro-amc-patna', label: 'AMC', c: '₹1,499/saal' },
                    { p: 'School, hotel, shop ya water plant', s: 'commercial-ro-service-patna', label: 'Commercial', c: '₹1,500 se' },
                  ].map((row, i) => (
                    <tr key={row.s} className={i % 2 ? 'bg-sand-100' : 'bg-white'}>
                      <td className="px-4 py-3 text-navy-700">{row.p}</td>
                      <td className="px-4 py-3">
                        <Link href={`/${row.s}`} className="font-bold text-aqua-600 hover:underline">
                          {row.label} →
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-display font-extrabold text-cta-green">
                        {row.c}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted">
              Pata nahi kaunsa? Call kar do — {CONTACT.primaryPhone}. Phone pe hi
              bata denge, aur agar zaroorat nahi hai to wo bhi keh denge.
            </p>
            <div className="mt-4 text-center">
              <Link
                href="/ro-service-patna-faq"
                className="inline-block rounded-xl border-2 border-navy-200 bg-white px-6 py-3 text-sm font-bold text-navy-700 transition hover:border-aqua-400 hover:text-aqua-600"
              >
                Sab rate aur sawaal ek page pe →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Areas ── */}
        <section className="py-12 md:py-14">
          <div className="container mx-auto px-4">
            <h2 className="mb-2 text-center font-display text-2xl font-extrabold text-navy-700">
              Ye sab {SERVICE_AREAS.length} area me
            </h2>
            <p className="mb-7 text-center text-sm text-muted">
              Har area ka apna TDS data, response time aur common problem.
            </p>
            <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2">
              {SERVICE_AREAS.slice(0, 16).map((a) => (
                <Link
                  key={a.slug}
                  href={areaPath(a.slug)}
                  className="rounded-full border border-navy-100 bg-white px-4 py-2 text-sm font-semibold text-navy-600 transition hover:border-aqua-300 hover:text-aqua-600"
                >
                  {a.name}
                </Link>
              ))}
              <Link
                href="/service-patna"
                className="rounded-full bg-navy-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-navy-600"
              >
                Sabhi {SERVICE_AREAS.length} area →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Brands — homepage wala poora logo grid ──────────────────
            Logo + text tile + legal disclaimer, sab ek hi shared component
            se aata hai taaki teeno jagah (home, yahan, brand hub) ek jaisa
            rahe aur disclaimer kabhi chhoote nahi. */}
        <BrandLogoGrid />

        <section className="bg-white pb-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted">
              {SERVICED_BRANDS.length} brand ki machine par kaam hota hai — branded,
              imported ya locally assembled. Visit charge sab ke liye ek hi,
              ₹{SERVICE.visitCharge}.
            </p>
            <Link
              href="/service-patna/brand"
              className="mt-4 inline-block rounded-xl bg-navy-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-600"
            >
              Sabhi {SERVICED_BRANDS.length} brand dekho →
            </Link>
          </div>
        </section>

        <ServiceRateCard />

        <FaqAccordion faqs={HUB_FAQS} title="RO services Patna — common questions" />

        {/* ── Final CTA ── */}
        <section className="bg-navy-gradient py-14 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">
              Koi bhi kaam ho — ek hi number
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-navy-200">
              ₹{SERVICE.visitCharge} visit charge · {SERVICE.responseTime} me technician ·{' '}
              {SERVICE.warrantyDays} din warranty
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={CONTACT.primaryTel}
                className="rounded-xl bg-cta-green px-7 py-3.5 font-bold text-white shadow-lg transition hover:bg-cta-greenDark"
              >
                📞 {CONTACT.primaryPhone}
              </a>
              <a
                href={CONTACT.secondaryTel}
                className="rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 font-bold text-white transition hover:bg-white/20"
              >
                📞 {CONTACT.secondaryPhone}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
