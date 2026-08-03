import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Categories' };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Categories</h1>
        <p className="mt-0.5 text-sm text-muted">{categories.length} categories</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-muted">
              <th className="pb-2.5 font-semibold">Name</th>
              <th className="pb-2.5 font-semibold">Slug</th>
              <th className="pb-2.5 font-semibold">Type</th>
              <th className="pb-2.5 font-semibold">Products</th>
              <th className="pb-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="py-3 font-medium text-navy-700">{c.name}</td>
                <td className="py-3">
                  <Link href={`/category/${c.slug}`} target="_blank" className="text-xs text-aqua-600 hover:underline">
                    /{c.slug}
                  </Link>
                </td>
                <td className="py-3 text-xs text-muted">{c.kind.replace(/_/g, ' ')}</td>
                <td className="py-3 font-semibold text-navy-700">{c._count.products}</td>
                <td className="py-3">
                  <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {c.isActive ? 'ACTIVE' : 'HIDDEN'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
