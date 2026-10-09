/**
 * RO CUSTOMER CARE NUMBER — PATNA  ·  /ro-customer-care-patna
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN BANAYA (9 Oct 2026) — naap kar, andaze se nahi
 * ────────────────────────────────────────────────────
 * Site ke 94 target keywords ka live coverage scan chalaya gaya (142 pages
 * crawl karke, rendered HTML par). Poori TRUST / CONTACT category ka natija:
 *
 *     #120 Patna RO service company          T3  (sirf alag-alag shabd)
 *     #121 Trusted RO service Patna          MISS
 *     #122 RO service Patna contact          T3
 *     #123 Patna RO service phone number     T3
 *     #124 RO repair helpline Patna          T3
 *     #125 RO warranty Patna                 T3
 *     #126 Genuine RO parts Patna            T3
 *     #127 RO service near me contact number T3
 *
 *     Exact phrase kisi heading me : 0 / 8
 *     Exact phrase kisi body me    : 0 / 8
 *
 * 8 Oct ki autocomplete harvest me "customer care number" cluster me 117 asli
 * queries mili thi — site ke sabse bade untapped cluster. Patna ka koi
 * competitor is par bid nahi kar raha.
 *
 * COMPETITOR JO YAHAN PEHLE SE HAI (live verified 9 Oct 2026)
 * ──────────────────────────────────────────────────────────
 *   rocareindia.com/sitemap/ro-customer-care.xml  →  804 URLs
 *   rocareindia.com/ro-customer-care-patna        →  HTTP 200, 3,257 words
 *       h1     : "RO Customer Care In Patna @9311587744"
 *       schema : sirf FAQPage
 *       tarika : har brand ka official number likhte hain, apna number H1 me
 *
 *   Patna-local competitors me kisi ke paas aisa page NAHI:
 *       roservicecentrepatna.in  → 66 pages, sab area/brand, koi care page nahi
 *       roservicepatna.in        → 1 page site
 *       rorepairepatna.in        → 4 pages (home/about/services/contact)
 *
 * HUM UNSE AAGE KAISE
 * ───────────────────
 *   1. Har number brand ki APNI website se verify kiya gaya (6 verified,
 *      9 par imaandari se "verify nahi hua" likha hai) — rocare ye nahi karta
 *   2. Har brand ke saath uske official channel ki asli haqeeqat likhi hai
 *   3. Side-by-side comparison table — unke paas nahi hai
 *   4. Schema: LocalBusiness + FAQPage + BreadcrumbList + ItemList +
 *      Organization + WebSite  (unke paas 1 type, hamare paas 6+)
 *
 * YE DOORWAY PAGE KIYUN NAHI HAI
 * ──────────────────────────────
 * Google ka apna test: sheher ka naam hata do, kya page ab bhi kaam ka hai?
 * "Patna" hata do to is page ki aadhi value chali jaati hai — kyunki Patna me
 * kis brand ka partner kitne din leta hai, ye yahi ka data hai. Saath hi
 * page user ko competitor ka number bhi deta hai, jo ek doorway page kabhi
 * nahi karta.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CARE_BRANDS, CARE_FAQS, CHANNEL_COMPARE, SAMSUNG_ANSWER, VERIFIED_CARE_COUNT,
} from '@/lib/seo/customer-care-data';
import {
  organizationSchema, websiteSchema, localBusinessSchema, faqSchema,
  breadcrumbSchema, serviceListSchema, jsonLd,
} from '@/lib/seo/schema';
import { BRAND, CONTACT, SERVICE, GBP, GBP_RATING_TEXT } from '@/lib/constants';
import { SERVICE_AREAS } from '@/lib/seo/patna-service-data';
import FaqAccordion from '@/components/home/FaqAccordion';
import TrustBadges from '@/components/ui/TrustBadges';
import { ogImage } from '@/lib/seo/og-image';

export const revalidate = 86400;

const TITLE = `RO Customer Care Number Patna — ${CONTACT.primaryPhone}`;      // 46
/* 160 char limit — Google 160 ke baad kaat deta hai. Live measured: 152. */
const DESC =
  `Patna RO service phone number ${CONTACT.primaryPhone}. Har brand ka official customer care number bhi — ` +
  `Kent, Aquaguard, Pureit, Livpure. ₹${SERVICE.visitCharge} visit, ${SERVICE.warrantyDays}-din warranty.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    'ro customer care number patna', 'patna ro service phone number',
    'ro service patna contact', 'ro repair helpline patna',
    'ro service near me contact number', 'trusted ro service patna',
    'patna ro service company', 'ro warranty patna', 'genuine ro parts patna',
    'kent ro service customer care number patna',
    'aquaguard ro service in patna phone number',
    'water purifier customer care number near me',
    'ro mistri near me contact number', 'ro wala near me contact number',
  ],
  alternates: { canonical: `${BRAND.url}/ro-customer-care-patna` },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${BRAND.url}/ro-customer-care-patna`,
    type: 'website',
    images: ogImage(undefined, 'RO customer care number Patna — Aqua Perl'),
  },
};

export default function RoCustomerCarePatnaPage() {
  const verified = CARE_BRANDS.filter((b) => b.phone);
  const unverified = CARE_BRANDS.filter((b) => !b.phone);
  const faqs = [...CARE_FAQS, SAMSUNG_ANSWER];

  return (
    <>
      <script {...jsonLd([
        organizationSchema(),
        websiteSchema(),
        localBusinessSchema(),
        faqSchema(faqs),
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'RO Service in Patna', url: '/service-patna' },
          { name: 'RO Customer Care Number Patna', url: '/ro-customer-care-patna' },
        ]),
        serviceListSchema(
          CARE_BRANDS.filter((b) => b.ourPath).map((b) => ({
            name: `${b.name} RO service in Patna`,
            url: b.ourPath as string,
            description: `${b.name} water purifier repair, filter change and AMC across Patna. Visit charge Rs ${SERVICE.visitCharge}.`,
            priceFrom: SERVICE.visitCharge,
          })),
          'RO brands serviced in Patna',
        ),
        /* ContactPoint — yahi wo markup hai jo "contact number" queries par
           entity ko number se jodta hai. Koi Patna competitor ye nahi bhejta. */
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          '@id': `${BRAND.url}/ro-customer-care-patna#contact`,
          name: BRAND.name,
          url: `${BRAND.url}/ro-customer-care-patna`,
          contactPoint: [
            {
              '@type': 'ContactPoint',
              telephone: CONTACT.primaryTel.replace('tel:', ''),
              contactType: 'customer service',
              areaServed: { '@type': 'City', name: SERVICE.city },
              availableLanguage: ['Hindi', 'English', 'Bhojpuri'],
            },
            {
              '@type': 'ContactPoint',
              telephone: CONTACT.secondaryTel.replace('tel:', ''),
              contactType: 'technical support',
              areaServed: { '@type': 'City', name: SERVICE.city },
              availableLanguage: ['Hindi', 'English'],
            },
          ],
        },
      ])} />

      <main className="bg-white">
        {/* ─────────────────────────── HERO ─────────────────────────── */}
        <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-aqua-900 px-4 py-12 text-white md:py-16">
          <div className="mx-auto max-w-5xl">
            <nav aria-label="Breadcrumb" className="mb-4 text-xs text-aqua-200">
              <Link href="/" className="hover:underline">Home</Link>
              <span className="mx-1.5">/</span>
              <Link href="/service-patna" className="hover:underline">RO Service Patna</Link>
              <span className="mx-1.5">/</span>
              <span className="text-white">Customer Care Number</span>
            </nav>

            <h1 className="text-3xl font-black leading-tight md:text-5xl">
              RO Customer Care Number in{' '}
              <span className="text-aqua-300">Patna</span>
              {' '}&mdash;{' '}
              <a href={CONTACT.primaryTel} className="underline decoration-aqua-400 decoration-4 underline-offset-4">
                {CONTACT.primaryPhone}
              </a>
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-relaxed text-aqua-50 md:text-lg">
              Ye page do kaam karta hai. Pehla &mdash; agar aapko{' '}
              <strong className="text-white">RO service near me contact number</strong> chahiye to
              upar wala number seedha hamare Buddha Colony office par bajta hai, koi IVR nahi.
              Doosra &mdash; neeche har bade brand ka{' '}
              <strong className="text-white">official customer care number</strong> bhi diya hua hai,
              brand ki apni website se liya hua. Machine warranty me hai to pehle unhi ko call kijiye.
              Wahi sahi hai.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={CONTACT.primaryTel}
                data-analytics="care-hero-call-primary"
                className="rounded-xl bg-aqua-400 px-6 py-3 text-base font-black text-navy-900 shadow-lg transition hover:bg-aqua-300"
              >
                Call {CONTACT.primaryPhone}
              </a>
              <a
                href={CONTACT.secondaryTel}
                data-analytics="care-hero-call-secondary"
                className="rounded-xl bg-white/10 px-6 py-3 text-base font-bold text-white ring-1 ring-white/30 transition hover:bg-white/20"
              >
                Doosra number {CONTACT.secondaryPhone}
              </a>
              <a
                href={CONTACT.whatsappLink('RO service chahiye Patna me')}
                data-analytics="care-hero-whatsapp"
                className="rounded-xl bg-white/10 px-6 py-3 text-base font-bold text-white ring-1 ring-white/30 transition hover:bg-white/20"
              >
                WhatsApp par photo bhejein
              </a>
            </div>

            <dl className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { k: 'Visit charge', v: `₹${SERVICE.visitCharge}`, s: 'TDS test + inspection + likhit quote' },
                { k: 'Pahunchne ka target', v: SERVICE.responseTime, s: `${SERVICE.city} city limits ke andar` },
                { k: 'Service warranty', v: `${SERVICE.warrantyDays} din`, s: 'part aur labour dono par' },
              ].map((x) => (
                <div key={x.k} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-aqua-200">{x.k}</dt>
                  <dd className="mt-0.5 text-2xl font-black text-white">{x.v}</dd>
                  <dd className="mt-0.5 text-xs text-aqua-100">{x.s}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ──────────────── HAMARA NUMBER — "contact" queries ──────────────── */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-black text-navy-900 md:text-3xl">
              Patna RO Service Phone Number &mdash; Seedha Jawab
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
              Aqua Perl ka{' '}
              <strong>Patna RO service phone number {CONTACT.primaryPhone}</strong> hai.
              Busy ho to <strong>{CONTACT.secondaryPhone}</strong> par kijiye. Yahi{' '}
              <strong>RO repair helpline Patna</strong> ke liye hamara ek hi channel hai &mdash;
              koi call centre beech me nahi aata. Jo call uthata hai wahi technician bhejta hai,
              isliye aapko apni baat do baar nahi batani padti.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  h: 'Call par kya poocha jayega',
                  p: 'Teen cheez — machine ka brand, dikkat kya hai, aur aapka area. Bas itne se technician tay ho jaata hai aur sahi part saath lekar nikalta hai.',
                },
                {
                  h: 'Paisa kab tay hota hai',
                  p: `Visit charge ₹${SERVICE.visitCharge} call par hi bata diya jaata hai. Repair ka rate kaam shuru karne se pehle. Aap mana kar dein to sirf visit charge lagta hai, aur kuch nahi.`,
                },
                {
                  h: 'Hamara pata',
                  p: `${CONTACT.address.street}, ${CONTACT.address.locality}, ${SERVICE.city} ${CONTACT.address.pincode}. Ye ek asli dukaan hai — aap aa kar machine dikha bhi sakte hain.`,
                },
              ].map((c) => (
                <div key={c.h} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <h3 className="text-base font-black text-navy-900">{c.h}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-700">{c.p}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <TrustBadges />
            </div>
          </div>
        </section>

        {/* ──────────── BRAND HELPLINES — the rocare-killer block ──────────── */}
        <section className="bg-slate-50 px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-black text-navy-900 md:text-3xl">
              Har Brand Ka Official RO Customer Care Number
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
              Neeche ke {VERIFIED_CARE_COUNT} number brand ki apni website se{' '}
              <strong>9 October 2026</strong> ko live nikale gaye hain. Jin brands ki site ne
              scrape block kiya ya jinka number page par nahi mila, unke liye humne number
              likha hi nahi &mdash; sirf official support page ka link diya hai.{' '}
              <strong>Galat helpline number likhna aapka time barbaad karta hai</strong>, isliye
              jahan verify nahi hua wahan humne saaf likh diya hai.
            </p>

            <div className="mt-6 space-y-3">
              {verified.map((b) => (
                <article
                  key={b.name}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-navy-900">
                        {b.name} &mdash; Customer Care Number
                      </h3>
                      <p className="mt-1 text-sm text-navy-700">
                        <a
                          href={`tel:+91${(b.phone as string).replace(/\D/g, '').slice(-10)}`}
                          data-analytics={`care-brand-${b.name}`}
                          className="text-xl font-black text-aqua-700 hover:underline"
                        >
                          {b.phone}
                        </a>
                        {b.altPhone && (
                          <span className="ml-2 text-sm text-muted">· {b.altPhone}</span>
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                      ✓ official site se verified
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-navy-700">{b.reality}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <a
                      href={b.officialUrl}
                      target="_blank"
                      rel="noopener nofollow"
                      className="font-semibold text-navy-600 hover:underline"
                    >
                      Official support page ↗
                    </a>
                    {b.ourPath && (
                      <Link href={b.ourPath} className="font-bold text-aqua-600 hover:underline">
                        {b.name} RO service in Patna &mdash; hamara page →
                      </Link>
                    )}
                    <span className="text-muted">Source: {b.source}</span>
                  </div>
                </article>
              ))}
            </div>

            <h3 className="mt-8 text-lg font-black text-navy-900">
              Jin brands ka number hum verify nahi kar paaye
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-700">
              In {unverified.length} brands ki website ne automated check block kiya (HTTP 403 /
              406) ya number JavaScript se load hota hai. Number andaze se likhne se behtar hai
              aapko seedha unke official page par bhej dena &mdash; aur ye bata dena ki Patna me
              unke channel ka haal kya hai.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {unverified.map((b) => (
                <article key={b.name} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <h4 className="text-base font-black text-navy-900">{b.name}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-700">{b.reality}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <a
                      href={b.officialUrl}
                      target="_blank"
                      rel="noopener nofollow"
                      className="font-semibold text-navy-600 hover:underline"
                    >
                      Official site ↗
                    </a>
                    {b.ourPath && (
                      <Link href={b.ourPath} className="font-bold text-aqua-600 hover:underline">
                        Hamara {b.name} page →
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────── COMPARISON — company vs local ───────────────── */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-black text-navy-900 md:text-3xl">
              Company Ka Number Ya Local &mdash; Kab Kaun Sa
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
              Sabse seedha niyam: <strong>machine warranty me hai to company ko call kijiye</strong>,
              wahan kaam free hai. Warranty khatam ho chuki hai, ya aapko aaj hi technician chahiye,
              tab ye table dekh lijiye. Ye ek <strong>Patna RO service company</strong> chunne ka
              imaandar tareeka hai &mdash; dono taraf ke fayde-nuksan saath me.
            </p>

            <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-slate-200">
              <table className="w-full min-w-[640px] border-collapse bg-white text-left text-sm">
                <thead>
                  <tr className="bg-navy-900 text-white">
                    <th scope="col" className="px-4 py-3 font-bold">Kya dekhna hai</th>
                    <th scope="col" className="px-4 py-3 font-bold">Brand ka official channel</th>
                    <th scope="col" className="px-4 py-3 font-bold">Aqua Perl (local)</th>
                  </tr>
                </thead>
                <tbody>
                  {CHANNEL_COMPARE.map((r, i) => (
                    <tr key={r.point} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                      <th scope="row" className="px-4 py-3 align-top font-bold text-navy-900">
                        {r.point}
                      </th>
                      <td className="px-4 py-3 align-top text-navy-700">{r.brand}</td>
                      <td className="px-4 py-3 align-top font-semibold text-navy-900">{r.us}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
              Ek baat saaf: warranty wali nayi machine kholna aapka nuksan hai. Us case me hum
              khud mana karte hain aur brand ka number de dete hain &mdash; isi liye ye page bana
              hai.
            </p>
          </div>
        </section>

        {/* ───────────── TRUST — "trusted ro service patna" (#121 MISS) ───────────── */}
        <section className="bg-navy-900 px-4 py-12 text-white">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-black md:text-3xl">
              Trusted RO Service Patna &mdash; Chaar Cheez Jisse Pehchaan Hoti Hai
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-aqua-50">
              Patna me RO ke naam par thagi ka sabse aam tarika ye hai: technician aata hai,
              bina kuch naape bolta hai &ldquo;membrane gaya&rdquo;, ₹2,500 leta hai, aur sirf
              filter badal kar chala jaata hai. Ye chaar check uss poore khel ko rok dete hain.
            </p>

            <ol className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                {
                  h: 'TDS meter saath laaya ya nahi',
                  p: 'Membrane theek hai ya nahi, ye sirf input aur output TDS compare karke pata chalta hai. Bina meter ke jo "membrane kharab hai" bole, wo andaza laga raha hai. Hum har visit par pehle aur baad ka TDS likh kar dete hain.',
                },
                {
                  h: 'Rate kaam se pehle bataya ya baad me',
                  p: 'Imaandar technician machine khol kar pehle quote deta hai. Kaam khatam hone ke baad number batana dabav banane ka tarika hai. Hamara rate card poora site par likha hua hai, chhupa nahi.',
                },
                {
                  h: 'Purana part wapas diya ya nahi',
                  p: 'Jo filter ya membrane nikala gaya, wo aapka hai. Nahi dene ka matlab aksar ye hota hai ki wo badla hi nahi gaya. Hum purana part hamesha aapke saamne nikalte hain aur chhod kar jaate hain.',
                },
                {
                  h: 'Bill mila ya sirf cash gaya',
                  p: `Bina bill ke koi warranty claim nahi hoti. Har kaam ka bill milta hai jisme part ka naam, rate aur ${SERVICE.warrantyDays}-din ki warranty alag line me likhi hoti hai.`,
                },
              ].map((x, i) => (
                <li key={x.h} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
                  <h3 className="flex items-start gap-2 text-base font-black text-white">
                    <span className="shrink-0 rounded-lg bg-aqua-400 px-2 py-0.5 text-sm text-navy-900">
                      {i + 1}
                    </span>
                    {x.h}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-aqua-50">{x.p}</p>
                </li>
              ))}
            </ol>

            <p className="mt-6 max-w-3xl text-sm text-aqua-100">
              Aqua Perl {SERVICE.city} me {new Date().getFullYear() - 2019}+ saal se chal raha hai,
              Google par {GBP_RATING_TEXT} aur {GBP.reviewCount} reviews ke saath. Pata{' '}
              {CONTACT.address.locality} me hai &mdash; aap aa kar mil sakte hain. Yahi fark hai ek
              number aur ek dukaan me.
            </p>
          </div>
        </section>

        {/* ───────── PARTS — #126 genuine parts, #52 pumps motors ───────── */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-black text-navy-900 md:text-3xl">
              Genuine RO Parts Patna &mdash; Kya Stock Me Rehta Hai
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
              Ek hi visit me kaam khatam ho, iske liye van me ye parts hamesha rehte hain. Har part
              ka rate pehle batate hain aur pouch aapke saamne khulta hai.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { h: 'RO membrane', p: '75 GPD, 80 GPD aur 100 GPD — teeno size. Har membrane par GPD rating aur batch number chhapa hota hai, sealed pouch me aata hai.' },
                { h: 'Sediment aur carbon filter', p: '10 inch spun aur CTO carbon, dono standard housing me fit. Patna ki 400–1,200 ppm water par 4–6 mahine chalte hain.' },
                { h: 'RO pumps motors Patna', p: '75 GPD aur 100 GPD booster pump stock me. Pump fail hone ki nishani — machine chalu rehti hai par pani nahi banta, ya pump garam ho jaata hai.' },
                { h: 'SMPS adaptor', p: '24V 1.5A aur 24V 2A dono. SMPS jalna Patna me voltage fluctuation ki wajah se sabse aam failure hai.' },
                { h: 'RO connectors pipes Patna', p: '1/4" aur 3/8" dono size ki tubing, elbow, straight connector, ball valve aur teflon — poora fitting set.' },
                { h: 'UV lamp aur UF kit', p: '11W aur 14W UV lamp, UF membrane cartridge. UV lamp 1 saal me apni power kho deta hai chahe wo jal raha dikhe.' },
              ].map((x) => (
                <div key={x.h} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <h3 className="text-base font-black text-navy-900">{x.h}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-700">{x.p}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/category/spare-parts"
                className="rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800"
              >
                Spare parts online dekhein →
              </Link>
              <Link
                href="/ro-membrane-replacement-patna"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-navy-900 ring-1 ring-navy-200 hover:ring-aqua-300"
              >
                Membrane replacement ka rate →
              </Link>
              <Link
                href="/ro-filter-change-patna"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-navy-900 ring-1 ring-navy-200 hover:ring-aqua-300"
              >
                Filter change ka rate →
              </Link>
            </div>
          </div>
        </section>

        {/* ───────────────────────── AREA LINKS ───────────────────────── */}
        <section className="bg-slate-50 px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-black text-navy-900 md:text-3xl">
              RO Service Near Me Contact Number &mdash; Apne Mohalle Ka Page
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
              Number poore Patna ke liye ek hi hai &mdash; <strong>{CONTACT.primaryPhone}</strong>.
              Par har mohalle ka apna page hai jisme wahan ka TDS, pahunchne ka time aur sabse aam
              fault likha hai. Apna area kholiye, phir call kijiye &mdash; baat seedhi ho jayegi.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {SERVICE_AREAS.slice(0, 28).map((a) => (
                <Link
                  key={a.slug}
                  href={`/ro-service-patna/${a.slug}`}
                  className="rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-navy-700 ring-1 ring-slate-200 transition hover:ring-aqua-300"
                >
                  {a.name}
                </Link>
              ))}
            </div>
            <Link
              href="/service-patna"
              className="mt-4 inline-block text-sm font-bold text-aqua-600 hover:underline"
            >
              Patna ke saare {SERVICE_AREAS.length} area dekho →
            </Link>
          </div>
        </section>

        <FaqAccordion
          faqs={faqs}
          title="RO customer care Patna — aam sawaal"
        />

        {/* ───────────────────────── FINAL CTA ───────────────────────── */}
        <section className="bg-aqua-500 px-4 py-12 text-navy-900">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black md:text-3xl">
              Abhi Call Kijiye &mdash; {CONTACT.primaryPhone}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-medium">
              Ek call, ₹{SERVICE.visitCharge} visit charge, {SERVICE.responseTime} ka target.
              Rate kaam se pehle. {SERVICE.warrantyDays} din ki warranty.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={CONTACT.primaryTel}
                data-analytics="care-footer-call"
                className="rounded-xl bg-navy-900 px-7 py-3.5 text-base font-black text-white shadow-lg transition hover:bg-navy-800"
              >
                Call {CONTACT.primaryPhone}
              </a>
              <a
                href={CONTACT.whatsappLink('RO service chahiye Patna me')}
                data-analytics="care-footer-whatsapp"
                className="rounded-xl bg-white px-7 py-3.5 text-base font-black text-navy-900 shadow-lg transition hover:bg-slate-50"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
