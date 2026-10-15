/**
 * BRAND KEYWORD BLOCK — har brand page par 5 naye keyword-targeted section.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 KYUN BANAYA (12 Oct 2026) — owner ne khud pakda
 * ──────────────────────────────────────────────────
 * Owner ka sawaal tha: "sare models ke aise keywords banaye hai jaise kent ka
 * aquaguard or more?" — yaani jo kaam area pages par hua, wo brand pages par
 * hua ya nahi.
 *
 * LIVE naap (12 Oct, rokadoctor.in ke rendered HTML par):
 *
 *     21 brand × 10 pattern = 210 checks
 *     HEADING me  103  (49%)
 *     BODY me      11
 *     KAHIN NAHI   96
 *
 * Aur in 4 pattern ka haal sabse bura tha — **21 me se 21 brand par gayab**:
 *
 *     {B} service centre Patna          21/21 missing
 *     {B} RO filter change Patna        21/21 missing
 *     {B} RO membrane change Patna      21/21 missing
 *     {B} customer care Patna           21/21 missing
 *
 * Ye wahi galti thi jo area pages par thi (166/996 heading coverage), jise
 * AreaKeywordBlock ne 995/996 kiya. Yahan bhi wahi ilaaj.
 *
 * ── 🔴 DUPLICATE CONTENT SE BACHAV ──────────────────────────────────────
 * Niyam wahi jo AreaKeywordBlock me hai: **60 character se lamba koi bhi
 * vaakya bina is brand ke apne data ke nahi likha jayega** — brand.name,
 * popularModels, commonIssues ka typicalCost, partsProfile, watchOut.
 * Jo baat sach me sab brand par ek hi hai (jaise "rate pehle batate hain")
 * wo 60 character se chhoti rakhi gayi hai.
 *
 * Upar se vaakya ka dhaancha brand ke slug se nikle `v` (0/1/2) se badalta
 * hai — teen alag likhawat, taaki 21 me se har page alag padhe.
 *
 * ── KEYWORD STUFFING NAHI ───────────────────────────────────────────────
 * Har heading ke neeche asli kaam ki baat hai — kaun sa model, kaun sa part,
 * kitne mahine chalta hai, kitna rate. Khaali keyword dohraana Google ka
 * Helpful Content classifier pakad leta hai.
 *
 * ── PRICING NIYAM ───────────────────────────────────────────────────────
 * Owner ka saaf niyam: har daam RANGE me, kabhi ek-tarfa nahi.
 * Yahan ke saare rate PART_RATES wale hi hain (SMPS 700–1100, pump 1000–2800,
 * membrane 1100–2400, filter set 350–900, sediment 150–300).
 *
 * ── SERVER COMPONENT ────────────────────────────────────────────────────
 * Koi 'use client' nahi — ye poora server-rendered hai, taaki saara text
 * HTML me aaye aur Google ko dikhe. (Bug class C: client file sirf component
 * export karti hai; ye file bhi sirf ek component export karti hai.)
 */
import Link from 'next/link';
import { CONTACT, SERVICE } from '@/lib/constants';
import type { BrandServiceContent } from '@/lib/seo/patna-service-data';

/** Slug se ek sthir 0/1/2 — har brand ko hamesha wahi likhawat milti hai. */
function variantOf(slug: string): 0 | 1 | 2 {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return (h % 3) as 0 | 1 | 2;
}

/**
 * Keyword me jo naam jaayega. Do brand ka poora naam bahut lamba hai, unke
 * liye wahi chhota naam jo log sach me search karte hain.
 */
const KEYWORD_NAME: Record<string, string> = {
  'commercial-ro': 'Commercial RO plant',
  'other-brands': 'Local assembled RO',
  aquaultra: 'AquaUltra',
  aquaguard: 'Aquaguard',
  pureit: 'Pureit',
  aquasure: 'Aquasure',
  'zero-b': 'Zero B',
};

function kwName(brand: BrandServiceContent): string {
  return KEYWORD_NAME[brand.slug] ?? brand.name.split(' (')[0];
}

/**
 * Do brand ka naam itna lamba hai ki template phrase toot jaata hai —
 * "Commercial RO plant RO repair Patna" koi insaan nahi likhta.
 * Unke liye wahi phrase jo log sach me type karte hain, apne heading me.
 * (12 Oct 2026 live naap me ye 10 phrase kahin nahi the.)
 */
const EXTRA_PHRASES: Record<string, { q: string; a: string }[]> = {
  'commercial-ro': [
    {
      q: 'Commercial RO plant service Patna',
      a: 'Hotel, clinic, school aur RO shop ke 25 LPH se 1000+ LPH tak ke plant ka routine service — media wash, membrane CIP, pump aur dosing check.',
    },
    {
      q: 'Commercial RO plant repair Patna',
      a: 'Breakdown call par same-day visit. High-pressure pump, dosing pump, pressure switch, solenoid aur control panel — sab jagah ka kaam hota hai.',
    },
    {
      q: 'Commercial RO plant AMC Patna',
      a: 'Saal bhar ka contract jisme tay visit, media change aur breakdown response shaamil hai. Plant ki capacity par rate nikalta hai, isliye site dekh kar hi quote dete hain.',
    },
    {
      q: 'Commercial RO plant installation Patna',
      a: 'Naya plant lagwana ho to pehle raw water ka TDS aur hardness naapte hain, tab capacity tay hoti hai. Bina test ke capacity batane wale se bach kar rehna.',
    },
    {
      q: 'Commercial RO plant near me',
      a: 'Patna aur 25 km ke andar ke commercial site cover hote hain. Plant band ho to turant call karo, production rukne ka nuksan service se bada hota hai.',
    },
  ],
  'other-brands': [
    {
      q: 'Local assembled RO service Patna',
      a: 'Bina brand wali assembled machine bhi theek hoti hai — usme bhi wahi standard 10-inch housing, 24V SMPS aur 75/100 GPD membrane lagta hai.',
    },
    {
      q: 'Local RO repair Patna',
      a: 'Local machine ka sabse aam kaam SMPS ₹700 – ₹1,100 aur booster pump ₹1,000 – ₹2,800 ka hota hai. Dono me laga hua part 12 mahine warranty par aata hai.',
    },
    {
      q: 'Local RO service Patna',
      a: 'Bina naam wali machine par bhi wahi schedule chalta hai — saal me do baar filter aur 18–24 mahine me membrane. Local RO service Patna me hum brand poochte hi nahi, machine khol kar dekh lete hain.',
    },
    {
      q: 'Local RO AMC Patna',
      a: 'Assembled unit par AMC isliye faayde ka hai kyunki uske filter standard size ke hote hain, aur Patna ke 400–1200 TDS paani me 4–6 mahine me badalne padte hain.',
    },
    {
      q: 'Local RO installation Patna',
      a: 'Nayi assembled machine lagwani ho ya purani shift karwani ho, dono hota hai. Fitting ke baad input aur output dono ka TDS naap kar bill par likh dete hain.',
    },
    {
      q: 'Local RO service near me',
      a: 'Dukaan se lagwayi hui machine ki warranty khatam ho gayi ho to bhi hum dekh lete hain — machine kis dukaan se li hai, isse koi farak nahi padta.',
    },
  ],
};

/** commonIssues me se woh entry jisme diya hua shabd ho. */
function issueWith(brand: BrandServiceContent, words: string[]) {
  const low = (s: string) => s.toLowerCase();
  return brand.commonIssues.find((c) =>
    words.some((w) => low(c.issue).includes(w) || low(c.cause).includes(w)),
  );
}

export default function BrandKeywordBlock({ brand }: { brand: BrandServiceContent }) {
  const B = kwName(brand);
  const v = variantOf(brand.slug);
  const models = brand.popularModels.slice(0, 3);
  const modelLine = models.length ? models.join(', ') : `${B} ke aam model`;
  const topIssue = brand.commonIssues[0];
  const memIssue = issueWith(brand, ['membrane', 'tds', 'tank', 'water not', 'no water', 'output']);
  const filIssue = issueWith(brand, ['filter', 'pre-filter', 'carbon', 'sediment', 'smell', 'taste', 'flow']);

  return (
    <section
      aria-labelledby="brand-keyword-heading"
      className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8"
    >
      <h2
        id="brand-keyword-heading"
        className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl"
      >
        {B} RO service Patna — har kaam ka seedha jawab
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
        Neeche {B} ke liye wahi sawaal hain jo Patna me log sabse zyada poochte hain.
        Har jawab me rate range aur time diya hai.{' '}
        <Link href="/contact" className="font-semibold text-aqua-700 underline">
          Seedha baat karni ho to yahan
        </Link>
        .
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* ─── 1. {B} service centre Patna ─── */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-navy-900">
            {B} service centre Patna
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {v === 0 && (
              <>
                Hamara {B} service centre Patna ke {CONTACT.address.locality} me hai, aur{' '}
                {modelLine} jaise model yahin se cover hote hain. Machine dukaan par laane
                ki zaroorat nahi — technician ghar aata hai, ₹{SERVICE.visitCharge} visit
                charge me poora diagnosis aur TDS test hota hai.
              </>
            )}
            {v === 1 && (
              <>
                {B} ke liye alag se koi authorised {B} service centre Patna me dhoondhne ki
                zaroorat nahi padti — {modelLine} ka kaam hum ghar par hi kar dete hain.
                Visit ₹{SERVICE.visitCharge}, aur rate kaam shuru karne se pehle bataya
                jaata hai.
              </>
            )}
            {v === 2 && (
              <>
                Log {B} service centre Patna isliye dhoondhte hain kyunki company ka centre
                door padta hai. Hamara base {CONTACT.address.locality} me hai aur{' '}
                {modelLine} jaise {B} model par rozana kaam hota hai — machine uthani nahi
                padti.
              </>
            )}
          </p>
          <p className="mt-3 text-sm font-semibold text-navy-900">
            Visit ₹{SERVICE.visitCharge} · {SERVICE.warrantyDays} din labour warranty
          </p>
          <a
            href={CONTACT.primaryTel}
            className="mt-3 inline-block rounded-lg bg-aqua-600 px-4 py-2 text-sm font-bold text-white"
          >
            📞 {CONTACT.primaryPhone}
          </a>
        </article>

        {/* ─── 2. {B} RO filter change Patna ─── */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-navy-900">
            {B} RO filter change Patna
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {B} RO filter change Patna me saal me do baar lagta hai — borewell paani par
            sediment pre-filter 4–6 mahine me choke ho jaata hai.{' '}
            {filIssue ? (
              <>
                Is brand par sabse aam shikayat &ldquo;{filIssue.issue}&rdquo; hoti hai,
                jiski wajah {filIssue.cause.toLowerCase()} nikalti hai —{' '}
                {filIssue.typicalCost} ka kaam.
              </>
            ) : (
              <>
                Sediment filter ₹150 – ₹300, teeno filter ka set ₹350 – ₹900.
              </>
            )}
          </p>
          {brand.partsProfile && (
            <p className="mt-3 rounded-lg bg-aqua-50 p-3 text-xs leading-relaxed text-navy-800">
              {brand.partsProfile}
            </p>
          )}
          <p className="mt-3 text-xs text-slate-500">
            Purana filter dikha kar hi badalte hain.
          </p>
          {models.length > 0 && (
            <div className="mt-3 border-t border-slate-200 pt-3">
              <p className="text-xs font-semibold text-slate-500">
                Model ke hisaab se bhi:
              </p>
              <ul className="mt-1 space-y-0.5">
                {models.map((m) => (
                  <li key={m}>
                    <h4 className="text-xs font-semibold text-navy-800">
                      {m} service Patna
                    </h4>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        {/* ─── 3. {B} RO membrane change Patna ─── */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-navy-900">
            {B} RO membrane change Patna
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {v === 0 && (
              <>
                {B} RO membrane change Patna me tabhi karwana chahiye jab TDS naap kar
                dikhaya jaaye. Membrane ₹1,100 – ₹2,400 ka hota hai aur 18–24 mahine
                chalta hai — isliye bina TDS test ke koi membrane beche to mana kar dena.
              </>
            )}
            {v === 1 && (
              <>
                {B} par membrane ki asli zaroorat 18–24 mahine me aati hai, usse pehle
                nahi. {B} RO membrane change Patna ka rate ₹1,100 – ₹2,400 hai; hum pehle
                input aur output dono ka TDS naap kar aapko number dikhate hain.
              </>
            )}
            {v === 2 && (
              <>
                Patna ke 400–1200 TDS paani par {B} ka membrane 18–24 mahine nikal deta
                hai. {B} RO membrane change Patna ₹1,100 – ₹2,400 me hota hai, aur before
                /after TDS reading bill par likhi jaati hai.
              </>
            )}
          </p>
          {memIssue && (
            <p className="mt-3 text-sm text-slate-600">
              <strong className="text-navy-900">Is brand par aam:</strong>{' '}
              {memIssue.issue} — {memIssue.cause.toLowerCase()} ({memIssue.typicalCost}).
            </p>
          )}
          <p className="mt-3 text-xs font-semibold text-emerald-700">
            Laga hua part: {SERVICE.partsWarrantyMonths} mahine warranty
          </p>
        </article>

        {/* ─── 4. {B} customer care Patna ─── */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-navy-900">
            {B} customer care Patna
          </h3>
          <h4 className="mt-1 text-sm font-semibold text-aqua-700">
            {B} customer care number Patna — {CONTACT.primaryPhone}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {B} customer care Patna ka number dhoondh rahe ho to seedha hamein call kar
            sakte ho — koi IVR nahi, koi ticket number nahi.{' '}
            {brand.watchOut ? (
              <>Hum pehle ye bataate hain ki kya kharab hai, phir rate.</>
            ) : (
              <>Pehle problem batate hain, phir rate.</>
            )}
          </p>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            <li>
              📞 Pehla number:{' '}
              <a href={CONTACT.primaryTel} className="font-bold text-aqua-700">
                {CONTACT.primaryPhone}
              </a>
            </li>
            <li>
              📞 Busy ho to:{' '}
              <a href={`tel:+91${CONTACT.secondaryPhone}`} className="font-bold text-aqua-700">
                {CONTACT.secondaryPhone}
              </a>
            </li>
            <li>🕗 {CONTACT.hours}</li>
          </ul>
          {brand.watchOut && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
              <strong>⚠️ {B} par dhyan rakhna:</strong> {brand.watchOut}
            </p>
          )}
        </article>
      </div>

      {/* ─── 4b. sirf un 2 brand ke liye jinka naam lamba hai ─── */}
      {EXTRA_PHRASES[brand.slug] && (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {EXTRA_PHRASES[brand.slug].map((x) => (
            <article
              key={x.q}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <h3 className="text-base font-bold text-navy-900">{x.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{x.a}</p>
            </article>
          ))}
        </div>
      )}

      {/* ─── 5. near-me line ─── */}
      <div className="mt-6 rounded-2xl bg-navy-900 p-6 text-white">
        <h3 className="text-lg font-bold">
          {B} RO service near me — Patna me kaun aayega
        </h3>
        <h4 className="mt-1 text-sm font-semibold text-aqua-200">
          {B} service centre near me · {B} RO repair near me
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-aqua-50">
          {topIssue ? (
            <>
              &ldquo;{B} RO service near me&rdquo; Patna se search karne par aap hum tak
              pahunchte hain. Is brand par sabse zyada {topIssue.issue.toLowerCase()} ka
              kaam aata hai ({topIssue.typicalCost}), aur technician{' '}
              {SERVICE.responseTime} me pahunchne ki koshish karta hai.
            </>
          ) : (
            <>
              &ldquo;{B} RO service near me&rdquo; search karne par hum tak pahunchte ho.
              Technician {SERVICE.responseTime} me pahunchta hai.
            </>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={CONTACT.primaryTel}
            className="rounded-lg bg-aqua-500 px-5 py-2.5 text-sm font-bold text-navy-900"
          >
            📞 Abhi call karo
          </a>
          <Link
            href="/ro-services-patna"
            className="rounded-lg border border-aqua-300 px-5 py-2.5 text-sm font-bold text-white"
          >
            Poora rate card dekho
          </Link>
        </div>
      </div>
    </section>
  );
}
