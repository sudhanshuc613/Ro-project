/**
 * /admin/billing — saare bill ek jagah.
 *
 * Yahan se naya bill banta hai, purana khulta hai, print hota hai aur
 * WhatsApp pe jaata hai. Upar ke 4 card woh numbers dikhate hain jinpe
 * dukaan chalti hai: is mahine kitna bana, kitna paisa phasa hai, kitne
 * grahak hain, kiski warranty khatm hone wali hai.
 */
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN } from '@/lib/utils/format';
import { billingSetupStatus, getBillingStats } from '@/server/services/billing.service';
import { BILL_TYPE_LABELS, BILL_STATUS_LABELS } from '@/lib/billing/warranty-templates';
import BillingSetupCard from '@/components/admin/BillingSetupCard';
import BillRowActions from '@/components/admin/BillRowActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bill / Invoice' };

const STATUS_TONE: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  UNPAID: 'bg-red-100 text-red-700',
  PARTIAL: 'bg-amber-100 text-amber-800',
  DRAFT: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-slate-200 text-slate-500 line-through',
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string; type?: string };
}) {
  const setup = await billingSetupStatus();
  if (!setup.ready) {
    return (
      <div className="space-y-6">
        <Header />
        <BillingSetupCard missing={setup.missing} />
      </div>
    );
  }

  const q = (searchParams?.q ?? '').trim();
  const status = searchParams?.status ?? '';
  const type = searchParams?.type ?? '';

  const [stats, bills] = await Promise.all([
    getBillingStats(),
    prisma.bill.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { billNumber: { contains: q, mode: 'insensitive' as const } },
                { customerName: { contains: q, mode: 'insensitive' as const } },
                { customerPhone: { contains: q } },
              ],
            }
          : {}),
        ...(status ? { status: status as 'PAID' } : {}),
        ...(type ? { type: type as 'SALE' } : {}),
      },
      orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }],
      take: 100,
      select: {
        id: true,
        billNumber: true,
        type: true,
        status: true,
        customerName: true,
        customerPhone: true,
        issueDate: true,
        grandTotal: true,
        balanceDue: true,
        publicToken: true,
        shareEnabled: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Header />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Is mahine ke bill" value={String(stats.billsThisMonth)} sub={formatINR(stats.revenueThisMonth)} icon="🧾" tone="aqua" />
        <Stat label="Paisa baaki" value={formatINR(stats.pendingAmount)} sub={`${stats.pendingCount} bill me`} icon="⏳" tone={stats.pendingAmount > 0 ? 'red' : 'green'} />
        <Stat label="Grahak record" value={String(stats.clients)} sub={`${stats.activeUnits} machine chalu`} icon="👥" tone="navy" />
        <Stat label="Warranty/AMC khatm 30 din me" value={String(stats.warrantyExpiring30 + stats.amcExpiring30)} sub={`${stats.serviceOverdue} service overdue`} icon="⏰" tone="orange" />
      </div>

      {/* filter */}
      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4" action="/admin/billing">
        <label className="flex-1 min-w-[220px]">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Dhoondo</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Bill no, naam ya phone"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-aqua-500"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Haalat</span>
          <select name="status" defaultValue={status} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Sab</option>
            {Object.entries(BILL_STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Prakar</span>
          <select name="type" defaultValue={type} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Sab</option>
            {Object.entries(BILL_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>
        <button className="rounded-lg bg-navy-700 px-5 py-2 text-sm font-semibold text-white">Dekho</button>
        {(q || status || type) && (
          <Link href="/admin/billing" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">
            Saaf karo
          </Link>
        )}
      </form>

      {bills.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-4xl">🧾</p>
          <p className="mt-3 font-semibold text-navy-700">Abhi koi bill nahi hai</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Upar &quot;Naya bill&quot; dabayein. Phone number daalte hi purana grahak mil jayega to naam-pata khud bhar jayega.
          </p>
          <Link href="/admin/billing/new" className="mt-5 inline-block rounded-xl bg-[#0056b3] px-6 py-3 text-sm font-bold text-white">
            + Naya bill banao
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Bill no</th>
                  <th className="px-4 py-3">Grahak</th>
                  <th className="px-4 py-3">Tarikh</th>
                  <th className="px-4 py-3">Prakar</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Haalat</th>
                  <th className="px-4 py-3 text-right">Kaam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <Link href={`/admin/billing/${b.id}`} className="font-bold text-navy-700 hover:text-aqua-600">
                        {b.billNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-700">{b.customerName}</p>
                      <a href={`tel:+91${b.customerPhone}`} className="text-xs text-slate-500 hover:text-aqua-600">
                        {b.customerPhone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDateIN(b.issueDate)}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{BILL_TYPE_LABELS[b.type] ?? b.type}</td>
                    <td className="px-4 py-3 text-right font-semibold text-navy-700">
                      {formatINR(Number(b.grandTotal))}
                      {Number(b.balanceDue) > 0 ? (
                        <span className="block text-[11px] font-normal text-red-600">
                          {formatINR(Number(b.balanceDue))} baaki
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_TONE[b.status] ?? 'bg-slate-100'}`}>
                        {BILL_STATUS_LABELS[b.status] ?? b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <BillRowActions
                        id={b.id}
                        billNumber={b.billNumber}
                        customerName={b.customerName}
                        customerPhone={b.customerPhone}
                        amount={Number(b.grandTotal)}
                        token={b.shareEnabled ? b.publicToken : null}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Bill / Invoice</h1>
        <p className="mt-0.5 text-sm text-muted">
          Bill banao, print karo, WhatsApp pe bhejo — aur grahak ka poora record apne aap chadhta jaye.
        </p>
      </div>
      <div className="flex gap-2">
        <Link href="/admin/clients" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          👥 Grahak record
        </Link>
        <Link href="/admin/billing/new" className="rounded-xl bg-[#0056b3] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-[#004492]">
          + Naya bill
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, icon, tone }: { label: string; value: string; sub?: string; icon: string; tone: string }) {
  const tones: Record<string, string> = {
    aqua: 'border-aqua-200 bg-aqua-50/60',
    red: 'border-red-200 bg-red-50/60',
    green: 'border-green-200 bg-green-50/60',
    navy: 'border-slate-200 bg-white',
    orange: 'border-amber-200 bg-amber-50/60',
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone] ?? tones.navy}`}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <span className="text-lg leading-none">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-navy-700">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}
