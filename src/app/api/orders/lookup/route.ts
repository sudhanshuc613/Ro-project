/**
 * Guest order lookup — order number + phone, no account needed.
 *
 * Every large retailer offers this because a guest who cannot see their own
 * order calls support instead. Two facts are required (order number AND the
 * phone on the order), so a leaked order number alone reveals nothing.
 *
 * Rate limited: without it, this endpoint is an oracle for brute-forcing
 * sequential order numbers against a phone list.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { rateLimit } from '@/lib/db/redis';

export const runtime = 'nodejs';

const schema = z.object({
  orderNumber: z.string().trim().min(6).max(24),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter the 10-digit mobile used on the order'),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Check the order number and phone', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const { orderNumber, phone } = parsed.data;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  if (!(await rateLimit(`lookup:${ip}`, 10, 600))) {
    return NextResponse.json(
      { message: 'Too many lookups. Please wait a few minutes or call us.' },
      { status: 429 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: orderNumber.toUpperCase() },
    select: {
      orderNumber: true, status: true, paymentStatus: true, paymentMethod: true,
      totalAmount: true, placedAt: true, estimatedDelivery: true,
      courierPartner: true, trackingNumber: true, trackingUrl: true,
      shippedAt: true, deliveredAt: true,
      guestPhone: true,
      user: { select: { phone: true } },
      items: { select: { productName: true, quantity: true, productImageUrl: true } },
      shippingAddress: true,
      statusHistory: {
        orderBy: { createdAt: 'asc' },
        select: { toStatus: true, createdAt: true, note: true },
      },
    },
  });

  // Same response for "no such order" and "wrong phone" — never confirm that
  // an order number exists to someone who cannot prove they own it.
  const onOrder = order?.user?.phone ?? order?.guestPhone ?? null;
  if (!order || onOrder !== phone) {
    return NextResponse.json(
      { message: 'No order found with that number and phone. Please check both.' },
      { status: 404 },
    );
  }

  const addr = order.shippingAddress as { city?: string; pincode?: string };

  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: Number(order.totalAmount),
      placedAt: order.placedAt,
      estimatedDelivery: order.estimatedDelivery,
      courierPartner: order.courierPartner,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      items: order.items,
      // Only coarse location — never echo the full address back.
      deliveringTo: [addr?.city, addr?.pincode].filter(Boolean).join(' – '),
      history: order.statusHistory,
    },
  });
}
