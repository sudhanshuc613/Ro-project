/**
 * Redirect lookup — protects ranking when a URL changes.
 *
 * The `redirects` table has existed in the schema since day one but nothing
 * ever read from it. Now every renamed product writes a row, and the product
 * page consults this helper before returning a 404.
 *
 * Why it matters, measured on the live site 18 Aug 2026: four product slugs
 * were renamed and every old URL — already in Google's index — started
 * serving 404. That is ranking thrown in the bin. A 301 keeps it.
 */
import { prisma } from '@/lib/db/prisma';

/** Look up a redirect target for a path. Returns null when there is none. */
export async function lookupRedirect(fromPath: string): Promise<string | null> {
  try {
    const row = await prisma.redirect.findUnique({
      where: { fromPath },
      select: { toPath: true },
    });
    if (!row) return null;

    // Best-effort hit counter — never let it block or throw.
    void prisma.redirect
      .update({ where: { fromPath }, data: { hitCount: { increment: 1 } } })
      .catch(() => {});

    return row.toPath;
  } catch {
    return null;
  }
}
