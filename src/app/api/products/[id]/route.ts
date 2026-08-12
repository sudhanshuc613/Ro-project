/**
 * PATCH  /api/products/[id] — update a product (admin)
 * DELETE /api/products/[id] — soft-delete (admin)
 *
 * Images and specs are replaced wholesale inside a transaction: simpler and
 * safer than diffing, and the counts are small (max 5 images).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/server/services/audit.service';
import { invalidateProductCache } from '@/server/services/product.service';

const schema = z.object({
  name: z.string().min(3).max(220),
  sku: z.string().min(2).max(64),
  slug: z.string().min(2).max(200),
  type: z.enum(['NEW_RO', 'SPARE_PART', 'COMMERCIAL_PLANT', 'ACCESSORY', 'AMC_PLAN']),
  categoryId: z.string().uuid('Please select a category'),
  brandId: z.string().uuid().optional().or(z.literal('')),
  shortDescription: z.string().max(500).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  mrp: z.number().positive('MRP must be greater than 0'),
  sellingPrice: z.number().positive('Selling price must be greater than 0'),
  costPrice: z.number().nonnegative().optional(),
  taxRate: z.number().min(0).max(28),
  hsnCode: z.string().max(12).optional().or(z.literal('')),
  stockQuantity: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
  purificationTech: z.array(z.string()),
  warrantyMonths: z.number().int().nonnegative().optional(),
  storageLitres: z.number().nonnegative().optional(),
  capacityLph: z.number().int().nonnegative().optional(),
  isPanIndia: z.boolean(),
  requiresInstallation: z.boolean(),
  freeShipping: z.boolean(),
  isFeatured: z.boolean(),
  status: z.enum(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED']),
  images: z.array(z.object({
    url: z.string().min(1),
    altText: z.string().max(200),
    isPrimary: z.boolean(),
  })).min(2, 'Add at least 2 images').max(5, 'Maximum 5 images'),
  specifications: z.array(z.object({
    specGroup: z.string().max(80),
    specKey: z.string().max(120),
    specValue: z.string().max(300),
  })).default([]),
  seo: z.object({
    metaTitle: z.string().max(200).optional().or(z.literal('')),
    metaDescription: z.string().max(500).optional().or(z.literal('')),
    metaKeywords: z.string().max(1000).optional().or(z.literal('')),
  }).optional(),
}).refine((d) => d.sellingPrice <= d.mrp, {
  message: 'Selling price cannot exceed MRP',
  path: ['sellingPrice'],
});

function guard(role?: string) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const d = parsed.data;

  const before = await prisma.product.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

  // Guarantee exactly one primary image
  const images = d.images.map((img, i) => ({
    ...img,
    isPrimary: d.images.some((x) => x.isPrimary) ? img.isPrimary : i === 0,
  }));
  if (images.filter((i) => i.isPrimary).length > 1) {
    let seen = false;
    for (const img of images) {
      if (img.isPrimary && seen) img.isPrimary = false;
      if (img.isPrimary) seen = true;
    }
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: params.id } });
      await tx.productSpecification.deleteMany({ where: { productId: params.id } });

      const p = await tx.product.update({
        where: { id: params.id },
        data: {
          name: d.name, sku: d.sku, slug: d.slug, type: d.type,
          categoryId: d.categoryId, brandId: d.brandId || null,
          shortDescription: d.shortDescription || null,
          description: d.description || null,
          mrp: d.mrp, sellingPrice: d.sellingPrice,
          costPrice: d.costPrice || null, taxRate: d.taxRate,
          hsnCode: d.hsnCode || null,
          stockQuantity: d.stockQuantity, lowStockThreshold: d.lowStockThreshold,
          purificationTech: d.purificationTech,
          warrantyMonths: d.warrantyMonths || null,
          storageLitres: d.storageLitres || null,
          capacityLph: d.capacityLph || null,
          isPanIndia: d.isPanIndia,
          requiresInstallation: d.requiresInstallation,
          freeShipping: d.freeShipping,
          isFeatured: d.isFeatured,
          status: d.status,
          images: {
            create: images.map((img, i) => ({
              url: img.url,
              thumbUrl: img.url,
              zoomUrl: img.url,
              altText: img.altText || d.name,
              displayOrder: i,
              isPrimary: img.isPrimary,
            })),
          },
          specifications: {
            create: d.specifications.map((s, i) => ({ ...s, displayOrder: i })),
          },
        },
      });

      if (d.seo && (d.seo.metaTitle || d.seo.metaDescription || d.seo.metaKeywords)) {
        await tx.seoMetadata.upsert({
          where: { entityType_entityId: { entityType: 'PRODUCT', entityId: params.id } },
          update: {
            metaTitle: d.seo.metaTitle || null,
            metaDescription: d.seo.metaDescription || null,
            metaKeywords: d.seo.metaKeywords || null,
            path: `/products/${d.slug}`,
            updatedBy: session!.user.id,
          },
          create: {
            entityType: 'PRODUCT', entityId: params.id,
            path: `/products/${d.slug}`,
            metaTitle: d.seo.metaTitle || null,
            metaDescription: d.seo.metaDescription || null,
            metaKeywords: d.seo.metaKeywords || null,
            updatedBy: session!.user.id,
          },
        });
      }

      return p;
    });

    await invalidateProductCache(before.slug);
    try {
      revalidatePath(`/products/${d.slug}`);
      revalidatePath('/products');
    } catch { /* ISR will catch up */ }

    await logAudit({
      actorId: session!.user.id,
      action: 'product.update',
      entityType: 'PRODUCT',
      entityId: params.id,
      beforeData: before,
      afterData: updated,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'P2002') {
      return NextResponse.json(
        { message: 'Another product already uses this SKU or slug.' },
        { status: 409 },
      );
    }
    console.error('[products:PATCH]', err);
    return NextResponse.json({ message: 'Could not update product' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: { deletedAt: new Date(), status: 'ARCHIVED' },
  });

  await invalidateProductCache(product.slug);
  await logAudit({
    actorId: session!.user.id,
    action: 'product.delete',
    entityType: 'PRODUCT',
    entityId: params.id,
    beforeData: product,
  });

  return NextResponse.json({ success: true, message: 'Product archived' });
}
