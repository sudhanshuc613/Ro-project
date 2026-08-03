import { prisma } from '@/lib/db/prisma';
import { CONTACT, SERVICE, SHIPPING } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const [pincodes, technicians, products, categories] = await Promise.all([
    prisma.pincode.count({ where: { isServiceAvailable: true } }),
    prisma.technician.count({ where: { isActive: true } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.category.count({ where: { isActive: true } }),
  ]);

  const rows = [
    ['Primary phone', CONTACT.primaryPhone],
    ['Secondary phone', CONTACT.secondaryPhone],
    ['WhatsApp', CONTACT.whatsapp],
    ['Email', CONTACT.email],
    ['Service city', `${SERVICE.city}, ${SERVICE.state}`],
    ['Visit charge', `₹${SERVICE.visitCharge}`],
    ['Service warranty', `${SERVICE.warrantyDays} days`],
    ['Free shipping above', `₹${SHIPPING.freeAbove.toLocaleString('en-IN')}`],
    ['Flat shipping rate', `₹${SHIPPING.flatRate}`],
    ['COD charge', `₹${SHIPPING.codCharge}`],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Settings</h1>
        <p className="mt-0.5 text-sm text-muted">Business configuration</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Serviceable pincodes', pincodes, '📍'],
          ['Active technicians', technicians, '👷'],
          ['Products', products, '📦'],
          ['Categories', categories, '🗂️'],
        ].map(([label, value, icon]) => (
          <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
            <p className="mt-1.5 font-display text-2xl font-extrabold text-navy-700">
              {String(icon)} {String(value)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-display font-bold text-navy-700">Business Configuration</h2>
        <p className="mt-1 text-sm text-muted">
          These values come from <code className="rounded bg-slate-100 px-1.5 py-0.5">src/lib/constants.ts</code>.
          Change them there and redeploy — they update across the whole site.
        </p>
        <table className="mt-4 w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {rows.map(([k, v]) => (
              <tr key={k}>
                <th scope="row" className="py-2.5 text-left font-medium text-muted">{k}</th>
                <td className="py-2.5 text-right font-semibold text-navy-700">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
