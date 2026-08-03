import Link from 'next/link';
import ProductCard, { type ProductCardData } from '@/components/product/ProductCard';

export default function BestSellers({
  title,
  subtitle,
  products,
  viewAllHref,
  variant = 'default',
}: {
  title: string;
  subtitle?: string;
  products: ProductCardData[];
  viewAllHref: string;
  variant?: 'default' | 'compact';
}) {
  if (!products.length) return null;

  return (
    <section className="py-14">
      <div className="container mx-auto px-4">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          <Link href={viewAllHref} className="text-sm font-bold text-aqua-600 hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} compact={variant === 'compact'} />
          ))}
        </div>
      </div>
    </section>
  );
}
