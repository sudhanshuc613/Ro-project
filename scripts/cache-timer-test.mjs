/**
 * CACHE TIMER GATE — "timer badhaya, par admin se badlav turant dikhta hai?"
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 KYUN BANA (8 Nov 2026)
 * ──────────────────────────
 * Vercel Fluid Active CPU 3h 51m / 4h = 96% par pahunch gaya. Live naap kar
 * wajah mili: `src/lib/settings.ts` ke 4 data-cache ka timer 300 second tha.
 * Next.js me page utna hi taaza reh sakta hai jitna uska sabse chhota
 * data-cache, isliye har page ka apna `revalidate = 86400` bekaar tha aur
 * poori site har 5 minute me dobara ban rahi thi.
 *
 * Measured (live, /ro-amc-patna, revalidate=86400):
 *     age 292s -> HIT        age 322s -> STALE
 *
 * Timer 300 -> 3600 kiya gaya. Ab ye gate wo EK sawaal jaanchta hai jiska
 * jawab "haan" hona hi chahiye, warna badlav galat hai:
 *
 *     "Owner admin me rating badle — kya wo TURANT site par dikhti hai,
 *      ya ab 1 ghanta intezaar karna padega?"
 *
 * Jawab turant hona chahiye, kyunki API `revalidateTag('settings')` chalata
 * hai jo cache ko usi second todta hai. Timer sirf tab lagta hai jab koi
 * badlav hua hi na ho. Par ye MAANNA nahi hai — isliye ye test asli admin
 * API se login karke, asli save karke, asli page padh kar dekhta hai.
 *
 * 🔴 Agar kabhi ye test fail ho, to timer badhana GALAT tha — timer wapas
 * ghataao, test ko mat badlo.
 *
 * Usage: node scripts/cache-timer-test.mjs [port]
 */
import { chromium } from 'playwright';

const PORT = process.argv[2] || '3100';
const BASE = `http://127.0.0.1:${PORT}`;

let pass = 0;
let fail = 0;
const ok = (name, cond, got) => {
  if (cond) pass++;
  else {
    fail++;
    console.log(`  FAIL  ${name}${got === undefined ? '' : `   got: ${JSON.stringify(got)}`}`);
  }
};

/** Admin ban kar /api/admin/settings par PUT karo (asli NextAuth flow). */
async function adminPut(browser, key, value) {
  const ctx = await browser.newContext({ baseURL: BASE });
  const req = ctx.request;
  const { csrfToken } = await (await req.get('/api/auth/csrf')).json();
  await req.post('/api/auth/callback/password', {
    form: {
      csrfToken,
      phone: '8969821440',
      password: 'ChangeMe@123',
      callbackUrl: `${BASE}/admin`,
      json: 'true',
    },
  });
  const sess = await (await req.get('/api/auth/session')).json();
  const put = await req.put('/api/admin/settings', { data: { key, value } });
  const body = await put.text();
  await ctx.close();
  return { role: sess?.user?.role ?? null, status: put.status(), body };
}

/** Ek page ka HTML padho (browser se nahi, seedha — tez aur kaafi). */
async function getHtml(browser, path) {
  const ctx = await browser.newContext({ baseURL: BASE });
  const res = await ctx.request.get(path);
  const body = await res.text();
  const status = res.status();
  await ctx.close();
  return { status, body };
}

const browser = await chromium.launch({ args: ['--no-sandbox'] });

/* ── 1. Source level — timer sach me badla? ───────────────────────────── */
{
  const fs = await import('node:fs');
  const src = fs.readFileSync('src/lib/settings.ts', 'utf8');
  const n300 = (src.match(/revalidate: 300\b/g) || []).length;
  const n3600 = (src.match(/revalidate: 3600\b/g) || []).length;
  ok('settings.ts me ek bhi `revalidate: 300` nahi bacha', n300 === 0, n300);
  ok('settings.ts me 11 cache sab 3600 par', n3600 === 11, n3600);

  const media = fs.readFileSync('src/app/api/media/[id]/route.ts', 'utf8');
  ok('media route me s-maxage hai', media.includes('s-maxage=31536000'), false);
  ok('media route me stale-while-revalidate hai',
    media.includes('stale-while-revalidate=86400'), false);
  ok('media route ka max-age waisa ka waisa', media.includes('max-age=31536000'), false);
}

/* ── 2. 🔴 ASLI SAWAAL: admin save -> page par turant? ────────────────── */
{
  const before = await getHtml(browser, '/');
  ok('homepage 200', before.status === 200, before.status);
  const m = before.body.match(/"reviewCount":"(\d+)"/);
  ok('homepage par reviewCount mila', m !== null, m && m[1]);
  const startCount = m ? Number(m[1]) : null;

  if (startCount !== null) {
    const bumped = startCount + 1;

    const put = await adminPut(browser, 'gbp', { ratingValue: 5, reviewCount: bumped });
    ok('admin login hua', put.role === 'ADMIN' || put.role === 'SUPER_ADMIN', put.role);
    ok('gbp PUT 200', put.status === 200, `${put.status} ${put.body.slice(0, 160)}`);

    /* 🔴 Yahan koi `sleep 3600` nahi hai. Agar `revalidateTag` kaam karta hai
       to badlav AGLI request par hi dikhna chahiye. Thoda sa rukte hain sirf
       isliye ki revalidation complete ho jaye. */
    await new Promise((r) => setTimeout(r, 2500));

    const after = await getHtml(browser, '/');
    const m2 = after.body.match(/"reviewCount":"(\d+)"/);
    const got = m2 ? Number(m2[1]) : null;
    ok(`admin se badla number TURANT dikha (${startCount} -> ${bumped})`,
      got === bumped, got);

    /* Dusre template par bhi — cache tag poori site par lagna chahiye. */
    for (const p of ['/service-patna', '/ro-service-patna/kankarbagh',
                     '/service-patna/brand/kent', '/ro-amc-patna']) {
      const r = await getHtml(browser, p);
      const mm = r.body.match(/"reviewCount":"(\d+)"/);
      ok(`${p} par bhi naya number`, mm !== null && Number(mm[1]) === bumped,
        mm && mm[1]);
    }

    /* Wapas purana — test ke baad DB saaf chhodo. */
    const back = await adminPut(browser, 'gbp', { ratingValue: 5, reviewCount: startCount });
    ok('wapas purana number set hua', back.status === 200, back.status);
    await new Promise((r) => setTimeout(r, 2500));
    const final = await getHtml(browser, '/');
    const m3 = final.body.match(/"reviewCount":"(\d+)"/);
    ok('homepage wapas purane number par', m3 !== null && Number(m3[1]) === startCount,
      m3 && m3[1]);
  }
}

/* ── 3. Media route ka header SACH ME jaa raha hai? ───────────────────
   🔴 Pehle ye check "local DB me asset nahi mila" keh kar SKIP ho jaata
   tha. Skip = bug class N (jo test chala hi nahi use PASS mat gino).
   Isliye ab test KHUD ek chhota asset banata hai, header jaanchta hai,
   aur phir use hata deta hai. */
{
  const { PrismaClient } = await import('@prisma/client');
  const db = new PrismaClient();
  // 1x1 transparent PNG
  const PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk' +
    'YPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  const checksum = 'cachetimertest' + Date.now();
  let asset = null;
  try {
    asset = await db.mediaAsset.create({
      data: {
        filename: 'cache-timer-test.png',
        mimeType: 'image/png',
        bytes: PNG.length,
        width: 1,
        height: 1,
        data: PNG,
        checksum,
        folder: 'products',
      },
      select: { id: true },
    });
  } catch (e) {
    ok('test media asset ban gaya', false, String(e).slice(0, 140));
  }

  if (asset) {
    ok('test media asset ban gaya', true);
    const ctx = await browser.newContext({ baseURL: BASE });
    const r = await ctx.request.get(`/api/media/${asset.id}`);
    const cc = r.headers()['cache-control'] || '';
    ok('media response 200', r.status() === 200, r.status());
    ok('live header me s-maxage=31536000', cc.includes('s-maxage=31536000'), cc);
    ok('live header me stale-while-revalidate=86400',
      cc.includes('stale-while-revalidate=86400'), cc);
    ok('live header me max-age waisa ka waisa', cc.includes('max-age=31536000'), cc);
    ok('live header me immutable', cc.includes('immutable'), cc);
    ok('content-type image/png', (r.headers()['content-type'] || '').includes('image/png'),
      r.headers()['content-type']);
    await ctx.close();
    await db.mediaAsset.delete({ where: { id: asset.id } }).catch(() => {});
  }
  await db.$disconnect();
}

await browser.close();
console.log(`\n  PASS: ${pass}    FAIL: ${fail}`);
process.exit(fail === 0 ? 0 : 1);
