/**
 * POST /api/admin/rank-check — run a live rank + competitor check.
 * GET  /api/admin/rank-check — return stored history without re-running.
 *
 * Admin only. Deliberately not cached: the whole point is a live reading.
 * A full run makes ~21 sequential requests with a 900 ms gap, so it takes
 * roughly 30-40 seconds. Group filtering exists so the admin can check one
 * bucket quickly instead of waiting for the whole set.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  runRankCheck, auditCompetitor, buildRecommendations, getRankHistory,
  KNOWN_COMPETITORS, TRACKED_KEYWORDS, OUR_URL,
} from '@/server/services/rank.service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function guard(role?: string) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const history = await getRankHistory();
  return NextResponse.json({
    history,
    keywords: TRACKED_KEYWORDS,
    competitors: KNOWN_COMPETITORS,
    groups: [...new Set(TRACKED_KEYWORDS.map((k) => k.group))],
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const groups: string[] | undefined = Array.isArray(body.groups) ? body.groups : undefined;
  const auditDomains: string[] = Array.isArray(body.audit) ? body.audit.slice(0, 6) : [];

  try {
    const { results, summary } = await runRankCheck(groups);

    // Audit our own page plus whichever competitors were requested.
    // If none were named, audit whoever actually outranked us most often.
    let toAudit = auditDomains;
    if (toAudit.length === 0) {
      const above = new Map<string, number>();
      for (const r of results) {
        const ourPos = r.ourPosition ?? 99;
        for (const row of r.results) {
          if (row.position < ourPos && !row.domain.includes('rokadoctor')) {
            above.set(row.domain, (above.get(row.domain) ?? 0) + 1);
          }
        }
      }
      toAudit = [...above.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d]) => d);
    }

    const [ourAudit, ...competitorAudits] = await Promise.all([
      auditCompetitor(`${OUR_URL}/service-patna`),
      ...toAudit.map((d) => auditCompetitor(d)),
    ]);

    const recommendations = buildRecommendations(results, ourAudit, competitorAudits);

    return NextResponse.json({
      ranAt: new Date().toISOString(),
      summary,
      results,
      ourAudit,
      competitorAudits,
      recommendations,
    });
  } catch (err) {
    console.error('[rank-check]', err);
    return NextResponse.json(
      { message: 'Rank check fail ho gaya', error: (err as Error).message },
      { status: 500 },
    );
  }
}
