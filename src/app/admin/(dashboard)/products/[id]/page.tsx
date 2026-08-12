import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import ProductForm from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit Product' };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        specifications: { orderBy: [{ specGroup: 'asc' }, { displayOrder: 'asc' }] },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  if (!product) notFound();

  const seo = await prisma.seoMetadata.findFirst({
    where: { entityType: 'PRODUCT', entityId: product.id },
  });

  const initial = {
    id: product.id,
    name: product.name,
    sku: product.sku,
    slug: product.slug,
    type: product.type,
    categoryId: product.categoryId,
    brandId: product.brandId ?? '',
    shortDescription: product.shortDescription ?? '',
    description: product.description ?? '',
    mrp: Number(product.mrp),
    sellingPrice: Number(product.sellingPrice),
    costPrice: Number(product.costPrice ?? 0),
    taxRate: Number(product.taxRate),
    hsnCode: product.hsnCode ?? '',
    stockQuantity: product.stockQuantity,
    lowStockThreshold: product.lowStockThreshold,
    purificationTech: product.purificationTech,
    warrantyMonths: product.warrantyMonths ?? 12,
    storageLitres: Number(product.storageLitres ?? 0),
    capacityLph: product.capacityLph ?? 0,
    isPanIndia: product.isPanIndia,
    requiresInstallation: product.requiresInstallation,
    freeShipping: product.freeShipping,
    isFeatured: product.isFeatured,
    status: product.status,
    images: product.images.length
      ? product.images.map((i) => ({ url: i.url, altText: i.altText, isPrimary: i.isPrimary }))
      : [{ url: '', altText: '', isPrimary: true }, { url: '', altText: '', isPrimary: false }],
    specifications: product.specifications.length
      ? product.specifications.map((s) => ({
          specGroup: s.specGroup, specKey: s.specKey, specValue: s.specValue,
        }))
      : [{ specGroup: 'General', specKey: '', specValue: '' }],
    seo: {
      metaTitle: seo?.metaTitle ?? '',
      metaDescription: seo?.metaDescription ?? '',
      metaKeywords: seo?.metaKeywords ?? '',
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/products" className="text-sm font-semibold text-aqua-600 hover:underline">
            ← Back to products
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-navy-700">Edit Product</h1>
          <p className="mt-0.5 text-sm text-muted">{product.sku}</p>
        </div>
        <a
          href={`/products/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-navy-700 hover:bg-slate-50"
        >
          View live page ↗
        </a>
      </div>

      <ProductForm initial={initial} categories={categories} brands={brands} />
    </div>
  );
}
