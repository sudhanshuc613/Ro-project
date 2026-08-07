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
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-navy-100 bg-white transition duration-200 sm:rounded-2xl lg:hover:-translate-y-1 lg:hover:border-aqua-100 lg:hover:shadow-card-hover">
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-aqua-50 p-2 sm:p-4">
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
            <span className="absolute left-1.5 top-1.5 rounded bg-cta-green px-1.5 py-0.5 text-[10px] font-bold text-white sm:left-3 sm:top-3 sm:rounded-md sm:px-2 sm:py-1 sm:text-xs">
              {off}% OFF
            </span>
          )}
          {product.isBestseller && (
            <span className="absolute right-1.5 top-1.5 rounded bg-cta-orange px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white sm:right-3 sm:top-3 sm:rounded-md sm:px-2 sm:py-1 sm:text-[10px]">
              Bestseller
            </span>
          )}

          {/* Wishlist heart — stops the parent Link from firing on tap */}
          <span
            className={`absolute right-1.5 sm:right-3 ${
              product.isBestseller ? 'top-8 sm:top-12' : 'top-1.5 sm:top-3'
            }`}
          >
            <WishlistButton
              productId={product.id}
              productSlug={product.slug}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-navy-500 shadow-card ring-1 ring-navy-100 transition hover:text-red-500 sm:h-9 sm:w-9"
            />
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-2.5 sm:p-4">
          {product.brand && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-aqua-600">
              {product.brand.name}
            </span>
          )}

          <h3 className="mt-1 line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-snug text-navy-700 sm:min-h-[40px] sm:text-sm">
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

          {/* Mobile par 4 chips do line le lete the aur card lamba-cluttered
              ho jaata tha — isliye mobile par 2, bade screen par 4. */}
          {!compact && product.purificationTech.length > 0 && (
            <div className="mt-2 flex gap-1 overflow-hidden">
              {product.purificationTech.slice(0, 4).map((t, i) => (
                <span
                  key={t}
                  className={`shrink-0 rounded bg-aqua-50 px-1.5 py-0.5 text-[9px] font-bold text-aqua-700 sm:text-[10px] ${
                    i >= 2 ? 'hidden sm:inline-block' : ''
                  }`}
                >
                  {t.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-base font-extrabold text-navy-700 sm:text-xl">{formatINR(price)}</span>
            {off > 0 && <span className="text-xs text-muted line-through">{formatINR(mrp)}</span>}
          </div>

          <p className={`mt-1 text-[11px] font-semibold ${lowStock ? 'text-cta-orange' : inStock ? 'text-cta-green' : 'text-red-600'}`}>
            {inStock ? (lowStock ? `Only ${product.stockQuantity} left!` : 'In Stock') : 'Out of Stock'}
          </p>
        </div>
      </Link>

      <div className="p-2.5 pt-0 sm:p-4 sm:pt-0">
        <button
          onClick={handleAdd}
          disabled={!inStock}
          className="w-full rounded-lg bg-navy-700 py-2 text-[13px] font-bold text-white transition active:scale-95 hover:bg-aqua-600 disabled:cursor-not-allowed disabled:bg-slate-300 sm:py-2.5 sm:text-sm"
        >
          {inStock ? 'Add to Cart' : 'Notify Me'}
        </button>
      </div>
    </article>
  );
}
