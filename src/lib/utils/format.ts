/**
 * Shared formatting + ID generation helpers.
 */
import { prisma } from '@/lib/db/prisma';

/** ₹8,499 — Indian digit grouping (lakh/crore aware) */
export function formatINR(amount: number | string, showDecimals = false): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(n)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(n);
}

/** 1250000 → "12.5 L"  |  25000000 → "2.5 Cr" — for dashboard KPI cards */
export function compactINR(amount: number): string {
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)} Cr`;
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(2)} L`;
  if (amount >= 1e3) return `₹${(amount / 1e3).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 180);
}

export function discountPercent(mrp: number, price: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Sequential, human-readable business IDs.
 *   AQN-2026-000148  (orders)
 *   SRV-2026-00421   (service tickets)
 *
 * Uses a per-year count; wrap in a transaction under heavy concurrency
 * or switch to a Postgres SEQUENCE if you exceed ~10 orders/second.
 */
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const count = await prisma.order.count({ where: { placedAt: { gte: start } } });
  return `AQN-${year}-${String(count + 1).padStart(6, '0')}`;
}

export async function generateTicketNumber(prefix = 'SRV'): Promise<string> {
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const count = await prisma.serviceRequest.count({ where: { createdAt: { gte: start } } });
  return `${prefix}-${year}-${String(count + 1).padStart(5, '0')}`;
}

/** "2 hours ago" / "in 3 days" — admin tables & order timelines */
export function relativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536e6], ['month', 2592e6], ['day', 864e5],
    ['hour', 36e5], ['minute', 6e4], ['second', 1e3],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === 'second') return rtf.format(Math.round(diff / ms), unit);
  }
  return 'just now';
}

export function formatDateIN(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Mask a phone for public display: 8969821440 → 89698•••40 */
export function maskPhone(phone: string): string {
  if (phone.length < 10) return phone;
  return `${phone.slice(0, 5)}•••${phone.slice(-2)}`;
}

/** GST split for invoices — intra-state (Bihar) = CGST+SGST, else IGST */
export function splitGST(amount: number, rate: number, isIntraState: boolean) {
  const tax = (amount * rate) / (100 + rate); // tax-inclusive MRP model
  return isIntraState
    ? { cgst: tax / 2, sgst: tax / 2, igst: 0, total: tax }
    : { cgst: 0, sgst: 0, igst: tax, total: tax };
}
