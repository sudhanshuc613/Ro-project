/**
 * ActionCenter — "what needs me right now", at the top of the dashboard.
 *
 * The old dashboard answered "how is the business doing". That is useful once
 * a week. What the owner actually needs on opening the panel is the far
 * narrower question: is anything sitting here losing me money?
 *
 * Each row is a real condition checked against live data, sorted so the most
 * expensive problem is first. When nothing is wrong the component says so in
 * one line rather than showing an empty container.
 *
 * Server component — no client JS at all.
 */
import Link from 'next/link';

export interface ActionItem {
  severity: 'critical' | 'warn' | 'info';
  icon: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
}

export default function ActionCenter({ items }: { items: ActionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-display text-base font-bold text-emerald-800">
          ✅ Sab control me hai
        </p>
        <p className="mt-1 text-sm text-emerald-700">
          Koi pending service request nahi, stock theek hai, koi order atka hua nahi.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-navy-700">
          🎯 Abhi dhyan do
        </h2>
        <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-bold text-navy-700">
          {items.length}
        </span>
      </div>

      <ul className="space-y-2">
        {items.map((it, i) => (
          <li
            key={`${it.title}-${i}`}
            className={`flex flex-wrap items-center gap-3 rounded-xl p-3 ring-1 ${
              it.severity === 'critical'
                ? 'bg-red-50 ring-red-100'
                : it.severity === 'warn'
                  ? 'bg-amber-50 ring-amber-100'
                  : 'bg-slate-50 ring-slate-100'
            }`}
          >
            <span className="text-lg" aria-hidden="true">{it.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-navy-700">{it.title}</p>
              <p className="text-xs text-muted">{it.detail}</p>
            </div>
            <Link
              href={it.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition ${
                it.severity === 'critical'
                  ? 'bg-red-600 hover:bg-red-700'
                  : it.severity === 'warn'
                    ? 'bg-cta-orange hover:bg-cta-orangeDark'
                    : 'bg-navy-700 hover:bg-navy-600'
              }`}
            >
              {it.cta}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
