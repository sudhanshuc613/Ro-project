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
