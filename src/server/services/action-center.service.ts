/**
 * ACTION CENTER — turns raw tables into "what should I do right now".
 *
 * Every item here is a condition that costs money if ignored, checked against
 * live data and ranked by cost. The thresholds are deliberate:
 *
 *  • A service request untouched for 2+ hours is the single most expensive
 *    thing on this list. Local RO customers ring two or three numbers; the
 *    first to call back usually wins the job.
 *  • Out-of-stock beats low-stock, because a listed product that cannot ship
 *    converts a visitor into a refund request.
 *  • Service-due customers are the cheapest revenue available — they already
 *    trust us and a filter change is ₹500-1,500.
 *
 * Every query is wrapped so a single failure degrades one row rather than
 * breaking the whole dashboard.
 */
import { prisma } from '@/lib/db/prisma';
import type { ActionItem } from '@/components/admin/ActionCenter';

export async function getActionItems(): Promise<ActionItem[]> {
  const items: ActionItem[] = [];
  const now = Date.now();

  /* 1 — Service requests going cold */
  try {
    const twoHoursAgo = new Date(now - 2 * 3600_000);
    const [stale, newToday] = await Promise.all([
      prisma.serviceRequest.count({
        where: { status: 'NEW', createdAt: { lt: twoHoursAgo } },
      }),
      prisma.serviceRequest.count({
        where: { status: 'NEW', createdAt: { gte: twoHoursAgo } },
      }),
    ]);

    if (stale > 0) {
      items.push({
        severity: 'critical',
        icon: '🔴',
        title: `${stale} service request 2 ghante se pending`,
        detail: 'Customer doosre ko call kar dega. Abhi call karo.',
        href: '/admin/service-requests',
        cta: 'Kholo',
      });
    }
    if (newToday > 0) {
      items.push({
        severity: 'warn',
        icon: '🔧',
        title: `${newToday} nayi service request`,
        detail: 'Abhi tak contact nahi kiya gaya',
        href: '/admin/service-requests',
        cta: 'Dekho',
      });
    }
  } catch { /* skip this row */ }

  /* 2 — Stock */
  try {
    const [out, low] = await Promise.all([
      prisma.product.count({
        where: { deletedAt: null, status: 'ACTIVE', stockQuantity: { lte: 0 } },
      }),
      prisma.product.count({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          stockQuantity: { gt: 0, lte: 5 },
        },
      }),
    ]);

    if (out > 0) {
      items.push({
        severity: 'critical',
        icon: '📦',
        title: `${out} product ka stock khatam`,
        detail: 'Site pe dikh raha hai par bhej nahi sakte',
        href: '/admin/inventory',
        cta: 'Fix karo',
      });
    }
    if (low > 0) {
      items.push({
        severity: 'warn',
        icon: '⚠️',
        title: `${low} product ka stock kam`,
        detail: '5 ya usse kam bache hain — order kar do',
        href: '/admin/inventory',
        cta: 'Dekho',
      });
    }
  } catch { /* skip */ }

  /* 3 — Orders stuck unshipped */
  try {
    const dayAgo = new Date(now - 24 * 3600_000);
    const stuck = await prisma.order.count({
      where: { status: 'CONFIRMED', placedAt: { lt: dayAgo } },
    });
    if (stuck > 0) {
      items.push({
        severity: 'warn',
        icon: '🛒',
        title: `${stuck} order 24 ghante se pack nahi hua`,
        detail: 'Customer wait kar raha hai',
        href: '/admin/orders',
        cta: 'Kholo',
      });
    }
  } catch { /* skip */ }

  /* 4 — Service due: the cheapest revenue in the business */
  try {
    const weekAhead = new Date(now + 7 * 86400_000);
    const due = await prisma.customerMachine.count({
      where: { nextServiceDue: { lte: weekAhead, gte: new Date(now - 30 * 86400_000) } },
    });
    if (due > 0) {
      items.push({
        severity: 'info',
        icon: '⏰',
        title: `${due} customer ka filter change due hai`,
        detail: 'Purane customer — call karo, ₹500-1,500 ka kaam',
        href: '/admin/service-due',
        cta: 'List dekho',
      });
    }
  } catch { /* skip */ }

  /* 5 — Abandoned carts */
  try {
    const dayAgo = new Date(now - 24 * 3600_000);
    const carts = await prisma.cart.count({
      where: { status: 'ACTIVE', lastActivityAt: { lt: dayAgo }, items: { some: {} } },
    });
    if (carts >= 3) {
      items.push({
        severity: 'info',
        icon: '🛍️',
        title: `${carts} cart chhod diya gaya`,
        detail: 'WhatsApp bhejo — kuch wapas aa jayenge',
        href: '/admin/abandoned-carts',
        cta: 'Dekho',
      });
    }
  } catch { /* skip */ }

  const rank = { critical: 0, warn: 1, info: 2 };
  return items.sort((a, b) => rank[a.severity] - rank[b.severity]).slice(0, 6);
}

/** Today's headline numbers for the dashboard strip. */
export async function getTodayPulse() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const yStart = new Date(start.getTime() - 86400_000);

  try {
    const [
      todayServices, yesterdayServices,
      todayOrders, todayRevenue, pendingServices,
    ] = await Promise.all([
      prisma.serviceRequest.count({ where: { createdAt: { gte: start } } }),
      prisma.serviceRequest.count({ where: { createdAt: { gte: yStart, lt: start } } }),
      prisma.order.count({ where: { placedAt: { gte: start } } }),
      prisma.order.aggregate({
        where: { placedAt: { gte: start }, status: { notIn: ['CANCELLED'] } },
        _sum: { totalAmount: true },
      }),
      prisma.serviceRequest.count({ where: { status: { in: ['NEW', 'CONTACTED'] } } }),
    ]);

    const revenue = Number(todayRevenue._sum.totalAmount ?? 0);
    const delta = yesterdayServices > 0
      ? Math.round(((todayServices - yesterdayServices) / yesterdayServices) * 100)
      : null;

    return { todayServices, todayOrders, revenue, pendingServices, delta };
  } catch {
    return { todayServices: 0, todayOrders: 0, revenue: 0, pendingServices: 0, delta: null };
  }
}
