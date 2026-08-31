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
    console.error('[admin/alerts:GET]', err);
    // Never let a bell error surface as a broken admin page.
    return NextResponse.json({ unread: 0, alerts: [] });
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
