/**
 * Profile updates + password change.
 *
 * Phone is intentionally NOT editable here — it is the login identity, so
 * changing it belongs in an OTP-verified flow, not a text box.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

const schema = z.object({
  fullName: z.string().trim().min(2, 'Name is too short').max(120).optional(),
  email: z.string().trim().email('Enter a valid email').max(160).optional().nullable()
    .or(z.literal('').transform(() => null)),
  whatsappOptIn: z.boolean().optional(),
  marketingOptIn: z.boolean().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(200).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Please check the form', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { currentPassword, newPassword, email, ...rest } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) return NextResponse.json({ message: 'Account not found' }, { status: 404 });

  const data: Record<string, unknown> = { ...rest };

  if (email !== undefined) {
    if (email) {
      // Unique constraint would throw a raw P2002; check first for a clean message.
      const taken = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
        select: { id: true },
      });
      if (taken) {
        return NextResponse.json(
          { message: 'That email is already in use', errors: { email: ['Already in use'] } },
          { status: 409 },
        );
      }
    }
    data.email = email;
  }

  if (newPassword) {
    // Only require the old password if one is already set. OTP-only users
    // are already proven by their session and shouldn't be locked out.
    if (user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json({ message: 'Enter your current password' }, { status: 400 });
      }
      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) {
        return NextResponse.json({ message: 'Current password is incorrect' }, { status: 403 });
      }
    }
    data.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: 'Nothing to update' }, { status: 400 });
  }

  await prisma.user.update({ where: { id: userId }, data: data as never });
  return NextResponse.json({ success: true });
}
