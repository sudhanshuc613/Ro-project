/**
 * ADMIN DASHBOARD — analytics home.
 * KPIs + 30-day revenue chart + service pipeline + low stock + recent activity.
 * All aggregates come from the reporting views defined in db/schema.sql.
 */
import { Suspense } from 'react';
import Link from 'next/link';
import StatCard from '@/components/admin/StatCard';
import RevenueChart from '@/components/admin/RevenueChart';
import ServicePipeline from '@/components/admin/ServicePipeline';
import RecentOrdersTable from '@/components/admin/RecentOrdersTable';
import LowStockList from '@/components/admin/LowStockList';
import { getDashboardAnalytics } from '@/server/services/analytics.service';
import { formatINR } from '@/lib/utils/format';

export const dynamic = 'force-dynamic'; // always live numbers
export const metadata = { title: 'Dashboard' };

export default async function AdminDashboardPage() {
  const a = await getDashboardAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-700">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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
