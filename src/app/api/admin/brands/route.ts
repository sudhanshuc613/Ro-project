/**
 * GET  /api/admin/brands — list every brand (admin only)
 * POST /api/admin/brands — create a brand on the fly from the product form
 *
 * Why this exists: the product form used to be limited to whatever brands the
 * seed happened to create. Now the admin types any brand name and it is
 * created here, slugified, deduped case-insensitively, and returned so the
 * form can select it immediately.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { slugify } from '@/lib/utils/format';
import { logAudit } from '@/server/services/audit.service';

function guard(role?: string) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const brands = await prisma.brand.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({ brands });
}

const bodySchema = z.object({
  name: z.string().trim().min(2, 'Brand name kam se kam 2 letter ka ho').max(80),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Validation failed' },
      { status: 422 },
    );
  }

  const name = parsed.data.name.replace(/\s+/g, ' ').trim();
  const slug = slugify(name).slice(0, 96);
  if (!slug) {
    return NextResponse.json({ message: 'Is naam se slug nahi ban paya' }, { status: 422 });
  }

  // Case-insensitive dedupe so "kent", "Kent" and "KENT" stay one brand
  const existing = await prisma.brand.findFirst({
    where: { OR: [{ slug }, { name: { equals: name, mode: 'insensitive' } }] },
    select: { id: true, name: true },
  });
  if (existing) {
    return NextResponse.json({ brand: existing, created: false });
  }

  try {
    const brand = await prisma.brand.create({
      data: { name, slug },
      select: { id: true, name: true },
    });

    await logAudit({
      actorId: session!.user.id,
      action: 'brand.create',
      entityType: 'BRAND',
      entityId: brand.id,
      afterData: brand,
    });

    return NextResponse.json({ brand, created: true }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === 'P2002') {
      const again = await prisma.brand.findFirst({
        where: { slug },
        select: { id: true, name: true },
      });
      if (again) return NextResponse.json({ brand: again, created: false });
    }
    console.error('[admin/brands:POST]', err);
    return NextResponse.json({ message: 'Brand banane me problem aayi' }, { status: 500 });
  }
}
