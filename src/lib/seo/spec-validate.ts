/**
 * SPEC VALIDATOR — galat value ko SAVE se pehle pakad leta hai.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 KYUN BANAYA (9 Oct 2026) — asli ghatna se
 * ────────────────────────────────────────────
 * Owner ne admin se ek naya product add kiya: "Apple Alfa 12L RO UV UF TDS
 * Alkaline Copper". Page live hone ke baad maine check kiya to spec table me
 * teen value galat thi:
 *
 *     Power Consumption : ₹30 to ₹60     ← bijli ka KHARCHA daal diya,
 *                                           jabki yahan WATT aana chahiye
 *     Technology        : Korea          ← ye country of origin hai,
 *                                           technology nahi
 *     Membrane Type     : csm            ← CSM asli brand hai par adhoora,
 *                                           GPD rating missing
 *
 * Ye koi code ka bug nahi tha. Form ne jo bhara gaya wahi maan liya, kyunki
 * spec value par koi jaanch thi hi nahi — sirf "khaali to nahi hai" dekha
 * jaata tha.
 *
 * NUKSAN KYA HOTA HAI
 * ───────────────────
 *   • Spec table hi long-tail search pakadta hai — "12 litre ro purifier",
 *     "2000 tds ro", "100 gpd membrane". "Technology: Korea" par koi search
 *     nahi karta, wo row poori barbaad gayi.
 *   • Google Merchant / Shopping feed inhi fields se banta hai. Galat unit
 *     wali row feed me disapproval la sakti hai.
 *   • Customer product page par "Power: ₹30 to ₹60" padh kar confuse hota
 *     hai — aur wahi banda call par bhi bharosa kam karta hai.
 *
 * YE FILE KYA KARTI HAI
 * ─────────────────────
 * Har spec key ke liye ek expectation likhi hai — kaunsa unit, kaunsa
 * pattern, kaunsi value bilkul galat jagah par hai. Form me type karte hi
 * warning dikh jaati hai, aur jahan possible ho wahan ek-click "theek karo"
 * suggestion bhi milta hai.
 *
 * 🔴 YE SAVE KO ROKTA NAHI
 * ────────────────────────
 * Jaan-boojh kar sirf WARNING hai, hard block nahi. Wajah: koi aisa product
 * aa sakta hai jiska spec sach me alag ho, aur tab form admin ko phasa dega.
 * Warning dikhti hai, decision admin ka. Par ab galti CHUPKE se nahi hogi.
 */

export type SpecIssueLevel = 'error' | 'warn';

export interface SpecIssue {
  level: SpecIssueLevel;
  /** Kya galat hai — seedhi bhasha me */
  message: string;
  /** Agar hum pakka sahi value bana sakte hain to wo, warna null */
  suggestion: string | null;
}

/** Desi + international country naam — Technology/Material jaisi field me ye galat hain. */
const COUNTRIES = [
  'india', 'korea', 'south korea', 'china', 'japan', 'taiwan', 'usa', 'us',
  'america', 'germany', 'italy', 'malaysia', 'thailand', 'vietnam', 'indonesia',
  'bharat', 'made in india', 'made in china', 'imported',
];

/** Paisa ka nishaan — kuch field me ye hona hi nahi chahiye. */
const MONEY = /(?:₹|rs\.?\s|inr\b)/i;

/** Ek number nikaalo, kuch bhi ho string me. */
function firstNumber(v: string): number | null {
  const m = v.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

/* ══════════════════════════════════════════════════════════════════════════
   HAR SPEC KEY KA NIYAM
   ══════════════════════════════════════════════════════════════════════════ */
type Rule = (value: string, productName: string) => SpecIssue | null;

const RULES: Record<string, Rule> = {
  'Power Consumption': (v, name) => {
    if (MONEY.test(v)) {
      /* 🔴 Yahan jo number likha hai wo RUPEE ka hai — usse watt banana galat
         hoga ("₹30 to ₹60" ka matlab 30 W bilkul nahi hai). Isliye number
         ignore karke product ke naam se standard wattage suggest karte hain. */
      return {
        level: 'error',
        message:
          'Yahan bijli ka KHARCHA nahi, machine ka WATTAGE aata hai. ' +
          'Box ya datasheet par "W" ya "Watt" likha hota hai (ghar ke RO me aam taur par 24–60 W). ' +
          'Bijli ka kharcha batana ho to uske liye alag row banao.',
        suggestion: wattFromName(name),
      };
    }
    if (!/\b(w|watt|watts)\b/i.test(v)) {
      return {
        level: 'warn',
        message: 'Unit "W" likhna zaroori hai — jaise "60 W". Bina unit ke Google Shopping isko padh nahi paata.',
        suggestion: firstNumber(v) ? `${firstNumber(v)} W` : null,
      };
    }
    const n = firstNumber(v);
    if (n && (n < 5 || n > 500)) {
      return {
        level: 'warn',
        message: `${n} W ajeeb lag raha hai. Ghar ke RO me 24–60 W, commercial plant me 300–2000 W hota hai.`,
        suggestion: null,
      };
    }
    return null;
  },

  Technology: (v, name) => {
    if (COUNTRIES.includes(v.trim().toLowerCase())) {
      const tech = techFromName(name);
      return {
        level: 'error',
        message:
          'Ye country of origin hai, technology nahi. Yahan purification stages aate hain — ' +
          'RO, UV, UF, TDS Controller, Alkaline, Copper waghera. Country ke liye alag row banao: "Country of Origin".',
        suggestion: tech,
      };
    }
    if (!/\b(ro|uv|uf|tds|alkaline|copper|mineral|gravity|zinc)\b/i.test(v)) {
      return {
        level: 'warn',
        message: 'Isme kam se kam ek purification stage hona chahiye — RO / UV / UF / TDS / Alkaline / Copper.',
        suggestion: techFromName(name),
      };
    }
    return null;
  },

  'Membrane Type': (v) => {
    if (MONEY.test(v)) {
      return { level: 'error', message: 'Yahan rate nahi, membrane ka type aata hai.', suggestion: '75 GPD TFC (Thin Film Composite)' };
    }
    if (!/gpd/i.test(v)) {
      return {
        level: 'warn',
        message:
          'GPD rating likhna zaroori hai — wahi batata hai machine kitna paani banayegi. ' +
          'Jaise "100 GPD TFC". "100 gpd membrane" ek asli search term hai.',
        suggestion: v.trim() ? `${v.trim().toUpperCase()} 75 GPD TFC` : '75 GPD TFC (Thin Film Composite)',
      };
    }
    return null;
  },

  'Storage Capacity': (v) => {
    if (MONEY.test(v)) {
      return { level: 'error', message: 'Yahan daam nahi, tank ki capacity aati hai.', suggestion: null };
    }
    if (!/\b(l|ltr|litre|liter|litres|liters)\b/i.test(v)) {
      const n = firstNumber(v);
      return {
        level: 'warn',
        message: 'Unit likho — "8 Litres" ya "12 Litres". "12 litre ro purifier" bahut search hota hai.',
        suggestion: n ? `${n} Litres` : null,
      };
    }
    return null;
  },

  'Max TDS Handled': (v) => {
    if (!/ppm/i.test(v)) {
      const n = firstNumber(v);
      return { level: 'warn', message: 'Unit "ppm" likho — jaise "2000 ppm".', suggestion: n ? `${n} ppm` : null };
    }
    const n = firstNumber(v);
    if (n && (n < 200 || n > 5000)) {
      return { level: 'warn', message: `${n} ppm ajeeb hai. Domestic RO aam taur par 1500–2000 ppm tak handle karta hai.`, suggestion: '2000 ppm' };
    }
    return null;
  },

  'Operating Voltage': (v) => {
    if (!/\bv\b|volt/i.test(v)) {
      return { level: 'warn', message: 'Unit "V" likho — jaise "180–260 V AC, 50 Hz".', suggestion: '180–260 V AC, 50 Hz' };
    }
    return null;
  },

  'Purification Stages': (v) => {
    const n = firstNumber(v);
    if (!n) return { level: 'warn', message: 'Number likho — jaise "7 Stage".', suggestion: null };
    if (n < 3 || n > 14) {
      return { level: 'warn', message: `${n} stage ajeeb hai. Ghar ke RO me aam taur par 5–10 stage hote hain.`, suggestion: null };
    }
    if (!/stage/i.test(v)) return { level: 'warn', message: '"Stage" shabd bhi likho — "7 Stage".', suggestion: `${n} Stage` };
    return null;
  },

  'Output Capacity': (v) => {
    if (!/lph/i.test(v)) {
      const n = firstNumber(v);
      return { level: 'warn', message: 'Commercial plant LPH me naapa jaata hai — "100 LPH". "100 lph ro plant" ek asli search hai.', suggestion: n ? `${n} LPH (litres per hour)` : null };
    }
    return null;
  },

  'EAN / Barcode (GTIN)': (v) => {
    const digits = v.replace(/\D/g, '');
    if (!digits) return null;
    if (![8, 12, 13, 14].includes(digits.length)) {
      return { level: 'warn', message: `GTIN 8, 12, 13 ya 14 digit ka hota hai — abhi ${digits.length} digit hai. Box ke barcode ke neeche se dekho.`, suggestion: null };
    }
    return null;
  },

  Warranty: (v) => {
    if (!/(year|saal|month|mahine|yr|mo\b)/i.test(v)) {
      const n = firstNumber(v);
      return { level: 'warn', message: 'Time likho — jaise "1 Year on product".', suggestion: n ? `${n} Year on product` : null };
    }
    return null;
  },

  Brand: (v, name) => {
    if (COUNTRIES.includes(v.trim().toLowerCase())) {
      return { level: 'error', message: 'Ye country hai, brand nahi.', suggestion: brandFromName(name) };
    }
    return null;
  },

  'Country of Origin': (v) => {
    if (/\b(ro|uv|uf|tds)\b/i.test(v) && !COUNTRIES.includes(v.trim().toLowerCase())) {
      return { level: 'error', message: 'Ye technology hai, country nahi.', suggestion: 'India' };
    }
    return null;
  },
};

/* ── chhote helper ── */
/**
 * Naam se standard wattage ka andaza. Ye datasheet nahi hai — ek sensible
 * default hai jise admin confirm kar sake. UV wali aur badi tank wali machine
 * zyada kheenchti hai.
 */
function wattFromName(name: string): string {
  const n = name.toLowerCase();
  const hasUv = /\buv\b/.test(n);
  const cap = n.match(/(\d{1,2})\s*-?\s*(?:l\b|ltr|litre|liter)/);
  const big = cap ? parseInt(cap[1], 10) >= 10 : false;
  if (big && hasUv) return '60 W';
  if (hasUv) return '45 W';
  return big ? '36 W' : '24 W';
}

function techFromName(name: string): string | null {
  const n = ` ${name.toLowerCase()} `;
  const p: string[] = [];
  if (/[\s+(/-]ro[\s+)/-]|reverse osmosis/.test(n)) p.push('RO');
  if (/[\s+(/-]uv[\s+)/-]/.test(n)) p.push('UV');
  if (/[\s+(/-]uf[\s+)/-]/.test(n)) p.push('UF');
  if (/[\s+(/-]tds[\s+)/-]|mtds/.test(n)) p.push('TDS Controller');
  if (/alkaline/.test(n)) p.push('Alkaline');
  if (/copper/.test(n)) p.push('Copper');
  if (/mineral/.test(n)) p.push('Mineral Cartridge');
  if (/zinc/.test(n)) p.push('Zinc');
  return p.length ? p.join(' + ') : null;
}

function brandFromName(name: string): string | null {
  const KNOWN = ['Kent', 'Aquaguard', 'Eureka Forbes', 'Pureit', 'Livpure', 'AO Smith',
    'Blue Star', 'Havells', 'LG', 'Whirlpool', 'Panasonic', 'Faber', 'V-Guard',
    'Tata Swach', 'Zero B', 'Nasaka', 'Aquafresh', 'Aquasure', 'Konvio Neer',
    'AquaUltra', 'AquaPearl', 'AquaBizz', 'Grand Forest', 'Apple Alfa'];
  const n = name.toLowerCase();
  return KNOWN.find((b) => n.includes(b.toLowerCase())) ?? null;
}

/* ══════════════════════════════════════════════════════════════════════════
   PUBLIC API
   ══════════════════════════════════════════════════════════════════════════ */

/** Ek spec row jaancho. Sab theek ho to null. */
export function validateSpec(
  specKey: string,
  specValue: string,
  productName = '',
): SpecIssue | null {
  const key = specKey.trim();
  const value = specValue.trim();
  if (!key || !value) return null;
  const rule = RULES[key];
  if (!rule) return null;
  try {
    return rule(value, productName);
  } catch {
    return null;
  }
}

/** Poora spec set jaancho — Specs tab ke upar summary dikhane ke liye. */
export function validateAllSpecs(
  rows: { specKey: string; specValue: string }[],
  productName = '',
): { errors: number; warns: number } {
  let errors = 0;
  let warns = 0;
  for (const r of rows) {
    const i = validateSpec(r.specKey, r.specValue, productName);
    if (i?.level === 'error') errors += 1;
    else if (i?.level === 'warn') warns += 1;
  }
  return { errors, warns };
}

/** Jin keys par jaanch lagti hai — UI me hint dikhane ke liye. */
export const VALIDATED_SPEC_KEYS = Object.keys(RULES);
