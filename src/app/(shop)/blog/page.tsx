/**
 * BLOG INDEX — /blog
 *
 * This route returned 404 until now, which was a real gap: the competitor
 * ranking above us for "ro repair patna" ships Article and Person schema
 * from their content section, and we shipped neither.
 *
 * The posts here are deliberately not generic "5 tips" filler. Each one is
 * built on Patna-specific service data — measured TDS by locality, the actual
 * failure pattern we see in each area, real 2026 prices. That is the only
 * thing on this topic that a national site cannot copy.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, AUTHOR } from '@/lib/seo/blog-data';
import { breadcrumbSchema, jsonLd } from '@/lib/seo/schema';
import { BRAND, CONTACT } from '@/lib/constants';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'RO Guide & Tips — Patna Water Purifier Blog',
  description:
    'RO membrane kab badle, Patna ka TDS kitna hai, service ka sahi rate — 8 saal ke Patna service experience se likhe gaye asli guides.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'RO Guide & Tips — Aqua Perl Patna',
    description: 'Patna ke asli service data se likhe gaye RO guides.',
    url: '/blog',
    type: 'website',
  },
};

const CAT_STYLE: Record<string, string> = {
  Guide: 'bg-aqua-100 text-aqua-800',
  Troubleshooting: 'bg-orange-100 text-orange-800',
  Pricing: 'bg-emerald-100 text-emerald-800',
  'Water Quality': 'bg-navy-100 text-navy-700',
};

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <>
      <script {...jsonLd([
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          '@id': `${BRAND.url}/blog/#blog`,
          name: 'Aqua Perl RO Guide',
          description: 'RO water purifier guides written from real Patna service data.',
          url: `${BRAND.url}/blog`,
          publisher: { '@type': 'Organization', name: BRAND.legalName, url: BRAND.url },
          blogPost: posts.map((p) => ({
            '@type': 'BlogPosting',
            headline: p.title,
            url: `${BRAND.url}/blog/${p.slug}`,
            datePublished: p.published,
            dateModified: p.updated,
            author: { '@type': 'Person', name: AUTHOR.name },
          })),
        },
      ])} />

      <main className="bg-white pb-16">
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex gap-2 px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">Blog</li>
          </ol>
        </nav>

        <div className="container mx-auto px-4 pt-8">
          <h1 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
            RO Guide — Patna ke asli data se
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-navy-600">
            Ye guides internet se copy nahi kiye gaye. Har number hamare Patna
            service record se aaya hai — 55 area ka measured TDS, har locality
            ka asli failure pattern, aur 2026 ka asli rate.
          </p>

          {/* Author credibility — the E-E-A-T signal, visible not just in schema */}
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-sand-200 p-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-aqua-500 text-lg font-bold text-white">
              SC
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-navy-700">{AUTHOR.name}</p>
              <p className="text-xs text-muted">{AUTHOR.role}</p>
            </div>
            <Link
              href={`/about/${AUTHOR.slug}`}
              className="ml-auto rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-navy-700 ring-1 ring-navy-100 hover:bg-navy-50"
            >
              Profile dekho →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {posts.map((p) => (
              <article
                key={p.slug}
                className="lift flex flex-col rounded-2xl border border-navy-100 bg-white p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${CAT_STYLE[p.category] ?? 'bg-slate-100 text-slate-700'}`}>
                    {p.category}
                  </span>
                  <span className="text-xs text-muted">{p.readMinutes} min padho</span>
                </div>

                <h2 className="mt-3 font-display text-lg font-bold leading-snug text-navy-700">
                  <Link href={`/blog/${p.slug}`} className="hover:text-aqua-600">
                    {p.title}
                  </Link>
                </h2>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">
                  {p.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-navy-50 pt-3">
                  <time dateTime={p.updated} className="text-xs text-muted">
                    {new Date(p.updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </time>
                  <Link href={`/blog/${p.slug}`} className="text-sm font-bold text-aqua-600 hover:underline">
                    Padho →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-navy-700 p-6 text-center text-white">
            <p className="font-display text-lg font-bold">Padh ke bhi samajh na aaye?</p>
            <p className="mt-1 text-sm text-navy-100">
              Phone par bata dijiye kya problem hai — hum free me guide kar denge.
            </p>
            <a
              href={CONTACT.primaryTel}
              className="mt-4 inline-block rounded-xl bg-cta-green px-6 py-3 font-bold text-white hover:bg-cta-greenDark"
            >
              📞 {CONTACT.primaryPhone}
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
