'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Technician {
  id: string;
  fullName: string;
  phone: string;
  activeJobs: number;
  maxDailyJobs: number;
  servicePincodes: string[];
}

const NEXT_STATUS: Record<string, string[]> = {
  NEW: ['CONTACTED', 'SCHEDULED', 'CANCELLED', 'NO_RESPONSE'],
  CONTACTED: ['SCHEDULED', 'ASSIGNED', 'CANCELLED', 'NO_RESPONSE'],
  SCHEDULED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'ON_HOLD_PARTS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'ON_HOLD_PARTS', 'CANCELLED'],
  ON_HOLD_PARTS: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  NO_RESPONSE: ['CONTACTED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export default function ServiceRequestActions({
  id, status, pincode, technicians, currentTechId,
}: {
  id: string;
  status: string;
  pincode: string;
  technicians: Technician[];
  currentTechId: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [parts, setParts] = useState('');
  const [labour, setLabour] = useState('');
  const [resolution, setResolution] = useState('');
  const router = useRouter();

  async function call(body: object, successMsg?: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/service-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed');
      toast.success(successMsg ?? data.message);
      setShowAssign(false);
      setShowComplete(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  // Technicians who cover this pincode float to the top
  const sorted = [...technicians].sort((a, b) => {
    const aCovers = a.servicePincodes.includes(pincode) ? 1 : 0;
    const bCovers = b.servicePincodes.includes(pincode) ? 1 : 0;
    if (aCovers !== bCovers) return bCovers - aCovers;
    return a.activeJobs - b.activeJobs;
  });

  const nextOptions = NEXT_STATUS[status] ?? [];

  return (
    <div className="mt-3 space-y-2">
      {/* Assign technician */}
      {showAssign ? (
        <div className="w-full rounded-xl border border-aqua-200 bg-aqua-50 p-3">
          <p className="mb-2 text-xs font-bold text-navy-700">Assign technician</p>
          <div className="space-y-1.5">
            {sorted.map((t) => {
              const covers = t.servicePincodes.includes(pincode);
              const full = t.activeJobs >= t.maxDailyJobs;
              return (
                <button
                  key={t.id}
                  onClick={() => call({ action: 'assign', technicianId: t.id })}
                  disabled={busy || full}
                  className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-sm transition hover:bg-aqua-100 disabled:opacity-50"
                >
                  <span>
                    <span className="block font-semibold text-navy-700">
                      {t.fullName} {t.id === currentTechId && '(current)'}
                    </span>
                    <span className="block text-xs text-muted">
                      {t.phone} · {t.activeJobs}/{t.maxDailyJobs} jobs
                      {covers && <span className="ml-1 font-bold text-emerald-600">· covers {pincode}</span>}
                    </span>
                  </span>
                  {full && <span className="text-xs font-bold text-red-600">FULL</span>}
                </button>
              );
            })}
            {sorted.length === 0 && (
              <p className="rounded-lg bg-white px-3 py-2 text-xs text-muted">
                No technicians yet. Add them in the Technicians tab.
              </p>
            )}
          </div>
          <button onClick={() => setShowAssign(false)} className="mt-2 text-xs font-bold text-muted hover:underline">
            Cancel
          </button>
        </div>
      ) : (
        status !== 'COMPLETED' && status !== 'CANCELLED' && (
          <button
            onClick={() => setShowAssign(true)}
            className="w-full rounded-lg bg-aqua-500 px-3 py-2 text-xs font-bold text-white hover:bg-aqua-600"
          >
            👷 {currentTechId ? 'Reassign' : 'Assign'} technician
          </button>
        )
      )}

      {/* Completion form */}
      {showComplete ? (
        <div className="w-full space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs font-bold text-navy-700">Complete job</p>
          <input
            value={parts} onChange={(e) => setParts(e.target.value.replace(/\D/g, ''))}
            placeholder="Parts charge ₹" inputMode="numeric"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={labour} onChange={(e) => setLabour(e.target.value.replace(/\D/g, ''))}
            placeholder="Labour charge ₹" inputMode="numeric"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <textarea
            value={resolution} onChange={(e) => setResolution(e.target.value)} rows={2}
            placeholder="What was fixed? (shown to customer)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => call({
                action: 'status', status: 'COMPLETED',
                partsCharge: Number(parts) || 0,
                labourCharge: Number(labour) || 0,
                resolutionNote: resolution,
              }, 'Job completed — customer notified')}
              disabled={busy}
              className="flex-1 rounded-lg bg-cta-green px-3 py-2 text-xs font-bold text-white hover:bg-cta-greenDark disabled:opacity-60"
            >
              ✓ Complete
            </button>
            <button onClick={() => setShowComplete(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {nextOptions.map((s) => (
            <button
              key={s}
              onClick={() => {
                if (s === 'COMPLETED') { setShowComplete(true); return; }
                call({ action: 'status', status: s });
              }}
              disabled={busy}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition disabled:opacity-60 ${
                s === 'COMPLETED' ? 'bg-cta-green text-white hover:bg-cta-greenDark'
                : s === 'CANCELLED' ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
