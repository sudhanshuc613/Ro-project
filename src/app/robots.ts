import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/constants';

/**
 * robots.txt
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 FIX, 10 SEP 2026 — PRODUCT IMAGES WERE BLOCKED FROM GOOGLE
 * ─────────────────────────────────────────────────────────────
 * Search Console reported 10 pages "Blocked by robots.txt", all of the shape:
 *
 *     https://rokadoctor.in/api/media/0ab4d493-80c7-4b79-8681-d71de0ce2707
 *
 * Those are not API endpoints in the usual sense. `/api/media/[id]` is how
 * every uploaded product photo is served — Vercel's filesystem is read-only at
 * runtime, so images live in Postgres and stream through that route. Measured
 * on the live /products page: 48 of the 60 images come from /api/media.
 *
 * The blanket `Disallow: /api/*` therefore told Google it may not fetch a
 * single product photograph. Two consequences, both bad:
 *
 *   1. Zero eligibility for Google Images and the image thumbnails that appear
 *      beside shopping-intent results.
 *   2. The Product schema on every product page lists its `image` as an
 *      /api/media URL. Google's structured-data guidance requires the image to
 *      be crawlable; an uncrawlable image can invalidate the Product rich
 *      result entirely.
 *
 * The fix is an explicit Allow for the media path placed BEFORE the broader
 * api disallow. Per the robots exclusion protocol, when multiple rules match a
 * URL the most specific one wins, so `/api/media/` is allowed while the rest
 * of /api stays blocked.
 *
 * Deliberately still blocked:
 *   /api/*        — checkout, auth, admin, service-request endpoints. Nothing
 *                   there is a page, and crawling them wastes crawl budget.
 *   /admin, /account, /cart, /checkout — private or transactional.
 *   ?sort= and ?page= — infinite filter permutations of the same catalogue.
 *
 * ⚠️ Cloudflare injects its own managed block ahead of this file (verified
 * live 9 Sep 2026) which disallows AI training crawlers — GPTBot, ClaudeBot,
 * CCBot, Google-Extended. Googlebot, Bingbot, OAI-SearchBot and PerplexityBot
 * are all still allowed, so search and AI-search retrieval are unaffected.
 * That block is edited in the Cloudflare dashboard, not here.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          /* Product photography. Must come before the /api/* disallow —
             48 of 60 catalogue images are served from this route. */
          '/api/media/',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/account',
          '/account/*',
          '/checkout',
          '/checkout/*',
          '/cart',
          '/api/*',
          '/*?*sort=',      // avoid crawling filter permutations
          '/*?*page=',
        ],
      },
      /* Image crawler gets the media route spelled out again. Googlebot-Image
         follows the same rules as Googlebot, but being explicit here means a
         future edit to the wildcard block cannot silently de-list the
         catalogue photos a second time. */
      { userAgent: 'Googlebot-Image', allow: ['/', '/api/media/'] },
      { userAgent: 'GPTBot', allow: '/' },
    ],
    sitemap: `${BRAND.url}/sitemap.xml`,
    host: BRAND.url,
  };
}
