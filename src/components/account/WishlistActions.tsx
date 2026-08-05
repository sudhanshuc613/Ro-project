'use client';

/**
 * Move-to-cart / remove for a wishlist tile.
 *
 * Cart is a client-side Zustand store, wishlist lives in Postgres, so
 * "move to cart" is two operations. The DB removal is awaited before the
 * refresh so the item can't reappear on re-render.
 */
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cart';

export default function WishlistActions({
  productId,
  slug,
  name,
  price,
  mrp,
  image,
  disabled,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  image: string | null;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const addItem = useCartStore((s) => s.addItem);

  async function drop(silent = false) {
    const res = await fetch(`/api/account/wishlist?productId=${productId}`, { method: 'DELETE' });
    if (!res.ok) {
      if (!silent) toast.error('Could not remove');
      return false;
    }
    return true;
  }

  async function moveToCart() {
    addItem({
      productId,
      name,
      slug,
      image: image ?? '',
      price,
      mrp,
      maxQty: 10,
    });
    const ok = await drop(true);
    toast.success(ok ? 'Moved to cart' : 'Added to cart');
    start(() => router.refresh());
  }

  async function remove() {
    if (await drop()) {
      toast.success('Removed from wishlist');
      start(() => router.refresh());
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={moveToCart}
        disabled={disabled || pending}
        className="flex-1 rounded-xl bg-cta-orange px-3 py-2.5 text-xs font-bold text-white shadow-cta transition hover:bg-cta-orangeDark disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        {disabled ? 'Out of stock' : 'Move to cart'}
      </button>
      <button
        onClick={remove}
        disabled={pending}
        aria-label={`Remove ${name} from wishlist`}
        className="rounded-xl bg-navy-50 px-3 py-2.5 text-xs font-bold text-navy-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        ✕
      </button>
    </div>
  );
}
