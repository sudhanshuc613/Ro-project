/**
 * Dynamic site settings — DB-driven, admin-editable, no redeploy needed.
 *
 * WHY: phone numbers, visit charge, banners and hours were hardcoded in
 * constants.ts. Changing them meant editing code + redeploying. Now they live
 * in the `site_settings` table and the admin panel edits them live.
 *
 * constants.ts remains the FALLBACK — if the DB is unreachable or a key is
 * missing, the site still renders with sane values instead of crashing.
 */
import { prisma } from '@/lib/db/prisma';
import { CONTACT, SERVICE, SHIPPING } from '@/lib/constants';
import { unstable_cache } from 'next/cache';

export interface ContactSettings {
  primaryPhone: string;
  secondaryPhone: string;
  tertiaryPhone: string;
  whatsapp: string;
  email: string;
  hours: string;
}

export interface ServiceSettings {
  visitCharge: number;
  emergencyCharge: number;
  responseTime: string;
  warrantyDays: number;
  city: string;
  state: string;
}

/**
 * Payment channel configuration — controlled from /admin/settings.
 *
 * WHY THIS EXISTS: the owner may not have a Razorpay account on day one, or
 * may want to switch a method off during a bank issue. Hardcoding payment
 * options means a code change + redeploy every time. These are switches.
 *
 * MANUAL UPI: the honest option for a business without a gateway. Customer
 * pays to the owner's UPI ID and enters the 12-digit reference. Admin verifies
 * against their bank app and marks the order paid. Not automatic, but real
 * money moves — unlike mock mode.
 */
export interface PaymentSettings {
  codEnabled: boolean;
  codMaxOrder: number;
  codCharge: number;
  razorpayEnabled: boolean;
  upiManualEnabled: boolean;
  upiId: string;
  upiName: string;
  bankTransferEnabled: boolean;
  bankDetails: string;
  paymentNote: string;
}

export interface BannerSettings {
  heroHeadline: string;
  heroSubline: string;
  heroImage: string;
  announcementText: string;
  announcementActive: boolean;
}

const FALLBACK_CONTACT: ContactSettings = {
  primaryPhone: CONTACT.primaryPhone,
  secondaryPhone: CONTACT.secondaryPhone,
  tertiaryPhone: '9534037266',
  whatsapp: CONTACT.whatsapp,
  email: CONTACT.email,
  hours: CONTACT.hours,
};

const FALLBACK_SERVICE: ServiceSettings = {
  visitCharge: SERVICE.visitCharge,
  emergencyCharge: 299,
  responseTime: SERVICE.responseTime,
  warrantyDays: SERVICE.warrantyDays,
  city: SERVICE.city,
  state: SERVICE.state,
};

const FALLBACK_PAYMENT: PaymentSettings = {
  // COD on, gateway off: matches reality until Razorpay keys are added.
  codEnabled: true,
  codMaxOrder: SHIPPING.codMaxOrder,
  codCharge: SHIPPING.codCharge,
  razorpayEnabled: false,
  upiManualEnabled: false,
  upiId: '',
  upiName: 'AquaNexa Water Solutions',
  bankTransferEnabled: false,
  bankDetails: '',
  paymentNote: '',
};

const FALLBACK_BANNER: BannerSettings = {
  heroHeadline: 'RO Service in Patna',
  heroSubline: `Visit Charge Only ₹${SERVICE.visitCharge}`,
  heroImage: '/banners/service-tech.png',
  announcementText: `RO Service in Patna — Visit charge only ₹${SERVICE.visitCharge} · Same-day visit`,
  announcementActive: true,
};

/** Raw fetch of one settings key. Never throws. */
async function fetchSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    if (!row?.value) return fallback;
    // Merge so a partially-filled DB row still gets defaults for missing fields
    return { ...fallback, ...(row.value as object) } as T;
  } catch {
    return fallback;
  }
}

/**
 * Cached readers. `unstable_cache` keeps these out of the request path;
 * admin writes call revalidateSettings() to bust the cache instantly.
 */
export const getContactSettings = unstable_cache(
  () => fetchSetting<ContactSettings>('contact', FALLBACK_CONTACT),
  ['settings:contact'],
  { tags: ['settings'], revalidate: 3600 },
);

export const getServiceSettings = unstable_cache(
  () => fetchSetting<ServiceSettings>('service', FALLBACK_SERVICE),
  ['settings:service'],
  { tags: ['settings'], revalidate: 3600 },
);

export const getBannerSettings = unstable_cache(
  () => fetchSetting<BannerSettings>('banner', FALLBACK_BANNER),
  ['settings:banner'],
  { tags: ['settings'], revalidate: 3600 },
);

export const getPaymentSettings = unstable_cache(
  () => fetchSetting<PaymentSettings>('payment', FALLBACK_PAYMENT),
  ['settings:payment'],
  { tags: ['settings'], revalidate: 3600 },
);

/** Everything at once — used by layouts that need all of them. */
export async function getAllSettings() {
  const [contact, service, banner, payment] = await Promise.all([
    getContactSettings(),
    getServiceSettings(),
    getBannerSettings(),
    getPaymentSettings(),
  ]);
  return { contact, service, banner, payment, shipping: SHIPPING };
}

/**
 * Payment methods the customer may actually pick right now.
 *
 * Razorpay is filtered out unless BOTH the admin switch is on AND live keys
 * exist — otherwise a customer would reach a dead checkout. This is the guard
 * that stops "pay online" from silently failing in production.
 */
export async function getAvailablePaymentMethods(orderTotal: number, codAllowedForPin = true) {
  const p = await getPaymentSettings();
  const hasRazorpayKeys = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

  return {
    razorpay: p.razorpayEnabled && hasRazorpayKeys,
    upiManual: p.upiManualEnabled && Boolean(p.upiId),
    bankTransfer: p.bankTransferEnabled && Boolean(p.bankDetails),
    cod: p.codEnabled && codAllowedForPin && orderTotal <= p.codMaxOrder,
    settings: p,
    razorpayConfigured: hasRazorpayKeys,
  };
}

/* ── Helpers used across components ───────────────────────────────────────── */

export const telLink = (phone: string) => `tel:+91${phone.replace(/\D/g, '')}`;

export const waLink = (whatsapp: string, msg = 'Hi AquaNexa, I need RO service in Patna.') =>
  `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;

/** All active phone numbers, in call-priority order. Blank entries dropped. */
export function allPhones(c: ContactSettings): string[] {
  return [c.primaryPhone, c.secondaryPhone, c.tertiaryPhone].filter(Boolean);
}
