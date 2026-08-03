/**
 * AquaNexa — Global brand & business constants
 * Single source of truth for contact numbers, colors, and filter facets.
 */

export const BRAND = {
  name: 'AquaNexa',
  legalName: 'AquaNexa Water Solutions',
  domain: 'rokadoctor.in',
  url: 'https://rokadoctor.in',
  tagline: 'Pure Water, Delivered & Serviced',
  logo: '/brand/logo.png',
  ogImage: '/brand/og-default.jpg',
} as const;

export const CONTACT = {
  primaryPhone: '8969821440',
  secondaryPhone: '9661288308',
  primaryTel: 'tel:+918969821440',
  secondaryTel: 'tel:+919661288308',
  whatsapp: '918969821440',
  whatsappLink: (msg = "Hi AquaNexa, I need RO service in Patna.") =>
    `https://wa.me/918969821440?text=${encodeURIComponent(msg)}`,
  email: 'support@rokadoctor.in',
  address: {
    street: 'Kankarbagh Main Road',
    locality: 'Kankarbagh',
    city: 'Patna',
    state: 'Bihar',
    pincode: '800020',
    country: 'IN',
  },
  geo: { lat: 25.5941, lng: 85.1376 },
  hours: 'Mon–Sun 08:00–21:00',
} as const;

export const SERVICE = {
  visitCharge: 100,
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
