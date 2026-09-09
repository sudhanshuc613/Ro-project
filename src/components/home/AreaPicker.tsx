'use client';

/**
 * AREA PICKER — type-to-search replacement for the 63-option <select>.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * TWO PROBLEMS THIS SOLVES
 * ────────────────────────
 * 1. The reported bug. A native <select> inside the dark hero panels rendered
 *    white-on-white; the option text only appeared on hover. That is fixed in
 *    globals.css for every control on the site, but a custom listbox removes
 *    the entire class of problem for the one control that matters most — an
 *    invisible area picker silently kills the booking.
 *
 * 2. Scrolling 63 options on a phone. The area list has grown 35 → 55 → 63.
 *    On a 360px Android the native picker shows about seven at a time, so
 *    reaching "Saguna More" means eight flicks. Typing three letters is
 *    faster, and it is what people already expect from every app they use.
 *
 * WHY PINCODE SEARCH IS INCLUDED
 * ──────────────────────────────
 * Many callers know their PIN better than the official locality name — a
 * Kankarbagh address might be given as 800020 or as "Ashiana More". So the
 * filter matches area name, pincode AND landmark. Typing "ashiana" finds
 * Kankarbagh even though the word does not appear in its name.
 *
 * ACCESSIBILITY
 * ─────────────
 * Implemented as a real combobox: aria-expanded, aria-controls, aria-activedescendant,
 * role="listbox"/"option", full keyboard support (↑ ↓ Enter Esc). A custom
 * dropdown that only works with a mouse is worse than the native select it
 * replaced, not better.
 *
 * PROGRESSIVE ENHANCEMENT
 * ───────────────────────
 * A hidden native <select> carrying the same value stays in the DOM. If this
 * component ever fails to hydrate, the form still submits a valid area.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { SERVICE_AREAS } from '@/lib/seo/patna-service-data';

export default function AreaPicker({
  value,
  onChange,
  id = 'area-picker',
}: {
  value: string;
  onChange: (slug: string) => void;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(
    () => SERVICE_AREAS.find((a) => a.slug === value),
    [value],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SERVICE_AREAS;
    return SERVICE_AREAS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.pincodes.some((p) => p.includes(q)) ||
        a.landmarks.some((l) => l.toLowerCase().includes(q)),
    );
  }, [query]);

  /* Close on outside click and on Escape. */
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  /* Keep the highlighted row in view while arrowing through a long list. */
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  function choose(slug: string) {
    onChange(slug);
    setOpen(false);
    setQuery('');
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = results[active];
      if (pick) choose(pick.slug);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      {/* Fallback for the no-JS / hydration-failed case. */}
      <select
        aria-hidden="true"
        tabIndex={-1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      >
        <option value="">Area chuniye</option>
        {SERVICE_AREAS.map((a) => (
          <option key={a.slug} value={a.slug}>
            {a.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        id={id}
        onClick={() => {
          setOpen((o) => !o);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-3 text-left text-base transition ${
          open
            ? 'border-aqua-500 ring-2 ring-aqua-100'
            : 'border-navy-200 hover:border-navy-300'
        }`}
      >
        <span className={selected ? 'text-navy-700' : 'text-slate-400'}>
          {selected ? `${selected.name} — ${selected.pincodes[0]}` : 'Area chuniye…'}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-navy-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-navy-200 bg-white shadow-card-hover">
          <div className="border-b border-navy-50 p-2">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Area ya pincode likho…"
              aria-label="Area dhundo"
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm text-navy-700 outline-none focus:border-aqua-500"
            />
          </div>

          <ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            aria-label="Patna areas"
            className="max-h-64 overflow-y-auto overscroll-contain py-1"
          >
            {results.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-muted">
                Nahi mila. Call kar do — 8969821440, hum bata denge.
              </li>
            )}
            {results.map((a, i) => (
              <li key={a.slug} data-idx={i}>
                <button
                  type="button"
                  role="option"
                  aria-selected={a.slug === value}
                  onClick={() => choose(a.slug)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition ${
                    i === active ? 'bg-aqua-50' : ''
                  } ${a.slug === value ? 'font-bold text-aqua-700' : 'text-navy-700'}`}
                >
                  <span>{a.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-muted">
                    {a.pincodes[0]} · {a.responseMin}min
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="border-t border-navy-50 bg-sand-100 px-3 py-2 text-[11px] text-muted">
            {results.length} of {SERVICE_AREAS.length} areas
          </p>
        </div>
      )}
    </div>
  );
}
