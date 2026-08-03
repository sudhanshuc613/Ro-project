'use client';

/**
 * Cart store (Zustand + localStorage persistence).
 * Guest carts live client-side and sync to the server `carts` table on login
 * or at checkout, which is what feeds abandoned-cart recovery.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  mrp?: number;
  quantity: number;
  maxQty: number;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
  isOpen: boolean;

  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQty: (productId: string, qty: number, variantId?: string) => void;
  clear: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  setOpen: (open: boolean) => void;

  subtotal: () => number;
  totalSavings: () => number;
  itemCount: () => number;
}

const sameLine = (a: CartItem, productId: string, variantId?: string) =>
  a.productId === productId && (a.variantId ?? null) === (variantId ?? null);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discount: 0,
      isOpen: false,

      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item.productId, item.variantId));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.productId, item.variantId)
                  ? { ...i, quantity: Math.min(i.quantity + qty, i.maxQty) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: Math.min(qty, item.maxQty) }] };
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, variantId)),
        })),

      updateQty: (productId, qty, variantId) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => !sameLine(i, productId, variantId))
              : state.items.map((i) =>
                  sameLine(i, productId, variantId)
                    ? { ...i, quantity: Math.min(qty, i.maxQty) }
                    : i,
                ),
        })),

      clear: () => set({ items: [], couponCode: null, discount: 0 }),

      applyCoupon: (code, discount) => set({ couponCode: code, discount }),
      removeCoupon: () => set({ couponCode: null, discount: 0 }),
      setOpen: (isOpen) => set({ isOpen }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      totalSavings: () =>
        get().items.reduce((sum, i) => sum + ((i.mrp ?? i.price) - i.price) * i.quantity, 0),

      itemCount: () => get().items.reduce((n, i) => n + i.quantity, 0),
    }),
    {
      name: 'aqn-cart',
      partialize: (s) => ({ items: s.items, couponCode: s.couponCode, discount: s.discount }),
    },
  ),
);
