import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar from '@/components/product/FilterSidebar';
import SortDropdown from '@/components/product/SortDropdown';
import CategoryChips from '@/components/product/CategoryChips';
import CategorySeoContent from '@/components/product/CategorySeoContent';
/* 🔴 3 Nov 2026 — is page par brand ke naam 25+ baar aate hain. Ads appeal
   reject hone ke baad naapa gaya ki yahan koi disclaimer nahi tha.
   Compact version — uske saare vaakye 60 char se chhote hain. */
import BrandNoticeCompact from '@/components/service/BrandNoticeCompact';
import { EmptyState, Pagination } from '../../products/page';
import {
  listProducts, parseListParams, getCategoryBySlug, getAllBrands, getAllCategories,
} from '@/server/services/catalog.service';
import { breadcrumbSchema, itemListSchema, faqSchema, jsonLd } from '@/lib/seo/schema';
import { CATEGORY_SEO } from '@/lib/seo/catalog-seo';
import { ogImage } from '@/lib/seo/og-image';

/* 🔴 4 Nov 2026 — ISR timer badhaya (Vercel CPU 90% se bachne ke liye).
 * Vercel Hobby: Fluid Active CPU 3h 37m / 4h = 90%. 100% par project
 * PAUSE ho jaata hai aur Vercel ke docs ke mutabik 30 din tak paused
 * rehta hai. Naap: 155K invocation me 82K ISR write — yaani har doosri
 * call page dobara bana rahi thi.
 *
 * 🔴 Content purana NAHI hoga: admin se product/rate/banner badalne par
 *    code revalidatePath()/revalidateTag() chalata hai, jo cache turant
 *    todta hai. Timer sirf tab chalta hai jab kuch badla hi nahi.
 *    Ye verify-rate-sync aur verify-banner-upload se jaancha gaya hai.
 *
 * 3600 sec = 1 ghanta. 6 category page. Admin me category ya
 * product badlo to revalidateTag('products') turant tod deta hai.
 * Bachat: 51,840 -> 4,320 regen prati mahina (sabse badi bachat).
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const cats = await getAllCategories().catch(() => []);
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) return { title: 'Category Not Found' };

  // Hand-written, length-checked copy per category beats a generic template.
  // These target national buying queries, not Patna service queries.
  const seo = CATEGORY_SEO[params.slug];

  return {
    title: seo?.metaTitle ?? `${cat.name} — Best Price in India`,
    description:
      seo?.metaDescription ??
      cat.description ??
      `Buy ${cat.name.toLowerCase()} online at the best price. Genuine products, free delivery across India above ₹1,999, easy returns.`,
    keywords: seo?.keywords,
    alternates: { canonical: `/category/${cat.slug}` },
    openGraph: {
      title: seo?.metaTitle ?? cat.name,
      description: seo?.metaDescription ?? undefined,
      url: `/category/${cat.slug}`,
      type: 'website',
      images: ogImage(),
    },
  };
}

/* Same caching rationale as /products: reading searchParams makes the route
   dynamic, so the page-level revalidate never applies. Cache the query instead,
   keyed on the resolved filters and tagged for instant purge on product save. */
const listProductsCached = unstable_cache(
  async (p: ReturnType<typeof parseListParams> & { categorySlug: string }) => listProducts(p),
  ['category-list'],
  { revalidate: 300, tags: ['products'] },
);
const getBrandsCached = unstable_cache(
  async () => getAllBrands(),
  ['all-brands'],
  { revalidate: 3600, tags: ['products'] },
);
const getCategoriesCached = unstable_cache(
  async () => getAllCategories().catch(() => []),
  ['all-categories'],
  { revalidate: 3600, tags: ['products'] },
);

export default async function CategoryPage({
  params, searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) notFound();

  const listParams = { ...parseListParams(searchParams), categorySlug: params.slug };
  const [{ items, total, page, pages }, brands, categories] = await Promise.all([
    listProductsCached(listParams),
    getBrandsCached(),
    getCategoriesCached(),
  ]);

  const seo = CATEGORY_SEO[params.slug];

  return (
    <>
      {/*
        Previously this page shipped only a BreadcrumbList. ItemList tells
        Google the page is a set of purchasable products, and FAQPage makes it
        eligible for the FAQ rich result. Both are on Microsoft's AEO/GEO
        schema shortlist for AI answer engines.
      */}
      <script {...jsonLd([
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/products' },
          { name: cat.name, url: `/category/${cat.slug}` },
        ]),
        ...(items.length
          ? [itemListSchema(
              items.map((p) => ({
                name: p.name,
                url: `/products/${p.slug}`,
                image: p.images?.[0]?.url,
                price: Number(p.sellingPrice),
                inStock: p.stockQuantity > 0,
              })),
              `${cat.name} — Aqua Perl`,
            )]
          : []),
        ...(seo?.faqs?.length ? [faqSchema(seo.faqs)] : []),
      ])} />

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
          <h1 className="font-display text-xl font-extrabold text-navy-700 sm:text-2xl md:text-3xl">
            {seo?.heading ?? cat.name}
          </h1>
          {(seo?.intro || cat.description) && (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-600 sm:text-base">
              {seo?.intro ?? cat.description}
            </p>
          )}
          <p className="mt-1 text-sm text-muted">{total} products</p>

          {/* Ek category se doosri par jaane ka rasta — mobile par ye
              nahi tha, user ko back jaana padta tha. */}
          <div className="mt-4">
            <CategoryChips categories={categories} activeSlug={cat.slug} />
          </div>

          {/* Mobile: filter + sort ek control bar mein, products ke upar.
              Pehle `flex` bina breakpoint ke tha — isse mobile par filter
              button aur product grid side-by-side dab jaate the aur poora
              page cluttered dikhta tha. */}
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
                  <Pagination page={page} pages={pages} searchParams={searchParams} basePath={`/category/${cat.slug}`} />
                </>
              )}
            </div>
          </div>

          {/* Buying guide + price table + FAQs. Below the grid so shoppers who
              already know what they want are never pushed past it. */}
          {seo && <CategorySeoContent seo={seo} />}
        </div>
        <div className="container mx-auto px-4 pt-10">
          <BrandNoticeCompact />
        </div>
      </main>
    </>
  );
}
