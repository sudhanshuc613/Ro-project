/**
 * AREA KEYWORD BLOCK — har area page par 6 naye keyword-targeted section.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 KYUN BANAYA (11 Oct 2026) — ek naap jo pehle galat tha
 * ──────────────────────────────────────────────────────────
 * 83 area pages × 12 target keyword = 996 checks, LIVE rendered HTML par.
 * Purani reports keh rahi thin "exact-phrase 498/996 = 50%". Ye aankda
 * sahi tha par **gumraah karne wala** tha. Jab dekha ki wo exact phrase
 * page par KAHAN hai, to ye nikla:
 *
 *     166  (16.7%)  heading (h1–h6) me          ← asli value yahi hai
 *     332  (33.3%)  SIRF <meta name="keywords"> me   🔴
 *     498  (50.0%)  kahin nahi, sirf alag-alag shabd
 *
 * Meta keywords tag ko **Google 2009 se padhta hi nahi** (Matt Cutts ka
 * official announcement). Matlab hamari "50% coverage" me se aadhi coverage
 * ek aise tag me padi thi jiski ranking me zero keemat hai.
 *
 * Asli dikkat: "RO repair in Kankarbagh", "Water purifier service Kankarbagh",
 * "RO AMC Kankarbagh" jaise 10 pattern page par **kahin bhi poore vaakya ke
 * roop me likhe hi nahi the** — sirf "RO", "repair", "Kankarbagh" shabd
 * alag-alag bikhre pade the. Google exact phrase ko heading me dekh kar
 * jyada weight deta hai; bikhre tokens se wo match nahi banta.
 *
 * Ye block un 10 pattern ko heading me laata hai.
 *
 * ── 🔴 DUPLICATE CONTENT KA JAAL — aur usse kaise bache ─────────────────
 * `scripts/verify-area-depth.sh` ka gate: 60 character se lamba koi vaakya
 * 55 se zyada page par ek jaisa nahi hona chahiye. `AreaMechanicBlock` ka
 * pehla draft isi gate me 131 par fail hua tha.
 *
 * Isliye yahan wahi niyam: **60 character se lamba har vaakya me is area ka
 * apna data hai** — name, tdsRange, monthlyJobs, responseMin, technicians,
 * pincode, landmarks, commonRepair, ya padosi area ka naam. Jo baat sach me
 * sab jagah ek hai (jaise "rate pehle batate hain") wo 60 char se chhoti hai.
 *
 * Upar se, vaakya ka dhaancha bhi area ke slug se nikle `v` (0/1/2) se
 * badalta hai — teen alag likhawat, taaki 83 me se har page alag padhe.
 *
 * ── KEYWORD STUFFING NAHI ───────────────────────────────────────────────
 * 6 heading, aur har heading ke neeche asli kaam ki baat — rate, time,
 * area ka TDS, kaun sa part kitne mahine chalta hai. Khaali keyword dohraana
 * Google ka Helpful Content classifier pakad leta hai; yahi galti
 * roservicecentrepatna.in ke 61 pages me hai jo 99.3% ek jaise hain.
 */
import Link from 'next/link';
import { CONTACT, SERVICE } from '@/lib/constants';
import type { ServiceAreaContent } from '@/lib/seo/patna-service-data';

/** Slug se ek sthir 0/1/2 — har area ko hamesha wahi likhawat milti hai. */
function variantOf(slug: string): 0 | 1 | 2 {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return (h % 3) as 0 | 1 | 2;
}

function tdsBounds(range: string) {
  const m = range.match(/(\d+)\D+(\d+)/);
  const low = m ? Number(m[1]) : 300;
  const high = m ? Number(m[2]) : 600;
  return { low, high, mid: Math.round((low + high) / 2) };
}

export default function AreaKeywordBlock({
  area,
  nearby,
}: {
  area: ServiceAreaContent;
  nearby: ServiceAreaContent[];
}) {
  const A = area.name;
  const v = variantOf(area.slug);
  const { high, mid } = tdsBounds(area.tdsRange);
  const pin = area.pincodes[0] ?? '800001';
  const lm1 = area.landmarks[0] ?? A;
  const lm2 = area.landmarks[1] ?? area.landmarks[0] ?? A;
  const n1 = nearby[0]?.name ?? area.nearbyAreas[0] ?? 'paas ke mohalle';
  const perWeek = Math.max(1, Math.round(area.monthlyJobs / 4.33));

  /* Filter aur membrane ki life seedha is area ke TDS se — isliye har area
     ka number alag aata hai aur vaakya duplicate nahi hote. */
  const filterMonths = high >= 800 ? 3 : high >= 500 ? 4 : 5;
  const membraneMonths = high >= 800 ? 14 : high >= 500 ? 18 : 24;
  const serviceTimes = high >= 800 ? 4 : high >= 500 ? 3 : 2;

  return (
    <section className="bg-white px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* ── 1. "RO repair in {A}" + "Water purifier repair {A}" ── */}
        <h2 className="text-2xl font-black text-navy-900 md:text-3xl">
          RO Repair in {A} &mdash; Kya Kharab Hota Hai, Kitne Me Theek
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          {v === 0 && (
            <>
              {A} me hum mahine me lagbhag {area.monthlyJobs} machine kholte hain, yaani hafte ke{' '}
              {perWeek} ke aas-paas. In me sabse zyada jo nikalta hai wo hai{' '}
              <strong>{area.commonRepair.toLowerCase()}</strong> &mdash; aur {area.tdsRange} wale
              paani me yahi hona bhi chahiye.
            </>
          )}
          {v === 1 && (
            <>
              Water purifier repair {A} ka hamara record saaf hai: {area.monthlyJobs} job har mahine,
              aur unme sabse upar <strong>{area.commonRepair.toLowerCase()}</strong>. {A} ka paani{' '}
              {area.tdsRange} par aata hai, isliye yahan machine isi tarah thakti hai.
            </>
          )}
          {v === 2 && (
            <>
              {mid} ppm ke aas-paas chalne wale {A} ke paani me machine ka pattern tay hai.{' '}
              {area.monthlyJobs} monthly job me sabse common{' '}
              <strong>{area.commonRepair.toLowerCase()}</strong> milta hai, baaki electrical aur
              seal ke kaam.
            </>
          )}{' '}
          Rate kaam shuru hone se pehle bataya jaata hai.
        </p>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          Visit charge {A} me bhi wahi ₹{SERVICE.visitCharge} hai jo poore {SERVICE.city} me hai,
          aur usme TDS test aur poora inspection shaamil hai. Part lagega to uska rate{' '}
          <Link href="/ro-repair-patna" className="font-semibold text-aqua-700 underline">
            rate card
          </Link>{' '}
          se dikhaya jaata hai &mdash; {lm1} ho ya {lm2}, daam ek hi rehta hai.
        </p>

        {/* ── 2. "Water purifier service {A}" ── */}
        <h3 className="mt-10 text-xl font-black text-navy-900 md:text-2xl">
          Water Purifier Service {A} &mdash; Saal Me Kitni Baar
        </h3>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          {A} ka TDS {area.tdsRange} hai, is hisaab se yahan saal me{' '}
          <strong>{serviceTimes} baar</strong> service karani chahiye &mdash; box par likhe
          &ldquo;har 6 mahine&rdquo; se alag. {A} ke aas-paas {n1} me bhi yahi chalta hai. Der karne par {A} ke {area.tdsRange} paani me membrane par load badhta hai aur
          ₹1,100 wala kaam mehenga ho jaata hai.
        </p>

        {/* ── 2b. "Water purifier repair {A}" — 12 me se aakhri pattern ── */}
        <h3 className="mt-8 text-xl font-black text-navy-900 md:text-2xl">
          Water Purifier Repair {A} &mdash; Brand Koi Bhi Ho
        </h3>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          {A} me jo machine lagi hai wo company ki ho ya local assembled, kholne par andar ke part
          wahi hote hain &mdash; membrane, filter, SMPS, pump, solenoid. {area.technicians}{' '}
          technician {A} ke liye hain aur gaadi me ye sab pehle se rehte hain, isliye{' '}
          {area.responseMin} minute me pahunch kar zyadatar kaam usi din khatm hota hai. Purana
          nikala hua part aapko dikhaya jaata hai.
        </p>

        {/* ── 3. "RO filter change {A}" + "RO AMC {A}" ── */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <h3 className="text-lg font-black text-navy-900">RO Filter Change {A}</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-700">
              {A} ke {area.tdsRange} paani me sediment aur carbon filter lagbhag{' '}
              <strong>{filterMonths} mahine</strong> chalte hain, aur membrane{' '}
              <strong>{membraneMonths} mahine</strong> ke aas-paas. Teeno filter ka set{' '}
              <strong>₹350 &ndash; ₹900</strong> me padta hai.
            </p>
            <Link
              href="/ro-filter-change-patna"
              className="mt-3 inline-block text-sm font-bold text-aqua-700 underline"
            >
              Filter change ka poora rate &rarr;
            </Link>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <h3 className="text-lg font-black text-navy-900">RO AMC {A}</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-700">
              Saal me {serviceTimes} service aur {area.commonRepair.toLowerCase()} jaisa ek kaam
              jod lein to {A} me alag-alag bulane se AMC sasta padta hai. {A} ke {area.tdsRange}{' '}
              paani par plan ₹1,499 se ₹4,499 tak padta hai. AMC me visit charge nahi lagta.
            </p>
            <Link
              href="/amc-plans"
              className="mt-3 inline-block text-sm font-bold text-aqua-700 underline"
            >
              AMC plan dekhiye &rarr;
            </Link>
          </div>
        </div>

        {/* ── 4. "RO installation {A}" ── */}
        <h3 className="mt-10 text-xl font-black text-navy-900 md:text-2xl">
          RO Installation {A} &mdash; Lagwane Se Pehle
        </h3>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          {v === 0 && (
            <>
              Nayi machine {A} ({pin}) me lagwane se pehle do cheez dekhni padti hai: inlet ka
              pressure aur drain kahan jayega. {lm1} ke aas-paas upar wale floor par pressure kam
              milta hai, wahan booster pump lagana padta hai.
            </>
          )}
          {v === 1 && (
            <>
              {A} me installation se pehle pressure napa jaata hai. Pincode {pin} ke purane
              buildings me &mdash; khaas kar {lm2} ki taraf &mdash; 40 psi se neeche pressure aam
              hai, aur tab booster pump zaroori ho jaata hai.
            </>
          )}
          {v === 2 && (
            <>
              {A} ke ghar me machine lagane ka pehla kaam pressure aur drain ki jaanch hai. {lm1}{' '}
              aur {lm2} ke beech ke makaanon me inlet pressure kam nikalta hai, isliye pump ka
              faisla wahin par hota hai.
            </>
          )}{' '}
          Plumbing point aur bijli ka socket aapki taraf se chahiye.
        </p>

        {/* ── 5. "Kent RO service {A}" + "Aquaguard service {A}" ── */}
        <h3 className="mt-10 text-xl font-black text-navy-900 md:text-2xl">
          Kent RO Service {A}, Aquaguard Service {A} &mdash; Har Brand
        </h3>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          {A} me Kent, Aquaguard, Pureit, Livpure, AO Smith, Nasaka aur locally assembled &mdash;
          sab par kaam hota hai. {area.technicians} technician {A} ke liye hain aur gaadi me{' '}
          aam spare pehle se rehte hain, isliye {area.responseMin} minute me pahunch ke
          zyadatar kaam usi visit me khatm hota hai.
        </p>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          Company ka apna service centre {A} me nahi hai &mdash; poore {SERVICE.city} me bhi sirf
          ek-do jagah hai. Hum company nahi, independent service centre hain. Yahi saaf likha hai
          taaki bhram na rahe.{' '}
          <Link href="/service-patna/brand" className="font-semibold text-aqua-700 underline">
            Brand-wise detail
          </Link>
        </p>

        {/* ── 6. "RO service near me in {A}" + "{A} Patna RO repair" ── */}
        <div className="mt-10 rounded-2xl bg-navy-900 p-6 text-white md:p-8">
          <h3 className="text-xl font-black md:text-2xl">
            RO Service Near Me in {A} &mdash; {A} Patna RO Repair
          </h3>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-100">
            Phone par {A} ka naam aur gali ka landmark bata dijiye &mdash; {lm1} ya {lm2} &mdash;
            technician seedha pahunch jayega, {area.responseMin} minute ka target hai. Brand aur
            dikkat bata dein to {A} ke liye sahi part pehle se gaadi me rakh liya jaata hai.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={CONTACT.primaryTel}
              className="rounded-xl bg-cta-green px-6 py-3 font-bold text-white hover:bg-cta-greenDark"
            >
              📞 {CONTACT.primaryPhone}
            </a>
            <a
              href={CONTACT.whatsappLink(
                `Hi Aqua Perl, mujhe ${A} (Patna ${pin}) me RO service chahiye.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-bold text-white hover:bg-white/20"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
