'use client';

/**
 * Print / Save-as-PDF trigger for the invoice page.
 *
 * We deliberately use the browser's own print dialog instead of shipping a
 * PDF library. Reasons:
 *  - Zero extra bundle weight (pdfkit/puppeteer would add megabytes and,
 *    in puppeteer's case, cannot run on Vercel's serverless runtime at all).
 *  - "Save as PDF" is a built-in destination in Chrome/Edge/Safari on both
 *    desktop and Android, so the customer still gets a real PDF file.
 *  - The invoice stays a normal, indexable, accessible HTML page.
 */
export default function PrintButton({
  label = '🖨️ Print / Save as PDF',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ||
        'rounded-xl bg-navy-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-navy-600'
      }
    >
      {label}
    </button>
  );
}
