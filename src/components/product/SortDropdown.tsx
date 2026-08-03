'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FILTER_FACETS } from '@/lib/constants';

export default function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline">Sort by</span>
      <select
        value={params.get('sort') ?? 'relevance'}
        onChange={(e) => {
          const sp = new URLSearchParams(params.toString());
          sp.set('sort', e.target.value);
          sp.delete('page');
          router.push(`${pathname}?${sp.toString()}`);
        }}
        className="rounded-lg border border-navy-100 px-3 py-2 text-sm font-medium text-navy-700 focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100"
      >
        {FILTER_FACETS.sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
