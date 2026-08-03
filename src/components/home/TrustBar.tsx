import { SERVICE, SHIPPING } from '@/lib/constants';
import { formatINR } from '@/lib/utils/format';

const ITEMS = [
  { icon: '🚚', title: 'Pan-India Delivery', sub: `Free above ${formatINR(SHIPPING.freeAbove)}` },
  { icon: '🔧', title: `₹${SERVICE.visitCharge} Visit Charge`, sub: 'Patna same-day service' },
  { icon: '🛡️', title: 'Genuine Parts', sub: '1-year warranty' },
  { icon: '💬', title: 'WhatsApp Support', sub: 'Order & service alerts' },
];

export default function TrustBar() {
  return (
    <section className="border-b border-navy-100 bg-navy-50" aria-label="Why choose AquaNexa">
      <div className="container mx-auto grid grid-cols-1 gap-4 px-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((it) => (
          <div key={it.title} className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-card">
              {it.icon}
            </span>
            <div>
              <p className="text-sm font-bold text-navy-700">{it.title}</p>
              <p className="text-xs text-muted">{it.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
