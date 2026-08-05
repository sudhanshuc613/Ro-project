import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT } from '@/lib/constants';
import OrderLookup from '@/components/shop/OrderLookup';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description:
    'Track your AquaNexa order without logging in — enter your order number and mobile. Or track a service ticket with your SRV number.',
  alternates: { canonical: '/track-order' },
};

export default function TrackOrderPage() {
  return (
    <main className="bg-sand-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">No login needed</p>
          <h1 className="text-h2 mt-2 font-extrabold text-navy-700">Track Your Order</h1>
          <p className="mt-2 text-muted">
            Enter your order number and the mobile number you used. Both must match.
          </p>
        </div>

        <div className="mt-8">
          <OrderLookup />
        </div>

        {/* Service tickets are a different object with their own public page. */}
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-100">
          <p className="font-bold text-navy-700">Looking for a service request?</p>
          <p className="mt-1 text-sm text-muted">
            Service tickets start with <span className="font-mono text-xs">SRV-</span>. Open{' '}
            <span className="font-mono text-xs">rokadoctor.in/track/YOUR-TICKET</span> directly —
            no login needed there either.
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-2xl text-center">
          <p className="text-sm text-muted">Still stuck? We answer on both:</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <a
              href={CONTACT.primaryTel}
              className="rounded-xl bg-cta-green px-6 py-3 font-bold text-white shadow-call"
            >
              📞 Call {CONTACT.primaryPhone}
            </a>
            <a
              href={CONTACT.whatsappLink('Hi, I need help tracking my order.')}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white px-6 py-3 font-bold text-navy-700 shadow-card ring-1 ring-navy-100"
            >
              💬 WhatsApp
            </a>
          </div>
          <p className="mt-3 text-sm text-muted">{CONTACT.hours} · All 7 days</p>
          <Link href="/products" className="mt-6 inline-block text-sm font-bold text-aqua-600 hover:underline">
            ← Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
