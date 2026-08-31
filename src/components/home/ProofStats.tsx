/**
 * ProofStats — the "we are established" band, placed directly under the hero.
 *
 * This is the answer to "44 reviews looks small". Instead of inflating the
 * count (a structured-data violation that risks a site-wide manual action), we
 * surround it with the numbers that ARE large and ARE verifiable: repairs
 * completed, areas covered, brands serviced, years in Patna.
 *
 * Read left to right, the row says: highly rated, done this thousands of
 * times, covers your area, knows your brand, been here for years, cheap to
 * call out. The review count never has to carry that weight alone.
 *
 * Server component — the only client bit is the CountUp number itself.
 */
import CountUp from '@/components/ui/CountUp';
import { getProofStats } from '@/lib/social-proof';

export default function ProofStats() {
  const stats = getProofStats();

  return (
    <section
      aria-label="Our track record"
      className="border-y border-navy-100 bg-gradient-to-b from-sand-100 to-white py-7 md:py-9"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 md:grid-cols-6 md:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center" title={s.detail}>
              <p className="mb-1 text-xl md:text-2xl" aria-hidden="true">
                {s.icon}
              </p>
              <p className="font-display text-xl font-extrabold leading-none text-navy-700 md:text-3xl">
                {s.label === 'Google rating' ? (
                  <CountUp to={s.countTo} decimals={1} suffix={s.suffix} />
                ) : s.label === 'Visit charge' ? (
                  <>₹<CountUp to={s.countTo} /></>
                ) : (
                  <CountUp to={s.countTo} suffix={s.suffix} />
                )}
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted md:text-xs">
                {s.label}
              </p>
              {/* Full sentence for screen readers and crawlers */}
              <span className="sr-only">{s.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
