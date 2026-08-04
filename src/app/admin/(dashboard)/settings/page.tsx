import { getAllSettings } from '@/lib/settings';
import SettingsForm from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Site Settings' };

/**
 * Site Settings — change phone numbers, visit charge, hours and hero banner
 * text live, without editing code or redeploying.
 */
export default async function AdminSettingsPage() {
  const { contact, service, banner } = await getAllSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Site Settings</h1>
        <p className="mt-0.5 text-sm text-muted">
          These values appear across the whole website. Saving updates the live site within a minute.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-bold">⚠️ Changing your phone number?</p>
        <p className="mt-1">
          Update it on your Google Business Profile and all directory listings too.
          Mismatched numbers across the web hurt local rankings significantly.
        </p>
      </div>

      <SettingsForm contact={contact} service={service} banner={banner} />
    </div>
  );
}
