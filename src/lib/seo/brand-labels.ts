/**
 * BRAND SERP LABELS — chhota naam jo title/description me jaata hai.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * YE FILE KYU BANI (22 Sep 2026)
 * ──────────────────────────────
 * Brand page ka title is logic se banta tha:
 *
 *     const short = brand.name.split(' (')[0];
 *     const label = short.length > 22 ? 'All Brands' : short;
 *
 * Do brands ka naam 22 se lamba hai, isliye DONO 'All Brands' ban gaye:
 *
 *     commercial-ro  "Commercial & Industrial RO Plants"        (33) → All Brands
 *     other-brands   "All Other Brands & Local Assembled Units" (40) → All Brands
 *
 * Nateeja — dono pages ka title BILKUL EK JAISA tha:
 *
 *     /service-patna/brand/commercial-ro  → "All Brands RO Service Patna — ₹200 Visit | Aqua Perl"
 *     /service-patna/brand/other-brands   → "All Brands RO Service Patna — ₹200 Visit | Aqua Perl"
 *
 * Description bhi wahi. Ye duplicate-title cannibalization hai — Google ko do
 * alag pages ek jaise dikhte the, aur wo dono me se ek ko hi dikhata hai.
 * (Live measure kiya 22 Sep — 143 pages me ye ek hi duplicate tha.)
 *
 * 🔴 AUR EK BAAT — /service-patna/brand/commercial-ro ka apna intent page bhi
 * hai: /commercial-ro-service-patna ("Commercial RO Plant Service Patna").
 * Agar brand page bhi wahi phrase use karta to WO BHI ladta. Isliye brand page
 * ab "Industrial RO Plant Brands" angle leta hai — service nahi, BRAND.
 *
 * ── Rule ────────────────────────────────────────────────────────────────
 * Yahan label tabhi daalo jab brand ka asli naam 22 akshar se lamba ho.
 * Chhote naam (Kent, Livpure, Havells) apne aap kaam karte hain — unhe yahan
 * mat likhna, warna do jagah maintain karna padega.
 */

/**
 * Lambe brand naamon ka chhota SERP label.
 * Key = brand slug. Har label UNIQUE hona chahiye — do brands ka ek label
 * matlab dobara wahi duplicate-title bug.
 */
export const BRAND_SERP_LABEL: Record<string, string> = {
  /* Intent page /commercial-ro-service-patna "Commercial RO Plant Service"
     par hai. Ye page BRAND axis pe hai, isliye "Industrial RO Plant" —
     alag phrase, alag intent, koi takraav nahi. */
  'commercial-ro': 'Industrial RO Plant',

  /* Local assembled / no-name units. "All Brands" nahi likha kyunki wo
     /service-patna/brand hub ka phrase hai. */
  'other-brands': 'Local & Assembled RO',

  /* 22 akshar exactly — border pe hai, isliye chhota kar diya taaki title
     62 se neeche rahe (64 tha, SERP me kat raha tha). */
  aquaultra: 'AquaUltra',
};

/**
 * Brand ka SERP label do.
 * Pehle override dekho, na mile to brand ke naam ka pehla hissa
 * (bracket se pehle) le lo.
 */
export function brandLabel(slug: string, name: string): string {
  return BRAND_SERP_LABEL[slug] ?? name.split(' (')[0];
}
