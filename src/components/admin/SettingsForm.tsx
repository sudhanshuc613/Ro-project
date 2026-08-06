'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { ContactSettings, ServiceSettings, BannerSettings, PaymentSettings, OtpSettings } from '@/lib/settings';

interface Props {
  contact: ContactSettings;
  service: ServiceSettings;
  banner: BannerSettings;
  payment: PaymentSettings;
  otp: OtpSettings;
  razorpayConfigured: boolean;
  smsConfigured: boolean;
  whatsappConfigured: boolean;
}

export default function SettingsForm({
  contact, service, banner, payment, otp,
  razorpayConfigured, smsConfigured, whatsappConfigured,
}: Props) {
  return (
    <div className="space-y-6">
      <OtpCard initial={otp} smsConfigured={smsConfigured} whatsappConfigured={whatsappConfigured} />
      <PaymentCard initial={payment} razorpayConfigured={razorpayConfigured} />
      <ContactCard initial={contact} />
      <ServiceCard initial={service} />
      <BannerCard initial={banner} />
    </div>
  );
}

/* ── Phone verification ───────────────────────────────────────────────────
   Verification is applied where money is actually at risk, not everywhere.
   A prepaid order needs none — the payment already cleared. COD stock and
   technician trips are the real exposure. */
function OtpCard({
  initial, smsConfigured, whatsappConfigured,
}: { initial: OtpSettings; smsConfigured: boolean; whatsappConfigured: boolean }) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await saveSettings('otp', f);
      toast.success('Verification settings updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  const isDev = f.channel === 'DEV';
  const anyRequired = f.requireForLogin || f.requireForCod || f.requireForService;

  const CHANNELS = [
    {
      id: 'DEV' as const,
      title: 'Test mode — code shown on screen',
      cost: 'Free',
      desc: 'Verifies NOTHING. Anyone can type back the code they were just shown. For your own testing only — the live site refuses to run this.',
      ok: true,
      warn: true,
    },
    {
      id: 'WHATSAPP_REVERSE' as const,
      title: 'WhatsApp — customer sends us the code',
      cost: '₹0 per verification',
      desc: 'Code appears on screen, customer sends it to us from their WhatsApp. Real proof, because the message can only come from their own number. Needs the webhook set up once.',
      ok: whatsappConfigured,
      warn: false,
    },
    {
      id: 'WHATSAPP' as const,
      title: 'WhatsApp — we send the code',
      cost: '₹0.115 per verification',
      desc: 'Normal OTP delivered on WhatsApp, customer types it back. Smoothest experience. Needs an approved authentication template (~24 hours).',
      ok: whatsappConfigured,
      warn: false,
    },
    {
      id: 'SMS' as const,
      title: 'SMS (MSG91)',
      cost: '₹0.15 per verification + ₹5,900 DLT one-time',
      desc: 'Reaches every phone, including people without WhatsApp. Needs DLT registration and template approval before it works.',
      ok: smsConfigured,
      warn: false,
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-display text-lg font-bold text-navy-700">🔐 Phone Verification</h2>
      <p className="mt-0.5 text-sm text-muted">
        Stops fake numbers being used for COD orders and technician visits.
      </p>

      {isDev && anyRequired && (
        <p className="mt-4 rounded-xl bg-red-50 p-3.5 text-sm font-semibold text-red-800 ring-1 ring-red-200">
          ⚠️ Test mode cannot be combined with a live requirement — pick WhatsApp or SMS first.
        </p>
      )}

      <div className="mt-4 space-y-2.5">
        {CHANNELS.map((c) => (
          <label
            key={c.id}
            className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition ${
              f.channel === c.id ? 'border-aqua-500 bg-aqua-50' : 'border-slate-200 hover:border-slate-300'
            } ${!c.ok ? 'opacity-60' : ''}`}
          >
            <input
              type="radio"
              checked={f.channel === c.id}
              onChange={() => setF({ ...f, channel: c.id })}
              className="mt-1 h-4 w-4 text-aqua-500"
            />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-navy-700">{c.title}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  c.cost.startsWith('₹0 ') || c.cost === 'Free'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {c.cost}
                </span>
                {c.warn && (
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                    NOT SECURE
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-xs text-muted">{c.desc}</span>
              {!c.ok && (
                <span className="mt-1 block text-[11px] font-semibold text-amber-800">
                  Not configured yet — see the setup guide.
                </span>
              )}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Where to require it</p>

        <Toggle
          checked={f.requireForLogin}
          onChange={(v) => setF({ ...f, requireForLogin: v })}
          title="Signup and login"
          desc="Every account is tied to a real number."
          disabled={isDev}
        />
        <Toggle
          checked={f.requireForCod}
          onChange={(v) => setF({ ...f, requireForCod: v })}
          title="Cash on Delivery orders"
          desc="Your stock ships out before any money arrives — this is the highest-risk point."
          disabled={isDev}
        />
        <Toggle
          checked={f.requireForService}
          onChange={(v) => setF({ ...f, requireForService: v })}
          title="Service bookings"
          desc="A fake booking costs you a technician's trip, fuel and an hour. Booking needs no account today, so this is your only check."
          disabled={isDev}
        />

        <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-200">
          <Toggle
            checked={f.skipIfAlreadyVerified}
            onChange={(v) => setF({ ...f, skipIfAlreadyVerified: v })}
            title="Don't re-verify a known number"
            desc="Repeat customers sail through. Strongly recommended — re-asking every time is what makes people abandon."
          />
        </div>

        {f.requireForCod && (
          <Field label="Skip COD verification below this order value (₹)" hint="0 = always verify. A ₹300 filter is not worth the friction; a ₹12,000 purifier is.">
            <input
              type="number"
              value={f.codThreshold}
              onChange={(e) => setF({ ...f, codThreshold: Number(e.target.value) })}
              className="input"
            />
          </Field>
        )}
      </div>

      <button
        onClick={submit}
        disabled={saving}
        className="mt-5 rounded-xl bg-cta-orange px-6 py-3 font-bold text-white disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save verification settings'}
      </button>
    </section>
  );
}

/* ── Payment methods ──────────────────────────────────────────────────────
   The owner controls which payment channels are live, without touching code.
   Manual UPI matters most here: it lets real money move before a Razorpay
   account exists, which is the actual situation this business is in. */
function PaymentCard({
  initial, razorpayConfigured,
}: { initial: PaymentSettings; razorpayConfigured: boolean }) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await saveSettings('payment', f);
      toast.success('Payment settings updated — live on checkout immediately');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  const anyOn = f.codEnabled || f.razorpayEnabled || f.upiManualEnabled || f.bankTransferEnabled;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-navy-700">💳 Payment Methods</h2>
          <p className="mt-0.5 text-sm text-muted">
            Switch channels on or off. Changes apply to checkout instantly — no redeploy.
          </p>
        </div>
      </div>

      {!anyOn && (
        <p className="mt-4 rounded-xl bg-red-50 p-3.5 text-sm font-semibold text-red-800 ring-1 ring-red-200">
          ⚠️ Everything is off — customers cannot place any order right now.
        </p>
      )}

      <div className="mt-5 space-y-4">
        {/* COD */}
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <Toggle
            checked={f.codEnabled}
            onChange={(v) => setF({ ...f, codEnabled: v })}
            title="Cash on Delivery"
            desc="Customer pays the delivery person. Highest conversion in India, but you carry the risk of refusal."
          />
          {f.codEnabled && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Max order value for COD" hint="Above this, COD is hidden">
                <input
                  type="number" value={f.codMaxOrder}
                  onChange={(e) => setF({ ...f, codMaxOrder: Number(e.target.value) })}
                  className="input"
                />
              </Field>
              <Field label="COD handling charge (₹)">
                <input
                  type="number" value={f.codCharge}
                  onChange={(e) => setF({ ...f, codCharge: Number(e.target.value) })}
                  className="input"
                />
              </Field>
            </div>
          )}
        </div>

        {/* Manual UPI */}
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <Toggle
            checked={f.upiManualEnabled}
            onChange={(v) => setF({ ...f, upiManualEnabled: v })}
            title="UPI — direct to your account"
            desc="Customer pays your UPI ID and enters the UTR. You verify in your bank app and mark it paid. Zero gateway fee, no Razorpay account needed."
          />
          {f.upiManualEnabled && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Your UPI ID *" hint="e.g. 8969821440@ybl or aquanexa@okhdfcbank">
                <input
                  value={f.upiId}
                  onChange={(e) => setF({ ...f, upiId: e.target.value.trim() })}
                  placeholder="yourname@okhdfcbank"
                  className="input font-mono"
                />
              </Field>
              <Field label="Name shown to customer">
                <input
                  value={f.upiName}
                  onChange={(e) => setF({ ...f, upiName: e.target.value })}
                  className="input"
                />
              </Field>
            </div>
          )}
        </div>

        {/* Bank transfer */}
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <Toggle
            checked={f.bankTransferEnabled}
            onChange={(v) => setF({ ...f, bankTransferEnabled: v })}
            title="Bank Transfer / NEFT"
            desc="For commercial plants and bulk orders where UPI limits are too low."
          />
          {f.bankTransferEnabled && (
            <Field label="Bank details shown at checkout *" hint="Account name, number, IFSC, branch">
              <textarea
                rows={4}
                value={f.bankDetails}
                onChange={(e) => setF({ ...f, bankDetails: e.target.value })}
                placeholder={'Aqua Perl RO Service Centre\nA/C: 1234567890\nIFSC: SBIN0001234\nSBI, Kankarbagh, Patna'}
                className="input mt-1"
              />
            </Field>
          )}
        </div>

        {/* Razorpay */}
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <Toggle
            checked={f.razorpayEnabled}
            onChange={(v) => setF({ ...f, razorpayEnabled: v })}
            title="Razorpay gateway"
            desc="Cards, netbanking, wallets and UPI with automatic confirmation. Charges ~2% per transaction."
            disabled={!razorpayConfigured}
          />
          {!razorpayConfigured && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Razorpay keys are not set on the server, so this stays off even if switched on.
              Add <code className="rounded bg-white px-1">RAZORPAY_KEY_ID</code> and{' '}
              <code className="rounded bg-white px-1">RAZORPAY_KEY_SECRET</code> in Vercel →
              Settings → Environment Variables, then redeploy.
            </p>
          )}
        </div>

        <Field label="Note shown under payment options" hint="Optional — e.g. GST invoice information">
          <input
            value={f.paymentNote}
            onChange={(e) => setF({ ...f, paymentNote: e.target.value })}
            placeholder="GST invoice provided with every order."
            className="input"
          />
        </Field>
      </div>

      <button
        onClick={submit}
        disabled={saving}
        className="mt-5 rounded-xl bg-cta-orange px-6 py-3 font-bold text-white disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save payment settings'}
      </button>
    </section>
  );
}

function Toggle({
  checked, onChange, title, desc, disabled,
}: {
  checked: boolean; onChange: (v: boolean) => void;
  title: string; desc: string; disabled?: boolean;
}) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-cta-green' : 'bg-slate-300'
        } disabled:cursor-not-allowed`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
      <span>
        <span className="block font-bold text-navy-700">{title}</span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
    </label>
  );
}

/* ── Shared save helper ───────────────────────────────────────────────────── */
async function saveSettings(key: string, value: unknown) {
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  const data = await res.json();
  if (!res.ok) {
    const first = data.errors ? Object.values(data.errors).flat()[0] : null;
    throw new Error((first as string) ?? data.message ?? 'Save failed');
  }
  return data;
}

/* ── Contact ──────────────────────────────────────────────────────────────── */
function ContactCard({ initial }: { initial: ContactSettings }) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof ContactSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = ['primaryPhone', 'secondaryPhone', 'tertiaryPhone', 'whatsapp'].includes(k);
    setF({ ...f, [k]: digitsOnly ? e.target.value.replace(/\D/g, '') : e.target.value });
  };

  async function submit() {
    setSaving(true);
    try {
      await saveSettings('contact', f);
      toast.success('Contact details updated across the site');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Contact Numbers" sub="Shown in the navbar, footer, every service page and all call buttons">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Primary Phone" hint="Main number, shown first everywhere">
          <input value={f.primaryPhone} onChange={set('primaryPhone')} maxLength={10} inputMode="numeric" className={inp} />
        </Field>
        <Field label="Secondary Phone">
          <input value={f.secondaryPhone} onChange={set('secondaryPhone')} maxLength={10} inputMode="numeric" className={inp} />
        </Field>
        <Field label="Third Phone" hint="Optional — leave blank to hide">
          <input value={f.tertiaryPhone} onChange={set('tertiaryPhone')} maxLength={10} inputMode="numeric" className={inp} />
        </Field>
        <Field label="WhatsApp Number" hint="With 91 prefix, e.g. 918969821440">
          <input value={f.whatsapp} onChange={set('whatsapp')} maxLength={12} inputMode="numeric" className={inp} />
        </Field>
        <Field label="Email">
          <input value={f.email} onChange={set('email')} type="email" className={inp} />
        </Field>
        <Field label="Working Hours" hint="e.g. Mon–Sun 08:00–21:00">
          <input value={f.hours} onChange={set('hours')} className={inp} />
        </Field>
      </div>
      <SaveBtn onClick={submit} saving={saving} />
    </Card>
  );
}

/* ── Service ──────────────────────────────────────────────────────────────── */
function ServiceCard({ initial }: { initial: ServiceSettings }) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await saveSettings('service', f);
      toast.success('Service settings updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Service Settings" sub="Visit charge and service promises shown across the site">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Visit Charge (₹)" hint="Your biggest competitive advantage — competitors charge ₹350–399">
          <input
            type="number" value={f.visitCharge}
            onChange={(e) => setF({ ...f, visitCharge: Number(e.target.value) })}
            className={inp}
          />
        </Field>
        <Field label="Emergency Visit Charge (₹)" hint="Premium same-day 2-hour guarantee slot">
          <input
            type="number" value={f.emergencyCharge}
            onChange={(e) => setF({ ...f, emergencyCharge: Number(e.target.value) })}
            className={inp}
          />
        </Field>
        <Field label="Response Time" hint="e.g. 90 minutes">
          <input value={f.responseTime} onChange={(e) => setF({ ...f, responseTime: e.target.value })} className={inp} />
        </Field>
        <Field label="Repair Warranty (days)">
          <input
            type="number" value={f.warrantyDays}
            onChange={(e) => setF({ ...f, warrantyDays: Number(e.target.value) })}
            className={inp}
          />
        </Field>
        <Field label="Service City">
          <input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} className={inp} />
        </Field>
        <Field label="State">
          <input value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })} className={inp} />
        </Field>
      </div>
      <SaveBtn onClick={submit} saving={saving} />
    </Card>
  );
}

/* ── Banner ───────────────────────────────────────────────────────────────── */
function BannerCard({ initial }: { initial: BannerSettings }) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await saveSettings('banner', f);
      toast.success('Homepage banner updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Homepage Banner" sub="Hero text and the announcement strip at the very top">
      <div className="space-y-4">
        <Field label="Hero Headline">
          <input value={f.heroHeadline} onChange={(e) => setF({ ...f, heroHeadline: e.target.value })} className={inp} />
        </Field>
        <Field label="Hero Subline" hint="The orange line under the headline">
          <input value={f.heroSubline} onChange={(e) => setF({ ...f, heroSubline: e.target.value })} className={inp} />
        </Field>
        <Field label="Hero Image Path" hint="Upload to public/banners/ in GitHub, then put the path here">
          <input value={f.heroImage} onChange={(e) => setF({ ...f, heroImage: e.target.value })} className={inp} />
        </Field>
        <Field label="Top Announcement Strip">
          <input value={f.announcementText} onChange={(e) => setF({ ...f, announcementText: e.target.value })} className={inp} />
        </Field>
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox" checked={f.announcementActive}
            onChange={(e) => setF({ ...f, announcementActive: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-aqua-500 focus:ring-aqua-400"
          />
          <span className="text-sm text-navy-700">Show announcement strip</span>
        </label>
      </div>
      <SaveBtn onClick={submit} saving={saving} />
    </Card>
  );
}

/* ── UI atoms ─────────────────────────────────────────────────────────────── */
const inp =
  'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100';

function Card({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-display text-lg font-bold text-navy-700">{title}</h2>
      <p className="mt-0.5 text-sm text-muted">{sub}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-navy-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function SaveBtn({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="mt-5 rounded-lg bg-aqua-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-aqua-600 disabled:opacity-60"
    >
      {saving ? 'Saving…' : 'Save Changes'}
    </button>
  );
}
