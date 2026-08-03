import Link from 'next/link';

interface Item {
  id: string;
  sku: string;
  name: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

export default function LowStockList({ items }: { items: Item[] }) {
  if (!items.length) {
    return <p className="py-8 text-center text-sm text-muted">✅ All products well stocked.</p>;
  }

  return (
    <ul className="space-y-2.5">
      {items.map((it) => {
        const critical = it.stockQuantity === 0;
        return (
          <li key={it.id}>
            <Link
              href={`/admin/products/${it.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-2.5 transition hover:border-aqua-200 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-navy-700">{it.name}</p>
                <p className="text-[11px] text-muted">{it.sku}</p>
              </div>
              <span
                className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${
                  critical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {critical ? 'OUT' : it.stockQuantity}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
