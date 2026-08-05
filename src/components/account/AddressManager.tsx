'use client';

/**
 * Saved addresses.
 *
 * Extra beyond a plain CRUD list: a live serviceability check against
 * /api/pincode/check. If the customer saves a Patna pincode we tell them the
 * visit charge for that area right there; if it is outside the service zone
 * we say delivery-only rather than letting them find out at booking time.
 */
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface AddressRow {
  id: string;
  label: string;
  contactName: string;
  contactPhone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const EMPTY = {
  id: undefined as string | undefined,
  label: 'HOME',
  contactName: '',
  contactPhone: '',
  line1: '',
  line2: '',
  landmark: '',
  city: 'Patna',
  state: 'Bihar',
  pincode: '',
  isDefault: false,
};

const LABEL_ICON: Record<string, string> = { HOME: '🏠', OFFICE: '🏢', OTHER: '📍' };

/** Mirrors the shape returned by /api/pincode/check */
interface PinInfo {
  serviceAvailable: boolean;
  deliveryAvailable: boolean;
  visitCharge?: number;
  city?: string;
  state?: string;
  etaDays?: number;
}

export default function AddressManager({ addresses }: { addresses: AddressRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<typeof EMPTY | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pin, setPin] = useState<PinInfo | null>(null);
  const [checking, setChecking] = useState(false);

  const code = editing?.pincode ?? '';

  // Debounced serviceability lookup as the pincode is typed.
  useEffect(() => {
    if (code.length !== 6) {
      setPin(null);
      return;
    }
    let cancelled = false;
    setChecking(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pincode/check?pincode=${code}`);
        const data = await res.json();
        if (!cancelled) {
          setPin(data);
          // Auto-fill city/state so the customer types less
          setEditing((prev) =>
            prev && data.city ? { ...prev, city: data.city, state: data.state ?? prev.state } : prev,
          );
        }
      } catch {
        if (!cancelled) setPin(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [code]);

  async function save() {
    if (!editing) return;
    setErrors({});
    const isEdit = Boolean(editing.id);

    const res = await fetch('/api/account/addresses', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (data.errors) setErrors(data.errors);
      toast.error(data.message ?? 'Could not save address');
      return;
    }
    toast.success(isEdit ? 'Address updated' : 'Address saved');
    setEditing(null);
    setPin(null);
    start(() => router.refresh());
  }

  async function setDefault(id: string) {
    const res = await fetch('/api/account/addresses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, onlyDefault: true }),
    });
    if (!res.ok) return toast.error('Could not update');
    toast.success('Default address updated');
    start(() => router.refresh());
  }

  async function remove(id: string) {
    if (!confirm('Delete this address?')) return;
    const res = await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(data.message ?? 'Could not delete');
    toast.success('Address deleted');
    start(() => router.refresh());
  }

  const f = editing;
  const inp =
    'w-full rounded-xl border-navy-200 bg-white px-3.5 py-2.5 text-sm shadow-[inset_0_1px_2px_rgba(10,31,60,.04)] focus:border-aqua-500 focus:ring-2 focus:ring-aqua-200';
  const err = (k: string) => errors[k]?.[0];

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setErrors({});
            setPin(null);
            setEditing({ ...EMPTY });
          }}
          className="rounded-xl bg-cta-orange px-5 py-2.5 text-sm font-bold text-white shadow-cta transition hover:bg-cta-orangeDark"
        >
          + Add address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white/60 px-6 py-14 text-center">
          <p className="text-4xl">📍</p>
          <p className="mt-3 font-display text-lg font-bold text-navy-700">No saved addresses</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
            Save one and checkout plus service booking both get faster.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className={`card p-5 ${a.isDefault ? 'ring-2 ring-aqua-400' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy-50 px-2.5 py-1 text-[11px] font-bold text-navy-700">
                  {LABEL_ICON[a.label]} {a.label}
                </span>
                {a.isDefault && (
                  <span className="rounded-md bg-aqua-50 px-2 py-0.5 text-[10px] font-bold text-aqua-700">
                    DEFAULT
                  </span>
                )}
              </div>

              <p className="mt-3 font-bold text-navy-700">{a.contactName}</p>
              <p className="text-sm text-muted">+91 {a.contactPhone}</p>
              <p className="mt-2 text-sm text-navy-600">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ''}
                {a.landmark ? <><br />Near {a.landmark}</> : null}
                <br />
                {a.city}, {a.state} – {a.pincode}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    setEditing({
                      ...a,
                      line2: a.line2 ?? '',
                      landmark: a.landmark ?? '',
                    })
                  }
                  className="rounded-lg bg-navy-50 px-3 py-1.5 text-xs font-bold text-navy-700 hover:bg-navy-100"
                >
                  Edit
                </button>
                {!a.isDefault && (
                  <button
                    onClick={() => setDefault(a.id)}
                    disabled={pending}
                    className="rounded-lg bg-aqua-50 px-3 py-1.5 text-xs font-bold text-aqua-700 hover:bg-aqua-100 disabled:opacity-50"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => remove(a.id)}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {f && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-navy-900/50 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-lift sm:rounded-2xl sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-extrabold text-navy-700">
                {f.id ? 'Edit address' : 'Add address'}
              </h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-2 text-muted hover:bg-navy-50" aria-label="Close">✕</button>
            </div>

            <div className="mt-5 space-y-3.5">
              <div className="flex gap-2">
                {(['HOME', 'OFFICE', 'OTHER'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setEditing({ ...f, label: l })}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                      f.label === l ? 'bg-navy-700 text-white' : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
                    }`}
                  >
                    {LABEL_ICON[l]} {l}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-navy-700">Full name *</span>
                  <input value={f.contactName} onChange={(e) => setEditing({ ...f, contactName: e.target.value })} className={inp} />
                  {err('contactName') && <span className="mt-1 block text-xs text-red-600">{err('contactName')}</span>}
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-navy-700">Mobile *</span>
                  <input
                    value={f.contactPhone}
                    onChange={(e) => setEditing({ ...f, contactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    inputMode="numeric"
                    placeholder="9876543210"
                    className={inp}
                  />
                  {err('contactPhone') && <span className="mt-1 block text-xs text-red-600">{err('contactPhone')}</span>}
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-navy-700">House / flat, building *</span>
                <input value={f.line1} onChange={(e) => setEditing({ ...f, line1: e.target.value })} placeholder="House 42, Shanti Apartments" className={inp} />
                {err('line1') && <span className="mt-1 block text-xs text-red-600">{err('line1')}</span>}
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-navy-700">Road / area</span>
                <input value={f.line2 ?? ''} onChange={(e) => setEditing({ ...f, line2: e.target.value })} placeholder="Kankarbagh Main Road" className={inp} />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-navy-700">Landmark</span>
                <input value={f.landmark ?? ''} onChange={(e) => setEditing({ ...f, landmark: e.target.value })} placeholder="Near Ashiana Mor" className={inp} />
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-navy-700">Pincode *</span>
                  <input
                    value={f.pincode}
                    onChange={(e) => setEditing({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    inputMode="numeric"
                    placeholder="800020"
                    className={inp}
                  />
                  {err('pincode') && <span className="mt-1 block text-xs text-red-600">{err('pincode')}</span>}
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-navy-700">City *</span>
                  <input value={f.city} onChange={(e) => setEditing({ ...f, city: e.target.value })} className={inp} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-navy-700">State *</span>
                  <input value={f.state} onChange={(e) => setEditing({ ...f, state: e.target.value })} className={inp} />
                </label>
              </div>

              {/* Live serviceability */}
              {checking && <p className="text-xs text-muted">Checking pincode…</p>}
              {pin && !checking && (
                <div
                  className={`rounded-xl p-3.5 text-sm ${
                    pin.serviceAvailable
                      ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                      : pin.deliveryAvailable
                        ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
                        : 'bg-red-50 text-red-800 ring-1 ring-red-200'
                  }`}
                >
                  {pin.serviceAvailable ? (
                    <>✅ <strong>Technician service available here</strong>
                      {pin.visitCharge != null && <> · ₹{pin.visitCharge} visit charge</>}
                    </>
                  ) : pin.deliveryAvailable ? (
                    <>📦 <strong>Delivery available</strong> — on-site technician service is Patna-only for now.</>
                  ) : (
                    <>⚠️ We don&apos;t deliver to this pincode yet. Please call us.</>
                  )}
                </div>
              )}

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={f.isDefault}
                  onChange={(e) => setEditing({ ...f, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-navy-300 text-aqua-600 focus:ring-aqua-500"
                />
                <span className="text-sm font-semibold text-navy-700">Make this my default address</span>
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={save} disabled={pending} className="flex-1 rounded-xl bg-cta-orange py-3 font-bold text-white shadow-cta transition hover:bg-cta-orangeDark disabled:opacity-60">
                {f.id ? 'Save changes' : 'Save address'}
              </button>
              <button onClick={() => setEditing(null)} className="rounded-xl bg-navy-50 px-6 py-3 font-bold text-navy-700 hover:bg-navy-100">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
