/**
 * POST /api/checkout/quote — server-authoritative cart pricing.
 *
 * The checkout UI calls this on every pincode/payment change so the customer
 * always sees the exact amount the server will charge. No price ever comes
 * from the browser.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { quoteCart } from '@/server/services/order.service';

const schema = z.object({
  lines: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().nullable().optional(),
    quantity: z.number().int().min(1).max(99),
  })),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  paymentMethod: z.enum(['PREPAID', 'COD']).default('PREPAID'),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid cart' }, { status: 422 });
  }

  const quote = await quoteCart(parsed.data.lines, parsed.data.pincode, parsed.data.paymentMethod);
  return NextResponse.json(quote);
}
