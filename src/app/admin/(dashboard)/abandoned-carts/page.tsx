import { prisma } from '@/lib/db/prisma';
import { formatINR, relativeTime } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Abandoned Carts' };

export default async function AbandonedCartsPage() {
  const carts = await prisma.cart.findMany({
    where: { status: { in: ['ACTIVE', 'ABANDONED'] }, subtotal: { gt: 0 } },
    orderBy: { subtotal: 'desc' },
    take: 100,
    include: {
      user: { select: { fullName: true, phone: true } },
      _count: { select: { items: true } },
    },
  });

  const potential = carts.reduce((n, c) => n + Number(c.subtotal), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Abandoned Carts</h1>
        <p className="mt-0.5 text-sm text-muted">
          {carts.length} carts · {formatINR(potential)} recoverable
        </p>
      </div>

      {carts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-4xl">🛒</p>
          <p className="mt-3 font-semibold text-navy-700">No abandoned carts</p>
          <p className="mt-1 text-sm text-muted">
            Carts idle for over an hour with items in them will show up here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-muted">
                <th className="pb-2.5 font-semibold">Customer</th>
                <th className="pb-2.5 font-semibold">Items</th>
                <th className="pb-2.5 font-semibold">Value</th>
                <th className="pb-2.5 font-semibold">Recovery Stage</th>
                <th className="pb-2.5 text-right font-semibold">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3">
                    <span className="block font-medium text-navy-700">{c.user?.fullName ?? 'Guest'}</span>
                    {c.user?.phone && (
                      <a href={`https://wa.me/91${c.user.phone}`} target="_blank" rel="noopener noreferrer"
                         className="block text-xs text-aqua-600 hover:underline">
                        {c.user.phone}
                      </a>
                    )}
                  </td>
                  <td className="py-3 text-muted">{c._count.items}</td>
                  <td className="py-3 font-bold text-navy-700">{formatINR(Number(c.subtotal))}</td>
                  <td className="py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                      {c.recoveryStage === 0 ? 'Not contacted' : `Stage ${c.recoveryStage}`}
                    </span>
                  </td>
                  <td className="py-3 text-right text-xs text-muted">{relativeTime(c.lastActivityAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
