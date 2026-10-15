/**
 * EXTRA KEYWORD BLOCK — wo tarike jinse log SACH ME search karte hain.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 13 Oct 2026 — 72 keyword ka gap scan chalaya, 50 KAHIN NAHI nikle.
 * Owner ne kaha tha: *"jo maine bataya utna hi limit me mat rehna, tu bhi
 * research karna ki proper keywords kaise log search karte hain"*.
 *
 * Jo mila wo chaunkane wala tha — sabse bada gap **Hinglish** me tha, yaani
 * wo shabd jo Patna me log sach me bolte hain:
 *
 *     ro mistri patna · ro wala patna · ro thik karne wala
 *     paani ki machine theek karne wala · water purifier wala near me
 *
 * Poori site English/formal Hinglish me likhi thi ("RO technician", "RO
 * mechanic") — par aadmi Google par "ro mistri" ya "ro wala" likhta hai.
 *
 * Doosra bada gap TIME ka tha:
 *     24 hour ro service patna · sunday ro service patna
 *     emergency ro repair patna · same day ro repair patna
 *
 * Teesra SHOP ka:
 *     ro shop near me · water purifier shop near me · ro parts near me
 *
 * ── 🔴 NAYE PAGE KYU NAHI BANAYE ────────────────────────────────────────
 * In 50 keyword ke liye 50 naye page banana aasan tha. Par Google ki spam
 * policy me do naam hain — **doorway abuse** aur **scaled content abuse** —
 * aur March 2026 core update ke data me "location-based service pages
 * generated from templates" ko **30–60% traffic loss** hua. Isliye sab kuch
 * un hi page par daala gaya hai jo pehle se Google me hain.
 *
 * ── VARIANT kaunsa page par ────────────────────────────────────────────
 *   hinglish    → /ro-services-patna   (jaise log bolte hain)
 *   urgent      → /ro-services-patna   (time / jaldi)
 *   shop        → /products            (dukaan, parts)
 *   commercial  → /commercial-ro-service-patna
 *   amc         → /amc-plans
 *   problem     → /ro-problem-checker  (shikayat, Hinglish)
 *
 * ── SERVER COMPONENT · sirf ek component export ────────────────────────
 */
import Link from 'next/link';
import { CONTACT, SERVICE } from '@/lib/constants';

type Item = { h: string; p: React.ReactNode };
const V = SERVICE.visitCharge;

const HINGLISH: Item[] = [
  {
    h: 'RO service center Patna / nearest RO service center',
    p: (
      <>
        Log &ldquo;center&rdquo; aur &ldquo;centre&rdquo; dono likhte hain — dono se hum
        hi hain. Base Buddha Colony me, aur RO service centre number Patna:{' '}
        <a href={CONTACT.primaryTel} className="font-bold text-aqua-700 underline">
          {CONTACT.primaryPhone}
        </a>
        .
      </>
    ),
  },
  {
    h: 'RO mistri Patna — ghar par aane wala',
    p: (
      <>
        Log aksar &ldquo;RO mistri&rdquo; hi likhte hain. Hamare mistri Buddha Colony se
        nikalte hain aur Patna ke 83 ilaake cover karte hain. Visit ₹{V}, usme poora
        diagnosis aur TDS test shaamil hai.
      </>
    ),
  },
  {
    h: 'RO wala Patna — kaun aayega, kitne der me',
    p: (
      <>
        Call karte hi naam, ilaaka aur problem poochi jaati hai. Technician{' '}
        {SERVICE.responseTime} me pahunchne ki koshish karta hai, aur van me filter,
        membrane, SMPS aur pump pehle se rakhe rehte hain.
      </>
    ),
  },
  {
    h: 'RO thik karne wala near me — kaise parkhein',
    p: (
      <>
        Teen cheez poochho: TDS test shaamil hai? Purana nikala hua part dikhaoge? Bill
        par warranty likhi aayegi? Teeno ka jawab haan ho tabhi kaam karwao — ye hum par
        bhi laagu hota hai.
      </>
    ),
  },
  {
    h: 'Paani ki machine theek karne wala Patna',
    p: (
      <>
        RO, UV, UF, alkaline — chaaron tarah ki machine par kaam hota hai, brand koi bhi
        ho. Local assembled machine bhi banti hai, uske part standard size ke hote hain.
      </>
    ),
  },
  {
    h: 'Water purifier wala near me — rate pehle',
    p: (
      <>
        Machine kholne se pehle rate bata diya jaata hai. Filter ₹350 – ₹900, SMPS
        ₹700 – ₹1,100, pump ₹1,000 – ₹2,800, membrane ₹1,100 – ₹2,400. Aap haan bolo
        tabhi kaam shuru hota hai.
      </>
    ),
  },
  {
    h: 'RO repair wala Patna — AMC bhi milta hai',
    p: (
      <>
        Ek baar ka kaam bhi hota hai aur saal bhar ka plan bhi.{' '}
        <Link href="/amc-plans" className="font-semibold text-aqua-700 underline">
          AMC plan yahan dekho
        </Link>{' '}
        — ₹1,499 se ₹4,499 tak, kitni visit chahiye uspar.
      </>
    ),
  },
];

const URGENT: Item[] = [
  {
    h: '24 hour RO service Patna — sach kya hai',
    p: (
      <>
        Call {CONTACT.hours} ke beech uthti hai. Raat me message chhod do, subah sabse
        pehle aapka number lagta hai. Jo &ldquo;24 hour&rdquo; likhte hain unme se
        zyadatar raat 11 baje nahi uthate — hum jhooth nahi bolte.
      </>
    ),
  },
  {
    h: 'Emergency RO repair Patna — aaj hi chahiye',
    p: (
      <>
        Ghar me paani bilkul band ho to wo pehle liya jaata hai. Subah tak call aa jaye
        to usi din visit ho jaati hai, technician {SERVICE.responseTime} me pahunchta hai.
      </>
    ),
  },
  {
    h: 'Same day RO repair Patna',
    p: (
      <>
        Zyadatar kaam ek hi visit me poora hota hai kyunki filter, membrane, SMPS aur
        pump van me rehte hain. Jo part van me na ho, wo agle din subah lag jaata hai.
      </>
    ),
  },
  {
    h: 'Sunday RO service Patna — itwaar ko bhi',
    p: (
      <>
        Itwaar ko bhi visit hoti hai, wahi ₹{V} charge. Chhutti ka extra paisa nahi lagta.
        Bas subah tak bata dijiye taaki route me jud jaye.
      </>
    ),
  },
  {
    h: 'Urgent RO repair near me — kya taiyaar rakhein',
    p: (
      <>
        Call par machine ka brand, kitna purana hai, aur kya dikkat hai — teen baat bata
        dijiye. Isse sahi part van me rakha jaata hai aur doosri visit bach jaati hai.
      </>
    ),
  },
  {
    h: 'Night RO service Patna / holiday RO service Patna — sach',
    p: (
      <>
        Raat me technician nahi bhejte — andhere me fitting aur leak test theek se nahi
        hota. Chhutti aur itwaar ko kaam hota hai, wahi ₹{V} charge. Raat ka message
        subah sabse pehle liya jaata hai.
      </>
    ),
  },
  {
    h: 'RO service today near me — abhi call karo',
    p: (
      <>
        <a href={CONTACT.primaryTel} className="font-bold text-aqua-700 underline">
          {CONTACT.primaryPhone}
        </a>{' '}
        pehla number hai. Busy ho to{' '}
        <a href={`tel:+91${CONTACT.secondaryPhone}`} className="font-bold text-aqua-700 underline">
          {CONTACT.secondaryPhone}
        </a>
        . Dono par wahi team baithti hai.
      </>
    ),
  },
];

const SHOP: Item[] = [
  {
    h: 'RO shop near me — Patna me dukaan',
    p: (
      <>
        Buddha Colony me base hai, par machine ya part lene aane ki zaroorat nahi — ghar
        par pahuncha dete hain aur laga bhi dete hain.
      </>
    ),
  },
  {
    h: 'Water purifier shop near me — nayi machine',
    p: (
      <>
        Domestic 7L se 12L tak aur commercial 25 LPH se 1000+ LPH tak. Lene se pehle
        apne paani ka TDS naap lijiye, warna galat model aa jaata hai.
      </>
    ),
  },
  {
    h: 'RO parts near me — kaun sa part milta hai',
    p: (
      <>
        Sediment, carbon, membrane, SMPS, booster pump, solenoid, float valve, housing,
        tank, tubing — sab stock me rehta hai. Khali part chahiye to wo bhi milta hai.
      </>
    ),
  },
  {
    h: 'RO spare parts shop Patna — asli ya duplicate',
    p: (
      <>
        Membrane par company ka hologram aur batch number dekhiye. Bina packing ke
        membrane sasta milta hai par 6 mahine me TDS wapas chadh jaata hai.
      </>
    ),
  },
  {
    h: 'RO dealer Patna — machine + fitting ek saath',
    p: (
      <>
        Machine aur uski fitting dono ek hi jagah se ho jaye to baad me jhagda nahi hota —
        warranty kiski hai, ye saaf rehta hai.
      </>
    ),
  },
  {
    h: 'Water purifier dealer near me — Patna',
    p: (
      <>
        Machine, parts aur fitting teeno ek hi jagah. Dealer badalne par warranty ka
        jhagda hota hai, isliye ek hi jagah se karwana theek rehta hai.
      </>
    ),
  },
  {
    h: 'RO repair shop near me — ghar par hi theek',
    p: (
      <>
        Machine utha kar dukaan le jaane ki zaroorat nahi. 10 me se 9 kaam ghar par hi ho
        jaata hai, aur aap saamne dekh sakte ho kya badla gaya.
      </>
    ),
  },
];

const COMMERCIAL: Item[] = [
  {
    h: 'Industrial RO plant Patna — service aur AMC',
    p: (
      <>
        25 LPH se 1000+ LPH tak ke plant par kaam hota hai — media wash, membrane CIP,
        high-pressure pump, dosing aur control panel.
      </>
    ),
  },
  {
    h: '25 LPH RO plant Patna — kiske liye theek hai',
    p: (
      <>
        Chhoti dukaan, clinic aur office ke liye 25 LPH kaafi rehta hai. Capacity raw
        water ke TDS par bhi nirbhar karti hai, isliye quote se pehle paani ka test
        zaroori hai.
      </>
    ),
  },
  {
    h: 'Water plant service Patna — RO shop walon ke liye',
    p: (
      <>
        Paani ka plant band hone ka matlab us din ki poori bikri gayi. Breakdown call
        same-day li jaati hai, aur AMC me tay visit pehle se fix rehti hai.
      </>
    ),
  },
  {
    h: 'RO plant repair near me — kya kharab hota hai',
    p: (
      <>
        Sabse aam: high-pressure pump, pressure switch, dosing pump, solenoid aur
        pre-treatment media. Site dekh kar hi rate tay hota hai.
      </>
    ),
  },
];

const AMC: Item[] = [
  {
    h: 'Water purifier AMC near me — Patna',
    p: (
      <>
        Saal bhar ka plan jisme tay visit aur filter shaamil hain. Patna ke 400–1200 TDS
        paani par filter 4–6 mahine me badalna padta hai, isliye AMC sasta pad jaata hai.
      </>
    ),
  },
  {
    h: 'RO annual maintenance Patna — kya shaamil',
    p: (
      <>
        Tay visit, filter change, TDS setting, leak check aur breakdown response. Membrane
        alag se aata hai kyunki wo 18–24 mahine chalta hai.
      </>
    ),
  },
  {
    h: 'RO AMC Patna price — kitna padta hai',
    p: (
      <>
        ₹1,499 se ₹4,499 tak — kitni visit aur kaun se filter shaamil hain, uspar farak
        aata hai. Plan lene se pehle machine ek baar dekh lete hain.
      </>
    ),
  },
];

const PROBLEM: Item[] = [
  {
    h: 'RO se pani nahi aa raha — pehle kya dekhein',
    p: (
      <>
        Teen cheez: bijli aa rahi hai? Pump ki awaaz aa rahi hai? Inlet valve khula hai?
        Pump chup hai to SMPS (₹700 – ₹1,100), chal raha hai par paani nahi to pre-filter
        choke hai.
      </>
    ),
  },
  {
    h: 'RO me awaaz aa rahi hai — khatre ki baat?',
    p: (
      <>
        Tank bharte waqt halki gunjan normal hai. Tank bharne ke baad bhi awaaz aaye to
        float valve dekhna padega — ₹150 – ₹350 ka kaam.
      </>
    ),
  },
  {
    h: 'RO ka pani kharab lag raha hai',
    p: (
      <>
        Swaad ya badbu ki wajah 10 me se 8 baar carbon filter hoti hai — ₹180 – ₹400.
        Membrane se pehle carbon badal kar 24 ghante dekhiye.
      </>
    ),
  },
  {
    h: 'RO leakage ho raha hai — kahan se',
    p: (
      <>
        10 me se 7 case O-ring ya elbow ka hota hai, ₹20 – ₹250. Housing phata ho to
        ₹250 – ₹700. Tank se tapak raha ho to float valve ₹150 – ₹350.
      </>
    ),
  },
  {
    h: 'RO TDS zyada aa raha hai',
    p: (
      <>
        Pehle input aur output dono naapiye. Output 150 se upar jaa raha ho tabhi membrane
        ki baat hai — ₹1,100 – ₹2,400. Sirf swaad se faisla mat kijiye.
      </>
    ),
  },
  {
    h: 'RO bar bar band ho raha hai',
    p: (
      <>
        Cycling ka matlab aksar float valve ya pressure switch hai. Isse pump ki life aadhi
        ho jaati hai, isliye turant dikhwa lena theek rehta hai.
      </>
    ),
  },
  {
    h: 'RO slow pani de raha hai',
    p: (
      <>
        Dheema paani lagbhag hamesha choke sediment filter se hota hai, membrane se nahi.
        Filter ₹450 – ₹600 ka kaam hai; membrane se pehle wahi badlwaiye.
      </>
    ),
  },
];

const SETS = {
  hinglish: { items: HINGLISH, h: 'Patna me log jaise bolte hain — wahi seedha jawab', s: 'RO mistri, RO wala, paani ki machine — jo bhi likho, kaam ek hi hai.' },
  urgent: { items: URGENT, h: 'Jaldi chahiye? Time aur chutti ka sach', s: `Visit ₹${V}. Jhooth nahi bolte — jo ho sakta hai wahi likha hai.` },
  shop: { items: SHOP, h: 'Dukaan, parts aur nayi machine', s: 'Part ka akela daam aur lagakar dene ka daam alag hota hai.' },
  commercial: { items: COMMERCIAL, h: 'Commercial aur industrial plant', s: 'Site dekh kar hi quote diya jaata hai — capacity paani ke TDS par nirbhar hai.' },
  amc: { items: AMC, h: 'AMC aur saal bhar ka plan', s: `Plan lene se pehle machine ek baar dekhte hain. Visit ₹${V}.` },
  problem: { items: PROBLEM, h: 'Shikayat ke hisaab se — kya kharab ho sakta hai', s: 'Har jawab me rate range di hai. Bina dekhe koi part nahi becha jaata.' },
};

export default function ExtraKeywordBlock({
  variant,
}: {
  variant: keyof typeof SETS;
}) {
  const set = SETS[variant];
  return (
    <section
      aria-labelledby={`xkw-${variant}`}
      className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8"
    >
      <h2
        id={`xkw-${variant}`}
        className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl"
      >
        {set.h}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{set.s}</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {set.items.map((it) => (
          <article
            key={it.h}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-base font-bold text-navy-900">{it.h}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{it.p}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-navy-900 p-5 text-white">
        <p className="text-sm font-semibold">Seedha baat karni hai? Quote free hai.</p>
        <a
          href={CONTACT.primaryTel}
          className="rounded-lg bg-aqua-500 px-5 py-2.5 text-sm font-bold text-navy-900"
        >
          📞 {CONTACT.primaryPhone}
        </a>
      </div>
    </section>
  );
}
