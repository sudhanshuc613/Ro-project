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
  searchParams: { status?: string; pay?: string };
}) {
  // `pay=unpaid` is the money view: prepaid orders where the cash has not
  // landed. That is the list the owner needs to chase, and it was impossible
  // to see before.
  const where = {
    ...(searchParams.status ? { status: searchParams.status as never } : {}),
    ...(searchParams.pay === 'unpaid'
      ? { paymentStatus: 'UNPAID' as const, NOT: { paymentMethod: 'COD' as const } }
      : {}),
    ...(searchParams.pay === 'guest' ? { userId: null } : {}),
  };

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { placedAt: 'desc' },
      take: 100,
      include: { user: { select: { fullName: true, phone: true } }, _count: { select: { items: true } } },
      // shippingAddress holds the guest's real name — selected via include above
    }),
    prisma.order.groupBy({ by: ['paymentStatus'], _count: true }),
  ]);

  const unpaidCount = counts.find((c) => c.paymentStatus === 'UNPAID')?._count ?? 0;

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

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders?pay=unpaid"
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
            searchParams.pay === 'unpaid'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100'
          }`}
        >
          💰 Awaiting payment{unpaidCount > 0 ? ` (${unpaidCount})` : ''}
        </Link>
        <Link
          href="/admin/orders?pay=guest"
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
            searchParams.pay === 'guest'
              ? 'bg-navy-700 text-white'
              : 'bg-white text-navy-700 ring-1 ring-slate-200 hover:bg-slate-50'
          }`}
        >
          👤 Guest orders
        </Link>
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
                  <th className="pb-2.5 font-semibold">Payment</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                  <th className="pb-2.5 text-right font-semibold">Placed</th>
                  <th className="pb-2.5 text-right font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold text-aqua-600 hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3">
                      <span className="block font-medium text-navy-700">
                        {o.user?.fullName
                          ?? (o.shippingAddress as { contactName?: string } | null)?.contactName
                          ?? 'Guest'}
                        {!o.userId && (
                          <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                            GUEST
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-muted">{o.user?.phone ?? o.guestPhone}</span>
                    </td>
                    <td className="py-3 text-muted">{o._count.items}</td>
                    <td className="py-3 font-bold text-navy-700">{formatINR(Number(o.totalAmount))}</td>
                    <td className="py-3">
                      <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${
                        o.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700'
                        : o.paymentStatus === 'UNPAID' ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.paymentStatus}
                      </span>
                      {o.paymentMethod && (
                        <span className="mt-0.5 block text-[10px] text-muted">{o.paymentMethod}</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${STATUS_STYLE[o.status] ?? 'bg-slate-100'}`}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right text-xs text-muted">{relativeTime(o.placedAt)}</td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="rounded-lg bg-navy-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-navy-600"
                      >
                        Manage →
                      </Link>
                    </td>
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
