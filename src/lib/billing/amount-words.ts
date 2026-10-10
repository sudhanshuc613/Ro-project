/**
 * Rupaye ko shabdon me — Indian numbering (lakh / crore), angrezi me.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN ZAROORI HAI: har paper invoice pe "Total Amount in Words" likhna padta
 * hai. Agar sirf "₹27,000" likha ho to koi ek zero jod sakta hai. Shabd me
 * likha "Twenty Seven Thousand Rupees Only" ko badla nahi ja sakta — yahi
 * iska poora maqsad hai, decoration nahi.
 *
 * KYUN KHUD LIKHA, npm package nahi: `number-to-words` international system
 * (million/billion) use karta hai. Indian bill pe "27 lakh" chahiye,
 * "2.7 million" nahi. Aur ek aur dependency = ek aur supply-chain risk,
 * jabki yeh poora kaam 80 line ka hai.
 *
 * Paise (decimal) bhi handle hota hai: 1250.50 → "One Thousand Two Hundred
 * Fifty Rupees and Fifty Paise Only".
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

/** 0–99 */
function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? TENS[t] : `${TENS[t]} ${ONES[o]}`;
}

/** 0–999 */
function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h === 0) return twoDigits(rest);
  if (rest === 0) return `${ONES[h]} Hundred`;
  return `${ONES[h]} Hundred ${twoDigits(rest)}`;
}

/**
 * Poora integer → shabd, Indian grouping.
 * 1,00,00,000 = crore · 1,00,000 = lakh · 1,000 = thousand
 * Max support: 99,99,99,99,999 (kharab tak). Usse upar "Number too large".
 */
export function integerToWords(value: number): string {
  if (!Number.isFinite(value)) return '';
  const n = Math.floor(Math.abs(value));
  if (n === 0) return 'Zero';
  if (n > 99999999999) return 'Number Too Large';

  const parts: string[] = [];

  const kharab = Math.floor(n / 1000000000) % 100; // 1 kharab = 100 crore
  const crore = Math.floor(n / 10000000) % 100;
  const lakh = Math.floor(n / 100000) % 100;
  const thousand = Math.floor(n / 1000) % 100;
  const hundredAndBelow = n % 1000;

  if (kharab) parts.push(`${twoDigits(kharab)} Kharab`);
  if (crore) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundredAndBelow) parts.push(threeDigits(hundredAndBelow));

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Bill pe chhapne wali poori line.
 *
 *   27000      → "Twenty Seven Thousand Rupees Only"
 *   1250.50    → "One Thousand Two Hundred Fifty Rupees and Fifty Paise Only"
 *   0          → "Zero Rupees Only"
 *
 * Paise ko round kiya jata hai (2 decimal), kyunki ₹0.005 jaisa kuch
 * invoice pe nahi aa sakta.
 */
export function amountToWords(amount: number | string): string {
  const raw = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(raw)) return '';

  const negative = raw < 0;
  const abs = Math.abs(raw);
  const rupees = Math.floor(abs + 1e-9);
  const paise = Math.round((abs - rupees) * 100);

  // 99.999 → rupees 99, paise 100 — ise 100 rupees banao
  const fixedRupees = paise === 100 ? rupees + 1 : rupees;
  const fixedPaise = paise === 100 ? 0 : paise;

  let out = `${integerToWords(fixedRupees)} Rupees`;
  if (fixedPaise > 0) out += ` and ${twoDigits(fixedPaise)} Paise`;
  out += ' Only';

  return negative ? `Minus ${out}` : out;
}
