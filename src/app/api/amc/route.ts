/**
 * POST /api/amc — buy an AMC plan.
 *
 * Works for both a logged-in customer and a walk-in the admin enters manually.
 * Phone is the identity: an existing service lead gets upgraded rather than
 * duplicated, so their history stays attached.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/db/redis';
import { createAmcSubscription, AMC_PLANS } from '@/server/services/amc.service';
import { notifyAdmins } from '@/lib/integrations/whatsapp';

const schema = z.object({
  planKey: z.enum(['BASIC', 'GOLD', 'PLATINUM']),
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile'),
  addressLine: z.string().trim().min(10).max(320),
  pincode: z.string().regex(/^\d{6}$/),
  machineBrand: z.string().max(80).optional().or(z.literal('')),
  machineModel: z.string().max(120).optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Please check the form', errors: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const d = parsed.data;

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    if (!(await rateLimit(`amc:${d.customerPhone}:${ip}`, 3, 600))) {
      return NextResponse.json({ message: 'Too many requests. Please call us.' }, { status: 429 });
    }

    const plan = AMC_PLANS.find((p) => p.key === d.planKey)!;

    // Upsert customer — keeps service history linked
    const user = await prisma.user.upsert({
      where: { phone: d.customerPhone },
      update: { fullName: d.customerName },
      create: {
        phone: d.customerPhone,
        fullName: d.customerName,
        role: 'CUSTOMER',
        acquisitionSource: 'amc_purchase',
      },
    });

    // Save the service address so visits can be scheduled to it
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        contactName: d.customerName,
        contactPhone: d.customerPhone,
        line1: d.addressLine,
        city: 'Patna',
        state: 'Bihar',
        pincode: d.pincode,
      },
    });

    const { subscription, schedule } = await createAmcSubscription({
      userId: user.id,
      planKey: d.planKey,
      machineBrand: d.machineBrand || undefined,
      machineModel: d.machineModel || undefined,
      addressId: address.id,
    });

    void notifyAdmins(
      'admin_new_amc_alert',
      [plan.name, d.customerName, d.customerPhone, `₹${plan.price}`, `${d.addressLine}, ${d.pincode}`],
      'AMC',
      subscription.id,
    );

    return NextResponse.json(
      {
        success: true,
        message: `${plan.name} activated. Our team will call you within 30 minutes to confirm your first visit.`,
        subscriptionId: subscription.id,
        planName: plan.name,
        price: plan.price,
        visitsIncluded: plan.visits,
        firstVisit: schedule[0],
        schedule,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[amc:POST]', err);
    return NextResponse.json({ message: 'Could not activate AMC. Please call us.' }, { status: 500 });
  }
}

/** GET /api/amc — logged-in customer's own contracts. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const subs = await prisma.amcSubscription.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ subscriptions: subs });
}
