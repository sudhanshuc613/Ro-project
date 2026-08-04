/**
 * POST /api/admin/media   — upload an image from the admin's computer
 * GET  /api/admin/media   — list the media library (for the picker)
 *
 * Accepts multipart/form-data so a plain <input type="file"> works, including
 * the phone camera on Android/iOS.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  uploadImage, listMedia, deleteMedia,
  UploadError, MAX_UPLOAD_BYTES, ACCEPTED_MIME,
} from '@/server/services/media.service';
import { logAudit } from '@/server/services/audit.service';

export const runtime = 'nodejs';
// Compressing a 12 MB photo takes a few seconds; the default 10s can be tight.
export const maxDuration = 60;

function guard(role?: string) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'STAFF';
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const folder = req.nextUrl.searchParams.get('folder') ?? undefined;
  return NextResponse.json({ items: await listMedia(folder) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { message: 'Send the file as multipart/form-data.' },
      { status: 400 },
    );
  }

  const files = form.getAll('file').filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ message: 'No file received.' }, { status: 400 });
  }
  if (files.length > 10) {
    return NextResponse.json(
      { message: 'Upload at most 10 images at a time.' },
      { status: 400 },
    );
  }

  const folder = (form.get('folder') as string) || 'products';
  const altText = (form.get('altText') as string) || undefined;
  // Explicit opt-out — we never shrink an image unless asked to.
  const compress = form.get('compress') !== 'false';

  const results = [];
  const failures = [];

  for (const file of files) {
    try {
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new UploadError(
          `${file.name} is ${(file.size / 1048576).toFixed(1)} MB — limit is ${MAX_UPLOAD_BYTES / 1048576} MB.`,
        );
      }
      if (!ACCEPTED_MIME.includes(file.type)) {
        throw new UploadError(`${file.name}: ${file.type || 'unknown type'} is not an accepted image.`);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadImage({
        buffer,
        filename: file.name,
        mimeType: file.type,
        altText,
        folder,
        compress,
        userId: session?.user?.id,
      });
      results.push(result);
    } catch (err) {
      failures.push({
        filename: file.name,
        message: err instanceof UploadError ? err.message : 'Upload failed.',
      });
      if (!(err instanceof UploadError)) console.error('[media] upload error:', err);
    }
  }

  if (results.length > 0) {
    await logAudit({
      actorId: session?.user?.id,
      action: 'media.upload',
      entityType: 'MEDIA',
      afterData: { count: results.length, ids: results.map((r) => r.id) },
    });
  }

  if (results.length === 0) {
    return NextResponse.json(
      { message: failures[0]?.message ?? 'Upload failed.', failures },
      { status: 400 },
    );
  }

  return NextResponse.json({ uploaded: results, failures }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

  try {
    await deleteMedia(id);
  } catch {
    return NextResponse.json({ message: 'Image not found' }, { status: 404 });
  }

  await logAudit({
    actorId: session?.user?.id,
    action: 'media.delete',
    entityType: 'MEDIA',
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
