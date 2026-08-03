'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';

interface Props {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  inStock: boolean;
  maxQty: number;
  compact?: boolean;
}

export default function AddToCartBar({
  productId, name, price, image, slug, inStock, maxQty, compact = false,
}: Props) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  function add(then?: 'checkout') {
    if (!inStock) return;
    addItem({ productId, name, slug, image, price, maxQty }, qty);
    if (then === 'checkout') {
      router.push('/checkout');
    } else {
      toast.success('Added to cart', { description: name });
    }
  }

  if (!inStock) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-xl bg-slate-200 py-3.5 font-bold text-slate-500"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className={compact ? 'flex flex-1 gap-2' : 'flex w-full flex-col gap-3'}>
      {!compact && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-navy-700">Quantity</span>
          <div className="flex items-center rounded-lg border border-navy-100">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="px-3 py-2 text-lg font-bold text-navy-600 hover:bg-navy-50 disabled:opacity-40"
              disabled={qty <= 1}
            >
              −
            </button>
            <span className="w-10 text-center font-bold text-navy-700">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              aria-label="Increase quantity"
              className="px-3 py-2 text-lg font-bold text-navy-600 hover:bg-navy-50 disabled:opacity-40"
              disabled={qty >= maxQty}
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 gap-3">
        <button
          onClick={() => add()}
          className="flex-1 rounded-xl border-2 border-cta-orange bg-white py-3.5 font-bold text-cta-orange transition hover:bg-orange-50"
        >
          Add to Cart
        </button>
        <button
          onClick={() => add('checkout')}
          className="flex-1 rounded-xl bg-cta-orange py-3.5 font-bold text-white shadow-cta transition hover:bg-cta-orangeDark"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
