/**
 * /admin/print/:id — bill ka chhapne wala roop (admin ke liye).
 *
 * Yeh page `(dashboard)` group ke BAHAR hai, isliye sidebar/topbar nahi aata
 * aur kaagaz pe sirf bill chhapta hai. Group ke bahar hone ka matlab yeh bhi
 * hai ki layout wala auth guard yahan nahi chalta — isliye session check
 * yahin page me khud kiya gaya hai. Bina login ke seedha /admin/login.
 */
import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import type { Metadata } from 'next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { BRAND } from '@/lib/constants';
import InvoiceDocument, { type InvoiceView } from '@/components/billing/InvoiceDocument';
import PrintBar from '@/components/billing/PrintBar';
import { billINR } from '@/lib/billing/compute';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

const ADMIN_ROLES = ['STAFF', 'ADMIN', 'SUPER_ADMIN'];

export default async function AdminBillPrintPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/admin/login?callbackUrl=/admin/print/${params.id}`);
  if (!ADMIN_ROLES.includes(session.user.role as string)) redirect('/?error=unauthorized');

  const bill = await prisma.bill
    .findUnique({
      where: { id: params.id },
      include: {
        items: { orderBy: { position: 'asc' } },
        units: { orderBy: { installedOn: 'desc' } },
      },
    })
    .catch(() => null);

  if (!bill) notFound();

  const view: InvoiceView = {
    billNumber: bill.billNumber,
    type: bill.type,
    status: bill.status,
    issueDate: bill.issueDate,
    dueDate: bill.dueDate,
    customerName: bill.customerName,
    customerPhone: bill.customerPhone,
    customerAltPhone: bill.customerAltPhone,
    customerAddress: bill.customerAddress,
    customerGstin: bill.customerGstin,
    items: bill.items.map((i) => ({
      description: i.description,
      detailNote: i.detailNote,
      hsnCode: i.hsnCode,
      serialNumber: i.serialNumber,
      unitPrice: Number(i.unitPrice),
      quantity: Number(i.quantity),
      lineTotal: Number(i.lineTotal),
    })),
    subtotal: Number(bill.subtotal),
    discountAmount: Number(bill.discountAmount),
    taxRate: Number(bill.taxRate),
    taxAmount: Number(bill.taxAmount),
    taxMode: bill.taxMode,
    roundOff: Number(bill.roundOff),
    grandTotal: Number(bill.grandTotal),
    amountPaid: Number(bill.amountPaid),
    balanceDue: Number(bill.balanceDue),
    amountInWords: bill.amountInWords,
    paymentMode: bill.paymentMode,
    terms: bill.terms,
    showStamp: bill.showStamp,
    stampText: bill.stampText,
    showSign: bill.showSign,
    footerNote: bill.footerNote,
    units: bill.units.map((u) => ({
      brand: u.brand,
      model: u.model,
      serialNumber: u.serialNumber,
      installedOn: u.installedOn,
      partsWarrantyMonths: u.partsWarrantyMonths,
      serviceWarrantyMonths: u.serviceWarrantyMonths,
      freeServicesTotal: u.freeServicesTotal,
      freeServicesUsed: u.freeServicesUsed,
      nextServiceDue: u.nextServiceDue,
    })),
  };

  const shareUrl = bill.shareEnabled ? `${BRAND.url}/bill/${bill.publicToken}` : undefined;

  return (
    <div>
      <PrintBar
        billNumber={bill.billNumber}
        customerName={bill.customerName}
        amount={billINR(Number(bill.grandTotal))}
        shareUrl={shareUrl}
        whatsappPhone={bill.customerPhone}
        backHref="/admin/billing"
        editHref={`/admin/billing/${bill.id}`}
      />
      <div className="paper">
        <InvoiceDocument bill={view} />
      </div>
    </div>
  );
}
