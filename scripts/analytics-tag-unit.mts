/**
 * ANALYTICS TAG — logic ke unit test (bina server, bina browser).
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ye `resolveAnalytics` / `validateAnalytics` / `extractIds` ko SEEDHA
 * shipped file se import karta hai.
 *
 * 🔴 NIYAM: yahan logic ki NAKAL nahi likhi jaati. 22 Oct ko maine ek test
 * me shipped code ka Python version likh diya tha; test PASS hota raha aur
 * asli code toota raha. Isliye import — hamesha.
 *
 * Chalane ka tarika:  npx tsx scripts/analytics-tag-unit.mts
 */
import {
  resolveAnalytics,
  validateAnalytics,
  extractIds,
  duplicateRisk,
  ANALYTICS_FALLBACK,
  GTM_RE,
  GA_RE,
  AW_RE,
} from '../src/lib/seo/analytics-overrides';
import { ANALYTICS } from '../src/lib/constants';

let pass = 0;
let fail = 0;

function ok(name: string, cond: boolean, got?: unknown) {
  if (cond) {
    pass++;
  } else {
    fail++;
    console.log(`  FAIL  ${name}${got === undefined ? '' : `   got: ${JSON.stringify(got)}`}`);
  }
}

/* ── 1. DB khaali = aaj jaisa hi vyavhaar (koi regression nahi) ─────────── */
{
  const r = resolveAnalytics(null);
  ok('null override -> gaId constants se', r.gaId === ANALYTICS.gaId, r.gaId);
  ok('null override -> adsId constants se', r.adsId === ANALYTICS.adsId, r.adsId);
  ok('null override -> purchase label constants se',
    r.adsPurchaseLabel === ANALYTICS.adsPurchaseLabel, r.adsPurchaseLabel);
  /* 🔴 6 Nov: ye expectation JAAN BOOJH KAR badli gayi, code ko test se
     match karane ke liye nahi — test ne khud problem batayi thi.
     Pehle gtmId ka default khaali tha, isliye naye deploy ke baad har
     static page bina GTM ke banta tha (browser test me measured). Ab
     default constants.ts me hai, aur test uski ASLI value maangta hai. */
  ok('null override -> GTM chalu (deploy par turant)', r.gtmActive === true, r.gtmActive);
  ok('null override -> gtmId owner ka asli container',
    r.gtmId === ANALYTICS.gtmId && r.gtmId === 'GTM-WZHCV54L', r.gtmId);
  ok('null override -> GA4 chalu', r.gaActive === true, r.gaActive);
  ok('null override -> Ads chalu', r.adsActive === true, r.adsActive);
  ok('null override == ANALYTICS_FALLBACK',
    JSON.stringify(r) === JSON.stringify(ANALYTICS_FALLBACK));
}

/* ── 2. Owner ka asli GTM container ─────────────────────────────────────── */
{
  const r = resolveAnalytics({ gtmId: 'GTM-WZHCV54L', gtmEnabled: true });
  ok('asli GTM id accept', r.gtmId === 'GTM-WZHCV54L', r.gtmId);
  ok('asli GTM active', r.gtmActive === true);
  ok('GTM aane se GA4 nahi girta', r.gaId === ANALYTICS.gaId, r.gaId);
}

/* ── 3. Chhote akshar bhi chalein (owner copy-paste karega) ─────────────── */
{
  const r = resolveAnalytics({ gtmId: ' gtm-wzhcv54l ', gtmEnabled: true });
  ok('lower-case + space -> normalise', r.gtmId === 'GTM-WZHCV54L', r.gtmId);
  ok('normalise ke baad active', r.gtmActive === true);
}

/* ── 4. Galat ID chup-chaap pass na ho ──────────────────────────────────── */
{
  const r = resolveAnalytics({ gtmId: 'GTM-WZ', gtmEnabled: true });
  ok('chhoti GTM id reject -> code wali ID', r.gtmId === ANALYTICS.gtmId, r.gtmId);
  ok('reject hone par bhi tracking zinda', r.gtmActive === true);

  const r2 = resolveAnalytics({ gaId: 'G-BAD', gaEnabled: true });
  ok('galat GA id -> code wali ID', r2.gaId === ANALYTICS.gaId, r2.gaId);

  const r3 = resolveAnalytics({ adsId: 'AW-12', adsEnabled: true });
  ok('galat Ads id -> code wali ID', r3.adsId === ANALYTICS.adsId, r3.adsId);

  const r4 = resolveAnalytics({ gtmId: '<script>alert(1)</script>', gtmEnabled: true });
  ok('script injection reject -> code wali ID', r4.gtmId === ANALYTICS.gtmId, r4.gtmId);
  ok('injection kabhi page par nahi jaata', !/[<>'"]/.test(r4.gtmId), r4.gtmId);
}

/* ── 5. Teen haalat alag — 6 Nov 2026 ko isi test ne asli bug pakda ─────
   field GAYAB  = code wali ID chale   (adhoora DB row tracking na toda)
   field KHAALI = owner ne jaan boojh kar hataya
   field GALAT  = code wali ID chale                                     */
{
  const absent = resolveAnalytics({ gtmId: 'GTM-TESTONLY', gtmEnabled: true });
  ok('gaId GAYAB -> code wali GA4 ID', absent.gaId === ANALYTICS.gaId, absent.gaId);
  ok('gaId GAYAB -> GA4 chalu rehti hai', absent.gaActive === true);
  ok('adsId GAYAB -> code wali Ads ID', absent.adsId === ANALYTICS.adsId, absent.adsId);
  ok('label GAYAB -> code wala purchase label',
    absent.adsPurchaseLabel === ANALYTICS.adsPurchaseLabel, absent.adsPurchaseLabel);

  const empty = resolveAnalytics({ gaId: '', gaEnabled: true });
  ok('gaId KHAALI -> khaali hi rahe (fallback NA lage)', empty.gaId === '', empty.gaId);
  ok('gaId KHAALI -> GA band', empty.gaActive === false);

  const emptyLabel = resolveAnalytics({ adsPurchaseLabel: '' });
  ok('label KHAALI -> khaali hi rahe', emptyLabel.adsPurchaseLabel === '', emptyLabel.adsPurchaseLabel);

  /* Asli duniya ka case: owner admin me sirf GTM bharta hai aur save
     dabata hai. API poora object bhejta hai, par agar kabhi adhoora row
     aa gaya to bhi GA4 nahi girni chahiye. */
  const onlyGtmRow = resolveAnalytics({ gtmId: 'GTM-WZHCV54L' } as never);
  ok('sirf gtmId wala row -> GA4 zinda', onlyGtmRow.gaActive === true);
  ok('sirf gtmId wala row -> Ads zinda', onlyGtmRow.adsActive === true);
  ok('sirf gtmId wala row -> GTM bhi chalu', onlyGtmRow.gtmActive === true);
}

/* ── 6. Switch band = tag band, chahe ID sahi ho ────────────────────────── */
{
  const r = resolveAnalytics({ gtmId: 'GTM-WZHCV54L', gtmEnabled: false });
  ok('switch OFF -> GTM band', r.gtmActive === false);
  ok('switch OFF par ID yaad rehti hai', r.gtmId === 'GTM-WZHCV54L', r.gtmId);

  const r2 = resolveAnalytics({ gaEnabled: false });
  ok('GA switch OFF -> GA band', r2.gaActive === false);

  const r3 = resolveAnalytics({ adsEnabled: false });
  ok('Ads switch OFF -> Ads band', r3.adsActive === false);
}

/* ── 7. Naye Google Ads account ki 11-ank ID ────────────────────────────── */
{
  const r = resolveAnalytics({ adsId: 'AW-18555090295', adsEnabled: true });
  ok('11-ank Ads ID accept', r.adsId === 'AW-18555090295', r.adsId);
  ok('11-ank Ads ID active', r.adsActive === true);
  ok('purani 9-ank ID bhi valid', AW_RE.test('AW-610913435'));
  ok('14-ank ID reject', !AW_RE.test('AW-18555090295999'));
}

/* ── 8. Conversion label ─────────────────────────────────────────────────── */
{
  const r = resolveAnalytics({ adsId: 'AW-610913435', adsCallLabel: 'a2mmCJe5zfgaEJuZp6MC' });
  ok('sahi label accept', r.adsCallLabel === 'a2mmCJe5zfgaEJuZp6MC', r.adsCallLabel);
  const r2 = resolveAnalytics({ adsCallLabel: 'ab' });
  ok('chhota label reject -> code wala', r2.adsCallLabel === ANALYTICS.adsCallLabel, r2.adsCallLabel);
}

/* ── 9. validateAnalytics — galti par message aaye ──────────────────────── */
{
  ok('sahi set par koi error nahi',
    validateAnalytics({
      gtmId: 'GTM-WZHCV54L', gtmEnabled: true,
      gaId: 'G-JP9HDZ9SE3', gaEnabled: true,
      adsId: 'AW-610913435', adsEnabled: true,
      adsCallLabel: '', adsFormLabel: '', adsPurchaseLabel: 'a2mmCJe5zfgaEJuZp6MC',
    }).length === 0);

  ok('switch ON + khaali ID -> error',
    validateAnalytics({ gtmId: '', gtmEnabled: true }).length > 0);

  ok('switch OFF + khaali ID -> koi error nahi',
    validateAnalytics({ gtmId: '', gtmEnabled: false }).length === 0);

  ok('label bina Ads ID -> error',
    validateAnalytics({ gtmEnabled: false, adsId: '', adsCallLabel: 'a2mmCJe5zfgaEJuZp6MC' })
      .some((m) => m.includes('Ads ID khaali')));

  ok('galat GTM format -> error',
    validateAnalytics({ gtmId: 'GTM-1', gtmEnabled: true })
      .some((m) => m.includes('GTM-WZHCV54L')));
}

/* ── 10. extractIds — Google ke asli snippet se ID nikle ────────────────── */
{
  const ownerSnippet = `
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-WZHCV54L"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
</script>`;
  const a = extractIds(ownerSnippet);
  ok('owner ke snippet se GTM mila', a.gtmId === 'GTM-WZHCV54L', a.gtmId);
  ok('owner ke snippet me koi GA4 nahi', a.gaId === undefined, a.gaId);

  const ga = extractIds('<script async src="https://www.googletagmanager.com/gtag/js?id=G-JP9HDZ9SE3"></script>');
  ok('GA4 snippet se ID mili', ga.gaId === 'G-JP9HDZ9SE3', ga.gaId);

  const ads = extractIds(`gtag('config', 'AW-610913435');`);
  ok('Ads base tag se ID mili', ads.adsId === 'AW-610913435', ads.adsId);

  const ev = extractIds(`gtag('event','conversion',{'send_to':'AW-610913435/a2mmCJe5zfgaEJuZp6MC','value':1.0});`);
  ok('event snippet se Ads ID mili', ev.adsId === 'AW-610913435', ev.adsId);
  ok('event snippet se LABEL mila (case bachaa)',
    ev.adsPurchaseLabel === 'a2mmCJe5zfgaEJuZp6MC', ev.adsPurchaseLabel);

  ok('bakwaas text se kuch nahi milta',
    Object.keys(extractIds('hello mera naam sudhanshu hai')).length === 0);
}

/* ── 11. duplicateRisk — do jagah se ek hi cheez ────────────────────────── */
{
  const both = resolveAnalytics({ gtmId: 'GTM-WZHCV54L', gtmEnabled: true });
  ok('GTM + GA4 dono on -> warning', duplicateRisk(both).length >= 1);
  const onlyGa = resolveAnalytics({ gtmId: '', gtmEnabled: false });
  ok('sirf GA4 -> koi warning nahi', duplicateRisk(onlyGa).length === 0);
  const nothing = resolveAnalytics({
    gtmId: '', gtmEnabled: false, gaId: '', gaEnabled: false, adsId: '', adsEnabled: false,
  });
  ok('sab band -> koi warning nahi', duplicateRisk(nothing).length === 0);
}

/* ── 12. Regex seemaein ─────────────────────────────────────────────────── */
{
  ok('GTM_RE sahi', GTM_RE.test('GTM-WZHCV54L') && !GTM_RE.test('GTM-WZ') && !GTM_RE.test('gtm-wzhcv54l'));
  ok('GA_RE sahi', GA_RE.test('G-JP9HDZ9SE3') && !GA_RE.test('G-JP9') && !GA_RE.test('UA-12345-1'));
  ok('AW_RE sahi', AW_RE.test('AW-610913435') && !AW_RE.test('AW-ABCDEFGHI'));
}


/* ── 13. Owner ka asli container code me pahuncha hai ya nahi ──────────── */
{
  ok('constants.ts me GTM-WZHCV54L hai', ANALYTICS.gtmId === 'GTM-WZHCV54L', ANALYTICS.gtmId);
  ok('constants ki GTM id format sahi', GTM_RE.test(ANALYTICS.gtmId));
  ok('ANALYTICS_FALLBACK constants se hi banta hai',
    ANALYTICS_FALLBACK.gtmId === ANALYTICS.gtmId
    && ANALYTICS_FALLBACK.gaId === ANALYTICS.gaId
    && ANALYTICS_FALLBACK.adsId === ANALYTICS.adsId);
}

console.log(`\n  PASS: ${pass}    FAIL: ${fail}`);
process.exit(fail === 0 ? 0 : 1);
