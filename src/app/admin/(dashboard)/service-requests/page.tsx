import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { relativeTime, formatINR } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Service Requests' };

const STATUS_STYLE: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-indigo-100 text-indigo-700',
  SCHEDULED: 'bg-violet-100 text-violet-700',
  ASSIGNED: 'bg-cyan-100 text-cyan-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  ON_HOLD_PARTS: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
  NO_RESPONSE: 'bg-red-100 text-red-700',
};

const PRIORITY_STYLE: Record<string, string> = {
  EMERGENCY: 'bg-red-500 text-white',
  HIGH: 'bg-orange-500 text-white',
  NORMAL: 'bg-slate-200 text-slate-700',
  LOW: 'bg-slate-100 text-slate-500',
};

export default async function AdminServiceRequestsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const where = searchParams.status ? { status: searchParams.status as never } : {};

  const [requests, counts] = await Promise.all([
    prisma.serviceRequest.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 100,
      include: { assignedTechnician: { select: { fullName: true, phone: true } } },
    }),
    prisma.serviceRequest.groupBy({ by: ['status'], _count: { status: true } }),
  ]);

  const countOf = (s: string) => counts.find((c) => c.status === s)?._count.status ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Service Requests</h1>
        <p className="mt-0.5 text-sm text-muted">Patna local service queue</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/service-requests"
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${!searchParams.status ? 'bg-navy-700 text-white' : 'bg-white text-navy-700 ring-1 ring-slate-200'}`}
        >
          All
        </Link>
        {['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
          <Link
            key={s}
            href={`/admin/service-requests?status=${s}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${searchParams.status === s ? 'bg-navy-700 text-white' : 'bg-white text-navy-700 ring-1 ring-slate-200'}`}
          >
            {s.replace(/_/g, ' ')} ({countOf(s)})
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-4xl">🔧</p>
          <p className="mt-3 font-semibold text-navy-700">No service requests yet</p>
          <p className="mt-1 text-sm text-muted">
            Bookings from the website form will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-bold text-aqua-600">{r.ticketNumber}</span>
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[r.status]}`}>
                      {r.status.replace(/_/g, ' ')}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${PRIORITY_STYLE[r.priority]}`}>
                      {r.priority}
                    </span>
                  </div>

                  <p className="mt-2 font-semibold text-navy-700">
                    {r.customerName} ·{' '}
                    <a href={`tel:+91${r.customerPhone}`} className="text-aqua-600 hover:underline">
                      {r.customerPhone}
                    </a>
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    📍 {r.addressLine}{r.landmark ? `, near ${r.landmark}` : ''} — {r.pincode}
                  </p>
                  <p className="mt-2 text-sm text-navy-600">
                    <strong>{r.serviceType.replace(/_/g, ' ')}</strong>
                    {r.issueCategory ? ` · ${r.issueCategory.replace(/_/g, ' ')}` : ''}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{r.issueDescription}</p>

                  {r.assignedTechnician && (
                    <p className="mt-2 text-sm text-emerald-700">
                      👷 {r.assignedTechnician.fullName} · {r.assignedTechnician.phone}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-display text-lg font-extrabold text-navy-700">
                    {formatINR(Number(r.totalCharge) || Number(r.visitCharge))}
                  </p>
                  <p className="mt-1 text-xs text-muted">{relativeTime(r.createdAt)}</p>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`tel:+91${r.customerPhone}`}
                      className="rounded-lg bg-cta-green px-3 py-1.5 text-xs font-bold text-white hover:bg-cta-greenDark"
                    >
                      Call
                    </a>
                    <a
                      href={`https://wa.me/91${r.customerPhone}`}
                      target="_blank" rel="noopener noreferrer"
                      className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
