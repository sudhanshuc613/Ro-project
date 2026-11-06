/**
 * GOOGLE TAG OVERRIDE — GTM / GA4 / Ads ki ID admin se badalne ke liye.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN (6 Nov 2026)
 * ─────────────────
 * Owner: "iss google tag ko laga de naya wala hai ye ... aur admin panel mai
 *         ek aisa option bhi de dena taki mai future mai khud se tag ka code
 *         badal saku"
 *
 * Wo bilkul sahi hai. Ab tak har tag ID `constants.ts` me likhi thi — matlab
 * Google Ads me ek naya tag banate hi poora code change + deploy. GBP rating
 * (18 Oct), rate card (10 Oct) aur site images (10 Oct) ke liye yahi problem
 * pehle hi hal ho chuki hai; wahi pattern yahan laga rahe hain.
 *
 * Ab saari ID `site_settings` ke `analytics` key me rehti hain aur
 * /admin/settings → "Google Tag" card se badalti hain. Save karte hi live.
 *
 * 🔴 CODE KI ID HI DEFAULT HAI
 * ────────────────────────────
 * DB me kuch na ho, ya DB hi na chale — `resolveAnalytics(null)` wahi ID
 * laut aata hai jo `constants.ts` me likhi hai. Matlab ye badlav kabhi
 * tracking gayab nahi kar sakta.
 *
 * 🔴 GALAT ID = TRACKING CHUP-CHAAP BAND
 * ──────────────────────────────────────
 * Ek typo (G-JP9HDZ9SE_ ya GTM-WZHCV54) par Google ka script 404 deta hai
 * aur koi error nahi dikhta — mahino baad pata chalta hai ki data hi nahi
 * aaya. Isliye har field ka format yahan JAANCHA jaata hai, aur jaanch fail
 * hone par us field ka override CHHOD diya jaata hai (code wali ID chalti
 * rehti hai). Aadha-adhoora save kabhi tracking nahi todta.
 *
 * Ye saari ID PUBLIC hoti hain — har visitor page source me dekh sakta hai.
 * Isliye code/DB me rakhna bilkul safe hai, ye secret nahi hain.
 */

import { ANALYTICS } from '@/lib/constants';

/* ── Format jaanch ─────────────────────────────────────────────────────────
   Google ki apni documentation se liye gaye format:
     GTM container  GTM- ke baad 5–10 bade akshar/ank   (GTM-WZHCV54L)
     GA4 stream     G-   ke baad 8–12 bade akshar/ank   (G-JP9HDZ9SE3)
     Google Ads     AW-  ke baad 9–13 ank               (AW-610913435,
                                                         AW-18555090295)
     Conversion
     label          8–40 akshar/ank/_/-                 (a2mmCJe5zfgaEJuZp6MC)

   🔴 Ads ID ab 11 ank ki bhi aati hai (naye account). Purana `\d{9,}` regex
   usko bhi pass karta tha, par upper bound na hone se 40-ank ka kachra bhi
   pass ho jaata. Ab dono taraf seema hai. */
export const GTM_RE = /^GTM-[A-Z0-9]{5,10}$/;
export const GA_RE = /^G-[A-Z0-9]{8,12}$/;
export const AW_RE = /^AW-\d{9,13}$/;
export const LABEL_RE = /^[A-Za-z0-9_-]{8,40}$/;

/** DB me jo save hota hai. Har field optional — adhoora row bhi chalta hai. */
export interface AnalyticsOverride {
  gtmId?: string;
  gtmEnabled?: boolean;
  gaId?: string;
  gaEnabled?: boolean;
  adsId?: string;
  adsEnabled?: boolean;
  adsCallLabel?: string;
  adsFormLabel?: string;
  adsPurchaseLabel?: string;
}

/** Resolve hone ke baad jo site use karti hai. Har field pakka maujood. */
export interface AnalyticsValues {
  /** GTM-XXXXXXX — khaali string matlab GTM lagana hi nahi hai. */
  gtmId: string;
  gtmEnabled: boolean;
  gaId: string;
  gaEnabled: boolean;
  adsId: string;
  adsEnabled: boolean;
  adsCallLabel: string;
  adsFormLabel: string;
  adsPurchaseLabel: string;
  /** GTM sach me load hoga? ID sahi + switch on. */
  gtmActive: boolean;
  /** GA4 ka apna gtag script load hoga? */
  gaActive: boolean;
  /** Ads base tag load hoga? */
  adsActive: boolean;
}

/**
 * Code ki ID — jab DB khaali ho ya galat ho.
 *
 * 🔴 gtmId yahan KHAALI NAHI rakha gaya, aur ye soch samajh kar hai.
 * Site ke 217 page BUILD ke waqt static bante hain aur tag ki ID usi waqt
 * HTML me pak jaati hai. Khaali default rakhte to naye deploy ke baad har
 * page bina GTM ke banta — jab tak owner admin me jaa kar save na dabaye.
 * 6 Nov ko test me bilkul yahi hua tha. Isliye code me default, admin me
 * override.
 */
export const ANALYTICS_FALLBACK: AnalyticsValues = {
  gtmId: ANALYTICS.gtmId,
  gtmEnabled: true,
  gaId: ANALYTICS.gaId,
  gaEnabled: true,
  adsId: ANALYTICS.adsId,
  adsEnabled: true,
  adsCallLabel: ANALYTICS.adsCallLabel,
  adsFormLabel: ANALYTICS.adsFormLabel,
  adsPurchaseLabel: ANALYTICS.adsPurchaseLabel,
  gtmActive: GTM_RE.test(ANALYTICS.gtmId),
  gaActive: GA_RE.test(ANALYTICS.gaId),
  adsActive: AW_RE.test(ANALYTICS.adsId),
};

/** Upper/lower case se farak na pade — Google ki ID hamesha upper case hoti hai. */
const norm = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const normId = (v: unknown): string => norm(v).toUpperCase();
const bool = (v: unknown, dflt: boolean): boolean => (typeof v === 'boolean' ? v : dflt);

/**
 * DB ka override code ki ID par lagao.
 *
 * Har field alag se jaanchi jaati hai. Ek field galat hone se baaki fields
 * ka override nahi girta — sirf us ek field par code wali value chalti hai.
 * Isse ek typo poori tracking band nahi kar sakta.
 */
export function resolveAnalytics(
  override: AnalyticsOverride | null | undefined,
): AnalyticsValues {
  if (!override) return ANALYTICS_FALLBACK;

  /**
   * 🔴 TEEN HAALAT ALAG-ALAG HAIN — 6 Nov 2026 ko apne hi test ne pakda.
   * ────────────────────────────────────────────────────────────────────
   *   field hai hi nahi (undefined)  →  code wali ID chalao
   *   field hai par khaali ('')      →  owner ne JAAN BOOJH KAR hataya
   *   field hai par galat            →  code wali ID chalao
   *
   * Pehle maine pehli aur doosri haalat ko ek hi maan liya tha. Natija:
   * owner sirf GTM ki ID save karta (DB row me gaId hota hi nahi), aur
   * poori GA4 tracking chup-chaap band ho jaati. Mahino pata na chalta.
   *
   * Yahi wo bug hai jiska owner ko dar hai, isliye uska apna test hai:
   * "GTM aane se GA4 nahi girta".
   */
  const pick = (raw: unknown, re: RegExp, fb: string): string => {
    if (raw === undefined || raw === null) return fb;
    const v = normId(raw);
    if (v === '') return '';
    return re.test(v) ? v : fb;
  };

  const gtmId = pick(override.gtmId, GTM_RE, ANALYTICS_FALLBACK.gtmId);
  const gaId = pick(override.gaId, GA_RE, ANALYTICS_FALLBACK.gaId);
  const adsId = pick(override.adsId, AW_RE, ANALYTICS_FALLBACK.adsId);

  const lbl = (v: unknown, fb: string): string => {
    if (v === undefined || v === null) return fb;
    const s = norm(v);
    if (s === '') return '';
    return LABEL_RE.test(s) ? s : fb;
  };

  const gtmEnabled = bool(override.gtmEnabled, ANALYTICS_FALLBACK.gtmEnabled);
  const gaEnabled = bool(override.gaEnabled, ANALYTICS_FALLBACK.gaEnabled);
  const adsEnabled = bool(override.adsEnabled, ANALYTICS_FALLBACK.adsEnabled);

  return {
    gtmId,
    gtmEnabled,
    gaId,
    gaEnabled,
    adsId,
    adsEnabled,
    adsCallLabel: lbl(override.adsCallLabel, ANALYTICS_FALLBACK.adsCallLabel),
    adsFormLabel: lbl(override.adsFormLabel, ANALYTICS_FALLBACK.adsFormLabel),
    adsPurchaseLabel: lbl(override.adsPurchaseLabel, ANALYTICS_FALLBACK.adsPurchaseLabel),
    gtmActive: gtmEnabled && GTM_RE.test(gtmId),
    gaActive: gaEnabled && GA_RE.test(gaId),
    adsActive: adsEnabled && AW_RE.test(adsId),
  };
}

/**
 * Admin form ke liye — value theek hai ya nahi, aur kyun nahi.
 * API route aur UI dono yahi message dikhate hain, taaki do jagah do alag
 * baat na likhi ho.
 */
export function validateAnalytics(o: AnalyticsOverride): string[] {
  const errs: string[] = [];
  const gtm = normId(o.gtmId);
  const ga = normId(o.gaId);
  const aw = normId(o.adsId);

  if (gtm !== '' && !GTM_RE.test(gtm)) {
    errs.push('GTM container ID aisi dikhti hai: GTM-WZHCV54L (GTM- ke baad 5 se 10 akshar/ank)');
  }
  if (ga !== '' && !GA_RE.test(ga)) {
    errs.push('GA4 measurement ID aisi dikhti hai: G-JP9HDZ9SE3 (G- ke baad 8 se 12 akshar/ank)');
  }
  if (aw !== '' && !AW_RE.test(aw)) {
    errs.push('Google Ads ID aisi dikhti hai: AW-610913435 (AW- ke baad 9 se 13 ank)');
  }

  for (const [k, label] of [
    ['adsCallLabel', 'Call conversion label'],
    ['adsFormLabel', 'Form conversion label'],
    ['adsPurchaseLabel', 'Purchase conversion label'],
  ] as const) {
    const v = norm(o[k]);
    if (v !== '' && !LABEL_RE.test(v)) {
      errs.push(`${label} aisa dikhta hai: a2mmCJe5zfgaEJuZp6MC (8 se 40 akshar, ank, _ ya -)`);
    }
  }

  /* 🔴 Label bina Ads ID ke bekaar hai — conversion kahan bheje? Ye chup-chaap
     fail hone wali galti hai, isliye save hi nahi hone dete. */
  if (aw === '' && (norm(o.adsCallLabel) || norm(o.adsFormLabel) || norm(o.adsPurchaseLabel))) {
    errs.push('Conversion label bhara hai par Google Ads ID khaali hai — label bina ID ke kaam nahi karta');
  }

  /* 🔴 Switch on par ID khaali = kuch nahi hoga, aur owner samjhega chal raha
     hai. Ye sabse khatarnaak halat hai, isliye saaf bolte hain. */
  if (bool(o.gtmEnabled, true) && gtm === '') {
    errs.push('GTM ka switch ON hai par container ID khaali hai — ya ID bharo ya switch OFF karo');
  }

  return errs;
}

/**
 * Google ke diye hue kisi bhi code me se ID dhoondh lo.
 *
 * 🔴 KYUN YE ZAROORI HAI
 * Google kabhi khaali ID nahi deta — hamesha poora `<script>` block deta
 * hai. Owner se ye ummeed karna ki wo us code me se `GTM-WZHCV54L` haath
 * se chhaant kar nikaale, yahin galti hoti hai: ek akshar chhoot gaya to
 * Google ka script 404 deta hai, koi error nahi dikhta, aur mahino baad
 * pata chalta hai ki data hi nahi aaya.
 *
 * Teeno shakal handle hoti hain:
 *   gtm.js?id=GTM-XXXXXXX            Google tag / GTM container
 *   gtag/js?id=G-XXXXXXXXXX          GA4 data stream
 *   gtag('config', 'AW-123456789')   Google Ads base tag
 *   send_to: 'AW-123456789/aBcD…'    conversion event snippet
 *
 * 🔴 Ye function browser-only file me nahi rakha gaya. 10 Oct 2026 wala
 * bug: client-boundary wali file se non-component export karne par Next
 * use ek "client reference" bana deta hai aur server par call karte hi
 * 500 aata hai — tsc ko dikhta bhi nahi. Isliye logic yahan, UI wahan.
 */
export function extractIds(text: string): {
  gtmId?: string;
  gaId?: string;
  adsId?: string;
  adsPurchaseLabel?: string;
} {
  const t = text.toUpperCase();
  const out: { gtmId?: string; gaId?: string; adsId?: string; adsPurchaseLabel?: string } = {};

  const gtm = t.match(/GTM-[A-Z0-9]{5,10}/);
  if (gtm) out.gtmId = gtm[0];

  const ga = t.match(/G-[A-Z0-9]{8,12}/);
  if (ga) out.gaId = ga[0];

  const aw = t.match(/AW-\d{9,13}/);
  if (aw) out.adsId = aw[0];

  /* Conversion label hamesha `AW-123/LABEL` ki shakal me aata hai. Label me
     chhote aur bade dono akshar hote hain, isliye match ORIGINAL text par
     hota hai — upper-case wali copy par nahi, warna label bigad jaata. */
  const label = text.match(/AW-\d{9,13}\/([A-Za-z0-9_-]{8,40})/);
  if (label) out.adsPurchaseLabel = label[1];

  return out;
}

/**
 * Do tag ek hi cheez to nahi bhej rahe?
 *
 * 🔴 ASLI KHATRA (6 Nov 2026 ko naapa gaya)
 * Agar GTM container ke andar bhi wahi GA4 ya Ads ID daali ho jo site khud
 * se bhej rahi hai, to har page view DO baar ginega. GA4 ki report me
 * sessions double, bounce rate aadha, aur Google Ads me ek call do
 * conversion — Smart Bidding seedha galat seekhega.
 *
 * Container ke andar kya hai ye browser se nahi pata chal sakta (wo Google
 * ke server par rehta hai), isliye ye function sirf wahi batata hai jo hum
 * JAANTE hain: site khud kaun si ID bhej rahi hai. Admin card is list ko
 * dikhata hai taaki owner GTM me jaa kar mila sake.
 */
export function duplicateRisk(a: AnalyticsValues): string[] {
  const out: string[] = [];
  if (a.gtmActive && a.gaActive) {
    out.push(`GTM bhi chal raha hai aur site khud bhi GA4 (${a.gaId}) bhej rahi hai. Agar GTM container ke andar bhi yahi GA4 ID hai to page view DO baar ginega.`);
  }
  if (a.gtmActive && a.adsActive) {
    out.push(`GTM bhi chal raha hai aur site khud bhi Google Ads (${a.adsId}) bhej rahi hai. Agar GTM container me bhi yahi Ads ID hai to ek conversion do baar ginegi.`);
  }
  return out;
}
