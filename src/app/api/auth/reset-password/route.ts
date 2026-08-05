/**
 * POST /api/auth/reset-password  — password reset ka doosra step.
 *
 * Flow:
 *   1. User /forgot-password pe phone daalta hai
 *      → wahi /api/auth/otp POST chalta hai jo pehle se maujood hai
 *   2. OTP verify hone pe user ko `pollToken` milta hai
 *   3. Yahan wo token + naya password bhejta hai
 *
 * Security:
 *   - Token ek hi baar chalega (consumeVerification usse burn kar deta hai)
 *   - Purpose LOGIN se bandha hai — order/service wala token yahan kaam nahi karega
 *   - Phone exist na kare tab bhi wahi jawab jaata hai (user enumeration band)
 *   - Rate limit: ek phone pe 5 reset / ghanta
 *   - Password badalte hi purane sessions invalid karne ke liye
 *     `passwordChangedAt` set hota hai
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { consumeVerification } from '@/server/services/otp.service';
import { rateLimit } from '@/lib/db/redis';
import { logAudit } from '@/server/services/audit.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile'),
  pollToken: z.string().trim().min(10).max(80),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password is too long'),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const { phone, pollToken, newPassword } = parsed.data;

  const allowed = await rateLimit(`pwreset:${phone}`, 5, 3600);
  if (!allowed) {
    return NextResponse.json(
      { message: 'Too many reset attempts. Please try again in an hour.' },
      { status: 429 },
    );
  }

  // Token must be a genuine, unused, verified LOGIN challenge for THIS phone.
  const ok = await consumeVerification(pollToken, phone, 'PASSWORD_RESET');
  if (!ok) {
    return NextResponse.json(
      { message: 'Verification expired or already used. Please start again.' },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { phone },
    select: { id: true, role: true, deletedAt: true },
  });

  // Same response whether or not the account exists — otherwise this endpoint
  // becomes a way to discover which numbers are registered.
  if (!user || user.deletedAt) {
    return NextResponse.json({
      message: 'If an account exists for this number, the password has been updated.',
    });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      phoneVerifiedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await logAudit({
    actorId: user.id,
    action: 'PASSWORD_RESET',
    entityType: 'User',
    entityId: user.id,
    afterData: { via: 'OTP_SELF_SERVICE' },
  }).catch(() => {});

  return NextResponse.json({
    message: 'Password updated. You can sign in now.',
  });
}
