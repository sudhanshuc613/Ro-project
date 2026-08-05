/**
 * Saved addresses — used by both checkout (delivery) and service booking.
 *
 * Setting one as default is a transaction: clearing the old default and
 * setting the new one must happen together, otherwise a crash between the
 * two writes leaves the customer with zero or two defaults.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

const schema = z.object({
  label: z.enum(['HOME', 'OFFICE', 'OTHER']).default('HOME'),
  contactName: z.string().trim().min(2, 'Name is too short').max(120),
  contactPhone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile'),
  line1: z.string().trim().min(5, 'Address is too short').max(255),
  line2: z.string().trim().max(255).optional().nullable(),
  landmark: z.string().trim().max(160).optional().nullable(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  isDefault: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
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

  const count = await prisma.address.count({ where: { userId } });
  if (count >= 15) {
    return NextResponse.json({ message: 'You can save up to 15 addresses.' }, { status: 400 });
  }

  // First address is always the default, regardless of what was ticked.
  const makeDefault = parsed.data.isDefault || count === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return tx.address.create({
      data: { ...parsed.data, isDefault: makeDefault, userId },
    });
  });

  return NextResponse.json({ success: true, address }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const id = body?.id as string | undefined;
  if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

  const owned = await prisma.address.findFirst({ where: { id, userId } });
  if (!owned) return NextResponse.json({ message: 'Address not found' }, { status: 404 });

  // "Set as default" only — no field validation needed for this path.
  if (body.onlyDefault === true) {
    await prisma.$transaction([
      prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
      prisma.address.update({ where: { id }, data: { isDefault: true } }),
    ]);
    return NextResponse.json({ success: true });
  }

  const parsed = schema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Please check the form', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { isDefault, ...rest } = parsed.data;
  const address = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return tx.address.update({
      where: { id },
      data: { ...rest, ...(isDefault !== undefined ? { isDefault } : {}) },
    });
  });

  return NextResponse.json({ success: true, address });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

  const owned = await prisma.address.findFirst({ where: { id, userId } });
  if (!owned) return NextResponse.json({ message: 'Address not found' }, { status: 404 });

  // An AMC contract points at an address; deleting it would orphan the visit
  // schedule, so block with a clear reason instead of failing on a FK error.
  const amcUsing = await prisma.amcSubscription.count({
    where: { addressId: id, isActive: true },
  });
  if (amcUsing > 0) {
    return NextResponse.json(
      { message: 'This address is used by an active AMC plan. Update the plan first.' },
      { status: 409 },
    );
  }

  await prisma.address.delete({ where: { id } });

  // Never leave the customer without a default.
  if (owned.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }

  return NextResponse.json({ success: true });
}
