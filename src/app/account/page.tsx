import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main className="container mx-auto px-4 py-14">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-5xl">👤</p>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-navy-700">My Account</h1>
        <p className="mt-3 text-muted">
          Customer login is being set up. For now, our team can pull up your orders and service
          history instantly — just call or message us.
        </p>

        <div className="mt-8 space-y-3">
          <a
            href={CONTACT.whatsappLink('Hi, I want to check my order and service history.')}
            target="_blank" rel="noopener noreferrer"
            className="block rounded-xl bg-[#25D366] py-4 font-bold text-white hover:brightness-95"
          >
            💬 WhatsApp us
          </a>
          <a href={CONTACT.primaryTel} className="block rounded-xl bg-cta-green py-4 font-bold text-white hover:bg-cta-greenDark">
            📞 Call {CONTACT.primaryPhone}
          </a>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href="/track-order" className="rounded-xl border border-navy-100 p-4 hover:bg-navy-50">
            <p className="font-bold text-navy-700">📦 Track Order</p>
            <p className="mt-1 text-xs text-muted">Check delivery status</p>
          </Link>
          <Link href="/#book-service" className="rounded-xl border border-navy-100 p-4 hover:bg-navy-50">
            <p className="font-bold text-navy-700">🔧 Book Service</p>
            <p className="mt-1 text-xs text-muted">Patna — ₹100 visit</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
