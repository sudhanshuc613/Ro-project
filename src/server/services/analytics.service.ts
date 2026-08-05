/**
 * Analytics service — powers the admin dashboard.
 *
 * Reads the reporting views defined in db/schema.sql where possible so the
 * aggregation logic lives in one place (SQL) rather than being duplicated in TS.
 */
import { prisma } from '@/lib/db/prisma';

export interface RevenuePoint {
  day: string;
  ecommerce: number;
  service: number;
  orders: number;
}

export interface DashboardAnalytics {
  todayRevenue: number;
  todayOrders: number;
  revenueDeltaPct: number;
  monthRevenue: number;
  monthDeltaPct: number;
  avgOrderValue: number;
  serviceRevenue: number;
  pendingServices: number;
  todayServices: number;
  ordersToShip: number;
  ordersInTransit: number;
  /** Prepaid orders where the money has not arrived — the chase list. */
  awaitingPayment: number;
  awaitingPaymentValue: number;
  newCustomers: number;
  repeatRate: number;
  abandonedCarts: number;
  recoveredRevenue: number;
  lowStockCount: number;
  revenueSeries: RevenuePoint[];
  servicePipeline: { status: string; count: number }[];
  recentOrders: RecentOrder[];
  lowStockItems: LowStockItem[];
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  city: string;
  total: number;
  status: string;
  paymentStatus: string;
  placedAt: Date;
}

export interface LowStockItem {
  id: string;
  sku: string;
  name: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysAgo = (n: number) => new Date(Date.now() - n * 864e5);
const pctDelta = (curr: number, prev: number) =>
  prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const today = startOfDay();
  const yesterday = startOfDay(daysAgo(1));
  const last30 = daysAgo(30);
  const prev30 = daysAgo(60);

  const [
    todayAgg,
    yesterdayAgg,
    monthAgg,
    prevMonthAgg,
    serviceAgg,
    pendingServices,
    todayServices,
    ordersToShip,
    ordersInTransit,
    awaitingPaymentAgg,
    newCustomers,
    repeatCustomers,
    totalCustomers,
    abandonedCarts,
    recoveredAgg,
    lowStockCount,
    revenueRows,
    pipelineRows,
    recentOrders,
    lowStockItems,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { placedAt: { gte: today }, paymentStatus: 'PAID', status: { not: 'CANCELLED' } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { placedAt: { gte: yesterday, lt: today }, paymentStatus: 'PAID', status: { not: 'CANCELLED' } },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { placedAt: { gte: last30 }, paymentStatus: 'PAID', status: { not: 'CANCELLED' } },
      _sum: { totalAmount: true },
      _avg: { totalAmount: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { placedAt: { gte: prev30, lt: last30 }, paymentStatus: 'PAID', status: { not: 'CANCELLED' } },
      _sum: { totalAmount: true },
    }),
    prisma.serviceRequest.aggregate({
      where: { completedAt: { gte: last30 }, status: 'COMPLETED' },
      _sum: { totalCharge: true },
    }),
    prisma.serviceRequest.count({
      where: { status: { in: ['NEW', 'CONTACTED', 'SCHEDULED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD_PARTS'] } },
    }),
    prisma.serviceRequest.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: { in: ['CONFIRMED', 'PACKED'] } } }),
    prisma.order.count({ where: { status: { in: ['SHIPPED', 'OUT_FOR_DELIVERY'] } } }),
    // Prepaid + unpaid + not cancelled = money the owner is still owed.
    prisma.order.aggregate({
      where: {
        paymentStatus: 'UNPAID',
        NOT: { paymentMethod: 'COD' },
        status: { notIn: ['CANCELLED', 'REFUNDED', 'RETURNED'] },
      },
      _count: true,
      _sum: { totalAmount: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: last30 }, role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'CUSTOMER', totalOrders: { gt: 1 } } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.cart.count({ where: { status: 'ABANDONED' } }),
    prisma.cart.aggregate({
      where: { status: 'RECOVERED', recoveredAt: { gte: last30 } },
      _sum: { subtotal: true },
    }),
    prisma.product.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        stockQuantity: { lte: prisma.product.fields.lowStockThreshold },
      },
    }).catch(() => 0),
    getRevenueSeries(30),
    prisma.serviceRequest.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { placedAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        paymentStatus: true,
        placedAt: true,
        shippingAddress: true,
        user: { select: { fullName: true } },
        guestPhone: true,
      },
    }),
    prisma.$queryRaw<LowStockItem[]>`
      SELECT id, sku, name, stock_quantity AS "stockQuantity",
             low_stock_threshold AS "lowStockThreshold"
      FROM products
      WHERE deleted_at IS NULL AND status = 'ACTIVE'
        AND stock_quantity <= low_stock_threshold
      ORDER BY stock_quantity ASC
      LIMIT 8
    `,
  ]);

  const todayRevenue = Number(todayAgg._sum.totalAmount ?? 0);
  const yesterdayRevenue = Number(yesterdayAgg._sum.totalAmount ?? 0);
  const monthRevenue = Number(monthAgg._sum.totalAmount ?? 0);
  const prevMonthRevenue = Number(prevMonthAgg._sum.totalAmount ?? 0);

  return {
    todayRevenue,
    todayOrders: todayAgg._count,
    revenueDeltaPct: pctDelta(todayRevenue, yesterdayRevenue),
    monthRevenue,
    monthDeltaPct: pctDelta(monthRevenue, prevMonthRevenue),
    avgOrderValue: Number(monthAgg._avg.totalAmount ?? 0),
    serviceRevenue: Number(serviceAgg._sum.totalCharge ?? 0),
    pendingServices,
    todayServices,
    ordersToShip,
    ordersInTransit,
    awaitingPayment: awaitingPaymentAgg._count,
    awaitingPaymentValue: Number(awaitingPaymentAgg._sum.totalAmount ?? 0),
    newCustomers,
    repeatRate: totalCustomers ? Math.round((repeatCustomers / totalCustomers) * 100) : 0,
    abandonedCarts,
    recoveredRevenue: Number(recoveredAgg._sum.subtotal ?? 0),
    lowStockCount: Array.isArray(lowStockItems) ? lowStockItems.length : Number(lowStockCount),
    revenueSeries: revenueRows,
    servicePipeline: pipelineRows.map((r) => ({ status: r.status, count: r._count.status })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user?.fullName ?? o.guestPhone ?? 'Guest',
      city: (o.shippingAddress as { city?: string })?.city ?? '—',
      total: Number(o.totalAmount),
      status: o.status,
      paymentStatus: o.paymentStatus,
      placedAt: o.placedAt,
    })),
    lowStockItems,
  };
}

/** Daily e-commerce + service revenue for the dashboard chart. */
export async function getRevenueSeries(days = 30): Promise<RevenuePoint[]> {
  const rows = await prisma.$queryRaw<
    { day: Date; ecommerce: string; service: string; orders: bigint }[]
  >`
    WITH series AS (
      SELECT generate_series(
        (CURRENT_DATE - (${days - 1} || ' days')::interval)::date,
        CURRENT_DATE,
        '1 day'::interval
      )::date AS day
    ),
    ecom AS (
      SELECT placed_at::date AS day,
             SUM(total_amount) AS revenue,
             COUNT(*) AS orders
      FROM orders
      WHERE payment_status = 'PAID' AND status <> 'CANCELLED'
        AND placed_at >= CURRENT_DATE - (${days} || ' days')::interval
      GROUP BY 1
    ),
    svc AS (
      SELECT completed_at::date AS day, SUM(total_charge) AS revenue
      FROM service_requests
      WHERE status = 'COMPLETED'
        AND completed_at >= CURRENT_DATE - (${days} || ' days')::interval
      GROUP BY 1
    )
    SELECT s.day,
           COALESCE(e.revenue, 0)::text AS ecommerce,
           COALESCE(v.revenue, 0)::text AS service,
           COALESCE(e.orders, 0) AS orders
    FROM series s
    LEFT JOIN ecom e ON e.day = s.day
    LEFT JOIN svc  v ON v.day = s.day
    ORDER BY s.day
  `;

  return rows.map((r) => ({
    day: new Date(r.day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    ecommerce: Number(r.ecommerce),
    service: Number(r.service),
    orders: Number(r.orders),
  }));
}

/** Nightly rollup into daily_metrics (called by /api/cron/rollup-metrics). */
export async function rollupDailyMetrics(date = new Date()) {
  const day = startOfDay(date);
  const next = new Date(day.getTime() + 864e5);

  const [orders, services, customers, carts] = await Promise.all([
    prisma.order.aggregate({
      where: { placedAt: { gte: day, lt: next } },
      _sum: { totalAmount: true },
      _avg: { totalAmount: true },
      _count: true,
    }),
    prisma.serviceRequest.aggregate({
      where: { createdAt: { gte: day, lt: next } },
      _sum: { totalCharge: true },
      _count: true,
    }),
    prisma.user.count({ where: { createdAt: { gte: day, lt: next } } }),
    prisma.cart.groupBy({
      by: ['status'],
      where: { createdAt: { gte: day, lt: next } },
      _count: true,
    }),
  ]);

  const countBy = (s: string) => carts.find((c) => c.status === s)?._count ?? 0;

  return prisma.dailyMetric.upsert({
    where: { metricDate: day },
    update: {
      revenueEcommerce: orders._sum.totalAmount ?? 0,
      revenueService: services._sum.totalCharge ?? 0,
      ordersCount: orders._count,
      avgOrderValue: orders._avg.totalAmount ?? 0,
      serviceRequestsNew: services._count,
      newCustomers: customers,
      cartsCreated: carts.reduce((n, c) => n + c._count, 0),
      cartsAbandoned: countBy('ABANDONED'),
      cartsRecovered: countBy('RECOVERED'),
      computedAt: new Date(),
    },
    create: {
      metricDate: day,
      revenueEcommerce: orders._sum.totalAmount ?? 0,
      revenueService: services._sum.totalCharge ?? 0,
      ordersCount: orders._count,
      avgOrderValue: orders._avg.totalAmount ?? 0,
      serviceRequestsNew: services._count,
      newCustomers: customers,
      cartsCreated: carts.reduce((n, c) => n + c._count, 0),
      cartsAbandoned: countBy('ABANDONED'),
      cartsRecovered: countBy('RECOVERED'),
    },
  });
}
