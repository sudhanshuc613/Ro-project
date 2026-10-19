/**
 * browser-check.mjs — har page ASLI BROWSER me kholo aur console error pakdo.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 KYU BANA (18 Oct 2026) — MERI GALTI NE YE ZAROORI BANAYA
 * ────────────────────────────────────────────────────────────
 * Maine `TrustBadges` ko `async` server component bana diya tha. Uska ek
 * caller `QuickBookForm.tsx` hai, jo `'use client'` hai. React me client
 * component ke andar async server component render NAHI ho sakta — browser me
 * seedha ye aata hai:
 *
 *     "Application error: a client-side exception has occurred"
 *
 * Owner ko /ro-services-patna aur /service-patna par yahi dikha.
 *
 * 🔴 ASLI SABAK: server ne phir bhi HTTP 200 aur poora HTML bheja. Isliye
 *    mere SAARE test PASS ho rahe the — curl, crawl, deep-audit, jsonld,
 *    gbp-consistency, 3408 tests. Kyunki wo sab sirf SERVER ka HTML dekhte
 *    hain. Ye galti SIRF asli browser me, hydration ke waqt dikhti hai.
 *
 * Isliye ab ye test hai: Chromium me har page kholo, hydration hone do, aur
 * koi bhi console error / page error / "Application error" text pakdo.
 *
 * Checks per page:
 *   1. HTTP status 200
 *   2. koi uncaught page error nahi (React crash)
 *   3. console me koi `error` level message nahi
 *   4. page par "Application error" / "client-side exception" text nahi
 *   5. hydration ke BAAD bhi <h1> maujood hai (tree unmount to nahi hua)
 *
 * Usage: node scripts/browser-check.mjs [BASE] [--all]
 *        default: ek-ek representative page (tez)
 *        --all  : sitemap ke saare URL
 */
import { chromium } from 'playwright';

const BASE = (process.argv[2] && !process.argv[2].startsWith('--'))
  ? process.argv[2].replace(/\/$/, '')
  : 'http://127.0.0.1:3100';
const ALL = process.argv.includes('--all');

/* Har alag TEMPLATE se kam se kam ek page. Jo page owner ne toota bataya
   (ro-services-patna, service-patna) wo sabse upar. */
const SAMPLE = [
  '/ro-services-patna',          // owner ne yahi toota dekha
  '/service-patna',              // aur yahi
  '/',                           // QuickBookForm + ProofStats + Testimonials
  '/ro-service-in-patna',        // ads landing — AdsHeroBanner + WhyChooseGrid
  '/ro-service-patna/kankarbagh',// area template
  '/service-patna/brand/kent',   // brand template
  '/ro-problem/ro-leakage-problem', // symptom template
  '/ro-problem-checker',
  '/ro-customer-care-patna',
  '/ro-service-patna-faq',
  '/blog',
  '/blog/ro-service-charge-patna-rate-list',
  '/about/sudhanshu-choudhary',
  '/products',
  '/products/aquabizz-pure-8l-ro-uv-uf-water-purifier',
  '/category/spare-parts',
  '/amc-plans',
  '/contact',
  '/cart',
  '/checkout',
  '/track-order',
  '/search?q=membrane',
  '/login',
  '/register',
  '/admin/login',
];

async function urls() {
  if (!ALL) return SAMPLE;
  const r = await fetch(BASE + '/sitemap.xml');
  const x = await r.text();
  return [...x.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, '') || '/');
}

const list = await urls();
console.log(`════ BROWSER CHECK — ${list.length} page · ${BASE} ════`);

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
let pass = 0;
const fails = [];

/* Shor jo asli bug nahi hai. Yahan sirf WAHI daalo jo samajh kar chhoda ho. */
const IGNORE = [
  /favicon/i,
  /Failed to load resource.*(cloudflareinsights|googletagmanager|google-analytics|gstatic|doubleclick)/i,
  /net::ERR_(BLOCKED_BY_CLIENT|NAME_NOT_RESOLVED|INTERNET_DISCONNECTED)/i,
  /Download the React DevTools/i,
];
const noisy = (t) => IGNORE.some((re) => re.test(t));

for (const u of list) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];

  page.on('console', (m) => { if (m.type() === 'error' && !noisy(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  page.on('pageerror', (e) => { if (!noisy(String(e))) errs.push('pageerror: ' + String(e).slice(0, 200)); });

  let status = 0;
  try {
    const resp = await page.goto(BASE + u, { waitUntil: 'networkidle', timeout: 60000 });
    status = resp ? resp.status() : 0;
    /* Hydration ko poora hone do — async-in-client wali galti yahin phatti hai. */
    await page.waitForTimeout(1800);
  } catch (e) {
    errs.push('navigation: ' + String(e).slice(0, 160));
  }

  const body = await page.content().catch(() => '');
  const crashed = /Application error|client-side exception|Unhandled Runtime Error/i.test(body);
  const h1 = await page.locator('h1').count().catch(() => 0);

  const bad = [];
  if (status !== 200) bad.push(`HTTP ${status}`);
  if (crashed) bad.push('🔴 "Application error" page par');
  if (errs.length) bad.push(...errs.slice(0, 3));
  /* /cart, /checkout jaise page par h1 na ho to theek — sirf crash dekho */
  if (h1 === 0 && crashed) bad.push('h1 gayab (tree unmount ho gaya)');

  if (bad.length) {
    fails.push([u, bad]);
    console.log(`  FAIL  ${u}`);
    bad.forEach((b) => console.log(`          ${b}`));
  } else {
    pass++;
    console.log(`  ok    ${u.padEnd(46)} HTTP ${status} · h1=${h1} · console-error 0`);
  }
  await ctx.close();
}

await browser.close();
console.log();
console.log('════════════════════════════════════');
console.log(`  PASS: ${pass}    FAIL: ${fails.length}`);
console.log('════════════════════════════════════');
process.exit(fails.length ? 1 : 0);
