/**
 * Product reviews written by the logged-in customer.
 *
 * Two integrity rules, both enforced server-side:
 *  1. VERIFIED ONLY — the customer must have a DELIVERED order containing
 *     this product. Without this, review sections fill with junk and stop
 *     being believable, which defeats the point of having them.
 *  2. ONE PER PRODUCT — prevents rating stuffing.
 *
 * Reviews land unapproved. The product's rating average is recalculated by
 * a database trigger (see 00_search_extensions/migration.sql) and only
 * counts approved rows, so an unmoderated review cannot move the score.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

const schema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  rating: z.coerce.number().int().min(1, 'Pick a rating').max(5),
  title: z.string().trim().max(160).optional().nullable(),
  body: z.string().trim().max(2000).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Please check the form', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const { productId, rating, title, body } = parsed.data;

  const already = await prisma.productReview.findFirst({ where: { userId, productId } });
  if (already) {
    return NextResponse.json(
      { message: 'You have already reviewed this product.' },
      { status: 409 },
    );
  }

  // Purchase verification — find a delivered order of theirs with this item.
  const purchase = await prisma.orderItem.findFirst({
    where: { productId, order: { userId, status: 'DELIVERED' } },
    select: { orderId: true },
  });
  if (!purchase) {
    return NextResponse.json(
      { message: 'You can review a product only after it has been delivered to you.' },
      { status: 403 },
    );
  }

  const review = await prisma.productReview.create({
    data: {
      productId,
      userId,
      orderId: purchase.orderId,
      rating,
      title: title || null,
      body: body || null,
      isVerified: true,
      isApproved: false,
    },
  });

  return NextResponse.json({ success: true, review }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

  const owned = await prisma.productReview.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!owned) return NextResponse.json({ message: 'Review not found' }, { status: 404 });

  await prisma.productReview.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
