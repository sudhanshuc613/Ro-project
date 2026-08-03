import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { formatINR, relativeTime } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Orders' };

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PACKED: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  OUT_FOR_DELIVERY: 'bg-amber-100 text-amber-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const where = searchParams.status ? { status: searchParams.status as never } : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: { placedAt: 'desc' },
    take: 100,
    include: { user: { select: { fullName: true, phone: true } }, _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-700">Orders</h1>
          <p className="mt-0.5 text-sm text-muted">Pan-India e-commerce orders</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${!searchParams.status ? 'bg-navy-700 text-white' : 'bg-white text-navy-700 ring-1 ring-slate-200'}`}
        >
          All
        </Link>
        {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${searchParams.status === s ? 'bg-navy-700 text-white' : 'bg-white text-navy-700 ring-1 ring-slate-200'}`}
          >
            {s.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl">🧾</p>
            <p className="mt-3 font-semibold text-navy-700">No orders yet</p>
            <p className="mt-1 text-sm text-muted">
              Orders will appear here once customers start buying.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2.5 font-semibold">Order</th>
                  <th className="pb-2.5 font-semibold">Customer</th>
                  <th className="pb-2.5 font-semibold">Items</th>
                  <th className="pb-2.5 font-semibold">Amount</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                  <th className="pb-2.5 text-right font-semibold">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-3 font-semibold text-aqua-600">{o.orderNumber}</td>
                    <td className="py-3">
                      <span className="block font-medium text-navy-700">{o.user?.fullName ?? 'Guest'}</span>
                      <span className="block text-xs text-muted">{o.user?.phone ?? o.guestPhone}</span>
                    </td>
                    <td className="py-3 text-muted">{o._count.items}</td>
                    <td className="py-3 font-bold text-navy-700">{formatINR(Number(o.totalAmount))}</td>
                    <td className="py-3">
                      <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${STATUS_STYLE[o.status] ?? 'bg-slate-100'}`}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right text-xs text-muted">{relativeTime(o.placedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
