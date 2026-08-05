/**
 * RO machine health — the retention engine.
 *
 * ── THE BUSINESS IDEA ─────────────────────────────────────────────────────
 * An RO purifier has four consumables that expire on a predictable schedule.
 * Nobody remembers when theirs were last changed. So the normal cycle is:
 * water starts tasting bad → customer searches "RO service near me" → calls
 * whoever ranks first. The relationship resets every single time.
 *
 * If we hold the change dates, we can call FIRST. That converts a one-off
 * repair into a recurring customer, which is exactly how Eureka Forbes holds
 * ~23% share on service strength rather than product specs.
 *
 * ── THE INTERVALS ─────────────────────────────────────────────────────────
 * Manufacturer guidance, adjusted for Patna's groundwater. Patna borewell
 * TDS commonly runs 400-900 ppm; high sediment load shortens pre-filter life
 * versus the generic 6-month figure printed in manuals.
 *
 *   Sediment filter   6 months   (3-4 if TDS > 600 — gets adjusted below)
 *   Carbon filter     8 months
 *   RO membrane      24 months
 *   UV lamp          12 months   (lamp output decays even while it glows)
 *
 * We deliberately DON'T invent a date when one is missing. An unknown filter
 * age shows as "unknown", not as a fake overdue alert — a false alarm burns
 * more trust than a missing reminder.
 */
import type { CustomerMachine } from '@prisma/client';

export type DueState = 'ok' | 'due-soon' | 'overdue' | 'unknown';

export interface DueItem {
  key: 'sediment' | 'carbon' | 'membrane' | 'uv';
  label: string;
  intervalMonths: number;
  changedOn: Date | null;
  dueOn: Date | null;
  ageMonths: number | null;
  state: DueState;
  overdueByMonths: number;
  /** Honest cost range for this job, matching PriceComparison. */
  costRange: string;
}

export interface MachineHealth {
  id: string;
  title: string;
  brand: string;
  model: string | null;
  score: number;
  scoreLabel: string;
  dueItems: DueItem[];
  nextDue: { label: string; dueOn: Date } | null;
  warrantyActive: boolean;
  warrantyEndsOn: Date | null;
  tds: { inlet: number | null; outlet: number | null; removalPct: number | null; verdict: string | null };
}

const BASE_INTERVALS = {
  sediment: 6,
  carbon: 8,
  membrane: 24,
  uv: 12,
} as const;

const LABELS = {
  sediment: 'Sediment filter',
  carbon: 'Carbon filter',
  membrane: 'RO membrane',
  uv: 'UV lamp',
} as const;

const COSTS = {
  sediment: '₹450 – ₹600',
  carbon: '₹450 – ₹600',
  membrane: '₹1,200 – ₹2,400',
  uv: '₹700 – ₹1,200',
} as const;

/** Whole months between two dates (calendar-aware, not 30-day arithmetic). */
function monthsBetween(from: Date, to: Date): number {
  let m = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) m -= 1;
  return m;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  // Handle 31 Jan + 1 month → 28/29 Feb rather than rolling into March
  if (d.getMonth() !== ((targetMonth % 12) + 12) % 12) d.setDate(0);
  return d;
}

/**
 * High TDS chews through pre-filters faster. Patna borewell water commonly
 * sits 400-900 ppm, so this is a real adjustment, not a theoretical one.
 */
function adjustedInterval(key: keyof typeof BASE_INTERVALS, inletTds: number | null): number {
  const base = BASE_INTERVALS[key];
  if (!inletTds) return base;
  if (key === 'sediment' || key === 'carbon') {
    if (inletTds >= 900) return Math.max(3, Math.round(base * 0.55));
    if (inletTds >= 600) return Math.max(4, Math.round(base * 0.7));
  }
  if (key === 'membrane' && inletTds >= 900) return Math.round(base * 0.75);
  return base;
}

export function computeMachineHealth(m: CustomerMachine): MachineHealth {
  const now = new Date();
  const inletTds = m.inletTds ?? null;

  const sources: Record<keyof typeof BASE_INTERVALS, Date | null> = {
    sediment: m.sedimentChangedOn ?? m.installedDate ?? null,
    carbon: m.carbonChangedOn ?? m.installedDate ?? null,
    membrane: m.membraneChangedOn ?? m.installedDate ?? null,
    uv: m.uvChangedOn ?? m.installedDate ?? null,
  };

  const hasUv = m.purificationTech.some((t) => t.toUpperCase().includes('UV'));

  const dueItems: DueItem[] = (Object.keys(BASE_INTERVALS) as (keyof typeof BASE_INTERVALS)[])
    .filter((key) => key !== 'uv' || hasUv)
    .map((key) => {
      const changedOn = sources[key];
      const intervalMonths = adjustedInterval(key, inletTds);

      if (!changedOn) {
        return {
          key, label: LABELS[key], intervalMonths, changedOn: null, dueOn: null,
          ageMonths: null, state: 'unknown' as DueState, overdueByMonths: 0,
          costRange: COSTS[key],
        };
      }

      const ageMonths = monthsBetween(changedOn, now);
      const dueOn = addMonths(changedOn, intervalMonths);
      const monthsLeft = monthsBetween(now, dueOn);

      let state: DueState = 'ok';
      if (ageMonths >= intervalMonths) state = 'overdue';
      else if (monthsLeft <= 1) state = 'due-soon';

      return {
        key, label: LABELS[key], intervalMonths, changedOn, dueOn, ageMonths, state,
        overdueByMonths: Math.max(0, ageMonths - intervalMonths),
        costRange: COSTS[key],
      };
    });

  // Score: start at 100, subtract for each lapsed item. Unknowns cost a
  // little because an unknown machine genuinely is less well looked after.
  let score = 100;
  for (const d of dueItems) {
    if (d.state === 'overdue') score -= Math.min(30, 12 + d.overdueByMonths * 4);
    else if (d.state === 'due-soon') score -= 6;
    else if (d.state === 'unknown') score -= 5;
  }
  score = Math.max(10, Math.min(100, score));

  const scoreLabel =
    score >= 85 ? 'Healthy' : score >= 65 ? 'Needs a check' : score >= 40 ? 'Service due' : 'Overdue';

  const upcoming = dueItems
    .filter((d): d is DueItem & { dueOn: Date } => d.dueOn != null && d.state !== 'overdue')
    .sort((a, b) => a.dueOn.getTime() - b.dueOn.getTime())[0];

  const removalPct =
    m.inletTds && m.outletTds && m.inletTds > 0
      ? Math.round(((m.inletTds - m.outletTds) / m.inletTds) * 100)
      : null;

  // BIS 10500 says <500 ppm is acceptable, <300 is good drinking water.
  let verdict: string | null = null;
  if (m.outletTds != null) {
    if (m.outletTds < 50) verdict = 'Very low — consider a TDS controller for taste and minerals';
    else if (m.outletTds <= 150) verdict = 'Ideal drinking water';
    else if (m.outletTds <= 300) verdict = 'Good';
    else if (m.outletTds <= 500) verdict = 'Acceptable, but membrane may be weakening';
    else verdict = 'Too high — membrane likely needs replacement';
  }

  return {
    id: m.id,
    title: m.nickname || `${m.brand}${m.model ? ` ${m.model}` : ''}`,
    brand: m.brand,
    model: m.model,
    score,
    scoreLabel,
    dueItems,
    nextDue: upcoming ? { label: upcoming.label, dueOn: upcoming.dueOn } : null,
    warrantyActive: m.warrantyEndsOn ? new Date(m.warrantyEndsOn) > now : false,
    warrantyEndsOn: m.warrantyEndsOn,
    tds: { inlet: m.inletTds, outlet: m.outletTds, removalPct, verdict },
  };
}

/**
 * Earliest upcoming due date across all consumables — written back to
 * next_service_due so the admin panel and cron can query it cheaply
 * instead of recomputing health for every machine.
 */
export function nextServiceDueDate(m: CustomerMachine): Date | null {
  const health = computeMachineHealth(m);
  const overdue = health.dueItems.find((d) => d.state === 'overdue');
  if (overdue?.dueOn) return overdue.dueOn;
  return health.nextDue?.dueOn ?? null;
}
