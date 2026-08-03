import Link from 'next/link';

const LABELS: Record<string, { label: string; color: string }> = {
  NEW:           { label: 'New',           color: 'bg-blue-500' },
  CONTACTED:     { label: 'Contacted',     color: 'bg-indigo-500' },
  SCHEDULED:     { label: 'Scheduled',     color: 'bg-violet-500' },
  ASSIGNED:      { label: 'Assigned',      color: 'bg-aqua-500' },
  IN_PROGRESS:   { label: 'In Progress',   color: 'bg-amber-500' },
  ON_HOLD_PARTS: { label: 'On Hold (Parts)', color: 'bg-orange-500' },
  COMPLETED:     { label: 'Completed',     color: 'bg-emerald-500' },
  CANCELLED:     { label: 'Cancelled',     color: 'bg-slate-400' },
  NO_RESPONSE:   { label: 'No Response',   color: 'bg-red-400' },
};

export default function ServicePipeline({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((n, d) => n + d.count, 0) || 1;
  const ordered = Object.keys(LABELS)
    .map((k) => ({ status: k, count: data.find((d) => d.status === k)?.count ?? 0 }))
    .filter((d) => d.count > 0);

  if (!ordered.length) {
    return <p className="py-8 text-center text-sm text-muted">No service requests yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {ordered.map((d) => {
        const meta = LABELS[d.status];
        const pct = Math.round((d.count / total) * 100);
        return (
          <li key={d.status}>
            <Link href={`/admin/service-requests?status=${d.status}`} className="group block">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-navy-700 group-hover:text-aqua-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${meta.color}`} />
                  {meta.label}
                </span>
                <span className="font-bold text-navy-700">{d.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${meta.color}`} style={{ width: `${pct}%` }} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
