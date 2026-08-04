/**
 * PUT /api/admin/seo — upsert SEO metadata for any entity or static page.
 *
 * The storefront reads these rows in generateMetadata(), so a save here
 * changes the live <title> and <meta description> on the next ISR revalidation.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/server/services/audit.service';

const schema = z.object({
  entityType: z.enum(['PRODUCT', 'CATEGORY', 'STATIC_PAGE', 'BLOG_POST', 'SERVICE_AREA', 'BRAND']),
  entityId: z.string().uuid().nullable().optional(),
  path: z.string().min(1).max(300),
  metaTitle: z.string().max(200).optional().or(z.literal('')),
  metaDescription: z.string().max(500).optional().or(z.literal('')),
  metaKeywords: z.string().max(1000).optional().or(z.literal('')),
  ogTitle: z.string().max(200).optional().or(z.literal('')),
  ogDescription: z.string().max(500).optional().or(z.literal('')),
  ogImageUrl: z.string().max(500).optional().or(z.literal('')),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
});

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
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
  const data = {
    entityType: d.entityType,
    entityId: d.entityId ?? null,
    path: d.path,
    metaTitle: d.metaTitle || null,
    metaDescription: d.metaDescription || null,
    metaKeywords: d.metaKeywords || null,
    ogTitle: d.ogTitle || null,
    ogDescription: d.ogDescription || null,
    ogImageUrl: d.ogImageUrl || null,
    robotsIndex: d.robotsIndex,
    robotsFollow: d.robotsFollow,
    updatedBy: session.user.id,
  };

  try {
    // Entity-scoped rows key on (entityType, entityId); static pages key on path
    const saved = d.entityId
      ? await prisma.seoMetadata.upsert({
          where: { entityType_entityId: { entityType: d.entityType, entityId: d.entityId } },
          update: data,
          create: data,
        })
      : await prisma.seoMetadata.upsert({
          where: { path: d.path },
          update: data,
          create: data,
        });

    // Push the change to the live page immediately
    try {
      revalidatePath(d.path);
    } catch {
      /* path may not be statically known — ISR will pick it up */
    }

    await logAudit({
      actorId: session.user.id,
      action: 'seo.update',
      entityType: 'SEO_METADATA',
      entityId: saved.id,
      afterData: saved,
    });

    return NextResponse.json({ success: true, seo: saved });
  } catch (err) {
    console.error('[admin/seo:PUT]', err);
    return NextResponse.json({ message: 'Could not save SEO settings' }, { status: 500 });
  }
}
