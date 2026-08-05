'use client';

/**
 * "My RO Machines" — add, edit, and see filter health.
 *
 * The health bars are the point of the page. A customer who can SEE that
 * their sediment filter is 9 months old on a 6-month cycle books a visit
 * without being sold to. That is a far better conversation than a cold
 * "sir, AMC le lijiye" call.
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { MachineHealth } from '@/server/services/machine.service';

export interface MachineRow {
  id: string;
  nickname: string | null;
  brand: string;
  model: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  installedDate: string | null;
  warrantyEndsOn: string | null;
  capacityLitres: string | null;
  purificationTech: string[];
  inletTds: number | null;
  outletTds: number | null;
  tdsCheckedOn: string | null;
  sedimentChangedOn: string | null;
  carbonChangedOn: string | null;
  membraneChangedOn: string | null;
  uvChangedOn: string | null;
  notes: string | null;
}

const BRANDS = ['Kent', 'Aquaguard', 'Livpure', 'Pureit', 'AO Smith', 'Blue Star', 'Havells', 'AquaNexa', 'Other'];
const TECHS = ['RO', 'UV', 'UF', 'TDS Controller', 'Alkaline', 'Copper', 'Mineral'];

const EMPTY: Omit<MachineRow, 'id'> & { id?: string } = {
  nickname: '', brand: '', model: '', serialNumber: '',
  purchaseDate: '', installedDate: '', warrantyEndsOn: '',
  capacityLitres: '', purificationTech: ['RO'],
  inletTds: null, outletTds: null, tdsCheckedOn: '',
  sedimentChangedOn: '', carbonChangedOn: '', membraneChangedOn: '', uvChangedOn: '',
  notes: '',
};

const STATE_STYLE = {
  ok: { bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700', word: 'Good' },
  'due-soon': { bar: 'bg-amber-500', chip: 'bg-amber-50 text-amber-800', word: 'Due soon' },
  overdue: { bar: 'bg-red-500', chip: 'bg-red-50 text-red-700', word: 'Overdue' },
  unknown: { bar: 'bg-navy-200', chip: 'bg-navy-50 text-navy-600', word: 'Not recorded' },
} as const;

function dateStr(d: string | Date | null | undefined) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

export default function MachineManager({
  machines,
  health,
}: {
  machines: MachineRow[];
  health: MachineHealth[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<(typeof EMPTY) | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const healthById = new Map(health.map((h) => [h.id, h]));

  function openNew() {
    setErrors({});
    setEditing({ ...EMPTY });
  }

  function openEdit(m: MachineRow) {
    setErrors({});
    setEditing({
      ...m,
      purchaseDate: dateStr(m.purchaseDate),
      installedDate: dateStr(m.installedDate),
      warrantyEndsOn: dateStr(m.warrantyEndsOn),
      tdsCheckedOn: dateStr(m.tdsCheckedOn),
      sedimentChangedOn: dateStr(m.sedimentChangedOn),
      carbonChangedOn: dateStr(m.carbonChangedOn),
      membraneChangedOn: dateStr(m.membraneChangedOn),
      uvChangedOn: dateStr(m.uvChangedOn),
      capacityLitres: m.capacityLitres ? String(m.capacityLitres) : '',
    });
  }

  async function save() {
    if (!editing) return;
    if (!editing.brand.trim()) {
      setErrors({ brand: ['Please choose a brand'] });
      return;
    }
    setErrors({});

    const isEdit = Boolean(editing.id);
    const payload = {
      ...editing,
      capacityLitres: editing.capacityLitres === '' ? null : Number(editing.capacityLitres),
      inletTds: editing.inletTds === null || Number.isNaN(editing.inletTds) ? null : Number(editing.inletTds),
      outletTds: editing.outletTds === null || Number.isNaN(editing.outletTds) ? null : Number(editing.outletTds),
    };

    const res = await fetch('/api/account/machines', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (data.errors) setErrors(data.errors);
      toast.error(data.message ?? 'Could not save');
      return;
    }

    toast.success(isEdit ? 'Machine updated' : 'Machine added');
    setEditing(null);
    start(() => router.refresh());
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Remove "${title}"? Your service history stays intact.`)) return;
    const res = await fetch(`/api/account/machines?id=${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Could not remove');
      return;
    }
    toast.success('Machine removed');
    start(() => router.refresh());
  }

  /** Marks a consumable as changed today — one tap after a technician visit. */
  async function markChangedToday(id: string, key: string, label: string) {
    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch('/api/account/machines', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [`${key}ChangedOn`]: today }),
    });
    if (!res.ok) {
      toast.error('Could not update');
      return;
    }
    toast.success(`${label} marked as changed today`);
    start(() => router.refresh());
  }

  const f = editing;
  const inp =
    'w-full rounded-xl border-navy-200 bg-white px-3.5 py-2.5 text-sm shadow-[inset_0_1px_2px_rgba(10,31,60,.04)] focus:border-aqua-500 focus:ring-2 focus:ring-aqua-200';

  return (
    <div className="space-y-5">
      {machines.length > 0 && (
        <div className="flex justify-end">
          <button onClick={openNew} className="rounded-xl bg-cta-orange px-5 py-2.5 text-sm font-bold text-white shadow-cta transition hover:bg-cta-orangeDark">
            + Add machine
          </button>
        </div>
      )}

      {/* ── Machine cards ── */}
      <ul className="space-y-5">
        {machines.map((m) => {
          const h = healthById.get(m.id);
          if (!h) return null;
          const scoreTone =
            h.score >= 85 ? 'text-emerald-700' : h.score >= 65 ? 'text-amber-700' : 'text-red-700';

          return (
            <li key={m.id} className="card overflow-hidden">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-navy-100 bg-sand-50 p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-navy-700">{h.title}</h3>
                    {h.warrantyActive && <span className="seal">🛡️ In warranty</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {m.brand}
                    {m.model ? ` · ${m.model}` : ''}
                    {m.purificationTech.length > 0 && ` · ${m.purificationTech.join(' + ')}`}
                    {m.capacityLitres && ` · ${m.capacityLitres}L`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`tnum font-display text-2xl font-extrabold ${scoreTone}`}>{h.score}</p>
                    <p className="text-[11px] font-semibold text-muted">{h.scoreLabel}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => openEdit(m)} className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-navy-700 ring-1 ring-navy-200 hover:bg-navy-50">
                      Edit
                    </button>
                    <button onClick={() => remove(m.id, h.title)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter health */}
              <div className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Filter health</p>
                <ul className="mt-3 space-y-3">
                  {h.dueItems.map((d) => {
                    const st = STATE_STYLE[d.state];
                    const pct =
                      d.ageMonths == null
                        ? 0
                        : Math.min(100, Math.round((d.ageMonths / d.intervalMonths) * 100));
                    return (
                      <li key={d.key}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-navy-700">
                            {d.label}
                            <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${st.chip}`}>
                              {st.word}
                            </span>
                          </span>
                          <span className="text-xs text-muted">
                            {d.ageMonths == null
                              ? `every ${d.intervalMonths} months`
                              : d.state === 'overdue'
                                ? `${d.ageMonths} months old · ${d.costRange}`
                                : `${d.ageMonths}/${d.intervalMonths} months`}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy-100">
                            <div className={`h-full rounded-full transition-all ${st.bar}`} style={{ width: `${pct}%` }} />
                          </div>
                          <button
                            onClick={() => markChangedToday(m.id, d.key, d.label)}
                            disabled={pending}
                            className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold text-aqua-700 hover:bg-aqua-50 disabled:opacity-50"
                            title="Technician just changed this"
                          >
                            Changed today
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* TDS */}
                {(h.tds.inlet != null || h.tds.outlet != null) && (
                  <div className="mt-4 rounded-xl bg-aqua-50 p-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-aqua-700">Water quality</p>
                    <p className="tnum mt-1 text-sm text-navy-700">
                      {h.tds.inlet != null && <>Inlet <strong>{h.tds.inlet} ppm</strong></>}
                      {h.tds.outlet != null && <> → Outlet <strong>{h.tds.outlet} ppm</strong></>}
                      {h.tds.removalPct != null && <> · {h.tds.removalPct}% removed</>}
                    </p>
                    {h.tds.verdict && <p className="mt-0.5 text-xs text-aqua-800">{h.tds.verdict}</p>}
                  </div>
                )}

                {/* Action */}
                {h.dueItems.some((d) => d.state === 'overdue' || d.state === 'due-soon') && (
                  <a
                    href="/#book-service"
                    className="mt-4 block rounded-xl bg-cta-green py-3 text-center text-sm font-bold text-white shadow-call transition hover:bg-cta-greenDark"
                  >
                    Book a technician for this machine
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* ── Add / edit form ── */}
      {f && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-navy-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-lift sm:rounded-2xl sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-extrabold text-navy-700">
                {f.id ? 'Edit machine' : 'Add your RO machine'}
              </h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-2 text-muted hover:bg-navy-50" aria-label="Close">
                ✕
              </button>
            </div>

            <p className="mt-1 text-sm text-muted">
              Only brand is required. The more dates you fill, the better we can warn you before a filter fails.
            </p>

            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-navy-700">Brand *</span>
                  <select value={f.brand} onChange={(e) => setEditing({ ...f, brand: e.target.value })} className={inp}>
                    <option value="">Select brand</option>
                    {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {errors.brand && <span className="mt-1 block text-xs text-red-600">{errors.brand[0]}</span>}
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-navy-700">Model</span>
                  <input value={f.model ?? ''} onChange={(e) => setEditing({ ...f, model: e.target.value })} placeholder="Grand Plus" className={inp} />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-navy-700">Nickname</span>
                  <input value={f.nickname ?? ''} onChange={(e) => setEditing({ ...f, nickname: e.target.value })} placeholder="Kitchen RO" className={inp} />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-navy-700">Capacity (litres)</span>
                  <input type="number" value={f.capacityLitres ?? ''} onChange={(e) => setEditing({ ...f, capacityLitres: e.target.value })} placeholder="8" className={inp} />
                </label>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-bold text-navy-700">Purification type</span>
                <div className="flex flex-wrap gap-2">
                  {TECHS.map((t) => {
                    const on = f.purificationTech.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setEditing({
                            ...f,
                            purificationTech: on
                              ? f.purificationTech.filter((x) => x !== t)
                              : [...f.purificationTech, t],
                          })
                        }
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          on ? 'bg-aqua-600 text-white' : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-navy-700">Installed on</span>
                  <input type="date" value={f.installedDate ?? ''} onChange={(e) => setEditing({ ...f, installedDate: e.target.value })} className={inp} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-navy-700">Purchased on</span>
                  <input type="date" value={f.purchaseDate ?? ''} onChange={(e) => setEditing({ ...f, purchaseDate: e.target.value })} className={inp} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-navy-700">Warranty till</span>
                  <input type="date" value={f.warrantyEndsOn ?? ''} onChange={(e) => setEditing({ ...f, warrantyEndsOn: e.target.value })} className={inp} />
                </label>
              </div>

              <div className="rounded-xl bg-sand-100 p-4">
                <p className="text-xs font-bold text-navy-700">Last filter changes</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Don&apos;t remember? Leave blank — we&apos;ll show it as &quot;not recorded&quot; rather than guess.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {([
                    ['sedimentChangedOn', 'Sediment filter'],
                    ['carbonChangedOn', 'Carbon filter'],
                    ['membraneChangedOn', 'RO membrane'],
                    ['uvChangedOn', 'UV lamp'],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="mb-1 block text-xs font-semibold text-navy-600">{label}</span>
                      <input
                        type="date"
                        value={(f[key] as string) ?? ''}
                        onChange={(e) => setEditing({ ...f, [key]: e.target.value })}
                        className={inp}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-aqua-50 p-4">
                <p className="text-xs font-bold text-aqua-800">TDS reading (optional)</p>
                <p className="mt-0.5 text-[11px] text-aqua-700">
                  Patna borewell water is usually 400–900 ppm. High TDS wears filters faster, so we shorten the reminder interval automatically.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-navy-600">Inlet TDS</span>
                    <input type="number" value={f.inletTds ?? ''} onChange={(e) => setEditing({ ...f, inletTds: e.target.value === '' ? null : Number(e.target.value) })} placeholder="650" className={inp} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-navy-600">Outlet TDS</span>
                    <input type="number" value={f.outletTds ?? ''} onChange={(e) => setEditing({ ...f, outletTds: e.target.value === '' ? null : Number(e.target.value) })} placeholder="90" className={inp} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-navy-600">Checked on</span>
                    <input type="date" value={f.tdsCheckedOn ?? ''} onChange={(e) => setEditing({ ...f, tdsCheckedOn: e.target.value })} className={inp} />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={save} disabled={pending} className="flex-1 rounded-xl bg-cta-orange py-3 font-bold text-white shadow-cta transition hover:bg-cta-orangeDark disabled:opacity-60">
                {f.id ? 'Save changes' : 'Add machine'}
              </button>
              <button onClick={() => setEditing(null)} className="rounded-xl bg-navy-50 px-6 py-3 font-bold text-navy-700 hover:bg-navy-100">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {machines.length === 0 && !f && (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white/60 px-6 py-14 text-center">
          <p className="text-4xl">🚰</p>
          <p className="mt-3 font-display text-lg font-bold text-navy-700">No machines added yet</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted text-pretty">
            Add your RO and we&apos;ll track when each filter is due. You&apos;ll get a reminder
            before the water starts tasting bad — not after.
          </p>
          <button onClick={openNew} className="mt-5 rounded-xl bg-cta-orange px-6 py-3 text-sm font-bold text-white shadow-cta transition hover:bg-cta-orangeDark">
            + Add your first machine
          </button>
        </div>
      )}
    </div>
  );
}
