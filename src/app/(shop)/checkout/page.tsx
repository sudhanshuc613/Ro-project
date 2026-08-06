'use client';

/**
 * Multi-step checkout: Address → Review → Payment.
 *
 * Prices shown here come from /api/checkout/quote (server-side), never from
 * the local cart, so what the customer sees is exactly what gets charged.
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cart';
import { formatINR } from '@/lib/utils/format';

interface Quote {
  lines: { name: string; sku: string; image: string | null; unitPrice: number; quantity: number; lineTotal: number; inStock: boolean }[];
  subtotal: number; savings: number; shipping: number; codCharge: number;
  total: number; codAvailable: number; etaDays: number; errors: string[];
}

const STEPS = ['Address', 'Review', 'Payment'] as const;

/** Which payment options the admin has switched on. */
interface PayConfig {
  razorpay: boolean;
  upiManual: boolean;
  bankTransfer: boolean;
  cod: boolean;
  upiId: string;
  upiName: string;
  bankDetails: string;
  paymentNote: string;
  codCharge: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);

  const [step, setStep] = useState(0);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: session, status: authStatus } = useSession();
  const [payMethod, setPayMethod] = useState<'RAZORPAY' | 'COD' | 'UPI_MANUAL' | 'BANK'>('COD');
  const [payCfg, setPayCfg] = useState<PayConfig | null>(null);
  const [upiRef, setUpiRef] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [addr, setAddr] = useState({
    contactName: '', contactPhone: '', line1: '', line2: '', landmark: '',
    city: '', state: 'Bihar', pincode: '',
  });
  const [note, setNote] = useState('');

  // Payment options are admin-controlled, so the checkout must ask the server
  // what is actually available rather than hardcoding two radio buttons.
  useEffect(() => {
    fetch('/api/checkout/payment-methods')
      .then((r) => r.json())
      .then((cfg: PayConfig) => {
        setPayCfg(cfg);
        // Pick the first enabled method so the customer never lands on a
        // pre-selected option that is switched off.
        setPayMethod(
          cfg.razorpay ? 'RAZORPAY'
          : cfg.upiManual ? 'UPI_MANUAL'
          : cfg.cod ? 'COD'
          : cfg.bankTransfer ? 'BANK'
          : 'COD',
        );
      })
      .catch(() => {});
  }, []);

  // Logged-in customers should not retype what we already know.
  useEffect(() => {
    if (authStatus !== 'authenticated' || !session?.user) return;
    fetch('/api/account/addresses/default')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.address) {
          setAddr((prev) => (prev.contactName ? prev : {
            contactName: d.address.contactName ?? '',
            contactPhone: d.address.contactPhone ?? '',
            line1: d.address.line1 ?? '',
            line2: d.address.line2 ?? '',
            landmark: d.address.landmark ?? '',
            city: d.address.city ?? '',
            state: d.address.state ?? 'Bihar',
            pincode: d.address.pincode ?? '',
          }));
        }
      })
      .catch(() => {});
  }, [authStatus, session]);

  const lines = items.map((i) => ({
    productId: i.productId,
    variantId: i.variantId ?? null,
    quantity: i.quantity,
  }));

  /* Re-quote whenever pincode or payment method changes */
  useEffect(() => {
    if (!items.length) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/checkout/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lines,
            pincode: /^\d{6}$/.test(addr.pincode) ? addr.pincode : undefined,
            paymentMethod: payMethod === 'COD' ? 'COD' : 'PREPAID',
          }),
        });
        setQuote(await res.json());
      } catch { /* keep last good quote */ }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, addr.pincode, payMethod]);

  /* Auto-fill city/state from pincode */
  useEffect(() => {
    if (!/^\d{6}$/.test(addr.pincode)) return;
    fetch(`/api/pincode/check?pincode=${addr.pincode}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.city) setAddr((a) => ({ ...a, city: d.city, state: d.state || a.state }));
      })
      .catch(() => {});
  }, [addr.pincode]);

  const set = (k: keyof typeof addr) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = ['contactPhone', 'pincode'].includes(k);
    setAddr((a) => ({ ...a, [k]: digits ? e.target.value.replace(/\D/g, '') : e.target.value }));
    setErrors((p) => ({ ...p, [k]: [] }));
  };

  function validateAddress() {
    const e: Record<string, string[]> = {};
    if (addr.contactName.trim().length < 2) e.contactName = ['Enter your name'];
    if (!/^[6-9]\d{9}$/.test(addr.contactPhone)) e.contactPhone = ['Enter a valid 10-digit mobile'];
    if (addr.line1.trim().length < 5) e.line1 = ['Enter your full address'];
    if (addr.city.trim().length < 2) e.city = ['Enter city'];
    if (!/^\d{6}$/.test(addr.pincode)) e.pincode = ['Enter a valid 6-digit pincode'];
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function placeOrder() {
    // UPI-manual orders are worthless to us without the reference number —
    // catch it here rather than creating an unverifiable order.
    if (payMethod === 'UPI_MANUAL' && upiRef.trim().length < 6) {
      toast.error('Please pay first, then enter the UTR / reference number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines,
          shipping: addr,
          paymentMethod: payMethod,
          customerNote: note,
          guestEmail: guestEmail || undefined,
          paymentReference: payMethod === 'UPI_MANUAL' ? upiRef.trim() : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        toast.error(data.message ?? 'Could not place order');
        setLoading(false);
        return;
      }

      /* COD, manual UPI and bank transfer all finish server-side — there is
         no gateway popup to open. The order lands as UNPAID (or AWAITING
         verification) and the admin confirms it. */
      if (data.paymentMethod === 'COD' || data.awaitingVerification) {
        clearCart();
        router.push(data.redirectTo);
        return;
      }

      /* Mock mode — skip the real gateway so the flow is testable */
      if (data.mock) {
        const verify = await fetch('/api/orders/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.orderId,
            razorpayOrderId: data.checkout.order_id,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: `mock_sig_${data.checkout.order_id}`,
          }),
        });
        const v = await verify.json();
        if (verify.ok) { clearCart(); router.push(v.redirectTo); return; }
        toast.error('Mock payment failed');
        setLoading(false);
        return;
      }

      /* Real Razorpay Checkout */
      const RZP = (window as unknown as { Razorpay?: new (o: unknown) => { open: () => void } }).Razorpay;
      if (!RZP) { toast.error('Payment library did not load. Refresh and retry.'); setLoading(false); return; }

      const rzp = new RZP({
        ...data.checkout,
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verify = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            }),
          });
          const v = await verify.json();
          if (verify.ok) { clearCart(); router.push(v.redirectTo); }
          else toast.error('Payment verification failed. Please contact us.');
        },
        modal: {
          ondismiss: async () => {
            await fetch('/api/orders/verify', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderId }),
            }).catch(() => {});
            setLoading(false);
            toast.info('Payment cancelled — your cart is safe');
          },
        },
      });
      rzp.open();
    } catch {
      toast.error('Something went wrong');
      setLoading(false);
    }
  }

  if (!items.length) {
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

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <main className="container mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-extrabold text-navy-700">Checkout</h1>

        {/* Guest vs account.
            We do NOT force registration — forcing signup is the single biggest
            cause of cart abandonment in Indian e-commerce. Instead we explain
            what an account gets you and let the customer decide. Their phone
            number links the order either way, so registering later still
            surfaces this order in their history. */}
        {authStatus === 'unauthenticated' && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-aqua-50 p-4 ring-1 ring-aqua-200">
            <div>
              <p className="text-sm font-bold text-navy-700">
                Checking out as a guest — that&apos;s completely fine
              </p>
              <p className="mt-0.5 text-xs text-navy-600">
                With an account you get live order tracking, saved addresses, invoices and
                filter-change reminders. Your order links to your phone number either way.
              </p>
            </div>
            <Link
              href={`/login?callbackUrl=${encodeURIComponent('/checkout')}`}
              className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-navy-700 ring-1 ring-navy-200 hover:bg-navy-50"
            >
              Log in instead
            </Link>
          </div>
        )}
        {authStatus === 'authenticated' && session?.user && (
          <p className="mt-3 text-sm text-muted">
            Logged in as <strong className="text-navy-700">{session.user.name}</strong> · this order
            will appear in your account
          </p>
        )}

        {/* Stepper */}
        <ol className="mt-5 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                i <= step ? 'bg-aqua-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </span>
              <span className={`text-sm font-semibold ${i <= step ? 'text-navy-700' : 'text-muted'}`}>{s}</span>
              {i < STEPS.length - 1 && <span className={`h-0.5 flex-1 ${i < step ? 'bg-aqua-500' : 'bg-slate-200'}`} />}
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,340px]">
          <div>
            {/* ── STEP 1: Address ── */}
            {step === 0 && (
              <section className="rounded-2xl border border-navy-100 p-5">
                <h2 className="font-display text-lg font-bold text-navy-700">Delivery Address</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <F label="Full Name" err={errors.contactName?.[0]} full>
                    <input value={addr.contactName} onChange={set('contactName')} className="input" placeholder="Rahul Kumar" autoComplete="name" />
                  </F>
                  <F label="Mobile Number" err={errors.contactPhone?.[0]}>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-xl border border-r-0 border-navy-100 bg-navy-50 px-3 text-sm font-semibold text-navy-500">+91</span>
                      <input value={addr.contactPhone} onChange={set('contactPhone')} maxLength={10} inputMode="numeric" className="input rounded-l-none" autoComplete="tel-national" />
                    </div>
                  </F>
                  <F label="Pincode" err={errors.pincode?.[0]}>
                    <input value={addr.pincode} onChange={set('pincode')} maxLength={6} inputMode="numeric" className="input" autoComplete="postal-code" />
                  </F>
                  <F label="House / Flat, Street" err={errors.line1?.[0]} full>
                    <input value={addr.line1} onChange={set('line1')} className="input" placeholder="House 42, Road 5, Kankarbagh" />
                  </F>
                  <F label="Landmark (optional)">
                    <input value={addr.landmark} onChange={set('landmark')} className="input" placeholder="Near Ashiana More" />
                  </F>
                  <F label="City" err={errors.city?.[0]}>
                    <input value={addr.city} onChange={set('city')} className="input" />
                  </F>
                  <F label="State">
                    <input value={addr.state} onChange={set('state')} className="input" />
                  </F>
                </div>

                <button
                  onClick={() => { if (validateAddress()) setStep(1); }}
                  className="mt-5 w-full rounded-xl bg-cta-orange py-3.5 font-bold text-white shadow-cta hover:bg-cta-orangeDark sm:w-auto sm:px-10"
                >
                  Continue to Review →
                </button>
              </section>
            )}

            {/* ── STEP 2: Review ── */}
            {step === 1 && (
              <section className="space-y-4">
                <div className="rounded-2xl border border-navy-100 p-5">
                  <div className="flex items-start justify-between">
                    <h2 className="font-display text-lg font-bold text-navy-700">Deliver to</h2>
                    <button onClick={() => setStep(0)} className="text-sm font-bold text-aqua-600 hover:underline">Change</button>
                  </div>
                  <p className="mt-2 font-semibold text-navy-700">{addr.contactName} · {addr.contactPhone}</p>
                  <p className="text-sm text-muted">
                    {addr.line1}{addr.landmark ? `, near ${addr.landmark}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                  {quote && <p className="mt-2 text-sm text-cta-green">📦 Delivery in about {quote.etaDays} days</p>}
                </div>

                <div className="rounded-2xl border border-navy-100 p-5">
                  <h2 className="font-display text-lg font-bold text-navy-700">Items</h2>
                  <ul className="mt-3 divide-y divide-navy-50">
                    {(quote?.lines ?? []).map((l) => (
                      <li key={l.sku} className="flex gap-3 py-3">
                        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                          {l.image ? <Image src={l.image} alt="" fill sizes="56px" className="object-contain p-1" /> : <span className="grid h-full place-items-center">💧</span>}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-navy-700">{l.name}</span>
                          <span className="block text-xs text-muted">Qty {l.quantity} × {formatINR(l.unitPrice)}</span>
                          {!l.inStock && <span className="block text-xs font-bold text-red-600">Out of stock</span>}
                        </span>
                        <span className="shrink-0 font-bold text-navy-700">{formatINR(l.lineTotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <textarea
                    value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                    placeholder="Any delivery instructions? (optional)"
                    className="input mt-3"
                  />
                </div>

                <button onClick={() => setStep(2)} className="w-full rounded-xl bg-cta-orange py-3.5 font-bold text-white shadow-cta hover:bg-cta-orangeDark sm:w-auto sm:px-10">
                  Continue to Payment →
                </button>
              </section>
            )}

            {/* ── STEP 3: Payment ── */}
            {step === 2 && (
              <section className="rounded-2xl border border-navy-100 p-5">
                <h2 className="font-display text-lg font-bold text-navy-700">Payment Method</h2>

                <div className="mt-4 space-y-3">
                  {/* Only methods the admin switched ON are rendered. Razorpay
                      additionally requires live keys on the server, so a
                      half-configured gateway can never strand a customer. */}
                  {payCfg?.razorpay && (
                    <label className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 ${payMethod === 'RAZORPAY' ? 'border-aqua-500 bg-aqua-50' : 'border-navy-100'}`}>
                      <input type="radio" checked={payMethod === 'RAZORPAY'} onChange={() => setPayMethod('RAZORPAY')} className="mt-1 h-4 w-4 text-aqua-500" />
                      <span>
                        <span className="block font-bold text-navy-700">Pay Online</span>
                        <span className="block text-sm text-muted">UPI, Card, Net Banking, Wallet — secured by Razorpay</span>
                      </span>
                    </label>
                  )}

                  {payCfg?.upiManual && (
                    <label className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 ${payMethod === 'UPI_MANUAL' ? 'border-aqua-500 bg-aqua-50' : 'border-navy-100'}`}>
                      <input type="radio" checked={payMethod === 'UPI_MANUAL'} onChange={() => setPayMethod('UPI_MANUAL')} className="mt-1 h-4 w-4 text-aqua-500" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-navy-700">Pay by UPI</span>
                        <span className="block text-sm text-muted">
                          GPay, PhonePe, Paytm — pay directly to us, no gateway fee
                        </span>

                        {payMethod === 'UPI_MANUAL' && (
                          <span className="mt-3 block rounded-xl bg-white p-3.5 ring-1 ring-navy-100">
                            <span className="block text-xs font-bold uppercase tracking-wide text-muted">Pay to</span>
                            <span className="mt-1 block select-all font-mono text-base font-bold text-navy-700">
                              {payCfg.upiId}
                            </span>
                            <span className="block text-xs text-muted">{payCfg.upiName}</span>

                            <a
                              href={`upi://pay?pa=${encodeURIComponent(payCfg.upiId)}&pn=${encodeURIComponent(payCfg.upiName)}&am=${quote?.total ?? 0}&cu=INR&tn=${encodeURIComponent('Aqua Perl order')}`}
                              className="mt-3 block rounded-lg bg-cta-green py-2.5 text-center text-sm font-bold text-white sm:hidden"
                            >
                              Open UPI app — pay {formatINR(quote?.total ?? 0)}
                            </a>

                            <span className="mt-3 block text-xs font-bold text-navy-700">
                              After paying, enter the 12-digit UTR / reference number
                            </span>
                            <input
                              value={upiRef}
                              onChange={(e) => setUpiRef(e.target.value.replace(/\D/g, '').slice(0, 20))}
                              placeholder="e.g. 431203456789"
                              inputMode="numeric"
                              className="input mt-1.5"
                            />
                            <span className="mt-1.5 block text-[11px] text-muted">
                              We verify against our bank and confirm your order — usually within a few hours during working time.
                            </span>
                          </span>
                        )}
                      </span>
                    </label>
                  )}

                  {payCfg?.bankTransfer && (
                    <label className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 ${payMethod === 'BANK' ? 'border-aqua-500 bg-aqua-50' : 'border-navy-100'}`}>
                      <input type="radio" checked={payMethod === 'BANK'} onChange={() => setPayMethod('BANK')} className="mt-1 h-4 w-4 text-aqua-500" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-navy-700">Bank Transfer / NEFT</span>
                        <span className="block text-sm text-muted">For bulk and commercial orders</span>
                        {payMethod === 'BANK' && (
                          <span className="mt-3 block whitespace-pre-line rounded-xl bg-white p-3.5 text-sm text-navy-700 ring-1 ring-navy-100">
                            {payCfg.bankDetails}
                          </span>
                        )}
                      </span>
                    </label>
                  )}

                  {payCfg?.cod && (
                    <label className={`flex gap-3 rounded-xl border-2 p-4 ${
                      quote?.codAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    } ${payMethod === 'COD' ? 'border-aqua-500 bg-aqua-50' : 'border-navy-100'}`}>
                      <input
                        type="radio" checked={payMethod === 'COD'} disabled={!quote?.codAvailable}
                        onChange={() => setPayMethod('COD')} className="mt-1 h-4 w-4 text-aqua-500"
                      />
                      <span>
                        <span className="block font-bold text-navy-700">Cash on Delivery</span>
                        <span className="block text-sm text-muted">
                          {quote?.codAvailable
                            ? `Extra ₹${quote.codCharge || payCfg.codCharge} handling charge`
                            : 'Not available for this pincode or order value'}
                        </span>
                      </span>
                    </label>
                  )}

                  {payCfg && !payCfg.razorpay && !payCfg.upiManual && !payCfg.cod && !payCfg.bankTransfer && (
                    <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
                      Online ordering is temporarily unavailable. Please call us to place your order.
                    </div>
                  )}
                </div>

                {payCfg?.paymentNote && (
                  <p className="mt-3 rounded-lg bg-navy-50 px-3.5 py-2.5 text-xs text-navy-600">
                    {payCfg.paymentNote}
                  </p>
                )}

                {quote?.errors?.length ? (
                  <ul className="mt-4 space-y-1 rounded-lg bg-red-50 p-3">
                    {quote.errors.map((e) => <li key={e} className="text-sm font-medium text-red-700">• {e}</li>)}
                  </ul>
                ) : null}

                <button
                  onClick={placeOrder}
                  disabled={loading || Boolean(quote?.errors?.length)}
                  className="mt-5 w-full rounded-xl bg-cta-green py-4 font-display text-lg font-bold text-white shadow-lg hover:bg-cta-greenDark disabled:opacity-60"
                >
                  {loading ? 'Processing…'
                    : payMethod === 'COD' ? `Place Order — ${formatINR(quote?.total ?? 0)}`
                    : payMethod === 'UPI_MANUAL' ? `I've paid — submit order`
                    : payMethod === 'BANK' ? `Place Order — ${formatINR(quote?.total ?? 0)}`
                    : `Pay ${formatINR(quote?.total ?? 0)}`}
                </button>

                <button onClick={() => setStep(1)} className="mt-3 w-full text-sm font-semibold text-aqua-600 hover:underline">
                  ← Back to review
                </button>
              </section>
            )}
          </div>

          {/* ── Summary ── */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-2xl border border-navy-100 p-5">
              <h2 className="font-display font-bold text-navy-700">Order Summary</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <Row label={`Subtotal (${items.length} item${items.length > 1 ? 's' : ''})`} value={formatINR(quote?.subtotal ?? 0)} />
                {(quote?.savings ?? 0) > 0 && <Row label="You save" value={`− ${formatINR(quote!.savings)}`} tone="green" />}
                <Row label="Shipping" value={quote?.shipping ? formatINR(quote.shipping) : 'FREE'} tone={quote?.shipping ? undefined : 'green'} />
                {(quote?.codCharge ?? 0) > 0 && <Row label="COD charge" value={formatINR(quote!.codCharge)} />}
                <div className="flex justify-between border-t border-navy-100 pt-3">
                  <dt className="font-bold text-navy-700">Total</dt>
                  <dd className="font-display text-xl font-extrabold text-navy-700">{formatINR(quote?.total ?? 0)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted">Inclusive of all taxes</p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

function F({ label, err, full, children }: { label: string; err?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1 block text-sm font-semibold text-navy-700">{label}</span>
      {children}
      {err && <span className="mt-1 block text-xs font-medium text-red-600">{err}</span>}
    </label>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'green' }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={`font-semibold ${tone === 'green' ? 'text-cta-green' : 'text-navy-700'}`}>{value}</dd>
    </div>
  );
}
