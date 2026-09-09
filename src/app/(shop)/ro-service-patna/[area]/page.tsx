/**
 * KEYWORD-FIRST AREA PAGE — /ro-service-patna/[area]
 * ────────────────────────────────────────────────────────────────────────────
 * Measured 3 Sep 2026: the competitor outranking us for
 * "ro service kankarbagh patna" used /ro-service-centre-kankarbagh-patna/,
 * while ours was /service-patna/kankarbagh. Our page beat theirs on every
 * content metric — 1,528 words to 1,426, 42 schema blocks to 19 — and still
 * sat at #3. The URL was the clearest remaining difference: theirs carried
 * every query term, ours did not contain "ro" at all.
 *
 * Google treats "/" and "-" alike as word separators, so this path now carries
 * all four terms: ro · service · patna · {area}.
 *
 * Migration safety:
 *   • This is the canonical URL and owns the markup.
 *   • /service-patna/[area] stays alive and 301s here, so every indexed URL
 *     keeps its ranking instead of 404ing.
 *   • The sitemap lists only this URL, and canonical points here, so there is
 *     never a duplicate-content signal.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SERVICE_AREAS, SERVICED_BRANDS, buildAreaFaqs, subLocalities } from '@/lib/seo/patna-service-data';
import { localBusinessSchema, faqSchema, breadcrumbSchema, jsonLd } from '@/lib/seo/schema';
import FaqAccordion from '@/components/home/FaqAccordion';
import QuickBookForm from '@/components/home/QuickBookForm';
import TrustBadges from '@/components/ui/TrustBadges';
import { BRAND, CONTACT, SERVICE, GBP } from '@/lib/constants';
import { areaPath } from '@/lib/seo/area-url';
import { tdsVerdict, costForecast, faultProfile, responseDetail } from '@/lib/seo/area-depth';

export const revalidate = 86400;

export function generateStaticParams() {
  return SERVICE_AREAS.map((a) => ({ area: a.slug }));
}

export function generateMetadata({ params }: { params: { area: string } }): Metadata {
  const area = SERVICE_AREAS.find((a) => a.slug === params.area);
  if (!area) return { title: 'Area Not Found' };

  /* The layout appends ' | Aqua Perl' (12 chars), so the base stays under ~48
     to land in the 51-60 window with the lowest measured rewrite rate. Long
     names fall back to a shorter form rather than truncating mid-word. */
  const full = `RO Repair in ${area.name}, Patna — ₹${SERVICE.visitCharge} Visit`;
  const title = full.length <= 48 ? full : `RO Repair in ${area.name} — ₹${SERVICE.visitCharge} Visit`;
  const description = `RO repair & installation in ${area.name}, Patna. ₹${SERVICE.visitCharge} visit charge, technician in ${area.responseMin} min. All brands. Call ${CONTACT.primaryPhone}.`;

  return {
    title,
    description,
    keywords: [
      `RO service in ${area.name}`,
      `RO repair ${area.name} Patna`,
      `RO service centre ${area.name}`,
      `water purifier service ${area.name}`,
      `RO installation ${area.name}`,
      `RO technician near me ${area.name}`,
      `Kent RO service ${area.name}`,
      `Aquaguard service ${area.name} Patna`,
      ...area.pincodes.map((p) => `RO service ${p}`),
    ],
    alternates: { canonical: areaPath(area.slug) },
    openGraph: { title, description, url: areaPath(area.slug), type: 'website' },
  };
}

export default function AreaPage({ params }: { params: { area: string } }) {
  const area = SERVICE_AREAS.find((a) => a.slug === params.area);
  if (!area) notFound();

  const faqs = buildAreaFaqs(area);

  /* Depth blocks, all derived from THIS area's measured numbers.
     Added 9 Sep 2026: rocareindia's Kankarbagh page measured 3,392 words
     against our 1,215. Their extra volume is boilerplate — their five Patna
     locality pages are 100.0% identical with 51 shared sentences. Copying that
     would take our own overlap from 34% to theirs and put the whole site under
     the site-wide Helpful Content classifier. These blocks add depth that
     genuinely differs by area because the TDS band drives every number. */
  const tds = tdsVerdict(area);
  const cost = costForecast(area);
  const faults = faultProfile(area);
  const response = responseDetail(area);
  const subs = subLocalities(area.slug);
  const nearby = SERVICE_AREAS.filter(
    (a) => a.slug !== area.slug &&
      area.nearbyAreas.some((n) => a.name.toLowerCase().includes(n.toLowerCase().split(' ')[0])),
  ).slice(0, 6);

  /* Keep the internal link graph dense even when the named neighbours are not
     themselves service pages. */
  const linkOut = nearby.length >= 4
    ? nearby
    : [...nearby, ...SERVICE_AREAS.filter((a) => a.slug !== area.slug && !nearby.includes(a)).slice(0, 6 - nearby.length)];

  return (
    <>
      <script {...jsonLd([
        localBusinessSchema({
          name: area.name, lat: area.lat, lng: area.lng,
          pincodes: area.pincodes, path: areaPath(area.slug),
        }),
        faqSchema(faqs),
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'RO Service in Patna', url: '/service-patna' },
          { name: area.name, url: areaPath(area.slug) },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${BRAND.url}${areaPath(area.slug)}/#service`,
          serviceType: `RO Water Purifier Repair in ${area.name}`,
          name: `RO Service in ${area.name}, Patna`,
          provider: { '@type': 'LocalBusiness', name: BRAND.name, telephone: `+91${CONTACT.primaryPhone}` },
          areaServed: {
            '@type': 'City',
            name: `${area.name}, Patna`,
            containedInPlace: { '@type': 'State', name: 'Bihar' },
          },
          /* Real rating, real count. The competitor ranking above us ships
             `reviewCount: 187134` on a Product schema for this same query.
             Ours stays at the genuine GBP figure — Google's 24 Jul 2026 review
             update strips structured data site-wide for inflated counts, which
             would take out all 173 pages, not just this one. */
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(GBP.ratingValue),
            reviewCount: String(GBP.reviewCount),
            bestRating: '5',
            worstRating: '1',
          },
          /* OfferCatalog gives each job its own priced entry rather than a
             single visit-charge Offer. The competitor uses this shape and it
             is what lets an engine answer "how much is X in {area}". */
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `RO services in ${area.name}, Patna`,
            itemListElement: [
              { name: 'Visit + diagnosis + TDS test', price: SERVICE.visitCharge, url: '/ro-repair-patna' },
              { name: 'Filter change (full set)', price: 350, url: '/ro-filter-change-patna' },
              { name: 'RO membrane replacement', price: 1100, url: '/ro-membrane-replacement-patna' },
              { name: 'New RO installation', price: 500, url: '/ro-installation-patna' },
              { name: 'Annual maintenance contract', price: 1499, url: '/ro-amc-patna' },
            ].map((o) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: `${o.name} in ${area.name}`, url: `${BRAND.url}${o.url}` },
              price: String(o.price),
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock',
              areaServed: { '@type': 'City', name: `${area.name}, Patna` },
            })),
          },
          offers: {
            '@type': 'Offer',
            price: String(SERVICE.visitCharge),
            priceCurrency: 'INR',
            description: `Visit charge ₹${SERVICE.visitCharge} in ${area.name}`,
          },
        },
      ])} />

      <main className="bg-white">
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex flex-wrap gap-2 px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li><Link href="/service-patna" className="text-navy-600 hover:text-aqua-600">RO Service Patna</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">{area.name}</li>
          </ol>
        </nav>

        <section className="relative overflow-hidden bg-navy-700 py-12 md:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(6,182,212,.26),transparent_55%)]" />
          <div className="container relative mx-auto grid gap-8 px-4 lg:grid-cols-2 lg:items-center">
            <div className="text-white">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
                📍 {area.name}, Patna · {area.pincodes.join(' / ')}
              </p>
              <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight md:text-4xl">
                RO Service in {area.name}, Patna
                <span className="mt-1 block text-xl text-aqua-300 md:text-2xl">
                  Visit Charge Only ₹{SERVICE.visitCharge}
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-navy-100">{area.intro}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a href={CONTACT.primaryTel}
                  className="rounded-xl bg-cta-green px-6 py-3.5 font-bold text-white transition hover:bg-cta-greenDark">
                  📞 Call {CONTACT.primaryPhone}
                </a>
                <a href={`https://wa.me/91${CONTACT.primaryPhone}?text=${encodeURIComponent(`Namaste, ${area.name} me RO service chahiye`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="rounded-xl bg-[#25D366] px-6 py-3.5 font-bold text-white">
                  💬 WhatsApp
                </a>
              </div>

              <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
                  <dt className="text-[10px] uppercase tracking-wide text-navy-200">Response</dt>
                  <dd className="font-display text-xl font-extrabold">{area.responseMin} min</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
                  <dt className="text-[10px] uppercase tracking-wide text-navy-200">Technicians</dt>
                  <dd className="font-display text-xl font-extrabold">{area.technicians}</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
                  <dt className="text-[10px] uppercase tracking-wide text-navy-200">Jobs/month</dt>
                  <dd className="font-display text-xl font-extrabold">{area.monthlyJobs}</dd>
                </div>
              </dl>
            </div>

            <QuickBookForm />
          </div>
        </section>

        <section className="py-12 md:py-14">
          <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.4fr,1fr]">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-navy-700">
                {area.name} ka paani aur uski problem
              </h2>
              <p className="mt-3 leading-relaxed text-navy-600">{area.waterProfile}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-sand-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Typical TDS here</p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-navy-700">{area.tdsRange}</p>
                </div>
                <div className="rounded-xl bg-sand-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Most common repair</p>
                  <p className="mt-1 text-sm font-bold text-navy-700">{area.commonRepair}</p>
                </div>
              </div>

              <h3 className="mt-8 font-display text-lg font-bold text-navy-700">
                {area.name} me hum yahan aate hain
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {area.landmarks.map((l) => (
                  <li key={l} className="rounded-lg bg-aqua-50 px-3 py-1.5 text-sm font-medium text-aqua-800">
                    📍 {l}
                  </li>
                ))}
              </ul>

              {/* Named pockets inside this area that do not have their own
                  page. Listing them here rather than building 14 more pages is
                  deliberate: a street inside Boring Road would produce a page
                  saying the same thing as Boring Road with a different noun,
                  which is the doorway pattern the competitor is built on
                  (their five Patna pages measure 100% identical). This gives
                  the same keyword coverage with none of that exposure. */}
              {subs.length > 0 && (
                <>
                  <h3 className="mt-7 font-display text-lg font-bold text-navy-700">
                    {area.name} ke andar ye jagah bhi
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    Ye sab {area.name} ke service area me hi aate hain — wahi rate,
                    wahi {area.responseMin} minute ka response.
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {subs.map((sl) => (
                      <li
                        key={sl}
                        className="rounded-lg border border-navy-100 bg-white px-3 py-1.5 text-sm font-medium text-navy-600"
                      >
                        {sl}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <TrustBadges className="mt-6" />
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-navy-100 bg-white p-5">
                <h3 className="font-display text-base font-bold text-navy-700">Rate card</h3>
                {/* Rate rows link to the job page that explains them. Added
                    8 Sep 2026 — the numbers were here already but there was
                    nowhere to go to find out what they buy. */}
                <dl className="mt-3 space-y-2 text-sm">
                  {[
                    ['Visit + diagnosis', `₹${SERVICE.visitCharge}`, '/ro-repair-patna'],
                    ['Filter change (set)', '₹350 se', '/ro-filter-change-patna'],
                    ['Membrane replacement', '₹1,100 se', '/ro-membrane-replacement-patna'],
                    ['SMPS / adaptor', '₹450 se', '/ro-repair-patna'],
                    ['Booster pump', '₹900 se', '/ro-repair-patna'],
                    ['New installation', '₹500 se', '/ro-installation-patna'],
                    ['AMC (saal bhar)', '₹1,499 se', '/ro-amc-patna'],
                  ].map(([k, v, href]) => (
                    <div key={k} className="flex justify-between border-b border-navy-50 pb-1.5">
                      <dt>
                        <Link href={href} className="text-navy-600 transition hover:text-aqua-600 hover:underline">
                          {k}
                        </Link>
                      </dt>
                      <dd className="font-bold text-navy-700">{v}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href="/ro-services-patna"
                  className="mt-3 inline-block text-xs font-bold text-aqua-600 hover:underline"
                >
                  Har kaam ka poora rate list →
                </Link>
                <p className="mt-3 text-xs text-muted">
                  Parts aapki permission ke baad hi. {SERVICE.warrantyDays}-din warranty.
                </p>
              </div>

              <div className="rounded-2xl bg-navy-700 p-5 text-white">
                <h3 className="font-display text-base font-bold">Sab brand theek karte hain</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {SERVICED_BRANDS.slice(0, 12).map((b) => (
                    <Link key={b.slug} href={`/service-patna/brand/${b.slug}`}
                      className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/15 transition hover:bg-white/20">
                      {b.name}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ══ TDS verdict — what this area's number actually means ══
            Every sentence here is generated from area.tdsRange, so a soft-water
            locality and a very-hard one produce materially different copy
            rather than the same paragraph with a different place name. */}
        <section className="border-t border-navy-50 bg-white py-12 md:py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h2 className="font-display text-2xl font-extrabold text-navy-700">
                {area.tdsRange} ka matlab kya hai — {area.name} ke liye
              </h2>
              <p className="mt-1 text-sm font-semibold text-aqua-700">{tds.label}</p>

              <p className="mt-4 leading-relaxed text-navy-600">{tds.bisNote}</p>
              <p className="mt-3 leading-relaxed text-navy-600">{tds.verdict}</p>

              <div className="mt-6 rounded-2xl border-2 border-aqua-200 bg-aqua-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-aqua-700">
                  Membrane — {area.name} ke liye
                </p>
                <p className="mt-1 font-display text-xl font-extrabold text-navy-700">
                  {tds.membrane}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{tds.membraneWhy}</p>
              </div>

              <h3 className="mt-8 font-display text-lg font-bold text-navy-700">
                {area.name} ka asli service schedule
              </h3>
              <p className="mt-1 text-sm text-muted">
                Dabbe pe likha schedule saaf paani maan kar banta hai. Ye {area.tdsRange} pe
                asli chalne wala schedule hai.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ['Sediment filter', tds.sedimentMonths],
                  ['Carbon (pre + post)', tds.carbonMonths],
                  ['RO membrane', tds.membraneMonths],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-navy-100 bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{k}</p>
                    <p className="mt-1 font-display text-xl font-extrabold text-navy-700">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ 12-month running cost — nobody in this market publishes this ══
            Computed from the TDS band, so the arithmetic matches the schedule
            printed directly above it. */}
        <section className="bg-sand-100 py-12 md:py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h2 className="font-display text-2xl font-extrabold text-navy-700">
                {area.name} me RO chalane ka saal bhar ka kharcha
              </h2>
              <p className="mt-2 text-sm text-muted">
                Ye {area.tdsRange} ke hisaab se nikala gaya hai — upar wale schedule se seedha juda hua.
              </p>

              <div className="mt-5 overflow-hidden rounded-2xl border border-navy-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-navy-700 text-white">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Kya</th>
                      <th className="px-4 py-3 font-semibold">Kitni baar</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold">Saal me</th>
                      <th className="hidden px-4 py-3 font-semibold md:table-cell">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cost.rows.map((r, i) => (
                      <tr key={r.item} className={i % 2 ? 'bg-sand-100' : 'bg-white'}>
                        <td className="px-4 py-3 font-semibold text-navy-700">
                          {r.item}
                          <span className="mt-0.5 block text-xs font-normal text-muted md:hidden">
                            {r.note}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-navy-600">{r.freq}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-display font-extrabold text-navy-700">
                          ₹{r.annual.toLocaleString('en-IN')}
                        </td>
                        <td className="hidden px-4 py-3 text-navy-600 md:table-cell">{r.note}</td>
                      </tr>
                    ))}
                    <tr className="bg-navy-50">
                      <td className="px-4 py-3 font-display font-extrabold text-navy-700" colSpan={2}>
                        Kul — saal bhar
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-display text-lg font-extrabold text-cta-green">
                        ₹{cost.total.toLocaleString('en-IN')}
                      </td>
                      <td className="hidden md:table-cell" />
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-xl border-l-4 border-cta-green bg-white p-4">
                <p className="text-sm leading-relaxed text-navy-700">{cost.amcVerdict}</p>
                <Link
                  href="/ro-amc-patna"
                  className="mt-2 inline-block text-sm font-bold text-aqua-600 hover:underline"
                >
                  AMC plans dekho →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══ Top 3 faults in this locality, ranked ══ */}
        <section className="py-12 md:py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h2 className="font-display text-2xl font-extrabold text-navy-700">
                {area.name} me sabse zyada kya kharab hota hai
              </h2>
              <p className="mt-2 text-sm text-muted">
                Hamare apne service record se — is area ki top 3 problem.
              </p>

              <ol className="mt-5 space-y-3">
                {faults.map((f) => (
                  <li
                    key={f.rank}
                    className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 font-display text-base font-extrabold text-orange-700">
                      {f.rank}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-navy-700">
                        {f.fault}
                        {f.cost !== '—' && (
                          <span className="ml-2 align-middle text-sm font-bold text-cta-green">
                            {f.cost}
                          </span>
                        )}
                      </h3>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-navy-600">{f.why}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 rounded-2xl bg-navy-50 p-5">
                <h3 className="font-display text-base font-bold text-navy-700">
                  {area.name} pahunchne me kitna time
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-navy-600">{response}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-navy-50 bg-sand-100 py-10">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-xl font-bold text-navy-700">
              {area.name} ke aas-paas ke area
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {linkOut.map((a) => (
                <Link key={a.slug} href={areaPath(a.slug)}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-navy-700 ring-1 ring-navy-100 transition hover:ring-aqua-300">
                  RO Service in {a.name}
                </Link>
              ))}
            </div>
            <Link href="/service-patna" className="mt-4 inline-block text-sm font-bold text-aqua-600 hover:underline">
              Patna ke saare {SERVICE_AREAS.length} area dekho →
            </Link>
          </div>
        </section>

        <FaqAccordion faqs={faqs} title={`${area.name} me RO service — aam sawaal`} />
      </main>
    </>
  );
}
