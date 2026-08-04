import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db/prisma';
import { formatINR } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Products' };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      category: { select: { name: true } },
      brand: { select: { name: true } },
      images: { where: { isPrimary: true }, take: 1, select: { thumbUrl: true, url: true, altText: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-700">Products</h1>
          <p className="mt-0.5 text-sm text-muted">{products.length} products in catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-aqua-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-aqua-600"
        >
          + Add Product
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-muted">
                <th className="pb-2.5 font-semibold">Product</th>
                <th className="pb-2.5 font-semibold">Category</th>
                <th className="pb-2.5 font-semibold">Price</th>
                <th className="pb-2.5 font-semibold">Stock</th>
                <th className="pb-2.5 font-semibold">Status</th>
                <th className="pb-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const img = p.images[0];
                const low = p.stockQuantity <= p.lowStockThreshold;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                          {img ? (
                            <Image src={img.thumbUrl ?? img.url} alt={img.altText} fill sizes="44px" className="object-contain p-1" />
                          ) : (
                            <span className="grid h-full place-items-center">💧</span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <Link href={`/products/${p.slug}`} target="_blank" className="line-clamp-1 font-medium text-navy-700 hover:text-aqua-600">
                            {p.name}
                          </Link>
                          <span className="block text-xs text-muted">{p.sku}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-muted">{p.category.name}</td>
                    <td className="py-3">
                      <span className="block font-bold text-navy-700">{formatINR(Number(p.sellingPrice))}</span>
                      <span className="block text-xs text-muted line-through">{formatINR(Number(p.mrp))}</span>
                    </td>
                    <td className="py-3">
                      <span className={`rounded-md px-2 py-1 text-xs font-bold ${low ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="rounded-lg bg-aqua-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-aqua-600"
                      >
                        Edit
                      </Link>
                    </td>
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
