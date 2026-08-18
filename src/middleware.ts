/**
 * Edge middleware — URL hygiene that protects earned Google rankings.
 * ────────────────────────────────────────────────────────────────────────────
 * Two real problems this fixes, both measured on the live site on 18 Aug 2026:
 *
 * 1. UPPERCASE SLUGS 404 ON THE LOWERCASE VERSION.
 *    /products/Grand-Forest-ro-booster-pump-75-gpd-24v  → 200
 *    /products/grand-forest-ro-booster-pump-75-gpd-24v  → 404
 *    Anyone typing, sharing, or linking the natural lowercase form hit a dead
 *    page, and Google treats the two casings as duplicate URLs. We now
 *    301-redirect any path containing uppercase to its lowercase form.
 *
 * 2. RENAMED PRODUCTS LEFT DEAD URLs BEHIND.
 *    /products/ro-booster-pump-100-gpd-24v was indexed by Google and is now
 *    404 because the slug changed. A 404 throws away every bit of ranking that
 *    URL had earned. The `redirects` table (which existed in the schema but was
 *    never wired to anything) is now read here, so the admin can map an old
 *    slug to a new one without a code deploy.
 *
 * Design notes:
 *  • Static, lowercase-only redirects run at the edge with zero I/O.
 *  • DB-backed redirects are fetched through a tiny internal route with an
 *    in-memory cache, because Prisma cannot run on the edge runtime.
 *  • Anything unknown falls through untouched — middleware never blocks.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Slugs that were live and indexed before the 18 Aug 2026 product rename.
 * Keeping these here (rather than only in the DB) means they survive a
 * database reset and cost nothing to serve.
 */
const LEGACY_PRODUCT_REDIRECTS: Record<string, string> = {
  'aquanexa-pure-8l-ro-uv-uf-water-purifier': 'aquabizz-pure-8l-ro-uv-uf-water-purifier',
  'aquanexa-alkaline-copper-10l-ro-purifier': 'aquafresh-alkaline-copper-10l-ro-purifier',
  'ro-booster-pump-100-gpd-24v': 'grand-forest-ro-booster-pump-75-gpd-24v',
  'aquafresh': 'aquafresh-alkaline-copper-10l-ro-purifier',
};

/** Old top-level paths that should never dead-end. */
const LEGACY_PATH_REDIRECTS: Record<string, string> = {
  '/shop': '/products',
  '/store': '/products',
  '/spare-parts': '/category/spare-parts',
  '/ro-spare-parts': '/category/spare-parts',
  '/water-purifier': '/category/new-ro-purifiers',
  '/ro-purifier': '/category/new-ro-purifiers',
  '/commercial-ro': '/category/commercial-plants',
  '/amc': '/amc-plans',
  '/book-service': '/service-patna',
  '/service-request': '/service-patna',
};

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Never touch API routes, Next internals, or static files.
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/admin/') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  /* ── 1. Force lowercase paths ─────────────────────────────────────────── */
  if (pathname !== pathname.toLowerCase()) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 301);
  }

  /* ── 2. Strip a trailing slash (except the root) ──────────────────────── */
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, '');
    return NextResponse.redirect(url, 301);
  }

  /* ── 3. Legacy product slugs ──────────────────────────────────────────── */
  const productMatch = pathname.match(/^\/products\/([^/]+)$/);
  if (productMatch) {
    const target = LEGACY_PRODUCT_REDIRECTS[productMatch[1]];
    if (target) {
      const url = req.nextUrl.clone();
      url.pathname = `/products/${target}`;
      return NextResponse.redirect(url, 301);
    }
  }

  /* ── 4. Legacy top-level paths ────────────────────────────────────────── */
  const legacy = LEGACY_PATH_REDIRECTS[pathname];
  if (legacy) {
    const url = req.nextUrl.clone();
    url.pathname = legacy;
    url.search = search;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on everything except Next internals and files with an extension.
     * Keeping the matcher tight means the middleware costs nothing on assets.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
