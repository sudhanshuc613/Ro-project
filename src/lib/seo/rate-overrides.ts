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

/* ══════════════════════════════════════════════════════════════════════════
   INTENT PRICE TABLE — admin ke rate se jodna
   ──────────────────────────────────────────────────────────────────────────
   🔴 26 Oct 2026 — owner: "admin panel se rate change karta hu to wo in sab
   jagh se change nhi hota hai."

   Wo sahi the. `/admin/rates` sirf PART_RATES badalta tha, aur PART_RATES
   sirf ads-landing ke ServicePriceGrid me dikhte the. Service page ki price
   table (/ro-filter-change-patna, /ro-repair-patna, /ro-amc-patna wagairah)
   poori HARDCODED thi — 53 row, 7 page.

   Ab un row par `rateKey` hai jo PART_RATES ke `part` se match karta hai.
   Admin me rate badla → in saari table par turant badal jaata hai.

   🔴 DO SURAKSHA:
     1. Jis row ka rateKey nahi (Free / Quoted / AMC plan) — wo CHHUA NAHI
        jaata. Wo part ka rate hai hi nahi.
     2. Admin me kuch na badla ho to string BILKUL WAHI banti hai jo abhi
        hardcoded hai. `scripts/verify-rate-sync.sh` har row par ye jaanchta
        hai — ek bhi daam badla to FAIL.
   ══════════════════════════════════════════════════════════════════════════ */

/** `₹150 – ₹300` — bilkul wahi format jo abhi hardcoded strings me hai. */
export function formatRange(from: number, to: number): string {
  const n = (x: number) => `₹${x.toLocaleString('en-IN')}`;
  return from === to ? n(from) : `${n(from)} – ${n(to)}`;
}

export interface PricedRow {
  rateKey?: string;
  item: string;
  price: string;
  note?: string;
}

/**
 * Price table ke har row par admin ka rate lagao.
 * `rateKey` na ho, ya us key ka rate na mile, to row jaisa hai waisa lautta hai.
 */
export function applyRatesToRows<T extends PricedRow>(
  rows: readonly T[],
  rates: PartRate[] | null | undefined,
): T[] {
  if (!rates?.length) return rows as T[];
  const byPart = new Map(rates.map((r) => [r.part, r]));
  return rows.map((row) => {
    if (!row.rateKey) return row;
    const r = byPart.get(row.rateKey);
    if (!r) return row;
    return { ...row, price: formatRange(r.from, r.to) };
  });
}
