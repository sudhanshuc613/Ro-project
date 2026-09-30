/**
 * BRAND LOGOS — jin brands ki machine hum service karte hain.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚖️ KAANOONI BAAT — ise padhna zaroori hai
 * ─────────────────────────────────────────
 * Ye sab REGISTERED TRADEMARK hain. Kent, Aquaguard, Pureit, Livpure,
 * Nasaka, Usha, Blue Mount — sab kisi aur ki property hain.
 *
 * Hum inhe "nominative fair use" ke aadhaar par dikha rahe hain — yaani ek
 * swatantra repair service ye bata sakti hai ki wo kaunse brand ki machine
 * theek karti hai. Ye duniya bhar me maanya hai, PAR uski teen SHART hain:
 *
 *   1. Utna hi logo dikhao jitna pehchaan ke liye zaroori hai — bada banner
 *      ya hero image me mat lagao.
 *   2. Kahin bhi ye na lage ki brand ne hume authorise kiya hai.
 *   3. Saaf likho ki hum authorised service centre NAHI hain.
 *
 * 🔴 ISI WAJAH SE `BrandLogoGrid` me disclaimer HARD-CODED hai. Use mat hatao.
 * Wahi ek line hai jo "fair use" aur "trademark infringement" me farq karti hai.
 *
 * Agar kabhi kisi brand ka legal notice aaye: us brand ki entry yahan se hata
 * do (ya `logo` ko `null` kar do — naam text me reh jayega, jo hamesha legal hai).
 *
 * ── Technical ──────────────────────────────────────────────────────────────
 * Files: public/brands/*.png (700×700, ~30-65 KB har ek)
 * Next/Image inhe WebP me convert karke serve karega, isliye page weight
 * par asar na ke barabar hai.
 */

export interface BrandLogo {
  /** Brand ka dikhne wala naam. */
  name: string;
  /** public/brands/ me file. `null` = sirf text tile dikhega. */
  logo: string | null;
  /** Agar hamare paas us brand ka service page hai to uska path. */
  href?: string;
  /** Alt text — SEO aur screen reader dono ke liye. */
  alt: string;
}

export const BRAND_LOGOS: BrandLogo[] = [
  {
    name: 'Kent',
    logo: '/brands/kent.webp',
    href: '/service-patna/brand/kent',
    alt: 'Kent RO water purifier service in Patna',
  },
  {
    name: 'Aquaguard',
    logo: '/brands/aquaguard.png',
    href: '/service-patna/brand/aquaguard',
    alt: 'Aquaguard RO service and repair in Patna',
  },
  {
    name: 'Eureka Forbes',
    logo: '/brands/eureka-forbes.png',
    href: '/service-patna/brand/aquasure',
    alt: 'Eureka Forbes Aquasure RO service in Patna',
  },
  {
    name: 'Pureit',
    logo: '/brands/pureit.png',
    href: '/service-patna/brand/pureit',
    alt: 'Unilever Pureit water purifier service in Patna',
  },
  {
    name: 'Livpure',
    logo: '/brands/livpure.png',
    href: '/service-patna/brand/livpure',
    alt: 'Livpure RO service and repair in Patna',
  },
  {
    name: 'Aquafresh',
    logo: '/brands/aquafresh.png',
    href: '/service-patna/brand/aquafresh',
    alt: 'Aquafresh RO water purifier service in Patna',
  },
  {
    name: 'Nasaka',
    logo: '/brands/nasaka.png',
    href: '/service-patna/brand/nasaka',
    alt: 'Nasaka water purifier service in Patna',
  },
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
    name: 'Aqua Natural RO',
    logo: '/brands/aqua-natural.png',
    alt: 'Aqua Natural RO water purifier service in Patna',
  },
];

/**
 * Jin brands ka logo hamare paas nahi hai par service karte hain.
 * Text tile me dikhte hain — trademark ke hisaab se ye hamesha surakshit hai.
 */
export const BRAND_TEXT_ONLY: { name: string; href?: string }[] = [
  { name: 'AO Smith', href: '/service-patna/brand/ao-smith' },
  { name: 'Blue Star', href: '/service-patna/brand/blue-star' },
  { name: 'Havells', href: '/service-patna/brand/havells' },
  { name: 'Zero B', href: '/service-patna/brand/zero-b' },
  { name: 'Tata Swach', href: '/service-patna/brand/tata-swach' },
  { name: 'LG', href: '/service-patna/brand/lg' },
  { name: 'Whirlpool', href: '/service-patna/brand/whirlpool' },
  { name: 'Panasonic', href: '/service-patna/brand/panasonic' },
  { name: 'Faber', href: '/service-patna/brand/faber' },
  { name: 'V-Guard', href: '/service-patna/brand/v-guard' },
  { name: 'Konvio Neer', href: '/service-patna/brand/konvio-neer' },
  { name: 'AquaUltra', href: '/service-patna/brand/aquaultra' },
];

/**
 * 🔴 DISCLAIMER — legal mitigation. Grid ke neeche hamesha dikhna chahiye.
 * Ise hatane se nominative fair use ka bachaav kamzor ho jaata hai.
 */
export const BRAND_DISCLAIMER =
  'Aqua Perl ek swatantra (independent) RO service centre hai. Upar diye gaye sabhi ' +
  'brand naam aur logo unke apne maalikon ki property hain. Hum kisi bhi brand ke ' +
  'authorised service centre ya dealer NAHI hain — hum in sabhi brands ki machine par ' +
  'repair aur service karte hain.';
