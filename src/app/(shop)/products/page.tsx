import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar from '@/components/product/FilterSidebar';
import SortDropdown from '@/components/product/SortDropdown';
import CategoryChips from '@/components/product/CategoryChips';
import { unstable_cache } from 'next/cache';
import { listProducts, parseListParams, getAllBrands, getAllCategories } from '@/server/services/catalog.service';
import { CONTACT } from '@/lib/constants';
import { breadcrumbSchema, itemListSchema, faqSchema, jsonLd } from '@/lib/seo/schema';
import { PRODUCTS_PAGE_SEO } from '@/lib/seo/catalog-seo';
import { ogImage } from '@/lib/seo/og-image';
/* 9 Oct 2026 — 94-keyword audit: SHOP category me 13 keywords ka exact
   phrase kahin nahi tha. /products ek DB listing hai, product naam me
   "Patna" kabhi nahi aata — isliye neeche ek asli content block. */
import PatnaShopBlock from '@/components/product/PatnaShopBlock';
/* 12 Oct 2026 — 6 SHOP keyword heading me nahi the. Naya block. */
import IntentKeywordBlock from '@/components/service/IntentKeywordBlock';
/* 13 Oct 2026 — 72-keyword gap scan me 50 KAHIN NAHI mile. Sabse bada gap
   Hinglish ("ro mistri", "ro wala"), time ("24 hour", "sunday"), aur shop
   ("ro shop near me"). Naye page nahi banaye — doorway/scaled-content policy.
   Naya block, purana kuch nahi badla. */
import ExtraKeywordBlock from '@/components/service/ExtraKeywordBlock';
/* 🔴 3 Nov 2026 — is page par brand ke naam 25+ baar aate hain. Ads appeal
   reject hone ke baad naapa gaya ki yahan koi disclaimer nahi tha.
   Compact version — uske saare vaakye 60 char se chhote hain. */
import BrandNoticeCompact from '@/components/service/BrandNoticeCompact';

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
 * 3600 sec = 1 ghanta. Product add/edit par revalidatePath('/products')
 * chalta hai, isliye naya product turant dikhta hai.
 * Bachat: 8,640 -> 720 regen prati mahina.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: PRODUCTS_PAGE_SEO.metaTitle,
  description: PRODUCTS_PAGE_SEO.metaDescription,
  alternates: { canonical: '/products' },
  openGraph: {
    title: PRODUCTS_PAGE_SEO.metaTitle,
    description: PRODUCTS_PAGE_SEO.metaDescription,
    url: '/products',
    type: 'website',
    images: ogImage(),
  },
};

/**
 * Filter/sort/page state lives in the URL, which makes this a dynamic route —
 * Next.js opts any page reading searchParams out of static generation, so the
 * `revalidate = 300` above never applied and every request hit the database.
 *
 * Measured on the live site 3 Sep 2026: TTFB 2.71s with `x-vercel-cache: MISS`
 * on every single request, against 0.69s on the fully static /service-patna.
 *
 * The fix is to cache the QUERY rather than the page. unstable_cache keys on
 * the resolved filter params, so the common cases — the unfiltered first page,
 * and each category — are served from cache, while an unusual filter
 * combination simply misses and runs the query as before. Tagged so an admin
 * product save can purge it immediately rather than waiting out the TTL.
 */
const listProductsCached = unstable_cache(
  async (p: ReturnType<typeof parseListParams>) => listProducts(p),
  ['products-list'],
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

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = parseListParams(searchParams);
  const [{ items, total, page, pages }, brands, categories] = await Promise.all([
    listProductsCached(params),
    getBrandsCached(),
    getCategoriesCached(),
  ]);

  return (
    <main className="bg-white pb-16">
      {/*
        This page previously shipped ZERO structured data — measured on the
        live site 18 Aug 2026. ItemList declares the catalog, FAQPage makes the
        page eligible for the FAQ rich result.
      */}
      <script {...jsonLd([
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'All Products', url: '/products' },
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
              'RO Purifiers, Spare Parts & Commercial Plants — Aqua Perl',
            )]
          : []),
        faqSchema(PRODUCTS_PAGE_SEO.faqs),
      ])} />

      <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
        <ol className="container mx-auto flex gap-2 px-4 py-3 text-sm">
          <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
          <li className="text-slate-300">/</li>
          <li className="font-medium text-muted">All Products</li>
        </ol>
      </nav>

      <div className="container mx-auto px-4 pt-6">
        <h1 className="font-display text-xl font-extrabold text-navy-700 sm:text-2xl md:text-3xl">
          {PRODUCTS_PAGE_SEO.heading}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-600 sm:text-base">
          {PRODUCTS_PAGE_SEO.intro}
        </p>
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

        {/* Trust block + FAQs. Below the grid so buyers reach products first. */}
        <div className="mt-12">
          <BrandNoticeCompact />
        </div>

        <section className="mt-14 border-t border-slate-100 pt-10">
          <h2 className="font-display text-xl font-bold text-navy-700 sm:text-2xl">
            Why buy from a service company
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {PRODUCTS_PAGE_SEO.trustPoints.map((t) => (
              <div key={t.title} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <h3 className="text-sm font-bold text-navy-700">{t.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{t.body}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-10 font-display text-xl font-bold text-navy-700 sm:text-2xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 space-y-2.5">
            {PRODUCTS_PAGE_SEO.faqs.map((f) => (
              <details key={f.q} className="group rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <summary className="cursor-pointer list-none text-sm font-bold text-navy-700 marker:hidden">
                  <span className="mr-2 text-aqua-600 group-open:hidden">+</span>
                  <span className="mr-2 hidden text-aqua-600 group-open:inline">−</span>
                  {f.q}
                </summary>
                <p className="mt-2.5 pl-5 text-sm leading-relaxed text-navy-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <PatnaShopBlock />

      <IntentKeywordBlock variant="shop" />

      <ExtraKeywordBlock variant="shop" />
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
