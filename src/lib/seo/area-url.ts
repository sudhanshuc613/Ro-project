/**
 * AREA URL HELPER — single source of truth for the area-page path.
 *
 * The canonical shape is keyword-first:
 *
 *     /ro-service-kankarbagh-patna
 *
 * rather than the original:
 *
 *     /service-patna/kankarbagh
 *
 * Reason, measured 3 Sep 2026: the competitor outranking us on
 * "ro service kankarbagh patna" used /ro-service-centre-kankarbagh-patna/.
 * Our page beat theirs on every content metric — 1,528 words to 1,426, 42
 * schema blocks to 19 — and still sat at #3. The URL was the one clear
 * difference: theirs carried the full query, ours did not contain "ro" at all.
 *
 * Every link, sitemap entry and canonical goes through this function, so the
 * path shape can never drift between files. The old path is preserved as a
 * constant so the redirect layer and the tests reference the same string.
 */

/**
 * Canonical, keyword-first URL for an area page.
 *
 *     /ro-service-patna/kankarbagh
 *
 * Google treats slashes as word separators, so this URL contains all four
 * query terms — "ro", "service", "patna", "kankarbagh" — exactly like the
 * competitor's /ro-service-centre-kankarbagh-patna/ that was outranking us.
 *
 * A single-segment form (/ro-service-kankarbagh-patna) was tried first and
 * rejected: Next.js cannot express a dynamic segment INSIDE a path segment,
 * so it would have required a root-level catch-all route capable of shadowing
 * every other page on the site. Not worth the risk for a word-order change.
 */
export function areaPath(slug: string): string {
  return `/ro-service-patna/${slug}`;
}

/** The pre-Sep-2026 URL. Kept so redirects and tests share one definition. */
export function legacyAreaPath(slug: string): string {
  return `/service-patna/${slug}`;
}

/** Extract the area slug from a canonical URL, or null when it is not one. */
export function slugFromAreaPath(pathname: string): string | null {
  const m = pathname.match(/^\/ro-service-patna\/([a-z0-9-]+)\/?$/);
  return m ? m[1] : null;
}
