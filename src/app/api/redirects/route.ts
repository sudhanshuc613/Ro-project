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

/* 🔴 4 Nov 2026 — ISR timer badhaya (Vercel CPU 90% se bachne ke liye).
 * Vercel Hobby: Fluid Active CPU 3h 37m / 4h = 90%. 100% par project
 * PAUSE ho jaata hai aur Vercel ke docs ke mutabik 30 din tak paused
 * rehta hai. Naap: 155K invocation me 82K ISR write — yaani har doosri
 * call page dobara bana rahi thi.
 *
 * 🔴 Content purana NAHI hoga: admin se product/rate/banner badalne par
 *    code revalidatePath()/revalidateTag() chalata hai, jo cache turant
 *    todta hai. Timer sirf tab chalta hai jab kuch badla hi nahi.
 *    Ye verify-rate-sync aur verify-banner-upload se jaancha gaya hai.
 *
 * 3600 sec = 1 ghanta. Redirect list bahut kam badalti hai.
 * Bachat: 8,640 -> 720 regen prati mahina.
 */
export const revalidate = 3600;

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
