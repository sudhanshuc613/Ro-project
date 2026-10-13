/**
 * AREA + CITY LABEL — "Patna Patna" wali galti ka ilaaj.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 KYA GALAT THA (13 Oct 2026 ko naap kar pakda)
 * ────────────────────────────────────────────────
 * Area page ka title aur H1 hamesha `${area.name}, Patna` jodta tha.
 * 83 me se 81 area ke liye ye bilkul sahi hai:
 *
 *     Kankarbagh  →  "RO Service in Kankarbagh, Patna"        ✅
 *
 * Par DO area ke naam me pehle se hi "Patna" hai:
 *
 *     AIIMS Patna →  "RO Service AIIMS Patna Patna ₹200"      🔴 Patna Patna
 *     Patna City  →  "RO Service Patna City Patna ₹200"       🔴 Patna Patna
 *
 * Teen nuksaan the:
 *
 * 1. **Dikhne me bewakoofi** — SERP me "Patna Patna" padh kar grahak ko lagta
 *    hai site auto-generated spam hai. Click-through girta hai.
 *
 * 2. **Keyword stuffing ka signal** — Google ka spam policy repeated-keyword
 *    title ko "keyword stuffing" maanta hai. Title rewrite hone ka risk
 *    badh jaata hai (Google waise bhi ~55% title badal deta hai).
 *
 * 3. 🔴 **CANNIBALIZATION** — `patna-city` ka H1 tha
 *    "RO Service in Patna City, Patna", jisme exact phrase
 *    **"RO Service in Patna"** chhupa hua tha. Yani ek area page hamare
 *    sabse keemti page — `/ro-service-in-patna`, jo **Google Ads ka landing
 *    page** hai — se wahi head keyword ke liye lad raha tha.
 *    Jis page par paisa lag raha hai, uske saath ladna sabse mehngi galti hai.
 *
 * ── ILAAJ ───────────────────────────────────────────────────────────────
 * Sirf tab ", Patna" jodo jab area ke naam me pehle se "Patna" na ho.
 *
 *     areaCityLabel('Kankarbagh')   →  'Kankarbagh, Patna'
 *     areaCityLabel('AIIMS Patna')  →  'AIIMS Patna'
 *     areaCityLabel('Patna City')   →  'Patna City'
 *
 * 81 area par output bilkul wahi rehta hai jo pehle tha — **koi ranking
 * hili nahi**. Sirf 2 page theek hote hain.
 *
 * `areaCityTitle()` title ke liye hai, jahan comma nahi lagta:
 *     areaCityTitle('Kankarbagh')   →  'Kankarbagh Patna'
 *     areaCityTitle('AIIMS Patna')  →  'AIIMS Patna'
 */

/** Naam me "patna" shabd pehle se hai? (poora shabd, substring nahi) */
export function nameHasCity(areaName: string): boolean {
  return /\bpatna\b/i.test(areaName);
}

/** H1 / schema ke liye: "Kankarbagh, Patna" · "AIIMS Patna" */
export function areaCityLabel(areaName: string): string {
  return nameHasCity(areaName) ? areaName : `${areaName}, Patna`;
}

/** Title ke liye (bina comma): "Kankarbagh Patna" · "AIIMS Patna" */
export function areaCityTitle(areaName: string): string {
  return nameHasCity(areaName) ? areaName : `${areaName} Patna`;
}
