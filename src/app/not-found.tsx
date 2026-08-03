import Link from 'next/link';
import { CONTACT } from '@/lib/constants';

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-20">
      <div className="text-center">
        <p className="font-display text-7xl font-extrabold text-aqua-500">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-navy-700">Page not found</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          The page you are looking for may have moved. Try the shop, or call us and we&apos;ll help
          you find the right product or service.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-xl bg-navy-700 px-6 py-3 font-bold text-white hover:bg-navy-600">
            Go Home
          </Link>
          <Link href="/products" className="rounded-xl border border-navy-100 px-6 py-3 font-bold text-navy-700 hover:bg-navy-50">
            Browse Products
          </Link>
          <a href={CONTACT.primaryTel} className="rounded-xl bg-cta-green px-6 py-3 font-bold text-white hover:bg-cta-greenDark">
            📞 {CONTACT.primaryPhone}
          </a>
        </div>
      </div>
    </main>
  );
}
