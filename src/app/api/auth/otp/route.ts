/**
 * POST /api/auth/otp        — start a verification
 * PUT  /api/auth/otp        — submit a typed code
 * GET  /api/auth/otp?token= — poll status (WhatsApp reverse flow)
 *
 * Public by necessity: verification happens before the user has a session.
 * Abuse is contained by per-phone send caps and per-challenge attempt caps
 * inside otp.service.ts, both of which work without Redis.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createChallenge, verifyTypedCode, pollReverseStatus,
  isPhoneVerified, OtpError, type OtpPurpose,
} from '@/server/services/otp.service';
import { getOtpSettings, getContactSettings } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const startSchema = z.object({
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile'),
  purpose: z.enum(['LOGIN', 'ORDER_COD', 'SERVICE_BOOKING', 'PASSWORD_RESET']).default('LOGIN'),
});

const verifySchema = z.object({
  pollToken: z.string().trim().min(10).max(80),
  code: z.string().trim().min(4).max(12),
});

export async function POST(req: NextRequest) {
  const parsed = startSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Enter a valid mobile number', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const { phone, purpose } = parsed.data;

  const [otp, contact] = await Promise.all([getOtpSettings(), getContactSettings()]);

  // A number proven once does not need proving again — this is what keeps
  // repeat customers from hitting a wall on every order.
  // Password reset must always send a fresh code — skipping it because the
  // number was verified once before would let anyone reset any account.
  if (purpose !== 'PASSWORD_RESET' && otp.skipIfAlreadyVerified && (await isPhoneVerified(phone))) {
    return NextResponse.json({ alreadyVerified: true, message: 'This number is already verified' });
  }

  try {
    const result = await createChallenge({
      phone,
      purpose: purpose as OtpPurpose,
      channel: otp.channel,
      whatsappNumber: contact.whatsapp,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof OtpError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error('[otp] start failed:', err);
    return NextResponse.json({ message: 'Could not start verification' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const parsed = verifySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: 'Enter the code you received' }, { status: 422 });
  }

  try {
    const { phone, purpose } = await verifyTypedCode(parsed.data.pollToken, parsed.data.code);
    return NextResponse.json({ verified: true, phone, purpose });
  } catch (err) {
    if (err instanceof OtpError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error('[otp] verify failed:', err);
    return NextResponse.json({ message: 'Verification failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ message: 'token required' }, { status: 400 });

  const status = await pollReverseStatus(token);
  return NextResponse.json(status);
}
