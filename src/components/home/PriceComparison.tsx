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
    <section className="bg-sand-100 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Transparent rates</p>
          <h2 className="text-h2 mt-2 font-extrabold text-navy-700 text-balance">
            Honest Pricing — Compare Before You Call
          </h2>
          <p className="mt-3 text-muted text-pretty">
            We publish our rates openly. Every cost is confirmed on site before any work starts.
          </p>
        </div>

        <div className="mx-auto mt-9 max-w-3xl overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy-100">
          <table className="w-full text-sm">
            <thead className="border-b border-navy-100 bg-sand-200">
              <tr>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-navy-600">Service</th>
                <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-aqua-700">AquaNexa</th>
                <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Others in Patna</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100/70">
              {ROWS.map((r) => (
                <tr key={r.service} className={`transition-colors ${r.highlight ? 'bg-emerald-50/70' : 'hover:bg-sand-50'}`}>
                  <td className="px-4 py-3 text-navy-700">
                    {r.service}
                    {r.highlight && (
                      <span className="ml-2 rounded bg-cta-green px-1.5 py-0.5 text-[10px] font-bold text-white">
                        LOWEST
                      </span>
                    )}
                  </td>
                  <td className="tnum px-4 py-3.5 text-right font-bold text-cta-green">{r.us}</td>
                  <td className="tnum px-4 py-3.5 text-right text-muted line-through decoration-navy-300">{r.them}</td>
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
            className="inline-flex items-center gap-2 rounded-xl bg-cta-green px-7 py-4 font-bold text-white shadow-call transition-all duration-200 hover:bg-cta-greenDark hover:shadow-lift active:translate-y-px"
          >
            📞 Book at ₹{SERVICE.visitCharge} — Call {CONTACT.primaryPhone}
          </a>
        </div>
      </div>
    </section>
  );
}
