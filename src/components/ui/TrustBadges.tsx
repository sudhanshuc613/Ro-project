/**
 * TrustBadges — the reassurance strip that sits next to every call-to-action.
 *
 * Practitioners running 30-40% conversion on trades accounts are consistent on
 * one point: proof placed AT the point of decision beats proof placed on a
 * separate testimonials page. A visitor about to tap "Book Now" is at their
 * moment of maximum doubt — that is where the warranty, the response time and
 * the rating need to be, not three scrolls away.
 *
 * Server component. Pure markup, no JS cost.
 */
import { ctaTrustBadges } from '@/lib/social-proof';
import { getGbpSettings } from '@/lib/settings';

/* 18 Oct 2026 — ab Google rating admin se badalti hai. Ye SERVER component hai,
   isliye khud `getGbpSettings()` padh leta hai — kisi bhi caller ko badalna nahi pada. */
export default async function TrustBadges({
  variant = 'row',
  className = '',
}: {
  /** row = single line under a button · grid = 2×2 block beside a form */
  variant?: 'row' | 'grid';
  className?: string;
}) {
  const BADGES = ctaTrustBadges(await getGbpSettings());
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
