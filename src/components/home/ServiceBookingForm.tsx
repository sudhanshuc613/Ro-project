'use client';

/**
 * ServiceBookingForm — the Patna local-service conversion engine.
 *
 * Design decisions that directly protect conversion rate:
 *  • NO login required — a phone number is the only hard identifier.
 *  • Live pincode serviceability check with graceful non-serviceable fallback.
 *  • Optimistic UI + ticket number returned instantly, WhatsApp confirmation
 *    fired server-side to both the customer and the two admin numbers.
 *  • Call / WhatsApp escape hatches always visible for users who won't fill forms.
 */
import { useState, useTransition } from 'react';
import { CONTACT, ISSUE_CATEGORIES, TIME_SLOTS, SERVICE } from '@/lib/constants';

type Status = 'idle' | 'checking' | 'serviceable' | 'not-serviceable';

interface FormState {
  customerName: string;
  customerPhone: string;
  pincode: string;
  addressLine: string;
  landmark: string;
  serviceType: string;
  issueCategory: string;
  issueDescription: string;
  preferredDate: string;
  preferredSlot: string;
}

const INITIAL: FormState = {
  customerName: '', customerPhone: '', pincode: '', addressLine: '', landmark: '',
  serviceType: 'REPAIR', issueCategory: '', issueDescription: '',
  preferredDate: '', preferredSlot: '',
};

export default function ServiceBookingForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [pinStatus, setPinStatus] = useState<Status>('idle');
  const [pinMsg, setPinMsg] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [ticket, setTicket] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [isPending, startTransition] = useTransition();

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  /* ── Live pincode serviceability ─────────────────────────────────────── */
  async function checkPincode(pin: string) {
    setForm((f) => ({ ...f, pincode: pin }));
    if (!/^\d{6}$/.test(pin)) { setPinStatus('idle'); setPinMsg(''); return; }
    setPinStatus('checking');
    try {
      const res = await fetch(`/api/pincode/check?pincode=${pin}&type=service`);
      const data = await res.json();
      if (data.serviceAvailable) {
        setPinStatus('serviceable');
        setPinMsg(`✓ We service ${data.city} — visit charge ₹${data.visitCharge}`);
      } else {
        setPinStatus('not-serviceable');
        setPinMsg(`On-site service is Patna-only. We can still ship parts to ${data.city || 'your area'}.`);
      }
    } catch {
      setPinStatus('idle'); setPinMsg('');
    }
  }

  /* ── Client-side validation ──────────────────────────────────────────── */
  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (form.customerName.trim().length < 2) e.customerName = 'Please enter your name';
    if (!/^[6-9]\d{9}$/.test(form.customerPhone)) e.customerPhone = 'Enter a valid 10-digit mobile number';
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    if (form.addressLine.trim().length < 10) e.addressLine = 'Please enter your full address';
    if (form.issueDescription.trim().length < 10) e.issueDescription = 'Briefly describe the problem (min 10 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    startTransition(async () => {
      try {
        const res = await fetch('/api/service-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, source: 'WEBSITE_FORM' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? 'Something went wrong');
        setTicket(data.ticketNumber);
        setForm(INITIAL);
        setPinStatus('idle');
          window.gtag?.('event', 'generate_lead', { value: SERVICE.visitCharge, currency: 'INR' });
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Could not submit. Please call us.');
      }
    });
  }

  /* ── Success state ───────────────────────────────────────────────────── */
  if (ticket) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-2xl md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-9 w-9 text-cta-green" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-5 font-display text-2xl font-bold text-navy-700">Request Received!</h3>
        <p className="mt-2 text-muted">Your ticket number is</p>
        <p className="mt-1 font-display text-3xl font-extrabold tracking-wide text-aqua-600">{ticket}</p>
        <p className="mx-auto mt-4 max-w-sm text-sm text-muted">
          Our team will call you within 30 minutes to confirm the technician visit.
          A confirmation has been sent to your WhatsApp.
        </p>

        <a
          href={`/track/${ticket}`}
          className="mt-4 inline-block rounded-xl bg-aqua-500 px-6 py-3 font-bold text-white transition hover:bg-aqua-600"
        >
          📍 Track this request live
        </a>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={CONTACT.primaryTel} className="rounded-xl bg-cta-green px-6 py-3 font-bold text-white transition hover:bg-cta-greenDark">
            Call {CONTACT.primaryPhone}
          </a>
          <button onClick={() => setTicket(null)} className="rounded-xl bg-navy-50 px-6 py-3 font-bold text-navy-700 transition hover:bg-navy-100">
            Book Another
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ────────────────────────────────────────────────────────────── */
  return (
    <div className="rounded-3xl bg-white p-6 shadow-2xl md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-navy-700">Book a Technician</h3>
          <p className="mt-1 text-sm text-muted">Fill this in 40 seconds — we call you back.</p>
        </div>
        <span className="shrink-0 rounded-lg bg-orange-50 px-3 py-2 text-center ring-1 ring-orange-200">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-orange-600">Visit</span>
          <span className="block font-display text-lg font-extrabold text-cta-orange">₹{SERVICE.visitCharge}</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your Name" required error={errors.customerName}>
            <input
              type="text" value={form.customerName} onChange={set('customerName')}
              placeholder="Rahul Kumar" autoComplete="name" className={inputCls(!!errors.customerName)}
            />
          </Field>

          <Field label="Mobile Number" required error={errors.customerPhone}>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-navy-100 bg-navy-50 px-3 text-sm font-semibold text-navy-500">+91</span>
              <input
                type="tel" inputMode="numeric" maxLength={10}
                value={form.customerPhone}
                onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value.replace(/\D/g, '') }))}
                placeholder="98765 43210" autoComplete="tel-national"
                className={`${inputCls(!!errors.customerPhone)} rounded-l-none`}
              />
            </div>
          </Field>
        </div>

        <Field label="Pincode" required error={errors.pincode} hint={pinMsg}
          hintTone={pinStatus === 'serviceable' ? 'ok' : pinStatus === 'not-serviceable' ? 'warn' : 'muted'}>
          <div className="relative">
            <input
              type="text" inputMode="numeric" maxLength={6} value={form.pincode}
              onChange={(e) => checkPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="800020" autoComplete="postal-code" className={inputCls(!!errors.pincode)}
            />
            {pinStatus === 'checking' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner />
              </span>
            )}
          </div>
        </Field>

        <Field label="Full Address" required error={errors.addressLine}>
          <textarea
            rows={2} value={form.addressLine} onChange={set('addressLine')}
            placeholder="House / Flat no., Street, Area, Patna"
            className={inputCls(!!errors.addressLine)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Landmark">
            <input type="text" value={form.landmark} onChange={set('landmark')} placeholder="Near Ashiana More" className={inputCls(false)} />
          </Field>

          <Field label="Service Needed">
            <select value={form.serviceType} onChange={set('serviceType')} className={inputCls(false)}>
              <option value="REPAIR">RO Repair</option>
              <option value="INSTALLATION">New Installation</option>
              <option value="FILTER_CHANGE">Filter / Membrane Change</option>
              <option value="AMC_VISIT">AMC Service Visit</option>
              <option value="WATER_TEST">Water TDS Test</option>
              <option value="UNINSTALL_SHIFT">Uninstall & Shifting</option>
            </select>
          </Field>
        </div>

        <Field label="What's the problem?">
          <select value={form.issueCategory} onChange={set('issueCategory')} className={inputCls(false)}>
            <option value="">Select an issue…</option>
            {ISSUE_CATEGORIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </Field>

        <Field label="Describe the issue" required error={errors.issueDescription}>
          <textarea
            rows={3} value={form.issueDescription} onChange={set('issueDescription')}
            placeholder="e.g. Machine is running but no water is coming out since yesterday. Kent brand, about 3 years old."
            className={inputCls(!!errors.issueDescription)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preferred Date">
            <input type="date" value={form.preferredDate} onChange={set('preferredDate')}
              min={new Date().toISOString().slice(0, 10)} className={inputCls(false)} />
          </Field>
          <Field label="Preferred Time">
            <select value={form.preferredSlot} onChange={set('preferredSlot')} className={inputCls(false)}>
              <option value="">Any time</option>
              {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        {submitError && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{submitError}</p>
        )}

        <button
          type="submit" disabled={isPending}
          className="w-full rounded-xl bg-cta-orange py-4 font-display text-lg font-bold text-white shadow-cta transition hover:bg-cta-orangeDark active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Submitting…' : 'Book Service Now →'}
        </button>

        <p className="text-center text-xs text-muted">
          No advance payment. Pay ₹{SERVICE.visitCharge} only after the technician arrives.
        </p>

        {/* Always-available escape hatches */}
        <div className="grid grid-cols-2 gap-3 border-t border-navy-100 pt-4">
          <a href={CONTACT.primaryTel}
            className="flex items-center justify-center gap-2 rounded-xl bg-navy-50 py-3 text-sm font-bold text-navy-700 transition hover:bg-navy-100">
            📞 Call Now
          </a>
          <a href={CONTACT.whatsappLink()} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100">
            💬 WhatsApp
          </a>
        </div>
      </form>
    </div>
  );
}

/* ── Presentational helpers ─────────────────────────────────────────────── */
function inputCls(hasError: boolean) {
  return [
    'w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-slate-400',
    'transition focus:outline-none focus:ring-2',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
      : 'border-navy-100 focus:border-aqua-500 focus:ring-aqua-200',
  ].join(' ');
}

function Field({
  label, required, error, hint, hintTone = 'muted', children,
}: {
  label: string; required?: boolean; error?: string; hint?: string;
  hintTone?: 'ok' | 'warn' | 'muted'; children: React.ReactNode;
}) {
  const toneCls = { ok: 'text-emerald-600', warn: 'text-amber-600', muted: 'text-muted' }[hintTone];
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
      {!error && hint && <span className={`mt-1 block text-xs font-medium ${toneCls}`}>{hint}</span>}
    </label>
  );
}

const Spinner = () => (
  <svg className="h-5 w-5 animate-spin text-aqua-500" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);
