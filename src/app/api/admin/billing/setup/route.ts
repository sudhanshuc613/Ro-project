/**
 * GET  /api/admin/billing/setup  → kaun si billing tables bani hain
 * POST /api/admin/billing/setup  → bana do (CREATE ... IF NOT EXISTS)
 *
 * Yeh sirf tables banata hai. Na koi table girata hai, na column badalta
 * hai, na ek bhi row delete karta hai. Dobara dabane se bhi kuch nahi hota.
 * Poora SQL `src/lib/billing/ddl.ts` me padha ja sakta hai.
 *
 * Sirf ADMIN / SUPER_ADMIN. STAFF ko bhi mana hai — DDL chalana owner ka kaam
 * hai, counter staff ka nahi.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { billingSetupStatus, runBillingSetup } from '@/server/services/billing.service';
import { logAudit } from '@/server/services/audit.service';

const guard = (r?: string) => r === 'ADMIN' || r === 'SUPER_ADMIN';

export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await getServerSession(authOptions);
  if (!guard(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await billingSetupStatus());
}

export async function POST() {
  const s = await getServerSession(authOptions);
  if (!guard(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const before = await billingSetupStatus();
  if (before.ready) {
    return NextResponse.json({ ...before, alreadyReady: true });
  }

  try {
    const after = await runBillingSetup();
    await logAudit({
      actorId: s!.user.id,
      action: 'billing.setup',
      entityType: 'DATABASE',
      beforeData: { missing: before.missing },
      afterData: { present: after.present },
    }).catch(() => {});
    return NextResponse.json(after);
  } catch (e) {
    return NextResponse.json(
      {
        ready: false,
        message:
          'Tables nahi ban payi. Neon dashboard → SQL Editor me prisma/migrations/01_billing/migration.sql paste karke Run karein.',
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
