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
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const schema = z.object({
  action: z.enum(['ban', 'unban', 'note', 'reset-password']),
  notes: z.string().max(1000).optional(),
});

/**
 * Temporary password for a customer who is locked out.
 *
 * Deliberately NOT "show me their password": stored passwords are bcrypt
 * hashes, which are one-way by design. Nobody — including the owner — can
 * read them back. What the owner actually needs is the ability to get a
 * stuck customer back in, and this does that: generate a fresh temporary
 * password, show it once, and let the customer change it after signing in.
 */
function tempPassword(): string {
  const words = ['Aqua', 'Pure', 'Neer', 'Jal', 'Fresh', 'Clean'];
  const w = words[crypto.randomInt(words.length)];
  const n = crypto.randomInt(1000, 9999);
  return `${w}@${n}${crypto.randomBytes(2).toString('hex')}`;
}

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

  // Only SUPER_ADMIN may hand out a working credential for someone else's
  // account — this is the single most abusable action in the panel.
  if (action === 'reset-password') {
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Only the owner account can reset a customer password' },
        { status: 403 },
      );
    }
    if (before.role !== 'CUSTOMER') {
      return NextResponse.json(
        { message: 'Only customer accounts can be reset here' },
        { status: 403 },
      );
    }

    const temp = tempPassword();
    await prisma.user.update({
      where: { id: params.id },
      data: { passwordHash: await bcrypt.hash(temp, 12), updatedAt: new Date() },
    });

    await logAudit({
      actorId: session.user.id,
      action: 'customer.reset-password',
      entityType: 'USER',
      entityId: params.id,
      afterData: { resetBy: session.user.phone, customerPhone: before.phone },
    });

    return NextResponse.json({
      success: true,
      tempPassword: temp,
      message: `Temporary password created for ${before.fullName}`,
    });
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
