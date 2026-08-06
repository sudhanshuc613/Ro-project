'use client';

/**
 * ProductForm — full create/edit UI for the catalog.
 *
 * Images can be uploaded directly from the admin's computer or phone camera
 * (drag-drop, file picker, or Ctrl+V). They are compressed to WebP and stored
 * via media.service.ts — Vercel Blob when a token exists, otherwise Postgres.
 * Pasting an existing path or CDN URL still works for anything already hosted.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { FILTER_FACETS } from '@/lib/constants';
import ImageUploader from '@/components/admin/ImageUploader';

interface Option { id: string; name: string }

export interface ProductFormData {
  id?: string;
  name: string;
  sku: string;
  slug: string;
  type: string;
  categoryId: string;
  brandId: string;
  shortDescription: string;
  description: string;
  mrp: number;
  sellingPrice: number;
  costPrice: number;
  taxRate: number;
  stockQuantity: number;
  lowStockThreshold: number;
  purificationTech: string[];
  warrantyMonths: number;
  storageLitres: number;
  capacityLph: number;
  isPanIndia: boolean;
  requiresInstallation: boolean;
  freeShipping: boolean;
  isFeatured: boolean;
  status: string;
  images: { url: string; altText: string; isPrimary: boolean }[];
  specifications: { specGroup: string; specKey: string; specValue: string }[];
  seo: { metaTitle: string; metaDescription: string; metaKeywords: string };
}

const EMPTY: ProductFormData = {
  name: '', sku: '', slug: '', type: 'NEW_RO', categoryId: '', brandId: '',
  shortDescription: '', description: '',
  mrp: 0, sellingPrice: 0, costPrice: 0, taxRate: 18,
  stockQuantity: 0, lowStockThreshold: 5,
  purificationTech: [], warrantyMonths: 12, storageLitres: 0, capacityLph: 0,
  isPanIndia: true, requiresInstallation: false, freeShipping: false, isFeatured: false,
  status: 'DRAFT',
  images: [
    { url: '', altText: '', isPrimary: true },
    { url: '', altText: '', isPrimary: false },
  ],
  specifications: [{ specGroup: 'General', specKey: '', specValue: '' }],
  seo: { metaTitle: '', metaDescription: '', metaKeywords: '' },
};

const TABS = ['Basic', 'Pricing', 'Images', 'Specs', 'SEO'] as const;

export default function ProductForm({
  initial, categories, brands,
}: {
  initial?: Partial<ProductFormData>;
  categories: Option[];
  brands: Option[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Basic');
  const [f, setF] = useState<ProductFormData>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(f.id);
  const up = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  /** Auto-generate slug from name unless the user has typed their own. */
  function onNameChange(name: string) {
    const autoSlug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    setF((p) => ({
      ...p,
      name,
      slug: !isEdit ? autoSlug : p.slug,
    }));
  }

  const discount = f.mrp > f.sellingPrice ? Math.round(((f.mrp - f.sellingPrice) / f.mrp) * 100) : 0;
  const margin = f.costPrice > 0 ? Math.round(((f.sellingPrice - f.costPrice) / f.sellingPrice) * 100) : null;

  async function save() {
    setSaving(true);
    setErrors({});
    try {
      const payload = {
        ...f,
        images: f.images.filter((i) => i.url.trim()),
        specifications: f.specifications.filter((s) => s.specKey.trim() && s.specValue.trim()),
      };

      const res = await fetch(isEdit ? `/api/products/${f.id}` : '/api/products', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          const first = Object.entries(data.errors)[0];
          toast.error(`${first[0]}: ${(first[1] as string[])[0]}`);
        } else {
          toast.error(data.message ?? 'Save failed');
        }
        return;
      }

      toast.success(isEdit ? 'Product updated' : 'Product created');
      router.push('/admin/products');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t ? 'bg-navy-700 text-white' : 'bg-white text-navy-700 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        {/* ── BASIC ── */}
        {tab === 'Basic' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Product Name" error={errors.name?.[0]} required full>
              <input value={f.name} onChange={(e) => onNameChange(e.target.value)}
                placeholder="Aqua Perl Pure 8L RO + UV + UF Water Purifier" className={inp} />
            </Field>

            <Field label="SKU" error={errors.sku?.[0]} required hint="Unique code, e.g. AQN-RO-8L-001">
              <input value={f.sku} onChange={(e) => up('sku', e.target.value.toUpperCase())} className={inp} />
            </Field>

            <Field label="URL Slug" error={errors.slug?.[0]} hint="Auto-filled from name">
              <input value={f.slug} onChange={(e) => up('slug', e.target.value)} className={inp} />
            </Field>

            <Field label="Type" required>
              <select value={f.type} onChange={(e) => up('type', e.target.value)} className={inp}>
                <option value="NEW_RO">New RO Purifier</option>
                <option value="SPARE_PART">Spare Part</option>
                <option value="COMMERCIAL_PLANT">Commercial Plant</option>
                <option value="ACCESSORY">Accessory</option>
              </select>
            </Field>

            <Field label="Category" error={errors.categoryId?.[0]} required>
              <select value={f.categoryId} onChange={(e) => up('categoryId', e.target.value)} className={inp}>
                <option value="">Select category…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>

            <Field label="Brand">
              <select value={f.brandId} onChange={(e) => up('brandId', e.target.value)} className={inp}>
                <option value="">No brand</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>

            <Field label="Short Description" hint="Shown on the product card and in search results" full>
              <textarea rows={2} value={f.shortDescription}
                onChange={(e) => up('shortDescription', e.target.value)} className={inp} />
            </Field>

            <Field label="Full Description" hint="Basic HTML allowed: <p>, <ul>, <li>, <strong>" full>
              <textarea rows={5} value={f.description}
                onChange={(e) => up('description', e.target.value)} className={inp} />
            </Field>

            <Field label="Purification Technology" full>
              <div className="flex flex-wrap gap-2">
                {FILTER_FACETS.purificationTech.map((t) => {
                  const on = f.purificationTech.includes(t.value);
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        up('purificationTech',
                          on ? f.purificationTech.filter((x) => x !== t.value) : [...f.purificationTech, t.value])
                      }
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                        on ? 'bg-aqua-500 text-white' : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
                      }`}
                    >
                      {t.value.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Status">
              <select value={f.status} onChange={(e) => up('status', e.target.value)} className={inp}>
                <option value="DRAFT">Draft (hidden)</option>
                <option value="ACTIVE">Active (live on site)</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </Field>

            <div className="space-y-2 md:col-span-2">
              <Toggle label="Featured on homepage" checked={f.isFeatured} onChange={(v) => up('isFeatured', v)} />
              <Toggle label="Ships pan-India" checked={f.isPanIndia} onChange={(v) => up('isPanIndia', v)} />
              <Toggle label="Requires installation" checked={f.requiresInstallation} onChange={(v) => up('requiresInstallation', v)} />
              <Toggle label="Free shipping" checked={f.freeShipping} onChange={(v) => up('freeShipping', v)} />
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        {tab === 'Pricing' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="MRP (₹)" error={errors.mrp?.[0]} required>
              <input type="number" value={f.mrp || ''} onChange={(e) => up('mrp', Number(e.target.value))} className={inp} />
            </Field>

            <Field label="Selling Price (₹)" error={errors.sellingPrice?.[0]} required
              hint={discount > 0 ? `${discount}% discount shown to customer` : undefined}>
              <input type="number" value={f.sellingPrice || ''} onChange={(e) => up('sellingPrice', Number(e.target.value))} className={inp} />
            </Field>

            <Field label="Cost Price (₹)" hint={margin !== null ? `Your margin: ${margin}%` : 'Admin only — never shown publicly'}>
              <input type="number" value={f.costPrice || ''} onChange={(e) => up('costPrice', Number(e.target.value))} className={inp} />
            </Field>

            <Field label="GST Rate (%)">
              <input type="number" value={f.taxRate} onChange={(e) => up('taxRate', Number(e.target.value))} className={inp} />
            </Field>

            <Field label="Stock Quantity" required>
              <input type="number" value={f.stockQuantity} onChange={(e) => up('stockQuantity', Number(e.target.value))} className={inp} />
            </Field>

            <Field label="Low Stock Alert Below">
              <input type="number" value={f.lowStockThreshold} onChange={(e) => up('lowStockThreshold', Number(e.target.value))} className={inp} />
            </Field>

            <Field label="Warranty (months)">
              <input type="number" value={f.warrantyMonths} onChange={(e) => up('warrantyMonths', Number(e.target.value))} className={inp} />
            </Field>

            <Field label={f.type === 'COMMERCIAL_PLANT' ? 'Capacity (LPH)' : 'Storage (Litres)'}>
              <input
                type="number"
                value={f.type === 'COMMERCIAL_PLANT' ? f.capacityLph || '' : f.storageLitres || ''}
                onChange={(e) =>
                  f.type === 'COMMERCIAL_PLANT'
                    ? up('capacityLph', Number(e.target.value))
                    : up('storageLitres', Number(e.target.value))
                }
                className={inp}
              />
            </Field>

            {f.mrp > 0 && f.sellingPrice > f.mrp && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 md:col-span-2">
                Selling price cannot be higher than MRP.
              </p>
            )}
          </div>
        )}

        {/* ── IMAGES ── */}
        {tab === 'Images' && (
          <div className="space-y-4">
            {/* Upload straight from the computer / phone camera */}
            <ImageUploader
              folder="products"
              multiple
              onUploaded={(uploaded) => {
                setF((p) => {
                  const filled = p.images.filter((x) => x.url.trim());
                  const incoming = uploaded.map((u) => ({
                    url: u.url,
                    altText: p.name ? `${p.name} — product photo` : '',
                    isPrimary: false,
                  }));
                  const merged = [...filled, ...incoming].slice(0, 5);
                  if (merged.length && !merged.some((x) => x.isPrimary)) merged[0].isPrimary = true;
                  // Keep at least two slots visible so the form still guides them
                  while (merged.length < 2) merged.push({ url: '', altText: '', isPrimary: false });
                  return { ...p, images: merged };
                });
              }}
            />

            <details className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <summary className="cursor-pointer text-xs font-bold text-navy-700">
                Or paste an image link instead
              </summary>
              <p className="mt-2 text-xs text-muted">
                A path like <code className="rounded bg-white px-1.5">/products/kent-grand.jpg</code>{' '}
                (file already in the repo) or a full CDN URL both work. Edit the boxes below.
              </p>
            </details>

            {f.images.map((img, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-navy-700">
                    Image {i + 1} {img.isPrimary && <span className="ml-1 rounded bg-aqua-500 px-2 py-0.5 text-[10px] text-white">PRIMARY</span>}
                  </p>
                  <div className="flex gap-2">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => up('images', f.images.map((x, j) => ({ ...x, isPrimary: j === i })))}
                        className="text-xs font-bold text-aqua-600 hover:underline"
                      >
                        Make primary
                      </button>
                    )}
                    {f.images.length > 2 && (
                      <button
                        type="button"
                        onClick={() => up('images', f.images.filter((_, j) => j !== i))}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[100px,1fr]">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-50">
                    {img.url ? (
                      <Image src={img.url} alt="" fill sizes="100px" className="object-contain p-1"
                        onError={() => {}} unoptimized />
                    ) : (
                      <span className="grid h-full place-items-center text-2xl text-slate-300">🖼️</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      value={img.url}
                      onChange={(e) => up('images', f.images.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                      placeholder="/products/your-image.jpg"
                      className={inp}
                    />
                    <input
                      value={img.altText}
                      onChange={(e) => up('images', f.images.map((x, j) => j === i ? { ...x, altText: e.target.value } : x))}
                      placeholder="Alt text for SEO — describe the image"
                      className={inp}
                    />
                  </div>
                </div>
              </div>
            ))}

            {f.images.length < 5 && (
              <button
                type="button"
                onClick={() => up('images', [...f.images, { url: '', altText: '', isPrimary: false }])}
                className="w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-navy-600 hover:border-aqua-400 hover:bg-aqua-50"
              >
                + Add image ({f.images.length}/5)
              </button>
            )}
          </div>
        )}

        {/* ── SPECS ── */}
        {tab === 'Specs' && (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              These appear in the specification table on the product page.
            </p>
            {f.specifications.map((sp, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[130px,1fr,1fr,auto]">
                <select
                  value={sp.specGroup}
                  onChange={(e) => up('specifications', f.specifications.map((x, j) => j === i ? { ...x, specGroup: e.target.value } : x))}
                  className={inp}
                >
                  <option>General</option>
                  <option>Purification</option>
                  <option>Electrical</option>
                  <option>Dimensions</option>
                </select>
                <input
                  value={sp.specKey}
                  onChange={(e) => up('specifications', f.specifications.map((x, j) => j === i ? { ...x, specKey: e.target.value } : x))}
                  placeholder="Storage Capacity" className={inp}
                />
                <input
                  value={sp.specValue}
                  onChange={(e) => up('specifications', f.specifications.map((x, j) => j === i ? { ...x, specValue: e.target.value } : x))}
                  placeholder="8 Litres" className={inp}
                />
                <button
                  type="button"
                  onClick={() => up('specifications', f.specifications.filter((_, j) => j !== i))}
                  className="rounded-lg px-3 text-red-600 hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => up('specifications', [...f.specifications, { specGroup: 'General', specKey: '', specValue: '' }])}
              className="w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-navy-600 hover:border-aqua-400 hover:bg-aqua-50"
            >
              + Add specification
            </button>
          </div>
        )}

        {/* ── SEO ── */}
        {tab === 'SEO' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted">Google preview</p>
              <p className="truncate text-[15px] text-[#1a0dab]">{f.seo.metaTitle || f.name || 'Product title'}</p>
              <p className="truncate text-xs text-[#006621]">rokadoctor.in/products/{f.slug || 'slug'}</p>
              <p className="line-clamp-2 text-[13px] text-[#545454]">
                {f.seo.metaDescription || f.shortDescription || 'No description set'}
              </p>
            </div>

            <Field label="Meta Title" hint={`${f.seo.metaTitle.length} / 60 characters`} full>
              <input value={f.seo.metaTitle}
                onChange={(e) => up('seo', { ...f.seo, metaTitle: e.target.value })}
                placeholder="Auto-generated from product name if left blank" className={inp} />
            </Field>

            <Field label="Meta Description" hint={`${f.seo.metaDescription.length} / 155 characters`} full>
              <textarea rows={3} value={f.seo.metaDescription}
                onChange={(e) => up('seo', { ...f.seo, metaDescription: e.target.value })} className={inp} />
            </Field>

            <Field label="Keywords" hint="Comma separated" full>
              <input value={f.seo.metaKeywords}
                onChange={(e) => up('seo', { ...f.seo, metaKeywords: e.target.value })}
                placeholder="RO purifier, water purifier online, Kent RO price" className={inp} />
            </Field>
          </div>
        )}
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-aqua-500 px-7 py-3 font-bold text-white transition hover:bg-aqua-600 disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
        <button
          onClick={() => router.push('/admin/products')}
          className="rounded-xl border border-slate-200 px-6 py-3 font-bold text-navy-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        {f.status === 'DRAFT' && (
          <p className="text-sm text-muted">
            Status is <strong>Draft</strong> — set it to Active on the Basic tab to show it on the site.
          </p>
        )}
      </div>
    </div>
  );
}

const inp =
  'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100';

function Field({
  label, hint, error, required, full, children,
}: {
  label: string; hint?: string; error?: string; required?: boolean; full?: boolean; children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? 'md:col-span-2' : ''}`}>
      <span className="mb-1 block text-sm font-semibold text-navy-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
      {!error && hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-aqua-500 focus:ring-aqua-400"
      />
      <span className="text-sm text-navy-700">{label}</span>
    </label>
  );
}
