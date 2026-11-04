/**
 * MoneyKeywordBlock — paise wale sawaal, H2 me, apni-apni sahi page par.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 🔴 Ye kyun bana (4 Nov 2026) — andaza nahi, naap
 * ══════════════════════════════════════════════════════════════════════════
 *
 * kwscan (94 keyword) ka nateeja:
 *
 *     INTENT  —  2 heading me,  19 SIRF BODY ME  🔴
 *     SHOP    —  1 heading me,  16 sirf body me
 *     BRAND   —  8 heading me,  14 sirf body me
 *     PRIMARY — 10 heading me,   3 sirf body me
 *     NEARME  — 10 heading me,   2 sirf body me
 *
 * INTENT sabse bada gap tha — aur wahi sabse zyada paisa laata hai. Un 19
 * me se 17 sirf /ro-services-patna ke body text me pade the:
 *
 *     RO visit charge Patna · RO service charges Patna · RO repair price
 *     Patna · RO filter change cost Patna · RO membrane price Patna ·
 *     RO installation charges Patna · RO AMC price Patna · RO leakage fix
 *     Patna · RO TDS adjustment Patna · RO UV lamp replacement Patna ·
 *     RO pump repair Patna · Same-day RO service Patna · Cheap RO service
 *     Patna · Affordable RO repair Patna · RO repair at home Patna ...
 *
 * Ye sab ALAG-ALAG sawaal hain jinke jawab bhi alag hain. Ek hi page par
 * 17 H2 thoosna stuffing hota. Isliye har keyword us page par gaya jo us
 * kaam ka pehle se maalik hai:
 *
 *     RO filter change cost Patna   ->  /ro-filter-change-patna
 *     RO membrane price Patna       ->  /ro-membrane-replacement-patna
 *     RO installation charges Patna ->  /ro-installation-patna
 *     RO AMC price Patna            ->  /ro-amc-patna
 *     RO repair price Patna         ->  /ro-repair-patna
 *     RO service charges Patna      ->  /ro-service-in-patna
 *     RO visit charge Patna         ->  /ro-services-patna
 *
 * EK KEYWORD, EK PAGE. Ye wahi niyam hai jisse 27 Oct ko anchor
 * cannibalization theek hui thi.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 🔴 Likhte waqt jo dhyan rakha
 * ══════════════════════════════════════════════════════════════════════════
 *
 * • EXACT PHRASE. kwscan poora phrase dhoondhta hai. "RO Filter Change Cost
 *   IN Patna" likhte to "ro filter change cost patna" match hi nahi hota
 *   (gotcha #25). Isliye heading me "in" nahi hai.
 *
 * • "₹X onwards" EK BHI NAHI. verify-billing ka budget 17 par poora bhara
 *   hua hai. Yahan sirf range aur flat daam hain.
 *
 * • Har page par 1–5 H2, 11–23 maujooda H2 ke saath. Anupaat me hai,
 *   thoosa hua nahi lagta.
 *
 * • Jawab asli hain. Har H2 ke neeche us sawaal ka seedha jawab hai, sirf
 *   keyword dobara likh dena nahi — warna Google ise doorway maanta hai.
 *
 * • Ye component AREA PAGE par nahi chalta, isliye verify-area-depth ka
 *   60-character wala duplicate-sentence gate ispar lagu nahi hota.
 */

export type MoneyItem = {
  /** H2 — exact keyword phrase se shuru. "in" mat daalna. */
  h2: string;
  /** Seedha jawab. Chhote vaakye, asli jaankari. */
  lines: string[];
};

export default function MoneyKeywordBlock({
  items,
  title = 'Patna Me Kya Kharcha Aata Hai',
}: {
  items: readonly MoneyItem[];
  title?: string;
}) {
  if (!items.length) return null;
  return (
    <section
      data-money-keywords={items.length}
      className="border-t border-navy-50 bg-sand-50/60 py-12"
    >
      <div className="container mx-auto px-4">
        <p className="text-xs font-extrabold uppercase tracking-wide text-aqua-700">
          {title}
        </p>
        <div className="mt-5 grid gap-7 md:grid-cols-2">
          {items.map((it) => (
            <div key={it.h2} className="min-w-0">
              <h2 className="font-display text-lg font-bold text-navy-700">{it.h2}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {it.lines.join(' ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
