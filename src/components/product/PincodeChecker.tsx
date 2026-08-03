'use client';

/**
 * PincodeChecker — dual-purpose serviceability widget.
 *
 *  1. Pan-India: can we DELIVER here? → ETA, COD availability, shipping fee
 *  2. Patna:     can we INSTALL/SERVICE here? → upsells the local service arm
 *
 * Remembers the last-used pincode in localStorage so the user types it once
 * per session across the whole catalog.
 */
import { useEffect, useState } from 'react';
import { SERVICE, SHIPPING } from '@/lib/constants';
import { formatINR } from '@/lib/utils/format';

interface Props {
  productId: string;
  isPanIndia: boolean;
  requiresInstallation: boolean;
  freeShipping: boolean;
}

interface Result {
  pincode: string;
  city: string;
  state: string;
  deliveryAvailable: boolean;
  serviceAvailable: boolean;
  codAvailable: boolean;
  etaDays: number;
  shippingFee: number;
  visitCharge: number;
}

const STORAGE_KEY = 'aqn_pincode';

export default function PincodeChecker({ productId, isPanIndia, requiresInstallation, freeShipping }: Props) {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-check the remembered pincode on mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved && /^\d{6}$/.test(saved)) { setPincode(saved); void check(saved); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function check(pin: string) {
    if (!/^\d{6}$/.test(pin)) { setError('Please enter a valid 6-digit pincode'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`/api/pincode/check?pincode=${pin}&productId=${productId}`);
      if (!res.ok) throw new Error('lookup-failed');
      const data: Result = await res.json();
      setResult(data);
      localStorage.setItem(STORAGE_KEY, pin);
    } catch {
      setError('Could not check this pincode. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const etaDate = result
    ? new Date(Date.now() + result.etaDays * 864e5).toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short',
      })
    : '';

  return (
    <div className="rounded-2xl border border-navy-100 p-5">
      <div className="flex items-center gap-2">
        <TruckIcon />
        <p className="font-bold text-navy-700">Check Delivery & Service Availability</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); void check(pincode); }}
        className="mt-3 flex gap-2"
      >
        <input
          type="text" inputMode="numeric" maxLength={6}
          value={pincode}
          onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setError(''); }}
          placeholder="Enter 6-digit pincode"
          aria-label="Delivery pincode"
          className="flex-1 rounded-xl border border-navy-100 px-4 py-3 text-[15px] focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-200"
        />
        <button
          type="submit" disabled={loading || pincode.length !== 6}
          className="rounded-xl bg-navy-700 px-6 py-3 font-bold text-white transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {loading ? '…' : 'Check'}
        </button>
      </form>

      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}

      {result && (
        <div className="mt-4 space-y-3">
          {/* Delivery verdict */}
          {result.deliveryAvailable && isPanIndia ? (
            <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              <p className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckIcon /> Delivery available to {result.city}, {result.state}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-emerald-900">
                <li>📦 Estimated delivery by <strong>{etaDate}</strong> ({result.etaDays} days)</li>
                <li>
                  🚚 Shipping:{' '}
                  <strong>
                    {freeShipping || result.shippingFee === 0
                      ? 'FREE'
                      : `${formatINR(result.shippingFee)} (free above ${formatINR(SHIPPING.freeAbove)})`}
                  </strong>
                </li>
                <li>{result.codAvailable ? '💵 Cash on Delivery available' : '💳 Prepaid orders only for this pincode'}</li>
              </ul>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
              <p className="font-bold text-amber-900">
                {isPanIndia ? 'Delivery not available at this pincode yet' : 'This product ships within Bihar only'}
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Call us at <a href="tel:+918969821440" className="font-bold underline">8969821440</a> — we often
                arrange special dispatch for large orders.
              </p>
            </div>
          )}

          {/* Local service upsell — the dual-model bridge */}
          {result.serviceAvailable ? (
            <div className="rounded-xl bg-aqua-50 p-4 ring-1 ring-aqua-100">
              <p className="flex items-center gap-2 font-bold text-aqua-800">
                <WrenchIcon /> Free doorstep installation available in {result.city}
              </p>
              <p className="mt-1 text-sm text-aqua-900">
                Our technicians cover your area. Repairs and AMC visits cost only{' '}
                {formatINR(result.visitCharge || SERVICE.visitCharge)} per visit.
              </p>
              <a href="/#book-service"
                className="mt-3 inline-block rounded-lg bg-cta-green px-4 py-2 text-sm font-bold text-white hover:bg-cta-greenDark">
                Book installation
              </a>
            </div>
          ) : (
            requiresInstallation && (
              <p className="text-sm text-muted">
                ℹ️ On-site installation by our team is available in Patna only. Elsewhere we provide a
                detailed installation guide and free video support.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

const TruckIcon = () => (
  <svg className="h-5 w-5 text-aqua-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm10.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM3 6.75h11.25v10.5H3V6.75zm11.25 3h3.4l2.6 3v4.5h-6v-7.5z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clipRule="evenodd" /></svg>
);
const WrenchIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.5 2a4.5 4.5 0 00-4.24 6L3.3 14.96a1.5 1.5 0 002.12 2.12l6.96-6.96A4.5 4.5 0 1014.5 2z" clipRule="evenodd" /></svg>
);
