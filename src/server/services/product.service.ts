/**
 * Product service — all catalog reads used by Server Components.
 * Cached via Redis; invalidated on admin write (see cacheInvalidate('product')).
 */
import { prisma } from '@/lib/db/prisma';
import { cached, cacheInvalidate } from '@/lib/db/redis';

const CARD_SELECT = {
  id: true,
  slug: true,
  name: true,
  sku: true,
  sellingPrice: true,
  mrp: true,
  stockQuantity: true,
  allowBackorder: true,
  ratingAvg: true,
  ratingCount: true,
  purificationTech: true,
  isBestseller: true,
  warrantyMonths: true,
  soldCount: true,
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { url: true, thumbUrl: true, altText: true },
  },
} as const;

export type ProductCard = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

/* ── Homepage blocks ────────────────────────────────────────────────────── */

export async function getFeaturedProducts(limit = 8) {
  return cached(`products:featured:${limit}`, 900, () =>
    prisma.product.findMany({
      where: { deletedAt: null, status: 'ACTIVE', isFeatured: true },
      select: CARD_SELECT,
      orderBy: { soldCount: 'desc' },
      take: limit,
    }),
  );
}

export async function getBestSellers(limit = 8) {
  return cached(`products:bestsellers:${limit}`, 900, () =>
    prisma.product.findMany({
      where: { deletedAt: null, status: 'ACTIVE', stockQuantity: { gt: 0 } },
      select: CARD_SELECT,
      orderBy: [{ isBestseller: 'desc' }, { soldCount: 'desc' }, { ratingAvg: 'desc' }],
      take: limit,
    }),
  );
}

export async function getProductsByType(type: string, limit = 8) {
  return cached(`products:type:${type}:${limit}`, 900, () =>
    prisma.product.findMany({
      where: { deletedAt: null, status: 'ACTIVE', type: type as never },
      select: CARD_SELECT,
      orderBy: { soldCount: 'desc' },
      take: limit,
    }),
  );
}

/* ── PDP ────────────────────────────────────────────────────────────────── */

export async function getProductBySlug(slug: string) {
  return cached(`product:slug:${slug}`, 600, () =>
    prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        specifications: { orderBy: [{ specGroup: 'asc' }, { displayOrder: 'asc' }] },
        variants: { where: { isActive: true } },
      },
    }),
  );
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  return cached(`product:related:${productId}:${limit}`, 900, () =>
    prisma.product.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        categoryId,
        id: { not: productId },
      },
      select: CARD_SELECT,
      orderBy: [{ soldCount: 'desc' }, { ratingAvg: 'desc' }],
      take: limit,
    }),
  );
}

/** Spare parts that fit this machine — drives PDP cross-sell. */
export async function getCompatibleParts(machineProductId: string, limit = 6) {
  const rows = await prisma.productCompatibility.findMany({
    where: { machineProductId },
    select: { partProduct: { select: CARD_SELECT } },
    take: limit,
  });
  return rows.map((r) => r.partProduct);
}

/** Fire-and-forget view counter — never awaited in the render path. */
export async function incrementProductView(id: string) {
  try {
    await prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    /* non-fatal */
  }
}

/* ── Search ─────────────────────────────────────────────────────────────── */

/**
 * Autosuggest: trigram similarity handles typos ("membrain" → "membrane"),
 * which matters because most Indian mobile users search with misspellings.
 */
export async function suggestProducts(query: string, limit = 6) {
  const q = query.trim();
  if (q.length < 2) return [];

  return prisma.$queryRaw<
    { id: string; name: string; slug: string; selling_price: string; url: string | null }[]
  >`
    SELECT p.id, p.name, p.slug, p.selling_price::text,
           (SELECT pi.thumb_url FROM product_images pi
             WHERE pi.product_id = p.id AND pi.is_primary LIMIT 1) AS url
    FROM products p
    WHERE p.deleted_at IS NULL
      AND p.status = 'ACTIVE'
      AND (p.search_vector @@ plainto_tsquery('english', ${q})
           OR p.name % ${q}
           OR p.name ILIKE ${'%' + q + '%'})
    ORDER BY
      ts_rank(p.search_vector, plainto_tsquery('english', ${q})) DESC,
      similarity(p.name, ${q}) DESC,
      p.sold_count DESC
    LIMIT ${limit}
  `;
}

/** Popular queries for the empty-state suggest dropdown. */
export async function getTrendingSearches(limit = 5) {
  return cached(`search:trending:${limit}`, 3600, async () => {
    const rows = await prisma.searchQuery.groupBy({
      by: ['query'],
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 864e5) },
        resultCount: { gt: 0 },
      },
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit,
    });
    return rows.map((r) => r.query);
  });
}

export async function logSearch(query: string, resultCount: number, userId?: string) {
  try {
    await prisma.searchQuery.create({
      data: { query: query.slice(0, 200), resultCount, userId: userId ?? null },
    });
  } catch {
    /* non-fatal */
  }
}

/* ── Cache invalidation (call after any admin write) ────────────────────── */

export async function invalidateProductCache(slug?: string) {
  await Promise.all([
    cacheInvalidate('products:'),
    cacheInvalidate('product:related:'),
    slug ? cacheInvalidate(`product:slug:${slug}`) : Promise.resolve(0),
  ]);
}
