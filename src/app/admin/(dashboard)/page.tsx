/**
 * ADMIN DASHBOARD — analytics home.
 * KPIs + 30-day revenue chart + service pipeline + low stock + recent activity.
 * All aggregates come from the reporting views defined in db/schema.sql.
 */
import { Suspense } from 'react';
import Link from 'next/link';
import LiveFeed from '@/components/admin/LiveFeed';
import StatCard from '@/components/admin/StatCard';
import RevenueChart from '@/components/admin/RevenueChart';
import ServicePipeline from '@/components/admin/ServicePipeline';
import RecentOrdersTable from '@/components/admin/RecentOrdersTable';
import LowStockList from '@/components/admin/LowStockList';
import ActionCenter from '@/components/admin/ActionCenter';
import ReviewTracker from '@/components/admin/ReviewTracker';
import { prisma } from '@/lib/db/prisma';
import { getDashboardAnalytics } from '@/server/services/analytics.service';
import { getActionItems, getTodayPulse } from '@/server/services/action-center.service';
import { formatINR } from '@/lib/utils/format';

/** Compact today-at-a-glance tile. */
function PulseCard({
  label, value, delta, tone,
}: {
  label: string;
  value: string;
  delta?: number | null;
  tone: 'green' | 'aqua' | 'navy' | 'orange';
}) {
  const cls = {
    green: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
    aqua: 'bg-aqua-50 text-aqua-800 ring-aqua-100',
    navy: 'bg-sand-200 text-navy-700 ring-navy-100',
    orange: 'bg-orange-50 text-orange-800 ring-orange-100',
  }[tone];

  return (
    <div className={`rounded-2xl p-4 ring-1 ${cls}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</p>
      <p className="tnum mt-1 font-display text-2xl font-extrabold leading-none">{value}</p>
      {delta != null && delta !== 0 && (
        <p className="mt-1 text-[11px] font-semibold">
          {delta > 0 ? `▲ ${delta}%` : `▼ ${Math.abs(delta)}%`} kal se
        </p>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic'; // always live numbers
export const metadata = { title: 'Dashboard' };

export default async function AdminDashboardPage() {
  /*
   * Three parallel loads. The action items and today's pulse answer "what
   * needs me right now"; the analytics answer "how is the business doing".
   * The first question is the one the owner has on opening the panel, so it
   * renders above everything else.
   */
  const [a, actionItems, pulse, completedThisMonth] = await Promise.all([
    getDashboardAnalytics(),
    getActionItems(),
    getTodayPulse(),
    /* Pool of customers who could be asked for a review in the last 30 days.
       Queried here rather than added to getDashboardAnalytics() so the
       existing analytics contract and its callers stay untouched. */
    prisma.serviceRequest.count({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: new Date(Date.now() - 30 * 86_400_000) },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-700">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            <span className="ml-2 hidden text-xs text-slate-400 md:inline">
              · <kbd className="rounded border border-navy-100 bg-sand-200 px-1 font-mono">Ctrl K</kbd> se kuch bhi dhundo
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/new"
            className="rounded-lg bg-aqua-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-aqua-600">
            + Add Product
          </Link>
          <Link href="/admin/service-requests"
            className="rounded-lg bg-cta-orange px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cta-orangeDark">
            🔧 Service Queue ({a.pendingServices})
          </Link>
        </div>
      </div>

      {/* Today's pulse — four numbers that answer "how is today going" before
          any chart loads. */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <PulseCard
          label="Aaj ki kamai"
          value={formatINR(pulse.revenue)}
          tone="green"
        />
        <PulseCard
          label="Nayi service request"
          value={String(pulse.todayServices)}
          delta={pulse.delta}
          tone="aqua"
        />
        <PulseCard label="Aaj ke order" value={String(pulse.todayOrders)} tone="navy" />
        <PulseCard
          label="Pending queue"
          value={String(pulse.pendingServices)}
          tone={pulse.pendingServices > 0 ? 'orange' : 'navy'}
        />
      </div>

      {/* What needs the owner right now, ranked by what it costs to ignore. */}
      <ActionCenter items={actionItems} />

      {/* The 36% that no amount of code can move. Placed above the revenue
          charts on purpose — it is the largest remaining ranking lever and it
          only moves if someone looks at it daily. */}
      <ReviewTracker completedThisMonth={completedThisMonth} />

      {/* Action bar — the things costing money right now, above everything
          else. An owner opening the dashboard should not have to hunt for
          "who hasn't paid" or "what needs shipping". */}
      {(a.awaitingPayment > 0 || a.ordersToShip > 0 || a.pendingServices > 0) && (
        <div className="grid gap-3 sm:grid-cols-3">
          {a.awaitingPayment > 0 && (
            <Link
              href="/admin/orders?pay=unpaid"
              className="rounded-2xl bg-red-50 p-4 ring-1 ring-red-200 transition hover:shadow-card-hover"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-red-700">
                Awaiting payment
              </p>
              <p className="tnum mt-1 font-display text-2xl font-extrabold text-red-800">
                {a.awaitingPayment}
              </p>
              <p className="text-xs text-red-700">
                {formatINR(a.awaitingPaymentValue)} not received yet →
              </p>
            </Link>
          )}
          {a.ordersToShip > 0 && (
            <Link
              href="/admin/orders?status=CONFIRMED"
              className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200 transition hover:shadow-card-hover"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Ready to pack &amp; ship
              </p>
              <p className="tnum mt-1 font-display text-2xl font-extrabold text-amber-900">
                {a.ordersToShip}
              </p>
              <p className="text-xs text-amber-800">Paid, waiting on you →</p>
            </Link>
          )}
          {a.pendingServices > 0 && (
            <Link
              href="/admin/service-requests"
              className="rounded-2xl bg-aqua-50 p-4 ring-1 ring-aqua-200 transition hover:shadow-card-hover"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-aqua-700">
                Open service jobs
              </p>
              <p className="tnum mt-1 font-display text-2xl font-extrabold text-aqua-800">
                {a.pendingServices}
              </p>
              <p className="text-xs text-aqua-700">Assign a technician →</p>
            </Link>
          )}
        </div>
      )}

      {/* Live activity — auto-updates without refresh */}
      <LiveFeed initialPending={a.pendingServices} initialToShip={a.ordersToShip} />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's Revenue"
          value={formatINR(a.todayRevenue)}
          delta={a.revenueDeltaPct}
          sub={`${a.todayOrders} orders today`}
          icon="💰" tone="green"
        />
        <StatCard
          label="Total Sales (30d)"
          value={formatINR(a.monthRevenue)}
          delta={a.monthDeltaPct}
          sub={`AOV ${formatINR(a.avgOrderValue)}`}
          icon="📈" tone="aqua"
        />
        <StatCard
          label="Pending Services"
          value={String(a.pendingServices)}
          sub={`${a.todayServices} new today · Patna`}
          icon="🔧" tone="orange"
          href="/admin/service-requests"
        />
        <StatCard
          label="Orders to Ship"
          value={String(a.ordersToShip)}
          sub={`${a.ordersInTransit} in transit`}
          icon="🚚" tone="navy"
          href="/admin/orders?status=CONFIRMED"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Service Revenue (30d)" value={formatINR(a.serviceRevenue)} sub="Visit + parts + labour" icon="🛠️" tone="aqua" compact />
        <StatCard label="New Customers (30d)"   value={String(a.newCustomers)} sub={`${a.repeatRate}% repeat rate`} icon="👥" tone="navy" compact />
        <StatCard label="Abandoned Carts"       value={String(a.abandonedCarts)} sub={`${formatINR(a.recoveredRevenue)} recovered`} icon="🛒" tone="orange" href="/admin/abandoned-carts" compact />
        <StatCard label="Low Stock Items"       value={String(a.lowStockCount)} sub="Needs restocking" icon="⚠️" tone="red" href="/admin/inventory" compact />
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-navy-700">Revenue Trend</h2>
              <p className="text-xs text-muted">E-commerce vs. local service · last 30 days</p>
            </div>
          </div>
          <Suspense fallback={<div className="h-[300px] animate-pulse rounded-xl bg-slate-100" />}>
            <RevenueChart data={a.revenueSeries} />
          </Suspense>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-navy-700">Service Pipeline</h2>
          <p className="mb-4 text-xs text-muted">Patna requests by stage</p>
          <ServicePipeline data={a.servicePipeline} />
        </section>
      </div>

      {/* Tables */}
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy-700">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-aqua-600 hover:underline">View all →</Link>
          </div>
          <RecentOrdersTable orders={a.recentOrders} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy-700">Low Stock</h2>
            <Link href="/admin/inventory" className="text-sm font-semibold text-aqua-600 hover:underline">Manage →</Link>
          </div>
          <LowStockList items={a.lowStockItems} />
        </section>
      </div>
    </div>
  );
}
