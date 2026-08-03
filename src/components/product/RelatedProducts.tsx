import ProductCard, { type ProductCardData } from './ProductCard';

export default function RelatedProducts({
  products,
  title = 'You May Also Like',
  className = '',
}: {
  products: ProductCardData[];
  title?: string;
  className?: string;
}) {
  if (!products.length) return null;

  return (
    <section className={className}>
      <h2 className="mb-5 font-display text-2xl font-bold text-navy-700">{title}</h2>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
