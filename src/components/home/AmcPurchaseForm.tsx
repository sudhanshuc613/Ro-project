'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { formatINR } from '@/lib/utils/format';

interface Props {
  planKey: string;
  planName: string;
  price: number;
  visits: number;
  popular?: boolean;
}

export default function AmcPurchaseForm({ planKey, planName, price, visits, popular }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', addressLine: '', pincode: '',
    machineBrand: '', machineModel: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ firstVisit: string } | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = ['customerPhone', 'pincode'].includes(k) ? e.target.value.replace(/\D/g, '') : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((p) => ({ ...p, [k]: [] }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/amc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.message ?? 'Could not activate');
      }
      setDone({
        firstVisit: new Date(data.firstVisit).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric',
        }),
      });
      window.gtag?.('event', 'purchase', { value: price, currency: 'INR', items: [{ item_name: planName }] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`mt-6 block w-full rounded-xl py-3 text-center font-bold transition ${
          popular
            ? 'bg-cta-orange text-white hover:bg-cta-orangeDark'
            : 'border border-navy-200 text-navy-700 hover:bg-navy-50'
        }`}
      >
        Choose {planName.replace(' AMC', '')}
      </button>
    );
  }

  if (done) {
    return (
      <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-center ring-1 ring-emerald-200">
        <p className="text-3xl">✅</p>
        <p className="mt-2 font-display font-bold text-emerald-900">{planName} Activated</p>
        <p className="mt-1 text-sm text-emerald-800">
          First visit scheduled for <strong>{done.firstVisit}</strong>
        </p>
        <p className="mt-2 text-xs text-emerald-700">
          We&apos;ll call you within 30 minutes to confirm. Pay after the first visit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3 rounded-xl bg-navy-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-navy-700">{planName} — {formatINR(price)}/yr</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted hover:underline">
          Cancel
        </button>
      </div>

      <Input placeholder="Your name *" value={form.customerName} onChange={set('customerName')} error={errors.customerName?.[0]} required />
      <Input placeholder="Mobile number *" value={form.customerPhone} onChange={set('customerPhone')} error={errors.customerPhone?.[0]} maxLength={10} inputMode="numeric" required />
      <Input placeholder="Full address in Patna *" value={form.addressLine} onChange={set('addressLine')} error={errors.addressLine?.[0]} required />
      <Input placeholder="Pincode *" value={form.pincode} onChange={set('pincode')} error={errors.pincode?.[0]} maxLength={6} inputMode="numeric" required />
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="RO brand" value={form.machineBrand} onChange={set('machineBrand')} />
        <Input placeholder="Model" value={form.machineModel} onChange={set('machineModel')} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-cta-orange py-3 font-bold text-white transition hover:bg-cta-orangeDark disabled:opacity-60"
      >
        {loading ? 'Activating…' : `Activate ${planName.replace(' AMC', '')} →`}
      </button>
      <p className="text-center text-xs text-muted">
        No advance payment. Pay after your first service visit.
      </p>
    </form>
  );
}

function Input({
  error, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input
        {...props}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-navy-100 focus:border-aqua-500 focus:ring-aqua-200'
        }`}
      />
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
