'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { formatINR } from '@/lib/utils/format';
import { CONTACT, SHIPPING } from '@/lib/constants';

/**
 * Checkout — currently a WhatsApp/call-based order flow.
 *
 * Razorpay integration is the next milestone. Until the gateway is live this
 * page converts the cart into a pre-filled WhatsApp message so no order is
 * ever lost, rather than showing a dead "coming soon" screen.
 */
export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
  const shipping = subtotal >= SHIPPING.freeAbove || subtotal === 0 ? 0 : SHIPPING.flatRate;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-20 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-navy-700">Your cart is empty</h1>
        <Link href="/products" className="mt-6 inline-block rounded-xl bg-cta-orange px-6 py-3 font-bold text-white">
          Browse Products
        </Link>
      </main>
    );
  }

  const orderText = [
    'Hi AquaNexa, I want to order:',
    '',
    ...items.map((i, n) => `${n + 1}. ${i.name} × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString('en-IN')}`),
    '',
    `Subtotal: ₹${subtotal.toLocaleString('en-IN')}`,
    `Shipping: ${shipping === 0 ? 'FREE' : `₹${shipping}`}`,
    `Total: ₹${total.toLocaleString('en-IN')}`,
    '',
    'Please confirm availability and delivery time.',
  ].join('\n');

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-extrabold text-navy-700">Checkout</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr,340px]">
        <div>
          <div className="rounded-2xl border border-aqua-200 bg-aqua-50 p-6">
            <h2 className="font-display text-lg font-bold text-navy-700">
              Complete your order on WhatsApp or by phone
            </h2>
            <p className="mt-2 text-sm text-navy-600">
              Online card and UPI payment is being activated. Right now our team confirms every
              order personally — you get exact delivery timing, and you can pay by UPI, bank
              transfer, or cash on delivery.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(orderText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-[#25D366] px-6 py-3.5 font-bold text-white hover:brightness-95"
              >
                💬 Send order on WhatsApp
              </a>
              <a
                href={CONTACT.primaryTel}
                className="rounded-xl bg-cta-green px-6 py-3.5 font-bold text-white hover:bg-cta-greenDark"
              >
                📞 Call {CONTACT.primaryPhone}
              </a>
            </div>

            <p className="mt-4 text-xs text-navy-500">
              Order details are pre-filled automatically — just hit send.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-navy-100 p-5">
            <h3 className="font-bold text-navy-700">Your items</h3>
            <ul className="mt-3 divide-y divide-navy-50">
              {items.map((i) => (
                <li key={`${i.productId}-${i.variantId ?? ''}`} className="flex justify-between gap-4 py-3 text-sm">
                  <span className="text-navy-700">
                    {i.name} <span className="text-muted">× {i.quantity}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-navy-700">{formatINR(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-2xl border border-navy-100 p-5">
            <h2 className="font-display font-bold text-navy-700">Order Summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold text-navy-700">{formatINR(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-semibold text-navy-700">
                  {shipping === 0 ? <span className="text-cta-green">FREE</span> : formatINR(shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-navy-100 pt-3">
                <dt className="font-bold text-navy-700">Total</dt>
                <dd className="font-display text-xl font-extrabold text-navy-700">{formatINR(total)}</dd>
              </div>
            </dl>
            <Link href="/cart" className="mt-5 block text-center text-sm font-semibold text-aqua-600 hover:underline">
              ← Back to cart
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
