/**
 * Catalog listing service — shared by /products, /category/[slug] and /search.
 */
import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';

const CARD_SELECT = {
  id: true,
  slug: true,
  name: true,
  sku: true,
  sellingPrice: true,
  mrp: true,
  stockQuantity: true,
  ratingAvg: true,
  ratingCount: true,
  purificationTech: true,
  isBestseller: true,
  brand: { select: { name: true, slug: true } },
  images: { where: { isPrimary: true }, take: 1, select: { url: true, thumbUrl: true, altText: true } },
} satisfies Prisma.ProductSelect;

export interface ListParams {
  categorySlug?: string;
  q?: string;
  tech?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function listProducts(p: ListParams) {
  const page = Math.max(1, p.page ?? 1);
  const limit = Math.min(48, p.limit ?? 24);

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    status: 'ACTIVE',
    ...(p.categorySlug ? { category: { slug: p.categorySlug } } : {}),
    ...(p.brands?.length ? { brand: { slug: { in: p.brands } } } : {}),
    ...(p.tech?.length ? { purificationTech: { hasSome: p.tech } } : {}),
    ...(p.inStock ? { stockQuantity: { gt: 0 } } : {}),
    ...(p.minPrice !== undefined || p.maxPrice !== undefined
      ? {
          sellingPrice: {
            ...(p.minPrice !== undefined ? { gte: p.minPrice } : {}),
            ...(p.maxPrice !== undefined ? { lte: p.maxPrice } : {}),
          },
        }
      : {}),
    ...(p.q
      ? {
          OR: [
            { name: { contains: p.q, mode: 'insensitive' } },
            { shortDescription: { contains: p.q, mode: 'insensitive' } },
            { sku: { contains: p.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    p.sort === 'price_asc' ? { sellingPrice: 'asc' }
    : p.sort === 'price_desc' ? { sellingPrice: 'desc' }
    : p.sort === 'rating' ? { ratingAvg: 'desc' }
    : p.sort === 'newest' ? { createdAt: 'desc' }
    : { soldCount: 'desc' };

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, select: CARD_SELECT, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({ where: { slug, isActive: true } });
}

export async function getAllCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    select: { id: true, name: true, slug: true, kind: true, _count: { select: { products: true } } },
  });
}

export async function getAllBrands() {
  return prisma.brand.findMany({ orderBy: { name: 'asc' }, select: { name: true, slug: true } });
}

/** Parse Next.js searchParams into ListParams. */
export function parseListParams(sp: Record<string, string | string[] | undefined>): ListParams {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const csv = (k: string) => one(k)?.split(',').filter(Boolean);
  const num = (k: string) => {
    const v = one(k);
    return v !== undefined && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : undefined;
  };
  return {
    q: one('q'),
    tech: csv('tech'),
    brands: csv('brand'),
    minPrice: num('minPrice'),
    maxPrice: num('maxPrice'),
    inStock: one('inStock') === 'true',
    sort: one('sort'),
    page: num('page') ?? 1,
  };
}
