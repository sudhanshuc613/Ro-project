/**
 * ABANDONED CART RECOVERY — 3-stage WhatsApp cadence.
 * Runs every 15 min via Vercel Cron (see vercel.json) or any scheduler.
 *
 *   Stage 1 → 1 hour idle   : gentle nudge, no discount
 *   Stage 2 → 24 hours idle : social proof + stock urgency
 *   Stage 3 → 72 hours idle : 10% coupon (COMEBACK10), 48h expiry — last shot
 *
 * Guard: Authorization: Bearer $CRON_SECRET
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendWhatsApp } from '@/lib/integrations/whatsapp';
import { randomBytes } from 'crypto';
import { BRAND } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface StageConfig {
  stage: number;
  idleMs: number;
  template: string;
  withCoupon?: string;
}

const STAGES: StageConfig[] = [
  { stage: 1, idleMs: 1 * 60 * 60 * 1000,  template: 'cart_recovery_1' },
  { stage: 2, idleMs: 24 * 60 * 60 * 1000, template: 'cart_recovery_2' },
  { stage: 3, idleMs: 72 * 60 * 60 * 1000, template: 'cart_recovery_3', withCoupon: 'COMEBACK10' },
];

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const results: Record<string, number> = { stage1: 0, stage2: 0, stage3: 0, marked: 0 };

  for (const cfg of STAGES) {
    const cutoff = new Date(now - cfg.idleMs);

    const carts = await prisma.cart.findMany({
      where: {
        status: { in: ['ACTIVE', 'ABANDONED'] },
        recoveryStage: cfg.stage - 1,      // strictly sequential
        lastActivityAt: { lt: cutoff },
        subtotal: { gt: 0 },
        user: { whatsappOptIn: true, phone: { not: '' } },
      },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        items: {
          include: { product: { select: { name: true, stockQuantity: true, slug: true } } },
        },
      },
      take: 100, // batch guard
    });

    for (const cart of carts) {
      if (!cart.user?.phone || cart.items.length === 0) continue;

      // One-click restore link
      const token = cart.recoveryToken ?? randomBytes(16).toString('hex');
      const link = `${BRAND.url}/cart?recover=${token}`;

      const variables = [
        cart.user.fullName.split(' ')[0],
        String(cart.items.length),
        `₹${Number(cart.subtotal).toLocaleString('en-IN')}`,
        link,
        ...(cfg.withCoupon ? [cfg.withCoupon] : []),
      ];

      const sent = await sendWhatsApp({
        to: `91${cart.user.phone}`,
        template: cfg.template,
        variables,
        userId: cart.user.id,
        relatedType: 'CART',
        relatedId: cart.id,
        buttonUrlParam: `cart?recover=${token}`,
      });

      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          status: 'ABANDONED',
          abandonedAt: cart.abandonedAt ?? new Date(),
          recoveryStage: cfg.stage,
          recoverySentAt: new Date(),
          recoveryToken: token,
        },
      });

      // Stage 3 issues a personal, single-use coupon
      if (cfg.withCoupon && sent.ok) {
        await prisma.coupon.upsert({
          where: { code: `${cfg.withCoupon}-${cart.id.slice(0, 6).toUpperCase()}` },
          update: {},
          create: {
            code: `${cfg.withCoupon}-${cart.id.slice(0, 6).toUpperCase()}`,
            description: 'Abandoned cart recovery — 10% off',
            discountType: 'PERCENT',
            discountValue: 10,
            maxDiscount: 2000,
            minOrderValue: 999,
            usageLimitTotal: 1,
            usageLimitUser: 1,
            isRecoveryOnly: true,
            endsAt: new Date(now + 48 * 60 * 60 * 1000),
          },
        });
      }

      results[`stage${cfg.stage}`]++;
    }
  }

  // Expire carts idle for 30+ days
  const expired = await prisma.cart.updateMany({
    where: {
      status: 'ABANDONED',
      lastActivityAt: { lt: new Date(now - 30 * 864e5) },
    },
    data: { status: 'EXPIRED' },
  });
  results.marked = expired.count;

  return NextResponse.json({ success: true, processedAt: new Date().toISOString(), ...results });
}
