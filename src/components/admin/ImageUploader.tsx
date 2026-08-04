'use client';

/**
 * Drag-and-drop image uploader for the admin panel.
 *
 * Handles the three ways a shop owner actually adds a photo:
 *   1. Drag a file from the desktop onto the box
 *   2. Click and pick from the file dialog
 *   3. On a phone — "Take photo" opens the camera directly
 * Plus Ctrl+V paste, which is how anyone who just cropped a screenshot works.
 *
 * Shows live progress and the real compression result ("4.2 MB → 210 KB,
 * 95% smaller") so the owner can see nothing was silently mangled, and can
 * turn compression off if they want the original bytes kept.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

export interface UploadedImage {
  id: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  originalBytes: number;
  savedPercent: number;
  storage: 'blob' | 'database';
  deduped: boolean;
}

function prettyBytes(n: number) {
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

export default function ImageUploader({
  folder = 'products',
  multiple = true,
  onUploaded,
  compact = false,
}: {
  folder?: string;
  multiple?: boolean;
  onUploaded: (images: UploadedImage[]) => void;
  compact?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compress, setCompress] = useState(true);
  const [lastResult, setLastResult] = useState<UploadedImage[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  const send = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const images = files.filter((f) => f.type.startsWith('image/'));
      if (images.length === 0) {
        toast.error('Only image files (JPG, PNG, WebP) can be uploaded.');
        return;
      }
      if (images.length < files.length) {
        toast.warning(`${files.length - images.length} non-image file(s) skipped.`);
      }

      setBusy(true);
      setProgress(0);
      setLastResult(null);

      const body = new FormData();
      for (const f of images.slice(0, 10)) body.append('file', f);
      body.append('folder', folder);
      body.append('compress', String(compress));

      try {
        // XHR rather than fetch — fetch still has no upload progress event,
        // and a 12 MB photo on Patna 4G needs a visible progress bar.
        const result = await new Promise<{ uploaded: UploadedImage[]; failures?: { filename: string; message: string }[] }>(
          (resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/admin/media');
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
            };
            xhr.onload = () => {
              let parsed: unknown;
              try {
                parsed = JSON.parse(xhr.responseText);
              } catch {
                reject(new Error('Server sent an unreadable response.'));
                return;
              }
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(parsed as { uploaded: UploadedImage[] });
              } else {
                reject(new Error((parsed as { message?: string }).message ?? 'Upload failed.'));
              }
            };
            xhr.onerror = () => reject(new Error('Network error — check your connection.'));
            xhr.ontimeout = () => reject(new Error('Upload timed out.'));
            xhr.timeout = 120000;
            xhr.send(body);
          },
        );

        setLastResult(result.uploaded);
        onUploaded(result.uploaded);

        const totalIn = result.uploaded.reduce((s, r) => s + r.originalBytes, 0);
        const totalOut = result.uploaded.reduce((s, r) => s + r.bytes, 0);
        const saved = totalIn > 0 ? Math.round((1 - totalOut / totalIn) * 100) : 0;

        toast.success(
          compress && saved > 0
            ? `${result.uploaded.length} image(s) uploaded — ${prettyBytes(totalIn)} → ${prettyBytes(totalOut)} (${saved}% smaller)`
            : `${result.uploaded.length} image(s) uploaded`,
        );

        for (const f of result.failures ?? []) toast.error(`${f.filename}: ${f.message}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed.');
      } finally {
        setBusy(false);
        setProgress(0);
      }
    },
    [folder, compress, onUploaded],
  );

  /* Paste support — Ctrl+V a screenshot straight into the zone. */
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!zoneRef.current) return;
      const items = Array.from(e.clipboardData?.items ?? []);
      const files = items
        .filter((i) => i.kind === 'file' && i.type.startsWith('image/'))
        .map((i) => i.getAsFile())
        .filter((f): f is File => Boolean(f));
      if (files.length) {
        e.preventDefault();
        void send(files);
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [send]);

  return (
    <div className="space-y-3">
      <div
        ref={zoneRef}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void send(Array.from(e.dataTransfer.files));
        }}
        onClick={() => !busy && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed text-center transition ${
          compact ? 'p-5' : 'p-8'
        } ${
          dragging
            ? 'border-aqua-500 bg-aqua-50 ring-4 ring-aqua-100'
            : busy
              ? 'border-slate-200 bg-slate-50'
              : 'border-slate-300 bg-slate-50/60 hover:border-aqua-400 hover:bg-aqua-50/40'
        }`}
      >
        {busy ? (
          <div className="space-y-3">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-aqua-200 border-t-aqua-600" />
            <p className="text-sm font-semibold text-navy-700">
              {progress < 100 ? `Uploading… ${progress}%` : 'Compressing…'}
            </p>
            <div className="mx-auto h-1.5 w-52 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-aqua-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress === 100 && (
              <p className="text-xs text-muted">Making it web-ready, few seconds…</p>
            )}
          </div>
        ) : (
          <>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <svg className="h-6 w-6 text-aqua-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-bold text-navy-700">
              Drag photo here, or <span className="text-aqua-600 underline">click to browse</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              JPG · PNG · WebP · up to 12 MB {multiple && '· multiple allowed'} · Ctrl+V works too
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraRef.current?.click();
                }}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-navy-700 ring-1 ring-slate-200 hover:bg-slate-50 sm:hidden"
              >
                📷 Take photo
              </button>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          hidden
          onChange={(e) => {
            void send(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            void send(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
      </div>

      {/* Compression toggle — the owner stays in control of their own files */}
      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
        <input
          type="checkbox"
          checked={compress}
          onChange={(e) => setCompress(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-aqua-600 focus:ring-aqua-500"
        />
        <span className="text-xs leading-relaxed">
          <span className="font-bold text-navy-700">Make web-ready (recommended)</span>
          <span className="block text-muted">
            Resizes to 1600px and converts to WebP — a 4 MB phone photo becomes ~200 KB and the
            page loads much faster on mobile data. Uncheck to keep the original file exactly as it is.
          </span>
        </span>
      </label>

      {/* Honest result readout */}
      {lastResult && lastResult.length > 0 && (
        <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
          <p className="text-xs font-bold text-emerald-900">Uploaded</p>
          <ul className="mt-1.5 space-y-1">
            {lastResult.map((r) => (
              <li key={r.id} className="flex items-center gap-2 text-xs text-emerald-800">
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-white">
                  <Image src={r.url} alt="" fill sizes="32px" className="object-cover" unoptimized />
                </span>
                <span>
                  {r.width}×{r.height} · {prettyBytes(r.originalBytes)} → <strong>{prettyBytes(r.bytes)}</strong>
                  {r.savedPercent > 0 && <> ({r.savedPercent}% smaller)</>}
                  {r.deduped && <span className="ml-1 text-emerald-600">· already had this one, reused</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
