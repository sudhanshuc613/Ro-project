/**
 * Order service — the money path. Every rule that protects revenue lives here.
 *
 * Design decisions:
 *  - Prices are RE-READ from the DB, never trusted from the client. A tampered
 *    cart payload cannot buy a ₹78,000 plant for ₹1.
 *  - Stock is decremented inside the same transaction as order creation, so two
 *    simultaneous buyers of the last unit cannot both succeed.
 *  - order_items store name/sku/price snapshots, so a later price change never
 *    rewrites a historical invoice.
 *  - COD is capped and pincode-gated; prepaid orders stay PENDING until the
 *    Razorpay webhook confirms payment.
 */
import { prisma } from '@/lib/db/prisma';
import { generateOrderNumber } from '@/lib/utils/format';
import { sendWhatsApp, notifyAdmins } from '@/lib/integrations/whatsapp';
import { SHIPPING } from '@/lib/constants';
import type { Prisma } from '@prisma/client';

export interface CartLine {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface AddressInput {
  contactName: string;
  contactPhone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface QuoteResult {
  lines: {
    productId: string;
    variantId: string | null;
    name: string;
    sku: string;
    image: string | null;
    unitPrice: number;
    mrp: number;
    quantity: number;
    lineTotal: number;
    taxRate: number;
    inStock: boolean;
    available: number;
  }[];
  subtotal: number;
  savings: number;
  shipping: number;
  codCharge: number;
  total: number;
  codAvailable: number;
  etaDays: number;
  errors: string[];
}

/**
 * Price the cart from authoritative DB data.
 * Also used by the UI so the customer sees exactly what the server will charge.
 */
export async function quoteCart(
  lines: CartLine[],
  pincode?: string,
  paymentMethod: 'PREPAID' | 'COD' = 'PREPAID',
): Promise<QuoteResult> {
  const errors: string[] = [];

  if (!lines.length) {
    return {
      lines: [], subtotal: 0, savings: 0, shipping: 0, codCharge: 0, total: 0,
      codAvailable: 0, etaDays: 5, errors: ['Your cart is empty'],
    };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, deletedAt: null },
    include: {
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      variants: true,
    },
  });

  const priced: QuoteResult['lines'] = [];
  let subtotal = 0;
  let savings = 0;
  let anyFreeShipping = false;

  for (const line of lines) {
    const p = products.find((x) => x.id === line.productId);
    if (!p) { errors.push('A product in your cart is no longer available'); continue; }
    if (p.status !== 'ACTIVE') { errors.push(`${p.name} is currently unavailable`); continue; }

    const variant = line.variantId ? p.variants.find((v) => v.id === line.variantId) : null;
    const unitPrice = Number(variant?.sellingPrice ?? p.sellingPrice);
    const mrp = Number(variant?.mrp ?? p.mrp);
    const available = variant?.stockQuantity ?? p.stockQuantity;
    const qty = Math.max(1, Math.min(line.quantity, 99));

    if (!p.allowBackorder && available < qty) {
      errors.push(
        available === 0
          ? `${p.name} is out of stock`
          : `Only ${available} left of ${p.name}`,
      );
    }

    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;
    savings += Math.max(0, (mrp - unitPrice) * qty);
    if (p.freeShipping) anyFreeShipping = true;

    priced.push({
      productId: p.id,
      variantId: variant?.id ?? null,
      name: variant ? `${p.name} — ${variant.variantName}` : p.name,
      sku: variant?.sku ?? p.sku,
      image: variant?.imageUrl ?? p.images[0]?.url ?? null,
      unitPrice, mrp, quantity: qty, lineTotal,
      taxRate: Number(p.taxRate),
      inStock: available >= qty || p.allowBackorder,
      available,
    });
  }

  // Shipping + COD rules come from the pincode table where available
  let etaDays = 5;
  let codAvailable = 0;
  let shipping = subtotal >= SHIPPING.freeAbove || anyFreeShipping ? 0 : SHIPPING.flatRate;

  if (pincode) {
    const pin = await prisma.pincode.findUnique({ where: { pincode } });
    if (pin) {
      if (!pin.isDeliveryAvailable) errors.push(`We do not deliver to ${pincode} yet`);
      etaDays = pin.standardEtaDays;
      codAvailable = pin.isCodAvailable && subtotal <= SHIPPING.codMaxOrder ? 1 : 0;
      if (shipping > 0 && Number(pin.shippingZoneRate) > 0) {
        shipping = Number(pin.shippingZoneRate);
      }
    }
  }

  const codCharge = paymentMethod === 'COD' ? SHIPPING.codCharge : 0;
  if (paymentMethod === 'COD' && !codAvailable && pincode) {
    errors.push('Cash on Delivery is not available for this pincode or order value');
  }

  return {
    lines: priced,
    subtotal,
    savings,
    shipping,
    codCharge,
    total: subtotal + shipping + codCharge,
    codAvailable,
    etaDays,
    errors,
  };
}

interface CreateOrderArgs {
  userId?: string | null;
  guestPhone?: string;
  guestEmail?: string;
  lines: CartLine[];
  shipping: AddressInput;
  billing?: AddressInput | null;
  paymentMethod: 'RAZORPAY' | 'COD';
  customerNote?: string;
  utmSource?: string;
}

/**
 * Create an order atomically: validate → price → decrement stock → write rows.
 * Returns the order plus the amount the gateway should charge.
 */
export async function createOrder(args: CreateOrderArgs) {
  const isCod = args.paymentMethod === 'COD';
  const quote = await quoteCart(args.lines, args.shipping.pincode, isCod ? 'COD' : 'PREPAID');

  if (quote.errors.length) {
    throw new OrderError(quote.errors[0], quote.errors);
  }
  if (!quote.lines.length) {
    throw new OrderError('Your cart is empty');
  }

  const orderNumber = await generateOrderNumber();
  const taxAmount = quote.lines.reduce(
    (sum, l) => sum + (l.lineTotal * l.taxRate) / (100 + l.taxRate),
    0,
  );

  const order = await prisma.$transaction(async (tx) => {
    // Re-check stock inside the transaction — guards against the race where
    // two customers buy the last unit at the same moment.
    for (const l of quote.lines) {
      if (l.variantId) {
        const v = await tx.productVariant.findUnique({ where: { id: l.variantId } });
        if (v && v.stockQuantity < l.quantity) {
          throw new OrderError(`${l.name} just went out of stock`);
        }
      } else {
        const p = await tx.product.findUnique({
          where: { id: l.productId },
          select: { stockQuantity: true, allowBackorder: true, name: true },
        });
        if (p && !p.allowBackorder && p.stockQuantity < l.quantity) {
          throw new OrderError(`${p.name} just went out of stock`);
        }
      }
    }

    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: args.userId ?? null,
        guestPhone: args.userId ? null : args.guestPhone,
        guestEmail: args.userId ? null : args.guestEmail,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: args.paymentMethod,
        subtotal: quote.subtotal,
        discountAmount: 0,
        shippingAmount: quote.shipping,
        taxAmount,
        codCharge: quote.codCharge,
        totalAmount: quote.total,
        shippingAddress: args.shipping as unknown as Prisma.InputJsonValue,
        billingAddress: (args.billing ?? args.shipping) as unknown as Prisma.InputJsonValue,
        shippingPincode: args.shipping.pincode,
        customerNote: args.customerNote ?? null,
        utmSource: args.utmSource ?? null,
        estimatedDelivery: new Date(Date.now() + quote.etaDays * 864e5),
        items: {
          create: quote.lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            productName: l.name,
            productSku: l.sku,
            productImageUrl: l.image,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRate: l.taxRate,
            lineTotal: l.lineTotal,
          })),
        },
        statusHistory: {
          create: { toStatus: 'PENDING', note: `Order placed (${args.paymentMethod})` },
        },
      },
      include: { items: true },
    });

    // Reserve stock now so the item cannot be oversold while payment is pending
    for (const l of quote.lines) {
      if (l.variantId) {
        await tx.productVariant.update({
          where: { id: l.variantId },
          data: { stockQuantity: { decrement: l.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: l.productId },
          data: { stockQuantity: { decrement: l.quantity }, soldCount: { increment: l.quantity } },
        });
      }
    }

    if (args.userId) {
      await tx.user.update({
        where: { id: args.userId },
        data: { totalOrders: { increment: 1 } },
      });
    }

    return created;
  });

  return { order, quote };
}

/**
 * Confirm payment (called by the Razorpay webhook) or confirm a COD order.
 * Idempotent: replaying the same webhook does not double-confirm.
 */
export async function confirmOrderPaid(
  orderId: string,
  payment?: { gatewayPaymentId: string; gatewayOrderId: string; signature: string; raw?: unknown },
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { id: true, fullName: true, phone: true } } },
  });
  if (!order) throw new OrderError('Order not found');
  if (order.paymentStatus === 'PAID') return order; // already handled

  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
    });

    await tx.orderStatusHistory.create({
      data: { orderId, fromStatus: 'PENDING', toStatus: 'CONFIRMED', note: 'Payment received' },
    });

    if (payment) {
      await tx.payment.create({
        data: {
          orderId,
          gateway: 'RAZORPAY',
          gatewayOrderId: payment.gatewayOrderId,
          gatewayPaymentId: payment.gatewayPaymentId,
          gatewaySignature: payment.signature,
          method: 'RAZORPAY',
          amount: o.totalAmount,
          status: 'PAID',
          rawPayload: (payment.raw ?? {}) as Prisma.InputJsonValue,
        },
      });
    }

    if (o.userId) {
      await tx.user.update({
        where: { id: o.userId },
        data: { lifetimeValue: { increment: o.totalAmount } },
      });
    }

    return o;
  });

  const phone = order.user?.phone ?? order.guestPhone;
  if (phone) {
    void sendWhatsApp({
      to: `91${phone}`,
      template: 'order_confirmed',
      variables: [
        (order.user?.fullName ?? 'Customer').split(' ')[0],
        order.orderNumber,
        `₹${Number(order.totalAmount).toLocaleString('en-IN')}`,
        order.estimatedDelivery?.toLocaleDateString('en-IN') ?? '3–7 days',
      ],
      userId: order.userId ?? undefined,
      relatedType: 'ORDER',
      relatedId: orderId,
    });
  }

  void notifyAdmins(
    'admin_new_order_alert',
    [
      order.orderNumber,
      order.user?.fullName ?? 'Guest',
      `₹${Number(order.totalAmount).toLocaleString('en-IN')}`,
      (order.shippingAddress as { city?: string })?.city ?? '',
    ],
    'ORDER',
    orderId,
  );

  return updated;
}

/** Release reserved stock when an order fails or is cancelled. */
export async function releaseOrderStock(orderId: string, reason: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.status === 'CANCELLED') return;

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { increment: item.quantity } },
        }).catch(() => {});
      } else if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { increment: item.quantity },
            soldCount: { decrement: item.quantity },
          },
        }).catch(() => {});
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', cancelReason: reason },
    });

    await tx.orderStatusHistory.create({
      data: { orderId, toStatus: 'CANCELLED', note: reason },
    });
  });
}

/** Admin status transition with history + customer notification. */
const ORDER_FLOW: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
  RETURNED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export async function updateOrderStatus(
  orderId: string,
  toStatus: string,
  actorId: string,
  opts: { courierPartner?: string; trackingNumber?: string; trackingUrl?: string; note?: string } = {},
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { fullName: true, phone: true } } },
  });
  if (!order) throw new OrderError('Order not found');

  const allowed = ORDER_FLOW[order.status] ?? [];
  if (!allowed.includes(toStatus)) {
    throw new OrderError(`Cannot move an order from ${order.status} to ${toStatus}`);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({
      where: { id: orderId },
      data: {
        status: toStatus as never,
        ...(opts.courierPartner ? { courierPartner: opts.courierPartner } : {}),
        ...(opts.trackingNumber ? { trackingNumber: opts.trackingNumber } : {}),
        ...(opts.trackingUrl ? { trackingUrl: opts.trackingUrl } : {}),
        ...(toStatus === 'SHIPPED' ? { shippedAt: new Date() } : {}),
        ...(toStatus === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
      },
    });

    await tx.orderStatusHistory.create({
      data: { orderId, fromStatus: order.status, toStatus: toStatus as never, note: opts.note, changedBy: actorId },
    });

    return o;
  });

  const phone = order.user?.phone ?? order.guestPhone;
  if (phone && toStatus === 'SHIPPED') {
    void sendWhatsApp({
      to: `91${phone}`,
      template: 'order_shipped',
      variables: [
        (order.user?.fullName ?? 'Customer').split(' ')[0],
        order.orderNumber,
        opts.courierPartner ?? 'Courier',
        opts.trackingNumber ?? '—',
      ],
      relatedType: 'ORDER',
      relatedId: orderId,
    });
  }
  if (phone && toStatus === 'DELIVERED') {
    void sendWhatsApp({
      to: `91${phone}`,
      template: 'order_delivered',
      variables: [(order.user?.fullName ?? 'Customer').split(' ')[0], order.orderNumber],
      relatedType: 'ORDER',
      relatedId: orderId,
    });
  }

  return updated;
}

export class OrderError extends Error {
  details: string[];
  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = 'OrderError';
    this.details = details;
  }
}
