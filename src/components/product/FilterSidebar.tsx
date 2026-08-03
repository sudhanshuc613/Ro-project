'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { FILTER_FACETS } from '@/lib/constants';

interface Props {
  brands: { name: string; slug: string }[];
  totalCount: number;
}

export default function FilterSidebar({ brands, totalCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  function setParam(key: string, value: string | null) {
    const sp = new URLSearchParams(params.toString());
    if (value === null || value === '') sp.delete(key);
    else sp.set(key, value);
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  function toggleMulti(key: string, value: string) {
    const current = params.get(key)?.split(',').filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setParam(key, next.join(','));
  }

  const activeTech = params.get('tech')?.split(',').filter(Boolean) ?? [];
  const activeBrands = params.get('brand')?.split(',').filter(Boolean) ?? [];
  const activePrice = params.get('price') ?? '';
  const hasFilters = activeTech.length || activeBrands.length || activePrice || params.get('inStock');

  const body = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-display font-bold text-navy-700">Filters</p>
        {hasFilters ? (
          <button
            onClick={() => router.push(pathname)}
            className="text-xs font-bold text-cta-orange hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {/* Price */}
      <fieldset>
        <legend className="mb-2.5 text-sm font-bold text-navy-700">Price</legend>
        <div className="space-y-2">
          {FILTER_FACETS.priceRanges.map((r) => (
            <label key={r.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-navy-600">
              <input
                type="radio"
                name="price"
                checked={activePrice === r.value}
                onChange={() => {
                  setParam('price', r.value);
                  setParam('minPrice', String(r.min));
                  setParam('maxPrice', r.max === null ? '' : String(r.max));
                }}
                className="h-4 w-4 border-navy-200 text-aqua-500 focus:ring-aqua-400"
              />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Purification technology */}
      <fieldset className="border-t border-navy-50 pt-5">
        <legend className="mb-2.5 text-sm font-bold text-navy-700">Purification</legend>
        <div className="space-y-2">
          {FILTER_FACETS.purificationTech.map((t) => (
            <label key={t.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-navy-600">
              <input
                type="checkbox"
                checked={activeTech.includes(t.value)}
                onChange={() => toggleMulti('tech', t.value)}
                className="h-4 w-4 rounded border-navy-200 text-aqua-500 focus:ring-aqua-400"
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Brands */}
      {brands.length > 0 && (
        <fieldset className="border-t border-navy-50 pt-5">
          <legend className="mb-2.5 text-sm font-bold text-navy-700">Brand</legend>
          <div className="space-y-2">
            {brands.map((b) => (
              <label key={b.slug} className="flex cursor-pointer items-center gap-2.5 text-sm text-navy-600">
                <input
                  type="checkbox"
                  checked={activeBrands.includes(b.slug)}
                  onChange={() => toggleMulti('brand', b.slug)}
                  className="h-4 w-4 rounded border-navy-200 text-aqua-500 focus:ring-aqua-400"
                />
                {b.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Availability */}
      <fieldset className="border-t border-navy-50 pt-5">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-navy-600">
          <input
            type="checkbox"
            checked={params.get('inStock') === 'true'}
            onChange={(e) => setParam('inStock', e.target.checked ? 'true' : null)}
            className="h-4 w-4 rounded border-navy-200 text-aqua-500 focus:ring-aqua-400"
          />
          In stock only
        </label>
      </fieldset>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-navy-100 px-4 py-2.5 text-sm font-bold text-navy-700 lg:hidden"
      >
        ☰ Filters {hasFilters ? <span className="rounded-full bg-cta-orange px-1.5 text-[11px] text-white">•</span> : null}
      </button>

      {/* Desktop */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-32 rounded-2xl border border-navy-100 p-5">{body}</div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-xs overflow-y-auto bg-white p-5">
            <button
              onClick={() => setOpen(false)}
              className="mb-4 ml-auto block rounded-lg p-2 hover:bg-navy-50"
              aria-label="Close filters"
            >
              ✕
            </button>
            {body}
            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-xl bg-navy-700 py-3 font-bold text-white"
            >
              Show {totalCount} products
            </button>
          </div>
        </div>
      )}
    </>
  );
}
