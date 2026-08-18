'use client';

/**
 * CompetitorWatch — live ranking + competitor intelligence, run on demand.
 *
 * Answers four questions in one screen:
 *   1. Where do we rank right now?
 *   2. Who is above us?
 *   3. Who is running ads on our keywords?
 *   4. What should I do next, in priority order?
 *
 * The tool is honest about its limits — the source is DuckDuckGo, not Google,
 * and that caveat is printed on the screen rather than buried in a doc.
 */
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SerpRow { position: number; domain: string; url: string; title: string }
interface KeywordResult {
  keyword: string; group: string; weight: number;
  ourPosition: number | null; previousPosition?: number | null;
  results: SerpRow[]; adsDetected: string[]; error?: string;
}
interface Audit {
  domain: string; url: string; reachable: boolean; httpStatus?: number;
  title?: string; titleLength?: number; h1?: string; wordCount?: number;
  schemaTypes: string[]; schemaCount: number; internalLinks?: number;
  hasPhone: boolean; hasWhatsApp: boolean; loadMs?: number; error?: string;
}
interface Rec {
  priority: 'critical' | 'high' | 'medium';
  title: string; why: string; action: string; effort: string;
}
interface RunData {
  ranAt: string;
  summary: {
    checked: number; ranked: number; top3: number; top10: number;
    notRanked: number; avgPosition: number | null;
    blocked?: number; usable?: boolean;
  };
  results: KeywordResult[];
  ourAudit?: Audit;
  competitorAudits: Audit[];
  recommendations: Rec[];
}

export default function CompetitorWatch() {
  const [groups, setGroups] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [data, setData] = useState<RunData | null>(null);
  const [tab, setTab] = useState<'todo' | 'ranks' | 'competitors'>('todo');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetch('/api/admin/rank-check')
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.groups)) setGroups(d.groups); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  async function run() {
    setRunning(true);
    setElapsed(0);
    try {
      const res = await fetch('/api/admin/rank-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups: selected.length ? selected : undefined }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.message ?? 'Check fail ho gaya'); return; }
      setData(d);
      setTab('todo');
      toast.success(`${d.summary.checked} keyword check ho gaye`);
    } catch {
      toast.error('Network error');
    } finally {
      setRunning(false);
    }
  }

  const est = selected.length
    ? selected.length * 5
    : 40;

  return (
    <div className="space-y-5">
      {/* ── Controls ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-navy-700">Live rank check</h2>
            <p className="mt-0.5 text-sm text-muted">
              Abhi ke abhi dekho hum kahan hain, upar kaun hai, aur kya karna hai.
            </p>
          </div>
          <button
            onClick={run}
            disabled={running}
            className="rounded-xl bg-aqua-500 px-6 py-3 font-bold text-white transition hover:bg-aqua-600 disabled:opacity-60"
          >
            {running ? `Check ho raha hai… ${elapsed}s` : '🔍 Check karo'}
          </button>
        </div>

        {groups.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
              Kaunse keywords (kuch nahi chunoge to sab)
            </p>
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => {
                const on = selected.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelected((s) => (on ? s.filter((x) => x !== g) : [...s, g]))}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      on ? 'bg-aqua-500 text-white' : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted">
              Andaaza ~{est} second. Har search ke beech 1 second ka gap rakhna padta hai warna block ho jaate hain.
            </p>
          </div>
        )}

        {running && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-aqua-500 transition-all duration-1000"
              style={{ width: `${Math.min(95, (elapsed / est) * 100)}%` }}
            />
          </div>
        )}

        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-100">
          <strong>Imaandari se:</strong> ye DuckDuckGo se data leta hai, Google se nahi — Google ka
          result har user ki location aur history se badalta hai, use scrape karna na possible hai na
          allowed. Position ko ishaara samjho, patthar ki lakeer nahi. Competitor audit wala hissa
          100% sahi hai — wo unka asli page padhta hai.
        </p>
      </div>

      {data && (
        <>
          {/*
            A rate-limited scrape returns zero results for every keyword, which
            looks identical to "we lost every ranking". Say so out loud rather
            than letting the admin panic over a fake crash.
          */}
          {data.summary.usable === false && (
            <div className="rounded-xl bg-red-50 p-4 ring-1 ring-red-100">
              <p className="font-bold text-red-700">
                ⚠ Ye result bharosemand nahi hai — search engine ne block kar diya
              </p>
              <p className="mt-1 text-sm text-red-700">
                {data.summary.blocked ?? 0} me se {data.summary.checked} keyword rate-limit ho gaye.
                Iska matlab ye <strong>NAHI</strong> hai ki ranking gir gayi — ye scraper block hone
                ka signal hai. History me ye run save nahi kiya gaya.
                <br />
                <strong>Kya karo:</strong> 10-15 minute ruk ke dobara try karo, ya ek waqt me sirf
                ek group chunno.
              </p>
            </div>
          )}
          {data.summary.usable !== false && (data.summary.blocked ?? 0) > 0 && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-100">
              {data.summary.blocked} keyword block ho gaye the — unka result adhoora hai. Baaki sahi hai.
            </p>
          )}

          {/* ── Summary ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Check kiye" value={data.summary.checked} />
            <Stat label="Rank kar rahe" value={data.summary.ranked} tone="good" />
            <Stat label="Top 3 me" value={data.summary.top3} tone="good" />
            <Stat label="Kahin nahi" value={data.summary.notRanked} tone={data.summary.notRanked > 0 ? 'bad' : 'good'} />
            <Stat label="Average position" value={data.summary.avgPosition ?? '—'} />
          </div>

          {/* ── Tabs ── */}
          <div className="flex flex-wrap gap-2">
            {([
              ['todo', `🎯 Kya karna hai (${data.recommendations.length})`],
              ['ranks', `📊 Rankings (${data.results.length})`],
              ['competitors', `🔬 Competitor audit (${data.competitorAudits.length})`],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  tab === k ? 'bg-navy-700 text-white' : 'bg-white text-navy-700 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── TODO ── */}
          {tab === 'todo' && (
            <div className="space-y-3">
              {data.recommendations.length === 0 && (
                <p className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                  Koi urgent kaam nahi mila. Rankings theek chal rahi hain.
                </p>
              )}
              {data.recommendations.map((r, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-4 ring-1 ${
                    r.priority === 'critical' ? 'bg-red-50 ring-red-100'
                      : r.priority === 'high' ? 'bg-amber-50 ring-amber-100'
                      : 'bg-slate-50 ring-slate-100'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-bold text-navy-700">
                      {r.priority === 'critical' ? '🔴' : r.priority === 'high' ? '🟡' : '⚪'} {r.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-navy-600 ring-1 ring-slate-200">
                      {r.effort}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{r.why}</p>
                  <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-sm font-semibold text-navy-700">
                    ➜ {r.action}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── RANKS ── */}
          {tab === 'ranks' && (
            <div className="space-y-2.5">
              {data.results.map((r) => {
                const moved =
                  r.ourPosition != null && r.previousPosition != null
                    ? r.previousPosition - r.ourPosition
                    : null;
                return (
                  <details key={r.keyword} className="rounded-xl border border-slate-200 bg-white p-4">
                    <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 list-none">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-navy-700">{r.keyword}</p>
                        <p className="text-xs text-muted">{r.group} · weight {r.weight}/10</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {moved != null && moved !== 0 && (
                          <span className={`text-xs font-bold ${moved > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {moved > 0 ? `▲ ${moved}` : `▼ ${Math.abs(moved)}`}
                          </span>
                        )}
                        <span
                          className={`rounded-lg px-3 py-1 text-sm font-bold ${
                            r.ourPosition == null ? 'bg-red-100 text-red-700'
                              : r.ourPosition <= 3 ? 'bg-emerald-100 text-emerald-700'
                              : r.ourPosition <= 10 ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.ourPosition == null ? 'Nahi mile' : `#${r.ourPosition}`}
                        </span>
                      </div>
                    </summary>

                    {r.error && <p className="mt-2 text-xs text-red-600">Error: {r.error}</p>}

                    {r.adsDetected.length > 0 && (
                      <p className="mt-2 rounded-lg bg-purple-50 px-3 py-2 text-xs text-purple-800">
                        💸 Ad dikhe: {r.adsDetected.join(', ')}
                      </p>
                    )}

                    <ol className="mt-3 space-y-1">
                      {r.results.map((row) => (
                        <li
                          key={row.position}
                          className={`flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-sm ${
                            row.domain.includes('rokadoctor') ? 'bg-aqua-50 font-bold text-aqua-800' : 'text-navy-600'
                          }`}
                        >
                          <span className="w-6 shrink-0 text-muted">{row.position}.</span>
                          <span className="min-w-0 flex-1 truncate">
                            {row.domain}
                            {row.domain.includes('rokadoctor') && ' ← AAP'}
                          </span>
                        </li>
                      ))}
                      {r.results.length === 0 && (
                        <li className="text-sm text-muted">Koi result nahi mila (shayad block ho gaye — thodi der baad try karo)</li>
                      )}
                    </ol>
                  </details>
                );
              })}
            </div>
          )}

          {/* ── COMPETITORS ── */}
          {tab === 'competitors' && (
            <div className="space-y-3">
              {data.ourAudit && <AuditCard audit={data.ourAudit} isUs />}
              {data.competitorAudits.map((a) => (
                <AuditCard key={a.url} audit={a} compareTo={data.ourAudit} />
              ))}
            </div>
          )}

          <p className="text-center text-xs text-muted">
            Check kiya: {new Date(data.ranAt).toLocaleString('en-IN')}
          </p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: 'good' | 'bad' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`font-display text-2xl font-bold ${
          tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-red-600' : 'text-navy-700'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function AuditCard({ audit, isUs, compareTo }: { audit: Audit; isUs?: boolean; compareTo?: Audit }) {
  if (!audit.reachable) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="font-bold text-navy-700">{audit.domain}</p>
        <p className="mt-1 text-sm text-red-600">
          Khul nahi paya {audit.httpStatus ? `(HTTP ${audit.httpStatus})` : ''} {audit.error ?? ''}
        </p>
      </div>
    );
  }

  const rows: { k: string; v: string | number; better?: boolean }[] = [
    { k: 'Words', v: audit.wordCount ?? 0, better: compareTo ? (audit.wordCount ?? 0) > (compareTo.wordCount ?? 0) : undefined },
    { k: 'Schema blocks', v: audit.schemaCount, better: compareTo ? audit.schemaCount > compareTo.schemaCount : undefined },
    { k: 'Internal links', v: audit.internalLinks ?? 0, better: compareTo ? (audit.internalLinks ?? 0) > (compareTo.internalLinks ?? 0) : undefined },
    { k: 'Title length', v: `${audit.titleLength ?? 0} chars` },
    { k: 'Load time', v: `${audit.loadMs ?? 0} ms` },
    { k: 'Phone link', v: audit.hasPhone ? 'Haan' : 'Nahi' },
    { k: 'WhatsApp', v: audit.hasWhatsApp ? 'Haan' : 'Nahi' },
  ];

  return (
    <div className={`rounded-xl border p-4 ${isUs ? 'border-aqua-200 bg-aqua-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-navy-700">
          {isUs ? '🏠 ' : ''}{audit.domain}{isUs ? ' (aap)' : ''}
        </p>
        <a href={audit.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-aqua-600 hover:underline">
          Page kholo ↗
        </a>
      </div>

      {audit.title && (
        <p className="mt-1.5 truncate text-sm text-navy-600" title={audit.title}>
          <span className="font-semibold">Title:</span> {audit.title}
        </p>
      )}
      <p className="mt-0.5 truncate text-sm text-navy-600">
        <span className="font-semibold">H1:</span> {audit.h1}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {rows.map((r) => (
          <div key={r.k} className="rounded-lg bg-white/70 px-2.5 py-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{r.k}</p>
            <p className={`text-sm font-bold ${r.better === true ? 'text-red-600' : r.better === false ? 'text-emerald-600' : 'text-navy-700'}`}>
              {r.v}
              {r.better === true && ' ⚠'}
            </p>
          </div>
        ))}
      </div>

      {audit.schemaTypes.length > 0 && (
        <p className="mt-2.5 text-xs text-muted">
          <span className="font-bold">Schema:</span> {audit.schemaTypes.slice(0, 10).join(', ')}
        </p>
      )}
    </div>
  );
}
