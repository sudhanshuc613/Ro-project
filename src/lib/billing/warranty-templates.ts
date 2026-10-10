/**
 * WARRANTY + TERMS & CONDITIONS TEMPLATES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Owner ne poocha: "warranty wagreh bhi template de dena ki kya add karna
 * hoga ya kya main likh du". Toh yeh woh file hai — har tarah ke bill ke liye
 * ready wording, aur saath me machine pe kitne mahine ki warranty set hogi.
 *
 * ── 🔴 EK ZAROORI SUDHAR (owner ke purane bill me risk tha) ────────────────
 * Owner ke diye hue Nivisha 50 LPH bill pe likha tha:
 *
 *     "1 Year Comprehensive Warranty is provided on ALL parts
 *      along with 1 Year Free Service."
 *
 * Problem: "ALL parts" ka matlab membrane aur filters/candle bhi. Patna ka
 * borewell paani 400–1200 TDS pe chalta hai; us paani me 50 LPH plant ka
 * membrane 8–10 mahine me choke ho jaata hai — yeh kharaabi nahi, normal
 * ghisaav (consumable) hai. Agar bill pe "ALL parts" likha hoga toh grahak
 * 9ve mahine me ₹6,000–₹12,000 ka membrane free maangega, aur kaagaz uske
 * saath hoga. Ek hi aisa case saal bhar ka munafa kha jaata hai.
 *
 * Isliye neeche do versions diye hain:
 *   • NEW_RO_COMMERCIAL / NEW_RO_DOMESTIC → sudhra hua wording
 *     (electrical + mechanical parts cover; consumables alag likhe hue)
 *   • LEGACY_ALL_PARTS                    → owner ka bilkul purana wording
 *     jaisa ka taisa, kyunki jo bill pehle de chuke hain unki copy dobara
 *     chhaapni pad sakti hai. Hataya nahi gaya — sirf ⚠️ ke saath rakha hai.
 *
 * ── REPAIR WALA RULE (site ke baaki hisson se match) ──────────────────────
 * SERVICE.warrantyDays = 30         → labour/service 30 din
 * SERVICE.partsWarrantyMonths = 12  → laga hua naya part 12 mahine
 * Dono numbers yahin se import hote hain, dobara likhe nahi gaye — warna
 * kal rate badla aur bill purana number chhaapta rah jaata.
 */
import { SERVICE } from '@/lib/constants';

export interface WarrantyTemplate {
  /** DB me isi key se save hota hai — badalna mat, purane bill toot jayenge. */
  key: string;
  label: string;
  /** Kis tarah ke bill pe suggest karna hai. */
  suitableFor: Array<'SALE' | 'SERVICE' | 'AMC' | 'INSTALLATION' | 'OTHER'>;
  /** Bill pe "Terms & Conditions" me jaisi ki taisi chhapne wali lines. */
  terms: string[];
  /** Machine record me set hone wali warranty (mahine me). 0 = koi nahi. */
  partsWarrantyMonths: number;
  serviceWarrantyMonths: number;
  /** Kitni free service visit shaamil hain. */
  freeServices: number;
  /** Do service ke beech kitne din. 90 = 3 mahine. */
  serviceIntervalDays: number;
  /** Admin ko samjhane ke liye — bill pe nahi chhapta. */
  adminNote: string;
  /** ⚠️ dikhane ke liye. */
  riskNote?: string;
}

export const WARRANTY_TEMPLATES: readonly WarrantyTemplate[] = [
  {
    key: 'NEW_RO_DOMESTIC',
    label: 'Naya domestic RO becha (ghar ka 6–15 L)',
    suitableFor: ['SALE', 'INSTALLATION'],
    terms: [
      'Installation: Free of cost. (Plumbing point, drain point aur electrical socket customer ko dena hoga.)',
      'Warranty: 1 year warranty on electrical and mechanical parts — pump, SMPS/adaptor, solenoid valve, UV lamp, float valve, motor.',
      'Consumables (sediment filter, carbon filter, RO membrane, UF/alkaline cartridge) normal wear-and-tear items hain aur warranty me shaamil nahi — inki life paani ke TDS par depend karti hai.',
      'Free Service: 1 year me 4 free service visit (har 3 mahine). Consumable ka rate alag lagega.',
      'Warranty void hoti hai agar: machine kisi aur mechanic se kholi gayi ho, voltage fluctuation/short-circuit se jali ho, paani me tel-keechad aaya ho, ya physical damage hua ho.',
      'Payment Terms: Full payment installation ke baad turant due hai.',
      'Yeh bill warranty card bhi hai — service ke waqt dikhana zaroori hai.',
    ],
    partsWarrantyMonths: 12,
    serviceWarrantyMonths: 12,
    freeServices: 4,
    serviceIntervalDays: 90,
    adminNote:
      'Ghar wale RO ke liye default. "ALL parts" nahi likha — membrane/filter alag se bahar rakhe hain, yahi aapko bachata hai.',
  },
  {
    key: 'NEW_RO_COMMERCIAL',
    label: 'Commercial RO plant becha (25 LPH se upar)',
    suitableFor: ['SALE', 'INSTALLATION'],
    terms: [
      'Installation: Free of cost. (Plumbing raw point, drain aur electrical point customer ko provide karna hoga.)',
      'Warranty: 1 year comprehensive warranty on electrical and mechanical parts — high-pressure pump, motor, control panel, solenoid, pressure switch, dosing pump, UV system.',
      'Membrane aur pre-filters (sediment, carbon, antiscalant) consumable hain. Inki life inlet TDS aur chalne ke ghante par depend karti hai, isliye warranty me nahi hain. Inlet water report ke hisaab se expected life bataai gayi hai.',
      'Free Service: 1 year me 4 scheduled service visit. Breakdown call bhi free (sirf consumable ka rate lagega).',
      'Warranty void: dry-run (bina paani pump chalana), voltage fluctuation, kisi bahar ke mechanic se repair, ya bina batao jagah badalna.',
      'Payment Terms: Full payment successful installation ke baad due hai.',
      'Spare parts stock Patna me available hain — 24–48 ghante me replacement.',
    ],
    partsWarrantyMonths: 12,
    serviceWarrantyMonths: 12,
    freeServices: 4,
    serviceIntervalDays: 90,
    adminNote:
      'Nivisha 50 LPH jaise plant ke liye. 25–500 LPH sab me chalega. Dry-run clause zaroori hai — commercial plant isi se sabse zyada jalta hai.',
  },
  {
    key: 'LEGACY_ALL_PARTS',
    label: '⚠️ Purana wording — "1 Year on ALL parts" (jaisa pehle dete the)',
    suitableFor: ['SALE', 'INSTALLATION'],
    terms: [
      'Installation: Free of cost. (Plumbing and electrical raw points must be provided by the customer).',
      'Warranty & Service: 1 Year Comprehensive Warranty is provided on ALL parts along with 1 Year Free Service.',
      'Payment Terms: Full payment is due upon successful installation.',
    ],
    partsWarrantyMonths: 12,
    serviceWarrantyMonths: 12,
    freeServices: 4,
    serviceIntervalDays: 90,
    adminNote:
      'Sirf tab use karein jab purana bill dobara chhaapna ho. Naye bill me NEW_RO_DOMESTIC ya NEW_RO_COMMERCIAL lein.',
    riskNote:
      '"ALL parts" me membrane aur filter bhi aa jaate hain. Patna ke 400–1200 TDS paani me membrane 8–10 mahine me choke hota hai — grahak free replacement maang sakta hai aur kaagaz uske saath hoga.',
  },
  {
    key: 'REPAIR_SERVICE',
    label: 'Repair / service visit (ghar pe jaake theek kiya)',
    suitableFor: ['SERVICE'],
    terms: [
      `Service Warranty: Jo kaam aaj kiya gaya hai uspe ${SERVICE.warrantyDays} din ki warranty hai. Isi kharaabi ke liye dobara aana pada to visit charge nahi lagega.`,
      `Parts Warranty: Aaj jo naya part lagaya gaya hai uspe ${SERVICE.partsWarrantyMonths} mahine (1 saal) ki warranty hai — bill pe part ka naam likha hai.`,
      'Consumables (sediment filter, carbon filter, candle, membrane) ki life paani ke TDS par depend karti hai, isliye inpe manufacturing defect ke alawa warranty nahi hai.',
      'Warranty sirf isi bill pe likhe hue kaam/part ke liye hai. Machine ki doosri kharaabi alag se chargeable hai.',
      'Warranty void: machine kisi aur mechanic se kholi gayi, voltage se jali, ya physical damage hua.',
      'Rate kaam shuru karne se pehle bataya gaya tha. Koi chhupa hua charge nahi.',
      'Yeh bill sambhal ke rakhein — warranty claim ke waqt yahi proof hai.',
    ],
    partsWarrantyMonths: SERVICE.partsWarrantyMonths,
    serviceWarrantyMonths: 1,
    freeServices: 0,
    serviceIntervalDays: 90,
    adminNote:
      `Sabse zyada chalne wala template. Site ke saath exactly match karta hai: labour ${SERVICE.warrantyDays} din, part ${SERVICE.partsWarrantyMonths} mahine.`,
  },
  {
    key: 'PART_REPLACEMENT',
    label: 'Sirf part badla (motor / SMPS / membrane / UV)',
    suitableFor: ['SERVICE'],
    terms: [
      `Parts Warranty: Lagaya gaya naya part ${SERVICE.partsWarrantyMonths} mahine ki warranty ke saath hai. Part ka naam aur (agar hai to) serial number bill pe likha hai.`,
      `Labour Warranty: ${SERVICE.warrantyDays} din. Isi fitting ki wajah se dikkat aayi to free theek karenge.`,
      'Purana nikala hua part customer ko dikhaya gaya hai. Chahein to apne paas rakh sakte hain.',
      'Membrane / filter ki life inlet TDS par depend karti hai — manufacturing defect ke alawa inpe warranty nahi.',
      'Warranty claim ke liye yeh bill dikhana zaroori hai.',
      'Warranty void: doosre mechanic se khulwana, voltage damage, ya physical damage.',
    ],
    partsWarrantyMonths: SERVICE.partsWarrantyMonths,
    serviceWarrantyMonths: 1,
    freeServices: 0,
    serviceIntervalDays: 90,
    adminNote:
      '"Purana part dikhaya gaya" line jaan-boojh ke daali hai — Patna me grahak ka sabse bada shaq yahi hota hai ki part badla bhi ya nahi. Likha hua ho to bharosa banta hai.',
  },
  {
    key: 'FILTER_CHANGE',
    label: 'Filter / candle / cartridge change',
    suitableFor: ['SERVICE'],
    terms: [
      'Jo filter/cartridge aaj lagaye gaye hain woh naye aur sealed pack se nikale gaye hain.',
      'Filter ki expected life: sediment aur carbon 4–6 mahine, inline/candle 6 mahine, membrane 18–24 mahine — paani ke TDS aur roz ke istemaal par depend karta hai.',
      'Consumable hone ki wajah se life par warranty nahi hai; manufacturing defect 15 din me bataane par free badla jayega.',
      `Fitting/leakage par ${SERVICE.warrantyDays} din ki labour warranty hai.`,
      'Agla filter change kab due hai — bill ke upar "Next Service Due" me likha hai.',
    ],
    partsWarrantyMonths: 0,
    serviceWarrantyMonths: 1,
    freeServices: 0,
    serviceIntervalDays: 150,
    adminNote:
      'Filter pe 1 saal ki warranty mat likhna — yeh consumable hai. 15-din defect window honest bhi hai aur safe bhi.',
  },
  {
    key: 'AMC_PLAN',
    label: 'AMC plan becha (saalana contract)',
    suitableFor: ['AMC'],
    terms: [
      'AMC period: bill pe likhi start date se 12 mahine tak.',
      'Shaamil: scheduled service visit (plan ke hisaab se), machine ki poori checking, TDS test, leakage check, aur service ka labour — poore saal free.',
      'Breakdown call: AMC period me visit charge nahi lagega.',
      'Shaamil nahi (jab tak plan me alag se likha na ho): filter, membrane, pump/motor, SMPS aur doosre spare parts ka daam. Inpe AMC grahak ko rate card se chhoot milti hai.',
      'Visit ke liye 24 ghante pehle phone/WhatsApp karein. Emergency call usi din attend karne ki koshish hogi.',
      'AMC ek hi machine ke liye hai jiska brand/model bill pe likha hai. Ghar badalne par Patna ke andar transfer free hai.',
      'AMC amount non-refundable hai. Expiry se 1 mahina pehle renewal reminder aayega.',
    ],
    partsWarrantyMonths: 0,
    serviceWarrantyMonths: 12,
    freeServices: 4,
    serviceIntervalDays: 90,
    adminNote:
      'Saaf likha hai ki parts shaamil nahi — warna AMC ghaate ka sauda ban jaata hai. Jo plan me filter cover karna ho, AMC record me "Filters covered" tick kar dein.',
  },
  {
    key: 'INSTALLATION_ONLY',
    label: 'Sirf installation (machine grahak ki apni)',
    suitableFor: ['INSTALLATION', 'SERVICE'],
    terms: [
      'Sirf installation ka kaam kiya gaya hai. Machine grahak ki apni hai — uspe hamari koi product warranty nahi.',
      `Installation workmanship (fitting, pipe joint, mounting, leakage) par ${SERVICE.warrantyDays} din ki warranty hai.`,
      'Hamare lagaye hue naye accessories (tap, pipe, elbow, adaptor) par 6 mahine ki warranty.',
      'Machine me pehle se koi kharaabi mili to bill pe alag se likhi gayi hai.',
      'Electrical point aur drain point customer ki taraf se hona chahiye.',
    ],
    partsWarrantyMonths: 6,
    serviceWarrantyMonths: 1,
    freeServices: 0,
    serviceIntervalDays: 90,
    adminNote:
      'Dusri dukaan se khareedi machine lagaane par yeh lein. Product warranty apne upar mat lena.',
  },
  {
    key: 'NO_WARRANTY',
    label: 'Koi warranty nahi (purana saaman / as-is)',
    suitableFor: ['SALE', 'SERVICE', 'OTHER'],
    terms: [
      'Yeh saaman/kaam "as-is" diya gaya hai. Ispe koi warranty ya guarantee nahi hai.',
      'Grahak ne saaman/kaam dekh kar accept kiya hai.',
      'Payment Terms: Full payment due on delivery.',
    ],
    partsWarrantyMonths: 0,
    serviceWarrantyMonths: 0,
    freeServices: 0,
    serviceIntervalDays: 0,
    adminNote: 'Second-hand ya refurbished item ke liye. Kam use hoga par likha hua hona chahiye.',
  },
] as const;

export const DEFAULT_TEMPLATE_BY_TYPE: Record<string, string> = {
  SALE: 'NEW_RO_DOMESTIC',
  SERVICE: 'REPAIR_SERVICE',
  AMC: 'AMC_PLAN',
  INSTALLATION: 'INSTALLATION_ONLY',
  OTHER: 'NO_WARRANTY',
};

export function getTemplate(key: string | null | undefined): WarrantyTemplate | undefined {
  if (!key) return undefined;
  return WARRANTY_TEMPLATES.find((t) => t.key === key);
}

export function templatesFor(type: string): WarrantyTemplate[] {
  return WARRANTY_TEMPLATES.filter((t) => (t.suitableFor as readonly string[]).includes(type));
}

/** Payment mode options — bill pe aur report me dono jagah yahi list chalti hai. */
export const PAYMENT_MODES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI / PhonePe / GPay' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK', label: 'Bank transfer / NEFT' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'PENDING', label: 'Abhi baaki hai' },
] as const;

export const BILL_TYPE_LABELS: Record<string, string> = {
  SALE: 'Machine bechi',
  SERVICE: 'Repair / Service',
  AMC: 'AMC plan',
  INSTALLATION: 'Installation',
  OTHER: 'Other',
};

export const BILL_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  UNPAID: 'Paisa baaki',
  PARTIAL: 'Aadha mila',
  PAID: 'Poora mila',
  CANCELLED: 'Cancel',
};
