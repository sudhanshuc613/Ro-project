'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  selling_price: string;
  url: string | null;
}

const TRENDING = ['RO membrane', 'booster pump', 'Kent filter', 'commercial RO plant', 'UV lamp'];

export default function SearchAutosuggest() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  // Debounced fetch — 250ms is the sweet spot for Indian mobile networks
  useEffect(() => {
    clearTimeout(debounce.current);
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.items ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(debounce.current);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function submit(q = query) {
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && results[highlight]) {
        setOpen(false);
        router.push(`/products/${results[highlight].slug}`);
      } else {
        submit();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-2xl">
      <div className="flex overflow-hidden rounded-xl border-2 border-navy-100 bg-white transition focus-within:border-aqua-500 focus-within:ring-4 focus-within:ring-aqua-100">
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlight(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search purifiers, membranes, pumps, spare parts…"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={open}
          className="flex-1 border-none px-4 py-3 text-[15px] outline-none"
        />
        <button
          onClick={() => submit()}
          className="bg-aqua-500 px-6 text-sm font-bold text-white transition hover:bg-aqua-600"
          aria-label="Search"
        >
          Search
        </button>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-navy-50 bg-white p-2 shadow-card-hover">
          {loading && <p className="px-3 py-4 text-center text-sm text-muted">Searching…</p>}

          {!loading && query.trim().length < 2 && (
            <>
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted">
                Trending searches
              </p>
              {TRENDING.map((t) => (
                <button
                  key={t}
                  onClick={() => { setQuery(t); submit(t); }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-aqua-50"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-50">🔍</span>
                  <span className="text-sm font-medium text-navy-700">{t}</span>
                </button>
              ))}
            </>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-muted">No products found for &ldquo;{query}&rdquo;</p>
              <a
                href="https://wa.me/918969821440"
                className="mt-2 inline-block text-sm font-bold text-aqua-600 hover:underline"
              >
                WhatsApp us — we&apos;ll source it for you
              </a>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted">Products</p>
              {results.map((r, i) => (
                <Link
                  key={r.id}
                  href={`/products/${r.slug}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                    i === highlight ? 'bg-aqua-50' : 'hover:bg-aqua-50'
                  }`}
                >
                  <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-navy-50">
                    {r.url ? (
                      <Image src={r.url} alt="" fill sizes="40px" className="object-contain p-1" />
                    ) : (
                      '💧'
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-navy-700">{r.name}</span>
                    <span className="block text-xs text-muted">
                      ₹{Number(r.selling_price).toLocaleString('en-IN')}
                    </span>
                  </span>
                </Link>
              ))}
              <button
                onClick={() => submit()}
                className="mt-1 w-full rounded-lg bg-navy-50 py-2.5 text-sm font-bold text-navy-700 hover:bg-navy-100"
              >
                View all results for &ldquo;{query}&rdquo; →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
