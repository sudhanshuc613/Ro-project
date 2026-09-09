/**
 * AUTHOR PAGE — /about/[person]
 *
 * The destination for every Article's author link, and the home of the
 * standalone Person schema.
 *
 * This exists because E-E-A-T is not satisfied by a byline. Google's guidance
 * and its quality-rater guidelines both look for a real, identifiable person
 * with stated, checkable experience — especially on YMYL topics, and drinking
 * water is YMYL. A named author page with credentials, a service history and
 * a working phone number is the difference between claiming expertise and
 * demonstrating it.
 *
 * Every credential listed is verifiable: the review count matches the public
 * GBP, the area count matches the site's own service pages.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AUTHOR, getPosts } from '@/lib/seo/blog-data';
import { personSchema, breadcrumbSchema, jsonLd } from '@/lib/seo/schema';
import { SERVICE_AREAS, SERVICED_BRANDS } from '@/lib/seo/patna-service-data';
import { CONTACT, SERVICE, GBP } from '@/lib/constants';
import { REPAIRS_COMPLETED, FOUNDED_YEAR } from '@/lib/social-proof';

export const revalidate = 86400;

export function generateStaticParams() {
  return [{ person: AUTHOR.slug }];
}

export function generateMetadata({ params }: { params: { person: string } }): Metadata {
  if (params.person !== AUTHOR.slug) return { title: 'Not Found' };
  return {
    title: `${AUTHOR.name} — RO Technician, Patna`,
    description: `${AUTHOR.name}, ${AUTHOR.role}. ${AUTHOR.yearsExperience}+ saal, ${REPAIRS_COMPLETED.toLocaleString('en-IN')}+ RO units, ${SERVICE_AREAS.length} Patna areas. Call ${CONTACT.primaryPhone}.`,
    alternates: { canonical: `/about/${AUTHOR.slug}` },
  };
}

export default function AuthorPage({ params }: { params: { person: string } }) {
  if (params.person !== AUTHOR.slug) notFound();
  const posts = getPosts();

  return (
    <>
      <script {...jsonLd([
        personSchema(AUTHOR),
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: AUTHOR.name, url: `/about/${AUTHOR.slug}` },
        ]),
      ])} />

      <main className="bg-white pb-16">
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex gap-2 px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">{AUTHOR.name}</li>
          </ol>
        </nav>

        <div className="container mx-auto max-w-3xl px-4 pt-8">
          <div className="flex flex-wrap items-start gap-5">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-aqua-500 font-display text-2xl font-extrabold text-white">
              SC
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
                {AUTHOR.name}
              </h1>
              <p className="mt-1 text-sm font-semibold text-aqua-700">{AUTHOR.role}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={CONTACT.primaryTel}
                  className="rounded-lg bg-cta-green px-4 py-2 text-sm font-bold text-white hover:bg-cta-greenDark">
                  📞 {CONTACT.primaryPhone}
                </a>
                <a href={`https://wa.me/91${CONTACT.primaryPhone}`} target="_blank" rel="noopener noreferrer"
                  className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-bold text-white">
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>

          <p className="mt-6 leading-relaxed text-navy-600">{AUTHOR.bio}</p>

          {/* Verifiable numbers */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { v: `${AUTHOR.yearsExperience}+`, l: 'Saal ka experience' },
              { v: `${REPAIRS_COMPLETED.toLocaleString('en-IN')}+`, l: 'Units theek kiye' },
              { v: String(SERVICE_AREAS.length), l: 'Patna areas' },
              { v: `${GBP.ratingValue}★`, l: `${GBP.reviewCount} reviews` },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-sand-200 p-4 text-center">
                <p className="font-display text-2xl font-extrabold text-navy-700">{s.v}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{s.l}</p>
              </div>
            ))}
          </div>

          <section className="mt-8">
            <h2 className="font-display text-xl font-bold text-navy-700">Experience</h2>
            <ul className="mt-3 space-y-2">
              {AUTHOR.credentials.map((c) => (
                <li key={c} className="flex gap-2.5 rounded-lg bg-sand-100 p-3 text-sm text-navy-700">
                  <span className="shrink-0 text-emerald-600" aria-hidden="true">✓</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-xl font-bold text-navy-700">Kaam ka daayra</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              Patna ke {SERVICE_AREAS.length} localities me service — Exhibition Road aur
              Dak Bungalow ke commercial units se lekar Beur ke {`>`}1000 ppm borewell tak.
              {' '}{SERVICED_BRANDS.length} brands par kaam: Kent, Aquaguard, Pureit, Livpure,
              AO Smith, Blue Star aur baaki. Domestic RO se lekar 1000 LPH commercial plant tak.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-navy-600">
              {FOUNDED_YEAR} se ab tak visit charge ₹{SERVICE.visitCharge} hi rakha hai, jabki
              Patna ka market rate ₹300-400 hai. Har visit par TDS reading dikhayi jaati hai —
              pehle aur baad me — taaki customer ko khud dikhe ki kya badla.
            </p>
          </section>

          {posts.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-xl font-bold text-navy-700">Likhe gaye guides</h2>
              <div className="mt-3 space-y-2">
                {posts.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`}
                    className="block rounded-xl bg-sand-100 p-4 transition hover:bg-sand-200">
                    <p className="text-sm font-bold text-navy-700">{p.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">{p.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
