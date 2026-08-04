/**
 * POST /api/webhooks/razorpay — authoritative payment confirmation.
 *
 * Razorpay retries this until it gets a 2xx, so it is the reliable path even
 * if the customer closes the browser mid-payment. Signature-verified against
 * the raw request body (not the parsed JSON — parsing changes the bytes).
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';
import { confirmOrderPaid, releaseOrderStock } from '@/server/services/order.service';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error('[webhook/razorpay] bad signature');
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const entity = event.payload?.payment?.entity;
  const orderNumber = entity?.notes?.orderNumber as string | undefined;

  if (!orderNumber) {
    // Nothing to correlate — acknowledge so Razorpay stops retrying
    return NextResponse.json({ received: true, note: 'no orderNumber in notes' });
  }

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) return NextResponse.json({ received: true, note: 'order not found' });

  try {
    switch (event.event) {
      case 'payment.captured':
        await confirmOrderPaid(order.id, {
          gatewayOrderId: entity.order_id,
          gatewayPaymentId: entity.id,
          signature,
          raw: entity,
        });
        break;

      case 'payment.failed':
        await prisma.payment.create({
          data: {
            orderId: order.id,
            gateway: 'RAZORPAY',
            gatewayOrderId: entity.order_id,
            gatewayPaymentId: entity.id,
            amount: (entity.amount ?? 0) / 100,
            status: 'FAILED',
            failureReason: entity.error_description ?? 'Payment failed',
            rawPayload: entity,
          },
        }).catch(() => {});
        await releaseOrderStock(order.id, 'Payment failed');
        break;

      case 'refund.processed':
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'REFUNDED', status: 'REFUNDED' },
        });
        break;
    }
  } catch (err) {
    console.error('[webhook/razorpay] handler error', err);
    // Return 200 anyway — a 5xx makes Razorpay retry a payload we already logged
  }

  return NextResponse.json({ received: true });
}
