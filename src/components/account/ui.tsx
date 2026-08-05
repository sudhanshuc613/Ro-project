/**
 * Shared building blocks for account pages.
 *
 * Extracted so every section looks identical — the fastest way for an
 * interface to look unplanned is ten pages each inventing their own empty
 * state and card padding.
 */
import Link from 'next/link';

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-700">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  ctaLabel,
  ctaHref,
  secondary,
}: {
  icon: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondary?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-navy-200 bg-white/60 px-6 py-14 text-center">
      <p className="text-4xl">{icon}</p>
      <p className="mt-3 font-display text-lg font-bold text-navy-700">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted text-pretty">{body}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-5 inline-block rounded-xl bg-cta-orange px-6 py-3 text-sm font-bold text-white shadow-cta transition hover:bg-cta-orangeDark"
        >
          {ctaLabel}
        </Link>
      )}
      {secondary && <div className="mt-3">{secondary}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = 'default',
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'good' | 'warn' | 'gold';
  href?: string;
}) {
  const tones = {
    default: 'bg-white ring-navy-100',
    good: 'bg-emerald-50 ring-emerald-200',
    warn: 'bg-amber-50 ring-amber-200',
    gold: 'bg-gold-50 ring-gold-200',
  } as const;

  const inner = (
    <div className={`rounded-2xl p-4 shadow-card ring-1 transition ${tones[tone]} ${href ? 'hover:shadow-card-hover' : ''}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="tnum mt-1.5 font-display text-2xl font-extrabold text-navy-700">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function Badge({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'gold';
}) {
  const tones = {
    slate: 'bg-navy-50 text-navy-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-800',
    red: 'bg-red-50 text-red-700',
    violet: 'bg-violet-50 text-violet-700',
    gold: 'bg-gold-50 text-gold-700',
  } as const;
  return (
    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** Maps a domain status to a badge tone in ONE place. */
export const ORDER_TONE: Record<string, 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'violet'> = {
  PENDING: 'slate', CONFIRMED: 'blue', PACKED: 'violet', SHIPPED: 'violet',
  OUT_FOR_DELIVERY: 'amber', DELIVERED: 'green', CANCELLED: 'red',
  RETURN_REQUESTED: 'amber', RETURNED: 'red', REFUNDED: 'slate',
};

export const SERVICE_TONE: Record<string, 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'violet'> = {
  NEW: 'blue', CONTACTED: 'blue', SCHEDULED: 'violet', ASSIGNED: 'violet',
  IN_PROGRESS: 'amber', ON_HOLD_PARTS: 'amber', COMPLETED: 'green',
  CANCELLED: 'slate', NO_RESPONSE: 'red',
};
