import Link from 'next/link';

const TONES = {
  green:  'bg-emerald-50 text-emerald-700 ring-emerald-100',
  aqua:   'bg-aqua-50 text-aqua-700 ring-aqua-100',
  orange: 'bg-orange-50 text-orange-700 ring-orange-100',
  navy:   'bg-navy-50 text-navy-700 ring-navy-100',
  red:    'bg-red-50 text-red-700 ring-red-100',
} as const;

interface Props {
  label: string;
  value: string;
  sub?: string;
  delta?: number;
  icon: string;
  tone?: keyof typeof TONES;
  href?: string;
  compact?: boolean;
}

export default function StatCard({
  label, value, sub, delta, icon, tone = 'aqua', href, compact = false,
}: Props) {
  const body = (
    <div
      className={`rounded-2xl border border-slate-200 bg-white ${compact ? 'p-4' : 'p-5'} transition ${
        href ? 'hover:border-aqua-200 hover:shadow-card' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className={`mt-1.5 font-display font-extrabold text-navy-700 ${compact ? 'text-xl' : 'text-2xl'}`}>
            {value}
          </p>
          {sub && <p className="mt-1 truncate text-xs text-muted">{sub}</p>}
        </div>
        <span className={`grid shrink-0 place-items-center rounded-xl text-lg ring-1 ${TONES[tone]} ${compact ? 'h-9 w-9' : 'h-11 w-11'}`}>
          {icon}
        </span>
      </div>

      {typeof delta === 'number' && (
        <p className={`mt-2.5 flex items-center gap-1 text-xs font-bold ${delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
          <span className="font-normal text-muted">vs previous period</span>
        </p>
      )}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
