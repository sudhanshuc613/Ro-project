/**
 * Dynamic metadata resolver — reads admin-editable rows from `seo_metadata`
 * and falls back to sensible auto-generated defaults.
 *
 * Every page calls: export const generateMetadata = () => buildMetadata({...})
 */
import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { BRAND } from '@/lib/constants';

type EntityType = 'PRODUCT' | 'CATEGORY' | 'STATIC_PAGE' | 'BLOG_POST' | 'SERVICE_AREA' | 'BRAND';

interface BuildMetadataArgs {
  entityType: EntityType;
  entityId?: string;
  path: string;
  fallback: {
    title: string;
    description: string;
    keywords?: string[];
    image?: string;
    noIndex?: boolean;
  };
}

export async function buildMetadata({
  entityType, entityId, path, fallback,
}: BuildMetadataArgs): Promise<Metadata> {
  // Admin override wins; cached by Next's request memoization + ISR
  const row = await prisma.seoMetadata
    .findFirst({
      where: entityId ? { entityType, entityId } : { path },
    })
    .catch(() => null);

  const title = row?.metaTitle || fallback.title;
  const description = row?.metaDescription || fallback.description;
  const keywords = row?.metaKeywords?.split(',').map((k) => k.trim()) || fallback.keywords;
  const image = row?.ogImageUrl || fallback.image || `${BRAND.url}${BRAND.ogImage}`;
  const canonical = row?.canonicalUrl || `${BRAND.url}${path}`;
  const index = row ? row.robotsIndex : !fallback.noIndex;

  return {
    // `absolute` stops the root layout's "%s | AquaNexa" template from
    // double-appending the brand name when the title already contains it.
    title: { absolute: title },
    description,
    keywords,
    metadataBase: new URL(BRAND.url),
    alternates: { canonical },
    robots: {
      index,
      follow: row?.robotsFollow ?? true,
      googleBot: { index, follow: row?.robotsFollow ?? true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      type: entityType === 'PRODUCT' ? 'website' : 'website',
      url: canonical,
      siteName: BRAND.name,
      title: row?.ogTitle || title,
      description: row?.ogDescription || description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: row?.ogTitle || title,
      description: row?.ogDescription || description,
      images: [image],
    },
    other: { 'geo.region': 'IN-BR', 'geo.placename': 'Patna', 'geo.position': '25.5941;85.1376' },
  };
}

/** Title templates keep SERP formatting consistent across thousands of pages. */
/** Google truncates SERP titles beyond ~60 characters, so trim to fit. */
function fit(text: string, max: number) {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export const TITLE_TEMPLATES = {
  // Reserve room for the ' | AquaNexa' suffix added by the root layout template
  product: (name: string, brand?: string) => `${fit(name, 43)} | Buy Online`,
  category: (name: string) => `${fit(name, 40)} — Best Price in India`,
  serviceArea: (area: string) =>
    `RO Service in ${area}, Patna — ₹200 Visit Charge | Same-Day Repair | ${BRAND.name}`,
} as const;

export const DESC_TEMPLATES = {
  product: (name: string, price: number) =>
    `Buy ${name} online at ₹${price.toLocaleString('en-IN')}. Genuine product, free delivery across India, easy EMI & 7-day returns. Expert installation support available.`,
  serviceArea: (area: string) =>
    `Expert RO repair & installation in ${area}, Patna. Visit charge only ₹200. Same-day service, 30-day warranty, genuine spare parts. Call 8969821440 now.`,
} as const;
