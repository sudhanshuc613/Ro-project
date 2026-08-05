/**
 * The logged-in customer's default address, for pre-filling checkout.
 *
 * Saves a returning customer from retyping eight fields — the single biggest
 * friction point in repeat purchases.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ address: null });

  const address = await prisma.address.findFirst({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    select: {
      contactName: true, contactPhone: true, line1: true, line2: true,
      landmark: true, city: true, state: true, pincode: true,
    },
  });

  return NextResponse.json({ address });
}
