/**
 * SITE IMAGE SLOTS — admin panel se har banner aur photo badalne ke liye.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN BANAYA (10 Oct 2026)
 * ─────────────────────────
 * Owner: "mujhe iss area mai editable de taki mai banner wagreh set kar pau
 *         admin panel se ... sare jagh ke jaha jaha banners ya photo lage hai
 *         har jagh ke option de"
 *
 * Pehle har image ka path code me likha hua tha. Banner badalna matlab:
 * GitHub me file upload karo → path edit karo → commit → push → deploy.
 * Ab admin panel se ek click me badal jaata hai, bina deploy ke.
 *
 * KAISE KAAM KARTA HAI
 * ────────────────────
 *   1. Neeche har image ki ek "slot" bani hai — ek pakka naam (key)
 *   2. Admin `/admin/images` par jaake us slot ke liye nayi image chunta hai
 *   3. Chunav `site_settings` table me `siteImages` key ke andar save hota hai
 *   4. Page render hote waqt `resolveSiteImages()` DB se override padhta hai;
 *      jo slot khaali hai uska code waala default chalta rehta hai
 *
 * 🔴 SEO PAR ASAR — IMAANDAR JAWAB
 * ────────────────────────────────
 * Owner ne poocha: "mere seo wagreh ya website to iski wagh se down to nhi hogi n"
 *
 * Image badalne se ranking NAHI girti — agar teen cheez sahi rahein:
 *
 *   1. ALT TEXT — Google image ko alt text se samajhta hai. Isliye har slot
 *      ka alt bhi yahin rehta hai aur admin usko bhi badal sakta hai. Khaali
 *      alt chhodna hi ek matra nuksan hai, aur UI usse rokta hai.
 *
 *   2. SIZE / SPEED — ye asli khatra hai. Agar koi 5 MB ki photo daal de to
 *      LCP (page kitni jaldi dikha) kharab hota hai, aur Core Web Vitals
 *      ranking ka hissa hai — aur Google Ads ka Quality Score bhi. Isliye:
 *        • upload hote hi image WebP me convert hoti hai (media.service.ts)
 *        • har slot ke saath recommended size likhi hai
 *        • admin UI bada file dikhne par warning deta hai
 *
 *   3. OG IMAGE — share karne par jo photo dikhti hai. Uska 1200x630 hona
 *      zaroori hai, warna WhatsApp/Facebook par katti hui dikhti hai.
 *      Us slot par UI yahi size maangta hai.
 *
 * In teeno ka dhyaan rakha gaya hai, isliye banner badalna safe hai.
 * Jo cheez SEO girati hai wo image ka URL badalna nahi, image ka BHAARI
 * hona ya alt text ka gayab hona hai.
 */

export interface ImageSlot {
  /** DB me isi naam se save hota hai. Kabhi mat badalna. */
  key: string;
  /** Admin ko dikhne wala naam */
  label: string;
  /** Kahan-kahan dikhti hai — admin ko pata ho ki asar kahan padega */
  usedOn: string;
  /** Code ka default — DB khaali ho to yahi chalta hai */
  defaultUrl: string;
  /** Default alt text */
  defaultAlt: string;
  /** Recommended pixel size — admin ko dikhane ke liye (insaani bhaasha) */
  size: string;
  /**
   * 🆕 11 Oct 2026 — machine ke liye wahi size, number me.
   *
   * KYUN: `size` ek string hai ("1600 × 900 (16:9)"), usse code crop nahi kar
   * sakta. Owner ne kaha tha *"jitna ratio isko chahyie utna khud le lega"* —
   * uske liye browser ko asli number chahiye. Upload se pehle image yahin ke
   * hisaab se crop + resize hoti hai (src/lib/images/prepare-upload.ts).
   */
  targetW: number;
  targetH: number;
  /**
   * 'cover'   = frame poora bhar do, bahar ka kat jaye (banner, card)
   * 'contain' = poori image rahe, kinare khaali (logo/OG jaisi cheezein)
   */
  fit: 'cover' | 'contain';
  /**
   * 🆕 Is image ke UPAR clickable phone number ka float dikhana hai ya nahi.
   *
   * Owner: *"koi bhi photo upload karu uske upper jo no hai float wala wo bhi
   * rahe ... banner dusri bhi lagau to ... no uske upper hi rahe"*
   *
   * Number image me CHHAPA nahi jaata — HTML me alag rehta hai. Isliye:
   *   • image kuch bhi badlo, number hamesha upar rehta hai
   *   • number par ungli rakhte hi call lagti hai (tel: link)
   *   • Google number ko PADH sakta hai (image ke andar ka text nahi padhta)
   */
  overlayPhone?: boolean;
  /** Kis group me dikhani hai admin UI me */
  group: 'Banner' | 'Service card' | 'Kaam ki photo' | 'Brand / OG';
  /** Kitne page is image ko use karte hain — impact samajhne ke liye */
  pages: string;
  /** Behtar image kaisi honi chahiye */
  tip: string;
}

export const IMAGE_SLOTS: ImageSlot[] = [
  /* ── BANNERS ── */
  {
    key: 'adsHero',
    label: 'Ads landing page ka banner',
    usedOn: '/ro-service-in-patna (Google Ads ka landing page)',
    defaultUrl: '/banners/patna-service-hero.png',
    defaultAlt: 'RO service in Patna — water purifier repair, TDS testing and filter change by Aqua Perl',
    size: '1600 × 900 (16:9)',
    targetW: 1600,
    targetH: 900,
    fit: 'cover',
    overlayPhone: true,
    group: 'Banner',
    pages: '1 page — par yahi wo page hai jahan Ads ka paisa lagta hai',
    tip: 'Dayein taraf machine/tools, bayein taraf khaali jagah chhodna — wahan text aata hai. Image me koi text mat daalna, wo HTML me hai.',
  },
  {
    key: 'homeHero',
    label: 'Homepage ka main hero',
    usedOn: 'Homepage ka sabse upar ka hissa, aur /ro-services-patna',
    defaultUrl: '/banners/hero-technician.png',
    defaultAlt: 'Aqua Perl RO technician servicing a water purifier in Patna',
    size: '1200 × 900',
    targetW: 1200,
    targetH: 900,
    fit: 'cover',
    overlayPhone: true,
    group: 'Banner',
    pages: '2 pages — homepage sabse zyada dekha jaata hai',
    tip: 'Asli technician ki photo sabse achhi chalti hai. Chehra saaf dikhe aur machine bhi.',
  },
  {
    key: 'carouselHero',
    label: 'Share photo — /service-patna',
    /* 🔴 11 Oct 2026 — pehle "Homepage carousel slide" likha tha, jo galat tha.
       HeroCarousel component kahin render hi nahi hota (dead code). Ye file
       asal me sirf DO jagah use hoti hai, dono me SHARE/OG image ke roop me:
       /service-patna ka openGraph aur organizationSchema ka `image`.
       Owner ko sach pata hona chahiye, warna wo banner badal ke homepage par
       dhoondta rahega. */
    usedOn: 'WhatsApp/Facebook par /service-patna share karne par dikhne wali photo (page par nahi dikhti)',
    defaultUrl: '/banners/service-tech.png',
    defaultAlt: 'RO water purifier service and repair in Patna',
    size: '1200 × 630 (share ke liye exact)',
    targetW: 1200,
    targetH: 630,
    fit: 'cover',
    overlayPhone: true,
    group: 'Banner',
    pages: 'Share preview — page par nahi dikhti',
    tip: '🔴 Is photo me technician ki shirt par "ROCARE" likha hai — competitor ka naam. Share karne par wahi dikhta hai, isliye badalna zaroori hai. 1200x630 rakhein warna WhatsApp par kati hui dikhegi.',
  },

  /* ── SERVICE CARDS (ads page) ── */
  {
    key: 'cardService',
    label: 'Card: RO Service',
    usedOn: '/ro-service-in-patna ke service cards',
    defaultUrl: '/services/ro-service.png',
    defaultAlt: 'RO water purifier full service check-up with TDS meter in Patna',
    size: '800 × 800 (square)',
    targetW: 800,
    targetH: 800,
    fit: 'cover',
    group: 'Service card',
    pages: '1 page',
    tip: 'Square image. Machine + TDS meter dikhe to achha.',
  },
  {
    key: 'cardRepair',
    label: 'Card: RO Repair',
    usedOn: '/ro-service-in-patna ke service cards',
    defaultUrl: '/services/ro-repair.png',
    defaultAlt: 'RO water purifier repair with tools and open filter panel in Patna',
    size: '800 × 800 (square)',
    targetW: 800,
    targetH: 800,
    fit: 'cover',
    group: 'Service card',
    pages: '1 page',
    tip: 'Khuli machine ya tools wali photo.',
  },
  {
    key: 'cardInstallation',
    label: 'Card: RO Installation',
    usedOn: '/ro-service-in-patna ke service cards',
    defaultUrl: '/services/ro-installation.png',
    defaultAlt: 'RO water purifier wall mount installation in Patna',
    size: '800 × 800 (square)',
    targetW: 800,
    targetH: 800,
    fit: 'cover',
    group: 'Service card',
    pages: '1 page',
    tip: 'Deewar par lagti hui machine.',
  },
  {
    key: 'cardFilter',
    label: 'Card: Filter Change',
    usedOn: '/ro-service-in-patna ke service cards',
    defaultUrl: '/services/ro-filter-change.png',
    defaultAlt: 'RO sediment and carbon filter cartridge replacement in Patna',
    size: '800 × 800 (square)',
    targetW: 800,
    targetH: 800,
    fit: 'cover',
    group: 'Service card',
    pages: '1 page',
    tip: 'Purana aur naya filter saath me — farak dikhe.',
  },
  {
    key: 'cardMembrane',
    label: 'Card: Membrane Change',
    usedOn: '/ro-service-in-patna ke service cards',
    defaultUrl: '/services/ro-membrane.png',
    defaultAlt: 'RO membrane cartridge replacement 75 80 100 GPD in Patna',
    size: '800 × 800 (square)',
    targetW: 800,
    targetH: 800,
    fit: 'cover',
    group: 'Service card',
    pages: '1 page',
    tip: 'Membrane ka close-up.',
  },
  {
    key: 'cardAmc',
    label: 'Card: AMC Plan',
    usedOn: '/ro-service-in-patna ke service cards',
    defaultUrl: '/services/ro-amc.png',
    defaultAlt: 'RO annual maintenance contract plans with scheduled visits in Patna',
    size: '800 × 800 (square)',
    targetW: 800,
    targetH: 800,
    fit: 'cover',
    group: 'Service card',
    pages: '1 page',
    tip: 'Calendar ya shield jaisa kuch — saal bhar ka matlab nikle.',
  },

  /* ── ASLI KAAM KI PHOTO — sabse zyada pages par ── */
  {
    key: 'proofTechnician',
    label: 'Kaam ki photo 1 — technician',
    usedOn: 'Homepage, 83 area pages, 7 service pages, ads page',
    defaultUrl: '/service/technician-working.jpg',
    defaultAlt: 'Aqua Perl technician repairing a RO water purifier at a home in Patna',
    size: '1200 × 900 (4:3)',
    targetW: 1200,
    targetH: 900,
    fit: 'cover',
    group: 'Kaam ki photo',
    pages: '🔴 90+ pages — ye badalne se poore site par asar padta hai',
    tip: 'Asli job ki photo. Mobile se kheenchi hui chalegi — stock photo se kahin behtar, kyunki Google reverse-image-search se stock pakad leta hai.',
  },
  {
    key: 'proofTds',
    label: 'Kaam ki photo 2 — TDS meter',
    usedOn: 'Homepage, 83 area pages, 7 service pages, ads page',
    defaultUrl: '/service/tds-testing.jpg',
    defaultAlt: 'Technician measuring TDS of RO water in Patna with a digital meter',
    size: '1200 × 900 (4:3)',
    targetW: 1200,
    targetH: 900,
    fit: 'cover',
    group: 'Kaam ki photo',
    pages: '🔴 90+ pages',
    tip: 'Meter ki reading saaf dikhe — yahi hamara sabse bada bharosa wala point hai.',
  },
  {
    key: 'proofMembrane',
    label: 'Kaam ki photo 3 — purana vs naya part',
    usedOn: 'Homepage, 83 area pages, 7 service pages, ads page',
    defaultUrl: '/service/membrane-old-new.jpg',
    defaultAlt: 'Old and new RO membrane shown side by side during replacement in Patna',
    size: '1200 × 900 (4:3)',
    targetW: 1200,
    targetH: 900,
    fit: 'cover',
    group: 'Kaam ki photo',
    pages: '🔴 90+ pages',
    tip: 'Ganda purana part aur saaf naya part saath me. Customer ko yahi sabse zyada convince karta hai.',
  },

  /* ── BRAND / SHARE ── */
  {
    key: 'ogDefault',
    label: 'Share karne par dikhne wali photo (OG image)',
    usedOn: 'WhatsApp / Facebook / Twitter par link share karne par',
    defaultUrl: '/brand/og-default.jpg',
    defaultAlt: 'Aqua Perl — RO service in Patna',
    size: '🔴 1200 × 630 (exact — warna kat jaati hai)',
    targetW: 1200,
    targetH: 630,
    fit: 'cover',
    group: 'Brand / OG',
    pages: 'Saare 144 pages ka default',
    tip: 'Isme bada text chalega (brand naam + ₹200 visit + phone), kyunki ye chhoti dikhai deti hai. 1200×630 se alag size mat daalna.',
  },
  {
    key: 'shopDomestic',
    label: 'Shop strip — domestic RO',
    usedOn: 'Homepage ka shop section',
    defaultUrl: '/products/ro-domestic.png',
    defaultAlt: 'Domestic RO water purifier for home in Patna',
    size: '800 × 800',
    targetW: 800,
    targetH: 800,
    fit: 'contain',
    group: 'Brand / OG',
    pages: '1 page',
    tip: 'Safed background par machine — product jaisa saaf look.',
  },
];

/** DB me jo save hota hai uska shape */
export interface SiteImageOverride {
  url: string;
  alt?: string;
}
export type SiteImageMap = Record<string, SiteImageOverride>;

/** Ek resolved image — url + alt, dono taiyaar */
export interface ResolvedImage {
  url: string;
  alt: string;
}
export type ResolvedImages = Record<string, ResolvedImage>;

/**
 * DB ka override + code ka default mila kar final map banata hai.
 * DB me kuch na ho to sab kuch waise ka waisa chalta hai — isliye ye
 * badlav kabhi site tod nahi sakta.
 */
export function resolveSiteImages(overrides: SiteImageMap | null | undefined): ResolvedImages {
  const out: ResolvedImages = {};
  for (const slot of IMAGE_SLOTS) {
    const o = overrides?.[slot.key];
    const url = (o?.url || '').trim();
    const alt = (o?.alt || '').trim();
    out[slot.key] = {
      url: url || slot.defaultUrl,
      alt: alt || slot.defaultAlt,
    };
  }
  return out;
}

/** Sirf code ke default — jahan DB reachable na ho */
export const DEFAULT_IMAGES: ResolvedImages = resolveSiteImages(null);

/** Slot key se slot nikalo */
export function getSlot(key: string): ImageSlot | undefined {
  return IMAGE_SLOTS.find((s) => s.key === key);
}

/** Admin UI ke liye group-wise */
export const IMAGE_GROUPS = ['Banner', 'Service card', 'Kaam ki photo', 'Brand / OG'] as const;
