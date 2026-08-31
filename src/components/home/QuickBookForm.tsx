'use client';

/**
 * QuickBookForm — the three-field version, for people who will not fill a form.
 *
 * The existing ServiceBookingForm asks for name, phone, pincode, address,
 * landmark, service type, issue category, description, date and slot. That is
 * the right form for someone who has already decided. It is the wrong form for
 * someone still deciding.
 *
 * The numbers behind this component:
 *  • Forms with three or fewer fields convert ~25% better than six-plus.
 *  • Each additional field costs roughly 5-11% of completions.
 *  • ~80% of this site's traffic is mobile, where every field costs more.
 *
 * So this asks for exactly what is needed to ring someone back: phone, area,
 * problem. Everything else gets collected on the call — which was always going
 * to happen anyway.
 *
 * It posts to the same /api/service-requests endpoint, so it inherits the OTP
 * settings, rate limiting, technician auto-assignment and owner alerting that
 * are already in place. No parallel code path to keep in sync.
 */
import { useMemo, useState } from 'react';
import { CONTACT, ISSUE_CATEGORIES, SERVICE } from '@/lib/constants';
import { SERVICE_AREAS } from '@/lib/seo/patna-service-data';
import TrustBadges from '@/components/ui/TrustBadges';

type Step = 'form' | 'done';

export default function QuickBookForm({
  slotsLeft,
  urgent,
  slotMessage,
}: {
  slotsLeft?: number;
  urgent?: boolean;
  slotMessage?: string;
}) {
  const [phone, setPhone] = useState('');
  const [areaSlug, setAreaSlug] = useState('');
  const [issue, setIssue] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [ticket, setTicket] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const area = useMemo(
    () => SERVICE_AREAS.find((a) => a.slug === areaSlug),
    [areaSlug],
  );

  const phoneOk = /^[6-9]\d{9}$/.test(phone);
  const canSubmit = phoneOk && Boolean(areaSlug) && Boolean(issue) && !busy;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !area) return;
    setBusy(true);
    setError('');

    try {
      const label = ISSUE_CATEGORIES.find((c) => c.value === issue)?.label ?? issue;
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: `Quick booking — ${area.name}`,
          customerPhone: phone,
          pincode: area.pincodes[0],
          area: area.name,
          addressLine: `${area.name}, Patna`,
          serviceType: 'REPAIR',
          issueCategory: issue,
          issueDescription: label,
          source: 'WEBSITE',
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.message ?? `Kuch gadbad hui. Seedha call karo: ${CONTACT.primaryPhone}`);
        return;
      }

      setTicket(data.ticketNumber ?? '');
      setStep('done');

      // GA4 — same event name the rest of the site uses for lead conversion.
      if (typeof window !== 'undefined' && typeof (window as never as { gtag?: unknown }).gtag === 'function') {
        (window as unknown as { gtag: (...a: unknown[]) => void }).gtag('event', 'generate_lead', {
          method: 'quick_book',
          area: area.name,
        });
      }
    } catch {
      setError(`Network problem. Seedha call karo: ${CONTACT.primaryPhone}`);
    } finally {
      setBusy(false);
    }
  }

  /* ── Success ── */
  if (step === 'done') {
    return (
      <div className="anim-scale-in rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center md:p-8">
        <p className="text-4xl" aria-hidden="true">✅</p>
        <h3 className="mt-3 font-display text-xl font-extrabold text-emerald-900">
          Ho gaya! Hum 30 minute me call karenge
        </h3>
        {ticket && (
          <p className="mt-2 text-sm text-emerald-800">
            Aapka ticket: <strong className="font-mono">{ticket}</strong>
          </p>
        )}
        <p className="mt-3 text-sm text-emerald-800">
          Jaldi hai? Abhi call kar lijiye —
        </p>
        <a
          href={CONTACT.primaryTel}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cta-green px-6 py-3 font-bold text-white transition hover:bg-cta-greenDark"
        >
          📞 {CONTACT.primaryPhone}
        </a>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-navy-100 bg-white p-5 shadow-card md:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-extrabold text-navy-700 md:text-xl">
          30 second me booking
        </h3>
        {slotMessage && (
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              urgent
                ? 'bg-orange-100 text-orange-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {urgent ? '⚡ ' : '✓ '}{slotMessage}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* 1 — phone */}
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
            1 · Aapka mobile number
          </span>
          <div className="flex items-center overflow-hidden rounded-xl border border-navy-200 transition focus-within:border-aqua-500 focus-within:ring-2 focus-within:ring-aqua-100">
            <span className="border-r border-navy-100 bg-sand-200 px-3 py-3 text-sm font-bold text-navy-600">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="98765 43210"
              className="min-w-0 flex-1 px-3 py-3 text-base outline-none"
              aria-label="Mobile number"
            />
            {phoneOk && <span className="px-3 text-emerald-600" aria-hidden="true">✓</span>}
          </div>
        </label>

        {/* 2 — area */}
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
            2 · Aapka area
          </span>
          <select
            value={areaSlug}
            onChange={(e) => setAreaSlug(e.target.value)}
            className="w-full rounded-xl border border-navy-200 bg-white px-3 py-3 text-base outline-none transition focus:border-aqua-500 focus:ring-2 focus:ring-aqua-100"
            aria-label="Area"
          >
            <option value="">Area chuniye…</option>
            {SERVICE_AREAS.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name} — {a.pincodes[0]}
              </option>
            ))}
          </select>
        </label>

        {/* 3 — problem, as tappable chips */}
        <div>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            3 · Kya problem hai
          </span>
          <div className="flex flex-wrap gap-2">
            {ISSUE_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setIssue(c.value)}
                aria-pressed={issue === c.value}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  issue === c.value
                    ? 'bg-aqua-500 text-white shadow-sm'
                    : 'bg-sand-200 text-navy-700 hover:bg-sand-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="anim-shake mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-4 w-full rounded-xl bg-cta-orange py-4 text-base font-extrabold text-white transition hover:bg-cta-orangeDark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? 'Bhej rahe hain…' : `Book Now — ₹${SERVICE.visitCharge} visit`}
      </button>

      <p className="mt-2 text-center text-xs text-muted">
        ✓ 30 minute me call · ✓ Koi advance nahi · ✓ Kaam pasand na aaye to paisa nahi
      </p>

      <TrustBadges className="mt-3 justify-center" />

      <div className="mt-4 border-t border-navy-50 pt-3 text-center">
        <p className="text-xs text-muted">Form nahi bharna? Seedha baat karo —</p>
        <div className="mt-2 flex justify-center gap-2">
          <a
            href={CONTACT.primaryTel}
            className="flex-1 rounded-xl bg-cta-green px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cta-greenDark"
          >
            📞 Call
          </a>
          <a
            href={`https://wa.me/91${CONTACT.primaryPhone}?text=${encodeURIComponent('Namaste, RO service chahiye')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </form>
  );
}
