/* BusinessPolicyBlock — homepage ka sabse aakhri section (footer se theek upar).

   🔴 KYUN BANAYA — 28 Nov 2026
   Google Ads account AW-610913435 "Misrepresentation → Unacceptable business
   practices" ke under reject/suspend hua. Google ka apna policy text:

     "Scamming users by hiding or misrepresenting info about your business,
      products or services isn't allowed. This means you can't:
        - Make it seem like you're supported by another brand when you're not
        - Offer products or services that you don't have or can't deliver"

   Reviewer ad ke landing page (= homepage) par aata hai aur 4 cheez dhoondhta
   hai. 28 Nov ko homepage par naapa gaya — ye 4 GAYAB the:

     1. Email address            -> homepage par kahin nahi tha
     2. Malik ka naam            -> kahin nahi tha (sirf /about-us par)
     3. Domain = business link   -> "rokadoctor.in" ka naam homepage par nahi
        tha. Domain "rokadoctor.in" hai par business "Aqua Perl RO Service
        Centre" — Google isko "brand/domain mismatch" maan kar impersonation
        ke shak me suspend karta hai.
     4. Policy page ke link      -> sirf footer me the, page ke body me nahi

   Jo PEHLE SE tha wo DOBARA NAHI likha gaya:
     - BRAND_DISCLAIMER poora text BrandLogoGrid me chhapta hai (logo ke upar).
       Yahan sirf chhota restatement + /terms ka link hai. Duplicate text
       khud ek SEO problem hai, isliye bachaya.
     - Pata + phone + hours LocalMapSection me hain (directions ke liye).
       Yahan wahi CONTACT constant se dobara aata hai — identity block me
       address hona Google ki requirement hai, aur dono jagah ek hi source
       se aane ki wajah se NAP kabhi mismatch nahi ho sakta.

   KOI NAYA DAAWA NAHI JODA GAYA. Neeche likhi har baat site par pehle se
   maujood hai (Terms → Payment section, /about-us, SERVICE constants).
   Naya daawa likhna khud "unreliable claims" violation ban jaata.

   Koi image nahi, koi iframe nahi, koi client JS nahi — page-weight ~0.
*/
import Link from 'next/link';
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';
import { POLICY_LINKS } from '@/lib/seo/policy-data';
import EmailOff from '@/components/common/EmailOff';

const A = CONTACT.address;
const FULL_ADDRESS = `${A.street}, ${A.locality}, ${A.city}, ${A.state} ${A.pincode}`;

/* Identity rows — label/value. Google reviewer in 6 cheezon ko dhoondhta hai. */
const IDENTITY: { k: string; v: React.ReactNode }[] = [
  { k: 'Business name', v: BRAND.legalName },
  { k: 'Business type', v: 'Sole Proprietorship — RO / water purifier repair & service' },
  { k: 'Proprietor', v: 'Sudhanshu Choudhary' },
  /* 🟢 20 Nov 2026 — Udyam (MSME) registration, Government of India.
     Google Ads ka "Unacceptable business practices" reviewer sabse pehle
     yahi dhoondhta hai: koi SARKARI registration jo bahar se verify ho sake.
     Ye number udyamregistration.gov.in par "Verify Udyam Registration
     Number" se kisi bhi waqt check kiya ja sakta hai.

     ⚠️ SIRF NUMBER — certificate par enterprise ka naam "AQUAPERL RO BUY
     REPAIR" hai jabki site par BRAND.legalName "Aqua Perl RO Service Centre"
     hai. Dono naam saath dikhane se reviewer ko naam-mismatch dikhta, jo
     Misrepresentation case me ulta nuksan karta. Isliye naam yahan nahi. */
  { k: 'Udyam Registration (MSME)', v: 'UDYAM-BR-26-0233468' },
  { k: 'Website', v: BRAND.domain },
  { k: 'Address', v: FULL_ADDRESS },
  {
    k: 'Phone',
    v: (
      <>
        <a href={CONTACT.primaryTel} className="font-semibold text-aqua-700 hover:underline">
          {CONTACT.primaryPhone}
        </a>
        {', '}
        <a href={CONTACT.secondaryTel} className="font-semibold text-aqua-700 hover:underline">
          {CONTACT.secondaryPhone}
        </a>
      </>
    ),
  },
  {
    /* 🔴 EmailOff zaroori hai — seedha anchor likhne par Cloudflare ka
       "Email Address Obfuscation" use /cdn-cgi/l/email-protection me badal
       deta hai, jo 404 deta hai. Homepage par wo ek TOOTA link ban jaata.
       verify-seo-fixes ne ye pakda tha. Poori wajah: EmailOff.tsx ka header. */
    k: 'Email',
    v: (
      <EmailOff
        email={CONTACT.email}
        link
        linkClassName="font-semibold text-aqua-700 hover:underline"
      />
    ),
  },
    /* 🔴 28 Nov 2026 — ek "Working hours" row ko DO row me toda.
       Google Ads ka reviewer homepage par yahi table padhta hai. Pehle yahan
       sirf "Working hours: Mon–Sun 08:00–21:00" likha tha (ab 05:00–22:00), jabki Google
       Business Profile par "Open 24 hours" set tha. Do jagah do alag baat —
       aur GBP wali baat jhooth, kyunki raat ko technician nahi jaata.
       Policy ka bullet: "services that you don't have or CAN'T DELIVER."

       Ab dono jagah bilkul ek hi sach likha hai:
         VISIT  = Mon–Sun 05:00–22:00  (GBP ke Hours field me bhi yahi)
         CALL   = 24×7                 (GBP ki description me bhi yahi)
       Purana text CONTACT.hours pehli row me jyon ka tyon maujood hai. */
    { k: 'Working hours (technician visit)', v: `${CONTACT.hours} — ghar par visit sirf isi samay` },
    {
      k: 'Call & WhatsApp',
      v: `${CONTACT.callHours} — raat ki call bhi uth jaati hai aur booking ho jaati hai, lekin technician agli subah ${CONTACT.hours} ke beech hi pahunchta hai`,
    },
    { k: 'Service area', v: `${SERVICE.city}, ${SERVICE.state} (doorstep service)` },
];

/* Charges — ek-ek line Terms ke "Payment" section se match karti hai. */
const CHARGES = [
  `Visit charge ₹${SERVICE.visitCharge} — fixed. Isme jaanch aur TDS report shaamil hai.`,
  'Kaam shuru karne se pehle poora rate bataya jaata hai. Aap mana kar dein to sirf visit charge lagta hai, aur kuch nahi.',
  'Part ka paisa alag hai aur pehle hi bataya jaata hai — koi chhupa hua ya baad me lagne wala charge nahi.',
  'Paisa kaam poora hone ke BAAD liya jaata hai — cash, UPI ya online.',
  'Har payment ka bill diya jaata hai. Bina bill ke paisa mat dijiye.',
  `Repair par ${SERVICE.warrantyDays} din ki warranty, aur lage hue part par ${SERVICE.partsWarrantyMonths} mahine tak brand warranty.`,
];

const EXTRA_LINKS = [
  { label: 'About Us', href: '/about-us' },
  { label: 'Contact Us', href: '/contact' },
];

export default function BusinessPolicyBlock() {
  return (
    <section
      id="business-policy"
      aria-labelledby="business-policy-heading"
      className="border-t border-navy-100 bg-navy-50 py-14 md:py-16"
    >
      <div className="container mx-auto px-4">
        <h2
          id="business-policy-heading"
          className="mb-3 text-center font-display text-3xl font-extrabold text-navy-700"
        >
          Business Information &amp; Policies
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-navy-500">
          Hum kaun hain, paisa kitna lagta hai aur hamari policies kya hain — sab ek jagah,
          saaf-saaf likha hua.
        </p>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          {/* ── 1. Identity ─────────────────────────────────────────── */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-display text-xl font-bold text-navy-700">
              Ye website kaun chalata hai
            </h3>
            <p className="mb-4 text-[15px] leading-relaxed text-navy-600">
              <strong className="text-navy-800">{BRAND.domain}</strong> is the official website of{' '}
              <strong className="text-navy-800">{BRAND.legalName}</strong>, a sole proprietorship
              based in {A.locality}, {A.city}. Hum ek hi jagah se kaam karte hain aur poore{' '}
              {SERVICE.city} me ghar par aa kar service dete hain.
            </p>
            <dl className="divide-y divide-navy-100 border-t border-navy-100 text-[15px]">
              {IDENTITY.map((row) => (
                <div key={row.k} className="grid grid-cols-3 gap-3 py-2.5">
                  <dt className="col-span-1 font-semibold text-navy-500">{row.k}</dt>
                  <dd className="col-span-2 text-navy-800">{row.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ── 2. Brand relationship ───────────────────────────────── */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6">
              <h3 className="mb-3 font-display text-xl font-bold text-navy-800">
                Hum kisi bhi brand ke authorised centre NAHI hain
              </h3>
              <p className="mb-3 text-[15px] font-semibold leading-relaxed text-navy-800">
                {BRAND.legalName} is an independent, multi-brand water purifier repair business. We
                are <strong>not</strong> an authorised service centre, dealer, distributor,
                franchise or partner of any brand, and we are not affiliated with any brand. Brand
                names shown on this website are the property of their respective owners and are
                used only to describe the machines we repair.
              </p>
              <p className="mb-3 text-[15px] leading-relaxed text-navy-700">
                Hindi me: hum kisi bhi RO company ke authorised service centre ya dealer nahi hain.
                Aapki machine warranty me ho to hum aapko brand ka official centre bhejne me madad
                karte hain aur repair ka paisa nahi lete.
              </p>
              <Link
                href="/terms"
                className="inline-block text-[15px] font-bold text-aqua-700 underline underline-offset-2 hover:text-aqua-800"
              >
                Poori baat Terms &amp; Conditions me padhein →
              </Link>
            </div>

            {/* ── 3. Policy links ───────────────────────────────────── */}
            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-display text-xl font-bold text-navy-700">
                Hamari policies
              </h3>
              <ul className="flex flex-wrap gap-2.5">
                {[...POLICY_LINKS, ...EXTRA_LINKS].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-block rounded-lg border border-navy-200 bg-white px-3.5 py-2 text-sm font-semibold text-navy-700 transition hover:border-aqua-400 hover:text-aqua-700"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── 4. Charges ────────────────────────────────────────────── */}
        <div className="mx-auto mt-5 max-w-5xl rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-display text-xl font-bold text-navy-700">
            Paise ki saaf baat — pehle batate hain, baad me nahi
          </h3>
          <ul className="grid gap-2.5 md:grid-cols-2">
            {CHARGES.map((c) => (
              <li key={c} className="flex gap-2.5 text-[15px] leading-relaxed text-navy-700">
                <span aria-hidden="true" className="mt-0.5 font-bold text-aqua-600">
                  ✓
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
