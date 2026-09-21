/**
 * SEARCH-QUERY LAYER — wahi shabd jo Patna ke log Google me TYPE karte hain.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * YE FILE KYU BANI (19 Sep 2026)
 * ──────────────────────────────
 * Google Autocomplete (gl=in) se live scrape kiya. Jo queries Google khud
 * suggest karta hai — matlab jinke peeche asli search volume hai:
 *
 *     ro service patna
 *     ro service in patna
 *     ro service patna near me
 *     ro service centre patna
 *     ro service centre patna near me
 *     ro repair patna
 *     kent ro service patna
 *     aquaguard ro service patna
 *     aquafresh ro service patna
 *
 * Phir poori 133-page live site pe in exact phrases ko gina. Result:
 *
 *     ro service patna near me        0 baar   🔴
 *     ro service centre patna         0 baar   🔴
 *     ro repair patna                 0 baar   🔴
 *     kent ro service patna           0 baar   🔴
 *     aquaguard ro service patna      0 baar   🔴
 *     water purifier service patna    0 baar   🔴
 *
 * Chhe phrases, jinhe Google khud suggest karta hai, poori site pe ek baar
 * bhi nahi the.
 *
 * WAJAH: GRAMMAR KA FARQ
 * ──────────────────────
 * Hum angrezi ke hisaab se sahi likhte hain, log search bar me sahi angrezi
 * nahi likhte:
 *
 *     hamare pages  : "RO Repair in Patna"          ← "in" ke saath
 *     log type karte: "ro repair patna"             ← bina "in"
 *
 *     hamare pages  : "RO Service Near Me in Patna"
 *     log type karte: "ro service patna near me"    ← ulta order
 *
 * Google synonyms samajhta hai, par exact-phrase match ab bhi ek signal hai —
 * aur jab humse commodity competitors upar hain, har signal ginta hai.
 *
 * YE FILE KYA NAHI HAI
 * ────────────────────
 * Ye keyword stuffing nahi hai. #1 ranker apne homepage pe "ro service centre"
 * 167 baar daalta hai (visible text me). Hum wo nahi kar rahe — measure kiya
 * to uske paas bhi in exact autocomplete phrases me se zyadatar ZERO hain,
 * matlab stuffing uski ranking ki wajah nahi hai.
 *
 * Yahan har phrase ek POORE, sachche vaakya ke andar hai jo khud padhne layak
 * hai. Agar koi line insaan ke liye bekaar hai to wo yahan nahi honi chahiye.
 */

import { CONTACT, SERVICE, GBP, GBP_RATING_TEXT } from '@/lib/constants';

export interface SearchAnswer {
  /** Wo exact phrase jo log type karte hain (lowercase, jaisa autocomplete me). */
  query: string;
  /** Visible heading — Title Case, insaan ke padhne layak. */
  heading: string;
  /** Jawab. Phrase iske andar naturally aana chahiye, thoosa hua nahi. */
  answer: string;
}

/**
 * Homepage pe render hone wale jawab.
 *
 * Har `answer` me uska `query` phrase kam se kam ek baar poore vaakya ke
 * andar hai. Number sab constants se aate hain, isliye rate badle to yahan
 * apne aap badal jayega — do jagah alag figure nahi ho sakta.
 */
export const SEARCH_ANSWERS: SearchAnswer[] = [
  {
    query: 'ro service patna near me',
    heading: 'RO Service Patna Near Me — Kitni Der Me Pahunchte Hain',
    answer:
      `Agar aap "RO service Patna near me" dhoondh rahe hain, to ye hamara seedha jawab hai: ` +
      `hum Patna ke ${'83'} mohallon me jaate hain aur zyadatar pate pe ${SERVICE.responseTime} ke andar ` +
      `technician pahunch jaata hai. Visit charge ₹${SERVICE.visitCharge} hai aur wo pehle hi bata diya jaata hai — ` +
      `phone pe ek rate, ghar pe doosra rate wali baat hamare yahan nahi hoti.`,
  },
  {
    query: 'ro service centre patna',
    heading: 'RO Service Centre Patna — Hum Kya Hain Aur Kya Nahi',
    answer:
      `Bahut log "RO service centre Patna" search karte hain. Saaf baat: hum kisi brand ke ` +
      `authorised service centre nahi hain. Hum ek swatantra RO service centre Patna me hain jo ` +
      `Kent, Aquaguard, Livpure, Pureit, AO Smith aur local assembled units — sabhi par kaam karta hai. ` +
      `Iska matlab ye hai ki hum aapko woh part bech sakte hain jo sach me chahiye, na ki sirf ` +
      `apne brand ka mehenga part.`,
  },
  {
    query: 'ro repair patna',
    heading: 'RO Repair Patna — Rate Pehle, Kaam Baad Me',
    answer:
      `RO repair Patna me karane se pehle rate jaan lijiye: visit charge ₹${SERVICE.visitCharge}, ` +
      `filter/candle ₹150 se, membrane ₹1,100 se, booster pump ₹1,400 se, SMPS ₹800 se. ` +
      `Har kaam pe ${SERVICE.warrantyDays} din ki service warranty likhit me milti hai. ` +
      `Agar machine theek nahi ho paayi to sirf visit charge lagta hai, aur kuch nahi.`,
  },
  {
    query: 'water purifier service patna',
    heading: 'Water Purifier Service Patna — Sirf RO Nahi',
    answer:
      `Water purifier service Patna me hum sirf RO tak seemit nahi hain. UV lamp, UF membrane, ` +
      `alkaline aur copper cartridge, TDS controller — sab par kaam hota hai. ` +
      `Bahut ghar me machine RO+UV+UF hoti hai aur kharabi UV side me hoti hai; wahan poora ` +
      `membrane badalna paisa barbaad karna hai, aur hum wo nahi karte.`,
  },
  {
    query: 'ro service patna',
    heading: 'RO Service Patna — Ek Visit Me Kya Hota Hai',
    answer:
      `Ek normal RO service Patna visit me ye hota hai: TDS meter se input aur output paani ka ` +
      `reading, teeno pre-filter stage ki jaanch, membrane flow test, tank ki safai, ` +
      `leak aur pressure check, aur phir likhit me quote. Aap meter ki reading khud dekh sakte hain — ` +
      `bina reading dikhaye membrane badalne ki salah dene wale se saawdhan rahiye.`,
  },
  {
    query: 'ro service near me',
    heading: 'RO Service Near Me — Kaise Confirm Karein Ki Hum Aate Hain',
    answer:
      `"RO service near me" search karne ke baad sabse pehle ye confirm kijiye ki service ` +
      `waala aapke mohalle me sach me aata hai. Hamare paas Patna ke har coverage area ka ` +
      `apna page hai jisme uska pincode, wahan ka TDS range aur wahan sabse zyada hone wali ` +
      `kharabi likhi hai. Apna area khol kar dekh lijiye — agar wo list me hai to hum wahan jaate hain.`,
  },
];

/**
 * Brand-specific queries. Autocomplete ne "kent ro service patna",
 * "aquaguard ro service patna" aur "aquafresh ro service patna" suggest kiye —
 * teeno hamare live site pe ZERO the, jabki hamare paas 21 brand pages hain.
 *
 * Wajah: hamare brand page kehte hain "Kent RO Service in Patna" ("in" ke
 * saath). Log "kent ro service patna" type karte hain. Ye map wahi gap bharta
 * hai — brand page pe ek line, uske apne shabdon me.
 */
export const BRAND_QUERY_LINES: Record<string, string> = {
  kent:
    'Log aksar "Kent RO service Patna" search karte hain. Hum Kent ke authorised centre nahi hain — ' +
    'hum swatantra hain, isliye Kent ka original part bhi laga sakte hain aur uske barabar ka ' +
    'sasta compatible part bhi. Dono ka rate pehle bata dete hain, faisla aapka.',
  aquaguard:
    'Log aksar "Aquaguard RO service Patna" search karte hain. Aquaguard (Eureka Forbes) machine me ' +
    'sabse zyada UV lamp aur e-boiling card ki dikkat aati hai, membrane ki nahi — isliye hum ' +
    'pehle wahi check karte hain, kyunki wo kaafi sasta padta hai.',
  aquafresh:
    'Log aksar "Aquafresh RO service Patna" search karte hain. Aquafresh ke zyadatar model assembled ' +
    'hain, matlab spare part aasani se milta hai aur repair sasta padta hai. Naya machine bechne ' +
    'ki koshish karne wale se pehle dusri raay le lijiye.',
  livpure:
    'Log aksar "Livpure RO service Patna" search karte hain. Livpure ke rental model me machine ' +
    'company ki hoti hai — us case me hum chhoote nahi, seedha Livpure se hi karwaiye. Kharidi hui ' +
    'machine par hum poora kaam karte hain.',
  pureit:
    'Log aksar "Pureit RO service Patna" search karte hain. Pureit (HUL) ke kai model me Germkill Kit ' +
    'ek hi unit me aati hai, isliye uska rate alag padta hai — hum wo pehle hi bata dete hain, ' +
    'baad me surprise nahi dete.',
};

/** FAQ/QAPage schema ke liye — page pe dikh raha wahi text, entity ke saath. */
export function searchAnswerFaq() {
  return SEARCH_ANSWERS.map((a) => ({
    question: a.heading,
    answer: a.answer,
  }));
}

/**
 * Footer ki ek line — hamesha-visible text jisme sabse zaroori variants ek
 * hi jagah, ek hi sachche vaakya me aa jaate hain. Har page pe render hoti hai,
 * isliye ye chhoti aur imaandaar honi chahiye — list nahi, vaakya.
 */
export const COVERAGE_SENTENCE =
  `Aqua Perl Patna me RO service, RO repair aur water purifier service karta hai — ` +
  `Kent, Aquaguard, Livpure, Pureit aur baaki sabhi brand par. ` +
  `Visit charge ₹${SERVICE.visitCharge}, ${SERVICE.warrantyDays} din warranty, ` +
  `${GBP_RATING_TEXT}★ (${GBP.reviewCount} reviews). Call ${CONTACT.primaryPhone}.`;
