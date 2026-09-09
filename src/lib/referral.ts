/**
 * REFERRAL SYSTEM — the one growth loop that fits this business.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHY REFERRAL AND NOT SOMETHING ELSE
 * ───────────────────────────────────
 * Measured 9 Sep 2026 across the sites this business competes with:
 *
 *     urbancompany.com/patna   referral ✓  slot picker ✓  app ✓  reschedule ✓
 *     rocareindia.com          loyalty coins ✓  OTP ✓  app ✓  live tracking ✓
 *     rokadoctor.in            none of these
 *
 * Both of the funded competitors run a referral mechanic. Neither of them can
 * run it well in Patna, because a referral only converts when the person
 * receiving it can verify the recommender locally — and a Gurgaon call centre
 * has no local social graph. A Patna technician who fixed your neighbour's RO
 * does.
 *
 * The economics are also the right shape for this business specifically:
 * customer acquisition here is currently ₹0 organic + a Google Ads spend that
 * produced nothing in a year. A referral discount is only paid out AFTER a job
 * completes, so it cannot lose money the way an ad budget can.
 *
 * HOW IT WORKS — deliberately simple
 * ──────────────────────────────────
 *   • Every customer gets a code derived from their phone number. No table,
 *     no signup, nothing to migrate, works for customers who already exist.
 *   • Friend uses the code → friend gets ₹50 off their visit charge.
 *   • Referrer gets ₹100 credit against their next service.
 *   • Both amounts are honoured manually by the owner at the time of billing,
 *     which means this ships today without a payments integration.
 *
 * WHY THE CODE IS DERIVED, NOT STORED
 * ───────────────────────────────────
 * A stored code needs a table, a migration, and a production DB change — and
 * the last time this project needed a table created in production
 * (admin_alerts) it silently failed for weeks because the build script has no
 * `prisma db push`. A derived code has none of that risk: the same phone
 * always produces the same code, and validating a code is a pure function.
 *
 * The hash is not a security boundary and is not treated as one. It exists so
 * the code is short, typo-resistant and does not expose the phone number.
 * Worst case someone guesses a valid code and gets ₹50 off one visit, which
 * the owner sees on the job sheet before honouring it.
 */

import { SERVICE } from '@/lib/constants';

/** What each side gets. Kept here so the copy and the billing agree. */
export const REFERRAL = {
  friendDiscount: 50,
  referrerCredit: 100,
  /** Visit charge after the friend discount — used in the share copy. */
  get friendPays() {
    return SERVICE.visitCharge - this.friendDiscount;
  },
} as const;

/* Ambiguous characters removed: no O/0, no I/1, no S/5. A code read aloud
   over a phone call has to survive being misheard, and this is a business
   where codes will absolutely be read aloud. */
const ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXYZ23479';

/**
 * Stable 6-character code for a phone number.
 *
 * Format: AP-XXXX where XXXX is derived. The AP prefix makes it recognisable
 * as an Aqua Perl code when the owner sees it written on a job sheet.
 */
export function referralCode(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return '';

  /* FNV-1a. Chosen because it is short, dependency-free and deterministic
     across Node and the browser — the code must render identically on the
     server and after hydration or React will warn. */
  let h = 0x811c9dc5;
  for (let i = 0; i < digits.length; i++) {
    h ^= digits.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }

  let out = '';
  let n = h;
  for (let i = 0; i < 4; i++) {
    out += ALPHABET[n % ALPHABET.length];
    n = Math.floor(n / ALPHABET.length);
  }
  return `AP-${out}`;
}

/** Does this code belong to this phone? Pure function, no lookup. */
export function isValidReferral(code: string, phone: string): boolean {
  const clean = code.trim().toUpperCase().replace(/\s/g, '');
  return clean === referralCode(phone);
}

/**
 * The message the customer forwards.
 *
 * Written to be forwarded as-is on WhatsApp. Short enough to read inside a
 * notification preview, and it leads with the benefit to the RECIPIENT rather
 * than to the sender — a referral that reads as "help me earn" gets deleted.
 */
export function referralShareText(code: string, name?: string): string {
  const who = name?.trim().split(/\s+/)[0];
  return [
    who ? `${who} ne aapke liye bheja hai 💧` : 'Ek kaam ki cheez 💧',
    '',
    `Aqua Perl — Patna me RO repair karte hain. Visit charge ₹${SERVICE.visitCharge} hai (market me ₹300-400).`,
    '',
    `Mera code lagao to aapko ₹${REFERRAL.friendDiscount} aur kam — sirf ₹${REFERRAL.friendPays}:`,
    '',
    `  ${code}`,
    '',
    'Book karo: rokadoctor.in ya call 8969821440',
  ].join('\n');
}

/** wa.me deep link with the share text pre-filled. */
export function referralWaLink(code: string, name?: string): string {
  return `https://wa.me/?text=${encodeURIComponent(referralShareText(code, name))}`;
}
