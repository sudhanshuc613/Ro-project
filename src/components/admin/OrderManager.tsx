'use client';

/**
 * Order control panel — status, payment, tracking, notes.
 *
 * DESIGN CHOICE: the next-status buttons are computed from the same state
 * machine the server enforces (ORDER_FLOW). The admin only ever sees moves
 * that are actually legal, instead of picking from a dropdown of ten statuses
 * and getting an error back. Fewer errors, faster clicking.
 *
 * The payment panel exists because most of this business's money will arrive
 * as UPI or cash long before a gateway is live. Recording it here keeps the
 * order state honest rather than leaving everything stuck on UNPAID.
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/** Mirror of ORDER_FLOW in order.service.ts — server is still authoritative. */
const FLOW: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
  RETURNED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

const LABEL: Record<string, string> = {
  CONFIRMED: '✓ Confirm order',
  PACKED: '📦 Mark packed',
  SHIPPED: '🚚 Mark shipped',
  OUT_FOR_DELIVERY: '🛵 Out for delivery',
  DELIVERED: '✅ Mark delivered',
  CANCELLED: '✕ Cancel order',
  RETURN_REQUESTED: '↩️ Return requested',
  RETURNED: '↩️ Mark returned',
  REFUNDED: '💸 Mark refunded',
};

const DESTRUCTIVE = new Set(['CANCELLED', 'RETURNED', 'REFUNDED']);

const COURIERS = ['Delhivery', 'Blue Dart', 'DTDC', 'Ekart', 'XpressBees', 'India Post', 'Shadowfax', 'Local delivery', 'Self delivery'];

export interface OrderManagerProps {
  orderId: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  totalAmount: number;
  courierPartner: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  adminNote: string | null;
  customerPhone: string;
}

export default function OrderManager(p: OrderManagerProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [tab, setTab] = useState<'status' | 'payment' | 'tracking' | 'note'>('status');
  const [statusNote, setStatusNote] = useState('');

  const [pay, setPay] = useState({
    paymentStatus: p.paymentStatus === 'PAID' ? 'PAID' : 'PAID',
    paymentMethod: p.paymentMethod ?? 'UPI',
    reference: '',
    amount: String(p.totalAmount),
    note: '',
  });

  const [track, setTrack] = useState({
    courierPartner: p.courierPartner ?? '',
    trackingNumber: p.trackingNumber ?? '',
    trackingUrl: p.trackingUrl ?? '',
    estimatedDelivery: '',
  });

  const [note, setNote] = useState(p.adminNote ?? '');

  const next = FLOW[p.status] ?? [];
  const isPrepaid = p.paymentMethod !== 'COD';
  const blockedByPayment = isPrepaid && p.paymentStatus !== 'PAID';

  async function send(payload: Record<string, unknown>, label: string) {
    setBusy(label);
    try {
      const res = await fetch(`/api/admin/orders/${p.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message ?? 'Could not update');
        return false;
      }
      toast.success('Updated');
      startTransition(() => router.refresh());
      return true;
    } catch {
      toast.error('Network error');
      return false;
    } finally {
      setBusy(null);
    }
  }

  const inp =
    'w-full rounded-xl border-navy-200 bg-white px-3.5 py-2.5 text-sm focus:border-aqua-500 focus:ring-2 focus:ring-aqua-200';

  return (
    <div className="rounded-2xl bg-white shadow-card ring-1 ring-navy-100">
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-navy-100">
        {([
          ['status', 'Status'],
          ['payment', 'Payment'],
          ['tracking', 'Shipping'],
          ['note', 'Notes'],
        ] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`shrink-0 border-b-2 px-5 py-3 text-sm font-bold transition ${
              tab === k
                ? 'border-aqua-500 text-aqua-700'
                : 'border-transparent text-muted hover:text-navy-700'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* ── STATUS ── */}
        {tab === 'status' && (
          <div className="space-y-4">
            {blockedByPayment && (
              <div className="rounded-xl bg-amber-50 p-3.5 text-sm text-amber-900 ring-1 ring-amber-200">
                ⚠️ This is a <strong>prepaid</strong> order and payment is still{' '}
                <strong>{p.paymentStatus}</strong>. Packing and shipping are blocked until you
                record the payment on the <button onClick={() => setTab('payment')} className="font-bold underline">Payment tab</button>.
              </div>
            )}

            {next.length === 0 ? (
              <p className="text-sm text-muted">
                This order is <strong className="text-navy-700">{p.status.replace(/_/g, ' ')}</strong> — no further
                status changes are possible.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted">
                  Current: <strong className="text-navy-700">{p.status.replace(/_/g, ' ')}</strong>. Choose what happened next.
                </p>

                <input
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Optional note (kept in order history)"
                  className={inp}
                />

                <div className="flex flex-wrap gap-2">
                  {next.map((s) => {
                    const danger = DESTRUCTIVE.has(s);
                    const blocked = blockedByPayment && ['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(s);
                    return (
                      <button
                        key={s}
                        disabled={busy !== null || blocked}
                        onClick={() => {
                          if (danger && !confirm(`Really mark this order as ${s.replace(/_/g, ' ')}?`)) return;
                          void send({ action: 'status', status: s, note: statusNote || undefined }, s);
                        }}
                        title={blocked ? 'Record the payment first' : undefined}
                        className={`rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          danger
                            ? 'bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100'
                            : 'bg-cta-green text-white shadow-call hover:bg-cta-greenDark'
                        }`}
                      >
                        {busy === s ? '…' : LABEL[s] ?? s}
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-muted">
                  Marking <strong>shipped</strong> or <strong>delivered</strong> sends the customer a WhatsApp update automatically.
                </p>
              </>
            )}
          </div>
        )}

        {/* ── PAYMENT ── */}
        {tab === 'payment' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-navy-50 p-3.5 text-sm">
              <span className="text-muted">Currently: </span>
              <strong className="text-navy-700">{p.paymentStatus}</strong>
              {p.paymentMethod && <span className="text-muted"> · via {p.paymentMethod}</span>}
              <span className="text-muted"> · order total ₹{p.totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-navy-700">Payment status</span>
                <select
                  value={pay.paymentStatus}
                  onChange={(e) => setPay({ ...pay, paymentStatus: e.target.value })}
                  className={inp}
                >
                  <option value="PAID">PAID — money received</option>
                  <option value="UNPAID">UNPAID — not received</option>
                  <option value="AUTHORIZED">AUTHORIZED — held, not captured</option>
                  <option value="FAILED">FAILED — attempt failed</option>
                  <option value="PARTIALLY_REFUNDED">PARTIALLY REFUNDED</option>
                  <option value="REFUNDED">REFUNDED — money returned</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-navy-700">Received via</span>
                <select
                  value={pay.paymentMethod}
                  onChange={(e) => setPay({ ...pay, paymentMethod: e.target.value })}
                  className={inp}
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="COD">Cash on delivery</option>
                  <option value="NETBANKING">Bank transfer / NEFT</option>
                  <option value="RAZORPAY">Razorpay gateway</option>
                  <option value="CARD">Card</option>
                  <option value="WALLET">Wallet</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-navy-700">
                  Reference / UTR number
                </span>
                <input
                  value={pay.reference}
                  onChange={(e) => setPay({ ...pay, reference: e.target.value })}
                  placeholder="e.g. 431203456789"
                  className={inp}
                />
                <span className="mt-1 block text-[11px] text-muted">
                  Copy it from your UPI app. This is your proof later.
                </span>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-navy-700">Amount received</span>
                <input
                  type="number"
                  value={pay.amount}
                  onChange={(e) => setPay({ ...pay, amount: e.target.value })}
                  className={inp}
                />
              </label>
            </div>

            <input
              value={pay.note}
              onChange={(e) => setPay({ ...pay, note: e.target.value })}
              placeholder="Optional internal note"
              className={inp}
            />

            <button
              disabled={busy !== null}
              onClick={() =>
                void send(
                  {
                    action: 'payment',
                    paymentStatus: pay.paymentStatus,
                    paymentMethod: pay.paymentMethod,
                    reference: pay.reference || undefined,
                    amount: Number(pay.amount) || undefined,
                    note: pay.note || undefined,
                  },
                  'payment',
                )
              }
              className="rounded-xl bg-cta-orange px-6 py-3 text-sm font-bold text-white shadow-cta transition hover:bg-cta-orangeDark disabled:opacity-50"
            >
              {busy === 'payment' ? 'Saving…' : 'Record payment'}
            </button>

            <p className="text-xs text-muted">
              Marking a PENDING order as PAID moves it to CONFIRMED automatically and WhatsApps the customer.
            </p>
          </div>
        )}

        {/* ── TRACKING ── */}
        {tab === 'tracking' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-navy-700">Courier *</span>
                <input
                  list="couriers"
                  value={track.courierPartner}
                  onChange={(e) => setTrack({ ...track, courierPartner: e.target.value })}
                  placeholder="Delhivery"
                  className={inp}
                />
                <datalist id="couriers">
                  {COURIERS.map((c) => <option key={c} value={c} />)}
                </datalist>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-navy-700">AWB / tracking number *</span>
                <input
                  value={track.trackingNumber}
                  onChange={(e) => setTrack({ ...track, trackingNumber: e.target.value })}
                  className={inp}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-bold text-navy-700">Tracking URL</span>
                <input
                  value={track.trackingUrl}
                  onChange={(e) => setTrack({ ...track, trackingUrl: e.target.value })}
                  placeholder="https://www.delhivery.com/track/package/…"
                  className={inp}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-navy-700">Estimated delivery</span>
                <input
                  type="date"
                  value={track.estimatedDelivery}
                  onChange={(e) => setTrack({ ...track, estimatedDelivery: e.target.value })}
                  className={inp}
                />
              </label>
            </div>

            <button
              disabled={busy !== null || !track.courierPartner || !track.trackingNumber}
              onClick={() =>
                void send(
                  {
                    action: 'tracking',
                    courierPartner: track.courierPartner,
                    trackingNumber: track.trackingNumber,
                    trackingUrl: track.trackingUrl || undefined,
                    estimatedDelivery: track.estimatedDelivery || undefined,
                  },
                  'tracking',
                )
              }
              className="rounded-xl bg-cta-green px-6 py-3 text-sm font-bold text-white shadow-call transition hover:bg-cta-greenDark disabled:opacity-50"
            >
              {busy === 'tracking' ? 'Saving…' : 'Save & notify customer'}
            </button>

            <p className="text-xs text-muted">
              Saving sends the customer a WhatsApp with the courier name and AWB number.
            </p>
          </div>
        )}

        {/* ── NOTE ── */}
        {tab === 'note' && (
          <div className="space-y-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder="Internal note — the customer never sees this. e.g. 'Customer asked to deliver after 6 PM'"
              className={inp}
            />
            <button
              disabled={busy !== null}
              onClick={() => void send({ action: 'note', adminNote: note }, 'note')}
              className="rounded-xl bg-navy-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-600 disabled:opacity-50"
            >
              {busy === 'note' ? 'Saving…' : 'Save note'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
