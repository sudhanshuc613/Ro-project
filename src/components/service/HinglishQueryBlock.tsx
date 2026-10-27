/**
 * HinglishQueryBlock — ek chhota H2 section jo Hinglish long-tail query ka
 * seedha jawab deta hai.
 *
 * Data: `src/lib/seo/hinglish-longtail.ts` (wahan poori wajah likhi hai).
 *
 * Design jaan-boojh kar `NearMeBlock` jaisa rakha hai taaki page ka look na
 * toote: same container, same card radius, same aqua accent.
 *
 * 🔴 `data-hinglish-longtail` attribute test ke liye hai — `page-by-page.py`
 *    aur `scripts/hinglish-longtail-test.py` isi se dhoondhte hain ki block
 *    sach me render hua ya nahi.
 */
import { CONTACT, SERVICE } from '@/lib/constants';
import type { HinglishBlock } from '@/lib/seo/hinglish-longtail';

export default function HinglishQueryBlock({ block }: { block: HinglishBlock }) {
  return (
    <section
      data-hinglish-longtail={block.phrase}
      aria-label={block.heading}
      className="py-10 md:py-12"
    >
      <div className="container mx-auto max-w-3xl px-4">
        <div className="rounded-2xl border border-aqua-100 bg-aqua-50/60 p-6 md:p-8">
          <h2 className="font-display text-2xl font-extrabold leading-snug text-navy-700 md:text-3xl">
            {block.heading}
          </h2>

          {/* 27 Oct 2026 — kuch query ki do spelling chalti hain
              (centre / center). Dono ko apna heading chahiye, warna doosri
              spelling sirf body me reh jaati hai. */}
          {block.altHeading && (
            <h3 className="mt-2 font-display text-lg font-bold text-navy-600">
              {block.altHeading}
            </h3>
          )}

          <p className="mt-4 text-[17px] leading-relaxed text-navy-700">{block.body}</p>

          <ul className="mt-5 space-y-2.5">
            {block.points.map((p) => (
              <li key={p.slice(0, 30)} className="flex gap-2.5 text-[15px] leading-relaxed text-navy-700">
                <span aria-hidden="true" className="mt-0.5 shrink-0 font-bold text-aqua-600">
                  ✓
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm font-semibold text-navy-600">
            Visit charge ₹{SERVICE.visitCharge} · {SERVICE.warrantyDays} din service warranty ·{' '}
            {SERVICE.partsWarrantyMonths} mahine part warranty ·{' '}
            <a
              href={CONTACT.primaryTel}
              className="font-black text-aqua-700 underline decoration-2 underline-offset-2"
            >
              {CONTACT.primaryPhone}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
