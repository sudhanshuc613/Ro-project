'use client';

/**
 * Print page ka upar wala toolbar.
 *
 * `@media print` me poora toolbar gayab ho jaata hai (`no-print` class),
 * isliye kaagaz pe sirf bill chhapta hai — koi button nahi.
 *
 * "PDF banao" alag button nahi hai kyunki Chrome/Edge ke print dialog me
 * "Destination: Save as PDF" pehle se hota hai. Ek hi click, aur PDF ka
 * text select bhi hota hai. Alag library se banaya hua PDF sirf tasveer
 * hota — dhundla aur 10 guna bada.
 */
import { useCallback, useState } from 'react';

interface Props {
  billNumber: string;
  customerName: string;
  amount: string;
  shareUrl?: string;
  whatsappPhone?: string;
  backHref?: string;
  editHref?: string;
}

export default function PrintBar({
  billNumber,
  customerName,
  amount,
  shareUrl,
  whatsappPhone,
  backHref,
  editHref,
}: Props) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt('Link copy karein:', shareUrl);
    }
  }, [shareUrl]);

  const waText = encodeURIComponent(
    `Namaste ${customerName} ji,\n\nAapka bill ${billNumber} taiyaar hai — ₹${amount}.\n` +
      (shareUrl ? `\nBill yahan dekhein: ${shareUrl}\n` : '') +
      `\nAqua Perl RO Service, Buddha Colony Patna\nHelpline 8969821440`,
  );
  const waHref = whatsappPhone
    ? `https://wa.me/91${whatsappPhone}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          @page { size: A4; margin: 10mm; }
        }
        @media screen {
          .paper {
            box-shadow: 0 10px 40px rgba(2,32,71,.13);
            margin: 18px auto 48px;
            background: #fff;
            border-radius: 6px;
          }
          body { background: #eef2f7; }
        }
      `}</style>

      <div className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center gap-2 px-4 py-3">
          {backHref ? (
            <a
              href={backHref}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ← Wapas
            </a>
          ) : null}

          <button
            onClick={() => window.print()}
            className="rounded-lg bg-[#0056b3] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#004492]"
          >
            🖨️ Print / PDF save karo
          </button>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-bold text-white hover:brightness-95"
          >
            WhatsApp pe bhejo
          </a>

          {shareUrl ? (
            <button
              onClick={copy}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {copied ? '✅ Link copy ho gaya' : '🔗 Link copy karo'}
            </button>
          ) : null}

          {editHref ? (
            <a
              href={editHref}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ✏️ Bill badlo
            </a>
          ) : null}

          <p className="ml-auto hidden text-xs text-slate-500 sm:block">
            Print dialog me <strong>Destination → Save as PDF</strong> chunein
          </p>
        </div>
      </div>
    </>
  );
}
