import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar from '@/components/product/FilterSidebar';
import SortDropdown from '@/components/product/SortDropdown';
import { EmptyState, Pagination } from '../../products/page';
import {
  listProducts, parseListParams, getCategoryBySlug, getAllBrands, getAllCategories,
} from '@/server/services/catalog.service';
import { breadcrumbSchema, jsonLd } from '@/lib/seo/schema';

export const revalidate = 300;

export async function generateStaticParams() {
  const cats = await getAllCategories().catch(() => []);
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) return { title: 'Category Not Found' };
  return {
    title: `${cat.name} — Best Price in India`,
    description:
      cat.description ??
      `Buy ${cat.name.toLowerCase()} online at the best price. Genuine products, free delivery across India above ₹1,999, easy returns.`,
    alternates: { canonical: `/category/${cat.slug}` },
  };
}

export default async function CategoryPage({
  params, searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) notFound();

  const listParams = { ...parseListParams(searchParams), categorySlug: params.slug };
  const [{ items, total, page, pages }, brands] = await Promise.all([
    listProducts(listParams),
    getAllBrands(),
  ]);

  return (
    <>
      <script {...jsonLd(breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: cat.name, url: `/category/${cat.slug}` },
      ]))} />

      <main className="bg-white pb-16">
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex gap-2 px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li><Link href="/products" className="text-navy-600 hover:text-aqua-600">Products</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">{cat.name}</li>
          </ol>
        </nav>

        <div className="container mx-auto px-4 pt-6">
          <h1 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">{cat.name}</h1>
          {cat.description && <p className="mt-2 max-w-3xl text-navy-600">{cat.description}</p>}
          <p className="mt-1 text-sm text-muted">{total} products</p>

          <div className="mt-6 flex gap-8">
            <FilterSidebar brands={brands} totalCount={total} />

            <div className="min-w-0 flex-1">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-sm text-muted">
                  Showing <strong className="text-navy-700">{items.length}</strong> of {total}
                </p>
                <SortDropdown />
              </div>

              {items.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                    {items.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                  <Pagination page={page} pages={pages} searchParams={searchParams} basePath={`/category/${cat.slug}`} />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
