'use client';

/**
 * Grahak ka AMC — jodo, badlo, visit note karo.
 *
 * Owner ka sawaal tha: "kiska AMC kab chalu hua, kab khatm hoga, uska
 * service due kab hai". Teenon isi card pe hain.
 *
 * Visit note karne ka button sabse upar isliye hai kyunki yeh roz chalega;
 * AMC banana saal me ek baar.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { contractInfo, dueState, toInputDate, longDateIN, addMonths, billINR } from '@/lib/billing/compute';

export interface AmcRow {
  id: string;
  contractNumber: string;
  planName: string;
  machineBrand: string | null;
  machineModel: string | null;
  price: number;
  startsOn: string;
  endsOn: string;
  visitsIncluded: number;
  visitsUsed: number;
  lastVisitOn: string | null;
  nextServiceDue: string | null;
  coversFilters: boolean;
  coversMembrane: boolean;
  status: string;
  notes: string | null;
  visits: {
    id: string;
    visitDate: string;
    visitType: string;
    technicianName: string | null;
    workDone: string | null;
    partsReplaced: string | null;
    extraCharge: number;
  }[];
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy-700 outline-none focus:border-aqua-500';

const blank = (): AmcRow => ({
  id: '',
  contractNumber: '',
  planName: '',
  machineBrand: '',
  machineModel: '',
  price: 0,
  startsOn: toInputDate(new Date()),
  endsOn: toInputDate(addMonths(new Date(), 12)),
  visitsIncluded: 4,
  visitsUsed: 0,
  lastVisitOn: '',
  nextServiceDue: '',
  coversFilters: false,
  coversMembrane: false,
  status: 'ACTIVE',
  notes: '',
  visits: [],
});

export default function AmcManager({ clientId, amcs }: { clientId: string; amcs: AmcRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AmcRow | null>(null);
  const [visitFor, setVisitFor] = useState<string | null>(null);
  const [visit, setVisit] = useState({
    visitDate: toInputDate(new Date()),
    visitType: 'ROUTINE',
    technicianName: '',
    workDone: '',
    partsReplaced: '',
    extraCharge: '',
    inletTds: '',
    outletTds: '',
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!editing) return;
    if (!editing.planName.trim()) {
      toast.error('Plan ka naam likho');
      return;
    }
    if (editing.endsOn <= editing.startsOn) {
      toast.error('End date start date ke baad honi chahiye');
      return;
    }
    setBusy(true);
    try {
      const isNew = !editing.id;
      const url = isNew ? '/api/admin/service-records?kind=amc' : `/api/admin/service-records?kind=amc&id=${editing.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          contractNumber: editing.contractNumber ?? '',
          planName: editing.planName,
          machineBrand: editing.machineBrand ?? '',
          machineModel: editing.machineModel ?? '',
          price: editing.price,
          startsOn: editing.startsOn,
          endsOn: editing.endsOn,
          visitsIncluded: editing.visitsIncluded,
          visitsUsed: editing.visitsUsed,
          lastVisitOn: editing.lastVisitOn ?? '',
          coversFilters: editing.coversFilters,
          coversMembrane: editing.coversMembrane,
          status: editing.status,
          notes: editing.notes ?? '',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(isNew ? 'AMC record ban gaya' : 'Update ho gaya');
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

  async function saveVisit() {
    if (!visitFor) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/service-records?kind=visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: visitFor,
          visitDate: visit.visitDate,
          visitType: visit.visitType,
          technicianName: visit.technicianName,
          workDone: visit.workDone,
          partsReplaced: visit.partsReplaced,
          extraCharge: Number(visit.extraCharge || 0),
          inletTds: visit.inletTds ? Number(visit.inletTds) : undefined,
          outletTds: visit.outletTds ? Number(visit.outletTds) : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Visit note ho gayi');
        setVisitFor(null);
        setVisit({ visitDate: toInputDate(new Date()), visitType: 'ROUTINE', technicianName: '', workDone: '', partsReplaced: '', extraCharge: '', inletTds: '', outletTds: '' });
        router.refresh();
      } else {
        toast.error(data?.message ?? 'Save nahi hua');
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`AMC "${name}" mit jayega. Pakka?`)) return;
    const res = await fetch(`/api/admin/service-records?kind=amc&id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Mit gaya');
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d?.message ?? 'Nahi mita');
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-navy-700">AMC</h2>
          <p className="text-xs text-slate-500">Kab chalu hua · kab khatm · kitni visit bachi · agli kab</p>
        </div>
        <button onClick={() => setEditing(blank())} className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">
          + AMC jodo
        </button>
      </div>

      {amcs.length === 0 && !editing ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
          Is grahak ka koi AMC nahi. Warranty khatm hone se 1 mahina pehle AMC bechna sabse aasan hota hai.
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {amcs.map((a) => {
          const ci = contractInfo(a.startsOn, a.endsOn);
          const ds = dueState(a.nextServiceDue);
          const left = Math.max(a.visitsIncluded - a.visitsUsed, 0);
          return (
            <div key={a.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy-700">
                    {a.planName}
                    <span className="ml-2 text-xs font-normal text-slate-500">{a.contractNumber}</span>
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        a.status === 'ACTIVE' && ci.state !== 'expired'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {ci.state === 'expired' ? 'KHATM' : a.status}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {longDateIN(a.startsOn)} → {longDateIN(a.endsOn)} · ₹{billINR(a.price)}
                    {a.machineBrand ? ` · ${a.machineBrand} ${a.machineModel ?? ''}` : ''}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {a.coversFilters ? '✅ Filter shaamil' : '❌ Filter alag se'} ·{' '}
                    {a.coversMembrane ? '✅ Membrane shaamil' : '❌ Membrane alag se'}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setVisitFor(a.id)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50">
                    + Visit note karo
                  </button>
                  <button onClick={() => setEditing(a)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs hover:bg-slate-50">✏️</button>
                  <button onClick={() => remove(a.id, a.planName)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50">🗑</button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Contract</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full ${ci.state === 'expired' ? 'bg-red-500' : ci.state === 'expiring' ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${ci.percentLeft}%` }}
                    />
                  </div>
                  <p className={`mt-1 text-[11px] font-semibold ${ci.state === 'expired' ? 'text-red-600' : ci.state === 'expiring' ? 'text-amber-600' : 'text-slate-500'}`}>
                    {ci.label}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Visit</p>
                  <p className="mt-1 text-sm font-bold text-navy-700">
                    {left} / {a.visitsIncluded} bachi
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {a.lastVisitOn ? `Aakhri ${longDateIN(a.lastVisitOn)}` : 'Abhi koi visit nahi'}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Agli service</p>
                  <p className={`mt-1 text-sm font-bold ${ds === 'overdue' ? 'text-red-600' : ds === 'due-soon' ? 'text-amber-600' : 'text-navy-700'}`}>
                    {a.nextServiceDue ? longDateIN(a.nextServiceDue) : '—'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {ds === 'overdue' ? 'Nikal chuki — call karein' : ds === 'due-soon' ? 'Jald due' : ''}
                  </p>
                </div>
              </div>

              {a.visits.length > 0 ? (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                    {a.visits.length} visit ka record
                  </summary>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                    {a.visits.map((v) => (
                      <li key={v.id} className="rounded-lg bg-slate-50 px-3 py-2">
                        <span className="font-semibold text-navy-700">{longDateIN(v.visitDate)}</span> · {v.visitType}
                        {v.technicianName ? ` · ${v.technicianName}` : ''}
                        {v.workDone ? <span className="block">{v.workDone}</span> : null}
                        {v.partsReplaced ? <span className="block text-slate-500">Part: {v.partsReplaced}</span> : null}
                        {v.extraCharge > 0 ? <span className="block text-slate-500">Extra ₹{billINR(v.extraCharge)}</span> : null}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}

              {visitFor === a.id ? (
                <div className="mt-3 rounded-xl border-2 border-green-300 bg-green-50/50 p-4">
                  <p className="mb-3 font-semibold text-navy-700">Visit note karo</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <L label="Tarikh"><input type="date" className={inputCls} value={visit.visitDate} onChange={(e) => setVisit({ ...visit, visitDate: e.target.value })} /></L>
                    <L label="Kis tarah ki">
                      <select className={inputCls} value={visit.visitType} onChange={(e) => setVisit({ ...visit, visitType: e.target.value })}>
                        <option value="ROUTINE">Routine service</option>
                        <option value="BREAKDOWN">Breakdown</option>
                        <option value="FILTER">Filter change</option>
                        <option value="INSPECTION">Sirf checking</option>
                      </select>
                    </L>
                    <L label="Technician"><input className={inputCls} value={visit.technicianName} onChange={(e) => setVisit({ ...visit, technicianName: e.target.value })} /></L>
                    <L label="Kya kaam kiya" className="sm:col-span-3"><textarea rows={2} className={inputCls} value={visit.workDone} onChange={(e) => setVisit({ ...visit, workDone: e.target.value })} /></L>
                    <L label="Part badla"><input className={inputCls} value={visit.partsReplaced} onChange={(e) => setVisit({ ...visit, partsReplaced: e.target.value })} /></L>
                    <L label="Extra charge (₹)"><input className={inputCls} inputMode="decimal" value={visit.extraCharge} onChange={(e) => setVisit({ ...visit, extraCharge: e.target.value })} /></L>
                    <div className="grid grid-cols-2 gap-2">
                      <L label="Inlet TDS"><input className={inputCls} inputMode="numeric" value={visit.inletTds} onChange={(e) => setVisit({ ...visit, inletTds: e.target.value })} /></L>
                      <L label="Outlet TDS"><input className={inputCls} inputMode="numeric" value={visit.outletTds} onChange={(e) => setVisit({ ...visit, outletTds: e.target.value })} /></L>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={saveVisit} disabled={busy} className="rounded-lg bg-green-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
                      {busy ? '…' : 'Visit save karo'}
                    </button>
                    <button onClick={() => setVisitFor(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700">Rehne do</button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {editing ? (
        <div className="mt-4 rounded-xl border-2 border-aqua-300 bg-aqua-50/40 p-4">
          <p className="mb-3 font-semibold text-navy-700">{editing.id ? 'AMC badlo' : 'Naya AMC'}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <L label="Plan ka naam *"><input className={inputCls} placeholder="Basic / Standard / Premium" value={editing.planName} onChange={(e) => setEditing({ ...editing, planName: e.target.value })} /></L>
            <L label="Daam (₹)"><input className={inputCls} inputMode="decimal" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value || 0) })} /></L>
            <L label="Contract no." ><input className={inputCls} placeholder="khaali chhodein to khud banega" value={editing.contractNumber} onChange={(e) => setEditing({ ...editing, contractNumber: e.target.value })} /></L>
            <L label="Shuru *"><input type="date" className={inputCls} value={editing.startsOn} onChange={(e) => setEditing({ ...editing, startsOn: e.target.value, endsOn: toInputDate(addMonths(e.target.value || new Date(), 12)) })} /></L>
            <L label="Khatm *"><input type="date" className={inputCls} value={editing.endsOn} onChange={(e) => setEditing({ ...editing, endsOn: e.target.value })} /></L>
            <L label="Kitni visit"><input className={inputCls} inputMode="numeric" value={editing.visitsIncluded} onChange={(e) => setEditing({ ...editing, visitsIncluded: Number(e.target.value || 0) })} /></L>
            <L label="Machine brand"><input className={inputCls} value={editing.machineBrand ?? ''} onChange={(e) => setEditing({ ...editing, machineBrand: e.target.value })} /></L>
            <L label="Model"><input className={inputCls} value={editing.machineModel ?? ''} onChange={(e) => setEditing({ ...editing, machineModel: e.target.value })} /></L>
            <L label="Haalat">
              <select className={inputCls} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="ACTIVE">Chalu</option>
                <option value="EXPIRED">Khatm</option>
                <option value="CANCELLED">Cancel</option>
              </select>
            </L>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4" checked={editing.coversFilters} onChange={(e) => setEditing({ ...editing, coversFilters: e.target.checked })} />
              Filter shaamil hain
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4" checked={editing.coversMembrane} onChange={(e) => setEditing({ ...editing, coversMembrane: e.target.checked })} />
              Membrane shaamil hai
            </label>
            <L label="Note" className="sm:col-span-3"><textarea rows={2} className={inputCls} value={editing.notes ?? ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></L>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={save} disabled={busy} className="rounded-lg bg-[#0056b3] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
              {busy ? 'Save ho raha…' : 'Save'}
            </button>
            <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700">Rehne do</button>
          </div>
        </div>
      ) : null}
    </section>
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
