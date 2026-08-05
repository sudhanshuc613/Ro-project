/**
 * GET  /api/admin/settings        — read all settings
 * PUT  /api/admin/settings        — update one settings group
 *
 * Writes to `site_settings` and immediately busts the `settings` cache tag,
 * so the change is live on the storefront within one request — no redeploy.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/server/services/audit.service';

const phone = z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile');

const SCHEMAS = {
  contact: z.object({
    primaryPhone: phone,
    secondaryPhone: phone.or(z.literal('')),
    tertiaryPhone: phone.or(z.literal('')),
    whatsapp: z.string().regex(/^91\d{10}$/, 'Must be 91 followed by 10 digits'),
    email: z.string().email(),
    hours: z.string().min(3).max(80),
  }),
  service: z.object({
    visitCharge: z.number().int().min(0).max(5000),
    emergencyCharge: z.number().int().min(0).max(5000),
    responseTime: z.string().min(3).max(40),
    warrantyDays: z.number().int().min(0).max(365),
    city: z.string().min(2).max(60),
    state: z.string().min(2).max(60),
  }),
  otp: z.object({
    channel: z.enum(['DEV', 'WHATSAPP_REVERSE', 'WHATSAPP', 'SMS']),
    requireForLogin: z.boolean(),
    requireForCod: z.boolean(),
    requireForService: z.boolean(),
    skipIfAlreadyVerified: z.boolean(),
    codThreshold: z.number().int().min(0).max(500000),
  }).refine(
    // DEV shows the code on screen, so it verifies nothing. Allowing it to be
    // saved alongside an active requirement would give false confidence.
    (d) => d.channel !== 'DEV' || (!d.requireForLogin && !d.requireForCod && !d.requireForService),
    {
      message: 'Test mode shows the code on screen and verifies nothing. Pick WhatsApp or SMS before switching any requirement on.',
      path: ['channel'],
    },
  ),
  payment: z.object({
    codEnabled: z.boolean(),
    codMaxOrder: z.number().int().min(0).max(500000),
    codCharge: z.number().int().min(0).max(500),
    razorpayEnabled: z.boolean(),
    upiManualEnabled: z.boolean(),
    // A UPI ID looks like name@bank. Empty is allowed (method just stays off).
    upiId: z.string().trim().max(80).refine(
      (v) => v === '' || /^[\w.\-]{2,64}@[a-zA-Z]{2,32}$/.test(v),
      'Enter a valid UPI ID like yourname@okhdfcbank',
    ),
    upiName: z.string().trim().max(80),
    bankTransferEnabled: z.boolean(),
    bankDetails: z.string().trim().max(600),
    paymentNote: z.string().trim().max(300),
  }).refine(
    (d) => !d.upiManualEnabled || d.upiId.length > 0,
    { message: 'Add your UPI ID before switching manual UPI on', path: ['upiId'] },
  ).refine(
    (d) => !d.bankTransferEnabled || d.bankDetails.length > 10,
    { message: 'Add your bank details before switching bank transfer on', path: ['bankDetails'] },
  ).refine(
    (d) => d.codEnabled || d.razorpayEnabled || d.upiManualEnabled || d.bankTransferEnabled,
    { message: 'At least one payment method must stay enabled, or nobody can order', path: ['codEnabled'] },
  ),
  banner: z.object({
    heroHeadline: z.string().min(3).max(120),
    heroSubline: z.string().min(3).max(160),
    heroImage: z.string().min(1).max(300),
    announcementText: z.string().max(200),
    announcementActive: z.boolean(),
  }),
} as const;

type SettingsKey = keyof typeof SCHEMAS;

function guard(role?: string) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: Object.keys(SCHEMAS) } },
  });

  const out: Record<string, unknown> = {};
  for (const r of rows) out[r.key] = r.value;
  return NextResponse.json(out);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const key = body?.key as SettingsKey | undefined;

  if (!key || !(key in SCHEMAS)) {
    return NextResponse.json(
      { message: `key must be one of: ${Object.keys(SCHEMAS).join(', ')}` },
      { status: 400 },
    );
  }

  const parsed = SCHEMAS[key].safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const before = await prisma.siteSetting.findUnique({ where: { key } });

  const saved = await prisma.siteSetting.upsert({
    where: { key },
    update: { value: parsed.data as never },
    create: { key, value: parsed.data as never, description: `${key} settings` },
  });

  // Storefront picks this up on the very next request
  revalidateTag('settings');

  await logAudit({
    actorId: session!.user.id,
    action: `settings.${key}.update`,
    entityType: 'SITE_SETTING',
    beforeData: before?.value,
    afterData: saved.value,
  });

  return NextResponse.json({ success: true, key, value: saved.value });
}
