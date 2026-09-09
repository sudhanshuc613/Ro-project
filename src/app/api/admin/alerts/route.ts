/**
 * GET  /api/admin/alerts  — list alerts + unread count (polled by the bell)
 * POST /api/admin/alerts  — mark alerts read
 *
 * Polled every 25 seconds while an admin tab is open. Kept deliberately cheap:
 * two indexed queries, no joins, capped at 25 rows.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAlerts, markAlertsRead } from '@/server/services/alert.service';

export const dynamic = 'force-dynamic';

function guard(role?: string) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { alerts, unread } = await getAlerts(25);
    return NextResponse.json({
      unread,
      setupNeeded: false,
      alerts: alerts.map((a) => ({
        id: a.id,
        kind: a.kind,
        priority: a.priority,
        title: a.title,
        body: a.body,
        link: a.link,
        phone: a.phone,
        amount: a.amount ? Number(a.amount) : null,
        isRead: a.isRead,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    /*
     * Distinguish "table does not exist" from every other failure.
     *
     * This matters because of exactly what happened on 31 Aug 2026: the code
     * deployed fine, but the two new tables were never created in the
     * production database (the Vercel build runs `prisma generate && next
     * build` — no `db push`). Alert writes then failed inside a try/catch and
     * were swallowed, so bookings kept working while notifications silently
     * did nothing. A silent failure that looks identical to "no alerts yet" is
     * the worst possible behaviour.
     *
     * Postgres error 42P01 = undefined_table. When we see it we tell the admin
     * UI to show the fix instead of pretending the inbox is empty.
     */
    const code = (err as { code?: string })?.code;
    const msg = String((err as Error)?.message ?? '');
    const tableMissing =
      code === 'P2021' || code === '42P01' || /admin_alerts.*does not exist/i.test(msg);

    if (tableMissing) {
      console.error('[admin/alerts] admin_alerts table missing — run prisma/migrations/add-notification-tables.sql');
      return NextResponse.json({
        unread: 0,
        alerts: [],
        setupNeeded: true,
        setupHint:
          'Database me admin_alerts table nahi hai. Neon SQL Editor me prisma/migrations/add-notification-tables.sql chalao.',
      });
    }

    console.error('[admin/alerts:GET]', err);
    // Any other failure: degrade quietly rather than breaking the admin page.
    return NextResponse.json({ unread: 0, alerts: [], setupNeeded: false });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const ids: string[] | undefined = Array.isArray(body.ids) ? body.ids : undefined;

  try {
    await markAlertsRead(ids);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/alerts:POST]', err);
    return NextResponse.json({ message: 'Failed' }, { status: 500 });
  }
}
