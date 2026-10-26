/**
 * SERVICE RATES — poori site ka EK hi rate source.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Owner ki shikayat (26 Oct 2026) ────────────────────────────────────────
 *
 *   "jaha jaha tune rate card ka option diya hua hai waha sab ko ek jagh se
 *    admin panel pe change kar saku. maine abhi update kiya wo hua hi nhi"
 *
 * Pehle round me 25 row admin se jud gayi thi. Phir maine dobara naapa:
 *
 *     service-intent-data.ts me kul 53 price row
 *       rateKey laga        25
 *       BINA rateKey        28   ← admin se nahi badalti thi
 *
 * Un 28 me ye bhi thi — aur yahi sabse bura tha:
 *
 *     /ro-repair-patna                "RO membrane 75 GPD"      → admin se ✅
 *     /ro-repair-patna                "RO membrane 80 / 100 GPD" → hardcoded ❌
 *
 * Yaani ek hi page ki ek hi table me, ek membrane ka rate admin se badalta
 * tha aur doosre ka nahi. Owner rate badalta, aadha table badalta, aadha
 * purana — bilkul wahi jo unhone bola.
 *
 * ── 🔴 PART_RATES me kyun nahi daala ───────────────────────────────────────
 *
 * Seedha `PART_RATES` (ads-landing-data.ts) me 21 nayi key daalna aasaan tha,
 * PAR `ServicePriceGrid` us poori array ko ads-landing page par grid me
 * chhapta hai. Tab us page par 12 ki jagah 33 card aa jaate — yaani ek
 * maujooda UI bina poochhe badal jaati. Wo nahi karna.
 *
 * Isliye:
 *     PART_RATES   = wahi 12, bilkul waise ke waise  (ads-landing grid)
 *     EXTRA_RATES  = 21 nayi key, SIRF yahan          (naya file)
 *     ALL_RATES    = dono                             (admin panel + table)
 *
 * Aur `ServicePriceGrid` ab apne aap ko PART_RATES tak hi seemit rakhta hai,
 * chahe use 33 rate mil jaayein. Us page par pehle jaisa hi dikhega.
 *
 * ── FORMAT ─────────────────────────────────────────────────────────────────
 *
 * Har daam "₹X – ₹Y" nahi hota. Site par abhi ye alag-alag shakal me likha
 * hai, aur ye shabd customer ke liye matlab rakhte hain:
 *
 *     ₹1,400 – ₹2,400      range        (part ka rate upar-neeche hota hai)
 *     ₹500                 flat         (ek fix number)
 *     ₹2,500 onwards       from         (isse kam nahi, upar plant par)
 *     ₹1,499 / year        perYear      (AMC)
 *     From ₹6,500 / year   fromPerYear  (commercial AMC)
 *     ₹150 per metre       perMetre     (pipe)
 *     ₹200 extra           extra        (drilling, upar se lagta hai)
 *
 * Agar sab ko zabardasti "₹X – ₹Y" bana dete to "₹1,499 / year" turant
 * "₹1,499" ban jaata aur customer ko lagta ki AMC ek baar ka paisa hai.
 * Isliye format rate ke saath hi baithta hai.
 *
 * 🔴 `scripts/rate-sync-test.py` har key par jaanchta hai ki admin me kuch na
 *    badla ho to banne wali string BILKUL WAHI ho jo abhi site par hai.
 *    Ek byte ka farak bhi FAIL hai.
 */

import { PART_RATES, type PartRate } from '@/lib/seo/ads-landing-data';

/** Site par daam kis shakal me likha jaata hai. */
export type RateFormat =
  | 'range'       // ₹150 – ₹300
  | 'flat'        // ₹500
  | 'from'        // ₹2,500 onwards
  | 'perYear'     // ₹1,499 / year
  | 'fromPerYear' // From ₹6,500 / year
  | 'perMetre'    // ₹150 per metre
  | 'extra';      // ₹200 extra

/** Admin page par kis heading ke neeche dikhega. */
export type RateGroup =
  | 'Ghar ka RO — part'
  | 'Installation / shifting'
  | 'AMC plan'
  | 'General service'
  | 'Commercial plant'
  | 'Lagwane ka rate (fitted)';

export interface ServiceRate extends PartRate {
  format: RateFormat;
  group: RateGroup;
}

const inr = (x: number) => `₹${x.toLocaleString('en-IN')}`;

/** Ek rate ko uske format ke hisaab se string me badlo. */
export function formatRate(from: number, to: number, format: RateFormat = 'range'): string {
  switch (format) {
    case 'flat':        return inr(from);
    case 'from':        return `${inr(from)} onwards`;
    case 'perYear':     return `${inr(from)} / year`;
    case 'fromPerYear': return `From ${inr(from)} / year`;
    case 'perMetre':    return `${inr(from)} per metre`;
    case 'extra':       return `${inr(from)} extra`;
    case 'range':
    default:            return from === to ? inr(from) : `${inr(from)} – ${inr(to)}`;
  }
}

/** Purane 12 — PART_RATES se hi, taaki do jagah number na likhe jaayein. */
export const DOMESTIC_RATES: ServiceRate[] = PART_RATES.map((r) => ({
  ...r,
  format: 'range' as const,
  group: 'Ghar ka RO — part' as const,
}));

/**
 * 🔴 NAYE 21 — ye `PART_RATES` me JAAN-BOOJH KAR nahi hain (upar wajah).
 *
 * `from`/`to` dono rakhe hain kyunki admin UI dono maangta hai aur validator
 * `to >= from` chahta hai. Jin format me sirf ek number dikhta hai (flat,
 * from, perYear…) unme `to === from` rakha hai.
 */
export const EXTRA_RATES: ServiceRate[] = [
  /* ── Ghar ka RO — part ────────────────────────────────────────────────── */
  { part: 'RO membrane 80/100 GPD', from: 1400, to: 2400, format: 'range', group: 'Ghar ka RO — part',
    depends: '80 GPD ya 100 GPD, company vs equivalent. 500 ppm se upar TDS par ye lagti hai' },
  { part: 'Membrane + poora filter set (combo)', from: 1400, to: 2400, format: 'range', group: 'Ghar ka RO — part',
    depends: 'ek saath lene par alag-alag se sasta padta hai' },
  { part: 'Inline / candle filter', from: 120, to: 300, format: 'range', group: 'Ghar ka RO — part',
    depends: 'compact aur UV-only model me lagta hai' },

  /* ── Installation / shifting ──────────────────────────────────────────── */
  { part: 'Installation — bahar se khareeda purifier', from: 500, to: 500, format: 'flat', group: 'Installation / shifting',
    depends: 'hamare yahan se liya ho to free hai' },
  { part: 'Uninstall + naye pate par refit', from: 399, to: 399, format: 'from', group: 'Installation / shifting',
    depends: 'ghar shift karne par; doori aur plumbing se badalta hai' },
  { part: 'Extra tapping / 3 m se lambi pipe', from: 150, to: 150, format: 'perMetre', group: 'Installation / shifting',
    depends: 'per metre — kitni lambi line chahiye' },
  { part: 'Deewar me drilling — RCC / granite', from: 200, to: 200, format: 'extra', group: 'Installation / shifting',
    depends: 'sirf tab jab RCC ya granite kaatna pade' },

  /* ── AMC plan ─────────────────────────────────────────────────────────── */
  { part: 'Basic AMC — saal bhar', from: 1499, to: 1499, format: 'perYear', group: 'AMC plan',
    depends: '2 visit + sediment aur carbon change' },
  { part: 'Gold AMC — saal bhar', from: 2799, to: 2799, format: 'perYear', group: 'AMC plan',
    depends: '4 visit + saare pre-filter + UV lamp' },
  { part: 'Annual AMC — saare filter + 3 visit', from: 2499, to: 2499, format: 'from', group: 'AMC plan',
    depends: 'machine ki haalat aur filter type par' },

  /* ── General service ──────────────────────────────────────────────────── */
  { part: 'General service — bina part (repair page)', from: 350, to: 350, format: 'from', group: 'General service',
    depends: 'strip, clean, flush aur dobara seal' },
  { part: 'General service — clean, flush, re-seal, TDS set', from: 499, to: 499, format: 'from', group: 'General service',
    depends: 'poori servicing, part alag se' },

  /* ── Commercial plant ─────────────────────────────────────────────────── */
  { part: 'Commercial — plant installation 25–100 LPH', from: 2500, to: 2500, format: 'from', group: 'Commercial plant',
    depends: 'LPH rating, piping aur site ki haalat' },
  { part: 'Commercial — breakdown visit + diagnosis', from: 500, to: 500, format: 'from', group: 'Commercial plant',
    depends: 'plant ka size aur doori' },
  { part: 'Commercial — routine service 25–100 LPH', from: 1500, to: 1500, format: 'from', group: 'Commercial plant',
    depends: 'kitne stage aur dosing hai' },
  { part: 'Commercial — routine service 250–500 LPH', from: 2500, to: 2500, format: 'from', group: 'Commercial plant',
    depends: 'kitne stage aur dosing hai' },
  { part: 'Commercial — routine service 1000+ LPH', from: 4000, to: 4000, format: 'from', group: 'Commercial plant',
    depends: 'plant ka size aur pre-treatment' },
  { part: 'Commercial — membrane chemical cleaning (CIP)', from: 2500, to: 2500, format: 'from', group: 'Commercial plant',
    depends: 'kitni membrane aur kitni scaling hai' },
  { part: 'Commercial — high-pressure pump repair', from: 4500, to: 4500, format: 'from', group: 'Commercial plant',
    depends: 'repair ho sakta hai ya badalna padega' },
  { part: 'Commercial — pre-treatment media change', from: 3500, to: 3500, format: 'from', group: 'Commercial plant',
    depends: 'sand, carbon ya softener — aur kitna volume' },
  { part: 'Commercial — AMC saal bhar', from: 6500, to: 6500, format: 'fromPerYear', group: 'Commercial plant',
    depends: 'LPH rating, visit ki ginti aur dosing chemical' },

  /* ══════════════════════════════════════════════════════════════════════
     🔴 LAGWANE KA RATE (fitted) — 26 Oct 2026, naye gate ne pakda
     ──────────────────────────────────────────────────────────────────────
     Section F (rate-sync-test.py) ne pehli baar source string ko banne wali
     string se milaya aur 8 row par farak nikla. Yaani pichhle deploy me ye
     8 daam site par CHUP-CHAAP badal gaye the:

       Sediment + carbon filter change   ₹450–₹900    → ₹350–₹900
       RO membrane replacement (75 GPD)  ₹1,600–₹2,400 → ₹1,100–₹2,400
       Solenoid valve (ads page)         ₹450–₹600    → ₹300–₹600
       Membrane housing replacement      ₹350–₹700    → ₹250–₹700
       Post-carbon / polishing filter    ₹200–₹400    → ₹180–₹400
       Float switch                      ₹180–₹350    → ₹150–₹350

     Wajah: in row par bare-part ka rateKey lag gaya tha. PART_RATES me
     PART ka daam hai (dukaan se, India delivery) — par in page par PATNA
     ME LAGWANE ka daam likha tha, jisme mistri ka kaam bhi shaamil hai.
     Fitted ka floor hamesha bare part se upar hota hai.

     Isliye in 6 ko apni key di gayi hai. Ab:
       • jo daam customer ko dikh raha tha, wahi wapas aa gaya
       • phir bhi /admin/rates se badal sakta hai
       • owner chahe to dono ko ek number par la sakta hai, 30 second me

     🔴 Do aur row (Solenoid ₹280, Storage tank ₹650) owner ke approve kiye
        floor (₹300 / ₹700) se NEECHE thi — wo purani galti thi, isliye unko
        card ka hi rate rakha gaya. Un par dikhta hua daam nahi badla.
     ══════════════════════════════════════════════════════════════════════ */
  { part: 'Sediment + carbon set — lagwane ka', from: 450, to: 900, format: 'range', group: 'Lagwane ka rate (fitted)',
    depends: 'dono pre-filter, Patna me lagwa kar. Borewell wale ghar me saal me do baar' },
  { part: 'RO membrane 75 GPD — lagwane ka', from: 1600, to: 2400, format: 'range', group: 'Lagwane ka rate (fitted)',
    depends: 'genuine membrane + warranty, TDS proof ke baad hi' },
  { part: 'Solenoid valve — lagwane ka', from: 450, to: 600, format: 'range', group: 'Lagwane ka rate (fitted)',
    depends: 'machine band hi nahi hoti — valve + fitting ka kaam' },
  { part: 'Membrane housing — lagwane ka', from: 350, to: 700, format: 'range', group: 'Lagwane ka rate (fitted)',
    depends: 'sirf tab jab housing khud chatak gaya ho' },
  { part: 'Post-carbon / polishing filter — lagwane ka', from: 200, to: 400, format: 'range', group: 'Lagwane ka rate (fitted)',
    depends: 'swaad aur badbu wala stage, lagbhag saal me ek baar' },
  { part: 'Float switch — lagwane ka', from: 180, to: 350, format: 'range', group: 'Lagwane ka rate (fitted)',
    depends: 'tank overflow ya bharta hi nahi' },
];

/** Admin panel aur price table — dono isi list par chalte hain. */
export const ALL_RATES: ServiceRate[] = [...DOMESTIC_RATES, ...EXTRA_RATES];

/** part naam → format (applyRatesToRows ise use karta hai). */
export const RATE_FORMAT: Readonly<Record<string, RateFormat>> = Object.fromEntries(
  ALL_RATES.map((r) => [r.part, r.format]),
);

/** part naam → group (admin page grouping). */
export const RATE_GROUP: Readonly<Record<string, RateGroup>> = Object.fromEntries(
  ALL_RATES.map((r) => [r.part, r.group]),
);

/** ads-landing ke ServicePriceGrid ke liye — sirf wahi 12, usi order me. */
export const DOMESTIC_KEYS: ReadonlySet<string> = new Set(PART_RATES.map((r) => r.part));
