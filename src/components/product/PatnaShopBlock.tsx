/**
 * PATNA SHOP BLOCK — /products ke neeche.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN BANAYA (9 Oct 2026) — naap kar
 * ───────────────────────────────────
 * 94-keyword coverage scan me PRODUCT / SHOP category ka natija:
 *
 *     T1 (exact phrase heading me) :  0 / 17
 *     Exact phrase kahin bhi       :  4 / 17
 *     MISS (kuch bhi nahi)         :  1 / 17   ← "RO pumps motors Patna"
 *
 * Jin 13 ke liye exact phrase site par kahin nahi tha:
 *     #37 RO purifier Patna               #46 UV UF purifier Patna
 *     #38 Buy RO purifier online Patna    #47 Under-sink RO Patna
 *     #39 RO spare parts Patna            #48 Wall-mount RO Patna
 *     #42 Genuine RO membrane Patna       #49 Commercial RO plant manufacturer Patna
 *     #43 RO purifier price Patna         #50 50 LPH RO plant Patna
 *     #44 Commercial RO plant Patna       #51 100 LPH RO plant Patna
 *     #45 Domestic RO Patna
 *
 * Wajah saaf thi: /products ek database listing page hai. Product ke naam
 * me "Patna" kabhi nahi hota, isliye page par ye phrases ban hi nahi rahe
 * the. Listing ke neeche ek asli content block chahiye tha.
 *
 * 🔴 OWNER KI PRIORITY DHYAN ME RAKHI GAYI
 * ────────────────────────────────────────
 * Owner ne saaf kaha: "bhot kam log hote hai jo parts bhi kharidte hai" —
 * e-commerce doosre number par hai, Patna ki service pehle. Isliye ye block
 * chhota hai, aur har category ke neeche service ka link hai. Jo banda
 * membrane kharidne aaya hai, usko ye bhi pata chale ki lagwa bhi sakta hai
 * — wahi ₹200 wali visit ban jaati hai.
 */
import Link from 'next/link';
import { CONTACT, SERVICE, SHIPPING } from '@/lib/constants';

export default function PatnaShopBlock() {
  return (
    <section className="mt-12 border-t border-navy-50 bg-sand-100 py-12">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl font-bold text-navy-700 md:text-3xl">
          RO Purifier Patna &mdash; Kya Milta Hai Aur Kis Rate Par
        </h2>

        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          Hum Patna me 2019 se RO service kar rahe hain, aur wahi machine bechte hain jinke part
          hamare paas stock me rehte hain. Yahi sabse badi baat hai &mdash;{' '}
          <strong>RO purifier Patna</strong> me kharidne ka matlab sirf box ghar aana nahi hai,
          balki 3 saal baad bhi uska membrane aur filter mil jaana hai. Online portal se mangai
          hui bahut si machine ka part Patna me milta hi nahi.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              h: 'Domestic RO Patna',
              p: 'Ghar ke liye 6 se 12 litre tak ki machine. Patna ke 400–1,200 ppm pani par RO zaroori hai, sirf UV ya UF kaafi nahi padta. Wall-mount RO Patna me sabse zyada bikta hai kyunki kitchen me jagah bachti hai.',
              href: '/category/new-ro-purifiers',
              label: 'Domestic RO dekho →',
            },
            {
              h: 'Under-sink RO Patna aur wall-mount RO Patna',
              p: 'Under-sink RO Patna un kitchens ke liye hai jahan counter khali rakhna ho — machine cabinet ke andar, sirf tap bahar. Wall-mount RO Patna sasta aur service karne me aasan hota hai. Dono ka installation hum hi karte hain.',
              href: '/category/new-ro-purifiers',
              label: 'Dono type dekho →',
            },
            {
              h: 'UV UF purifier Patna',
              p: 'Agar aapke ghar ka TDS 200 se kam hai to RO ki zaroorat hi nahi — UV UF purifier Patna me sasta padta hai aur pani ke mineral bachate hain. Pehle TDS napwa lijiye, phir decide kijiye. Hum galat machine nahi bechte.',
              href: '/category/new-ro-purifiers',
              label: 'UV / UF options →',
            },
            {
              h: 'RO spare parts Patna',
              p: 'Membrane, sediment, carbon, SMPS, booster pump, solenoid valve, float valve, tubing aur connector — sab stock me. RO spare parts Patna me order kijiye ya dukaan se le jaiye.',
              href: '/category/spare-parts',
              label: 'Spare parts →',
            },
            {
              h: 'Genuine RO membrane Patna',
              p: 'Genuine RO membrane Patna me 75, 80 aur 100 GPD teeno size me. Har membrane sealed pouch me aata hai jisme GPD rating aur batch number chhapa hota hai — pouch aapke saamne khulta hai.',
              href: '/category/spare-parts',
              label: 'Membrane dekho →',
            },
            {
              h: 'RO pumps motors Patna aur connectors',
              p: 'RO pumps motors Patna me 75 GPD aur 100 GPD booster pump, 24V SMPS adaptor, aur RO connectors pipes Patna ke liye 1/4" aur 3/8" ka poora fitting set — elbow, straight, ball valve, teflon.',
              href: '/category/accessories',
              label: 'Pump aur fittings →',
            },
          ].map((x) => (
            <div key={x.h} className="rounded-2xl bg-white p-5 ring-1 ring-navy-50">
              <h3 className="text-base font-black text-navy-700">{x.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{x.p}</p>
              <Link
                href={x.href}
                className="mt-2 inline-block text-sm font-bold text-aqua-600 hover:underline"
              >
                {x.label}
              </Link>
            </div>
          ))}
        </div>

        {/* ── Commercial ── */}
        <h3 className="mt-10 font-display text-xl font-bold text-navy-700 md:text-2xl">
          Commercial RO Plant Patna &mdash; Dukaan, Hotel, School Ke Liye
        </h3>

        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          Ghar ki machine aur commercial plant alag cheez hain. <strong>Commercial RO plant Patna</strong>{' '}
          me LPH (litres per hour) se size tay hota hai, litre se nahi. Chhoti dukaan ya clinic ke
          liye <strong>50 LPH RO plant Patna</strong> kaafi rehta hai; hotel, school hostel ya
          water ATM ke liye <strong>100 LPH RO plant Patna</strong> se shuru karna padta hai. Isse
          upar 250 aur 500 LPH ke frame bante hain.
        </p>

        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          Hum assemble bhi karte hain aur service bhi &mdash; yaani ek{' '}
          <strong>commercial RO plant manufacturer Patna</strong> me dhoondh rahe hain to plant
          lagwane se lekar saal bhar ke membrane cleaning tak sab ek jagah ho jaata hai. Plant ka
          size batane se pehle hum aapke feed water ka TDS naapte hain, kyunki 600 ppm aur 1,400
          ppm par pre-treatment bilkul alag lagti hai.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/category/commercial-plants"
            className="rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800"
          >
            Commercial plants dekho →
          </Link>
          <Link
            href="/commercial-ro-service-patna"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-navy-900 ring-1 ring-navy-200 hover:ring-aqua-300"
          >
            Plant service ka rate →
          </Link>
        </div>

        {/* ── Buying / price ── */}
        <h3 className="mt-10 font-display text-xl font-bold text-navy-700 md:text-2xl">
          RO Purifier Price Patna &mdash; Online Lein Ya Dukaan Se
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-50">
            <h4 className="text-base font-black text-navy-700">
              Buy RO purifier online Patna
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              Isi site se order kijiye &mdash; ₹{SHIPPING.freeAbove.toLocaleString('en-IN')} se
              upar delivery free, usse neeche ₹{SHIPPING.flatRate}. COD bhi chalta hai (₹
              {SHIPPING.codCharge} extra). Patna ke andar aam taur par usi din ya agle din
              pahunch jaata hai, kyunki stock yahin hai &mdash; kisi doosre sheher se nahi aata.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-navy-50">
            <h4 className="text-base font-black text-navy-700">
              Installation ka kya
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              Humse li hui machine par installation hum hi karte hain &mdash; wall drilling, inlet
              tapping, drain line aur TDS setting sab. Bahar se kharidi hui machine bhi laga dete
              hain, uska rate installation page par likha hai.{' '}
              <Link href="/ro-installation-patna" className="font-bold text-aqua-600 hover:underline">
                Installation ka rate →
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-navy-900 p-5 text-white">
          <p className="text-sm leading-relaxed text-aqua-50">
            <strong className="text-white">Pehle ye socho:</strong> nayi machine lene se pehle
            apni purani machine ek baar dikha lijiye. Bahut baar ₹{SERVICE.visitCharge} ki visit me
            pata chalta hai ki sirf SMPS ya pump gaya hai &mdash; ₹600 ka kaam, aur machine 3 saal
            aur chal jaati hai. Hum bina zaroorat nayi machine nahi bechte.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href={CONTACT.primaryTel}
              data-analytics="shopblock-call"
              className="rounded-xl bg-aqua-400 px-5 py-2.5 text-sm font-black text-navy-900 transition hover:bg-aqua-300"
            >
              Pehle check karwao &mdash; {CONTACT.primaryPhone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
