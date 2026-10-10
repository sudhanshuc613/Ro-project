/**
 * GET  /api/admin/billing        → bill ki list (search + filter)
 * POST /api/admin/billing        → naya bill
 *
 * Saara hisaab server pe dobara hota hai. Browser jo total bhejta hai usko
 * jaan-boojh ke ignore kiya jaata hai — warna DevTools se ₹27,000 ka bill
 * ₹27 ka banaya ja sakta tha.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/server/services/audit.service';
import { billSchema } from '@/lib/billing/schema';
import { createBill, billingSetupStatus } from '@/server/services/billing.service';

const guard = (r?: string) => r === 'STAFF' || r === 'ADMIN' || r === 'SUPER_ADMIN';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const s = await getServerSession(authOptions);
  if (!guard(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const q = (sp.get('q') ?? '').trim();
  const status = sp.get('status') ?? '';
  const type = sp.get('type') ?? '';
  const take = Math.min(Math.max(parseInt(sp.get('take') ?? '50', 10) || 50, 1), 200);

  const where: Prisma.BillWhereInput = {};
  if (q) {
    where.OR = [
      { billNumber: { contains: q, mode: 'insensitive' } },
      { customerName: { contains: q, mode: 'insensitive' } },
      { customerPhone: { contains: q } },
    ];
  }
  if (status) where.status = status as Prisma.BillWhereInput['status'];
  if (type) where.type = type as Prisma.BillWhereInput['type'];

  try {
    const bills = await prisma.bill.findMany({
      where,
      orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }],
      take,
      select: {
        id: true,
        billNumber: true,
        type: true,
        status: true,
        customerName: true,
        customerPhone: true,
        issueDate: true,
        grandTotal: true,
        balanceDue: true,
        publicToken: true,
      },
    });
    return NextResponse.json({ bills });
  } catch {
    const setup = await billingSetupStatus();
    return NextResponse.json({ bills: [], setup }, { status: setup.ready ? 500 : 503 });
  }
}

export async function POST(req: NextRequest) {
  const s = await getServerSession(authOptions);
  if (!guard(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const parsed = billSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Form me kuch galat hai', errors: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const result = await createBill(parsed.data, s!.user.id);
    await logAudit({
      actorId: s!.user.id,
      action: 'bill.create',
      entityType: 'BILL',
      entityId: result.id,
      afterData: { billNumber: result.billNumber, grandTotal: result.grandTotal },
    }).catch(() => {});
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json(
        { message: 'Yeh bill number pehle se hai. Doosra number lein.', errors: { fieldErrors: { billNumber: ['Pehle se maujood hai'] } } },
        { status: 409 },
      );
    }
    const setup = await billingSetupStatus();
    if (!setup.ready) {
      return NextResponse.json(
        { message: 'Billing tables abhi nahi bani. Pehle "Database taiyaar karo" dabayein.', setup },
        { status: 503 },
      );
    }
    return NextResponse.json({ message: e instanceof Error ? e.message : 'Save nahi hua' }, { status: 500 });
  }
}
