/**
 * SERVICE PRICE GRID — image wale card, aur rate REFERENCE ke roop me.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 OWNER KA SABSE ZAROORI POINT (9 Oct 2026)
 * ────────────────────────────────────────────
 * "pricing kiyu sab pe likh deta hai tu ... spare parts wagreh ka tu refence
 *  diya kar itna se itna tak lag sakta hai ... man le koi customer bol dega
 *  aapne waha pe to ye mention kiya hai aap yaha kuch or le rahe ho"
 *
 * Ye bilkul sahi baat hai aur isme asli paisa fasa hai.
 *
 * PEHLE KYA GALAT THA
 * ───────────────────
 * Card par likha tha "₹120 se", "₹1,100 se", "₹399 se".
 * Customer ka dimag us PEHLE number par atak jaata hai. Technician jaake
 * ₹1,400 ka bill banata hai, to customer phone nikaal kar website dikhata
 * hai: "aapne to ₹120 likha tha". Us bahas me:
 *     • technician ka 20 minute jaata hai
 *     • aadhe case me rate girana padta hai
 *     • customer ko laga ki usse thaga gaya — review 5 se 3 par aata hai
 *
 * Yahi galti competitor (rosale) kar raha hai — "Starts @ ₹299" har card par.
 * Wo hook achha hai par wo trust kharaab karta hai.
 *
 * AB KYA HAI
 * ──────────
 *   1. Har rate ab RANGE hai — "₹120 – ₹700", "₹1,100 – ₹2,400"
 *   2. Har range par label: "Reference rate" (keemat nahi, andaza)
 *   3. Har card par likha hai ki rate UPAR-NEECHE KIS CHEEZ SE hota hai
 *   4. SIRF do cheez "Fixed" label ke saath hai — visit charge aur AMC plan,
 *      kyunki wahi do sach me fixed hain aur un par hum khade reh sakte hain
 *   5. Neeche ek alag spare-parts reference table — har part ka range aur
 *      "rate kis cheez par depend karta hai"
 *   6. Ek bada disclaimer block jo saaf kehta hai: ye range reference hai,
 *      final rate TDS test aur inspection ke baad, kaam shuru hone se pehle
 *
 * Ab agar customer bole "aapne website par likha tha", to website khud kehti
 * hai "range hai, final inspection ke baad" — bahas wahin khatam.
 *
 * IMAGE
 * ─────
 * Owner: "tu bhi iska jaisa image lagata har services ke upper"
 * 6 card, 6 apni banayi hui image (public/services/). Koi insaan nahi —
 * AI-generated chehra GBP par reverse-image-search me pakda jaata hai, aur
 * stock photo har competitor ke paas wahi hoti hai.
 *
 * Saara data `SERVICE_CARDS` aur `PART_RATES` se aata hai (ads-landing-data.ts).
 */
import Image from 'next/image';
import Link from 'next/link';
import { SERVICE_CARDS, PART_RATES } from '@/lib/seo/ads-landing-data';
import { CONTACT, SERVICE } from '@/lib/constants';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function ServicePriceGrid() {
  return (
    <section className="bg-white px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-2xl font-black text-navy-900 md:text-3xl">
          RO Service in {SERVICE.city} &mdash; Har Kaam Ka Reference Rate
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-navy-600">
          Har kaam ka <strong>&ldquo;itne se itne tak&rdquo;</strong> range &mdash; fix keemat nahi.
          Machine ki umar aur aapke mohalle ka TDS rate badal dete hain.{' '}
          <strong>Exact number kaam shuru hone se pehle.</strong>
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CARDS.map((c) => (
            <article
              key={c.title}
              className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-navy-100 transition hover:shadow-lg hover:ring-aqua-300"
            >
              {/* ── Card image ── */}
              <div className="relative aspect-[16/10] w-full bg-navy-900">
                <Image
                  src={c.image}
                  alt={c.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-black shadow-lg ${
                    c.priceKind === 'fixed'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-400 text-navy-900'
                  }`}
                >
                  {c.priceLabel}
                </span>
                <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-800">
                  {c.priceKind === 'fixed' ? 'Fixed rate' : 'Reference range'}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-black text-navy-900">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">{c.blurb}</p>

                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-navy-700 ring-1 ring-slate-200">
                  <strong className="text-navy-900">
                    {c.priceKind === 'fixed' ? 'Ye rate pakka hai:' : 'Rate kis se badalta hai:'}
                  </strong>{' '}
                  {c.note}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a
                    href={CONTACT.primaryTel}
                    data-analytics={`ads-card-call-${c.icon}`}
                    className="rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-navy-800"
                  >
                    Call {CONTACT.primaryPhone}
                  </a>
                  <Link href={c.href} className="text-sm font-bold text-aqua-600 hover:underline">
                    Poora breakup &rarr;
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ══ SPARE PARTS REFERENCE TABLE ══ */}
        <h3 className="mt-12 text-center font-display text-xl font-black text-navy-900 md:text-2xl">
          Spare Parts Ka Reference Rate &mdash; Aur Rate Badalta Kyun Hai
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-navy-600">
          Brand, GPD rating, aur company part ya equivalent &mdash; teeno rate badal dete hain.
          Isliye range, aur saath me wajah bhi.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full min-w-[640px] border-collapse bg-white text-left text-sm">
            <caption className="sr-only">
              RO spare parts reference rate in Patna — range aur wajah
            </caption>
            <thead>
              <tr className="bg-navy-900 text-white">
                <th scope="col" className="px-4 py-3 font-bold">Part</th>
                <th scope="col" className="px-4 py-3 font-bold">Reference range</th>
                <th scope="col" className="px-4 py-3 font-bold">Rate kis se badalta hai</th>
              </tr>
            </thead>
            <tbody>
              {PART_RATES.map((r, i) => (
                <tr key={r.part} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                  <th scope="row" className="px-4 py-3 align-top font-bold text-navy-900">
                    {r.part}
                  </th>
                  <td className="whitespace-nowrap px-4 py-3 align-top font-black text-amber-700">
                    {inr(r.from)} &ndash; {inr(r.to)}
                  </td>
                  <td className="px-4 py-3 align-top text-navy-700">{r.depends}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ══ DISCLAIMER — yahi wo line hai jo baad ki bahas rokti hai ══ */}
        <div className="mt-8 rounded-3xl bg-navy-900 p-6 md:p-8">
          <h3 className="font-display text-lg font-black text-white">
            Rate ke baare me hamari saaf baat
          </h3>
          <ul className="mt-4 grid gap-2.5 md:grid-cols-2">
            {[
              ['Upar ke sab number reference hain', 'quotation nahi'],
              [`Sirf visit charge fixed — ₹${SERVICE.visitCharge}`, 'isme TDS test + inspection'],
              ['Exact rate kaam se PEHLE', 'machine kholne aur TDS naapne ke baad'],
              ['Mana karne ka poora haq', `tab sirf ₹${SERVICE.visitCharge}, aur kuch nahi`],
            ].map(([h, p]) => (
              <li key={h} className="flex items-start gap-2.5 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
                <span aria-hidden="true" className="mt-0.5 text-aqua-300">&#10003;</span>
                <span className="text-sm leading-snug text-white">
                  <strong>{h}</strong>
                  <span className="text-aqua-100"> &mdash; {p}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={CONTACT.primaryTel}
              data-analytics="ads-pricegrid-call"
              className="rounded-2xl bg-aqua-400 px-6 py-3.5 text-base font-black text-navy-900 transition hover:bg-aqua-300"
            >
              Apna exact rate poochiye &mdash; {CONTACT.primaryPhone}
            </a>
            <a
              href={CONTACT.whatsappLink(
                `Namaste, machine ka photo bhej raha hoon. Rate bata dijiye.`,
              )}
              data-analytics="ads-pricegrid-wa"
              className="rounded-2xl bg-white/10 px-6 py-3.5 text-base font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20"
            >
              WhatsApp par photo bhejein
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
