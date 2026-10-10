/**
 * 🔴 BUG CLASS DETECTOR — "client file ka non-component export server pe nahi chalta"
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 10 Oct 2026 ko yeh bug mila: `BillForm.tsx` ('use client') se `emptyItem()`
 * export ho raha tha, aur ek SERVER page use call kar raha tha.
 *
 *   npm run build   → PASS   ✅
 *   tsc --noEmit    → PASS   ✅
 *   page khola      → 500    ❌  TypeError: (0 , o.S) is not a function
 *
 * Kyun: Next.js 'use client' file ke har export ko ek "client reference"
 * object se badal deta hai. Component ke liye yeh theek hai (React use
 * karna jaanta hai), par plain function server pe function rehta hi nahi.
 * TypeScript ko yeh dikhta nahi, kyunki type to sahi hai.
 *
 * Isliye yeh script har server file me dekhti hai ki kahin kisi 'use client'
 * file se VALUE import to nahi ho raha (type import theek hai, woh compile
 * pe gayab ho jaata hai; default-export component bhi theek hai).
 *
 * Chalane ka tarika:  node scripts/check-client-exports.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

const ROOT = resolve(process.cwd(), 'src');
const files = [];

(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(name)) files.push(p);
  }
})(ROOT);

const isClient = new Map();
for (const f of files) {
  const head = readFileSync(f, 'utf8').slice(0, 400);
  isClient.set(f, /^\s*['"]use client['"]/m.test(head));
}

/** '@/x/y' ya './y' ko asli file path me badlo. */
function resolveImport(fromFile, spec) {
  let base;
  if (spec.startsWith('@/')) base = join(ROOT, spec.slice(2));
  else if (spec.startsWith('.')) base = resolve(dirname(fromFile), spec);
  else return null;
  for (const ext of ['.tsx', '.ts', '/index.tsx', '/index.ts']) {
    if (existsSync(base + ext)) return base + ext;
  }
  return existsSync(base) && statSync(base).isFile() ? base : null;
}

let problems = 0;
let checked = 0;

for (const f of files) {
  if (isClient.get(f)) continue; // server file hi dekhni hai
  const src = readFileSync(f, 'utf8');
  const importRe = /import\s+([^;]*?)\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = importRe.exec(src))) {
    const clause = m[1];
    const spec = m[2];
    if (clause.trim().startsWith('type ')) continue; // `import type {...}`
    const target = resolveImport(f, spec);
    if (!target || !isClient.get(target)) continue;
    checked++;

    // named imports nikalo: import Default, { a, type B, c as d } from '...'
    const braces = clause.match(/\{([^}]*)\}/);
    if (!braces) continue; // sirf default import — component, theek hai
    const named = braces[1]
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      .filter((x) => !x.startsWith('type ')); // `type Foo` erase ho jaata hai

    for (const n of named) {
      const local = n.split(/\s+as\s+/)[0].trim();
      // Bada akshar = React component maana jaata hai (woh client reference
      // ke roop me sahi chalta hai). Chhota akshar = plain function/const → bug.
      if (/^[a-z_]/.test(local)) {
        console.log(
          `  FAIL  ${f.replace(ROOT + '/', 'src/')}\n        '${local}' ko '${spec}' se le raha hai, par woh file 'use client' hai.\n        → is value ko kisi non-client file me le jaayein.`,
        );
        problems++;
      }
    }
  }
}

console.log(`\n  ${checked} server→client import jaanche gaye.`);
if (problems === 0) {
  console.log('  PASS  koi client file se non-component value import nahi ho raha\n');
  process.exit(0);
}
console.log(`  FAIL  ${problems} jagah dikkat hai\n`);
process.exit(1);
