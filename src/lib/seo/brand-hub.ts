/**
 * BRAND HUB DATA — /service-patna/brand ke liye
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ye file 8 Oct 2026 ko isliye bani kyunki Google Ads ka ek sitelink
 * ("We Repair Every Brand") ab seedha /service-patna/brand par aa raha hai.
 * Matlab ye page ab ek PAID LANDING PAGE hai, sirf ek crawl hub nahi.
 *
 * Paid traffic pe do cheezein alag chahiye:
 *   1. Pehli nazar me pehchaan — customer apne brand ka LOGO dhundhta hai,
 *      naam nahi padhta. Isliye har card me logo chahiye.
 *   2. Daam — "kitna lagega" ka jawab scroll kiye bina dikhna chahiye.
 *
 * ⚖️ TRADEMARK — ye hissa mat hatana
 * ───────────────────────────────────
 * Logo "nominative fair use" ke tehat dikh rahe hain (wahi aadhaar jo
 * src/lib/seo/brand-logos.ts me likha hai). Teen shart:
 *   1. Logo utna hi bada jitna pehchaan ke liye chahiye — hero me nahi
 *   2. Kahin ye na lage ki brand ne authorise kiya hai
 *   3. Disclaimer saaf dikhe
 * Page BRAND_DISCLAIMER dikhata hai + ek alag "honesty" block bhi.
 *
 * 🔴 HOMEPAGE SE ALAG KYUN
 * ─────────────────────────
 * Homepage (BrandLogoGrid) me sirf logo tiles hain — pehchaan ke liye.
 * Yahan wahi logo UTNE HI SIZE me hain (h-28 / md:h-32) par card ke andar
 * model, fault count aur asli price range ke saath. Same logo, alag layout —
 * taaki do page duplicate na lagein (Google duplicate layout+content ko
 * ek hi page maan sakta hai).
 */

import { SERVICED_BRANDS } from './patna-service-data';

/**
 * Brand slug → logo file.
 * Sirf wahi brands jinke logo `public/brands/` me asli me maujood hain.
 * Jiska logo nahi, uska monogram tile banta hai — khaali box kabhi nahi.
 */
export const BRAND_SLUG_LOGO: Record<string, string> = {
  kent: '/brands/kent.webp',
  aquaguard: '/brands/aquaguard.png',
  aquasure: '/brands/eureka-forbes.png',
  pureit: '/brands/pureit.png',
  livpure: '/brands/livpure.png',
  aquafresh: '/brands/aquafresh.png',
  nasaka: '/brands/nasaka.png',
};

/**
 * Jin brands ki machine hum service karte hain par jinka apna page nahi hai.
 * Logo hai, isliye strip me dikhte hain — page nahi, to link bhi nahi.
 */
export const EXTRA_LOGO_BRANDS: { name: string; logo: string; alt: string }[] = [
  {
    name: 'Usha Shriram',
    logo: '/brands/usha-shriram.png',
    alt: 'Usha Shriram water purifier service in Patna',
  },
  {
    name: 'Blue Mount',
    logo: '/brands/blue-mount.png',
    alt: 'Blue Mount RO water purifier service in Patna',
  },
  {
    name: 'Aqua Natural',
    logo: '/brands/aqua-natural.png',
    alt: 'Aqua Natural RO water purifier service in Patna',
  },
];

/** Brand naam se "(Eureka Forbes)" jaisa bracket hata ke chhota naam. */
export function shortBrandName(name: string): string {
  return name.split(' (')[0].split(' / ')[0].trim();
}

/**
 * Logo na ho to monogram — brand ke pehle do shabdon ka pehla akshar.
 * "AO Smith" → "AS", "Zero B" → "ZB", "Faber" → "FA".
 */
export function brandMonogram(name: string): string {
  const words = shortBrandName(name).split(/[\s-]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return shortBrandName(name).slice(0, 2).toUpperCase();
}

/**
 * Us brand ka sabse saste wale fault ka lower bound — "₹850 – ₹2,400" me se 850.
 * Card par "repair ₹450 se" dikhane ke liye. Jo number dikhega wo us brand ke
 * apne page par bhi likha hai, isliye ad → hub → brand page teeno match karte
 * hain. Mismatch Quality Score girata hai.
 */
export function cheapestFixFrom(slug: string): string | null {
  const b = SERVICED_BRANDS.find((x) => x.slug === slug);
  if (!b || !b.commonIssues?.length) return null;
  const nums = b.commonIssues
    .map((i) => {
      const m = i.typicalCost?.match(/₹\s?([\d,]+)/);
      return m ? Number(m[1].replace(/,/g, '')) : NaN;
    })
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return null;
  return `₹${Math.min(...nums).toLocaleString('en-IN')}`;
}

/**
 * Hub page ke intro paragraphs.
 * Ye homepage ki copy se jaan-bujh kar alag likhe gaye hain — same text do
 * page par hona "duplicate content" hai, aur paid landing page par Google
 * landing-page-experience score girata hai.
 */
export const HUB_INTRO = [
  'Patna ke ghar me jo RO lagi hai wo kisi ek brand ki nahi hoti. Boring Road aur Patliputra ke flats me zyadatar Kent aur Aquaguard milti hai, purane mohallon — Kadamkuan, Gardanibagh, Bakarganj — me aath-das saal purani Aquaguard aur Pureit abhi tak chal rahi hain, aur Kankarbagh se Danapur tak har doosre ghar me locally assembled machine lagi hai.',
  'Hum teeno par kaam karte hain. Visit charge har brand ka ek hi hai — ₹200. Farak sirf part ke daam me padta hai, kyunki ek asli AO Smith cartridge sach me ek standard 10-inch filter se mehnga hota hai. Jo part lagega wo aapko dikhaya jayega, daam bataya jayega, phir hi khola jayega.',
] as const;

/** Hub page ke trust points — chhote, ginti-wale, dikhane layak. */
export const HUB_PROOF: { label: string; value: string; sub: string }[] = [
  { label: 'Brands serviced', value: `${SERVICED_BRANDS.length}+`, sub: 'branded + assembled' },
  { label: 'Visit charge', value: '₹200', sub: 'har brand, ek daam' },
  { label: 'Technician pahunchta hai', value: '90 min', sub: 'zyadatar Patna areas' },
  { label: 'Service warranty', value: '30 din', sub: 'har repair par' },
];
