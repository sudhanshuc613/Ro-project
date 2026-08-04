'use client';

/**
 * LiveFeed — auto-updating order + service ticker for the admin dashboard.
 *
 * Uses polling (see useLiveAdmin for why WebSockets can't run on Vercel).
 * From the operator's point of view it behaves identically: new orders and
 * service bookings appear within ~10 seconds with a sound and a browser
 * notification, no manual refresh.
 */
import Link from 'next/link';
import { useLiveAdmin } from '@/hooks/useLiveAdmin';
import { formatINR, relativeTime } from '@/lib/utils/format';

export default function LiveFeed({
  initialPending, initialToShip,
}: {
  initialPending: number;
  initialToShip: number;
}) {
  const { orders, services, counters, connected, lastPoll, dismissOrder, dismissService } =
    useLiveAdmin({ pendingServices: initialPending, ordersToShip: initialToShip });

  const hasNew = orders.length > 0 || services.length > 0;

  return (
    <section className="rounded-2xl border-2 border-aqua-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            {connected && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          </span>
          <h2 className="font-display text-lg font-bold text-navy-700">Live Activity</h2>
          <span className="text-xs text-muted">
            {connected
              ? lastPoll ? `updated ${relativeTime(lastPoll)}` : 'connecting…'
              : 'reconnecting…'}
          </span>
        </div>

        {counters.unassignedServices > 0 && (
          <Link
            href="/admin/service-requests?status=NEW"
            className="rounded-lg bg-cta-orange px-3 py-1.5 text-xs font-bold text-white hover:bg-cta-orangeDark"
          >
            ⚠️ {counters.unassignedServices} unassigned
          </Link>
        )}
      </div>

      {/* Live counters */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Counter label="Today's revenue" value={formatINR(counters.todayRevenue)} />
        <Counter label="Orders today" value={String(counters.todayOrders)} />
        <Counter label="Services today" value={String(counters.todayServices)} />
        <Counter label="To ship" value={String(counters.ordersToShip)} tone="orange" />
      </div>

      {/* Feed */}
      {!hasNew ? (
        <p className="mt-5 rounded-xl bg-slate-50 py-8 text-center text-sm text-muted">
          Watching for new orders and bookings…
          <br />
          <span className="text-xs">They appear here automatically — no need to refresh.</span>
        </p>
      ) : (
        <ul className="mt-5 space-y-2">
          {services.map((s) => (
            <li key={s.id} className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
              <span className="text-lg">🔧</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-navy-700">
                  New service request · <span className="text-aqua-600">{s.ticketNumber}</span>
                </p>
                <p className="text-sm text-navy-600">
                  {s.customer} · <a href={`tel:+91${s.phone}`} className="font-semibold text-aqua-600">{s.phone}</a> · {s.area}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted">{s.issue}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Link
                  href="/admin/service-requests?status=NEW"
                  className="rounded-lg bg-cta-orange px-3 py-1 text-xs font-bold text-white hover:bg-cta-orangeDark"
                >
                  Assign
                </Link>
                <button onClick={() => dismissService(s.id)} className="text-[10px] text-muted hover:underline">
                  dismiss
                </button>
              </div>
            </li>
          ))}

          {orders.map((o) => (
            <li key={o.id} className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <span className="text-lg">🧾</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-navy-700">
                  New order · <span className="text-aqua-600">{o.orderNumber}</span>
                </p>
                <p className="text-sm text-navy-600">
                  {o.customer}{o.city ? ` · ${o.city}` : ''} · <strong>{formatINR(o.amount)}</strong>
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Link href="/admin/orders" className="rounded-lg bg-navy-700 px-3 py-1 text-xs font-bold text-white hover:bg-navy-600">
                  View
                </Link>
                <button onClick={() => dismissOrder(o.id)} className="text-[10px] text-muted hover:underline">
                  dismiss
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Counter({ label, value, tone }: { label: string; value: string; tone?: 'orange' }) {
  return (
    <div className={`rounded-xl p-3 ${tone === 'orange' ? 'bg-orange-50' : 'bg-slate-50'}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 font-display text-lg font-extrabold text-navy-700">{value}</p>
    </div>
  );
}
