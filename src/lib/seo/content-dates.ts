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
  '/': d('2026-09-19'),
  '/service-patna': d('2026-09-19'),

  /* 19 Sep 2026 — H1 glue bug fix (21 brand pages pe "PatnaVisit" chipak
     raha tha). Brand hub bhi usi push me chhua gaya. */
  '/service-patna/brand': d('2026-09-19'),

  /* 12 Sep 2026 — head-term page banaya (2,932 words, 26 schema types). */
  '/ro-service-in-patna': d('2026-09-12'),

  /* 18 Sep 2026 — H2 keyword density 5/10 → 10/10, 9 synonym keywords. */
  '/ro-services-patna': d('2026-09-18'),
  '/ro-service-patna-faq': d('2026-09-18'),

  /* 16 Sep 2026 — symptom hub live (Hinglish queries, zero web competition). */
  '/ro-problem-checker': d('2026-09-16'),

  /* Catalog aur static pages — jab aakhri baar sach me chhue gaye. */
  '/products': d('2026-09-10'),
  '/amc-plans': d('2026-09-04'),
  '/contact': d('2026-09-04'),
  '/blog': d('2026-09-15'),
};

/** Intent pages (7) — 18 Sep ko H2 density aur title me phone add hua. */
export const INTENT_PAGES_DATE = d('2026-09-18');

/** Symptom pages (5) — 16 Sep ko banaye gaye. */
export const SYMPTOM_PAGES_DATE = d('2026-09-16');

/** 73 area pages — 18 Sep ko H1 glue fix + depth content. */
export const AREA_PAGES_DATE = d('2026-09-18');

/** 21 brand pages — 19 Sep ko H1 glue bug theek hua. */
export const BRAND_PAGES_DATE = d('2026-09-19');

/** Author page. */
export const AUTHOR_PAGE_DATE = d('2026-09-15');

/**
 * Ek static path ki date do. Na mile to `undefined` —
 * caller tab lastmod field bilkul chhod dega.
 */
export function contentDate(path: string): Date | undefined {
  return CONTENT_DATES[path];
}
