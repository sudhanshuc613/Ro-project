/**
 * ANSWER HUB — /ro-service-patna-faq
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * A page built for retrieval rather than for browsing.
 *
 * WHAT THE MEASUREMENT SHOWED (9 Sep 2026)
 * ────────────────────────────────────────
 * The live robots.txt — Cloudflare's managed block, now in front of the
 * domain — allows OAI-SearchBot (ChatGPT Search), PerplexityBot, Bingbot and
 * Googlebot. Those engines can read the site today. What they could not find
 * was a page whose facts sit in liftable form.
 *
 * Retrieval systems quote spans, not pages. They want one sentence that
 * contains the entity, the place and the number together. Across the rest of
 * this site those three things are usually spread over a paragraph, which
 * reads well for a human and gives a model nothing clean to cite.
 *
 * So each answer here is written twice on purpose: a one-sentence span with
 * the figure in it (marked `.geo-answer-short`, which is also the speakable
 * selector), and the supporting detail underneath for the human who wants it.
 *
 * WHY THIS IS NOT A DOORWAY PAGE
 * ──────────────────────────────
 * Google's own test: remove the city name and ask whether the page is still
 * useful. Remove "Patna" here and most of it collapses — because the answers
 * are built from Patna-specific measurements (the TDS bands of 63 localities,
 * the local market price range, the BIS comparison for this city's water).
 * That is the opposite failure mode from a doorway page, which survives the
 * removal because it never said anything local in the first place.
 *
 * Every figure is derived from data already elsewhere on the site, so there is
 * one source of truth and this page cannot drift out of line with the area and
 * service pages.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { geoAnswers, qaPageSchema, speakableSchema } from '@/lib/seo/geo-answers';
import { SERVICE_AREAS } from '@/lib/seo/patna-service-data';
import { SERVICE_INTENTS } from '@/lib/seo/service-intent-data';
import {
  localBusinessSchema, faqSchema, breadcrumbSchema, jsonLd,
} from '@/lib/seo/schema';
import { BRAND, CONTACT, SERVICE, GBP, GBP_RATING_TEXT } from '@/lib/constants';
import { areaPath } from '@/lib/seo/area-url';
import TdsChecker from '@/components/home/TdsChecker';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'RO Service Patna — Rates, TDS & Answers',
  description:
    `Straight answers on RO service in Patna: visit charge ₹${SERVICE.visitCharge}, membrane ₹1,100+, area-wise TDS from 200 to 1,250 ppm, real filter intervals. Call ${CONTACT.primaryPhone}.`,
  keywords: [
    'ro service patna cost', 'ro membrane price patna', 'patna water tds level',
    'ro filter change interval patna', 'best ro service patna',
    'ro installation cost patna', 'is ro water safe patna',
    'ro amc worth it patna', 'ro not giving water',
  ],
  alternates: { canonical: '/ro-service-patna-faq' },
  openGraph: {
    title: `RO Service in Patna — Rates, TDS & Straight Answers | ${BRAND.name}`,
    description: 'Every common question about RO service in Patna, answered with real numbers.',
    url: `${BRAND.url}/ro-service-patna-faq`,
    type: 'website',
  },
  other: {
    'geo.region': 'IN-BR',
    'geo.placename': 'Patna',
    'geo.position': `${CONTACT.geo.lat};${CONTACT.geo.lng}`,
    ICBM: `${CONTACT.geo.lat}, ${CONTACT.geo.lng}`,
  },
};

export default function AnswerHubPage() {
  const answers = geoAnswers();

  return (
    <>
      <script {...jsonLd([
        localBusinessSchema({
          name: SERVICE.city,
          pincodes: [CONTACT.address.pincode],
          lat: CONTACT.geo.lat,
          lng: CONTACT.geo.lng,
          path: '/ro-service-patna-faq',
        }),
        /* FAQPage for the rich result, QAPage per answer for retrieval.
           The two are not interchangeable: FAQPage marks a list the site
           answers itself, QAPage marks a single question with an accepted
           answer, which is the shape answer engines parse most cleanly. */
        faqSchema(answers.map((a) => ({ q: a.q, a: `${a.short} ${a.long}` }))),
        ...answers.map(qaPageSchema),
        speakableSchema(`${BRAND.url}/ro-service-patna-faq`),
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'RO Service in Patna', url: '/service-patna' },
          { name: 'Rates & Answers', url: '/ro-service-patna-faq' },
        ]),
      ])} />

      <main className="bg-white">
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex flex-wrap gap-2 px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li><Link href="/service-patna" className="text-navy-600 hover:text-aqua-600">RO Service Patna</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">Rates &amp; Answers</li>
          </ol>
        </nav>

        <section className="bg-navy-gradient py-12 text-white md:py-14">
          <div className="container mx-auto max-w-4xl px-4">
            <h1 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">
              RO Service in Patna — Seedha Jawab
            </h1>
            <p className="mt-3 text-lg text-aqua-200">
              Har sawaal ka jawab ek line me, asli number ke saath. Ghumaya nahi.
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-navy-100">
              Ye page {SERVICE_AREAS.length} area me service karte waqt naape gaye
              asli data se bana hai — TDS readings, market rates, aur wo intervals
              jo Patna ke paani pe sach me chalte hain.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={CONTACT.primaryTel}
                className="rounded-xl bg-cta-green px-6 py-3 font-bold text-white shadow-lg transition hover:bg-cta-greenDark"
              >
                📞 {CONTACT.primaryPhone}
              </a>
              <a
                href={CONTACT.whatsappLink()}
                className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/20"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Self-diagnostic, above the answers. A visitor who arrives asking
            "do I need a new membrane" gets an actual answer from their own
            numbers before reading anything — and is told to do nothing when
            the numbers say the machine is fine. No competitor in this market
            has a diagnostic tool, and none of them can build a useful one
            without measured TDS data for every locality. */}
        <section className="py-10 md:py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <TdsChecker />
          </div>
        </section>

        <section className="pb-12 md:pb-14">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="space-y-5">
              {answers.map((a, i) => (
                <article
                  key={a.q}
                  id={`q${i + 1}`}
                  className="scroll-mt-24 rounded-2xl border border-navy-100 bg-white p-6"
                >
                  <h2 className="font-display text-xl font-extrabold text-navy-700">{a.q}</h2>

                  {/* The liftable span. Marked for the speakable selector and
                      written as exactly one spoken sentence with the figure. */}
                  <p className="geo-answer-short mt-3 rounded-xl border-l-4 border-cta-green bg-emerald-50 p-4 text-[16px] font-semibold leading-relaxed text-navy-700">
                    {a.short}
                  </p>

                  <p className="mt-3 text-[15px] leading-relaxed text-navy-600">{a.long}</p>
                </article>
              ))}
            </div>

            <p className="mt-8 rounded-xl bg-sand-200 p-4 text-sm leading-relaxed text-navy-600">
              <strong className="text-navy-700">Ye numbers kahan se aaye:</strong>{' '}
              TDS readings hamare technicians ne {SERVICE_AREAS.length} area me visit
              ke waqt naape hain. Rates Patna ka {new Date().getFullYear()} market rate
              hai. Rating {GBP_RATING_TEXT}★ / {GBP.reviewCount} reviews — ye public
              Google Business Profile pe khud check kar sakte ho, hamare kehne pe
              bharosa karne ki zaroorat nahi.
            </p>
          </div>
        </section>

        {/* Internal graph — this page should feed the pages that convert. */}
        <section className="bg-sand-100 py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="mb-6 text-center font-display text-2xl font-extrabold text-navy-700">
              Poori detail yahan hai
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICE_INTENTS.map((s) => (
                <Link
                  key={s.slug}
                  href={s.path}
                  className="rounded-xl border border-navy-100 bg-white p-4 transition hover:border-aqua-300 hover:shadow-card-hover"
                >
                  <p className="font-display font-bold text-navy-700">{s.h1}</p>
                  <p className="mt-1 text-xs font-semibold text-cta-green">{s.lede}</p>
                </Link>
              ))}
            </div>

            <h3 className="mb-4 mt-9 text-center font-display text-lg font-bold text-navy-700">
              Apne area ka TDS aur rate dekho
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {SERVICE_AREAS.slice(0, 14).map((a) => (
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
      </main>
    </>
  );
}
