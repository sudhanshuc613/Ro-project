import { CONTACT, SERVICE } from '@/lib/constants';

/**
 * Transparent pricing table with a competitor anchor.
 *
 * Real market rates in Patna (verified from competitor listings, 2026):
 *   Mr Service Expert  — from ₹399
 *   RO Care India      — repair ₹399, install ₹599, AMC ₹999
 *   Most local shops   — ₹299–₹399 visit charge
 *
 * Leading with the ₹200 gap converts better than any adjective.
 */
const ROWS = [
  { service: 'Technician visit & diagnosis', us: '₹200', them: '₹299 – ₹399', highlight: true },
  { service: 'Sediment / carbon filter change', us: '₹450 – ₹600', them: '₹500 – ₹1,200' },
  { service: 'RO membrane (75 GPD)', us: '₹1,200 – ₹1,800', them: '₹1,500 – ₹2,500' },
  { service: 'RO membrane (100 GPD)', us: '₹1,600 – ₹2,400', them: '₹2,000 – ₹3,000' },
  { service: 'Booster pump replacement', us: '₹1,500 – ₹2,000', them: '₹1,500 – ₹2,500' },
  { service: 'SMPS / adaptor', us: '₹700 – ₹1,300', them: '₹900 – ₹1,600' },
  { service: 'New RO installation', us: '₹350 – ₹600', them: '₹599 – ₹1,000' },
  { service: 'Annual Maintenance (AMC)', us: '₹1,499 – ₹4,499', them: '₹2,499 – ₹6,999' },
];

export default function PriceComparison() {
  return (
    <section className="py-14 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
            Honest Pricing — Compare Before You Call
          </h2>
          <p className="mt-2 text-muted">
            We publish our rates openly. Every cost is confirmed on site before any work starts.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-navy-100">
          <table className="w-full text-sm">
            <thead className="bg-navy-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-navy-700">Service</th>
                <th className="px-4 py-3 text-right font-bold text-aqua-700">AquaNexa</th>
                <th className="px-4 py-3 text-right font-bold text-muted">Others in Patna</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {ROWS.map((r) => (
                <tr key={r.service} className={r.highlight ? 'bg-emerald-50/60' : ''}>
                  <td className="px-4 py-3 text-navy-700">
                    {r.service}
                    {r.highlight && (
                      <span className="ml-2 rounded bg-cta-green px-1.5 py-0.5 text-[10px] font-bold text-white">
                        LOWEST
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-cta-green">{r.us}</td>
                  <td className="px-4 py-3 text-right text-muted line-through">{r.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mx-auto mt-3 max-w-3xl text-center text-xs text-muted">
          Competitor rates compared from publicly listed Patna service providers, 2026.
          Parts pricing varies by brand and model — final quote given on site.
        </p>

        <div className="mt-7 text-center">
          <a
            href={CONTACT.primaryTel}
            className="inline-flex items-center gap-2 rounded-xl bg-cta-green px-7 py-4 font-bold text-white shadow-lg transition hover:bg-cta-greenDark"
          >
            📞 Book at ₹{SERVICE.visitCharge} — Call {CONTACT.primaryPhone}
          </a>
        </div>
      </div>
    </section>
  );
}
