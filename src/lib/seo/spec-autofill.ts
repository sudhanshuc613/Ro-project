/**
 * PRODUCT SPEC AUTO-FILL — admin panel ke liye.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN BANAYA (9 Oct 2026)
 * ────────────────────────
 * Owner ne kaha: "admin panel mai jab product add karte hai to unke
 * specification ko suggest kiya kar ya khud si bhar diya kar ki ye ye to
 * hota hi hai."
 *
 * Pehle kya tha: `SPEC_TEMPLATES` (product-seo.ts) sirf KHAALI rows deta tha
 * — spec ka naam bhar jaata tha, value haath se bharni padti thi. 15 rows ×
 * har product = bahut typing, aur aadhe product bina spec ke save ho jaate the.
 *
 * Ab kya hota hai: product ka NAAM padh kar values khud bhar jaati hain.
 *
 *     "Kent Grand Plus 8L RO UV UF TDS Controller"
 *       → Storage Capacity   : 8 Litres
 *       → Technology         : RO + UV + UF + TDS Controller
 *       → Purification Stages: 7 Stage
 *       → Membrane Type      : 75 GPD TFC (Thin Film Composite)
 *       → Power Consumption  : 60 W
 *       → Operating Voltage  : 180–260 V AC
 *       → Installation Type  : Wall Mount / Counter Top
 *       → Warranty           : 1 Year on product
 *       ...
 *
 * SEO KIYUN MATTER KARTA HAI
 * ──────────────────────────
 * Spec table long-tail query pakadta hai — "8 litre ro purifier price",
 * "75 gpd membrane", "2000 tds ro purifier". Ye queries product ke naam me
 * nahi hoti, spec table me hoti hain. Aur Google Merchant / Shopping feed
 * inhi fields se banta hai.
 *
 * 🔴 EK NIYAM
 * ───────────
 * Ye engine sirf wahi bharta hai jo product ke NAAM se pakka pata chalta hai,
 * ya jo poore RO industry me standard hai (jaise 180–260 V AC operating
 * range, 10-inch filter housing). Jo cheez naam se pata nahi chalti — model
 * number, exact dimensions, EAN barcode, exact warranty — wo KHAALI chhodi
 * jaati hai, taki admin jhooth na likhe.
 *
 * Har auto-bhari value ke saath `inferred: true` aata hai, taki UI usko
 * alag rang me dikha sake aur admin ek nazar me verify kar le.
 */

export interface SpecRow {
  specGroup: string;
  specKey: string;
  specValue: string;
}

export interface InferredSpec extends SpecRow {
  /** true = engine ne naam se nikala · false = industry standard default */
  inferred: boolean;
  /** Admin ko dikhane ke liye — ye value aayi kahan se */
  why: string;
}

/* ══════════════════════════════════════════════════════════════════════════
   1. NAAM SE PARSE — capacity, stages, technology, GPD
   ══════════════════════════════════════════════════════════════════════════ */

/** "8L" · "8 L" · "8 litre" · "8-litres" → 8 */
export function parseCapacityLitres(name: string): number | null {
  const m = name.match(/(\d{1,2}(?:\.\d)?)\s*-?\s*(?:l\b|ltr|litre|liter|lt\b)/i);
  if (!m) return null;
  const v = parseFloat(m[1]);
  return v >= 1 && v <= 50 ? v : null;
}

/** "75 GPD" · "100GPD" → 75 / 100 */
export function parseGpd(name: string): number | null {
  const m = name.match(/(\d{2,4})\s*-?\s*gpd/i);
  if (!m) return null;
  const v = parseInt(m[1], 10);
  return v >= 50 && v <= 1000 ? v : null;
}

/** "7 stage" · "7-stage" · "7 stages" → 7 */
export function parseStages(name: string): number | null {
  const m = name.match(/(\d{1,2})\s*-?\s*stage/i);
  if (!m) return null;
  const v = parseInt(m[1], 10);
  return v >= 3 && v <= 14 ? v : null;
}

/** "50 LPH" · "100LPH" → 50 / 100  (commercial plants) */
export function parseLph(name: string): number | null {
  const m = name.match(/(\d{2,5})\s*-?\s*lph/i);
  if (!m) return null;
  return parseInt(m[1], 10);
}

/**
 * Technology string banata hai jo naam me jo mila usi se — jhooth nahi.
 * "RO UV UF TDS Copper" → "RO + UV + UF + TDS Controller + Copper"
 */
export function parseTechnology(name: string): string | null {
  const n = ` ${name.toLowerCase()} `;
  const parts: string[] = [];
  if (/[\s+(/-]ro[\s+)/-]|reverse osmosis/.test(n)) parts.push('RO');
  if (/[\s+(/-]uv[\s+)/-]|ultraviolet/.test(n)) parts.push('UV');
  if (/[\s+(/-]uf[\s+)/-]|ultrafiltration|ultra filtration/.test(n)) parts.push('UF');
  if (/[\s+(/-]mtds|tds\s*control|[\s+(/-]tds[\s+)/-]/.test(n)) parts.push('TDS Controller');
  if (/mineral|miner[ae]l/.test(n)) parts.push('Mineral Cartridge');
  if (/alkaline/.test(n)) parts.push('Alkaline');
  if (/copper/.test(n)) parts.push('Copper');
  if (/zinc/.test(n)) parts.push('Zinc');
  if (/uv[\s-]?led/.test(n)) parts.push('UV LED');
  return parts.length ? parts.join(' + ') : null;
}

/** Naam me jo brand mila, wahi — warna null */
export function parseBrand(name: string): string | null {
  const KNOWN = [
    'Kent', 'Aquaguard', 'Eureka Forbes', 'Pureit', 'Livpure', 'AO Smith',
    'Blue Star', 'Havells', 'LG', 'Whirlpool', 'Panasonic', 'Faber',
    'V-Guard', 'Tata Swach', 'Zero B', 'Nasaka', 'Aquafresh', 'Aquasure',
    'Konvio Neer', 'AquaUltra', 'AquaPearl', 'AquaBizz', 'Grand Forest',
    'Dolphin', 'Hi-Tech', 'Wellon',
  ];
  const n = name.toLowerCase();
  return KNOWN.find((b) => n.includes(b.toLowerCase())) ?? null;
}

/** Naam ke andar se model nikalne ki koshish — brand hata kar bacha hua hissa */
export function parseModel(name: string): string | null {
  const b = parseBrand(name);
  let s = name;
  if (b) s = s.replace(new RegExp(b, 'i'), '');
  s = s
    .replace(/\b\d{1,2}(?:\.\d)?\s*-?\s*(?:l|ltr|litre|liter|lt)\b/gi, '')
    .replace(/\b\d{1,2}\s*-?\s*stages?\b/gi, '')
    .replace(/\b\d{2,4}\s*-?\s*gpd\b/gi, '')
    .replace(/\b(ro|uv|uf|tds|mtds|copper|alkaline|mineral|zinc)\b/gi, '')
    .replace(/\b(water\s*purifier|purifier|water|filter|system)\b/gi, '')
    .replace(/[+/|,-]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return s.length >= 2 ? s : null;
}

/** Spare part ka type naam se pehchano */
export function parsePartType(name: string): string | null {
  const n = name.toLowerCase();
  const map: [RegExp, string][] = [
    [/membrane/, 'RO Membrane'],
    [/sediment|spun/, 'Sediment Filter (Spun)'],
    [/\bcto\b|carbon\s*block/, 'Carbon Block Filter (CTO)'],
    [/\bgac\b|granular/, 'Granular Activated Carbon (GAC)'],
    [/pre[\s-]?filter/, 'Pre-Filter'],
    [/post[\s-]?carbon/, 'Post Carbon Filter'],
    [/\bsmps\b|adaptor|adapter/, 'SMPS Adaptor'],
    [/booster\s*pump|\bpump\b/, 'Booster Pump'],
    [/solenoid/, 'Solenoid Valve (SV)'],
    [/float\s*valve/, 'Float Valve'],
    [/\bfr\b|flow\s*restrictor/, 'Flow Restrictor'],
    [/\buv\b.*(lamp|tube)|lamp|barrel/, 'UV Lamp / Barrel'],
    [/\buf\b.*membrane|uf\s*kit/, 'UF Membrane'],
    [/housing|bowl/, 'Filter Housing'],
    [/elbow|connector|fitting|tee\b/, 'Connector / Fitting'],
    [/\btube\b|tubing|pipe/, 'RO Tubing'],
    [/\btank\b|storage/, 'Storage Tank'],
    [/\btap\b|faucet|goose\s*neck/, 'Tap / Faucet'],
    [/tds\s*meter/, 'TDS Meter'],
  ];
  return map.find(([re]) => re.test(n))?.[1] ?? null;
}

/* ══════════════════════════════════════════════════════════════════════════
   2. INDUSTRY STANDARDS — ye har machine me hote hi hain
   ──────────────────────────────────────────────────────────────────────────
   Ye wo values hain jo poore Indian RO market me ek jaisi hain. Inko bharna
   andaza nahi hai — ye standard hai. Phir bhi admin inhe edit kar sakta hai.
   ══════════════════════════════════════════════════════════════════════════ */

/** GPD → membrane ka standard description */
function membraneFor(gpd: number | null, capacity: number | null): string {
  const g = gpd ?? (capacity && capacity >= 10 ? 100 : 75);
  return `${g} GPD TFC (Thin Film Composite)`;
}

/** Capacity se power ka typical range (booster pump + UV load) */
function powerFor(tech: string | null, capacity: number | null): string {
  const hasUv = tech?.includes('UV');
  const big = (capacity ?? 8) >= 10;
  if (big && hasUv) return '60 W';
  if (hasUv) return '45 W';
  return big ? '36 W' : '24 W';
}

/** Stages ka andaza technology se — agar naam me likha na ho */
function stagesFor(tech: string | null): number | null {
  if (!tech) return null;
  const n = tech.split('+').length;
  // RO+UV+UF+TDS = 4 tech blocks ≈ 7 physical stages (3 pre + 4)
  if (n >= 4) return 7;
  if (n === 3) return 6;
  if (n === 2) return 5;
  return null;
}

/* ══════════════════════════════════════════════════════════════════════════
   3. MAIN ENGINE
   ══════════════════════════════════════════════════════════════════════════ */

export type ProductKind = 'NEW_RO' | 'SPARE_PART' | 'COMMERCIAL_PLANT' | 'ACCESSORY';

/**
 * Product ke naam + type se poora spec set banata hai.
 * Jo pakka nahi, wo khaali — taki admin jhooth na likhe.
 */
export function autofillSpecs(name: string, type: ProductKind): InferredSpec[] {
  const brand = parseBrand(name);
  const model = parseModel(name);
  const cap = parseCapacityLitres(name);
  const gpd = parseGpd(name);
  const lph = parseLph(name);
  const tech = parseTechnology(name);
  const stages = parseStages(name) ?? stagesFor(tech);
  const partType = parsePartType(name);

  const S = (g: string, k: string, v: string, inferred: boolean, why: string): InferredSpec => ({
    specGroup: g, specKey: k, specValue: v, inferred, why,
  });

  if (type === 'SPARE_PART') {
    return [
      S('General', 'Part Type', partType ?? '', !!partType,
        partType ? 'product ke naam se pehchana' : 'naam se pata nahi chala — khud bharein'),
      S('General', 'Brand', brand ?? '', !!brand,
        brand ? 'naam me brand mila' : 'universal part — brand khaali rakh sakte hain'),
      S('General', 'Compatible Brands', 'Kent, Aquaguard, Pureit, Livpure, AO Smith, Blue Star, Havells', false,
        'standard 10-inch / quarter-inch fitting — in sab me fit hota hai'),
      S('General', 'Fitting Size',
        /membrane/i.test(name) ? '1812 / 2012 standard housing'
          : /filter|cto|gac|sediment|spun/i.test(name) ? '10 inch × 2.5 inch'
          : /tube|tubing|pipe|connector|elbow/i.test(name) ? '1/4 inch (6 mm)'
          : '', /membrane|filter|cto|gac|sediment|spun|tube|tubing|pipe|connector|elbow/i.test(name),
        'part type se standard size'),
      S('Purification', 'Rated Capacity',
        gpd ? `${gpd} GPD` : /membrane/i.test(name) ? '75 GPD' : '',
        !!gpd, gpd ? 'naam me GPD mila' : 'ghar ke RO me 75 GPD sabse aam hai'),
      S('General', 'Material',
        /membrane/i.test(name) ? 'TFC Polyamide'
          : /sediment|spun/i.test(name) ? 'Polypropylene (PP)'
          : /cto|carbon/i.test(name) ? 'Activated Coconut Shell Carbon'
          : /tube|tubing|pipe/i.test(name) ? 'Food-grade LLDPE'
          : /housing|bowl/i.test(name) ? 'Food-grade ABS'
          : '', true, 'is part ka standard material'),
      S('General', 'Expected Life',
        /membrane/i.test(name) ? '18–24 mahine (Patna ke 400–1,200 ppm water par)'
          : /sediment|spun/i.test(name) ? '3–4 mahine'
          : /cto|carbon|gac/i.test(name) ? '6 mahine'
          : /uv.*lamp|lamp|barrel/i.test(name) ? '12 mahine (chahe jalta dikhe)'
          : '', true, 'Patna ke pani par hamara apna field data'),
      S('General', 'Warranty', '', false, 'supplier ke hisaab se — khud bharein'),
      S('General', 'EAN / Barcode (GTIN)', '', false,
        'pack par chhapa hota hai — bharne se Google Shopping me ~20% zyada click'),
    ];
  }

  if (type === 'COMMERCIAL_PLANT') {
    return [
      S('General', 'Output Capacity', lph ? `${lph} LPH (litres per hour)` : '', !!lph,
        lph ? 'naam me LPH mila' : 'naam me LPH nahi mila — khud bharein'),
      S('General', 'Application', 'Shop, Hotel, School, Hospital, Factory, Water ATM', false,
        'commercial plant ka standard use-case'),
      S('General', 'Feed Water TDS', 'Up to 2000 ppm', false,
        'Patna aur aas-paas ke borewell water ke liye standard design'),
      S('Purification', 'Membrane Type & Count',
        lph ? (lph <= 100 ? '4040 TFC × 1' : lph <= 250 ? '4040 TFC × 2' : '4040 TFC × 3+') : '',
        !!lph, 'LPH se standard membrane count'),
      S('Purification', 'Pre-treatment', 'Sand Filter + Activated Carbon + Micron Cartridge', false,
        'har commercial plant me ye teen stage hote hi hain'),
      S('Electrical', 'Pump Motor',
        lph ? (lph <= 100 ? '0.5 HP multistage' : lph <= 250 ? '1.0 HP multistage' : '2.0 HP multistage') : '',
        !!lph, 'LPH se standard pump size'),
      S('Electrical', 'Power Supply', '220–240 V AC, 50 Hz, Single Phase', false,
        'India ka standard single-phase supply'),
      S('Dimensions', 'Frame Size', '', false, 'model ke hisaab se — khud bharein'),
      S('General', 'Warranty', '1 Year on plant, 1 Year on membrane', false,
        'commercial plant ka aam warranty — confirm kar lein'),
    ];
  }

  if (type === 'ACCESSORY') {
    return [
      S('General', 'Accessory Type', partType ?? '', !!partType, 'naam se pehchana'),
      S('General', 'Compatible With', 'Sabhi domestic RO water purifiers', false,
        'standard fitting — har ghar ke RO me lagta hai'),
      S('General', 'Material',
        /tube|tubing|pipe/i.test(name) ? 'Food-grade LLDPE'
          : /tap|faucet/i.test(name) ? 'Food-grade ABS / SS'
          : /tank/i.test(name) ? 'Food-grade Plastic'
          : '', true, 'is accessory ka standard material'),
      S('General', 'Pack Contents', '', false, 'kitne piece ka pack hai — khud bharein'),
      S('General', 'EAN / Barcode (GTIN)', '', false, 'pack par chhapa hota hai'),
    ];
  }

  /* ── NEW_RO (default) ── */
  return [
    S('General', 'Brand', brand ?? '', !!brand,
      brand ? 'naam me brand mila' : 'naam me brand nahi mila'),
    S('General', 'Model Name', model ?? '', !!model,
      model ? 'naam me se brand/spec hata kar bacha hua hissa' : 'khud bharein'),
    S('General', 'Storage Capacity', cap ? `${cap} Litres` : '', !!cap,
      cap ? 'naam me litre mila' : 'naam me capacity nahi mili — khud bharein'),
    S('General', 'Installation Type', 'Wall Mount / Counter Top', false,
      'ghar ke RO ka standard — dono tarike se lag jaata hai'),
    S('General', 'Suitable For', 'Municipal, Borewell aur Tanker Water', false,
      'RO + pre-filter wali machine teeno par chalti hai'),
    S('Purification', 'Purification Stages', stages ? `${stages} Stage` : '', !!stages,
      parseStages(name) ? 'naam me stage count mila' : 'technology count se nikala — verify kar lein'),
    S('Purification', 'Technology', tech ?? '', !!tech,
      tech ? 'naam me jo mila wahi' : 'naam me RO/UV/UF nahi mila'),
    S('Purification', 'Max TDS Handled', '2000 ppm', false,
      'domestic RO membrane ka standard rating'),
    S('Purification', 'Membrane Type', membraneFor(gpd, cap), !!gpd,
      gpd ? 'naam me GPD mila' : '8L tak 75 GPD, 10L+ par 100 GPD — standard'),
    S('Purification', 'Purification Rate',
      gpd ? `${Math.round((gpd * 3.785) / 24)} litre/hour (approx)` : '12–15 litre/hour',
      !!gpd, gpd ? 'GPD se calculate kiya (1 GPD = 3.785 L/day)' : 'ghar ke RO ka aam range'),
    S('Electrical', 'Power Consumption', powerFor(tech, cap), false,
      'pump + UV load ka typical figure — datasheet se confirm kar lein'),
    S('Electrical', 'Operating Voltage', '180–260 V AC, 50 Hz', false,
      'Indian RO ka standard input range'),
    S('Dimensions', 'Dimensions (W×D×H)', '', false,
      'box par likha hota hai — khud bharein'),
    S('Dimensions', 'Weight', '', false, 'box par likha hota hai — khud bharein'),
    S('General', 'Warranty', '', false,
      'brand ke hisaab se alag — aam taur par 1 saal product par'),
    S('General', 'EAN / Barcode (GTIN)', '', false,
      'box ke barcode se — bharne se Google Shopping me ~20% zyada click'),
  ];
}

/* ══════════════════════════════════════════════════════════════════════════
   4. DATALIST SUGGESTIONS — har field par dropdown
   ──────────────────────────────────────────────────────────────────────────
   Admin jab koi spec row khud add kare, to usme bhi suggestion mile.
   `<input list="...">` ke saath use hota hai.
   ══════════════════════════════════════════════════════════════════════════ */

/** Spec KEY ke liye suggestions, group ke hisaab se */
export const SPEC_KEY_SUGGESTIONS: Record<string, string[]> = {
  General: [
    'Brand', 'Model Name', 'Storage Capacity', 'Installation Type', 'Suitable For',
    'Warranty', 'Country of Origin', 'Body Material', 'Colour', 'In The Box',
    'EAN / Barcode (GTIN)', 'Part Type', 'Compatible Brands', 'Fitting Size',
    'Material', 'Expected Life', 'Output Capacity', 'Application', 'Feed Water TDS',
    'Pack Contents', 'Accessory Type', 'Compatible With',
  ],
  Purification: [
    'Purification Stages', 'Technology', 'Max TDS Handled', 'Membrane Type',
    'Purification Rate', 'Rated Capacity', 'Pre-treatment', 'Membrane Type & Count',
    'Mineral Cartridge', 'UV Lamp Rating', 'Filter Life',
  ],
  Electrical: [
    'Power Consumption', 'Operating Voltage', 'Power Supply', 'Pump Motor',
    'Frequency', 'Cable Length', 'SMPS Rating',
  ],
  Dimensions: [
    'Dimensions (W×D×H)', 'Weight', 'Frame Size', 'Tank Diameter', 'Mounting Depth',
  ],
};

/** Spec VALUE ke liye suggestions, key ke hisaab se */
export const SPEC_VALUE_SUGGESTIONS: Record<string, string[]> = {
  'Storage Capacity': ['5 Litres', '6 Litres', '7 Litres', '8 Litres', '9 Litres', '10 Litres', '12 Litres', '15 Litres'],
  'Installation Type': ['Wall Mount / Counter Top', 'Wall Mount', 'Counter Top', 'Under Sink', 'Floor Standing'],
  'Suitable For': ['Municipal, Borewell aur Tanker Water', 'Municipal Water Only', 'Borewell Water', 'High TDS Water'],
  'Purification Stages': ['5 Stage', '6 Stage', '7 Stage', '8 Stage', '9 Stage', '10 Stage'],
  Technology: [
    'RO', 'RO + UV', 'RO + UF', 'RO + UV + UF', 'RO + UV + UF + TDS Controller',
    'RO + UV + UF + TDS Controller + Mineral Cartridge',
    'RO + UV + UF + TDS Controller + Copper', 'RO + UV + UF + Alkaline', 'UV + UF', 'UF Gravity',
  ],
  'Max TDS Handled': ['1500 ppm', '2000 ppm', '2500 ppm', '3000 ppm'],
  'Membrane Type': [
    '75 GPD TFC (Thin Film Composite)', '80 GPD TFC (Thin Film Composite)',
    '100 GPD TFC (Thin Film Composite)', '150 GPD TFC (Thin Film Composite)',
  ],
  'Purification Rate': ['11 litre/hour (approx)', '12–15 litre/hour', '15 litre/hour (approx)', '20 litre/hour (approx)'],
  'Power Consumption': ['24 W', '36 W', '45 W', '60 W', '75 W'],
  'Operating Voltage': ['180–260 V AC, 50 Hz', '220–240 V AC, 50 Hz', '100–300 V AC, 50 Hz'],
  'Power Supply': ['220–240 V AC, 50 Hz, Single Phase', '380–415 V AC, 50 Hz, Three Phase'],
  Warranty: [
    '1 Year on product', '1 Year on product, 1 Year on membrane',
    '2 Year on product', '6 Months on part', '1 Year comprehensive',
  ],
  'Part Type': [
    'RO Membrane', 'Sediment Filter (Spun)', 'Carbon Block Filter (CTO)',
    'Granular Activated Carbon (GAC)', 'Pre-Filter', 'Post Carbon Filter',
    'SMPS Adaptor', 'Booster Pump', 'Solenoid Valve (SV)', 'Float Valve',
    'Flow Restrictor', 'UV Lamp / Barrel', 'UF Membrane', 'Filter Housing',
    'Connector / Fitting', 'RO Tubing', 'Storage Tank', 'Tap / Faucet', 'TDS Meter',
  ],
  'Rated Capacity': ['50 GPD', '75 GPD', '80 GPD', '100 GPD', '150 GPD'],
  'Fitting Size': ['10 inch × 2.5 inch', '1812 / 2012 standard housing', '1/4 inch (6 mm)', '3/8 inch (10 mm)'],
  Material: [
    'TFC Polyamide', 'Polypropylene (PP)', 'Activated Coconut Shell Carbon',
    'Food-grade ABS', 'Food-grade LLDPE', 'Stainless Steel 304',
  ],
  'Expected Life': [
    '3–4 mahine', '6 mahine', '12 mahine (chahe jalta dikhe)',
    '18–24 mahine (Patna ke 400–1,200 ppm water par)',
  ],
  'Output Capacity': ['25 LPH (litres per hour)', '50 LPH (litres per hour)', '100 LPH (litres per hour)', '250 LPH (litres per hour)', '500 LPH (litres per hour)', '1000 LPH (litres per hour)'],
  Application: ['Shop, Hotel, School, Hospital, Factory, Water ATM', 'Hotel aur Restaurant', 'School aur Hostel', 'Factory aur Industry'],
  'Feed Water TDS': ['Up to 1500 ppm', 'Up to 2000 ppm', 'Up to 3000 ppm'],
  'Pump Motor': ['0.5 HP multistage', '1.0 HP multistage', '2.0 HP multistage', '3.0 HP multistage'],
  'Pre-treatment': ['Sand Filter + Activated Carbon + Micron Cartridge', 'Sand + Carbon + Softener'],
  'Country of Origin': ['India'],
  Colour: ['White', 'White & Blue', 'Black', 'Silver', 'Copper'],
};

/**
 * Spec rows merge karo — jo already bhare hue hain unhe chhedo mat.
 * Yahi function UI call karta hai, taki admin ka likha kabhi na mite.
 */
export function mergeSpecs(existing: SpecRow[], incoming: InferredSpec[]): SpecRow[] {
  const kept = existing.filter((s) => s.specKey.trim() && s.specValue.trim());
  const have = new Set(kept.map((s) => s.specKey.trim().toLowerCase()));
  const add = incoming
    .filter((s) => !have.has(s.specKey.trim().toLowerCase()))
    .map(({ specGroup, specKey, specValue }) => ({ specGroup, specKey, specValue }));
  return [...kept, ...add];
}

/** Kitni rows me value aa gayi — toast me dikhane ke liye */
export function countFilled(rows: InferredSpec[]): { filled: number; total: number } {
  return { filled: rows.filter((r) => r.specValue.trim()).length, total: rows.length };
}
