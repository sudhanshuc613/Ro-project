/**
 * Customer's own RO machines. Strictly scoped to the session user — every
 * query carries userId, so one customer can never read or edit another's
 * record even by guessing an id.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { nextServiceDueDate } from '@/server/services/machine.service';

export const runtime = 'nodejs';

/** '' → null so an untouched date input doesn't fail validation. */
const optionalDate = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v ? new Date(v) : null))
  .refine((d) => d === null || !Number.isNaN(d.getTime()), 'Invalid date')
  .refine((d) => d === null || d.getTime() <= Date.now() + 864e5, 'Date cannot be in the future');

const schema = z.object({
  nickname: z.string().trim().max(80).optional().nullable(),
  brand: z.string().trim().min(1, 'Brand is required').max(80),
  model: z.string().trim().max(120).optional().nullable(),
  serialNumber: z.string().trim().max(80).optional().nullable(),
  purchaseDate: optionalDate,
  installedDate: optionalDate,
  warrantyEndsOn: z
    .string().trim().optional().nullable()
    .transform((v) => (v ? new Date(v) : null))
    .refine((d) => d === null || !Number.isNaN(d.getTime()), 'Invalid date'),
  capacityLitres: z.coerce.number().min(0).max(500).optional().nullable(),
  purificationTech: z.array(z.string().max(24)).max(8).default([]),
  inletTds: z.coerce.number().int().min(0).max(5000).optional().nullable(),
  outletTds: z.coerce.number().int().min(0).max(5000).optional().nullable(),
  tdsCheckedOn: optionalDate,
  sedimentChangedOn: optionalDate,
  carbonChangedOn: optionalDate,
  membraneChangedOn: optionalDate,
  uvChangedOn: optionalDate,
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Please check the form', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // A household realistically has one or two; the cap stops junk data.
  const count = await prisma.customerMachine.count({
    where: { userId: session.user.id, isActive: true },
  });
  if (count >= 10) {
    return NextResponse.json({ message: 'You can track up to 10 machines.' }, { status: 400 });
  }

  const created = await prisma.customerMachine.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  const due = nextServiceDueDate(created);
  const machine = due
    ? await prisma.customerMachine.update({
        where: { id: created.id },
        data: { nextServiceDue: due },
      })
    : created;

  return NextResponse.json({ success: true, machine }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const id = body?.id as string | undefined;
  if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

  const parsed = schema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Please check the form', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // Ownership enforced in the WHERE clause, not after the read.
  const existing = await prisma.customerMachine.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ message: 'Machine not found' }, { status: 404 });

  const { id: _drop, ...data } = parsed.data as Record<string, unknown>;
  const updated = await prisma.customerMachine.update({
    where: { id },
    data: data as never,
  });

  const due = nextServiceDueDate(updated);
  const machine = await prisma.customerMachine.update({
    where: { id },
    data: { nextServiceDue: due },
  });

  return NextResponse.json({ success: true, machine });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

  const existing = await prisma.customerMachine.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ message: 'Machine not found' }, { status: 404 });

  // Soft delete — service history references the machine conceptually and
  // the admin still wants to see what was once installed.
  await prisma.customerMachine.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
