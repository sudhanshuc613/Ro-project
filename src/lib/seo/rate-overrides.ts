/**
 * RATE OVERRIDES — spare parts aur service ka rate admin se badalne ke liye.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN (10 Oct 2026)
 * ──────────────────
 * Owner: "or bhi mujhe control dena mujhe jaise ki pricing wagreh sab ke
 *         controls kar saku ... ek proper ecommerce jaisa wo change karte
 *         rehte hai"
 *
 * Wo bilkul sahi hai. Abhi tak har rate badalne ke liye mujhe code edit
 * karke zip bhejni padti thi. Kal hi motor ka rate ₹900–₹1,600 se
 * ₹1,000–₹2,800 karna pada — wo ek deploy maang raha tha. Market ka rate
 * mahine me badalta hai, deploy mahine me nahi hona chahiye.
 *
 * Ab har rate `site_settings` ke `rateCard` key me rehta hai aur admin
 * `/admin/rates` se badal deta hai. Save karte hi live.
 *
 * 🔴 CODE KA RATE HI DEFAULT HAI
 * ──────────────────────────────
 * DB me kuch na ho, ya DB hi na chale — `resolveRates(null)` code ke wahi
 * rate laut aata hai jo abhi site par hain. Matlab ye badlav kabhi rate
 * gayab nahi kar sakta.
 *
 * 🔴 RANGE HI RAKHA HAI, EK NUMBER NAHI
 * ─────────────────────────────────────
 * Owner ne pehle hi kaha tha: "spare parts wagreh ka tu refence diya kar
 * itna se itna tak lag sakta hai ... man le koi customer bol dega aapne
 * waha pe to ye mention kiya hai". Isliye har rate ka `from` aur `to` dono
 * hai, aur admin UI bhi dono maangta hai — taaki koi galti se ek fix number
 * na daal de aur baad me jhagda ho.
 */

import { PART_RATES, type PartRate } from '@/lib/seo/ads-landing-data';

/** DB me jo save hota hai: part ka naam → { from, to } */
export type RateMap = Record<string, { from: number; to: number }>;

/**
 * Code ke PART_RATES par DB ka override lagao.
 * Jo part DB me nahi hai, uska code waala rate chalta rehta hai.
 */
export function resolveRates(overrides: RateMap | null | undefined): PartRate[] {
  if (!overrides) return PART_RATES;
  return PART_RATES.map((r) => {
    const o = overrides[r.part];
    if (!o) return r;
    const from = Number(o.from);
    const to = Number(o.to);
    /* Bekaar value DB me aa gayi to use ignore karo — site par kabhi
       ₹0 ya ulta range nahi dikhna chahiye. */
    if (!Number.isFinite(from) || !Number.isFinite(to)) return r;
    if (from <= 0 || to <= 0 || to < from) return r;
    return { ...r, from, to };
  });
}

/** Admin UI ke liye — abhi kya rate hai aur kya code ka default hai */
export interface RateRow extends PartRate {
  defaultFrom: number;
  defaultTo: number;
  isOverridden: boolean;
}

export function buildRateRows(overrides: RateMap | null | undefined): RateRow[] {
  const resolved = resolveRates(overrides);
  return PART_RATES.map((d, i) => ({
    ...resolved[i],
    defaultFrom: d.from,
    defaultTo: d.to,
    isOverridden: resolved[i].from !== d.from || resolved[i].to !== d.to,
  }));
}

/** Jo part naam allowed hain — DB me koi aur key na ghuse */
export const RATE_KEYS = PART_RATES.map((r) => r.part);
