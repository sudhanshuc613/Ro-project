/**
 * CentreAreaGrid — saare 83 area + 21 brand ka link grid.
 *
 * ── Kyun banaya (sab naapa hua, 2–3 Nov 2026) ─────────────────────────────
 *
 * Competitor scan me ek asli farak nikla:
 *
 *     mannubhai.com  ki rank wali page se  268 andruni link
 *     rocareindia.com                      113
 *     AQUA PERL /ro-service-in-patna        69
 *
 * Intent page template abhi sirf `SERVICE_AREAS.slice(0, 12)` dikhata hai —
 * 83 me se 12. Baaki 71 area page ko in badi page se koi link hi nahi milta.
 *
 * ── 🔴 Ye block SIRF naye page par kyun, /ro-service-in-patna par kyun NAHI ──
 *
 * /ro-service-in-patna abhi TRANSITION me hai. 27 Oct ko uske 393 anchor
 * badle gaye the (161 → 310 andruni link) aur Google abhi dobara faisla kar
 * raha hai ki us keyword par kaun sa page rakhe. Usi page ke link dobara
 * badalna matlab wo ghadi phir se zero se shuru. Isliye haath nahi lagaya.
 *
 * Ye grid sirf `/ro-service-centre-patna` par chalta hai — ek BILKUL NAYA
 * URL, jiska Google ke paas koi purana record hai hi nahi. Isse 83 area aur
 * 21 brand page ko naya andruni link milta hai, aur kisi purane page ka ek
 * bhi link nahi badalta.
 *
 * ── Glue bug (class A) se bachav ──────────────────────────────────────────
 * Har <Link> ka text ek hi expression hai (`{a.name}`), uske aas-paas koi
 * nanga text node nahi, isliye adjacent-inline wala pattern banta hi nahi.
 * (Pattern ko yahan literal likhna bhi mana hai — glue detector apne hi
 *  comment ko pakad leta hai. Wo galti ek baar ho chuki hai.)
 *
 * ── Area-depth gate ───────────────────────────────────────────────────────
 * Is file ka koi bhi vaakya 60 character se bada nahi hai jo area page par
 * jaaye — ye component area page par render hota hi nahi. Phir bhi heading
 * aur intro jaan-boojh kar chhote rakhe hain.
 */
import Link from 'next/link';
import { SERVICE_AREAS, SERVICED_BRANDS } from '@/lib/seo/patna-service-data';
import { areaPath } from '@/lib/seo/area-url';

export default function CentreAreaGrid() {
  return (
    <section className="border-t border-navy-50 bg-sand-50/60 py-12">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl font-bold text-navy-700">
          Service Centre Coverage — Patna Ke {SERVICE_AREAS.length} Area
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Har area ka apna page hai — wahan us ilaake ka asli TDS, paani ki
          dikkat aur pahunchne ka samay likha hai. Apna area chunein.
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
          {SERVICE_AREAS.map((a) => (
            <li key={a.slug} className="min-w-0">
              <Link
                href={areaPath(a.slug)}
                className="block truncate rounded-lg px-2 py-1.5 text-sm text-navy-700 transition hover:bg-white hover:text-aqua-600"
              >
                {a.name}
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 font-display text-2xl font-bold text-navy-700">
          Centre Par Jin Brand Ka Kaam Hota Hai
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Aqua Perl kisi brand ka authorised centre nahi hai. Hum ek swatantra
          service centre hain jo in sabhi brands ki machine par kaam karta hai.
          Saare brand naam aur logo unke apne maalikon ki property hain.
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
          {SERVICED_BRANDS.map((b) => (
            <li key={b.slug} className="min-w-0">
              <Link
                href={`/service-patna/brand/${b.slug}`}
                className="block truncate rounded-lg px-2 py-1.5 text-sm text-navy-700 transition hover:bg-white hover:text-aqua-600"
              >
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
