/**
 * ALERT SERVICE — gets the owner's attention when money is on the line.
 * ────────────────────────────────────────────────────────────────────────────
 * The gap this closes: when a service request came in, the site sent the
 * customer a WhatsApp and tried to send the owner one too. If the WhatsApp
 * Business API is not configured — which it currently is not — that admin
 * message silently goes nowhere. A lead could sit unseen for hours.
 *
 * Three delivery paths, deliberately layered so that no single missing
 * integration can lose an alert:
 *
 *   1. DATABASE ROW — always written, never fails the request. This is the
 *      source of truth and powers the admin bell menu.
 *   2. WEB PUSH — fires a real notification on the owner's phone even when
 *      the browser is closed. Free, needs no third party, works on Android
 *      and on iOS 16.4+ once the site is added to the home screen.
 *   3. WHATSAPP — best-effort, only if the Meta credentials exist.
 *
 * Every path is fire-and-forget. An alert failing must never stop a customer
 * from booking.
 */
import { prisma } from '@/lib/db/prisma';

export type AlertKind = 'SERVICE_REQUEST' | 'ORDER' | 'STOCK' | 'REVIEW' | 'SYSTEM';
export type AlertPriority = 'low' | 'normal' | 'high';

export interface CreateAlertInput {
  kind: AlertKind;
  priority?: AlertPriority;
  title: string;
  body: string;
  link?: string;
  phone?: string;
  amount?: number;
  relatedType?: string;
  relatedId?: string;
}

/**
 * Write an alert and push it out. Safe to call from anywhere, including
 * inside a request handler — it never throws.
 */
export async function createAlert(input: CreateAlertInput): Promise<void> {
  try {
    const alert = await prisma.adminAlert.create({
      data: {
        kind: input.kind,
        priority: input.priority ?? 'normal',
        title: input.title.slice(0, 160),
        body: input.body.slice(0, 400),
        link: input.link?.slice(0, 300),
        phone: input.phone?.slice(0, 20),
        amount: input.amount,
        relatedType: input.relatedType,
        relatedId: input.relatedId,
      },
    });

    // Push runs after the row is safely stored, so a push failure can never
    // cost us the alert itself.
    void sendPushToOwner({
      title: alert.title,
      body: alert.body,
      link: alert.link ?? '/admin',
      priority: alert.priority as AlertPriority,
      tag: `${alert.kind}-${alert.id}`,
    }).catch(() => {});
  } catch (err) {
    // Logged, not thrown. A booking must succeed even if alerting is broken.
    console.error('[alert.service] createAlert failed', err);
  }
}

/* ── Web Push ─────────────────────────────────────────────────────────────── */

export interface PushPayload {
  title: string;
  body: string;
  link: string;
  priority: AlertPriority;
  tag: string;
}

/**
 * Send a Web Push notification to every registered owner device.
 *
 * `web-push` is imported lazily so the module is only loaded when VAPID keys
 * are actually configured. Without that, a missing optional dependency would
 * break the build for a feature the owner may not have set up yet.
 */
export async function sendPushToOwner(payload: PushPayload): Promise<void> {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:support@rokadoctor.in';

  if (!publicKey || !privateKey) return; // not configured — silently skip

  let webpush: typeof import('web-push');
  try {
    webpush = (await import('web-push')).default as unknown as typeof import('web-push');
  } catch {
    return; // dependency absent — nothing to do
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
  } catch {
    return; // malformed keys
  }

  const subs = await prisma.pushSubscription.findMany({ take: 20 }).catch(() => []);
  if (subs.length === 0) return;

  const body = JSON.stringify(payload);

  await Promise.allSettled(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
          { TTL: 3600, urgency: payload.priority === 'high' ? 'high' : 'normal' },
        );
        await prisma.pushSubscription
          .update({ where: { id: s.id }, data: { lastUsed: new Date() } })
          .catch(() => {});
      } catch (err: unknown) {
        // 404/410 means the browser dropped the subscription — clean it up so
        // we are not retrying a dead endpoint forever.
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    }),
  );
}

/* ── Ready-made alert builders ────────────────────────────────────────────── */

export function alertNewServiceRequest(a: {
  ticketNumber: string;
  customerName: string;
  phone: string;
  area: string;
  issue: string;
  requestId: string;
  urgent?: boolean;
}) {
  return createAlert({
    kind: 'SERVICE_REQUEST',
    priority: a.urgent ? 'high' : 'normal',
    title: `🔧 Nayi service request — ${a.area}`,
    body: `${a.customerName} · ${a.phone}\n${a.issue.slice(0, 120)}`,
    link: `/admin/service-requests`,
    phone: a.phone,
    relatedType: 'SERVICE_REQUEST',
    relatedId: a.requestId,
  });
}

export function alertNewOrder(a: {
  orderNumber: string;
  customerName: string;
  phone: string;
  amount: number;
  itemCount: number;
  paymentMethod: string;
  orderId: string;
}) {
  const cod = a.paymentMethod === 'COD';
  return createAlert({
    kind: 'ORDER',
    // COD needs a confirmation call, so it is the more urgent of the two.
    priority: cod ? 'high' : 'normal',
    title: `🛒 Naya order ₹${a.amount.toLocaleString('en-IN')}${cod ? ' (COD)' : ''}`,
    body: `${a.customerName} · ${a.phone}\n${a.itemCount} item · ${a.orderNumber}`,
    link: `/admin/orders`,
    phone: a.phone,
    amount: a.amount,
    relatedType: 'ORDER',
    relatedId: a.orderId,
  });
}

export function alertLowStock(a: { productName: string; qty: number; productId: string }) {
  return createAlert({
    kind: 'STOCK',
    priority: a.qty === 0 ? 'high' : 'low',
    title: a.qty === 0 ? `📦 Stock khatam — ${a.productName}` : `📦 Stock kam — ${a.productName}`,
    body: `Sirf ${a.qty} bache hain. Order kar do.`,
    link: `/admin/inventory`,
    relatedType: 'PRODUCT',
    relatedId: a.productId,
  });
}

/* ── Queries used by the bell ─────────────────────────────────────────────── */

export async function getAlerts(limit = 25) {
  const [alerts, unread] = await Promise.all([
    prisma.adminAlert.findMany({ orderBy: { createdAt: 'desc' }, take: limit }),
    prisma.adminAlert.count({ where: { isRead: false } }),
  ]);
  return { alerts, unread };
}

export async function markAlertsRead(ids?: string[]) {
  await prisma.adminAlert.updateMany({
    where: ids?.length ? { id: { in: ids } } : { isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}
