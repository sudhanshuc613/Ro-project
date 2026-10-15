/**
 * INTENT KEYWORD BLOCK — price/intent aur shop keyword ko HEADING me laata hai.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 KYUN BANAYA (12 Oct 2026)
 * ────────────────────────────
 * LIVE naap (rokadoctor.in ke rendered HTML par, 144 page):
 *
 *     94 target keyword me se
 *       62  kisi heading (h1–h4) ya title me
 *       31  SIRF body text me
 *        1  kahin nahi
 *
 * Google heading ko body se zyada weight deta hai. Area pages par yahi kaam
 * AreaKeywordBlock ne kiya tha — heading coverage 166/996 se 995/996 par
 * gayi. Brand pages par BrandKeywordBlock ne 103/210 se 202/210 kiya.
 * Ye block bacha hua teesra hissa cover karta hai: price/intent aur shop.
 *
 * ── variant='service' ───────────────────────────────────────────────────
 * 20 keyword jo /ro-services-patna par jaate hain — sab paise wale
 * (charges, price, cost, rate) aur kaam wale (leakage, TDS, UV, pump).
 *
 * ── variant='shop' ──────────────────────────────────────────────────────
 * 6 keyword jo /products par jaate hain — buy, part price, LPH plant.
 *
 * ── 🔴 NIYAM JO YAHAN MAANE GAYE ────────────────────────────────────────
 * 1. Har daam RANGE me — owner ka saaf niyam, kabhi ek-tarfa nahi.
 *    Rate wahi jo PART_RATES me hain (sediment 150–300, carbon 180–400,
 *    filter set 350–900, membrane 1100–2400, pump 1000–2800, SMPS 700–1100,
 *    solenoid 300–600, float 150–350, UV 400–1200).
 * 2. Koi naya daam nahi gadha gaya — sab pehle se site par maujood hai.
 * 3. Har heading ke neeche asli kaam ki baat, khaali keyword nahi.
 *    (Helpful Content classifier khaali dohraav pakad leta hai.)
 * 4. Server component — koi 'use client' nahi, taaki text HTML me aaye.
 * 5. Sirf ek component export hota hai (bug class C ka niyam).
 *
 * ── "Patna ka #1 RO service" JAAN-BOOJH KE NAHI DAALA ───────────────────
 * Wo keyword list me hai par wo ek DAWA hai jo saabit nahi ho sakti.
 * Google ka spam policy aur Consumer Protection Act dono me jhoothi
 * superlative dawa risk hai, aur GBP suspend bhi ho sakta hai. Uske badle
 * "Best RO repair in Patna — kaise parkhein" likha hai, jo parakhne ka
 * tareeka batata hai, apne aap ko #1 nahi bolta.
 */
import Link from 'next/link';
import { CONTACT, SERVICE } from '@/lib/constants';

type Item = { h: string; p: React.ReactNode };

const V = SERVICE.visitCharge;

const SERVICE_ITEMS: Item[] = [
  {
    h: `RO visit charge Patna`,
    p: (
      <>
        Visit charge ₹{V} hai aur usme poora diagnosis plus TDS test shaamil hai. Market
        me ₹300 – ₹400 chalta hai, aur kai jagah wo sirf aane ka paisa hota hai —
        jaanch alag se. Kaam hum tabhi shuru karte hain jab aap rate suun kar haan bolo.
      </>
    ),
  },
  {
    h: `RO service charges Patna`,
    p: (
      <>
        General service (cleaning, flushing, TDS setting) ₹350 – ₹600 me ho jaati hai,
        usme koi part nahi badalta. Part lagega to uska rate alag se pehle bataya jaata
        hai. Labour par {SERVICE.warrantyDays} din aur laga hue part par{' '}
        {SERVICE.partsWarrantyMonths} mahine ki warranty milti hai.
      </>
    ),
  },
  {
    h: `RO repair price Patna`,
    p: (
      <>
        Zyadatar repair ₹350 se ₹2,800 ke beech nikalti hai. Sabse sasta kaam sediment
        filter ₹150 – ₹300 ka hai, sabse mehnga booster pump ₹1,000 – ₹2,800 ka.
        Machine kholne se pehle number batana hamara niyam hai.
      </>
    ),
  },
  {
    h: `RO filter change cost Patna`,
    p: (
      <>
        Sediment filter ₹150 – ₹300, pre ya post carbon ₹180 – ₹400, aur teeno ka set
        ek saath lo to ₹350 – ₹900. Patna ke 400–1200 TDS paani par ye 4–6 mahine
        chalte hain, isliye saal me do baar badalna padta hai.
      </>
    ),
  },
  {
    h: `RO membrane change Patna`,
    p: (
      <>
        Membrane ₹1,100 – ₹2,400 ka hai aur 18–24 mahine chalta hai. Hum pehle input
        aur output dono ka TDS naapte hain — agar output TDS theek hai to membrane
        badalne ki zaroorat hai hi nahi, chahe flow dheema ho.
      </>
    ),
  },
  {
    h: `RO membrane price Patna`,
    p: (
      <>
        75 GPD, 80 GPD aur 100 GPD teeno ₹1,100 – ₹2,400 ki range me aate hain; farak
        company aur equivalent ka hota hai. Bina TDS reading dikhaye koi membrane beche
        to mana kar dena — ye Patna ka sabse aam overcharge hai.
      </>
    ),
  },
  {
    h: `RO installation charges Patna`,
    p: (
      <>
        Nayi machine ki fitting ₹350 – ₹600 me ho jaati hai, usme tap tapping, wall
        mount aur drain line shaamil hai. Fitting ke baad input aur output dono ka TDS
        naap kar bill par likh dete hain.
      </>
    ),
  },
  {
    h: `RO AMC price Patna`,
    p: (
      <>
        Ghar ke RO ka saal bhar ka plan ₹1,499 – ₹4,499 ke beech padta hai — kitni
        visit aur kaun se filter shaamil hain, uspar farak aata hai.{' '}
        <Link href="/amc-plans" className="font-semibold text-aqua-700 underline">
          Poore AMC plan yahan hain
        </Link>
        .
      </>
    ),
  },
  {
    h: `RO pump repair Patna`,
    p: (
      <>
        Booster pump ya motor ₹1,000 – ₹2,800 me badalta hai. Pump aksar isliye marta
        hai kyunki choke sediment filter use khaali kheenchne par majboor karta hai —
        isliye hum pump ke saath pre-filter bhi dekhte hain.
      </>
    ),
  },
  {
    h: `RO leakage fix Patna`,
    p: (
      <>
        Leakage ka 10 me se 7 case O-ring ya elbow ka hota hai — ₹20 – ₹250 ka kaam.
        Filter housing phata ho to ₹250 – ₹700. Tank se tapak raha ho to float valve
        ₹150 – ₹350 dekhna padta hai.
      </>
    ),
  },
  {
    h: `RO TDS adjustment Patna`,
    p: (
      <>
        TDS controller set karna alag se kaam hai, usme part nahi lagta. Peene ke paani
        ka TDS 80–150 theek maana jaata hai; bilkul 0 TDS achha nahi hota kyunki usme
        minerals bhi nahi bachte. Setting ke baad reading dikha dete hain.
      </>
    ),
  },
  {
    h: `RO UV lamp replacement Patna`,
    p: (
      <>
        UV lamp aur ballast ₹400 – ₹1,200 ke beech padta hai. Lamp chal rahi dikhe phir
        bhi 12 mahine baad uski UV output kaafi gir jaati hai, isliye saal me ek baar
        badalni padti hai — sirf fuse hone ka intezaar mat karo.
      </>
    ),
  },
  {
    h: `RO repair at home Patna`,
    p: (
      <>
        Machine dukaan par le jaane ki zaroorat nahi. Technician ghar par aata hai, van
        me filter, membrane, SMPS aur pump rehte hain, isliye zyadatar kaam ek hi visit
        me poora ho jaata hai.
      </>
    ),
  },
  {
    h: `Same-day RO service Patna`,
    p: (
      <>
        Subah tak call aa jaye to usi din visit ho jaati hai; technician{' '}
        {SERVICE.responseTime} me pahunchne ki koshish karta hai. Shaam ki call agle
        din subah lag jaati hai.{' '}
        <a href={CONTACT.primaryTel} className="font-semibold text-aqua-700 underline">
          {CONTACT.primaryPhone}
        </a>
      </>
    ),
  },
  {
    h: `Cheap RO service Patna`,
    p: (
      <>
        Sasta visit charge aur sasta kaam do alag cheez hain. ₹150 ki visit ke baad
        bina zaroorat ka ₹2,400 ka membrane bech dena ₹{V} ki visit se kahin mehnga
        pad jaata hai. Rate poochte waqt ye poochna ki diagnosis me kya shaamil hai.
      </>
    ),
  },
  {
    h: `Affordable RO repair Patna`,
    p: (
      <>
        Hum machine badalne ki salah tabhi dete hain jab repair ka kharcha nayi machine
        ke aadhe se upar chala jaye. Bahut baar ₹{V} ki visit me pata chalta hai ki
        sirf SMPS ₹700 – ₹1,100 gaya hai aur machine 3 saal aur chal jaati hai.
      </>
    ),
  },
  {
    h: `RO technician Patna`,
    p: (
      <>
        Hamare technician {CONTACT.address.locality} base se nikalte hain aur Patna ke
        83 area cover karte hain. Har technician ke paas TDS meter rehta hai, isliye
        dawe ke bajaye number dikhaya jaata hai.
      </>
    ),
  },
  {
    h: `RO water purifier service Patna`,
    p: (
      <>
        RO, UV, UF aur alkaline — chaaron tarah ki machine par kaam hota hai, brand koi
        bhi ho. Saal me do service aur ek membrane check Patna ke paani ke hisaab se
        sahi schedule hai.
      </>
    ),
  },
  {
    h: `Best RO repair in Patna — kaise parkhein`,
    p: (
      <>
        Teen cheez poochho: kya visit me TDS test shaamil hai, kya purana nikala hua
        part dikhaya jayega, aur kya bill par warranty likhi aayegi. Teeno ka jawab
        haan ho tabhi aage badho — ye hum par bhi laagu hota hai.
      </>
    ),
  },
  {
    h: `RO service centre Patna — ghar par hi`,
    p: (
      <>
        Alag se kisi RO service centre Patna me machine chhodne ki zaroorat nahi padti.
        Base {CONTACT.address.locality} me hai, kaam aapke ghar par hota hai, aur{' '}
        {CONTACT.hours} ke beech call uthti hai.
      </>
    ),
  },
];

const SHOP_ITEMS: Item[] = [
  {
    h: `Buy RO purifier online Patna`,
    p: (
      <>
        Machine online order karo, Patna me delivery aur fitting dono ho jaati hai.
        Fitting ₹350 – ₹600 alag se lagti hai, aur usme TDS test shaamil hai.
      </>
    ),
  },
  {
    h: `RO filter price Patna`,
    p: (
      <>
        Khali part mangwana ho to sediment ₹150 – ₹300 aur carbon ₹180 – ₹400 padta
        hai. Lagwana bhi ho to service wala rate alag hota hai kyunki usme visit aur
        fitting judti hai —{' '}
        <Link href="/ro-services-patna" className="font-semibold text-aqua-700 underline">
          poora rate card yahan
        </Link>
        .
      </>
    ),
  },
  {
    h: `RO membrane price Patna`,
    p: (
      <>
        75 GPD se 100 GPD tak ke membrane ₹1,100 – ₹2,400 ki range me milte hain.
        Membrane lene se pehle apni machine ka GPD dekh lena — galat GPD lagne par
        reject paani badh jaata hai.
      </>
    ),
  },
  {
    h: `50 LPH RO plant Patna`,
    p: (
      <>
        50 LPH plant chhoti dukaan, clinic aur office ke liye theek rehta hai. Capacity
        raw water ke TDS par bhi nirbhar karti hai, isliye quote se pehle paani ka test
        zaroori hai.
      </>
    ),
  },
  {
    h: `100 LPH RO plant Patna`,
    p: (
      <>
        100 LPH plant hotel, hostel aur chhote water plant ke liye lagta hai. Isme
        pre-treatment (sand aur carbon vessel) alag se aata hai — sirf RO skid ka daam
        poora kharcha nahi hota.
      </>
    ),
  },
  {
    h: `Commercial RO plant manufacturer Patna`,
    p: (
      <>
        Plant assemble karwana ho to 25 LPH se 1000+ LPH tak ka kaam hota hai, aur
        AMC bhi wahi team dekhti hai.{' '}
        <Link
          href="/commercial-ro-service-patna"
          className="font-semibold text-aqua-700 underline"
        >
          Commercial plant ka poora page yahan
        </Link>
        .
      </>
    ),
  },
];


/* 🔴 13 Oct 2026 — owner: "ro installation pe koi page hi nahi hai".
   Page to hai (/ro-installation-patna), par naap kar dekha to ye 6 phrase
   kisi heading me nahi the. Ab in sab ka apna H3 hai. */
const INSTALL_ITEMS: Item[] = [
  {
    h: `Water purifier installation near me`,
    p: (
      <>
        Patna aur 25 km ke andar ghar par fitting hoti hai. Technician{' '}
        {SERVICE.responseTime} me pahunchta hai, aur machine chalu karke TDS naap kar
        dikhata hai — tabhi paisa lagta hai.
      </>
    ),
  },
  {
    h: `Water purifier installation Patna`,
    p: (
      <>
        Fitting ₹350 – ₹600 me poori hoti hai: tap tapping, wall mount bracket, inlet
        aur drain line. Alag se plumber bulane ki zaroorat nahi padti.
      </>
    ),
  },
  {
    h: `RO installation cost Patna`,
    p: (
      <>
        Standard wall-mount fitting ₹350 – ₹600. Under-sink ya lambi pipe chahiye to
        tubing aur fitting ka ₹20 – ₹250 alag jud sakta hai. Rate kaam se pehle tay
        hota hai.
      </>
    ),
  },
  {
    h: `New RO installation Patna`,
    p: (
      <>
        Nayi machine kahin se bhi li ho — Amazon, dukaan ya hamse — fitting hum kar
        dete hain. Pehle paani ka TDS naapte hain, phir batate hain ki wo model is
        paani par chalega ya nahi.
      </>
    ),
  },
  {
    h: `RO fitting Patna — purani machine shift karni hai`,
    p: (
      <>
        Ghar badal rahe ho to uninstall aur dobara fitting dono hoti hai. Puraani
        tubing aur O-ring aksar badalni padti hai, wo ₹20 – ₹250 me aa jaati hai.
      </>
    ),
  },
  {
    h: `RO installation service Patna — kya-kya shaamil hai`,
    p: (
      <>
        Fitting, leak test, TDS before/after, aur chalana sikhana — sab ek hi visit me.
        Labour par {SERVICE.warrantyDays} din aur laga hue part par{' '}
        {SERVICE.partsWarrantyMonths} mahine warranty milti hai.
      </>
    ),
  },
];

export default function IntentKeywordBlock({
  variant = 'service',
}: {
  variant?: 'service' | 'shop' | 'install';
}) {
  const items =
    variant === 'shop' ? SHOP_ITEMS : variant === 'install' ? INSTALL_ITEMS : SERVICE_ITEMS;
  const heading =
    variant === 'shop'
      ? 'RO purifier aur parts Patna — daam se jude sawaal'
      : variant === 'install'
        ? 'RO installation Patna — fitting se jude seedhe jawab'
        : 'RO service Patna — rate aur kaam se jude seedhe jawab';
  const sub =
    variant === 'shop'
      ? 'Part ka akela daam aur lagakar dene ka daam alag hota hai. Dono neeche saaf likhe hain.'
      : variant === 'install'
        ? `Nayi machine lagwani ho ya purani shift karni ho — dono hota hai. Visit ₹${V}.`
        : `Har rate range me diya hai. Visit ₹${V}, aur kaam shuru karne se pehle number bata diya jaata hai.`;

  return (
    <section
      aria-labelledby={`intent-kw-${variant}`}
      className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8"
    >
      <h2
        id={`intent-kw-${variant}`}
        className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl"
      >
        {heading}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{sub}</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
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
        <p className="text-sm font-semibold">
          Rate confirm karna hai? Seedha call kar lo — quote free hai.
        </p>
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
