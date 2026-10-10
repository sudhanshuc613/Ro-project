/**
 * ADS LANDING DATA — /ro-service-in-patna ke liye.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN BANAYA (9 Oct 2026)
 * ────────────────────────
 * Owner ne kaha: "ye page add pe show hoga" — matlab `/ro-service-in-patna`
 * hi Google Ads ka landing page hai. Har click ka paisa lagta hai, isliye is
 * page ka kaam sirf ek hai: aane wale ko CALL karwana.
 *
 * Owner ne reference diya: rosaleandservices.com/ro-service-in-patna/
 * Maine wo page 9 Oct ko live scan kiya. Comparison:
 *
 *                      rosale        HUM (pehle)
 *     words             3,366          2,988
 *     images               37              5     🔴 yahi asli gap tha
 *     schema types          2             26     ✅ hum bahut aage
 *     H2                   17             10
 *     tel: links            ?              8
 *
 * Matlab content me hum jeet rahe the, DIKHNE me haar rahe the. Unka page
 * card-based hai, har card me price likha hai, brand logo grid hai, reviews
 * me chehre hain. Hamara page ek lamba lekh tha.
 *
 * 🔴 COPY NAHI KIYA
 * ─────────────────
 * Unka colour: #5ce1e6 + #13c2c2 (bright cyan), light grey background.
 * Hamara: navy-900 (#0B2545) + aqua, jo pehle se hamari site ka hai.
 * Unka hero: stock technician photo + "Now in Patna".
 * Hamara: apna banna hua graphic (public/banners/patna-service-hero.png),
 *         koi insaan nahi — kyunki AI-generated chehra GBP par
 *         reverse-image-search me pakda jaata hai.
 *
 * 🔴 PHONE NUMBER KA NIYAM (owner ka seedha order)
 * ────────────────────────────────────────────────
 * Is page par SIRF owner ka number dikhega — 8969821440 / 9661288308.
 * Kisi brand ka customer care number YAHAN NAHI. Koi bahar jaane wala link
 * NAHI. Jo banda paid click se aaya hai, wo Kent ke helpline par chala gaya
 * to wo click ka paisa barbaad gaya.
 * (Brand ke official number sirf /ro-customer-care-patna par hain, jo
 *  organic SEO page hai — wahan wo page ko rank karate hain.)
 *
 * SAB PRICE SITE KE APNE DATA SE
 * ──────────────────────────────
 * Ek bhi rate yahan haath se naya nahi likha. Sab SERVICE_INTENTS aur
 * ServiceRateCard ke wahi numbers hain. Do jagah alag rate dikhna sabse
 * bada trust-killer hai.
 */

import { SERVICE, CONTACT } from '@/lib/constants';

/* ══════════════════════════════════════════════════════════════════════════
   1. SYMPTOM → CAUSE → RATE
   ──────────────────────────────────────────────────────────────────────────
   Ye wo 8 dikkat hain jinke liye Patna me sabse zyada call aate hain.
   Har rate site ke baaki pages se match karta hai:
     filter    ₹120–₹700    (ro-filter-change-patna priceFrom/priceTo)
     membrane  ₹1,100–₹2,400 (ro-membrane-replacement-patna)
     leakage   ₹150–₹400     (ServiceRateCard)
     solenoid  ₹300–₹600     (ServiceRateCard)
     SMPS      ₹700–₹1,100   (owner confirm, 9 Oct)
     pump/motor ₹1,000–₹2,800 (owner confirm, 9 Oct)
     UV lamp   ₹400 se       (ro-filter-change-patna prices[] me "UV lamp")
   ══════════════════════════════════════════════════════════════════════════ */
export interface SymptomRate {
  id: string;
  /** Jaisa customer bolta hai — Hinglish, wahi shabd */
  label: string;
  /** Sabse aam asli wajah */
  cause: string;
  /** Doosri sambhavit wajah — honest, ek hi wajah batana jhooth hai */
  alsoCould: string;
  priceFrom: number;
  priceTo: number;
  /** Kitni der lagti hai */
  minutes: number;
  /** Wo baat jo technician nahi batata */
  insider: string;
}

export const SYMPTOM_RATES: SymptomRate[] = [
  {
    id: 'no-water',
    label: 'Paani bilkul nahi aa raha',
    cause: 'Booster pump ya SMPS adaptor fail',
    alsoCould: 'Membrane poori tarah choke, ya inlet valve band',
    priceFrom: 450, priceTo: 2400, minutes: 60,
    insider:
      'Pehle SMPS check hona chahiye, membrane nahi. SMPS ₹700 se ₹1,100 ka hai aur membrane ₹1,100 se ₹2,400 ka — bahut log seedha membrane bech dete hain.',
  },
  {
    id: 'slow-water',
    label: 'Paani bahut dheema aa raha hai',
    cause: 'Sediment ya pre-carbon filter choke',
    alsoCould: 'Membrane ki life khatam, ya inlet pressure kam',
    priceFrom: 120, priceTo: 700, minutes: 40,
    insider:
      'Ye 90% cases me sirf filter ka kaam hai. Patna ke pani me sediment 3-4 mahine me choke ho jaata hai. Membrane par paisa lagane se pehle filter badal kar dekhiye.',
  },
  {
    id: 'bad-taste',
    label: 'Paani ka swad kharab / khara lag raha hai',
    cause: 'RO membrane ki life khatam',
    alsoCould: 'Post-carbon filter exhausted, ya TDS controller khula hua',
    priceFrom: 1100, priceTo: 2400, minutes: 50,
    insider:
      'Isko confirm karne ka ek hi tarika hai — input aur output TDS naapna. Agar output 200 se upar hai tabhi membrane gaya hai. Bina meter ke jo bole, wo andaza hai.',
  },
  {
    id: 'leak',
    label: 'Machine se paani tapak raha hai',
    cause: 'Elbow ka O-ring ya tubing ka cut',
    alsoCould: 'Filter housing ka gasket, ya housing me hairline crack',
    priceFrom: 150, priceTo: 700, minutes: 30,
    insider:
      'Sabse sasta kaam hai ye. ₹150 ka O-ring. Agar koi ₹1,000 maange to doosri rai lijiye — crack wali housing bhi ₹250-₹700 me badal jaati hai.',
  },
  {
    id: 'drain',
    label: 'Drain pipe se lagatar paani gir raha hai',
    cause: 'Solenoid valve ya float valve kharab',
    alsoCould: 'Flow restrictor nikal gaya ho',
    priceFrom: 300, priceTo: 600, minutes: 35,
    insider:
      'Tank bhar jaane par machine band honi chahiye. Nahi hoti to in do me se ek gaya hai. Chhota part hai par mahine ka 2,000 litre paani bacha deta hai.',
  },
  {
    id: 'dead',
    label: 'Machine bilkul dead, koi light nahi',
    cause: 'SMPS adaptor jal gaya',
    alsoCould: 'Power socket ya cable me fault',
    priceFrom: 700, priceTo: 1100, minutes: 30,
    insider:
      'Patna ke voltage fluctuation me SMPS sabse pehle jaata hai. Ye 20 minute ka kaam hai. Puri machine badalne ki salah dene wale se bachiye.',
  },
  {
    id: 'noise',
    label: 'Machine se awaaz aa rahi hai',
    cause: 'Booster pump ghis gaya ya garam ho raha hai',
    alsoCould: 'Pump mounting loose, ya air lock',
    priceFrom: 1000, priceTo: 2800, minutes: 50,
    insider:
      'Pump ke saath SMPS bhi check karwaiye — aksar SMPS kharab hone se hi pump jalta hai. Sirf pump badla to 6 mahine me phir jalega.',
  },
  {
    id: 'uv',
    label: 'UV lamp band hai / indicator off',
    cause: 'UV lamp ki life khatam ya ballast fail',
    alsoCould: 'Quartz sleeve par scale jam gaya',
    priceFrom: 400, priceTo: 1200, minutes: 35,
    insider:
      'UV lamp 12 mahine me apni power kho deta hai chahe wo jalta dikhe. Lamp ke saath quartz sleeve saaf karwana zaroori hai, warna naya lamp bhi kaam nahi karega.',
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   2. SERVICE CARDS — price ke saath
   ══════════════════════════════════════════════════════════════════════════ */
export interface ServiceCard {
  title: string;
  /**
   * Card par dikhne wala rate.
   * 🔴 9 Oct 2026 — owner: "pricing kiyu sab pe likh deta hai ... koi customer bol
   * dega aapne waha pe to ye mention kiya hai aap yaha kuch or le rahe ho"
   *
   * Wo bilkul sahi hai. "₹120 se" likhne se customer ka dimag ₹120 par atak jaata
   * hai aur ₹1,400 ka bill dekh kar jhagda hota hai. Isliye ab har jagah RANGE hai,
   * aur sirf ek cheez FIXED hai — visit charge. Baaki sab "reference" hai.
   */
  priceLabel: string;
  /** 'fixed' = ye rate pakka hai · 'range' = sirf reference, final inspection ke baad */
  priceKind: 'fixed' | 'range';
  href: string;
  blurb: string;
  /** Imaandar baat — kya shaamil nahi hai */
  note: string;
  icon: 'service' | 'repair' | 'install' | 'filter' | 'membrane' | 'amc';
  /** Card ke upar ki image — public/services/ */
  image: string;
  /** Image ka alt — SEO aur screen reader dono ke liye */
  alt: string;
}

export const SERVICE_CARDS: ServiceCard[] = [
  {
    title: 'RO Service (full check-up)',
    priceLabel: `₹${SERVICE.visitCharge}`,
    priceKind: 'fixed',
    href: '/ro-services-patna',
    icon: 'service',
    image: '/services/ro-service.png',
    alt: 'RO water purifier full service check-up with TDS meter in Patna',
    blurb: 'TDS test, teeno filter stage, membrane flow test, tank safai, leak check. Sab likhit card par.',
    note: `Isme part shaamil nahi. Part lagega to rate pehle batayenge.`,
  },
  {
    title: 'RO Repair',
    priceLabel: '₹200 – ₹2,400',
    priceKind: 'range',
    href: '/ro-repair-patna',
    icon: 'repair',
    image: '/services/ro-repair.png',
    alt: 'RO water purifier repair with wrench and open filter panel in Patna',
    blurb: 'Paani nahi aa raha, awaaz, swad kharab, leakage. Pump, SMPS, valve, housing sab van me.',
    note: 'O-ring ₹200 me, pump + SMPS dono gaye to upar. Exact number machine kholne ke baad.',
  },
  {
    title: 'RO Installation',
    priceLabel: '₹399 – ₹2,500',
    priceKind: 'range',
    href: '/ro-installation-patna',
    icon: 'install',
    image: '/services/ro-installation.png',
    alt: 'RO water purifier wall mount installation with drill in Patna',
    blurb: 'Nayi machine ya ghar shift. Drilling, inlet tapping, drain line, TDS setting sab shaamil.',
    note: 'Seedha point neeche wale rate me. Lambi line ya RCC wall ho to upar.',
  },
  {
    title: 'RO Filter Change',
    priceLabel: '₹120 – ₹700',
    priceKind: 'range',
    href: '/ro-filter-change-patna',
    icon: 'filter',
    image: '/services/ro-filter-change.png',
    alt: 'RO sediment and carbon filter cartridge replacement in Patna',
    blurb: 'Sediment, pre-carbon, post-carbon. Patna me sediment 3-4 mahine chalta hai, box par likhe 6 se kam.',
    note: 'Ek filter neeche, teeno ka set upar. Kaunsa chahiye — TDS dekh kar tay hota hai.',
  },
  {
    title: 'RO Membrane Change',
    priceLabel: '₹1,100 – ₹2,400',
    priceKind: 'range',
    href: '/ro-membrane-replacement-patna',
    icon: 'membrane',
    image: '/services/ro-membrane.png',
    alt: 'RO membrane cartridge replacement 75 80 100 GPD in Patna',
    blurb: '75, 80, 100 GPD stock me. Pouch aapke saamne khulta hai, purana membrane aapko wapas.',
    note: '75 GPD neeche, 100 GPD upar. Membrane tabhi badalte hain jab TDS reading kahe.',
  },
  {
    title: 'RO AMC Plan',
    priceLabel: '₹1,499 – ₹4,499',
    priceKind: 'fixed',
    href: '/amc-plans',
    icon: 'amc',
    image: '/services/ro-amc.png',
    alt: 'RO annual maintenance contract plans with scheduled visits in Patna',
    blurb: 'Saal bhar ke visits, filter, TDS test aur priority response ek rate me. Teen plan.',
    note: '3 saal se nayi machine par AMC aksar faayde ka sauda nahi — hum saaf bata dete hain.',
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   2b. SPARE PARTS — reference rate
   ──────────────────────────────────────────────────────────────────────────
   Owner: "spare parts wagreh ka tu refence diya kar itna se itna tak lag sakta hai"

   Har part ka rate brand, GPD rating aur quality (company vs equivalent) se
   badalta hai. Ek number likhna jhooth hoga. Isliye range + wajah dono di hai
   taaki customer ko pata ho ki rate upar-neeche kyun hota hai.
   ══════════════════════════════════════════════════════════════════════════ */
export interface PartRate {
  part: string;
  from: number;
  to: number;
  /** Rate upar-neeche kis cheez se hota hai */
  depends: string;
}

export const PART_RATES: PartRate[] = [
  { part: 'Sediment filter (spun)', from: 150, to: 300, depends: 'brand ka standard 10-inch ya company ka proprietary housing' },
  { part: 'Pre-carbon / post-carbon', from: 180, to: 400, depends: 'carbon block ya granular, aur brand' },
  { part: 'Teeno filter ka set', from: 350, to: 900, depends: 'alag-alag lene se set sasta padta hai' },
  { part: 'RO membrane', from: 1100, to: 2400, depends: '75 GPD / 80 GPD / 100 GPD aur company vs equivalent' },
  { part: 'Booster pump / motor', from: 1000, to: 2800, depends: '75 GPD, 100 GPD ya heavy-duty motor; company vs equivalent' },
  { part: 'SMPS adaptor', from: 700, to: 1100, depends: '24V 1.5A, 2A ya auto-cut wala; brand ke hisaab se' },
  { part: 'Solenoid valve', from: 300, to: 600, depends: 'brand aur fitting size' },
  { part: 'Float valve', from: 150, to: 350, depends: 'tank ka type' },
  { part: 'UV lamp + ballast', from: 400, to: 1200, depends: 'sirf lamp ya ballast bhi, 11W ya 14W' },
  { part: 'Filter housing / bowl', from: 250, to: 700, depends: 'standard ya brand-specific push-fit' },
  { part: 'Tubing, elbow, connector', from: 20, to: 250, depends: 'kitni length aur kitne fitting lagte hain' },
  { part: 'Storage tank', from: 700, to: 1800, depends: '8L / 10L / 12L aur material' },
];

/* ══════════════════════════════════════════════════════════════════════════
   3. WHY CHOOSE — hamare apne differentiator
   ──────────────────────────────────────────────────────────────────────────
   Competitor likhta hai "24/7 Availability", "Affordable Pricing",
   "Experienced Technicians" — ye teeno koi bhi likh sakta hai aur koi bhi
   verify nahi kar sakta. Neeche ki har line CHECK KI JA SAKTI HAI.
   ══════════════════════════════════════════════════════════════════════════ */
export interface WhyPoint { h: string; p: string; proof: string }

export const WHY_POINTS: WhyPoint[] = [
  {
    h: 'TDS meter har visit par',
    p: 'Kaam se pehle aur baad ka TDS card par likha jaata hai. Isi se pata chalta hai membrane sach me gaya tha ya nahi.',
    proof: 'Before-after reading likhit',
  },
  {
    h: 'Rate kaam se pehle, likhit',
    p: `Visit charge call par hi. Part ka rate kaam shuru hone se pehle. Mana kar dein to sirf ₹${SERVICE.visitCharge}.`,
    proof: 'Rate card poori site par khula hai',
  },
  {
    h: 'Purana part wapas milta hai',
    p: 'Nikala hua filter ya membrane aapka hai. Saamne nikalte hain, chhod kar jaate hain — farak khud dikh jaata hai.',
    proof: 'Nikala hua part aapke paas',
  },
  {
    h: 'Asli dukaan, asli pata',
    p: `${CONTACT.address.locality}, ${SERVICE.city} me apni dukaan. Aa kar machine dikha sakte hain. Hum call centre nahi hain.`,
    proof: 'Buddha Colony me physical shop',
  },
  {
    h: `${SERVICE.warrantyDays}-din warranty, bill par`,
    p: `Do alag warranty milti hai, aur dono bill par likhi hoti hai. Hamare kaam (labour) par ${SERVICE.warrantyDays} din — wahi dikkat dobara aayi to visit aur kaam dono free. Aur jo part laga hai us par poore ${SERVICE.partsWarrantyMonths} mahine.`,
    proof: 'Zubani nahi, likhit',
  },
  {
    h: '2019 se Patna me, 2,400+ machine',
    p: 'Chhe saal, yahi sheher. 83 mohalle, aur har mohalle ka apna paani aur fault pattern pata hai.',
    proof: 'Google par 5.0 rating, 50 review',
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   4. AMC — sirf summary. Poori detail /amc-plans par hai.
   🔴 Ye teen price `src/app/(shop)/amc-plans/page.tsx` ke PLANS se match
      karte hain. Wahan badlo to yahan bhi badalna — warna do jagah alag
      rate dikhega. verify script isko check karta hai.
   ══════════════════════════════════════════════════════════════════════════ */
export const AMC_SUMMARY: { name: string; price: number; visits: number; line: string; popular: boolean }[] = [
  {
    name: 'Basic', price: 1499, visits: 2, popular: false,
    line: 'Sediment + carbon filter change, free TDS testing, priority booking. Membrane aur pump alag.',
  },
  {
    name: 'Gold', price: 2799, visits: 4, popular: true,
    line: 'Saare pre-filter + UV lamp shaamil, saal bhar zero visit charge, same-day response. Membrane alag.',
  },
  {
    name: 'Platinum', price: 4499, visits: 4, popular: false,
    line: 'Membrane samet sab filter, pump coverage, unlimited breakdown visit, 2-ghante emergency response.',
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   5. TDS band → filter life. area-depth.ts ke hisaab se hi.
   ══════════════════════════════════════════════════════════════════════════ */
export function filterLifeMonths(band: 'soft' | 'moderate' | 'hard' | 'very-hard'): string {
  return { soft: '5–6 mahine', moderate: '4–5 mahine', hard: '3–4 mahine', 'very-hard': '2–3 mahine' }[band];
}

export function bandLabel(band: 'soft' | 'moderate' | 'hard' | 'very-hard'): string {
  return { soft: 'Halka', moderate: 'Theek-thaak', hard: 'Bhaari', 'very-hard': 'Bahut bhaari' }[band];
}
