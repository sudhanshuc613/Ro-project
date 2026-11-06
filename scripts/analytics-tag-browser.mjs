/**
 * ANALYTICS TAG — ASLI BROWSER test, ASLI HOSTNAME ke saath.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 KYUN SERVER-HTML TEST KAAFI NAHI
 * ───────────────────────────────────
 * GTM aur GA4 dono CLIENT par lagte hain, aur dono pehle ye dekhte hain ki
 * `window.location.hostname` asli domain hai ya nahi. Server ke HTML me
 * script tag hota hi nahi. Matlab curl se ye kabhi verify nahi ho sakta —
 * bilkul wahi bug class jisne 18 Oct ko React #329 chhupa liya tha.
 *
 * Isliye ye test Chromium ko `--host-resolver-rules` deta hai, jisse
 * `rokadoctor.in` 127.0.0.1 par resolve hota hai. Browser ko lagta hai wo
 * asli site par hai, host check sach me chalta hai, aur hum NAAP sakte hain
 * ki Google ka script request gaya ya nahi.
 *
 * Google ko sach me request nahi jaane dete — `page.route` use abort kar
 * deta hai. Request RECORD ho jaati hai, par internet par jaati nahi.
 * Isse test offline bhi chalta hai aur Google ke paas test data nahi jaata.
 *
 * DO SCENARIO:
 *   default  DB me analytics row hai hi nahi — yahi haalat deploy ke turant
 *            baad hoti hai. GTM aur GA4 dono constants.ts se chalne chahiye.
 *            🔴 6 Nov: pehle gtmId ka default khaali tha, isliye is scenario
 *            me GTM load hi nahi hota tha. Isi test ne pakda.
 *   admin    Asli admin panel se ID badlo (login -> PUT -> revalidatePath)
 *            aur naapo ki page par NAYI id gayi. Ye poora raasta jaanchta
 *            hai: auth, validation, save, cache-bust, render.
 *            Isme hi "switch OFF" bhi test hota hai.
 *
 * Usage: node scripts/analytics-tag-browser.mjs <scenario> [port]
 */
import { chromium } from 'playwright';

const SCENARIO = process.argv[2] || 'full';
const PORT = process.argv[3] || '3100';

let pass = 0;
let fail = 0;
const ok = (name, cond, got) => {
  if (cond) pass++;
  else {
    fail++;
    console.log(`  FAIL  ${name}${got === undefined ? '' : `   got: ${JSON.stringify(got)}`}`);
  }
};

/** Ek page kholo aur Google ko gaye saare request record karo. */
async function probe(browser, host, path = '/') {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const hits = [];
  const consoleErrors = [];
  const pageErrors = [];

  /* Google par asli request mat jaane do — record karke abort. */
  await page.route('**://*.googletagmanager.com/**', (route) => {
    hits.push(route.request().url());
    route.abort();
  });
  await page.route('**://*.google-analytics.com/**', (route) => {
    hits.push(route.request().url());
    route.abort();
  });

  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  const res = await page.goto(`http://${host}:${PORT}${path}`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  /* next/script afterInteractive hydration ke baad lagta hai — thoda ruko. */
  await page.waitForTimeout(2500);

  const dataLayer = await page.evaluate(() => {
    const w = /** @type {any} */ (window);
    return { has: Array.isArray(w.dataLayer), len: w.dataLayer ? w.dataLayer.length : -1, gtag: typeof w.gtag };
  });
  const scriptIds = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[id]')).map((s) => s.id));

  await ctx.close();
  return { status: res?.status(), hits, consoleErrors, pageErrors, dataLayer, scriptIds };
}

/**
 * Admin ban kar /api/admin/settings par PUT karo.
 *
 * NextAuth ka credentials flow: pehle csrf token, phir callback. Cookie
 * APIRequestContext khud sambhalta hai. Isse poora asli raasta test hota
 * hai — wahi jo owner admin panel me Save dabane par chalata hai.
 */
async function adminPut(browser, value) {
  /* 🔴 127.0.0.1 hi, rokadoctor.in NAHI.
     `--host-resolver-rules` sirf BROWSER ke andar chalta hai. Playwright ka
     APIRequestContext Node ke DNS se jaata hai, isliye wo `rokadoctor.in`
     ko asli public IP (Cloudflare) par bhejta hai aur 30s me timeout ho
     jaata hai. 6 Nov ko exactly yahi hua.
     Admin API ko hostname se koi matlab nahi — host check sirf client-side
     analytics component me hai. Isliye seedha loopback. */
  const api = await browser.newContext({ baseURL: `http://127.0.0.1:${PORT}` });
  const req = api.request;
  const csrfRes = await req.get('/api/auth/csrf');
  const { csrfToken } = await csrfRes.json();
  await req.post('/api/auth/callback/password', {
    form: {
      csrfToken,
      phone: '8969821440',
      password: 'ChangeMe@123',
      callbackUrl: `http://127.0.0.1:${PORT}/admin`,
      json: 'true',
    },
  });
  const sess = await (await req.get('/api/auth/session')).json();
  const role = sess?.user?.role ?? null;
  const put = await req.put('/api/admin/settings', {
    data: { key: 'analytics', value },
  });
  const body = await put.text();
  await api.close();
  return { role, status: put.status(), body };
}

const gtmHit = (h) => h.some((u) => u.includes('/gtm.js?id='));
const gtmId = (h) => (h.find((u) => u.includes('/gtm.js?id=')) || '').split('id=')[1] || '';
const gaHit = (h) => h.some((u) => u.includes('/gtag/js?id='));
const gaId = (h) => (h.find((u) => u.includes('/gtag/js?id=')) || '').split('id=')[1] || '';

const browser = await chromium.launch({
  args: [
    /* Yahi is test ki jaan hai — asli hostname ke saath local server. */
    '--host-resolver-rules=MAP rokadoctor.in 127.0.0.1, MAP www.rokadoctor.in 127.0.0.1',
    '--no-sandbox',
  ],
});

console.log(`\n── scenario: ${SCENARIO} ──`);

const BASE_VALUE = {
  gtmId: 'GTM-WZHCV54L', gtmEnabled: true,
  gaId: 'G-JP9HDZ9SE3', gaEnabled: true,
  adsId: 'AW-610913435', adsEnabled: true,
  adsCallLabel: '', adsFormLabel: '', adsPurchaseLabel: 'a2mmCJe5zfgaEJuZp6MC',
};

if (SCENARIO === 'default') {
  /* DB me analytics row hai hi nahi — deploy ke turant baad wali haalat. */
  const real = await probe(browser, 'rokadoctor.in');
  ok('rokadoctor.in HTTP 200', real.status === 200, real.status);
  ok('row nahi -> GTM phir bhi load hua (constants se)', gtmHit(real.hits), real.hits);
  ok('row nahi -> sahi GTM id', gtmId(real.hits) === 'GTM-WZHCV54L', gtmId(real.hits));
  ok('row nahi -> GA4 bhi load hua (regression check)', gaHit(real.hits), real.hits);
  ok('row nahi -> sahi GA4 id', gaId(real.hits) === 'G-JP9HDZ9SE3', gaId(real.hits));
  ok('window.dataLayer bana', real.dataLayer.has, real.dataLayer);
  ok('window.gtag ek function hai', real.dataLayer.gtag === 'function', real.dataLayer);
  ok('gtm-datalayer script tag maujood', real.scriptIds.includes('gtm-datalayer'), real.scriptIds);
  ok('gtm-container script tag maujood', real.scriptIds.includes('gtm-container'), real.scriptIds);
  ok('ga4-init script tag maujood', real.scriptIds.includes('ga4-init'), real.scriptIds);
  ok('koi page error nahi', real.pageErrors.length === 0, real.pageErrors);
  /* Google ko abort kiya hai isliye uska apna network error aa sakta hai —
     wo ginti me nahi. Baaki koi bhi console error problem hai. */
  const realErrs = real.consoleErrors.filter((e) => !/googletagmanager|google-analytics|ERR_FAILED|net::/i.test(e));
  ok('koi console error nahi', realErrs.length === 0, realErrs);

  const www = await probe(browser, 'www.rokadoctor.in');
  ok('www.rokadoctor.in par bhi GTM chale', gtmHit(www.hits), www.hits);

  const local = await probe(browser, '127.0.0.1');
  ok('localhost par GTM NAHI chalna chahiye', !gtmHit(local.hits), local.hits);
  ok('localhost par GA4 NAHI chalna chahiye', !gaHit(local.hits), local.hits);
  ok('localhost HTTP 200 (page phir bhi theek)', local.status === 200, local.status);

  /* Tag sirf homepage par nahi, har template par chahiye. */
  for (const [name, path] of [
    ['area', '/ro-service-patna/kankarbagh'],
    ['brand', '/service-patna/brand/kent'],
    ['intent', '/ro-amc-patna'],
    ['money', '/ro-service-in-patna'],
    ['policy', '/privacy-policy'],
  ]) {
    const r = await probe(browser, 'rokadoctor.in', path);
    ok(`${name} page par bhi GTM`, gtmHit(r.hits), r.hits);
    ok(`${name} page par bhi GA4`, gaHit(r.hits), r.hits);
    ok(`${name} page par koi error nahi`, r.pageErrors.length === 0, r.pageErrors);
  }
}

if (SCENARIO === 'admin') {
  /* 1. Admin se ek ALAG GTM id save karo — poora asli raasta. */
  const put1 = await adminPut(browser, { ...BASE_VALUE, gtmId: 'GTM-ADMIN99' });
  ok('admin login ho gaya (role ADMIN/SUPER_ADMIN)',
    put1.role === 'ADMIN' || put1.role === 'SUPER_ADMIN', put1.role);
  ok('admin PUT 200', put1.status === 200, `${put1.status} ${put1.body.slice(0, 160)}`);

  const after = await probe(browser, 'rokadoctor.in');
  ok('admin se badli id page par aa gayi (revalidatePath kaam karta hai)',
    gtmId(after.hits) === 'GTM-ADMIN99', gtmId(after.hits));
  ok('id badalne par GA4 nahi gira', gaHit(after.hits), after.hits);
  const areaAfter = await probe(browser, 'rokadoctor.in', '/ro-service-patna/kankarbagh');
  ok('dusre page par bhi nayi id gayi', gtmId(areaAfter.hits) === 'GTM-ADMIN99', gtmId(areaAfter.hits));

  /* 2. Switch OFF — GTM jaana chahiye, GA4 rehna chahiye. */
  const put2 = await adminPut(browser, { ...BASE_VALUE, gtmEnabled: false });
  ok('switch OFF PUT 200', put2.status === 200, `${put2.status} ${put2.body.slice(0, 160)}`);
  const off = await probe(browser, 'rokadoctor.in');
  ok('switch OFF -> GTM load NAHI hua', !gtmHit(off.hits), off.hits);
  ok('switch OFF -> GA4 phir bhi chala', gaHit(off.hits), off.hits);
  ok('switch OFF -> gtm script tag bhi nahi', !off.scriptIds.includes('gtm-container'), off.scriptIds);
  ok('switch OFF -> page theek', off.status === 200 && off.pageErrors.length === 0, off.pageErrors);

  /* 3. Galat ID API me ruk jaani chahiye (UI bypass ho sakta hai, API nahi). */
  const bad = await adminPut(browser, { ...BASE_VALUE, gtmId: 'GTM-X' });
  ok('galat GTM id API ne reject ki (422)', bad.status === 422, `${bad.status} ${bad.body.slice(0, 160)}`);
  const inject = await adminPut(browser, { ...BASE_VALUE, gtmId: '<script>x</script>' });
  ok('script injection API ne reject ki', inject.status === 422, inject.status);
  const stillOff = await probe(browser, 'rokadoctor.in');
  ok('reject hone par purani setting nahi badli', !gtmHit(stillOff.hits), stillOff.hits);

  /* 4. Wapas chalu karo — owner ki asli id. */
  const put4 = await adminPut(browser, BASE_VALUE);
  ok('wapas ON PUT 200', put4.status === 200, put4.status);
  const back = await probe(browser, 'rokadoctor.in');
  ok('wapas ON -> owner ki asli id', gtmId(back.hits) === 'GTM-WZHCV54L', gtmId(back.hits));
  ok('wapas ON -> GA4 bhi zinda', gaHit(back.hits), back.hits);
}

await browser.close();
console.log(`\n  PASS: ${pass}    FAIL: ${fail}`);
process.exit(fail === 0 ? 0 : 1);
