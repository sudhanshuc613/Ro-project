/**
 * GBP RATING OVERRIDE — Google rating aur review count admin se badalne ke liye.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN (18 Oct 2026)
 * ──────────────────
 * Owner: "mera ab google index pe rating 58 ho chuki hai usko bhi update kar
 *         dena or admin se option de dena ki mai badal saku rating ko"
 *
 * Wo bilkul sahi hai. Review count har hafte badalta hai (50 → 58 → 100 → 200).
 * Ab tak har baar `constants.ts` edit karke poora deploy karna padta tha.
 * Rate card (10 Oct) aur site images (10 Oct) ke liye yahi problem pehle hi
 * hal ho chuki hai — wahi pattern yahan laga rahe hain.
 *
 * Ab dono number `site_settings` ke `gbp` key me rehte hain aur
 * /admin/settings se badalte hain. Save karte hi live, koi deploy nahi.
 *
 * 🔴 CODE KA NUMBER HI DEFAULT HAI
 * ─────────────────────────────────
 * DB me kuch na ho, ya DB hi na chale — `resolveGbp(null)` wahi number laut
 * aata hai jo `constants.ts` me likha hai. Matlab ye badlav kabhi rating
 * gayab nahi kar sakta.
 *
 * 🔴 SABSE ZAROORI NIYAM — JHOOTHA NUMBER NAMUMKIN HONA CHAHIYE
 * ─────────────────────────────────────────────────────────────
 * Ye number `aggregateRating` schema me jaata hai AUR page par dikhta bhi hai.
 * Google ka saaf niyam: markup me jo rating hai, wo page par dikhni chahiye,
 * aur wo ASLI honi chahiye. Inflate kiya to "spammy structured markup" ka
 * manual action lagta hai aur poore domain ke rich result band ho jaate hain.
 *
 * Isliye yahan har value jaanchi jaati hai:
 *   • ratingValue 1.0 se 5.0 ke beech hi
 *   • reviewCount 1 se 100000 ke beech hi (0 reviews pe rating = invalid item)
 *   • dono number hone chahiye, NaN/Infinity nahi
 *   • koi bhi jaanch fail → poora override CHHOD DO, code ka number chalega
 *
 * 🔴 YE NUMBER GBP SE COPY KARNA HAI, APNE MAN SE NAHI
 * ────────────────────────────────────────────────────
 * Admin UI par yahi likha hai. Google Business Profile kholo, wahan jo likha
 * hai wahi daalo. Ye ek PUBLIC number hai — koi bhi 10 second me check kar
 * sakta hai ki website jhooth bol rahi hai ya nahi.
 */

import { GBP } from '@/lib/constants';

/** DB me jo save hota hai. */
export interface GbpOverride {
  ratingValue?: number;
  reviewCount?: number;
}

/** Resolve hone ke baad jo site use karti hai. */
export interface GbpValues {
  /** 5.0 jaisa number. */
  ratingValue: number;
  /** 58 jaisa poora number. */
  reviewCount: number;
  /**
   * Dikhane ke liye text — hamesha ek decimal.
   *
   * `toFixed(1)` isliye ki 5 → "5.0" bane. Bina iske schema me
   * `"ratingValue":"5"` jaata hai jo adhoora lagta hai, aur page par bhi
   * "5★" dikhta hai jabki Google "5.0" dikhata hai.
   */
  ratingText: string;
}

/** Code ka number — jab DB khaali ho ya galat ho. */
export const GBP_FALLBACK: GbpValues = {
  ratingValue: GBP.ratingValue,
  reviewCount: GBP.reviewCount,
  ratingText: GBP.ratingValue.toFixed(1),
};

const MIN_RATING = 1;
const MAX_RATING = 5;
const MIN_COUNT = 1;
const MAX_COUNT = 100000;

/**
 * DB ka override code ke number par lagao.
 * Ek bhi value shaki hui to us field ka code waala number chalta rehta hai.
 */
export function resolveGbp(override: GbpOverride | null | undefined): GbpValues {
  if (!override) return GBP_FALLBACK;

  const rv = Number(override.ratingValue);
  const rc = Number(override.reviewCount);

  const ratingOk =
    Number.isFinite(rv) && rv >= MIN_RATING && rv <= MAX_RATING;
  const countOk =
    Number.isFinite(rc) && Number.isInteger(rc) && rc >= MIN_COUNT && rc <= MAX_COUNT;

  const ratingValue = ratingOk ? rv : GBP_FALLBACK.ratingValue;
  const reviewCount = countOk ? rc : GBP_FALLBACK.reviewCount;

  return {
    ratingValue,
    reviewCount,
    ratingText: ratingValue.toFixed(1),
  };
}

/**
 * Admin form ke liye — ek value theek hai ya nahi, aur kyun nahi.
 * API route aur UI dono yahi message dikhate hain, taaki do jagah do alag
 * baat na likhi ho.
 */
export function validateGbp(o: GbpOverride): string[] {
  const errs: string[] = [];
  const rv = Number(o.ratingValue);
  const rc = Number(o.reviewCount);

  if (!Number.isFinite(rv)) {
    errs.push('Rating ek number hona chahiye (jaise 5 ya 4.8)');
  } else if (rv < MIN_RATING || rv > MAX_RATING) {
    errs.push(`Rating ${MIN_RATING} se ${MAX_RATING} ke beech honi chahiye — Google isi scale par deta hai`);
  }

  if (!Number.isFinite(rc)) {
    errs.push('Review count ek number hona chahiye');
  } else if (!Number.isInteger(rc)) {
    errs.push('Review count poora number hona chahiye, dashamlav nahi');
  } else if (rc < MIN_COUNT) {
    errs.push('Review count kam se kam 1 hona chahiye — 0 review par rating invalid item ban jaati hai');
  } else if (rc > MAX_COUNT) {
    errs.push(`Review count ${MAX_COUNT.toLocaleString('en-IN')} se zyada nahi ho sakta`);
  }

  return errs;
}
