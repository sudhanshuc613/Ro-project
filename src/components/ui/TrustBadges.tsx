/**
 * TrustBadges — the reassurance strip that sits next to every call-to-action.
 *
 * Practitioners running 30-40% conversion on trades accounts are consistent on
 * one point: proof placed AT the point of decision beats proof placed on a
 * separate testimonials page. A visitor about to tap "Book Now" is at their
 * moment of maximum doubt — that is where the warranty, the response time and
 * the rating need to be, not three scrolls away.
 *
 * Pure markup, no JS cost.
 */
import { ctaTrustBadges } from '@/lib/social-proof';
import { GBP_FALLBACK, type GbpValues } from '@/lib/seo/gbp-overrides';

/* 🔴 18 Oct 2026 — YE COMPONENT `async` NAHI HO SAKTA. Meri galti thi.
   ─────────────────────────────────────────────────────────────────────────
   Rating admin-editable karte waqt maine ise `async` bana ke andar hi
   `await getGbpSettings()` kar diya tha — taaki kisi caller ko chhuna na pade.
   7 caller server page hain, wahan chalta bhi tha.

   Par 8va caller `components/home/QuickBookForm.tsx` hai, jo `'use client'`
   hai. React me ek CLIENT component ke andar ASYNC SERVER component render
   nahi ho sakta — browser me seedha
       "Application error: a client-side exception has occurred"
   aata hai. Owner ko /ro-services-patna aur /service-patna par yahi dikha.

   🔴 Server HTML phir bhi HTTP 200 deta hai, isliye curl/crawl wale saare
      test PASS ho rahe the. Ye galti SIRF asli browser me dikhti hai.
      Isliye ab `scripts/browser-check.mjs` bana hai (Playwright) jo har page
      ko sach me kholta hai aur console error pakadta hai.

   NIYAM: `src/components/**` me kabhi `export default async function` mat
   likho jab tak pakka na ho ki uska koi bhi caller client component nahi hai.
   Data upar se prop me lo — jaise ab ho raha hai. */
export default function TrustBadges({
  variant = 'row',
  className = '',
  gbp = GBP_FALLBACK,
}: {
  /** row = single line under a button · grid = 2×2 block beside a form */
  variant?: 'row' | 'grid';
  className?: string;
  gbp?: GbpValues;
}) {
  const BADGES = ctaTrustBadges(gbp);
  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {BADGES.map((b) => (
          <div
            key={b.text}
            className="flex items-center gap-2 rounded-lg bg-sand-200 px-2.5 py-2 text-xs font-semibold text-navy-700"
          >
            <span aria-hidden="true">{b.icon}</span>
            <span>{b.text}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-navy-600 ${className}`}>
      {BADGES.map((b) => (
        <li key={b.text} className="flex items-center gap-1.5">
          <span aria-hidden="true">{b.icon}</span>
          <span>{b.text}</span>
        </li>
      ))}
    </ul>
  );
}
