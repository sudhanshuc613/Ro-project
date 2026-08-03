import Link from 'next/link';

const TILES = [
  { icon: '💧', name: 'New RO Purifiers', desc: 'Domestic RO, UV & UF systems', href: '/category/new-ro-purifiers' },
  { icon: '⚙️', name: 'Spare Parts', desc: 'Membranes, pumps, filters, housings', href: '/category/spare-parts' },
  { icon: '🏭', name: 'Commercial Plants', desc: '25 LPH to 2000 LPH systems', href: '/category/commercial-plants' },
  { icon: '🧰', name: 'AMC & Services', desc: 'Annual plans from ₹1,499', href: '/amc-plans' },
];

export default function CategoryTiles() {
  return (
    <section className="py-14 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold text-navy-700">Shop by Category</h2>
          <p className="mt-2 text-muted">
            Everything for clean water — from a single O-ring to a 1000 LPH commercial plant
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {TILES.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group relative overflow-hidden rounded-2xl border border-navy-100 bg-white p-6 text-center transition duration-200 hover:-translate-y-1 hover:border-aqua-500 hover:shadow-card-hover"
            >
              <span className="absolute inset-0 bg-gradient-to-br from-aqua-50 to-transparent opacity-0 transition group-hover:opacity-100" />
              <span className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-aqua-50 text-3xl">
                {t.icon}
              </span>
              <h3 className="relative font-display text-base font-bold text-navy-700">{t.name}</h3>
              <p className="relative mt-1 text-xs text-muted">{t.desc}</p>
              <span className="relative mt-3 inline-block text-xs font-bold text-aqua-600">Browse →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
