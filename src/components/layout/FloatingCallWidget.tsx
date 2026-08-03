'use client';

import { useEffect, useState } from 'react';
import { CONTACT } from '@/lib/constants';

/**
 * Floating call + WhatsApp buttons.
 * Highest-converting element on mobile for the Patna service business —
 * most users will not fill a form, they will tap to call.
 */
export default function FloatingCallWidget() {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      {expanded && (
        <div className="mb-1 w-60 rounded-2xl bg-white p-4 shadow-card-hover ring-1 ring-navy-100">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Talk to us now</p>
          <a
            href={CONTACT.primaryTel}
            className="mt-2 block font-display text-lg font-extrabold text-navy-700 hover:text-aqua-600"
            data-analytics="float_call_1"
          >
            📞 {CONTACT.primaryPhone}
          </a>
          <a
            href={CONTACT.secondaryTel}
            className="block font-display text-lg font-extrabold text-navy-700 hover:text-aqua-600"
            data-analytics="float_call_2"
          >
            📞 {CONTACT.secondaryPhone}
          </a>
          <p className="mt-1.5 text-xs text-muted">{CONTACT.hours}</p>
        </div>
      )}

      <a
        href={CONTACT.whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        data-analytics="float_whatsapp"
        className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-2xl text-white shadow-lg transition hover:scale-105"
      >
        💬
      </a>

      <button
        onClick={() => setExpanded((e) => !e)}
        aria-label={expanded ? 'Hide phone numbers' : 'Show phone numbers'}
        aria-expanded={expanded}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-cta-green text-2xl text-white shadow-lg transition hover:scale-105"
      >
        <span className="absolute inset-0 animate-ripple rounded-full border-2 border-cta-green" />
        {expanded ? '✕' : '📞'}
      </button>
    </div>
  );
}
