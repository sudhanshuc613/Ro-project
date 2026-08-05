import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import AddressManager, { type AddressRow } from '@/components/account/AddressManager';
import { SectionHeader } from '@/components/account/ui';

export const metadata: Metadata = {
  title: 'My Addresses',
  robots: { index: false, follow: false },
};

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);
  const rows = await prisma.address.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true, label: true, contactName: true, contactPhone: true,
      line1: true, line2: true, landmark: true, city: true, state: true,
      pincode: true, isDefault: true,
    },
  });

  return (
    <div>
      <SectionHeader
        title="Saved Addresses"
        subtitle="Used for both product delivery and technician visits"
      />
      <AddressManager addresses={rows as AddressRow[]} />
    </div>
  );
}
