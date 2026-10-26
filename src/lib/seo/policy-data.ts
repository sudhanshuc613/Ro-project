/**
 * POLICY PAGES — shipping · returns · warranty · privacy.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * 🔴 KYUN BANI (25 Oct 2026)
 * ──────────────────────────
 * Owner ka sawaal: "competitor har keyword par top-5 me hai, hum kyun nahi?"
 *
 * Naapne par sabse badi lik yahan mili. Footer me PAANCH link the aur
 * paanchon `/contact` par jaate the:
 *
 *     Shipping Policy    -> /contact
 *     Returns & Refunds  -> /contact
 *     Warranty Terms     -> /contact
 *     Privacy Policy     -> /contact
 *     Contact Us         -> /contact
 *
 * 145 page × 5 = **725 andaruni link** ek hi page par. Naap:
 *
 *     AQUA PERL : sabse zyada link paane wala page = /contact (5.8%)
 *                 uska sabse bada anchor = "shipping policy" ×145
 *     Google #1 : sabse zyada link paane wala page = / (36.0%)
 *                 uska anchor = "ro service centre patna @7880004551/ro repair" ×134
 *
 * Do alag nuksan:
 *   1. SEO — Google ko lagta hai `/contact` "shipping policy" ke baare me hai.
 *      Hamari sabse badi andaruni link-power ek galat signal par ja rahi thi.
 *   2. BHAROSA — jo customer "Privacy Policy" dabata hai use policy milti hi
 *      nahi thi, ek contact page khulta tha. Paisa lene wali site ke liye ye
 *      seedha trust ka nuksan hai (aur payment gateway bhi ye maangte hain).
 *
 * Ab har policy ka apna URL hai aur footer wahin point karta hai.
 * `/contact` par summary waise ki waise hai — kuch hataya nahi gaya.
 *
 * 🔴 Content ka EK HI source — ye file. `/contact` aur chaaron policy page
 *    yahin se padhte hain, isliye number kabhi aapas me alag nahi ho sakte.
 */
import { CONTACT, SERVICE, SHIPPING } from '@/lib/constants';

export interface PolicySection {
  heading: string;
  body: string;
  points?: string[];
}

/* 🔴 25 Oct 2026 — title me "| Aqua Perl" MAT likhna.
   src/app/layout.tsx ka title.template khud `%s | Aqua Perl` lagata hai.
   Pehle maine apne title me bhi likh diya tha -> "... | Aqua Perl | Aqua Perl"
   (73 char) aur verify-serp-hygiene ne pakda (62 char ki seema). */
export interface PolicyPage {
  slug: string;
  /** Footer / breadcrumb label */
  label: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: PolicySection[];
  /** `/contact` ke summary card ke liye chhoti list */
  summary: string[];
  /* 🔴 Ye bharti nahi hai. Ye wahi sawaal hain jo log call par rozana
     poochhte hain. Policy page par inka jawab hone se customer ko call
     karne ki zaroorat hi nahi padti — aur page sach me kaam ka ban jaata
     hai, sirf lamba nahi. */
  faqs: { q: string; a: string }[];
}

const rupee = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const POLICY_PAGES: PolicyPage[] = [
  /* ── SHIPPING ─────────────────────────────────────────────────────────── */
  {
    slug: 'shipping-policy',
    label: 'Shipping Policy',
    title: 'Shipping Policy — Delivery Charge & Time',
    description:
      `Free delivery above ${rupee(SHIPPING.freeAbove)} across India, flat ${rupee(SHIPPING.flatRate)} below. `
      + `Patna 2 days, rest of India 3–7 days. COD available up to ${rupee(SHIPPING.codMaxOrder)}.`,
    h1: 'Shipping Policy',
    intro:
      'Aqua Perl RO purifiers, membranes and spare parts ship across India. '
      + 'Ye page saaf-saaf batata hai kitna charge lagega aur saamaan kab pahunchega — '
      + 'order karne se pehle hi, baad me nahi.',
    summary: [
      `Free delivery across India on orders above ${rupee(SHIPPING.freeAbove)}`,
      `Flat ${rupee(SHIPPING.flatRate)} shipping below that`,
      'Standard delivery 3–7 business days',
      'Patna orders usually delivered in 2 days',
    ],
        faqs: [
      { q: "Patna me kitne din me pahunch jaata hai?", a: "Patna shahar ke andar aam taur par 2 din. Order confirm hote hi tracking link SMS aur WhatsApp dono par jaata hai, isliye aapko poochhna nahi padta." },
      { q: "Cash on Delivery milta hai?", a: "Haan, ₹15,000 tak ke order par. Uspar ₹49 handling lagta hai. Isse bade order par pehle payment karni hoti hai." },
      { q: "Delivery free kab hoti hai?", a: "₹1,999 ke upar ke order par poore India me free. Usse kam par flat ₹99 lagta hai — order karte waqt hi dikh jaata hai, baad me nahi juDta." },
      { q: "Naya purifier liya to lagwa kaun dega?", a: "Patna me hamari apni team lagati hai, visit charge ₹200. Patna ke bahar box me manufacturer ka installation card milta hai." },
      { q: "Dabba tuta hua aaya to?", a: "Usi waqt photo le kar WhatsApp kar do. Transit damage hum free replace karte hain — 24 ghante ke andar bataya gaya damage bina sawaal maana jaata hai." },
    ],
    sections: [
      {
        heading: 'Delivery charge',
        body: 'Charge order ki value par tay hota hai, kisi chhupi hui shart par nahi.',
        points: [
          `Order ${rupee(SHIPPING.freeAbove)} ke upar — delivery bilkul free, poore India me`,
          `Order ${rupee(SHIPPING.freeAbove)} ke neeche — flat ${rupee(SHIPPING.flatRate)}`,
          `Cash on Delivery — extra ${rupee(SHIPPING.codCharge)} handling`,
          `COD sirf ${rupee(SHIPPING.codMaxOrder)} tak ke order par milta hai`,
        ],
      },
      {
        heading: 'Delivery time',
        body: 'Ye asli time hain jo hum rozana dekhte hain, marketing ka number nahi.',
        points: [
          `${SERVICE.city} shahar ke andar — aam taur par 2 din`,
          'Bihar ke baaki shahar — 2 se 4 din',
          'Baaki India — 3 se 7 working day',
          'Order confirm hote hi tracking link SMS aur WhatsApp par jaata hai',
        ],
      },
      {
        heading: 'Installation',
        body:
          `${SERVICE.city} me naya purifier khareedne par installation hamari team karti hai. `
          + `Visit charge ${rupee(SERVICE.visitCharge)} hai aur wo order ke saath hi clear ho jaata hai.`,
        points: [
          `${SERVICE.city} me installation hamare apne technician se`,
          `Response time aam taur par ${SERVICE.responseTime}`,
          `${SERVICE.city} ke bahar — box me manufacturer ka installation card milta hai`,
        ],
      },
      {
        heading: 'Saamaan toota hua mila to',
        body:
          'Delivery ke waqt dabba tuta dikhe to usi waqt photo le lo aur hume bhejo. '
          + 'Transit damage hum free replace karte hain — ye hamari zimmedari hai, aapki nahi.',
        points: [
          `WhatsApp par photo bhejo: ${CONTACT.primaryPhone}`,
          'Transit damage par replacement free',
          '24 ghante ke andar bataya gaya damage bina sawaal maana jaata hai',
        ],
      },
    ],
  },

  /* ── RETURNS & REFUNDS ────────────────────────────────────────────────── */
  {
    slug: 'returns-refunds',
    label: 'Returns & Refunds',
    title: 'Returns & Refund Policy — 7 Day Return',
    description:
      '7-day return on unused products in original packaging. Transit damage replaced free. '
      + 'Refund 5–7 working days me wapas. Installed product par warranty lagti hai.',
    h1: 'Returns & Refund Policy',
    intro:
      'Saamaan pasand na aaye ya galat aa jaye to wapas karne ka saaf rasta hona chahiye. '
      + 'Niyam neeche hain — koi chhupi hui shart nahi.',
    summary: [
      '7-day return window on unused products in original packaging',
      'Damaged-in-transit items replaced free',
      'Refunds processed within 5–7 working days of pickup',
      'Installed products cannot be returned, but are covered by warranty',
    ],
        faqs: [
      { q: "Kitne din me wapas kar sakte hain?", a: "Delivery ke 7 din ke andar, agar product chala nahi hai aur original packing me hai. Seal khul gayi ho par product istemaal na hua ho — tab bhi chalega." },
      { q: "Istemaal kiya hua filter wapas hoga?", a: "Nahi. Filter, membrane aur cartridge ek baar paani me lagne ke baad wapas nahi ho sakte — ye safai ka niyam hai, koi bahana nahi." },
      { q: "Purifier lag chuka hai, ab pasand nahi aaya to?", a: "Lagne ke baad return nahi hota, par uspe poori warranty chalti hai. Kuch bhi dikkat ho to hum theek karne aayenge." },
      { q: "Paisa kitne din me wapas aata hai?", a: "Pickup hone ke baad 5 se 7 working day. Ginti pickup se shuru hoti hai, request karne ke din se nahi — isliye hum pickup jaldi karate hain." },
      { q: "COD se liya tha, refund kaise aayega?", a: "Bank transfer se. Aapko bas account detail deni hoti hai, baaki hum karte hain." },
    ],
    sections: [
      {
        heading: 'Kya wapas ho sakta hai',
        body: 'Delivery ke 7 din ke andar, agar product istemaal nahi hua ho.',
        points: [
          'Product chala nahi hai aur original packing me hai',
          'Saare accessory, manual aur bill saath me hain',
          'Seal khuli ho par product istemaal na hua ho — tab bhi chalega',
        ],
      },
      {
        heading: 'Kya wapas nahi ho sakta',
        body: 'Ye cheezein pehle hi bata dena theek hai, taaki baad me bahas na ho.',
        points: [
          'Lag chuka (installed) purifier — par uspe poori warranty lagti hai',
          'Istemaal ho chuka filter, membrane ya cartridge (hygiene ki wajah se)',
          'Grahak ke istemaal se tuta hua saamaan',
          '7 din ke baad ka request',
        ],
      },
      {
        heading: 'Paisa kab wapas aayega',
        body: 'Pickup hone ke baad ginti shuru hoti hai, request karne ke din se nahi.',
        points: [
          'Pickup ke baad 5–7 working day me refund',
          'Jis tarike se paisa aaya tha usi me wapas jaata hai',
          'COD order ka refund bank transfer se',
          `Refund ka status kabhi bhi poochho: ${CONTACT.primaryPhone}`,
        ],
      },
      {
        heading: 'Return kaise karein',
        body: 'Teen step, bas.',
        points: [
          `WhatsApp ya call par order number batao — ${CONTACT.primaryPhone}`,
          'Hum pickup ka din tay karte hain',
          'Product check hone ke baad refund chalu',
        ],
      },
    ],
  },

  /* ── WARRANTY ─────────────────────────────────────────────────────────── */
  {
    slug: 'warranty-terms',
    label: 'Warranty Terms',
    title: `Warranty Terms — ${SERVICE.warrantyDays} Day Service Warranty`,
    description:
      `${SERVICE.warrantyDays}-day labour warranty on every repair, ${SERVICE.partsWarrantyMonths} months on fitted parts. `
      + 'New purifiers carry full manufacturer warranty. Saaf shartein, bill par likhi hui.',
    h1: 'Warranty Terms',
    intro:
      'Warranty ka matlab tabhi hai jab wo likhi ho. Isliye yahan saaf likha hai ki '
      + 'kis cheez par kitni warranty hai, aur kab nahi lagti.',
    summary: [
      'Manufacturer warranty on all new purifiers (12–24 months)',
      `${SERVICE.warrantyDays}-day service warranty on every repair`,
      `Fitted spare parts carry ${SERVICE.partsWarrantyMonths} months warranty`,
      'Warranty void if serviced by an unauthorised technician',
    ],
        faqs: [
      { q: "Repair ke baad wahi dikkat lauti to?", a: "30 din ke andar wahi problem aayi to visit free, labour free. Kuch dena nahi padta — ye bill par likha hota hai." },
      { q: "Lagaye hue part par kitni warranty hai?", a: "12 mahine. Membrane, pump, SMPS, solenoid, filter — sab par. Part ka naam aur warranty bill par likhi jaati hai." },
      { q: "Bill kho gaya to warranty milegi?", a: "Phone number se hum record nikaal lete hain. Phir bhi bill sambhal kar rakhna behtar hai — company ki warranty claim me wo maanga jaata hai." },
      { q: "Beech me kisi aur se banwa liya to?", a: "Phir hamari warranty nahi chalti. Wajah saaf hai — hume nahi pata unhone kya badla. Isliye warranty ke andar hamesha hume hi bulao." },
      { q: "Naye purifier par warranty kiski hoti hai?", a: "Company ki — 12 se 24 mahine, model par depend. Claim me hum khud coordinate karte hain, aapko company se ladna nahi padega." },
    ],
    sections: [
      {
        heading: 'Repair par warranty',
        body:
          `Hum jo kaam karte hain uspe ${SERVICE.warrantyDays} din ki labour warranty hai. `
          + 'Matlab wahi dikkat dobara aayi to visit free, labour free.',
        points: [
          `Labour warranty — ${SERVICE.warrantyDays} din`,
          'Wahi problem lauti to visit charge nahi lagta',
          'Warranty bill par likhi hoti hai, zubaani nahi',
        ],
      },
      {
        heading: 'Lage hue part par warranty',
        body:
          `Hum jo part lagate hain uspe ${SERVICE.partsWarrantyMonths} mahine ki warranty hai. `
          + 'Ye labour warranty se alag aur lambi hai.',
        points: [
          `Membrane, pump, SMPS, solenoid, filter — ${SERVICE.partsWarrantyMonths} mahine`,
          'Part kharab nikla to badalna free',
          'Part ka naam aur warranty bill par likhi jaati hai',
        ],
      },
      {
        heading: 'Naye purifier par warranty',
        body: 'Naye purifier par company ki apni warranty chalti hai, hum sirf claim me madad karte hain.',
        points: [
          'Manufacturer warranty 12 se 24 mahine (model par depend)',
          'Warranty card aur invoice dono box me milte hain',
          'Claim me hum khud coordinate karte hain — aapko company se ladna nahi padega',
        ],
      },
      {
        heading: 'Warranty kab nahi lagti',
        body: 'Ye saaf bata dena imaandari hai.',
        points: [
          'Kisi aur technician ne beech me khol diya ho',
          'Paani ke alawa kisi aur wajah se nuksan (giraana, voltage, aag)',
          'Duplicate ya bahar se laaya hua part lagwaya ho',
          'Bill na ho — isliye bill sambhal kar rakhein',
        ],
      },
    ],
  },

  /* ── PRIVACY ──────────────────────────────────────────────────────────── */
  {
    slug: 'privacy-policy',
    label: 'Privacy Policy',
    title: 'Privacy Policy — Aapka Data Kaise Rakha Jaata Hai',
    description:
      'Hum sirf naam, phone aur address lete hain. Number kabhi bika nahi jaata. '
      + 'Card detail hum store hi nahi karte — payment gateway handle karta hai.',
    h1: 'Privacy Policy',
    intro:
      'Chhoti si baat — hum utna hi data lete hain jitna aapka order ya service '
      + 'poora karne ke liye chahiye. Usse ek bhi cheez zyada nahi.',
    summary: [
      'We collect only name, phone and address needed to fulfil your order or service',
      'Your number is never sold or shared with third parties',
      'WhatsApp updates can be stopped any time by replying STOP',
      'Payment details are handled by the gateway — we never store card data',
    ],
        faqs: [
      { q: "Mera number kisi ko doge?", a: "Nahi. Na bechte hain, na kisi third party ko dete hain, na ads ke liye share karte hain. Number sirf aapka kaam poora karne ke liye hai." },
      { q: "Card ki detail aapke paas rehti hai?", a: "Bilkul nahi. Payment gateway handle karta hai, hamare server par card ya UPI ki detail aati hi nahi." },
      { q: "WhatsApp message band karne hain to?", a: "STOP likh kar reply kar do, band ho jayenge. Service phir bhi chalu rehti hai — koi farak nahi padta." },
      { q: "Mera poora data hatwa sakta hoon?", a: "Haan, ek call par. Jo data kanoonan rakhna zaroori nahi, wo hata diya jaata hai. Bill aur GST record kanoon ke hisaab se rakhne padte hain." },
      { q: "Address kyun maangte ho?", a: "Technician ko ghar tak pahunchna hota hai aur saamaan bhejna hota hai. Isi liye, aur kisi wajah se nahi." },
    ],
    sections: [
      {
        heading: 'Hum kya lete hain',
        body: 'Sirf wahi jo kaam ke liye zaroori hai.',
        points: [
          'Naam — taaki technician sahi ghar pahunche',
          'Phone — call aur WhatsApp update ke liye',
          'Address aur pincode — service aur delivery ke liye',
          'Order history — warranty claim ke waqt kaam aati hai',
        ],
      },
      {
        heading: 'Hum kya NAHI karte',
        body: 'Ye utna hi zaroori hai jitna upar wala.',
        points: [
          'Aapka number kisi ko bechte nahi, na kisi third party ko dete hain',
          'Card ya UPI ki detail hum store hi nahi karte — gateway handle karta hai',
          'Bina matlab ka marketing message nahi bhejte',
          'Aapka data vigyapan (ads) ke liye kisi ko nahi dete',
        ],
      },
      {
        heading: 'WhatsApp aur SMS',
        body: 'Update bhejte hain kyunki log poochhte rehte hain ki technician kab aayega.',
        points: [
          'Sirf order aur service se juda update jaata hai',
          'Band karna ho to STOP likh kar reply kar do',
          'Band karne par bhi service chalu rehti hai',
        ],
      },
      {
        heading: 'Apna data hatwana ho to',
        body: 'Ek call par ho jaata hai.',
        points: [
          `Call ya WhatsApp — ${CONTACT.primaryPhone}`,
          'Jo data kanoonan rakhna zaroori nahi, wo hata diya jaata hai',
          'Bill aur GST record kanoon ke hisaab se rakhne padte hain',
        ],
      },
    ],
  },
];

export function policyBySlug(slug: string): PolicyPage | undefined {
  return POLICY_PAGES.find((p) => p.slug === slug);
}

/** Footer ke liye — label + asli URL (ab /contact nahi). */
export const POLICY_LINKS = POLICY_PAGES.map((p) => ({
  label: p.label,
  href: `/${p.slug}`,
}));
