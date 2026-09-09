/**
 * BLOG POST — /blog/[slug]
 *
 * Ships Article + Person + FAQPage + BreadcrumbList, and HowTo where the post
 * has procedural steps. That combination is what the #1-ranking competitor
 * carries and we did not.
 *
 * The visible author block matters as much as the schema: Google's raters, and
 * the classifiers trained on their judgements, look for a named human with
 * stated experience on YMYL topics. Drinking water is YMYL.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost, getPosts, AUTHOR } from '@/lib/seo/blog-data';
import {
  articleSchema, howToSchema, faqSchema, breadcrumbSchema, jsonLd,
} from '@/lib/seo/schema';
import FaqAccordion from '@/components/home/FaqAccordion';
import TrustBadges from '@/components/ui/TrustBadges';
import { CONTACT, SERVICE } from '@/lib/constants';

export const revalidate = 86400;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.published,
      modifiedTime: post.updated,
      authors: [AUTHOR.name],
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const others = getPosts().filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <script {...jsonLd([
        articleSchema({
          title: post.title,
          description: post.description,
          slug: post.slug,
          published: post.published,
          updated: post.updated,
          author: AUTHOR,
          keywords: post.keywords,
        }),
        ...(post.howTo
          ? [howToSchema({
              name: post.howTo.name,
              description: post.description,
              totalTime: post.howTo.totalTime,
              steps: post.howTo.steps,
            })]
          : []),
        faqSchema(post.faqs),
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: post.title, url: `/blog/${post.slug}` },
        ]),
      ])} />

      <main className="bg-white pb-16">
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex flex-wrap gap-2 px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li><Link href="/blog" className="text-navy-600 hover:text-aqua-600">Blog</Link></li>
            <li className="text-slate-300">/</li>
            <li className="truncate font-medium text-muted">{post.category}</li>
          </ol>
        </nav>

        <article className="container mx-auto max-w-3xl px-4 pt-8">
          <span className="rounded-full bg-aqua-100 px-3 py-1 text-[11px] font-bold text-aqua-800">
            {post.category}
          </span>

          <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight text-navy-700 md:text-3xl">
            {post.title}
          </h1>

          <p className="mt-3 text-base leading-relaxed text-navy-600">{post.description}</p>

          {/* Author + dates — the visible half of the E-E-A-T signal */}
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-sand-200 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-aqua-500 text-sm font-bold text-white">
              SC
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-navy-700">{AUTHOR.name}</p>
              <p className="text-xs text-muted">
                {AUTHOR.role} · {AUTHOR.yearsExperience}+ saal ka experience
              </p>
            </div>
            <div className="text-right text-xs text-muted">
              <p>
                Likha: <time dateTime={post.published}>
                  {new Date(post.published).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </time>
              </p>
              <p>{post.readMinutes} min padho</p>
            </div>
          </div>

          {/* HowTo steps, when the post has them */}
          {post.howTo && (
            <section className="mt-8 rounded-2xl border-2 border-aqua-200 bg-aqua-50 p-5">
              <h2 className="font-display text-lg font-bold text-navy-700">
                🔧 {post.howTo.name}
              </h2>
              <ol className="mt-4 space-y-3">
                {post.howTo.steps.map((s, i) => (
                  <li key={s.name} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-aqua-500 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-navy-700">{s.name}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-navy-600">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Body */}
          <div className="mt-8 space-y-8">
            {post.sections.map((sec) => (
              <section key={sec.heading}>
                <h2 className="font-display text-xl font-bold text-navy-700">{sec.heading}</h2>
                {sec.body.map((p, i) => (
                  <p key={i} className="mt-3 leading-relaxed text-navy-600">{p}</p>
                ))}
                {sec.list && (
                  <ul className="mt-3 space-y-2">
                    {sec.list.map((li) => (
                      <li key={li} className="flex gap-2.5 rounded-lg bg-sand-100 p-3 text-sm leading-relaxed text-navy-700">
                        <span className="shrink-0 text-aqua-500" aria-hidden="true">▸</span>
                        <span>{li}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* CTA */}
          <aside className="mt-10 rounded-2xl bg-navy-700 p-6 text-white">
            <p className="font-display text-lg font-bold">Patna me ho? Hum aa jayenge.</p>
            <p className="mt-1 text-sm text-navy-100">
              Visit charge ₹{SERVICE.visitCharge} · TDS test free · {SERVICE.warrantyDays}-din warranty ·
              Part badalne se pehle aapki permission.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={CONTACT.primaryTel}
                className="rounded-xl bg-cta-green px-6 py-3 font-bold text-white hover:bg-cta-greenDark">
                📞 {CONTACT.primaryPhone}
              </a>
              <a href={`https://wa.me/91${CONTACT.primaryPhone}`} target="_blank" rel="noopener noreferrer"
                className="rounded-xl bg-[#25D366] px-6 py-3 font-bold text-white">
                💬 WhatsApp
              </a>
            </div>
            <TrustBadges className="mt-4 text-navy-100" />
          </aside>

          <div className="mt-10">
            <FaqAccordion faqs={post.faqs} title="Is topic ke aam sawaal" />
          </div>

          {others.length > 0 && (
            <section className="mt-10 border-t border-navy-100 pt-8">
              <h2 className="font-display text-lg font-bold text-navy-700">Aur padho</h2>
              <div className="mt-4 space-y-2">
                {others.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`}
                    className="block rounded-xl bg-sand-100 p-4 transition hover:bg-sand-200">
                    <p className="text-sm font-bold text-navy-700">{p.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">{p.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
    </>
  );
}
