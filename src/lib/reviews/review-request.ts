/**
 * REVIEW REQUEST SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHY THIS IS THE HIGHEST-LEVERAGE THING LEFT IN THE CODEBASE
 * ───────────────────────────────────────────────────────────
 * Whitespark's 2026 local ranking factor study puts reviews at 20% of local
 * pack weight overall — and for HOME SERVICES specifically at 36%, the single
 * largest controllable factor after proximity (42%, which nobody can change).
 *
 * On-page SEO, which is where every previous session's work went, is 19%.
 *
 * The site currently sits at 44 real reviews. Competitors in the Patna map
 * pack sit higher. No amount of additional page-building moves that number;
 * only asking customers does. And the reason owners do not ask is not
 * unwillingness — it is that at the end of a job, with hands wet and the next
 * call waiting, nobody stops to type out a message and find the review link.
 *
 * So this removes every step between "job done" and "message sent":
 *   • The completion screen already exists in the admin. A button appears there.
 *   • The message is pre-written, personalised, and in the customer's language.
 *   • The review link is embedded.
 *   • It opens WhatsApp with the text already filled in. One tap to send.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO
 * ──────────────────────────────────
 * No incentives, no gating, no "click here if you'd rate us 5 stars".
 * Google's 24 July 2026 structured-data update states plainly: "Sites should
 * not include fake or undisclosed incentivized reviews on your page or in your
 * structured data markup." The penalty is a manual action that strips
 * structured data SITE-WIDE — which would take out every FAQPage, LocalBusiness
 * and Service block on all 165 pages, not just the reviews.
 *
 * Review gating (asking happy customers publicly and unhappy ones privately)
 * violates Google's review policy directly and is detectable from the rating
 * distribution. Both are excluded by design, not by omission.
 *
 * ASKING TWICE IS ALSO A DECISION
 * ───────────────────────────────
 * One follow-up is included, three days later, for customers who did not
 * respond. Beyond that it becomes harassment and risks the WhatsApp number
 * being reported, which would cost far more than a review is worth. The
 * follow-up copy acknowledges the earlier message rather than repeating it.
 */

import { BRAND, CONTACT, GBP } from '@/lib/constants';

/**
 * Google review link.
 *
 * The `placeId` form is used rather than a short g.page link because short
 * links are generated per-profile and break if the profile is ever recreated,
 * whereas the place ID survives. Until the owner supplies the Place ID, this
 * falls back to a Maps search for the business name — which works, just with
 * one extra tap for the customer.
 *
 * TO FINISH THIS (2 minutes, owner):
 *   1. Open https://developers.google.com/maps/documentation/places/web-service/place-id
 *   2. Search "Aqua Perl RO Service Centre Patna"
 *   3. Copy the Place ID (starts with ChIJ...)
 *   4. Paste it below as GOOGLE_PLACE_ID
 */
export const GOOGLE_PLACE_ID = '';

export function googleReviewLink(): string {
  if (GOOGLE_PLACE_ID) {
    return `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;
  }
  /* Fallback: opens Maps at the business. The customer taps "Reviews" then
     "Write a review" — two extra taps, but it never 404s and it never points
     at the wrong business. */
  const q = encodeURIComponent(`${BRAND.legalName}, ${CONTACT.address.locality}, Patna`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export interface ReviewRequestContext {
  /** Customer's name as recorded on the job. */
  name: string;
  /** 10-digit Indian mobile, no country code. */
  phone: string;
  /** Ticket number, so the customer recognises which visit this is about. */
  ticket?: string;
  /** Locality — makes the message feel local rather than templated. */
  area?: string;
  /** What was actually done. Referencing it proves this is not a bulk blast. */
  workDone?: string;
}

/** First-name only. "Rakesh" reads human; "Rakesh Kumar Singh" reads like mail-merge. */
function firstName(full: string): string {
  const n = full.trim().split(/\s+/)[0];
  if (!n) return 'ji';
  /* Quick-booking rows are stored as "Quick booking — Kankarbagh", which would
     otherwise produce "Quick ji". Fall back to a neutral address. */
  if (/^quick$/i.test(n)) return 'ji';
  return n;
}

/**
 * The ask, in Hinglish — the language the customer was actually spoken to in.
 *
 * Kept short deliberately. Long messages get skimmed and closed; this one is
 * readable inside the WhatsApp notification preview, which is where most of
 * them will be read.
 */
export function reviewRequestMessage(ctx: ReviewRequestContext): string {
  const name = firstName(ctx.name);
  const work = ctx.workDone?.trim();

  const lines = [
    `Namaste ${name} ji 🙏`,
    '',
    work
      ? `Aaj aapke ghar ${work} ka kaam hua. Ummeed hai sab theek chal raha hai.`
      : `Aaj hamare technician ne aapke RO ka kaam kiya. Ummeed hai sab theek chal raha hai.`,
    '',
    `Agar service se khush hain to Google par 1 line likh dijiye — 30 second lagega, aur hamare jaise chhote kaam ke liye bahut badi madad hoti hai:`,
    '',
    googleReviewLink(),
    '',
    `Agar koi dikkat reh gayi ho to pehle mujhe bataiye — ${CONTACT.primaryPhone} — theek kar denge. ${BRAND.name} ki taraf se dhanyawaad. 💧`,
  ];

  return lines.filter((l) => l !== undefined).join('\n');
}

/**
 * Follow-up, sent once, ~3 days later, only to non-responders.
 *
 * Different copy on purpose. Repeating the same message reads as automated
 * and is what gets a business number reported as spam.
 */
export function reviewFollowUpMessage(ctx: ReviewRequestContext): string {
  const name = firstName(ctx.name);
  return [
    `${name} ji, ek chhoti si guzarish 🙏`,
    '',
    `Pichhle hafte aapke RO ka kaam hua tha. Agar sab theek chal raha hai to Google par ek line review likh dijiyega:`,
    '',
    googleReviewLink(),
    '',
    `Aur agar kuch dikkat hai to abhi call kar dijiye — ${CONTACT.primaryPhone}. Warranty me hai, koi charge nahi lagega.`,
  ].join('\n');
}

/** wa.me deep link with the message pre-filled. One tap for the owner. */
export function reviewRequestWaLink(ctx: ReviewRequestContext, followUp = false): string {
  const msg = followUp ? reviewFollowUpMessage(ctx) : reviewRequestMessage(ctx);
  const digits = ctx.phone.replace(/\D/g, '');
  /* Indian numbers are stored as 10 digits; wa.me needs the country code. */
  const withCc = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCc}?text=${encodeURIComponent(msg)}`;
}

/** SMS fallback for customers who do not use WhatsApp. Trimmed to fit. */
export function reviewRequestSmsLink(ctx: ReviewRequestContext): string {
  const name = firstName(ctx.name);
  const body = `Namaste ${name} ji, ${BRAND.name} se. Service pasand aayi ho to Google par review likh dijiye: ${googleReviewLink()} — koi dikkat ho to ${CONTACT.primaryPhone} par call karein.`;
  return `sms:+91${ctx.phone.replace(/\D/g, '')}?body=${encodeURIComponent(body)}`;
}

/**
 * How far the review count is from where it needs to be.
 *
 * The target is not arbitrary. Local-pack analyses consistently show the
 * review-count effect flattening once a business is in the same order of
 * magnitude as the competitors it is ranked against — being at 44 when the
 * field is at 150+ is a visible gap; being at 150 when the field is at 180 is
 * not. So 150 is the point where this stops being the binding constraint.
 */
export const REVIEW_TARGET = 150;

export function reviewProgress(current: number = GBP.reviewCount) {
  const remaining = Math.max(0, REVIEW_TARGET - current);
  return {
    current,
    target: REVIEW_TARGET,
    remaining,
    percent: Math.min(100, Math.round((current / REVIEW_TARGET) * 100)),
    /* At a realistic 25-30% conversion on asked-and-followed-up requests,
       this is how many completed jobs it takes. Shown so the number feels
       reachable rather than abstract. */
    jobsNeeded: Math.ceil(remaining / 0.27),
  };
}
