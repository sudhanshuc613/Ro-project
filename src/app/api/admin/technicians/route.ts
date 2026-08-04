import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/server/services/audit.service';

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile'),
  employeeCode: z.string().trim().min(2).max(24),
  maxDailyJobs: z.number().int().min(1).max(30).default(8),
  skills: z.array(z.string()).default([]),
  servicePincodes: z.array(z.string().regex(/^\d{6}$/)).default([]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const tech = await prisma.technician.create({
      data: { ...parsed.data, joinedAt: new Date(), isActive: true },
    });

    await logAudit({
      actorId: session.user.id,
      action: 'technician.create',
      entityType: 'TECHNICIAN',
      entityId: tech.id,
      afterData: tech,
    });

    return NextResponse.json({ success: true, technician: tech }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ message: 'This employee code is already in use' }, { status: 409 });
    }
    console.error('[technicians:POST]', err);
    return NextResponse.json({ message: 'Could not add technician' }, { status: 500 });
  }
}
