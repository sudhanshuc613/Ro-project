/**
 * POST /api/orders/verify — called by the browser right after Razorpay Checkout
 * succeeds. Verifies the HMAC signature before marking the order paid.
 *
 * The webhook (/api/webhooks/razorpay) is the authoritative confirmation; this
 * endpoint exists so the customer sees instant success instead of waiting for
 * the webhook round-trip. Both paths are idempotent.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';
import { confirmOrderPaid, releaseOrderStock } from '@/server/services/order.service';
import { prisma } from '@/lib/db/prisma';

const schema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().min(3),
  razorpayPaymentId: z.string().min(3),
  razorpaySignature: z.string().min(3),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid payment response' }, { status: 422 });
  }
  const d = parsed.data;

  const valid = verifyPaymentSignature(d.razorpayOrderId, d.razorpayPaymentId, d.razorpaySignature);

  if (!valid) {
    // Signature mismatch means a tampered or forged callback — never confirm
    console.error('[orders/verify] signature mismatch', { orderId: d.orderId });
    await prisma.payment.create({
      data: {
        orderId: d.orderId,
        gateway: 'RAZORPAY',
        gatewayOrderId: d.razorpayOrderId,
        gatewayPaymentId: d.razorpayPaymentId,
        amount: 0,
        status: 'FAILED',
        failureReason: 'Signature verification failed',
      },
    }).catch(() => {});
    return NextResponse.json({ message: 'Payment verification failed' }, { status: 400 });
  }

  const order = await confirmOrderPaid(d.orderId, {
    gatewayOrderId: d.razorpayOrderId,
    gatewayPaymentId: d.razorpayPaymentId,
    signature: d.razorpaySignature,
  });

  return NextResponse.json({
    success: true,
    orderNumber: order.orderNumber,
    redirectTo: `/checkout/success?order=${order.orderNumber}`,
  });
}

/** DELETE /api/orders/verify — customer abandoned the payment modal. */
export async function DELETE(req: NextRequest) {
  const { orderId } = await req.json().catch(() => ({ orderId: null }));
  if (!orderId) return NextResponse.json({ message: 'orderId required' }, { status: 400 });

  await releaseOrderStock(orderId, 'Payment cancelled by customer');
  return NextResponse.json({ success: true });
}
