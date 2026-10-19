/**
 * check-async-in-client.mjs — CLIENT component ke andar ASYNC server component
 * ═══════════════════════════════════════════════════════════════════════════
 * 18 Oct 2026. `TrustBadges` async tha aur `QuickBookForm` ('use client') use
 * karta tha → React error #329 → "Application error" poore page par.
 *
 * Ye static check hai (browser nahi chahiye, 1 second me chalta hai) —
 * import graph ghoom kar dekhta hai ki kisi bhi client component ke neeche
 * koi `export default async function` wala component to nahi aa raha.
 *
 * `scripts/verify-browser.sh` asli proof hai; ye uska tez wala pehla pehra hai.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'src');
const files = {};
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.tsx')) {
      const src = fs.readFileSync(p, 'utf8');
      files[p] = {
        src,
        client: /^\s*['"]use client['"]/.test(src.slice(0, 80)),
        async: /^export default async function/m.test(src),
      };
    }
  }
})(ROOT);

const byName = {};
for (const p of Object.keys(files)) byName[path.basename(p, '.tsx')] = p;

function rendered(p) {
  const out = new Set();
  const re = /import\s+(\w+)\s+from\s+'@\/components\/([^']+)'/g;
  let m;
  while ((m = re.exec(files[p].src))) {
    const nm = m[1];
    if (byName[nm] && new RegExp(`<${nm}[\\s/>]`).test(files[p].src)) out.add(byName[nm]);
  }
  return out;
}

const bad = [];
for (const p of Object.keys(files)) {
  if (!files[p].client) continue;
  const seen = new Set();
  const stack = [p];
  while (stack.length) {
    for (const t of rendered(stack.pop())) {
      if (seen.has(t)) continue;
      seen.add(t); stack.push(t);
      if (files[t].async) bad.push([p, t]);
    }
  }
}

const n = Object.values(files).filter((f) => f.client).length;
console.log(`\n  ${n} client component jaanche gaye.`);
if (bad.length) {
  for (const [a, b] of bad) {
    console.log(`  FAIL  ${a.replace(process.cwd() + '/', '')}`);
    console.log(`          ASYNC component render karta hai: ${b.replace(process.cwd() + '/', '')}`);
    console.log(`          → browser me React error #329 aayega. Us component se`);
    console.log(`            'async' hatao aur data prop me do.`);
  }
  console.log(`\n  PASS: 0    FAIL: ${bad.length}\n`);
  process.exit(1);
}
console.log('  PASS  koi client component async server component render nahi karta\n');
