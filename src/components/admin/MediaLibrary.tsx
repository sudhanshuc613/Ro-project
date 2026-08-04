'use client';

/**
 * Media Library grid — upload, preview, copy link, delete.
 *
 * "Copy link" matters: it lets the owner reuse an uploaded photo anywhere a
 * URL is accepted (banner setting, brand logo, a product's image field)
 * without re-uploading the same file.
 */
import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import ImageUploader, { type UploadedImage } from './ImageUploader';

interface Item {
  id: string;
  filename: string;
  altText: string | null;
  bytes: number;
  width: number | null;
  height: number | null;
  url: string;
  thumbUrl: string;
  externalUrl: string | null;
  createdAt: Date | string;
}

function prettyBytes(n: number) {
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

export default function MediaLibrary({
  initialItems,
  totalBytes,
}: {
  initialItems: Item[];
  totalBytes: number;
}) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);

  function onUploaded(uploaded: UploadedImage[]) {
    setItems((prev) => {
      const fresh = uploaded
        .filter((u) => !prev.some((p) => p.id === u.id))
        .map<Item>((u) => ({
          id: u.id,
          filename: 'Uploaded just now',
          altText: null,
          bytes: u.bytes,
          width: u.width,
          height: u.height,
          url: u.url,
          thumbUrl: u.storage === 'blob' ? u.url : `/api/media/${u.id}?size=thumb`,
          externalUrl: u.storage === 'blob' ? u.url : null,
          createdAt: new Date(),
        }));
      return [...fresh, ...prev];
    });
  }

  async function copyLink(url: string) {
    const absolute = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    try {
      await navigator.clipboard.writeText(absolute);
      toast.success('Link copied');
    } catch {
      // Clipboard API needs HTTPS + permission; show the URL so it is still usable
      toast.info(absolute);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this image? Any product still using it will show a broken image.')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setItems((p) => p.filter((i) => i.id !== id));
      toast.success('Image deleted');
    } catch {
      toast.error('Could not delete');
    } finally {
      setBusyId(null);
    }
  }

  const liveBytes = items.reduce((s, i) => s + i.bytes, 0) || totalBytes;

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <ImageUploader folder="products" multiple onUploaded={onUploaded} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy-700">
          {items.length} image{items.length === 1 ? '' : 's'}
          <span className="ml-2 font-normal text-muted">· {prettyBytes(liveBytes)} total</span>
        </p>
        {liveBytes > 200 * 1024 * 1024 && (
          <p className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
            ⚠️ Over 200 MB — consider adding a Vercel Blob token so images move to the CDN
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-200 py-16 text-center">
          <p className="text-4xl">🖼️</p>
          <p className="mt-3 font-semibold text-navy-700">No images yet</p>
          <p className="mt-1 text-sm text-muted">Drag a photo into the box above to get started.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((it) => (
            <li key={it.id} className="card-hover group overflow-hidden">
              <div className="relative aspect-square bg-sand-200">
                <Image
                  src={it.thumbUrl}
                  alt={it.altText ?? it.filename}
                  fill
                  sizes="(max-width:640px) 50vw, 20vw"
                  className="object-cover"
                  unoptimized
                />
                {it.externalUrl && (
                  <span className="absolute right-2 top-2 rounded-md bg-navy-700/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    CDN
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-semibold text-navy-700" title={it.filename}>
                  {it.filename}
                </p>
                <p className="tnum mt-0.5 text-[11px] text-muted">
                  {it.width}×{it.height} · {prettyBytes(it.bytes)}
                </p>
                <div className="mt-2.5 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyLink(it.url)}
                    className="flex-1 rounded-lg bg-navy-50 px-2 py-1.5 text-[11px] font-bold text-navy-700 transition hover:bg-navy-100"
                  >
                    Copy link
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    disabled={busyId === it.id}
                    className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {busyId === it.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
