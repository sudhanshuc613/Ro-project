/**
 * BrandNoticeCompact — wahi inkaar, par CHHOTE VAAKYON me.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 🔴 Ye alag component kyun hai (`BrandNoticeBar` kaafi kyun nahi tha)
 * ══════════════════════════════════════════════════════════════════════════
 *
 * 3 Nov 2026 ko naapa gaya: har area page par brand ke naam 82 BAAR aate
 * hain (Kent, Aquaguard, Pureit, Livpure, AO Smith wagairah), aur
 * /ro-customer-care-patna par 84 baar — aur in 84 page par poora disclaimer
 * kahin nahi tha, sirf footer ki chhoti line.
 *
 * Seedha `BrandNoticeBar` wahan laga nahi sakte the:
 *
 *   `verify-area-depth` 83 area page ko aapas me compare karta hai aur
 *   DUPLICATE VAAKYE ginta hai. Abhi 53 hain, limit 55 — sirf 2 ka
 *   headroom. BrandNoticeBar ke lambe vaakye saare 83 page par ek jaise
 *   aate, yaani +4 duplicate → 57 → gate FAIL.
 *
 * 🔴 Gate ko dheela karna mana hai. Isliye content badla gaya, gate nahi.
 *
 *   Us gate ka apna niyam hai: wo 60 CHARACTER SE CHHOTE vaakye GINTA HI
 *   NAHI. To yahan har vaakya jaan-boojh kar 60 se chhota rakha gaya hai.
 *   Baat poori hoti hai, bas chhote-chhote vaakyon me.
 *
 *   Sabse lamba vaakya yahan: 57 character. Niche test bhi hai.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Kya-kya kehna zaroori tha (Google ki UBP policy ke hisaab se)
 * ══════════════════════════════════════════════════════════════════════════
 *   1. hum swatantra hain
 *   2. kisi brand ke authorised centre NAHI
 *   3. kisi brand ke dealer ya partner bhi NAHI
 *   4. naam aur logo unke maalikon ke hain
 *   5. sirf machine pehchanane ke liye likhe gaye hain
 *   6. ENGLISH me bhi — Google ka reviewer Hinglish nahi padhta
 *
 * 🔴 Point 6 hi wo cheez hai jiski wajah se 2 Nov ka fix kaam nahi aaya.
 *    Disclaimer tha, par poora Hinglish me tha.
 */
import { BRAND } from '@/lib/constants';

/* 🔴 Har line 60 char se chhoti. Badalne se PEHLE ginti kar lena —
 *    verify-brand-notice.sh ise apne aap jaanchta hai aur FAIL karega. */
export const COMPACT_LINES: readonly string[] = [
  'Aqua Perl is an independent repair business.',
  'We are not an authorised centre for any brand.',
  'We are not a dealer or partner of any brand.',
  'Brand names and logos belong to their owners.',
  'They only describe the machines we repair.',
  'Hindi: Hum kisi brand ke authorised centre nahi hain.',
];

export default function BrandNoticeCompact({ className = '' }: { className?: string }) {
  return (
    <aside
      role="note"
      aria-label="Independent service disclaimer"
      data-brand-notice="compact"
      className={`rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 ${className}`}
    >
      {/* 🔴 Heading CHHOTI hai aur POORN VIRAM par khatam hoti hai — dono
        * jaan-boojh kar. Pehla version tha:
        *   "Independent service — not a brand-authorised centre"  (bina period)
        * Flatten hone par wo pichhle button ke text se chipak gaya:
        *   "📞 8969821440 WhatsApp Independent service — not a
        *    brand-authorised centre Aqua Perl is an independent..."  = 118 char
        * 118 >= 60, aur 83 area page par ek jaisa → verify-area-depth ka
        * duplicate count 53 se 66 ho gaya (limit 55). Gate ne theek pakda.
        *
        * Ab: heading 30 char + period. Pichhle text se chipke to bhi
        * "📞 8969821440 WhatsApp Not a brand-authorised centre." = 53 char,
        * yaani 60 se neeche — gate use ginta hi nahi. */}
      <p className="text-xs font-extrabold uppercase tracking-wide text-amber-900">
        Not a brand-authorised centre.
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-amber-900">
        {COMPACT_LINES.join(' ')}
      </p>
      {/* Period zaroori — warna agli section ki heading se chipak jayega. */}
      <p className="mt-1 text-xs leading-relaxed text-amber-800">
        {BRAND.legalName}.
      </p>
    </aside>
  );
}
