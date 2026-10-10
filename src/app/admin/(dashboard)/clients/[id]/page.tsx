/**
 * /admin/clients/:id — ek grahak ka poora record.
 *
 * Ek screen pe: contact, uski machines (warranty bar ke saath), AMC, aur
 * saare bill. Yeh wahi page hai jo technician ko phone pe bhi khol ke
 * dikhana pade to kaam aa jaye.
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN } from '@/lib/utils/format';
import { toInputDate } from '@/lib/billing/compute';
import { BILL_TYPE_LABELS, BILL_STATUS_LABELS } from '@/lib/billing/warranty-templates';
import UnitManager, { type UnitRow } from '@/components/admin/UnitManager';
import AmcManager, { type AmcRow } from '@/components/admin/AmcManager';
import ClientEditForm from '@/components/admin/ClientEditForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Grahak' };

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const c = await prisma.billingClient
    .findUnique({
      where: { id: params.id },
      include: {
        units: { orderBy: { installedOn: 'desc' } },
        amcs: { orderBy: { endsOn: 'desc' }, include: { visits: { orderBy: { visitDate: 'desc' } } } },
        bills: { orderBy: { issueDate: 'desc' }, take: 50 },
      },
    })
    .catch(() => null);

  if (!c) notFound();

  const units: UnitRow[] = c.units.map((u) => ({
    id: u.id,
    brand: u.brand,
    model: u.model,
    serialNumber: u.serialNumber,
    capacity: u.capacity,
    machineKind: u.machineKind,
    installedOn: toInputDate(u.installedOn),
    partsWarrantyMonths: u.partsWarrantyMonths,
    serviceWarrantyMonths: u.serviceWarrantyMonths,
    freeServicesTotal: u.freeServicesTotal,
    freeServicesUsed: u.freeServicesUsed,
    serviceIntervalDays: u.serviceIntervalDays,
    lastServiceOn: toInputDate(u.lastServiceOn),
    nextServiceDue: toInputDate(u.nextServiceDue),
    inletTds: u.inletTds,
    outletTds: u.outletTds,
    status: u.status,
    notes: u.notes,
  }));

  const amcs: AmcRow[] = c.amcs.map((a) => ({
    id: a.id,
    contractNumber: a.contractNumber,
    planName: a.planName,
    machineBrand: a.machineBrand,
    machineModel: a.machineModel,
    price: Number(a.price),
    startsOn: toInputDate(a.startsOn),
    endsOn: toInputDate(a.endsOn),
    visitsIncluded: a.visitsIncluded,
    visitsUsed: a.visitsUsed,
    lastVisitOn: toInputDate(a.lastVisitOn),
    nextServiceDue: toInputDate(a.nextServiceDue),
    coversFilters: a.coversFilters,
    coversMembrane: a.coversMembrane,
    status: a.status,
    notes: a.notes,
    visits: a.visits.map((v) => ({
      id: v.id,
      visitDate: toInputDate(v.visitDate),
      visitType: v.visitType,
      technicianName: v.technicianName,
      workDone: v.workDone,
      partsReplaced: v.partsReplaced,
      extraCharge: Number(v.extraCharge),
    })),
  }));

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-700">{c.fullName}</h1>
          <p className="mt-0.5 text-sm text-muted">
            <a href={`tel:+91${c.phone}`} className="hover:text-aqua-600">{c.phone}</a>
            {c.altPhone ? ` · ${c.altPhone}` : ''}
            {c.area ? ` · ${c.area}` : ''}
            {c.pincode ? ` · ${c.pincode}` : ''}
          </p>
          {c.addressLine ? <p className="mt-1 max-w-xl whitespace-pre-line text-xs text-slate-500">{c.addressLine}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:+91${c.phone}`} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">📞 Call</a>
          <a href={`https://wa.me/91${c.phone}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#25D366] px-4 py-2 text-sm font-bold text-white">WhatsApp</a>
          <Link href={`/admin/billing/new?phone=${c.phone}&name=${encodeURIComponent(c.fullName)}&type=SERVICE`} className="rounded-xl bg-[#0056b3] px-4 py-2 text-sm font-bold text-white">+ Naya bill</Link>
          <Link href="/admin/clients" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Wapas</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Mini label="Kul business" value={formatINR(Number(c.totalBilled))} />
        <Mini label="Paisa mila" value={formatINR(Number(c.totalPaid))} />
        <Mini label="Bill" value={String(c.billCount)} />
        <Mini label="Grahak kab se" value={formatDateIN(c.createdAt)} />
      </div>

      <ClientEditForm
        client={{
          id: c.id,
          fullName: c.fullName,
          phone: c.phone,
          altPhone: c.altPhone ?? '',
          email: c.email ?? '',
          addressLine: c.addressLine ?? '',
          landmark: c.landmark ?? '',
          area: c.area ?? '',
          city: c.city,
          state: c.state,
          pincode: c.pincode ?? '',
          gstin: c.gstin ?? '',
          notes: c.notes ?? '',
        }}
      />

      <UnitManager clientId={c.id} units={units} />
      <AmcManager clientId={c.id} amcs={amcs} />

      {/* bills */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-base font-bold text-navy-700">Is grahak ke bill</h2>
        {c.bills.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Abhi koi bill nahi.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2">Bill no</th>
                  <th className="py-2">Tarikh</th>
                  <th className="py-2">Prakar</th>
                  <th className="py-2 text-right">Total</th>
                  <th className="py-2">Haalat</th>
                  <th className="py-2 text-right">Kaam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {c.bills.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2.5">
                      <Link href={`/admin/billing/${b.id}`} className="font-semibold text-navy-700 hover:text-aqua-600">{b.billNumber}</Link>
                    </td>
                    <td className="py-2.5 text-slate-600">{formatDateIN(b.issueDate)}</td>
                    <td className="py-2.5 text-xs text-slate-600">{BILL_TYPE_LABELS[b.type] ?? b.type}</td>
                    <td className="py-2.5 text-right font-semibold text-navy-700">{formatINR(Number(b.grandTotal))}</td>
                    <td className="py-2.5 text-xs text-slate-600">{BILL_STATUS_LABELS[b.status] ?? b.status}</td>
                    <td className="py-2.5 text-right">
                      <Link href={`/admin/print/${b.id}`} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs hover:bg-slate-50">🖨️</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {c.notes ? (
        <section className="rounded-2xl border border-slate-200 bg-amber-50 p-5">
          <h2 className="text-sm font-bold text-navy-700">📝 Note</h2>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{c.notes}</p>
        </section>
      ) : null}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-navy-700">{value}</p>
    </div>
  );
}
