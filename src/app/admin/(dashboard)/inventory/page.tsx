import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { formatINR } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Inventory' };

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, status: 'ACTIVE' },
    orderBy: { stockQuantity: 'asc' },
    take: 100,
    select: {
      id: true, sku: true, name: true, slug: true,
      stockQuantity: true, lowStockThreshold: true, sellingPrice: true,
    },
  });

  const low = products.filter((p) => p.stockQuantity <= p.lowStockThreshold);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Inventory</h1>
        <p className="mt-0.5 text-sm text-muted">
          {low.length} item{low.length === 1 ? '' : 's'} need restocking
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-muted">
                <th className="pb-2.5 font-semibold">Product</th>
                <th className="pb-2.5 font-semibold">SKU</th>
                <th className="pb-2.5 font-semibold">Price</th>
                <th className="pb-2.5 font-semibold">In Stock</th>
                <th className="pb-2.5 font-semibold">Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const isLow = p.stockQuantity <= p.lowStockThreshold;
                const isOut = p.stockQuantity === 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3">
                      <Link href={`/products/${p.slug}`} target="_blank" className="font-medium text-navy-700 hover:text-aqua-600">
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-3 text-xs text-muted">{p.sku}</td>
                    <td className="py-3 font-semibold text-navy-700">{formatINR(Number(p.sellingPrice))}</td>
                    <td className="py-3">
                      <span className={`rounded-md px-2 py-1 text-xs font-bold ${
                        isOut ? 'bg-red-100 text-red-700'
                        : isLow ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'}`}>
                        {isOut ? 'OUT OF STOCK' : p.stockQuantity}
                      </span>
                    </td>
                    <td className="py-3 text-muted">{p.lowStockThreshold}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
