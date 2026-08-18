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
    // `absolute` stops the root layout's "%s | Aqua Perl" template from
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
/**
 * Google truncates SERP titles beyond ~60 characters, so trim to fit.
 * Cuts on a WORD boundary — the old version sliced mid-word and produced
 * titles like "… RO Purifier —… | Buy Online", which reads broken in the SERP
 * and pushes Google to rewrite the title itself.
 */
function fit(text: string, max: number) {
  const s = text.replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  const base = sp > max * 0.6 ? cut.slice(0, sp) : cut;
  return `${base.replace(/[\s—–|,-]+$/, '')}…`;
}

/**
 * Clean a raw product name before it becomes a title.
 * Admin-typed names arrive with stray marks like "10L RO Purifier— Mineral"
 * (missing space) or double spaces. Left alone those defects show up in the
 * SERP exactly as typed, which reads broken and invites Google to rewrite.
 */
function tidy(name: string) {
  return name
    .replace(/\s+/g, ' ')
    .replace(/\s*—\s*/g, ' — ')       // normalise em-dash spacing
    .replace(/\s*–\s*/g, ' – ')
    .replace(/\s*\|\s*/g, ' | ')
    .trim();
}

export const TITLE_TEMPLATES = {
  /**
   * Product titles target 45–60 characters — the band Zyppy's 2026 study found
   * Google rewrites least often. Short names get a helpful qualifier appended
   * instead of being left as a bare 22-character title like "AquaPearl".
   */
  product: (name: string, brand?: string) => {
    const clean = tidy(name);
    const suffix = ' | Buy Online';
    // A very short name carries no search intent on its own. Pad it with the
    // category noun so it still matches "… water purifier price" style queries.
    if (clean.length < 28) {
      const padded = /purifier|ro\b|pump|membrane|filter|plant|kit|smps/i.test(clean)
        ? `${clean} — Price in India`
        : `${clean} RO Water Purifier — Price`;
      return `${fit(padded, 46)}${suffix}`;
    }
    return `${fit(clean, 46)}${suffix}`;
  },
  category: (name: string) => `${fit(name, 40)} — Best Price in India`,
  serviceArea: (area: string) =>
    `RO Service in ${area}, Patna — ₹200 Visit Charge | Same-Day Repair | ${BRAND.name}`,
} as const;

export const DESC_TEMPLATES = {
  /**
   * Meta descriptions are capped at 158 characters — past that Google cuts
   * mid-sentence with an ellipsis. The old template ran to 168+ on long
   * product names and was being truncated on every page.
   */
  product: (name: string, price: number) => {
    const clean = tidy(name);
    const full = `Buy ${clean} online at ₹${price.toLocaleString('en-IN')}. Genuine product, free delivery across India, easy EMI & 7-day returns. Expert installation support.`;
    if (full.length <= 158) return full;
    const short = `Buy ${clean} at ₹${price.toLocaleString('en-IN')}. Genuine product, free delivery across India, 7-day returns. Call 8969821440.`;
    return short.length <= 158 ? short : fit(short, 157);
  },
  serviceArea: (area: string) =>
    `Expert RO repair & installation in ${area}, Patna. Visit charge only ₹200. Same-day service, 30-day warranty, genuine spare parts. Call 8969821440 now.`,
} as const;
