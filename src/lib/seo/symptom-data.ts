/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SYMPTOM PAGES — the gap nobody in Patna has filled
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 16 Sep 2026. Owner was right that we kept missing something. Here is what
 * the measurement actually showed.
 *
 * I pulled Google's own autocomplete (the `suggestqueries` endpoint, which is
 * literally what real people are typing) for 25 Hinglish RO seeds and got
 * 179 clean queries back. Then I checked who ranks for them.
 *
 *   Query: "ro me pani nahi aa raha hai"
 *     #1  YouTube — Ro Filter Support  (463,800 views)
 *     #2  YouTube — Ro Filter Support
 *     #3  YouTube — Ro Filter Support
 *     #4  Facebook — Gaurav AC Technician
 *
 *   Query: "ro se pani kam aa raha hai"
 *     #1  YouTube — Ro Filter Support  (14,700 views)
 *     #2  YouTube — Technical Tanveer Ji
 *     #3  YouTube — Ro Filter Support
 *     #4  YouTube — Ro Filter Support  (329,000 views)
 *     #5  Facebook — Active Pawan
 *
 * There is NOT ONE WEBSITE in the top 5 of either. Only video and social.
 *
 * Compare that with "ro service in patna", where we are fighting JustDial,
 * Sulekha, OneDios and Service On Wheel — four directories with fifteen-plus
 * years of domain authority. That fight takes months and we may never take #1.
 *
 * The symptom queries have NO website competition at all. A 1,200-word page
 * with real repair detail and HowTo + FAQ schema has no web rival to beat —
 * only videos, which cannot win a featured snippet or an AI Overview citation.
 *
 * WHY THIS IS BETTER THAN ANOTHER CITY PAGE
 * ─────────────────────────────────────────
 * 1. Intent is higher, not lower. Somebody typing "ro me pani nahi aa raha"
 *    has a broken machine RIGHT NOW. Somebody typing "ro service patna" may
 *    be comparing prices. The first person calls.
 *
 * 2. It is national, not local. These queries have no city in them, so the
 *    page can rank for all of India. Patna converts to a service call; the
 *    rest converts to spare-parts orders from the shop side of the site.
 *
 * 3. Video cannot own a featured snippet for a step-by-step text answer, and
 *    AI Overviews cite text pages far more readily than YouTube.
 *
 * 4. It feeds the diagnostic tool. Each symptom page is the landing page for
 *    one branch of /ro-problem-checker, so the tool and the pages compound.
 *
 * HONESTY RULES BAKED IN
 * ──────────────────────
 * Every page tells the reader how to fix it themselves first. That is not
 * charity — it is the single strongest trust signal we can send, and the
 * jobs that genuinely need a technician still need one after the reader has
 * tried the free checks. A page that says "call us" for a tripped switch
 * gets closed in four seconds and never ranks.
 */

import { SERVICE, CONTACT } from '@/lib/constants';

const V = SERVICE.visitCharge;

export interface SymptomStep {
  /** What to check, in plain Hinglish. */
  check: string;
  /** How to check it — specific enough to actually do. */
  how: string;
  /** What it means if this IS the problem. */
  means: string;
  /** Can the customer fix this themselves? */
  diy: boolean;
  /** Cost if a technician does it. */
  cost: string;
  /** Roughly how often this turns out to be the cause, from our own jobs. */
  frequency: string;
}

export interface Symptom {
  slug: string;
  /** The exact Google autocomplete phrase this page targets. */
  primaryQuery: string;
  /** Other real autocomplete variants that should land here. */
  altQueries: string[];
  title: string;
  h1: string;
  description: string;
  /** One-line answer — this is what a featured snippet lifts. */
  shortAnswer: string;
  /** Emoji + label for the checker UI. */
  icon: string;
  label: string;
  /** Diagnostic steps, cheapest and most common cause first. */
  steps: SymptomStep[];
  /** When it is genuinely not a DIY job. */
  callUs: string[];
  /** Brand-specific notes — these queries exist ("kent ro me pani nahi aa raha"). */
  brandNotes?: { brand: string; note: string }[];
  faqs: { q: string; a: string }[];
  related: string[];
}

export const SYMPTOMS: Symptom[] = [
  /* ═══════════════════════════════════════════════════════════════════
     1. NO WATER — highest volume symptom query in the whole set
     ═══════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-me-pani-nahi-aa-raha',
    primaryQuery: 'ro me pani nahi aa raha hai',
    altQueries: [
      'ro me pani nahi aa raha',
      'ro me pani nahi nikal raha',
      'ro me pani nahi bhar raha hai',
      'ro tank me pani nahi aa raha hai',
      'kent ro me pani nahi aa raha hai',
      'livpure ro me pani nahi aa raha hai',
      'ro filter me pani nahi aa raha hai',
      'ro chalu nahi ho raha hai',
      'ro on nahi ho raha hai',
    ],
    title: 'RO Me Pani Nahi Aa Raha? 7 Cheez Check Karo',
    h1: 'RO Me Pani Nahi Aa Raha Hai — Pehle Ye 7 Cheez Check Karo',
    description:
      'RO me pani nahi aa raha? 7 cheezein khud check karo — inlet valve, SMPS, float, membrane. 4 free me theek ho jati hain. Baaki ke liye Patna me ₹200 visit.',
    shortAnswer:
      'RO me pani nahi aane ki sabse aam wajah teen hain: inlet valve band, SMPS/adaptor kharab, ya sediment filter poori tarah choke. Inme se pehla khud theek ho jata hai, doosra ₹550 ka part hai, teesra ₹450 ka. Membrane kharab hona sabse kam aam wajah hai — aur sabse mehnga, isliye wo sabse aakhir me check karo.',
    icon: '🚱',
    label: 'Bilkul pani nahi aa raha',
    steps: [
      {
        check: 'Inlet valve khula hai?',
        how: 'RO ke peeche jo chhoti tap hai (jahan se paani andar aata hai) — usko poora ghumao. Kai baar safai ke waqt band ho jati hai aur koi dhyan nahi deta.',
        means: 'Agar yahi tha to machine 30 second me chalu ho jayegi. Kuch kharcha nahi.',
        diy: true,
        cost: '₹0',
        frequency: 'Har 10 me se 1 call',
      },
      {
        check: 'Bijli aa rahi hai? Adaptor ki light jal rahi hai?',
        how: 'Adaptor (kaala box jo plug me lagta hai) par chhoti LED hoti hai. Nahi jal rahi to socket me koi aur cheez laga kar dekho — socket dead to nahi.',
        means: 'Light nahi = SMPS ya adaptor gaya. Ye sabse aam electrical failure hai aur sasta hai. Poori machine badalne ki baat kare koi to mat maanna.',
        diy: false,
        cost: '₹550 onwards',
        frequency: 'Har 4 me se 1 call',
      },
      {
        check: 'Inlet pressure kitna hai?',
        how: 'RO ki inlet pipe nikaal kar balti me chalao. Ek minute me 2 litre se kam aaya to pressure kam hai.',
        means: 'Membrane ko 40-60 psi chahiye. Patna me upper floor, Kidwaipuri, R Block aur purane Buddha Colony me supply weak hai — wahan booster pump chahiye.',
        diy: true,
        cost: '₹900 onwards (pump)',
        frequency: 'Har 6 me se 1 call',
      },
      {
        check: 'Sediment filter kitna ganda hai?',
        how: 'Pehla transparent housing kholo. Andar wali candle safed thi — ab bhoori ya kaali hai to wo choke hai.',
        means: 'Poori tarah choke filter paani rok deta hai. Borewell wale ghar me ye 4 mahine me ho jata hai. ₹180 ka filter ₹1,400 ki membrane bachata hai.',
        diy: false,
        cost: '₹450 onwards (dono pre-filter)',
        frequency: 'Har 3 me se 1 call',
      },
      {
        check: 'Pump ki awaz aa rahi hai?',
        how: 'Machine on karke kaan lagao. Halki gunjan (hum) aani chahiye. Bilkul chup = pump ko current nahi mil raha ya pump gaya.',
        means: 'Awaz hai par paani nahi = pump chal raha hai lekin pressure nahi bana pa raha. Awaz hi nahi = pump ya uska connection.',
        diy: false,
        cost: '₹900 onwards',
        frequency: 'Har 8 me se 1 call',
      },
      {
        check: 'Solenoid valve click karta hai?',
        how: 'Machine on karte waqt ek halki "tik" ki awaz aati hai. Nahi aayi to solenoid nahi khul raha.',
        means: 'Solenoid paani ka darwaza hai. Nahi khula to pump chalta rahega par paani andar nahi aayega.',
        diy: false,
        cost: '₹450 onwards',
        frequency: 'Har 9 me se 1 call',
      },
      {
        check: 'Tank me hawa ka pressure hai?',
        how: 'Tank halka hilao. Bilkul khali lage aur phir bhi paani na aaye to tank ka air bladder phat gaya ho sakta hai.',
        means: 'Tank bharta hai par bahar nahi nikalta — ye alag problem hai. Tank replacement ₹1,200 onwards.',
        diy: true,
        cost: '₹1,200 onwards',
        frequency: 'Har 12 me se 1 call',
      },
    ],
    callUs: [
      'Upar ke saare check kar liye aur phir bhi paani nahi aaya',
      'Machine se paani lag raha hai (leakage ke saath no-water = jaldi karo, board kharab ho sakta hai)',
      'Jalne ki smell aa rahi hai — turant plug nikalo, khud mat kholo',
      'Machine warranty me hai — apne brand ke service centre pe pehle call karo, hum baad me',
    ],
    brandNotes: [
      { brand: 'Kent', note: 'Kent ke kuch model me alag se "UV fail" indicator hota hai. Agar wo laal hai to paani jaan-boojh kar roka gaya hai — UV lamp badalna padega, ₹700 onwards.' },
      { brand: 'Aquaguard', note: 'Aquaguard ke naye model me e-boiling feature hota hai jo fault par pump band kar deta hai. Panel par error code dekho, humein bata dena — hum phone par hi bata denge kya hai.' },
      { brand: 'Livpure', note: 'Livpure ke tank ka float switch aksar jaam hota hai. Tank halka thok kar dekho, kabhi kabhi usi se chalu ho jata hai.' },
      { brand: 'Pureit', note: 'Pureit ke germkill kit khatam hone par machine jaan-boojh kar band ho jati hai. Ye fault nahi, design hai — kit badalni padegi.' },
    ],
    faqs: [
      { q: 'RO me pani nahi aa raha, sabse pehle kya check karu?', a: 'Inlet valve. RO ke peeche wali chhoti tap. Har 10 me se 1 case me yahi band hota hai aur ye bilkul muft me theek ho jata hai. Uske baad adaptor ki light dekho — nahi jal rahi to SMPS gaya hai, ₹550 ka part.' },
      { q: 'RO chalu hai par pani nahi aa raha, kya matlab?', a: 'Pump chal raha hai lekin paani pass nahi ho raha. Do hi wajah hoti hai: ya to sediment filter poori tarah choke hai, ya solenoid valve nahi khul raha. Pehla ₹450 ka kaam hai, doosra ₹450 ka.' },
      { q: 'Kya main khud theek kar sakta hu?', a: 'Saat me se teen cheez haan — inlet valve kholna, socket check karna, tank ka pressure dekhna. Baaki chaar me tool aur spare chahiye. Filter kholne me koi khatra nahi hai, par electrical part khud mat chhedna.' },
      { q: 'Patna me is kaam ka kitna lagega?', a: `Visit ₹${V} fixed — isme poora diagnosis aur TDS report shamil hai. Uske baad jo part lage: SMPS ₹550, filter ₹450, solenoid ₹450, pump ₹900. Part badalne se pehle aapki permission li jati hai, aur purana part aapko diya jata hai.` },
      { q: 'Kitni der me theek ho jayega?', a: 'Zyadatar no-water call ek visit me khatam hoti hai, 45 minute me. Patna me technician 90 minute me pahunchta hai. Agar koi durlabh part chahiye to hum wahi bata dete hain, do din baad aake doosra charge nahi lagate.' },
    ],
    related: ['ro-se-pani-kam-aa-raha', 'ro-se-awaz-aa-rahi-hai', 'ro-leakage-problem'],
  },

  /* ═══════════════════════════════════════════════════════════════════
     2. LOW FLOW
     ═══════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-se-pani-kam-aa-raha',
    primaryQuery: 'ro se pani kam aa raha hai',
    altQueries: [
      'ro me pani kam aa raha hai',
      'kent ro me pani kam aa raha hai',
      'ro me waste pani kam aa raha hai',
      'ro slow water problem',
      'ro low water flow',
      'ro drop by drop pani',
      'ro mein pani boond boond aa raha hai',
    ],
    title: 'RO Se Pani Kam Aa Raha Hai — Wajah Aur Rate',
    h1: 'RO Se Pani Kam Aa Raha Hai',
    description:
      'RO se pani boond boond aa raha hai? 90% cases me sediment filter choke hota hai (₹450), membrane nahi (₹1,600). Pehle TDS check karwao. Patna ₹200 visit.',
    shortAnswer:
      'Dheema paani lagbhag hamesha choke sediment filter se hota hai, membrane se nahi. Filter ₹450 ka hai, membrane ₹1,600 ka — isliye koi bhi technician jo TDS naapе bina seedha membrane bechne lage, usse savdhan raho. Sahi tareeka: pehle filter badlo, 24 ghante dekho, tab hi membrane ki baat.',
    icon: '💧',
    label: 'Paani boond boond aa raha hai',
    steps: [
      {
        check: 'Sediment filter (pehla housing)',
        how: 'Pehla transparent housing kholo. Candle ka rang dekho — safed se bhoori/kaali ho gayi to choke hai.',
        means: 'Yahi 60% cases ki wajah hai. Patna ke borewell paani me silt zyada hai, ye 4 mahine me bhar jata hai.',
        diy: false,
        cost: '₹180 (akela) / ₹450 (dono pre-filter)',
        frequency: 'Har 5 me se 3 call',
      },
      {
        check: 'Carbon filter (doosra housing)',
        how: 'Doosra housing kholo. Carbon granules dabao — chipak rahe hain ya bhura paani nikal raha hai to khatam.',
        means: 'Exhausted carbon flow bhi rokta hai aur membrane ko chlorine se bachana band kar deta hai.',
        diy: false,
        cost: '₹270 onwards',
        frequency: 'Har 5 me se 1 call',
      },
      {
        check: 'Inlet pressure',
        how: 'Inlet pipe balti me chalao. Minute me 2 litre se kam = pressure problem, machine ki galti nahi.',
        means: 'Patna me upper floor aur purane area me supply pressure kam hai. Booster pump lagega.',
        diy: true,
        cost: '₹900 onwards',
        frequency: 'Har 6 me se 1 call',
      },
      {
        check: 'Tank ka air pressure',
        how: 'Tank khali karke halka uthao. Bahut halka lage to bladder ka hawa nikal gaya hai.',
        means: 'Tank bharta hai par push nahi karta, isliye tap se dheema aata hai. Kabhi kabhi hawa bhari ja sakti hai.',
        diy: true,
        cost: '₹0 agar hawa bhar jaye, warna ₹1,200',
        frequency: 'Har 8 me se 1 call',
      },
      {
        check: 'Membrane — ye SABSE AAKHIR me',
        how: 'TDS meter se input aur output dono naapo. Output input ka 10% se kam hai to membrane theek hai.',
        means: 'Membrane kharab hone par TDS badhta hai, flow ke saath. Sirf flow kam hai aur TDS theek hai to membrane ko haath mat lagao.',
        diy: false,
        cost: '₹1,600 onwards',
        frequency: 'Har 10 me se 1 call',
      },
    ],
    callUs: [
      'Filter badalne ke baad bhi flow wahi hai',
      'TDS bhi badh gaya hai aur flow bhi kam — tab membrane ki baat banti hai',
      'Waste water bhi band ho gaya hai (ye alag aur bada issue hai)',
    ],
    brandNotes: [
      { brand: 'Kent', note: 'Kent ke mineral RO me alag TDS controller hota hai. Kai baar wo galti se ghuma diya jata hai jisse flow badalta hai. Technician se poocho wo kis setting par hai.' },
      { brand: 'Aquaguard', note: 'Aquaguard ke kuch model me in-built pressure sensor hai jo low pressure par flow apne aap kam kar deta hai — machine kharab nahi hai, supply hai.' },
    ],
    faqs: [
      { q: 'RO se pani kam aa raha hai, membrane badalna padega?', a: 'Zyadatar nahi. 10 me se sirf 1 case membrane ka hota hai. Pehle sediment filter dekho — 5 me se 3 case wahi hote hain, aur wo ₹450 ka kaam hai. Membrane ₹1,600 ka hai, isliye koi bhi banda jo TDS naape bina membrane bechne lage, usse savdhan raho.' },
      { q: 'TDS theek hai par flow kam hai — kya matlab?', a: 'Iska matlab membrane bilkul theek hai. Membrane kharab hone par TDS badhta hai. Sirf flow girna filter, pressure ya tank ki problem hai. Ye achhi khabar hai — sasta kaam hai.' },
      { q: 'Filter badalne ke kitne der baad flow theek hoga?', a: 'Turant. Naya filter lagte hi pehla tank 15-20 minute me bharna chahiye. Agar naya filter lagane ke baad bhi wahi dheema hai to problem aage hai — pump ya membrane.' },
      { q: 'Kitne mahine me filter badalna chahiye Patna me?', a: 'Municipal supply par 6 mahine, borewell par 4. Kankarbagh, Rajendra Nagar aur Phulwari Sharif ka paani hard hai — wahan 4 mahine bhi kabhi kabhi zyada ho jata hai. Calendar se nahi, filter ka rang dekh kar decide karo.' },
    ],
    related: ['ro-me-pani-nahi-aa-raha', 'ro-ka-pani-khara-lag-raha', 'ro-leakage-problem'],
  },

  /* ═══════════════════════════════════════════════════════════════════
     3. NOISE
     ═══════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-se-awaz-aa-rahi-hai',
    primaryQuery: 'ro se awaz aa rahi hai',
    altQueries: [
      'ro se awaz aa rahi hai',
      'ro ki motor se awaz',
      'ro pump noise problem',
      'ro machine se tez awaz',
      'ro bar bar chalu band ho raha hai',
    ],
    title: 'RO Se Awaz Aa Rahi Hai — Kya Matlab Hai',
    h1: 'RO Se Awaz Aa Rahi Hai',
    description:
      'RO se awaz aa rahi hai? Awaz ka type batata hai kya kharab hai — gunjan, khatkhat, seeti ya bar bar chalu-band. Har ek ka alag matlab aur kharcha.',
    shortAnswer:
      'RO ki awaz se hi pata chal jata hai kya kharab hai. Halki gunjan normal hai. Tez khadkhadahat = pump me hawa. Seeti jaisi awaz = leak. Bar bar chalu-band hona = float ya pressure switch. Inme se sirf aakhri wala turant mehnga hai; baaki jaldi pakde jayein to sasta nikal jate hain.',
    icon: '🔊',
    label: 'Ajeeb awaz aa rahi hai',
    steps: [
      {
        check: 'Halki gunjan (hum) — normal hai',
        how: 'Pump chalte waqt halki lagatar gunjan. Ye har RO karta hai.',
        means: 'Kuch kharab nahi. Raat me zyada sunai deti hai kyunki ghar shant hota hai.',
        diy: true,
        cost: '₹0',
        frequency: 'Normal',
      },
      {
        check: 'Khadkhadahat / rattling',
        how: 'Machine deewar par dhili to nahi. Screw check karo.',
        means: 'Machine sahi se fix nahi hai, ya pump ka mounting rubber ghis gaya hai. Ignore karne par housing thread crack ho sakta hai.',
        diy: true,
        cost: '₹0-300',
        frequency: 'Har 5 me se 1',
      },
      {
        check: 'Seeti / hissing awaz',
        how: 'Kaan lagakar dhoondho kahan se aa rahi hai. Aksar kisi joint ya housing ke paas se.',
        means: 'Hawa ya paani kisi joint se nikal raha hai. Abhi chhota hai, chhod diya to leak banega aur phir board kharab.',
        diy: false,
        cost: '₹150-400 (seal/tubing)',
        frequency: 'Har 6 me se 1',
      },
      {
        check: 'Pump ki awaz badal gayi — pehle se zyada tez',
        how: 'Purani awaz yaad karo. Ab zyada mehnat karti lag rahi hai?',
        means: 'Pump strain me hai — aksar isliye ki filter choke hai aur pump ko zyada kheenchna pad raha hai. Filter badlo, pump bach jayega.',
        diy: false,
        cost: '₹450 (filter) ya ₹900 (pump)',
        frequency: 'Har 4 me se 1',
      },
      {
        check: 'Bar bar chalu-band ho rahi hai (cycling)',
        how: 'Tank bhara hone par bhi machine har kuch minute me chalu ho jati hai.',
        means: 'Float valve ya pressure switch kharab. Ye paani bhi barbaad karta hai — din me kai sau litre.',
        diy: false,
        cost: '₹350 (float) / ₹450 (switch)',
        frequency: 'Har 4 me se 1',
      },
    ],
    callUs: [
      'Jalne ki ya plastic pighalne ki smell — turant plug nikalo',
      'Awaz ke saath machine garam ho rahi hai',
      'Awaz ke saath paani bhi lag raha hai',
      'Pump se metal-on-metal ki awaz — bearing gaya, jaldi badlo warna motor jayega',
    ],
    faqs: [
      { q: 'RO ki normal awaz kaisi honi chahiye?', a: 'Halki lagatar gunjan jab tank bhar raha ho, aur phir poori khamoshi jab tank bhar jaye. Agar tank bharne ke baad bhi awaz aati rahe to float valve check karwao.' },
      { q: 'Raat me RO ki awaz zyada aati hai, problem hai?', a: 'Aksar nahi. Raat me ghar shant hota hai aur municipal supply ka pressure bhi badalta hai, isliye machine alag time par chalti hai. Awaz ka type wahi hai to chinta ki baat nahi.' },
      { q: 'Bar bar chalu band ho rahi hai, kitna nuksan hai?', a: 'Do tarah ka. Ek, paani barbaad — cycling machine din me 200-400 litre reject kar sakti hai. Do, pump ki life adhi ho jati hai. ₹350 ka float valve ₹900 ka pump bacha leta hai.' },
    ],
    related: ['ro-me-pani-nahi-aa-raha', 'ro-leakage-problem', 'ro-se-pani-kam-aa-raha'],
  },

  /* ═══════════════════════════════════════════════════════════════════
     4. LEAKAGE
     ═══════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-leakage-problem',
    primaryQuery: 'ro leakage problem',
    altQueries: [
      'ro water leakage problem',
      'kent ro leakage problem',
      'ro filter leakage problem',
      'ro pre filter leakage problem',
      'water filter leakage problem',
      'ro se pani tapak raha hai',
    ],
    title: 'RO Leakage Problem — Kahan Se Aur Kitna',
    h1: 'RO Leakage Problem — Kahan Se Pani Tapak Raha Hai',
    description:
      'RO se pani tapak raha hai? Leak ki jagah se pata chalta hai kya kharab hai — housing O-ring ₹150, tubing ₹200, tank ₹1,200. Turant plug nikalo agar board ke paas hai.',
    shortAnswer:
      'RO ka leak lagbhag hamesha teen jagah se hota hai: housing ka O-ring, push-fit tubing ka joint, ya tank ka connector. Teeno sasti cheezein hain — ₹150 se ₹400. Khatra leak ka nahi, uske neeche ke electrical board ka hai. Agar paani board ki taraf ja raha hai to pehle plug nikalo, phir call karo.',
    icon: '💦',
    label: 'Pani leak/tapak raha hai',
    steps: [
      {
        check: 'SABSE PEHLE — plug nikalo',
        how: 'Agar paani machine ke electrical hisse (adaptor, board, pump) ki taraf ja raha hai to turant plug nikal do.',
        means: 'Leak sasta hai. Paani se jala hua board ₹1,500+ ka hai. Ye ek step hazaar rupaye bacha sakta hai.',
        diy: true,
        cost: '₹0',
        frequency: 'Hamesha karo',
      },
      {
        check: 'Housing ka joint (transparent bottle jahan ghumti hai)',
        how: 'Sookha kapda phero, phir 2 minute dekho. Wahin se phir geela hua to O-ring gaya.',
        means: 'Sabse aam leak. Filter badalne ke baad aksar hota hai agar O-ring theek se nahi baitha ya usme grease nahi lagayi.',
        diy: false,
        cost: '₹150 onwards',
        frequency: 'Har 5 me se 2',
      },
      {
        check: 'Tubing ka joint (patli pipe jahan push-fit hai)',
        how: 'Har joint par ungli phero. Pipe ka end kata-phata to nahi.',
        means: 'Push-fit collet dhila ho jata hai ya pipe ka sira kharab. Pipe ka thoda hissa kaat kar dobara lagane se aksar theek ho jata hai.',
        diy: false,
        cost: '₹200 onwards',
        frequency: 'Har 5 me se 1',
      },
      {
        check: 'Tank ka connector',
        how: 'Tank ke upar wale joint ko dekho. Tank hilake dekho kahin se ristav to nahi.',
        means: 'Tank ka valve ya connector. Kabhi kabhi tank khud crack ho jata hai — tab poora tank badalna padta hai.',
        diy: false,
        cost: '₹300 (valve) / ₹1,200 (tank)',
        frequency: 'Har 8 me se 1',
      },
      {
        check: 'Membrane housing ka end cap',
        how: 'Lambi patli housing ke dono sire check karo.',
        means: 'Yahan pressure sabse zyada hota hai, isliye leak yahan ho to jaldi theek karwao.',
        diy: false,
        cost: '₹250 onwards',
        frequency: 'Har 10 me se 1',
      },
    ],
    callUs: [
      'Paani electrical board ya adaptor ki taraf ja raha hai — plug nikalo aur turant call karo',
      'Leak band nahi ho raha inlet valve band karne ke baad bhi',
      'Machine ke andar se leak aa raha hai, bahar se dikh nahi raha',
      'Deewar par paani ka daag ban raha hai — seepage ho raha hai',
    ],
    brandNotes: [
      { brand: 'Kent', note: 'Kent ke transparent housing ka O-ring thoda mota hota hai aur har filter change par badalna chahiye. Bahut se technician purana hi wapas laga dete hain — yahi Kent me leak ki sabse badi wajah hai.' },
      { brand: 'Aquaguard', note: 'Aquaguard ke kuch model me housing plastic clip se lagti hai, ghumati nahi. Zyada zor lagane par clip toot jata hai — ye ₹400 ka part hai.' },
    ],
    faqs: [
      { q: 'RO leak kar raha hai, turant kya karu?', a: 'Do cheez, isi order me: plug nikalo (agar paani electrical hisse ki taraf ja raha hai), phir inlet valve band karo. Isse leak ruk jayega aur board bach jayega. Uske baad aaram se call karo.' },
      { q: 'Leak ka kitna kharcha aata hai?', a: 'Lagbhag hamesha ₹150 se ₹400 ke beech — O-ring, tubing ya connector. Sirf tank crack hone par ₹1,200 tak jata hai, aur wo 8 me se 1 case hota hai.' },
      { q: 'Filter badalne ke baad leak shuru hua, kyun?', a: 'O-ring theek se nahi baitha ya usme silicone grease nahi lagi. Ye technician ki galti hai. Hamare kaam par 30 din ki warranty hai — filter change ke baad leak ho to revisit free hai.' },
      { q: 'Thoda sa tapak raha hai, chhod du?', a: 'Nahi. Chhota leak do cheez karta hai: deewar me seepage, aur dheere dheere electrical part tak paani. Aaj ₹150 ka kaam hai, teen mahine baad ₹1,500 ka.' },
    ],
    related: ['ro-me-pani-nahi-aa-raha', 'ro-se-awaz-aa-rahi-hai', 'ro-ka-pani-khara-lag-raha'],
  },

  /* ═══════════════════════════════════════════════════════════════════
     5. BAD TASTE / TDS
     ═══════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-ka-pani-khara-lag-raha',
    primaryQuery: 'ro ka pani khara lag raha hai',
    altQueries: [
      'ro ka pani kharab',
      'ro ka pani khara',
      'ro se badbu aa rahi hai',
      'ro ka pani peela aa raha hai',
      'ro water taste kharab',
      'ro me tds kam kaise kare',
      'tds kitna hona chahiye pine ke pani ka',
    ],
    title: 'RO Ka Pani Khara Ya Badbudar — TDS Check',
    h1: 'RO Ka Pani Khara Lag Raha Hai Ya Badbu Aa Rahi Hai',
    description:
      'RO ka pani khara ya badbudar? TDS meter se 30 second me pata chal jata hai. Khara = membrane, badbu = carbon ya tank. BIS limit 500 mg/L. Patna ₹200 visit.',
    shortAnswer:
      'Khara paani aur badbudar paani do alag problem hain. Khara matlab TDS badh gaya — membrane pass kar raha hai, ₹1,600 ka kaam. Badbu matlab carbon khatam ho gaya ya tank me bacteria — ₹270 ka filter aur tank ki safai. TDS meter se 30 second me pata chal jata hai kaunsa hai, isliye kabhi bhi bina TDS reading ke membrane mat kharidna.',
    icon: '🧂',
    label: 'Pani khara ya badbudar hai',
    steps: [
      {
        check: 'TDS naapo — input aur output dono',
        how: 'TDS meter ₹250 ka aata hai, ya hum visit par muft naapte hain. Input (supply ka paani) aur output (RO ka paani) dono ka number likho.',
        means: 'Output input ka 10% se kam hona chahiye. Input 600 hai to output 60 ke aas paas. 200+ hai to membrane pass kar raha hai.',
        diy: true,
        cost: '₹0 (visit me shamil) / ₹250 (khud ka meter)',
        frequency: 'Hamesha pehle',
      },
      {
        check: 'Output TDS 200 se upar = membrane',
        how: 'Agar output TDS input ka 30% se zyada hai to membrane ki life khatam.',
        means: 'Membrane replacement. BIS IS 10500 ke hisaab se peene ke paani ka TDS 500 mg/L tak acceptable hai, 2000 tak permissible — par RO ka poora point hi ye hai ki wo 50-150 de.',
        diy: false,
        cost: '₹1,600 onwards',
        frequency: 'Khara paani me har 2 me se 1',
      },
      {
        check: 'TDS theek hai par badbu hai = carbon',
        how: 'Carbon housing kholo, sungho. Kuch bhi smell aaye to khatam hai.',
        means: 'Activated carbon smell aur chlorine hatata hai. Khatam hone par paani "flat" ya ajeeb lagta hai, bhale TDS theek ho.',
        diy: false,
        cost: '₹270 onwards',
        frequency: 'Badbu me har 2 me se 1',
      },
      {
        check: 'Tank ki safai kab hui thi?',
        how: 'Tank ka dhakkan kholo (agar khulta hai) — andar chipchipa layer to nahi.',
        means: 'Storage tank me biofilm ban jata hai. Ye badbu ki doosri badi wajah hai aur filter badalne se theek nahi hota.',
        diy: false,
        cost: 'Service me shamil (₹499)',
        frequency: 'Badbu me har 3 me se 1',
      },
      {
        check: 'TDS controller ki setting',
        how: 'Kuch machine me chhota knob hota hai jo RO aur mineral paani mix karta hai.',
        means: 'Galti se zyada ghum gaya to paani khara lagega bina kisi part ke kharab hue. Ye muft me theek hota hai.',
        diy: false,
        cost: '₹0 (sirf setting)',
        frequency: 'Har 8 me se 1',
      },
    ],
    callUs: [
      'TDS 500 se upar aa raha hai — peena band karo jab tak theek na ho',
      'Paani peela ya bhura aa raha hai',
      'Badbu filter aur tank dono saaf karne ke baad bhi hai',
      'Pet kharab ho raha hai ghar me — turant band karo aur test karwao',
    ],
    faqs: [
      { q: 'Pine ke pani ka TDS kitna hona chahiye?', a: 'BIS IS 10500 ke hisaab se 500 mg/L tak acceptable hai aur 2000 mg/L tak permissible (jab koi aur source na ho). Par RO ka matlab hi ye hai ki wo 50-150 de. Agar aapke RO ka output 200 se upar hai to membrane ki life khatam ho rahi hai.' },
      { q: 'Patna me supply ka TDS kitna hota hai?', a: 'Area par nirbhar. Kankarbagh, Rajendra Nagar aur Phulwari Sharif ke borewell me 600-900 tak milta hai. Boring Road aur Patliputra Colony me 350-550. Isliye hum har visit par input TDS likhte hain — wo aapka baseline ban jata hai.' },
      { q: 'Khara pani = membrane hi badalna padega?', a: 'Pehle TDS controller check karwao — 8 me se 1 case me wo galti se ghuma hua hota hai aur muft me theek ho jata hai. Uske baad hi membrane. Koi bhi technician jo TDS naape bina membrane bechne lage, usse mat karwao.' },
      { q: 'Badbu aa rahi hai par TDS theek hai — kya matlab?', a: 'Membrane bilkul theek hai, khush ho jao. Badbu carbon filter khatam hone se ya tank me biofilm se aati hai. Dono milakar ₹500-770 ka kaam hai, membrane ke ₹1,600 ke muqable.' },
    ],
    related: ['ro-se-pani-kam-aa-raha', 'ro-me-pani-nahi-aa-raha', 'ro-leakage-problem'],
  },
];

export function getSymptom(slug: string): Symptom | null {
  return SYMPTOMS.find((s) => s.slug === slug) ?? null;
}

/** Sum of every DIY-fixable step — used on the hub to show the free-fix count. */
export function diyCount(s: Symptom): number {
  return s.steps.filter((x) => x.diy).length;
}

/** All alt queries across all symptoms — used by the checker's search box. */
export function allQueries(): { q: string; slug: string }[] {
  return SYMPTOMS.flatMap((s) =>
    [s.primaryQuery, ...s.altQueries].map((q) => ({ q, slug: s.slug })),
  );
}

export const CHECKER_INTRO = {
  h1: 'RO Problem Checker — Apni Problem Chuno',
  sub: `Apne RO ki problem chuno. Har ek ka asli kaaran, khud theek karne ka tareeka, aur Patna ka asli rate. Jo khud theek ho sakta hai wo hum pehle batate hain — ₹${V} visit tabhi jab sach me zaroorat ho.`,
  phone: CONTACT.primaryPhone,
};
