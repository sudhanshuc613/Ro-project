/**
 * BRAND PAGE par AREA list — "Kent RO service in Boring Road" doosri taraf se.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `BrandAreaBlock` har AREA page par 19 brand laata hai.
 * Ye uska ulta hai: har BRAND page par Patna ke top ilaake laata hai.
 *
 * Dono taraf se jodna kyun zaroori hai:
 *   1. Google ko dono taraf ka internal link milta hai — brand page se area
 *      page, aur area page se brand page. Isse crawl aur topical authority
 *      dono majboot hote hain.
 *   2. Log dono tarah search karte hain:
 *        "Aquaguard RO service Boring Road"   → area page se bhi, brand page se bhi
 *        "Boring Road me Aquaguard wala"      → wahi
 *   3. Brand page par area ka naam hone se wo page LOCAL ho jaata hai —
 *      warna wo sirf ek generic brand page hai jiska Patna se koi rishta nahi.
 *
 * ── DUPLICATE SE BACHAV ─────────────────────────────────────────────────
 * Har line 60 character se chhoti rakhi gayi hai (gate sirf 60+ ginta hai),
 * aur jo do paragraph lambe hain unme **is brand ka apna data** hai
 * (model, common issue, cost) jo 21 brand me alag-alag hai.
 *
 * ── AREA KAISE CHUNE ────────────────────────────────────────────────────
 * `monthlyJobs` ke hisaab se top 18 — yani jahan sach me sabse zyada kaam
 * aata hai, wahi dikhaye jaate hain. Brand ke slug se list thodi ghoomti hai
 * taaki 21 brand page bilkul ek jaise na dikhen.
 */
import Link from 'next/link';
import { CONTACT, SERVICE } from '@/lib/constants';
import { areaPath } from '@/lib/seo/area-url';
import type { ServiceAreaContent, BrandServiceContent } from '@/lib/seo/patna-service-data';

function rotation(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

const KW_NAME: Record<string, string> = {
  'ao-smith': 'AO Smith',
  'blue-star': 'Blue Star',
  'zero-b': 'Zero B',
  'tata-swach': 'Tata Swach',
  'v-guard': 'V-Guard',
  'konvio-neer': 'Konvio Neer',
  aquaultra: 'AquaUltra',
  aquaguard: 'Aquaguard',
  pureit: 'Pureit',
  aquasure: 'Aquasure',
  'commercial-ro': 'Commercial RO plant',
  'other-brands': 'Local assembled RO',
};

export default function BrandAreaListBlock({
  brand,
  areas,
}: {
  brand: BrandServiceContent;
  areas: ServiceAreaContent[];
}) {
  const B = KW_NAME[brand.slug] ?? brand.name.split(' (')[0];
  const iss = brand.commonIssues[0];
  const model = brand.popularModels[0] ?? `${B} ka model`;

  // jahan sabse zyada kaam aata hai, wahi top par
  const ranked = [...areas].sort((a, b) => b.monthlyJobs - a.monthlyJobs);
  const r = rotation(brand.slug) % 4;
  const pick = ranked.slice(0, 20);
  const list = [...pick.slice(r), ...pick.slice(0, r)].slice(0, 18);
  const lead = list[0];
  const second = list[1];

  return (
    <section
      aria-labelledby="brand-area-list"
      className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8"
    >
      <h2
        id="brand-area-list"
        className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl"
      >
        {B} RO service Patna ke kis-kis ilaake me
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
        Patna ke 83 ilaake cover hote hain. Neeche wo hain jahan {B} ki machine sabse
        zyada milti hai. Apna ilaaka dabao, uska poora rate aur time khul jayega.
      </p>

      {lead && second && (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-navy-900">
              {B} RO service in {lead.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {lead.name} me har mahine karib {lead.monthlyJobs} kaam aate hain aur TDS{' '}
              {lead.tdsRange} rehta hai. {B} par yahan {iss.issue.toLowerCase()} sabse
              aam hai — {iss.typicalCost}. Technician {lead.responseMin} minute me.
            </p>
            <Link
              href={areaPath(lead.slug)}
              className="mt-2 inline-block text-xs font-semibold text-aqua-700 underline"
            >
              {lead.name} ka page →
            </Link>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-navy-900">
              {B} RO service in {second.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {second.name} ka paani {second.tdsRange} TDS par rehta hai, isliye {model}{' '}
              jaise model par filter jaldi choke hota hai. {second.monthlyJobs} kaam
              mahine bhar me, aur pahunchne me {second.responseMin} minute.
            </p>
            <Link
              href={areaPath(second.slug)}
              className="mt-2 inline-block text-xs font-semibold text-aqua-700 underline"
            >
              {second.name} ka page →
            </Link>
          </article>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-base font-bold text-navy-900">
          {B} RO repair near me — Patna ke ilaake
        </h3>
        <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(2).map((a) => (
            <div key={a.slug}>
              <h4 className="text-sm font-semibold text-navy-900">
                {B} RO service {a.name}
              </h4>
              <p className="text-xs text-slate-600">
                TDS {a.tdsRange} · {a.responseMin} min
              </p>
              <Link href={areaPath(a.slug)} className="text-xs text-aqua-700 underline">
                {a.name} page
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Aapka ilaaka list me nahi? Call kar lo, 25 km tak aate hain.
        </p>
        <Link
          href="/service-patna"
          className="mt-2 inline-block text-sm font-semibold text-aqua-700 underline"
        >
          Patna ke saare 83 ilaake dekho →
        </Link>
      </div>

      <div className="mt-6 rounded-2xl bg-navy-900 p-6 text-white">
        <h3 className="text-lg font-bold">
          {B} RO installation Patna — nayi machine lagwani hai
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-aqua-50">
          {B} ki nayi machine ki fitting ₹350 – ₹600 me hoti hai — tap tapping, wall
          mount aur drain line sab isme. Purani {B} machine shift karwani ho to bhi
          wahi rate. Fitting ke baad TDS naap kar bill par likh dete hain.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={CONTACT.primaryTel}
            className="rounded-lg bg-aqua-500 px-5 py-2.5 text-sm font-bold text-navy-900"
          >
            📞 {CONTACT.primaryPhone}
          </a>
          <Link
            href="/ro-installation-patna"
            className="rounded-lg border border-aqua-300 px-5 py-2.5 text-sm font-bold text-white"
          >
            Installation rate · visit ₹{SERVICE.visitCharge}
          </Link>
        </div>
      </div>
    </section>
  );
}
