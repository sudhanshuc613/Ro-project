'use client';

/**
 * REVIEW REQUEST BUTTON — appears on every COMPLETED service request.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Reviews are 36% of local ranking weight for home services (Whitespark 2026),
 * against 19% for all on-page SEO combined. The business sits at 44 real
 * reviews. Nothing in the codebase moves that number — only asking does.
 *
 * The reason owners do not ask is friction, not unwillingness: at the end of a
 * job you would have to open WhatsApp, find the customer, remember the review
 * link, and type something that does not read like a form letter. That is four
 * steps too many when the next call is already ringing.
 *
 * This is one tap. The message is written, personalised with the customer's
 * first name and the actual work done, and the review link is embedded. It
 * opens WhatsApp with everything filled in — the owner only presses send.
 *
 * DESIGN DECISIONS WORTH KEEPING
 * ──────────────────────────────
 *  • The text is shown before sending, and is editable by copying. Nothing is
 *    sent behind the owner's back — a blind auto-sender attached to a personal
 *    WhatsApp number is how numbers get reported and banned.
 *  • "Asked" state is remembered per ticket in localStorage, so the owner can
 *    see at a glance who has already been contacted without a DB migration.
 *    It is deliberately client-side: this is a memory aid, not an audit trail,
 *    and it must not become another table that needs creating in production.
 *  • The follow-up variant only surfaces after 3 days, and only once.
 *  • No incentive language anywhere. Google's 24 July 2026 update penalises
 *    incentivised reviews with a site-wide structured-data manual action.
 */

import { useEffect, useState } from 'react';
import {
  reviewRequestWaLink,
  reviewRequestSmsLink,
  reviewRequestMessage,
  reviewFollowUpMessage,
  googleReviewLink,
  GOOGLE_PLACE_ID,
} from '@/lib/reviews/review-request';

const KEY = 'aqp:review-asked';
const FOLLOWUP_AFTER_DAYS = 3;

type AskedMap = Record<string, number>;

function readAsked(): AskedMap {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as AskedMap;
  } catch {
    return {};
  }
}

function writeAsked(map: AskedMap) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* Private browsing or a full quota. The button still works; it just
       forgets. Never let a storage failure break the action itself. */
  }
}

export default function ReviewRequestButton({
  ticket,
  name,
  phone,
  area,
  workDone,
  completedAt,
}: {
  ticket: string;
  name: string;
  phone: string;
  area?: string | null;
  workDone?: string | null;
  completedAt?: string | null;
}) {
  const [askedAt, setAskedAt] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAskedAt(readAsked()[ticket] ?? null);
  }, [ticket]);

  const ctx = {
    name,
    phone,
    ticket,
    area: area ?? undefined,
    workDone: workDone ?? undefined,
  };

  /* Days since the first ask. Drives whether we offer the follow-up copy. */
  const daysSinceAsk = askedAt ? (Date.now() - askedAt) / 86_400_000 : 0;
  const followUpDue = Boolean(askedAt) && daysSinceAsk >= FOLLOWUP_AFTER_DAYS;
  const isFollowUp = followUpDue;

  const message = isFollowUp ? reviewFollowUpMessage(ctx) : reviewRequestMessage(ctx);
  const waHref = reviewRequestWaLink(ctx, isFollowUp);

  function markAsked() {
    const map = readAsked();
    map[ticket] = Date.now();
    writeAsked(map);
    setAskedAt(map[ticket]);
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  /* Already asked, and the follow-up window has not opened yet. Show the
     state rather than the button, so the owner does not double-message. */
  if (askedAt && !followUpDue) {
    const days = Math.floor(daysSinceAsk);
    return (
      <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
        <p className="text-[11px] font-bold text-emerald-800">
          ⭐ Review maanga ja chuka {days === 0 ? 'aaj' : `${days} din pehle`}
        </p>
        <p className="mt-0.5 text-[11px] text-emerald-700">
          Follow-up {FOLLOWUP_AFTER_DAYS - Math.floor(daysSinceAsk)} din baad dikhega.
        </p>
        <button
          onClick={() => {
            const map = readAsked();
            delete map[ticket];
            writeAsked(map);
            setAskedAt(null);
          }}
          className="mt-1 text-[10px] font-semibold text-emerald-700 underline hover:text-emerald-900"
        >
          galti se mark hua? undo
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      {!preview ? (
        <button
          onClick={() => setPreview(true)}
          className={`w-full rounded-lg px-3 py-2 text-xs font-bold text-white transition ${
            isFollowUp
              ? 'bg-amber-500 hover:bg-amber-600'
              : 'bg-yellow-500 hover:bg-yellow-600'
          }`}
        >
          ⭐ {isFollowUp ? 'Review follow-up bhejo' : 'Review maango'}
        </button>
      ) : (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-3">
          <p className="mb-1.5 text-[11px] font-bold text-navy-700">
            {isFollowUp ? 'Follow-up message' : 'Review request'} — {name} · {phone}
          </p>

          <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-2 text-[11px] leading-relaxed text-navy-700">
            {message}
          </pre>

          {!GOOGLE_PLACE_ID && (
            <p className="mt-1.5 rounded-lg bg-orange-100 px-2 py-1.5 text-[10px] leading-snug text-orange-800">
              ⚠️ Google Place ID abhi set nahi hai — link Maps search kholega,
              customer ko 2 extra tap lagenge. Fix: <code>GOOGLE_PLACE_ID</code> in{' '}
              <code>src/lib/reviews/review-request.ts</code>
            </p>
          )}

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={markAsked}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-center text-[11px] font-bold text-white hover:bg-emerald-700"
            >
              💬 WhatsApp
            </a>
            <a
              href={reviewRequestSmsLink(ctx)}
              onClick={markAsked}
              className="rounded-lg bg-slate-600 px-3 py-2 text-center text-[11px] font-bold text-white hover:bg-slate-700"
            >
              ✉️ SMS
            </a>
          </div>

          <div className="mt-1.5 flex items-center justify-between">
            <button
              onClick={copyMessage}
              className="text-[10px] font-bold text-navy-600 underline hover:text-navy-800"
            >
              {copied ? '✓ copy ho gaya' : 'text copy karo'}
            </button>
            <a
              href={googleReviewLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-navy-600 underline hover:text-navy-800"
            >
              review link kholo
            </a>
            <button
              onClick={() => setPreview(false)}
              className="text-[10px] font-bold text-muted underline"
            >
              band karo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
