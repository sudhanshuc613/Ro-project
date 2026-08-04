/**
 * AMC (Annual Maintenance Contract) engine.
 *
 * Business logic:
 *  - Customer buys a plan → contract created with N visits spread over 12 months
 *  - Each completed service visit consumes one included visit
 *  - Reminders fire 7 days before a due visit, and 30 days before expiry
 *  - Admin sees what's due this month and can renew with one click
 *
 * Revenue reasoning: a repair customer pays ₹600 once and may never return.
 * An AMC customer pays ₹2,799 upfront and is locked in for 12 months. Margin
 * per job is lower, but the revenue is predictable and retention is far higher.
 */
import { prisma } from '@/lib/db/prisma';
import { sendWhatsApp } from '@/lib/integrations/whatsapp';

export interface AmcPlan {
  key: string;
  name: string;
  price: number;
  visits: number;
  includes: string[];
  excludes: string[];
}

/** Plan catalogue — mirrors /amc-plans page. Keep in sync. */
export const AMC_PLANS: AmcPlan[] = [
  {
    key: 'BASIC',
    name: 'Basic AMC',
    price: 1499,
    visits: 2,
    includes: ['2 scheduled visits', 'Sediment + carbon filter change', 'Free TDS testing', '10% off extra parts'],
    excludes: ['RO membrane', 'Pump / SMPS'],
  },
  {
    key: 'GOLD',
    name: 'Gold AMC',
    price: 2799,
    visits: 4,
    includes: ['4 scheduled visits', 'All pre-filters', 'UV lamp replacement', 'Zero visit charge all year', '15% off extra parts'],
    excludes: ['RO membrane'],
  },
  {
    key: 'PLATINUM',
    name: 'Platinum AMC',
    price: 4499,
    visits: 4,
    includes: ['4 scheduled visits', 'All filters + RO membrane', 'UV lamp + pump coverage', 'Unlimited breakdown visits', 'Zero visit charge'],
    excludes: [],
  },
];

export const getPlan = (key: string) => AMC_PLANS.find((p) => p.key === key);

/**
 * Spread N visits evenly across 12 months, starting one interval from today.
 * 4 visits → every 3 months. 2 visits → every 6 months.
 */
export function calculateVisitSchedule(startsOn: Date, visits: number): Date[] {
  const monthsApart = Math.floor(12 / visits);
  return Array.from({ length: visits }, (_, i) => {
    const d = new Date(startsOn);
    d.setMonth(d.getMonth() + monthsApart * (i + 1));
    return d;
  });
}

interface CreateAmcArgs {
  userId: string;
  planKey: string;
  machineBrand?: string;
  machineModel?: string;
  addressId?: string;
  startsOn?: Date;
  createdByAdmin?: boolean;
}

/** Create a contract, schedule its visits, and confirm on WhatsApp. */
export async function createAmcSubscription(args: CreateAmcArgs) {
  const plan = getPlan(args.planKey);
  if (!plan) throw new Error(`Unknown AMC plan: ${args.planKey}`);

  const startsOn = args.startsOn ?? new Date();
  const endsOn = new Date(startsOn);
  endsOn.setFullYear(endsOn.getFullYear() + 1);

  const schedule = calculateVisitSchedule(startsOn, plan.visits);

  const subscription = await prisma.amcSubscription.create({
    data: {
      userId: args.userId,
      planName: plan.name,
      price: plan.price,
      visitsIncluded: plan.visits,
      visitsUsed: 0,
      machineBrand: args.machineBrand ?? null,
      machineModel: args.machineModel ?? null,
      addressId: args.addressId ?? null,
      startsOn,
      endsOn,
      nextServiceDue: schedule[0],
      isActive: true,
    },
    include: { user: { select: { fullName: true, phone: true } } },
  });

  void sendWhatsApp({
    to: `91${subscription.user.phone}`,
    template: 'amc_activated',
    variables: [
      subscription.user.fullName.split(' ')[0],
      plan.name,
      String(plan.visits),
      schedule[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    ],
    userId: args.userId,
    relatedType: 'AMC',
    relatedId: subscription.id,
  });

  return { subscription, schedule };
}

/**
 * Consume one visit. Called when a service request linked to an AMC completes.
 * Advances nextServiceDue; deactivates the contract when all visits are used.
 */
export async function consumeAmcVisit(subscriptionId: string) {
  const sub = await prisma.amcSubscription.findUnique({ where: { id: subscriptionId } });
  if (!sub || !sub.isActive) return null;

  const used = sub.visitsUsed + 1;
  const exhausted = used >= sub.visitsIncluded;

  let nextDue: Date | null = null;
  if (!exhausted) {
    const monthsApart = Math.floor(12 / sub.visitsIncluded);
    nextDue = new Date(sub.startsOn);
    nextDue.setMonth(nextDue.getMonth() + monthsApart * (used + 1));
    // Never schedule past the contract end
    if (nextDue > sub.endsOn) nextDue = null;
  }

  return prisma.amcSubscription.update({
    where: { id: subscriptionId },
    data: { visitsUsed: used, nextServiceDue: nextDue, isActive: !exhausted },
  });
}

/** Contracts with a visit due inside the window. */
export async function getVisitsDue(withinDays = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);

  return prisma.amcSubscription.findMany({
    where: { isActive: true, nextServiceDue: { not: null, lte: cutoff } },
    include: {
      user: { select: { id: true, fullName: true, phone: true } },
      address: { select: { line1: true, city: true, pincode: true } },
    },
    orderBy: { nextServiceDue: 'asc' },
  });
}

/** Contracts expiring soon — the renewal pipeline. */
export async function getExpiringContracts(withinDays = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);

  return prisma.amcSubscription.findMany({
    where: { isActive: true, endsOn: { lte: cutoff, gte: new Date() } },
    include: { user: { select: { id: true, fullName: true, phone: true } } },
    orderBy: { endsOn: 'asc' },
  });
}

/** Dashboard aggregates. */
export async function getAmcStats() {
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [active, dueThisMonth, expiringSoon, revenueAgg] = await Promise.all([
    prisma.amcSubscription.count({ where: { isActive: true } }),
    prisma.amcSubscription.count({
      where: { isActive: true, nextServiceDue: { not: null, lte: monthEnd } },
    }),
    prisma.amcSubscription.count({
      where: {
        isActive: true,
        endsOn: { lte: new Date(now.getTime() + 30 * 864e5), gte: now },
      },
    }),
    prisma.amcSubscription.aggregate({ where: { isActive: true }, _sum: { price: true } }),
  ]);

  return {
    active,
    dueThisMonth,
    expiringSoon,
    recurringRevenue: Number(revenueAgg._sum.price ?? 0),
  };
}

/** Renew for another year, resetting the visit counter. */
export async function renewAmc(subscriptionId: string) {
  const old = await prisma.amcSubscription.findUnique({
    where: { id: subscriptionId },
    include: { user: { select: { fullName: true, phone: true } } },
  });
  if (!old) throw new Error('Subscription not found');

  // Start from the later of today or the old end date — no gap, no overlap
  const startsOn = old.endsOn > new Date() ? old.endsOn : new Date();
  const endsOn = new Date(startsOn);
  endsOn.setFullYear(endsOn.getFullYear() + 1);
  const schedule = calculateVisitSchedule(startsOn, old.visitsIncluded);

  const renewed = await prisma.amcSubscription.update({
    where: { id: subscriptionId },
    data: {
      startsOn,
      endsOn,
      visitsUsed: 0,
      nextServiceDue: schedule[0],
      isActive: true,
    },
  });

  void sendWhatsApp({
    to: `91${old.user.phone}`,
    template: 'amc_renewed',
    variables: [
      old.user.fullName.split(' ')[0],
      old.planName,
      endsOn.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    ],
    userId: old.userId,
    relatedType: 'AMC',
    relatedId: subscriptionId,
  });

  return renewed;
}
