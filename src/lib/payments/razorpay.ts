/**
 * Razorpay integration.
 *
 * Runs in MOCK MODE when RAZORPAY_KEY_ID is absent, so the whole checkout →
 * success → order-history flow is testable before you have live keys. Mock
 * mode is loudly logged and refuses to run in production.
 */
import crypto from 'crypto';

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export const isMockMode = !KEY_ID || !KEY_SECRET;

export interface GatewayOrder {
  id: string;
  amount: number;      // paise
  currency: string;
  keyId: string;
  mock: boolean;
}

/**
 * Create a Razorpay order. Amount must be in paise (₹1 = 100).
 */
export async function createGatewayOrder(
  amountInRupees: number,
  receipt: string,
  notes: Record<string, string> = {},
): Promise<GatewayOrder> {
  const amount = Math.round(amountInRupees * 100);

  if (isMockMode) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Razorpay keys are not configured — cannot accept live payments');
    }
    console.warn('[razorpay] MOCK MODE — no real payment will be taken');
    return {
      id: `order_mock_${crypto.randomBytes(8).toString('hex')}`,
      amount,
      currency: 'INR',
      keyId: 'rzp_test_mock',
      mock: true,
    };
  }

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, currency: 'INR', receipt, notes }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[razorpay] order create failed', err);
    throw new Error('Payment gateway is unavailable. Please try again.');
  }

  const data = await res.json();
  return { id: data.id, amount: data.amount, currency: data.currency, keyId: KEY_ID!, mock: false };
}

/**
 * Verify the signature returned by Razorpay Checkout.
 * HMAC-SHA256 of "<order_id>|<payment_id>" using the key secret.
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  if (isMockMode) {
    // Mock payments carry a deterministic fake signature
    return signature === `mock_sig_${orderId}`;
  }
  const expected = crypto
    .createHmac('sha256', KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  // Timing-safe compare — prevents signature-guessing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/** Verify a webhook payload signature (different secret from checkout). */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn('[razorpay] RAZORPAY_WEBHOOK_SECRET missing — rejecting webhook');
    return false;
  }
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/** Build the config object the browser passes to Razorpay Checkout. */
export function buildCheckoutOptions(params: {
  gatewayOrder: GatewayOrder;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}) {
  return {
    key: params.gatewayOrder.keyId,
    amount: params.gatewayOrder.amount,
    currency: params.gatewayOrder.currency,
    name: 'Aqua Perl',
    description: `Order ${params.orderNumber}`,
    image: '/brand/logo.png',
    order_id: params.gatewayOrder.id,
    prefill: {
      name: params.customerName,
      contact: params.customerPhone,
      email: params.customerEmail ?? '',
    },
    theme: { color: '#06B6D4' },
    notes: { orderNumber: params.orderNumber },
  };
}
