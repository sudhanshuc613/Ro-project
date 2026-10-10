/**
 * /bill/:token — grahak ka apna bill, WhatsApp link se khulne wala.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN: Patna me grahak kaagaz ka bill 3 mahine me kho deta hai. Jab membrane
 * 9ve mahine me kharab hota hai to use yaad hi nahi rehta ki warranty thi ya
 * nahi — aur bahas shuru. WhatsApp pe gaya hua link uske chat me hamesha
 * rehta hai. Isme install date, warranty kab tak hai aur agli service kab
 * due hai — sab likha hota hai.
 *
 * ── SEO PE ASAR: ZERO (jaan-boojh ke) ────────────────────────────────────
 * Owner ne poocha tha "SEO down to nahi hoga". Teen taale lage hain:
 *   1. `robots: { index: false, follow: false }`  → Google index nahi karega
 *   2. `/bill/` robots.txt me Disallow hai        → crawl hi nahi karega
 *   3. sitemap.ts me yeh route hai hi nahi        → Google ko pata hi nahi
 * Matlab yeh page ranking ke liye na madad karta hai na nuksaan. Site ka
 * crawl budget bhi nahi khata.
 *
 * ── SURAKSHA ─────────────────────────────────────────────────────────────
 * URL me bill ki ID nahi, 18 random bytes ka token hai (~1.4 × 10^43 sambhavnaye).
 * /bill/1, /bill/2 try karke koi doosre ka bill nahi dekh sakta. Owner chahe
 * to kisi bhi bill ka share band kar sakta hai (`shareEnabled` → 404).
 * Grahak ka poora address ya GSTIN yahan nahi dikhaya jaata.
 */
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { CONTACT, SERVICE } from '@/lib/constants';
import InvoiceDocument, { type InvoiceView } from '@/components/billing/InvoiceDocument';
import PrintBar from '@/components/billing/PrintBar';
import { billINR } from '@/lib/billing/compute';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your Bill — Aqua Perl',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default async function PublicBillPage({ params }: { params: { token: string } }) {
  if (!params.token || params.token.length < 12) notFound();

  const bill = await prisma.bill
    .findUnique({
      where: { publicToken: params.token },
      include: {
        items: { orderBy: { position: 'asc' } },
        units: { orderBy: { installedOn: 'desc' } },
      },
    })
    .catch(() => null);

  if (!bill || !bill.shareEnabled) notFound();

  // View count — fail hone pe page phir bhi khulna chahiye.
  prisma.bill
    .update({ where: { id: bill.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

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
    // GSTIN jaan-boojh ke public copy me nahi.
    customerGstin: null,
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

  return (
    <div>
      <PrintBar
        billNumber={bill.billNumber}
        customerName={bill.customerName}
        amount={billINR(Number(bill.grandTotal))}
      />
      <div className="paper">
        <InvoiceDocument bill={view} />
      </div>

      <div className="no-print mx-auto mb-16 max-w-[210mm] rounded-xl border border-slate-200 bg-white p-5 text-center">
        <p className="text-sm font-semibold text-navy-700">
          RO me koi dikkat? {SERVICE.city} me {SERVICE.responseTime} me technician.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Visit charge sirf ₹{SERVICE.visitCharge} · Service par {SERVICE.warrantyDays} din aur naye part par{' '}
          {SERVICE.partsWarrantyMonths} mahine ki warranty
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <a
            href={CONTACT.primaryTel}
            className="rounded-lg bg-[#0056b3] px-5 py-2.5 text-sm font-bold text-white"
          >
            📞 {CONTACT.primaryPhone}
          </a>
          <a
            href={CONTACT.whatsappLink(`Hi Aqua Perl, bill ${bill.billNumber} ke baare me baat karni hai.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white"
          >
            WhatsApp
          </a>
          <Link
            href="/ro-services-patna"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
          >
            Hamari saari services
          </Link>
        </div>
      </div>
    </div>
  );
}
