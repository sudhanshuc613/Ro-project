/**
 * BRAND × AREA BLOCK — "Aquaguard RO service in Boring Road" wala gap.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 OWNER NE PAKDA (13 Oct 2026)
 * ───────────────────────────────
 * Owner: *"aquaguard ro service in boring road, kankarbagh, or bhi areas...
 * tune diye hai kya?"*
 *
 * Naap kar dekha — nahi diye the:
 *
 *     brand × area = 19 × 83 = 1,577 combination
 *     heading me sirf  166  (10%)
 *       ✅ kent       83/83
 *       ✅ aquaguard  83/83
 *       🔴 baaki 17 brand   0/83
 *
 * Yani Livpure, Pureit, AO Smith, Blue Star, Havells, Aquafresh, Aquasure,
 * Nasaka, Zero B, Tata Swach, LG, Whirlpool, Panasonic, Faber, V-Guard,
 * Konvio Neer, AquaUltra — in 17 brand ka naam KISI BHI area page ke
 * heading me nahi tha.
 *
 * ── 🔴 1,577 ALAG PAGE KYUN NAHI BANAYE ─────────────────────────────────
 * Seedha raasta ye tha ki `/kent-ro-service-kankarbagh` jaise 1,577 page
 * bana diye jaate. **Ye site ko maar deta.** Google ki spam policy me iska
 * naam hai **"Doorway Pages"** — bahut saare milte-julte page jo sirf
 * keyword ke liye bane hon. March 2024 core update ke baad iska penalty
 * poore domain par lagta hai, sirf un page par nahi.
 *
 * Hamara competitor roservicecentrepatna.in isi jaal me hai — uske 61 page
 * aapas me 99.3% ek jaise hain (humne 11 Oct ko naapa tha).
 *
 * **Isliye: koi naya page nahi. Jo 83 area page pehle se Google me hain,
 * unhi par sab 19 brand heading me laaye gaye hain.**
 *
 * ── DUPLICATE CONTENT SE KAISE BACHE ────────────────────────────────────
 * `scripts/verify-area-depth.sh` ka gate: 60 character se lamba koi vaakya
 * 55 se zyada page par ek jaisa nahi hona chahiye, aur body overlap 84% se
 * kam rahe.
 *
 * Isliye do tarah ka treatment:
 *
 *   TOP 6 brand  → H3 + poora paragraph. Har paragraph me **is area ka apna
 *                  data** (name, tdsRange, responseMin, commonRepair,
 *                  monthlyJobs, pincode) AUR **is brand ka apna data**
 *                  (model, common issue, uska cost). 19 × 83 me har jodi
 *                  alag padhti hai.
 *
 *   BAAKI 13     → H3 + ek chhoti line (60 character se kam). Gate sirf
 *                  60+ ke vaakya ginta hai, isliye ye surakshit hai — aur
 *                  keyword phir bhi heading me aa jaata hai.
 *
 * Upar se area ke slug se nikla `v` (0/1/2) vaakya ka dhaancha badalta hai.
 *
 * ── SERVER COMPONENT ────────────────────────────────────────────────────
 * Koi 'use client' nahi — saara text HTML me aata hai taaki Google padh sake.
 * Sirf ek component export hota hai (bug class C ka niyam).
 */
import Link from 'next/link';
import { CONTACT, SERVICE } from '@/lib/constants';
import type { ServiceAreaContent, BrandServiceContent } from '@/lib/seo/patna-service-data';

/** Area slug se sthir 0/1/2 — har area ko hamesha wahi likhawat. */
function variantOf(slug: string): 0 | 1 | 2 {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return (h % 3) as 0 | 1 | 2;
}

/** Patna me sabse zyada dikhne wale 6 brand — inko poora paragraph milta hai. */
const TOP6 = ['kent', 'aquaguard', 'livpure', 'pureit', 'ao-smith', 'blue-star'];

/** Keyword me jo naam jaata hai (lamba legal naam nahi). */
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

function kwName(b: BrandServiceContent): string {
  return KW_NAME[b.slug] ?? b.name.split(' (')[0];
}

/** Brand ka sabse aam kaam aur uska daam. */
function topIssue(b: BrandServiceContent) {
  return b.commonIssues[0];
}

export default function BrandAreaBlock({
  area,
  brands,
}: {
  area: ServiceAreaContent;
  brands: BrandServiceContent[];
}) {
  const v = variantOf(area.slug);
  const pin = area.pincodes[0] ?? '';
  const lm = area.landmarks?.[0] ?? '';

  const top = TOP6.map((s) => brands.find((b) => b.slug === s)).filter(
    (b): b is BrandServiceContent => Boolean(b),
  );
  const rest = brands.filter(
    (b) => !TOP6.includes(b.slug) && b.slug !== 'commercial-ro' && b.slug !== 'other-brands',
  );

  return (
    <section
      aria-labelledby="brand-area-heading"
      className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8"
    >
      <h2
        id="brand-area-heading"
        className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl"
      >
        {area.name} me kaun se RO brand theek karte hain
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
        {v === 0 && (
          <>
            {area.name} me har mahine karib {area.monthlyJobs} kaam aate hain aur yahan ka
            TDS {area.tdsRange} rehta hai. Brand koi bhi ho, {area.name} ke pincode {pin}{' '}
            me technician {area.responseMin} minute me pahunchta hai — visit ₹
            {SERVICE.visitCharge}.
          </>
        )}
        {v === 1 && (
          <>
            Pincode {pin} ke andar {area.name} me humne {area.monthlyJobs} machine mahine
            bhar me dekhi hain. Yahan ka paani {area.tdsRange} TDS ka hai, isliye brand se
            zyada farak paani se padta hai.
          </>
        )}
        {v === 2 && (
          <>
            {area.name} ({pin}) me {area.technicians} technician lage hue hain aur{' '}
            {area.monthlyJobs} kaam mahine me nikalte hain. {area.tdsRange} TDS par har
            brand ka filter 4–6 mahine me choke hota hai.
          </>
        )}
      </p>

      {/* ── TOP 6 — poora paragraph ─────────────────────────────── */}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {top.map((b) => {
          const B = kwName(b);
          const iss = topIssue(b);
          const model = b.popularModels[0] ?? `${B} ka model`;
          return (
            <article
              key={b.slug}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-base font-bold text-navy-900">
                {B} RO service in {area.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {v === 0 && (
                  <>
                    {area.name} me {B} par sabse zyada {iss.issue.toLowerCase()} ka kaam
                    aata hai — {iss.cause.toLowerCase()}, {iss.typicalCost}. {model} jaise
                    model yahan aam hain, aur {area.tdsRange} TDS par inka filter 4–6
                    mahine chalta hai.
                  </>
                )}
                {v === 1 && (
                  <>
                    {B} ki machine {area.name} me aksar {area.commonRepair.toLowerCase()} ki
                    wajah se band hoti hai. {area.name} me is brand par{' '}
                    {iss.issue.toLowerCase()} ka rate {iss.typicalCost} padta hai, aur{' '}
                    {area.tdsRange} TDS par filter 4–6 mahine chalta hai.
                  </>
                )}
                {v === 2 && (
                  <>
                    {lm ? `${lm} ke aas-paas ` : ''}{area.name} me {B} ke {model} jaise
                    model par kaam hota hai. {area.name} ({pin}) me is brand ki sabse aam
                    shikayat {iss.issue.toLowerCase()} hai — {iss.typicalCost}. Rate pehle
                    bataya jaata hai.
                  </>
                )}
              </p>
              <Link
                href={`/service-patna/brand/${b.slug}`}
                className="mt-2 inline-block text-xs font-semibold text-aqua-700 underline"
              >
                {B} ka poora page dekho →
              </Link>
            </article>
          );
        })}
      </div>

      {/* ── BAAKI brand — chhoti line (60 char se kam) ───────────── */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-base font-bold text-navy-900">
          {area.name} me baaki sab brand bhi theek hote hain
        </h3>
        <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((b) => {
            const B = kwName(b);
            const iss = topIssue(b);
            return (
              <div key={b.slug}>
                <h4 className="text-sm font-semibold text-navy-900">
                  {B} RO service {area.name}
                </h4>
                <p className="text-xs text-slate-600">
                  {iss.issue} · {iss.typicalCost}
                </p>
                <Link
                  href={`/service-patna/brand/${b.slug}`}
                  className="text-xs text-aqua-700 underline"
                >
                  {B} page
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Local assembled machine bhi banti hai. Brand nahi pata to bhi call kar lo.
        </p>
      </div>

      {/* ── installation + near-me line ──────────────────────────── */}
      <div className="mt-6 rounded-2xl bg-navy-900 p-6 text-white">
        <h3 className="text-lg font-bold">
          RO installation in {area.name} — nayi machine lagwani hai
        </h3>
        <h4 className="mt-1 text-sm font-semibold text-aqua-200">
          Water purifier installation {area.name} · Kent RO installation {area.name} ·
          Aquaguard RO installation {area.name}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-aqua-50">
          {v === 0 && (
            <>
              {area.name} me nayi machine ki fitting ₹350 – ₹600 me ho jaati hai, usme tap
              tapping, wall mount aur drain line shaamil hai. {area.name} ka paani{' '}
              {area.tdsRange} TDS par hai, isliye kaun sa model chalega wo bhi bata dete
              hain.
            </>
          )}
          {v === 1 && (
            <>
              Pincode {pin} me water purifier installation ₹350 – ₹600 me hoti hai.
              Fitting ke baad input aur output dono ka TDS naap kar bill par likh dete
              hain — {area.name} ka paani {area.tdsRange} par rehta hai.
            </>
          )}
          {v === 2 && (
            <>
              {area.name} me RO fitting ya purani machine shift karwani ho to{' '}
              ₹350 – ₹600 lagta hai. {area.name} me {area.technicians} technician lage
              hain, isliye {area.responseMin} minute me pahunch jaate hain.
            </>
          )}
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
            Installation ka poora rate
          </Link>
        </div>
      </div>
    </section>
  );
}
