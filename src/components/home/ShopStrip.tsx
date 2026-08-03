import Link from 'next/link';
import Image from 'next/image';
import { SHIPPING } from '@/lib/constants';
import { formatINR } from '@/lib/utils/format';

/**
 * ShopStrip — the e-commerce arm, deliberately placed BELOW the service content.
 *
 * Reasoning: most Patna visitors are searching for a repair, not a purchase.
 * Putting the shop above the fold would dilute the service CTA. This strip
 * captures the minority who do want to buy, without stealing attention.
 */
export default function ShopStrip() {
  return (
    <section className="border-y border-navy-100 bg-navy-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr,.8fr]">
          <div>
            <span className="inline-block rounded-full bg-aqua-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-aqua-700">
              Also available
            </span>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
              Buy RO Purifiers &amp; Genuine Spare Parts
            </h2>
            <p className="mt-2 max-w-xl text-muted">
              New purifiers, commercial plants, membranes, pumps and filters — delivered
              across India. Free shipping above {formatINR(SHIPPING.freeAbove)}.
              In Patna? We install it for you too.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/category/new-ro-purifiers"
                className="rounded-xl bg-navy-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-600"
              >
                New RO Purifiers
              </Link>
              <Link
                href="/category/spare-parts"
                className="rounded-xl border border-navy-200 bg-white px-5 py-3 text-sm font-bold text-navy-700 transition hover:bg-navy-50"
              >
                Spare Parts
              </Link>
              <Link
                href="/category/commercial-plants"
                className="rounded-xl border border-navy-200 bg-white px-5 py-3 text-sm font-bold text-navy-700 transition hover:bg-navy-50"
              >
                Commercial Plants
              </Link>
            </div>
          </div>

          <div className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-card">
            <Image
              src="/products/ro-domestic.png"
              alt="RO water purifiers and spare parts available for delivery across India"
              fill
              sizes="(max-width:1024px) 80vw, 380px"
              className="object-contain p-6"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
