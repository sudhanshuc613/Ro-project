/**
 * Billing ke ganit ka test — bina server, bina DB.
 *
 * Yeh woh functions hain jinki ek galti seedha grahak ke haath me galat
 * kaagaz bhej deti hai. Isliye inka test alag se hai aur har zip se pehle
 * chalta hai.
 *
 * Chalane ka tarika:  npx tsx scripts/billing-logic-test.ts
 */
import { amountToWords, integerToWords } from '../src/lib/billing/amount-words';
import {
  computeTotals,
  deriveStatus,
  addMonths,
  addDays,
  daysBetween,
  warrantyInfo,
  contractInfo,
  nextServiceDate,
  dueState,
  money,
  billINR,
  toInputDate,
} from '../src/lib/billing/compute';
import { WARRANTY_TEMPLATES, DEFAULT_TEMPLATE_BY_TYPE, getTemplate, templatesFor } from '../src/lib/billing/warranty-templates';
import { billSchema, clientSchema, phoneSchema } from '../src/lib/billing/schema';
import { BILLING_DDL, BILLING_TABLES } from '../src/lib/billing/ddl';

let pass = 0;
let fail = 0;

function eq(name: string, got: unknown, want: unknown) {
  const g = JSON.stringify(got);
  const w = JSON.stringify(want);
  if (g === w) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name} — mila ${g}, chahiye ${w}`);
  }
}

function ok(name: string, cond: boolean, detail = '') {
  if (cond) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name} ${detail}`);
  }
}

console.log('\n── 1. Rupaye shabdon me (Indian system) ────────────────────────');
eq('27000 → owner ke bill wala exact text', amountToWords(27000), 'Twenty Seven Thousand Rupees Only');
eq('0', amountToWords(0), 'Zero Rupees Only');
eq('1', amountToWords(1), 'One Rupees Only');
eq('100', amountToWords(100), 'One Hundred Rupees Only');
eq('999', amountToWords(999), 'Nine Hundred Ninety Nine Rupees Only');
eq('1000', amountToWords(1000), 'One Thousand Rupees Only');
eq('100000 = ek lakh (million nahi)', amountToWords(100000), 'One Lakh Rupees Only');
eq('1500000 = pandrah lakh', amountToWords(1500000), 'Fifteen Lakh Rupees Only');
eq('10000000 = ek crore', amountToWords(10000000), 'One Crore Rupees Only');
eq('123456789', amountToWords(123456789), 'Twelve Crore Thirty Four Lakh Fifty Six Thousand Seven Hundred Eighty Nine Rupees Only');
eq('paise ke saath', amountToWords(1250.5), 'One Thousand Two Hundred Fifty Rupees and Fifty Paise Only');
eq('paise round', amountToWords(99.999), 'One Hundred Rupees Only');
eq('11-19 ka special case', integerToWords(15), 'Fifteen');
eq('20 ka round', integerToWords(20), 'Twenty');
eq('negative', amountToWords(-500), 'Minus Five Hundred Rupees Only');
ok('bahut bada number crash nahi karta', amountToWords(1e15).length > 0);

console.log('\n── 2. Bill ka hisaab ───────────────────────────────────────────');
{
  const t = computeTotals({ items: [{ unitPrice: 27000, quantity: 1 }], amountPaid: 27000 });
  eq('owner ka bill: subtotal', t.subtotal, 27000);
  eq('owner ka bill: grand total', t.grandTotal, 27000);
  eq('owner ka bill: balance 0', t.balanceDue, 0);
}
{
  const t = computeTotals({
    items: [
      { unitPrice: 1100, quantity: 1 },
      { unitPrice: 450, quantity: 2 },
    ],
    discountAmount: 200,
  });
  eq('do line jodna', t.subtotal, 2000);
  eq('discount lagta hai', t.grandTotal, 1800);
}
{
  const t = computeTotals({ items: [{ unitPrice: 1000, quantity: 1 }], taxRate: 18 });
  eq('GST 18% exclusive (upar lagta hai)', t.taxAmount, 180);
  eq('GST ke baad total', t.grandTotal, 1180);
}
{
  const t = computeTotals({ items: [{ unitPrice: 0.1, quantity: 3 }] });
  ok('float ka kachra nahi (0.1 × 3)', t.subtotal === 0.3, `mila ${t.subtotal}`);
}
{
  const t = computeTotals({ items: [{ unitPrice: 999.6, quantity: 1 }], roundToRupee: true });
  eq('round off hua', t.grandTotal, 1000);
  eq('round off ka value', t.roundOff, 0.4);
}
{
  const t = computeTotals({ items: [{ unitPrice: 1000, quantity: 1 }], discountAmount: 5000 });
  eq('discount subtotal se zyada nahi ho sakta', t.discountAmount, 1000);
  eq('aur total 0 se neeche nahi', t.grandTotal, 0);
}
{
  const t = computeTotals({ items: [{ unitPrice: -50, quantity: 1 }], amountPaid: -10 });
  ok('negative paid 0 ho jaata hai', t.amountPaid === 0);
}

console.log('\n── 3. Bill ki haalat khud nikalti hai ──────────────────────────');
eq('kuch nahi mila → UNPAID', deriveStatus(1000, 0), 'UNPAID');
eq('aadha mila → PARTIAL', deriveStatus(1000, 400), 'PARTIAL');
eq('poora mila → PAID', deriveStatus(1000, 1000), 'PAID');
eq('zyada mila → PAID', deriveStatus(1000, 1200), 'PAID');
eq('cancel hamesha cancel rehta hai', deriveStatus(1000, 1000, 'CANCELLED'), 'CANCELLED');
eq('draft hamesha draft rehta hai', deriveStatus(1000, 1000, 'DRAFT'), 'DRAFT');
eq('0 ka bill PAID', deriveStatus(0, 0), 'PAID');

console.log('\n── 4. Taarikh ka ganit ─────────────────────────────────────────');
eq('31 Jan + 1 mahina = 28 Feb (3 March nahi)', toInputDate(addMonths('2026-01-31', 1)), '2026-02-28');
eq('leap year: 31 Jan 2028 + 1 = 29 Feb', toInputDate(addMonths('2028-01-31', 1)), '2028-02-29');
eq('10 Oct 2026 + 12 mahine', toInputDate(addMonths('2026-10-10', 12)), '2027-10-10');
eq('30 din jodna', toInputDate(addDays('2026-10-10', 30)), '2026-11-09');
eq('do tareekh ka fark', daysBetween('2026-10-10', '2026-11-09'), 30);
eq('next service = install + 90 din', toInputDate(nextServiceDate('2026-10-10', 90)!), '2027-01-08');
eq('aakhri service se gina jaata hai', toInputDate(nextServiceDate('2026-01-01', 90, '2026-09-01')!), '2026-11-30');

console.log('\n── 5. Warranty kitni bachi ─────────────────────────────────────');
{
  const w = warrantyInfo('2026-10-10', 12, new Date('2026-10-10T12:00:00'));
  eq('aaj lagi machine → active', w.state, 'active');
  eq('end date', toInputDate(w.endsOn), '2027-10-10');
  eq('100% bachi', w.percentLeft, 100);
}
{
  const w = warrantyInfo('2025-10-10', 12, new Date('2026-10-10T12:00:00'));
  eq('theek 1 saal purani → aaj khatm', w.state, 'expiring');
  eq('0 din bache', w.daysLeft, 0);
}
{
  const w = warrantyInfo('2025-01-01', 12, new Date('2026-10-10T12:00:00'));
  eq('do saal purani → expired', w.state, 'expired');
  eq('0% bachi', w.percentLeft, 0);
}
{
  const w = warrantyInfo('2026-09-25', 1, new Date('2026-10-10T12:00:00'));
  eq('1 mahine ki warranty, 15 din bache → expiring', w.state, 'expiring');
}
eq('0 mahina → none', warrantyInfo('2026-10-10', 0).state, 'none');
eq('date hi nahi → none', warrantyInfo(null, 12).state, 'none');
{
  const c = contractInfo('2026-01-01', '2026-12-31', new Date('2026-10-10T12:00:00'));
  eq('AMC chalu hai', c.state, 'active');
  eq('AMC ke din bache', c.daysLeft, 82);
}

console.log('\n── 6. Service due ka rang ──────────────────────────────────────');
eq('kal thi → overdue', dueState('2026-10-09', new Date('2026-10-10T12:00:00')), 'overdue');
eq('aaj hai → due-soon', dueState('2026-10-10', new Date('2026-10-10T12:00:00')), 'due-soon');
eq('10 din baad → due-soon', dueState('2026-10-20', new Date('2026-10-10T12:00:00')), 'due-soon');
eq('2 mahine baad → ok', dueState('2026-12-20', new Date('2026-10-10T12:00:00')), 'ok');
eq('date hi nahi → ok', dueState(null), 'ok');

console.log('\n── 7. Paisa dikhane ka tarika ──────────────────────────────────');
eq('Indian grouping', billINR(2700000), '27,00,000');
eq('paise tabhi jab hon', billINR(1500), '1,500');
eq('paise dikhte hain', billINR(1500.5), '1,500.50');
eq('money() 2 decimal pe round', money(10.456), 10.46);
eq('money() string bhi leta hai', money('99.994'), 99.99);
eq('money() kachra → 0', money('abcd'), 0);

console.log('\n── 8. Warranty templates ───────────────────────────────────────');
ok('kam se kam 8 template hain', WARRANTY_TEMPLATES.length >= 8, `mile ${WARRANTY_TEMPLATES.length}`);
ok('har template ki key unique hai', new Set(WARRANTY_TEMPLATES.map((t) => t.key)).size === WARRANTY_TEMPLATES.length);
ok('har template me kam se kam 3 line hain', WARRANTY_TEMPLATES.every((t) => t.terms.length >= 3));
ok('har template ka adminNote bhara hai', WARRANTY_TEMPLATES.every((t) => t.adminNote.length > 20));
eq('repair wala 30 din labour + 12 mahine part', [getTemplate('REPAIR_SERVICE')!.serviceWarrantyMonths, getTemplate('REPAIR_SERVICE')!.partsWarrantyMonths], [1, 12]);
ok(
  'repair template me "30 din" likha hai',
  getTemplate('REPAIR_SERVICE')!.terms.some((t) => t.includes('30 din')),
);
ok(
  'repair template me "12 mahine" likha hai',
  getTemplate('REPAIR_SERVICE')!.terms.some((t) => t.includes('12 mahine')),
);
ok('purane "ALL parts" wording pe risk note laga hai', !!getTemplate('LEGACY_ALL_PARTS')!.riskNote);
ok(
  'naye domestic template me consumable alag likha hai',
  getTemplate('NEW_RO_DOMESTIC')!.terms.some((t) => t.toLowerCase().includes('consumable')),
);
ok(
  'naya domestic template "ALL parts" NAHI kehta',
  !getTemplate('NEW_RO_DOMESTIC')!.terms.some((t) => t.includes('ALL parts')),
);
ok('filter change pe parts warranty 0 hai', getTemplate('FILTER_CHANGE')!.partsWarrantyMonths === 0);
ok('har bill type ka default template maujood hai', Object.values(DEFAULT_TEMPLATE_BY_TYPE).every((k) => !!getTemplate(k)));
ok('SALE ke liye template milte hain', templatesFor('SALE').length >= 3);
ok('SERVICE ke liye template milte hain', templatesFor('SERVICE').length >= 3);

console.log('\n── 9. Validation (server pe) ───────────────────────────────────');
ok('sahi phone chalta hai', phoneSchema.safeParse('8969821440').success);
ok('+91 hat jaata hai', phoneSchema.safeParse('+918969821440').success);
ok('space/dash hat jaate hain', phoneSchema.safeParse('89698 21440').success);
ok('9 ank wala reject', !phoneSchema.safeParse('896982144').success);
ok('0 se shuru reject', !phoneSchema.safeParse('0969821440').success);
ok('akshar wala reject', !phoneSchema.safeParse('89698abcd0').success);
// 🔴 10 Oct 2026 — yahi bug tha: "91" se shuru hone wala SAHI 10-ank number
// country code samajh ke kaat diya jaata tha aur grahak ka bill nahi banta tha.
eq('9123456780 waisa ka waisa rehta hai', phoneSchema.safeParse('9123456780').success ? phoneSchema.parse('9123456780') : 'REJECTED', '9123456780');
eq('9199999999 bhi salaamat', phoneSchema.safeParse('9199999999').success ? phoneSchema.parse('9199999999') : 'REJECTED', '9199999999');
eq('+918969821440 → 10 ank', phoneSchema.parse('+918969821440'), '8969821440');
eq('918969821440 → 10 ank', phoneSchema.parse('918969821440'), '8969821440');
eq('08969821440 → 10 ank', phoneSchema.parse('08969821440'), '8969821440');
eq('91-8969-821440 → 10 ank', phoneSchema.parse('91-8969-821440'), '8969821440');
ok('13 ank reject', !phoneSchema.safeParse('9189698214401').success);

{
  const good = billSchema.safeParse({
    billNumber: 'INV-699',
    type: 'SALE',
    status: 'PAID',
    customerName: 'Nehal Ather',
    customerPhone: '9876543210',
    issueDate: '2026-10-10',
    items: [{ description: 'Nivisha 50 LPH Commercial RO Machine', unitPrice: 27000, quantity: 1 }],
    amountPaid: 27000,
    terms: ['Installation free'],
  });
  ok('poora sahi bill paas hota hai', good.success, good.success ? '' : JSON.stringify(good.error.flatten()));
}
ok(
  'bina item ke bill reject',
  !billSchema.safeParse({
    billNumber: 'INV-700',
    customerName: 'Test',
    customerPhone: '9876543210',
    issueDate: '2026-10-10',
    items: [],
  }).success,
);
ok(
  'galat date format reject',
  !billSchema.safeParse({
    billNumber: 'INV-701',
    customerName: 'Test',
    customerPhone: '9876543210',
    issueDate: '10/10/2026',
    items: [{ description: 'x', unitPrice: 1, quantity: 1 }],
  }).success,
);
ok(
  'qty 0 reject',
  !billSchema.safeParse({
    billNumber: 'INV-702',
    customerName: 'Test',
    customerPhone: '9876543210',
    issueDate: '2026-10-10',
    items: [{ description: 'x', unitPrice: 100, quantity: 0 }],
  }).success,
);
ok(
  'AMC ki end date start se pehle → reject',
  !billSchema.safeParse({
    billNumber: 'INV-703',
    customerName: 'Test',
    customerPhone: '9876543210',
    issueDate: '2026-10-10',
    items: [{ description: 'AMC', unitPrice: 1499, quantity: 1 }],
    createAmc: true,
    amc: { planName: 'Basic', startsOn: '2026-10-10', endsOn: '2026-01-01' },
  }).success,
);
ok('1 akshar ka naam reject', !clientSchema.safeParse({ fullName: 'A', phone: '9876543210' }).success);
ok('galat GSTIN reject', !clientSchema.safeParse({ fullName: 'Nehal Ather', phone: '9876543210', gstin: 'JUNK' }).success);
ok('sahi GSTIN chalta hai', clientSchema.safeParse({ fullName: 'Nehal Ather', phone: '9876543210', gstin: '10ABCDE1234F1Z5' }).success);
ok('5 ank ka pincode reject', !clientSchema.safeParse({ fullName: 'Nehal Ather', phone: '9876543210', pincode: '80000' }).success);
ok('sahi pincode chalta hai', clientSchema.safeParse({ fullName: 'Nehal Ather', phone: '9876543210', pincode: '800001' }).success);

console.log('\n── 10. DDL surakshit hai ───────────────────────────────────────');
ok('DDL me DROP TABLE nahi hai', !/\bDROP\s+TABLE\b/i.test(BILLING_DDL));
ok('DDL me DROP DATABASE nahi hai', !/\bDROP\s+DATABASE\b/i.test(BILLING_DDL));
ok('DDL me DELETE nahi hai', !/\bDELETE\s+FROM\b/i.test(BILLING_DDL));
ok('DDL me TRUNCATE nahi hai', !/\bTRUNCATE\b/i.test(BILLING_DDL));
ok('DDL me ALTER COLUMN nahi hai', !/\bALTER\s+COLUMN\b/i.test(BILLING_DDL));
ok('DDL me DROP COLUMN nahi hai', !/\bDROP\s+COLUMN\b/i.test(BILLING_DDL));
ok('har CREATE TABLE pe IF NOT EXISTS hai', (BILLING_DDL.match(/CREATE TABLE/g) ?? []).length === (BILLING_DDL.match(/CREATE TABLE IF NOT EXISTS/g) ?? []).length);
ok('saari 7 tables DDL me hain', BILLING_TABLES.every((t) => BILLING_DDL.includes(`"${t}"`)));
ok(
  'purani tables (users/orders/products) DDL me nahi chhedi gayi',
  !/"users"|"orders"|"products"|"amc_subscriptions"|"customer_machines"/.test(BILLING_DDL),
);

console.log('\n─────────────────────────────────────────────');
console.log(`  PASS: ${pass}   FAIL: ${fail}`);
console.log('─────────────────────────────────────────────');
if (fail > 0) process.exit(1);
