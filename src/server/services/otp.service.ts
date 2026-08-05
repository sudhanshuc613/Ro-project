/**
 * Phone verification.
 *
 * ── WHY THIS FILE REPLACES THE OLD OTP CODE ───────────────────────────────
 * The previous implementation had three defects that made it non-functional:
 *
 *   1. It stored codes with `redis?.setex(...)`. REDIS_URL is not set on this
 *      deployment, so that optional-chain silently did nothing. The code was
 *      never stored and verification could never succeed — with no error
 *      logged anywhere. Codes now live in Postgres, which is already a hard
 *      dependency of the app.
 *
 *   2. `rateLimit()` returns `true` when Redis is absent (fail-open). Every
 *      limit in the app was therefore switched off. Attempt counting here is
 *      done on the challenge row itself, so it works with or without Redis.
 *
 *   3. `/api/auth/send-otp` was referenced in a comment but never existed.
 *
 * ── THE FOUR CHANNELS ─────────────────────────────────────────────────────
 * Owner picks one in /admin/settings. All four share the same verify path,
 * so switching channel later needs no code change.
 *
 *   DEV               Code is returned to the screen. NO SECURITY AT ALL —
 *                     the attacker is handed the answer. Testing only, and
 *                     hard-blocked in production below.
 *
 *   WHATSAPP_REVERSE  Code shown on screen, customer sends it FROM their
 *                     WhatsApp to us. Meta's webhook tells us which number
 *                     it came from. Costs ₹0 because inbound messages are
 *                     free, and it is genuine proof of possession: a person
 *                     who does not control the number cannot send from it.
 *
 *   WHATSAPP          Standard OTP delivered as an authentication template.
 *                     ~₹0.115. No DLT registration needed.
 *
 *   SMS               MSG91. ~₹0.15 plus one-time DLT registration (₹5,900)
 *                     and template approval. Only channel with ~100% reach.
 */
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { sendWhatsApp } from '@/lib/integrations/whatsapp';

export type OtpChannel = 'DEV' | 'WHATSAPP_REVERSE' | 'WHATSAPP' | 'SMS';
export type OtpPurpose = 'LOGIN' | 'ORDER_COD' | 'SERVICE_BOOKING';

/** Reverse flow needs longer — the user has to switch apps and come back. */
const TTL_SECONDS = { DEV: 600, WHATSAPP: 600, SMS: 600, WHATSAPP_REVERSE: 900 } as const;
const MAX_ATTEMPTS = 5;
/** Per phone, per window — stops someone burning your SMS balance. */
const MAX_SENDS_PER_HOUR = 5;

export class OtpError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export interface ChallengeResult {
  pollToken: string;
  channel: OtpChannel;
  expiresInSeconds: number;
  /** Reverse flow: the short code the user must SEND to us. */
  sendCode?: string;
  /** Reverse flow: deep link that opens WhatsApp with the code pre-typed. */
  whatsappLink?: string;
  /** DEV only. Never populated in production. */
  devCode?: string;
  message: string;
}

/**
 * Reverse-flow codes are typed by a human into WhatsApp, so they are short
 * and avoid characters that look alike (0/O, 1/I/L). Six digits would be
 * annoying to type on a phone keyboard mid-flow.
 */
function reverseCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.randomBytes(4))
    .map((b) => alphabet[b % alphabet.length])
    .join('');
}

function numericCode(): string {
  // crypto, not Math.random — a predictable OTP is not an OTP.
  return String(crypto.randomInt(100000, 1000000));
}

/**
 * Create a challenge and dispatch it on the configured channel.
 * Throws OtpError with a customer-safe message on any refusal.
 */
export async function createChallenge(opts: {
  phone: string;
  purpose: OtpPurpose;
  channel: OtpChannel;
  whatsappNumber?: string;
  ip?: string;
  customerName?: string;
}): Promise<ChallengeResult> {
  const { phone, purpose, channel, ip } = opts;

  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new OtpError('Enter a valid 10-digit Indian mobile number');
  }

  // DEV hands the code to the caller. If that ever ran in production the
  // whole mechanism would be theatre, so refuse outright rather than
  // depending on the admin never mis-clicking.
  if (channel === 'DEV' && process.env.NODE_ENV === 'production') {
    throw new OtpError(
      'Verification is set to test mode, which cannot run on the live site. Please call us to place your order.',
      503,
    );
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 3600_000);

  // Expired rows of any kind are safe to drop.
  await prisma.otpChallenge.deleteMany({ where: { expiresAt: { lt: now } } });

  // Send cap.
  //
  // This MUST be counted on rows that supersession does not delete. Counting
  // live challenges was the original bug: deleteMany() below wipes previous
  // challenges for the same phone+purpose, so the tally was always ~0 and the
  // cap never fired — leaving the SMS balance open to being drained.
  //
  // '_AUDIT' rows are write-only markers with a 1-hour life, never matched by
  // any verify path (which always looks up by pollToken or a real purpose).
  const recentSends = await prisma.otpChallenge.count({
    where: { phone, purpose: '_AUDIT', createdAt: { gte: oneHourAgo } },
  });

  if (recentSends >= MAX_SENDS_PER_HOUR) {
    throw new OtpError('Too many verification attempts. Please wait an hour or call us.', 429);
  }

  const isReverse = channel === 'WHATSAPP_REVERSE';
  const code = isReverse ? reverseCode() : numericCode();
  const ttl = TTL_SECONDS[channel];
  const pollToken = crypto.randomBytes(24).toString('hex');

  // Supersede older codes for the same phone+purpose so an attacker cannot
  // keep several valid codes alive at once.
  await prisma.otpChallenge.deleteMany({ where: { phone, purpose } });

  // Append-only send marker for the hourly cap above.
  await prisma.otpChallenge.create({
    data: {
      phone,
      codeHash: 'audit',
      purpose: '_AUDIT',
      channel,
      pollToken: `audit_${crypto.randomBytes(16).toString('hex')}`,
      expiresAt: new Date(Date.now() + 3600_000),
      ip: ip ?? null,
    },
  });

  await prisma.otpChallenge.create({
    data: {
      phone,
      codeHash: await bcrypt.hash(code, 10),
      purpose,
      channel,
      pollToken,
      expiresAt: new Date(Date.now() + ttl * 1000),
      ip: ip ?? null,
    },
  });

  const base: ChallengeResult = {
    pollToken,
    channel,
    expiresInSeconds: ttl,
    message: '',
  };

  if (channel === 'DEV') {
    return {
      ...base,
      devCode: code,
      message: 'TEST MODE — this code is shown on screen and verifies nothing. Switch to WhatsApp or SMS before going live.',
    };
  }

  if (isReverse) {
    const target = (opts.whatsappNumber ?? '').replace(/\D/g, '');
    if (!target) {
      throw new OtpError('Verification is not configured yet. Please call us.', 503);
    }
    return {
      ...base,
      sendCode: code,
      whatsappLink: `https://wa.me/${target}?text=${encodeURIComponent(code)}`,
      message: `Send ${code} to us on WhatsApp from ${phone}. We'll verify automatically.`,
    };
  }

  if (channel === 'WHATSAPP') {
    await sendWhatsApp({
      to: `91${phone}`,
      template: 'otp_verification',
      variables: [code],
      relatedType: 'ORDER',
    });
    return { ...base, message: `Code sent to ${phone} on WhatsApp` };
  }

  await sendSms(phone, code);
  return { ...base, message: `Code sent to ${phone} by SMS` };
}

/** MSG91 transactional SMS. Requires DLT-registered template. */
async function sendSms(phone: string, code: string) {
  const authkey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!authkey || !templateId) {
    throw new OtpError('SMS verification is not configured yet. Please call us.', 503);
  }

  try {
    const res = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: { authkey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_id: templateId,
        recipients: [{ mobiles: `91${phone}`, OTP: code }],
      }),
    });
    if (!res.ok) throw new Error(`MSG91 ${res.status}`);
  } catch (err) {
    console.error('[otp] SMS send failed:', err);
    throw new OtpError('Could not send the code right now. Please try again or call us.', 502);
  }
}

/**
 * Verify a code the user typed (SMS / WHATSAPP / DEV channels).
 *
 * Attempts are counted on the row, so brute force is capped even with no
 * Redis. The row is deleted on success so a code is strictly single-use.
 */
export async function verifyTypedCode(
  pollToken: string,
  code: string,
): Promise<{ phone: string; purpose: OtpPurpose }> {
  const challenge = await prisma.otpChallenge.findUnique({ where: { pollToken } });

  if (!challenge) throw new OtpError('This verification has expired. Please start again.');
  if (challenge.expiresAt < new Date()) {
    await prisma.otpChallenge.delete({ where: { id: challenge.id } });
    throw new OtpError('The code has expired. Please request a new one.');
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    await prisma.otpChallenge.delete({ where: { id: challenge.id } });
    throw new OtpError('Too many wrong attempts. Please request a new code.', 429);
  }

  const ok = await bcrypt.compare(code.trim(), challenge.codeHash);
  if (!ok) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    const left = MAX_ATTEMPTS - challenge.attempts - 1;
    throw new OtpError(
      left > 0 ? `Wrong code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Wrong code. Please request a new one.',
    );
  }

  await prisma.otpChallenge.delete({ where: { id: challenge.id } });
  await markPhoneVerified(challenge.phone);
  return { phone: challenge.phone, purpose: challenge.purpose as OtpPurpose };
}

/**
 * Reverse flow: the browser polls this while the user is in WhatsApp.
 * Returns verified=true only after the webhook has stamped the row.
 */
export async function pollReverseStatus(
  pollToken: string,
): Promise<{ verified: boolean; phone?: string; purpose?: OtpPurpose; expired?: boolean }> {
  const challenge = await prisma.otpChallenge.findUnique({ where: { pollToken } });
  if (!challenge) return { verified: false, expired: true };
  if (challenge.expiresAt < new Date()) return { verified: false, expired: true };
  if (!challenge.verifiedAt) return { verified: false };

  return {
    verified: true,
    phone: challenge.phone,
    purpose: challenge.purpose as OtpPurpose,
  };
}

/**
 * Called by the WhatsApp webhook when a message arrives.
 *
 * THE SECURITY POINT: `fromPhone` comes from Meta, not from our page. That is
 * what makes this real verification — the sender cannot forge it, so
 * possession of the number is proven.
 */
export async function resolveInboundCode(fromPhone: string, text: string): Promise<boolean> {
  const phone = fromPhone.replace(/\D/g, '').replace(/^91/, '');
  const candidate = text.trim().toUpperCase().replace(/\s+/g, '');
  if (candidate.length < 4 || candidate.length > 12) return false;

  const open = await prisma.otpChallenge.findMany({
    where: {
      phone,
      channel: 'WHATSAPP_REVERSE',
      verifiedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (open.length === 0) return false;

  for (const c of open) {
    if (await bcrypt.compare(candidate, c.codeHash)) {
      await prisma.otpChallenge.update({
        where: { id: c.id },
        data: { verifiedAt: new Date() },
      });
      await markPhoneVerified(phone);
      return true;
    }
  }
  return false;
}

/** Stamp the user record so we never re-verify a known-good number. */
async function markPhoneVerified(phone: string) {
  await prisma.user
    .updateMany({ where: { phone }, data: { phoneVerifiedAt: new Date() } })
    .catch(() => null);
}

/** Has this number already been proven, ever? */
export async function isPhoneVerified(phone: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { phone },
    select: { phoneVerifiedAt: true },
  });
  return Boolean(user?.phoneVerifiedAt);
}

/**
 * Consume a verification that just completed, for a one-shot action such as
 * placing a COD order. Deleting it prevents one verification being replayed
 * across several orders.
 */
export async function consumeVerification(
  pollToken: string,
  phone: string,
  purpose: OtpPurpose,
): Promise<boolean> {
  const c = await prisma.otpChallenge.findUnique({ where: { pollToken } });

  // Typed-code flows delete the row on success, so absence is normal there.
  // The caller has already established trust via verifyTypedCode.
  if (!c) return false;

  if (c.phone !== phone || c.purpose !== purpose || !c.verifiedAt) return false;
  if (c.expiresAt < new Date()) return false;

  await prisma.otpChallenge.delete({ where: { id: c.id } });
  return true;
}
