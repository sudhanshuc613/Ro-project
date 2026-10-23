/**
 * GET  /api/products  — public catalog with smart faceted filtering
 * POST /api/products  — admin create
 *
 * Supported query params:
 *   q, category, brand, type, tech (CSV), minPrice, maxPrice,
 *   storage, capacity, rating, inStock, sort, page, limit
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { slugify } from '@/lib/utils/format';
import { logAudit } from '@/server/services/audit.service';
import { notifyProductPublished } from '@/server/services/indexing.service';

/* ── Public catalog ─────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get('page') ?? 1));
  const limit = Math.min(60, Number(sp.get('limit') ?? 24));
  const sort = sp.get('sort') ?? 'relevance';

  const tech = sp.get('tech')?.split(',').filter(Boolean) ?? [];
  const minPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined;
  const maxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined;
  const brands = sp.get('brand')?.split(',').filter(Boolean) ?? [];
  const q = sp.get('q')?.trim();

  const where: Record<string, unknown> = {
    deletedAt: null,
    status: 'ACTIVE',
    ...(sp.get('category') ? { category: { slug: sp.get('category')! } } : {}),
    ...(sp.get('type') ? { type: sp.get('type') } : {}),
    ...(brands.length ? { brand: { slug: { in: brands } } } : {}),
    ...(tech.length ? { purificationTech: { hasSome: tech } } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { sellingPrice: { ...(minPrice !== undefined && { gte: minPrice }), ...(maxPrice !== undefined && { lte: maxPrice }) } }
      : {}),
    ...(sp.get('rating') ? { ratingAvg: { gte: Number(sp.get('rating')) } } : {}),
    ...(sp.get('inStock') === 'true' ? { stockQuantity: { gt: 0 } } : {}),
    ...(q
      ? { OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { shortDescription: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ] }
      : {}),
  };

  const orderBy = {
    price_asc:  { sellingPrice: 'asc' as const },
    price_desc: { sellingPrice: 'desc' as const },
    rating:     { ratingAvg: 'desc' as const },
    newest:     { createdAt: 'desc' as const },
    relevance:  { soldCount: 'desc' as const },
  }[sort] ?? { soldCount: 'desc' as const };

  const [items, total, facets] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true, slug: true, name: true, sku: true, sellingPrice: true, mrp: true,
        stockQuantity: true, ratingAvg: true, ratingCount: true, purificationTech: true,
        isBestseller: true, warrantyMonths: true,
        brand: { select: { name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true, thumbUrl: true, altText: true } },
      },
      orderBy, skip: (page - 1) * limit, take: limit,
    }),
    prisma.product.count({ where }),
    // Facet counts for the filter sidebar
    prisma.product.groupBy({
      by: ['brandId'],
      where: { deletedAt: null, status: 'ACTIVE' },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    items, total, page, pages: Math.ceil(total / limit),
    facets: { brands: facets },
  });
}

/* ── Admin create ───────────────────────────────────────────────────────── */
const createProductSchema = z.object({
  name: z.string().min(3).max(220),
  sku: z.string().min(2).max(64),
  // Forced lowercase server-side: an uppercase slug serves 200 on the
  // uppercase URL and 404 on the lowercase form everyone actually types.
  slug: z.string().optional().transform((s) => (s ? slugify(s) : s)),
  type: z.enum(['NEW_RO','SPARE_PART','COMMERCIAL_PLANT','ACCESSORY','AMC_PLAN']),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional().nullable().or(z.literal('')),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  mrp: z.number().positive(),
  sellingPrice: z.number().positive(),
  costPrice: z.number().nonnegative().optional(),
  taxRate: z.number().min(0).max(28).default(18),
  hsnCode: z.string().max(12).optional(),
  stockQuantity: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(5),
  purificationTech: z.array(z.string()).default([]),
  storageLitres: z.number().optional(),
  capacityLph: z.number().int().optional(),
  warrantyMonths: z.number().int().optional(),
  isFeatured: z.boolean().default(false),
  isPanIndia: z.boolean().default(true),
  requiresInstallation: z.boolean().default(false),
  freeShipping: z.boolean().default(false),
  status: z.enum(['DRAFT','ACTIVE','OUT_OF_STOCK','ARCHIVED']).default('DRAFT'),
  // Accept both a relative path (/products/x.jpg) and a full CDN URL
  images: z.array(z.object({
    url: z.string().min(1, 'Image path required'),
    thumbUrl: z.string().optional(),
    zoomUrl: z.string().optional(),
    altText: z.string().max(200),
    isPrimary: z.boolean().default(false),
  })).min(2, 'Add at least 2 product images').max(5, 'Maximum 5 images allowed'),
  specifications: z.array(z.object({
    specGroup: z.string().default('General'),
    specKey: z.string().max(120),
    specValue: z.string().max(300),
  })).default([]),
  seo: z.object({
    metaTitle: z.string().max(200).optional(),
    metaDescription: z.string().max(500).optional(),
    metaKeywords: z.string().optional(),
  }).optional(),
}).refine((d) => d.sellingPrice <= d.mrp, {
  message: 'Selling price cannot exceed MRP', path: ['sellingPrice'],
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const parsed = createProductSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const d = parsed.data;
  const slug = d.slug || slugify(d.name);

  /* 🔴 25 Oct 2026 — "A product with this SKU or slug already exists." ka
     ASLI PROBLEM.
     ════════════════════════════════════════════════════════════════════════
     Owner product add nahi kar paa raha tha. Error aata tha par ye nahi
     batata tha ki SKU galat hai ya slug, aur na hi ye ki takra kis product se
     raha hai. Wajah do ho sakti hai:

       1. Product pehle se DRAFT me bana hua hai (list me dikhta hai, par
          website par 404 deta hai, isliye lagta hai ki bana hi nahi).

       2. 🔴 ASLI JAAL — product DELETE kiya ja chuka hai.
          DELETE soft hai: `deletedAt` set hota hai, row DATABASE ME RAHTI HAI.
          Admin ki list `where: { deletedAt: null }` karti hai, isliye wo row
          KAHIN DIKHTI NAHI. Par `sku` aur `slug` par DB ka unique constraint
          soft-deleted row par bhi lagta hai. Natija: wo SKU/slug hamesha ke
          liye block, aur owner ko kahin koi wajah nahi dikhti.

     Pehle sirf Prisma ka P2002 pakda jata tha aur ek hi generic line lautayi
     jati thi. Ab banane se PEHLE dekh lete hain ki takrav hai ya nahi, aur
     saaf-saaf batate hain: kaun sa field, kis product se, aur ab kya karna hai.

     🔴 Unique constraint ko partial (sirf deletedAt IS NULL) karna DB migration
        maangta hai — live data par wo risk nahi liya. Ye fix sirf jaanch aur
        message sudharta hai, schema ko haath nahi lagata. */
  const clash = await prisma.product.findFirst({
    where: { OR: [{ sku: d.sku }, { slug }] },
    select: { id: true, name: true, sku: true, slug: true, status: true, deletedAt: true },
  });
  if (clash) {
    const skuHit = clash.sku === d.sku;
    const field = skuHit ? 'SKU' : 'URL Slug';
    const value = skuHit ? d.sku : slug;
    const message = clash.deletedAt
      ? `Ye ${field} ("${value}") ek DELETE kiye gaye product "${clash.name}" ka hai. `
        + `Delete hone ke baad bhi ${field} reserve rehta hai. `
        + `Thoda alag ${field} daalo (jaise aakhir me -2 laga do).`
      : `Ye ${field} ("${value}") pehle se product "${clash.name}" `
        + `(status: ${clash.status}) use kar raha hai. `
        + `Naya banane ke bajaye USI ko Edit karo, ya alag ${field} daalo.`;
    return NextResponse.json(
      { message, conflict: { field: skuHit ? 'sku' : 'slug', value, productId: clash.id,
                             productName: clash.name, status: clash.status,
                             deleted: Boolean(clash.deletedAt) } },
      { status: 409 },
    );
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: d.name, sku: d.sku, slug, type: d.type,
          categoryId: d.categoryId, brandId: d.brandId || null,
          shortDescription: d.shortDescription, description: d.description,
          mrp: d.mrp, sellingPrice: d.sellingPrice, costPrice: d.costPrice,
          taxRate: d.taxRate, hsnCode: d.hsnCode,
          stockQuantity: d.stockQuantity, lowStockThreshold: d.lowStockThreshold,
          purificationTech: d.purificationTech,
          storageLitres: d.storageLitres, capacityLph: d.capacityLph,
          warrantyMonths: d.warrantyMonths,
          isPanIndia: d.isPanIndia, requiresInstallation: d.requiresInstallation,
          freeShipping: d.freeShipping, isFeatured: d.isFeatured, status: d.status,
          createdBy: session.user.id,
          images: {
            create: d.images.map((img, i) => ({
              url: img.url, thumbUrl: img.thumbUrl ?? img.url, zoomUrl: img.zoomUrl ?? img.url,
              altText: img.altText, displayOrder: i,
              isPrimary: img.isPrimary || i === 0,
            })),
          },
          specifications: {
            create: d.specifications.map((s, i) => ({ ...s, displayOrder: i })),
          },
        },
        include: { images: true, specifications: true },
      });

      if (d.seo) {
        await tx.seoMetadata.create({
          data: {
            entityType: 'PRODUCT', entityId: created.id,
            path: `/products/${slug}`,
            metaTitle: d.seo.metaTitle, metaDescription: d.seo.metaDescription,
            metaKeywords: d.seo.metaKeywords, updatedBy: session.user.id,
          },
        });
      }
      return created;
    });

    await logAudit({
      actorId: session.user.id, action: 'product.create',
      entityType: 'PRODUCT', entityId: product.id, afterData: product,
    });

    // Sitemap must reflect the new URL before we ask anyone to crawl it.
    try {
      revalidatePath('/sitemap.xml');
      revalidatePath('/products');
      // Purge the cached product queries so an admin edit shows immediately
      // instead of waiting out the 5-minute TTL.
      revalidateTag('products');
    } catch { /* ISR will catch up */ }

    // Fire-and-forget IndexNow ping (Bing, Yandex, Naver, Seznam).
    // Google does not support IndexNow — the fresh sitemap above is its signal.
    if (d.status === 'ACTIVE') {
      const cat = await prisma.category
        .findUnique({ where: { id: d.categoryId }, select: { slug: true } })
        .catch(() => null);
      void notifyProductPublished(slug, cat?.slug).catch(() => {});
    }

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'P2002') {
      return NextResponse.json({ message: 'A product with this SKU or slug already exists.' }, { status: 409 });
    }
    console.error('[products:POST]', err);
    return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
  }
}
