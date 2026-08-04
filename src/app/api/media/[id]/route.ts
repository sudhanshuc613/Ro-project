/**
 * Serves an uploaded image stored in Postgres.
 *
 * Public on purpose — these are product photos that appear on the storefront.
 * The URL is a UUID, so nothing is enumerable.
 *
 * Cached immutably: the filename is derived from a content hash, so the bytes
 * behind a given id can never change. Vercel's CDN then serves repeat hits
 * without ever waking a function.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const wantThumb = req.nextUrl.searchParams.get('size') === 'thumb';

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: params.id },
    select: {
      data: true,
      thumbData: true,
      mimeType: true,
      externalUrl: true,
      filename: true,
    },
  });

  if (!asset) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Migrated to Blob after the fact — send the caller to the CDN copy.
  if (asset.externalUrl) {
    return NextResponse.redirect(asset.externalUrl, 308);
  }

  const bytes = wantThumb ? (asset.thumbData ?? asset.data) : asset.data;
  if (!bytes) {
    return new NextResponse('Not found', { status: 404 });
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'Content-Type': wantThumb ? 'image/webp' : asset.mimeType,
      'Content-Length': String(bytes.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `inline; filename="${asset.filename}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
