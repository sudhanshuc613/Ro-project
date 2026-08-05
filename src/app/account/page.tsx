/**
 * Account dashboard.
 *
 * ── WHAT THIS PAGE IS FOR ─────────────────────────────────────────────────
 * One question: "is anything happening with my stuff right now, and is
 * anything about to need my attention?"
 *
 * So the order is:
 *   1. LIVE things (service in progress, order out for delivery) — pinned top
 *   2. DUE things (filter overdue, AMC expiring, order awaiting review)
 *   3. Recent history, summarised
 *
 * Notably absent: reward points, coin balance, referral banners. Those are
 * engagement theatre. A customer opening this page has a working or broken
 * water purifier on their mind.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN, relativeTime } from '@/lib/utils/format';
import { getServiceSettings } from '@/lib/settings';
import { computeMachineHealth } from '@/server/services/machine.service';
import { SectionHeader, EmptyState, StatCard, Badge, ORDER_TONE, SERVICE_TONE } from '@/components/account/ui';

export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false, follow: false },
};

const LIVE_SERVICE = ['NEW', 'CONTACTED', 'SCHEDULED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD_PARTS'];
const LIVE_ORDER = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'];

export default async function AccountDashboard() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [liveServices, liveOrders, machines, amc, recentServices, recentOrders, reviewable, svc] =
    await Promise.all([
      prisma.serviceRequest.findMany({
        where: { userId, status: { in: LIVE_SERVICE as never[] } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, ticketNumber: true, status: true, serviceType: true,
          createdAt: true, scheduledAt: true, visitCharge: true,
          assignedTechnician: { select: { fullName: true, phone: true, ratingAvg: true } },
        },
      }),
      prisma.order.findMany({
        where: { userId, status: { in: LIVE_ORDER as never[] } },
        orderBy: { placedAt: 'desc' },
        select: {
          id: true, orderNumber: true, status: true, totalAmount: true,
          placedAt: true, estimatedDelivery: true, trackingNumber: true,
          courierPartner: true, trackingUrl: true, _count: { select: { items: true } },
        },
      }),
      prisma.customerMachine.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.amcSubscription.findMany({
        where: { userId, isActive: true },
        orderBy: { endsOn: 'asc' },
      }),
      prisma.serviceRequest.findMany({
        where: { userId, status: { notIn: LIVE_SERVICE as never[] } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true, ticketNumber: true, status: true, serviceType: true,
          totalCharge: true, visitCharge: true, createdAt: true, customerRating: true,
        },
      }),
      prisma.order.findMany({
        where: { userId, status: { notIn: LIVE_ORDER as never[] } },
        orderBy: { placedAt: 'desc' },
        take: 3,
        select: {
          id: true, orderNumber: true, status: true, totalAmount: true,
          placedAt: true, _count: { select: { items: true } },
        },
      }),
      // Delivered items the customer has NOT reviewed yet
      prisma.orderItem.findMany({
        where: {
          order: { userId, status: 'DELIVERED' },
          productId: { not: null },
          product: { reviews: { none: { userId } } },
        },
        take: 4,
        select: {
          id: true, productName: true, productImageUrl: true,
          product: { select: { slug: true } },
        },
      }),
      getServiceSettings(),
    ]);

  const health = machines.map(computeMachineHealth);
  const overdue = health.filter((h) => h.dueItems.some((d) => d.state === 'overdue'));
  const dueSoon = health.filter(
    (h) => !overdue.includes(h) && h.dueItems.some((d) => d.state === 'due-soon'),
  );

  const expiringAmc = amc.filter(
    (a) => (new Date(a.endsOn).getTime() - Date.now()) / 864e5 <= 45,
  );

  const nothingLive =
    liveServices.length === 0 && liveOrders.length === 0;

  return (
    <div className="space-y-8">
      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Live service" value={String(liveServices.length)} sub="in progress" href="/account/services" tone={liveServices.length ? 'good' : 'default'} />
        <StatCard label="Live orders" value={String(liveOrders.length)} sub="on the way" href="/account/orders" tone={liveOrders.length ? 'good' : 'default'} />
        <StatCard label="My machines" value={String(machines.length)} sub={overdue.length ? `${overdue.length} need attention` : 'all healthy'} href="/account/machines" tone={overdue.length ? 'warn' : 'default'} />
        <StatCard label="Visit charge" value={formatINR(svc.visitCharge)} sub={`Your rate in ${svc.city}`} tone="gold" />
      </div>

      {/* ── Needs attention ── */}
      {(overdue.length > 0 || expiringAmc.length > 0) && (
        <section className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <h2 className="font-display text-lg font-bold text-amber-900">Needs your attention</h2>
          <ul className="mt-3 space-y-2.5">
            {overdue.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3.5">
                <span className="text-sm">
                  <strong className="text-navy-700">{h.title}</strong>
                  <span className="block text-muted">
                    {h.dueItems
                      .filter((d) => d.state === 'overdue')
                      .map((d) => `${d.label} overdue by ${d.overdueByMonths} month${d.overdueByMonths === 1 ? '' : 's'}`)
                      .join(' · ')}
                  </span>
                </span>
                <Link href="/#book-service" className="shrink-0 rounded-lg bg-cta-green px-4 py-2 text-sm font-bold text-white">
                  Book visit
                </Link>
              </li>
            ))}
            {expiringAmc.map((a) => {
              const days = Math.max(0, Math.ceil((new Date(a.endsOn).getTime() - Date.now()) / 864e5));
              return (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3.5">
                  <span className="text-sm">
                    <strong className="text-navy-700">{a.planName} AMC</strong>
                    <span className="block text-muted">
                      Expires in {days} day{days === 1 ? '' : 's'} · {formatDateIN(a.endsOn)}
                    </span>
                  </span>
                  <Link href="/account/amc" className="shrink-0 rounded-lg bg-navy-700 px-4 py-2 text-sm font-bold text-white">
                    Renew
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── Live service ── */}
      {liveServices.length > 0 && (
        <section>
          <SectionHeader
            title="Happening now"
            subtitle="Live updates — no need to call and ask"
            action={<Link href="/account/services" className="text-sm font-bold text-aqua-600 hover:underline">View all →</Link>}
          />
          <ul className="space-y-3">
            {liveServices.map((s) => (
              <li key={s.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-aqua-600">{s.ticketNumber}</span>
                      <Badge tone={SERVICE_TONE[s.status]}>{s.status.replace(/_/g, ' ')}</Badge>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ripple rounded-full bg-emerald-500" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>
                        live
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-navy-700">
                      {s.serviceType.replace(/_/g, ' ')}
                    </p>
                    {s.assignedTechnician ? (
                      <p className="mt-1 text-sm text-emerald-700">
                        👷 {s.assignedTechnician.fullName} · {Number(s.assignedTechnician.ratingAvg).toFixed(1)}★
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-muted">Technician being assigned…</p>
                    )}
                  </div>
                  <Link
                    href={`/track/${s.ticketNumber}`}
                    className="shrink-0 rounded-xl bg-navy-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-navy-600"
                  >
                    Track live →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Live orders ── */}
      {liveOrders.length > 0 && (
        <section>
          <SectionHeader
            title="On the way"
            action={<Link href="/account/orders" className="text-sm font-bold text-aqua-600 hover:underline">View all →</Link>}
          />
          <ul className="space-y-3">
            {liveOrders.map((o) => (
              <li key={o.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-aqua-600">{o.orderNumber}</span>
                      <Badge tone={ORDER_TONE[o.status]}>{o.status.replace(/_/g, ' ')}</Badge>
                    </div>
                    <p className="mt-1.5 text-sm text-muted">
                      {o._count.items} item{o._count.items === 1 ? '' : 's'} · {formatINR(Number(o.totalAmount))}
                      {o.estimatedDelivery && ` · arriving ${formatDateIN(o.estimatedDelivery)}`}
                    </p>
                    {o.trackingNumber && (
                      <p className="mt-1 text-sm text-navy-600">
                        🚚 {o.courierPartner} · <span className="font-mono text-xs">{o.trackingNumber}</span>
                      </p>
                    )}
                  </div>
                  <Link href="/account/orders" className="shrink-0 rounded-xl bg-navy-50 px-4 py-2.5 text-sm font-bold text-navy-700 transition hover:bg-navy-100">
                    Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {nothingLive && (
        <EmptyState
          icon="✅"
          title="Nothing pending right now"
          body="No live service requests or orders. Book a technician or browse the shop whenever you need us."
          ctaLabel="Book a service"
          ctaHref="/#book-service"
          secondary={
            <Link href="/products" className="text-sm font-bold text-aqua-600 hover:underline">
              or browse products →
            </Link>
          }
        />
      )}

      {/* ── Rate what you bought ── */}
      {reviewable.length > 0 && (
        <section>
          <SectionHeader title="Rate your purchases" subtitle="Helps other Patna customers decide" />
          <ul className="grid gap-3 sm:grid-cols-2">
            {reviewable.map((it) => (
              <li key={it.id} className="card flex items-center gap-3 p-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-sand-200 text-xl">
                  💧
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-navy-700 line-clamp-2">
                  {it.productName}
                </span>
                <Link
                  href={it.product?.slug ? `/products/${it.product.slug}#review` : '/account/reviews'}
                  className="shrink-0 rounded-lg bg-gold-50 px-3 py-2 text-xs font-bold text-gold-700 ring-1 ring-gold-200"
                >
                  ★ Rate
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Recent history ── */}
      {(recentServices.length > 0 || recentOrders.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {recentServices.length > 0 && (
            <section>
              <SectionHeader
                title="Past services"
                action={<Link href="/account/services" className="text-sm font-bold text-aqua-600 hover:underline">All →</Link>}
              />
              <ul className="space-y-2.5">
                {recentServices.map((s) => (
                  <li key={s.id} className="card flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-700">
                        {s.serviceType.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted">
                        {s.ticketNumber} · {relativeTime(s.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tnum text-sm font-bold text-navy-700">
                        {formatINR(Number(s.totalCharge) || Number(s.visitCharge))}
                      </p>
                      <Badge tone={SERVICE_TONE[s.status]}>{s.status.replace(/_/g, ' ')}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {recentOrders.length > 0 && (
            <section>
              <SectionHeader
                title="Past orders"
                action={<Link href="/account/orders" className="text-sm font-bold text-aqua-600 hover:underline">All →</Link>}
              />
              <ul className="space-y-2.5">
                {recentOrders.map((o) => (
                  <li key={o.id} className="card flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-700">{o.orderNumber}</p>
                      <p className="text-xs text-muted">
                        {o._count.items} item{o._count.items === 1 ? '' : 's'} · {formatDateIN(o.placedAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tnum text-sm font-bold text-navy-700">{formatINR(Number(o.totalAmount))}</p>
                      <Badge tone={ORDER_TONE[o.status]}>{o.status.replace(/_/g, ' ')}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* ── Machines nudge ── */}
      {machines.length === 0 && (
        <section className="rounded-2xl bg-navy-gradient p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-lg">
              <p className="eyebrow text-aqua-300">Free · takes 30 seconds</p>
              <h2 className="mt-1.5 font-display text-xl font-extrabold">Add your RO machine</h2>
              <p className="mt-1.5 text-sm text-navy-100 text-pretty">
                Tell us the brand and when filters were last changed. We&apos;ll remind you
                before the water goes bad — instead of you finding out the hard way.
              </p>
            </div>
            <Link
              href="/account/machines"
              className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy-700 transition hover:bg-sand-100"
            >
              Add machine →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
