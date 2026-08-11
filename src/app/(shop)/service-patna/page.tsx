/**
 * PILLAR PAGE — /service-patna
 * The main ranking target for "RO service in Patna" / "RO repair Patna".
 * Links out to every area page and every brand page (topical authority hub).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  SERVICE_AREAS, SERVICED_BRANDS, RO_PROBLEMS, FILTER_GUIDE,
  TDS_ZONES, BUYING_GUIDE, WHY_LOCAL,
} from '@/lib/seo/patna-service-data';
import { localBusinessSchema, faqSchema, breadcrumbSchema, jsonLd } from '@/lib/seo/schema';
import ServiceBookingForm from '@/components/home/ServiceBookingForm';
import FaqAccordion from '@/components/home/FaqAccordion';
import HowItWorks from '@/components/home/HowItWorks';
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: `RO Service in Patna — Water Purifier Repair ₹${SERVICE.visitCharge}`,
  description: `RO repair, installation & AMC across Patna. ₹${SERVICE.visitCharge} visit charge, same-day service, 30-day warranty. All brands. Call ${CONTACT.primaryPhone}.`,
  keywords: [
    'RO service in Patna', 'RO repair Patna', 'water purifier service Patna',
    'RO installation Patna', 'RO service near me Patna', 'RO AMC Patna',
    'Kent RO service Patna', 'Aquaguard service Patna', 'RO technician Patna',
    'water purifier repair Patna', 'RO filter change Patna', 'RO membrane replacement Patna',
  ],
  alternates: { canonical: '/service-patna' },
  openGraph: {
    title: `RO Service in Patna — ₹${SERVICE.visitCharge} Visit Charge | Aqua Perl`,
    description: 'Same-day RO repair & installation across Patna. All brands serviced. 30-day warranty.',
    url: `${BRAND.url}/service-patna`,
    images: [{ url: '/banners/service-tech.png', width: 1200, height: 630, alt: 'Aqua Perl RO technician in Patna' }],
  },
  other: {
    'geo.region': 'IN-BR',
    'geo.placename': 'Patna',
    'geo.position': '25.5941;85.1376',
    ICBM: '25.5941, 85.1376',
  },
};

const FAQS = [
  { q: 'What is the RO service visit charge in Patna?',
    a: `Our technician visit charge anywhere in Patna is only ₹${SERVICE.visitCharge}. This covers complete inspection, TDS testing and diagnosis. Repair parts and labour are quoted separately and only carried out with your approval.` },
  { q: 'Which areas of Patna do you cover?',
    a: 'We cover all of Patna including Kankarbagh, Boring Road, Patliputra Colony, Rajendra Nagar, Bailey Road, Danapur, Saguna More, Khagaul, Rukanpura, Kadamkuan, Bahadurpur and surrounding localities. If you are unsure, just call us with your pincode.' },
  { q: 'Which RO brands do you repair?',
    a: 'All brands — Kent, Aquaguard (Eureka Forbes), Livpure, Pureit (HUL), AO Smith, Blue Star, Havells, Nasaka, Zero B, Tata Swach, and locally assembled RO units. Our technicians carry common spares for every major brand.' },
  { q: 'How quickly will a technician arrive?',
    a: `For requests placed before 5 PM we typically reach within ${SERVICE.responseTime} on the same day. Emergency same-day service is available — call ${CONTACT.primaryPhone} or ${CONTACT.secondaryPhone}.` },
  { q: 'Do you provide a warranty on repairs?',
    a: `Yes. Every repair carries a ${SERVICE.warrantyDays}-day service warranty. Replacement parts additionally carry 6 to 12 months manufacturer warranty depending on the component.` },
  { q: 'How much does an RO membrane replacement cost in Patna?',
    a: 'A genuine 75 GPD membrane typically costs ₹1,200 to ₹1,800 fitted, and a 100 GPD membrane ₹1,600 to ₹2,400. High-TDS areas like Danapur usually need the 100 GPD option. Exact price is confirmed on site before work begins.' },
  { q: 'Do you offer AMC plans?',
    a: 'Yes. Our annual maintenance contracts start at ₹1,499 and include 4 scheduled visits with filter changes, priority response, and discounted parts. Ideal for high-TDS areas where filters need frequent replacement.' },
  { q: 'Do I need to pay in advance?',
    a: 'No advance payment. You pay only after the technician completes the work at your home. We accept cash, UPI, and cards.' },

  /* Long-tail questions — these mirror what people actually type into
     Google in Patna, so each one is a separate ranking opportunity. */
  { q: 'Patna ke paani ka TDS kitna hota hai?',
    a: 'Published groundwater studies for Patna record TDS between 174 and 1,284 ppm, and total hardness between 156 and 760 mg/L. Riverside areas like Kurji, Rajapur and Mahendru run under 300 ppm. Central Patna sits around 300 to 500. Kankarbagh, Lohia Nagar and Khajpura run 500 to 800. Anisabad, Danapur and Phulwari Sharif regularly cross 800. We test your TDS free on every visit.' },
  { q: 'RO ka filter Patna mein kitne din chalta hai?',
    a: 'Shorter than the box claims. Sediment filter: 3 to 4 months instead of 6. Pre-carbon: 5 to 8 months instead of 8 to 12. RO membrane: 18 to 24 months instead of 24 to 36. UV lamp: 10 to 12 months. Patna water carries more silt and hardness than the ratings assume.' },
  { q: 'Mera RO paani nahi de raha, kya karan ho sakta hai?',
    a: 'About seven out of ten no-water calls in Patna turn out to be a dead 24V adaptor or a fully choked sediment filter — not the membrane. Other causes are a seized booster pump, a stuck float valve, or simply low inlet pressure. Diagnosis is included in the ₹200 visit.' },
  { q: 'RO se paani leak ho to kya karna chahiye?',
    a: 'Switch off the power and close the inlet valve first. Most leaks are a perished O-ring or a housing cracked by over-tightening at a previous service. A cracked housing cannot be sealed with tape, it must be replaced. Typical cost ₹200 to ₹1,500.' },
  { q: 'Paani mein badbu aa rahi hai, membrane badalna padega?',
    a: 'Usually not. Smell almost always comes from a saturated carbon block, biofilm in the storage tank, or a failed UV lamp — not the membrane. We sanitise the tank and replace the carbon stage, which costs far less than a membrane. Riverside areas like Kurji and Mahendru need carbon changed every 4 to 5 months.' },
  { q: 'Patna ke liye 75 GPD ya 100 GPD membrane?',
    a: 'Under 500 ppm a 75 GPD membrane is fine. Above 500 ppm — Kankarbagh, Anisabad, Danapur, Khajpura — go for 100 GPD. It costs ₹400 to ₹600 more but lasts noticeably longer on hard water and keeps flow rate usable.' },
  { q: 'Kya aap Sunday ko bhi service karte hain?',
    a: 'Yes, all seven days from 8 AM to 9 PM including Sundays and most holidays. Weekend slots fill up fast, so call 8969821440 in the morning if you need a same-day visit.' },
  { q: 'Commercial RO plant ka service karte hain?',
    a: 'Yes — 250 LPH upwards for shops, schools, hotels, offices and clinics across Patna. Site survey is free. Commercial units need a different service cycle from domestic ones because of continuous duty.' },
  { q: 'Purane RO ko repair karana theek hai ya naya lena chahiye?',
    a: 'If the body and housings are sound, repair is almost always cheaper — a full overhaul runs ₹1,500 to ₹3,000 against ₹8,000 or more for a new unit. We recommend replacement only when housings are cracked, the pump chamber is corroded, or spares for that model have gone out of production. We will tell you honestly which one you are looking at.' },
  { q: 'Kya aap nakli filter to nahi lagate?',
    a: 'Every part comes out of a sealed pack in front of you and the old part is handed to you. Fake filters are a real problem in the Patna market — they look identical and fail in months. If you are unsure about parts fitted by someone else, we will inspect them and tell you straight.' },
  { q: 'RO ka waste water use kar sakte hain?',
    a: 'Yes — for mopping, washing utensils, toilet flushing and non-edible garden plants. Do not use it for drinking or cooking, and avoid it on vegetable plants because the reject water carries concentrated salts. On 600+ ppm supply a 1:3 pure-to-reject ratio is normal.' },
  { q: 'AMC mein kya kya cover hota hai?',
    a: 'Our AMC starts at ₹1,499 and covers scheduled visits with filter changes, priority response and discounted parts. Comprehensive plans also cover the membrane and electrical parts. Above 500 ppm an AMC works out cheaper than paying per visit, because you will need three to four filter changes a year regardless.' },
];

export default function ServicePatnaPillar() {
  return (
    <>
      <script
        {...jsonLd([
          localBusinessSchema(),
          faqSchema(FAQS),
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'RO Service in Patna', url: '/service-patna' },
          ]),
        ])}
      />

      <main className="bg-white">
        <section className="relative overflow-hidden bg-hero-deep">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_28%,rgba(255,255,255,.14),transparent_60%)]" />
          <div className="container relative mx-auto grid gap-10 px-4 py-14 lg:grid-cols-[1.1fr,.9fr] lg:py-20">
            <div className="text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-cta-green/16 px-4 py-1.5 text-sm font-semibold text-emerald-300 ring-1 ring-cta-green/30">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ripple rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Technicians available now across Patna
              </span>

              <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                Expert RO Service in Patna
                <span className="mt-2 block text-orange-300">Visit Charge Only ₹{SERVICE.visitCharge}</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">
                Repair, installation, filter change and AMC for every RO brand.
                Certified technicians reach you within {SERVICE.responseTime} with genuine
                spare parts and a {SERVICE.warrantyDays}-day service warranty.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href={CONTACT.primaryTel} className="rounded-xl bg-cta-green px-7 py-4 font-bold text-white shadow-lg transition hover:bg-cta-greenDark">
                  📞 Call {CONTACT.primaryPhone}
                </a>
                <a href={CONTACT.secondaryTel} className="rounded-xl bg-white/12 px-7 py-4 font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/22">
                  📞 {CONTACT.secondaryPhone}
                </a>
              </div>
              <p className="mt-4 text-sm text-navy-100">{CONTACT.hours} · All 7 days</p>
            </div>

            <div className="lg:pt-2">
              <ServiceBookingForm />
            </div>
          </div>
        </section>

        {/* Areas */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                RO Service Areas in Patna
              </h2>
              <p className="mt-2 text-muted">
                Click your locality for area-specific water details, response times and pricing.
              </p>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICE_AREAS.map((a) => (
                <Link key={a.slug} href={`/service-patna/${a.slug}`}
                  className="group rounded-2xl border border-navy-100 p-5 transition hover:-translate-y-1 hover:border-aqua-400 hover:shadow-card-hover">
                  <h3 className="font-display text-lg font-bold text-navy-700 group-hover:text-aqua-600">
                    RO Service in {a.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted">Pincodes: {a.pincodes.join(', ')}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-navy-600">{a.intro}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs font-semibold">
                    <span className="text-cta-green">⚡ {a.responseMin} min response</span>
                    <span className="text-muted">{a.monthlyJobs}+ jobs/month</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="bg-navy-50 py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                We Repair Every RO Brand
              </h2>
              <p className="mt-2 text-muted">
                Model-specific fault guides with transparent repair pricing for each brand.
              </p>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICED_BRANDS.map((b) => (
                <Link key={b.slug} href={`/service-patna/brand/${b.slug}`}
                  className="rounded-2xl border border-navy-100 bg-white p-5 transition hover:-translate-y-1 hover:border-aqua-400 hover:shadow-card">
                  <h3 className="font-display text-base font-bold text-navy-700">{b.name.split(' (')[0]}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted">
                    {b.popularModels.slice(0, 3).join(', ')}…
                  </p>
                  <p className="mt-3 text-xs font-bold text-aqua-600">Repair costs &amp; guide →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />

        {/* ── Why local (Patna-specific proof) ── */}
        <section className="border-t border-navy-50 py-14">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
              Patna mein RO service — hum alag kyun hain
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {WHY_LOCAL.map((w) => (
                <div key={w.title} className="rounded-2xl border border-navy-100 bg-white p-6">
                  <h3 className="font-display text-lg font-bold text-navy-700">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TDS zones — the single most searched Patna water question ── */}
        <section className="bg-navy-50 py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                Patna ke paani ka TDS — area ke hisaab se
              </h2>
              <p className="mt-2 text-muted">
                Published groundwater studies for Patna record TDS between 174 and 1,284 ppm.
                Your area decides which purifier and which service schedule you actually need.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {TDS_ZONES.map((z) => (
                <div key={z.band} className="rounded-2xl border border-navy-100 bg-white p-6">
                  <h3 className="font-display text-lg font-bold text-navy-700">{z.band}</h3>
                  <p className="mt-1.5 text-xs font-bold uppercase tracking-wide text-aqua-600">{z.areas}</p>
                  <p className="mt-3 text-sm leading-relaxed text-navy-600">{z.meaning}</p>
                  <p className="mt-3 rounded-lg bg-aqua-50 px-3 py-2 text-sm font-semibold text-aqua-800">
                    {z.advice}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Symptom → cause → fix ── */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                RO ki common problem aur unka asli karan
              </h2>
              <p className="mt-2 text-muted">
                What we actually find when we open the machine — and what it costs to put right.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {RO_PROBLEMS.map((p) => (
                <article key={p.symptom} className="rounded-2xl border border-navy-100 bg-white p-6">
                  <h3 className="font-display text-lg font-bold text-navy-700">{p.symptom}</h3>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{p.symptomEn}</p>

                  {p.causes.length > 0 && (
                    <>
                      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-navy-500">
                        Kya ho sakta hai
                      </p>
                      <ul className="mt-1.5 space-y-1">
                        {p.causes.map((c) => (
                          <li key={c} className="flex gap-2 text-sm text-navy-600">
                            <span className="text-aqua-500">•</span>{c}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <p className="mt-4 text-sm leading-relaxed text-navy-600">{p.fix}</p>

                  <p className="mt-3 rounded-lg bg-sand-200 px-3 py-2 text-sm text-navy-700">
                    <strong>Patna note:</strong> {p.patnaNote}
                  </p>

                  <p className="mt-3 text-sm font-bold text-cta-green">
                    Typical cost: {p.typicalCost}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Filter life table ── */}
        <section className="bg-navy-50 py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                Filter kitne din chalta hai — Patna mein
              </h2>
              <p className="mt-2 text-muted">
                Manufacturer ratings assume clean feed water. Patna is harder than that,
                so the real intervals are shorter.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-4xl space-y-4">
              {FILTER_GUIDE.map((f) => (
                <div key={f.stage} className="rounded-2xl border border-navy-100 bg-white p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-navy-700">{f.stage}</h3>
                    <span className="text-sm font-bold text-cta-green">{f.cost}</span>
                  </div>
                  <p className="mt-2 text-sm text-navy-600">{f.job}</p>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-lg bg-navy-50 px-3 py-1.5 text-navy-600">
                      Company rating: <strong>{f.normalLife}</strong>
                    </span>
                    <span className="rounded-lg bg-cta-orange/10 px-3 py-1.5 text-cta-orangeDark">
                      Patna mein: <strong>{f.patnaLife}</strong>
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-navy-600">{f.why}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Buying guide ── */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                Naya RO lene se pehle — seedhi salah
              </h2>
              <p className="mt-2 text-muted">
                We service every brand, so we have no reason to push one on you.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-3xl space-y-4">
              {BUYING_GUIDE.map((b) => (
                <div key={b.q} className="rounded-2xl border border-navy-100 bg-white p-6">
                  <h3 className="font-display text-base font-bold text-navy-700">{b.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">{b.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing transparency */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                Transparent Service Pricing
              </h2>
              <p className="mt-2 text-muted">No hidden charges. Every cost is confirmed before work starts.</p>
            </div>

            <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-navy-100">
              <table className="w-full text-sm">
                <thead className="bg-navy-50">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-bold text-navy-700">Service</th>
                    <th className="px-4 py-3 text-right font-bold text-navy-700">Price Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                  {[
                    ['Technician visit & diagnosis', `₹${SERVICE.visitCharge} (fixed)`],
                    ['Sediment / carbon filter change', '₹350 – ₹900'],
                    ['RO membrane replacement (75 GPD)', '₹1,200 – ₹1,800'],
                    ['RO membrane replacement (100 GPD)', '₹1,600 – ₹2,400'],
                    ['Booster pump replacement', '₹1,100 – ₹2,000'],
                    ['SMPS / adaptor replacement', '₹700 – ₹1,300'],
                    ['UV lamp replacement', '₹650 – ₹1,200'],
                    ['New RO installation', '₹500 – ₹900'],
                    ['Annual Maintenance Contract', '₹1,499 – ₹3,999 / year'],
                  ].map(([s, p]) => (
                    <tr key={s}>
                      <td className="px-4 py-3 text-navy-700">{s}</td>
                      <td className="px-4 py-3 text-right font-bold text-cta-green">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <FaqAccordion faqs={FAQS} title="RO Service in Patna — Frequently Asked Questions" />

        <section className="bg-navy-700 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-extrabold text-white md:text-3xl">
              Book Your RO Technician Now
            </h2>
            <p className="mt-2 text-navy-100">
              ₹{SERVICE.visitCharge} visit charge · Same-day service · {SERVICE.warrantyDays}-day warranty · All brands
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a href={CONTACT.primaryTel} className="rounded-xl bg-cta-green px-7 py-4 font-bold text-white hover:bg-cta-greenDark">
                📞 {CONTACT.primaryPhone}
              </a>
              <a href={CONTACT.whatsappLink()} target="_blank" rel="noopener noreferrer"
                className="rounded-xl bg-white/12 px-7 py-4 font-bold text-white ring-1 ring-white/30 hover:bg-white/22">
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
