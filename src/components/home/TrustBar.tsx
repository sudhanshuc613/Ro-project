import { SERVICE, SHIPPING } from '@/lib/constants';
import { formatINR } from '@/lib/utils/format';

/**
 * TrustBar — the strip directly under the hero.
 *
 * Design note: v1 used emoji in grey boxes on a flat tint, which is what
 * every template does. v2 uses inline SVG icons at a consistent 1.6 stroke
 * weight. Mixed emoji render differently on every OS (Samsung vs Apple vs
 * Windows) so they can never look like one designed set — line icons can.
 *
 * The strip sits on warm sand rather than cold grey, with hairline vertical
 * rules between items instead of boxes. Fewer edges = calmer, more premium.
 */
const ITEMS = [
  {
    title: `₹${SERVICE.visitCharge} Visit Charge`,
    sub: 'Patna same-day service',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.4 15.2 9 12.8m0 0a3.4 3.4 0 1 1 4.8-4.8l5.6 5.6-2.4 2.4-5.6-5.6M9 12.8 4.6 17.2a1.7 1.7 0 0 0 2.4 2.4L11.4 15.2" />
    ),
  },
  {
    title: 'Genuine Parts Only',
    sub: '1-year part warranty',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.2 4.8 6v5.4c0 4.4 3 8.5 7.2 9.5 4.2-1 7.2-5.1 7.2-9.5V6L12 3.2Zm-2 8.6 1.6 1.7 3.4-3.6" />
    ),
  },
  {
    title: 'Pan-India Delivery',
    sub: `Free above ${formatINR(SHIPPING.freeAbove)}`,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.2 7.6 12 12l8.8-4.4M12 12v9M20.8 7.6v8.8L12 21l-8.8-4.6V7.6L12 3l8.8 4.6Z" />
    ),
  },
  {
    title: 'Pay After Service',
    sub: 'No advance, ever',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.4 8.6h17.2M3.4 8.6A1.6 1.6 0 0 1 5 7h14a1.6 1.6 0 0 1 1.6 1.6v7.8A1.6 1.6 0 0 1 19 18H5a1.6 1.6 0 0 1-1.6-1.6V8.6Zm3.2 5.6h3.2" />
    ),
  },
];

export default function TrustBar() {
  return (
    <section
      className="border-b border-navy-100 bg-sand-100"
      aria-label="Why choose AquaNexa"
    >
      <div className="container mx-auto grid grid-cols-2 gap-y-5 px-4 py-6 lg:grid-cols-4 lg:gap-y-0">
        {ITEMS.map((it, i) => (
          <div
            key={it.title}
            className={`flex items-center gap-3 lg:px-5 ${
              i > 0 ? 'lg:border-l lg:border-navy-100' : ''
            }`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-aqua-600 shadow-card ring-1 ring-navy-100/70">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                {it.icon}
              </svg>
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-navy-700 sm:text-sm">{it.title}</p>
              <p className="truncate text-xs text-muted">{it.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
