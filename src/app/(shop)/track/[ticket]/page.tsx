import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN, relativeTime } from '@/lib/utils/format';
import { getContactSettings, telLink, waLink } from '@/lib/settings';
import TrackingRefresher from '@/components/service/TrackingRefresher';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Track Your Service Request',
  robots: { index: false, follow: false },
};

/**
 * Public service tracking — no login needed, just the ticket number.
 *
 * This directly answers the #1 complaint about local RO services in Patna:
 * "technician said he's coming, four hours passed and no update". The page
 * auto-refreshes so the customer always sees the current stage.
 */
const STAGES = [
  { key: 'NEW', label: 'Request received', desc: 'We have your booking' },
  { key: 'CONTACTED', label: 'Confirmed by phone', desc: 'Our team called you' },
  { key: 'ASSIGNED', label: 'Technician assigned', desc: 'On the way to you' },
  { key: 'IN_PROGRESS', label: 'Work in progress', desc: 'Technician is at your place' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Job done, warranty active' },
] as const;

const STAGE_INDEX: Record<string, number> = {
  NEW: 0, CONTACTED: 1, SCHEDULED: 1, ASSIGNED: 2,
  IN_PROGRESS: 3, ON_HOLD_PARTS: 3, COMPLETED: 4,
};

export default async function TrackPage({ params }: { params: { ticket: string } }) {
  const [request, contact] = await Promise.all([
    prisma.serviceRequest.findUnique({
      where: { ticketNumber: params.ticket.toUpperCase() },
      include: {
        assignedTechnician: { select: { fullName: true, phone: true, ratingAvg: true, jobsCompleted: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    }),
    getContactSettings(),
  ]);

  if (!request) notFound();

  const cancelled = request.status === 'CANCELLED' || request.status === 'NO_RESPONSE';
  const activeIdx = STAGE_INDEX[request.status] ?? 0;
  const onHold = request.status === 'ON_HOLD_PARTS';

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      {/* Auto-refresh so the customer sees status changes without reloading */}
      <TrackingRefresher intervalMs={20000} />

      <div className="rounded-2xl bg-[linear-gradient(115deg,#0B2545_0%,#13315C_55%,#0E7490_100%)] p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-aqua-200">Service Request</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold">{request.ticketNumber}</h1>
        <p className="mt-2 text-sm text-navy-100">
          {request.serviceType.replace(/_/g, ' ')} · Booked {relativeTime(request.createdAt)}
        </p>
      </div>

      {cancelled ? (
        <div className="mt-5 rounded-2xl bg-red-50 p-6 text-center ring-1 ring-red-200">
          <p className="text-3xl">😕</p>
          <p className="mt-2 font-bold text-red-900">
            This request was {request.status === 'CANCELLED' ? 'cancelled' : 'closed — we could not reach you'}
          </p>
          <a href={telLink(contact.primaryPhone)} className="mt-4 inline-block rounded-xl bg-cta-green px-6 py-3 font-bold text-white">
            📞 Call to rebook
          </a>
        </div>
      ) : (
        <>
          {/* Progress */}
          <section className="mt-5 rounded-2xl border border-navy-100 p-5">
            <ol className="space-y-0">
              {STAGES.map((stage, i) => {
                const done = activeIdx > i;
                const current = activeIdx === i;
                return (
                  <li key={stage.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${
                        done ? 'bg-cta-green text-white'
                        : current ? 'bg-aqua-500 text-white ring-4 ring-aqua-100'
                        : 'bg-slate-200 text-slate-500'
                      }`}>
                        {done ? '✓' : i + 1}
                      </span>
                      {i < STAGES.length - 1 && (
                        <span className={`w-0.5 flex-1 ${done ? 'bg-cta-green' : 'bg-slate-200'}`} style={{ minHeight: 36 }} />
                      )}
                    </div>
                    <div className={`pb-6 ${current ? '' : 'opacity-70'}`}>
                      <p className={`font-bold ${current ? 'text-aqua-700' : 'text-navy-700'}`}>
                        {stage.label}
                        {current && <span className="ml-2 text-xs font-normal text-aqua-600">● live</span>}
                      </p>
                      <p className="text-sm text-muted">{stage.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {onHold && (
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                ⏸️ On hold — we are arranging a spare part. We&apos;ll call you as soon as it arrives.
              </p>
            )}
          </section>

          {/* Technician card */}
          {request.assignedTechnician && (
            <section className="mt-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Your technician</p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-bold text-emerald-900">
                    {request.assignedTechnician.fullName}
                  </p>
                  <p className="text-sm text-emerald-800">
                    {Number(request.assignedTechnician.ratingAvg).toFixed(1)} ★ ·{' '}
                    {request.assignedTechnician.jobsCompleted} jobs completed
                  </p>
                </div>
                <a
                  href={telLink(request.assignedTechnician.phone)}
                  className="shrink-0 rounded-xl bg-cta-green px-5 py-3 font-bold text-white hover:bg-cta-greenDark"
                >
                  📞 Call
                </a>
              </div>
            </section>
          )}

          {/* Charges */}
          <section className="mt-4 rounded-2xl border border-navy-100 p-5">
            <h2 className="font-display font-bold text-navy-700">Charges</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Visit charge</dt>
                <dd className="font-semibold text-navy-700">{formatINR(Number(request.visitCharge))}</dd>
              </div>
              {Number(request.partsCharge) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Parts</dt>
                  <dd className="font-semibold text-navy-700">{formatINR(Number(request.partsCharge))}</dd>
                </div>
              )}
              {Number(request.labourCharge) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Labour</dt>
                  <dd className="font-semibold text-navy-700">{formatINR(Number(request.labourCharge))}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-navy-100 pt-2">
                <dt className="font-bold text-navy-700">Total</dt>
                <dd className="font-display text-lg font-extrabold text-navy-700">
                  {formatINR(Number(request.totalCharge) || Number(request.visitCharge))}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted">
              Nothing is charged until the technician finishes and you approve.
            </p>
          </section>

          {request.resolutionNote && (
            <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">What we fixed</p>
              <p className="mt-1.5 text-sm text-emerald-900">{request.resolutionNote}</p>
              <p className="mt-2 text-xs text-emerald-700">
                🛡️ {request.warrantyDays}-day warranty on this repair
              </p>
            </section>
          )}

          {/* History */}
          {request.statusHistory.length > 0 && (
            <section className="mt-4 rounded-2xl border border-navy-100 p-5">
              <h2 className="font-display font-bold text-navy-700">Activity</h2>
              <ul className="mt-3 space-y-2">
                {request.statusHistory.map((h) => (
                  <li key={h.id} className="flex justify-between gap-3 text-sm">
                    <span className="text-navy-600">
                      {h.toStatus.replace(/_/g, ' ')}
                      {h.note && <span className="text-muted"> — {h.note}</span>}
                    </span>
                    <span className="shrink-0 text-xs text-muted">{formatDateIN(h.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <a href={telLink(contact.primaryPhone)} className="rounded-xl bg-cta-green px-6 py-3 font-bold text-white hover:bg-cta-greenDark">
          📞 {contact.primaryPhone}
        </a>
        <a
          href={waLink(contact.whatsapp, `Hi, about my service request ${request.ticketNumber}`)}
          target="_blank" rel="noopener noreferrer"
          className="rounded-xl bg-emerald-50 px-6 py-3 font-bold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
        >
          💬 WhatsApp
        </a>
      </div>
    </main>
  );
}
