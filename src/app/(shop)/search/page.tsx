import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import SortDropdown from '@/components/product/SortDropdown';
import { EmptyState, Pagination } from '../products/page';
import { listProducts, parseListParams } from '@/server/services/catalog.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search Results',
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = (Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q) ?? '';
  const { items, total, page, pages } = await listProducts(parseListParams(searchParams));

  return (
    <main className="bg-white pb-16">
      <div className="container mx-auto px-4 pt-8">
        <h1 className="font-display text-2xl font-extrabold text-navy-700">
          {q ? <>Results for &ldquo;{q}&rdquo;</> : 'Search'}
        </h1>
        <p className="mt-1 text-sm text-muted">{total} products found</p>

        <div className="mb-5 mt-6 flex items-center justify-between gap-4">
          <Link href="/products" className="text-sm font-bold text-aqua-600 hover:underline">
            ← Browse all products
          </Link>
          <SortDropdown />
        </div>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
              {items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <Pagination page={page} pages={pages} searchParams={searchParams} basePath="/search" />
          </>
        )}
      </div>
    </main>
  );
}
