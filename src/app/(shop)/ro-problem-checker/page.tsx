/**
 * RO PROBLEM CHECKER — the hub for the symptom pages
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This is the page the five symptom pages point back to, and the one that
 * targets the generic "ro problems and solutions" / "water purifier repair
 * kaise kare" class of query.
 *
 * It is deliberately a server component with no client JS. An interactive
 * quiz would be nicer to use but worse to rank: the content has to be in the
 * HTML for Googlebot to index it, and a JS-gated flow puts the answers behind
 * a click. So every symptom, every cause and every price is in the static
 * markup, and the "interaction" is just links.
 *
 * That is also why it loads instantly on a ₹6,000 phone on Patna 4G, which
 * is what most of these searches come from.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { SYMPTOMS, CHECKER_INTRO, diyCount } from '@/lib/seo/symptom-data';
import {
  localBusinessSchema, faqSchema, breadcrumbSchema, jsonLd,
  organizationSchema, websiteSchema,
} from '@/lib/seo/schema';
import TrustBadges from '@/components/ui/TrustBadges';
import { BRAND, CONTACT, SERVICE, GBP, GBP_RATING_TEXT } from '@/lib/constants';

export const revalidate = 86400;

const URL = `${BRAND.url}/ro-problem-checker`;

export const metadata: Metadata = {
  title: { absolute: `RO Problem Checker — Khud Pata Karo · ${CONTACT.primaryPhone}` },
  description:
    'RO kharab hai? Problem chuno aur asli kaaran, khud theek karne ka tareeka aur Patna ka rate dekho. Paani nahi, kam paani, awaz, leakage, khara paani — sab.',
  keywords: [
    'ro problems and solutions', 'water purifier repair kaise kare',
    'ro kaise theek kare', 'ro problem check', 'water purifier problem solution',
    'ro repair guide hindi', 'ro troubleshooting hindi', 'ro fault kaise pata kare',
  ],
  alternates: { canonical: URL },
  openGraph: { title: 'RO Problem Checker', url: URL, type: 'website' },
};

const HUB_FAQS = [
  {
    q: 'RO kharab hai, kaise pata karu kya problem hai?',
    a: 'Symptom se shuru karo, part se nahi. Paani bilkul nahi aa raha, kam aa raha, awaz aa rahi, leak ho raha, ya swaad kharab — ye paanch me se jo bhi hai uska page kholo. Har page me sasta kaaran pehle likha hai aur mehnga aakhir me, kyunki asli zindagi me bhi wahi order sahi hai.',
  },
  {
    q: 'Kya main khud RO theek kar sakta hu?',
    a: 'Kuch cheezein haan — inlet valve kholna, socket check karna, filter ka rang dekhna, tank ka pressure. Ye sab bina tool ke ho jata hai aur muft hai. Electrical part (SMPS, pump, solenoid) khud mat chhedna, wahan current aur paani dono hote hain.',
  },
  {
    q: 'Technician bulane se pehle kya check kar lu?',
    a: 'Teen cheez: inlet valve khula hai, adaptor ki light jal rahi hai, aur pehla filter kitna ganda hai. In teeno ka jawab phone par bata doge to hum sahi spare leke aayenge aur kaam ek hi visit me khatam ho jayega.',
  },
  {
    q: 'Patna me RO repair ka kya rate hai?',
    a: `Visit ₹${SERVICE.visitCharge} fixed — isme diagnosis aur likhit TDS report shamil hai. Uske baad: filter ₹450, SMPS ₹550, solenoid ₹450, float ₹350, pump ₹900, membrane ₹1,600 onwards. Sab kuch part badalne se pehle bataya jata hai.`,
  },
  {
    q: 'Aap Patna ke bahar bhi help karte ho?',
    a: 'Service visit sirf Patna aur aas-paas. Par ye guide poore India ke liye hai — jo khud theek ho sakta hai wo kahin se bhi ho jayega, aur spare parts hum poore India me bhejte hain.',
  },
];

export default function CheckerPage() {
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
          path: '/ro-problem-checker',
        }),
        breadcrumbSchema([
          { name: 'Home', url: BRAND.url },
          { name: 'RO Problem Checker', url: URL },
        ]),
        faqSchema(HUB_FAQS),
        /* ItemList makes the five symptoms machine-readable as a set, which is
           how this page can surface as a carousel rather than one blue link. */
        {
          '@type': 'ItemList',
          name: 'RO problems and solutions',
          itemListElement: SYMPTOMS.map((s, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: s.h1,
            url: `${BRAND.url}/ro-problem/${s.slug}`,
          })),
        },
      ])} />

      <main className="flex flex-col">
        <section className="bg-navy-gradient px-4 py-12 text-white md:py-16">
          <div className="mx-auto max-w-5xl">
            <nav className="mb-4 text-xs text-navy-200">
              <Link href="/" className="hover:text-white">Home</Link>
            </nav>

            {/* H1 — single text node, no adjacent spans. See the note in
                ServiceHero.tsx about glued keywords. */}
            <h1 className="font-display text-3xl font-extrabold leading-tight md:text-5xl">
              {CHECKER_INTRO.h1}
            </h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-navy-100">
              {CHECKER_INTRO.sub}
            </p>
            <p className="mt-4 text-xs text-navy-200">
              ⭐ {GBP_RATING_TEXT} · {GBP.reviewCount} Google reviews · Patna me 2019 se
            </p>
          </div>
        </section>

        {/* ── The five symptoms ──────────────────────────────────── */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-4 sm:grid-cols-2">
              {SYMPTOMS.map((s) => (
                <Link key={s.slug} href={`/ro-problem/${s.slug}`}
                  className="group rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition hover:border-aqua-300 hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <span aria-hidden className="text-3xl">{s.icon}</span>
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-bold text-navy-800 group-hover:text-aqua-600">
                        {s.label}
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-navy-600">
                        {s.shortAnswer.split('.')[0]}.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700 ring-1 ring-emerald-200">
                          {diyCount(s)} khud kar sakte ho
                        </span>
                        <span className="rounded-full bg-navy-50 px-2.5 py-1 text-navy-600 ring-1 ring-navy-100">
                          {s.steps.length} cheez check karo
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why we tell you the free fix ───────────────────────── */}
        <section className="bg-navy-50 px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-navy-800">
              Hum khud theek karne ka tareeka kyun batate hain
            </h2>
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-navy-700">
              <p>
                Kyunki har 10 me se 2 call aisi hoti hai jisme kuch kharab hi nahi hota —
                inlet valve band tha, ya socket me current nahi tha. Us customer se
                ₹{SERVICE.visitCharge} lena aasan hai, par wo dobara call nahi karta.
              </p>
              <p>
                Jo sach me kharab hai wo in checks ke baad bhi kharab rahega. Tab aap
                bulaoge, aur tab tak aapko pata hoga ki kya kharab hai — isliye koi aapko
                bewakoof nahi bana sakta, hum bhi nahi.
              </p>
              <p className="rounded-xl bg-white p-4 ring-1 ring-navy-100">
                <strong className="text-navy-800">Ek cheez hamesha yaad rakho:</strong>{' '}
                koi bhi technician jo TDS meter nikale bina membrane badalne ki baat kare,
                wo bech raha hai — diagnose nahi kar raha. Membrane ₹1,600 ka hai aur 10 me
                se sirf 1 case me sach me chahiye hota hai. Number maango, saamne naapne ko bolo.
              </p>
            </div>
          </div>
        </section>

        {/* ── Full query coverage, visible to crawlers ───────────── */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-navy-800">
              In sab sawaalon ke jawab yahan hain
            </h2>
            <p className="mt-2 text-sm text-navy-600">
              Ye wahi shabd hain jo log Google par likhte hain. Apna sawaal dhoondho aur
              seedha us page par jao.
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {SYMPTOMS.map((s) => (
                <div key={s.slug}>
                  <h3 className="text-sm font-bold text-navy-800">
                    <span aria-hidden>{s.icon}</span> {s.label}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {[s.primaryQuery, ...s.altQueries].map((q) => (
                      <li key={q}>
                        <Link href={`/ro-problem/${s.slug}`}
                          className="text-[13px] leading-snug text-navy-600 underline-offset-2 hover:text-aqua-600 hover:underline">
                          {q}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <section className="bg-navy-800 px-4 py-12 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold">
              Khud se theek nahi hua? Patna me hum aate hain
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-navy-100">
              ₹{SERVICE.visitCharge} visit charge, {SERVICE.responseTime} me technician,
              {' '}{SERVICE.warrantyDays} din warranty. Part badalne se pehle aapki permission.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a href={CONTACT.primaryTel}
                data-analytics="checker-call"
                className="rounded-xl bg-aqua-400 px-6 py-3 font-bold text-navy-900 hover:bg-aqua-300">
                📞 {CONTACT.primaryPhone}
              </a>
              <a href={CONTACT.whatsappLink('RO problem — checker se aaya hu')}
                data-analytics="checker-wa"
                className="rounded-xl bg-white/10 px-6 py-3 font-bold ring-1 ring-white/25 hover:bg-white/20">
                WhatsApp
              </a>
              <Link href="/ro-service-in-patna"
                className="rounded-xl bg-white/10 px-6 py-3 font-bold ring-1 ring-white/25 hover:bg-white/20">
                Patna rates dekho
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-5 font-display text-2xl font-bold text-navy-800">
              Aam sawaal
            </h2>
            <div className="space-y-4">
              {HUB_FAQS.map((f) => (
                <details key={f.q} className="rounded-xl border border-navy-100 bg-white p-4">
                  <summary className="cursor-pointer font-bold text-navy-800">{f.q}</summary>
                  <p className="mt-2 text-[15px] leading-relaxed text-navy-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <TrustBadges />
      </main>
    </>
  );
}
