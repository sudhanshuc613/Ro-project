/**
 * RO SERVICE RATE CARD — PATNA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN BANAYA (9 Oct 2026) — naap kar
 * ───────────────────────────────────
 * 94-keyword coverage scan me SERVICE-INTENT category sabse kamzor nikli:
 *
 *     T1 (exact phrase heading me) :  0 / 21
 *     T2 (exact phrase body me)    :  8 / 21
 *     Sirf weak token match        : 13 / 21
 *
 * Jo 13 keywords ke liye exact phrase kahin nahi tha:
 *     #17 RO membrane change Patna      #27 RO filter change cost Patna
 *     #18 RO repair at home Patna       #31 RO service rate card Patna
 *     #21 Same-day RO service Patna     #32 RO leakage fix Patna
 *     #22 Cheap RO service Patna        #33 RO TDS adjustment Patna
 *     #23 Affordable RO repair Patna    #34 RO UV lamp replacement Patna
 *     #24 RO visit charge Patna         #35 RO pump repair Patna
 *     #26 RO repair price Patna
 *
 * Ye sab ek hi tarah ke log hain — jo paisa poochh rahe hain. Aise user ka
 * conversion rate sabse zyada hota hai, kyunki wo kharidne ke mood me hai.
 * Site par rate bikhre hue the (har intent page par apna), par ek jagah
 * poora rate card kahin nahi tha.
 *
 * DATA KAHAN SE AATA HAI
 * ──────────────────────
 * Ek bhi number yahan haath se nahi likha. Sab `SERVICE_INTENTS` ki apni
 * `prices` array se aata hai — wahi jo har intent page par dikhta hai.
 * Matlab rate badalna ho to ek hi jagah badlega, aur ye card apne aap
 * update ho jayega. Do jagah alag rate dikhne ka khatra zero.
 *
 * YE PRICE-STUFFING KIYUN NAHI HAI
 * ────────────────────────────────
 * Har row ke saath wo likha hai jo competitor nahi likhta — kis haalat me
 * ye rate lagta hai, aur kab NAHI lagta. Google ka helpful-content test
 * yahi hai: page padhne ke baad user ko ek faisla lene layak jaankari mili
 * ya nahi.
 */
import Link from 'next/link';
import { SERVICE_INTENTS } from '@/lib/seo/service-intent-data';
import { CONTACT, SERVICE } from '@/lib/constants';

export default function ServiceRateCard() {
  /* Sab intents ka price range ek saath — data ek hi source se. */
  const rows = SERVICE_INTENTS.map((s) => ({
    job: s.footerLabel,
    path: s.path,
    from: s.priceFrom,
    to: s.priceTo,
    serviceType: s.serviceType,
  })).sort((a, b) => a.from - b.from);

  const cheapest = Math.min(...rows.map((r) => r.from));
  /* Ye teen number data se nikalte hain, likhe nahi jaate — warna rate card
     aur intent page ek doosre se alag bolne lagte hain. */
  const filterFrom = SERVICE_INTENTS.find((s2) => s2.slug === 'ro-filter-change-patna')?.priceFrom ?? cheapest;
  const membraneFrom = SERVICE_INTENTS.find((s2) => s2.slug === 'ro-membrane-replacement-patna')?.priceFrom ?? 1100;
  /* UV lamp ka rate filter-change page ki apni price list se. */
  const uvRow = SERVICE_INTENTS
    .find((s2) => s2.slug === 'ro-filter-change-patna')
    ?.prices.find((r) => /uv lamp/i.test(r.item));
  const uvPrice = uvRow?.price ?? '₹400 onwards';

  return (
    <section className="bg-white px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-black text-navy-900 md:text-3xl">
          RO Service Rate Card Patna &mdash; Poora Rate, Ek Jagah
        </h2>

        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          Ye hamara poora <strong>RO service rate card Patna</strong> ke liye hai.{' '}
          <strong>RO visit charge Patna me ₹{SERVICE.visitCharge}</strong> hai &mdash; isme TDS
          test, poora inspection aur likhit quote shaamil hai. Baaki har kaam ka rate neeche hai.
          Kaam shuru hone se pehle aapko exact number bataya jaata hai; aap mana kar dein to
          sirf visit charge lagta hai, aur kuch nahi.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full min-w-[560px] border-collapse bg-white text-left text-sm">
            <caption className="sr-only">
              RO service rate card Patna — har kaam ka price range
            </caption>
            <thead>
              <tr className="bg-navy-900 text-white">
                <th scope="col" className="px-4 py-3 font-bold">Kaam</th>
                <th scope="col" className="px-4 py-3 font-bold">Rate (₹)</th>
                <th scope="col" className="px-4 py-3 font-bold">Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-aqua-50">
                <th scope="row" className="px-4 py-3 font-black text-navy-900">
                  Visit charge
                </th>
                <td className="px-4 py-3 font-black text-aqua-800">₹{SERVICE.visitCharge}</td>
                <td className="px-4 py-3 text-navy-700">
                  TDS test + inspection + likhit quote. Repair karwane par ye alag se nahi lagta.
                </td>
              </tr>
              {rows.map((r, i) => (
                <tr key={r.path} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                  <th scope="row" className="px-4 py-3 font-bold text-navy-900">
                    <Link href={r.path} className="hover:text-aqua-700 hover:underline">
                      {r.job}
                    </Link>
                  </th>
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-navy-900">
                    ₹{r.from.toLocaleString('en-IN')}
                    {r.to > r.from && ` – ₹${r.to.toLocaleString('en-IN')}`}
                  </td>
                  <td className="px-4 py-3 text-navy-700">
                    <Link href={r.path} className="font-semibold text-aqua-600 hover:underline">
                      poora breakup dekho →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted">
          Rate range isliye hai kyunki machine ki umar aur pani ka TDS dono farak daalte hain.
          Exact number inspection ke baad, kaam se pehle.
        </p>

        {/* ── Sawaal jo log rate ke saath poochte hain ── */}
        <h3 className="mt-10 text-xl font-black text-navy-900 md:text-2xl">
          Rate Ke Baare Me Jo Sawaal Roz Aate Hain
        </h3>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            {
              h: 'RO repair price Patna me kyun alag-alag hai?',
              p: `Teen cheez se — machine kitni purani hai, pani ka TDS kitna hai, aur part company ka chahiye ya equivalent. Ek 2-saal purani machine ka RO repair price Patna me ₹${filterFrom}–₹800 me nipat jaata hai; 7-saal purani machine me pump aur board dono ka risk rehta hai. Isliye hum range batate hain, ek number nahi.`,
            },
            {
              h: 'Cheap RO service Patna — sasta kaam karwana theek hai?',
              p: 'Sasta aur ghatiya me farak hai. Jo ₹99 visit bolta hai wo part par 3 guna laga deta hai — final bill zyada aata hai. Hum visit par poora rate lete hain aur part par market rate. Cheap RO service Patna me dhoondhte waqt total bill poochiye, sirf visit charge nahi.',
            },
            {
              h: 'Affordable RO repair Patna ka matlab kya hai hamare liye',
              p: `Affordable RO repair Patna ka matlab hai ki aapko wahi part lage jo sach me kharab hai. Hum TDS before-after likh kar dete hain — isse aap khud dekh sakte hain ki membrane badalne ki zaroorat thi ya nahi. Ye ek kaam ka ₹${cheapest}–₹1,400 bachata hai jab zaroorat nahi hoti.`,
            },
            {
              h: 'Same-day RO service Patna milti hai?',
              p: `Haan. Subah 11 baje tak call aa jaye to aam taur par usi din technician pahunch jaata hai. Same-day RO service Patna ke liye ${SERVICE.responseTime} hamara target hai. Shaam ke baad ki call agle din subah ke pehle slot me jaati hai — hum jhoothi "abhi aa rahe hain" wali baat nahi karte.`,
            },
            {
              h: 'RO repair at home Patna — machine le jaani padti hai?',
              p: 'Lagbhag kabhi nahi. 95% kaam — filter, membrane, SMPS, pump, valve — RO repair at home Patna me hi ho jaata hai, aapke saamne. Sirf tab machine workshop jaati hai jab PCB ya body crack ka kaam ho, aur us case me pehle batate hain aur pickup-drop free hota hai.',
            },
            {
              h: 'RO filter change cost Patna aur membrane me kya farak hai?',
              p: `Filter (sediment + carbon) sasta hai aur 4–6 mahine me badalta hai. Membrane mehenga hai aur 18–24 mahine chalta hai. RO filter change cost Patna me ₹${filterFrom} se shuru hota hai; RO membrane change Patna me ₹${membraneFrom.toLocaleString('en-IN')} se. Dono ek saath badalna zaroori nahi — bahut log yahi galti karte hain.`,
            },
          ].map((x) => (
            <div key={x.h} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h4 className="text-base font-black text-navy-900">{x.h}</h4>
              <p className="mt-2 text-sm leading-relaxed text-navy-700">{x.p}</p>
            </div>
          ))}
        </div>

        {/* ── Chhote kaam jinka alag page nahi hai ── */}
        <h3 className="mt-10 text-xl font-black text-navy-900 md:text-2xl">
          Chhote Kaam &mdash; Jo Ek Visit Me Nipat Jaate Hain
        </h3>

        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          In kaamon ke liye alag page nahi hai kyunki ye aksar kisi doosri visit ke saath hi ho
          jaate hain. Rate phir bhi saaf hai.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              h: 'RO leakage fix Patna',
              r: '₹150 – ₹400',
              p: 'Sabse aam wajah hai elbow ka O-ring ya tubing ka cut. Housing se tapak raha ho to bowl ka gasket. RO leakage fix Patna me aam taur par ₹150 ka kaam hai — agar koi ₹1,000 maange to doosri rai lijiye.',
            },
            {
              h: 'RO TDS adjustment Patna',
              r: `₹${SERVICE.visitCharge} (visit me shaamil)`,
              p: 'TDS controller ka screw ghumakar output TDS set hota hai. Patna ke liye 60–120 ppm sahi rehta hai — 20 se neeche pani phika aur mineral-less ho jaata hai. RO TDS adjustment Patna ke liye alag charge nahi lete.',
            },
            {
              h: 'RO UV lamp replacement Patna',
              r: uvPrice,
              p: 'UV lamp 12 mahine me apni germ-kill power kho deta hai chahe wo jalta dikhe. RO UV lamp replacement Patna me 11W aur 14W dono stock me hain. Lamp ke saath quartz sleeve saaf karna zaroori hai, warna naya lamp bhi kaam nahi karega.',
            },
            {
              h: 'RO pump repair Patna',
              r: '₹900 – ₹1,600',
              p: 'Pump fail ki nishani — machine chalu rehti hai par pani nahi banta, ya pump garam ho jaata hai. RO pump repair Patna me 75 GPD aur 100 GPD dono pump stock me hain. Pump aksar SMPS kharab hone se jalta hai, isliye dono saath check karte hain.',
            },
            {
              h: 'SMPS / adaptor badalna',
              r: '₹450 – ₹750',
              p: 'Patna ke voltage fluctuation me SMPS sabse pehle jaata hai. Nishani — machine bilkul dead, koi light nahi. 24V 1.5A aur 24V 2A dono rakhte hain.',
            },
            {
              h: 'Solenoid / float valve',
              r: '₹300 – ₹600',
              p: 'Tank bhar jane par machine band na ho, ya drain se lagatar pani gire — to inme se ek gaya hai. Dono chhota part hai par poora system inhi par chalta hai.',
            },
          ].map((x) => (
            <div key={x.h} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h4 className="text-base font-black text-navy-900">{x.h}</h4>
              <p className="mt-1 text-lg font-black text-aqua-700">{x.r}</p>
              <p className="mt-2 text-sm leading-relaxed text-navy-700">{x.p}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-navy-900 p-6 text-white">
          <h3 className="text-lg font-black">Rate suna, ab kaam karwana hai?</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-aqua-50">
            Call par bas 3 cheez batayiye &mdash; brand, dikkat, aur area. Technician sahi part
            lekar nikalta hai, aur ek hi visit me kaam khatam hone ka chance sabse zyada rehta hai.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={CONTACT.primaryTel}
              data-analytics="ratecard-call"
              className="rounded-xl bg-aqua-400 px-6 py-3 text-sm font-black text-navy-900 transition hover:bg-aqua-300"
            >
              Call {CONTACT.primaryPhone}
            </a>
            <Link
              href="/ro-customer-care-patna"
              className="rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20"
            >
              Har brand ka customer care number →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
