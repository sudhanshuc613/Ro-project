/**
 * Image upload pipeline for the admin panel.
 *
 * ── THE CONSTRAINT WE ARE WORKING AROUND ──────────────────────────────────
 * On Vercel the filesystem is READ-ONLY at runtime. You cannot write into
 * public/ after the build — the file appears to save, then 404s. Next.js
 * maintainers confirm this: "you cannot dynamically add more images to the
 * public folder and have them accessible to the end user"
 * (github.com/vercel/next.js/discussions/13351).
 *
 * ── OUR SOLUTION: TWO BACKENDS, PICKED AUTOMATICALLY ──────────────────────
 *  1. BLOB_READ_WRITE_TOKEN present → upload to Vercel Blob (real CDN).
 *  2. No token → store WebP bytes in Postgres, serve via /api/media/[id]
 *     with immutable cache headers.
 *
 * Option 2 means uploads work the moment the owner logs in — no account, no
 * card, no env var. Switching to Blob later needs no code change and does not
 * break any product that already points at /api/media/<id>.
 *
 * ── WHY WEBP ──────────────────────────────────────────────────────────────
 * A phone photo is 3-6 MB. Stored raw that is slow to serve and eats the
 * Neon free tier (512 MB). sharp resizes to max 1600px and encodes WebP at
 * q82 → typically 150-250 KB, visually identical on a product page.
 * A 400px thumbnail is generated in the same pass for list views.
 *
 * NOTE: this only compresses images the ADMIN UPLOADS through the panel.
 * Files already in public/ are never touched.
 */
import crypto from 'node:crypto';
import sharp from 'sharp';
import { prisma } from '@/lib/db/prisma';

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12 MB in, ~200 KB out
export const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/** Longest edge for the display image. 1600 covers 2x retina on a 800px card. */
const MAX_EDGE = 1600;
const THUMB_EDGE = 400;
const WEBP_QUALITY = 82;

export interface UploadResult {
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

export class UploadError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Validate → compress → dedupe → store.
 *
 * @param compress  false keeps the original bytes untouched (owner's choice —
 *                  we never silently degrade an image they care about).
 */
export async function uploadImage(opts: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  altText?: string;
  folder?: string;
  userId?: string;
  compress?: boolean;
}): Promise<UploadResult> {
  const { buffer, filename, mimeType, userId } = opts;
  const folder = opts.folder ?? 'products';
  const compress = opts.compress ?? true;
  const originalBytes = buffer.length;

  if (!ACCEPTED_MIME.includes(mimeType)) {
    throw new UploadError(
      `${mimeType} is not supported. Use JPG, PNG, WebP or AVIF.`,
    );
  }
  if (originalBytes > MAX_UPLOAD_BYTES) {
    throw new UploadError(
      `File is ${(originalBytes / 1048576).toFixed(1)} MB. Maximum is ${MAX_UPLOAD_BYTES / 1048576} MB.`,
    );
  }

  // Verify it is genuinely an image — a renamed .exe would fail here.
  let meta: sharp.Metadata;
  try {
    meta = await sharp(buffer).metadata();
  } catch {
    throw new UploadError('That file is not a readable image.');
  }
  if (!meta.width || !meta.height) {
    throw new UploadError('Could not read the image dimensions.');
  }

  let out = buffer;
  let outMime = mimeType;
  let width = meta.width;
  let height = meta.height;

  if (compress) {
    const pipeline = sharp(buffer)
      .rotate() // honour EXIF orientation — phone photos are often sideways
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY });

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    out = data;
    outMime = 'image/webp';
    width = info.width;
    height = info.height;
  }

  const thumb = await sharp(buffer)
    .rotate()
    .resize({ width: THUMB_EDGE, height: THUMB_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  // Content hash → re-uploading the same photo reuses the existing row
  // instead of doubling storage.
  const checksum = crypto.createHash('sha256').update(out).digest('hex');
  const existing = await prisma.mediaAsset.findUnique({ where: { checksum } });
  if (existing) {
    return {
      id: existing.id,
      url: existing.externalUrl ?? `/api/media/${existing.id}`,
      width: existing.width ?? width,
      height: existing.height ?? height,
      bytes: existing.bytes,
      originalBytes,
      savedPercent: Math.max(0, Math.round((1 - existing.bytes / originalBytes) * 100)),
      storage: existing.externalUrl ? 'blob' : 'database',
      deduped: true,
    };
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 200);
  let externalUrl: string | null = null;

  if (isBlobConfigured()) {
    try {
      // Imported lazily so the package is only required when actually used.
      const { put } = (await import('@vercel/blob')) as typeof import('@vercel/blob');
      const ext = outMime === 'image/webp' ? 'webp' : safeName.split('.').pop() || 'jpg';
      const blob = await put(`${folder}/${checksum.slice(0, 16)}.${ext}`, out, {
        access: 'public',
        contentType: outMime,
        addRandomSuffix: false,
      });
      externalUrl = blob.url;
    } catch (err) {
      // Blob failed (bad token, quota) — fall through to DB rather than
      // losing the owner's upload.
      console.error('[media] Blob upload failed, storing in database:', err);
    }
  }

  const asset = await prisma.mediaAsset.create({
    data: {
      filename: safeName,
      mimeType: outMime,
      bytes: out.length,
      width,
      height,
      data: externalUrl ? null : out,
      thumbData: thumb,
      externalUrl,
      altText: opts.altText?.slice(0, 200) ?? null,
      folder,
      checksum,
      uploadedBy: userId ?? null,
    },
    select: { id: true },
  });

  return {
    id: asset.id,
    url: externalUrl ?? `/api/media/${asset.id}`,
    width,
    height,
    bytes: out.length,
    originalBytes,
    savedPercent: Math.max(0, Math.round((1 - out.length / originalBytes) * 100)),
    storage: externalUrl ? 'blob' : 'database',
    deduped: false,
  };
}

/** Recent uploads for the media library picker. */
export async function listMedia(folder?: string, take = 60) {
  const rows = await prisma.mediaAsset.findMany({
    where: folder ? { folder } : undefined,
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true, filename: true, altText: true, bytes: true,
      width: true, height: true, externalUrl: true, createdAt: true,
    },
  });
  return rows.map((r) => ({
    ...r,
    url: r.externalUrl ?? `/api/media/${r.id}`,
    thumbUrl: r.externalUrl ?? `/api/media/${r.id}?size=thumb`,
  }));
}

export async function deleteMedia(id: string) {
  await prisma.mediaAsset.delete({ where: { id } });
}
