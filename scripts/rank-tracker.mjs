#!/usr/bin/env node
/**
 * Aqua Perl — Rank Tracker
 * ────────────────────────────────────────────────────────────────────────────
 * Roz chala ke dekho ki har keyword pe tum kis number pe ho, aur competitor
 * kahan hai. History save hoti hai, isliye girawat turant dikh jaati hai.
 *
 * ⚠️ Ye script website ka HISSA NAHI hai. `scripts/` folder mein alag hai,
 *    build mein include nahi hoti, Vercel pe kuch nahi badalta. Ise chalane
 *    se site par koi asar nahi padta.
 *
 * CHALANE KA TAREEKA (laptop pe, project folder mein):
 *
 *     node scripts/rank-tracker.mjs
 *
 * Report yahan banegi:  seo-reports/rank-YYYY-MM-DD.md
 * History yahan:        seo-reports/history.json
 *
 * KAISE KAAM KARTA HAI
 * Google direct scraping block karta hai (aur karna unke terms ke against
 * bhi hai). Isliye ye DuckDuckGo HTML endpoint use karta hai — wo Bing ke
 * index par chalta hai. Number bilkul Google jaisa nahi hoga, par:
 *   • hafte-dar-hafte badlaav bilkul sahi dikhta hai
 *   • competitor ke muqable position sahi dikhti hai
 *   • ₹0 kharcha (Semrush/Ahrefs ₹8,000+/mahina lete hain)
 *
 * Google ke asli number ke liye Search Console hi sach hai — ye tool uske
 * beech ke dinon ke liye hai.
 */

import fs from 'node:fs';
import path from 'node:path';

const SITE = 'rokadoctor.in';

/** Competitors — inke saamne apni position dikhegi. */
const RIVALS = [
  'rocareindia.com',
  'rosaleandservices.com',
  'urbancompany.com',
  'roserviceinpatna.com',
  'roservicecenterpatna.com',
  'roservicecentrepatna.in',
  'roservicebihar.com',
  'patnaaquacare.com',
  'justdial.com',
  'sulekha.com',
];

/**
 * Keywords — priority ke hisaab se.
 * P1 = paisa laane wale, roz check. P2/P3 = support keywords.
 */
const KEYWORDS = [
  // ── P1 — core money keywords ──
  { q: 'ro service in patna', p: 1 },
  { q: 'ro repair patna', p: 1 },
  { q: 'water purifier repair patna', p: 1 },
  { q: 'ro service near me patna', p: 1 },
  { q: 'ro installation patna', p: 1 },
  { q: 'ro amc patna', p: 1 },

  // ── P2 — brand + service ──
  { q: 'kent ro service patna', p: 2 },
  { q: 'aquaguard service patna', p: 2 },
  { q: 'livpure ro service patna', p: 2 },
  { q: 'pureit service patna', p: 2 },
  { q: 'ro filter change patna', p: 2 },
  { q: 'ro membrane replacement patna', p: 2 },

  // ── P2 — top areas (jahan sabse zyada kaam hai) ──
  { q: 'ro service kankarbagh', p: 2 },
  { q: 'ro service boring road patna', p: 2 },
  { q: 'ro service buddha colony patna', p: 2 },
  { q: 'ro service danapur', p: 2 },
  { q: 'ro service rajendra nagar patna', p: 2 },
  { q: 'ro service patliputra colony', p: 2 },

  // ── P3 — long tail / research intent ──
  { q: 'patna water tds level', p: 3 },
  { q: 'ro filter kitne din chalta hai', p: 3 },
  { q: 'commercial ro plant patna', p: 3 },
  { q: 'ro spare parts patna', p: 3 },
];

/* ── helpers ─────────────────────────────────────────────────────────────── */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** DuckDuckGo HTML — koi API key nahi chahiye. */
async function search(query) {
  const url = 'https://duckduckgo.com/html/?q=' + encodeURIComponent(query);
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-IN,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const out = [];
  const re = /class="result__a"[^>]*href="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    let href = m[1];
    const enc = /uddg=([^&]+)/.exec(href);
    if (enc) href = decodeURIComponent(enc[1]);
    const d = domainOf(href);
    if (d && !out.some((x) => x.domain === d)) out.push({ domain: d, url: href });
    if (out.length >= 30) break;
  }
  return out;
}

function rankOf(results, domain) {
  const i = results.findIndex((r) => r.domain === domain || r.domain.endsWith('.' + domain));
  return i === -1 ? null : i + 1;
}

/* ── main ────────────────────────────────────────────────────────────────── */

async function main() {
  const outDir = path.join(process.cwd(), 'seo-reports');
  fs.mkdirSync(outDir, { recursive: true });

  const today = new Date().toISOString().slice(0, 10);
  const histFile = path.join(outDir, 'history.json');
  const history = fs.existsSync(histFile)
    ? JSON.parse(fs.readFileSync(histFile, 'utf8'))
    : {};

  const prevDates = Object.keys(history).sort();
  const prevDate = prevDates.filter((d) => d !== today).pop();
  const prev = prevDate ? history[prevDate] : {};

  console.log(`\n  Aqua Perl — Rank Tracker`);
  console.log(`  ${today}   ${KEYWORDS.length} keywords`);
  if (prevDate) console.log(`  Comparing against ${prevDate}`);
  console.log('  ' + '─'.repeat(74) + '\n');

  const todayData = {};
  const rows = [];

  for (const { q, p } of KEYWORDS) {
    let results = [];
    let err = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        results = await search(q);
        err = null;
        break;
      } catch (e) {
        err = e.message;
        await sleep(3000);
      }
    }

    const mine = rankOf(results, SITE);
    const rivals = {};
    for (const r of RIVALS) {
      const pos = rankOf(results, r);
      if (pos) rivals[r] = pos;
    }

    todayData[q] = { rank: mine, rivals, priority: p };

    const before = prev[q]?.rank ?? null;
    let delta = '  —';
    if (mine && before) {
      const d = before - mine; // positive = improved
      delta = d > 0 ? `  ▲${d}` : d < 0 ? `  ▼${-d}` : '  =';
    } else if (mine && !before) {
      delta = ' NEW';
    } else if (!mine && before) {
      delta = 'LOST';
    }

    const bestRival = Object.entries(rivals).sort((a, b) => a[1] - b[1])[0];
    const rivalTxt = bestRival ? `${bestRival[0]} #${bestRival[1]}` : '—';

    const rankTxt = err ? 'ERR' : mine ? `#${mine}` : '—';
    console.log(
      `  P${p}  ${rankTxt.padStart(4)} ${delta.padStart(5)}  ${q.padEnd(34)} best rival: ${rivalTxt}`,
    );

    rows.push({ q, p, mine, delta, rivals, bestRival, err });
    await sleep(2500); // polite — rate limit se bachne ke liye
  }

  history[today] = todayData;
  fs.writeFileSync(histFile, JSON.stringify(history, null, 2));

  /* ── summary ── */
  const ranked = rows.filter((r) => r.mine);
  const top3 = ranked.filter((r) => r.mine <= 3).length;
  const top10 = ranked.filter((r) => r.mine <= 10).length;
  const avg = ranked.length
    ? (ranked.reduce((s, r) => s + r.mine, 0) / ranked.length).toFixed(1)
    : '—';
  const notFound = rows.filter((r) => !r.mine && !r.err);

  console.log('\n  ' + '─'.repeat(74));
  console.log(`  Ranked: ${ranked.length}/${rows.length}   Top-3: ${top3}   Top-10: ${top10}   Avg: ${avg}`);

  /* ── markdown report ── */
  const md = [];
  md.push(`# Rank Report — ${today}`);
  md.push('');
  md.push(`**Site:** ${SITE}  ·  **Keywords:** ${rows.length}`);
  if (prevDate) md.push(`**Compared to:** ${prevDate}`);
  md.push('');
  md.push(`| Metric | Value |`);
  md.push(`|---|---|`);
  md.push(`| Ranked (top 30) | ${ranked.length} / ${rows.length} |`);
  md.push(`| Top 3 | ${top3} |`);
  md.push(`| Top 10 | ${top10} |`);
  md.push(`| Average position | ${avg} |`);
  md.push('');

  for (const pr of [1, 2, 3]) {
    const group = rows.filter((r) => r.p === pr);
    if (!group.length) continue;
    md.push(`## P${pr} keywords`);
    md.push('');
    md.push('| Keyword | Rank | Change | Best competitor |');
    md.push('|---|---|---|---|');
    for (const r of group) {
      const rank = r.err ? 'error' : r.mine ? `**#${r.mine}**` : 'not in top 30';
      const rival = r.bestRival ? `${r.bestRival[0]} #${r.bestRival[1]}` : '—';
      md.push(`| ${r.q} | ${rank} | ${r.delta.trim()} | ${rival} |`);
    }
    md.push('');
  }

  if (notFound.length) {
    md.push('## Kaam karne wale keywords (top 30 mein nahi)');
    md.push('');
    for (const r of notFound) md.push(`- \`${r.q}\``);
    md.push('');
  }

  md.push('---');
  md.push('');
  md.push('### Ise kaise padhein');
  md.push('');
  md.push('- **▲** upar gaya, **▼** neeche gaya, **=** wahi hai');
  md.push('- Numbers DuckDuckGo (Bing index) se hain — Google se thode alag honge.');
  md.push('  **Badlaav** dekho, absolute number nahi.');
  md.push('- Google ka asli number Search Console → Performance → Queries mein hai.');
  md.push('- Hafte mein 1-2 baar chalao. Roz chalane se rate-limit lag sakti hai.');

  const file = path.join(outDir, `rank-${today}.md`);
  fs.writeFileSync(file, md.join('\n'));
  console.log(`  Report: seo-reports/rank-${today}.md\n`);
}

main().catch((e) => {
  console.error('\n  Rank tracker failed:', e.message);
  console.error('  Internet check karo, ya thodi der baad dobara chalao.\n');
  process.exit(1);
});
