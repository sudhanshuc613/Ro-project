/**
 * GET /api/pincode/check?pincode=800020&productId=...&type=service
 *
 * Single endpoint answering both business questions:
 *   • Can we DELIVER this product here?  (pan-India e-commerce)
 *   • Can we SERVICE this address?       (Patna local operations)
 *
 * Cached in Redis for 24h — pincode data is effectively static.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { cacheGet, cacheSet } from '@/lib/db/redis';
import { SHIPPING, SERVICE } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const pincode = sp.get('pincode') ?? '';
  const productId = sp.get('productId');

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ message: 'Invalid pincode' }, { status: 400 });
  }

  const cacheKey = `pin:${pincode}:${productId ?? 'na'}`;
  const cached = await cacheGet<object>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const [pin, product] = await Promise.all([
    prisma.pincode.findUnique({ where: { pincode } }),
    productId
      ? prisma.product.findUnique({
          where: { id: productId },
          select: { isPanIndia: true, freeShipping: true, sellingPrice: true, weightGrams: true, requiresInstallation: true },
        })
      : Promise.resolve(null),
  ]);

  // Unknown pincode → conservative default (deliverable, not serviceable)
  if (!pin) {
    const fallback = {
      pincode, city: '', state: '',
      deliveryAvailable: true, serviceAvailable: false, codAvailable: false,
      etaDays: 7, shippingFee: SHIPPING.flatRate, visitCharge: 0,
      note: 'Estimated — confirm at checkout',
    };
    await cacheSet(cacheKey, fallback, 3600);
    return NextResponse.json(fallback);
  }

  const price = product ? Number(product.sellingPrice) : 0;
  const freeShip = product?.freeShipping || price >= SHIPPING.freeAbove;

  const payload = {
    pincode: pin.pincode,
    city: pin.city,
    state: pin.state,
    // Product marked non-pan-India (e.g. bulky commercial plant) ships in-state only
    deliveryAvailable:
      pin.isDeliveryAvailable && (product ? product.isPanIndia || pin.state === 'Bihar' : true),
    serviceAvailable: pin.isServiceAvailable,
    codAvailable: pin.isCodAvailable && price <= SHIPPING.codMaxOrder,
    etaDays: pin.standardEtaDays,
    expressEtaDays: pin.expressEtaDays,
    shippingFee: freeShip ? 0 : Number(pin.shippingZoneRate) || SHIPPING.flatRate,
    visitCharge: pin.isServiceAvailable ? Number(pin.visitCharge) : 0,
    freeInstallation: pin.isServiceAvailable && (product?.requiresInstallation ?? false),
    serviceCity: pin.isServiceAvailable ? SERVICE.city : null,
  };

  await cacheSet(cacheKey, payload, 86400);
  return NextResponse.json(payload);
}
