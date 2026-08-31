'use client';

/**
 * CommandPalette — Ctrl+K anywhere in the admin.
 *
 * The admin has 19 pages. Reaching "Service Due" today means: find the
 * sidebar, scan a list of 19 labels, click. That is three seconds and a small
 * amount of attention, every single time. A command palette collapses it to
 * two keystrokes, which is why Linear, Notion, Vercel, GitHub and Stripe all
 * ship one.
 *
 * What it does here:
 *  • Fuzzy-matches every admin page plus a set of direct actions.
 *  • Searches live data — type a phone number or customer name and it finds
 *    the customer; type an order number and it finds the order.
 *  • Full keyboard control: ↑ ↓ to move, Enter to run, Esc to close.
 *
 * The live search is debounced at 220ms and only fires for queries of two
 * characters or more, so typing does not hammer the database.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  icon: string;
  group: string;
  run: () => void;
}

interface SearchHit {
  type: 'customer' | 'order' | 'product' | 'service';
  id: string;
  title: string;
  subtitle: string;
  href: string;
  phone?: string;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* ── Static commands ── */
  const commands: Cmd[] = useMemo(() => {
    const go = (href: string) => () => { setOpen(false); router.push(href); };
    return [
      // Most-used first — the palette shows these when the query is empty.
      { id: 'new-service', label: 'Service queue kholo', hint: 'Pending requests', icon: '🔧', group: 'Roz ka kaam', run: go('/admin/service-requests') },
      { id: 'new-product', label: 'Naya product add karo', icon: '➕', group: 'Roz ka kaam', run: go('/admin/products/new') },
      { id: 'orders', label: 'Orders dekho', icon: '🛒', group: 'Roz ka kaam', run: go('/admin/orders') },
      { id: 'due', label: 'Service due list', hint: 'Filter change wale customers', icon: '⏰', group: 'Roz ka kaam', run: go('/admin/service-due') },
      { id: 'competitors', label: 'Competitor check chalao', icon: '🎯', group: 'Growth', run: go('/admin/competitors') },
      { id: 'seo', label: 'SEO Manager', icon: '🔍', group: 'Growth', run: go('/admin/seo') },
      { id: 'carts', label: 'Chhode hue cart', icon: '🛍️', group: 'Growth', run: go('/admin/abandoned-carts') },
      { id: 'dashboard', label: 'Dashboard', icon: '📊', group: 'Pages', run: go('/admin') },
      { id: 'products', label: 'Saare products', icon: '📦', group: 'Pages', run: go('/admin/products') },
      { id: 'inventory', label: 'Inventory / stock', icon: '🏷️', group: 'Pages', run: go('/admin/inventory') },
      { id: 'customers', label: 'Customers', icon: '👥', group: 'Pages', run: go('/admin/customers') },
      { id: 'technicians', label: 'Technicians', icon: '👷', group: 'Pages', run: go('/admin/technicians') },
      { id: 'amc', label: 'AMC contracts', icon: '📋', group: 'Pages', run: go('/admin/amc') },
      { id: 'categories', label: 'Categories', icon: '🗂️', group: 'Pages', run: go('/admin/categories') },
      { id: 'media', label: 'Media library', icon: '🖼️', group: 'Pages', run: go('/admin/media') },
      { id: 'settings', label: 'Settings', icon: '⚙️', group: 'Pages', run: go('/admin/settings') },
      { id: 'security', label: 'Password badlo', icon: '🔐', group: 'Pages', run: go('/admin/security') },
      { id: 'site', label: 'Website kholo', hint: 'Naya tab', icon: '🌐', group: 'Shortcut', run: () => { setOpen(false); window.open('/', '_blank'); } },
    ];
  }, [router]);

  /* ── Open / close ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ('');
      setCursor(0);
      setHits([]);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  /* ── Live data search ── */
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(term)}`);
        if (res.ok) {
          const d = await res.json();
          setHits(d.hits ?? []);
        }
      } catch { /* keep static results usable */ } finally {
        setSearching(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  /* ── Filter + flatten ── */
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return commands;
    return commands.filter((c) =>
      c.label.toLowerCase().includes(term) ||
      c.group.toLowerCase().includes(term) ||
      (c.hint?.toLowerCase().includes(term) ?? false),
    );
  }, [q, commands]);

  const rows = useMemo(
    () => [
      ...hits.map((h) => ({ kind: 'hit' as const, hit: h })),
      ...filtered.map((c) => ({ kind: 'cmd' as const, cmd: c })),
    ],
    [hits, filtered],
  );

  const runRow = useCallback((i: number) => {
    const row = rows[i];
    if (!row) return;
    if (row.kind === 'cmd') row.cmd.run();
    else { setOpen(false); router.push(row.hit.href); }
  }, [rows, router]);

  useEffect(() => { setCursor(0); }, [q, hits.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, rows.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
      if (e.key === 'Enter') { e.preventDefault(); runRow(cursor); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, rows.length, cursor, runRow]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${cursor}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-xl border border-navy-100 bg-white px-3 py-2 text-sm text-muted transition hover:border-navy-200 md:flex"
        aria-label="Search — Ctrl+K"
      >
        <span aria-hidden="true">🔍</span>
        <span>Search…</span>
        <kbd className="ml-2 rounded border border-navy-100 bg-sand-200 px-1.5 py-0.5 font-mono text-[10px] text-navy-600">
          Ctrl K
        </kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-navy-900/50 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="anim-scale-in w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-navy-50 px-4">
          <span className="text-lg text-muted" aria-hidden="true">🔍</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Page, customer, order, phone number…"
            className="flex-1 bg-transparent py-4 text-base outline-none placeholder:text-slate-400"
            aria-label="Search"
          />
          {searching && <span className="text-xs text-muted">…</span>}
          <kbd className="rounded border border-navy-100 bg-sand-200 px-1.5 py-0.5 font-mono text-[10px] text-navy-600">
            Esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-1">
          {rows.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Kuch nahi mila
            </p>
          )}

          {hits.length > 0 && (
            <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-muted">
              Database me mila
            </p>
          )}

          {rows.map((row, i) => {
            const active = i === cursor;
            if (row.kind === 'hit') {
              const h = row.hit;
              return (
                <button
                  key={`h-${h.type}-${h.id}`}
                  data-idx={i}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => runRow(i)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${active ? 'bg-aqua-50' : 'hover:bg-slate-50'}`}
                >
                  <span className="text-base" aria-hidden="true">
                    {h.type === 'customer' ? '👤' : h.type === 'order' ? '🛒' : h.type === 'service' ? '🔧' : '📦'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-navy-700">{h.title}</span>
                    <span className="block truncate text-xs text-muted">{h.subtitle}</span>
                  </span>
                  {h.phone && (
                    <a
                      href={`tel:${h.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 rounded-lg bg-cta-green px-2 py-1 text-[11px] font-bold text-white"
                    >
                      📞
                    </a>
                  )}
                </button>
              );
            }

            const c = row.cmd;
            const prev = rows[i - 1];
            const showGroup = !prev || prev.kind !== 'cmd' || prev.cmd.group !== c.group;
            return (
              <div key={c.id}>
                {showGroup && (
                  <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wide text-muted">
                    {c.group}
                  </p>
                )}
                <button
                  data-idx={i}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => runRow(i)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${active ? 'bg-aqua-50' : 'hover:bg-slate-50'}`}
                >
                  <span className="text-base" aria-hidden="true">{c.icon}</span>
                  <span className="flex-1 text-sm font-semibold text-navy-700">{c.label}</span>
                  {c.hint && <span className="text-xs text-muted">{c.hint}</span>}
                  {active && <span className="text-xs text-aqua-600">↵</span>}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-navy-50 bg-sand-100 px-4 py-2 text-[11px] text-muted">
          <span><kbd className="font-mono">↑↓</kbd> chuno</span>
          <span><kbd className="font-mono">↵</kbd> kholo</span>
          <span><kbd className="font-mono">Esc</kbd> band</span>
        </div>
      </div>
    </div>
  );
}
