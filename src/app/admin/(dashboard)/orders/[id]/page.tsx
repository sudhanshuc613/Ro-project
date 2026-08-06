/**
 * Admin order detail — everything about one order on one screen.
 *
 * Previously the orders list was terminal: you could see an order existed and
 * nothing else. This page is where the order actually gets worked.
 */
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN, relativeTime } from '@/lib/utils/format';
import OrderManager from '@/components/admin/OrderManager';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const o = await prisma.order.findUnique({
    where: { id: params.id },
    select: { orderNumber: true },
  });
  return { title: o ? `Order ${o.orderNumber}` : 'Order' };
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PACKED: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  OUT_FOR_DELIVERY: 'bg-amber-100 text-amber-800',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  RETURN_REQUESTED: 'bg-amber-100 text-amber-800',
  RETURNED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-slate-100 text-slate-700',
};

const PAY_STYLE: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700',
  UNPAID: 'bg-red-100 text-red-700',
  AUTHORIZED: 'bg-amber-100 text-amber-800',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-slate-100 text-slate-700',
  PARTIALLY_REFUNDED: 'bg-amber-100 text-amber-800',
};

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      payments: { orderBy: { createdAt: 'desc' } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
      user: { select: { id: true, fullName: true, phone: true, email: true, totalOrders: true } },
    },
  });
  if (!order) notFound();

  const addr = order.shippingAddress as {
    contactName?: string; contactPhone?: string; line1?: string; line2?: string;
    landmark?: string; city?: string; state?: string; pincode?: string;
  };

  const isGuest = !order.userId;
  const phone = order.user?.phone ?? order.guestPhone ?? addr.contactPhone ?? '';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm font-semibold text-aqua-600 hover:underline">
            ← All orders
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-navy-700">{order.orderNumber}</h1>
            <span className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[order.status]}`}>
              {order.status.replace(/_/g, ' ')}
            </span>
            <span className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${PAY_STYLE[order.paymentStatus]}`}>
              {order.paymentStatus}
            </span>
            {isGuest && (
              <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                GUEST ORDER
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            Placed {formatDateIN(order.placedAt)} · {relativeTime(order.placedAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href={`tel:+91${phone}`}
            className="rounded-xl bg-cta-green px-4 py-2.5 text-sm font-bold text-white"
          >
            📞 Call
          </a>
          <a
            href={`https://wa.me/91${phone}?text=${encodeURIComponent(`Namaste, Aqua Perl se. Aapke order ${order.orderNumber} ke baare mein baat karni thi.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr,1fr]">
        <div className="space-y-5">
          {/* ── The control panel ── */}
          <OrderManager
            orderId={order.id}
            orderNumber={order.orderNumber}
            status={order.status}
            paymentStatus={order.paymentStatus}
            paymentMethod={order.paymentMethod}
            totalAmount={Number(order.totalAmount)}
            courierPartner={order.courierPartner}
            trackingNumber={order.trackingNumber}
            trackingUrl={order.trackingUrl}
            adminNote={order.adminNote}
            customerPhone={phone}
          />

          {/* Items */}
          <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-100">
            <h2 className="font-display font-bold text-navy-700">
              Items ({order.items.length})
            </h2>
            <ul className="mt-3 divide-y divide-navy-50">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 py-3">
                  <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-sand-100">
                    {it.productImageUrl ? (
                      <Image
                        src={it.productImageUrl}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                        unoptimized={it.productImageUrl.startsWith('/api/media')}
                      />
                    ) : '💧'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-navy-700">{it.productName}</span>
                    <span className="block text-xs text-muted">
                      SKU {it.productSku} · Qty {it.quantity} × {formatINR(Number(it.unitPrice))}
                    </span>
                  </span>
                  <span className="tnum shrink-0 text-sm font-bold text-navy-700">
                    {formatINR(Number(it.lineTotal))}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-1.5 border-t border-navy-100 pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tnum">{formatINR(Number(order.subtotal))}</dd></div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd className="tnum">− {formatINR(Number(order.discountAmount))}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd className="tnum">{Number(order.shippingAmount) === 0 ? 'FREE' : formatINR(Number(order.shippingAmount))}</dd></div>
              {Number(order.codCharge) > 0 && (
                <div className="flex justify-between"><dt className="text-muted">COD charge</dt><dd className="tnum">{formatINR(Number(order.codCharge))}</dd></div>
              )}
              <div className="flex justify-between border-t border-navy-100 pt-2 font-display text-lg font-extrabold text-navy-700">
                <dt>Total</dt><dd className="tnum">{formatINR(Number(order.totalAmount))}</dd>
              </div>
            </dl>
          </section>

          {/* Payment ledger */}
          {order.payments.length > 0 && (
            <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-100">
              <h2 className="font-display font-bold text-navy-700">Payment records</h2>
              <ul className="mt-3 space-y-2">
                {order.payments.map((pm) => (
                  <li key={pm.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sand-50 p-3 text-sm">
                    <span>
                      <strong className="text-navy-700">{formatINR(Number(pm.amount))}</strong>
                      <span className="text-muted"> · {pm.status} · {pm.method ?? pm.gateway}</span>
                      {pm.gatewayPaymentId && (
                        <span className="block font-mono text-[11px] text-muted">ref {pm.gatewayPaymentId}</span>
                      )}
                    </span>
                    <span className="text-xs text-muted">{formatDateIN(pm.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Timeline */}
          <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-100">
            <h2 className="font-display font-bold text-navy-700">History</h2>
            <ol className="mt-3 space-y-2.5">
              {order.statusHistory.map((h) => (
                <li key={h.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-aqua-500" />
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold text-navy-700">
                      {h.fromStatus ? `${h.fromStatus.replace(/_/g, ' ')} → ` : ''}
                      {h.toStatus.replace(/_/g, ' ')}
                    </span>
                    {h.note && <span className="block text-xs text-muted">{h.note}</span>}
                  </span>
                  <span className="shrink-0 text-xs text-muted">{relativeTime(h.createdAt)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-100">
            <h2 className="font-display font-bold text-navy-700">Customer</h2>
            {isGuest ? (
              <div className="mt-2">
                <p className="font-semibold text-navy-700">{addr.contactName ?? 'Guest'}</p>
                <p className="text-sm text-muted">📞 {phone}</p>
                {order.guestEmail && <p className="text-sm text-muted">✉️ {order.guestEmail}</p>}
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  Ordered without an account. If they register with{' '}
                  <strong>{phone}</strong>, this order links to them automatically.
                </p>
              </div>
            ) : (
              <div className="mt-2">
                <Link
                  href={`/admin/customers?q=${order.user!.phone}`}
                  className="font-semibold text-navy-700 hover:text-aqua-600"
                >
                  {order.user!.fullName}
                </Link>
                <p className="text-sm text-muted">📞 {order.user!.phone}</p>
                {order.user!.email && <p className="text-sm text-muted">✉️ {order.user!.email}</p>}
                <p className="mt-1.5 text-xs text-muted">
                  {order.user!.totalOrders} order{order.user!.totalOrders === 1 ? '' : 's'} lifetime
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-100">
            <h2 className="font-display font-bold text-navy-700">Delivery address</h2>
            <p className="mt-2 text-sm text-navy-600">
              <strong className="text-navy-700">{addr.contactName}</strong><br />
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
              {addr.landmark ? <><br />Near {addr.landmark}</> : null}
              <br />{addr.city}, {addr.state} – {addr.pincode}
              <br />📞 {addr.contactPhone}
            </p>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(`${addr.line1 ?? ''} ${addr.city ?? ''} ${addr.pincode ?? ''}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-bold text-aqua-600 hover:underline"
            >
              📍 Open in Maps
            </a>
          </section>

          {order.customerNote && (
            <section className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
              <h2 className="font-display font-bold text-amber-900">Customer note</h2>
              <p className="mt-1.5 text-sm text-amber-900">{order.customerNote}</p>
            </section>
          )}

          {order.trackingNumber && (
            <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-100">
              <h2 className="font-display font-bold text-navy-700">Shipping</h2>
              <p className="mt-2 text-sm">
                <span className="text-muted">Courier:</span> <strong>{order.courierPartner}</strong><br />
                <span className="text-muted">AWB:</span> <span className="font-mono text-xs">{order.trackingNumber}</span>
              </p>
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-bold text-aqua-600 hover:underline">
                  Track shipment ↗
                </a>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
