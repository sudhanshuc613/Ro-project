'use client';

/**
 * Guest order tracking form.
 *
 * The old /track-order page just told people to call or WhatsApp. That is a
 * support cost on every single order. This resolves the question in the
 * browser — the same reason Amazon and Flipkart both offer guest tracking.
 */
import { useState } from 'react';
import Image from 'next/image';
import { formatINR, formatDateIN } from '@/lib/utils/format';

const STEPS = ['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const;
const STEP_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
};

interface Found {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  totalAmount: number;
  placedAt: string;
  estimatedDelivery: string | null;
  courierPartner: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  items: { productName: string; quantity: number; productImageUrl: string | null }[];
  deliveringTo: string;
  history: { toStatus: string; createdAt: string; note: string | null }[];
}

export default function OrderLookup() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Found | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Could not find that order');
        return;
      }
      setOrder(data.order);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const activeIdx = order ? STEPS.indexOf(order.status as (typeof STEPS)[number]) : -1;
  const cancelled = order?.status === 'CANCELLED';

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={search} className="card p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-navy-700">Order number</span>
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="AQN-2026-000123"
              className="input font-mono"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-navy-700">Mobile used on the order</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              inputMode="numeric"
              className="input"
              required
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-cta-orange py-3.5 font-bold text-white shadow-cta transition hover:bg-cta-orangeDark disabled:opacity-60"
        >
          {loading ? 'Searching…' : 'Track my order'}
        </button>
        <p className="mt-2 text-center text-xs text-muted">
          No account needed — both details must match the order.
        </p>
      </form>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}

      {order && (
        <div className="mt-5 space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg font-extrabold text-navy-700">{order.orderNumber}</p>
                <p className="text-xs text-muted">
                  Placed {formatDateIN(order.placedAt)} · {order.deliveringTo}
                </p>
              </div>
              <div className="text-right">
                <p className="tnum font-display text-lg font-extrabold text-navy-700">
                  {formatINR(order.totalAmount)}
                </p>
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-800'
                }`}>
                  {order.paymentStatus === 'PAID' ? 'Paid' : order.paymentMethod === 'COD' ? 'Pay on delivery' : 'Payment pending'}
                </span>
              </div>
            </div>

            {cancelled ? (
              <p className="mt-4 rounded-xl bg-red-50 p-3.5 text-sm font-semibold text-red-800">
                This order was cancelled. Call us if that looks wrong.
              </p>
            ) : (
              <ol className="mt-5 space-y-0">
                {STEPS.map((s, i) => {
                  const done = activeIdx > i;
                  const current = activeIdx === i;
                  return (
                    <li key={s} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          done ? 'bg-cta-green text-white'
                          : current ? 'bg-aqua-500 text-white ring-4 ring-aqua-100'
                          : 'bg-navy-100 text-navy-400'
                        }`}>
                          {done ? '✓' : i + 1}
                        </span>
                        {i < STEPS.length - 1 && (
                          <span className={`w-0.5 flex-1 ${done ? 'bg-cta-green' : 'bg-navy-100'}`} style={{ minHeight: 28 }} />
                        )}
                      </div>
                      <div className={`pb-5 ${current ? '' : 'opacity-70'}`}>
                        <p className={`text-sm font-bold ${current ? 'text-aqua-700' : 'text-navy-700'}`}>
                          {STEP_LABEL[s]}
                          {current && <span className="ml-2 text-[11px] font-normal text-aqua-600">● current</span>}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {order.trackingNumber && (
              <div className="rounded-xl bg-aqua-50 p-3.5 text-sm text-aqua-900">
                🚚 <strong>{order.courierPartner}</strong> · AWB{' '}
                <span className="font-mono text-xs">{order.trackingNumber}</span>
                {order.trackingUrl && (
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="ml-2 font-bold underline">
                    Track ↗
                  </a>
                )}
              </div>
            )}

            {order.estimatedDelivery && order.status !== 'DELIVERED' && (
              <p className="mt-2 text-sm text-muted">
                Expected by <strong className="text-navy-700">{formatDateIN(order.estimatedDelivery)}</strong>
              </p>
            )}
          </div>

          <div className="card p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Items</p>
            <ul className="mt-2 divide-y divide-navy-50">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-sand-100">
                    {it.productImageUrl ? (
                      <Image
                        src={it.productImageUrl}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-contain p-1"
                        unoptimized={it.productImageUrl.startsWith('/api/media')}
                      />
                    ) : '💧'}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-navy-700">{it.productName}</span>
                  <span className="shrink-0 text-xs text-muted">×{it.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
