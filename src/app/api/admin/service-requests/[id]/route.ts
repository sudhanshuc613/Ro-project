/**
 * PATCH /api/admin/service-requests/[id] — assign technician / change status.
 *
 *   { action: 'assign', technicianId }
 *   { action: 'status', status, note?, partsCharge?, labourCharge?, resolutionNote? }
 *
 * Both fire a WhatsApp update to the customer so they always know what's
 * happening — this is the single biggest complaint about local RO services
 * in Patna ("technician said he's coming, 4 hours passed").
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { assignTechnician, updateServiceStatus } from '@/server/services/service.service';
import { logAudit } from '@/server/services/audit.service';

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('assign'), technicianId: z.string().uuid() }),
  z.object({
    action: z.literal('status'),
    status: z.enum(['NEW','CONTACTED','SCHEDULED','ASSIGNED','IN_PROGRESS','ON_HOLD_PARTS','COMPLETED','CANCELLED','NO_RESPONSE']),
    note: z.string().max(500).optional(),
    partsCharge: z.number().nonnegative().optional(),
    labourCharge: z.number().nonnegative().optional(),
    resolutionNote: z.string().max(1000).optional(),
  }),
]);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request', errors: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const d = parsed.data;

  try {
    if (d.action === 'assign') {
      await assignTechnician(params.id, d.technicianId, session.user.id);
      await logAudit({
        actorId: session.user.id,
        action: 'service.assign',
        entityType: 'SERVICE_REQUEST',
        entityId: params.id,
        afterData: { technicianId: d.technicianId },
      });
      return NextResponse.json({
        success: true,
        message: 'Technician assigned — customer notified on WhatsApp',
      });
    }

    const updated = await updateServiceStatus(params.id, d.status, session.user.id, {
      note: d.note,
      partsCharge: d.partsCharge,
      labourCharge: d.labourCharge,
      resolutionNote: d.resolutionNote,
    });

    await logAudit({
      actorId: session.user.id,
      action: 'service.status',
      entityType: 'SERVICE_REQUEST',
      entityId: params.id,
      afterData: updated,
    });

    return NextResponse.json({
      success: true,
      message: `Status changed to ${d.status.replace(/_/g, ' ')}`,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Action failed' },
      { status: 400 },
    );
  }
}
