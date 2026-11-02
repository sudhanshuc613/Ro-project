/**
 * ABOUT US — /about-us
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔴 2 Nov 2026 — Google Ads account "Unacceptable business practices" ke
 * under suspend hua. Google ki policy kehti hai wo "ad, website, accounts"
 * teeno dekh kar tay karta hai ki business ASLI hai ya nahi.
 *
 * Audit me mila: site par legal naam, pata, phone sab jagah tha, PAR ek
 * saaf "About Us" page nahi tha (sirf /about/[person] ka author page tha).
 * Reviewer ke liye wahi pehli jagah hai jahan wo dekhta hai "ye kaun log
 * hain, kab se hain, karte kya hain".
 *
 * 🔴 Is page par EK BHI NAYA DAAVA nahi hai. Har number pehle se site par
 *    maujood hai: 2019 se kaam, 2,400+ unit, 83 area, ₹200 visit,
 *    30 din / 12 mahine warranty, 5.0★ rating admin se.
 *
 * URL /about-us hai, /about nahi — kyunki /about/[person] pehle se author
 * page ke liye reserve hai aur usko todna nahi tha.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';
import { getGbpSettings } from '@/lib/settings';
import { ogImage } from '@/lib/seo/og-image';
import { breadcrumbSchema, localBusinessSchema, jsonLd } from '@/lib/seo/schema';
import { SERVICE_AREAS } from '@/lib/seo/patna-service-data';
import { BRAND_DISCLAIMER } from '@/lib/seo/brand-logos';
/* 🔴 2 Nov 2026: FACTS ke 'Email' row me email plain string tha, isliye
   Cloudflare ne use /cdn-cgi/l/email-protection (HTTP 404) bana diya.
   EmailSafeText sirf us row ko badalta hai jisme '@' hai — baaki 10 row
   ka HTML bilkul wahi rehta hai. */
import EmailSafeText from '@/components/common/EmailSafeText';

export const revalidate = 86400;

const TITLE = 'About Aqua Perl — RO Service Patna Since 2019';
const DESC =
  'Aqua Perl RO Service Centre, Buddha Colony Patna. 2019 se RO repair, '
  + 'installation aur AMC. Swatantra multi-brand service — ₹200 visit charge, '
  + '30 din warranty.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/about-us' },
  openGraph: {
    title: TITLE, description: DESC,
    url: `${BRAND.url}/about-us`, type: 'website', images: ogImage(),
  },
};

const FACTS = [
  { k: 'Business ka naam', v: BRAND.legalName },
  { k: 'Kaam ka type', v: 'Proprietorship — RO / water purifier repair aur service' },
  { k: 'Proprietor', v: 'Sudhanshu Choudhary' },
  { k: 'Kab se', v: '2019' },
  { k: 'Pata', v: `${CONTACT.address.street}, ${CONTACT.address.locality}, ${CONTACT.address.city}, ${CONTACT.address.state} ${CONTACT.address.pincode}` },
  { k: 'Phone', v: `${CONTACT.primaryPhone} · ${CONTACT.secondaryPhone}` },
  { k: 'Email', v: CONTACT.email },
  { k: 'Kaam ka samay', v: CONTACT.hours },
  { k: 'Service area', v: `Patna ke ${SERVICE_AREAS.length} area` },
  { k: 'Visit charge', v: `₹${SERVICE.visitCharge} (jaanch aur TDS test shaamil)` },
  { k: 'Warranty', v: `Kaam par ${SERVICE.warrantyDays} din · laga hue part par ${SERVICE.partsWarrantyMonths} mahine` },
];

export default async function Page() {
  const gbp = await getGbpSettings();
  return (
    <>
      {/* 🔴 jsonLd() <script> ke PROPS deta hai, JSX node nahi.
          Pehli baar maine {jsonLd([...])} likh diya tha aur build fail hua:
          "Objects are not valid as a React child". Sahi tarika neeche hai —
          baaki saare page bhi yahi karte hain. */}
      <script {...jsonLd([
        localBusinessSchema(undefined, gbp),
        breadcrumbSchema([
          { name: 'Home', url: BRAND.url },
          { name: 'About Us', url: `${BRAND.url}/about-us` },
        ]),
      ])} />

      <main className="bg-white">
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex flex-wrap gap-2 px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">About Us</li>
          </ol>
        </nav>

        <section className="bg-navy-gradient py-12 text-white md:py-16">
          <div className="container mx-auto max-w-3xl px-4">
            <h1 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">
              Aqua Perl — Patna ka RO Service Centre
            </h1>
            <p className="mt-3 text-lg font-semibold text-aqua-200">
              Buddha Colony se, {new Date().getFullYear() - 2019} saal se. {SERVICE_AREAS.length} area me
              doorstep service — ₹{SERVICE.visitCharge} visit charge.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-14">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="font-display text-2xl font-extrabold text-navy-700">Hum kaun hain</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-navy-700">
              Aqua Perl ek chhota, apna RO service centre hai — Sai Gali, Buddha Colony,
              Patna me. 2019 me ek technician aur ek bike se shuru hua tha. Aaj Patna ke{' '}
              {SERVICE_AREAS.length} area me ghar-ghar jaakar RO repair, filter aur membrane
              change, nayi installation aur AMC karte hain. 2,400 se zyada machine par kaam
              kar chuke hain.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-navy-700">
              Hamara tarika seedha hai: technician aata hai, machine kholta hai, TDS naapta
              hai, aur <strong>kaam shuru karne se PEHLE rate bata deta hai</strong>. Aap mana
              kar sakte hain — tab bhi sirf ₹{SERVICE.visitCharge} visit charge lagta hai.
              Nikala hua purana part hum aapke saamne rakhte hain, aur har kaam ka bill dete hain.
            </p>

            <h2 className="mt-10 font-display text-2xl font-extrabold text-navy-700">
              Business ki poori jaankari
            </h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100">
              <table className="w-full border-collapse text-left text-sm">
                <tbody>
                  {FACTS.map((f, i) => (
                    <tr key={f.k} className={i % 2 ? 'bg-navy-50/40' : 'bg-white'}>
                      <th scope="row" className="w-2/5 px-4 py-3 align-top font-bold text-navy-700">{f.k}</th>
                      <td className="px-4 py-3 align-top text-navy-600"><EmailSafeText text={f.v} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-10 font-display text-2xl font-extrabold text-navy-700">
              Brand ke saath hamara rishta — saaf baat
            </h2>
            <div className="mt-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
              <p className="text-[17px] font-semibold leading-relaxed text-navy-800">
                {BRAND_DISCLAIMER}
              </p>
            </div>
            <p className="mt-4 text-[17px] leading-relaxed text-navy-700">
              Agar aapki machine brand ki warranty me hai to hum repair ka paisa nahi lete —
              hum aapko brand ke official service centre tak pahunchane me madad karte hain.
              Har bade brand ka official customer care number hamari{' '}
              <Link href="/ro-customer-care-patna" className="font-bold text-aqua-700 underline">
                customer care page
              </Link>{' '}
              par diya hua hai.
            </p>

            <h2 className="mt-10 font-display text-2xl font-extrabold text-navy-700">
              Hamari shartein
            </h2>
            <ul className="mt-4 space-y-2 text-[17px] leading-relaxed text-navy-700">
              <li>• Rate kaam shuru hone se pehle — baad me nahi badalta</li>
              <li>• Visit charge ₹{SERVICE.visitCharge}, isme jaanch aur TDS test shaamil</li>
              <li>• Kaam par {SERVICE.warrantyDays} din, part par {SERVICE.partsWarrantyMonths} mahine warranty</li>
              <li>• Har kaam aur har order par bill</li>
              <li>• Rating {gbp.ratingValue}★ — {gbp.reviewCount} Google review (asli, kharide hue nahi)</li>
            </ul>
            <p className="mt-6 text-[15px] text-navy-600">
              Poori shartein:{' '}
              <Link href="/terms" className="font-bold text-aqua-700 underline">Terms &amp; Conditions</Link> ·{' '}
              <Link href="/privacy-policy" className="font-bold text-aqua-700 underline">Privacy Policy</Link> ·{' '}
              <Link href="/returns-refunds" className="font-bold text-aqua-700 underline">Returns &amp; Refunds</Link> ·{' '}
              <Link href="/shipping-policy" className="font-bold text-aqua-700 underline">Shipping</Link> ·{' '}
              <Link href="/warranty-terms" className="font-bold text-aqua-700 underline">Warranty</Link>
            </p>

            <div className="mt-10 rounded-2xl bg-navy-50 p-6 text-center">
              <p className="font-display text-xl font-extrabold text-navy-700">
                Baat karni ho to seedha call kijiye
              </p>
              <a href={CONTACT.primaryTel}
                 className="mt-4 inline-block rounded-xl bg-cta-green px-7 py-3.5 font-bold text-white shadow-lg">
                📞 {CONTACT.primaryPhone}
              </a>
              <p className="mt-3 text-sm text-navy-600">{CONTACT.hours}</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
