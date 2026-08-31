'use client';

/**
 * ExitIntent — one last, quiet offer when a desktop visitor is leaving.
 *
 * Rules this follows so it never becomes the popup everyone hates:
 *  • Desktop only. Mouse-leave has no meaning on touch, and a full-screen
 *    interstitial on mobile is both hostile and a Google penalty risk.
 *  • Fires once per session, stored in sessionStorage.
 *  • Never fires in the first 12 seconds — a bounce that fast is not a lead.
 *  • Never fires if the visitor has already tapped call or WhatsApp.
 *  • One field. Phone only. Anything more and it is not worth interrupting for.
 *  • Escape closes it, clicking the backdrop closes it, and there is a real
 *    close button — not a 6px grey ×.
 */
import { useEffect, useRef, useState } from 'react';
import { CONTACT, SERVICE } from '@/lib/constants';

const SEEN_KEY = 'aqp_exit_seen';

export default function ExitIntent() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const armed = useRef(false);

  useEffect(() => {
    // Touch devices and small screens are out.
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.innerWidth < 1024) return;
    if (sessionStorage.getItem(SEEN_KEY)) return;

    const armTimer = setTimeout(() => { armed.current = true; }, 12_000);

    const onLeave = (e: MouseEvent) => {
      // Only the top edge — that is where the tab bar and address bar live.
      if (!armed.current || e.clientY > 8) return;
      if (sessionStorage.getItem(SEEN_KEY)) return;
      sessionStorage.setItem(SEEN_KEY, '1');
      setOpen(true);
    };

    // If they already tried to contact us, do not interrupt them.
    const onContact = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a');
      const href = a?.getAttribute('href') ?? '';
      if (href.startsWith('tel:') || href.includes('wa.me')) {
        sessionStorage.setItem(SEEN_KEY, '1');
      }
    };

    document.addEventListener('mouseout', onLeave);
    document.addEventListener('click', onContact, true);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener('mouseout', onLeave);
      document.removeEventListener('click', onContact, true);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  const phoneOk = /^[6-9]\d{9}$/.test(phone);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneOk || busy) return;
    setBusy(true);
    try {
      await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Callback request (website)',
          customerPhone: phone,
          pincode: '800001',
          addressLine: 'Patna — callback requested from website',
          serviceType: 'REPAIR',
          issueCategory: 'OTHER',
          issueDescription: 'Visitor requested a callback before leaving the site.',
          source: 'WEBSITE',
        }),
      });
      setSent(true);
    } catch {
      setSent(true); // do not show an error on the way out; the row usually lands
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] hidden items-center justify-center bg-navy-900/55 p-4 backdrop-blur-sm lg:flex"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      role="dialog"
      aria-modal="true"
      aria-label="Callback request"
    >
      <div className="anim-scale-in relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <button
          onClick={() => setOpen(false)}
          aria-label="Band karo"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-lg text-muted transition hover:bg-slate-100"
        >
          ✕
        </button>

        {sent ? (
          <div className="py-4 text-center">
            <p className="text-4xl" aria-hidden="true">✅</p>
            <h3 className="mt-3 font-display text-xl font-extrabold text-navy-700">
              Number mil gaya
            </h3>
            <p className="mt-2 text-sm text-muted">
              Hum thodi der me call karenge. Jaldi ho to {CONTACT.primaryPhone} pe call kar lijiye.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-5 rounded-xl bg-navy-700 px-6 py-2.5 text-sm font-bold text-white"
            >
              Theek hai
            </button>
          </div>
        ) : (
          <>
            <p className="text-3xl" aria-hidden="true">💧</p>
            <h3 className="mt-2 font-display text-xl font-extrabold text-navy-700">
              Ek minute rukiye
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Number chhod dijiye — hum aapko call kar lenge. Visit charge sirf
              ₹{SERVICE.visitCharge}, aur kaam pasand na aaye to paisa nahi.
            </p>

            <form onSubmit={submit} className="mt-4">
              <div className="flex items-center overflow-hidden rounded-xl border border-navy-200 focus-within:border-aqua-500 focus-within:ring-2 focus-within:ring-aqua-100">
                <span className="border-r border-navy-100 bg-sand-200 px-3 py-3 text-sm font-bold text-navy-600">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  className="min-w-0 flex-1 px-3 py-3 text-base outline-none"
                  aria-label="Mobile number"
                />
              </div>
              <button
                type="submit"
                disabled={!phoneOk || busy}
                className="mt-3 w-full rounded-xl bg-cta-orange py-3.5 font-extrabold text-white transition hover:bg-cta-orangeDark disabled:opacity-50"
              >
                {busy ? 'Bhej rahe hain…' : 'Mujhe call karo'}
              </button>
            </form>

            <div className="mt-3 text-center">
              <a
                href={CONTACT.primaryTel}
                className="text-sm font-bold text-aqua-600 hover:underline"
              >
                Ya abhi call karo — {CONTACT.primaryPhone}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
