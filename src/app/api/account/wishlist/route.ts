/**
 * Wishlist add/remove/toggle.
 *
 * The composite primary key (userId, productId) makes duplicates impossible
 * at the database level, so "add twice" is a no-op rather than an error.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ items: [] });

  const rows = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return NextResponse.json({ items: rows.map((r) => r.productId) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Please log in to save items' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const productId = body?.productId as string | undefined;
  if (!productId) return NextResponse.json({ message: 'productId is required' }, { status: 400 });

  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: { id: true },
  });
  if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

  const userId = session.user.id;
  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  // Toggle semantics keep the heart button to a single endpoint.
  if (existing && body?.toggle) {
    await prisma.wishlist.delete({ where: { userId_productId: { userId, productId } } });
    return NextResponse.json({ success: true, saved: false });
  }

  await prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });

  return NextResponse.json({ success: true, saved: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const productId = req.nextUrl.searchParams.get('productId');
  if (!productId) return NextResponse.json({ message: 'productId is required' }, { status: 400 });

  await prisma.wishlist
    .delete({ where: { userId_productId: { userId: session.user.id, productId } } })
    .catch(() => null); // already gone is a success from the caller's view

  return NextResponse.json({ success: true });
}
