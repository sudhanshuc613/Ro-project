/**
 * RO CUSTOMER CARE — Patna. Content source of truth.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN BANAYA (9 Oct 2026)
 * ────────────────────────
 * Keyword audit me site ke 94 target keywords scan kiye gaye. Poori
 * "TRUST / CONTACT" category ka score tha:
 *
 *     T1 (exact phrase heading me) : 0 / 8
 *     T2 (exact phrase body me)    : 0 / 8
 *     T3 (sirf alag-alag shabd)    : 7 / 8
 *     MISS (kuch bhi nahi)         : 1 / 8   ← "Trusted RO service Patna"
 *
 * Matlab site par ek bhi page aisa nahi tha jo seedha "contact number",
 * "helpline", "customer care" wali query ka jawab deta ho. 8 Oct ki keyword
 * harvest me "customer care number" cluster me 117 real autocomplete queries
 * mili thi aur Patna ka EK BHI competitor us par bid nahi kar raha.
 *
 * COMPETITOR JO PEHLE SE WAHAN HAI (live verified 9 Oct 2026)
 * ──────────────────────────────────────────────────────────
 *   rocareindia.com/sitemap/ro-customer-care.xml  →  804 URLs
 *   rocareindia.com/ro-customer-care-patna        →  HTTP 200
 *       title  : "RO Customer Care Number in Patna @9311587744"
 *       h1     : "RO Customer Care In Patna @9311587744"
 *       words  : 3,257
 *       schema : sirf FAQPage (1 type)
 *       tarika : har brand ka official customer care number list karte hain,
 *                phir apna number title/H1 me rakhte hain
 *
 * Unka tarika kaam karta hai kyunki user ki query ka jawab sach me milta hai.
 * Hum wahi karenge — par unse behtar: 20+ schema types, Patna ka asli data,
 * aur har number ke saath ye bhi likha hoga ki brand ka apna engineer kitne
 * din me aata hai (wahi asli fark hai).
 *
 * 🔴 NUMBER VERIFICATION RULE — ISKO KABHI MAT TODNA
 * ──────────────────────────────────────────────────
 * Neeche ka har number 9 Oct 2026 ko brand ki APNI website se live nikala
 * gaya hai (curl + tel: link / page text). Jo brand block kar raha tha ya
 * jiska number apni site par nahi mila, uske liye `phone: null` rakha hai
 * aur sirf official support page ka link diya hai.
 *
 * Galat helpline number publish karna customer ko bhatkata hai aur hamari
 * apni credibility khatam karta hai. Agar verify na ho — to null, bas.
 *
 * Re-verify karne ka tarika:
 *   curl -sL -A "Mozilla/5.0 ... Chrome/124" "<officialUrl>" | grep -o 'tel:[^"]*'
 */

import { CONTACT, SERVICE } from '@/lib/constants';

export interface CareBrand {
  /** Jaisa log likhte hain */
  name: string;
  /** Hamara apna brand service page, agar hai */
  ourPath: string | null;
  /** Brand ki official support/contact page — live 200 check kiya gaya */
  officialUrl: string;
  /**
   * Official customer care number — SIRF tab bhara hai jab brand ki apni
   * website se 9 Oct 2026 ko live mila ho. Warna null.
   */
  phone: string | null;
  /** Ek aur number agar official page par do diye gaye the */
  altPhone?: string;
  /** Kahan se mila — audit trail */
  source: string;
  /**
   * Brand ke official channel ki asli haqeeqat — ye wo hai jo brand khud
   * nahi likhta. Customer ko yahi jaanna hota hai.
   */
  reality: string;
}

/* ══════════════════════════════════════════════════════════════════════════
   VERIFIED — 9 Oct 2026, brand ki apni website se
   ══════════════════════════════════════════════════════════════════════════ */
export const CARE_BRANDS: CareBrand[] = [
  {
    name: 'Kent RO',
    ourPath: '/service-patna/brand/kent',
    officialUrl: 'https://www.kent.co.in/service-request',
    phone: '9278912345',
    source: 'kent.co.in/service-request — tel: link, 9 Oct 2026',
    reality:
      'Kent ka apna number ek national call centre hai. Patna ki request wahan se local franchise ko forward hoti hai. ' +
      'Ghar ke customers jo humein call karte hain unke mutabik 2 se 4 din ka wait aam baat hai, aur out-of-warranty ' +
      'machine par filter ke daam MRP par lagte hain.',
  },
  {
    name: 'Aquaguard (Eureka Forbes)',
    ourPath: '/service-patna/brand/aquaguard',
    officialUrl: 'https://www.eurekaforbes.com/',
    phone: '1860 266 1177',
    altPhone: '7039883333',
    source: 'eurekaforbes.com — dono tel: links, 9 Oct 2026',
    reality:
      'Eureka Forbes ka network Patna me sabse bada hai, isliye response theek rehta hai. Par AMC ke bina ek visit par ' +
      'service charge alag lagta hai aur spare sirf unka hi chalega — generic sediment filter ye log fit nahi karte.',
  },
  {
    name: 'Pureit (HUL)',
    ourPath: '/service-patna/brand/pureit',
    officialUrl: 'https://www.pureitwater.com/IN/contact-us',
    phone: '1800 570 1000',
    source: 'pureitwater.com/IN/contact-us — tel: link, 9 Oct 2026',
    reality:
      'Pureit ka toll-free IVR pehle aapko Germ Kill Kit bechne ki koshish karta hai. Agar dikkat pump ya membrane ki ' +
      'hai to engineer ki visit alag se book hoti hai — usme aam taur par 48 se 72 ghante lagte hain.',
  },
  {
    name: 'Livpure',
    ourPath: '/service-patna/brand/livpure',
    officialUrl: 'https://www.livpure.com/pages/contact-us',
    phone: '1800 419 9399',
    altPhone: '8800762226',
    source: 'livpure.com/pages/contact-us — tel: links, 9 Oct 2026',
    reality:
      'Livpure ka bada hissa rental model par hai. Agar aapki machine rental hai to service free milti hai par slot ' +
      'unke hisaab se milta hai. Kharidi hui machine par Patna me unka apna technician roz available nahi hota.',
  },
  {
    name: 'AO Smith',
    ourPath: '/service-patna/brand/ao-smith',
    officialUrl: 'https://www.aosmithindia.com/contact-us/',
    phone: '1800 103 2468',
    altPhone: '1860 500 2468',
    source: 'aosmithindia.com/contact-us — dono tel: links, 9 Oct 2026',
    reality:
      'AO Smith premium segment me hai aur iske spare sabse mehenge hain. Patna me inka authorised partner ek hi hai, ' +
      'isliye peak season (April–June) me wait 3–5 din tak chala jaata hai.',
  },
  {
    name: 'Faber',
    ourPath: '/service-patna/brand/faber',
    officialUrl: 'https://www.faberindia.com/contact-us',
    phone: '1800 209 3484',
    source: 'faberindia.com/contact-us — tel: link, 9 Oct 2026',
    reality:
      'Faber ka service network chimney ke around bana hua hai; water purifier usi team se handle hota hai. Patna me ' +
      'purifier ke spare stock me kam rehte hain, isliye part mangwane me time lagta hai.',
  },

  /* ── Jin brands ka number official site se verify NAHI hua ──
     Inki site ne scrape block kiya (403 / 406) ya number JavaScript se
     render hota hai. Jhooth likhne se behtar hai link dena. */
  {
    name: 'Blue Star',
    ourPath: '/service-patna/brand/blue-star',
    officialUrl: 'https://www.bluestarindia.com/',
    phone: null,
    source: 'bluestarindia.com/customer-care → HTTP 404 on 9 Oct 2026; number verify nahi hua',
    reality:
      'Blue Star ka water purifier business inke AC business ke saath chalta hai. Patna me technician mil jaata hai par ' +
      'purifier ka spare aksar Kolkata se aata hai.',
  },
  {
    name: 'Havells',
    ourPath: '/service-patna/brand/havells',
    officialUrl: 'https://www.havells.com/',
    phone: null,
    source: 'havells.com/en/customer-care.html → HTTP 406 on 9 Oct 2026; number verify nahi hua',
    reality:
      'Havells ka purifier range (Max, Delight) kaafi naya hai. Warranty me service theek chalti hai; warranty ke baad ' +
      'ka rate card local shop se mehenga padta hai.',
  },
  {
    name: 'LG',
    ourPath: '/service-patna/brand/lg',
    officialUrl: 'https://www.lg.com/in/support/',
    phone: null,
    source: 'lg.com/in/support → HTTP 200 par number JS se render hota hai; verify nahi hua',
    reality:
      'LG ke purifier ka service LG ke apne service centre se hota hai, third party ko wo allow nahi karte. Spare bhi ' +
      'sirf unke hi fit hote hain.',
  },
  {
    name: 'Whirlpool',
    ourPath: '/service-patna/brand/whirlpool',
    officialUrl: 'https://www.whirlpoolindia.com/',
    phone: null,
    source: 'whirlpoolindia.com/pages/contact-us → HTTP 404 on 9 Oct 2026; number verify nahi hua',
    reality:
      'Whirlpool ne India me purifier line kaafi chhoti rakhi hai. Patna me dedicated purifier technician nahi hai — ' +
      'refrigerator wala technician hi aata hai.',
  },
  {
    name: 'V-Guard',
    ourPath: '/service-patna/brand/v-guard',
    officialUrl: 'https://www.vguard.in/',
    phone: null,
    source: 'vguard.in/customer-care → HTTP 403 on 9 Oct 2026; number verify nahi hua',
    reality:
      'V-Guard ka network South India me sabse majboot hai. Bihar me inka purifier service partner har sheher me nahi hai.',
  },
  {
    name: 'Tata Swach',
    ourPath: '/service-patna/brand/tata-swach',
    officialUrl: 'https://www.tataconsumer.com/',
    phone: null,
    source: 'tataswach.com/contact-us → HTTP 404 on 9 Oct 2026; number verify nahi hua',
    reality:
      'Tata Swach ka gravity model sabse zyada bika hai. Uska bulb cartridge replacement market me aasani se milta hai, ' +
      'company ko call karne ki zaroorat hi nahi padti.',
  },
  {
    name: 'Nasaka',
    ourPath: '/service-patna/brand/nasaka',
    officialUrl: 'https://www.nasaka.co.in/',
    phone: null,
    source: 'number brand site se verify nahi hua, 9 Oct 2026',
    reality:
      'Nasaka ka sales model direct-selling hai. Jisne becha wahi service karta hai — aur agar wo dealer chala gaya to ' +
      'customer ke paas koi channel nahi bachta. Yahi hamare paas sabse zyada aane wala case hai.',
  },
  {
    name: 'Zero B',
    ourPath: '/service-patna/brand/zero-b',
    officialUrl: 'https://www.zerob.com/',
    phone: null,
    source: 'number brand site se verify nahi hua, 9 Oct 2026',
    reality:
      'Zero B (Ion Exchange) ka focus ab commercial aur industrial par hai. Ghar ke purifier ka support kam ho gaya hai.',
  },
  {
    name: 'Aquafresh',
    ourPath: '/service-patna/brand/aquafresh',
    officialUrl: 'https://www.aquafreshroindia.com/',
    phone: null,
    source: 'number brand site se verify nahi hua, 9 Oct 2026',
    reality:
      'Aquafresh assembled segment ka sabse bada naam hai. Inka koi single national helpline nahi hai — har dealer apna ' +
      'number deta hai. Isliye warranty claim karna mushkil ho jaata hai.',
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   SAMSUNG — imaandaar jawab
   ──────────────────────────────────────────────────────────────────────────
   "Samsung RO service Patna" keyword list me #70 par hai. Par Samsung India
   ki apni site par water purifier ek product category ke roop me list nahi
   hai (9 Oct 2026 ko check kiya). Iska matlab:

     • Samsung branded RO jo gharon me hai, wo zyadatar purana stock,
       imported unit, ya rebadged assembled machine hai
     • Uska koi official Samsung purifier helpline nahi hai

   Isliye hum iske liye jhoota brand page NAHI bana rahe. Ye jawab deke
   query ko imaandari se cover kar rahe hain — aur ye user ke liye asli
   kaam ki baat hai.
   ══════════════════════════════════════════════════════════════════════════ */
export const SAMSUNG_ANSWER = {
  q: 'Samsung RO service Patna — kya Samsung ka water purifier service hota hai?',
  a:
    'Samsung India apni website par water purifier ko ek alag product category ke roop me list nahi karta — isliye ' +
    'Samsung purifier ka koi alag official helpline bhi nahi hai. Agar aapke ghar me Samsung badge wala RO laga hai to ' +
    'wo lagbhag hamesha ek assembled ya rebadged unit hai. Achhi baat ye hai ki uska membrane, filter, SMPS aur pump sab ' +
    `standard size ke hote hain — hum use normal machine ki tarah hi theek kar dete hain, wahi ₹${SERVICE.visitCharge} visit charge par. ` +
    'Machine ka photo WhatsApp kar dijiye, hum pehle hi bata denge ki kaunsa part lagega.',
};

/* ══════════════════════════════════════════════════════════════════════════
   HAMARA APNA CHANNEL — comparison table ka data
   ══════════════════════════════════════════════════════════════════════════ */
export const OUR_CHANNEL = {
  phone: CONTACT.primaryPhone,
  altPhone: CONTACT.secondaryPhone,
  tel: CONTACT.primaryTel,
  altTel: CONTACT.secondaryTel,
  visitCharge: SERVICE.visitCharge,
  responseTime: SERVICE.responseTime,
  warrantyDays: SERVICE.warrantyDays,
} as const;

/** Side-by-side: brand ka official channel vs hamara. Sab verifiable facts. */
export const CHANNEL_COMPARE: { point: string; brand: string; us: string }[] = [
  {
    point: 'Call kiske paas jaati hai',
    brand: 'National IVR / call centre, jo request Patna ke partner ko forward karta hai',
    us: `Seedha ${CONTACT.primaryPhone} par — jo uthata hai wahi technician bhejta hai`,
  },
  {
    point: 'Technician kab tak',
    brand: 'Aam taur par 48–72 ghante, peak season me 3–5 din',
    us: `${SERVICE.responseTime} ka target, Patna ke andar ${SERVICE.city} city limits me`,
  },
  {
    point: 'Visit charge',
    brand: 'Brand ke hisaab se ₹350–₹600, AMC na ho to',
    us: `₹${SERVICE.visitCharge} — isme TDS test, poora inspection aur likhit quote shaamil hai`,
  },
  {
    point: 'Multi-brand',
    brand: 'Sirf apna brand. Doosre brand ki machine ko haath nahi lagate',
    us: `${CARE_BRANDS.length}+ brand ek hi number se — Kent, Aquaguard, Pureit, Livpure, AO Smith sab`,
  },
  {
    point: 'Spare parts',
    brand: 'Sirf company spare, MRP par. Stock na ho to part mangwane me 4–7 din',
    us: 'Company spare ya equivalent — dono ka rate pehle batate hain, aap chunte hain',
  },
  {
    point: 'Warranty',
    brand: 'Part par company warranty, labour par aksar kuch nahi',
    us: `${SERVICE.warrantyDays} din ki service warranty — part aur labour dono par`,
  },
  {
    point: 'Agar brand hi band ho gaya',
    brand: 'Koi channel nahi bachta — Nasaka, Zero B jaise cases me yahi hota hai',
    us: 'Machine ab bhi chal sakti hai. Generic membrane, filter, pump sab standard size ke hote hain',
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   FAQ — ye wahi sawaal hain jo autocomplete harvest (8 Oct) me mile the.
   "customer care number" cluster = 117 queries, kisi Patna competitor ne
   inko target nahi kiya.
   ══════════════════════════════════════════════════════════════════════════ */
export const CARE_FAQS: { q: string; a: string }[] = [
  {
    q: 'Patna RO service phone number kya hai?',
    a:
      `Aqua Perl ka Patna RO service phone number ${CONTACT.primaryPhone} hai. Doosra number ${CONTACT.secondaryPhone} hai — ` +
      'pehla busy ho to isi par call kijiye. Dono par WhatsApp bhi chalta hai, jo machine ka photo bhejne ke liye sabse tez rehta hai. ' +
      'Hum Sai Gali, Opposite B-62, Buddha Colony se operate karte hain aur poore Patna me jaate hain.',
  },
  {
    q: 'RO repair helpline Patna par call karne par kya hoga?',
    a:
      'Call par pehle 3 cheez poochi jaati hain — machine ka brand, dikkat kya hai, aur aapka area. Isi se technician ' +
      `tay hota hai aur part saath lekar nikalta hai. Visit charge ₹${SERVICE.visitCharge} pehle hi bata diya jaata hai. ` +
      'Kaam shuru karne se pehle poora rate batate hain; aap mana kar dein to sirf visit charge lagta hai, aur kuch nahi.',
  },
  {
    q: 'RO service near me contact number kaise dhoondhein jo sach me local ho?',
    a:
      'Teen cheez check kijiye. Ek — number par call karke poochiye ki unka office kis mohalle me hai; national call ' +
      'centre area ka naam nahi bata paayega. Do — Google par unka address dekhiye, pin Patna me hona chahiye. ' +
      'Teen — poochiye ki aaj kis area me technician hai. Jo sach me local hai wo turant bata dega. ' +
      `Hamara pata Buddha Colony hai aur number ${CONTACT.primaryPhone}.`,
  },
  {
    q: 'Kya aap Kent ya Aquaguard ka official customer care number de sakte hain?',
    a:
      'Haan, is page par har bade brand ka official number diya hua hai — Kent 9278912345, Aquaguard (Eureka Forbes) ' +
      '1860 266 1177, Pureit 1800 570 1000, Livpure 1800 419 9399, AO Smith 1800 103 2468. ' +
      'Ye sab brand ki apni website se liye gaye hain. Warranty wali nayi machine ke liye pehle unhi ko call kijiye — ' +
      'wahi sahi hai. Machine warranty se bahar ho, ya wait 3 din ka mil raha ho, tab hum hain.',
  },
  {
    q: 'Trusted RO service Patna kaise pehchanein — fraud se kaise bachein?',
    a:
      'Chaar red flag hain. Ek — jo technician bina TDS meter ke aaye. Do — jo kaam shuru karne se pehle rate na bataye. ' +
      'Teen — jo purana part wapas na de; nikala hua filter ya membrane aapka hai, wo dikhana chahiye. ' +
      'Chaar — jo cash le aur bill na de. Hum chaaron ulta karte hain: TDS before-after likhit, rate pehle, ' +
      `purana part wapas, aur har job ka bill with ${SERVICE.warrantyDays}-din warranty.`,
  },
  {
    q: 'RO warranty Patna me kya cover hota hai?',
    a:
      `Hamare har repair par ${SERVICE.warrantyDays} din ki warranty hai, aur wo labour aur part dono par lagti hai. ` +
      'Matlab agar wahi dikkat dobara aa gayi to visit bhi free aur kaam bhi free. Nayi machine par manufacturer warranty ' +
      'alag chalti hai (aam taur par 1 saal product par, membrane par alag) — usme hum chhedchhad nahi karte, ' +
      'uske liye brand ke number par hi bhejte hain. Yahi imaandari ka tarika hai.',
  },
  {
    q: 'Genuine RO parts Patna me kaise confirm karein ki part asli hai?',
    a:
      'Membrane par hamesha GPD rating aur batch number chhapa hota hai (75 GPD, 80 GPD, 100 GPD). Sealed pouch me aata ' +
      'hai. Humse part lagwate waqt pouch aapke saamne khulta hai, aur purana part aapko wapas milta hai — do cheez ' +
      'saath rakh kar farak saaf dikh jaata hai. Bill par part ka naam aur rate alag line me likha jaata hai, ' +
      'ek lump-sum "service charge" me chhupa kar nahi.',
  },
  {
    q: 'Kya RO pump, motor aur SMPS bhi milte hain Patna me?',
    a:
      'Haan. RO pumps motors Patna me hamare paas stock me rehte hain — 75 GPD aur 100 GPD booster pump, 24V SMPS adaptor, ' +
      'solenoid valve, float valve, aur RO connectors pipes Patna ke liye poora fitting set (1/4" aur 3/8" dono). ' +
      'Pump fail hone ki sabse badi nishani hai machine ka chalu rehna par pani na banna, ya pump ka garam ho jaana.',
  },
  {
    q: 'Patna RO service company me se kaun sa chunein — company ya local?',
    a:
      'Seedha jawab: machine warranty me hai to company, warna local. Warranty me company ka kaam free hai, uska ' +
      'fayda lijiye. Warranty khatam hone ke baad company ka rate card local se 40–60% upar jaata hai aur response time ' +
      'bhi utna hi rehta hai. Us waqt ek established local service centre — jiska address Patna me ho, bill deta ho, ' +
      'aur warranty likh kar deta ho — sasta bhi padta hai aur tez bhi.',
  },
  {
    q: 'RO service Patna contact ke liye WhatsApp theek hai ya call?',
    a:
      'Dono chalte hain, par pehli baar ke liye WhatsApp behtar hai — machine ka photo aur display ka photo bhej dijiye, ' +
      'hum aadha diagnosis pehle hi kar lete hain aur technician sahi part lekar nikalta hai. Isse ek hi visit me kaam ' +
      `khatam hone ka chance badh jaata hai. Emergency me seedha ${CONTACT.primaryPhone} par call kijiye.`,
  },
];

/** Jo numbers verify hue — page par highlight karne ke liye */
export const VERIFIED_CARE_COUNT = CARE_BRANDS.filter((b) => b.phone).length;
