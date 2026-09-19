import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db/prisma';
import { BRAND } from '@/lib/constants';
import { SERVICE_AREAS, SERVICED_BRANDS } from '@/lib/seo/patna-service-data';
import { getPosts, AUTHOR } from '@/lib/seo/blog-data';
import { areaPath } from '@/lib/seo/area-url';
import { SERVICE_INTENTS } from '@/lib/seo/service-intent-data';
import { SYMPTOMS } from '@/lib/seo/symptom-data';
import {
  contentDate,
  INTENT_PAGES_DATE,
  SYMPTOM_PAGES_DATE,
  AREA_PAGES_DATE,
  BRAND_PAGES_DATE,
  AUTHOR_PAGE_DATE,
} from '@/lib/seo/content-dates';

export const revalidate = 3600;

/**
 * ── 19 Sep 2026: lastmod ab SACH bolta hai ────────────────────────────────
 * Pehle har URL pe `lastModified: new Date()` tha. `revalidate = 3600` ke
 * saath iska matlab: har ghante 133 URLs ka lastmod badal jata tha, chahe
 * content mahino se same ho. Google aisa lastmod PURI SITE ke liye ignore
 * kar deta hai ("consistently and verifiably accurate" hona chahiye) —
 * yaani jab hum sach me kuch update karte the, wo signal Google tak
 * pahunchta hi nahi tha.
 *
 * Ab har page apni asli content-change date bhejta hai (src/lib/seo/
 * content-dates.ts). Jiski date pata nahi, wo lastmod bhejta hi nahi —
 * field chhod dena jhooth bolne se behtar hai.
 *
 * `priority` aur `changeFrequency` Google officially IGNORE karta hai, par
 * ye valid fields hain aur Bing/Yandex padh sakte hain — isliye chhode gaye
 * hain. Inko hatana alag decision hai, is fix ka hissa nahi.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BRAND.url}/`, lastModified: contentDate('/'), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BRAND.url}/service-patna`, lastModified: contentDate('/service-patna'), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BRAND.url}/service-patna/brand`, lastModified: contentDate('/service-patna/brand'), changeFrequency: 'weekly', priority: 0.85 },
    /* Service-intent hub — the third axis alongside place and brand. */
    { url: `${BRAND.url}/ro-services-patna`, lastModified: contentDate('/ro-services-patna'), changeFrequency: 'weekly', priority: 0.9 },
    /* Answer hub — QAPage + speakable spans for retrieval engines. The live
       robots.txt allows OAI-SearchBot, PerplexityBot and Bingbot, so this is
       the page they can actually quote from. */
    { url: `${BRAND.url}/ro-service-patna-faq`, lastModified: contentDate('/ro-service-patna-faq'), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BRAND.url}/products`, lastModified: contentDate('/products'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BRAND.url}/amc-plans`, lastModified: contentDate('/amc-plans'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BRAND.url}/contact`, lastModified: contentDate('/contact'), changeFrequency: 'yearly', priority: 0.5 },
    /* Symptom-query hub. Measured 16 Sep 2026: the Hinglish problem queries
       ("ro me pani nahi aa raha hai") have ZERO websites in the top 5 — only
       YouTube and Facebook. High priority because it is the only part of the
       site with no web competition at all. */
    { url: `${BRAND.url}/ro-problem-checker`, lastModified: contentDate('/ro-problem-checker'), changeFrequency: 'weekly', priority: 0.9 },
  ];

  /* One page per symptom. National reach — these queries carry no city. */
  const symptomPages: MetadataRoute.Sitemap = SYMPTOMS.map((s) => ({
    url: `${BRAND.url}/ro-problem/${s.slug}`,
    lastModified: SYMPTOM_PAGES_DATE,
    changeFrequency: 'weekly' as const,
    priority: 0.88,
  }));

  // Local SEO pages — high priority, they drive the service business
  const areaPages: MetadataRoute.Sitemap = SERVICE_AREAS.map((a) => ({
    url: `${BRAND.url}${areaPath(a.slug)}`,
    lastModified: AREA_PAGES_DATE,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  /* Blog + author. These carry the Article and Person schema that the
     top-ranking competitor had and we did not, so they need to be crawled.
     Blog posts already carry a real `updated` date in blog-data.ts — that is
     exactly the kind of honest lastmod Google will actually use. */
  const blogPages: MetadataRoute.Sitemap = [
    { url: `${BRAND.url}/blog`, lastModified: contentDate('/blog'), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BRAND.url}/about/${AUTHOR.slug}`, lastModified: AUTHOR_PAGE_DATE, changeFrequency: 'monthly', priority: 0.6 },
    ...getPosts().map((p) => ({
      url: `${BRAND.url}/blog/${p.slug}`,
      lastModified: new Date(p.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];

  /* Service-intent pages — the JOB axis. High priority because they target
     transactional queries ("ro installation charges in patna") that convert
     harder than informational ones. */
  const intentPages: MetadataRoute.Sitemap = SERVICE_INTENTS.map((s) => ({
    url: `${BRAND.url}${s.path}`,
    lastModified: INTENT_PAGES_DATE,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const brandPages: MetadataRoute.Sitemap = SERVICED_BRANDS.map((b) => ({
    url: `${BRAND.url}/service-patna/brand/${b.slug}`,
    lastModified: BRAND_PAGES_DATE,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Catalog — wrapped so a DB outage never breaks the sitemap.
  // These already used real per-row updatedAt, which is correct — kept as is.
  let productPages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { deletedAt: null, status: 'ACTIVE' },
        select: { slug: true, updatedAt: true },
        take: 5000,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    productPages = products.map((p) => ({
      url: `${BRAND.url}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    categoryPages = categories.map((c) => ({
      url: `${BRAND.url}/category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }));
  } catch (err) {
    console.error('[sitemap] catalog fetch failed', err);
  }

  return [
    ...staticPages, ...symptomPages, ...intentPages, ...areaPages, ...brandPages,
    ...blogPages, ...categoryPages, ...productPages,
  ];
}
