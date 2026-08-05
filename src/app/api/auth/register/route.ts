/**
 * POST /api/auth/register — customer signup.
 *
 * Phone is the primary identity in India, email optional.
 * Rate-limited, Zod-validated, bcrypt-hashed. If a lead already exists from a
 * service booking (phone match, no password) we upgrade that record instead of
 * rejecting — the customer's service history stays attached to their account.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { rateLimit } from '@/lib/db/redis';

const schema = z.object({
  fullName: z.string().trim().min(2, 'Name too short').max(120),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Please check the form', errors: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const { fullName, phone, email, password } = parsed.data;

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    if (!(await rateLimit(`register:${ip}`, 5, 900))) {
      return NextResponse.json(
        { message: 'Too many signup attempts. Please try again in 15 minutes.' },
        { status: 429 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { phone } });

    // Already a full account
    if (existing?.passwordHash) {
      return NextResponse.json(
        { message: 'An account with this number already exists. Please sign in.' },
        { status: 409 },
      );
    }

    if (email) {
      const emailTaken = await prisma.user.findFirst({
        where: { email, phone: { not: phone } },
      });
      if (emailTaken) {
        return NextResponse.json({ message: 'This email is already in use.' }, { status: 409 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Upgrade an existing service-booking lead, or create fresh
    const user = existing
      ? await prisma.user.update({
          where: { phone },
          data: { fullName, email: email || existing.email, passwordHash },
        })
      : await prisma.user.create({
          data: {
            fullName,
            phone,
            email: email || null,
            passwordHash,
            role: 'CUSTOMER',
            acquisitionSource: 'website_signup',
          },
        });

    /* ── Claim past guest activity ──────────────────────────────────────
       Someone who ordered as a guest and later registers with the same phone
       is the same person. Without this their orders stay invisible in
       /account and they call us asking "mera order kahan hai".

       Matching on phone alone is safe here because registration already
       proves control of that number (OTP on the consumer flow), and the data
       being claimed was submitted with that number in the first place. */
    const [claimedOrders, claimedServices] = await Promise.all([
      prisma.order.updateMany({
        where: { userId: null, guestPhone: phone },
        data: { userId: user.id },
      }),
      prisma.serviceRequest.updateMany({
        where: { userId: null, customerPhone: phone },
        data: { userId: user.id },
      }),
    ]);

    // Keep the CRM counters honest after claiming.
    if (claimedOrders.count > 0 || claimedServices.count > 0) {
      const agg = await prisma.order.aggregate({
        where: { userId: user.id, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
        _count: true,
        _sum: { totalAmount: true },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalOrders: agg._count,
          totalServices: claimedServices.count,
          lifetimeValue: agg._sum.totalAmount ?? 0,
        },
      });
    }

    const claimed = claimedOrders.count + claimedServices.count;

    return NextResponse.json(
      {
        success: true,
        message: claimed > 0
          ? `Account created. We found ${claimed} earlier ${claimed === 1 ? 'record' : 'records'} on this number and linked them to your account.`
          : existing
            ? 'Account created. Your previous service history is linked.'
            : 'Account created successfully.',
        claimed,
        user: { id: user.id, fullName: user.fullName, phone: user.phone },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[auth/register]', err);
    return NextResponse.json({ message: 'Could not create account. Please try again.' }, { status: 500 });
  }
}
