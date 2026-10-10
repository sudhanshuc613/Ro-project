/**
 * WHY CHOOSE GRID — par sirf wo baatein jo CHECK KI JA SAKTI HAIN.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN (9 Oct 2026)
 * ─────────────────
 * Reference site (rosale) ke "Why Choose" me 6 point hain:
 *     24/7 Service Availability · Affordable & Transparent Pricing
 *     Experienced & Verified Technicians · Fast Response Time
 *     All Brands Serviced · Best-in-Class Customer Support
 *
 * Dikkat: ye 6 ke 6 baatein koi bhi likh sakta hai, aur customer koi bhi
 * verify nahi kar sakta. "20+ years combined experience" ka koi matlab
 * nahi — 4 bande × 5 saal bhi 20 hota hai. Yahi wajah hai ki aise section
 * ko log skip kar dete hain.
 *
 * Hamara niyam: har point ke saath ek aisi cheez jo customer khud dekh
 * sake — likhit TDS reading, nikala hua purana part, bill par warranty ki
 * line, Buddha Colony ka asli pata. Ye "claim" nahi, "proof" hai.
 *
 * Data `WHY_POINTS` se aata hai (ads-landing-data.ts).
 */
import Image from 'next/image';
import { WHY_POINTS } from '@/lib/seo/ads-landing-data';
import { CONTACT, SERVICE } from '@/lib/constants';

export default function WhyChooseGrid({
  images,
}: {
  /* 10 Oct 2026 — teeno proof photo admin se badalti hain. */
  images?: Record<string, { url: string; alt: string }>;
}) {
  return (
    <section className="bg-slate-50 px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-2xl font-black text-navy-900 md:text-3xl">
          Hum Kyun &mdash; Aur Har Baat Ka Saboot
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-base text-navy-600">
          &ldquo;Best service&rdquo; har koi likh deta hai. Neeche har point ke saath{' '}
          <strong>dekh sakne layak saboot</strong> hai.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_POINTS.map((w, i) => (
            <article
              key={w.h}
              className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 font-display text-base font-black text-aqua-300">
                {i + 1}
              </span>
              <h3 className="mt-4 font-display text-base font-black text-navy-900">{w.h}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">{w.p}</p>
              <p className="mt-3 inline-flex items-start gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                <span aria-hidden="true">✓</span>
                <span>{w.proof}</span>
              </p>
            </article>
          ))}
        </div>

        {/* 🔴 9 Oct 2026 — owner: "jaha gap hai waha ache ache images laga".
            Yahan tak page sirf text tha. Ye teen ASLI kaam ki photo hain
            (stock nahi) jo pehle se site par thi par is page par nahi dikh
            rahi thi. Text ka block todti hain aur saboot bhi deti hain. */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { k: 'proofTds', src: '/service/tds-testing.jpg', cap: 'TDS naapna — har visit par, pehle aur baad', alt: 'Technician measuring TDS of RO water in Patna with a digital meter' },
            { k: 'proofMembrane', src: '/service/membrane-old-new.jpg', cap: 'Purana aur naya part saath me', alt: 'Old and new RO membrane shown side by side during replacement in Patna' },
            { k: 'proofTechnician', src: '/service/technician-working.jpg', cap: 'Kaam ghar par, aapke saamne', alt: 'Aqua Perl technician repairing a RO water purifier at a home in Patna' },
          ].map((x) => (
            <figure key={x.src} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-100">
              <div className="relative aspect-[4/3] w-full">
                <Image src={images?.[x.k]?.url || x.src} alt={images?.[x.k]?.alt || x.alt} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />
              </div>
              <figcaption className="px-3 py-2.5 text-xs font-semibold text-navy-700">{x.cap}</figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-6 rounded-3xl bg-navy-900 p-6 text-center md:p-8">
          <h3 className="font-display text-xl font-black text-white">
            Ek sawaal jo aapko har technician se poochna chahiye
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-aqua-50">
            <em>&ldquo;TDS meter laaye hain?&rdquo;</em> &mdash; Bas yahi. Input aur output TDS naape
            bina koi nahi bata sakta ki membrane gaya hai ya sirf filter choke hai. Ek membrane
            ₹1,100 ka hai, ek filter ₹120 ka. Jo bina meter ke &ldquo;membrane kharab hai&rdquo;
            bole, wo andaza laga raha hai &mdash; aur andaze ka bill aap bharte hain.
          </p>
          <a
            href={CONTACT.primaryTel}
            data-analytics="ads-why-call"
            className="mt-5 inline-block rounded-2xl bg-aqua-400 px-7 py-3.5 text-base font-black text-navy-900 transition hover:bg-aqua-300"
          >
            Call {CONTACT.primaryPhone} &mdash; ₹{SERVICE.visitCharge} visit
          </a>
        </div>
      </div>
    </section>
  );
}
