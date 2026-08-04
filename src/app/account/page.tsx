/**
 * Customer dashboard — REAL data, replaces the earlier placeholder.
 *
 * Shows live order history, service ticket history with status, and profile.
 * Guests are redirected to /login with a callback so they land back here.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN, relativeTime } from '@/lib/utils/format';
import { getContactSettings, telLink, waLink } from '@/lib/settings';
import SignOutButton from '@/components/account/SignOutButton';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false, follow: false },
};

const ORDER_STYLE: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PACKED: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  OUT_FOR_DELIVERY: 'bg-amber-100 text-amber-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const SERVICE_STYLE: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-indigo-100 text-indigo-700',
  SCHEDULED: 'bg-violet-100 text-violet-700',
  ASSIGNED: 'bg-cyan-100 text-cyan-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login?callbackUrl=/account');

  const [user, orders, services, contact] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        fullName: true, phone: true, email: true,
        totalOrders: true, totalServices: true, createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { placedAt: 'desc' },
      take: 10,
      select: {
        id: true, orderNumber: true, status: true, paymentStatus: true,
        totalAmount: true, placedAt: true, trackingNumber: true,
        courierPartner: true, _count: { select: { items: true } },
      },
    }),
    prisma.serviceRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, ticketNumber: true, status: true, serviceType: true,
        issueDescription: true, totalCharge: true, visitCharge: true,
        createdAt: true, scheduledAt: true,
        assignedTechnician: { select: { fullName: true, phone: true } },
      },
    }),
    getContactSettings(),
  ]);

  if (!user) redirect('/login');

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy-700">
            Namaste, {user.fullName.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted">
            +91 {user.phone}
            {user.email ? ` · ${user.email}` : ''} · Member since {formatDateIN(user.createdAt)}
          </p>
        </div>
        <SignOutButton />
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Total Orders" value={String(orders.length)} icon="📦" />
        <Stat label="Service Requests" value={String(services.length)} icon="🔧" />
        <Stat label="Visit Charge" value="₹200" icon="💰" sub="Your rate in Patna" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* ── Service history ── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy-700">Service History</h2>
            <Link href="/#book-service" className="text-sm font-bold text-aqua-600 hover:underline">
              + Book new
            </Link>
          </div>

          {services.length === 0 ? (
            <Empty
              icon="🔧"
              title="No service requests yet"
              body="Book a technician for your RO — ₹200 visit charge in Patna."
              ctaLabel="Book Service"
              ctaHref="/#book-service"
            />
          ) : (
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s.id} className="rounded-2xl border border-navy-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-bold text-aqua-600">{s.ticketNumber}</span>
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${SERVICE_STYLE[s.status] ?? 'bg-slate-100'}`}>
                          {s.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-navy-700">
                        {s.serviceType.replace(/_/g, ' ')}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted">{s.issueDescription}</p>

                      {s.assignedTechnician && (
                        <p className="mt-2 text-sm text-emerald-700">
                          👷 {s.assignedTechnician.fullName} ·{' '}
                          <a href={telLink(s.assignedTechnician.phone)} className="font-semibold hover:underline">
                            {s.assignedTechnician.phone}
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold text-navy-700">
                        {formatINR(Number(s.totalCharge) || Number(s.visitCharge))}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{relativeTime(s.createdAt)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Order history ── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy-700">My Orders</h2>
            <Link href="/products" className="text-sm font-bold text-aqua-600 hover:underline">
              Shop now
            </Link>
          </div>

          {orders.length === 0 ? (
            <Empty
              icon="📦"
              title="No orders yet"
              body="Browse RO purifiers, spare parts and commercial plants."
              ctaLabel="Browse Products"
              ctaHref="/products"
            />
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li key={o.id} className="rounded-2xl border border-navy-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-bold text-aqua-600">{o.orderNumber}</span>
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${ORDER_STYLE[o.status] ?? 'bg-slate-100'}`}>
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-muted">
                        {o._count.items} item{o._count.items === 1 ? '' : 's'} · {formatDateIN(o.placedAt)}
                      </p>
                      {o.trackingNumber && (
                        <p className="mt-1.5 text-sm text-navy-600">
                          🚚 {o.courierPartner} · <span className="font-mono">{o.trackingNumber}</span>
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold text-navy-700">{formatINR(Number(o.totalAmount))}</p>
                      <p className={`mt-0.5 text-xs font-semibold ${o.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {o.paymentStatus}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Help */}
      <div className="mt-8 rounded-2xl bg-emerald-50 p-6 ring-1 ring-emerald-100">
        <p className="font-bold text-emerald-900">Need help with an order or service?</p>
        <p className="mt-1 text-sm text-emerald-800">
          Our team is available {contact.hours}, all 7 days.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={telLink(contact.primaryPhone)} className="rounded-xl bg-cta-green px-5 py-2.5 text-sm font-bold text-white hover:bg-cta-greenDark">
            📞 {contact.primaryPhone}
          </a>
          <a
            href={waLink(contact.whatsapp, `Hi, this is ${user.fullName}. I need help with my account.`)}
            target="_blank" rel="noopener noreferrer"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, icon, sub }: { label: string; value: string; icon: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-navy-100 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-navy-700">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function Empty({
  icon, title, body, ctaLabel, ctaHref,
}: { icon: string; title: string; body: string; ctaLabel: string; ctaHref: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy-200 py-10 text-center">
      <p className="text-3xl">{icon}</p>
      <p className="mt-2 font-semibold text-navy-700">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{body}</p>
      <Link href={ctaHref} className="mt-4 inline-block rounded-xl bg-cta-orange px-5 py-2.5 text-sm font-bold text-white hover:bg-cta-orangeDark">
        {ctaLabel}
      </Link>
    </div>
  );
}
