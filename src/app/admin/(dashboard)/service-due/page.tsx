/**
 * Service Due — the outbound call list.
 *
 * ── WHY THIS IS THE MOST COMMERCIALLY USEFUL ADMIN PAGE ───────────────────
 * Everything else in the panel is reactive: a customer contacts us, we
 * respond. This page is the only one that generates revenue on its own.
 *
 * It answers: "who should I call today?" — ranked by how overdue they are,
 * with the phone number, the exact part due, and the honest price already on
 * screen. The owner opens this, works down the list, and books jobs.
 *
 * A competitor cannot copy this without first collecting machine data from
 * every customer, which takes months. That is the moat.
 */
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { formatDateIN } from '@/lib/utils/format';
import { computeMachineHealth } from '@/server/services/machine.service';
import { getContactSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Service Due' };

export default async function ServiceDuePage() {
  const [machines, contact] = await Promise.all([
    prisma.customerMachine.findMany({
      where: { isActive: true },
      include: {
        user: { select: { id: true, fullName: true, phone: true, whatsappOptIn: true } },
        address: { select: { line1: true, landmark: true, city: true, pincode: true } },
      },
    }),
    getContactSettings(),
  ]);

  const rows = machines
    .map((m) => ({ m, h: computeMachineHealth(m) }))
    .map(({ m, h }) => {
      const overdue = h.dueItems.filter((d) => d.state === 'overdue');
      const dueSoon = h.dueItems.filter((d) => d.state === 'due-soon');
      const worstMonths = Math.max(0, ...overdue.map((d) => d.overdueByMonths));
      return { m, h, overdue, dueSoon, worstMonths };
    })
    .filter((r) => r.overdue.length > 0 || r.dueSoon.length > 0)
    // Most overdue first — that is both the most urgent and the easiest sell.
    .sort((a, b) => b.worstMonths - a.worstMonths || b.overdue.length - a.overdue.length);

  const overdueRows = rows.filter((r) => r.overdue.length > 0);
  const soonRows = rows.filter((r) => r.overdue.length === 0);

  // Rough revenue at stake, using the low end of each honest price range.
  const LOW = { sediment: 450, carbon: 450, membrane: 1200, uv: 700 } as const;
  const potential = overdueRows.reduce(
    (sum, r) => sum + r.overdue.reduce((s, d) => s + LOW[d.key], 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Service Due</h1>
        <p className="mt-0.5 text-sm text-muted">
          Customers whose filters have lapsed. Call them before the water goes bad — this is
          the list no competitor in Patna can build.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-red-50 p-4 ring-1 ring-red-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-700">Overdue now</p>
          <p className="tnum mt-1 font-display text-3xl font-extrabold text-red-800">{overdueRows.length}</p>
          <p className="text-xs text-red-700">customers to call today</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Due within a month</p>
          <p className="tnum mt-1 font-display text-3xl font-extrabold text-amber-900">{soonRows.length}</p>
          <p className="text-xs text-amber-800">line them up</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Revenue on the table</p>
          <p className="tnum mt-1 font-display text-3xl font-extrabold text-emerald-800">
            ₹{potential.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-emerald-700">parts only, at lowest price</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-200 py-16 text-center">
          <p className="text-4xl">✅</p>
          <p className="mt-3 font-semibold text-navy-700">Nothing due right now</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
            This list fills up as customers add their machines. Ask every customer to add
            theirs at <span className="font-mono text-xs">/account/machines</span> — or add it
            for them after a visit.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card ring-1 ring-navy-100">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-100 bg-sand-100">
              <tr className="text-[11px] uppercase tracking-wider text-navy-600">
                <th className="px-4 py-3 font-bold">Customer</th>
                <th className="px-4 py-3 font-bold">Machine</th>
                <th className="px-4 py-3 font-bold">What&apos;s due</th>
                <th className="px-4 py-3 text-right font-bold">Health</th>
                <th className="px-4 py-3 text-right font-bold">Call</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100/70">
              {rows.map(({ m, h, overdue, dueSoon }) => {
                const items = overdue.length ? overdue : dueSoon;
                const isOverdue = overdue.length > 0;
                const waText = encodeURIComponent(
                  `Namaste ${m.user.fullName.split(' ')[0]} ji, AquaNexa se. Aapke ${m.brand} RO ka ` +
                    `${items.map((d) => d.label).join(' aur ')} ` +
                    `${isOverdue ? 'change karne ka time ho gaya hai' : 'jaldi change karna hoga'}. ` +
                    `Kharcha ${items[0].costRange} + ₹${contact ? 200 : 200} visit. Kab bhej dein technician?`,
                );

                return (
                  <tr key={m.id} className={isOverdue ? 'bg-red-50/40' : ''}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/customers?q=${m.user.phone}`} className="font-semibold text-navy-700 hover:text-aqua-600">
                        {m.user.fullName}
                      </Link>
                      <p className="tnum text-xs text-muted">{m.user.phone}</p>
                      {m.address && (
                        <p className="text-[11px] text-muted">
                          {m.address.line1}
                          {m.address.landmark ? `, near ${m.address.landmark}` : ''} – {m.address.pincode}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-700">{h.title}</p>
                      <p className="text-[11px] text-muted">
                        {m.installedDate ? `installed ${formatDateIN(m.installedDate)}` : 'install date unknown'}
                        {m.inletTds ? ` · TDS ${m.inletTds}` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <ul className="space-y-0.5">
                        {items.map((d) => (
                          <li key={d.key} className="text-xs">
                            <span className={`font-semibold ${isOverdue ? 'text-red-700' : 'text-amber-800'}`}>
                              {d.label}
                            </span>
                            <span className="text-muted">
                              {d.state === 'overdue'
                                ? ` — ${d.overdueByMonths}mo overdue`
                                : d.dueOn ? ` — due ${formatDateIN(d.dueOn)}` : ''}
                              {' · '}{d.costRange}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`tnum rounded-lg px-2.5 py-1 text-sm font-bold ${
                          h.score >= 65 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {h.score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <a
                          href={`tel:+91${m.user.phone}`}
                          className="rounded-lg bg-cta-green px-3 py-1.5 text-xs font-bold text-white"
                        >
                          Call
                        </a>
                        {m.user.whatsappOptIn && (
                          <a
                            href={`https://wa.me/91${m.user.phone}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                          >
                            WA
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
