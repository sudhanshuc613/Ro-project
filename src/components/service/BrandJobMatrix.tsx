/**
 * BRAND JOB MATRIX — har brand page par ek naya section.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN BANAYA (9 Oct 2026) — naap kar
 * ───────────────────────────────────
 * 94-keyword coverage scan me BRAND category ka natija:
 *
 *     T1 (exact phrase heading me) :  1 / 22
 *     Exact phrase kahin bhi       : 10 / 22
 *
 * Jin 12 ke liye exact phrase site par kahin nahi tha:
 *     #55 Kent RO repair Patna            #62 Livpure RO repair Patna
 *     #56 Kent water purifier service Patna  #63 Pureit service Patna
 *     #57 Kent RO installation Patna      #64 Pureit RO repair Patna
 *     #58 Kent AMC Patna                  #65 AO Smith service Patna
 *     #60 Aquaguard RO repair Patna       #66 AO Smith RO repair Patna
 *     #61 Livpure service Patna           #75 Local RO service Patna
 *
 * Saath me NEARME se:
 *     #117 Kent RO service near me        #118 Aquaguard service near me
 *
 * Dikkat saaf thi: brand page par sirf "{Brand} RO Service in Patna" likha
 * tha. Log usse 5 alag tareeke se search karte hain — repair, water purifier
 * service, installation, AMC, aur sirf "service". Har ek alag query hai.
 *
 * YE BLOCK EK HI BAAR LIKHA, 21 BRAND PAR CHALTA HAI
 * ──────────────────────────────────────────────────
 * Har brand ka apna data andar jaata hai — uske apne commonIssues, apne
 * popularModels, apna sabse sasta fix. Isliye Kent ka block Pureit ke block
 * se padhne me alag hai, sirf naam nahi badalta.
 *
 * Competitor ke paas kya hai (live verified 9 Oct 2026):
 *     roservicecentrepatna.in → 4 brand pages (kent, pureit, livpure, ao-smith)
 *     rocareindia.com/sitemap/brand-service.xml → 28 brand pages, par
 *                                                  city-specific nahi
 *     rosaleandservices.com / rocarepoint.in / roservicepatna.in → 0
 * Hamare 21. Har brand × 6 query pattern = 126 phrase.
 */
import Link from 'next/link';
import type { BrandServiceContent } from '@/lib/seo/patna-service-data';
import { CONTACT, SERVICE } from '@/lib/constants';
import { shortBrandName } from '@/lib/seo/brand-hub';

export default function BrandJobMatrix({ brand }: { brand: BrandServiceContent }) {
  const short = shortBrandName(brand.name);
  const city = SERVICE.city;

  /* Is brand ka sabse sasta asli fix — uske apne commonIssues se. */
  const costs = brand.commonIssues
    .map((i) => parseInt(String(i.typicalCost).replace(/[^\d]/g, ''), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  const cheapest = costs.length ? Math.min(...costs) : SERVICE.visitCharge;
  const topIssue = brand.commonIssues[0];
  const models = brand.popularModels.slice(0, 4).join(', ');

  /* Chhe query pattern — jo log sach me type karte hain. Har row ka
     apna jawab hai, sirf heading ka naam nahi badalta. */
  const jobs: { h: string; p: string; href?: string; label?: string }[] = [
    {
      h: `${short} RO repair ${city}`,
      p: `Machine chalu hai par pani nahi bana raha, ya pani me swad aa gaya — ${short} RO repair ${city} me sabse zyada yahi do call aate hain. ${
        topIssue
          ? `Is brand me sabse aam fault hai ${topIssue.issue.toLowerCase()} — wajah ${topIssue.cause.toLowerCase()}, aur rate ${topIssue.typicalCost}.`
          : ''
      } Visit charge ₹${SERVICE.visitCharge}, aur rate kaam se pehle likhit.`,
      href: '/ro-repair-patna',
      label: 'RO repair ka poora rate →',
    },
    {
      h: `${short} water purifier service ${city}`,
      p: `Routine service me filter, membrane aur UV teeno check hote hain, housing khol kar saaf hoti hai, aur input-output TDS likh kar diya jaata hai. ${short} water purifier service ${city} me hum ${
        models ? `${models} jaise models` : 'har model'
      } par ye karte hain. Saal me do baar karwana sabse sasta padta hai.`,
      href: '/ro-services-patna',
      label: 'Saare services dekho →',
    },
    {
      h: `${short} RO installation ${city}`,
      p: `Nayi machine lagwani ho ya ghar shift hua ho — ${short} RO installation ${city} me wall drilling, inlet tapping, drain line aur electrical point sab shaamil hai. Galat jagah lagi machine baad me leakage aur pump failure deti hai, isliye pehle point check karte hain.`,
      href: '/ro-installation-patna',
      label: 'Installation ka rate →',
    },
    {
      h: `${short} AMC ${city}`,
      p: `${short} AMC ${city} ka matlab hai saal bhar ke filter, visits aur priority response ek fixed rate me. ${
        cheapest ? `Is brand ka sabse chhota fix ₹${cheapest} ka hai, ` : ''
      }par 3 saal se purani machine par saal bhar ka kharcha aksar AMC se upar chala jaata hai — tab plan sasta padta hai.`,
      href: '/ro-amc-patna',
      label: 'AMC plans aur rate →',
    },
    {
      h: `${short} service ${city} — aur ${short} RO service near me`,
      p: `Log dono tarah se dhoondhte hain — kabhi "${short} service ${city}" likh kar, kabhi "${short} RO service near me". Dono ka jawab ek hi hai: ${CONTACT.primaryPhone}. Hum poore ${city} me jaate hain, Buddha Colony se. Area ka naam bata dijiye, pahunchne ka time wahi se tay hota hai.`,
      href: '/service-patna',
      label: 'Apna area chuno →',
    },
    {
      h: `${short} ka part milega ya nahi`,
      p: `${
        brand.partsProfile
          ? brand.partsProfile
          : `${short} ke standard size ke filter aur membrane market me aasani se milte hain. Company part chahiye to mangwa kar lagate hain, aur equivalent chahiye to dono ka rate pehle batate hain — chunna aapka.`
      }`,
      href: '/category/spare-parts',
      label: 'Spare parts dekho →',
    },
  ];

  return (
    <section className="bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-black text-navy-900 md:text-3xl">
          {short} Ke Liye Hum Kya-Kya Karte Hain {city} Me
        </h2>

        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          Ek hi machine ke liye log paanch alag tareeke se dhoondhte hain &mdash; kabhi repair,
          kabhi service, kabhi installation, kabhi AMC. Kaam alag-alag hai, rate bhi alag. Neeche
          har ek ka seedha jawab hai, taki aap sahi cheez maang sakein aur paisa bacha sakein.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {jobs.map((j) => (
            <article key={j.h} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-black text-navy-900">{j.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-700">{j.p}</p>
              {j.href && (
                <Link
                  href={j.href}
                  className="mt-2 inline-block text-sm font-bold text-aqua-600 hover:underline"
                >
                  {j.label}
                </Link>
              )}
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h3 className="text-base font-black text-navy-900">
            {short} ke alawa &mdash; local aur generic machine
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-navy-700">
            Patna me bika hua har doosra purifier kisi brand ka nahi, assembled hota hai.{' '}
            <strong>Local RO service {city}</strong> hamara sabse bada kaam hai &mdash; bina
            sticker wali machine, bina manual wali machine, aur wo machine jiska dealer dukaan band
            kar ke chala gaya. In sabka membrane, filter, pump aur SMPS standard size ka hota hai,
            isliye inhe theek karna bilkul mushkil nahi &mdash; bas koi inhe lene se mana na kare.
            Hum nahi karte.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={CONTACT.primaryTel}
              data-analytics={`brand-matrix-call-${brand.slug}`}
              className="rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800"
            >
              Call {CONTACT.primaryPhone}
            </a>
            <Link
              href="/ro-customer-care-patna"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-navy-900 ring-1 ring-navy-200 hover:ring-aqua-300"
            >
              {short} ka official customer care number →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
