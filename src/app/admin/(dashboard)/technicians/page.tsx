import { prisma } from '@/lib/db/prisma';
import { formatDateIN } from '@/lib/utils/format';
import TechnicianForm from '@/components/admin/TechnicianForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Technicians' };

export default async function TechniciansPage() {
  const technicians = await prisma.technician.findMany({
    orderBy: [{ isActive: 'desc' }, { activeJobs: 'asc' }],
    include: {
      _count: { select: { serviceRequests: true } },
    },
  });

  const active = technicians.filter((t) => t.isActive);
  const totalCapacity = active.reduce((n, t) => n + t.maxDailyJobs, 0);
  const currentLoad = active.reduce((n, t) => n + t.activeJobs, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Technicians</h1>
        <p className="mt-0.5 text-sm text-muted">
          Your Patna field team. Assign jobs from the Service Requests page.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active Technicians" value={String(active.length)} icon="👷" />
        <Stat label="Jobs In Hand" value={`${currentLoad} / ${totalCapacity}`} icon="📋" />
        <Stat
          label="Capacity Used"
          value={totalCapacity ? `${Math.round((currentLoad / totalCapacity) * 100)}%` : '0%'}
          icon="📊"
        />
      </div>

      <TechnicianForm />

      {technicians.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-4xl">👷</p>
          <p className="mt-3 font-semibold text-navy-700">No technicians added yet</p>
          <p className="mt-1 text-sm text-muted">Add your first technician above to start assigning jobs.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {technicians.map((t) => {
            const loadPct = t.maxDailyJobs ? (t.activeJobs / t.maxDailyJobs) * 100 : 0;
            return (
              <div key={t.id} className={`rounded-2xl border-2 bg-white p-5 ${t.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-navy-700">{t.fullName}</span>
                      {!t.isActive && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">INACTIVE</span>
                      )}
                      {t.isActive && t.activeJobs >= t.maxDailyJobs && (
                        <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">FULL</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm">
                      <a href={`tel:+91${t.phone}`} className="font-semibold text-aqua-600 hover:underline">{t.phone}</a>
                      <span className="text-muted"> · {t.employeeCode}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-extrabold text-navy-700">
                      {Number(t.ratingAvg).toFixed(1)} ★
                    </p>
                    <p className="text-xs text-muted">{t.jobsCompleted} done</p>
                  </div>
                </div>

                {/* Load bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Today&apos;s load</span>
                    <span className="font-bold text-navy-700">{t.activeJobs} / {t.maxDailyJobs}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${loadPct >= 100 ? 'bg-red-500' : loadPct >= 70 ? 'bg-amber-500' : 'bg-cta-green'}`}
                      style={{ width: `${Math.min(100, loadPct)}%` }}
                    />
                  </div>
                </div>

                {t.servicePincodes.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold text-muted">Covers pincodes</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {t.servicePincodes.map((p) => (
                        <span key={p} className="rounded bg-aqua-50 px-2 py-0.5 text-[11px] font-semibold text-aqua-700">{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                {t.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.skills.map((s) => (
                      <span key={s} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                        {s.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-3 text-xs text-muted">
                  {t._count.serviceRequests} total jobs
                  {t.joinedAt && ` · joined ${formatDateIN(t.joinedAt)}`}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-extrabold text-navy-700">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}
