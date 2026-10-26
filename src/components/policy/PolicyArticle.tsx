/**
 * POLICY ARTICLE — chaaron policy page ka saanjha body.
 *
 * 🔴 Alag-alag folder kyun, ek dynamic route kyun nahi:
 *    `(shop)/[intent]` pehle se maujood hai. Ek hi level par doosra dynamic
 *    segment (`[policy]`) banane se Next.js build hi fail kar deta hai —
 *    "You cannot use different slug names for the same dynamic path".
 *    Isliye 4 chhote static route hain aur asli content yahan ek jagah.
 */
import Link from 'next/link';
import { BRAND, CONTACT, SERVICE } from '@/lib/constants';
import { POLICY_PAGES, type PolicyPage } from '@/lib/seo/policy-data';
import { breadcrumbSchema, faqSchema, jsonLd } from '@/lib/seo/schema';

export default function PolicyArticle({ policy }: { policy: PolicyPage }) {
  const others = POLICY_PAGES.filter((x) => x.slug !== policy.slug);
  return (
    <>
      <script {...jsonLd([
        breadcrumbSchema([
          { name: 'Home', url: BRAND.url },
          { name: policy.label, url: `${BRAND.url}/${policy.slug}` },
        ]),
        /* FAQ asli sawaal hain jo call par rozana aate hain — isliye schema
           bhi laga diya, Google inhe SERP me dikha sakta hai. */
        faqSchema(policy.faqs.map((f) => ({ q: f.q, a: f.a }))),
      ])} />

      <main className="bg-white">
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex gap-2 px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">{policy.label}</li>
          </ol>
        </nav>

        <div className="container mx-auto max-w-3xl px-4 py-12">
          <h1 className="font-display text-3xl font-extrabold text-navy-700">{policy.h1}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted">{policy.intro}</p>

          <div className="mt-8 space-y-9">
            {policy.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="font-display text-xl font-bold text-navy-700">{s.heading}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
                {s.points?.length ? (
                  <ul className="mt-3 space-y-2">
                    {s.points.map((pt) => (
                      <li key={pt} className="flex gap-2 text-sm leading-relaxed text-navy-700">
                        <span className="mt-[2px] text-aqua-600">&bull;</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          {/* ── Aam sawaal ── */}
          <div className="mt-10 border-t border-navy-50 pt-8">
            <h2 className="font-display text-xl font-bold text-navy-700">
              Aam sawaal
            </h2>
            <div className="mt-4 space-y-5">
              {policy.faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="text-base font-bold text-navy-700">{f.q}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-2xl bg-sand-100 p-6 ring-1 ring-navy-100">
            <h2 className="font-display text-lg font-bold text-navy-700">
              Is policy par koi sawaal?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Seedha call kar lo &mdash; {CONTACT.hours}. {SERVICE.city} me visit charge
              sirf &#8377;{SERVICE.visitCharge} hai.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={CONTACT.primaryTel}
                className="rounded-xl bg-cta-orange px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">
                Call {CONTACT.primaryPhone}
              </a>
              <Link href="/contact"
                className="rounded-xl bg-navy-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-900">
                Contact page
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-navy-50 pt-6">
            <h2 className="font-display text-lg font-bold text-navy-700">Baaki policy</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {others.map((o) => (
                <Link key={o.slug} href={`/${o.slug}`}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-navy-700 ring-1 ring-navy-100 transition hover:ring-aqua-300">
                  {o.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
