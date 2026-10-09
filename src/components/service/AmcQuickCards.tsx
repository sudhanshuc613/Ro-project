/**
 * AMC QUICK CARDS — teen plan, chhota summary, poori detail /amc-plans par.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN (9 Oct 2026)
 * ─────────────────
 * Reference site ke page par 3 AMC plan card hain (₹1,499 / ₹2,499 / ₹4,999)
 * poore "What's Included / What's Not Included / Perfect For" ke saath.
 * Wo kaam karta hai kyunki AMC ek bada ticket hai — ek AMC = 7 service
 * visit ke barabar paisa, aur customer saal bhar ke liye bandh jaata hai.
 *
 * Hamare page par AMC ka zikr tha par card nahi tha.
 *
 * 🔴 DUPLICATION SE BACHNE KA INTEZAAM
 * ────────────────────────────────────
 * Poori feature list `/amc-plans` par hai aur wahi source of truth hai.
 * Yahan sirf naam, price, visits aur ek line hai. Agar poori list dono
 * jagah hoti to ek din dono alag ho jaate — aur do jagah alag AMC price
 * dikhna sabse bada trust-killer hai.
 *
 * `AMC_SUMMARY` ke teen price `src/app/(shop)/amc-plans/page.tsx` ke PLANS
 * array se EXACT match karte hain:  Basic 1499 · Gold 2799 · Platinum 4499
 * Wahan badlo to yahan bhi badalna.
 *
 * IMAANDARI
 * ─────────
 * Neeche ek line hai jo saaf kehti hai ki nayi machine par AMC faayde ka
 * sauda nahi hota. Competitor ye kabhi nahi likhta. Ye line short-term me
 * ek AMC bechne se rok sakti hai, par wahi banda 3 saal baad khud wapas
 * aata hai — kyunki usko yaad rehta hai ki humne sach bola tha.
 */
import Link from 'next/link';
import { AMC_SUMMARY } from '@/lib/seo/ads-landing-data';
import { CONTACT, SERVICE } from '@/lib/constants';

export default function AmcQuickCards() {
  return (
    <section className="bg-slate-50 px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-2xl font-black text-navy-900 md:text-3xl">
          RO AMC Plans {SERVICE.city} &mdash; Saal Bhar Ki Tension Khatam
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-navy-600">
          Scheduled visits, filter, TDS testing aur priority response ek fixed rate me.
          Teen plan hain &mdash; neeche seedha farak diya hai.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {AMC_SUMMARY.map((p) => (
            <article
              key={p.name}
              className={`relative flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ${
                p.popular ? 'ring-2 ring-aqua-400' : 'ring-navy-100'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-aqua-500 px-4 py-1 text-[11px] font-black uppercase tracking-wide text-navy-900">
                  Sabse zyada liya jaata hai
                </span>
              )}

              <h3 className="font-display text-lg font-black text-navy-900">{p.name} AMC</h3>
              <p className="mt-1 font-display text-3xl font-black text-aqua-700">
                ₹{p.price.toLocaleString('en-IN')}
                <span className="text-sm font-bold text-navy-500"> / saal</span>
              </p>
              <p className="mt-1 text-xs font-bold text-navy-600">
                {p.visits} scheduled visit saal me
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600">{p.line}</p>

              <a
                href={CONTACT.primaryTel}
                data-analytics={`ads-amc-call-${p.name.toLowerCase()}`}
                className={`mt-4 rounded-xl px-4 py-3 text-center text-sm font-black transition ${
                  p.popular
                    ? 'bg-aqua-500 text-navy-900 hover:bg-aqua-400'
                    : 'bg-navy-900 text-white hover:bg-navy-800'
                }`}
              >
                Call {CONTACT.primaryPhone}
              </a>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="mx-auto max-w-3xl rounded-2xl bg-white p-4 text-center text-sm leading-relaxed text-navy-700 ring-1 ring-navy-100">
            <strong>Imaandar salah:</strong> agar aapki machine 3 saal se nayi hai aur ghar me koi
            track rakhta hai ki filter kab badla tha, to AMC se sasta per-visit hi padega. Hum
            aapke mohalle ka saal bhar ka kharcha nikaal kar bata dete hain &mdash; aur agar number
            AMC ke khilaaf jaata hai, to hum wahi bolte hain.
          </p>
          <Link
            href="/amc-plans"
            className="rounded-2xl bg-navy-900 px-6 py-3 text-sm font-black text-white transition hover:bg-navy-800"
          >
            Teeno plan ki poori list dekho &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
