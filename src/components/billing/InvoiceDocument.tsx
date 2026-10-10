/**
 * INVOICE DOCUMENT — jo kaagaz pe chhapta hai.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Owner ke diye hue reference PDF se hu-ba-hu match:
 *   Header / titles blue  #0056b3
 *   Table header grey     #f4f7f6
 *   Text                  #333 aur #555
 *   Stamp red             #d32f2f
 *
 * ── PDF KAISE BANTA HAI (aur html2pdf.js kyun nahi liya) ──────────────────
 * Reference code me `html2pdf.js` CDN se load ho raha tha. Woh page ka
 * SCREENSHOT leta hai (html2canvas) aur us tasveer ko PDF me chipka deta hai.
 * Natije:
 *   • text select/copy nahi hota, na search hota hai
 *   • 96 DPI pe raster — print karne pe ₹ aur chhote akshar dhundle
 *   • file 400–900 KB (text PDF 30–60 KB me ho jaata hai)
 *   • CDN down = button kaam nahi karega
 *   • ek aur third-party script = ek aur supply-chain risk
 *
 * Isliye browser ka apna print engine use ho raha hai: "Print → Save as PDF".
 * Wahi engine owner ke diye reference PDF ne bhi use kiya tha (WeasyPrint ne
 * bhi yahi CSS model chalaya). Natija: vector text, 40 KB file, bilkul sharp,
 * zero dependency, offline bhi chalta hai.
 *
 * ── RANG PRINT ME KYUN AATE HAIN ──────────────────────────────────────────
 * Browser default me background colour print nahi karta (ink bachane ke liye).
 * `print-color-adjust: exact` usko force karta hai, warna neela header aur
 * laal stamp safed chhap jaate.
 *
 * ── INLINE STYLE KYUN, TAILWIND KYUN NAHI ────────────────────────────────
 * Print me Tailwind ki utility classes par bharosa nahi kiya ja sakta —
 * purge, dark mode aur `@media print` ka order milke rang uda dete hain.
 * Bill ek legal kaagaz hai; yahan "shayad theek chhapega" nahi chalta.
 */
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';
import { billINR, longDateIN, warrantyInfo } from '@/lib/billing/compute';

const BLUE = '#0056b3';
const GREY_BG = '#f4f7f6';
const SOFT_BG = '#f9f9f9';
const LINE = '#dddddd';
const TEXT = '#333333';
const MUTED = '#555555';
const RED = '#d32f2f';

export interface InvoiceItemView {
  description: string;
  detailNote?: string | null;
  hsnCode?: string | null;
  serialNumber?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface InvoiceUnitView {
  brand: string;
  model?: string | null;
  serialNumber?: string | null;
  installedOn: Date | string;
  partsWarrantyMonths: number;
  serviceWarrantyMonths: number;
  freeServicesTotal: number;
  freeServicesUsed: number;
  nextServiceDue?: Date | string | null;
}

export interface InvoiceView {
  billNumber: string;
  type: string;
  status: string;
  issueDate: Date | string;
  dueDate?: Date | string | null;

  customerName: string;
  customerPhone: string;
  customerAltPhone?: string | null;
  customerAddress?: string | null;
  customerGstin?: string | null;

  items: InvoiceItemView[];

  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  taxMode: string;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  amountInWords?: string | null;

  paymentMode?: string | null;
  terms: string[];
  showStamp: boolean;
  stampText: string;
  showSign: boolean;
  footerNote?: string | null;

  units?: InvoiceUnitView[];
}

const PAY_LABEL: Record<string, string> = {
  CASH: 'Cash',
  UPI: 'UPI',
  CARD: 'Card',
  BANK: 'Bank Transfer',
  CHEQUE: 'Cheque',
  PENDING: 'Pending',
};

export default function InvoiceDocument({ bill }: { bill: InvoiceView }) {
  const addressLine = [
    CONTACT.address.locality,
    CONTACT.address.street,
    `${CONTACT.address.city} - ${CONTACT.address.pincode}`,
  ].join(', ');

  const gstOn = bill.taxRate > 0 && bill.taxMode !== 'NONE';
  const showHsn = gstOn && bill.items.some((i) => !!i.hsnCode);
  const cancelled = bill.status === 'CANCELLED';

  const th: React.CSSProperties = {
    border: `1px solid ${LINE}`,
    padding: '8px 11px',
    textAlign: 'left',
    background: GREY_BG,
    color: BLUE,
    fontWeight: 700,
    fontSize: '10.5pt',
  };
  const td: React.CSSProperties = {
    border: `1px solid ${LINE}`,
    padding: '8px 11px',
    fontSize: '10.5pt',
    verticalAlign: 'top',
  };
  const totalLabel: React.CSSProperties = {
    ...td,
    textAlign: 'right',
    background: SOFT_BG,
    fontWeight: 600,
    color: MUTED,
  };
  const totalValue: React.CSSProperties = { ...td, textAlign: 'right', background: SOFT_BG, fontWeight: 600 };

  return (
    <div
      id="invoice-content"
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: TEXT,
        background: '#ffffff',
        maxWidth: '210mm',
        margin: '0 auto',
        padding: '12mm 12mm',
        boxSizing: 'border-box',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div
        style={{
          textAlign: 'center',
          borderBottom: `3px solid ${BLUE}`,
          paddingBottom: '13px',
          marginBottom: '18px',
        }}
      >
        <h1
          style={{
            color: BLUE,
            margin: 0,
            fontSize: '21pt',
            lineHeight: 1.12,
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          AquaPerl RO Buy Repair and Service
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: '10pt', color: MUTED }}>{addressLine}</p>
        <p style={{ margin: '2px 0 0', fontSize: '10pt', color: MUTED }}>
          Mobile: {CONTACT.primaryPhone} | {CONTACT.secondaryPhone}
        </p>
      </div>

      {/* ── TITLE ──────────────────────────────────────────────────────── */}
      <h2
        style={{
          textAlign: 'center',
          margin: '0 0 16px',
          fontSize: '15pt',
          letterSpacing: '1.5px',
          color: cancelled ? RED : TEXT,
          fontWeight: 700,
        }}
      >
        {cancelled ? 'CANCELLED BILL' : 'BILL / INVOICE'}
      </h2>

      {/* ── BILLED TO / META ───────────────────────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'top', width: '58%', padding: 0 }}>
              <p style={{ margin: 0, color: BLUE, fontWeight: 700, fontSize: '10.5pt' }}>Billed To:</p>
              <p style={{ margin: '2px 0 0', color: BLUE, fontWeight: 700, fontSize: '11.5pt' }}>
                {bill.customerName}
              </p>
              {bill.customerAddress ? (
                <p style={{ margin: '4px 0 0', fontSize: '10pt', color: TEXT, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                  {bill.customerAddress}
                </p>
              ) : null}
              <p style={{ margin: '4px 0 0', fontSize: '10pt', color: TEXT }}>
                Mobile: {bill.customerPhone}
                {bill.customerAltPhone ? ` | ${bill.customerAltPhone}` : ''}
              </p>
              {bill.customerGstin ? (
                <p style={{ margin: '2px 0 0', fontSize: '9.5pt', color: MUTED }}>GSTIN: {bill.customerGstin}</p>
              ) : null}
            </td>
            <td style={{ verticalAlign: 'top', textAlign: 'right', padding: 0 }}>
              <p style={{ margin: 0, fontSize: '10.5pt' }}>
                <span style={{ color: BLUE, fontWeight: 700 }}>Invoice Date:</span>{' '}
                <span>{longDateIN(bill.issueDate)}</span>
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '10.5pt' }}>
                <span style={{ color: BLUE, fontWeight: 700 }}>Invoice No:</span>{' '}
                <span>{bill.billNumber}</span>
              </p>
              {bill.dueDate ? (
                <p style={{ margin: '4px 0 0', fontSize: '10.5pt' }}>
                  <span style={{ color: BLUE, fontWeight: 700 }}>Due Date:</span>{' '}
                  <span>{longDateIN(bill.dueDate)}</span>
                </p>
              ) : null}
              {bill.paymentMode ? (
                <p style={{ margin: '4px 0 0', fontSize: '10.5pt' }}>
                  <span style={{ color: BLUE, fontWeight: 700 }}>Payment:</span>{' '}
                  <span>{PAY_LABEL[bill.paymentMode] ?? bill.paymentMode}</span>
                </p>
              ) : null}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── ITEMS ──────────────────────────────────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <thead>
          <tr>
            <th style={{ ...th, width: '48px', textAlign: 'center' }}>S.No.</th>
            <th style={th}>Product Description</th>
            {showHsn ? <th style={{ ...th, width: '70px', textAlign: 'center' }}>HSN</th> : null}
            <th style={{ ...th, width: '58px', textAlign: 'center' }}>Qty</th>
            <th style={{ ...th, width: '110px', textAlign: 'right' }}>
              Unit Price{' '}
              <span style={{ display: 'block', fontWeight: 600 }}>(INR)</span>
            </th>
            <th style={{ ...th, width: '110px', textAlign: 'right' }}>
              Total{' '}
              <span style={{ display: 'block', fontWeight: 600 }}>(INR)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((it, i) => (
            <tr key={i}>
              <td style={{ ...td, textAlign: 'center' }}>{i + 1}</td>
              <td style={td}>
                <strong style={{ fontSize: '10.5pt' }}>{it.description}</strong>
                {it.detailNote ? (
                  <span style={{ display: 'block', marginTop: '3px', fontSize: '9pt', color: MUTED }}>
                    {it.detailNote}
                  </span>
                ) : null}
                {it.serialNumber ? (
                  <span style={{ display: 'block', marginTop: '2px', fontSize: '9pt', color: MUTED }}>
                    Sr. No: {it.serialNumber}
                  </span>
                ) : null}
              </td>
              {showHsn ? <td style={{ ...td, textAlign: 'center', fontSize: '9.5pt' }}>{it.hsnCode ?? '—'}</td> : null}
              <td style={{ ...td, textAlign: 'center' }}>{billINR(it.quantity)}</td>
              <td style={{ ...td, textAlign: 'right' }}>{billINR(it.unitPrice)}</td>
              <td style={{ ...td, textAlign: 'right' }}>{billINR(it.lineTotal)}</td>
            </tr>
          ))}

          {bill.discountAmount > 0 || gstOn || bill.roundOff !== 0 ? (
            <tr>
              <td style={totalLabel} colSpan={showHsn ? 5 : 4}>
                Subtotal
              </td>
              <td style={totalValue}>{billINR(bill.subtotal)}</td>
            </tr>
          ) : null}

          {bill.discountAmount > 0 ? (
            <tr>
              <td style={totalLabel} colSpan={showHsn ? 5 : 4}>
                Discount
              </td>
              <td style={{ ...totalValue, color: RED }}>− {billINR(bill.discountAmount)}</td>
            </tr>
          ) : null}

          {gstOn && bill.taxMode === 'CGST_SGST' ? (
            <>
              <tr>
                <td style={totalLabel} colSpan={showHsn ? 5 : 4}>
                  CGST @ {billINR(bill.taxRate / 2)}%
                </td>
                <td style={totalValue}>{billINR(bill.taxAmount / 2)}</td>
              </tr>
              <tr>
                <td style={totalLabel} colSpan={showHsn ? 5 : 4}>
                  SGST @ {billINR(bill.taxRate / 2)}%
                </td>
                <td style={totalValue}>{billINR(bill.taxAmount / 2)}</td>
              </tr>
            </>
          ) : null}

          {gstOn && bill.taxMode === 'IGST' ? (
            <tr>
              <td style={totalLabel} colSpan={showHsn ? 5 : 4}>
                IGST @ {billINR(bill.taxRate)}%
              </td>
              <td style={totalValue}>{billINR(bill.taxAmount)}</td>
            </tr>
          ) : null}

          {bill.roundOff !== 0 ? (
            <tr>
              <td style={totalLabel} colSpan={showHsn ? 5 : 4}>
                Round Off
              </td>
              <td style={totalValue}>
                {bill.roundOff > 0 ? '+' : '−'} {billINR(Math.abs(bill.roundOff))}
              </td>
            </tr>
          ) : null}

          <tr>
            <td
              style={{
                ...td,
                textAlign: 'right',
                background: SOFT_BG,
                fontWeight: 700,
                fontSize: '12pt',
              }}
              colSpan={showHsn ? 5 : 4}
            >
              Grand Total
            </td>
            <td style={{ ...td, textAlign: 'right', background: SOFT_BG, fontWeight: 700, fontSize: '12pt' }}>
              ₹{billINR(bill.grandTotal)}
            </td>
          </tr>

          {bill.amountPaid > 0 && bill.balanceDue > 0 ? (
            <>
              <tr>
                <td style={totalLabel} colSpan={showHsn ? 5 : 4}>
                  Amount Paid
                </td>
                <td style={{ ...totalValue, color: '#15803d' }}>₹{billINR(bill.amountPaid)}</td>
              </tr>
              <tr>
                <td style={{ ...totalLabel, color: RED }} colSpan={showHsn ? 5 : 4}>
                  Balance Due
                </td>
                <td style={{ ...totalValue, color: RED }}>₹{billINR(bill.balanceDue)}</td>
              </tr>
            </>
          ) : null}

          {bill.amountPaid <= 0 && bill.grandTotal > 0 ? (
            <tr>
              <td style={{ ...totalLabel, color: RED }} colSpan={showHsn ? 5 : 4}>
                Balance Due
              </td>
              <td style={{ ...totalValue, color: RED }}>₹{billINR(bill.balanceDue)}</td>
            </tr>
          ) : null}
        </tbody>
      </table>

      {bill.amountInWords ? (
        <p style={{ margin: '0 0 14px', fontStyle: 'italic', fontSize: '10.5pt', color: TEXT }}>
          Total Amount in Words: {bill.amountInWords}
        </p>
      ) : null}

      {/* ── WARRANTY CARD (naya — reference bill me nahi tha) ──────────── */}
      {/* Do column me isliye ki ek-item ka bill ek hi A4 page me aa jaye.
          Kaagaz bachane ke liye nahi — grahak ko dusra page milta hi nahi,
          woh pehla page fridge pe chipkata hai aur warranty usi pe honi
          chahiye. */}
      {bill.units && bill.units.length > 0 ? (
        <div
          style={{
            border: `1px solid ${LINE}`,
            borderLeft: `4px solid ${BLUE}`,
            background: SOFT_BG,
            padding: '11px 16px',
            marginBottom: '14px',
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
          }}
        >
          <p style={{ margin: '0 0 7px', color: BLUE, fontWeight: 700, fontSize: '11pt' }}>
            Warranty &amp; Service Record
          </p>
          {bill.units.map((u, i) => {
            const pw = warrantyInfo(u.installedOn, u.partsWarrantyMonths);
            const sw = warrantyInfo(u.installedOn, u.serviceWarrantyMonths);
            const cells: [string, string, boolean][] = [
              ['Machine', `${u.brand} ${u.model ?? ''}${u.serialNumber ? ` · Sr. ${u.serialNumber}` : ''}`, false],
              ['Installed On', longDateIN(u.installedOn), false],
            ];
            if (u.partsWarrantyMonths > 0) {
              cells.push(['Parts Warranty Till', `${longDateIN(pw.endsOn)} (${u.partsWarrantyMonths} months)`, false]);
            }
            if (u.serviceWarrantyMonths > 0) {
              cells.push([
                'Free Service Till',
                `${longDateIN(sw.endsOn)} (${u.freeServicesTotal - u.freeServicesUsed} of ${u.freeServicesTotal} visits left)`,
                false,
              ]);
            }
            if (u.nextServiceDue) cells.push(['Next Service Due', longDateIN(u.nextServiceDue), true]);

            const rows: [string, string, boolean][][] = [];
            for (let k = 0; k < cells.length; k += 2) rows.push(cells.slice(k, k + 2));

            return (
              <table key={i} style={{ width: '100%', borderCollapse: 'collapse', marginTop: i ? '8px' : 0 }}>
                <tbody>
                  {rows.map((pair, r) => (
                    <tr key={r}>
                      {pair.map(([label, value, strong], ci) => (
                        <td key={ci} style={{ padding: '2px 0', width: '50%', verticalAlign: 'top' }}>
                          <span style={{ fontSize: '9pt', color: MUTED }}>{label}:</span>{' '}
                          <span style={{ fontSize: '9pt', fontWeight: 700, color: strong ? BLUE : TEXT }}>{value}</span>
                        </td>
                      ))}
                      {pair.length === 1 ? <td style={{ width: '50%' }} /> : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })}
        </div>
      ) : null}

      {/* ── TERMS + STAMP ──────────────────────────────────────────────── */}
      <div style={{ position: 'relative', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        {bill.terms.length > 0 ? (
          <div
            style={{
              padding: '13px 18px',
              background: SOFT_BG,
              borderLeft: `4px solid ${BLUE}`,
            }}
          >
            <p style={{ margin: '0 0 7px', color: BLUE, fontWeight: 700, fontSize: '11.5pt' }}>
              Terms &amp; Conditions
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', listStyle: 'disc' }}>
              {bill.terms.map((t, i) => (
                <li key={i} style={{ fontSize: '9.5pt', lineHeight: 1.5, color: TEXT, marginBottom: '2px' }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {bill.showStamp && !cancelled ? (
          <div
            style={{
              position: 'absolute',
              right: '28px',
              bottom: '-28px',
              transform: 'rotate(-12deg)',
              border: `3px solid ${RED}`,
              borderRadius: '8px',
              padding: '8px 18px',
              textAlign: 'center',
              color: RED,
              background: 'rgba(255,255,255,0.72)',
            }}
          >
            <p style={{ margin: 0, fontSize: '13pt', fontWeight: 700, letterSpacing: '1px' }}>AQUAPERL RO</p>
            <p style={{ margin: '2px 0 0', fontSize: '9pt', fontWeight: 700, letterSpacing: '0.6px' }}>
              {bill.stampText}
            </p>
          </div>
        ) : null}

        {cancelled ? (
          <div
            style={{
              position: 'absolute',
              right: '28px',
              bottom: '-28px',
              transform: 'rotate(-12deg)',
              border: `3px solid ${RED}`,
              borderRadius: '8px',
              padding: '8px 18px',
              color: RED,
              background: 'rgba(255,255,255,0.72)',
            }}
          >
            <p style={{ margin: 0, fontSize: '13pt', fontWeight: 700, letterSpacing: '1px' }}>CANCELLED</p>
          </div>
        ) : null}
      </div>

      {/* ── SIGNATURES ─────────────────────────────────────────────────── */}
      {bill.showSign ? (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '42px',
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
          }}
        >
          <tbody>
            <tr>
              <td style={{ width: '50%', textAlign: 'center', padding: 0 }}>
                <p style={{ margin: 0, borderTop: `1px solid #999`, display: 'inline-block', minWidth: '58%', paddingTop: '6px', fontSize: '10pt', color: MUTED }}>
                  Customer Signature
                </p>
              </td>
              <td style={{ width: '50%', textAlign: 'center', padding: 0 }}>
                <p style={{ margin: 0, borderTop: `1px solid #999`, display: 'inline-block', minWidth: '58%', paddingTop: '6px', fontSize: '10pt', color: MUTED }}>
                  Authorised Signatory
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      ) : null}

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <div style={{ marginTop: '18px', paddingTop: '10px', borderTop: `1px solid ${LINE}`, textAlign: 'center' }}>
        {bill.footerNote ? (
          <p style={{ margin: '0 0 6px', fontSize: '9.5pt', color: TEXT }}>{bill.footerNote}</p>
        ) : null}
        <p style={{ margin: 0, fontSize: '9pt', color: MUTED }}>
          {BRAND.legalName} · {BRAND.domain} · Service helpline {CONTACT.primaryPhone} ·{' '}
          {SERVICE.city} me {SERVICE.responseTime} me technician
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '8.5pt', color: '#888' }}>
          Yeh bill warranty card bhi hai — service ke waqt dikhana zaroori hai. Computer se bana hai.
        </p>
      </div>
    </div>
  );
}
