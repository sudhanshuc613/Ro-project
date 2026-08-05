/**
 * POST /api/orders — place an order.
 *
 * Flow:
 *   validate → price server-side → create order + reserve stock →
 *   COD ? confirm immediately : create Razorpay order and return checkout config
 *
 * The client never sends prices. It sends product IDs and quantities only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/db/redis';
import { createOrder, confirmOrderPaid, releaseOrderStock, OrderError } from '@/server/services/order.service';
import { createGatewayOrder, buildCheckoutOptions } from '@/lib/payments/razorpay';
import { prisma } from '@/lib/db/prisma';
import { getAvailablePaymentMethods } from '@/lib/settings';
import { notifyAdmins } from '@/lib/integrations/whatsapp';

const addressSchema = z.object({
  contactName: z.string().trim().min(2).max(120),
  contactPhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile'),
  line1: z.string().trim().min(5).max(255),
  line2: z.string().max(255).optional().or(z.literal('')),
  landmark: z.string().max(160).optional().or(z.literal('')),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
});

const schema = z.object({
  lines: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().nullable().optional(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1')
      .max(99, 'Maximum 99 units per item — call us for bulk orders'),
  })).min(1, 'Cart is empty'),
  shipping: addressSchema,
  billing: addressSchema.nullable().optional(),
  paymentMethod: z.enum(['RAZORPAY', 'COD', 'UPI_MANUAL', 'BANK']),
  customerNote: z.string().max(500).optional().or(z.literal('')),
  guestEmail: z.string().email().optional().or(z.literal('')),
  /** UTR the customer typed after paying by UPI — verified by the admin. */
  paymentReference: z.string().trim().max(40).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Please check your details', errors: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const d = parsed.data;

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    if (!(await rateLimit(`order:${d.shipping.contactPhone}:${ip}`, 5, 600))) {
      return NextResponse.json(
        { message: 'Too many order attempts. Please call us to complete your order.' },
        { status: 429 },
      );
    }

    const session = await getServerSession(authOptions);

    // Refuse a method the admin has switched off. Without this a stale browser
    // tab could place an order through a channel we no longer accept.
    const available = await getAvailablePaymentMethods(0, true);
    const methodEnabled =
      (d.paymentMethod === 'RAZORPAY' && available.razorpay) ||
      (d.paymentMethod === 'UPI_MANUAL' && available.upiManual) ||
      (d.paymentMethod === 'BANK' && available.bankTransfer) ||
      (d.paymentMethod === 'COD' && available.settings.codEnabled);

    if (!methodEnabled) {
      return NextResponse.json(
        { message: 'That payment method is not available right now. Please pick another or call us.' },
        { status: 409 },
      );
    }

    // UPI_MANUAL / BANK are stored as their real enum values; the DB has no
    // 'UPI_MANUAL' member and inventing one would break every existing report.
    const dbMethod =
      d.paymentMethod === 'UPI_MANUAL' ? 'UPI'
      : d.paymentMethod === 'BANK' ? 'NETBANKING'
      : d.paymentMethod;

    const { order, quote } = await createOrder({
      userId: session?.user?.id ?? null,
      guestPhone: d.shipping.contactPhone,
      guestEmail: d.guestEmail || undefined,
      lines: d.lines,
      shipping: d.shipping,
      billing: d.billing ?? null,
      paymentMethod: dbMethod,
      customerNote: d.customerNote || undefined,
    });

    /* ── Manual UPI / bank transfer ──────────────────────────────────────
       Money moves outside our system, so the order is created UNPAID with the
       customer's reference recorded. The admin verifies it against the bank
       and marks it paid from /admin/orders. Honest and auditable — far better
       than pretending a gateway confirmed it. */
    if (d.paymentMethod === 'UPI_MANUAL' || d.paymentMethod === 'BANK') {
      if (d.paymentReference) {
        await prisma.payment.create({
          data: {
            orderId: order.id,
            gateway: 'MANUAL',
            gatewayPaymentId: d.paymentReference,
            method: dbMethod as never,
            amount: quote.total,
            status: 'UNPAID',
            rawPayload: {
              source: 'CUSTOMER_DECLARED',
              declaredAt: new Date().toISOString(),
              channel: d.paymentMethod,
            },
          },
        });
        await prisma.order.update({
          where: { id: order.id },
          data: {
            customerNote: [d.customerNote, `Customer reference: ${d.paymentReference}`]
              .filter(Boolean).join(' | ').slice(0, 500),
          },
        });
      }

      void notifyAdmins(
        'admin_new_order_alert',
        [order.orderNumber, d.shipping.contactName, `₹${quote.total}`, d.shipping.city],
        'ORDER',
        order.id,
      );

      return NextResponse.json({
        success: true,
        awaitingVerification: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod: d.paymentMethod,
        redirectTo: `/checkout/success?order=${order.orderNumber}&pending=1`,
      });
    }

    /* ── Cash on Delivery: confirm right away ── */
    if (dbMethod === 'COD') {
      await confirmOrderPaid(order.id);
      return NextResponse.json(
        {
          success: true,
          paymentMethod: 'COD',
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: quote.total,
          redirectTo: `/checkout/success?order=${order.orderNumber}`,
        },
        { status: 201 },
      );
    }

    /* ── Prepaid: hand off to Razorpay ── */
    try {
      const gatewayOrder = await createGatewayOrder(quote.total, order.orderNumber, {
        orderId: order.id,
        phone: d.shipping.contactPhone,
      });

      return NextResponse.json(
        {
          success: true,
          paymentMethod: 'RAZORPAY',
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: quote.total,
          mock: gatewayOrder.mock,
          checkout: buildCheckoutOptions({
            gatewayOrder,
            orderNumber: order.orderNumber,
            customerName: d.shipping.contactName,
            customerPhone: d.shipping.contactPhone,
            customerEmail: d.guestEmail || undefined,
          }),
        },
        { status: 201 },
      );
    } catch (gwErr) {
      // Gateway down — do not leave stock reserved for an order that can't be paid
      await releaseOrderStock(order.id, 'Payment gateway unavailable');
      throw gwErr;
    }
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ message: err.message, errors: err.details }, { status: 409 });
    }
    console.error('[orders:POST]', err);
    return NextResponse.json(
      { message: 'Could not place the order. Please try again or call us.' },
      { status: 500 },
    );
  }
}
