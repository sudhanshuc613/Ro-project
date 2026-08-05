/**
 * Notification history.
 *
 * Shows what we actually sent, with delivery status. Reason: a customer who
 * says "aapne to bataya hi nahi" can check, and one who sees FAILED against
 * their number knows to fix their WhatsApp rather than blaming us. Being
 * auditable is cheap and buys a lot of goodwill.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { relativeTime, formatDateIN } from '@/lib/utils/format';
import { SectionHeader, EmptyState, Badge } from '@/components/account/ui';

export const metadata: Metadata = {
  title: 'Notifications',
  robots: { index: false, follow: false },
};

const CHANNEL_ICON: Record<string, string> = {
  WHATSAPP: '💬', SMS: '📱', EMAIL: '✉️', PUSH: '🔔',
};

const STATUS_TONE: Record<string, 'slate' | 'green' | 'amber' | 'red'> = {
  QUEUED: 'amber', SENT: 'green', DELIVERED: 'green', READ: 'green', FAILED: 'red',
};

/** Turns template_key into something a human reads. */
function humanise(key: string | null, related: string | null) {
  if (!key) return related ? `${related.toLowerCase()} update` : 'Notification';
  return key
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  const items = await prisma.notification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'desc' },
    take: 60,
  });

  return (
    <div>
      <SectionHeader
        title="Notifications"
        subtitle="Everything we've sent you, and whether it went through"
        action={
          <Link href="/account/profile" className="text-sm font-bold text-aqua-600 hover:underline">
            Preferences →
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No notifications yet"
          body="When you book a service or place an order, updates land here and on WhatsApp."
          ctaLabel="Book a service"
          ctaHref="/#book-service"
        />
      ) : (
        <ul className="space-y-2.5">
          {items.map((n) => {
            const body =
              (n.payload as { message?: string; body?: string } | null)?.message ??
              (n.payload as { body?: string } | null)?.body ??
              null;

            return (
              <li key={n.id} className="card flex items-start gap-3.5 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sand-100 text-lg">
                  {CHANNEL_ICON[n.channel] ?? '🔔'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-navy-700">
                      {humanise(n.templateKey, n.relatedType)}
                    </p>
                    <Badge tone={STATUS_TONE[n.status] ?? 'slate'}>{n.status}</Badge>
                  </div>
                  {body && <p className="mt-1 text-sm text-muted line-clamp-3">{body}</p>}
                  <p className="mt-1 text-[11px] text-muted">
                    {n.channel} · {n.recipient} · {relativeTime(n.createdAt)}
                    {n.sentAt && ` · sent ${formatDateIN(n.sentAt)}`}
                  </p>
                  {n.status === 'FAILED' && n.errorMessage && (
                    <p className="mt-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] text-red-700">
                      Delivery failed — {n.errorMessage}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
