import Link from 'next/link';
import { SERVICE_AREAS, ADDITIONAL_AREAS } from '@/lib/seo/patna-service-data';

/**
 * Area coverage grid.
 *
 * Two jobs:
 *  1. Reassure the visitor we actually cover their locality (conversion)
 *  2. Feed internal links to every /service-patna/[area] page (SEO)
 *
 * The extra area names below the grid are plain text, not links — they widen
 * keyword coverage without creating thin pages Google would penalise.
 */
export default function AreaCoverage() {
  return (
    <section className="py-14 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
            16 Service Zones Across Patna
          </h2>
          <p className="mt-2 text-muted">
            Tap your area for its actual TDS level, common problems and response time.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_AREAS.map((a) => (
            <Link
              key={a.slug}
              href={`/service-patna/${a.slug}`}
              className="group rounded-2xl border border-navy-100 p-5 transition hover:-translate-y-1 hover:border-aqua-400 hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-navy-700 group-hover:text-aqua-600">
                    {a.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted">{a.pincodes.join(', ')}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                  {a.responseMin} min
                </span>
              </div>
              <p className="mt-3 text-sm text-navy-600">
                <span className="font-semibold">TDS {a.tdsRange}</span> · {a.monthlyJobs}+ jobs/month
              </p>
              <p className="mt-1 text-xs text-muted">Common issue: {a.commonRepair}</p>
              <p className="mt-3 text-xs font-bold text-aqua-600">View area details →</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-navy-50 p-5">
          <p className="text-sm font-bold text-navy-700">Also serving across Patna:</p>
          <p className="mt-2 text-sm leading-relaxed text-navy-600">
            {ADDITIONAL_AREAS.join(' · ')}
          </p>
          <p className="mt-3 text-xs text-muted">
            Your area not listed? Call us — if you&apos;re within 25 km of Patna, we reach you.
          </p>
        </div>
      </div>
    </section>
  );
}
