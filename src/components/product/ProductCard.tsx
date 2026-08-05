'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { formatINR, discountPercent } from '@/lib/utils/format';
import { toast } from 'sonner';
import WishlistButton from './WishlistButton';

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  sellingPrice: unknown;
  mrp: unknown;
  stockQuantity: number;
  ratingAvg: unknown;
  ratingCount: number;
  purificationTech: string[];
  isBestseller?: boolean;
  brand?: { name: string; slug: string } | null;
  images: { url: string; thumbUrl: string | null; altText: string }[];
}

export default function ProductCard({
  product,
  compact = false,
}: {
  product: ProductCardData;
  compact?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);

  const price = Number(product.sellingPrice);
  const mrp = Number(product.mrp);
  const rating = Number(product.ratingAvg);
  const off = discountPercent(mrp, price);
  const inStock = product.stockQuantity > 0;
  const lowStock = inStock && product.stockQuantity <= 5;
  const img = product.images[0];

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: img?.url ?? '',
      price,
      mrp,
      maxQty: product.stockQuantity,
    });
    toast.success('Added to cart', { description: product.name });
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white transition duration-200 hover:-translate-y-1 hover:border-aqua-100 hover:shadow-card-hover">
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-aqua-50 p-4">
          {img ? (
            <Image
              src={img.thumbUrl ?? img.url}
              alt={img.altText}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 280px"
              className="object-contain p-2 mix-blend-multiply"
            />
          ) : (
            <div className="grid h-full place-items-center text-4xl">💧</div>
          )}

          {off > 0 && (
            <span className="absolute left-3 top-3 rounded-md bg-cta-green px-2 py-1 text-xs font-bold text-white">
              {off}% OFF
            </span>
          )}
          {product.isBestseller && (
            <span className="absolute right-3 top-3 rounded-md bg-cta-orange px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Bestseller
            </span>
          )}

          {/* Wishlist heart — stops the parent Link from firing on tap */}
          <span className={`absolute ${product.isBestseller ? 'right-3 top-12' : 'right-3 top-3'}`}>
            <WishlistButton
              productId={product.id}
              productSlug={product.slug}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-navy-500 shadow-card ring-1 ring-navy-100 transition hover:text-red-500"
            />
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4">
          {product.brand && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-aqua-600">
              {product.brand.name}
            </span>
          )}

          <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-semibold leading-snug text-navy-700">
            {product.name}
          </h3>

          {product.ratingCount > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-cta-green px-1.5 py-0.5 text-[11px] font-bold text-white">
                {rating.toFixed(1)} ★
              </span>
              <span className="text-[11px] text-muted">({product.ratingCount.toLocaleString('en-IN')})</span>
            </div>
          )}

          {!compact && product.purificationTech.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.purificationTech.slice(0, 4).map((t) => (
                <span key={t} className="rounded bg-aqua-50 px-1.5 py-0.5 text-[10px] font-bold text-aqua-700">
                  {t.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-xl font-extrabold text-navy-700">{formatINR(price)}</span>
            {off > 0 && <span className="text-xs text-muted line-through">{formatINR(mrp)}</span>}
          </div>

          <p className={`mt-1 text-[11px] font-semibold ${lowStock ? 'text-cta-orange' : inStock ? 'text-cta-green' : 'text-red-600'}`}>
            {inStock ? (lowStock ? `Only ${product.stockQuantity} left!` : 'In Stock') : 'Out of Stock'}
          </p>
        </div>
      </Link>

      <div className="p-4 pt-0">
        <button
          onClick={handleAdd}
          disabled={!inStock}
          className="w-full rounded-lg bg-navy-700 py-2.5 text-sm font-bold text-white transition hover:bg-aqua-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {inStock ? 'Add to Cart' : 'Notify Me'}
        </button>
      </div>
    </article>
  );
}
