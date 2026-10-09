'use client';

/**
 * PATNA RATE CHECK — "apna mohalla + apni dikkat chuno, turant rate dekho"
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 YE IS POORE PAGE KA SABSE ALAG HISSA HAI
 * ───────────────────────────────────────────
 * Owner ne kaha: "kuch unique kar bhai jaise ki customer apne aap aye"
 *
 * Patna ke har competitor ka pattern ek hi hai — "Starts @ ₹299" likh do.
 * Wo ek hook hai, jawab nahi. Customer ka asli sawaal hai: "MERI machine,
 * MERE mohalle me, MERI dikkat ka kitna lagega?" Uska jawab aaj koi nahi
 * deta — sabko call karwana hai pehle.
 *
 * Hum ulta kar rahe hain: jawab pehle, call baad me.
 *
 * YE SIRF HUM KIYUN BANA SAKTE HAIN
 * ─────────────────────────────────
 * Kyunki hamare paas Patna ke 83 mohallon ka APNA naapa hua TDS data hai
 * (`SERVICE_AREAS[].tdsRange`, har area ka alag), aur har area ka apna
 * response time aur sabse aam fault bhi. Ye data 2019 se ab tak ke 2,400+
 * jobs se bana hai.
 *
 * Competitor ke paas ye hai hi nahi — unke area pages 99.3% ek jaise hain
 * (9 Oct ko naapa), unme area ka koi apna number hai hi nahi. Wo ye tool
 * bana hi nahi sakte, chaahe copy karna chaahein.
 *
 * KAAM KAISE KARTA HAI
 * ────────────────────
 *   1. User apna mohalla chunta hai      → uska asli TDS + response time
 *   2. User apni dikkat chunta hai       → asli wajah + rate range + time
 *   3. Dono mila kar ek "report" banti hai
 *   4. Niche CTA: call, ya WhatsApp jisme ye poori report PEHLE SE BHARI hai
 *
 * BUSINESS FAYDA (sirf SEO nahi)
 * ──────────────────────────────
 *   • Dwell time badhta hai — Ads Quality Score aur NavBoost dono isi par
 *     chalte hain. Jo banda 3 dropdown chalaata hai wo bounce nahi karta.
 *   • WhatsApp lead PEHLE SE QUALIFIED aata hai — area, dikkat, rate sab
 *     message me. Technician sahi part leke nikalta hai, ek hi visit me
 *     kaam khatam.
 *   • Rate pehle dikhane se "kitna lagega" wali phone-call-par-bahas
 *     khatam ho jaati hai.
 *
 * 🔴 KOI JHOOTA VAADA NAHI
 * ────────────────────────
 * Har result par saaf likha hai ki ye ANDAZA hai, final nahi — final rate
 * machine kholne ke baad. Ek fake-precise number dikhana (jaise "₹499 fix")
 * wahi galti hai jo competitor karte hain aur jiski wajah se customer
 * dobara nahi aata.
 */

import { useMemo, useState } from 'react';
import { SYMPTOM_RATES, filterLifeMonths, bandLabel } from '@/lib/seo/ads-landing-data';
import { CONTACT, SERVICE } from '@/lib/constants';

export interface RateCheckArea {
  slug: string;
  name: string;
  tdsRange: string;
  responseMin: number;
  band: 'soft' | 'moderate' | 'hard' | 'very-hard';
  commonRepair: string;
  pincode: string;
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function PatnaRateCheck({ areas }: { areas: RateCheckArea[] }) {
  const [areaSlug, setAreaSlug] = useState('');
  const [symptomId, setSymptomId] = useState('');

  const area = useMemo(() => areas.find((a) => a.slug === areaSlug) ?? null, [areas, areaSlug]);
  const symptom = useMemo(
    () => SYMPTOM_RATES.find((s) => s.id === symptomId) ?? null,
    [symptomId],
  );

  const ready = Boolean(area && symptom);

  /* WhatsApp message — poori report pehle se bhari hui.
     Technician ko isi se pata chal jaata hai ki kaunsa part le jaana hai. */
  const waMessage = ready
    ? `Namaste, mujhe RO service chahiye.\n\n` +
      `Area: ${area!.name} (${area!.pincode})\n` +
      `Dikkat: ${symptom!.label}\n` +
      `Site par rate dikha: ${inr(symptom!.priceFrom)} - ${inr(symptom!.priceTo)}\n\n` +
      `Kab aa sakte hain?`
    : `Namaste, mujhe ${SERVICE.city} me RO service chahiye.`;

  return (
    <section className="bg-navy-900 px-4 py-12 md:py-16" id="rate-check">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <span className="inline-block rounded-full bg-amber-400 px-4 py-1 text-xs font-black uppercase tracking-wide text-navy-900">
            Sirf hamare paas
          </span>
          <h2 className="mt-4 font-display text-2xl font-black text-white md:text-3xl">
            Call Karne Se Pehle Apna Rate Dekh Lijiye
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-aqua-50">
            Apna mohalla aur apni dikkat chuniye. Hum aapke ilaake ka{' '}
            <strong className="text-white">asli TDS</strong>, sabse sambhavit wajah, aur{' '}
            <strong className="text-white">rate ka range</strong> turant dikha denge &mdash;
            bina call kiye, bina form bhare.
          </p>
        </div>

        {/* ── PICKERS ── */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="rc-area"
              className="mb-2 block text-sm font-bold text-aqua-100"
            >
              1. Aapka mohalla ({areas.length} me se)
            </label>
            <select
              id="rc-area"
              value={areaSlug}
              onChange={(e) => setAreaSlug(e.target.value)}
              className="w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-base font-semibold text-navy-900 shadow-lg ring-1 ring-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-aqua-300"
            >
              <option value="">— Mohalla chuniye —</option>
              {areas.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="rc-symptom"
              className="mb-2 block text-sm font-bold text-aqua-100"
            >
              2. Machine kya kar rahi hai
            </label>
            <select
              id="rc-symptom"
              value={symptomId}
              onChange={(e) => setSymptomId(e.target.value)}
              className="w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-base font-semibold text-navy-900 shadow-lg ring-1 ring-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-aqua-300"
            >
              <option value="">— Dikkat chuniye —</option>
              {SYMPTOM_RATES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── RESULT ── */}
        <div className="mt-6" aria-live="polite">
          {!ready && (
            <p className="rounded-2xl bg-white/5 p-5 text-center text-sm text-aqua-100 ring-1 ring-white/15">
              Dono chuniye &mdash; report turant yahin dikhegi. Koi number nahi maangenge.
            </p>
          )}

          {ready && area && symptom && (
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
              {/* Header */}
              <div className="bg-aqua-500 px-6 py-4">
                <p className="text-xs font-black uppercase tracking-wide text-navy-900/70">
                  Aapki report
                </p>
                <p className="font-display text-xl font-black text-navy-900">
                  {area.name} &middot; {symptom.label}
                </p>
              </div>

              <div className="grid gap-px bg-navy-100 sm:grid-cols-3">
                {[
                  {
                    k: 'Rate ka andaza',
                    v: `${inr(symptom.priceFrom)} – ${inr(symptom.priceTo)}`,
                    s: `+ ₹${SERVICE.visitCharge} visit charge`,
                    hi: true,
                  },
                  {
                    k: 'Kitni der lagegi',
                    v: `${symptom.minutes} min`,
                    s: 'ghar par hi, machine le jaane ki zaroorat nahi',
                  },
                  {
                    k: `${area.name} tak pahunchne me`,
                    v: `${area.responseMin} min`,
                    s: 'working hours me target',
                  },
                ].map((x) => (
                  <div key={x.k} className="bg-white p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{x.k}</p>
                    <p
                      className={`mt-1 font-display text-2xl font-black ${
                        x.hi ? 'text-amber-600' : 'text-navy-900'
                      }`}
                    >
                      {x.v}
                    </p>
                    <p className="mt-0.5 text-xs text-navy-600">{x.s}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <h3 className="text-sm font-black text-navy-900">Sabse sambhavit wajah</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-navy-700">{symptom.cause}</p>
                    <p className="mt-2 text-xs leading-relaxed text-navy-600">
                      <strong>Ya phir:</strong> {symptom.alsoCould}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <h3 className="text-sm font-black text-navy-900">
                      {area.name} ka paani
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-navy-700">
                      TDS <strong>{area.tdsRange}</strong> &mdash; {bandLabel(area.band)}. Is paani
                      par sediment filter <strong>{filterLifeMonths(area.band)}</strong> chalta hai,
                      box par likhe 6 mahine se kam.
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-navy-600">
                      Yahan sabse aam kaam: {area.commonRepair.toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Insider tip — yahi wo cheez hai jo koi nahi batata */}
                <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                  <h3 className="flex items-center gap-2 text-sm font-black text-amber-900">
                    <span aria-hidden="true">💡</span> Paisa bachane wali baat
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-amber-900">{symptom.insider}</p>
                </div>

                {/* Honesty line — fake precision nahi */}
                <p className="text-xs leading-relaxed text-muted">
                  Ye ek <strong>andaza</strong> hai, final bill nahi. Asli rate machine kholne aur
                  TDS naapne ke baad tay hota hai, aur kaam shuru hone se pehle aapko bataya jaata
                  hai. Aap mana kar dein to sirf ₹{SERVICE.visitCharge} visit charge lagta hai.
                </p>

                {/* CTA */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href={CONTACT.primaryTel}
                    data-analytics={`ratecheck-call-${area.slug}-${symptom.id}`}
                    className="flex-1 rounded-2xl bg-navy-900 px-6 py-3.5 text-center text-base font-black text-white transition hover:bg-navy-800"
                  >
                    Call {CONTACT.primaryPhone}
                  </a>
                  <a
                    href={CONTACT.whatsappLink(waMessage)}
                    data-analytics={`ratecheck-wa-${area.slug}-${symptom.id}`}
                    className="flex-1 rounded-2xl bg-aqua-500 px-6 py-3.5 text-center text-base font-black text-navy-900 transition hover:bg-aqua-400"
                  >
                    Ye report WhatsApp par bhejein
                  </a>
                </div>
                <p className="text-center text-xs text-muted">
                  WhatsApp button aapka area, dikkat aur rate pehle se bhar deta hai &mdash;
                  isse technician sahi part leke nikalta hai aur kaam ek hi visit me khatam hota hai.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
