import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN } from '@/lib/utils/format';
import { getContactSettings, telLink, waLink } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Order Confirmed',
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; pending?: string };
}) {
  if (!searchParams.order) notFound();

  const [order, contact] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNumber: searchParams.order },
      include: { items: true, user: { select: { fullName: true, phone: true } } },
    }),
    getContactSettings(),
  ]);

  if (!order) notFound();

  const addr = order.shippingAddress as {
    contactName?: string; line1?: string; landmark?: string;
    city?: string; state?: string; pincode?: string;
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      {searchParams.pending && (
        <div className="mb-5 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <p className="font-display font-bold text-amber-900">⏳ We&apos;re verifying your payment</p>
          <p className="mt-1.5 text-sm text-amber-900 text-pretty">
            Your order is placed. We check the reference number against our bank and confirm it —
            usually within a few hours during working hours. You&apos;ll get a WhatsApp the moment
            it&apos;s confirmed, and the order moves to packing straight after.
          </p>
          <p className="mt-2 text-xs text-amber-800">
            Paid but haven&apos;t heard from us by end of day? Call us with your order number — we&apos;ll sort it immediately.
          </p>
        </div>
      )}

      {/* Confirmation */}
      <div className="rounded-2xl bg-emerald-50 p-8 text-center ring-1 ring-emerald-200">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
          <svg className="h-9 w-9 text-cta-green" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-emerald-900">
          Order Confirmed!
        </h1>
        <p className="mt-1 text-emerald-800">Thank you for shopping with Aqua Perl</p>
        <p className="mt-4 font-display text-2xl font-extrabold tracking-wide text-navy-700">
          {order.orderNumber}
        </p>
        <p className="mt-1 text-sm text-emerald-800">
          {order.paymentStatus === 'PAID'
            ? 'Payment received'
            : order.paymentMethod === 'COD'
              ? 'Pay on delivery'
              : 'Payment being verified'}
          {' · '}
          A confirmation has been sent to your WhatsApp
        </p>
      </div>

      {/* Items */}
      <section className="mt-6 rounded-2xl border border-navy-100 p-5">
        <h2 className="font-display text-lg font-bold text-navy-700">Your Items</h2>
        <ul className="mt-3 divide-y divide-navy-50">
          {order.items.map((it) => (
            <li key={it.id} className="flex gap-3 py-3">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                {it.productImageUrl
                  ? <Image src={it.productImageUrl} alt="" fill sizes="64px" className="object-contain p-1" />
                  : <span className="grid h-full place-items-center text-xl">💧</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-navy-700">{it.productName}</span>
                <span className="block text-xs text-muted">
                  {it.productSku} · Qty {it.quantity} × {formatINR(Number(it.unitPrice))}
                </span>
              </span>
              <span className="shrink-0 font-bold text-navy-700">{formatINR(Number(it.lineTotal))}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-navy-100 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-semibold text-navy-700">{formatINR(Number(order.subtotal))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className="font-semibold text-navy-700">
              {Number(order.shippingAmount) === 0
                ? <span className="text-cta-green">FREE</span>
                : formatINR(Number(order.shippingAmount))}
            </dd>
          </div>
          {Number(order.codCharge) > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted">COD charge</dt>
              <dd className="font-semibold text-navy-700">{formatINR(Number(order.codCharge))}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-navy-100 pt-2">
            <dt className="font-bold text-navy-700">Total</dt>
            <dd className="font-display text-xl font-extrabold text-navy-700">
              {formatINR(Number(order.totalAmount))}
            </dd>
          </div>
        </dl>
      </section>

      {/* Delivery */}
      <section className="mt-4 rounded-2xl border border-navy-100 p-5">
        <h2 className="font-display text-lg font-bold text-navy-700">Delivery Details</h2>
        <p className="mt-2 font-semibold text-navy-700">{addr.contactName}</p>
        <p className="text-sm text-muted">
          {addr.line1}{addr.landmark ? `, near ${addr.landmark}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
        </p>
        {order.estimatedDelivery && (
          <p className="mt-3 rounded-lg bg-aqua-50 px-4 py-2.5 text-sm font-semibold text-aqua-800">
            📦 Expected delivery by {formatDateIN(order.estimatedDelivery)}
          </p>
        )}
      </section>

      {/* Next steps */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/account/orders" className="rounded-xl bg-navy-700 px-6 py-3 font-bold text-white hover:bg-navy-600">
          View My Orders
        </Link>
        <Link href="/products" className="rounded-xl border border-navy-200 px-6 py-3 font-bold text-navy-700 hover:bg-navy-50">
          Continue Shopping
        </Link>
        <a
          href={waLink(contact.whatsapp, `Hi, I have a question about order ${order.orderNumber}`)}
          target="_blank" rel="noopener noreferrer"
          className="rounded-xl bg-emerald-50 px-6 py-3 font-bold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
        >
          💬 Need help?
        </a>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Questions? Call{' '}
        <a href={telLink(contact.primaryPhone)} className="font-bold text-aqua-600 hover:underline">
          {contact.primaryPhone}
        </a>{' '}
        · {contact.hours}
      </p>
    </main>
  );
}
