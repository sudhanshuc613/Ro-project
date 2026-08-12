/**
 * PRODUCT SEO BRAIN — pure functions, zero DB, safe to import in client components.
 * ────────────────────────────────────────────────────────────────────────────────
 * Everything here is derived from measured 2026 research, not guesswork:
 *
 *  • Title formula        Brand → Product Type → Key Attribute → Capacity/Variant
 *                         (Google Shopping feed spec; the first ~70 chars decide
 *                         which queries you match at all)
 *  • Meta title length    51–55 chars has the LOWEST Google rewrite rate (~40%).
 *                         >70 chars gets rewritten ~100% of the time. (Zyppy 2026)
 *  • Description          500–1,000 chars recommended by Google's product data
 *                         spec; the first 160–500 chars are the "critical zone".
 *  • Banned in titles     ALL CAPS, "sale", "best price", "free shipping", "%off"
 *                         → Merchant Center disapproval / auto-rewrite.
 *  • Identifiers          Products WITH a correct GTIN get ~20% more clicks
 *                         (Google's own benchmark). No GTIN → brand + MPN.
 *
 * Nothing in this file touches existing behaviour. It only *suggests*.
 */

/* ══════════════════════════════════════════════════════════════════════════
   1. BRAND LIST — every brand an Indian RO buyer or repair customer types
   ══════════════════════════════════════════════════════════════════════════
   Used to seed the dropdown. The admin can still type any brand not on this
   list and it gets created on save. */
export interface BrandSeed { name: string; slug: string; isFeatured?: boolean }

export const BRAND_SEED: BrandSeed[] = [
  // Own label
  { name: 'Aqua Perl',        slug: 'aqua-perl',       isFeatured: true },
  // Mass-market purifier brands (ordered roughly by Indian market share)
  { name: 'Kent',             slug: 'kent',            isFeatured: true },
  { name: 'Aquaguard',        slug: 'aquaguard',       isFeatured: true },
  { name: 'Eureka Forbes',    slug: 'eureka-forbes' },
  { name: 'Pureit',           slug: 'pureit',          isFeatured: true },
  { name: 'Livpure',          slug: 'livpure',         isFeatured: true },
  { name: 'AO Smith',         slug: 'ao-smith',        isFeatured: true },
  { name: 'Blue Star',        slug: 'blue-star' },
  { name: 'Havells',          slug: 'havells' },
  { name: 'V-Guard',          slug: 'v-guard' },
  { name: 'Faber',            slug: 'faber' },
  { name: 'LG',               slug: 'lg' },
  { name: 'Whirlpool',        slug: 'whirlpool' },
  { name: 'Panasonic',        slug: 'panasonic' },
  { name: 'Atomberg',         slug: 'atomberg' },
  { name: 'Kenstar',          slug: 'kenstar' },
  { name: 'Tata Swach',       slug: 'tata-swach' },
  { name: 'Zero B',           slug: 'zero-b' },
  { name: 'Nasaka',           slug: 'nasaka' },
  { name: 'Aquasure',         slug: 'aquasure' },
  { name: 'Aquafresh',        slug: 'aquafresh' },
  { name: 'Aqua Grand',       slug: 'aqua-grand' },
  { name: 'AquaUltra',        slug: 'aquaultra' },
  { name: 'Konvio Neer',      slug: 'konvio-neer' },
  { name: 'Wellon',           slug: 'wellon' },
  // Component makers — matter a LOT for spare-part search intent
  { name: 'Vontron',          slug: 'vontron' },
  { name: 'CSM',              slug: 'csm' },
  { name: 'Dow Filmtec',      slug: 'dow-filmtec' },
  { name: 'Compatible / Universal', slug: 'compatible-universal' },
];

/* ══════════════════════════════════════════════════════════════════════════
   2. TITLE GENERATION
   ══════════════════════════════════════════════════════════════════════════ */

export interface ProductSeoInput {
  name: string;
  brandName?: string;
  type: string;              // NEW_RO | SPARE_PART | COMMERCIAL_PLANT | ACCESSORY
  categoryName?: string;
  purificationTech: string[];
  storageLitres?: number;
  capacityLph?: number;
  sellingPrice?: number;
  mrp?: number;
  warrantyMonths?: number;
  shortDescription?: string;
  description?: string;
  slug?: string;
  sku?: string;
  hsnCode?: string;
  images?: { url: string; altText: string }[];
  specifications?: { specGroup: string; specKey: string; specValue: string }[];
  seo?: { metaTitle: string; metaDescription: string; metaKeywords: string };
}

/** Words Google Merchant Center rejects or silently rewrites inside a title. */
export const BANNED_TITLE_WORDS = [
  'sale', 'best price', 'lowest price', 'free shipping', 'free delivery',
  'discount', 'offer', 'cheap', 'best deal', 'buy now', 'limited time',
  'hurry', 'act now', 'clearance', 'wholesale rate',
];

/** Short tech label used inside generated titles: RO + UV + UF. */
export function techLabel(tech: string[]): string {
  const order = ['RO', 'UV', 'UF', 'TDS_CONTROLLER', 'ALKALINE', 'COPPER', 'MINERAL'];
  const short: Record<string, string> = {
    RO: 'RO', UV: 'UV', UF: 'UF',
    TDS_CONTROLLER: 'TDS', ALKALINE: 'Alkaline', COPPER: 'Copper', MINERAL: 'Mineral',
  };
  return order.filter((t) => tech.includes(t)).map((t) => short[t]).join(' + ');
}

/** Human product-type noun that buyers actually type into Google. */
export function typeNoun(type: string): string {
  return {
    NEW_RO: 'Water Purifier',
    SPARE_PART: 'RO Spare Part',
    COMMERCIAL_PLANT: 'Commercial RO Plant',
    ACCESSORY: 'RO Accessory',
    AMC_PLAN: 'AMC Plan',
  }[type] ?? 'Water Purifier';
}

function inr(n?: number) {
  if (!n || n <= 0) return '';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function squeeze(s: string) {
  return s.replace(/\s+/g, ' ').replace(/\s+([,—-])/g, '$1').trim();
}

/**
 * H1 / product-name suggestion, built the way Flipkart, Amazon and the brand
 * sites themselves build it — because that is the phrasing buyers copy-paste.
 *
 *   Kent Grand Plus 8L RO + UV + UF Water Purifier
 *   80 GPD RO Membrane for Kent, Aquaguard — Vontron
 */
export function suggestProductName(i: ProductSeoInput): string[] {
  const brand = (i.brandName ?? '').trim();
  const tech = techLabel(i.purificationTech);
  const base = i.name.trim();
  const out: string[] = [];

  // Strip a leading brand that is already present so we never double it
  const bare = brand && base.toLowerCase().startsWith(brand.toLowerCase())
    ? base.slice(brand.length).trim().replace(/^[-—|,]\s*/, '')
    : base;

  if (i.type === 'NEW_RO') {
    const litres = i.storageLitres && i.storageLitres > 0 ? `${i.storageLitres}L` : '';
    out.push(squeeze([brand, bare, litres, tech, 'Water Purifier'].filter(Boolean).join(' ')));
    if (litres) out.push(squeeze([brand, bare, tech, 'Water Purifier', `${litres} Storage`].filter(Boolean).join(' ')));
  } else if (i.type === 'COMMERCIAL_PLANT') {
    const lph = i.capacityLph ? `${i.capacityLph} LPH` : '';
    out.push(squeeze([brand, bare, lph, 'Commercial RO Plant'].filter(Boolean).join(' ')));
    out.push(squeeze([bare, lph, 'Industrial RO Water Plant', brand && `by ${brand}`].filter(Boolean).join(' ')));
  } else {
    // Spare parts / accessories: the compatibility phrase is the money keyword
    out.push(squeeze([bare, brand && `for ${brand} RO`].filter(Boolean).join(' ')));
    out.push(squeeze([brand, bare, 'for RO Water Purifier'].filter(Boolean).join(' ')));
  }

  return [...new Set(out.filter((s) => s && s !== base))].slice(0, 3);
}

export interface TitleOption { label: string; value: string; len: number; note: string }

/**
 * Meta-title options. Target band is 50–58 characters — that is the length
 * band with the lowest measured Google rewrite rate.
 */
export function suggestMetaTitles(i: ProductSeoInput): TitleOption[] {
  const name = i.name.trim();
  const price = inr(i.sellingPrice);
  const tech = techLabel(i.purificationTech);
  const brand = (i.brandName ?? '').trim();
  const litres = i.storageLitres && i.storageLitres > 0 ? `${i.storageLitres}L` : '';
  const raw: { label: string; value: string; note: string }[] = [];

  if (i.type === 'NEW_RO') {
    raw.push({
      label: 'Buy intent',
      value: squeeze(`${brand} ${litres} ${tech} Water Purifier — Buy Online`),
      note: 'Matches "buy kent 8l ro online"',
    });
    raw.push({
      label: 'Price intent',
      value: squeeze(`${brand} ${litres} RO Water Purifier Price ${price}`),
      note: 'Matches "kent ro price" — highest volume pattern in India',
    });
    raw.push({
      label: 'Full name',
      value: squeeze(`${name} — Buy Online`),
      note: 'Exact product-name searches',
    });
  } else if (i.type === 'COMMERCIAL_PLANT') {
    const lph = i.capacityLph ? `${i.capacityLph} LPH` : '';
    raw.push({
      label: 'Capacity intent',
      value: squeeze(`${lph} Commercial RO Plant Price ${price} — India`),
      note: 'Matches "250 lph ro plant price"',
    });
    raw.push({
      label: 'Local + capacity',
      value: squeeze(`${lph} RO Plant in Patna — Install & Service`),
      note: 'Local commercial buyers — highest margin lead',
    });
    raw.push({ label: 'Full name', value: squeeze(`${name} — Buy Online`), note: 'Exact name searches' });
  } else {
    raw.push({
      label: 'Part + price',
      value: squeeze(`${name} Price ${price} — Buy Online`),
      note: 'Spare-part buyers search price first',
    });
    raw.push({
      label: 'Compatibility',
      value: squeeze(`${name} for ${brand || 'All'} RO — Genuine Part`),
      note: 'Matches "ro membrane for kent"',
    });
    raw.push({
      label: 'Local pickup',
      value: squeeze(`${name} in Patna — Same-Day Fitting`),
      note: 'Turns a part sale into a ₹200 visit',
    });
  }

  return raw
    .map((r) => ({ ...r, value: fitTitle(r.value, 60), }))
    .map((r) => ({ ...r, len: r.value.length }))
    .filter((r) => r.len >= 20);
}

/** Trim on a word boundary so a title never ends mid-word. */
export function fitTitle(t: string, max: number): string {
  const s = squeeze(t);
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s—|,-]+$/, '');
}

/** Meta description, 140–158 chars — the band that survives without an ellipsis. */
export function suggestMetaDescription(i: ProductSeoInput): string {
  const price = inr(i.sellingPrice);
  const tech = techLabel(i.purificationTech);
  const warranty = i.warrantyMonths ? `${i.warrantyMonths}-month warranty. ` : '';
  const litres = i.storageLitres && i.storageLitres > 0 ? `${i.storageLitres}L storage. ` : '';

  let body: string;
  if (i.type === 'SPARE_PART' || i.type === 'ACCESSORY') {
    body = `Buy ${i.name} online${price ? ` at ${price}` : ''}. Genuine part, ships across India. ${warranty}Free fitting in Patna with our ₹200 visit. Call 8969821440.`;
  } else if (i.type === 'COMMERCIAL_PLANT') {
    body = `${i.name}${price ? ` at ${price}` : ''}. ${i.capacityLph ? `${i.capacityLph} LPH output. ` : ''}Installation, AMC and spares handled in Patna. ${warranty}Call 8969821440.`;
  } else {
    body = `Buy ${i.name} online${price ? ` at ${price}` : ''}. ${tech ? `${tech} purification. ` : ''}${litres}${warranty}Free installation in Patna. Call 8969821440.`;
  }
  return fitTitle(body, 158);
}

/* ══════════════════════════════════════════════════════════════════════════
   3. KEYWORD BANK — what Indian RO buyers actually type
   ══════════════════════════════════════════════════════════════════════════ */
export function suggestKeywords(i: ProductSeoInput): { group: string; items: string[] }[] {
  const brand = (i.brandName ?? '').trim();
  const b = brand ? brand.toLowerCase() : '';
  const name = i.name.trim().toLowerCase();
  const litres = i.storageLitres && i.storageLitres > 0 ? `${i.storageLitres} litre` : '';
  const lph = i.capacityLph ? `${i.capacityLph} lph` : '';
  const groups: { group: string; items: string[] }[] = [];

  groups.push({
    group: 'Exact product',
    items: [name, `${name} price`, `${name} online`, i.sku ? i.sku.toLowerCase() : ''].filter(Boolean),
  });

  if (b) {
    groups.push({
      group: 'Brand searches',
      items: [
        `${b} water purifier`, `${b} ro price`, `${b} ro purifier price in india`,
        `${b} ro service`, `buy ${b} ro online`,
      ],
    });
  }

  if (i.type === 'NEW_RO') {
    groups.push({
      group: 'Category + spec',
      items: [
        'ro water purifier price', 'best ro water purifier india',
        litres ? `${litres} ro water purifier` : '',
        i.purificationTech.includes('UV') ? 'ro uv water purifier' : '',
        i.purificationTech.includes('ALKALINE') ? 'alkaline ro water purifier' : '',
        i.purificationTech.includes('COPPER') ? 'copper ro water purifier' : '',
        i.purificationTech.includes('TDS_CONTROLLER') ? 'ro with tds controller' : '',
        'water purifier for home',
      ].filter(Boolean),
    });
  } else if (i.type === 'COMMERCIAL_PLANT') {
    groups.push({
      group: 'Commercial buyers',
      items: [
        lph ? `${lph} ro plant price` : 'commercial ro plant price',
        'industrial ro plant', 'ro plant for shop', 'water plant setup cost',
        'commercial ro plant patna',
      ],
    });
  } else {
    groups.push({
      group: 'Spare-part buyers',
      items: [
        `${name} price`, 'ro spare parts online', 'ro service kit',
        b ? `ro parts for ${b}` : 'ro parts compatible',
        'ro filter replacement price',
      ],
    });
  }

  groups.push({
    group: 'Patna local (turns into a ₹200 visit)',
    items: [
      i.type === 'SPARE_PART' ? 'ro spare parts patna' : 'ro purifier patna',
      'water purifier shop in patna', 'ro installation patna', 'ro service in patna',
    ],
  });

  return groups.map((g) => ({ ...g, items: [...new Set(g.items)].filter(Boolean) }));
}

/* ══════════════════════════════════════════════════════════════════════════
   4. SPEC TEMPLATES — one click fills the rows buyers compare on
   ══════════════════════════════════════════════════════════════════════════ */
export interface SpecRow { specGroup: string; specKey: string; specValue: string }

export const SPEC_TEMPLATES: Record<string, SpecRow[]> = {
  NEW_RO: [
    { specGroup: 'General',      specKey: 'Model Name',            specValue: '' },
    { specGroup: 'General',      specKey: 'Storage Capacity',      specValue: '' },
    { specGroup: 'General',      specKey: 'Installation Type',     specValue: 'Wall Mount / Counter Top' },
    { specGroup: 'General',      specKey: 'Suitable For',          specValue: 'Municipal, Borewell & Tanker Water' },
    { specGroup: 'Purification', specKey: 'Purification Stages',   specValue: '' },
    { specGroup: 'Purification', specKey: 'Technology',            specValue: '' },
    { specGroup: 'Purification', specKey: 'Max TDS Handled',       specValue: '2000 ppm' },
    { specGroup: 'Purification', specKey: 'Membrane Type',         specValue: '' },
    { specGroup: 'Purification', specKey: 'Purification Rate',     specValue: '' },
    { specGroup: 'Electrical',   specKey: 'Power Consumption',     specValue: '' },
    { specGroup: 'Electrical',   specKey: 'Operating Voltage',     specValue: '180–260 V AC' },
    { specGroup: 'Dimensions',   specKey: 'Dimensions (W×D×H)',    specValue: '' },
    { specGroup: 'Dimensions',   specKey: 'Weight',                specValue: '' },
    { specGroup: 'General',      specKey: 'Warranty',              specValue: '' },
    { specGroup: 'General',      specKey: 'EAN / Barcode (GTIN)',  specValue: '' },
  ],
  SPARE_PART: [
    { specGroup: 'General',      specKey: 'Part Type',             specValue: '' },
    { specGroup: 'General',      specKey: 'Compatible Brands',     specValue: 'Kent, Aquaguard, Pureit, Livpure, AO Smith' },
    { specGroup: 'General',      specKey: 'Fitting Size',          specValue: '' },
    { specGroup: 'General',      specKey: 'Material',              specValue: '' },
    { specGroup: 'General',      specKey: 'Expected Life',         specValue: '' },
    { specGroup: 'Purification', specKey: 'Rated Capacity',        specValue: '' },
    { specGroup: 'General',      specKey: 'Warranty',              specValue: '' },
    { specGroup: 'General',      specKey: 'EAN / Barcode (GTIN)',  specValue: '' },
  ],
  COMMERCIAL_PLANT: [
    { specGroup: 'General',      specKey: 'Output Capacity',       specValue: '' },
    { specGroup: 'General',      specKey: 'Application',           specValue: 'Shop / Hotel / School / Factory' },
    { specGroup: 'General',      specKey: 'Feed Water TDS',        specValue: '' },
    { specGroup: 'Purification', specKey: 'Membrane Type & Count', specValue: '' },
    { specGroup: 'Purification', specKey: 'Pre-treatment',         specValue: 'Sand + Carbon + Softener' },
    { specGroup: 'Electrical',   specKey: 'Pump Motor',            specValue: '' },
    { specGroup: 'Electrical',   specKey: 'Power Supply',          specValue: '' },
    { specGroup: 'Dimensions',   specKey: 'Frame Size',            specValue: '' },
    { specGroup: 'General',      specKey: 'Warranty',              specValue: '' },
  ],
  ACCESSORY: [
    { specGroup: 'General',      specKey: 'Accessory Type',        specValue: '' },
    { specGroup: 'General',      specKey: 'Compatible With',       specValue: '' },
    { specGroup: 'General',      specKey: 'Material',              specValue: '' },
    { specGroup: 'General',      specKey: 'Pack Contents',         specValue: '' },
    { specGroup: 'General',      specKey: 'EAN / Barcode (GTIN)',  specValue: '' },
  ],
};

/** Common Indian HSN codes so the admin never has to look them up. */
export const HSN_HINTS: { code: string; label: string; gst: number }[] = [
  { code: '84213900', label: 'Water purifier / RO system (domestic)', gst: 18 },
  { code: '84212190', label: 'Water filtering & purifying machinery', gst: 18 },
  { code: '84219900', label: 'RO membrane, filter cartridge, spare parts', gst: 18 },
  { code: '84137010', label: 'Booster pump / centrifugal pump', gst: 18 },
  { code: '85043100', label: 'SMPS / adaptor / transformer', gst: 18 },
  { code: '39172390', label: 'PVC / PE tubing and pipe fittings', gst: 18 },
];

/* ══════════════════════════════════════════════════════════════════════════
   5. SEO SCORE — a hard checklist, no vanity points
   ══════════════════════════════════════════════════════════════════════════ */
export interface SeoCheck {
  id: string; label: string; ok: boolean; weight: number;
  detail: string; severity: 'critical' | 'important' | 'nice';
}

export function scoreProductSeo(i: ProductSeoInput): {
  score: number; checks: SeoCheck[]; criticalOpen: number;
} {
  const title = (i.seo?.metaTitle || '').trim();
  const desc = (i.seo?.metaDescription || '').trim();
  const kw = (i.seo?.metaKeywords || '').trim();
  const shortDesc = (i.shortDescription || '').trim();
  const longDesc = (i.description || '').replace(/<[^>]+>/g, '').trim();
  const imgs = (i.images || []).filter((x) => x.url.trim());
  const specs = (i.specifications || []).filter((s) => s.specKey.trim() && s.specValue.trim());
  const effTitle = title || i.name;
  const lower = effTitle.toLowerCase();
  const gtin = findGtin(i.specifications);

  const c: SeoCheck[] = [
    {
      id: 'title-len', severity: 'critical', weight: 14,
      label: 'Meta title 45–60 characters',
      ok: effTitle.length >= 45 && effTitle.length <= 60,
      detail: `Abhi ${effTitle.length} chars. 51–55 pe Google sabse kam rewrite karta hai (~40%). 70 se upar 100% rewrite ho jata hai.`,
    },
    {
      id: 'title-clean', severity: 'critical', weight: 10,
      label: 'Title me promo word / ALL CAPS nahi',
      ok: !BANNED_TITLE_WORDS.some((w) => lower.includes(w)) && !/\b[A-Z]{5,}\b/.test(effTitle),
      detail: 'Google Merchant Center "sale", "best price", "free shipping" aur ALL CAPS pe listing reject karta hai.',
    },
    {
      id: 'title-type', severity: 'critical', weight: 10,
      label: 'Title me product type ka word hai',
      ok: /purifier|ro\b|membrane|pump|filter|plant|smps|kit|cartridge|housing|adaptor|valve|tank/i.test(effTitle),
      detail: 'Agar title me "kya cheez hai" nahi likha to Google us query se match hi nahi karega.',
    },
    {
      id: 'desc-len', severity: 'critical', weight: 12,
      label: 'Meta description 120–158 characters',
      ok: desc.length >= 120 && desc.length <= 158,
      detail: `Abhi ${desc.length} chars. 158 se lamba SERP me kat jata hai.`,
    },
    {
      id: 'brand', severity: 'important', weight: 8,
      label: 'Brand select kiya hua hai',
      ok: Boolean((i.brandName || '').trim()),
      detail: 'Merchant Center me brand har naye physical product ke liye required hai. Product schema me bhi jata hai.',
    },
    {
      id: 'images', severity: 'critical', weight: 10,
      label: '3 ya zyada images',
      ok: imgs.length >= 3,
      detail: `Abhi ${imgs.length}. Google 3–5 images ko sweet spot maanta hai; 1 image wale listing kam click late hain.`,
    },
    {
      id: 'alt', severity: 'important', weight: 8,
      label: 'Har image ka alt text bhara hai',
      ok: imgs.length > 0 && imgs.every((x) => x.altText.trim().length >= 12),
      detail: 'Alt text Google Images ranking aur accessibility dono ke liye. Har image ka alag hona chahiye.',
    },
    {
      id: 'short', severity: 'important', weight: 7,
      label: 'Short description 80–300 characters',
      ok: shortDesc.length >= 80 && shortDesc.length <= 300,
      detail: `Abhi ${shortDesc.length}. Ye product card aur search results dono me dikhta hai.`,
    },
    {
      id: 'long', severity: 'important', weight: 8,
      label: 'Full description 500+ characters',
      ok: longDesc.length >= 500,
      detail: `Abhi ${longDesc.length}. Google product data spec 500–1,000 chars recommend karta hai; pehle 160–500 chars sabse important.`,
    },
    {
      id: 'specs', severity: 'important', weight: 8,
      label: '6 ya zyada specification rows',
      ok: specs.length >= 6,
      detail: `Abhi ${specs.length} bhare hue. Spec table long-tail queries (storage, TDS, voltage) ko pakadta hai.`,
    },
    {
      id: 'price', severity: 'critical', weight: 6,
      label: 'MRP > selling price (discount dikhega)',
      ok: Boolean(i.mrp && i.sellingPrice && i.mrp > i.sellingPrice),
      detail: 'Discount % rich result me dikhta hai aur CTR badhata hai. MRP = selling price ho to kuch nahi dikhta.',
    },
    {
      id: 'gtin', severity: 'nice', weight: 4,
      label: 'GTIN / EAN barcode diya hai',
      ok: Boolean(gtin),
      detail: 'Specs me "EAN / Barcode (GTIN)" row bharo. Google ka apna data: sahi GTIN se ~20% zyada clicks.',
    },
    {
      id: 'hsn', severity: 'nice', weight: 3,
      label: 'HSN code bhara hai (GST invoice ke liye)',
      ok: Boolean((i.hsnCode || '').trim()),
      detail: 'GST invoice me HSN mandatory hai. SEO ka nahi, compliance ka point hai.',
    },
    {
      id: 'kw', severity: 'nice', weight: 2,
      label: 'Keywords field bhara hai',
      ok: kw.split(',').filter((x) => x.trim()).length >= 4,
      detail: 'Google ranking ke liye meta keywords use nahi karta, lekin internal search aur AI crawlers padhte hain.',
    },
  ];

  const total = c.reduce((s, x) => s + x.weight, 0);
  const got = c.filter((x) => x.ok).reduce((s, x) => s + x.weight, 0);
  return {
    score: Math.round((got / total) * 100),
    checks: c,
    criticalOpen: c.filter((x) => !x.ok && x.severity === 'critical').length,
  };
}

/** Pull a GTIN/EAN out of the spec rows so we never need a new DB column. */
export function findGtin(specs?: { specKey: string; specValue: string }[]): string | undefined {
  if (!specs) return undefined;
  const row = specs.find((s) => /gtin|ean|barcode|upc/i.test(s.specKey));
  const v = (row?.specValue || '').replace(/[^0-9]/g, '');
  return v.length >= 8 && v.length <= 14 ? v : undefined;
}

/** Alt text that is descriptive and unique per image — never "product photo 1". */
export function suggestAltText(i: ProductSeoInput, index: number): string {
  const tech = techLabel(i.purificationTech);
  const angles = [
    'front view',
    'side view',
    'installed on wall',
    'filter compartment open',
    'in use',
  ];
  const base = [i.brandName, i.name].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim() || 'RO water purifier';
  const suffix = index === 0
    ? (tech ? `${tech} — front view` : 'front view')
    : angles[Math.min(index, angles.length - 1)];
  return fitTitle(`${base} — ${suffix}`, 120);
}
