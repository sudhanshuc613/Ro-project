/**
 * GST-compliant tax invoice — printable / save-as-PDF.
 *
 * Access rules (important, this page shows a customer's address + phone):
 *  - Logged-in owner of the order  → allowed
 *  - Admin / staff                 → allowed
 *  - Anyone else                   → 404 (not 403, so we don't confirm the
 *                                    order number even exists)
 *
 * Tax model: our catalogue prices are GST-INCLUSIVE MRP (standard for Indian
 * retail), so tax is back-calculated with splitGST(). Bihar → CGST+SGST,
 * outside Bihar → IGST. This matches how order.service.ts stores taxAmount.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN, splitGST } from '@/lib/utils/format';
import { BRAND, CONTACT } from '@/lib/constants';
import { getContactSettings } from '@/lib/settings';
import PrintButton from '@/components/account/PrintButton';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Tax Invoice',
  robots: { index: false, follow: false },
};

/** ₹1,234 → "One Thousand Two Hundred Thirty Four Rupees Only" (Indian system) */
function amountInWords(value: number): string {
  const n = Math.round(value);
  if (n === 0) return 'Zero Rupees Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const twoDigit = (x: number): string =>
    x < 20 ? ones[x] : `${tens[Math.floor(x / 10)]}${x % 10 ? ' ' + ones[x % 10] : ''}`;

  const threeDigit = (x: number): string =>
    x >= 100
      ? `${ones[Math.floor(x / 100)]} Hundred${x % 100 ? ' ' + twoDigit(x % 100) : ''}`
      : twoDigit(x);

  const parts: string[] = [];
  const crore = Math.floor(n / 1e7);
  const lakh = Math.floor((n % 1e7) / 1e5);
  const thousand = Math.floor((n % 1e5) / 1e3);
  const rest = n % 1e3;

  if (crore) parts.push(`${threeDigit(crore)} Crore`);
  if (lakh) parts.push(`${threeDigit(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigit(thousand)} Thousand`);
  if (rest) parts.push(threeDigit(rest));

  return `${parts.join(' ')} Rupees Only`;
}

const PAYMENT_LABEL: Record<string, string> = {
  COD: 'Cash on Delivery',
  RAZORPAY: 'Online (Razorpay)',
  UPI: 'UPI',
  CARD: 'Card',
  NETBANKING: 'Net Banking',
  WALLET: 'Wallet',
};

export default async function InvoicePage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login?callbackUrl=/account/orders/${params.orderNumber}/invoice`);
  }

  const [order, contact] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNumber: params.orderNumber.toUpperCase() },
      include: {
        items: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
        user: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    }),
    getContactSettings(),
  ]);

  if (!order) notFound();

  // Ownership check — staff can view any invoice, customers only their own.
  const role = (session.user as { role?: string }).role;
  const isStaff = role === 'ADMIN' || role === 'STAFF' || role === 'SUPER_ADMIN';
  if (!isStaff && order.userId !== session.user.id) notFound();

  const addr = order.shippingAddress as {
    contactName?: string; contactPhone?: string; line1?: string; line2?: string;
    landmark?: string; city?: string; state?: string; pincode?: string;
  };
  const billing = (order.billingAddress ?? order.shippingAddress) as typeof addr;

  const isIntraState = (billing.state ?? '').trim().toLowerCase() === 'bihar';
  const payment = order.payments[0];

  // Per-line GST back-calculation from the tax-inclusive line total.
  const rows = order.items.map((it) => {
    const gross = Number(it.lineTotal);
    const gst = splitGST(gross, Number(it.taxRate), isIntraState);
    return { it, gross, taxable: gross - gst.total, gst };
  });

  const taxableTotal = rows.reduce((s, r) => s + r.taxable, 0);
  const cgstTotal = rows.reduce((s, r) => s + r.gst.cgst, 0);
  const sgstTotal = rows.reduce((s, r) => s + r.gst.sgst, 0);
  const igstTotal = rows.reduce((s, r) => s + r.gst.igst, 0);

  const invoiceNo = order.orderNumber.replace(/^AQN-?/i, 'INV-');

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
      {/* Screen-only toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/account/orders" className="text-sm font-semibold text-aqua-600 hover:underline">
          ← My Orders
        </Link>
        <div className="flex gap-2">
          <PrintButton />
          <a
            href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
              `Hi, I need help with invoice ${invoiceNo} (order ${order.orderNumber})`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
          >
            💬 Query on invoice
          </a>
        </div>
      </div>

      {order.paymentStatus !== 'PAID' && (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-200 print:hidden">
          ⏳ Payment pending — this is a provisional invoice. It becomes final once payment is received.
        </p>
      )}

      {/* ── The invoice sheet ─────────────────────────────────────────── */}
      <article className="rounded-2xl border border-navy-200 bg-white p-6 text-[13px] leading-relaxed text-navy-800 print:rounded-none print:border-0 print:p-0 sm:p-8">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-navy-700 pb-5">
          <div>
            <p className="font-display text-2xl font-extrabold text-navy-700">{BRAND.legalName}</p>
            <p className="mt-1 text-muted">
              {CONTACT.address.street}, {CONTACT.address.locality}
              <br />
              {CONTACT.address.city}, {CONTACT.address.state} – {CONTACT.address.pincode}
            </p>
            <p className="mt-1 text-muted">
              📞 {contact.primaryPhone} · {contact.secondaryPhone}
              <br />
              {CONTACT.emailWorks && <>✉️ {contact.email} · </>}{BRAND.domain}
            </p>
          </div>
          <div className="text-right">
            <p className="inline-block rounded-lg bg-navy-700 px-4 py-1.5 font-display text-sm font-bold uppercase tracking-wider text-white">
              Tax Invoice
            </p>
            <dl className="mt-3 space-y-0.5">
              <div className="flex justify-end gap-3">
                <dt className="text-muted">Invoice No.</dt>
                <dd className="font-bold text-navy-700">{invoiceNo}</dd>
              </div>
              <div className="flex justify-end gap-3">
                <dt className="text-muted">Order No.</dt>
                <dd className="font-semibold">{order.orderNumber}</dd>
              </div>
              <div className="flex justify-end gap-3">
                <dt className="text-muted">Date</dt>
                <dd className="font-semibold">{formatDateIN(order.placedAt)}</dd>
              </div>
              <div className="flex justify-end gap-3">
                <dt className="text-muted">Place of Supply</dt>
                <dd className="font-semibold">{billing.state ?? '—'}</dd>
              </div>
            </dl>
          </div>
        </header>

        {/* Parties */}
        <section className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Bill To</p>
            <p className="mt-1 font-bold text-navy-700">
              {billing.contactName ?? order.user?.fullName ?? 'Customer'}
            </p>
            <p className="text-muted">
              {billing.line1}
              {billing.line2 ? <>, {billing.line2}</> : null}
              {billing.landmark ? <><br />Near {billing.landmark}</> : null}
              <br />
              {billing.city}, {billing.state} – {billing.pincode}
            </p>
            <p className="mt-1 text-muted">
              📞 {billing.contactPhone ?? order.user?.phone ?? order.guestPhone ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Ship To</p>
            <p className="mt-1 font-bold text-navy-700">{addr.contactName ?? '—'}</p>
            <p className="text-muted">
              {addr.line1}
              {addr.line2 ? <>, {addr.line2}</> : null}
              {addr.landmark ? <><br />Near {addr.landmark}</> : null}
              <br />
              {addr.city}, {addr.state} – {addr.pincode}
            </p>
            <p className="mt-1 text-muted">
              Payment: <strong className="text-navy-700">
                {PAYMENT_LABEL[order.paymentMethod ?? ''] ?? order.paymentMethod ?? '—'}
              </strong>
              {' · '}
              <span className={order.paymentStatus === 'PAID' ? 'font-bold text-emerald-700' : 'font-bold text-amber-700'}>
                {order.paymentStatus === 'PAID' ? 'PAID' : order.paymentStatus}
              </span>
            </p>
            {payment?.gatewayPaymentId && (
              <p className="text-[11px] text-muted">Txn: {payment.gatewayPaymentId}</p>
            )}
          </div>
        </section>

        {/* Line items */}
        <section className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-navy-50 text-[11px] uppercase tracking-wide text-navy-700">
                <th className="border border-navy-100 px-2 py-2 font-bold">#</th>
                <th className="border border-navy-100 px-2 py-2 font-bold">Item &amp; SKU</th>
                <th className="border border-navy-100 px-2 py-2 text-center font-bold">Qty</th>
                <th className="border border-navy-100 px-2 py-2 text-right font-bold">Taxable</th>
                <th className="border border-navy-100 px-2 py-2 text-center font-bold">GST</th>
                <th className="border border-navy-100 px-2 py-2 text-right font-bold">Tax</th>
                <th className="border border-navy-100 px-2 py-2 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.it.id} className="align-top">
                  <td className="border border-navy-100 px-2 py-2 text-muted">{i + 1}</td>
                  <td className="border border-navy-100 px-2 py-2">
                    <span className="font-semibold text-navy-700">{r.it.productName}</span>
                    <br />
                    <span className="text-[11px] text-muted">SKU: {r.it.productSku}</span>
                  </td>
                  <td className="border border-navy-100 px-2 py-2 text-center">{r.it.quantity}</td>
                  <td className="border border-navy-100 px-2 py-2 text-right">{formatINR(r.taxable, true)}</td>
                  <td className="border border-navy-100 px-2 py-2 text-center">{Number(r.it.taxRate)}%</td>
                  <td className="border border-navy-100 px-2 py-2 text-right">{formatINR(r.gst.total, true)}</td>
                  <td className="border border-navy-100 px-2 py-2 text-right font-semibold">{formatINR(r.gross, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <section className="mt-5 flex flex-wrap justify-between gap-6">
          <div className="min-w-[220px] flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Amount in words</p>
            <p className="mt-1 font-semibold text-navy-700">
              {amountInWords(Number(order.totalAmount))}
            </p>

            <div className="mt-5 rounded-lg bg-navy-50 p-3 text-[11px] text-muted">
              <p className="font-bold text-navy-700">Terms</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                <li>Goods once sold are covered by manufacturer warranty only.</li>
                <li>Warranty claims require this invoice.</li>
                <li>Returns accepted within 7 days if unused and in original packaging.</li>
                <li>Subject to Patna, Bihar jurisdiction.</li>
              </ul>
            </div>
          </div>

          <div className="min-w-[260px]">
            <dl className="space-y-1.5">
              <div className="flex justify-between gap-8">
                <dt className="text-muted">Taxable value</dt>
                <dd className="font-semibold">{formatINR(taxableTotal, true)}</dd>
              </div>
              {isIntraState ? (
                <>
                  <div className="flex justify-between gap-8">
                    <dt className="text-muted">CGST</dt>
                    <dd className="font-semibold">{formatINR(cgstTotal, true)}</dd>
                  </div>
                  <div className="flex justify-between gap-8">
                    <dt className="text-muted">SGST</dt>
                    <dd className="font-semibold">{formatINR(sgstTotal, true)}</dd>
                  </div>
                </>
              ) : (
                <div className="flex justify-between gap-8">
                  <dt className="text-muted">IGST</dt>
                  <dd className="font-semibold">{formatINR(igstTotal, true)}</dd>
                </div>
              )}
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between gap-8 text-emerald-700">
                  <dt>Discount</dt>
                  <dd className="font-semibold">− {formatINR(Number(order.discountAmount), true)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-8">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-semibold">
                  {Number(order.shippingAmount) === 0 ? 'FREE' : formatINR(Number(order.shippingAmount), true)}
                </dd>
              </div>
              {Number(order.codCharge) > 0 && (
                <div className="flex justify-between gap-8">
                  <dt className="text-muted">COD handling</dt>
                  <dd className="font-semibold">{formatINR(Number(order.codCharge), true)}</dd>
                </div>
              )}
              <div className="mt-2 flex justify-between gap-8 border-t-2 border-navy-700 pt-2">
                <dt className="font-display font-extrabold text-navy-700">Grand Total</dt>
                <dd className="font-display text-lg font-extrabold text-navy-700">
                  {formatINR(Number(order.totalAmount), true)}
                </dd>
              </div>
            </dl>

            <div className="mt-8 text-right">
              <p className="text-muted">For {BRAND.legalName}</p>
              <p className="mt-8 border-t border-navy-200 pt-1 text-[11px] text-muted">
                Authorised Signatory
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-6 border-t border-navy-100 pt-3 text-center text-[11px] text-muted">
          This is a computer-generated invoice and is valid without a physical signature.
          <br />
          Questions? Call {contact.primaryPhone} · {contact.hours}
        </footer>
      </article>

      {/* Print styling: clean white sheet, no browser chrome bleed */}
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: #fff !important; }
          header nav, footer nav { display: none !important; }
        }
      `}</style>
    </main>
  );
}
