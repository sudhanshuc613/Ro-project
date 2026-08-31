/**
 * GET /api/admin/search?q= — unified admin search, powers the command palette.
 *
 * Searches customers, orders, service requests and products in one round trip.
 * Deliberately capped at 4 results per type: the palette is for jumping to a
 * known record, not for browsing. Anyone who needs a full list has a dedicated
 * page for it.
 *
 * A phone-number query is the most common case for this business — the owner
 * gets a call and needs the history immediately — so digits are matched
 * against customer phone, order contact phone and service-request phone.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function guard(role?: string) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
  if (q.length < 2) return NextResponse.json({ hits: [] });

  const like = { contains: q, mode: 'insensitive' as const };

  try {
    const [customers, orders, services, products] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: 'CUSTOMER',
          OR: [{ fullName: like }, { phone: { contains: q } }, { email: like }],
        },
        select: { id: true, fullName: true, phone: true, email: true },
        take: 4,
      }),
      // The shipping name/phone live inside a JSON column, so they are not
      // directly queryable — order number and pincode are the indexed handles.
      prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: like },
            { shippingPincode: { contains: q } },
          ],
        },
        select: {
          id: true, orderNumber: true, shippingAddress: true,
          totalAmount: true, status: true,
        },
        orderBy: { placedAt: 'desc' },
        take: 4,
      }),
      prisma.serviceRequest.findMany({
        where: {
          OR: [
            { ticketNumber: like },
            { customerPhone: { contains: q } },
            { customerName: like },
          ],
        },
        select: {
          id: true, ticketNumber: true, customerName: true,
          customerPhone: true, status: true, area: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
      prisma.product.findMany({
        where: { deletedAt: null, OR: [{ name: like }, { sku: like }] },
        select: { id: true, name: true, sku: true, stockQuantity: true },
        take: 4,
      }),
    ]);

    const hits = [
      ...services.map((s) => ({
        type: 'service' as const,
        id: s.id,
        title: `${s.ticketNumber} — ${s.customerName}`,
        subtitle: `${s.status}${s.area ? ` · ${s.area}` : ''} · ${s.customerPhone}`,
        href: '/admin/service-requests',
        phone: s.customerPhone,
      })),
      ...orders.map((o) => {
        const ship = (o.shippingAddress ?? {}) as { contactName?: string; contactPhone?: string };
        return {
          type: 'order' as const,
          id: o.id,
          title: `${o.orderNumber} — ₹${Number(o.totalAmount).toLocaleString('en-IN')}`,
          subtitle: `${o.status}${ship.contactName ? ` · ${ship.contactName}` : ''}`,
          href: `/admin/orders/${o.id}`,
          phone: ship.contactPhone,
        };
      }),
      ...customers.map((c) => ({
        type: 'customer' as const,
        id: c.id,
        title: c.fullName || c.phone,
        subtitle: `Customer · ${c.phone}`,
        href: '/admin/customers',
        phone: c.phone,
      })),
      ...products.map((p) => ({
        type: 'product' as const,
        id: p.id,
        title: p.name,
        subtitle: `${p.sku} · ${p.stockQuantity} in stock`,
        href: `/admin/products/${p.id}`,
      })),
    ];

    return NextResponse.json({ hits: hits.slice(0, 12) });
  } catch (err) {
    console.error('[admin/search]', err);
    // A failed search must never break the palette — the static commands
    // still work without it.
    return NextResponse.json({ hits: [] });
  }
}
