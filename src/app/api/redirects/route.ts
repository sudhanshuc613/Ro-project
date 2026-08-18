/**
 * GET /api/redirects — the full redirect map, cached at the edge.
 *
 * Middleware runs on the Edge runtime where Prisma cannot run, so it cannot
 * query the `redirects` table directly. Instead the not-found page fetches
 * this route to see whether a dead URL has a mapped destination.
 *
 * Cached for 5 minutes: redirects change rarely, and a stale entry for a few
 * minutes is far cheaper than a DB hit on every 404.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const revalidate = 300;

export async function GET() {
  try {
    const rows = await prisma.redirect.findMany({
      select: { fromPath: true, toPath: true, statusCode: true },
      take: 2000,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      { redirects: rows },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    );
  } catch (err) {
    console.error('[api/redirects]', err);
    // Never break the site over a redirect lookup.
    return NextResponse.json({ redirects: [] });
  }
}
