/**
 * CONTENT DATES — sitemap ke `lastmod` ke liye asli tareekhein.
 *
 * ── Ye file kyu bani (19 Sep 2026) ──────────────────────────────────────
 * Pehle `src/app/sitemap.ts` har URL pe `lastModified: new Date()` bhejta
 * tha. `export const revalidate = 3600` ke saath iska matlab ye tha ki har
 * ghante sitemap dubara banta tha aur **120+ URLs ka lastmod badal jata tha,
 * chahe us page ka content mahino se na badla ho.**
 *
 * Live proof (19 Sep 2026, do fetch):
 *   hum    : 133 URLs → sirf 13 alag lastmod values, sab build-time
 *   rscp   : 66 URLs → 66 alag lastmod values (har page ki apni asli date)
 *   rosale : 88 URLs → 85 alag lastmod values
 *
 * Google ka documented behaviour: lastmod tabhi use hota hai jab wo
 * "consistently and verifiably accurate" ho. Jo site har baar sab kuch
 * "abhi badla" bolti hai, uska lastmod Google **puri site ke liye** ignore
 * kar deta hai. Matlab hamara sabse kaam ka crawl signal zero pe tha —
 * jab hum sach me ek page update karte the, Google ko farq hi nahi dikhta tha.
 *
 * ── Rule ────────────────────────────────────────────────────────────────
 * Yahan date tabhi badlo jab page ka ASLI content badle — H1, body copy,
 * schema, ya internal links. Dependency bump, typo fix, ya CSS change
 * "significant update" NAHI hai. Jhoothi date se dobara wahi bug aa jayega.
 *
 * Jis page ki sach-much koi bharosemand date na ho, use `undefined` rakho —
 * lastmod chhod dena jhooth bolne se behtar hai (Google ka apna guidance).
 */

/** YYYY-MM-DD → Date (UTC midnight, W3C-valid). */
function d(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

/**
 * Har route ki asli aakhri content-change date.
 * Source: is project ki build/push history (AQUA-PERL-MASTER-MEMORY.md).
 */
export const CONTENT_DATES: Record<string, Date> = {
  /* 19 Sep 2026 — keyword cannibalization fix: homepage "near me" pe gaya,
     /service-patna "water purifier repair" pe. Dono ka H1 + title badla. */
  /* 🔴 2 Nov 2026 — BRAND_DISCLAIMER ka amber box logo grid ke UPAR aaya
     (BrandLogoGrid.tsx). Ye body copy ka asli badlav hai, isliye date badli. */
  '/': d('2026-11-02'),
  /* 🔴 27 Oct 2026 — anchor cannibalization fix. Is page par aane wale
     243 'ro service patna' anchor /ro-service-in-patna par bheje gaye,
     aur iska apna top anchor 'water purifier repair patna' ho gaya.
     Internal links badle = file ke apne niyam se date badalni thi. */
  '/service-patna': d('2026-10-27'),

  /* 19 Sep 2026 — H1 glue bug fix (21 brand pages pe "PatnaVisit" chipak
     raha tha). Brand hub bhi usi push me chhua gaya. */
  /* 10/13 — title cannibalization fix: "RO Service in Patna" se "All RO Brands Service in Patna" */
  /* 2 Nov 2026 — disclaimer box BrandHubGrid ke upar aaya. */
  '/service-patna/brand': d('2026-11-02'),

  /* 12 Sep 2026 — head-term page banaya (2,932 words, 26 schema types). */
  /* 10/12 — pricing fix (adaptor rate) — Ads landing page */
  /* 27 Oct — anchor fix (161 → 310 andruni link) + title me phone.
     2 Nov — disclaimer logo grid ke upar (BrandCallCards). */
  '/ro-service-in-patna': d('2026-11-02'),

  /* 18 Sep 2026 — H2 keyword density 5/10 → 10/10, 9 synonym keywords. */
  /* 10/13 — IntentKeywordBlock(service) 20 kw + ExtraKeywordBlock hinglish/urgent + pricing fix */
  /* 2 Nov 2026 — disclaimer box logo grid ke upar. */
  '/ro-services-patna': d('2026-11-02'),
  /* Naya page, 9 Oct 2026 — RO customer care / helpline hub. */
  '/ro-customer-care-patna': d('2026-10-09'),
  '/ro-service-patna-faq': d('2026-10-13'),

  /* 16 Sep 2026 — symptom hub live (Hinglish queries, zero web competition). */
  /* 10/13 — ExtraKeywordBlock(problem) 7 Hinglish shikayat */
  '/ro-problem-checker': d('2026-10-13'),

  /* Catalog aur static pages — jab aakhri baar sach me chhue gaye. */
  /* 10/13 — IntentKeywordBlock(shop) + ExtraKeywordBlock(shop) 7 dukaan kw */
  '/products': d('2026-10-13'),
  /* 10/13 — ExtraKeywordBlock(amc) 3 AMC kw */
  '/amc-plans': d('2026-10-13'),
  /* 10/11 — +3 H2 +7 H3, breadcrumb schema */
  '/contact': d('2026-10-11'),
  /* 10/11 — +2 H2 +4 H3 */
  '/blog': d('2026-10-11'),
};

/** Intent pages (7) — 18 Sep ko H2 density aur title me phone add hua. */

/* 🔴 15 Oct 2026 — DATES SACH ME PURANI THI, YE MERI CHOOK THI
   ─────────────────────────────────────────────────────────────────────────
   Owner ne pakda: "Search Console me index nahi dikha raha".
   Naap kar dekha — 83 area page ka sitemap lastmod 2026-09-18 par atka tha,
   jabki un pages ka content 11, 12 aur 13 October ko POORA badla:

     11 Oct  AreaKeywordBlock      — 8 naye H3, 12 keyword pattern
     12 Oct  pricing fix           — SMPS/pump/adaptor ke rate
     13 Oct  area-city-label       — title/H1 ka "Patna Patna" fix
     13 Oct  BrandAreaBlock        — 19 brand + installation, har area page par

   Rendered words 2,400 se 3,560 ho gaye — ye "significant update" hai.
   Par lastmod wahi 18 Sep bol raha tha, yani Google ko signal ja raha tha
   "kuch nahi badla, dobara mat aao". Isi wajah se naya content crawl hone
   me der lag rahi thi.

   Is file ka asli niyam (19 Sep) bilkul sahi hai — jhoothi `new Date()` mat
   bhejo. Par ab wo doosri taraf jhooth bol raha tha. Date tabhi badalni hai
   jab content SACH ME badle — aur wo badla hai, isliye ab sach likha ja raha hai.

   🔴 NIYAM AAGE KE LIYE: jab bhi area/brand/intent page ka content badlo,
   is file ki date BHI usi commit me badlo. Warna Google ko pata hi nahi chalega. */


/* intent pages: 13 Oct — IntentKeywordBlock (install variant),
   ExtraKeywordBlock (commercial), aur 12 Oct ka pricing fix. */
export const INTENT_PAGES_DATE = d('2026-10-27');

/** Symptom pages (5) — 16 Sep ko banaye gaye. */
/* symptom pages: 12 Oct — symptom-data.ts me SMPS ka rate theek kiya
   (doosra ₹550 → ₹700 se ₹1,100). */
export const SYMPTOM_PAGES_DATE = d('2026-10-12');

/** 73 area pages — 18 Sep ko H1 glue fix + depth content. */
/* area pages: 13 Oct — AreaKeywordBlock (11 Oct) + pricing fix (12 Oct)
   + area-city-label title/H1 fix aur BrandAreaBlock 19 brand (13 Oct).
   Rendered words 2,400 → 3,560. */
export const AREA_PAGES_DATE = d('2026-10-27');

/** 21 brand pages — 19 Sep ko H1 glue bug theek hua. */
/* brand pages: 13 Oct — BrandKeywordBlock (12 Oct, 5 naye section) +
   model-wise H4 + customer care number + BrandAreaListBlock 18 ilaake (13 Oct).
   Rendered words 1,700 → 2,610. */
export const BRAND_PAGES_DATE = d('2026-10-27');

/** Author page. */
export const AUTHOR_PAGE_DATE = d('2026-09-15');

/**
 * Ek static path ki date do. Na mile to `undefined` —
 * caller tab lastmod field bilkul chhod dega.
 */
export function contentDate(path: string): Date | undefined {
  return CONTENT_DATES[path];
}

/* ══════════════════════════════════════════════════════════════════════════
   🔴 3 Nov 2026 — INTENT_DATE_OVERRIDES
   ──────────────────────────────────────────────────────────────────────────
   `INTENT_PAGES_DATE` saare intent page ko EK date deti hai. Ye tab theek
   tha jab saat ke saat page ek hi push me badle the. Ab nahi:

     • /ro-service-centre-patna  — bilkul naya page, 3 Nov 2026
     • baaki 7                   — 27 Oct ko title me phone + anchor fix

   Sab ko 3 Nov bol dena JHOOTH hota, aur is file ka poora point hi yahi hai
   ki lastmod sach bole. Isliye override map — jiska naam yahan hai uski
   apni date, baaki sab INTENT_PAGES_DATE par.
   ══════════════════════════════════════════════════════════════════════════ */
export const INTENT_DATE_OVERRIDES: Record<string, Date> = {
  'ro-service-centre-patna': d('2026-11-03'),
};

/** Ek intent slug ki asli date. Override na ho to group date. */
export function intentDate(slug: string): Date {
  return INTENT_DATE_OVERRIDES[slug] ?? INTENT_PAGES_DATE;
}
