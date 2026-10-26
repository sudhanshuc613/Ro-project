/**
 * MOBILE OVERFLOW GATE — asli browser me, 360px aur 390px par.
 *
 * ── 🔴 KYUN (26 Oct 2026, live naap) ──────────────────────────────────────
 *
 * Owner: "thoda mobile optimization acha rakha aur look ui wagreh".
 * Live site 149 page par asli Chrome me 360px par naapi gayi:
 *
 *     docSW > 360  →  15 page
 *       8 intent page   378   (hero ka QuickBookForm card)
 *       6 product page  415   (gallery wala sticky div)
 *       homepage        728   (ReviewShowcase ka carousel)  ← 368px bahar
 *
 * Teeno ki ek hi jad thi: CSS grid ka child default me `min-width: auto`
 * hota hai. Andar koi aisi cheez ho jo simat na sake (carousel ka flex
 * track, form, thumbnail row) to grid item column se CHAUDA ho jaata hai
 * aur poora document side me khisak jaata hai.
 *
 * Fix: un grid par `[&>*]:min-w-0`.
 *
 * ── Ye gate kya rokta hai ─────────────────────────────────────────────────
 *
 * Koi bhi naya grid/flex block jo mobile par chaudai todta ho.
 *
 * 🔴 DO BAAT JO PEHLE GALAT KI THI (dobara mat karna):
 *   1. `scrollWidth > clientWidth` akela dhokha deta hai. Isliye ye gate
 *      `document.documentElement.scrollWidth` ko VIEWPORT se milata hai —
 *      Lighthouse / Search Console bhi yahi dekhte hain.
 *   2. Jo element kisi `overflow-x: auto/hidden` wale maa-baap ke andar hai
 *      wo GALTI nahi hai (jaise chips ka slider). Isliye culprit dhoondhte
 *      waqt uparwale sab maa-baap check hote hain.
 *
 * 🔴 Test agar CHALA HI NAHI to LOUDLY fail karta hai (bug class N).
 *
 * Chalao: node scripts/mobile-overflow-test.mjs http://127.0.0.1:3100
 */
import { chromium } from '@playwright/test';

const BASE = (process.argv[2] || 'http://127.0.0.1:3100').replace(/\/$/, '');
const WIDTHS = [360, 390];

/* Har template ka ek namoona — poori 149 page browser me chalana build ko
   bahut lamba kar deta hai. Jo template toote the wo sab yahan hain. */
const PAGES = [
  '/',                                  // ReviewShowcase carousel
  '/ro-filter-change-patna',            // intent hero + QuickBookForm
  '/ro-repair-patna',
  '/ro-service-in-patna',               // intent + ads landing grid
  '/ro-amc-patna',
  '/ro-installation-patna',
  '/ro-membrane-replacement-patna',
  '/commercial-ro-service-patna',
  '/ro-services-patna',                 // apna alag hero
  '/service-patna',
  '/service-patna/brand/kent',
  '/service-patna/brand/aquaguard',     // + Hinglish block
  '/ro-service-patna/boring-road',      // area template
  '/ro-service-patna/danapur',
  '/products',
  '/contact',
  '/ro-customer-care-patna',            // + Hinglish block
  '/ro-problem-checker',
  '/amc-plans',
  '/blog',
];

/* 🔴 6 product page bhi toote the (gallery ka sticky div, docSW 415).
   Slug seed-data ke saath badalte hain, isliye sitemap se liye jaate hain —
   hardcode karte to seed badalne par test chup-chaap kam page check karta.
   (bug class N: jo test chala hi nahi use PASS mat ginna) */
let PRODUCTS = [];
try {
  const sm = await (await fetch(BASE + '/sitemap.xml')).text();
  PRODUCTS = [...sm.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''))
    .filter((u) => u.startsWith('/products/'))
    .slice(0, 6);
} catch { /* neeche loudly fail ho jaayega */ }
PAGES.push(...PRODUCTS);

let P = 0;
let F = 0;
const FAILS = [];
function chk(label, ok, detail = '') {
  if (ok) { P++; console.log(`  PASS  ${label}${detail ? '  ' + detail : ''}`); }
  else { F++; FAILS.push(label); console.log(`  FAIL  ${label}${detail ? '  ' + detail : ''}`); }
}

const probe = (vw) => {
  const culprits = [];
  for (const el of document.querySelectorAll('body *')) {
    const bb = el.getBoundingClientRect();
    if (bb.width === 0 || bb.height === 0 || bb.right <= vw + 1) continue;
    let a = el.parentElement;
    let clipped = false;
    while (a) {
      const cs = getComputedStyle(a);
      if (['auto', 'scroll', 'hidden', 'clip'].includes(cs.overflowX)) { clipped = true; break; }
      a = a.parentElement;
    }
    if (!clipped) {
      culprits.push(
        el.tagName + '.' + (el.className?.toString?.() || '').slice(0, 55)
        + '|w' + Math.round(bb.width),
      );
    }
  }
  return {
    docSW: document.documentElement.scrollWidth,
    vw,
    culprits: culprits.slice(0, 3),
    n: culprits.length,
  };
};

console.log('='.repeat(72));
console.log(`  MOBILE OVERFLOW GATE  —  ${BASE}`);
console.log('='.repeat(72));
console.log();

let browser;
try {
  browser = await chromium.launch();
} catch (e) {
  console.log(`  FAIL  chromium launch nahi hua: ${String(e).slice(0, 120)}`);
  console.log();
  console.log(`  PASS: 0    FAIL: 1`);
  process.exit(1);
}

let checked = 0;
for (const w of WIDTHS) {
  console.log(`── ${w}px ──`);
  const ctx = await browser.newContext({
    viewport: { width: w, height: 800 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 '
             + '(KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36',
  });
  for (const path of PAGES) {
    const pg = await ctx.newPage();
    let r = null;
    try {
      const resp = await pg.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 60000 });
      if (!resp || resp.status() >= 400) {
        chk(`${path} khula`, false, `HTTP ${resp ? resp.status() : 'null'}`);
        await pg.close();
        continue;
      }
      await pg.waitForTimeout(700);
      r = await pg.evaluate(probe, w);
    } catch (e) {
      chk(`${path} load hua`, false, String(e).slice(0, 80));
      await pg.close();
      continue;
    }
    checked++;
    chk(
      `${path} docSW == ${w}`,
      r.docSW <= w,
      `docSW=${r.docSW}${r.n ? '  culprit: ' + r.culprits.join(' | ') : ''}`,
    );
    await pg.close();
  }
  await ctx.close();
  console.log();
}
await browser.close();

/* 🔴 bug class N — jo test chala hi nahi use PASS mat ginna */
/* local seed me 4 product hain, live par 6 — isliye >= 3.
   Shunya hone par ye LOUD FAIL hai (bug class N: chup-chaap 0 page check
   karke PASS dena sabse khatarnak). */
chk('🔴 sitemap se product page mile', PRODUCTS.length >= 3,
    `${PRODUCTS.length} product page`);
const want = WIDTHS.length * PAGES.length;
chk('🔴 saare page sach me check hue', checked === want, `${checked}/${want}`);

console.log('='.repeat(72));
console.log(`  PASS: ${P}    FAIL: ${F}`);
console.log('='.repeat(72));
for (const x of FAILS) console.log(`   🔴 ${x}`);
process.exit(F === 0 ? 0 : 1);
