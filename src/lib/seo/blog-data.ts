/**
 * BLOG CONTENT — the E-E-A-T gap.
 * ────────────────────────────────────────────────────────────────────────────
 * Measured 3 Sep 2026: the competitor ranking #1 for "ro repair patna" ships
 * Article schema AND Person schema. We shipped neither, and /blog returned 404.
 *
 * Person schema is the machine-readable form of "a real, named expert wrote
 * this". Google weights that heavily under E-E-A-T, and water quality is a
 * YMYL topic (Your Money or Your Life — it affects health), where the bar for
 * demonstrated expertise is highest.
 *
 * Every post below is written from work actually done in Patna: real TDS
 * numbers we measure, real failure patterns, real prices. That is the whole
 * point — a generic "5 tips for RO maintenance" post adds nothing that a
 * thousand other sites do not already have. What no one else has is eight
 * years of Patna-specific service data.
 *
 * Pure data. No DB, no imports beyond constants. Safe anywhere.
 */
import { SERVICE, CONTACT } from '@/lib/constants';

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  /** Concrete, checkable credentials. Vague claims weaken E-E-A-T. */
  credentials: string[];
  yearsExperience: number;
  image?: string;
}

export const AUTHOR: Author = {
  slug: 'sudhanshu-choudhary',
  name: 'Sudhanshu Choudhary',
  role: 'Founder & Lead RO Technician, Aqua Perl',
  bio:
    `Sudhanshu Patna me 2019 se RO purifier theek kar rahe hain. Aaj tak 2,400 se zyada units par kaam ho chuka hai — Kankarbagh ke hard-water borewell se lekar Danapur Cantonment ki treated supply tak. Aqua Perl ki shuruaat isi soch se hui thi ki Patna me RO service ka rate transparent hona chahiye: visit charge ₹${SERVICE.visitCharge}, aur part badalne se pehle customer ki permission.`,
  credentials: [
    'Patna me 2019 se RO service — 2,400+ units',
    'Kent, Aquaguard, Pureit, Livpure, AO Smith sabhi brands par kaam',
    'Domestic RO se lekar 1000 LPH commercial plant tak',
    '55 Patna localities me service network',
    'Google par 5.0★ rating, 50 verified reviews',
  ],
  yearsExperience: new Date().getFullYear() - 2019,
};

export interface BlogPost {
  slug: string;
  title: string;
  /** ≤158 chars — anything longer is cut in the SERP. */
  description: string;
  /** ISO date. Freshness is a ranking signal; keep these honest. */
  published: string;
  updated: string;
  readMinutes: number;
  category: 'Guide' | 'Troubleshooting' | 'Pricing' | 'Water Quality';
  /** When true the page also ships HowTo schema. */
  howTo?: { name: string; steps: { name: string; text: string }[]; totalTime: string };
  keywords: string[];
  /** Rendered as sections. `body` accepts plain paragraphs only. */
  sections: { heading: string; body: string[]; list?: string[] }[];
  faqs: { q: string; a: string }[];
}

export const BLOG_POSTS: BlogPost[] = [
  /* ══════════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-membrane-kab-badalna-chahiye',
    title: 'RO Membrane Kab Badalna Chahiye — Patna Ka Sach',
    description:
      'RO membrane kab badalna hai? TDS reading se pata karo, dukaandar ke kehne par nahi. Patna ke asli numbers, asli rate, aur 3 test jo aap khud kar sakte ho.',
    published: '2026-09-03',
    updated: '2026-09-03',
    readMinutes: 6,
    category: 'Guide',
    keywords: [
      'ro membrane kab badle', 'ro membrane replacement time',
      'ro membrane price patna', 'tds kitna hona chahiye',
      'ro membrane life', 'membrane change karna hai',
    ],
    howTo: {
      name: 'RO membrane check karne ka tarika',
      totalTime: 'PT5M',
      steps: [
        { name: 'Input TDS naapo', text: 'TDS meter ko seedha nal ke paani me daalo (purifier se pehle wala). Reading note karo.' },
        { name: 'Output TDS naapo', text: 'Ab purifier ke tap se ek glass bharo aur usme meter daalo. Ye reading bhi note karo.' },
        { name: 'Rejection nikalo', text: 'Formula: (input − output) ÷ input × 100. Agar 90% se upar hai to membrane theek hai.' },
        { name: 'Faisla karo', text: 'Rejection 75% se neeche gir gaya, ya output TDS apni original reading se 60-70 ppm upar chala gaya — tab membrane badlo.' },
      ],
    },
    sections: [
      {
        heading: 'Sabse pehle: 18-24 mahine wala rule adhoora hai',
        body: [
          'Har dukaandar yahi bolega — "membrane 1 saal me badalna padta hai". Ye poora sach nahi hai. Membrane ki umar calendar se nahi, aapke paani ke TDS se tay hoti hai.',
          `Hamare Patna ke service record se: Boring Road aur Buddha Colony jaise municipal supply wale area me (TDS 250–500 ppm) membrane 24 mahine aaram se chalta hai. Wahi membrane Beur me, jahan TDS 700–1300 ppm tak jata hai, 10-12 mahine me thak jata hai.`,
          'Matlab: agar aap Kankarbagh me rehte ho aur koi bole "saal bhar ho gaya, badal do" — pehle TDS check karwao. Aur agar aap Boring Road me ho aur 2 saal ho gaye hain par paani ka swaad theek hai, to shayad abhi zaroorat nahi.',
        ],
      },
      {
        heading: 'Patna ke area-wise asli TDS (hamare service book se)',
        body: [
          'Ye numbers hum khud har visit par naapte hain. Aapke ghar ka number thoda alag ho sakta hai, par range yahi rehti hai:',
        ],
        list: [
          'Beur — 700 se 1300 ppm (Patna me sabse zyada). Membrane 10-12 mahine.',
          'Kankarbagh, Bhootnath Road — 450 se 900 ppm. Membrane 14-18 mahine.',
          'Agamkuan, Gulzarbagh — 400 se 850 ppm, saath me iron. Membrane 12-16 mahine.',
          'Rajendra Nagar, Kadamkuan — 380 se 750 ppm. Membrane 16-20 mahine.',
          'Boring Road, Buddha Colony — 250 se 500 ppm. Membrane 20-24 mahine.',
          'Exhibition Road, Fraser Road — 220 se 420 ppm (municipal). Membrane 24 mahine.',
          'Danapur Cantonment — 280 se 550 ppm, par chlorine hai. Yahan carbon filter zyada zaroori hai.',
        ],
      },
      {
        heading: 'Teen test jo aap khud kar sakte ho',
        body: [
          'TDS meter Amazon par ₹250-400 me mil jata hai. Ek baar khareed lo, saalon chalega. Ye teen cheezein khud check karo:',
        ],
        list: [
          'Test 1 — TDS rejection: input aur output naapo. 90% se upar = badhiya. 75% se neeche = membrane gaya.',
          'Test 2 — Output TDS ka badlaav: installation ke waqt jo output TDS tha, usse 60-70 ppm upar chala gaya to membrane thak raha hai.',
          'Test 3 — Bharne ka time: tank pehle 40 minute me bharta tha, ab 2 ghante lagte hain? Ye membrane ya pre-filter dono ho sakta hai — pehle pre-filter badal ke dekho, sasta hai.',
        ],
      },
      {
        heading: 'Membrane badalne se pehle ye 3 cheez check karo',
        body: [
          'Sabse mehngi galti jo hum roz dekhte hain: SMPS kharab hai aur customer se membrane ka paisa liya gaya.',
          'Agar paani bilkul nahi aa raha aur pump ki koi awaaz nahi — ye SMPS ya adaptor hai, membrane nahi. Membrane ₹1,100 ka hai, SMPS ₹450 ka. Farak dekh lo.',
          'Agar pump chal raha hai par paani patla-patla aa raha hai — pre-filter choke hai. ₹150 ka kaam hai.',
          'Membrane sirf tab badlo jab flow theek ho par TDS badh gaya ho. Yahi ek pakka signal hai.',
        ],
      },
      {
        heading: 'Patna me membrane ka sahi rate (Sep 2026)',
        body: [
          'Rate transparent hona chahiye. Ye market rate hai, hamara bhi yahi hai:',
        ],
        list: [
          '75 GPD membrane — ₹650 se ₹1,200 (aam ghar ke liye yahi kaafi hai)',
          '80 GPD membrane — ₹750 se ₹1,400 (Beur, Kankarbagh jaise high TDS area)',
          '100 GPD membrane — ₹1,000 se ₹1,800 (sirf tab jab pump bhi 100 GPD ka ho)',
          'Membrane housing — ₹250 se ₹600 (crack ya leak ho tabhi)',
          `Visit charge — ₹${SERVICE.visitCharge} (hamara), market me ₹300-400`,
        ],
      },
      {
        heading: 'Naye membrane ki umar badhane ke liye',
        body: [
          'Ye choti baatein 6-8 mahine extra de sakti hain:',
        ],
        list: [
          'Membrane ke saath sediment aur carbon filter bhi badlwao. Purane pre-filter ke saath naya membrane aadhi umar me khatam ho jata hai.',
          'Naya membrane lagne ke baad 15-20 minute flush karo, aur pehla poora tank pheink do.',
          'Har 6 mahine me pre-filter zaroor badlo — ye ₹150 ka kaam ₹1,100 ka membrane bachata hai.',
          'Agar TDS 800 se upar hai to 80 GPD lo, 75 nahi. Chhota membrane high TDS pe jaldi thakta hai.',
        ],
      },
    ],
    faqs: [
      { q: 'RO membrane ki umar kitni hoti hai?', a: 'Normal municipal paani (TDS 250-500) par 20-24 mahine. High TDS area jaise Beur (700-1300 ppm) me 10-12 mahine. Calendar se nahi, TDS se decide karo.' },
      { q: 'Membrane kharab hone ke kya lakshan hain?', a: 'Output TDS apni original reading se 60-70 ppm upar chala jaye, ya rejection 75% se neeche gir jaye. Paani ka swaad phika ya khara lagna bhi signal hai. Sirf flow kam hona membrane ka signal nahi hai — wo pre-filter bhi ho sakta hai.' },
      { q: 'Patna me RO membrane ka rate kya hai?', a: '75 GPD ka ₹650-1,200, 80 GPD ka ₹750-1,400, 100 GPD ka ₹1,000-1,800. Isse bahut zyada maanga jaye to doosri jagah pooch lo.' },
      { q: 'Kya main khud membrane badal sakta hoon?', a: 'Technically haan, par housing seal theek se na baithe to dheere-dheere leak hoti hai jo hafton baad pata chalti hai. Filter khud badalna aasan hai, membrane thoda tricky hai.' },
      { q: '75 GPD aur 100 GPD me kya farak hai?', a: 'GPD output rate hai, purity nahi. 100 GPD tabhi lo jab TDS zyada ho AUR pump bhi 100 GPD ka ho. Chhote pump par bada membrane lagane se output kam ho jata hai, zyada nahi.' },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════ */
  {
    slug: 'patna-me-tds-kitna-hona-chahiye',
    title: 'Patna Me TDS Kitna Hona Chahiye — Area-Wise Asli Data',
    description:
      'Patna ke paani ka TDS kitna hai aur peene ke liye kitna sahi hai? 55 area ka asli measured data, BIS limit, aur kaunsa purifier lena chahiye.',
    published: '2026-09-03',
    updated: '2026-09-03',
    readMinutes: 7,
    category: 'Water Quality',
    keywords: [
      'patna water tds', 'tds kitna hona chahiye peene ke liye',
      'patna paani ki quality', 'tds level for drinking water',
      'borewell water tds patna', 'ro ya uv kaunsa lena chahiye',
    ],
    sections: [
      {
        heading: 'Pehle: TDS hota kya hai',
        body: [
          'TDS matlab Total Dissolved Solids — paani me ghule hue namak, minerals aur metal. Isko ppm (parts per million) me naapte hain.',
          'Zaroori baat: TDS ye nahi batata ki paani me bacteria hai ya nahi. Wo alag test hai. TDS sirf ghuli hui cheezein batata hai. Kam TDS ka matlab safe paani nahi hota, aur zyada TDS ka matlab zeher nahi hota.',
          'BIS (Bureau of Indian Standards) ke hisaab se peene ke paani ka TDS 500 ppm tak acceptable hai, aur 300 ppm tak ideal maana jata hai.',
        ],
      },
      {
        heading: 'Patna ke area-wise TDS (hamara measured data)',
        body: [
          'Ye har visit par naapa gaya data hai, kisi report se nahi liya:',
        ],
        list: [
          'Beur — 700 se 1300 ppm. Patna ka sabse hard paani. RO zaroori hai.',
          'Kankarbagh, Bhootnath Road, Bahadurpur — 450 se 900 ppm. RO chahiye.',
          'Chitkohra, Anisabad — 550 se 1000 ppm. RO chahiye.',
          'Agamkuan, Gulzarbagh, Alamganj — 400 se 850 ppm, iron bhi. RO + iron filter.',
          'Jaganpura, RK Nagar, Saguna More — 480 se 950 ppm. RO chahiye.',
          'Rajendra Nagar, Kadamkuan, Mahendru — 380 se 750 ppm. RO behtar.',
          'Jagdeo Path, Indrapuri, Patel Nagar — 350 se 700 ppm. RO ya RO+UV.',
          'Boring Road, Buddha Colony, Anandpuri — 240 se 500 ppm. RO+UV ya sirf UV.',
          'Exhibition Road, Fraser Road, Dak Bungalow — 220 se 420 ppm (municipal). UV kaafi ho sakta hai.',
          'Danapur Cantonment — 280 se 550 ppm, chlorine ke saath. Carbon filter zaroori.',
        ],
      },
      {
        heading: 'Aapke TDS ke hisaab se kaunsa purifier',
        body: [
          'Ye sabse mehngi galti hai jo log karte hain — 200 ppm wale paani par RO lagwa lena. Us case me RO minerals nikal deta hai aur paani phika ho jata hai, aur aap har saal bekaar me membrane badalte ho.',
        ],
        list: [
          '0 se 200 ppm — RO ki zaroorat NAHI. UV ya UF kaafi hai. RO lagaya to paani phika ho jayega.',
          '200 se 500 ppm — RO+UV theek hai. TDS controller ho to aur achha.',
          '500 se 1000 ppm — RO zaroori. TDS controller lena hi chahiye.',
          '1000 se 2000 ppm — RO ke saath pre-treatment. 80 ya 100 GPD membrane.',
          '2000 se upar — domestic RO se pehle softener chahiye. Sirf RO kaafi nahi.',
        ],
      },
      {
        heading: 'RO ke baad TDS kitna aana chahiye',
        body: [
          'Ye sawaal bahut poocha jata hai. Jawab: input ka 10% se kam, par 50 ppm se bilkul zero bhi theek nahi.',
          'Agar aapka input 800 ppm hai aur output 60-80 ppm aa raha hai — perfect. Rejection 90%+ hai.',
          'Agar output 20 ppm se neeche hai to paani me kuch bhi nahi bacha. Ye "zyada shudh" nahi hai — ye phika aur mineral-rahit paani hai. TDS controller isi ke liye hota hai: thoda paani bypass karke swaad aur minerals wapas laata hai.',
          'Agar output 150 ppm se upar hai (input 800 par) to membrane thakne laga hai.',
        ],
      },
      {
        heading: 'Patna me TDS badhta kyun hai',
        body: [
          'Do wajah hain jo hum zameen par dekhte hain:',
          'Pehla — borewell ki gehrai. Jitna gehra borewell, utna zyada dissolved mineral. Beur aur Chitkohra me borewell kaafi gehre hain, isliye wahan TDS sabse zyada milta hai.',
          'Doosra — mausam. Garmi me (April se June) water table neeche chala jata hai aur TDS 15-20% tak badh jata hai. Monsoon me wapas gir jata hai. Isliye April me naapa gaya TDS aur August ka TDS alag aayega — dono sahi hain.',
          'Isliye hum har visit par dobara naapte hain, purani reading par bharosa nahi karte.',
        ],
      },
    ],
    faqs: [
      { q: 'Patna ke paani ka TDS kitna hai?', a: 'Area par depend karta hai. Municipal supply wale area (Exhibition Road, Fraser Road) me 220-420 ppm. Borewell wale area me 400-900 ppm. Beur me sabse zyada, 700-1300 ppm tak.' },
      { q: 'Peene ke paani ka TDS kitna hona chahiye?', a: 'BIS ke hisaab se 500 ppm tak acceptable, 300 tak ideal. RO ke baad 50-150 ppm sabse achha hai — isse kam par paani phika aur mineral-rahit ho jata hai.' },
      { q: 'Kya kam TDS ka matlab safe paani hai?', a: 'Nahi. TDS bacteria nahi batata. Distilled water ka TDS 0 hota hai par usme minerals bhi nahi hote. Bacteria ke liye UV chahiye, TDS se uska koi lena-dena nahi.' },
      { q: 'Mera TDS 180 hai, kya RO lena chahiye?', a: 'Nahi. 200 se kam par RO faltu hai — wo zaroori minerals bhi nikal dega aur aap har saal membrane badlenge. UV ya UF lo, sasta bhi hai aur behtar bhi.' },
      { q: 'TDS meter kahan milega aur kitne ka hai?', a: 'Online ₹250-400 me mil jata hai. Ek baar lo, saalon chalega. Har 2-3 mahine me khud check kar sakte ho — kisi ke kehne par membrane badalne ki zaroorat nahi padegi.' },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-service-charge-patna-rate-list',
    title: 'RO Service Charge Patna — Poori Rate List 2026',
    description:
      'Patna me RO service ka sahi rate kya hai? Visit charge, filter, membrane, pump, AMC — sabka market rate aur hamara rate. Koi chhupa hua charge nahi.',
    published: '2026-09-03',
    updated: '2026-09-03',
    readMinutes: 5,
    category: 'Pricing',
    keywords: [
      'ro service charge patna', 'ro repair rate patna',
      'water purifier service charge', 'ro amc price patna',
      'ro filter change price', 'ro service cost',
    ],
    sections: [
      {
        heading: 'Visit charge — yahin se dhokha shuru hota hai',
        body: [
          `Patna me aam visit charge ₹300 se ₹400 hai. Hamara ₹${SERVICE.visitCharge} hai.`,
          'Par asli baat visit charge nahi hai. Asli baat ye hai ki visit ke baad kya hota hai. Sabse common trick: technician aata hai, 10 minute me bolta hai "membrane gaya", ₹2,500 maangta hai — jabki asli problem ₹450 ka SMPS tha.',
          'Isliye hum har visit par TDS reading dikhate hain — pehle aur baad me. Number dikh jaye to bahas khatam.',
        ],
      },
      {
        heading: 'Parts ka rate — market vs hamara',
        body: [
          'Ye Patna ka aam market rate hai (Sep 2026). Hamara rate iske andar hi rehta hai:',
        ],
        list: [
          'Sediment filter — market ₹150-300, hamara ₹150 se',
          'Pre-carbon filter — market ₹200-350, hamara ₹180 se',
          'Post-carbon filter — market ₹200-400, hamara ₹200 se',
          'Poora filter set (3 filter) — market ₹500-900, hamara ₹350 se',
          'RO membrane 75 GPD — market ₹1,200-2,500, hamara ₹1,100 se',
          'RO membrane 80/100 GPD — market ₹1,500-3,000, hamara ₹1,400 se',
          'SMPS / adaptor — market ₹500-900, hamara ₹450 se',
          'Booster pump — market ₹1,000-1,800, hamara ₹900 se',
          'UV lamp — market ₹400-900, hamara ₹400 se',
          'Solenoid valve — market ₹300-600, hamara ₹280 se',
          'Float switch — market ₹200-400, hamara ₹180 se',
          'Storage tank (8-12L) — market ₹700-1,500, hamara ₹650 se',
        ],
      },
      {
        heading: 'Service ka rate',
        body: [],
        list: [
          `Visit + diagnosis + TDS test — ₹${SERVICE.visitCharge}`,
          'General service (cleaning, checking) — ₹350 se',
          'Nayi installation — ₹500 se',
          'Uninstall + shifting — ₹399 se',
          'Commercial plant service — plant size par depend',
        ],
      },
      {
        heading: 'AMC lena chahiye ya nahi',
        body: [
          'Seedhi baat: AMC tabhi faydemand hai jab aap saal me 2 se zyada baar service karwate ho.',
          'Ek saal me aam kharcha bina AMC ke: 2 visit (₹400) + 1 filter set (₹350) + aadha membrane (₹550 amortised) = lagbhag ₹1,300.',
          'Basic AMC ₹1,499 me aata hai jisme filter included hote hain. Matlab agar aapka paani hard hai (Kankarbagh, Beur, Chitkohra) to AMC sasta padta hai. Agar municipal supply hai (Boring Road, Fraser Road) to shayad zaroorat nahi.',
          'Hum AMC bechne ki koshish nahi karte. Aapke area ka TDS dekh ke bata dete hain ki aapke liye faydemand hai ya nahi.',
        ],
      },
      {
        heading: 'Kaise pata chale ki aapse zyada liya ja raha hai',
        body: [
          'Ye 5 signal hain — inme se koi bhi dikhe to ruk jao aur doosri jagah pooch lo:',
        ],
        list: [
          'Technician TDS naape bina hi bole "membrane badalna hai" — bina test ke diagnosis nahi hota.',
          'Purana part wapas na de — hamesha maango, aapka hai.',
          'Bill na de ya part ka naam na likhe — likhwao.',
          'Ek hi visit me 3-4 part badalne bole — ye bahut kam hota hai. Ek baar me ek problem theek karo.',
          'Membrane ke ₹2,500 se zyada maange — 75 GPD ka market rate ₹1,200-2,500 hai, usse upar nahi.',
        ],
      },
    ],
    faqs: [
      { q: 'Patna me RO service ka charge kitna hai?', a: `Visit charge market me ₹300-400 hai, hamara ₹${SERVICE.visitCharge}. Filter set ₹350 se, membrane ₹1,100 se. Parts alag se, aur aapki permission ke baad hi.` },
      { q: 'RO ka filter kitne me badalta hai?', a: 'Ek filter ₹150-400 ka hota hai. Poora set (sediment + pre-carbon + post-carbon) ₹350 se ₹900 tak. 6 mahine me ek baar badalna chahiye.' },
      { q: 'AMC lena faydemand hai kya?', a: 'Agar aapke area ka TDS 500 se zyada hai (Kankarbagh, Beur, Chitkohra) to haan — saal me 2-3 service lagti hai, AMC sasta padta hai. Municipal supply wale area me shayad zaroorat nahi.' },
      { q: 'Kya visit charge kaam karwane par bhi lagta hai?', a: `Hamare yahan visit charge ₹${SERVICE.visitCharge} alag hai, jisme diagnosis aur TDS test shamil hai. Parts ka paisa uske upar, aur sirf aapki permission ke baad.` },
      { q: 'Warranty milti hai kya?', a: `Kaam par ${SERVICE.warrantyDays} din ki warranty. Us dauraan wahi problem dobara aaye to hum bina charge ke aate hain. Parts par manufacturer warranty alag se.` },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-me-paani-nahi-aa-raha-kya-kare',
    title: 'RO Me Paani Nahi Aa Raha — 6 Cheez Khud Check Karo',
    description:
      'RO se paani band ho gaya? Technician bulane se pehle ye 6 cheez khud dekho. Aadhe case ghar par hi theek ho jate hain, bina kharche ke.',
    published: '2026-09-03',
    updated: '2026-09-03',
    readMinutes: 6,
    category: 'Troubleshooting',
    keywords: [
      'ro me paani nahi aa raha', 'ro water not coming',
      'ro purifier not working', 'ro repair kaise kare',
      'water purifier problem solution',
    ],
    howTo: {
      name: 'RO me paani na aane par kya check karein',
      totalTime: 'PT15M',
      steps: [
        { name: 'Bijli check karo', text: 'Switch on hai? Adaptor ki LED jal rahi hai? Socket me doosra device laga ke dekho.' },
        { name: 'Pump ki awaaz suno', text: 'Kaan lagao. Halki gungunahat = pump chal raha hai. Bilkul chup = SMPS ya adaptor gaya.' },
        { name: 'Inlet valve dekho', text: 'Purifier ke peeche wala nal poora khula hai? Kabhi safai ke waqt band ho jata hai.' },
        { name: 'Inlet pressure check karo', text: 'Purifier se pehle wale nal se paani ki dhaar dekho. Patli dhaar = pressure kam hai, RO ko 5 psi chahiye.' },
        { name: 'Pre-filter dekho', text: 'Pehla housing khol ke filter nikalo. Bhura/kaala ho gaya hai to choke hai — yahi 40% case hai.' },
        { name: 'Tank tap khol ke dekho', text: 'Tank ka tap khol ke sunо — hawa ki awaaz aa rahi hai par paani nahi? Tank ka air pressure gaya hai.' },
      ],
    },
    sections: [
      {
        heading: 'Ruko — technician bulane se pehle',
        body: [
          'Hamare paas jitni "paani nahi aa raha" calls aati hain, unme se lagbhag 40% aisi hoti hain jo customer khud 10 minute me theek kar sakta tha.',
          'Ye lekh isliye likha hai. Neeche jo 6 cheez hain wo khud check karo. Theek ho jaye to hamara visit charge bach gaya. Na ho to kam se kam aapko pata hoga ki problem kya hai, aur koi aapko bewakoof nahi bana payega.',
        ],
      },
      {
        heading: '1. Bijli aa rahi hai?',
        body: [
          'Sabse pehla aur sabse zyada ignore kiya jane wala. Switch on hai? Adaptor ki chhoti LED jal rahi hai?',
          'Socket me mobile charger laga ke dekho. Kabhi-kabhi wo ek socket hi dead hota hai.',
          'Ram Krishna Nagar aur Jaganpura jaise area me voltage fluctuation zyada hai — wahan adaptor sabse pehle jata hai. Agar LED nahi jal rahi to SMPS/adaptor gaya, ₹450 ka kaam hai.',
        ],
      },
      {
        heading: '2. Pump chal raha hai ya nahi',
        body: [
          'Purifier ke paas kaan le jao aur suno.',
          'Halki gungunahat (humming) aa rahi hai — pump chal raha hai, problem aage hai. Point 3-5 dekho.',
          'Bilkul chup hai — pump ko bijli nahi mil rahi. SMPS ya adaptor. Ye ₹450-700 ka kaam hai, membrane ka ₹1,100 nahi.',
          'Tez khadkhadahat ya jhatke wali awaaz — pump khud kharab ho raha hai. ₹900 se.',
        ],
      },
      {
        heading: '3. Inlet valve poora khula hai?',
        body: [
          'Purifier ke peeche ek chhota nal (inlet valve) hota hai. Safai karte waqt ya kisi aur kaam me wo aadha band reh jata hai.',
          'Isko poora ghumao (usually anti-clockwise). Ye 30 second ka check hai aur mahine me ek-do baar hum isi ke liye bulaye jate hain.',
        ],
      },
      {
        heading: '4. Inlet pressure kam to nahi',
        body: [
          'RO membrane ko kaam karne ke liye kam se kam 5 psi pressure chahiye. Isse kam par wo paani banata hi nahi.',
          'Test: purifier se pehle wale nal ko khol ke dhaar dekho. Achhi motai wali dhaar = theek. Patli, tapakti hui dhaar = pressure kam hai.',
          'Jagdeo Path aur Indrapuri jaise area me ye aam problem hai kyunki paani overhead tank se aata hai. Aise me booster pump lagana padta hai.',
          'Municipal supply wale area me subah pressure achha hota hai, shaam ko kam. Do alag time par check karo.',
        ],
      },
      {
        heading: '5. Pre-filter choke to nahi (40% case yahi hai)',
        body: [
          'Ye sabse common wajah hai, aur sabse sasti.',
          'Pehla filter housing (sediment) khol ke filter nikalo. Naya filter safed hota hai. Agar wo bhura, kaala, ya chikna ho gaya hai — choke hai.',
          'Bhootnath Road aur Alamganj jaise area me ye 3-4 mahine me hi ho jata hai, kyunki wahan silt aur dust zyada hai.',
          'Naya sediment filter ₹150 ka hai. Khud badal sakte ho: inlet band karo, housing spanner se kholo, purana nikalo, naya daalo, wapas kaso.',
        ],
      },
      {
        heading: '6. Storage tank ka air pressure',
        body: [
          'Tank ke andar ek rubber bladder hota hai jo hawa ke pressure se paani bahar dhakelta hai. Ye pressure saalon me nikal jata hai.',
          'Lakshan: tank bhara hua lagta hai (bhaari hai) par tap se paani bahut dheere aata hai, ya thoda aa ke ruk jata hai.',
          'Ye khud theek karna mushkil hai — air valve me pump se hawa bharni padti hai, sahi pressure par. Technician bulao.',
        ],
      },
      {
        heading: 'In sabke baad bhi na chale to',
        body: [
          'Tab problem membrane, solenoid valve, ya control board me hai — ye teenon test equipment ke bina diagnose nahi hote.',
          `Patna me kahin bhi ho to call karo — ${CONTACT.primaryPhone}. Visit charge ₹${SERVICE.visitCharge}, aur hum TDS reading dikha ke bataayenge ki asli problem kya hai. Part badalne se pehle aapki permission lenge.`,
        ],
      },
    ],
    faqs: [
      { q: 'RO se paani bilkul nahi aa raha, kya karu?', a: 'Pehle bijli aur pump ki awaaz check karo. Pump chup hai to SMPS gaya (₹450). Pump chal raha hai par paani nahi to pre-filter choke hai (₹150) ya inlet pressure kam hai. Membrane sabse aakhri sambhavna hai.' },
      { q: 'Paani bahut dheere aa raha hai, kya problem hai?', a: 'Zyadatar pre-filter choke hai — ₹150 ka kaam. Ya inlet pressure kam hai. Agar flow dheere hai par TDS theek hai to membrane ki problem NAHI hai.' },
      { q: 'Pump ki awaaz aa rahi hai par paani nahi aa raha?', a: 'Iska matlab bijli theek hai. Ab check karo: inlet valve khula hai? Pre-filter choke to nahi? Inlet pressure 5 psi se zyada hai? Teeno theek hain to solenoid valve ya membrane dekhna padega.' },
      { q: 'Kya main khud filter badal sakta hoon?', a: 'Haan, sediment aur carbon filter badalna aasan hai. Inlet band karo, pressure release karo, housing kholo, badlo, kaso. 10 minute ka kaam. Membrane aur SMPS thoda technical hai.' },
      { q: 'Patna me kitni der me technician aa jata hai?', a: `Area par depend karta hai — Exhibition Road aur Dak Bungalow me 40 minute, Kankarbagh me 45, Danapur Cantonment me 70 minute tak. Har area page par uska response time likha hai.` },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-uv-uf-me-kya-farak-hai',
    title: 'RO, UV, UF Me Kya Farak Hai — Kaunsa Aapke Liye Sahi',
    description:
      'RO, UV, UF aur TDS controller me kya farak hai? Apne paani ke hisaab se kaunsa lena chahiye — aur kaunsa lena paisa barbaad karna hai.',
    published: '2026-09-03',
    updated: '2026-09-03',
    readMinutes: 6,
    category: 'Guide',
    keywords: [
      'ro uv uf difference', 'ro ya uv kaunsa behtar',
      'tds controller kya hota hai', 'water purifier kaunsa lena chahiye',
      'alkaline ro faydemand hai kya',
    ],
    sections: [
      {
        heading: 'Teeno alag kaam karte hain — ye samajh lo',
        body: [
          'Dukaan par jaate hi "RO+UV+UF+Alkaline+Copper" bol diya jata hai jaise zyada letter matlab behtar. Aisa nahi hai. Har stage ka apna kaam hai, aur aapko sabki zaroorat nahi hoti.',
        ],
        list: [
          'RO (Reverse Osmosis) — ghule hue namak, heavy metal, hardness nikalta hai. Sirf yahi TDS kam karta hai. Bijli chahiye. Paani waste karta hai.',
          'UV (Ultraviolet) — bacteria aur virus maarta hai. TDS par koi asar nahi. Bijli chahiye. Paani waste nahi karta.',
          'UF (Ultrafiltration) — mitti, kachra aur bade microbes rokta hai. Bijli nahi chahiye. TDS par asar nahi.',
          'TDS Controller — RO ka thoda paani bypass karke minerals wapas milata hai, taaki paani phika na lage.',
          'Alkaline / Copper — sirf swaad aur pH badalta hai. Ye purification NAHI hai, comfort feature hai.',
        ],
      },
      {
        heading: 'Aapke paani ke hisaab se seedha jawab',
        body: [
          'TDS naapo, phir ye table dekho. Bas.',
        ],
        list: [
          'TDS 200 se kam + municipal supply — sirf UV lo. RO paisa barbaad hai aur paani phika kar dega.',
          'TDS 200 se kam + borewell/tanker — UV+UF lo. UF gandagi rokega, UV bacteria maarega.',
          'TDS 200-500 — RO+UV lo. Ye sabse common Patna requirement hai.',
          'TDS 500-1000 — RO+UV+TDS controller. Controller zaroori hai warna paani phika hoga.',
          'TDS 1000 se upar — RO + pre-treatment. 80 ya 100 GPD membrane. Beur jaise area me yahi chahiye.',
        ],
      },
      {
        heading: 'Sabse mehngi galti: kam TDS par RO',
        body: [
          'Ye hum har mahine dekhte hain. Exhibition Road ya Fraser Road me kisi ke ghar 250 ppm ka municipal paani aata hai, aur usne ₹18,000 ka RO+UV+Alkaline+Copper lagwa rakha hai.',
          'Nateeja: output TDS 15-20 ppm. Paani me kuch nahi bacha. Swaad phika. Aur har saal ₹1,500 ka membrane badalna pad raha hai — jiski zaroorat hi nahi thi.',
          'Us ghar me ₹6,000 ka UV purifier behtar kaam karta, aur saal ka kharcha ₹400 hota (sirf UV lamp).',
        ],
      },
      {
        heading: 'Alkaline aur Copper — sach kya hai',
        body: [
          'Seedhi baat: ye purification nahi hai.',
          'Alkaline stage paani ka pH 8.5-9.5 tak badhata hai. Copper stage thoda copper milata hai. Dono swaad badalte hain.',
          'Health benefit ke jo bade-bade daave kiye jaate hain, unke peeche mazboot scientific proof nahi hai. Agar aapko swaad achha lagta hai to lo — usme kuch galat nahi. Par ye samajh ke mat lo ki paani "zyada shudh" ho raha hai.',
          'Kharcha bhi dekho: alkaline cartridge har saal ₹800-1,500 ka badalna padta hai.',
        ],
      },
      {
        heading: '5 saal ka asli kharcha — sticker price se zyada zaroori',
        body: [
          'Purifier ka daam poore kharche ka sirf ek tihai hota hai. Ye poora hisab hai:',
        ],
        list: [
          'Filter — saal ka ₹700 se ₹2,000 (model par depend)',
          'Membrane — har 18-24 mahine ₹1,100 se ₹1,800',
          'UV lamp — saal me ek baar ₹400 se ₹900',
          'Service visit — saal me 2 baar, ₹200 se ₹400 each',
          'Alkaline cartridge (agar hai) — saal ka ₹800 se ₹1,500',
        ],
      },
      {
        heading: 'Khareedne se pehle ye 2 sawaal zaroor poocho',
        body: [
          'Pehla — "Iske poore filter set ka kya rate hai?" Sticker price ₹9,000 ka model jiske filter ₹800 saal ke hain, ₹18,000 ke us model se sasta padta hai jiske proprietary cartridge ₹2,500 saal ke hain.',
          'Doosra — "Iske spare Patna me milte hain?" Kuch imported ya premium model ke parts yahan nahi milte. Ek part ke liye 2 hafte purifier band rakhna padta hai. Hum ye har mahine dekhte hain.',
        ],
      },
    ],
    faqs: [
      { q: 'RO aur UV me kya farak hai?', a: 'RO ghule hue namak aur TDS kam karta hai. UV bacteria maarta hai par TDS par koi asar nahi karta. Zyada TDS ke liye RO chahiye, sirf bacteria ki chinta ho to UV kaafi hai.' },
      { q: 'Mera TDS 250 hai, RO lena chahiye ya UV?', a: '250 par RO+UV theek hai, par sirf UV se bhi kaam chal jayega. Agar borewell ka paani hai to RO+UV lo. Municipal supply hai to UV bachat hai.' },
      { q: 'TDS controller kya karta hai?', a: 'RO ka thoda saaf paani bypass karke minerals wapas milata hai, jisse paani phika nahi lagta. 500 ppm se upar wale input par ye zaroori hai, 300 se neeche par bekaar.' },
      { q: 'Alkaline RO sach me faydemand hai?', a: 'Wo pH badhata hai aur swaad badalta hai. Health ke bade daavon ke peeche mazboot proof nahi hai. Purification ke liye zaroori nahi, aur cartridge saal ka ₹800-1,500 extra kharcha hai.' },
      { q: 'RO kitna paani waste karta hai?', a: 'Aam RO 1 litre saaf paani ke liye 2-3 litre waste karta hai. Reject water ko pochha lagane, bartan dhone ya paudhon me use kar sakte ho — bas usme TDS zyada hota hai, peene layak nahi.' },
    ],
  },
];

/** Newest first — used by the blog index and the sitemap. */
export function getPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.published.localeCompare(a.published));
}

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
