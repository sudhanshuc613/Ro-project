/**
 * ADMIN DASHBOARD LAYOUT — the RBAC gate for every /admin/* route.
 *
 * Because this lives in the (dashboard) route group, ANY page added under
 * src/app/admin/(dashboard)/** is automatically:
 *   1. authenticated  (redirect → /admin/login)
 *   2. authorised     (role must be STAFF | ADMIN | SUPER_ADMIN)
 *   3. wrapped in the Sidebar + Topbar shell
 *   4. excluded from search-engine indexing
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminSidebar from '@/components/admin/Sidebar';
import AdminTopbar from '@/components/admin/Topbar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: { default: 'Admin — Aqua Perl', template: '%s | Aqua Perl Admin' },
  robots: { index: false, follow: false, nocache: true },
};

const ADMIN_ROLES = ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const;

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/admin/login?callbackUrl=/admin');
  if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number])) {
    redirect('/?error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar role={session.user.role} />

      {/* Sidebar is fixed 260px on lg+ */}
      <div className="lg:pl-[260px]">
        <AdminTopbar user={session.user} />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
