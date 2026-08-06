/**
 * Aqua Perl — Global brand & business constants
 * Single source of truth for contact numbers, colors, and filter facets.
 */

/**
 * ⚠️ NAP CONSISTENCY — ye teen cheezein Google Business Profile se
 * BILKUL match honi chahiye (Name, Address, Phone). Ek bhi akshar alag
 * hua to Google dono ko alag business samajhta hai aur local ranking
 * gir jaati hai. Badalna ho to GBP, JustDial, Sulekha — sab jagah
 * ek saath badalna.
 *
 * GBP naam: Aqua Perl
 */
export const BRAND = {
  name: 'Aqua Perl',
  legalName: 'Aqua Perl RO Service Centre',
  domain: 'rokadoctor.in',
  url: 'https://rokadoctor.in',
  tagline: 'Pure Water, Delivered & Serviced',
  /** SVG — navbar (44px) se invoice print tak har jagah sharp. ~1.5 KB. */
  logo: '/brand/logo.svg',
  /** PNG fallback — email, WhatsApp preview jaise jagah jahan SVG nahi chalta. */
  logoPng: '/brand/logo.png',
  /** Square mark — favicon, app icon, share thumbnail. */
  icon: '/brand/icon.svg',
  ogImage: '/brand/og-default.jpg',
} as const;

export const CONTACT = {
  primaryPhone: '8969821440',
  secondaryPhone: '9661288308',
  primaryTel: 'tel:+918969821440',
  secondaryTel: 'tel:+919661288308',
  whatsapp: '918969821440',
  whatsappLink: (msg = 'Hi Aqua Perl, I need RO service in Patna.') =>
    `https://wa.me/918969821440?text=${encodeURIComponent(msg)}`,
  email: 'support@rokadoctor.in',
  /**
   * Email website par dikhana hai ya nahi.
   *
   * ⚠️ 6 Aug 2026 tak `rokadoctor.in` ka koi MX record NAHI tha — matlab
   * is pate par bheji hui mail bounce ho jaayegi. Ye `true` hai isliye
   * address dikh raha hai, par mail chalu karna abhi baaki hai:
   *
   *   1. Zoho Mail (free plan) ya Google Workspace pe account banao
   *   2. GoDaddy DNS mein unka MX record daalo
   *   3. Khud ko test mail bhej ke confirm karo
   *
   * Jab tak MX nahi hai, customer ka mail kahin nahi pahunchega —
   * usse lagega tum ignore kar rahe ho. Isliye ye jaldi kar lena.
   */
  emailWorks: true,
  /** GBP ke address se hu-ba-hu match hona chahiye. */
  address: {
    street: 'Sai Gali, Opposite B-62',
    locality: 'Buddha Colony',
    city: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    country: 'IN',
  },
  /**
   * Poora street address website par dikhana hai ya nahi.
   *
   * `true`  → footer/contact/schema mein "Sai Gali, Opposite B-62" bhi aayega
   * `false` → sirf "Buddha Colony, Patna" (Service Area Business style)
   *
   * ⚠️ Ye Google Business Profile ke saath MATCH hona chahiye:
   *   - GBP par address DIKH raha hai  → yahan `true`
   *   - GBP par address CHHUPA hai     → yahan `false`
   * Dono alag hue to Google ise mismatch maanta hai aur local ranking girti hai.
   * Kabhi ek badlo to doosra bhi usi waqt badalna.
   */
  showStreetAddress: true,
  /** Buddha Colony, Patna. */
  geo: { lat: 25.6093, lng: 85.1376 },
  hours: 'Mon–Sun 08:00–21:00',
} as const;

/**
 * Google Business Profile ke ASLI numbers.
 *
 * ⚠️ Ye schema.org markup mein jaate hain. Yahan jhoot likha to Google
 * "Spammy structured markup" ke tehat manual action de sakta hai —
 * saare rich result (star rating wagairah) band ho jaate hain.
 *
 * Jab bhi GBP pe review count badle, YAHI badalna hai. Kahin aur nahi.
 * Last updated: 6 Aug 2026
 */
/**
 * Social profiles — schema.org `sameAs` mein jaate hain.
 * SIRF wo URL daalna jo sach mein zinda ho. Khali array bilkul theek hai;
 * jhoota link Google ko 404 dikhata hai aur bharosa girta hai.
 */
export const SOCIAL: readonly string[] = [
  // 'https://www.facebook.com/<your-page>',
  // 'https://www.instagram.com/<your-handle>',
];

/**
 * Google Analytics 4 measurement ID.
 *
 * Ye SECRET nahi hai — har visitor ise page source mein dekh sakta hai,
 * isliye code mein rakhna bilkul safe hai. Yahan rakhne ka fayda: Vercel
 * mein env var set karna bhool jaao tab bhi tracking chalti rahegi.
 *
 * Chahe to `NEXT_PUBLIC_GA_ID` env var se override kar sakte ho
 * (jaise alag staging property ke liye).
 */
export const ANALYTICS = {
  gaId: 'G-JP9HDZ9SE3',
  /** In domains par hi GA chalega — localhost aur Vercel preview ka
   *  data asli report kharab na kare isliye. */
  allowedHosts: ['rokadoctor.in', 'www.rokadoctor.in'],
} as const;

export const GBP = {
  /** GBP par jo naam likha hai — hu-ba-hu. */
  name: 'Aqua Perl',
  ratingValue: 4.8,
  reviewCount: 44,
} as const;

export const SERVICE = {
  visitCharge: 200,
  city: 'Patna',
  state: 'Bihar',
  responseTime: '90 minutes',
  warrantyDays: 30,
} as const;

export const SHIPPING = {
  freeAbove: 1999,
  flatRate: 99,
  codCharge: 49,
  codMaxOrder: 15000,
} as const;

/** Tailwind-mirrored design tokens (also used for charts & emails) */
export const COLORS = {
  primary: '#06B6D4',      // aqua / cyan-500
  primaryDark: '#0891B2',
  primaryLight: '#CFFAFE',
  secondary: '#0B2545',    // deep navy
  secondaryLight: '#13315C',
  ctaOrange: '#F97316',
  ctaGreen: '#16A34A',
  surface: '#FFFFFF',
  muted: '#F1F5F9',
  text: '#0F172A',
  textMuted: '#64748B',
} as const;

export const PRODUCT_TYPES = [
  { key: 'NEW_RO',           label: 'New RO Purifiers',  href: '/category/new-ro-purifiers' },
  { key: 'SPARE_PART',       label: 'Spare Parts',       href: '/category/spare-parts' },
  { key: 'COMMERCIAL_PLANT', label: 'Commercial Plants', href: '/category/commercial-plants' },
  { key: 'ACCESSORY',        label: 'Accessories',       href: '/category/accessories' },
] as const;

/** Faceted filter definitions used by FilterSidebar + /api/products */
export const FILTER_FACETS = {
  purificationTech: [
    { value: 'RO',              label: 'RO (Reverse Osmosis)' },
    { value: 'UV',              label: 'UV Sterilization' },
    { value: 'UF',              label: 'UF (Ultra Filtration)' },
    { value: 'TDS_CONTROLLER',  label: 'TDS Controller' },
    { value: 'ALKALINE',        label: 'Alkaline / pH+' },
    { value: 'COPPER',          label: 'Copper Infusion' },
    { value: 'MINERAL',         label: 'Mineral Guard' },
  ],
  priceRanges: [
    { value: '0-2000',      label: 'Under ₹2,000',        min: 0,     max: 2000 },
    { value: '2000-8000',   label: '₹2,000 – ₹8,000',     min: 2000,  max: 8000 },
    { value: '8000-15000',  label: '₹8,000 – ₹15,000',    min: 8000,  max: 15000 },
    { value: '15000-30000', label: '₹15,000 – ₹30,000',   min: 15000, max: 30000 },
    { value: '30000-',      label: 'Above ₹30,000',       min: 30000, max: null },
  ],
  storage: ['5-7 L', '7-9 L', '9-12 L', '12 L+'],
  sortOptions: [
    { value: 'relevance',  label: 'Relevance' },
    { value: 'price_asc',  label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating',     label: 'Customer Rating' },
    { value: 'newest',     label: 'Newest First' },
    { value: 'discount',   label: 'Discount %' },
  ],
} as const;

export const ISSUE_CATEGORIES = [
  { value: 'NO_WATER',   label: 'No water / very slow output' },
  { value: 'LEAKAGE',    label: 'Water leakage' },
  { value: 'BAD_TASTE',  label: 'Bad taste or smell' },
  { value: 'NOISE',      label: 'Unusual noise / motor issue' },
  { value: 'TDS_HIGH',   label: 'High TDS / poor purification' },
  { value: 'FILTER',     label: 'Filter / membrane replacement' },
  { value: 'INSTALL',    label: 'New installation' },
  { value: 'SHIFTING',   label: 'Uninstall & shifting' },
  { value: 'OTHER',      label: 'Other issue' },
] as const;

export const TIME_SLOTS = ['09:00–12:00', '12:00–15:00', '15:00–18:00', '18:00–21:00'] as const;

export const ORDER_STATUS_FLOW = [
  'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED',
] as const;

export const SERVICE_STATUS_FLOW = [
  'NEW', 'CONTACTED', 'SCHEDULED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED',
] as const;
