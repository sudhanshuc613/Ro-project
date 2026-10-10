/**
 * BILLING KA GANIT — ek hi jagah.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Har hisaab yahin hota hai: form me bhi, API me bhi, print page pe bhi.
 * Agar form apna total nikaale aur server apna, to kabhi na kabhi dono alag
 * honge aur grahak ke haath me galat bill chala jayega. Isliye teenon jagah
 * yahi functions call hote hain — koi doosri jagah `a * b` likha hua nahi hai.
 *
 * PAISE KA RULE: har paisa 2 decimal pe round hota hai, har step ke baad.
 * JavaScript me 0.1 + 0.2 = 0.30000000000000004 hota hai; bina round kiye
 * 50 line ka bill ₹0.03 off ho jaata hai aur grahak wahi pakadta hai.
 */

export interface LineInput {
  unitPrice: number | string;
  quantity: number | string;
}

export interface TotalsInput {
  items: LineInput[];
  discountAmount?: number | string;
  /** 0 = GST nahi. 5 / 12 / 18 = GST %. */
  taxRate?: number | string;
  /** true = nearest rupee pe round off karo (cash business me normal hai). */
  roundToRupee?: boolean;
  amountPaid?: number | string;
}

export interface TotalsOutput {
  subtotal: number;
  discountAmount: number;
  taxableValue: number;
  taxAmount: number;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  lineTotals: number[];
}

export function money(v: number | string | null | undefined): number {
  const n = typeof v === 'string' ? parseFloat(v) : (v ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

/**
 * GST yahan EXCLUSIVE hai (daam ke upar lagta hai), inclusive nahi.
 *
 * Kyun: ek RO dukaan ka 90% bill bina GST ka hota hai (taxRate = 0) aur jab
 * GST lagta hai to grahak alag se dekhna chahta hai ki "27,000 + 18% = 31,860".
 * `splitGST()` format.ts me inclusive model use karta hai — woh product
 * catalog ke MRP ke liye sahi hai, counter bill ke liye nahi. Dono alag
 * maqsad ke hain, isliye alag rakhe gaye.
 */
export function computeTotals(input: TotalsInput): TotalsOutput {
  const lineTotals = input.items.map((it) => money(money(it.unitPrice) * money(it.quantity)));
  const subtotal = money(lineTotals.reduce((a, b) => a + b, 0));

  const rawDiscount = money(input.discountAmount);
  const discountAmount = money(Math.min(Math.max(rawDiscount, 0), subtotal));

  const taxableValue = money(subtotal - discountAmount);
  const taxRate = money(input.taxRate);
  const taxAmount = money((taxableValue * taxRate) / 100);

  const beforeRound = money(taxableValue + taxAmount);
  const rounded = input.roundToRupee ? Math.round(beforeRound) : beforeRound;
  const roundOff = money(rounded - beforeRound);
  const grandTotal = money(rounded);

  const amountPaid = money(Math.max(money(input.amountPaid), 0));
  const balanceDue = money(grandTotal - amountPaid);

  return {
    subtotal,
    discountAmount,
    taxableValue,
    taxAmount,
    roundOff,
    grandTotal,
    amountPaid,
    balanceDue,
    lineTotals,
  };
}

/** Paid/partial/unpaid khud nikal aata hai — admin ko manually set nahi karna padta. */
export function deriveStatus(
  grandTotal: number,
  amountPaid: number,
  current?: string | null,
): 'DRAFT' | 'UNPAID' | 'PARTIAL' | 'PAID' | 'CANCELLED' {
  if (current === 'CANCELLED') return 'CANCELLED';
  if (current === 'DRAFT') return 'DRAFT';
  const g = money(grandTotal);
  const p = money(amountPaid);
  if (g <= 0) return 'PAID';
  if (p <= 0) return 'UNPAID';
  if (p + 0.009 >= g) return 'PAID';
  return 'PARTIAL';
}

/* ── TAARIKH KA HISAAB ──────────────────────────────────────────────────── */

/** Date ko local-midnight pe le aata hai taaki timezone se din na khiske. */
export function atMidnight(d: Date | string): Date {
  const x = typeof d === 'string' ? new Date(d) : new Date(d.getTime());
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Mahine jodna, mahine ke aakhiri din ko sambhaal ke.
 * 31 Jan + 1 mahina = 28 Feb (31 Feb nahi, aur 3 March bhi nahi).
 * JS ka default setMonth 31 Jan + 1 ko 3 March bana deta hai — yeh galat
 * warranty expiry deta, isliye clamp kiya gaya hai.
 */
export function addMonths(date: Date | string, months: number): Date {
  const d = atMidnight(date);
  if (!months) return d;
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  target.setHours(0, 0, 0, 0);
  return target;
}

export function addDays(date: Date | string, days: number): Date {
  const d = atMidnight(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysBetween(from: Date | string, to: Date | string): number {
  return Math.round((atMidnight(to).getTime() - atMidnight(from).getTime()) / 86400000);
}

/* ── WARRANTY KI HAALAT ─────────────────────────────────────────────────── */

export type WarrantyState = 'active' | 'expiring' | 'expired' | 'none';

export interface WarrantyInfo {
  state: WarrantyState;
  endsOn: Date | null;
  daysLeft: number;
  /** 0–100 — progress bar ke liye. 100 = abhi lagi hai, 0 = khatm. */
  percentLeft: number;
  label: string;
}

/**
 * "Kitni warranty bachi hai" — owner ka asli sawaal.
 * `expiring` = 30 din ya kam bache. Yahi woh window hai jisme AMC bechna
 * sabse aasan hota hai, isliye alag state banayi gayi hai.
 */
export function warrantyInfo(
  startedOn: Date | string | null | undefined,
  months: number,
  today: Date = new Date(),
): WarrantyInfo {
  if (!startedOn || !months || months <= 0) {
    return { state: 'none', endsOn: null, daysLeft: 0, percentLeft: 0, label: 'Warranty nahi' };
  }
  const start = atMidnight(startedOn);
  const end = addMonths(start, months);
  const now = atMidnight(today);
  const daysLeft = daysBetween(now, end);
  const totalDays = Math.max(daysBetween(start, end), 1);
  const percentLeft = Math.max(0, Math.min(100, Math.round((daysLeft / totalDays) * 100)));

  if (daysLeft < 0) {
    return {
      state: 'expired',
      endsOn: end,
      daysLeft,
      percentLeft: 0,
      label: `${Math.abs(daysLeft)} din pehle khatm`,
    };
  }
  if (daysLeft <= 30) {
    return {
      state: 'expiring',
      endsOn: end,
      daysLeft,
      percentLeft,
      label: daysLeft === 0 ? 'Aaj khatm' : `${daysLeft} din bache`,
    };
  }
  const monthsLeft = Math.floor(daysLeft / 30);
  return {
    state: 'active',
    endsOn: end,
    daysLeft,
    percentLeft,
    label: monthsLeft >= 1 ? `${monthsLeft} mahine ${daysLeft % 30} din bache` : `${daysLeft} din bache`,
  };
}

/** AMC bhi wahi logic, par din me (start–end dono DB me hain). */
export function contractInfo(
  startsOn: Date | string,
  endsOn: Date | string,
  today: Date = new Date(),
): WarrantyInfo {
  const start = atMidnight(startsOn);
  const end = atMidnight(endsOn);
  const now = atMidnight(today);
  const daysLeft = daysBetween(now, end);
  const totalDays = Math.max(daysBetween(start, end), 1);
  const percentLeft = Math.max(0, Math.min(100, Math.round((daysLeft / totalDays) * 100)));

  if (daysLeft < 0) {
    return { state: 'expired', endsOn: end, daysLeft, percentLeft: 0, label: `${Math.abs(daysLeft)} din pehle khatm` };
  }
  if (daysLeft <= 30) {
    return { state: 'expiring', endsOn: end, daysLeft, percentLeft, label: daysLeft === 0 ? 'Aaj khatm' : `${daysLeft} din bache` };
  }
  const monthsLeft = Math.floor(daysLeft / 30);
  return { state: 'active', endsOn: end, daysLeft, percentLeft, label: `${monthsLeft} mahine bache` };
}

/**
 * Agli service kab due hai.
 * Aakhri service hui ho to usse, warna install date se gina jaata hai.
 */
export function nextServiceDate(
  installedOn: Date | string,
  intervalDays: number,
  lastServiceOn?: Date | string | null,
): Date | null {
  if (!intervalDays || intervalDays <= 0) return null;
  const base = lastServiceOn ? atMidnight(lastServiceOn) : atMidnight(installedOn);
  return addDays(base, intervalDays);
}

export type DueState = 'overdue' | 'due-soon' | 'ok';

export function dueState(due: Date | string | null | undefined, today: Date = new Date()): DueState {
  if (!due) return 'ok';
  const d = daysBetween(today, due);
  if (d < 0) return 'overdue';
  if (d <= 15) return 'due-soon';
  return 'ok';
}

/** YYYY-MM-DD — <input type="date"> ke liye, bina timezone khiske. */
export function toInputDate(d: Date | string | null | undefined): string {
  if (!d) return '';
  const x = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(x.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
}

/** "10 October 2026" — bill pe isi tarah chhapta hai. */
export function longDateIN(d: Date | string | null | undefined): string {
  if (!d) return '';
  const x = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(x.getTime())) return '';
  return x.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Bill pe ₹ ke saath Indian grouping, bina paise (ya paise ke saath agar hain). */
export function billINR(v: number | string | null | undefined): string {
  const n = money(v);
  const hasPaise = Math.abs(n - Math.round(n)) > 0.004;
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  });
}
