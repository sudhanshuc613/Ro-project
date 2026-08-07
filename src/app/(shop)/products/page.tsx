import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar from '@/components/product/FilterSidebar';
import SortDropdown from '@/components/product/SortDropdown';
import CategoryChips from '@/components/product/CategoryChips';
import { listProducts, parseListParams, getAllBrands, getAllCategories } from '@/server/services/catalog.service';
import { CONTACT } from '@/lib/constants';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'All Products — RO Purifiers, Spare Parts & Plants',
  description:
    'Browse RO water purifiers, commercial plants and genuine spare parts. Free delivery across India above ₹1,999. Expert support on call.',
  alternates: { canonical: '/products' },
};

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = parseListParams(searchParams);
  const [{ items, total, page, pages }, brands, categories] = await Promise.all([
    listProducts(params),
    getAllBrands(),
    getAllCategories().catch(() => []),
  ]);

  return (
    <main className="bg-white pb-16">
      <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
        <ol className="container mx-auto flex gap-2 px-4 py-3 text-sm">
          <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
          <li className="text-slate-300">/</li>
          <li className="font-medium text-muted">All Products</li>
        </ol>
      </nav>

      <div className="container mx-auto px-4 pt-6">
        <h1 className="font-display text-xl font-extrabold text-navy-700 sm:text-2xl md:text-3xl">All Products</h1>
        <p className="mt-1 text-sm text-muted">{total} products available</p>

        <div className="mt-4">
          <CategoryChips categories={categories} />
        </div>

        {/* Mobile: filter + sort ek control bar mein, products ke upar. */}
        <div className="mt-5 flex items-center justify-between gap-3 lg:hidden">
          <FilterSidebar brands={brands} totalCount={total} />
          <SortDropdown />
        </div>

        <div className="mt-4 flex gap-8 lg:mt-6">
          <div className="hidden lg:block">
            <FilterSidebar brands={brands} totalCount={total} desktopOnly />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-xs text-muted sm:text-sm">
                Showing <strong className="text-navy-700">{items.length}</strong> of {total}
              </p>
              <div className="hidden lg:block">
                <SortDropdown />
              </div>
            </div>

            {items.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4">
                  {items.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                <Pagination page={page} pages={pages} searchParams={searchParams} basePath="/products" />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-navy-200 py-16 text-center">
      <p className="text-4xl">🔍</p>
      <h2 className="mt-3 font-display text-lg font-bold text-navy-700">No products match your filters</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
        Try removing a filter, or call us — we stock many parts that are not listed online.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link href="/products" className="rounded-xl bg-navy-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-600">
          Clear filters
        </Link>
        <a href={CONTACT.primaryTel} className="rounded-xl bg-cta-green px-5 py-2.5 text-sm font-bold text-white hover:bg-cta-greenDark">
          📞 {CONTACT.primaryPhone}
        </a>
      </div>
    </div>
  );
}

export function Pagination({
  page, pages, searchParams, basePath,
}: {
  page: number;
  pages: number;
  searchParams: Record<string, string | string[] | undefined>;
  basePath: string;
}) {
  if (pages <= 1) return null;
  const build = (n: number) => {
    const sp = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== 'page' && k !== 'slug') sp.set(k, Array.isArray(v) ? v[0] : v);
    });
    sp.set('page', String(n));
    return `${basePath}?${sp.toString()}`;
  };

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 && (
        <Link href={build(page - 1)} className="rounded-lg border border-navy-100 px-4 py-2 text-sm font-bold text-navy-700 hover:bg-navy-50">
          ← Prev
        </Link>
      )}
      <span className="px-3 text-sm text-muted">Page {page} of {pages}</span>
      {page < pages && (
        <Link href={build(page + 1)} className="rounded-lg border border-navy-100 px-4 py-2 text-sm font-bold text-navy-700 hover:bg-navy-50">
          Next →
        </Link>
      )}
    </nav>
  );
}
