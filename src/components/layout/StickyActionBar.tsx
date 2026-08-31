'use client';

/**
 * StickyActionBar — full-width call/WhatsApp bar pinned to the bottom on mobile.
 *
 * Why this exists and why it is full-width rather than a corner bubble:
 *  • ~80% of this site's traffic is mobile (Indian local services run higher
 *    than the global 67%).
 *  • Agencies measuring this change report an average +22% mobile conversion
 *    from adding a sticky footer bar with a single dominant action.
 *  • The existing FloatingCallWidget is a small corner button that only
 *    appears after 300px of scroll. A corner bubble competes with content for
 *    attention; a footer bar owns its own space and is always thumb-reachable.
 *
 * Design decisions:
 *  • Two actions only. Hick's Law — every extra choice slows the decision.
 *    Call is primary (green, wider); WhatsApp is the lower-commitment
 *    secondary for people who do not want to talk yet.
 *  • 56px tall — comfortably above the 48px minimum tap target.
 *  • Respects the iOS home-indicator inset via env(safe-area-inset-bottom).
 *  • Hidden on admin/account routes where it would just be in the way.
 *  • Adds bottom padding to <body> so it never covers the footer content.
 */
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CONTACT, SERVICE } from '@/lib/constants';

/** Routes where a sales bar would be noise rather than help. */
const HIDDEN_ON = ['/admin', '/account', '/checkout', '/cart'];

export default function StickyActionBar() {
  const pathname = usePathname() || '';
  const [hidden, setHidden] = useState(false);
  const hideForRoute = HIDDEN_ON.some((p) => pathname.startsWith(p));

  /* Hide while the user is actively typing in a form — the on-screen keyboard
     already eats half the viewport and the bar would sit on top of the field. */
  useEffect(() => {
    if (hideForRoute) return;
    const onFocus = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) setHidden(true);
    };
    const onBlur = () => setHidden(false);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    return () => {
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
    };
  }, [hideForRoute]);

  /* Reserve space so the bar never covers the last block of the page. */
  useEffect(() => {
    if (hideForRoute) return;
    document.body.classList.add('has-sticky-bar');
    return () => document.body.classList.remove('has-sticky-bar');
  }, [hideForRoute]);

  if (hideForRoute) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 lg:hidden transition-transform duration-200 ${
        hidden ? 'translate-y-full' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex gap-2 border-t border-navy-100 bg-white/95 p-2 shadow-[0_-4px_20px_-4px_rgba(10,31,60,0.18)] backdrop-blur-md">
        {/* Primary — calling converts best for urgent local service */}
        <a
          href={CONTACT.primaryTel}
          data-analytics="sticky_call"
          className="flex min-h-[56px] flex-[3] flex-col items-center justify-center rounded-xl bg-cta-green px-3 font-bold text-white transition active:scale-[0.98]"
        >
          <span className="flex items-center gap-2 text-[15px] leading-none">
            <span aria-hidden="true">📞</span> Call Now
          </span>
          <span className="mt-0.5 text-[10px] font-medium text-white/85">
            ₹{SERVICE.visitCharge} visit · {SERVICE.responseTime}
          </span>
        </a>

        {/* Secondary — lower commitment for people not ready to talk */}
        <a
          href={`https://wa.me/91${CONTACT.primaryPhone}?text=${encodeURIComponent(
            'Namaste, mujhe RO service chahiye. Aap kab aa sakte hain?',
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          data-analytics="sticky_whatsapp"
          className="flex min-h-[56px] flex-[2] flex-col items-center justify-center rounded-xl bg-[#25D366] px-3 font-bold text-white transition active:scale-[0.98]"
        >
          <span className="flex items-center gap-1.5 text-[15px] leading-none">
            <span aria-hidden="true">💬</span> WhatsApp
          </span>
          <span className="mt-0.5 text-[10px] font-medium text-white/85">
            Reply in 5 min
          </span>
        </a>
      </div>
    </div>
  );
}
