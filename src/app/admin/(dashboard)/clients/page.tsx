/**
 * /admin/clients — "kis kisko diya hai" ka jawab.
 *
 * Har grahak ki ek line: naam, phone, area, kitna business, kitni machine
 * chalu hai, AMC hai ya nahi, aur agli service kab due hai. Phone aur
 * WhatsApp seedha yahin se.
 *
 * Yeh page `/admin/customers` se alag hai. Wahan website pe account banane
 * wale log hain (online order karne wale). Yahan woh grahak hain jinke ghar
 * jaake kaam kiya hai — 90% ke paas website account hai hi nahi.
 */
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN } from '@/lib/utils/format';
import { billingSetupStatus } from '@/server/services/billing.service';
import { dueState } from '@/lib/billing/compute';
import BillingSetupCard from '@/components/admin/BillingSetupCard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Grahak Record' };

export default async function ClientsPage({ searchParams }: { searchParams?: { q?: string } }) {
  const setup = await billingSetupStatus();
  if (!setup.ready) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-navy-700">Grahak Record</h1>
        <BillingSetupCard missing={setup.missing} />
      </div>
    );
  }

  const q = (searchParams?.q ?? '').trim();

  const clients = await prisma.billingClient.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
            { area: { contains: q, mode: 'insensitive' } },
            { addressLine: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {},
    orderBy: [{ lastBillAt: 'desc' }, { createdAt: 'desc' }],
    take: 200,
    include: {
      units: { where: { status: 'ACTIVE' }, select: { id: true, brand: true, model: true, nextServiceDue: true, partsWarrantyEndsOn: true } },
      amcs: { where: { status: 'ACTIVE' }, select: { id: true, planName: true, endsOn: true } },
    },
  });

  const totalBusiness = clients.reduce((s, c) => s + Number(c.totalBilled), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-700">Grahak Record</h1>
          <p className="mt-0.5 text-sm text-muted">
            Kis kisko kya diya, kaun sa model, kab laga, warranty kitni bachi — sab yahan.
          </p>
        </div>
        <Link href="/admin/billing/new" className="rounded-xl bg-[#0056b3] px-5 py-2.5 text-sm font-bold text-white shadow">
          + Naya bill
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Mini label="Kul grahak" value={String(clients.length)} />
        <Mini label="Kul business" value={formatINR(totalBusiness)} />
        <Mini label="Chalu machine" value={String(clients.reduce((s, c) => s + c.units.length, 0))} />
      </div>

      <form action="/admin/clients" className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Naam, phone ya area se dhoondo"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-aqua-500"
        />
        <button className="rounded-lg bg-navy-700 px-5 py-2 text-sm font-semibold text-white">Dhoondo</button>
        {q ? (
          <Link href="/admin/clients" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">
            Saaf
          </Link>
        ) : null}
      </form>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-4xl">👥</p>
          <p className="mt-3 font-semibold text-navy-700">{q ? 'Koi grahak nahi mila' : 'Abhi koi grahak record nahi'}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Jaise hi pehla bill banega, grahak yahan apne aap chadh jayega.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Grahak</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Machine</th>
                  <th className="px-4 py-3">AMC</th>
                  <th className="px-4 py-3 text-right">Business</th>
                  <th className="px-4 py-3">Aakhri bill</th>
                  <th className="px-4 py-3 text-right">Kaam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c) => {
                  const soonest = c.units
                    .map((u) => u.nextServiceDue)
                    .filter(Boolean)
                    .sort((a, b) => (a as Date).getTime() - (b as Date).getTime())[0] as Date | undefined;
                  const ds = dueState(soonest ?? null);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <Link href={`/admin/clients/${c.id}`} className="font-semibold text-navy-700 hover:text-aqua-600">
                          {c.fullName}
                        </Link>
                        <a href={`tel:+91${c.phone}`} className="block text-xs text-slate-500 hover:text-aqua-600">
                          {c.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{c.area || '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        {c.units.length === 0 ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <>
                            <span className="font-medium text-navy-700">
                              {c.units[0].brand} {c.units[0].model ?? ''}
                            </span>
                            {c.units.length > 1 ? <span className="text-slate-500"> +{c.units.length - 1}</span> : null}
                            {soonest ? (
                              <span
                                className={`mt-0.5 block text-[11px] font-semibold ${
                                  ds === 'overdue' ? 'text-red-600' : ds === 'due-soon' ? 'text-amber-600' : 'text-slate-500'
                                }`}
                              >
                                Service {formatDateIN(soonest)}
                              </span>
                            ) : null}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {c.amcs.length === 0 ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-800">
                            {c.amcs[0].planName}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-navy-700">
                        {formatINR(Number(c.totalBilled))}
                        <span className="block text-[11px] font-normal text-slate-500">{c.billCount} bill</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{c.lastBillAt ? formatDateIN(c.lastBillAt) : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <a
                            href={`tel:+91${c.phone}`}
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs hover:bg-slate-50"
                            title="Phone"
                          >
                            📞
                          </a>
                          <a
                            href={`https://wa.me/91${c.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-[#128C7E] hover:bg-green-50"
                            title="WhatsApp"
                          >
                            WA
                          </a>
                          <Link
                            href={`/admin/billing/new?phone=${c.phone}&name=${encodeURIComponent(c.fullName)}&type=SERVICE`}
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            title="Naya bill"
                          >
                            🧾
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy-700">{value}</p>
    </div>
  );
}
