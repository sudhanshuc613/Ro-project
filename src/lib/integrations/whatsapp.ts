/**
 * WhatsApp Cloud API (Meta) client.
 *
 * Every send is persisted to the `notifications` outbox first, so nothing is
 * ever silently lost and the admin can inspect delivery in /admin/notifications.
 *
 * Templates must be pre-approved in Meta Business Manager. Register these:
 *   order_confirmed              — {name} {orderNo} {amount} {eta}
 *   payment_received             — {name} {orderNo} {amount}
 *   otp_verification             — {code}   (category: AUTHENTICATION)
 *   NOTE: the reverse-OTP confirmation is a free-form text reply, not a
 *   template — see sendWhatsAppText(). No approval needed for it.
 *   order_shipped                — {name} {orderNo} {courier} {awb} {trackUrl}
 *   order_delivered              — {name} {orderNo}
 *   service_request_received     — {name} {ticket} {visitCharge} {phone}
 *   service_technician_assigned  — {name} {ticket} {techName} {techPhone} {slot}
 *   service_completed            — {name} {ticket} {amount}
 *   admin_new_order_alert        — {orderNo} {customer} {amount} {city}
 *   admin_new_service_alert      — {ticket} {name} {phone} {address} {issue}
 *   cart_recovery_1 / _2 / _3    — {name} {itemCount} {total} {link} [{coupon}]
 *   amc_due_reminder             — {name} {dueDate} {phone}
 */
import { prisma } from '@/lib/db/prisma';

const API_VERSION = 'v20.0';
const BASE = `https://graph.facebook.com/${API_VERSION}`;

export interface WhatsAppPayload {
  to: string;                    // 91XXXXXXXXXX (no '+')
  template: string;
  variables?: string[];
  language?: string;
  relatedType?: 'ORDER' | 'SERVICE_REQUEST' | 'CART' | 'AMC';
  relatedId?: string;
  userId?: string;
  buttonUrlParam?: string;       // dynamic URL button suffix
}

export async function sendWhatsApp(payload: WhatsAppPayload): Promise<{ ok: boolean; id?: string }> {
  const {
    to, template, variables = [], language = 'en',
    relatedType, relatedId, userId, buttonUrlParam,
  } = payload;

  // 1) Outbox row first — guarantees an audit trail
  const notification = await prisma.notification.create({
    data: {
      userId: userId ?? null,
      channel: 'WHATSAPP',
      templateKey: template,
      recipient: to,
      payload: { variables, buttonUrlParam },
      status: 'QUEUED',
      relatedType: relatedType ?? null,
      relatedId: relatedId ?? null,
    },
  });

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn('[whatsapp] credentials missing — message queued only');
    return { ok: false };
  }

  const components: Record<string, unknown>[] = [];
  if (variables.length) {
    components.push({
      type: 'body',
      parameters: variables.map((v) => ({ type: 'text', text: String(v ?? '') })),
    });
  }
  if (buttonUrlParam) {
    components.push({
      type: 'button', sub_type: 'url', index: '0',
      parameters: [{ type: 'text', text: buttonUrlParam }],
    });
  }

  try {
    const res = await fetch(`${BASE}/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: { name: template, language: { code: language }, components },
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'FAILED',
          errorMessage: json?.error?.message ?? `HTTP ${res.status}`,
          attempts: { increment: 1 },
        },
      });
      console.error('[whatsapp] send failed', json?.error);
      return { ok: false };
    }

    const messageId = json?.messages?.[0]?.id;
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: 'SENT', providerMsgId: messageId, sentAt: new Date(), attempts: { increment: 1 } },
    });

    return { ok: true, id: messageId };
  } catch (err) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: 'FAILED', errorMessage: String(err), attempts: { increment: 1 } },
    });
    return { ok: false };
  }
}

/**
 * Free-form text reply.
 *
 * Only valid inside the 24-hour window opened by a customer's own message.
 * That window is exactly where Meta's SERVICE category applies — no template
 * approval required, and free since Meta's Nov 2024 pricing change. Outside
 * the window Meta rejects it, which is correct: it stops businesses
 * cold-messaging people for free.
 *
 * Failures are logged rather than thrown — a missed confirmation must never
 * break the verification that already succeeded.
 */
export async function sendWhatsAppText(to: string, body: string): Promise<{ ok: boolean }> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return { ok: false };

  try {
    const res = await fetch(`${BASE}/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body },
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      console.error('[whatsapp] text reply failed:', j?.error?.message ?? res.status);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error('[whatsapp] text reply error:', err);
    return { ok: false };
  }
}

/** Fan-out helper for the two business numbers. */
export async function notifyAdmins(template: string, variables: string[], relatedType?: WhatsAppPayload['relatedType'], relatedId?: string) {
  const numbers = (process.env.ADMIN_WHATSAPP_NUMBERS ?? '918969821440,919661288308').split(',');
  return Promise.allSettled(
    numbers.map((n) => sendWhatsApp({ to: n.trim(), template, variables, relatedType, relatedId })),
  );
}
