/**
 * SEARCH ANSWERS BLOCK
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYU (19 Sep 2026): Google Autocomplete se nikli chhe phrases —
 * "ro service patna near me", "ro service centre patna", "ro repair patna",
 * "water purifier service patna", "ro service patna", "ro service near me" —
 * poori 133-page live site pe EK BAAR BHI nahi thi.
 *
 * Wajah grammar thi, niyat nahi: hum "RO Repair in Patna" likhte hain, log
 * "ro repair patna" type karte hain. Google synonym samajhta hai, par jab
 * humse kamzor site upar hai to har signal ginta hai.
 *
 * Ye component un phrases ko POORE, kaam ke vaakya me rakhta hai. Har jawab
 * apne aap me padhne layak hai — agar koi line sirf keyword ke liye hoti to
 * wo yahan nahi honi chahiye thi.
 *
 * Data src/lib/seo/search-queries.ts se aata hai. Text sirf wahan badlo.
 */

import { SEARCH_ANSWERS } from '@/lib/seo/search-queries';

export default function SearchAnswers() {
  return (
    <section className="bg-white py-14 md:py-16" aria-labelledby="search-answers-heading">
      <div className="container mx-auto px-4">
        <h2
          id="search-answers-heading"
          className="mb-3 text-center font-display text-3xl font-extrabold text-navy-700"
        >
          RO Service Patna — Jo Log Sabse Zyada Poochhte Hain
        </h2>
        <p className="mx-auto mb-9 max-w-2xl text-center text-navy-500">
          Ye wahi sawaal hain jo Patna ke log Google par type karte hain. Seedhe jawab, bina ghumaye.
        </p>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          {SEARCH_ANSWERS.map((a) => (
            <article
              key={a.query}
              className="rounded-xl border border-navy-100 bg-navy-50/40 p-6"
            >
              <h3 className="mb-2 font-display text-lg font-bold text-navy-700">{a.heading}</h3>
              <p className="text-[15px] leading-relaxed text-navy-600">{a.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
