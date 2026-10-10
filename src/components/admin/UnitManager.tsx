'use client';

/**
 * Grahak ke ghar lagi machines — jodo, badlo, mitao.
 *
 * Har card pe warranty ki patti (progress bar) dikhti hai. Yeh sirf
 * sajaavat nahi: ek nazar me dikh jaata hai ki kiski warranty khatm hone
 * wali hai — aur wahi sabse achha waqt hai AMC bechne ka.
 *
 * Warranty ki end date yahan se NAHI bheji jaati. Install date + mahine
 * server ko jaate hain aur woh khud nikaalta hai. Isliye koi 2019 wali
 * machine ki warranty 2030 tak nahi likhwa sakta.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { warrantyInfo, dueState, toInputDate, longDateIN } from '@/lib/billing/compute';

export interface UnitRow {
  id: string;
  brand: string;
  model: string | null;
  serialNumber: string | null;
  capacity: string | null;
  machineKind: string;
  installedOn: string;
  partsWarrantyMonths: number;
  serviceWarrantyMonths: number;
  freeServicesTotal: number;
  freeServicesUsed: number;
  serviceIntervalDays: number;
  lastServiceOn: string | null;
  nextServiceDue: string | null;
  inletTds: number | null;
  outletTds: number | null;
  status: string;
  notes: string | null;
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy-700 outline-none focus:border-aqua-500';

const blank = (): UnitRow => ({
  id: '',
  brand: '',
  model: '',
  serialNumber: '',
  capacity: '',
  machineKind: 'DOMESTIC',
  installedOn: toInputDate(new Date()),
  partsWarrantyMonths: 12,
  serviceWarrantyMonths: 12,
  freeServicesTotal: 4,
  freeServicesUsed: 0,
  serviceIntervalDays: 90,
  lastServiceOn: '',
  nextServiceDue: '',
  inletTds: null,
  outletTds: null,
  status: 'ACTIVE',
  notes: '',
});

export default function UnitManager({ clientId, units }: { clientId: string; units: UnitRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<UnitRow | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!editing) return;
    if (!editing.brand.trim()) {
      toast.error('Brand likhna zaroori hai');
      return;
    }
    setBusy(true);
    try {
      const isNew = !editing.id;
      const url = isNew
        ? '/api/admin/service-records?kind=unit'
        : `/api/admin/service-records?kind=unit&id=${editing.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          brand: editing.brand,
          model: editing.model ?? '',
          serialNumber: editing.serialNumber ?? '',
          capacity: editing.capacity ?? '',
          machineKind: editing.machineKind,
          installedOn: editing.installedOn,
          partsWarrantyMonths: editing.partsWarrantyMonths,
          serviceWarrantyMonths: editing.serviceWarrantyMonths,
          freeServicesTotal: editing.freeServicesTotal,
          freeServicesUsed: editing.freeServicesUsed,
          serviceIntervalDays: editing.serviceIntervalDays,
          lastServiceOn: editing.lastServiceOn ?? '',
          inletTds: editing.inletTds ?? undefined,
          outletTds: editing.outletTds ?? undefined,
          status: editing.status,
          notes: editing.notes ?? '',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(isNew ? 'Machine record ban gaya' : 'Update ho gaya');
        setEditing(null);
        router.refresh();
      } else {
        toast.error(data?.message ?? 'Save nahi hua');
      }
    } catch {
      toast.error('Server se baat nahi ho payi');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, brand: string) {
    if (!window.confirm(`${brand} ka record mit jayega. Pakka?`)) return;
    const res = await fetch(`/api/admin/service-records?kind=unit&id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Mit gaya');
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d?.message ?? 'Nahi mita');
    }
  }

  /** "Aaj service hui" — ek click, aur agli due date khud aage khisak jaati hai. */
  async function markServiced(u: UnitRow) {
    setBusy(true);
    const res = await fetch(`/api/admin/service-records?kind=unit&id=${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        brand: u.brand,
        model: u.model ?? '',
        serialNumber: u.serialNumber ?? '',
        capacity: u.capacity ?? '',
        machineKind: u.machineKind,
        installedOn: u.installedOn,
        partsWarrantyMonths: u.partsWarrantyMonths,
        serviceWarrantyMonths: u.serviceWarrantyMonths,
        freeServicesTotal: u.freeServicesTotal,
        freeServicesUsed: Math.min(u.freeServicesUsed + 1, u.freeServicesTotal),
        serviceIntervalDays: u.serviceIntervalDays,
        lastServiceOn: toInputDate(new Date()),
        inletTds: u.inletTds ?? undefined,
        outletTds: u.outletTds ?? undefined,
        status: u.status,
        notes: u.notes ?? '',
      }),
    });
    setBusy(false);
    if (res.ok) {
      toast.success('Service note ho gayi — agli date aage khisak gayi');
      router.refresh();
    } else {
      toast.error('Nahi hua');
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-navy-700">Lagi hui machine</h2>
          <p className="text-xs text-slate-500">Kab lagi · kitni warranty bachi · agli service kab</p>
        </div>
        <button
          onClick={() => setEditing(blank())}
          className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white"
        >
          + Machine jodo
        </button>
      </div>

      {units.length === 0 && !editing ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
          Abhi koi machine record nahi. Bill banate waqt &quot;Machine record banao&quot; tick karein, ya yahan se jodein.
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {units.map((u) => {
          const pw = warrantyInfo(u.installedOn, u.partsWarrantyMonths);
          const sw = warrantyInfo(u.installedOn, u.serviceWarrantyMonths);
          const ds = dueState(u.nextServiceDue);
          return (
            <div key={u.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy-700">
                    {u.brand} {u.model ?? ''}{' '}
                    {u.capacity ? <span className="text-sm font-normal text-slate-500">· {u.capacity}</span> : null}
                    {u.status !== 'ACTIVE' ? (
                      <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-600">
                        {u.status}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Lagi: {longDateIN(u.installedOn)}
                    {u.serialNumber ? ` · Sr. ${u.serialNumber}` : ''}
                    {u.inletTds ? ` · Inlet TDS ${u.inletTds}` : ''}
                    {u.outletTds ? ` → ${u.outletTds}` : ''}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => markServiced(u)} disabled={busy} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-40">
                    ✅ Aaj service hui
                  </button>
                  <button onClick={() => setEditing(u)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs hover:bg-slate-50">
                    ✏️
                  </button>
                  <button onClick={() => remove(u.id, u.brand)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50">
                    🗑
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <WarrantyBar title="Parts warranty" info={pw} months={u.partsWarrantyMonths} />
                <WarrantyBar title="Free service" info={sw} months={u.serviceWarrantyMonths} extra={`${u.freeServicesTotal - u.freeServicesUsed}/${u.freeServicesTotal} visit bachi`} />
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Agli service</p>
                  <p
                    className={`mt-1 text-sm font-bold ${
                      ds === 'overdue' ? 'text-red-600' : ds === 'due-soon' ? 'text-amber-600' : 'text-navy-700'
                    }`}
                  >
                    {u.nextServiceDue ? longDateIN(u.nextServiceDue) : '—'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {ds === 'overdue' ? 'Nikal chuki hai — call karein' : ds === 'due-soon' ? 'Jald due hai' : `har ${u.serviceIntervalDays} din`}
                  </p>
                </div>
              </div>

              {u.notes ? <p className="mt-2 text-xs text-slate-600">📝 {u.notes}</p> : null}
            </div>
          );
        })}
      </div>

      {editing ? (
        <div className="mt-4 rounded-xl border-2 border-aqua-300 bg-aqua-50/40 p-4">
          <p className="mb-3 font-semibold text-navy-700">{editing.id ? 'Machine badlo' : 'Nayi machine'}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <L label="Brand *"><input className={inputCls} value={editing.brand} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} /></L>
            <L label="Model"><input className={inputCls} value={editing.model ?? ''} onChange={(e) => setEditing({ ...editing, model: e.target.value })} /></L>
            <L label="Serial no."><input className={inputCls} value={editing.serialNumber ?? ''} onChange={(e) => setEditing({ ...editing, serialNumber: e.target.value })} /></L>
            <L label="Capacity"><input className={inputCls} placeholder="12 L / 50 LPH" value={editing.capacity ?? ''} onChange={(e) => setEditing({ ...editing, capacity: e.target.value })} /></L>
            <L label="Prakar">
              <select className={inputCls} value={editing.machineKind} onChange={(e) => setEditing({ ...editing, machineKind: e.target.value })}>
                <option value="DOMESTIC">Ghar ka</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </L>
            <L label="Kab lagi *"><input type="date" className={inputCls} value={editing.installedOn} onChange={(e) => setEditing({ ...editing, installedOn: e.target.value })} /></L>
            <L label="Parts warranty (mahine)"><input className={inputCls} inputMode="numeric" value={editing.partsWarrantyMonths} onChange={(e) => setEditing({ ...editing, partsWarrantyMonths: Number(e.target.value || 0) })} /></L>
            <L label="Free service (mahine)"><input className={inputCls} inputMode="numeric" value={editing.serviceWarrantyMonths} onChange={(e) => setEditing({ ...editing, serviceWarrantyMonths: Number(e.target.value || 0) })} /></L>
            <L label="Service har kitne din"><input className={inputCls} inputMode="numeric" value={editing.serviceIntervalDays} onChange={(e) => setEditing({ ...editing, serviceIntervalDays: Number(e.target.value || 0) })} /></L>
            <L label="Kul free visit"><input className={inputCls} inputMode="numeric" value={editing.freeServicesTotal} onChange={(e) => setEditing({ ...editing, freeServicesTotal: Number(e.target.value || 0) })} /></L>
            <L label="Istemaal ho chuki"><input className={inputCls} inputMode="numeric" value={editing.freeServicesUsed} onChange={(e) => setEditing({ ...editing, freeServicesUsed: Number(e.target.value || 0) })} /></L>
            <L label="Aakhri service"><input type="date" className={inputCls} value={editing.lastServiceOn ?? ''} onChange={(e) => setEditing({ ...editing, lastServiceOn: e.target.value })} /></L>
            <L label="Inlet TDS"><input className={inputCls} inputMode="numeric" value={editing.inletTds ?? ''} onChange={(e) => setEditing({ ...editing, inletTds: e.target.value ? Number(e.target.value) : null })} /></L>
            <L label="Outlet TDS"><input className={inputCls} inputMode="numeric" value={editing.outletTds ?? ''} onChange={(e) => setEditing({ ...editing, outletTds: e.target.value ? Number(e.target.value) : null })} /></L>
            <L label="Haalat">
              <select className={inputCls} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="ACTIVE">Chalu</option>
                <option value="REPLACED">Badal di gayi</option>
                <option value="REMOVED">Hata di gayi</option>
              </select>
            </L>
            <L label="Note" className="sm:col-span-3"><textarea rows={2} className={inputCls} value={editing.notes ?? ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></L>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={save} disabled={busy} className="rounded-lg bg-[#0056b3] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
              {busy ? 'Save ho raha…' : 'Save'}
            </button>
            <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700">
              Rehne do
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function WarrantyBar({
  title,
  info,
  months,
  extra,
}: {
  title: string;
  info: ReturnType<typeof warrantyInfo>;
  months: number;
  extra?: string;
}) {
  const tone =
    info.state === 'expired'
      ? 'bg-red-500'
      : info.state === 'expiring'
        ? 'bg-amber-500'
        : info.state === 'active'
          ? 'bg-green-500'
          : 'bg-slate-300';
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {months > 0 ? (
        <>
          <p className="mt-1 text-sm font-bold text-navy-700">{info.endsOn ? longDateIN(info.endsOn) : '—'}</p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full ${tone}`} style={{ width: `${info.percentLeft}%` }} />
          </div>
          <p className={`mt-1 text-[11px] font-semibold ${info.state === 'expired' ? 'text-red-600' : info.state === 'expiring' ? 'text-amber-600' : 'text-slate-500'}`}>
            {info.label}
          </p>
          {extra ? <p className="text-[11px] text-slate-500">{extra}</p> : null}
        </>
      ) : (
        <p className="mt-1 text-sm text-slate-400">Nahi di gayi</p>
      )}
    </div>
  );
}

function L({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">{label}</span>
      {children}
    </label>
  );
}
