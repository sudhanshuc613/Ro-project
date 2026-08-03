/**
 * PRODUCT DETAIL PAGE (PDP) — Server Component
 * ────────────────────────────────────────────────────────────────────────────
 *  • 2–5 zoomable images (ImageZoomGallery, client)
 *  • Price / MRP / discount / stock status
 *  • Rich description + grouped technical specification table
 *  • Pincode serviceability checker (delivery ETA + Patna install offer)
 *  • Product + Breadcrumb JSON-LD for global e-commerce SEO
 *  • Admin-controlled meta title/description via seo_metadata
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

import ImageZoomGallery from '@/components/product/ImageZoomGallery';
import PincodeChecker from '@/components/product/PincodeChecker';
import AddToCartBar from '@/components/product/AddToCartBar';
import SpecTable from '@/components/product/SpecTable';
import ReviewSummary from '@/components/product/ReviewSummary';
import RelatedProducts from '@/components/product/RelatedProducts';
import ProductGridSkeleton from '@/components/product/ProductGridSkeleton';

import { getProductBySlug, getRelatedProducts, incrementProductView } from '@/server/services/product.service';
import { buildMetadata, TITLE_TEMPLATES, DESC_TEMPLATES } from '@/lib/seo/metadata';
import { productSchema, breadcrumbSchema, jsonLd } from '@/lib/seo/schema';
import { formatINR } from '@/lib/utils/format';
import { CONTACT, SERVICE, SHIPPING } from '@/lib/constants';

export const revalidate = 900; // 15 min ISR

interface Props { params: { slug: string } }

/* ── Dynamic, admin-overridable metadata ────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found | AquaNexa' };

  return buildMetadata({
    entityType: 'PRODUCT',
    entityId: product.id,
    path: `/products/${product.slug}`,
    fallback: {
      title: TITLE_TEMPLATES.product(product.name, product.brand?.name),
      description: product.shortDescription || DESC_TEMPLATES.product(product.name, Number(product.sellingPrice)),
      keywords: [
        product.name, `buy ${product.name} online`, `${product.name} price`,
        product.brand?.name ?? '', product.category.name,
        'water purifier online India',
      ].filter(Boolean),
      image: product.images[0]?.url,
    },
  });
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product || product.status === 'ARCHIVED') notFound();

  // Fire-and-forget analytics — never blocks render
  void incrementProductView(product.id);

  const price = Number(product.sellingPrice);
  const mrp = Number(product.mrp);
  const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inStock = product.stockQuantity > 0 || product.allowBackorder;
  const lowStock = inStock && product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: product.category.name, url: `/category/${product.category.slug}` },
    { name: product.name, url: `/products/${product.slug}` },
  ];

  return (
    <>
      <script {...jsonLd([
        productSchema({
          name: product.name, slug: product.slug, sku: product.sku,
          description: product.shortDescription ?? product.name,
          brand: product.brand?.name,
          images: product.images.map((i) => i.url),
          price, mrp, inStock,
          ratingAvg: Number(product.ratingAvg), ratingCount: product.ratingCount,
          warrantyMonths: product.warrantyMonths ?? undefined,
        }),
        breadcrumbSchema(crumbs),
      ])} />

      <main className="bg-white pb-28 lg:pb-12">
        {/* ── Breadcrumbs ── */}
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/40">
          <ol className="container mx-auto flex items-center gap-2 overflow-x-auto px-4 py-3 text-sm whitespace-nowrap">
            {crumbs.map((c, i) => (
              <li key={c.url} className="flex items-center gap-2">
                {i > 0 && <span className="text-slate-300">/</span>}
                {i === crumbs.length - 1 ? (
                  <span className="font-medium text-muted">{c.name}</span>
                ) : (
                  <Link href={c.url} className="text-navy-600 hover:text-aqua-600">{c.name}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="container mx-auto px-4 pt-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(0,1fr)] lg:gap-12">

            {/* ═══ LEFT: zoomable gallery (sticky on desktop) ═══ */}
            <div className="lg:sticky lg:top-[150px] lg:self-start">
              <ImageZoomGallery
                images={product.images.map((i) => ({
                  url: i.url, zoomUrl: i.zoomUrl ?? i.url,
                  thumbUrl: i.thumbUrl ?? i.url, alt: i.altText,
                }))}
                productName={product.name}
                discountPct={discountPct}
              />
            </div>

            {/* ═══ RIGHT: buy box ═══ */}
            <div>
              {product.brand && (
                <Link href={`/products?brand=${product.brand.slug}`}
                  className="text-sm font-bold uppercase tracking-wide text-aqua-600 hover:underline">
                  {product.brand.name}
                </Link>
              )}

              <h1 className="mt-1.5 font-display text-2xl font-bold leading-snug text-navy-700 md:text-3xl">
                {product.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <ReviewSummary
                  average={Number(product.ratingAvg)}
                  count={product.ratingCount}
                  href="#reviews"
                />
                <span className="text-sm text-muted">SKU: {product.sku}</span>
                {product.soldCount > 20 && (
                  <span className="rounded-md bg-orange-50 px-2 py-0.5 text-xs font-bold text-cta-orange">
                    {product.soldCount}+ sold
                  </span>
                )}
              </div>

              {/* ── Price block ── */}
              <div className="mt-5 rounded-2xl border border-navy-50 bg-navy-50/40 p-5">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="font-display text-4xl font-extrabold text-navy-700">{formatINR(price)}</span>
                  {discountPct > 0 && (
                    <>
                      <span className="text-lg text-muted line-through">{formatINR(mrp)}</span>
                      <span className="rounded-lg bg-cta-green px-2.5 py-1 text-sm font-bold text-white">
                        {discountPct}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-muted">
                  Inclusive of all taxes ({Number(product.taxRate)}% GST)
                  {discountPct > 0 && <span className="ml-1 font-semibold text-cta-green">· You save {formatINR(mrp - price)}</span>}
                </p>

                {/* Stock status */}
                <div className="mt-4 flex items-center gap-2">
                  {inStock ? (
                    <>
                      <span className="h-2.5 w-2.5 rounded-full bg-cta-green" />
                      <span className="font-semibold text-cta-green">In Stock</span>
                      {lowStock && (
                        <span className="ml-1 text-sm font-semibold text-cta-orange">
                          Only {product.stockQuantity} left — order soon!
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <span className="font-semibold text-red-600">Out of Stock</span>
                    </>
                  )}
                </div>
              </div>

              {/* ── Highlights ── */}
              {product.purificationTech.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-bold text-navy-700">Purification Technology</p>
                  <div className="flex flex-wrap gap-2">
                    {product.purificationTech.map((t) => (
                      <span key={t} className="rounded-lg bg-aqua-50 px-3 py-1.5 text-sm font-semibold text-aqua-700 ring-1 ring-aqua-100">
                        {t.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.shortDescription && (
                <p className="mt-5 leading-relaxed text-navy-600">{product.shortDescription}</p>
              )}

              {/* ── Pincode serviceability ── */}
              <div className="mt-6">
                <PincodeChecker
                  productId={product.id}
                  isPanIndia={product.isPanIndia}
                  requiresInstallation={product.requiresInstallation}
                  freeShipping={product.freeShipping || price >= SHIPPING.freeAbove}
                />
              </div>

              {/* ── Desktop CTAs (mobile version is the sticky bar) ── */}
              <div className="mt-6 hidden gap-3 lg:flex">
                <AddToCartBar
                  productId={product.id}
                  name={product.name}
                  price={price}
                  image={product.images[0]?.url ?? ''}
                  slug={product.slug}
                  inStock={inStock}
                  maxQty={Math.max(product.stockQuantity, 1)}
                />
              </div>

              {/* ── Trust strip ── */}
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: '🚚', label: 'Free Delivery', sub: `Above ${formatINR(SHIPPING.freeAbove)}` },
                  { icon: '🛡️', label: `${product.warrantyMonths ?? 12}-Month`, sub: 'Warranty' },
                  { icon: '↩️', label: '7-Day', sub: 'Easy Returns' },
                  { icon: '🔧', label: 'Expert', sub: 'Installation' },
                ].map((t) => (
                  <li key={t.label} className="rounded-xl border border-navy-50 p-3 text-center">
                    <span className="text-xl">{t.icon}</span>
                    <p className="mt-1 text-xs font-bold text-navy-700">{t.label}</p>
                    <p className="text-[11px] text-muted">{t.sub}</p>
                  </li>
                ))}
              </ul>

              {/* ── Patna-only cross-sell to the service business ── */}
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="font-bold text-emerald-900">📍 In Patna? We install & service too.</p>
                <p className="mt-1 text-sm text-emerald-800">
                  Doorstep installation and repair by certified technicians —
                  visit charge only ₹{SERVICE.visitCharge}.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={CONTACT.primaryTel}
                    className="rounded-lg bg-cta-green px-4 py-2 text-sm font-bold text-white hover:bg-cta-greenDark">
                    Call {CONTACT.primaryPhone}
                  </a>
                  <a href={CONTACT.whatsappLink(`Hi, I'm interested in ${product.name}`)}
                    target="_blank" rel="noopener noreferrer"
                    className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100">
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Description + Specifications ═══ */}
          <section className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)]">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy-700">Product Description</h2>
              <div
                className="prose prose-slate mt-4 max-w-none prose-headings:font-display prose-headings:text-navy-700 prose-a:text-aqua-600"
                dangerouslySetInnerHTML={{ __html: product.description ?? '' }}
              />
            </div>

            <div id="specifications">
              <h2 className="font-display text-2xl font-bold text-navy-700">Technical Specifications</h2>
              <SpecTable specs={product.specifications} className="mt-4" />
            </div>
          </section>

          {/* ═══ Reviews ═══ */}
          <section id="reviews" className="mt-14 border-t border-navy-50 pt-10">
            <h2 className="font-display text-2xl font-bold text-navy-700">
              Customer Reviews ({product.ratingCount})
            </h2>
            {/* <ReviewList productId={product.id} /> */}
          </section>

          {/* ═══ Related ═══ */}
          <Suspense fallback={<ProductGridSkeleton count={4} />}>
            <RelatedProductsSection productId={product.id} categoryId={product.categoryId} />
          </Suspense>
        </div>

        {/* ── Mobile sticky buy bar ── */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white p-3 shadow-[0_-4px_16px_rgba(11,37,69,.08)] lg:hidden">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <p className="font-display text-xl font-extrabold text-navy-700">{formatINR(price)}</p>
              {discountPct > 0 && <p className="text-xs text-muted line-through">{formatINR(mrp)}</p>}
            </div>
            <AddToCartBar
              productId={product.id} name={product.name} price={price}
              image={product.images[0]?.url ?? ''} slug={product.slug}
              inStock={inStock} maxQty={Math.max(product.stockQuantity, 1)} compact
            />
          </div>
        </div>
      </main>
    </>
  );
}

async function RelatedProductsSection({ productId, categoryId }: { productId: string; categoryId: string }) {
  const related = await getRelatedProducts(productId, categoryId, 4);
  if (!related.length) return null;
  return <RelatedProducts products={related} className="mt-14" />;
}
