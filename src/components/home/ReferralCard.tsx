'use client';

/**
 * REFERRAL CARD — shown on the tracking page after a job completes.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PLACEMENT IS THE WHOLE DESIGN DECISION
 * ──────────────────────────────────────
 * This appears in exactly one place: /track/[ticket] once the status is
 * COMPLETED. That is the single moment in the entire customer relationship
 * when goodwill is highest and the customer is already looking at the screen —
 * they opened the page to watch the technician arrive.
 *
 * It deliberately does NOT appear on the homepage, in the navbar, or as a
 * popup. A referral ask shown to someone who has not been served yet is noise,
 * and it cheapens the ask for the people who have been.
 *
 * ORDER RELATIVE TO THE REVIEW ASK
 * ────────────────────────────────
 * The Google review CTA renders first, this second. Reviews are 36% of local
 * ranking weight for home services; a referral is worth one job. If a customer
 * only does one thing, it should be the review. Asking for the referral first
 * would trade a ranking signal for a single lead.
 *
 * NO ACCOUNT, NO TABLE
 * ────────────────────
 * The code is derived from the phone number by a pure function, so this works
 * for customers who already exist and needs no production database change.
 * That matters here: the last table this project needed in production
 * (admin_alerts) silently failed for weeks because the build script has no
 * `prisma db push`.
 */

import { useState } from 'react';
import { referralCode, referralShareText, referralWaLink, REFERRAL } from '@/lib/referral';
import { SERVICE } from '@/lib/constants';

export default function ReferralCard({
  phone,
  name,
}: {
  phone: string;
  name?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const code = referralCode(phone);

  /* A malformed phone would produce an empty code and a broken card. Render
     nothing rather than something confusing. */
  if (!code) return null;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mt-4 rounded-2xl border-2 border-aqua-200 bg-gradient-to-br from-aqua-50 to-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-aqua-700">
        Dost ko bhejo, dono ko fayda
      </p>
      <h2 className="mt-1 font-display text-xl font-extrabold text-navy-700">
        Aapka referral code
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <code className="rounded-xl border-2 border-dashed border-aqua-400 bg-white px-5 py-3 font-mono text-2xl font-extrabold tracking-widest text-navy-700">
          {code}
        </code>
        <button
          onClick={copyCode}
          className="rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm font-bold text-navy-700 transition hover:border-aqua-400 hover:text-aqua-600"
        >
          {copied ? '✓ Copy ho gaya' : 'Copy karo'}
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-white/80 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
            Aapke dost ko
          </p>
          <p className="mt-0.5 font-display text-lg font-extrabold text-cta-green">
            ₹{REFERRAL.friendDiscount} kam
          </p>
          <p className="text-xs text-navy-600">
            Visit charge ₹{SERVICE.visitCharge} ki jagah ₹{REFERRAL.friendPays}
          </p>
        </div>
        <div className="rounded-xl bg-white/80 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
            Aapko
          </p>
          <p className="mt-0.5 font-display text-lg font-extrabold text-cta-green">
            ₹{REFERRAL.referrerCredit} credit
          </p>
          <p className="text-xs text-navy-600">Agli service me adjust ho jayega</p>
        </div>
      </div>

      <a
        href={referralWaLink(code, name ?? undefined)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block rounded-xl bg-emerald-600 px-5 py-3.5 text-center font-bold text-white shadow-lg transition hover:bg-emerald-700"
      >
        💬 WhatsApp par bhejo
      </a>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-bold text-navy-600 hover:text-aqua-600">
          Message kya jayega?
        </summary>
        <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-3 text-[11px] leading-relaxed text-navy-600">
          {referralShareText(code, name ?? undefined)}
        </pre>
      </details>

      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        Koi limit nahi — jitne dost bhejo. Credit tabhi milta hai jab unka kaam
        poora ho jaye, aur hum aapko call karke bata denge.
      </p>
    </section>
  );
}
