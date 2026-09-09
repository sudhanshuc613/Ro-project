'use client';

/**
 * TDS CHECKER — the lead magnet nobody in this market has.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT IT DOES
 * ────────────
 * Customer picks their area (or types a pincode), enters the TDS reading from
 * their own meter if they have one, and gets a straight verdict: is the
 * machine working, which membrane size is right for that water, and what the
 * next service is likely to cost.
 *
 * WHY THIS IS THE RIGHT TOOL TO BUILD
 * ───────────────────────────────────
 * Measured 9 Sep 2026 across every competitor ranking in Patna:
 *
 *     urbancompany   price shown · slot picker · referral · app
 *     rocareindia    loyalty coins · OTP · live tracking · app
 *     everyone else  nothing
 *
 * None of them has a diagnostic tool, and none of them CAN build a useful one
 * — it requires measured TDS data for every locality, which only comes from
 * actually servicing there. This site has that for 63 localities. It is the
 * one feature a Gurgaon call centre cannot copy by spending money.
 *
 * WHY IT CONVERTS
 * ───────────────
 * A visitor who has just been told "your rejection is 62%, the membrane is
 * finished, it is ₹1,100 to ₹1,400 in your area" has been given a diagnosis
 * before paying anything. The ask that follows is not "trust us", it is
 * "book the thing you now know you need".
 *
 * HONESTY CONSTRAINT
 * ──────────────────
 * The tool says "your machine is fine, do not call us" whenever the numbers
 * say so. That is deliberate. A diagnostic that always recommends a service
 * is an advert, and people can tell.
 *
 * NO DATA IS SENT ANYWHERE
 * ────────────────────────
 * Everything runs client-side. Nothing is posted, nothing is stored. Stated
 * on the component so the visitor knows.
 */

import { useMemo, useState } from 'react';
import { SERVICE_AREAS } from '@/lib/seo/patna-service-data';
import { tdsBand } from '@/lib/seo/area-depth';
import { CONTACT, SERVICE } from '@/lib/constants';
import AreaPicker from '@/components/home/AreaPicker';

/** BIS IS 10500 — acceptable 500 mg/L, permissible 2000 mg/L. */
const BIS_ACCEPTABLE = 500;

type Verdict = {
  tone: 'good' | 'watch' | 'act';
  headline: string;
  detail: string;
  action: string | null;
  cost: string | null;
};

function verdictFor(inTds: number, outTds: number | null, areaHigh: number): Verdict {
  /* No output reading — we can still say something useful about the source. */
  if (outTds === null) {
    if (inTds <= BIS_ACCEPTABLE) {
      return {
        tone: 'good',
        headline: `${inTds} ppm — BIS limit ke andar`,
        detail: `BIS IS 10500 ka acceptable limit ${BIS_ACCEPTABLE} mg/L hai. Aapka source uske andar hai, to RO yahan safety aur consistency ke liye hai, majboori nahi. 75 GPD membrane kaafi hai.`,
        action: null,
        cost: null,
      };
    }
    if (inTds <= 1000) {
      return {
        tone: 'watch',
        headline: `${inTds} ppm — limit se upar`,
        detail: `Ye ${BIS_ACCEPTABLE} mg/L ke acceptable limit se ${inTds - BIS_ACCEPTABLE} mg/L zyada hai, par 2000 ke permissible bound se kaafi neeche. RO chahiye, aur 500 se upar hone ki wajah se 100 GPD membrane lamba chalega.`,
        action: '100 GPD membrane recommend',
        cost: '₹1,400 se',
      };
    }
    return {
      tone: 'act',
      headline: `${inTds} ppm — bahut hard`,
      detail: `Ye acceptable limit ka ${(inTds / BIS_ACCEPTABLE).toFixed(1)}× hai. Domestic RO ki upper range hai — 100 GPD zaroori hai, aur pre-treatment se membrane ki umar kaafi badh jaati hai.`,
      action: '100 GPD + pre-treatment check',
      cost: '₹1,400 se',
    };
  }

  const rejection = inTds > 0 ? ((inTds - outTds) / inTds) * 100 : 0;

  if (rejection >= 90) {
    return {
      tone: 'good',
      headline: `${Math.round(rejection)}% rejection — machine bilkul theek hai`,
      detail: `Input ${inTds} ppm, output ${outTds} ppm. Healthy membrane 85-95% dissolved solids nikalta hai — aapki machine us range ke upper end pe hai. Membrane badalne ki koi zaroorat nahi. Agar koi aur dikkat hai to wo membrane ki nahi hai.`,
      action: null,
      cost: null,
    };
  }

  if (rejection >= 80) {
    return {
      tone: 'good',
      headline: `${Math.round(rejection)}% rejection — theek chal rahi hai`,
      detail: `Input ${inTds} ppm, output ${outTds} ppm. Ye normal working range me hai. Membrane abhi kaam kar raha hai. Agli baar reading lena aur compare karna — girti hui reading hi asli signal hai, ek single number nahi.`,
      action: 'Filter schedule check kar lo',
      cost: null,
    };
  }

  if (rejection >= 65) {
    return {
      tone: 'watch',
      headline: `${Math.round(rejection)}% rejection — girna shuru ho gaya`,
      detail: `Input ${inTds} ppm, output ${outTds} ppm. 80% se neeche aa gaya hai. Pehle pre-filter aur carbon check karwao — thaka hua carbon membrane ko chup-chaap khatam karta hai. Agar wo theek hain to membrane apni umar pe pahunch raha hai.`,
      action: 'Pehle carbon + sediment check',
      cost: '₹350 se',
    };
  }

  return {
    tone: 'act',
    headline: `${Math.round(rejection)}% rejection — membrane khatam`,
    detail: `Input ${inTds} ppm, output ${outTds} ppm. 65% se neeche matlab membrane apna kaam nahi kar raha. Naya membrane lagane ke baad output turant girna chahiye — hum lagane se pehle aur baad me dono reading dikhate hain.`,
    action: areaHigh > 500 ? '100 GPD membrane' : '75 GPD membrane',
    cost: areaHigh > 500 ? '₹1,400 se' : '₹1,100 se',
  };
}

export default function TdsChecker() {
  const [areaSlug, setAreaSlug] = useState('');
  const [inTds, setInTds] = useState('');
  const [outTds, setOutTds] = useState('');

  const area = useMemo(
    () => SERVICE_AREAS.find((a) => a.slug === areaSlug),
    [areaSlug],
  );

  /* If they have not measured, fall back to the midpoint of the band we
     measured in their locality — still honest, and clearly labelled. */
  const areaHigh = useMemo(() => {
    if (!area) return 600;
    const nums = area.tdsRange.match(/\d+/g)?.map(Number) ?? [600];
    return nums[nums.length - 1];
  }, [area]);

  const inNum = Number(inTds);
  const outNum = outTds.trim() === '' ? null : Number(outTds);
  const ready = inTds.trim() !== '' && inNum > 0 && inNum < 5000;
  const verdict = ready ? verdictFor(inNum, outNum, areaHigh) : null;

  const tone = {
    good: 'border-emerald-300 bg-emerald-50',
    watch: 'border-amber-300 bg-amber-50',
    act: 'border-red-300 bg-red-50',
  };
  const toneText = {
    good: 'text-emerald-900',
    watch: 'text-amber-900',
    act: 'text-red-900',
  };

  return (
    <section className="rounded-3xl border border-navy-100 bg-white p-5 shadow-card md:p-6">
      <h3 className="font-display text-xl font-extrabold text-navy-700">
        Apna RO khud check karo — 30 second
      </h3>
      <p className="mt-1 text-sm text-muted">
        TDS meter ki reading daalo. Hum batayenge machine theek hai ya nahi —
        aur agar theek hai to saaf keh denge ki kuch karne ki zaroorat nahi.
      </p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
            Aapka area (optional)
          </span>
          <AreaPicker value={areaSlug} onChange={setAreaSlug} id="tds-area" />
          {area && (
            <span className="mt-1 block text-[11px] text-muted">
              {area.name} me hum {area.tdsRange} measure karte hain.
            </span>
          )}
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
              Input TDS (RO se pehle) *
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={inTds}
              onChange={(e) => setInTds(e.target.value)}
              placeholder="jaise 620"
              className="w-full rounded-xl border border-navy-200 bg-white px-3 py-3 text-base text-navy-700 outline-none transition focus:border-aqua-500 focus:ring-2 focus:ring-aqua-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
              Output TDS (RO ke baad)
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={outTds}
              onChange={(e) => setOutTds(e.target.value)}
              placeholder="jaise 55"
              className="w-full rounded-xl border border-navy-200 bg-white px-3 py-3 text-base text-navy-700 outline-none transition focus:border-aqua-500 focus:ring-2 focus:ring-aqua-100"
            />
          </label>
        </div>

        {!ready && (
          <p className="rounded-lg bg-sand-200 px-3 py-2 text-xs leading-relaxed text-navy-600">
            <strong>Meter nahi hai?</strong> Koi baat nahi — hum har visit pe free
            TDS test karte hain, ₹{SERVICE.visitCharge} ke visit charge me hi shaamil hai.
          </p>
        )}
      </div>

      {verdict && (
        <div className={`mt-4 rounded-2xl border-2 p-4 ${tone[verdict.tone]}`}>
          <p className={`font-display text-lg font-extrabold ${toneText[verdict.tone]}`}>
            {verdict.headline}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-navy-700">{verdict.detail}</p>

          {verdict.action && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-white/70 px-3 py-2">
              <span className="text-xs font-bold uppercase tracking-wide text-muted">
                Suggestion
              </span>
              <span className="text-sm font-bold text-navy-700">{verdict.action}</span>
              {verdict.cost && (
                <span className="text-sm font-extrabold text-cta-green">{verdict.cost}</span>
              )}
            </div>
          )}

          {verdict.tone === 'good' ? (
            <p className="mt-3 text-sm font-semibold text-emerald-800">
              Abhi kuch karne ki zaroorat nahi. Paisa bacha lijiye. 👍
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={CONTACT.primaryTel}
                className="rounded-xl bg-cta-green px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cta-greenDark"
              >
                📞 {CONTACT.primaryPhone}
              </a>
              <a
                href={CONTACT.whatsappLink(
                  `Hi Aqua Perl, mera TDS input ${inTds}${outTds ? ` aur output ${outTds}` : ''} hai${area ? `. Area: ${area.name}` : ''}. Kya karna chahiye?`,
                )}
                className="rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition hover:border-aqua-400"
              >
                WhatsApp par poocho
              </a>
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        Sab kuch aapke phone me hi calculate hota hai — koi data kahin nahi jaata,
        kuch save nahi hota. Numbers BIS IS 10500 aur {SERVICE_AREAS.length} area
        me hamare naapé hue readings se aate hain.
      </p>
    </section>
  );
}
