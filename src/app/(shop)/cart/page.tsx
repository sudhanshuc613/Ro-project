'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { formatINR } from '@/lib/utils/format';
import { SHIPPING, CONTACT } from '@/lib/constants';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
  const savings = items.reduce((n, i) => n + ((i.mrp ?? i.price) - i.price) * i.quantity, 0);
  const shipping = subtotal >= SHIPPING.freeAbove || subtotal === 0 ? 0 : SHIPPING.flatRate;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-20 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-navy-700">Your cart is empty</h1>
        <p className="mt-2 text-muted">Add a purifier or spare part to get started.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="rounded-xl bg-cta-orange px-6 py-3 font-bold text-white hover:bg-cta-orangeDark">
            Browse Products
          </Link>
          <a href={CONTACT.primaryTel} className="rounded-xl border border-navy-100 px-6 py-3 font-bold text-navy-700 hover:bg-navy-50">
            📞 Talk to an expert
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-extrabold text-navy-700">
        My Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr,340px]">
        {/* Items */}
        <ul className="space-y-4">
          {items.map((i) => (
            <li key={`${i.productId}-${i.variantId ?? ''}`} className="flex gap-4 rounded-2xl border border-navy-100 p-4">
              <Link href={`/products/${i.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                {i.image ? (
                  <Image src={i.image} alt={i.name} fill sizes="96px" className="object-contain p-2" />
                ) : (
                  <span className="grid h-full place-items-center text-2xl">💧</span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link href={`/products/${i.slug}`} className="line-clamp-2 font-semibold text-navy-700 hover:text-aqua-600">
                  {i.name}
                </Link>
                <p className="mt-1 font-display text-lg font-extrabold text-navy-700">{formatINR(i.price)}</p>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center rounded-lg border border-navy-100">
                    <button
                      onClick={() => updateQty(i.productId, i.quantity - 1, i.variantId)}
                      className="px-3 py-1.5 font-bold text-navy-600 hover:bg-navy-50"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-9 text-center text-sm font-bold">{i.quantity}</span>
                    <button
                      onClick={() => updateQty(i.productId, i.quantity + 1, i.variantId)}
                      disabled={i.quantity >= i.maxQty}
                      className="px-3 py-1.5 font-bold text-navy-600 hover:bg-navy-50 disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(i.productId, i.variantId)}
                    className="text-sm font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <p className="shrink-0 font-display text-lg font-extrabold text-navy-700">
                {formatINR(i.price * i.quantity)}
              </p>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-2xl border border-navy-100 p-5">
            <h2 className="font-display font-bold text-navy-700">Order Summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold text-navy-700">{formatINR(subtotal)}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-cta-green">
                  <dt>You save</dt>
                  <dd className="font-semibold">− {formatINR(savings)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-semibold text-navy-700">
                  {shipping === 0 ? <span className="text-cta-green">FREE</span> : formatINR(shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-navy-100 pt-3 text-base">
                <dt className="font-bold text-navy-700">Total</dt>
                <dd className="font-display text-xl font-extrabold text-navy-700">{formatINR(total)}</dd>
              </div>
            </dl>

            {subtotal < SHIPPING.freeAbove && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Add {formatINR(SHIPPING.freeAbove - subtotal)} more for FREE delivery
              </p>
            )}

            <Link
              href="/checkout"
              className="mt-5 block rounded-xl bg-cta-orange py-3.5 text-center font-bold text-white shadow-cta hover:bg-cta-orangeDark"
            >
              Proceed to Checkout →
            </Link>

            <Link href="/products" className="mt-3 block text-center text-sm font-semibold text-aqua-600 hover:underline">
              Continue shopping
            </Link>
          </div>

          <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-100">
            <p className="font-bold">Need help ordering?</p>
            <p className="mt-1">Call us and we&apos;ll place the order for you.</p>
            <a href={CONTACT.primaryTel} className="mt-2 inline-block font-bold underline">
              📞 {CONTACT.primaryPhone}
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
