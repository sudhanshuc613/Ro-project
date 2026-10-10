/**
 * GET    /api/admin/billing/:id  → poora bill (items ke saath)
 * PUT    /api/admin/billing/:id  → bill badlo
 * DELETE /api/admin/billing/:id  → bill mitao (items/payments cascade)
 *
 * Note: DELETE sirf ADMIN/SUPER_ADMIN. STAFF bill bana aur badal sakta hai,
 * mita nahi sakta — kyunki mitaya hua bill wapas nahi aata aur GST/record
 * ke liye bill ko CANCELLED karna zyada sahi hai.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/server/services/audit.service';
import { billSchema } from '@/lib/billing/schema';
import { updateBill, deleteBill } from '@/server/services/billing.service';

const staffOk = (r?: string) => r === 'STAFF' || r === 'ADMIN' || r === 'SUPER_ADMIN';
const adminOk = (r?: string) => r === 'ADMIN' || r === 'SUPER_ADMIN';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getServerSession(authOptions);
  if (!staffOk(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const bill = await prisma.bill.findUnique({
    where: { id: params.id },
    include: { items: { orderBy: { position: 'asc' } }, payments: { orderBy: { paidOn: 'desc' } } },
  });
  if (!bill) return NextResponse.json({ message: 'Bill nahi mila' }, { status: 404 });
  return NextResponse.json({ bill });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getServerSession(authOptions);
  if (!staffOk(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const parsed = billSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Form me kuch galat hai', errors: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const before = await prisma.bill.findUnique({
      where: { id: params.id },
      select: { billNumber: true, grandTotal: true, status: true },
    });
    const result = await updateBill(params.id, parsed.data);
    await logAudit({
      actorId: s!.user.id,
      action: 'bill.update',
      entityType: 'BILL',
      entityId: params.id,
      beforeData: before,
      afterData: { billNumber: result.billNumber, grandTotal: result.grandTotal },
    }).catch(() => {});
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json(
        { message: 'Yeh bill number kisi aur bill pe pehle se hai.', errors: { fieldErrors: { billNumber: ['Pehle se maujood hai'] } } },
        { status: 409 },
      );
    }
    return NextResponse.json({ message: e instanceof Error ? e.message : 'Update nahi hua' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getServerSession(authOptions);
  if (!adminOk(s?.user?.role)) {
    return NextResponse.json({ message: 'Bill mitane ka adhikar sirf admin ko hai' }, { status: 403 });
  }

  const before = await prisma.bill.findUnique({
    where: { id: params.id },
    select: { billNumber: true, customerName: true, grandTotal: true },
  });
  if (!before) return NextResponse.json({ message: 'Bill nahi mila' }, { status: 404 });

  await deleteBill(params.id);
  await logAudit({
    actorId: s!.user.id,
    action: 'bill.delete',
    entityType: 'BILL',
    entityId: params.id,
    beforeData: before,
  }).catch(() => {});

  return NextResponse.json({ ok: true, deleted: before.billNumber });
}
