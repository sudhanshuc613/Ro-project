import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN, relativeTime } from '@/lib/utils/format';
import CustomerActions from '@/components/admin/CustomerActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Customers (CRM)' };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; segment?: string };
}) {
  const q = searchParams.q?.trim();
  const segment = searchParams.segment;

  const where = {
    role: 'CUSTOMER' as const,
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' as const } },
            { phone: { contains: q } },
            { email: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(segment === 'banned' ? { deletedAt: { not: null } } : {}),
    ...(segment === 'repeat' ? { totalOrders: { gt: 1 } } : {}),
    ...(segment === 'service' ? { totalServices: { gt: 0 } } : {}),
  };

  const [customers, stats] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true, fullName: true, phone: true, email: true,
        totalOrders: true, totalServices: true, lifetimeValue: true,
        createdAt: true, lastLoginAt: true, deletedAt: true, notes: true,
        _count: { select: { orders: true, serviceRequests: true, amcSubscriptions: true } },
      },
    }),
    prisma.user.aggregate({
      where: { role: 'CUSTOMER' },
      _count: true,
      _sum: { lifetimeValue: true },
    }),
  ]);

  const repeatCount = customers.filter((c) => c.totalOrders > 1).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Customers (CRM)</h1>
        <p className="mt-0.5 text-sm text-muted">
          Every person who ordered, booked a service, or created an account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Customers" value={String(stats._count)} icon="👥" />
        <Stat label="Lifetime Value" value={formatINR(Number(stats._sum.lifetimeValue ?? 0))} icon="💰" />
        <Stat label="Repeat Buyers" value={String(repeatCount)} icon="🔁" />
        <Stat label="Showing" value={String(customers.length)} icon="📋" />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <form className="flex flex-wrap gap-3">
          <input
            name="q" defaultValue={q}
            placeholder="Search name, phone or email…"
            className="min-w-[240px] flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100"
          />
          <select
            name="segment" defaultValue={segment ?? ''}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
          >
            <option value="">All customers</option>
            <option value="repeat">Repeat buyers</option>
            <option value="service">Service customers</option>
            <option value="banned">Banned</option>
          </select>
          <button className="rounded-lg bg-navy-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-600">
            Search
          </button>
          {(q || segment) && (
            <Link href="/admin/customers" className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-bold text-navy-700 hover:bg-slate-50">
              Clear
            </Link>
          )}
        </form>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-4xl">👥</p>
          <p className="mt-3 font-semibold text-navy-700">No customers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((c) => {
            const banned = c.deletedAt !== null;
            return (
              <div key={c.id} className={`rounded-2xl border-2 bg-white p-5 ${banned ? 'border-red-200 bg-red-50/40' : 'border-slate-200'}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-navy-700">{c.fullName}</span>
                      {banned && (
                        <span className="rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">BANNED</span>
                      )}
                      {c.totalOrders > 1 && (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">REPEAT</span>
                      )}
                      {c._count.amcSubscriptions > 0 && (
                        <span className="rounded-md bg-aqua-100 px-2 py-0.5 text-[11px] font-bold text-aqua-700">AMC</span>
                      )}
                    </div>

                    <p className="mt-1.5 text-sm">
                      <a href={`tel:+91${c.phone}`} className="font-semibold text-aqua-600 hover:underline">{c.phone}</a>
                      {c.email && <span className="text-muted"> · {c.email}</span>}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
                      <span>Orders: <strong className="text-navy-700">{c._count.orders}</strong></span>
                      <span>Services: <strong className="text-navy-700">{c._count.serviceRequests}</strong></span>
                      <span>Spend: <strong className="text-navy-700">{formatINR(Number(c.lifetimeValue))}</strong></span>
                      <span>Joined {formatDateIN(c.createdAt)}</span>
                      {c.lastLoginAt && <span>Last seen {relativeTime(c.lastLoginAt)}</span>}
                    </div>

                    {c.notes && (
                      <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        📝 {c.notes}
                      </p>
                    )}
                  </div>

                  <CustomerActions
                    id={c.id}
                    name={c.fullName}
                    phone={c.phone}
                    banned={banned}
                    notes={c.notes ?? ''}
                  />
                </div>
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
