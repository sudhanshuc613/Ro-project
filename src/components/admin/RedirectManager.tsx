'use client';

/**
 * RedirectManager — map a dead URL to a live one without a code deploy.
 *
 * Why this matters: a 404 on a URL Google has already indexed throws away
 * every bit of ranking that URL earned. A 301 hands that ranking to the new
 * page instead. Product renames now write a redirect automatically; this
 * panel is for everything else — old marketing links, typos in a printed
 * card, pages that moved.
 */
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Row { id: string; fromPath: string; toPath: string; statusCode: number; hitCount: number }

export default function RedirectManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/admin/redirects');
      const d = await res.json();
      setRows(d.redirects ?? []);
    } catch { /* leave list empty */ } finally {
      setLoaded(true);
    }
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    if (!from.trim() || !to.trim()) { toast.error('Dono path bharo'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromPath: from, toPath: to, statusCode: 301 }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.message ?? 'Save fail'); return; }
      toast.success('Redirect lag gaya');
      setFrom(''); setTo('');
      void load();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(fromPath: string) {
    try {
      const res = await fetch(`/api/admin/redirects?from=${encodeURIComponent(fromPath)}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Delete fail'); return; }
      toast.success('Hata diya');
      void load();
    } catch { toast.error('Network error'); }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-display text-lg font-bold text-navy-700">URL Redirects</h2>
      <p className="mt-0.5 text-sm text-muted">
        Purana URL 404 de raha hai? Yahan naye pe bhej do. Google ki ranking bach jayegi.
        Product ka naam badalne pe redirect apne aap ban jata hai.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr,1fr,auto]">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Purana path</span>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="/products/purana-naam"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Naya path</span>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="/products/naya-naam"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100"
          />
        </label>
        <button
          onClick={save}
          disabled={saving}
          className="self-end rounded-lg bg-aqua-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-aqua-600 disabled:opacity-60"
        >
          {saving ? 'Lag raha…' : '+ Jodo'}
        </button>
      </div>

      {loaded && rows.length === 0 && (
        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-3 text-sm text-muted">
          Abhi koi redirect nahi hai.
        </p>
      )}

      {rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-3 py-2 font-bold text-navy-700">Purana</th>
                <th className="px-3 py-2 font-bold text-navy-700">Naya</th>
                <th className="px-3 py-2 font-bold text-navy-700">Code</th>
                <th className="px-3 py-2 font-bold text-navy-700">Hits</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs text-navy-700">{r.fromPath}</td>
                  <td className="px-3 py-2 font-mono text-xs text-aqua-700">{r.toPath}</td>
                  <td className="px-3 py-2 text-muted">{r.statusCode}</td>
                  <td className="px-3 py-2 text-muted">{r.hitCount}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => remove(r.fromPath)}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Hatao
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
