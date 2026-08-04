/**
 * PATCH /api/admin/customers/[id] — CRM actions.
 *   { action: 'ban' }    → soft-delete; blocks sign-in
 *   { action: 'unban' }
 *   { action: 'note', notes } → internal note
 *
 * Ban uses deletedAt rather than a hard delete so order history and invoices
 * stay intact for accounting.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/server/services/audit.service';

const schema = z.object({
  action: z.enum(['ban', 'unban', 'note']),
  notes: z.string().max(1000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 422 });
  }
  const { action, notes } = parsed.data;

  const before = await prisma.user.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ message: 'Customer not found' }, { status: 404 });

  // Guard: never let an admin ban another admin through the CRM
  if (action === 'ban' && before.role !== 'CUSTOMER') {
    return NextResponse.json(
      { message: 'Only customer accounts can be banned here' },
      { status: 403 },
    );
  }

  const data =
    action === 'ban' ? { deletedAt: new Date() }
    : action === 'unban' ? { deletedAt: null }
    : { notes: notes ?? null };

  const updated = await prisma.user.update({ where: { id: params.id }, data });

  await logAudit({
    actorId: session.user.id,
    action: `customer.${action}`,
    entityType: 'USER',
    entityId: params.id,
    beforeData: before,
    afterData: updated,
  });

  const message =
    action === 'ban' ? `${before.fullName} has been banned`
    : action === 'unban' ? `${before.fullName} has been unbanned`
    : 'Note saved';

  return NextResponse.json({ success: true, message });
}
