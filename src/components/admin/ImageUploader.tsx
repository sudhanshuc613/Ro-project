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
import { prepareImageForUpload, prettySize } from '@/lib/images/prepare-upload';

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
  targetW,
  targetH,
  fit = 'cover',
}: {
  folder?: string;
  multiple?: boolean;
  onUploaded: (images: UploadedImage[]) => void;
  compact?: boolean;
  /** Slot ki asli size — di gayi to image bhejne se PEHLE isi ratio me cut hogi. */
  targetW?: number;
  targetH?: number;
  fit?: 'cover' | 'contain';
}) {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compress, setCompress] = useState(true);
  const [lastResult, setLastResult] = useState<UploadedImage[] | null>(null);
  const [prepping, setPrepping] = useState(false);
  const [prepNote, setPrepNote] = useState<string | null>(null);
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
      setPrepNote(null);

      /* ── 🔴 11 Oct 2026 — BHEJNE SE PEHLE BROWSER ME HI CHHOTA KARO ──────
         Owner ka 6.6 MB ka banner "Server sent an unreadable response" de
         raha tha. Wajah Vercel ka 4.5 MB request limit tha — file hamare
         code tak pahunchti hi nahi thi. Ab yahin 200-350 KB ki ban jaati
         hai, aur saath me slot ka theek ratio bhi cut ho jaata hai. */
      let toSend = images.slice(0, 10);
      if (targetW && targetH) {
        setPrepping(true);
        try {
          const prepared = await Promise.all(
            toSend.map((f) => prepareImageForUpload(f, { targetWidth: targetW, targetHeight: targetH, fit })),
          );
          const inB = prepared.reduce((a, r) => a + r.originalBytes, 0);
          const outB = prepared.reduce((a, r) => a + r.bytes, 0);
          const anyCrop = prepared.some((r) => r.cropped);
          const skipped = prepared.filter((r) => r.skipped);
          toSend = prepared.map((r) => r.file);
          if (skipped.length === 0) {
            setPrepNote(
              `${prettySize(inB)} → ${prettySize(outB)} · ${targetW}×${targetH} me set` +
                (anyCrop ? ' (ratio ke liye kinare thode cut hue)' : ''),
            );
          } else {
            setPrepNote(`${skipped.length} file browser me taiyaar nahi ho payi — waise hi bheji ja rahi hai`);
          }
        } catch {
          /* taiyaari fail ho to original hi bhejo — upload rukna nahi chahiye */
        } finally {
          setPrepping(false);
        }
      }

      const tooBig = toSend.find((f) => f.size > 4_000_000);
      if (tooBig) {
        toast.error(
          `${tooBig.name} abhi bhi ${prettySize(tooBig.size)} ki hai. Hosting 4.5 MB se badi file nahi leti — ` +
            'thodi chhoti image chunein ya screenshot leke upload karein.',
        );
        setBusy(false);
        return;
      }

      const body = new FormData();
      for (const f of toSend) body.append('file', f);
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
                /* 🔴 Server ne JSON nahi, HTML/khaali bheja. Pehle yahan bas
                   "Server sent an unreadable response" likha tha, jisse kuch
                   pata hi nahi chalta tha. Ab HTTP code se asli wajah batate
                   hain — 90% baar ye file ka bada hona hota hai. */
                const code = xhr.status;
                let why: string;
                if (code === 413) why = 'File hosting ki 4.5 MB limit se badi hai. Chhoti image chunein.';
                else if (code === 504 || code === 408) why = 'Server ne jawab dene me bahut der lagai. Dobara koshish karein.';
                else if (code === 502 || code === 503) why = 'Server abhi busy hai. 10 second baad dobara try karein.';
                else if (code === 401 || code === 403) why = 'Login khatm ho gaya. Page refresh karke dobara login karein.';
                else if (code === 0) why = 'Internet beech me toot gaya. Connection check karke dobara bhejein.';
                else why = `Server ne HTTP ${code} bheja (JSON nahi). Dobara koshish karein, phir bhi na ho to batayein.`;
                reject(new Error(why));
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
              JPG · PNG · WebP · AVIF {multiple && '· multiple allowed'} · Ctrl+V works too
            </p>
            {targetW && targetH ? (
              <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                ✅ Kitni bhi badi photo chalegi — yahin {targetW}×{targetH} me set hokar halki ho jaayegi
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-muted">4.5 MB tak ki file (hosting ki limit)</p>
            )}

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

        {prepping && (
          <p className="mb-2 text-xs font-semibold text-aqua-700">Image taiyaar ki ja rahi hai…</p>
        )}
        {prepNote && !busy && (
          <p className="mb-2 text-xs font-semibold text-emerald-700">✅ {prepNote}</p>
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
