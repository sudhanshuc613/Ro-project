/**
 * Billing ke zod schemas — form aur API dono yahi use karte hain.
 *
 * Validation sirf server pe hoti hai (browser me bhi dikhti hai, par bharosa
 * server pe hi hai). Admin panel ka API internet pe khula hai; agar validation
 * sirf React me hoti to curl se kuch bhi daala ja sakta tha.
 */
import { z } from 'zod';

export const BILL_TYPES = ['SALE', 'SERVICE', 'AMC', 'INSTALLATION', 'OTHER'] as const;
export const BILL_STATUSES = ['DRAFT', 'UNPAID', 'PARTIAL', 'PAID', 'CANCELLED'] as const;
export const UNIT_STATUSES = ['ACTIVE', 'REPLACED', 'REMOVED'] as const;
export const AMC_STATUSES = ['ACTIVE', 'EXPIRED', 'CANCELLED'] as const;

/**
 * Phone ko 10 ank pe laana.
 *
 * 🔴 YAHAN EK ASLI BUG PAKDA GAYA (10 Oct 2026, test se):
 * Pehle code tha `.replace(/^(\+?91)/, '')` — yaani "91 se shuru ho to hata do".
 * Isse **9123456780 jaisa bilkul sahi mobile number toot jaata tha**: "91" hat
 * ke "23456780" bachta, 8 ank, aur validation fail. Jio/Airtel ke 91xxxxxxxx
 * series ke saare grahak ka bill banna hi band ho jaata.
 *
 * Sahi niyam: country code tabhi hatao jab hatane ke BAAD theek 10 ank bachein.
 *   +918969821440 (12 ank + plus) → 8969821440   ✅
 *   918969821440  (12 ank)        → 8969821440   ✅
 *   08969821440   (11 ank, 0 se)  → 8969821440   ✅
 *   9123456780    (10 ank)        → 9123456780   ✅ (chhua hi nahi)
 */
function normalisePhone(raw: string): string {
  let v = raw.replace(/[\s\-()./]/g, '');
  v = v.replace(/^\+/, '');
  if (v.length === 12 && v.startsWith('91')) v = v.slice(2);
  else if (v.length === 11 && v.startsWith('0')) v = v.slice(1);
  return v;
}

/** 10 ank ka Indian mobile. 6-9 se shuru — 0-5 se shuru hone wala mobile nahi hota. */
export const phoneSchema = z
  .string()
  .trim()
  .transform(normalisePhone)
  .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Phone 10 ank ka hona chahiye (6-9 se shuru)'));

export const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? normalisePhone(v) : ''))
  .refine((v) => v === '' || /^[6-9]\d{9}$/.test(v), 'Alt phone 10 ank ka hona chahiye');

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date YYYY-MM-DD me chahiye');

const optionalDateString = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Date YYYY-MM-DD me chahiye');

export const billItemSchema = z.object({
  description: z.string().trim().min(2, 'Item ka naam likhna zaroori hai').max(300),
  detailNote: z.string().trim().max(400).optional().or(z.literal('')),
  hsnCode: z.string().trim().max(12).optional().or(z.literal('')),
  brand: z.string().trim().max(80).optional().or(z.literal('')),
  model: z.string().trim().max(120).optional().or(z.literal('')),
  serialNumber: z.string().trim().max(80).optional().or(z.literal('')),
  mrp: z.coerce.number().min(0).max(99999999).optional(),
  unitPrice: z.coerce.number().min(0, 'Rate 0 se kam nahi').max(99999999),
  quantity: z.coerce.number().gt(0, 'Qty 0 se badi honi chahiye').max(100000),
});

export const clientSchema = z.object({
  fullName: z.string().trim().min(2, 'Grahak ka naam likhna zaroori hai').max(120),
  phone: phoneSchema,
  altPhone: optionalPhoneSchema,
  email: z.string().trim().email('Email galat hai').max(160).optional().or(z.literal('')),
  addressLine: z.string().trim().max(400).optional().or(z.literal('')),
  landmark: z.string().trim().max(160).optional().or(z.literal('')),
  area: z.string().trim().max(120).optional().or(z.literal('')),
  city: z.string().trim().max(80).default('Patna'),
  state: z.string().trim().max(80).default('Bihar'),
  pincode: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\d{6}$/.test(v), 'Pincode 6 ank ka hota hai'),
  gstin: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v.toUpperCase()),
      'GSTIN 15 character ka hota hai (jaise 10ABCDE1234F1Z5)',
    ),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const unitSchema = z.object({
  id: z.string().uuid().optional(),
  brand: z.string().trim().min(1, 'Brand likhna zaroori hai').max(80),
  model: z.string().trim().max(120).optional().or(z.literal('')),
  serialNumber: z.string().trim().max(80).optional().or(z.literal('')),
  capacity: z.string().trim().max(40).optional().or(z.literal('')),
  machineKind: z.enum(['DOMESTIC', 'COMMERCIAL']).default('DOMESTIC'),
  installedOn: dateString,
  partsWarrantyMonths: z.coerce.number().int().min(0).max(120).default(12),
  serviceWarrantyMonths: z.coerce.number().int().min(0).max(120).default(12),
  freeServicesTotal: z.coerce.number().int().min(0).max(60).default(4),
  freeServicesUsed: z.coerce.number().int().min(0).max(60).default(0),
  serviceIntervalDays: z.coerce.number().int().min(0).max(1000).default(90),
  lastServiceOn: optionalDateString,
  inletTds: z.coerce.number().int().min(0).max(5000).optional(),
  outletTds: z.coerce.number().int().min(0).max(5000).optional(),
  status: z.enum(UNIT_STATUSES).default('ACTIVE'),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const amcSchema = z.object({
  id: z.string().uuid().optional(),
  contractNumber: z.string().trim().max(40).optional().or(z.literal('')),
  planName: z.string().trim().min(2, 'Plan ka naam likho').max(80),
  machineBrand: z.string().trim().max(80).optional().or(z.literal('')),
  machineModel: z.string().trim().max(120).optional().or(z.literal('')),
  price: z.coerce.number().min(0).max(9999999).default(0),
  startsOn: dateString,
  endsOn: dateString,
  visitsIncluded: z.coerce.number().int().min(0).max(60).default(4),
  visitsUsed: z.coerce.number().int().min(0).max(60).default(0),
  lastVisitOn: optionalDateString,
  coversFilters: z.coerce.boolean().default(false),
  coversMembrane: z.coerce.boolean().default(false),
  status: z.enum(AMC_STATUSES).default('ACTIVE'),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const amcVisitSchema = z.object({
  contractId: z.string().uuid(),
  visitDate: dateString,
  visitType: z.enum(['ROUTINE', 'BREAKDOWN', 'FILTER', 'INSPECTION']).default('ROUTINE'),
  technicianName: z.string().trim().max(120).optional().or(z.literal('')),
  workDone: z.string().trim().max(2000).optional().or(z.literal('')),
  partsReplaced: z.string().trim().max(300).optional().or(z.literal('')),
  extraCharge: z.coerce.number().min(0).max(9999999).default(0),
  inletTds: z.coerce.number().int().min(0).max(5000).optional(),
  outletTds: z.coerce.number().int().min(0).max(5000).optional(),
});

export const billSchema = z
  .object({
    billNumber: z.string().trim().min(1, 'Bill number chahiye').max(40),
    type: z.enum(BILL_TYPES).default('SALE'),
    status: z.enum(BILL_STATUSES).default('PAID'),

    customerName: z.string().trim().min(2, 'Grahak ka naam likhna zaroori hai').max(120),
    customerPhone: phoneSchema,
    customerAltPhone: optionalPhoneSchema,
    customerAddress: z.string().trim().max(400).optional().or(z.literal('')),
    customerGstin: z.string().trim().max(15).optional().or(z.literal('')),
    /** Grahak ka master record banana/update karna hai ya nahi. */
    saveClient: z.coerce.boolean().default(true),
    clientArea: z.string().trim().max(120).optional().or(z.literal('')),
    clientPincode: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^\d{6}$/.test(v), 'Pincode 6 ank ka hota hai'),

    issueDate: dateString,
    dueDate: optionalDateString,

    items: z.array(billItemSchema).min(1, 'Kam se kam 1 item daalna hoga').max(60),

    discountAmount: z.coerce.number().min(0).max(99999999).default(0),
    taxRate: z.coerce.number().min(0).max(28).default(0),
    taxMode: z.enum(['NONE', 'CGST_SGST', 'IGST']).default('NONE'),
    roundToRupee: z.coerce.boolean().default(true),
    amountPaid: z.coerce.number().min(0).max(99999999).default(0),
    paymentMode: z.string().trim().max(24).optional().or(z.literal('')),
    paymentNote: z.string().trim().max(200).optional().or(z.literal('')),

    warrantyTemplate: z.string().trim().max(48).optional().or(z.literal('')),
    terms: z.array(z.string().trim().max(600)).max(25).default([]),

    showStamp: z.coerce.boolean().default(true),
    stampText: z.string().trim().max(40).default('APPROVED / PAID'),
    showSign: z.coerce.boolean().default(true),
    footerNote: z.string().trim().max(300).optional().or(z.literal('')),
    shareEnabled: z.coerce.boolean().default(true),
    internalNote: z.string().trim().max(2000).optional().or(z.literal('')),

    /** Bill ke saath machine record bhi banao (SALE/INSTALLATION me). */
    createUnit: z.coerce.boolean().default(false),
    unit: unitSchema.partial({ installedOn: true }).optional(),

    /** Bill ke saath AMC record bhi banao. */
    createAmc: z.coerce.boolean().default(false),
    amc: amcSchema.partial({ startsOn: true, endsOn: true }).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.createUnit) {
      if (!v.unit || !v.unit.brand) {
        ctx.addIssue({ code: 'custom', path: ['unit', 'brand'], message: 'Machine ka brand likho' });
      }
      if (!v.unit?.installedOn) {
        ctx.addIssue({ code: 'custom', path: ['unit', 'installedOn'], message: 'Install date chahiye' });
      }
    }
    if (v.createAmc) {
      if (!v.amc?.planName) {
        ctx.addIssue({ code: 'custom', path: ['amc', 'planName'], message: 'AMC plan ka naam likho' });
      }
      if (!v.amc?.startsOn || !v.amc?.endsOn) {
        ctx.addIssue({ code: 'custom', path: ['amc', 'startsOn'], message: 'AMC ki start aur end date chahiye' });
      } else if (v.amc.endsOn <= v.amc.startsOn) {
        ctx.addIssue({ code: 'custom', path: ['amc', 'endsOn'], message: 'End date start date ke baad honi chahiye' });
      }
    }
    if (v.amc && v.createAmc && (v.amc.visitsUsed ?? 0) > (v.amc.visitsIncluded ?? 0)) {
      ctx.addIssue({ code: 'custom', path: ['amc', 'visitsUsed'], message: 'Use ki gayi visits total se zyada nahi ho sakti' });
    }
  });

export type BillInput = z.infer<typeof billSchema>;
export type BillItemInput = z.infer<typeof billItemSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type UnitInput = z.infer<typeof unitSchema>;
export type AmcInput = z.infer<typeof amcSchema>;
