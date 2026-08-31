/**
 * Web Push subscription management for the owner's devices.
 *
 * GET    — is push configured, and is this browser already registered?
 * POST   — register this browser
 * DELETE — unregister this browser
 *
 * The VAPID public key is served from GET because the browser needs it to
 * build a subscription. The private key never leaves the server.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { sendPushToOwner } from '@/server/services/alert.service';

export const dynamic = 'force-dynamic';

function guard(role?: string) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY ?? null;
  const count = await prisma.pushSubscription.count().catch(() => 0);
  const devices = await prisma.pushSubscription
    .findMany({ select: { id: true, label: true, lastUsed: true }, take: 20 })
    .catch(() => []);

  return NextResponse.json({
    configured: Boolean(publicKey && process.env.VAPID_PRIVATE_KEY),
    publicKey,
    deviceCount: count,
    devices: devices.map((d) => ({
      id: d.id,
      label: d.label ?? 'Unnamed device',
      lastUsed: d.lastUsed.toISOString(),
    })),
  });
}

const subSchema = z.object({
  endpoint: z.string().url().max(500),
  keys: z.object({
    p256dh: z.string().min(10).max(200),
    auth: z.string().min(5).max(100),
  }),
  label: z.string().max(80).optional(),
  /** When true, fire a test notification straight back so the owner sees it work. */
  test: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const parsed = subSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid subscription' }, { status: 422 });
  }
  const d = parsed.data;

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint: d.endpoint },
      update: {
        p256dh: d.keys.p256dh,
        auth: d.keys.auth,
        label: d.label,
        lastUsed: new Date(),
      },
      create: {
        endpoint: d.endpoint,
        p256dh: d.keys.p256dh,
        auth: d.keys.auth,
        label: d.label,
        userId: session!.user.id,
      },
    });

    if (d.test) {
      void sendPushToOwner({
        title: '✅ Notification chalu ho gaya',
        body: 'Ab har nayi service request aur order ka alert yahan aayega.',
        link: '/admin',
        priority: 'normal',
        tag: 'test',
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/push:POST]', err);
    return NextResponse.json({ message: 'Failed to save subscription' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const endpoint = req.nextUrl.searchParams.get('endpoint');
  const id = req.nextUrl.searchParams.get('id');
  if (!endpoint && !id) {
    return NextResponse.json({ message: 'endpoint ya id chahiye' }, { status: 400 });
  }

  await prisma.pushSubscription
    .deleteMany({ where: endpoint ? { endpoint } : { id: id! } })
    .catch(() => {});

  return NextResponse.json({ success: true });
}
