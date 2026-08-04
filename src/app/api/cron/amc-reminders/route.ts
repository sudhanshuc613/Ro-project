/**
 * AMC reminder cron — runs daily.
 *
 * Two jobs:
 *   1. Visit due in 7 days   → WhatsApp the customer to book a slot
 *   2. Contract expires in 30 days → renewal reminder
 *
 * Idempotent by design: we check the notifications outbox before sending, so
 * re-running the cron on the same day never double-messages a customer.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendWhatsApp } from '@/lib/integrations/whatsapp';
import { getVisitsDue, getExpiringContracts } from '@/server/services/amc.service';
import { getContactSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Has this related record already been messaged with this template today? */
async function alreadySentToday(relatedId: string, templateKey: string) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const hit = await prisma.notification.findFirst({
    where: {
      relatedType: 'AMC',
      relatedId,
      templateKey,
      createdAt: { gte: since },
      status: { in: ['QUEUED', 'SENT', 'DELIVERED', 'READ'] },
    },
    select: { id: true },
  });
  return Boolean(hit);
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const contact = await getContactSettings();
  const results = { visitReminders: 0, renewalReminders: 0, skipped: 0 };

  /* ── 1. Visits due within 7 days ── */
  for (const sub of await getVisitsDue(7)) {
    if (!sub.user?.phone || !sub.nextServiceDue) continue;

    if (await alreadySentToday(sub.id, 'amc_visit_due')) {
      results.skipped++;
      continue;
    }

    const dueDate = sub.nextServiceDue.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short',
    });
    const remaining = sub.visitsIncluded - sub.visitsUsed;

    await sendWhatsApp({
      to: `91${sub.user.phone}`,
      template: 'amc_visit_due',
      variables: [
        sub.user.fullName.split(' ')[0],
        sub.planName,
        dueDate,
        String(remaining),
        contact.primaryPhone,
      ],
      userId: sub.user.id,
      relatedType: 'AMC',
      relatedId: sub.id,
    });
    results.visitReminders++;
  }

  /* ── 2. Contracts expiring within 30 days ── */
  for (const sub of await getExpiringContracts(30)) {
    if (!sub.user?.phone) continue;

    if (await alreadySentToday(sub.id, 'amc_renewal_due')) {
      results.skipped++;
      continue;
    }

    const daysLeft = Math.ceil((sub.endsOn.getTime() - Date.now()) / 864e5);

    // Nudge at 30, 15 and 7 days — not every single day
    if (![30, 15, 7].includes(daysLeft)) continue;

    await sendWhatsApp({
      to: `91${sub.user.phone}`,
      template: 'amc_renewal_due',
      variables: [
        sub.user.fullName.split(' ')[0],
        sub.planName,
        String(daysLeft),
        `₹${Number(sub.price).toLocaleString('en-IN')}`,
        contact.primaryPhone,
      ],
      userId: sub.user.id,
      relatedType: 'AMC',
      relatedId: sub.id,
    });
    results.renewalReminders++;
  }

  return NextResponse.json({
    success: true,
    processedAt: new Date().toISOString(),
    ...results,
  });
}
