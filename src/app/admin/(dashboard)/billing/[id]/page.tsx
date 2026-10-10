/**
 * /admin/billing/:id — purana bill badlo.
 *
 * Note: yahan "Machine record banao" / "AMC record banao" wale checkbox
 * default OFF hain. Agar edit ke waqt bhi ON rehte to har save pe ek nayi
 * machine row ban jaati aur 3 edit ke baad grahak ke paas 3 RO dikhte.
 * Machine/AMC badalna grahak ke page se hota hai — wahan ek hi row edit hoti hai.
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { toInputDate } from '@/lib/billing/compute';
import { formatINR } from '@/lib/utils/format';
import BillForm from '@/components/admin/BillForm';
import { type BillFormInitial } from '@/lib/billing/bill-form-types';
import { BRAND } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bill badlo' };

export default async function EditBillPage({ params }: { params: { id: string } }) {
  const bill = await prisma.bill
    .findUnique({
      where: { id: params.id },
      include: { items: { orderBy: { position: 'asc' } }, payments: { orderBy: { paidOn: 'desc' } }, client: true },
    })
    .catch(() => null);

  if (!bill) notFound();

  const initial: BillFormInitial = {
    id: bill.id,
    billNumber: bill.billNumber,
    type: bill.type,
    status: bill.status,
    customerName: bill.customerName,
    customerPhone: bill.customerPhone,
    customerAltPhone: bill.customerAltPhone ?? '',
    customerAddress: bill.customerAddress ?? '',
    customerGstin: bill.customerGstin ?? '',
    clientArea: bill.client?.area ?? '',
    clientPincode: bill.client?.pincode ?? '',
    issueDate: toInputDate(bill.issueDate),
    dueDate: toInputDate(bill.dueDate),
    items: bill.items.map((i) => ({
      description: i.description,
      detailNote: i.detailNote ?? '',
      hsnCode: i.hsnCode ?? '',
      brand: i.brand ?? '',
      model: i.model ?? '',
      serialNumber: i.serialNumber ?? '',
      mrp: i.mrp ? String(Number(i.mrp)) : '',
      unitPrice: String(Number(i.unitPrice)),
      quantity: String(Number(i.quantity)),
    })),
    discountAmount: String(Number(bill.discountAmount)),
    taxRate: String(Number(bill.taxRate)),
    taxMode: bill.taxMode,
    roundToRupee: Number(bill.roundOff) !== 0 || Number.isInteger(Number(bill.grandTotal)),
    amountPaid: String(Number(bill.amountPaid)),
    paymentMode: bill.paymentMode ?? '',
    paymentNote: bill.paymentNote ?? '',
    warrantyTemplate: bill.warrantyTemplate ?? '',
    terms: bill.terms,
    showStamp: bill.showStamp,
    stampText: bill.stampText,
    showSign: bill.showSign,
    footerNote: bill.footerNote ?? '',
    shareEnabled: bill.shareEnabled,
    internalNote: bill.internalNote ?? '',
  };

  const shareUrl = bill.shareEnabled ? `${BRAND.url}/bill/${bill.publicToken}` : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-700">Bill {bill.billNumber}</h1>
          <p className="mt-0.5 text-sm text-muted">
            {bill.customerName} · {formatINR(Number(bill.grandTotal))}
            {bill.viewCount > 0 ? ` · grahak ne ${bill.viewCount} baar khola` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {bill.clientId ? (
            <Link href={`/admin/clients/${bill.clientId}`} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              👤 Grahak ka record
            </Link>
          ) : null}
          <Link href={`/admin/print/${bill.id}`} className="rounded-xl bg-[#0056b3] px-4 py-2 text-sm font-bold text-white">
            🖨️ Print
          </Link>
          <Link href="/admin/billing" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            ← Wapas
          </Link>
        </div>
      </div>

      {shareUrl ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
          <span className="font-semibold text-navy-700">Grahak ka link:</span>{' '}
          <span className="break-all font-mono">{shareUrl}</span>
          <span className="ml-2 text-slate-400">(Google is link ko index nahi karta — robots.txt + noindex dono lage hain)</span>
        </div>
      ) : null}

      {bill.payments.length > 1 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment history</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {bill.payments.map((p) => (
              <li key={p.id}>
                {formatINR(Number(p.amount))} · {p.mode} · {toInputDate(p.paidOn)}
                {p.note ? ` · ${p.note}` : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <BillForm initial={initial} mode="edit" />
    </div>
  );
}
