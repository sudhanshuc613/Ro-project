/**
 * HINGLISH LONG-TAIL — wo queries jo Patna me log ASLI me type/bolte hain,
 * lekin site par kahin heading me nahi thi.
 *
 * ── Kyun (26 Oct 2026 ki live naap) ────────────────────────────────────────
 *
 * `deep-audit-live.py` ne 149 live page scan karke bataya:
 *
 *     72-gap keyword     maujood 69/72 · missing 3
 *
 * Aur jo "maujood" the un me se 2 sirf BODY me the, heading me nahi.
 * Poori list jo is file ne theek ki:
 *
 *   KEYWORD                           PEHLE        AB (H2 kis page par)
 *   ro service wala near me           kahin nahi   /ro-service-in-patna
 *   ro banane wala patna              kahin nahi   /service-patna/brand/other-brands
 *   aquaguard aura service patna      kahin nahi   /service-patna/brand/aquaguard
 *   ro mistri near me                 sirf body    /ro-repair-patna
 *   ro service centre number patna    sirf body    /ro-customer-care-patna
 *
 * ── 🔴 EK KEYWORD = EK PAGE ────────────────────────────────────────────────
 *
 * Site par pehle se cannibalization hai aur wo naapi hui hai:
 *     "ro service near me"   → 86 page ke title/H1 me
 *     "ro service patna"     → 28 page
 *     "ro service in patna"  → 22 page
 *
 * Isliye in 5 me se har phrase SIRF EK page par jaata hai. `MOUNT` map me
 * key hi page ka pata hai, aur `scripts/hinglish-longtail-test.py` fail ho
 * jaayega agar koi phrase do page par chala gaya.
 *
 * ── 🔴 STUFFING NAHI ───────────────────────────────────────────────────────
 *
 * Competitor `aquasolutionindia.com` ke ek page par "near me" 490 baar hai
 * aur 14,978 shabd hain — wo scaled-content abuse hai, hum wo nahi karenge.
 * Har block me asli jaankari hai: rate, warranty, kaise pehchane, kya poochna
 * hai. Keyword sirf heading me ek baar aata hai.
 */

export type HinglishBlock = {
  /** H2 — phrase heading ke shuru me, phir asli matlab. Plain string rakho. */
  heading: string;
  /** Wo exact phrase jo is page ko mila hai — test isi se verify karta hai. */
  phrase: string;
  /** 2–3 line ka jawab, Hinglish, bina jhooth. */
  body: string;
  /** 3–4 point — har point me kaam ki baat, bharti nahi. */
  points: string[];
  /** Dusra phrase jisko apna H3 chahiye (jaise centre / center spelling). */
  altPhrase?: string;
  /** Us dusre phrase ka H3. */
  altHeading?: string;
};

/**
 * Key kya hai:
 *   intent slug jaisa hai           → `/[intent]` page
 *   'brand:<slug>'                  → `/service-patna/brand/<slug>` page
 *   'customer-care'                 → `/ro-customer-care-patna` page
 */
export const HINGLISH_LONGTAIL: Readonly<Record<string, HinglishBlock>> = {
  /* ── /ro-service-in-patna ─────────────────────────────────────────────── */
  'ro-service-in-patna': {
    phrase: 'ro service wala near me',
    heading: 'RO Service Wala Near Me — Patna Me Sahi Wala Kaise Chune',
    body:
      'Patna me "RO service wala near me" search karne par jo sabse upar aata hai wo aksar aggregator hota hai — wo aapki call lead ke roop me bech deta hai, aur jo technician aata hai use aapka pata pehli baar us din pata chalta hai. Hum khud ke technician bhejte hain, Buddha Colony ke apne workshop se, aur bill hamare naam se banta hai.',
    points: [
      'Call par hi technician ka naam aur number milta hai — koi call centre ke beech me nahi.',
      'Visit charge ₹200, pehle hi bola jaata hai. Part lagwana zaroori nahi, mana kar sakte hain.',
      'Kaam pe 30 din ki service warranty aur laga hue part par 12 mahine.',
      'Rate kaam shuru hone se pehle likh kar batate hain — baad me badalte nahi.',
    ],
  },

  /* ── /ro-repair-patna ─────────────────────────────────────────────────── */
  'ro-repair-patna': {
    phrase: 'ro mistri near me',
    heading: 'RO Mistri Near Me — Patna Me Achhe Mistri Ki Pehchaan',
    body:
      'RO mistri dhoondhte waqt sabse badi galti ye hai ki log sirf "kitna lagega" poochhte hain. Sahi sawaal hai "kya kharab hai aur aapne kaise pata kiya". Achha mistri TDS meter nikaalta hai, input aur output dono naapta hai, aur tabhi part badalne ki baat karta hai.',
    points: [
      'TDS input aur output dono naape bina membrane badalne ko kahe — to ruk jaaiye.',
      'Machine bilkul band hai to 10 me se 7 baar SMPS (₹700 – ₹1,100) hota hai, pump nahi.',
      'Purana part wapas maangiye. Hum nikala hua part har baar aapke saamne rakhte hain.',
      'Bill lijiye — warranty bina bill ke claim nahi hoti, kisi ke paas bhi nahi.',
    ],
  },

  /* ── /ro-customer-care-patna ──────────────────────────────────────────── */
  'customer-care': {
    phrase: 'ro service centre number patna',
    heading: 'RO Service Centre Number Patna — Seedha Number, Call Centre Nahi',
    body:
      'Brand ka toll-free number aksar ek national call centre par jaata hai: complaint number milta hai, phir 24–72 ghante ka intezaar. Hamara number seedha Patna ke workshop par bajta hai. Warranty wali machine ho to hum khud brand centre tak bhejne me madad karte hain — tab aapko part ka paisa nahi dena chahiye.',
    points: [
      'Number 8969821440 — 08:00 se 21:00, saaton din. Busy ho to WhatsApp kar dijiye.',
      'Shikayat ke baad aam taur par 90 minute me technician, Patna ke andar.',
      'Machine warranty me hai ya nahi — model aur kharidne ki date batayiye, hum check kar denge.',
      'Agar warranty me hai to hum repair ke paise nahi lete; seedha brand centre ka rasta batate hain.',
    ],
  },

  /* ── /service-patna/brand/other-brands ────────────────────────────────── */
  'brand:other-brands': {
    phrase: 'ro banane wala patna',
    heading: 'RO Banane Wala Patna — Assembled Unit Banta Kaise Hai Aur Chalta Kitna Hai',
    body:
      'Patna ke bahut saare ghar me "local assembled" RO laga hai — mohalle ki dukaan se bana hua, bina kisi brand ke badge ke. Ye kharaab unit nahi hoti; isme 10-inch ke standard housing, 75/80 GPD membrane aur aam SMPS lagta hai. Isi wajah se iska repair branded unit se sasta aur jaldi hota hai.',
    points: [
      'Standard part hone ki wajah se filter set ₹350 – ₹900 me badal jaata hai, brand cartridge se kam.',
      'Jo dukaan banati hai wo aksar baad me service nahi deti — hum deti hai, bina brand pooche.',
      'Assembled unit me sabse zyada dikkat sasti tubing aur elbow se aati hai, membrane se nahi.',
      'Koi bhi "ye repair nahi ho sakta" kahe to galat keh raha hai — har part commodity hai.',
    ],
  },

  /* ── /service-patna  (27 Oct gap — title/H1 me kahin nahi tha) ────────── */
  'service-patna': {
    phrase: 'water purifier service patna',
    heading: 'Water Purifier Service Patna — Saal Me Kitni Baar, Aur Kya-Kya Hota Hai',
    body:
      'Patna me "water purifier service" ka matlab sirf filter badalna nahi hai. Poori servicing me machine khol kar housing saaf hota hai, membrane flush hoti hai, tubing aur fitting check hote hain, aur aakhir me output TDS set kiya jaata hai. Borewell wale ghar me ye saal me do baar chahiye; supply water par ek baar kaafi hai.',
    points: [
      'Input aur output dono ka TDS likh kar dete hain — pehle aur baad ka, dono.',
      'Bina part ki poori servicing ka rate call par hi bata dete hain — kaam shuru hone ke baad badalta nahi.',
      'Machine 3 saal se purani ho to pump aur SMPS bhi check karte hain, bina extra charge.',
      'Visit charge ₹200 — service karwayein ya na karwayein, isse zyada kuch nahi lagta.',
    ],
  },

  /* ── /contact  (27 Oct gap — centre/center dono kahin nahi the) ───────── */
  'contact': {
    phrase: 'ro service centre patna',
    heading: 'RO Service Centre Patna — Hamara Centre Kahan Hai Aur Kab Khulta Hai',
    altPhrase: 'ro service center patna',
    altHeading: 'RO Service Center Patna — Dono Spelling, Ek Hi Jagah',
    body:
      'Buddha Colony me Sai Gali, B-62 ke saamne — yahi hamara workshop aur counter hai. Service ke liye yahan aana zaroori nahi, hum ghar aate hain; lekin naya purifier, membrane ya spare part khud dekh kar lena ho to aa sakte hain. Brand ka official centre alag hota hai — machine warranty me ho to hum wahin bhejte hain, apna kaam nahi thopte.',
    points: [
      'Pata: Sai Gali, Opposite B-62, Buddha Colony, Patna 800001 — 08:00 se 21:00, saaton din.',
      'Counter par membrane, SMPS, pump aur filter stock me rehta hai — turant mil jaata hai.',
      'Aane se pehle call kar lijiye 8969821440, taaki aapka part nikaal kar rakh dein.',
      'Warranty wali machine ke liye hum khud brand centre ka rasta batate hain — charge nahi lete.',
    ],
  },

  /* ── /ro-services-patna  (27 Oct gap) ─────────────────────────────────── */
  'ro-services-patna': {
    phrase: 'ro technician patna',
    heading: 'RO Technician Patna — Kaun Aayega, Aur Kaise Pehchanein',
    body:
      'Patna me RO technician bhejne wale zyadatar log aggregator hain — aapki call kisi ko bech di jaati hai aur jo aata hai uska naam bhi aapko pehle nahi pata hota. Hamare technician hamare apne hain, Buddha Colony ke workshop se, aur booking ke saath hi aapko unka naam aur number mil jaata hai.',
    points: [
      'Technician ka naam aur number call par hi mil jaata hai — surprise nahi.',
      'Har technician TDS meter le kar aata hai. Naap dikhaye bina part badalne ko na kahe.',
      'Nikala hua purana part aapke saamne rakha jaata hai, wapas le ja sakte hain.',
      'Bill hamare naam ka — kaam par 30 din, laga hue part par 12 mahine ki warranty.',
    ],
  },

  /* ── /service-patna/brand/aquaguard ───────────────────────────────────── */
  'brand:aquaguard': {
    phrase: 'aquaguard aura service patna',
    heading: 'Aquaguard Aura Service Patna — Aura, Magna Aur Glory Ka Alag Hisaab',
    body:
      'Aquaguard ke Aura jaise naye models me RO + UV + UF teeno stage hote hain aur cartridge brand-specific hota hai, isliye inka rate aam RO se thoda upar jaata hai. Lekin pump, SMPS aur solenoid wahi standard part hote hain — unke liye brand ka daam dena zaroori nahi.',
    points: [
      'Aura / Magna me UV lamp aur ballast alag-alag milte hain — poora assembly badalna har baar zaroori nahi.',
      'Cartridge brand ka hi lagwaiye; pump, SMPS aur valve me OEM part theek chalta hai aur sasta padta hai.',
      'E-boiling ya UV fail ka indicator aksar lamp ka nahi, ballast ka hota hai — pehle wahi check karwaiye.',
      'Machine warranty me ho to hum repair nahi karte, seedha Eureka Forbes centre bhejne me madad karte hain.',
    ],
  },
};

/** Page key se block nikaalo. Na mile to kuch render mat karo. */
export function getHinglishBlock(key: string): HinglishBlock | null {
  return HINGLISH_LONGTAIL[key] ?? null;
}

/** Saare phrases — test aur audit ke liye. */
export const HINGLISH_PHRASES: readonly string[] = Object.values(HINGLISH_LONGTAIL).flatMap(
  (b) => (b.altPhrase ? [b.phrase, b.altPhrase] : [b.phrase]),
);
