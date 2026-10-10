'use client';

/**
 * RATE CARD MANAGER — spare parts ka rate edit karne wali table.
 *
 * Har row: part ka naam, abhi ka range, code ka default, aur edit.
 * Save karte hi `revalidateTag('settings')` chalta hai, to site par
 * agle request me hi naya rate dikhta hai.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import type { RateRow } from '@/lib/seo/rate-overrides';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function RateCardManager({ initial }: { initial: RateRow[] }) {
  const [rows, setRows] = useState<RateRow[]>(initial);
  const [edit, setEdit] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [busy, setBusy] = useState<string | null>(null);

  function open(r: RateRow) {
    setEdit(r.part);
    setDraft({ from: String(r.from), to: String(r.to) });
  }

  async function save(part: string) {
    const from = Number(draft.from);
    const to = Number(draft.to);
    if (!Number.isFinite(from) || !Number.isFinite(to) || from <= 0 || to <= 0) {
      toast.error('Dono rate 0 se bade hone chahiye');
      return;
    }
    if (to < from) {
      toast.error('Upar wala rate neeche wale se kam nahi ho sakta');
      return;
    }
    setBusy(part);
    try {
      const r = await fetch('/api/admin/rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ part, from, to }),
      });
      const d = await r.json();
      if (!r.ok) { toast.error(d.message || 'Save nahi hua'); return; }
      setRows((p) => p.map((x) => (x.part === part
        ? { ...x, from, to, isOverridden: from !== x.defaultFrom || to !== x.defaultTo }
        : x)));
      setEdit(null);
      toast.success('Rate live ho gaya');
    } catch {
      toast.error('Network problem');
    } finally {
      setBusy(null);
    }
  }

  async function reset(r: RateRow) {
    setBusy(r.part);
    try {
      const res = await fetch(`/api/admin/rates?part=${encodeURIComponent(r.part)}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Reset nahi hua'); return; }
      setRows((p) => p.map((x) => (x.part === r.part
        ? { ...x, from: x.defaultFrom, to: x.defaultTo, isOverridden: false }
        : x)));
      toast.success('Purana rate wapas');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-navy-900 text-white">
            <th scope="col" className="px-4 py-3 font-bold">Part</th>
            <th scope="col" className="px-4 py-3 font-bold">Abhi ka rate</th>
            <th scope="col" className="px-4 py-3 font-bold">Rate kis se badalta hai</th>
            <th scope="col" className="px-4 py-3 font-bold">Edit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.part} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
              <th scope="row" className="px-4 py-3 align-top font-bold text-navy-900">
                {r.part}
                {r.isOverridden && (
                  <span className="ml-2 rounded-full bg-aqua-100 px-2 py-0.5 text-[10px] font-bold text-aqua-800">
                    badla
                  </span>
                )}
              </th>

              <td className="px-4 py-3 align-top">
                {edit === r.part ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted">₹</span>
                    <input
                      type="number" min={1} value={draft.from}
                      onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
                      className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                      aria-label={`${r.part} neeche ka rate`}
                    />
                    <span className="text-muted">&ndash; ₹</span>
                    <input
                      type="number" min={1} value={draft.to}
                      onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
                      className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                      aria-label={`${r.part} upar ka rate`}
                    />
                  </div>
                ) : (
                  <>
                    <span className="font-black text-amber-700">{inr(r.from)} &ndash; {inr(r.to)}</span>
                    {r.isOverridden && (
                      <span className="block text-[11px] text-muted">
                        pehle: {inr(r.defaultFrom)} &ndash; {inr(r.defaultTo)}
                      </span>
                    )}
                  </>
                )}
              </td>

              <td className="px-4 py-3 align-top text-navy-700">{r.depends}</td>

              <td className="px-4 py-3 align-top">
                {edit === r.part ? (
                  <div className="flex gap-2">
                    <button
                      type="button" disabled={busy === r.part} onClick={() => save(r.part)}
                      className="rounded-lg bg-cta-green px-3 py-1.5 text-xs font-bold text-white hover:bg-cta-greenDark disabled:opacity-50"
                    >
                      {busy === r.part ? '...' : 'Save'}
                    </button>
                    <button
                      type="button" onClick={() => setEdit(null)}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-navy-700 ring-1 ring-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button" onClick={() => open(r)}
                      className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-navy-800"
                    >
                      Badlo
                    </button>
                    {r.isOverridden && (
                      <button
                        type="button" disabled={busy === r.part} onClick={() => reset(r)}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-navy-700 ring-1 ring-slate-300 disabled:opacity-50"
                      >
                        Purana
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
