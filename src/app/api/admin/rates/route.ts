/**
 * GET / PUT / DELETE  /api/admin/rates
 * ═══════════════════════════════════════════════════════════════════════════
 * Spare parts ka rate admin se badalne ke liye. `site_settings` ke `rateCard`
 * key me save hota hai, aur revalidateTag('settings') se turant live —
 * koi deploy nahi.
 *
 * KYUN: kal motor ka rate ₹900–₹1,600 se ₹1,000–₹2,800 karna pada aur usme
 * ek poora deploy laga. Market ka rate mahine me badalta hai; deploy mahine
 * me nahi hona chahiye.
 *
 * Suraksha: sirf ADMIN/SUPER_ADMIN · part ka naam sirf RATE_KEYS se ·
 * from/to dono positive aur to >= from — warna 422.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/server/services/audit.service';
import { RATE_KEYS, type RateMap } from '@/lib/seo/rate-overrides';

const guard = (r?: string) => r === 'ADMIN' || r === 'SUPER_ADMIN';

const schema = z
  .object({
    part: z.string().refine((p) => RATE_KEYS.includes(p), 'Unknown part'),
    from: z.coerce.number().int().positive('Rate 0 se bada hona chahiye').max(500000),
    to: z.coerce.number().int().positive('Rate 0 se bada hona chahiye').max(500000),
  })
  .refine((v) => v.to >= v.from, {
    message: 'Upar wala rate neeche wale se kam nahi ho sakta',
    path: ['to'],
  });

async function readMap(): Promise<RateMap> {
  const row = await prisma.siteSetting.findUnique({ where: { key: 'rateCard' } });
  return ((row?.value as unknown as RateMap) ?? {}) as RateMap;
}

export async function GET() {
  const s = await getServerSession(authOptions);
  if (!guard(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ overrides: await readMap() });
}

export async function PUT(req: NextRequest) {
  const s = await getServerSession(authOptions);
  if (!guard(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const { part, from, to } = parsed.data;
  const current = await readMap();
  const before = current[part];
  const next: RateMap = { ...current, [part]: { from, to } };

  await prisma.siteSetting.upsert({
    where: { key: 'rateCard' },
    update: { value: next as never },
    create: { key: 'rateCard', value: next as never, description: 'Admin-editable spare part rates' },
  });
  revalidateTag('settings');
  await logAudit({
    actorId: s!.user.id,
    action: 'rateCard.update',
    entityType: 'SITE_SETTING',
    beforeData: before ?? null,
    afterData: { part, from, to },
  }).catch(() => {});

  return NextResponse.json({ ok: true, part, from, to });
}

export async function DELETE(req: NextRequest) {
  const s = await getServerSession(authOptions);
  if (!guard(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const part = new URL(req.url).searchParams.get('part') ?? '';
  if (!RATE_KEYS.includes(part)) return NextResponse.json({ message: 'Unknown part' }, { status: 400 });
  const current = await readMap();
  delete current[part];
  await prisma.siteSetting.upsert({
    where: { key: 'rateCard' },
    update: { value: current as never },
    create: { key: 'rateCard', value: {} as never, description: 'Admin-editable spare part rates' },
  });
  revalidateTag('settings');
  return NextResponse.json({ ok: true, part, reset: true });
}
