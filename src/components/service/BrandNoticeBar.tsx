/**
 * BrandNoticeBar — "hum authorised centre NAHI hain" ka saaf, do-bhasha notice.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 🔴 Ye kyun bana (3 Nov 2026, Google Ads appeal 6452978648 REJECT hone ke baad)
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Reject hone ke baad maine live site dobara naapi. Teen cheezein nikli:
 *
 *   1. 21 BRAND PAGE PAR POORA DISCLAIMER THA HI NAHI.
 *      /service-patna/brand/kent par "Kent" shabd 121 BAAR hai, title
 *      "Kent RO Service in Patna" hai, H1 bhi wahi — aur `BRAND_DISCLAIMER`
 *      us page par render hota hi nahi tha. Sirf footer ki 51-character
 *      wali chhoti line thi, page ke bilkul neeche.
 *      Google ki UBP policy ka pehla hi prohibition yahi hai:
 *      "Make it seem like you're supported by another brand when you're not."
 *      Ek page jo 121 baar ek brand ka naam leta ho aur jiske upar koi
 *      inkaar na ho — wo theek wahi shakal hai.
 *
 *   2. TRADEMARK ATTRIBUTION KAHIN NAHI THI.
 *      Brand page par "trademark" / "property of their respective owners"
 *      jaisa koi vaakya tha hi nahi (naapa gaya: False).
 *
 *   3. 🔴 SABSE BADI — POORA DISCLAIMER SIRF HINGLISH ME THA.
 *      "Aqua Perl ek swatantra RO service centre hai..." — Google ka
 *      reviewer aam taur par India me nahi hota. Wo ye padh hi nahi sakta.
 *      Humne fix to kiya tha, par jis aadmi ke liye kiya tha usko wo
 *      samajh hi nahi aaya. Isliye ab ENGLISH PEHLE, Hinglish uske baad.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Text kyun aisa likha hai (Google ki apni bhasha se milaya gaya)
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Google "nominative fair use" maanta hai — yaani doosre ka brand naam tab
 * istemal kar sakte ho jab:
 *   (a) us cheez ko pehchanane ke liye zaroori ho,
 *   (b) utna hi istemal ho jitna zaroori hai, aur
 *   (c) koi sponsorship ya affiliation ka bhram na ho.
 *
 * Isliye notice me teen baat hai, teeno jaan-boojh kar:
 *   • hum SWATANTRA hain                      → identity saaf
 *   • is brand ke (aur kisi bhi brand ke) authorised centre / dealer /
 *     distributor / partner NAHI hain         → affiliation ka inkaar
 *   • naam, logo aur trademark unke maalikon ke hain, sirf machine
 *     batane ke liye likhe gaye hain          → trademark attribution
 *
 * `brand` prop diya ho to naam le kar inkaar karta hai ("not an authorised
 * Kent service centre") — ye general line se kahin zyada saaf hai.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 🔴 Jo dhyan rakha gaya
 * ══════════════════════════════════════════════════════════════════════════
 *
 * • Ye component AREA PAGE par render nahi hota, isliye `verify-area-depth`
 *   ka 60-character wala duplicate-sentence gate ispar lagu nahi hota.
 *   (Footer wali chhoti line alag hai aur wo jaan-boojh kar <60 char hai.)
 *
 * • GLUE BUG (class A): har text node apne tag ke andar band hai, kisi
 *   inline tag ke bagal me nanga text nahi chhoda. Pattern ko yahan literal
 *   likhna bhi mana hai — detector apne hi comment ko pakad leta hai.
 *
 * • `role="note"` + `aria-label` — screen reader aur crawler dono ko saaf
 *   dikhe ki ye ek disclaimer hai, sajawat nahi.
 *
 * • Koi `hidden`, `display:none`, ya chhota-halka text nahi. Google chhupe
 *   hue disclaimer ko disclaimer nahi maanta.
 */
import { BRAND } from '@/lib/constants';

export type BrandNoticeBarProps = {
  /** Brand ka dikhne wala naam, jaise "Kent". Na do to general line aayegi. */
  brand?: string;
  /** Upar ka margin — page ke hisaab se. */
  className?: string;
};

export default function BrandNoticeBar({ brand, className = '' }: BrandNoticeBarProps) {
  const named = brand && brand.trim() ? brand.trim() : null;

  const english = named
    ? `${BRAND.legalName} is an independent water purifier repair business. We are NOT an authorised ${named} service centre, dealer, distributor or partner, and we are not affiliated with ${named} or with any other brand. ${named} and all other brand names, logos and trademarks shown on this page are the property of their respective owners, and are used here only to describe the machines we repair.`
    : `${BRAND.legalName} is an independent water purifier repair business. We are NOT an authorised service centre, dealer, distributor or partner of any brand, and we are not affiliated with any brand. All brand names, logos and trademarks shown on this page are the property of their respective owners, and are used here only to describe the machines we repair.`;

  const hinglish = named
    ? `Hindi me: Aqua Perl ek swatantra RO repair business hai. Hum ${named} ke — ya kisi bhi brand ke — authorised service centre ya dealer NAHI hain. Is page par diye gaye sabhi brand naam, logo aur trademark unke apne maalikon ki property hain, aur sirf ye batane ke liye likhe gaye hain ki hum kaun si machine theek karte hain.`
    : `Hindi me: Aqua Perl ek swatantra RO repair business hai. Hum kisi bhi brand ke authorised service centre ya dealer NAHI hain. Is page par diye gaye sabhi brand naam, logo aur trademark unke apne maalikon ki property hain, aur sirf ye batane ke liye likhe gaye hain ki hum kaun si machine theek karte hain.`;

  return (
    <aside
      role="note"
      aria-label="Independent service disclaimer"
      data-brand-notice={named ?? 'all'}
      className={`border-y border-amber-300 bg-amber-50 ${className}`}
    >
      <div className="container mx-auto px-4 py-5">
        <p className="text-sm font-extrabold uppercase tracking-wide text-amber-900">
          Independent service centre &mdash; not an authorised {named ?? 'brand'} centre
        </p>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-amber-900">
          {english}
        </p>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-amber-800">
          {hinglish}
        </p>
      </div>
    </aside>
  );
}
