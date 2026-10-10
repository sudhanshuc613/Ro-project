/**
 * /admin/rates — spare parts ka rate yahin se badlo, bina deploy ke.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Owner: "or bhi mujhe control dena mujhe jaise ki pricing wagreh sab ke
 *         controls kar saku ... ek proper ecommerce jaisa"
 *
 * Yahan se badla rate turant dikhta hai:
 *   • /ro-service-in-patna ka spare-parts reference table
 *   • wahi rate jo customer rate poochne par dikhta hai
 *
 * 🔴 RANGE hi rehta hai, ek fix number nahi — jaan boojh kar. Owner ka apna
 *    niyam: "spare parts wagreh ka tu refence diya kar itna se itna tak lag
 *    sakta hai", warna customer baad me website dikha kar jhagda karta hai.
 */
import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { buildRateRows, type RateMap } from '@/lib/seo/rate-overrides';
import RateCardManager from '@/components/admin/RateCardManager';
import { SERVICE } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Spare Part Rates',
  robots: { index: false, follow: false },
};

export default async function RatesPage() {
  let overrides: RateMap = {};
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: 'rateCard' } });
    overrides = (row?.value as unknown as RateMap) ?? {};
  } catch {
    overrides = {};
  }
  const rows = buildRateRows(overrides);
  const changed = rows.filter((r) => r.isOverridden).length;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-black text-navy-900">Spare Part Rates</h1>
        <p className="mt-1 text-sm text-navy-600">
          Market ka rate badle to yahin se badlo. Save karte hi site par live &mdash; koi deploy nahi.
        </p>
        <p className="mt-2">
          <span className="rounded-full bg-navy-900 px-3 py-1 text-xs font-bold text-white">
            {rows.length} parts
          </span>{' '}
          <span className="rounded-full bg-aqua-100 px-3 py-1 text-xs font-bold text-aqua-800">
            {changed} badle hue
          </span>
        </p>
      </header>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-black text-navy-900">Do cheez yaad rakhna</h2>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-navy-700">
          <li>
            <strong>1. Range hi daalna, ek number nahi.</strong> Site par ye &ldquo;itne se itne
            tak&rdquo; ke roop me dikhta hai. Ek fix number likhoge to customer bill dekh kar
            kahega &ldquo;aapne to website par ye likha tha&rdquo;.
          </li>
          <li>
            <strong>2. Visit charge yahan nahi hai.</strong> Wo{' '}
            <a href="/admin/settings" className="font-bold text-aqua-600 hover:underline">
              Settings
            </a>{' '}
            me hai (abhi ₹{SERVICE.visitCharge}), kyunki wo poori site par ek fix number ke roop
            me dikhta hai, range nahi.
          </li>
        </ul>
      </section>

      <RateCardManager initial={rows} />
    </div>
  );
}
