import Link from 'next/link';
import { formatINR, relativeTime } from '@/lib/utils/format';

const STATUS_STYLE: Record<string, string> = {
  PENDING:          'bg-slate-100 text-slate-700',
  CONFIRMED:        'bg-blue-100 text-blue-700',
  PACKED:           'bg-indigo-100 text-indigo-700',
  SHIPPED:          'bg-violet-100 text-violet-700',
  OUT_FOR_DELIVERY: 'bg-amber-100 text-amber-700',
  DELIVERED:        'bg-emerald-100 text-emerald-700',
  CANCELLED:        'bg-red-100 text-red-700',
  RETURNED:         'bg-orange-100 text-orange-700',
  REFUNDED:         'bg-slate-100 text-slate-700',
};

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  city: string;
  total: number;
  status: string;
  paymentStatus: string;
  placedAt: Date;
}

export default function RecentOrdersTable({ orders }: { orders: Order[] }) {
  if (!orders.length) {
    return <p className="py-8 text-center text-sm text-muted">No orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-muted">
            <th className="pb-2.5 font-semibold">Order</th>
            <th className="pb-2.5 font-semibold">Customer</th>
            <th className="pb-2.5 font-semibold">Amount</th>
            <th className="pb-2.5 font-semibold">Status</th>
            <th className="pb-2.5 text-right font-semibold">Placed</th>
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
                <span className="block font-medium text-navy-700">{o.customerName}</span>
                <span className="block text-xs text-muted">{o.city}</span>
              </td>
              <td className="py-3">
                <span className="block font-bold text-navy-700">{formatINR(o.total)}</span>
                <span className={`block text-[11px] font-semibold ${o.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {o.paymentStatus}
                </span>
              </td>
              <td className="py-3">
                <span className={`inline-block rounded-md px-2 py-1 text-[11px] font-bold ${STATUS_STYLE[o.status] ?? 'bg-slate-100 text-slate-700'}`}>
                  {o.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="py-3 text-right text-xs text-muted">{relativeTime(o.placedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
