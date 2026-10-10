/**
 * BILLING SERVICE — bill banane/badalne ka saara server logic.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Yahan teen cheezein ek saath honi chahiye warna data jhootha ho jaata hai:
 *   1. bill + uske items                    (dono, ya koi nahi)
 *   2. grahak ka master record               (phone se dhoondo ya banao)
 *   3. machine / AMC record                  (agar bill ke saath maanga ho)
 *
 * Isliye sab kuch EK transaction me hai. Beech me network tuta to kuch bhi
 * save nahi hota — aadha bill (items ke bina) banne se bura kuch nahi.
 *
 * ROLLUP KA RULE: `billing_clients.totalBilled / totalPaid / billCount`
 * kabhi `+=` se nahi badhte. Har baar bills table se SUM() nikaal ke likhe
 * jaate hain. Kyunki bill edit bhi hota hai aur delete bhi — `+=` wale
 * counters 20 bill ke baad hamesha galat ho jaate hain.
 */
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { BILLING_DDL, BILLING_TABLES } from '@/lib/billing/ddl';
import { computeTotals, deriveStatus, money, addMonths, addDays, nextServiceDate, atMidnight } from '@/lib/billing/compute';
import { amountToWords } from '@/lib/billing/amount-words';
import type { BillInput } from '@/lib/billing/schema';

/* ── SETUP ─────────────────────────────────────────────────────────────── */

export interface SetupStatus {
  ready: boolean;
  present: string[];
  missing: string[];
  error?: string;
}

/** Kaun si billing tables bani hain. Kabhi throw nahi karta. */
export async function billingSetupStatus(): Promise<SetupStatus> {
  try {
    const rows = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ANY(${[...BILLING_TABLES]}::text[])
    `;
    const present = rows.map((r) => r.table_name).sort();
    const missing = BILLING_TABLES.filter((t) => !present.includes(t));
    return { ready: missing.length === 0, present, missing };
  } catch (e) {
    return {
      ready: false,
      present: [],
      missing: [...BILLING_TABLES],
      error: e instanceof Error ? e.message : 'DB se baat nahi ho payi',
    };
  }
}

/**
 * SQL ko alag-alag statement me kaato, `$$ ... $$` block ka dhyan rakhte hue.
 *
 * 🔴 YE KYUN CHAHIYE (10 Oct 2026, live test me pakda gaya):
 * Pehle poora DDL ek saath `prisma.$executeRawUnsafe(BILLING_DDL)` me jaa raha
 * tha. Build PASS, typecheck PASS — par asli Postgres ne mana kar diya:
 *
 *     ERROR 42601: cannot insert multiple commands into a prepared statement
 *
 * Prisma har raw query ko PREPARED STATEMENT banata hai, aur Postgres ke
 * extended protocol me ek prepared statement me sirf EK command chal sakti hai.
 * Matlab admin ka "Database taiyaar karo" button production pe fail hota aur
 * ek bhi table na banti. Ye bug sirf tab dikha jab tables girake asli button
 * ka path chalaya gaya.
 *
 * Seedha `.split(';')` kaam nahi karega — DDL me `DO $$ BEGIN ... ; ... END $$;`
 * blocks hain jinke ANDAR semicolon hai. Isliye `$$` ke andar wala semicolon
 * chhodna padta hai.
 */
export function splitSqlStatements(sql: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inDollar = false;
  let inLineComment = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];

    if (inLineComment) {
      cur += ch;
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (!inDollar && ch === '-' && sql[i + 1] === '-') {
      inLineComment = true;
      cur += ch;
      continue;
    }
    if (ch === '$' && sql[i + 1] === '$') {
      inDollar = !inDollar;
      cur += '$$';
      i++;
      continue;
    }
    if (ch === ';' && !inDollar) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur);

  // Sirf comment/khaali wale tukde hata do
  return out
    .map((s) => s.trim())
    .filter((s) => {
      const code = s
        .split('\n')
        .filter((l) => !l.trim().startsWith('--'))
        .join('\n')
        .trim();
      return code.length > 0;
    });
}

/**
 * Tables bana deta hai. Sirf CREATE ... IF NOT EXISTS — kuch drop nahi hota.
 * Dobara chalane se bhi kuch nahi bigadta.
 *
 * Ek transaction me chalta hai: Postgres me DDL transactional hai, isliye beech
 * me kuch fail hua to AADHI tables nahi banengi — ya sab, ya kuch nahi.
 */
export async function runBillingSetup(): Promise<SetupStatus> {
  const statements = splitSqlStatements(BILLING_DDL);
  if (statements.length === 0) throw new Error('DDL khaali hai');

  // Interactive form (callback) isliye, array form nahi: array form me `timeout`
  // option hota hi nahi, aur Neon jaisa remote DB 43 DDL statement me 5 s ke
  // default se zyada le sakta hai.
  await prisma.$transaction(
    async (tx) => {
      for (const stmt of statements) {
        await tx.$executeRawUnsafe(stmt);
      }
    },
    { timeout: 120_000, maxWait: 20_000 },
  );
  return billingSetupStatus();
}

/* ── BILL NUMBER ───────────────────────────────────────────────────────── */

export interface BillingConfig {
  prefix: string;
  nextNumber: number;
  padding: number;
}

/**
 * Default 699 kyun: owner ka aakhri bill INV-698 tha (uploaded PDF se).
 * Settings me badla ja sakta hai — pehla bill banane se pehle check kar lein.
 */
export const DEFAULT_BILLING_CONFIG: BillingConfig = { prefix: 'INV-', nextNumber: 699, padding: 0 };

export async function getBillingConfig(): Promise<BillingConfig> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: 'billingConfig' } });
    const v = (row?.value ?? {}) as Partial<BillingConfig>;
    return {
      prefix: typeof v.prefix === 'string' ? v.prefix : DEFAULT_BILLING_CONFIG.prefix,
      nextNumber: Number.isFinite(v.nextNumber) ? Number(v.nextNumber) : DEFAULT_BILLING_CONFIG.nextNumber,
      padding: Number.isFinite(v.padding) ? Number(v.padding) : DEFAULT_BILLING_CONFIG.padding,
    };
  } catch {
    return DEFAULT_BILLING_CONFIG;
  }
}

export async function saveBillingConfig(cfg: BillingConfig): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: 'billingConfig' },
    update: { value: cfg as unknown as Prisma.InputJsonValue },
    create: {
      key: 'billingConfig',
      value: cfg as unknown as Prisma.InputJsonValue,
      description: 'Bill number ka prefix aur agla number',
    },
  });
}

/**
 * Agla bill number suggest karta hai.
 *
 * Counter pe bharosa nahi kiya — table me jo sabse bada number pehle se hai
 * usse +1 liya jaata hai. Kyunki owner manually bhi number likh sakta hai
 * (jaise purana bill chadhate waqt INV-650), aur aise me plain counter
 * duplicate de deta. `bill_number` unique hai, duplicate = save fail.
 */
export async function suggestBillNumber(): Promise<string> {
  const cfg = await getBillingConfig();
  let maxFound = 0;
  try {
    const rows = await prisma.bill.findMany({
      where: { billNumber: { startsWith: cfg.prefix } },
      select: { billNumber: true },
      take: 2000,
      orderBy: { createdAt: 'desc' },
    });
    for (const r of rows) {
      const m = r.billNumber.slice(cfg.prefix.length).match(/(\d+)\s*$/);
      if (m) maxFound = Math.max(maxFound, parseInt(m[1], 10));
    }
  } catch {
    /* tables abhi nahi bani */
  }
  const n = Math.max(maxFound + 1, cfg.nextNumber);
  return `${cfg.prefix}${cfg.padding > 0 ? String(n).padStart(cfg.padding, '0') : String(n)}`;
}

export async function suggestContractNumber(): Promise<string> {
  const year = new Date().getFullYear();
  let count = 0;
  try {
    count = await prisma.amcRecord.count();
  } catch {
    /* table abhi nahi bani */
  }
  return `AMC-${year}-${String(count + 1).padStart(4, '0')}`;
}

/**
 * Share link ka random token.
 *
 * 🔴 base64url se hex pe badla gaya (10 Oct 2026, test me pakda gaya):
 * base64url me BADE akshar aate hain (A–Z). Hamara middleware har URL ko
 * lowercase pe 301 redirect karta hai (purana SEO fix hai, zaroori hai).
 * Natija: WhatsApp pe bheja hua link /bill/Ab3X… → /bill/ab3x… ho jaata aur
 * grahak ko 404 milta. Test me live server pe 301 dikha, tabhi pakda gaya.
 *
 * hex me sirf 0-9 a-f hain — lowercase se kabhi nahi tootega.
 * 16 bytes = 128 bit = 3.4 × 10^38 sambhavnaye. Guess karna namumkin hai.
 */
export function makePublicToken(): string {
  return randomBytes(16).toString('hex');
}

/* ── GRAHAK ────────────────────────────────────────────────────────────── */

/** Phone se grahak dhoondo, na mile to banao. Mile to khaali khaane bharo. */
async function upsertClient(
  tx: Prisma.TransactionClient,
  data: {
    fullName: string;
    phone: string;
    altPhone?: string;
    addressLine?: string;
    area?: string;
    pincode?: string;
    gstin?: string;
  },
): Promise<string> {
  const existing = await tx.billingClient.findUnique({ where: { phone: data.phone } });
  if (!existing) {
    const created = await tx.billingClient.create({
      data: {
        phone: data.phone,
        fullName: data.fullName,
        altPhone: data.altPhone || null,
        addressLine: data.addressLine || null,
        area: data.area || null,
        pincode: data.pincode || null,
        gstin: data.gstin || null,
      },
    });
    return created.id;
  }
  // Purani value kabhi khaali se overwrite nahi hoti.
  await tx.billingClient.update({
    where: { id: existing.id },
    data: {
      fullName: data.fullName || existing.fullName,
      altPhone: data.altPhone || existing.altPhone,
      addressLine: data.addressLine || existing.addressLine,
      area: data.area || existing.area,
      pincode: data.pincode || existing.pincode,
      gstin: data.gstin || existing.gstin,
    },
  });
  return existing.id;
}

/** Rollup hamesha SUM() se — kabhi += se nahi. */
export async function recalcClient(clientId: string, tx?: Prisma.TransactionClient): Promise<void> {
  const db = tx ?? prisma;
  const agg = await db.bill.aggregate({
    where: { clientId, status: { not: 'CANCELLED' } },
    _sum: { grandTotal: true, amountPaid: true },
    _count: { _all: true },
    _max: { createdAt: true },
  });
  await db.billingClient.update({
    where: { id: clientId },
    data: {
      totalBilled: agg._sum.grandTotal ?? 0,
      totalPaid: agg._sum.amountPaid ?? 0,
      billCount: agg._count._all,
      lastBillAt: agg._max.createdAt ?? null,
    },
  });
}

/* ── BILL BANAO / BADLO ────────────────────────────────────────────────── */

function billScalars(input: BillInput) {
  const totals = computeTotals({
    items: input.items,
    discountAmount: input.discountAmount,
    taxRate: input.taxRate,
    roundToRupee: input.roundToRupee,
    amountPaid: input.amountPaid,
  });
  const status = deriveStatus(totals.grandTotal, totals.amountPaid, input.status);
  return { totals, status };
}

export interface SaveBillResult {
  id: string;
  billNumber: string;
  publicToken: string;
  clientId: string | null;
  grandTotal: number;
}

export async function createBill(input: BillInput, actorId?: string | null): Promise<SaveBillResult> {
  const { totals, status } = billScalars(input);
  const token = makePublicToken();

  return prisma.$transaction(async (tx) => {
    let clientId: string | null = null;
    if (input.saveClient) {
      clientId = await upsertClient(tx, {
        fullName: input.customerName,
        phone: input.customerPhone,
        altPhone: input.customerAltPhone || undefined,
        addressLine: input.customerAddress || undefined,
        area: input.clientArea || undefined,
        pincode: input.clientPincode || undefined,
        gstin: input.customerGstin || undefined,
      });
    }

    const bill = await tx.bill.create({
      data: {
        billNumber: input.billNumber,
        type: input.type,
        status,
        clientId,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAltPhone: input.customerAltPhone || null,
        customerAddress: input.customerAddress || null,
        customerGstin: input.customerGstin || null,
        issueDate: new Date(`${input.issueDate}T00:00:00`),
        dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00`) : null,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxRate: money(input.taxRate),
        taxAmount: totals.taxAmount,
        taxMode: input.taxMode,
        roundOff: totals.roundOff,
        grandTotal: totals.grandTotal,
        amountPaid: totals.amountPaid,
        balanceDue: totals.balanceDue,
        amountInWords: amountToWords(totals.grandTotal),
        paymentMode: input.paymentMode || null,
        paymentNote: input.paymentNote || null,
        warrantyTemplate: input.warrantyTemplate || null,
        terms: input.terms ?? [],
        showStamp: input.showStamp,
        stampText: input.stampText || 'APPROVED / PAID',
        showSign: input.showSign,
        footerNote: input.footerNote || null,
        publicToken: token,
        shareEnabled: input.shareEnabled,
        internalNote: input.internalNote || null,
        createdBy: actorId ?? null,
        items: {
          create: input.items.map((it, i) => ({
            position: i,
            description: it.description,
            detailNote: it.detailNote || null,
            hsnCode: it.hsnCode || null,
            brand: it.brand || null,
            model: it.model || null,
            serialNumber: it.serialNumber || null,
            mrp: it.mrp && it.mrp > 0 ? money(it.mrp) : null,
            unitPrice: money(it.unitPrice),
            quantity: money(it.quantity),
            lineTotal: totals.lineTotals[i] ?? 0,
          })),
        },
      },
    });

    if (totals.amountPaid > 0) {
      await tx.billPayment.create({
        data: {
          billId: bill.id,
          amount: totals.amountPaid,
          mode: input.paymentMode || 'CASH',
          paidOn: new Date(`${input.issueDate}T00:00:00`),
          note: input.paymentNote || null,
        },
      });
    }

    if (clientId && input.createUnit && input.unit?.brand && input.unit.installedOn) {
      await createUnitRow(tx, clientId, bill.id, input.unit);
    }
    if (clientId && input.createAmc && input.amc?.planName && input.amc.startsOn && input.amc.endsOn) {
      await createAmcRow(tx, clientId, bill.id, input.amc);
    }

    if (clientId) await recalcClient(clientId, tx);

    return {
      id: bill.id,
      billNumber: bill.billNumber,
      publicToken: bill.publicToken,
      clientId,
      grandTotal: totals.grandTotal,
    };
  });
}

export async function updateBill(id: string, input: BillInput): Promise<SaveBillResult> {
  const { totals, status } = billScalars(input);

  return prisma.$transaction(async (tx) => {
    const before = await tx.bill.findUnique({ where: { id }, select: { clientId: true, publicToken: true } });
    if (!before) throw new Error('Bill nahi mila');

    let clientId = before.clientId;
    if (input.saveClient) {
      clientId = await upsertClient(tx, {
        fullName: input.customerName,
        phone: input.customerPhone,
        altPhone: input.customerAltPhone || undefined,
        addressLine: input.customerAddress || undefined,
        area: input.clientArea || undefined,
        pincode: input.clientPincode || undefined,
        gstin: input.customerGstin || undefined,
      });
    }

    await tx.billItem.deleteMany({ where: { billId: id } });

    const bill = await tx.bill.update({
      where: { id },
      data: {
        billNumber: input.billNumber,
        type: input.type,
        status,
        clientId,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAltPhone: input.customerAltPhone || null,
        customerAddress: input.customerAddress || null,
        customerGstin: input.customerGstin || null,
        issueDate: new Date(`${input.issueDate}T00:00:00`),
        dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00`) : null,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxRate: money(input.taxRate),
        taxAmount: totals.taxAmount,
        taxMode: input.taxMode,
        roundOff: totals.roundOff,
        grandTotal: totals.grandTotal,
        amountPaid: totals.amountPaid,
        balanceDue: totals.balanceDue,
        amountInWords: amountToWords(totals.grandTotal),
        paymentMode: input.paymentMode || null,
        paymentNote: input.paymentNote || null,
        warrantyTemplate: input.warrantyTemplate || null,
        terms: input.terms ?? [],
        showStamp: input.showStamp,
        stampText: input.stampText || 'APPROVED / PAID',
        showSign: input.showSign,
        footerNote: input.footerNote || null,
        shareEnabled: input.shareEnabled,
        internalNote: input.internalNote || null,
        items: {
          create: input.items.map((it, i) => ({
            position: i,
            description: it.description,
            detailNote: it.detailNote || null,
            hsnCode: it.hsnCode || null,
            brand: it.brand || null,
            model: it.model || null,
            serialNumber: it.serialNumber || null,
            mrp: it.mrp && it.mrp > 0 ? money(it.mrp) : null,
            unitPrice: money(it.unitPrice),
            quantity: money(it.quantity),
            lineTotal: totals.lineTotals[i] ?? 0,
          })),
        },
      },
    });

    if (clientId && input.createUnit && input.unit?.brand && input.unit.installedOn) {
      await createUnitRow(tx, clientId, bill.id, input.unit);
    }
    if (clientId && input.createAmc && input.amc?.planName && input.amc.startsOn && input.amc.endsOn) {
      await createAmcRow(tx, clientId, bill.id, input.amc);
    }

    if (clientId) await recalcClient(clientId, tx);
    if (before.clientId && before.clientId !== clientId) await recalcClient(before.clientId, tx);

    return {
      id: bill.id,
      billNumber: bill.billNumber,
      publicToken: bill.publicToken,
      clientId,
      grandTotal: totals.grandTotal,
    };
  });
}

export async function deleteBill(id: string): Promise<void> {
  const bill = await prisma.bill.findUnique({ where: { id }, select: { clientId: true } });
  await prisma.bill.delete({ where: { id } });
  if (bill?.clientId) await recalcClient(bill.clientId);
}

/* ── MACHINE / AMC ROWS ────────────────────────────────────────────────── */

type UnitPayload = {
  brand: string;
  model?: string;
  serialNumber?: string;
  capacity?: string;
  machineKind?: string;
  installedOn?: string;
  partsWarrantyMonths?: number;
  serviceWarrantyMonths?: number;
  freeServicesTotal?: number;
  freeServicesUsed?: number;
  serviceIntervalDays?: number;
  lastServiceOn?: string;
  inletTds?: number;
  outletTds?: number;
  status?: string;
  notes?: string;
};

export async function createUnitRow(
  tx: Prisma.TransactionClient,
  clientId: string,
  billId: string | null,
  u: UnitPayload,
) {
  const installedOn = new Date(`${u.installedOn}T00:00:00`);
  const pm = u.partsWarrantyMonths ?? 12;
  const sm = u.serviceWarrantyMonths ?? 12;
  const interval = u.serviceIntervalDays ?? 90;
  return tx.installedUnit.create({
    data: {
      clientId,
      billId,
      brand: u.brand,
      model: u.model || null,
      serialNumber: u.serialNumber || null,
      capacity: u.capacity || null,
      machineKind: u.machineKind || 'DOMESTIC',
      installedOn,
      partsWarrantyMonths: pm,
      serviceWarrantyMonths: sm,
      partsWarrantyEndsOn: pm > 0 ? addMonths(installedOn, pm) : null,
      serviceWarrantyEndsOn: sm > 0 ? addMonths(installedOn, sm) : null,
      freeServicesTotal: u.freeServicesTotal ?? 4,
      freeServicesUsed: u.freeServicesUsed ?? 0,
      serviceIntervalDays: interval,
      lastServiceOn: u.lastServiceOn ? new Date(`${u.lastServiceOn}T00:00:00`) : null,
      nextServiceDue: nextServiceDate(installedOn, interval, u.lastServiceOn || null),
      inletTds: u.inletTds ?? null,
      outletTds: u.outletTds ?? null,
      status: (u.status as 'ACTIVE' | 'REPLACED' | 'REMOVED') ?? 'ACTIVE',
      notes: u.notes || null,
    },
  });
}

type AmcPayload = {
  contractNumber?: string;
  planName: string;
  machineBrand?: string;
  machineModel?: string;
  price?: number;
  startsOn?: string;
  endsOn?: string;
  visitsIncluded?: number;
  visitsUsed?: number;
  lastVisitOn?: string;
  coversFilters?: boolean;
  coversMembrane?: boolean;
  status?: string;
  notes?: string;
};

export async function createAmcRow(
  tx: Prisma.TransactionClient,
  clientId: string,
  billId: string | null,
  a: AmcPayload,
) {
  const startsOn = new Date(`${a.startsOn}T00:00:00`);
  const endsOn = new Date(`${a.endsOn}T00:00:00`);
  const visits = a.visitsIncluded ?? 4;
  const used = a.visitsUsed ?? 0;

  // Visits ko saal bhar me barabar baantna: 4 visit = har 91 din.
  const spanDays = Math.max(Math.round((endsOn.getTime() - startsOn.getTime()) / 86400000), 1);
  const gap = visits > 0 ? Math.max(Math.round(spanDays / visits), 15) : 0;
  const base = a.lastVisitOn ? new Date(`${a.lastVisitOn}T00:00:00`) : startsOn;
  const due = gap > 0 ? addDays(base, gap) : null;

  let contractNumber = a.contractNumber?.trim();
  if (!contractNumber) {
    const count = await tx.amcRecord.count();
    contractNumber = `AMC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }

  return tx.amcRecord.create({
    data: {
      contractNumber,
      clientId,
      billId,
      planName: a.planName,
      machineBrand: a.machineBrand || null,
      machineModel: a.machineModel || null,
      price: money(a.price ?? 0),
      startsOn,
      endsOn,
      visitsIncluded: visits,
      visitsUsed: used,
      lastVisitOn: a.lastVisitOn ? new Date(`${a.lastVisitOn}T00:00:00`) : null,
      nextServiceDue: due && due <= endsOn ? due : null,
      coversFilters: !!a.coversFilters,
      coversMembrane: !!a.coversMembrane,
      status: (a.status as 'ACTIVE' | 'EXPIRED' | 'CANCELLED') ?? 'ACTIVE',
      notes: a.notes || null,
    },
  });
}

/** Machine ka warranty-end aur next-due dobara nikaalta hai (edit ke baad). */
export function unitDerived(u: {
  installedOn: Date | string;
  partsWarrantyMonths: number;
  serviceWarrantyMonths: number;
  serviceIntervalDays: number;
  lastServiceOn?: Date | string | null;
}) {
  const installedOn = atMidnight(u.installedOn);
  return {
    partsWarrantyEndsOn: u.partsWarrantyMonths > 0 ? addMonths(installedOn, u.partsWarrantyMonths) : null,
    serviceWarrantyEndsOn: u.serviceWarrantyMonths > 0 ? addMonths(installedOn, u.serviceWarrantyMonths) : null,
    nextServiceDue: nextServiceDate(installedOn, u.serviceIntervalDays, u.lastServiceOn ?? null),
  };
}

/* ── DASHBOARD KE NUMBERS ──────────────────────────────────────────────── */

export interface BillingStats {
  billsThisMonth: number;
  revenueThisMonth: number;
  pendingAmount: number;
  pendingCount: number;
  clients: number;
  activeUnits: number;
  activeAmc: number;
  warrantyExpiring30: number;
  amcExpiring30: number;
  serviceOverdue: number;
}

export async function getBillingStats(): Promise<BillingStats> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const in30 = addDays(now, 30);
  const today = atMidnight(now);

  const [monthAgg, pendingAgg, clients, activeUnits, activeAmc, warrantyExp, amcExp, overdue] =
    await Promise.all([
      prisma.bill.aggregate({
        where: { issueDate: { gte: monthStart }, status: { not: 'CANCELLED' } },
        _sum: { grandTotal: true },
        _count: { _all: true },
      }),
      prisma.bill.aggregate({
        where: { status: { in: ['UNPAID', 'PARTIAL'] } },
        _sum: { balanceDue: true },
        _count: { _all: true },
      }),
      prisma.billingClient.count(),
      prisma.installedUnit.count({ where: { status: 'ACTIVE' } }),
      prisma.amcRecord.count({ where: { status: 'ACTIVE', endsOn: { gte: today } } }),
      prisma.installedUnit.count({
        where: { status: 'ACTIVE', partsWarrantyEndsOn: { gte: today, lte: in30 } },
      }),
      prisma.amcRecord.count({ where: { status: 'ACTIVE', endsOn: { gte: today, lte: in30 } } }),
      prisma.installedUnit.count({ where: { status: 'ACTIVE', nextServiceDue: { lt: today } } }),
    ]);

  return {
    billsThisMonth: monthAgg._count._all,
    revenueThisMonth: Number(monthAgg._sum.grandTotal ?? 0),
    pendingAmount: Number(pendingAgg._sum.balanceDue ?? 0),
    pendingCount: pendingAgg._count._all,
    clients,
    activeUnits,
    activeAmc,
    warrantyExpiring30: warrantyExp,
    amcExpiring30: amcExp,
    serviceOverdue: overdue,
  };
}
