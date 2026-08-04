import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import ProductForm from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Add Product' };

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm font-semibold text-aqua-600 hover:underline">
          ← Back to products
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-navy-700">Add Product</h1>
        <p className="mt-0.5 text-sm text-muted">
          Fill the Basic and Pricing tabs, add at least 2 images, then set status to Active.
        </p>
      </div>

      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
