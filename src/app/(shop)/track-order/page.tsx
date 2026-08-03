import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Track your AquaNexa order or service request. Call 8969821440 or message us on WhatsApp with your order number.',
  alternates: { canonical: '/track-order' },
};

export default function TrackOrderPage() {
  return (
    <main className="container mx-auto px-4 py-14">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-5xl">📦</p>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-navy-700">Track Your Order</h1>
        <p className="mt-3 text-muted">
          Share your order number (AQN-…) or service ticket (SRV-…) and we&apos;ll give you a live
          update straight away.
        </p>

        <div className="mt-8 space-y-3">
          <a
            href={CONTACT.whatsappLink('Hi, I want to track my order. My order number is: ')}
            target="_blank" rel="noopener noreferrer"
            className="block rounded-xl bg-[#25D366] py-4 font-bold text-white hover:brightness-95"
          >
            💬 Track on WhatsApp
          </a>
          <a href={CONTACT.primaryTel} className="block rounded-xl bg-cta-green py-4 font-bold text-white hover:bg-cta-greenDark">
            📞 Call {CONTACT.primaryPhone}
          </a>
          <a href={CONTACT.secondaryTel} className="block rounded-xl border border-navy-200 py-4 font-bold text-navy-700 hover:bg-navy-50">
            📞 {CONTACT.secondaryPhone}
          </a>
        </div>

        <p className="mt-6 text-sm text-muted">{CONTACT.hours} · All 7 days</p>

        <Link href="/products" className="mt-8 inline-block text-sm font-bold text-aqua-600 hover:underline">
          ← Continue shopping
        </Link>
      </div>
    </main>
  );
}
