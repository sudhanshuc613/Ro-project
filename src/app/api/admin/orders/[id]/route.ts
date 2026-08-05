/**
 * Admin order operations — the missing half of the order lifecycle.
 *
 * Before this route existed the admin could SEE orders but not act on them:
 * no way to move PENDING → CONFIRMED → SHIPPED, no way to record that a UPI
 * payment landed, no way to attach a tracking number. Orders effectively
 * froze the moment they were placed.
 *
 * Four actions, each with its own guard:
 *   status   — advance the order, enforced by the ORDER_FLOW state machine
 *   payment  — record money received / failed / refunded
 *   tracking — courier + AWB, fires the WhatsApp "shipped" message
 *   note     — internal admin note, never shown to the customer
 *
 * Everything is audited, because money and fulfilment are exactly where you
 * need to know who did what later.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { updateOrderStatus, OrderError } from '@/server/services/order.service';
import { logAudit } from '@/server/services/audit.service';
import { sendWhatsApp } from '@/lib/integrations/whatsapp';

export const runtime = 'nodejs';

function guard(role?: string) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'STAFF';
}

const statusSchema = z.object({
  action: z.literal('status'),
  status: z.enum([
    'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY',
    'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED',
  ]),
  note: z.string().trim().max(500).optional(),
  courierPartner: z.string().trim().max(60).optional(),
  trackingNumber: z.string().trim().max(80).optional(),
  trackingUrl: z.string().trim().max(400).optional(),
});

const paymentSchema = z.object({
  action: z.literal('payment'),
  paymentStatus: z.enum(['UNPAID', 'AUTHORIZED', 'PAID', 'FAILED', 'PARTIALLY_REFUNDED', 'REFUNDED']),
  paymentMethod: z.enum(['RAZORPAY', 'UPI', 'CARD', 'NETBANKING', 'WALLET', 'COD']).optional(),
  /** UPI UTR / bank reference — proof the owner checked their account. */
  reference: z.string().trim().max(80).optional(),
  amount: z.number().min(0).optional(),
  note: z.string().trim().max(500).optional(),
});

const trackingSchema = z.object({
  action: z.literal('tracking'),
  courierPartner: z.string().trim().min(2).max(60),
  trackingNumber: z.string().trim().min(3).max(80),
  trackingUrl: z.string().trim().max(400).optional(),
  estimatedDelivery: z.string().trim().optional(),
});

const noteSchema = z.object({
  action: z.literal('note'),
  adminNote: z.string().trim().max(2000),
});

const bodySchema = z.discriminatedUnion('action', [
  statusSchema, paymentSchema, trackingSchema, noteSchema,
]);

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      payments: { orderBy: { createdAt: 'desc' } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
      user: { select: { id: true, fullName: true, phone: true, email: true } },
    },
  });
  if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const actorId = session!.user.id;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const body = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { user: { select: { fullName: true, phone: true } } },
  });
  if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

  const customerPhone = order.user?.phone ?? order.guestPhone;
  const firstName = (order.user?.fullName ?? 'Customer').split(' ')[0];

  /* ── STATUS ─────────────────────────────────────────────────────────── */
  if (body.action === 'status') {
    try {
      // Refuse to ship something nobody has paid for, unless it is COD.
      // This is the guard that stops the most expensive human error there is.
      if (
        ['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(body.status) &&
        order.paymentMethod !== 'COD' &&
        order.paymentStatus !== 'PAID'
      ) {
        return NextResponse.json(
          {
            message:
              'This is a prepaid order and payment is not marked as received yet. Record the payment first, or cancel the order.',
          },
          { status: 409 },
        );
      }

      const updated = await updateOrderStatus(params.id, body.status, actorId, {
        note: body.note,
        courierPartner: body.courierPartner,
        trackingNumber: body.trackingNumber,
        trackingUrl: body.trackingUrl,
      });

      await logAudit({
        actorId,
        action: 'order.status_change',
        entityType: 'ORDER',
        entityId: params.id,
        beforeData: { status: order.status },
        afterData: { status: body.status },
      });

      return NextResponse.json({ success: true, order: updated });
    } catch (err) {
      if (err instanceof OrderError) {
        return NextResponse.json({ message: err.message }, { status: 409 });
      }
      console.error('[admin/orders] status error:', err);
      return NextResponse.json({ message: 'Could not update status' }, { status: 500 });
    }
  }

  /* ── PAYMENT ────────────────────────────────────────────────────────── */
  if (body.action === 'payment') {
    const amount = body.amount ?? Number(order.totalAmount);

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: params.id },
        data: {
          paymentStatus: body.paymentStatus,
          ...(body.paymentMethod ? { paymentMethod: body.paymentMethod } : {}),
          // A paid PENDING order should not stay pending — that is the state
          // that blocks packing and confuses the fulfilment queue.
          ...(body.paymentStatus === 'PAID' && order.status === 'PENDING'
            ? { status: 'CONFIRMED' as const }
            : {}),
        },
      });

      // Manual payments still get a payments row, so the money trail is
      // identical whether it came from a gateway webhook or the owner's eyes.
      //
      // IMPORTANT: gatewayPaymentId is UNIQUE. When a customer declares a UTR
      // at checkout we already wrote a row with that reference in UNPAID
      // state. Confirming the same UTR must UPDATE that row, not insert a
      // duplicate — otherwise the whole confirmation fails on a constraint.
      const existing = body.reference
        ? await tx.payment.findFirst({
            where: { orderId: params.id, gatewayPaymentId: body.reference },
          })
        : null;

      const paymentData = {
        gateway: body.paymentMethod === 'RAZORPAY' ? 'RAZORPAY' : 'MANUAL',
        method: body.paymentMethod ?? order.paymentMethod ?? null,
        amount,
        status: body.paymentStatus,
        rawPayload: {
          recordedBy: actorId,
          recordedAt: new Date().toISOString(),
          note: body.note ?? null,
          source: 'ADMIN_MANUAL',
        },
        ...(body.paymentStatus === 'REFUNDED' || body.paymentStatus === 'PARTIALLY_REFUNDED'
          ? { refundAmount: amount, refundedAt: new Date() }
          : {}),
      };

      if (existing) {
        await tx.payment.update({ where: { id: existing.id }, data: paymentData });
      } else {
        await tx.payment.create({
          data: { ...paymentData, orderId: params.id, gatewayPaymentId: body.reference || null },
        });
      }

      if (body.paymentStatus === 'PAID' && order.status === 'PENDING') {
        await tx.orderStatusHistory.create({
          data: {
            orderId: params.id,
            fromStatus: order.status,
            toStatus: 'CONFIRMED',
            note: `Payment recorded${body.reference ? ` · ref ${body.reference}` : ''}`,
            changedBy: actorId,
          },
        });
      }

      return o;
    });

    if (customerPhone && body.paymentStatus === 'PAID') {
      void sendWhatsApp({
        to: `91${customerPhone}`,
        template: 'payment_received',
        variables: [firstName, order.orderNumber, `₹${amount.toLocaleString('en-IN')}`],
        relatedType: 'ORDER',
        relatedId: params.id,
      });
    }

    await logAudit({
      actorId,
      action: 'order.payment_update',
      entityType: 'ORDER',
      entityId: params.id,
      beforeData: { paymentStatus: order.paymentStatus },
      afterData: { paymentStatus: body.paymentStatus, reference: body.reference, amount },
    });

    return NextResponse.json({ success: true, order: updated });
  }

  /* ── TRACKING ───────────────────────────────────────────────────────── */
  if (body.action === 'tracking') {
    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        courierPartner: body.courierPartner,
        trackingNumber: body.trackingNumber,
        trackingUrl: body.trackingUrl || null,
        ...(body.estimatedDelivery ? { estimatedDelivery: new Date(body.estimatedDelivery) } : {}),
      },
    });

    if (customerPhone) {
      void sendWhatsApp({
        to: `91${customerPhone}`,
        template: 'order_shipped',
        variables: [firstName, order.orderNumber, body.courierPartner, body.trackingNumber],
        relatedType: 'ORDER',
        relatedId: params.id,
      });
    }

    await logAudit({
      actorId,
      action: 'order.tracking_update',
      entityType: 'ORDER',
      entityId: params.id,
      afterData: { courier: body.courierPartner, awb: body.trackingNumber },
    });

    return NextResponse.json({ success: true, order: updated });
  }

  /* ── INTERNAL NOTE ──────────────────────────────────────────────────── */
  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { adminNote: body.adminNote },
  });
  await logAudit({
    actorId,
    action: 'order.note',
    entityType: 'ORDER',
    entityId: params.id,
    afterData: { adminNote: body.adminNote },
  });
  return NextResponse.json({ success: true, order: updated });
}
