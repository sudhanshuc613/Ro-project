import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN, relativeTime } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My Orders', robots: { index: false } };

const STEPS = ['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const;
const LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmed', PACKED: 'Packed', SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered',
};

export default async function MyOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login?callbackUrl=/account/orders');

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { placedAt: 'desc' },
    include: { items: true },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/account" className="text-sm font-semibold text-aqua-600 hover:underline">← My Account</Link>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-navy-700">My Orders</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-navy-200 py-16 text-center">
          <p className="text-4xl">📦</p>
          <p className="mt-3 font-semibold text-navy-700">No orders yet</p>
          <Link href="/products" className="mt-4 inline-block rounded-xl bg-cta-orange px-6 py-3 font-bold text-white">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {orders.map((o) => {
            const activeIdx = STEPS.indexOf(o.status as (typeof STEPS)[number]);
            const cancelled = o.status === 'CANCELLED';

            return (
              <article key={o.id} className="rounded-2xl border border-navy-100 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-bold text-aqua-600">{o.orderNumber}</p>
                    <p className="text-xs text-muted">
                      Placed {formatDateIN(o.placedAt)} · {relativeTime(o.placedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-extrabold text-navy-700">
                      {formatINR(Number(o.totalAmount))}
                    </p>
                    <p className={`text-xs font-bold ${o.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {o.paymentStatus === 'PAID' ? 'Paid' : o.paymentMethod === 'COD' ? 'Pay on delivery' : 'Payment pending'}
                    </p>
                  </div>
                </div>

                {/* Progress tracker */}
                {cancelled ? (
                  <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
                    Order cancelled{o.cancelReason ? ` — ${o.cancelReason}` : ''}
                  </p>
                ) : (
                  <ol className="mt-5 flex items-center">
                    {STEPS.map((s, i) => {
                      const done = activeIdx >= i;
                      return (
                        <li key={s} className="flex flex-1 items-center last:flex-none">
                          <span className="flex flex-col items-center">
                            <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                              done ? 'bg-cta-green text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {done ? '✓' : i + 1}
                            </span>
                            <span className={`mt-1 hidden text-[10px] font-semibold sm:block ${done ? 'text-navy-700' : 'text-muted'}`}>
                              {LABEL[s]}
                            </span>
                          </span>
                          {i < STEPS.length - 1 && (
                            <span className={`mx-1 h-0.5 flex-1 ${activeIdx > i ? 'bg-cta-green' : 'bg-slate-200'}`} />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}

                {o.trackingNumber && (
                  <p className="mt-4 rounded-lg bg-aqua-50 px-4 py-2.5 text-sm text-aqua-900">
                    🚚 <strong>{o.courierPartner}</strong> · AWB <span className="font-mono">{o.trackingNumber}</span>
                    {o.trackingUrl && (
                      <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer" className="ml-2 font-bold underline">
                        Track ↗
                      </a>
                    )}
                  </p>
                )}

                {/* Items */}
                <ul className="mt-4 divide-y divide-navy-50 border-t border-navy-50">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 py-3">
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                        {it.productImageUrl
                          ? <Image src={it.productImageUrl} alt="" fill sizes="48px" className="object-contain p-1" />
                          : <span className="grid h-full place-items-center">💧</span>}
                      </span>
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="block font-medium text-navy-700">{it.productName}</span>
                        <span className="block text-xs text-muted">Qty {it.quantity}</span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-navy-700">
                        {formatINR(Number(it.lineTotal))}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/account/orders/${o.orderNumber}/invoice`}
                    className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-bold text-navy-700 hover:bg-navy-50"
                  >
                    📄 Invoice
                  </Link>
                  <a
                    href={`https://wa.me/918969821440?text=${encodeURIComponent(`Hi, question about order ${o.orderNumber}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
                  >
                    💬 Need help
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
