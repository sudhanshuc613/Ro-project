/**
 * REVIEW TRACKER — the one number on the dashboard that is not about money.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Every previous session ended with the same finding: the website is ahead of
 * every Patna competitor on words (5,502 vs 2,285), on schema (60 vs 17) and
 * on speed, and yet the remaining ranking gap is not on the website at all.
 *
 * Whitespark's 2026 study, home services segment:
 *
 *     Proximity   42%   ← cannot be changed
 *     Reviews     36%   ← 44 today
 *     GBP signals 32%
 *     On-page     19%   ← where all the code went
 *
 * The problem with a fact stated in a document is that the document gets read
 * once. This puts the number on the screen the owner opens every morning, next
 * to the revenue figures, with the gap expressed as jobs rather than as an
 * abstraction — because "68 completed jobs asked properly" is actionable and
 * "you need 106 more reviews" is just discouraging.
 *
 * Honesty rule: `current` comes from GBP.reviewCount in constants.ts, which is
 * the REAL figure from the profile. It is not inferred, not estimated, and it
 * is never rounded up. An earlier version of this site shipped reviewCount 312
 * in schema against 44 real reviews; that is exactly the kind of thing Google's
 * July 2026 review-spam update issues site-wide manual actions for.
 */
import { GBP, GBP_RATING_TEXT } from '@/lib/constants';
import { reviewProgress, REVIEW_TARGET } from '@/lib/reviews/review-request';

export default function ReviewTracker({
  completedThisMonth,
}: {
  /** Completed jobs in the last 30 days — the pool of people who can be asked. */
  completedThisMonth: number;
}) {
  const p = reviewProgress(GBP.reviewCount);

  /* At ~27% conversion on ask + one follow-up, how long the gap takes to close
     at the current job rate. Shown only when there is a real job flow to
     extrapolate from, because a projection off two jobs is noise. */
  const monthsToTarget =
    completedThisMonth >= 5
      ? Math.ceil(p.remaining / Math.max(1, completedThisMonth * 0.27))
      : null;

  return (
    <div className="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-yellow-700">
            Google Reviews · local ranking ka 36%
          </p>
          <p className="tnum mt-1 font-display text-3xl font-extrabold leading-none text-navy-700">
            {p.current}
            <span className="ml-1 text-lg font-bold text-muted">/ {REVIEW_TARGET}</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            {GBP_RATING_TEXT}★ rating · {p.remaining} aur chahiye
          </p>
        </div>
        <span className="text-3xl" aria-hidden="true">⭐</span>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-yellow-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all"
          style={{ width: `${p.percent}%` }}
        />
      </div>

      <div className="mt-3 space-y-1.5 text-xs leading-relaxed text-navy-600">
        <p>
          <strong className="text-navy-700">Roz 1 minute:</strong> jo kaam poora
          hua, uske saamne <span className="font-bold text-yellow-700">⭐ Review maango</span>{' '}
          button dabao. Message likha hua hai — bas send karna hai.
        </p>

        {monthsToTarget !== null ? (
          <p>
            Pichhle 30 din me <strong>{completedThisMonth} kaam</strong> poore hue.
            Agar har ek se maanga jaye to <strong>{REVIEW_TARGET}</strong> tak
            pahunchne me lagbhag <strong>{monthsToTarget} mahina</strong> lagega.
          </p>
        ) : (
          <p>
            Har poore hue kaam se maango. Lagbhag har 4 me se 1 customer likh
            deta hai — {p.remaining} reviews ke liye ~{p.jobsNeeded} kaam.
          </p>
        )}

        <p className="rounded-lg bg-white/70 px-2.5 py-1.5 text-[11px] text-navy-700">
          Website ka kaam <strong>19%</strong> hai aur usme hum sabse aage hain.
          Ye <strong>36%</strong> hai — aur sirf yahi bacha hai.
        </p>
      </div>

      <a
        href="/admin/service-requests?status=COMPLETED"
        className="mt-3 block rounded-lg bg-yellow-500 px-3 py-2 text-center text-xs font-bold text-white transition hover:bg-yellow-600"
      >
        Poore hue kaam dekho → review maango
      </a>
    </div>
  );
}
