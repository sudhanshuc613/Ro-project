/**
 * POST /api/admin/change-password — logged-in staff/admin apna password badle.
 *
 * Purana password maangna zaroori hai: agar kisi ne khula laptop paa liya to
 * wo password badal ke account hamesha ke liye apne paas nahi kar sakta.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/db/redis';
import { logAudit } from '@/server/services/audit.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'Admin password must be at least 8 characters')
      .max(72, 'Password is too long'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Both passwords must match',
    path: ['confirmPassword'],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: 'New password must be different from the current one',
    path: ['newPassword'],
  });

/** Blocks the handful of passwords that actually get guessed first. */
const BANNED = new Set([
  'changeme@123', 'password', 'password123', 'admin@123', 'admin123',
  '12345678', 'qwerty123', 'aquanexa', 'rokadoctor', 'ro@12345',
]);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const allowed = await rateLimit(`pwchange:${session.user.id}`, 5, 900);
  if (!allowed) {
    return NextResponse.json(
      { message: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const first =
      fieldErrors.newPassword?.[0] ??
      fieldErrors.confirmPassword?.[0] ??
      fieldErrors.currentPassword?.[0] ??
      'Invalid request';
    return NextResponse.json({ message: first, errors: fieldErrors }, { status: 422 });
  }

  const { currentPassword, newPassword } = parsed.data;

  if (BANNED.has(newPassword.toLowerCase())) {
    return NextResponse.json(
      { message: 'That password is too common. Please choose a different one.' },
      { status: 422 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true, deletedAt: true },
  });

  if (!user?.passwordHash || user.deletedAt) {
    return NextResponse.json({ message: 'Account not available' }, { status: 403 });
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ message: 'Current password is incorrect' }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12), updatedAt: new Date() },
  });

  await logAudit({
    actorId: user.id,
    action: 'ADMIN_PASSWORD_CHANGE',
    entityType: 'User',
    entityId: user.id,
    afterData: { self: true },
  }).catch(() => {});

  return NextResponse.json({
    message: 'Password changed. Use the new one from your next sign-in.',
  });
}
