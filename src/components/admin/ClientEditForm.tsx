'use client';

/**
 * Grahak ki contact detail — khol kar badlo.
 *
 * Default me band (collapsed) rakha hai, kyunki is page ka asli kaam
 * machine aur AMC dekhna hai; pata saal me ek baar badalta hai.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface ClientFields {
  id: string;
  fullName: string;
  phone: string;
  altPhone: string;
  email: string;
  addressLine: string;
  landmark: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  notes: string;
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy-700 outline-none focus:border-aqua-500';

export default function ClientEditForm({ client }: { client: ClientFields }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(client);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const set = <K extends keyof ClientFields>(k: K, v: ClientFields[K]) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    setBusy(true);
    setErrors({});
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Grahak ki detail save ho gayi');
        setOpen(false);
        router.refresh();
      } else {
        setErrors(data?.errors?.fieldErrors ?? {});
        toast.error(data?.message ?? 'Save nahi hua');
      }
    } catch {
      toast.error('Server se baat nahi ho payi');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        ✏️ Detail badlo
      </button>
    );
  }

  return (
    <section className="rounded-2xl border-2 border-aqua-300 bg-aqua-50/40 p-5">
      <h2 className="font-display text-base font-bold text-navy-700">Grahak ki detail</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <L label="Naam *" err={errors.fullName?.[0]}><input className={inputCls} value={f.fullName} onChange={(e) => set('fullName', e.target.value)} /></L>
        <L label="Phone *" err={errors.phone?.[0]}><input className={inputCls} value={f.phone} onChange={(e) => set('phone', e.target.value)} /></L>
        <L label="Doosra phone" err={errors.altPhone?.[0]}><input className={inputCls} value={f.altPhone} onChange={(e) => set('altPhone', e.target.value)} /></L>
        <L label="Pata" className="sm:col-span-2"><textarea rows={2} className={inputCls} value={f.addressLine} onChange={(e) => set('addressLine', e.target.value)} /></L>
        <L label="Landmark"><input className={inputCls} value={f.landmark} onChange={(e) => set('landmark', e.target.value)} /></L>
        <L label="Area"><input className={inputCls} value={f.area} onChange={(e) => set('area', e.target.value)} /></L>
        <L label="Shahar"><input className={inputCls} value={f.city} onChange={(e) => set('city', e.target.value)} /></L>
        <L label="Pincode" err={errors.pincode?.[0]}><input className={inputCls} inputMode="numeric" maxLength={6} value={f.pincode} onChange={(e) => set('pincode', e.target.value)} /></L>
        <L label="Email" err={errors.email?.[0]}><input className={inputCls} value={f.email} onChange={(e) => set('email', e.target.value)} /></L>
        <L label="GSTIN" err={errors.gstin?.[0]}><input className={inputCls} value={f.gstin} onChange={(e) => set('gstin', e.target.value.toUpperCase())} /></L>
        <L label="Note (apne liye)" className="sm:col-span-3"><textarea rows={2} className={inputCls} value={f.notes} onChange={(e) => set('notes', e.target.value)} /></L>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={save} disabled={busy} className="rounded-lg bg-[#0056b3] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
          {busy ? 'Save ho raha…' : 'Save'}
        </button>
        <button onClick={() => { setF(client); setOpen(false); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700">
          Rehne do
        </button>
      </div>
    </section>
  );
}

function L({ label, children, className = '', err }: { label: string; children: React.ReactNode; className?: string; err?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">{label}</span>
      {children}
      {err ? <span className="mt-1 block text-[11px] font-semibold text-red-600">{err}</span> : null}
    </label>
  );
}
