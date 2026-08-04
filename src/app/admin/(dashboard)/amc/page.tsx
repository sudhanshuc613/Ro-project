import { prisma } from '@/lib/db/prisma';
import { getAmcStats } from '@/server/services/amc.service';
import { formatINR, formatDateIN } from '@/lib/utils/format';
import AmcActions from '@/components/admin/AmcActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'AMC Contracts' };

export default async function AdminAmcPage() {
  const [stats, contracts] = await Promise.all([
    getAmcStats(),
    prisma.amcSubscription.findMany({
      orderBy: [{ isActive: 'desc' }, { nextServiceDue: 'asc' }],
      take: 100,
      include: {
        user: { select: { fullName: true, phone: true } },
        address: { select: { line1: true, pincode: true } },
      },
    }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">AMC Contracts</h1>
        <p className="mt-0.5 text-sm text-muted">
          Recurring revenue — the most predictable income in a service business.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active Contracts" value={String(stats.active)} icon="📋" tone="aqua" />
        <Stat label="Visits Due This Month" value={String(stats.dueThisMonth)} icon="🔧" tone="orange" />
        <Stat label="Expiring in 30 Days" value={String(stats.expiringSoon)} icon="⏰" tone="red" />
        <Stat label="Annual Recurring Revenue" value={formatINR(stats.recurringRevenue)} icon="💰" tone="green" />
      </div>

      {contracts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-4xl">📋</p>
          <p className="mt-3 font-semibold text-navy-700">No AMC contracts yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            When a customer buys a plan from <code className="rounded bg-slate-100 px-1.5">/amc-plans</code>,
            it appears here with its visit schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => {
            const overdue =
              c.isActive && c.nextServiceDue !== null && c.nextServiceDue < today;
            const daysToExpiry = Math.ceil((c.endsOn.getTime() - Date.now()) / 864e5);
            const expiringSoon = c.isActive && daysToExpiry <= 30 && daysToExpiry >= 0;

            return (
              <div
                key={c.id}
                className={`rounded-2xl border-2 bg-white p-5 ${
                  overdue ? 'border-red-300' : expiringSoon ? 'border-amber-300' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-navy-700">{c.planName}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.isActive ? 'ACTIVE' : 'ENDED'}
                      </span>
                      {overdue && (
                        <span className="rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                          VISIT OVERDUE
                        </span>
                      )}
                      {expiringSoon && !overdue && (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                          EXPIRES IN {daysToExpiry}D
                        </span>
                      )}
                    </div>

                    <p className="mt-2 font-semibold text-navy-700">
                      {c.user.fullName} ·{' '}
                      <a href={`tel:+91${c.user.phone}`} className="text-aqua-600 hover:underline">
                        {c.user.phone}
                      </a>
                    </p>
                    {c.address && (
                      <p className="mt-0.5 text-sm text-muted">
                        📍 {c.address.line1} — {c.address.pincode}
                      </p>
                    )}
                    {(c.machineBrand || c.machineModel) && (
                      <p className="mt-0.5 text-sm text-muted">
                        🔧 {[c.machineBrand, c.machineModel].filter(Boolean).join(' ')}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <span className="text-muted">
                        Visits: <strong className="text-navy-700">{c.visitsUsed} / {c.visitsIncluded}</strong>
                      </span>
                      <span className="text-muted">
                        Next due:{' '}
                        <strong className={overdue ? 'text-red-600' : 'text-navy-700'}>
                          {c.nextServiceDue ? formatDateIN(c.nextServiceDue) : '—'}
                        </strong>
                      </span>
                      <span className="text-muted">
                        Expires: <strong className="text-navy-700">{formatDateIN(c.endsOn)}</strong>
                      </span>
                    </div>

                    {/* Visit progress */}
                    <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-aqua-500"
                        style={{ width: `${(c.visitsUsed / c.visitsIncluded) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-display text-xl font-extrabold text-navy-700">
                      {formatINR(Number(c.price))}
                    </p>
                    <p className="text-xs text-muted">per year</p>
                    <AmcActions
                      id={c.id}
                      phone={c.user.phone}
                      customerName={c.user.fullName}
                      canRenew={expiringSoon || !c.isActive}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: string; icon: string; tone: string }) {
  const cls: Record<string, string> = {
    aqua: 'bg-aqua-50 text-aqua-700 ring-aqua-100',
    orange: 'bg-orange-50 text-orange-700 ring-orange-100',
    red: 'bg-red-50 text-red-700 ring-red-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-extrabold text-navy-700">{value}</p>
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg ring-1 ${cls[tone]}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}
