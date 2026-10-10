/**
 * PUT    /api/admin/clients/:id  → grahak ki detail badlo
 * DELETE /api/admin/clients/:id  → grahak mitao (sirf jab koi bill na ho)
 *
 * Delete jaan-boojh ke rok diya gaya hai agar bill maujood hai. Grahak mita
 * dene se bill pe naam to rahega (snapshot hai), par machine aur AMC record
 * cascade me chale jayenge — aur wahi record ka asli kaam hai.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { clientSchema } from '@/lib/billing/schema';
import { logAudit } from '@/server/services/audit.service';

const staffOk = (r?: string) => r === 'STAFF' || r === 'ADMIN' || r === 'SUPER_ADMIN';
const adminOk = (r?: string) => r === 'ADMIN' || r === 'SUPER_ADMIN';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getServerSession(authOptions);
  if (!staffOk(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const parsed = clientSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: 'Form me kuch galat hai', errors: parsed.error.flatten() }, { status: 422 });
  }
  const d = parsed.data;

  const clash = await prisma.billingClient.findUnique({ where: { phone: d.phone }, select: { id: true } });
  if (clash && clash.id !== params.id) {
    return NextResponse.json(
      { message: 'Yeh phone number doosre grahak pe pehle se hai', errors: { fieldErrors: { phone: ['Pehle se maujood hai'] } } },
      { status: 409 },
    );
  }

  const before = await prisma.billingClient.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ message: 'Grahak nahi mila' }, { status: 404 });

  const client = await prisma.billingClient.update({
    where: { id: params.id },
    data: {
      fullName: d.fullName,
      phone: d.phone,
      altPhone: d.altPhone || null,
      email: d.email || null,
      addressLine: d.addressLine || null,
      landmark: d.landmark || null,
      area: d.area || null,
      city: d.city,
      state: d.state,
      pincode: d.pincode || null,
      gstin: d.gstin ? d.gstin.toUpperCase() : null,
      notes: d.notes || null,
    },
  });

  await logAudit({
    actorId: s!.user.id,
    action: 'client.update',
    entityType: 'BILLING_CLIENT',
    entityId: params.id,
    beforeData: { phone: before.phone, fullName: before.fullName },
    afterData: { phone: client.phone, fullName: client.fullName },
  }).catch(() => {});

  return NextResponse.json({ ok: true, client });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getServerSession(authOptions);
  if (!adminOk(s?.user?.role)) {
    return NextResponse.json({ message: 'Grahak mitane ka adhikar sirf admin ko hai' }, { status: 403 });
  }

  const bills = await prisma.bill.count({ where: { clientId: params.id } });
  if (bills > 0) {
    return NextResponse.json(
      { message: `Is grahak ke ${bills} bill hain. Pehle bill hatao, warna record adhoora ho jayega.` },
      { status: 409 },
    );
  }

  const before = await prisma.billingClient.findUnique({ where: { id: params.id }, select: { fullName: true, phone: true } });
  if (!before) return NextResponse.json({ message: 'Grahak nahi mila' }, { status: 404 });

  await prisma.billingClient.delete({ where: { id: params.id } });
  await logAudit({
    actorId: s!.user.id,
    action: 'client.delete',
    entityType: 'BILLING_CLIENT',
    entityId: params.id,
    beforeData: before,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
