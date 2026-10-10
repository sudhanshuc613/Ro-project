/**
 * BANNER KE UPAR TAIRTA HUA PHONE NUMBER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Owner (11 Oct 2026):
 *   "mai koi bhi photo upload karu uske upper ya banner ke upper jo no hai
 *    float wala wo bhi rahe ... banner dusri bhi lagau to dusra aa jaye,
 *    no uske upper hi rahe chahyie, kitni bhi image laga lu"
 *
 * Isliye number IMAGE KE ANDAR CHHAPA NAHI JAATA — HTML me alag se upar
 * tairta hai. Teen bade faayde:
 *
 *   1. BADALNE KI ZAROORAT NAHI — banner 10 baar badlo, number upar hi rahega.
 *      Image me chhapa hota to har nayi image ke liye naya design banana padta.
 *
 *   2. GOOGLE PADH SAKTA HAI — image ke andar likha number Google ke liye
 *      sirf pixel hai. HTML ka `tel:` link woh padhta hai, aur mobile SERP
 *      me call button tak dikha deta hai. Ads ke Quality Score me bhi
 *      landing page ka phone milna ginti me aata hai.
 *
 *   3. UNGLI RAKHTE HI CALL — `tel:` link hai, number select/copy bhi hota
 *      hai. Image wala number na click hota hai na copy.
 *
 * ── HAR IMAGE PAR DIKHE, CHAHE IMAGE KAISI BHI HO ────────────────────────
 * Badge ke peeche THOS safed card hai (transparent nahi) aur neeche se ek
 * halka gradient. Isliye chahe banner safed ho ya kaala, number hamesha
 * padha jaata hai. Ye jaan-boojh ke kiya gaya — owner kabhi bhi koi bhi
 * photo daal sakta hai aur tab bhi number dikhna chahiye.
 *
 * ── CLS (layout khiskna) ─────────────────────────────────────────────────
 * Badge `absolute` hai, isliye page ka layout nahi hilata. Parent par
 * `relative` hona zaroori hai — `SiteBanner` wrapper wahi karta hai.
 */
import { CONTACT, SERVICE } from '@/lib/constants';

export type BadgePosition = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-right';

const POS: Record<BadgePosition, string> = {
  'bottom-center': 'bottom-3 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-3 left-3',
  'bottom-right': 'bottom-3 right-3',
  'top-right': 'top-3 right-3',
};

export default function BannerPhoneBadge({
  position = 'bottom-center',
  showVisitCharge = true,
  label = 'Service support',
  className = '',
  scrim = true,
}: {
  position?: BadgePosition;
  /** ₹200 visit wali chhoti line saath me dikhani hai ya nahi. */
  showVisitCharge?: boolean;
  label?: string;
  className?: string;
  /** Neeche ka halka andhera. Jahan background pehle se dark hai wahan false. */
  scrim?: boolean;
}) {
  return (
    <>
      {/* Neeche halka andhera — safed banner par bhi badge alag dikhe */}
      {scrim && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-[inherit] bg-gradient-to-t from-black/25 to-transparent"
        />
      )}

      <a
        href={CONTACT.primaryTel}
        data-phone-badge="1"
        aria-label={`Call Aqua Perl ${SERVICE.city} on ${CONTACT.primaryPhone}`}
        className={[
          'absolute z-10 flex items-center gap-2.5 rounded-2xl bg-white/95 px-3.5 py-2 shadow-card-hover ring-1 ring-navy-100 backdrop-blur-sm',
          'transition hover:bg-white hover:shadow-lift active:scale-[0.98]',
          'sm:gap-3 sm:px-4 sm:py-2.5',
          POS[position],
          className,
        ].join(' ')}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cta-green text-white sm:h-10 sm:w-10">
          <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25c1.1.37 2.3.57 3.6.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1l-2.22 2.23z" />
          </svg>
        </span>

        <span className="leading-tight">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-muted sm:text-[11px]">
            {label}
          </span>
          <span className="tnum block font-display text-base font-extrabold text-navy-700 sm:text-lg">
            {CONTACT.primaryPhone}
          </span>
          {showVisitCharge && (
            <span className="block text-[10px] font-semibold text-cta-green sm:text-[11px]">
              ₹{SERVICE.visitCharge} visit · {SERVICE.responseTime}
            </span>
          )}
        </span>
      </a>
    </>
  );
}
