import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { computeMachineHealth } from '@/server/services/machine.service';
import MachineManager, { type MachineRow } from '@/components/account/MachineManager';
import { SectionHeader } from '@/components/account/ui';

export const metadata: Metadata = {
  title: 'My RO Machines',
  robots: { index: false, follow: false },
};

export default async function MachinesPage() {
  const session = await getServerSession(authOptions);
  const machines = await prisma.customerMachine.findMany({
    where: { userId: session!.user.id, isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  const health = machines.map(computeMachineHealth);

  // Decimal/Date are not serialisable across the server→client boundary.
  const rows: MachineRow[] = machines.map((m) => ({
    id: m.id,
    nickname: m.nickname,
    brand: m.brand,
    model: m.model,
    serialNumber: m.serialNumber,
    purchaseDate: m.purchaseDate?.toISOString() ?? null,
    installedDate: m.installedDate?.toISOString() ?? null,
    warrantyEndsOn: m.warrantyEndsOn?.toISOString() ?? null,
    capacityLitres: m.capacityLitres ? String(m.capacityLitres) : null,
    purificationTech: m.purificationTech,
    inletTds: m.inletTds,
    outletTds: m.outletTds,
    tdsCheckedOn: m.tdsCheckedOn?.toISOString() ?? null,
    sedimentChangedOn: m.sedimentChangedOn?.toISOString() ?? null,
    carbonChangedOn: m.carbonChangedOn?.toISOString() ?? null,
    membraneChangedOn: m.membraneChangedOn?.toISOString() ?? null,
    uvChangedOn: m.uvChangedOn?.toISOString() ?? null,
    notes: m.notes,
  }));

  return (
    <div>
      <SectionHeader
        title="My RO Machines"
        subtitle="Track filter age and water quality — we'll warn you before something fails"
      />
      <MachineManager machines={rows} health={JSON.parse(JSON.stringify(health))} />
    </div>
  );
}
