/**
 * Which payment methods the checkout should render.
 *
 * Public because the checkout page is public (guests can buy). Only the
 * details a payer legitimately needs are exposed — UPI ID and bank details
 * are payee information, the same thing printed on any invoice. No keys,
 * no secrets.
 */
import { NextResponse } from 'next/server';
import { getAvailablePaymentMethods } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const a = await getAvailablePaymentMethods(0, true);

  return NextResponse.json({
    razorpay: a.razorpay,
    upiManual: a.upiManual,
    bankTransfer: a.bankTransfer,
    cod: a.settings.codEnabled,
    upiId: a.upiManual ? a.settings.upiId : '',
    upiName: a.settings.upiName,
    bankDetails: a.bankTransfer ? a.settings.bankDetails : '',
    paymentNote: a.settings.paymentNote,
    codCharge: a.settings.codCharge,
    codMaxOrder: a.settings.codMaxOrder,
  });
}
