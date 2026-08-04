import { prisma } from '@/lib/db/prisma';
import SeoEditor from '@/components/admin/SeoEditor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'SEO Manager' };

/**
 * SEO Manager — edit meta title / description / keywords / robots for every
 * page and product without touching code or redeploying.
 *
 * Rows already in seo_metadata are shown first; products without a row get a
 * "not set" entry so nothing is invisible.
 */
export default async function SeoManagerPage() {
  const [rows, products, categories] = await Promise.all([
    prisma.seoMetadata.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.product.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const byEntity = new Map(rows.filter((r) => r.entityId).map((r) => [r.entityId!, r]));
  const staticRows = rows.filter((r) => r.entityType === 'STATIC_PAGE');

  const productEntries = products.map((p) => {
    const row = byEntity.get(p.id);
    return {
      key: `PRODUCT:${p.id}`,
      entityType: 'PRODUCT' as const,
      entityId: p.id,
      path: `/products/${p.slug}`,
      label: p.name,
      metaTitle: row?.metaTitle ?? '',
      metaDescription: row?.metaDescription ?? '',
      metaKeywords: row?.metaKeywords ?? '',
      robotsIndex: row?.robotsIndex ?? true,
      isSet: Boolean(row),
    };
  });

  const categoryEntries = categories.map((c) => {
    const row = byEntity.get(c.id);
    return {
      key: `CATEGORY:${c.id}`,
      entityType: 'CATEGORY' as const,
      entityId: c.id,
      path: `/category/${c.slug}`,
      label: c.name,
      metaTitle: row?.metaTitle ?? '',
      metaDescription: row?.metaDescription ?? '',
      metaKeywords: row?.metaKeywords ?? '',
      robotsIndex: row?.robotsIndex ?? true,
      isSet: Boolean(row),
    };
  });

  const staticEntries = staticRows.map((r) => ({
    key: `STATIC:${r.path}`,
    entityType: 'STATIC_PAGE' as const,
    entityId: null,
    path: r.path ?? '/',
    label: r.path === '/' ? 'Homepage' : (r.path ?? ''),
    metaTitle: r.metaTitle ?? '',
    metaDescription: r.metaDescription ?? '',
    metaKeywords: r.metaKeywords ?? '',
    robotsIndex: r.robotsIndex,
    isSet: true,
  }));

  const missing = [...productEntries, ...categoryEntries].filter((e) => !e.isSet).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">SEO Manager</h1>
        <p className="mt-0.5 text-sm text-muted">
          Edit meta tags for every page. Changes go live within a minute — no redeploy.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Pages with SEO set" value={String(rows.length)} tone="green" />
        <Stat label="Missing SEO" value={String(missing)} tone={missing > 0 ? 'orange' : 'green'} />
        <Stat label="Total pages" value={String(productEntries.length + categoryEntries.length + staticEntries.length)} tone="aqua" />
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-bold">Length rules Google actually enforces</p>
        <p className="mt-1">
          Title ≤ <strong>60 characters</strong>, description ≤ <strong>155 characters</strong>.
          Longer gets cut off with “…” in search results. The editor warns you live.
        </p>
      </div>

      <SeoEditor
        staticPages={staticEntries}
        products={productEntries}
        categories={categoryEntries}
      />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'green' | 'orange' | 'aqua' }) {
  const cls = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    orange: 'bg-orange-50 text-orange-700 ring-orange-100',
    aqua: 'bg-aqua-50 text-aqua-700 ring-aqua-100',
  }[tone];
  return (
    <div className={`rounded-2xl p-5 ring-1 ${cls}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}
