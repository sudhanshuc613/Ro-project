'use client';

/**
 * Bill list ki har line ke buttons: print · WhatsApp · mitao.
 *
 * Delete pe do confirm hain — ek browser ka confirm, aur server pe role
 * check (sirf ADMIN). Bill ek hisaab-kitaab ka kaagaz hai; galti se mit
 * jaana sabse mehnga nuksaan hai.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { BRAND } from '@/lib/constants';
import { billINR } from '@/lib/billing/compute';

interface Props {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  token: string | null;
}

export default function BillRowActions({ id, billNumber, customerName, customerPhone, amount, token }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const shareUrl = token ? `${BRAND.url}/bill/${token}` : null;
  const waText = encodeURIComponent(
    `Namaste ${customerName} ji,\n\nAapka bill ${billNumber} taiyaar hai — ₹${billINR(amount)}.\n` +
      (shareUrl ? `\nBill yahan dekhein: ${shareUrl}\n` : '') +
      `\nAqua Perl RO Service, Buddha Colony Patna\nHelpline 8969821440`,
  );

  async function remove() {
    if (!window.confirm(`Bill ${billNumber} hamesha ke liye mit jayega. Pakka?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/billing/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${billNumber} mit gaya`);
        router.refresh();
      } else {
        toast.error(data?.message ?? 'Nahi mita');
      }
    } catch {
      toast.error('Server se baat nahi ho payi');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/print/${id}`}
        title="Print / PDF"
        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        🖨️
      </Link>
      <a
        href={`https://wa.me/91${customerPhone}?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp pe bhejo"
        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-[#128C7E] hover:bg-green-50"
      >
        WA
      </a>
      <Link
        href={`/admin/billing/${id}`}
        title="Badlo"
        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        ✏️
      </Link>
      <button
        onClick={remove}
        disabled={busy}
        title="Mitao"
        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
      >
        🗑
      </button>
    </div>
  );
}
