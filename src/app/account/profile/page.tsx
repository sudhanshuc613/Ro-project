import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN } from '@/lib/utils/format';
import { SectionHeader } from '@/components/account/ui';
import ProfileForm from '@/components/account/ProfileForm';

export const metadata: Metadata = {
  title: 'My Profile',
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: {
      fullName: true, email: true, phone: true, createdAt: true,
      whatsappOptIn: true, marketingOptIn: true, passwordHash: true,
      lifetimeValue: true, totalOrders: true, totalServices: true,
    },
  });
  if (!user) return null;

  return (
    <div className="space-y-7">
      <div>
        <SectionHeader title="Profile" subtitle="Your details and communication preferences" />
        <ProfileForm
          initial={{
            fullName: user.fullName,
            email: user.email ?? '',
            phone: user.phone,
            whatsappOptIn: user.whatsappOptIn,
            marketingOptIn: user.marketingOptIn,
          }}
          hasPassword={Boolean(user.passwordHash)}
        />
      </div>

      <section>
        <SectionHeader title="Your history with us" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: 'Customer since', v: formatDateIN(user.createdAt) },
            { l: 'Orders placed', v: String(user.totalOrders) },
            { l: 'Services booked', v: String(user.totalServices) },
            { l: 'Total spent', v: formatINR(Number(user.lifetimeValue)) },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-navy-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{s.l}</p>
              <p className="tnum mt-1 font-display text-lg font-extrabold text-navy-700">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-red-50 p-5 ring-1 ring-red-200">
        <h3 className="font-display font-bold text-red-900">Close my account</h3>
        <p className="mt-1 text-sm text-red-800 text-pretty">
          We keep order and service records for GST and warranty purposes even after an
          account is closed — that is a legal requirement, not a choice. To close your
          account, message us on WhatsApp and we will confirm within 48 hours.
        </p>
      </section>
    </div>
  );
}
