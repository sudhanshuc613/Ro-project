/**
 * CategorySeoContent — the buying guide, price table and FAQs that render
 * BELOW the product grid on category and listing pages.
 *
 * Why below: shoppers who already know what they want must not be pushed past
 * a wall of text to reach the grid. Search engines read the whole document,
 * so position costs nothing in SEO terms while protecting the buying flow.
 *
 * Measured problem this solves (live site, 18 Aug 2026): /products carried no
 * structured data at all and ~1,180 words of mostly UI chrome; category pages
 * carried only a BreadcrumbList and ~985 words. There was nothing on the page
 * for a national query like "80 gpd ro membrane price" to match against.
 */
import type { CategorySeoBlock } from '@/lib/seo/catalog-seo';

export default function CategorySeoContent({ seo }: { seo: CategorySeoBlock }) {
  return (
    <section className="mt-14 border-t border-slate-100 pt-10">
      {/* ── Buying guide ── */}
      <h2 className="font-display text-xl font-bold text-navy-700 sm:text-2xl">
        {seo.heading} — Buying Guide
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {seo.guide.map((g) => (
          <div key={g.title} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <h3 className="text-sm font-bold text-navy-700">{g.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{g.body}</p>
          </div>
        ))}
      </div>

      {/* ── Price table: "X price in India" is the highest-volume query shape ── */}
      {seo.priceTable && seo.priceTable.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-navy-700 sm:text-2xl">
            Price Range in India (2026)
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            Indicative market rates so you can judge a quote before you accept it.
            Our listed prices are shown on each product above.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-3 py-2.5 font-bold text-navy-700">Item</th>
                  <th className="px-3 py-2.5 font-bold text-navy-700">Typical price</th>
                  <th className="px-3 py-2.5 font-bold text-navy-700">Note</th>
                </tr>
              </thead>
              <tbody>
                {seo.priceTable.map((row) => (
                  <tr key={row.item} className="border-b border-slate-100">
                    <td className="px-3 py-2.5 font-semibold text-navy-700">{row.item}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-aqua-700">{row.range}</td>
                    <td className="px-3 py-2.5 text-muted">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── FAQs — also emitted as FAQPage schema by the parent page ── */}
      {seo.faqs.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-navy-700 sm:text-2xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 space-y-2.5">
            {seo.faqs.map((f) => (
              <details key={f.q} className="group rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <summary className="cursor-pointer list-none text-sm font-bold text-navy-700 marker:hidden">
                  <span className="mr-2 text-aqua-600 group-open:hidden">+</span>
                  <span className="mr-2 hidden text-aqua-600 group-open:inline">−</span>
                  {f.q}
                </summary>
                <p className="mt-2.5 pl-5 text-sm leading-relaxed text-navy-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* ── Local advantage, clearly fenced off from the national copy ── */}
      <div className="mt-10 rounded-2xl bg-aqua-50 p-5 ring-1 ring-aqua-100">
        <h2 className="font-display text-lg font-bold text-navy-700">
          Buying from Patna? Two things you get that a marketplace cannot give you
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-navy-700">Fitting on the same day</p>
            <p className="mt-1 text-sm text-navy-600">
              Order the part and we fit it during a ₹200 visit — no waiting on a courier,
              and no guessing whether you ordered the right thing.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-navy-700">Someone to call afterwards</p>
            <p className="mt-1 text-sm text-navy-600">
              If it does not solve the problem, we come back. 30-day warranty on
              workmanship. Call 8969821440.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
