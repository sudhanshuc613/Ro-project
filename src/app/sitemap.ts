import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db/prisma';
import { BRAND } from '@/lib/constants';
import { SERVICE_AREAS, SERVICED_BRANDS } from '@/lib/seo/patna-service-data';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BRAND.url}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BRAND.url}/service-patna`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BRAND.url}/service-patna/brand`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BRAND.url}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BRAND.url}/amc-plans`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BRAND.url}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];

  // Local SEO pages — high priority, they drive the service business
  const areaPages: MetadataRoute.Sitemap = SERVICE_AREAS.map((a) => ({
    url: `${BRAND.url}/service-patna/${a.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const brandPages: MetadataRoute.Sitemap = SERVICED_BRANDS.map((b) => ({
    url: `${BRAND.url}/service-patna/brand/${b.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Catalog — wrapped so a DB outage never breaks the sitemap
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

  return [...staticPages, ...areaPages, ...brandPages, ...categoryPages, ...productPages];
}
