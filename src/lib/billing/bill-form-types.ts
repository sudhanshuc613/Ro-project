/**
 * Bill form ka data-shape — server page aur client form dono isi ko padhte hain.
 *
 * 🔴 YEH FILE ALAG KYUN HAI (ek asli bug jo build me nahi pakda gaya):
 * Pehle `emptyItem()` seedha `BillForm.tsx` se export ho raha tha. Woh file
 * `'use client'` hai. Next.js client file ke HAR export ko ek "client
 * reference" se badal deta hai — React component ke liye yeh theek hai, par
 * ek normal function server pe function rehta hi nahi.
 *
 * Natija: `npm run build` bilkul paas ho gaya, `tsc --noEmit` bhi paas,
 * par live page khulte hi 500 —
 *     TypeError: (0 , o.S) is not a function
 * kyunki server `emptyItem()` call kar raha tha jo wahan function tha hi nahi.
 *
 * Isliye data aur helper yahan hain (koi 'use client' nahi), aur UI wahan.
 * Niyam: client file se sirf component export karo, kuch aur nahi.
 */

export interface BillItemRow {
  description: string;
  detailNote: string;
  hsnCode: string;
  brand: string;
  model: string;
  serialNumber: string;
  mrp: string;
  unitPrice: string;
  quantity: string;
}

export interface BillFormInitial {
  id?: string;
  billNumber: string;
  type: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerAltPhone: string;
  customerAddress: string;
  customerGstin: string;
  clientArea: string;
  clientPincode: string;
  issueDate: string;
  dueDate: string;
  items: BillItemRow[];
  discountAmount: string;
  taxRate: string;
  taxMode: string;
  roundToRupee: boolean;
  amountPaid: string;
  paymentMode: string;
  paymentNote: string;
  warrantyTemplate: string;
  terms: string[];
  showStamp: boolean;
  stampText: string;
  showSign: boolean;
  footerNote: string;
  shareEnabled: boolean;
  internalNote: string;
}

export const emptyItem = (): BillItemRow => ({
  description: '',
  detailNote: '',
  hsnCode: '',
  brand: '',
  model: '',
  serialNumber: '',
  mrp: '',
  unitPrice: '',
  quantity: '1',
});
