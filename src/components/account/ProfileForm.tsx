'use client';

/**
 * Profile editor.
 *
 * Phone is READ-ONLY and that is deliberate: it is the login identity and the
 * number technicians call. Changing it needs OTP re-verification, which is a
 * separate flow — silently letting someone edit it would let a shared device
 * hijack an account.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ProfileForm({
  initial,
  hasPassword,
}: {
  initial: {
    fullName: string;
    email: string;
    phone: string;
    whatsappOptIn: boolean;
    marketingOptIn: boolean;
  };
  hasPassword: boolean;
}) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const dirty =
    f.fullName !== initial.fullName ||
    f.email !== initial.email ||
    f.whatsappOptIn !== initial.whatsappOptIn ||
    f.marketingOptIn !== initial.marketingOptIn;

  async function save() {
    setSaving(true);
    setErrors({});
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: f.fullName,
          email: f.email || null,
          whatsappOptIn: f.whatsappOptIn,
          marketingOptIn: f.marketingOptIn,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        toast.error(data.message ?? 'Could not save');
        return;
      }
      toast.success('Profile updated');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (pw.next !== pw.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (pw.next.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pw.current || undefined, newPassword: pw.next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message ?? 'Could not change password');
        return;
      }
      toast.success('Password updated');
      setPw({ current: '', next: '', confirm: '' });
      setPwOpen(false);
      router.refresh();
    } finally {
      setPwSaving(false);
    }
  }

  const inp =
    'w-full rounded-xl border-navy-200 bg-white px-3.5 py-2.5 text-sm shadow-[inset_0_1px_2px_rgba(10,31,60,.04)] focus:border-aqua-500 focus:ring-2 focus:ring-aqua-200';

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-navy-700">Full name</span>
            <input value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} className={inp} />
            {errors.fullName && <span className="mt-1 block text-xs text-red-600">{errors.fullName[0]}</span>}
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-navy-700">Email</span>
            <input
              type="email"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              placeholder="you@example.com"
              className={inp}
            />
            {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email[0]}</span>}
            <span className="mt-1 block text-[11px] text-muted">Used for invoices and order updates.</span>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-bold text-navy-700">Mobile number</span>
            <div className="flex items-center gap-2">
              <input value={`+91 ${f.phone}`} readOnly className={`${inp} cursor-not-allowed bg-navy-50 text-muted`} />
              <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                Verified
              </span>
            </div>
            <span className="mt-1 block text-[11px] text-muted">
              This is your login ID and the number our technician calls. To change it, message us on WhatsApp — we verify by OTP.
            </span>
          </label>
        </div>

        <div className="mt-5 space-y-2.5 border-t border-navy-100 pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Communication</p>

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={f.whatsappOptIn}
              onChange={(e) => setF({ ...f, whatsappOptIn: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-navy-300 text-aqua-600 focus:ring-aqua-500"
            />
            <span className="text-sm">
              <span className="font-semibold text-navy-700">Service updates on WhatsApp</span>
              <span className="block text-xs text-muted">
                Technician assigned, on the way, job done, filter due. Recommended — this is how you avoid calling to ask.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={f.marketingOptIn}
              onChange={(e) => setF({ ...f, marketingOptIn: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-navy-300 text-aqua-600 focus:ring-aqua-500"
            />
            <span className="text-sm">
              <span className="font-semibold text-navy-700">Offers and new products</span>
              <span className="block text-xs text-muted">Occasional only. Turning this off never affects service messages.</span>
            </span>
          </label>
        </div>

        <button
          onClick={save}
          disabled={!dirty || saving}
          className="mt-5 rounded-xl bg-cta-orange px-6 py-3 text-sm font-bold text-white shadow-cta transition hover:bg-cta-orangeDark disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {/* Password */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-navy-700">Password</p>
            <p className="text-xs text-muted">
              {hasPassword
                ? 'You can sign in with phone + password or phone + OTP.'
                : 'You sign in with OTP. Set a password for faster login.'}
            </p>
          </div>
          <button
            onClick={() => setPwOpen((v) => !v)}
            className="rounded-xl bg-navy-50 px-4 py-2.5 text-sm font-bold text-navy-700 hover:bg-navy-100"
          >
            {pwOpen ? 'Cancel' : hasPassword ? 'Change password' : 'Set password'}
          </button>
        </div>

        {pwOpen && (
          <div className="mt-4 space-y-3 border-t border-navy-100 pt-4">
            {hasPassword && (
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-navy-700">Current password</span>
                <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className={inp} autoComplete="current-password" />
              </label>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-navy-700">New password</span>
                <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className={inp} autoComplete="new-password" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-navy-700">Confirm new password</span>
                <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className={inp} autoComplete="new-password" />
              </label>
            </div>
            <p className="text-[11px] text-muted">At least 8 characters.</p>
            <button
              onClick={changePassword}
              disabled={pwSaving || !pw.next}
              className="rounded-xl bg-navy-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-navy-600 disabled:opacity-50"
            >
              {pwSaving ? 'Updating…' : 'Update password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
