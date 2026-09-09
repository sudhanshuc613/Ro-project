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
import AreaPicker from '@/components/home/AreaPicker';
import { REFERRAL } from '@/lib/referral';

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
  /* Optional and collapsed by default. The measured penalty for extra form
     fields is 5-11% per field, so a referral input can never be allowed to
     sit in the main three-field path — it opens only if the customer has a
     code to enter. */
  const [refCode, setRefCode] = useState('');
  const [showRef, setShowRef] = useState(false);

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
          referralCode: refCode.trim() || undefined,
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
    /* data-shared-ui marks this as template chrome, not page content. The
       doorway test in verify-area-depth.sh strips it the same way it strips
       nav and footer — an identical booking widget on every page is expected
       and says nothing about whether the surrounding copy is distinct. */
    <form
      onSubmit={submit}
      data-shared-ui="booking-form"
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
          {/* Was a native <select> of 63 options. Replaced 9 Sep 2026 after a
              report that the list rendered white-on-white inside the dark hero
              panels — and because eight scroll-flicks to reach "Saguna More"
              on a 360px phone was costing bookings regardless of colour.
              AreaPicker filters by name, pincode and landmark. */}
          <AreaPicker value={areaSlug} onChange={setAreaSlug} id="qbf-area" />
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

        {/* Referral — collapsed. Each extra visible field costs 5-11% of
            conversions, so this stays out of the three-field path until the
            customer says they have a code. */}
        {!showRef ? (
          <button
            type="button"
            onClick={() => setShowRef(true)}
            className="text-xs font-bold text-aqua-600 hover:underline"
          >
            + Referral code hai? ₹{REFERRAL.friendDiscount} kam lagega
          </button>
        ) : (
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
              Referral code
            </span>
            <input
              type="text"
              value={refCode}
              onChange={(e) => setRefCode(e.target.value.toUpperCase())}
              placeholder="AP-XXXX"
              maxLength={12}
              autoCapitalize="characters"
              className="w-full rounded-xl border border-navy-200 bg-white px-3 py-3 font-mono text-base tracking-wider text-navy-700 outline-none transition focus:border-aqua-500 focus:ring-2 focus:ring-aqua-100"
            />
            <span className="mt-1 block text-[11px] text-muted">
              Visit charge ₹{SERVICE.visitCharge} ki jagah ₹{REFERRAL.friendPays} lagega.
            </span>
          </label>
        )}
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
