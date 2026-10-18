/**
 * NEAR ME BLOCK — "RO service center near me" wala poora keyword cluster.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 KYUN BANAYA (11 Oct 2026) — owner ne khud pakda
 * ──────────────────────────────────────────────────
 * Owner ne Google par `RO service Center near me` search kiya aur hamari site
 * dikhi hi nahi. Maine poori site scan ki — aur wo bilkul sahi the:
 *
 *     "ro service center near me"      →  144 me se 0 page par  ❌
 *     "ro service centre near me"      →  0 page par            ❌
 *     "service center near me"         →  0 page par            ❌
 *     "ro service center in patna"     →  0 page par            ❌
 *     "water purifier service near me" →  source me sirf 1 baar
 *     "ro repair near me"              →  sirf 1 baar
 *     "ro amc near me"                 →  0
 *     "ro filter change near me"       →  0
 *
 * Aur ek aur baat: hum **"centre"** (British) likhte the — 34 baar. Jabki
 * India me log **"center"** (American) type karte hain — hamare paas sirf 4
 * baar tha. Patna ke jo competitor is query par aate hain (patnaroservice.in,
 * 24x7patnarocare.in) dono ke TITLE me "RO Service Center Patna" likha hai.
 *
 * ── 19 PATNA SITE KA LIVE AUDIT (11 Oct) — kya mila ─────────────────────
 * `"ro service center near me"` ko **kisi bhi site ne heading me nahi** rakha.
 * Sirf do jagah body me mila, aur wo dono keyword-stuffed spam pages hain.
 * Matlab ye poora cluster **khaali pada hai**.
 *
 * ── 🔴 IMAANDAR BAAT JO OWNER KO PATA HONI CHAHIYE ──────────────────────
 * "near me" wali query ka jawab Google zyadatar **Map Pack** (Business
 * Profile) se deta hai, website se nahi. Hum Map Pack me #8 par hain — isliye
 * sirf ye content daal dene se pehle number par nahi aa jayenge. Ye content
 * zaroori hai (bina iske mauka hi nahi), par asli chaabi GBP hai: reviews,
 * photos, aur "open now".
 *
 * ── CONTENT ASLI HAI, KEYWORD BHARTI NAHI ───────────────────────────────
 * Har heading ke neeche kaam ki baat hai: Patna me "near me" result kyun
 * dhokha dete hain, hamara asli pata, aur kaun sa shabd practically kya
 * maangta hai. Yahi tareeka `/ro-customer-care-patna` par chala tha.
 */
import Link from 'next/link';
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';
import { getGbpSettings } from '@/lib/settings';

/* 18 Oct 2026 — ab Google rating admin se badalti hai. Ye SERVER component hai,
   isliye khud `getGbpSettings()` padh leta hai — kisi bhi caller ko badalna nahi pada. */
export default async function NearMeBlock({
  /** Jahan area list dikhani ho wahan paas kar dein. */
  areas,
  className = '',
}: {
  areas?: { name: string; href: string }[];
  className?: string;
}) {
  const gbp = await getGbpSettings();
  const since = new Date().getFullYear() - 2019;

  return (
    <section className={`bg-white px-4 py-12 ${className}`}>
      <div className="mx-auto max-w-5xl">
        {/* ── "RO service center near me" / "centre" — dono spelling ── */}
        <h2 className="text-2xl font-black text-navy-900 md:text-3xl">
          RO Service Center Near Me &mdash; {SERVICE.city} Me Kaun Sach Me Paas Hai
        </h2>

        <p className="mt-4 max-w-3xl text-base leading-relaxed text-navy-700">
          Jab aap <strong>&ldquo;RO service center near me&rdquo;</strong> ya{' '}
          <strong>&ldquo;RO service centre near me&rdquo;</strong> search karte hain, to
          {' '}{SERVICE.city} me jo list aati hai usme aadhe number call-centre ke hote hain.
          Wo Delhi ya Noida se uthate hain, aapka number likhte hain, aur phir kisi local
          mistri ko bhej dete hain &mdash; beech me ek commission jud jaata hai aur rate
          aapko baad me pata chalta hai.
        </p>

        <div className="mt-5 rounded-2xl bg-aqua-50 p-5 ring-1 ring-aqua-200 md:p-6">
          <p className="text-sm font-black uppercase tracking-wide text-aqua-800">
            Hamara asli pata &mdash; khud verify kar lijiye
          </p>
          <p className="mt-2 text-base font-bold text-navy-900">
            {BRAND.legalName}
            <br />
            {CONTACT.address.street}, {CONTACT.address.locality}
            <br />
            {CONTACT.address.city} &mdash; {CONTACT.address.pincode}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-navy-700">
            Dukaan {CONTACT.address.locality} me hai, {since}+ saal se. Google Maps par naam
            daal ke dekh lijiye &mdash; {gbp.ratingText} star, {gbp.reviewCount} review. Call
            centre nahi hai; jo phone uthata hai wahi technician bhejta hai.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={CONTACT.primaryTel}
              className="rounded-xl bg-cta-green px-6 py-3 font-bold text-white hover:bg-cta-greenDark"
            >
              📞 {CONTACT.primaryPhone}
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${BRAND.legalName}, ${CONTACT.address.locality}, ${CONTACT.address.city}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-navy-200 px-6 py-3 font-bold text-navy-700 hover:bg-navy-50"
            >
              📍 Maps par dekhiye
            </a>
          </div>
        </div>

        {/* ── Har "near me" shabd ka practical matlab ── */}
        <h3 className="mt-10 text-xl font-black text-navy-900 md:text-2xl">
          Water Purifier Service Near Me &mdash; Kya Maangna Chahiye
        </h3>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          &ldquo;Water purifier service near me&rdquo; se aam taur par log{' '}
          <em>poori checking</em> maangte hain &mdash; filter dekhna, TDS napna, leakage
          check, tank saaf. {SERVICE.city} me hamara visit charge ₹{SERVICE.visitCharge} hai
          aur usme ye sab shaamil hai. Part lagega to uska rate alag se, kaam shuru hone se
          pehle.
        </p>

        <h3 className="mt-8 text-xl font-black text-navy-900 md:text-2xl">
          RO Repair Near Me Aur Water Purifier Repair Near Me
        </h3>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          &ldquo;Repair&rdquo; tab likha jaata hai jab machine band ho ya paani na aaye. Isme
          diagnosis pehle hota hai &mdash; {SERVICE.city} me 10 me se 6 baar wajah SMPS,
          adaptor ya choked sediment filter nikalti hai, membrane nahi. Membrane{' '}
          <strong>₹1,100 &ndash; ₹2,400</strong> ka hai aur SMPS{' '}
          <strong>₹700 &ndash; ₹1,100</strong> ka &mdash; farak bada hai, isliye diagnosis
          pehle hona chahiye.
        </p>

        <h3 className="mt-8 text-xl font-black text-navy-900 md:text-2xl">
          RO Mechanic Near Me, RO Technician Near Me
        </h3>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          {SERVICE.city} me log &ldquo;mistri&rdquo; aur &ldquo;mechanic&rdquo; zyada bolte
          hain. Hamare technician {BRAND.name} ke apne hain &mdash; freelancer nahi &mdash;
          aur gaadi me aam spare pehle se rakhte hain, isliye zyadatar kaam ek hi visit me
          khatm hota hai. Target {SERVICE.responseTime} ka hai.
        </p>

        <h3 className="mt-8 text-xl font-black text-navy-900 md:text-2xl">
          RO AMC Near Me, RO Filter Change Near Me, RO Installation Near Me
        </h3>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="font-black text-navy-900">RO AMC near me</p>
            <p className="mt-1.5 text-sm leading-relaxed text-navy-700">
              Saal bhar ka plan &mdash; ₹1,499 se ₹4,499. AMC me visit charge nahi lagta.
            </p>
            <Link href="/amc-plans" className="mt-2 inline-block text-sm font-bold text-aqua-700 underline">
              AMC plan &rarr;
            </Link>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="font-black text-navy-900">RO filter change near me</p>
            <p className="mt-1.5 text-sm leading-relaxed text-navy-700">
              Teeno filter ka set ₹350 &ndash; ₹900. {SERVICE.city} ke paani me 3&ndash;5
              mahine chalte hain.
            </p>
            <Link href="/ro-filter-change-patna" className="mt-2 inline-block text-sm font-bold text-aqua-700 underline">
              Filter rate &rarr;
            </Link>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="font-black text-navy-900">RO installation near me</p>
            <p className="mt-1.5 text-sm leading-relaxed text-navy-700">
              Nayi machine lagwani ho ya ghar shift kiya ho &mdash; pressure aur drain pehle
              check hota hai.
            </p>
            <Link href="/ro-installation-patna" className="mt-2 inline-block text-sm font-bold text-aqua-700 underline">
              Installation &rarr;
            </Link>
          </div>
        </div>

        {/* ── "RO service center in Patna" + area links ── */}
        <h3 className="mt-10 text-xl font-black text-navy-900 md:text-2xl">
          RO Service Center In {SERVICE.city} &mdash; Apne Mohalle Ka Page Kholiye
        </h3>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          &ldquo;Near me&rdquo; Google aapki location se tay karta hai, par aap seedha apne
          mohalle ka page bhi khol sakte hain. Har page par us area ka napa hua TDS, wahan
          sabse zyada kya kharab hota hai, aur pahunchne ka time likha hai.
        </p>
        {areas && areas.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {areas.map((a) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  className="inline-block rounded-full bg-navy-50 px-3.5 py-1.5 text-sm font-semibold text-navy-700 ring-1 ring-navy-100 transition hover:bg-aqua-50 hover:text-aqua-800"
                >
                  {a.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        <Link
          href="/ro-service-patna"
          className="mt-4 inline-block text-sm font-bold text-aqua-700 underline"
        >
          Poori area list dekhiye &rarr;
        </Link>

        {/* ── Honest note — spelling ── */}
        <p className="mt-8 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-200">
          <strong>Choti si baat:</strong> &ldquo;service center&rdquo; aur &ldquo;service
          centre&rdquo; &mdash; dono spelling ek hi cheez hain. Hum{' '}
          {BRAND.name} ek <strong>independent</strong> RO service centre hain, kisi brand ka
          authorised centre nahi. Ye saaf likha hai taaki baad me bhram na rahe.
        </p>
      </div>
    </section>
  );
}
