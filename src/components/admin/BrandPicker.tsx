'use client';

/**
 * BrandPicker — type-to-search brand box that can also CREATE a brand.
 *
 * The old <select> only showed the 5 brands that happened to be in the seed,
 * so the admin could not tag an AO Smith / Havells / Vontron product at all.
 * This component:
 *   • filters the existing brand list as you type
 *   • offers "+ Add <whatever you typed>" when nothing matches
 *   • creates the brand through /api/admin/brands and selects it immediately
 *
 * It is a drop-in replacement: same value (brandId) in, same value out.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

export interface BrandOption { id: string; name: string }

export default function BrandPicker({
  brands, value, onChange, onBrandsChange,
}: {
  brands: BrandOption[];
  value: string;
  onChange: (id: string, name: string) => void;
  onBrandsChange?: (next: BrandOption[]) => void;
}) {
  const [list, setList] = useState<BrandOption[]>(brands);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setList(brands), [brands]);

  const selected = list.find((b) => b.id === value);

  // Close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((b) => b.name.toLowerCase().includes(needle));
  }, [q, list]);

  const exact = filtered.some((b) => b.name.toLowerCase() === q.trim().toLowerCase());
  const canCreate = q.trim().length >= 2 && !exact;

  async function createBrand() {
    const name = q.trim();
    if (name.length < 2) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? 'Brand add nahi hua');
        return;
      }
      const next = [...list.filter((b) => b.id !== data.brand.id), data.brand]
        .sort((a, b) => a.name.localeCompare(b.name));
      setList(next);
      onBrandsChange?.(next);
      onChange(data.brand.id, data.brand.name);
      setQ('');
      setOpen(false);
      toast.success(data.created ? `Brand "${data.brand.name}" add ho gaya` : `"${data.brand.name}" pehle se tha — select kar diya`);
    } catch {
      toast.error('Network error');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setQ(''); }}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100"
      >
        <span className={selected ? 'text-navy-700' : 'text-slate-400'}>
          {selected ? selected.name : 'No brand — click to search or add'}
        </span>
        <span className="ml-2 text-slate-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-2">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (canCreate) void createBrand();
                  else if (filtered[0]) { onChange(filtered[0].id, filtered[0].name); setOpen(false); }
                }
                if (e.key === 'Escape') setOpen(false);
              }}
              placeholder="Brand ka naam type karo… (e.g. AO Smith)"
              className="w-full rounded-lg bg-slate-50 px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => { onChange('', ''); setOpen(false); }}
              className="block w-full px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50"
            >
              No brand
            </button>

            {filtered.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => { onChange(b.id, b.name); setOpen(false); }}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-aqua-50 ${
                  b.id === value ? 'bg-aqua-50 font-semibold text-aqua-700' : 'text-navy-700'
                }`}
              >
                {b.name}
              </button>
            ))}

            {filtered.length === 0 && !canCreate && (
              <p className="px-3 py-4 text-center text-sm text-slate-400">Kuch nahi mila</p>
            )}
          </div>

          {canCreate && (
            <button
              type="button"
              onClick={() => void createBrand()}
              disabled={creating}
              className="block w-full border-t border-slate-100 bg-aqua-50 px-3 py-3 text-left text-sm font-bold text-aqua-700 hover:bg-aqua-100 disabled:opacity-60"
            >
              {creating ? 'Add ho raha hai…' : `+ "${q.trim()}" naam se naya brand banao`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
