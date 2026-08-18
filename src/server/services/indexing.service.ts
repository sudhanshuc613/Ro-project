/**
 * INDEXING SERVICE — tell search engines about a URL the moment it changes.
 * ────────────────────────────────────────────────────────────────────────────
 * The question this answers: "when I add a product, do I have to go to Google
 * and submit the URL by hand every time?"
 *
 * Partly. Here is the honest 2026 position, verified against current sources:
 *
 *  • IndexNow  — free, no auth beyond a key file, one POST covers Bing,
 *                Yandex, Naver, Seznam and Yep. 22% of clicked Bing URLs now
 *                arrive via IndexNow. Bing's index also feeds ChatGPT Search,
 *                Copilot and Perplexity, so this is the fastest route into AI
 *                answers. **Google does NOT participate** — tested 2021-22,
 *                never adopted. Anyone selling "IndexNow for Google" is
 *                describing a Bing ping.
 *
 *  • Google    — has no open push protocol. The Indexing API is officially
 *                limited to JobPosting and BroadcastEvent. What actually works
 *                for a product page: a fresh sitemap with an accurate
 *                <lastmod>, strong internal linking, and Search Console URL
 *                Inspection for the handful of pages that matter most.
 *
 * So this service does two things automatically on every product publish:
 *   1. Pings IndexNow  → Bing, Yandex, Naver, Seznam (instant, free)
 *   2. Revalidates the sitemap so Google's next crawl sees the new URL
 *      with a correct lastmod, rather than waiting up to an hour.
 *
 * Everything is fire-and-forget. An indexing ping must never be able to fail
 * a product save.
 */
import { BRAND } from '@/lib/constants';

/**
 * IndexNow key. Any 8–128 character hex string works; it only has to match the
 * file served at /{key}.txt. Falls back to a fixed default so the feature works
 * out of the box without env configuration.
 */
export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY ?? 'a7f3c9e2b8d1456c4e8a1b6d29f375e0';

export interface IndexPingResult {
  indexnow: { ok: boolean; status?: number; message: string };
  submitted: string[];
}

/** Absolute URL for a path, with no trailing slash. */
function abs(path: string): string {
  const clean = path.startsWith('http') ? path : `${BRAND.url}${path.startsWith('/') ? path : `/${path}`}`;
  return clean.replace(/\/+$/, '') || BRAND.url;
}

/**
 * Push URLs to IndexNow. Covers Bing, Yandex, Naver, Seznam and Yep in one
 * call — they share submissions between themselves.
 *
 * Limit is 10,000 URLs per request; we cap far below that.
 */
export async function pingIndexNow(paths: string[]): Promise<IndexPingResult> {
  const urlList = [...new Set(paths.map(abs))].slice(0, 100);

  if (urlList.length === 0) {
    return { indexnow: { ok: false, message: 'No URLs supplied' }, submitted: [] };
  }

  const host = new URL(BRAND.url).host;
  const body = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${BRAND.url}/${INDEXNOW_KEY}.txt`,
    urlList,
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
      // Never let a slow third party hold up an admin save.
      signal: AbortSignal.timeout(8000),
    });

    // 200 = accepted, 202 = accepted, key validation pending.
    const ok = res.status === 200 || res.status === 202;
    return {
      indexnow: {
        ok,
        status: res.status,
        message: ok
          ? `${urlList.length} URL Bing/Yandex/Naver/Seznam ko bhej diye`
          : `IndexNow ne ${res.status} diya — key file check karo`,
      },
      submitted: urlList,
    };
  } catch (err) {
    return {
      indexnow: {
        ok: false,
        message: `IndexNow tak pahunch nahi paye: ${(err as Error).message}`,
      },
      submitted: urlList,
    };
  }
}

/**
 * Full publish notification for one product.
 * Pings the product URL plus the pages that list it, since those change too.
 */
export async function notifyProductPublished(
  slug: string,
  categorySlug?: string,
): Promise<IndexPingResult> {
  const paths = [
    `/products/${slug}`,
    '/products',
    ...(categorySlug ? [`/category/${categorySlug}`] : []),
  ];
  return pingIndexNow(paths);
}

/**
 * What the admin still has to do by hand for Google, and why.
 * Rendered in the admin UI so the limits are visible rather than surprising.
 */
export const GOOGLE_INDEXING_FACTS = {
  indexNowSupported: false,
  indexingApiScope: 'JobPosting and BroadcastEvent only — not product pages',
  urlInspectionQuota: '2,000 checks/day per property (checking, not submitting)',
  manualRequestLimit: 'Roughly 10–12 "Request indexing" clicks per day in Search Console',
  whatActuallyWorks: [
    'Keep the sitemap fresh with an accurate lastmod — this is Google\'s own recommended change signal',
    'Link the new product from /products and its category page (already automatic)',
    'Use Search Console → URL Inspection → Request indexing for genuinely important pages only',
    'Give it 3–14 days. New pages on a small site are not indexed instantly, and that is normal',
  ],
} as const;
