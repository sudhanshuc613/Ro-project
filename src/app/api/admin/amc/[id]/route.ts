/**
 * POST /api/admin/amc/[id] — admin actions on a contract.
 *   { action: 'renew' }          → extend by 12 months, reset visit counter
 *   { action: 'consume-visit' }  → mark one included visit as used
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { renewAmc, consumeAmcVisit } from '@/server/services/amc.service';
import { logAudit } from '@/server/services/audit.service';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { action } = await req.json().catch(() => ({ action: null }));

  try {
    if (action === 'renew') {
      const renewed = await renewAmc(params.id);
      await logAudit({
        actorId: session.user.id,
        action: 'amc.renew',
        entityType: 'AMC',
        entityId: params.id,
        afterData: renewed,
      });
      return NextResponse.json({
        success: true,
        message: `Renewed until ${renewed.endsOn.toLocaleDateString('en-IN')}`,
      });
    }

    if (action === 'consume-visit') {
      const updated = await consumeAmcVisit(params.id);
      if (!updated) {
        return NextResponse.json(
          { message: 'Contract not found or already fully used' },
          { status: 404 },
        );
      }
      await logAudit({
        actorId: session.user.id,
        action: 'amc.consume_visit',
        entityType: 'AMC',
        entityId: params.id,
        afterData: updated,
      });
      return NextResponse.json({
        success: true,
        message: `Visit recorded — ${updated.visitsUsed}/${updated.visitsIncluded} used`,
      });
    }

    return NextResponse.json(
      { message: "action must be 'renew' or 'consume-visit'" },
      { status: 400 },
    );
  } catch (err) {
    console.error('[admin/amc]', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Action failed' },
      { status: 500 },
    );
  }
}
