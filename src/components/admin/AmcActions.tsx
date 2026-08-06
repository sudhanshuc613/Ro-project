'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AmcActions({
  id, phone, customerName, canRenew,
}: {
  id: string;
  phone: string;
  customerName: string;
  canRenew: boolean;
}) {
  const [busy, setBusy] = useState<'renew' | 'visit' | null>(null);
  const router = useRouter();

  async function act(action: 'renew' | 'consume-visit') {
    setBusy(action === 'renew' ? 'renew' : 'visit');
    try {
      const res = await fetch(`/api/admin/amc/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Action failed');
      toast.success(data.message);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <button
        onClick={() => act('consume-visit')}
        disabled={busy !== null}
        className="rounded-lg bg-aqua-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-aqua-600 disabled:opacity-60"
      >
        {busy === 'visit' ? '…' : '✓ Mark visit done'}
      </button>

      {canRenew && (
        <button
          onClick={() => act('renew')}
          disabled={busy !== null}
          className="rounded-lg bg-cta-green px-3 py-1.5 text-xs font-bold text-white transition hover:bg-cta-greenDark disabled:opacity-60"
        >
          {busy === 'renew' ? '…' : '↻ Renew 1 year'}
        </button>
      )}

      <a
        href={`https://wa.me/91${phone}?text=${encodeURIComponent(
          `Hi ${customerName.split(' ')[0]}, this is Aqua Perl regarding your AMC.`,
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-center text-xs font-bold text-emerald-700 hover:bg-emerald-100"
      >
        💬 WhatsApp
      </a>
    </div>
  );
}
