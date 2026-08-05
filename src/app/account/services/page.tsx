/**
 * Full service history.
 *
 * Two things large retailers do that matter here:
 *  1. Live items pinned above completed ones
 *  2. A repeat action on every past job ("book the same thing again")
 *
 * Plus one thing they can't do: show the 30-day repair warranty countdown,
 * because they don't repair anything.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN, relativeTime } from '@/lib/utils/format';
import { getContactSettings, telLink, waLink } from '@/lib/settings';
import { SectionHeader, EmptyState, Badge, SERVICE_TONE } from '@/components/account/ui';

export const metadata: Metadata = {
  title: 'Service History',
  robots: { index: false, follow: false },
};

const LIVE = ['NEW', 'CONTACTED', 'SCHEDULED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD_PARTS'];

export default async function ServicesPage() {
  const session = await getServerSession(authOptions);
  const [requests, contact] = await Promise.all([
    prisma.serviceRequest.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTechnician: { select: { fullName: true, phone: true, ratingAvg: true, jobsCompleted: true } },
      },
    }),
    getContactSettings(),
  ]);

  const live = requests.filter((r) => LIVE.includes(r.status));
  const past = requests.filter((r) => !LIVE.includes(r.status));

  const totalSpent = past.reduce(
    (s, r) => s + (Number(r.totalCharge) || Number(r.visitCharge)),
    0,
  );

  if (requests.length === 0) {
    return (
      <div>
        <SectionHeader title="Service History" />
        <EmptyState
          icon="🔧"
          title="No service requests yet"
          body={`Book a technician for your RO — ₹200 visit charge in Patna, and it's waived if we can't fix the problem.`}
          ctaLabel="Book a service"
          ctaHref="/#book-service"
        />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <SectionHeader
        title="Service History"
        subtitle={`${requests.length} request${requests.length === 1 ? '' : 's'} · ${formatINR(totalSpent)} spent on service`}
        action={
          <Link href="/#book-service" className="rounded-xl bg-cta-orange px-5 py-2.5 text-sm font-bold text-white shadow-cta transition hover:bg-cta-orangeDark">
            + Book new
          </Link>
        }
      />

      {live.length > 0 && (
        <section>
          <p className="eyebrow mb-3">Happening now</p>
          <ul className="space-y-3">
            {live.map((r) => (
              <li key={r.id} className="card border-l-4 border-l-aqua-500 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-aqua-600">{r.ticketNumber}</span>
                      <Badge tone={SERVICE_TONE[r.status]}>{r.status.replace(/_/g, ' ')}</Badge>
                    </div>
                    <p className="mt-1.5 font-semibold text-navy-700">{r.serviceType.replace(/_/g, ' ')}</p>
                    <p className="mt-0.5 text-sm text-muted line-clamp-2">{r.issueDescription}</p>
                    {r.scheduledAt && (
                      <p className="mt-1.5 text-sm text-navy-600">
                        📅 Scheduled {formatDateIN(r.scheduledAt)}
                      </p>
                    )}
                    {r.assignedTechnician && (
                      <p className="mt-1.5 text-sm text-emerald-700">
                        👷 {r.assignedTechnician.fullName} · {Number(r.assignedTechnician.ratingAvg).toFixed(1)}★ ·{' '}
                        <a href={telLink(r.assignedTechnician.phone)} className="font-semibold hover:underline">
                          {r.assignedTechnician.phone}
                        </a>
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/track/${r.ticketNumber}`}
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

      {past.length > 0 && (
        <section>
          <p className="eyebrow mb-3">Completed</p>
          <ul className="space-y-3">
            {past.map((r) => {
              const warrantyLeft = r.completedAt
                ? Math.ceil(
                    (new Date(r.completedAt).getTime() + r.warrantyDays * 864e5 - Date.now()) / 864e5,
                  )
                : 0;
              const underWarranty = warrantyLeft > 0;

              return (
                <li key={r.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-bold text-navy-700">{r.ticketNumber}</span>
                        <Badge tone={SERVICE_TONE[r.status]}>{r.status.replace(/_/g, ' ')}</Badge>
                        {underWarranty && (
                          <span className="seal">🛡️ {warrantyLeft}d warranty left</span>
                        )}
                      </div>
                      <p className="mt-1.5 font-semibold text-navy-700">{r.serviceType.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted">
                        {formatDateIN(r.createdAt)} · {relativeTime(r.createdAt)}
                      </p>

                      {r.resolutionNote && (
                        <p className="mt-2.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                          <strong>What we fixed:</strong> {r.resolutionNote}
                        </p>
                      )}

                      {r.customerRating ? (
                        <p className="mt-2 text-sm text-gold-700">
                          You rated this {'★'.repeat(r.customerRating)}
                          <span className="text-navy-200">{'★'.repeat(5 - r.customerRating)}</span>
                        </p>
                      ) : r.status === 'COMPLETED' ? (
                        <a
                          href={waLink(contact.whatsapp, `Feedback for service ${r.ticketNumber}: `)}
                          target="_blank" rel="noopener noreferrer"
                          className="mt-2 inline-block text-sm font-bold text-aqua-600 hover:underline"
                        >
                          ★ Rate this service
                        </a>
                      ) : null}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="tnum font-display text-lg font-extrabold text-navy-700">
                        {formatINR(Number(r.totalCharge) || Number(r.visitCharge))}
                      </p>
                      {Number(r.partsCharge) > 0 && (
                        <p className="tnum text-xs text-muted">
                          incl. {formatINR(Number(r.partsCharge))} parts
                        </p>
                      )}
                      <div className="mt-2.5 flex flex-col gap-1.5">
                        <Link
                          href={`/track/${r.ticketNumber}`}
                          className="rounded-lg bg-navy-50 px-3 py-1.5 text-xs font-bold text-navy-700 hover:bg-navy-100"
                        >
                          View details
                        </Link>
                        {underWarranty && (
                          <a
                            href={waLink(contact.whatsapp, `Same problem came back on ticket ${r.ticketNumber}. Please check under warranty.`)}
                            target="_blank" rel="noopener noreferrer"
                            className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
                          >
                            Problem again?
                          </a>
                        )}
                        <a
                          href={waLink(contact.whatsapp, `Please book the same service again: ${r.serviceType.replace(/_/g, ' ')}`)}
                          target="_blank" rel="noopener noreferrer"
                          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                        >
                          Book again
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
