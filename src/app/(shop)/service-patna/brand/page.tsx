/**
 * BRAND HUB — /service-patna/brand
 *
 * Kyun ye page hai:
 *  1. /service-patna/brand/kent to tha par /service-patna/brand 404 deta tha.
 *     Parent path par 404 crawl ka dead-end hai aur link equity barbaad karta hai.
 *  2. Ye site ka sabse achha internal-linking page hai — yahan se ek hi hop me
 *     21 brand page. Gehre dabe page kam crawl hote hain aur kam rank karte hain.
 *  3. Plural query khud target karta hai: "RO service centre Patna all brands",
 *     "water purifier repair Patna any brand".
 *
 * 🔴 8 Oct 2026 — ye ab ek PAID LANDING PAGE bhi hai
 * ───────────────────────────────────────────────────
 * Google Ads ka sitelink "We Repair Every Brand" seedha yahan bhej raha hai.
 * Isliye is din teen cheezein add hui:
 *   • Brand LOGO har card me (customer naam nahi, logo dhundhta hai)
 *   • Asli "repair ₹X se" — har brand ke apne page wala hi number
 *   • ItemList + Service + LocalBusiness schema (pehle sirf FAQ + Breadcrumb tha)
 *
 * Live measurement (8 Oct, pehle): 1,064 words · 2 images · 5 schema types.
 * Competitor check usi din: rocareindia /brands → 404, roservicecentrepatna
 * /brands → 404, rosale aur rocarepoint par aisa page hai hi nahi.
 * Matlab ye poora maidan khaali hai.
 *
 * ⚖️ BRAND_DISCLAIMER aur "honesty" block dono hatana MAT — wahi do cheezein
 * logo dikhane ko nominative fair use banati hain.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { SERVICED_BRANDS } from '@/lib/seo/patna-service-data';
import {
  breadcrumbSchema,
  faqSchema,
  jsonLd,
  localBusinessSchema,
  organizationSchema,
  serviceListSchema,
  websiteSchema,
} from '@/lib/seo/schema';
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';
import { ogImage } from '@/lib/seo/og-image';
import { BRAND_DISCLAIMER } from '@/lib/seo/brand-logos';
import {
  HUB_INTRO,
  HUB_PROOF,
  shortBrandName,
  cheapestFixFrom,
} from '@/lib/seo/brand-hub';
import BrandHubGrid from '@/components/home/BrandHubGrid';

export const revalidate = 86400;

const title = `RO Service in Patna — All Brands | ₹${SERVICE.visitCharge} Visit`;
/* 🔴 154 chars. Google 160 se zyada ko kaat deta hai — is line ko lamba mat
   karna. Badalna ho to pehle gin lo: scripts/verify-serp-hygiene.sh isi ko
   check karta hai. */
const description = `Kent, Aquaguard, Pureit, Livpure, AO Smith & 16 more RO brands repaired in Patna. Same ₹${SERVICE.visitCharge} visit charge, genuine parts, ${SERVICE.warrantyDays}-day warranty. Call ${CONTACT.primaryPhone}.`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'RO service centre Patna all brands',
    'water purifier repair Patna any brand',
    'multi brand RO service Patna',
    'RO repair Patna branded and assembled',
    ...SERVICED_BRANDS.map((b) => `${shortBrandName(b.name)} RO service Patna`),
  ],
  alternates: { canonical: '/service-patna/brand' },
  openGraph: {
    title,
    description,
    url: `${BRAND.url}/service-patna/brand`,
    images: ogImage(),
  },
  other: { 'geo.region': 'IN-BR', 'geo.placename': 'Patna' },
};

const FAQS = [
  {
    q: 'Which RO brands do you service in Patna?',
    a: `We service every brand sold in Patna — Kent, Aquaguard, Aquafresh, Aquasure, Livpure, Pureit, AO Smith, Blue Star, Havells, Nasaka, Zero B, Tata Swach, LG, Whirlpool, Panasonic, Faber, V-Guard, Konvio Neer, AquaUltra, plus commercial plants and locally assembled units. No brand is refused.`,
  },
  {
    q: 'Do you charge more for premium brands like AO Smith or LG?',
    a: `The visit charge is the same ₹${SERVICE.visitCharge} for every brand. Only the part cost differs, because a genuine LG or AO Smith cartridge genuinely costs more than a standard 10-inch filter. We show you the part and its price before fitting it.`,
  },
  {
    q: 'My RO is a local assembled unit. Will you still service it?',
    a: 'Yes, and it is usually cheaper. Assembled units use standard 10-inch housings and 75/80 GPD membranes, so parts are inexpensive and readily available. A large share of Patna homes have these and we service them daily.',
  },
  {
    q: 'Are you the official service centre for these brands?',
    a: 'No, and we say that plainly. We are an independent multi-brand service provider. If your purifier is still under manufacturer warranty, use the brand service centre first — we will tell you so rather than take your money. We are for out-of-warranty units, faster response, and honest pricing.',
  },
  {
    q: 'Do you use genuine spare parts?',
    a: 'We use genuine or OEM-equivalent parts and tell you which one you are getting, with the price difference, before we fit anything. Every part carries its own 6 to 12 month warranty plus our 30-day service warranty.',
  },
  {
    q: 'I do not know my RO brand. The sticker has worn off.',
    a: 'That is very common on units older than five years. Send us a photo on WhatsApp — the housing shape, tap style and pump label are usually enough for us to identify it. If it turns out to be a locally assembled unit, parts are standard and cheaper anyway.',
  },
  {
    q: 'How soon can a technician reach me in Patna?',
    a: `Usually within ${SERVICE.responseTime} across central Patna — Boring Road, Kankarbagh, Patliputra, Rajendra Nagar, Kadamkuan, Bailey Road. Danapur, Phulwari Sharif and Khagaul can take a little longer at peak hours. We are open 08:00–21:00, all seven days.`,
  },
];

export default function BrandHubPage() {
  // Service schema ke liye — har brand ka apna page, apna starting price.
  const serviceItems = SERVICED_BRANDS.map((b) => {
    const from = cheapestFixFrom(b.slug);
    return {
      name: `${shortBrandName(b.name)} RO Service & Repair in Patna`,
      url: `${BRAND.url}/service-patna/brand/${b.slug}`,
      description: b.popularModels.slice(0, 4).join(', '),
      priceFrom: from ? Number(from.replace(/[₹,]/g, '')) : SERVICE.visitCharge,
    };
  });

  return (
    <main>
      <script
        {...jsonLd([
          organizationSchema(),
          websiteSchema(),
          localBusinessSchema(),
          serviceListSchema(serviceItems, 'RO Brands Serviced in Patna'),
          faqSchema(FAQS),
          breadcrumbSchema([
            { name: 'Home', url: BRAND.url },
            { name: 'RO Service Patna', url: `${BRAND.url}/service-patna` },
            { name: 'All Brands', url: `${BRAND.url}/service-patna/brand` },
          ]),
        ])}
      />

      {/* ── Hero — poster same rakha gaya hai ───────────────────────── */}
      <section className="grain relative overflow-hidden bg-hero-deep">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_75%_20%,rgba(113,206,218,.18),transparent_60%)]" />
        <div className="container relative mx-auto px-4 py-14">
          <nav className="text-xs text-navy-300" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-1.5">/</span>
            <Link href="/service-patna" className="hover:text-white">RO Service Patna</Link>
            <span className="mx-1.5">/</span>
            <span className="text-navy-100">All Brands</span>
          </nav>

          <p className="eyebrow mt-5 text-aqua-300">{SERVICED_BRANDS.length} brands · every model</p>
          <h1 className="text-hero mt-2 max-w-3xl font-extrabold text-white text-balance">
            We Repair Every RO Brand in Patna
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-navy-100 text-pretty">
            Branded, budget, imported or locally assembled — our technicians carry parts for all
            of them. Same ₹{SERVICE.visitCharge} visit charge whatever you own, and the part price
            is shown to you before anything is fitted.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={CONTACT.primaryTel}
              className="rounded-xl bg-cta-green px-7 py-4 text-[17px] font-bold text-white shadow-call transition hover:bg-cta-greenDark"
            >
              📞 Call {CONTACT.primaryPhone}
            </a>
            <a
              href={CONTACT.whatsappLink('Hi, I need RO service in Patna. My brand is: ')}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white/95 px-7 py-4 text-[17px] font-bold text-navy-700 shadow-card transition hover:bg-white"
            >
              💬 WhatsApp
            </a>
          </div>

          {/* Proof strip — paid traffic ko pehli screen par number chahiye */}
          <dl className="mt-9 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {HUB_PROOF.map((p) => (
              <div
                key={p.label}
                className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur-sm"
              >
                <dt className="text-[11px] uppercase tracking-wide text-navy-300">{p.label}</dt>
                <dd className="mt-0.5 font-display text-xl font-extrabold text-white">{p.value}</dd>
                <dd className="text-[11px] text-navy-300">{p.sub}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Intro — homepage se alag copy ───────────────────────────── */}
      <section className="bg-white py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="text-h2 font-extrabold text-navy-700">
            Patna me har ghar ki RO alag hai
          </h2>
          {HUB_INTRO.map((p) => (
            <p key={p.slice(0, 24)} className="mt-4 text-[15px] leading-relaxed text-navy-600 text-pretty">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* ── Brand grid (logo cards) ─────────────────────────────────── */}
      <section className="bg-sand-100 py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-h2 font-extrabold text-navy-700">Apna brand chuniye</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Har page par us brand ke wahi faults likhe hain jo hum sach me dekhte hain, asli
            cost range ke saath — andaza nahi, Patna ka apna data.
          </p>

          <div className="mt-8">
            <BrandHubGrid />
          </div>
        </div>
      </section>

      {/* ── Kya har brand me alag hota hai ──────────────────────────── */}
      <section className="py-14">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="text-h2 font-extrabold text-navy-700">
            Brand badalne se kya-kya badalta hai
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-navy-600 text-pretty">
            Visit charge nahi badalta. Teen cheezein badalti hain, aur yahi aapke bill me
            farak laati hain.
          </p>

          <div className="mt-6 space-y-4">
            <div className="card p-5">
              <h3 className="font-display font-bold text-navy-700">1. Housing ka type</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-600 text-pretty">
                Kent ke kai model proprietary push-fit housing use karte hain — usme generic
                10-inch filter theek se baithta hi nahi. Aquaguard aur Pureit ke electronic
                model me service counter hota hai jo filter badalne ke baad reset karna padta
                hai, warna alarm do din me wapas aa jata hai. Locally assembled unit me standard
                housing hoti hai — isliye uske parts sabse saste padte hain.
              </p>
            </div>
            <div className="card p-5">
              <h3 className="font-display font-bold text-navy-700">2. Part ka daam</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-600 text-pretty">
                Ek standard sediment + carbon set ₹300–₹500 ka padta hai. Wahi set Kent ka
                genuine lein to ₹450–₹700, aur AO Smith ya LG ka cartridge isse bhi upar jaata
                hai. 80 GPD membrane ₹1,100–₹2,400 ki padti hai, brand ki genuine ₹1,400–₹2,200
                tak. Hum dono option dikhate hain aur farak batate hain — faisla aapka.
              </p>
            </div>
            <div className="card p-5">
              <h3 className="font-display font-bold text-navy-700">3. Part milne ki aasani</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-600 text-pretty">
                Kent, Aquaguard, Aquafresh aur assembled unit ke parts van me hi rehte hain —
                kaam ek hi visit me ho jaata hai. Panasonic, Konvio Neer ya kuch imported model
                ke liye part mangwana pad sakta hai; aise me hum pehle hi bata dete hain ki ek
                din aur lagega, baad me surprise nahi dete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Honesty block — yahi trust aur links kamata hai ─────────── */}
      <section className="pb-14">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
            <h2 className="font-display text-lg font-bold text-amber-900">
              One thing we will always tell you
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900 text-pretty">
              If your purifier is still under the manufacturer&apos;s warranty, call the brand&apos;s own
              service centre first — the repair will be free for you. We are an independent
              multi-brand service, not an authorised centre, and we would rather lose one job than
              charge you for something the brand owes you. Once you are out of warranty, we are
              usually faster and cheaper.
            </p>
          </div>

          <h2 className="text-h2 mt-10 font-extrabold text-navy-700">Common questions</h2>
          <dl className="mt-5 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="card p-5">
                <dt className="font-display font-bold text-navy-700">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-navy-600 text-pretty">{f.a}</dd>
              </div>
            ))}
          </dl>

          {/* Aage kahan jaana hai — crawl aur user dono ke liye */}
          <div className="mt-10 rounded-2xl bg-navy-50 p-6">
            <h2 className="font-display text-lg font-bold text-navy-700">Aage kya dekhein</h2>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <li>
                <Link href="/ro-service-in-patna" className="text-aqua-700 underline-offset-2 hover:underline">
                  RO service in Patna — poori jaankari
                </Link>
              </li>
              <li>
                <Link href="/ro-problem-checker" className="text-aqua-700 underline-offset-2 hover:underline">
                  Apni RO ki problem khud pehchaanein
                </Link>
              </li>
              <li>
                <Link href="/ro-services-patna" className="text-aqua-700 underline-offset-2 hover:underline">
                  Saari services — repair, install, filter, AMC
                </Link>
              </li>
              <li>
                <Link href="/ro-service-patna-faq" className="text-aqua-700 underline-offset-2 hover:underline">
                  Rate, TDS aur warranty ke seedhe jawab
                </Link>
              </li>
              <li>
                <Link href="/amc-plans" className="text-aqua-700 underline-offset-2 hover:underline">
                  Saalana service plan (AMC)
                </Link>
              </li>
              <li>
                <Link href="/service-patna" className="text-aqua-700 underline-offset-2 hover:underline">
                  Patna ke saare area jahan hum aate hain
                </Link>
              </li>
            </ul>
          </div>

          {/* ⚖️ DISCLAIMER — hatana MAT */}
          <p className="mt-8 text-center text-xs leading-relaxed text-navy-400">
            {BRAND_DISCLAIMER}
          </p>
        </div>
      </section>
    </main>
  );
}
