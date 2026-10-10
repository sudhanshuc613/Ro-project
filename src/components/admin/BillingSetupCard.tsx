'use client';

/**
 * "Database taiyaar karo" card.
 *
 * Billing ke liye 7 nayi tables chahiye. Vercel pe deploy ke waqt migration
 * nahi chalti (build script sirf `prisma generate && next build` hai), isliye
 * pehli baar ek button dabana padta hai. Button sirf CREATE TABLE IF NOT
 * EXISTS chalata hai — kuch drop nahi hota, purana data bilkul nahi chhuta.
 *
 * Dobara dabane se bhi kuch nahi bigadta. Agar button kisi wajah se fail ho
 * jaye to neeche manual raasta bhi likha hai (Neon SQL Editor).
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function BillingSetupCard({ missing }: { missing: string[] }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function run() {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/billing/setup', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ready) {
        toast.success('Ho gaya! Billing taiyaar hai.');
        router.refresh();
      } else {
        toast.error(data.message ?? 'Nahi ban payi. Neeche wala manual tarika try karein.');
      }
    } catch {
      toast.error('Server se baat nahi ho payi');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6">
      <p className="text-3xl">🗄️</p>
      <h2 className="mt-2 font-display text-xl font-bold text-navy-700">
        Billing ke liye ek baar database taiyaar karna hoga
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-700">
        Bill, grahak record, machine warranty aur AMC ke liye <strong>7 nayi tables</strong> chahiye.
        Neeche wala button sirf <code className="rounded bg-white px-1.5 py-0.5 text-[12px]">CREATE TABLE IF NOT EXISTS</code>{' '}
        chalata hai — ek bhi purani table ko haath nahi lagata, na koi data delete hota hai.
        Dobara daba dein to bhi kuch nahi bigadta.
      </p>

      {missing.length > 0 && (
        <p className="mt-3 text-xs text-slate-600">
          Abhi nahi bani: <span className="font-mono">{missing.join(', ')}</span>
        </p>
      )}

      <button
        onClick={run}
        disabled={busy}
        className="mt-4 rounded-xl bg-navy-700 px-6 py-3 text-sm font-bold text-white shadow hover:bg-navy-600 disabled:opacity-50"
      >
        {busy ? 'Ban raha hai…' : '🗄️ Database taiyaar karo'}
      </button>

      <details className="mt-5 text-sm">
        <summary className="cursor-pointer font-semibold text-navy-700">
          Agar button kaam na kare to manual tarika
        </summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-700">
          <li>
            Project folder me file kholein:{' '}
            <code className="rounded bg-white px-1.5 py-0.5 text-[12px]">prisma/migrations/01_billing/migration.sql</code>
          </li>
          <li>Poori file copy karein</li>
          <li>
            <a href="https://console.neon.tech" target="_blank" rel="noopener noreferrer" className="text-aqua-700 underline">
              console.neon.tech
            </a>{' '}
            → apna project → <strong>SQL Editor</strong>
          </li>
          <li>Paste karein → <strong>Run</strong></li>
          <li>Yahan wapas aa kar page refresh karein</li>
        </ol>
      </details>
    </div>
  );
}
