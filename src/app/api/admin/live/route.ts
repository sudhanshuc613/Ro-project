/**
 * GET /api/admin/live — real-time feed for the admin dashboard.
 *
 * WHY POLLING AND NOT WEBSOCKETS:
 * Vercel runs Next.js as serverless functions. Each invocation terminates
 * after it responds, so there is no persistent process to hold a socket open.
 * Socket.io / ws / native WebSocket cannot run there — this is architectural,
 * not a config problem. Vercel's own dashboard uses polling for live updates.
 *
 * This endpoint is designed for cheap, frequent polling:
 *   - Single round-trip, all counters in one payload
 *   - `since` param returns only what changed, so the client can toast/ping
 *   - No caching, always fresh
 *
 * If you later move to a VPS (Railway/Render/Hostinger), swap the client
 * hook for Socket.io — the server logic below stays identical.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Client sends the timestamp of its last poll; we return only newer rows
  const sinceParam = req.nextUrl.searchParams.get('since');
  const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 60_000);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    newOrders,
    newServices,
    pendingServices,
    ordersToShip,
    todayRevenueAgg,
    todayServiceCount,
    unassignedServices,
  ] = await Promise.all([
    // Only orders created since the client's last poll
    prisma.order.findMany({
      where: { placedAt: { gt: since } },
      orderBy: { placedAt: 'desc' },
      take: 10,
      select: {
        id: true, orderNumber: true, totalAmount: true, status: true,
        placedAt: true, shippingAddress: true,
        user: { select: { fullName: true, phone: true } },
      },
    }),
    prisma.serviceRequest.findMany({
      where: { createdAt: { gt: since } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, ticketNumber: true, customerName: true, customerPhone: true,
        area: true, pincode: true, serviceType: true, issueDescription: true,
        priority: true, createdAt: true,
      },
    }),
    prisma.serviceRequest.count({
      where: { status: { in: ['NEW', 'CONTACTED', 'SCHEDULED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD_PARTS'] } },
    }),
    prisma.order.count({ where: { status: { in: ['CONFIRMED', 'PACKED'] } } }),
    prisma.order.aggregate({
      where: { placedAt: { gte: todayStart }, paymentStatus: 'PAID', status: { not: 'CANCELLED' } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.serviceRequest.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.serviceRequest.count({ where: { status: 'NEW', assignedTechnicianId: null } }),
  ]);

  return NextResponse.json(
    {
      serverTime: new Date().toISOString(),
      // Anything > 0 here means the client should show a notification
      newOrders: newOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: o.user?.fullName ?? 'Guest',
        phone: o.user?.phone ?? '',
        city: (o.shippingAddress as { city?: string })?.city ?? '',
        amount: Number(o.totalAmount),
        status: o.status,
        at: o.placedAt,
      })),
      newServices: newServices.map((s) => ({
        id: s.id,
        ticketNumber: s.ticketNumber,
        customer: s.customerName,
        phone: s.customerPhone,
        area: s.area ?? s.pincode,
        type: s.serviceType,
        issue: s.issueDescription.slice(0, 90),
        priority: s.priority,
        at: s.createdAt,
      })),
      counters: {
        pendingServices,
        unassignedServices,
        ordersToShip,
        todayRevenue: Number(todayRevenueAgg._sum.totalAmount ?? 0),
        todayOrders: todayRevenueAgg._count,
        todayServices: todayServiceCount,
      },
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}
