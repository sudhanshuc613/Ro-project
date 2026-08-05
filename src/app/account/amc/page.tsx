import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { formatINR, formatDateIN } from '@/lib/utils/format';
import { getContactSettings, waLink } from '@/lib/settings';
import { SectionHeader, EmptyState, Badge } from '@/components/account/ui';

export const metadata: Metadata = {
  title: 'My AMC Plans',
  robots: { index: false, follow: false },
};

export default async function AmcPage() {
  const session = await getServerSession(authOptions);
  const [plans, contact] = await Promise.all([
    prisma.amcSubscription.findMany({
      where: { userId: session!.user.id },
      orderBy: [{ isActive: 'desc' }, { endsOn: 'desc' }],
      include: { address: { select: { line1: true, city: true, pincode: true } } },
    }),
    getContactSettings(),
  ]);

  if (plans.length === 0) {
    return (
      <div>
        <SectionHeader title="AMC Plans" />
        <EmptyState
          icon="🛡️"
          title="No maintenance plan yet"
          body="An AMC covers scheduled visits and filter changes across the year — cheaper than paying per repair, and we come to you before something breaks."
          ctaLabel="See AMC plans"
          ctaHref="/amc-plans"
        />
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="AMC Plans"
        subtitle="Your annual maintenance cover"
        action={
          <Link href="/amc-plans" className="text-sm font-bold text-aqua-600 hover:underline">
            Compare plans →
          </Link>
        }
      />

      <ul className="space-y-4">
        {plans.map((p) => {
          const daysLeft = Math.ceil((new Date(p.endsOn).getTime() - Date.now()) / 864e5);
          const expired = daysLeft <= 0 || !p.isActive;
          const expiringSoon = !expired && daysLeft <= 45;
          const visitsLeft = Math.max(0, p.visitsIncluded - p.visitsUsed);
          const usedPct = Math.round((p.visitsUsed / Math.max(1, p.visitsIncluded)) * 100);

          return (
            <li
              key={p.id}
              className={`card overflow-hidden ${expiringSoon ? 'ring-2 ring-amber-300' : ''}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-navy-100 bg-sand-50 p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-navy-700">{p.planName}</h3>
                    {expired ? (
                      <Badge tone="slate">Expired</Badge>
                    ) : expiringSoon ? (
                      <Badge tone="amber">Expires in {daysLeft} days</Badge>
                    ) : (
                      <Badge tone="green">Active</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {formatDateIN(p.startsOn)} → {formatDateIN(p.endsOn)}
                    {p.machineBrand && ` · ${p.machineBrand}${p.machineModel ? ` ${p.machineModel}` : ''}`}
                  </p>
                  {p.address && (
                    <p className="text-xs text-muted">
                      📍 {p.address.line1}, {p.address.city} – {p.address.pincode}
                    </p>
                  )}
                </div>
                <p className="tnum font-display text-xl font-extrabold text-navy-700">
                  {formatINR(Number(p.price))}
                </p>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-navy-700">Visits used</span>
                  <span className="tnum text-muted">
                    {p.visitsUsed} of {p.visitsIncluded} · <strong className="text-navy-700">{visitsLeft} left</strong>
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-100">
                  <div
                    className={`h-full rounded-full transition-all ${visitsLeft === 0 ? 'bg-red-500' : 'bg-aqua-500'}`}
                    style={{ width: `${usedPct}%` }}
                  />
                </div>

                {p.nextServiceDue && !expired && (
                  <p className="mt-3 rounded-lg bg-aqua-50 px-3.5 py-2.5 text-sm text-aqua-900">
                    📅 Next scheduled visit: <strong>{formatDateIN(p.nextServiceDue)}</strong>
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {(expired || expiringSoon) && (
                    <a
                      href={waLink(contact.whatsapp, `I want to renew my ${p.planName} AMC plan.`)}
                      target="_blank" rel="noopener noreferrer"
                      className="rounded-xl bg-cta-orange px-5 py-2.5 text-sm font-bold text-white shadow-cta transition hover:bg-cta-orangeDark"
                    >
                      Renew plan
                    </a>
                  )}
                  {!expired && visitsLeft > 0 && (
                    <Link
                      href="/#book-service"
                      className="rounded-xl bg-cta-green px-5 py-2.5 text-sm font-bold text-white shadow-call transition hover:bg-cta-greenDark"
                    >
                      Book a covered visit
                    </Link>
                  )}
                  <a
                    href={waLink(contact.whatsapp, `Question about my ${p.planName} AMC plan.`)}
                    target="_blank" rel="noopener noreferrer"
                    className="rounded-xl bg-navy-50 px-5 py-2.5 text-sm font-bold text-navy-700 transition hover:bg-navy-100"
                  >
                    💬 Ask about this plan
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
