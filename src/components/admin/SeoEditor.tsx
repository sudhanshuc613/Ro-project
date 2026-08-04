'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export interface SeoEntry {
  key: string;
  entityType: 'PRODUCT' | 'CATEGORY' | 'STATIC_PAGE';
  entityId: string | null;
  path: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  robotsIndex: boolean;
  isSet: boolean;
}

interface Props {
  staticPages: SeoEntry[];
  products: SeoEntry[];
  categories: SeoEntry[];
}

const TABS = [
  { id: 'static', label: 'Pages' },
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
] as const;

export default function SeoEditor({ staticPages, products, categories }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('static');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const source = tab === 'static' ? staticPages : tab === 'products' ? products : categories;
  const list = source.filter(
    (e) =>
      e.label.toLowerCase().includes(search.toLowerCase()) ||
      e.path.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = t.id === 'static' ? staticPages.length : t.id === 'products' ? products.length : categories.length;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setOpen(null); }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === t.id ? 'bg-navy-700 text-white' : 'bg-slate-50 text-navy-700 hover:bg-slate-100'
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or URL…"
        className="mt-4 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100"
      />

      <div className="mt-4 space-y-2">
        {list.length === 0 && <p className="py-8 text-center text-sm text-muted">No matches.</p>}
        {list.map((entry) => (
          <SeoRow
            key={entry.key}
            entry={entry}
            isOpen={open === entry.key}
            onToggle={() => setOpen(open === entry.key ? null : entry.key)}
          />
        ))}
      </div>
    </div>
  );
}

function SeoRow({ entry, isOpen, onToggle }: { entry: SeoEntry; isOpen: boolean; onToggle: () => void }) {
  const [title, setTitle] = useState(entry.metaTitle);
  const [desc, setDesc] = useState(entry.metaDescription);
  const [keywords, setKeywords] = useState(entry.metaKeywords);
  const [robots, setRobots] = useState(entry.robotsIndex);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(entry.isSet);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: entry.entityType,
          entityId: entry.entityId,
          path: entry.path,
          metaTitle: title,
          metaDescription: desc,
          metaKeywords: keywords,
          robotsIndex: robots,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Save failed');
      setSaved(true);
      toast.success('SEO updated', { description: entry.label });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  const titleTone = title.length === 0 ? 'text-muted' : title.length <= 60 ? 'text-emerald-600' : 'text-red-600';
  const descTone = desc.length === 0 ? 'text-muted' : desc.length <= 155 ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className={`overflow-hidden rounded-xl border ${isOpen ? 'border-aqua-300' : 'border-slate-200'}`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3.5 text-left transition hover:bg-slate-50"
      >
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${saved ? 'bg-emerald-500' : 'bg-amber-400'}`} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-navy-700">{entry.label}</span>
          <span className="block truncate text-xs text-muted">{entry.path}</span>
        </span>
        {!saved && (
          <span className="shrink-0 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            NOT SET
          </span>
        )}
        <span className={`shrink-0 text-lg text-aqua-500 transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-slate-100 p-4">
          {/* Google preview */}
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted">Google preview</p>
            <p className="truncate text-[15px] text-[#1a0dab]">{title || entry.label}</p>
            <p className="truncate text-xs text-[#006621]">rokadoctor.in{entry.path}</p>
            <p className="line-clamp-2 text-[13px] text-[#545454]">
              {desc || 'No description set — Google will pick text from the page.'}
            </p>
          </div>

          <label className="block">
            <span className="mb-1 flex items-center justify-between text-sm font-semibold text-navy-700">
              Meta Title
              <span className={`text-xs font-bold ${titleTone}`}>{title.length} / 60</span>
            </span>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
              placeholder="RO Service in Patna — ₹100 Visit"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 flex items-center justify-between text-sm font-semibold text-navy-700">
              Meta Description
              <span className={`text-xs font-bold ${descTone}`}>{desc.length} / 155</span>
            </span>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => { setDesc(e.target.value); setSaved(false); }}
              placeholder="Expert RO repair in Patna at ₹100 visit charge. All brands, same-day service."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-navy-700">Keywords (comma separated)</span>
            <input
              value={keywords}
              onChange={(e) => { setKeywords(e.target.value); setSaved(false); }}
              placeholder="RO service Patna, water purifier repair, RO technician"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100"
            />
          </label>

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={robots}
              onChange={(e) => { setRobots(e.target.checked); setSaved(false); }}
              className="h-4 w-4 rounded border-slate-300 text-aqua-500 focus:ring-aqua-400"
            />
            <span className="text-sm text-navy-700">
              Allow Google to index this page
              <span className="ml-1 text-xs text-muted">(uncheck to hide from search)</span>
            </span>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-aqua-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-aqua-600 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save SEO'}
            </button>
            <a
              href={entry.path}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-bold text-navy-700 hover:bg-slate-50"
            >
              View page ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
