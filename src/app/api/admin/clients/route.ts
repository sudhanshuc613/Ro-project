/**
 * GET  /api/admin/clients?q=…   → grahak dhoondo (naam / phone / area)
 * POST /api/admin/clients       → naya grahak (bina bill ke bhi)
 *
 * Bill form me phone type karte hi yahi call hota hai — purana grahak mil
 * gaya to naam/pata khud bhar jaate hain. Yeh sabse zyada time bachane wala
 * feature hai: repeat customer ka pata dobara likhna nahi padta.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { clientSchema } from '@/lib/billing/schema';
import { logAudit } from '@/server/services/audit.service';
import { billingSetupStatus } from '@/server/services/billing.service';

const guard = (r?: string) => r === 'STAFF' || r === 'ADMIN' || r === 'SUPER_ADMIN';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const s = await getServerSession(authOptions);
  if (!guard(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const q = (sp.get('q') ?? '').trim();
  const exactPhone = (sp.get('phone') ?? '').trim();
  const take = Math.min(Math.max(parseInt(sp.get('take') ?? '20', 10) || 20, 1), 100);

  try {
    if (exactPhone) {
      const client = await prisma.billingClient.findUnique({
        where: { phone: exactPhone },
        include: {
          units: { where: { status: 'ACTIVE' }, orderBy: { installedOn: 'desc' } },
          amcs: { orderBy: { endsOn: 'desc' }, take: 5 },
        },
      });
      return NextResponse.json({ client });
    }

    const where: Prisma.BillingClientWhereInput = q
      ? {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
            { area: { contains: q, mode: 'insensitive' } },
            { addressLine: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const clients = await prisma.billingClient.findMany({
      where,
      orderBy: [{ lastBillAt: 'desc' }, { createdAt: 'desc' }],
      take,
      select: {
        id: true,
        fullName: true,
        phone: true,
        area: true,
        addressLine: true,
        totalBilled: true,
        billCount: true,
        lastBillAt: true,
      },
    });
    return NextResponse.json({ clients });
  } catch {
    const setup = await billingSetupStatus();
    return NextResponse.json({ clients: [], setup }, { status: setup.ready ? 500 : 503 });
  }
}

export async function POST(req: NextRequest) {
  const s = await getServerSession(authOptions);
  if (!guard(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const parsed = clientSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: 'Form me kuch galat hai', errors: parsed.error.flatten() }, { status: 422 });
  }
  const d = parsed.data;

  try {
    const client = await prisma.billingClient.upsert({
      where: { phone: d.phone },
      update: {
        fullName: d.fullName,
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
      create: {
        phone: d.phone,
        fullName: d.fullName,
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
      action: 'client.upsert',
      entityType: 'BILLING_CLIENT',
      entityId: client.id,
      afterData: { phone: client.phone, fullName: client.fullName },
    }).catch(() => {});
    return NextResponse.json({ ok: true, client });
  } catch (e) {
    return NextResponse.json({ message: e instanceof Error ? e.message : 'Save nahi hua' }, { status: 500 });
  }
}
