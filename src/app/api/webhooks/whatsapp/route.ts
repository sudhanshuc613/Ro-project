/**
 * WhatsApp inbound webhook (Meta Cloud API).
 *
 * ── WHY THIS ROUTE IS THE WHOLE POINT OF THE FREE FLOW ────────────────────
 * When a customer sends us a message, Meta posts it here along with the
 * sender's phone number. That number is asserted by WhatsApp itself — the
 * sender cannot spoof it. So "a message containing code X arrived from
 * 9876543210" is genuine proof that whoever holds that number performed the
 * action.
 *
 * That is exactly what showing a code on screen and asking the user to type
 * it back CANNOT prove: there, the code never leaves the browser, so anyone
 * can complete it with any number they like.
 *
 * Inbound messages are free under Meta's pricing, so this verification costs
 * ₹0 per user.
 *
 * GET  — Meta's one-time subscription handshake
 * POST — message delivery
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { resolveInboundCode } from '@/server/services/otp.service';
import { sendWhatsAppText } from '@/lib/integrations/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Meta calls this once when you save the webhook URL. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get('hub.mode');
  const token = sp.get('hub.verify_token');
  const challenge = sp.get('hub.challenge');

  if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? '', { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

/**
 * Confirm the payload really came from Meta.
 *
 * Without this, anyone who learns the URL can POST a fake "message from
 * 9876543210" and verify a number they do not own — which would quietly
 * defeat the entire mechanism. timingSafeEqual avoids leaking the signature
 * through comparison timing.
 */
function signatureValid(raw: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) {
    // Fail CLOSED. An unverifiable webhook is worse than no webhook.
    console.error('[whatsapp] WHATSAPP_APP_SECRET not set — rejecting webhook');
    return false;
  }
  if (!header?.startsWith('sha256=')) return false;

  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const raw = await req.text();

  if (!signatureValid(raw, req.headers.get('x-hub-signature-256'))) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true }); // never make Meta retry on junk
  }

  interface WaMessage { from?: string; type?: string; text?: { body?: string } }
  interface WaChange { value?: { messages?: WaMessage[] } }
  interface WaEntry { changes?: WaChange[] }
  const entries = (body as { entry?: WaEntry[] }).entry ?? [];

  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      for (const msg of change.value?.messages ?? []) {
        if (msg.type !== 'text' || !msg.from || !msg.text?.body) continue;

        try {
          const matched = await resolveInboundCode(msg.from, msg.text.body);

          if (matched) {
            // Plain text, not a template: the customer just messaged us, so
            // we are inside the 24-hour service window where free-form
            // replies are allowed and cost nothing. Using a template here
            // would need Meta approval and would be billable.
            void sendWhatsAppText(
              msg.from,
              '✅ Number verified. You can go back to the website and continue — Aqua Perl',
            );
          }
        } catch (err) {
          console.error('[whatsapp] inbound handling failed:', err);
        }
      }
    }
  }

  // Always 200 — a non-2xx makes Meta retry and eventually disable the hook.
  return NextResponse.json({ ok: true });
}
