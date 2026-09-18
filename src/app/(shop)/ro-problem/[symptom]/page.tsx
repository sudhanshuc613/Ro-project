/**
 * SYMPTOM PAGES — /ro-problem/ro-me-pani-nahi-aa-raha, …
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHY THIS ROUTE EXISTS (measured 16 Sep 2026)
 * ────────────────────────────────────────────
 * Google's own autocomplete endpoint returned 179 clean Hinglish RO queries.
 * I then checked the live SERP for the two biggest:
 *
 *   "ro me pani nahi aa raha hai"  → top 4 are YouTube ×3 + Facebook ×1
 *   "ro se pani kam aa raha hai"   → top 5 are YouTube ×4 + Facebook ×1
 *
 * Zero websites. Not a weak website — none at all.
 *
 * Contrast with "ro service in patna", where positions 1-6 are JustDial,
 * a Facebook page, OneDios, Service On Wheel and Sulekha. Those are
 * directories with 15+ years of authority and we are a 12-month-old domain.
 *
 * So this route targets the queries where the competition is video, because:
 *   - video cannot win a text featured snippet
 *   - AI Overviews cite text pages far more readily than YouTube
 *   - the intent is higher (machine is broken NOW, not price-shopping)
 *   - the queries carry no city, so they work nationally — Patna converts to
 *     a service call, the rest converts to spare-parts orders
 *
 * ROUTE SHAPE
 * ───────────
 * /ro-problem/{symptom} is a two-segment path, deliberately NOT root-level.
 * The root level already carries [intent], and adding a second root-level
 * dynamic segment would make the shadowing problem described in
 * (shop)/[intent]/page.tsx materially worse. A nested segment cannot shadow
 * anything above it.
 *
 * Same three guards as [intent]: generateStaticParams lists the slugs,
 * dynamicParams = false is the hard stop, getSymptom() + notFound() is the
 * runtime belt-and-braces.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SYMPTOMS, getSymptom } from '@/lib/seo/symptom-data';
import {
  localBusinessSchema, faqSchema, breadcrumbSchema, howToSchema, jsonLd,
  organizationSchema, websiteSchema,
} from '@/lib/seo/schema';
import FaqAccordion from '@/components/home/FaqAccordion';
import QuickBookForm from '@/components/home/QuickBookForm';
import TrustBadges from '@/components/ui/TrustBadges';
import { BRAND, CONTACT, SERVICE, GBP, GBP_RATING_TEXT } from '@/lib/constants';

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return SYMPTOMS.map((s) => ({ symptom: s.slug }));
}

export function generateMetadata({ params }: { params: { symptom: string } }): Metadata {
  const s = getSymptom(params.symptom);
  if (!s) return {};
  const url = `${BRAND.url}/ro-problem/${s.slug}`;
  return {
    // title.absolute drops the layout's " | Aqua Perl" so the phone number and
    // the symptom phrase both fit inside the 51-55 char low-rewrite window.
    title: { absolute: `${s.title} · ${CONTACT.primaryPhone}` },
    description: s.description,
    keywords: [s.primaryQuery, ...s.altQueries],
    alternates: { canonical: url },
    openGraph: { title: s.title, description: s.description, url, type: 'article' },
  };
}

export default function SymptomPage({ params }: { params: { symptom: string } }) {
  const s = getSymptom(params.symptom);
  if (!s) notFound();

  const url = `${BRAND.url}/ro-problem/${s.slug}`;
  const diy = s.steps.filter((x) => x.diy).length;

  return (
    <>
      <script {...jsonLd([
        organizationSchema(),
        websiteSchema(),
        localBusinessSchema({
          name: SERVICE.city,
          pincodes: [CONTACT.address.pincode],
          lat: CONTACT.geo.lat,
          lng: CONTACT.geo.lng,
          path: `/ro-problem/${s.slug}`,
        }),
        breadcrumbSchema([
          { name: 'Home', url: BRAND.url },
          { name: 'RO Problems', url: `${BRAND.url}/ro-problem-checker` },
          { name: s.h1, url },
        ]),
        /* HowTo carries the diagnostic sequence. This is the schema type that
           wins the step-by-step snippet the YouTube results cannot take. */
        howToSchema({
          name: s.h1,
          description: s.shortAnswer,
          totalTime: 'PT30M',
          steps: s.steps.map((x) => ({
            name: x.check,
            text: `${x.how} — ${x.means}`,
          })),
        }),
        faqSchema(s.faqs),
      ])} />

      <main className="flex flex-col">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="bg-navy-gradient px-4 py-10 text-white md:py-14">
          <div className="mx-auto max-w-5xl">
            <nav className="mb-4 text-xs text-navy-200">
              <Link href="/" className="hover:text-white">Home</Link>
              {' › '}
              <Link href="/ro-problem-checker" className="hover:text-white">RO Problems</Link>
            </nav>

            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
              <span aria-hidden>{s.icon}</span> {s.label}
            </p>

            {/*
              H1 — the {' '} below is deliberate and load-bearing.
              Twice now a glued H1 has cost us the exact keyword
              ("RepairNow in Patna", "Patna Visit Charge"). Googlebot joins
              adjacent element text with no separator. Do not remove it.
              scripts/verify-h1-keyword.sh will fail the build if you do.
            */}
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight md:text-4xl">
              {s.h1}
            </h1>

            {/* The short answer sits immediately under the H1 in a single
                block, which is the shape Google lifts for a featured snippet. */}
            <p className="mt-4 max-w-3xl rounded-xl bg-white/10 p-4 text-[15px] leading-relaxed text-navy-50 ring-1 ring-white/15">
              <strong className="text-white">Seedha jawab: </strong>{s.shortAnswer}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a href={CONTACT.primaryTel}
                data-analytics={`symptom-call-${s.slug}`}
                className="rounded-xl bg-aqua-400 px-5 py-3 text-sm font-bold text-navy-900 hover:bg-aqua-300">
                📞 Call {CONTACT.primaryPhone}
              </a>
              <a href={CONTACT.whatsappLink(`${s.label} — ${s.h1}`)}
                data-analytics={`symptom-wa-${s.slug}`}
                className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold ring-1 ring-white/25 hover:bg-white/20">
                WhatsApp
              </a>
              <span className="text-xs text-navy-200">
                ⭐ {GBP_RATING_TEXT} · {GBP.reviewCount} Google reviews · Patna me ₹{SERVICE.visitCharge} visit
              </span>
            </div>

            {diy > 0 && (
              <p className="mt-4 rounded-lg bg-emerald-400/15 px-4 py-2 text-sm text-emerald-100 ring-1 ring-emerald-300/30">
                Inme se <strong>{diy} cheez aap khud</strong> check kar sakte ho — bina kisi kharche ke.
                Neeche har ek ka tareeka likha hai.
              </p>
            )}
          </div>
        </section>

        {/* ── Diagnostic steps ───────────────────────────────────── */}
        <section className="px-4 py-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-navy-800">
              Ek-ek karke check karo — sasta pehle
            </h2>
            <p className="mt-2 text-sm text-navy-600">
              Ye order jaan-boojh kar hai. Sabse sasta aur sabse aam kaaran pehle.
              Koi bhi technician jo seedha sabse mehnga part bechne lage, usse savdhan raho.
            </p>

            <ol className="mt-6 space-y-4">
              {s.steps.map((x, i) => (
                <li key={i} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-800 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-navy-800">{x.check}</h3>
                      <p className="mt-1 text-[15px] leading-relaxed text-navy-700">{x.how}</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-navy-600">
                        <strong className="text-navy-800">Matlab: </strong>{x.means}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className={`rounded-full px-2.5 py-1 font-bold ring-1 ${
                          x.diy
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : 'bg-amber-50 text-amber-700 ring-amber-200'
                        }`}>
                          {x.diy ? '✓ Khud kar sakte ho' : '🔧 Technician chahiye'}
                        </span>
                        <span className="rounded-full bg-navy-50 px-2.5 py-1 font-bold text-navy-700 ring-1 ring-navy-100">
                          {x.cost}
                        </span>
                        <span className="rounded-full bg-navy-50 px-2.5 py-1 text-navy-600 ring-1 ring-navy-100">
                          {x.frequency}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Brand notes ────────────────────────────────────────── */}
        {s.brandNotes && s.brandNotes.length > 0 && (
          <section className="bg-navy-50 px-4 py-10">
            <div className="mx-auto max-w-5xl">
              <h2 className="font-display text-2xl font-bold text-navy-800">
                Brand ke hisaab se — jo alag hota hai
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {s.brandNotes.map((b) => (
                  <div key={b.brand} className="rounded-xl bg-white p-4 ring-1 ring-navy-100">
                    <h3 className="font-bold text-navy-800">{b.brand}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-navy-600">{b.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── When to call ───────────────────────────────────────── */}
        <section className="px-4 py-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-navy-800">
              Ab technician bulao — ye nishaniyan dikhein to
            </h2>
            <ul className="mt-4 space-y-2">
              {s.callUs.map((c, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-rose-50 p-3 text-[15px] text-navy-700 ring-1 ring-rose-100">
                  <span aria-hidden className="text-rose-500">⚠</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl bg-navy-800 p-5 text-white">
              <p className="text-[15px] leading-relaxed">
                Patna me hain? Visit charge <strong>₹{SERVICE.visitCharge}</strong> fixed hai —
                isme poora diagnosis aur likhit TDS report shamil hai. Part badalne se pehle
                aapki permission li jati hai, purana part aapko diya jata hai, aur kaam par
                <strong> {SERVICE.warrantyDays} din ki warranty</strong> hai.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={CONTACT.primaryTel}
                  data-analytics={`symptom-call2-${s.slug}`}
                  className="rounded-xl bg-aqua-400 px-5 py-3 text-sm font-bold text-navy-900 hover:bg-aqua-300">
                  📞 {CONTACT.primaryPhone}
                </a>
                <Link href="/ro-service-in-patna"
                  className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold ring-1 ring-white/25 hover:bg-white/20">
                  Patna me RO service ke rates
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Booking ────────────────────────────────────────────── */}
        <section className="bg-navy-gradient px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-center font-display text-2xl font-bold text-white">
              Technician bulana hai?
            </h2>
            <QuickBookForm />
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section className="px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-5 font-display text-2xl font-bold text-navy-800">
              Sawaal jo log poochte hain
            </h2>
            <FaqAccordion faqs={s.faqs} />
          </div>
        </section>

        {/* ── Related ────────────────────────────────────────────── */}
        <section className="bg-navy-50 px-4 py-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-xl font-bold text-navy-800">
              Doosri problem hai?
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {s.related.map((r) => {
                const t = SYMPTOMS.find((x) => x.slug === r);
                if (!t) return null;
                return (
                  <Link key={r} href={`/ro-problem/${t.slug}`}
                    className="rounded-xl bg-white p-4 ring-1 ring-navy-100 transition hover:ring-aqua-300">
                    <span aria-hidden className="text-xl">{t.icon}</span>
                    <p className="mt-1 font-bold text-navy-800">{t.label}</p>
                    <p className="mt-1 text-xs text-navy-500">{t.primaryQuery}</p>
                  </Link>
                );
              })}
              <Link href="/ro-problem-checker"
                className="rounded-xl bg-navy-800 p-4 text-white transition hover:bg-navy-700">
                <span aria-hidden className="text-xl">🔎</span>
                <p className="mt-1 font-bold">Saari problems dekho</p>
                <p className="mt-1 text-xs text-navy-200">RO Problem Checker</p>
              </Link>
            </div>
          </div>
        </section>

        <TrustBadges />
      </main>
    </>
  );
}
