/**
 * AREA PAGE DEPTH LAYER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * THE GAP THIS CLOSES, MEASURED 9 SEP 2026
 * ────────────────────────────────────────
 * Live scrape of the page beating us at #1 for "ro service kankarbagh patna":
 *
 *     rocareindia /ro-service-kankarbagh-patna   3,392 words   43 schema
 *     rokadoctor  /ro-service-patna/kankarbagh   1,215 words   42 schema
 *
 * Schema we match. Depth we did not.
 *
 * 🔴 THE MEASUREMENT MISTAKE THAT ALMOST SHIPPED
 * ──────────────────────────────────────────────
 * Earlier sessions reported area-page overlap as "16.8% avg / 34.4% max" and
 * compared that against the competitor's 100%. Those two numbers were measured
 * differently: ours counted the DATA OBJECTS in patna-service-data.ts, theirs
 * counted RENDERED PAGES. Apples to oranges.
 *
 * Measured like-for-like on rendered body HTML, 9 Sep 2026:
 *
 *     rokadoctor.in live (currently #1 for 4 keywords)   84.7%, 55 dup sentences
 *     rocareindia.com                                   100.0%, 51 dup sentences
 *
 * So 84.7% is evidently survivable — it is what is ranking right now. But the
 * first draft of this file pushed it to 88.3% with 125 duplicate sentences,
 * because every area in the same TDS band received byte-identical prose. That
 * is movement in the competitor's direction and it was rejected.
 *
 * HOW THIS VERSION AVOIDS IT
 * ──────────────────────────
 * Every generated sentence carries at least one value that varies per area —
 * the parsed TDS bounds, the ratio against the BIS limit, the response window,
 * the technician count, the monthly job count, a named landmark, a named
 * neighbour, or the area's own recorded commonRepair. Two localities in the
 * same hardness band still produce different text because the numbers inside
 * the sentences differ.
 *
 * Phrasing is also selected by a deterministic hash of the slug, so same-band
 * areas do not queue up behind one template. The hash is stable, so a given
 * area always renders the same way build to build.
 *
 * Target held by scripts/verify-area-depth.sh: rendered body overlap must not
 * exceed the pre-change live baseline of 84.7%, and duplicate body sentences
 * must not exceed the baseline of 55.
 *
 * WHAT IS DELIBERATELY NOT COPIED FROM THE COMPETITOR
 * ───────────────────────────────────────────────────
 * • Their `reviewCount: 187134`. Ours stays at the real 44.
 * • Six AMC plan blocks repeated on every locality page.
 * • "Get 1000 Coins" reward gimmicks.
 */

import type { ServiceAreaContent } from '@/lib/seo/patna-service-data';
import { SERVICE } from '@/lib/constants';

/** Lower and upper bound parsed out of a "450–900 ppm" style string. */
function tdsBounds(range: string): { low: number; high: number; mid: number } {
  const nums = range.match(/\d+/g)?.map(Number) ?? [];
  const low = nums[0] ?? 400;
  const high = nums[1] ?? low;
  return { low, high, mid: Math.round((low + high) / 2) };
}

/**
 * Stable per-area index for phrasing selection. Not randomness — the same
 * slug always yields the same number, so builds are reproducible.
 */
function pick(slug: string, n: number): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % n;
}

/** BIS IS 10500: acceptable TDS limit 500 mg/L, permissible 2000 mg/L. */
const BIS_ACCEPTABLE = 500;

export type TdsBand = 'soft' | 'moderate' | 'hard' | 'very-hard';

export function tdsBand(range: string): TdsBand {
  const { high } = tdsBounds(range);
  if (high <= 400) return 'soft';
  if (high <= 700) return 'moderate';
  if (high <= 1000) return 'hard';
  return 'very-hard';
}

export interface TdsVerdict {
  band: TdsBand;
  label: string;
  membrane: string;
  membraneWhy: string;
  sedimentMonths: string;
  carbonMonths: string;
  membraneMonths: string;
  verdict: string;
  bisNote: string;
}

export function tdsVerdict(area: ServiceAreaContent): TdsVerdict {
  const band = tdsBand(area.tdsRange);
  const { low, high, mid } = tdsBounds(area.tdsRange);
  const ratio = Math.round((high / BIS_ACCEPTABLE) * 10) / 10;
  const overBy = high - BIS_ACCEPTABLE;
  const lm = area.landmarks[0] ?? area.name;
  const nb = area.nearbyAreas[0] ?? 'the next locality';
  const v = pick(area.slug, 3);

  /* Every bisNote below states the area's own high/low and its own ratio to
     the BIS limit, so no two areas produce the same sentence. */
  const bisNote =
    high <= BIS_ACCEPTABLE
      ? `BIS IS 10500 sets 500 mg/L as the acceptable limit for total dissolved solids. ${area.name} measures ${area.tdsRange}, so even at its worst the supply here sits ${BIS_ACCEPTABLE - high} mg/L inside that limit. An RO in ${area.name} is buying consistency and microbiological safety, not rescuing undrinkable water — and it is worth knowing that before anyone sells you a treatment stage you do not need.`
      : low <= BIS_ACCEPTABLE
        ? `BIS IS 10500 puts the acceptable TDS limit at 500 mg/L. ${area.name} straddles it: the low end here reads ${low} ppm, comfortably inside, while the high end reaches ${high} ppm, which is ${overBy} mg/L over. That spread is why two houses a street apart in ${area.name} can need different membrane sizes, and why we take a reading at your address rather than quoting from the area average of about ${mid} ppm.`
        : `BIS IS 10500 puts the acceptable TDS limit at 500 mg/L and 2000 mg/L as the outer permissible bound where no better source exists. ${area.name} measures ${area.tdsRange} — the top of that band is ${ratio}× the acceptable limit, ${overBy} mg/L over. Treatment here is not a preference, and the machine is doing measurably more work than the same model would in ${nb}.`;

  if (band === 'soft') {
    const membraneWhy = [
      `At ${area.tdsRange} there is no case for paying extra for a 100 GPD element in ${area.name}. A 75 GPD membrane holds flow comfortably at ${mid} ppm and reaches its rated life. If someone quotes 100 GPD for a ${lm} address, ask them to show the meter reading behind it.`,
      `${area.name} reads ${area.tdsRange}, which is inside the range a 75 GPD element was designed around. The larger 100 GPD costs ₹300 to ₹600 more and buys nothing at ${high} ppm. We fit the 75 here and say so plainly.`,
      `A 75 GPD membrane is the right specification for ${area.tdsRange}. At this hardness the element is not the limiting part in ${area.name} — the adaptor and the O-rings age out first, and both are under ₹900.`,
    ][v];

    const verdict = [
      `${area.name} is one of the easier localities in Patna to keep a purifier running in. Across roughly ${area.monthlyJobs} jobs a month here, most failures are age or fitting faults rather than water chemistry, which keeps repairs cheap — a ₹450 adaptor rather than a ₹1,400 membrane. If a membrane has been quoted for a ${area.name} address, ask for the before-and-after TDS numbers first.`,
      `With feed water at ${area.tdsRange}, machines in ${area.name} outlast the same models in the hard-water belts by a wide margin. Our ${area.monthlyJobs}-odd monthly jobs in this locality skew heavily towards electrics and seals, not scaling. That also means a membrane quote here deserves a second look.`,
      `Water this clean changes what goes wrong. In ${area.name} we log around ${area.monthlyJobs} jobs a month and the pattern is consistent: the ${area.commonRepair.toLowerCase()} shows up far more often than any scaling problem. Cheap to fix, and quick.`,
    ][v];

    return {
      band, bisNote, membraneWhy, verdict,
      label: 'Soft — among the better feed water in Patna',
      membrane: '75 GPD is correct',
      sedimentMonths: '4–5 months',
      carbonMonths: '7–9 months',
      membraneMonths: '30–36 months',
    };
  }

  if (band === 'moderate') {
    const membraneWhy = [
      `${area.name} straddles the line at ${area.tdsRange}. Five hundred ppm is where a 100 GPD element starts earning its extra ₹300 to ₹600, and the readings here run from ${low} to ${high}. Within one locality that varies house to house depending on municipal supply versus a private borewell, so decide from your own meter, not from the ${mid} ppm average.`,
      `At ${mid} ppm typical, a 75 GPD membrane serves most homes in ${area.name} well. The exception is any address running its own borewell, where readings push towards ${high} ppm and the 100 GPD holds flow noticeably better as it ages.`,
      `Feed water in ${area.name} reads ${area.tdsRange}. That is the band where the honest answer is "it depends on your house" — under 500 the 75 GPD is right, over it the 100 GPD pays back. We measure at the tap near ${lm} rather than guessing from the locality figure.`,
    ][v];

    const verdict = [
      `At ${area.tdsRange} a maintained machine in ${area.name} runs for years without a major part failure. What shortens life here is a missed carbon change — exhausted carbon passes chlorine to the membrane and kills it silently over months. A ₹180 filter protects a ₹1,400 one, and that is the whole economics of this locality.`,
      `Across roughly ${area.monthlyJobs} jobs a month in ${area.name}, the hardness at ${mid} ppm is rarely the direct cause. The chain is almost always the same: sediment stage left too long, pump strains, and the fault that finally gets reported is the ${area.commonRepair.toLowerCase()}.`,
      `${area.name} sits in the middle of Patna's range. Machines here fail on schedule neglect rather than on water quality — which is good news, because schedule neglect is the cheapest thing in this trade to fix. Our ${area.technicians === 1 ? 'technician' : 'technicians'} covering this area carry the sediment and carbon stock as standard.`,
    ][v];

    return {
      band, bisNote, membraneWhy, verdict,
      label: 'Moderate — standard Patna range',
      membrane: '75 GPD is fine; 100 GPD if your own reading is above 500',
      sedimentMonths: '3–4 months',
      carbonMonths: '6–8 months',
      membraneMonths: '24–30 months',
    };
  }

  if (band === 'hard') {
    const membraneWhy = [
      `At ${area.tdsRange} a 75 GPD element is the wrong part for ${area.name}. It produces water, but slowly, and it scales up in roughly 18 months against a rated 24 to 36. The 100 GPD costs ₹300 to ₹600 more and holds flow far better at ${high} ppm. We fit it as standard here and show you the reading behind the decision.`,
      `${area.name} reads ${ratio}× the BIS acceptable limit at its high end. That is enough to change the specification: 100 GPD, not as an upsell but because a 75 GPD element at ${mid} ppm typical will be back on the bench inside two years.`,
      `Hardness in ${area.name} runs ${low} to ${high} ppm. Above 500 the larger element measurably outlasts the smaller one, so the 100 GPD is what goes in near ${lm}. If a technician fits a 75 here without mentioning the trade-off, they have not measured.`,
    ][v];

    const verdict = [
      `${area.name} runs hard enough that the schedule printed on the box does not apply. Manufacturers assume cleaner feed than ${area.tdsRange}. The machines we end up replacing membranes on early in this locality are precisely the ones that followed the box — the intervals above are what actually holds at ${mid} ppm.`,
      `At ${high} ppm on the high side, expect the consumables to run faster than the manual claims. Over roughly ${area.monthlyJobs} jobs a month in ${area.name} the pattern is stable: scaling and pump strain, in that order, and the ${area.commonRepair.toLowerCase()} on top.`,
      `Hard water changes the arithmetic in ${area.name}. Nothing here is dangerous — BIS permits up to 2000 mg/L where no alternative exists, and ${area.name} is well under that — but at ${area.tdsRange} the running cost is genuinely higher than in ${nb}, and it is fairer to say so upfront than to discover it at the third service.`,
    ][v];

    return {
      band, bisNote, membraneWhy, verdict,
      label: 'Hard — above the BIS acceptable limit',
      membrane: '100 GPD, not as an upsell',
      sedimentMonths: '3 months',
      carbonMonths: '5–6 months',
      membraneMonths: '18–24 months',
    };
  }

  const membraneWhy = [
    `${area.name} at ${area.tdsRange} is at the top of what a domestic RO is designed for. A 75 GPD element here is a false economy — we have pulled them at fourteen months. The 100 GPD is the minimum sensible specification, and on the worst readings around ${lm} a second pre-treatment stage ahead of the membrane pays for itself inside a year.`,
    `At ${ratio}× the BIS acceptable limit, ${area.name} is among the hardest water we handle. Membrane sizing stops being a preference here: 100 GPD, checked at every visit, because at ${high} ppm the element degrades on a visible curve rather than failing suddenly.`,
    `Feed water reading ${low} to ${high} ppm puts ${area.name} in the belt where undersized membranes fail fastest. The 100 GPD goes in as standard, and we record the output number on your card so the next visit has a baseline to compare against rather than an opinion.`,
  ][v];

  const verdict = [
    `The honest position on ${area.name}: at ${area.tdsRange} your purifier works harder than the same model in ${nb}, and it costs more to run. White crust inside the storage tank within months of a service is normal at this hardness, not a fault. Anyone promising three-year membrane life here is guessing or selling.`,
    `${area.name} is the hard end of Patna. Across roughly ${area.monthlyJobs} jobs a month in this belt, the ${area.commonRepair.toLowerCase()} dominates, and scaling sits right behind it. Both are predictable at ${mid} ppm, which is the one advantage — a shorter service interval genuinely prevents the expensive failure here.`,
    `At ${high} ppm on the high side, ${area.name} sits ${overBy} mg/L above the BIS acceptable limit. That is still comfortably inside the 2000 mg/L permissible bound, so this is a cost and maintenance story rather than a safety one. Budget for consumables on the schedule above and the machine will hold up.`,
  ][v];

  return {
    band, bisNote, membraneWhy, verdict,
    label: 'Very hard — among the hardest we measure in Patna',
    membrane: '100 GPD, and check the reading every visit',
    sedimentMonths: '2–3 months',
    carbonMonths: '4–5 months',
    membraneMonths: '14–18 months',
  };
}

export interface CostRow {
  item: string;
  freq: string;
  annual: number;
  note: string;
}

/**
 * Twelve-month running cost, computed from the area's own TDS band.
 * No competitor in this market publishes this figure.
 */
export function costForecast(area: ServiceAreaContent): {
  rows: CostRow[];
  total: number;
  amcVerdict: string;
} {
  const band = tdsBand(area.tdsRange);
  const { high, mid } = tdsBounds(area.tdsRange);
  const nb = area.nearbyAreas[0] ?? 'the next locality';

  const sedimentPerYear = { soft: 2.5, moderate: 3, hard: 4, 'very-hard': 5 }[band];
  const carbonPerYear = { soft: 1.4, moderate: 1.8, hard: 2.2, 'very-hard': 2.6 }[band];
  const membraneLifeYears = { soft: 2.8, moderate: 2.2, hard: 1.7, 'very-hard': 1.3 }[band];
  const membranePrice = band === 'soft' || band === 'moderate' ? 1100 : 1400;
  const visitsPerYear = { soft: 1.5, moderate: 2, hard: 2.5, 'very-hard': 3 }[band];

  const rows: CostRow[] = [
    {
      item: 'Sediment filter',
      freq: `${sedimentPerYear}× a year`,
      annual: Math.round(sedimentPerYear * 160),
      note: `At ${mid} ppm typical in ${area.name}`,
    },
    {
      item: 'Carbon (pre + post)',
      freq: `${carbonPerYear}× a year`,
      annual: Math.round(carbonPerYear * 220),
      note: 'Exhausted carbon passes chlorine to the membrane',
    },
    {
      item: 'RO membrane (amortised)',
      freq: `every ${membraneLifeYears} years`,
      annual: Math.round(membranePrice / membraneLifeYears),
      note: `${membranePrice === 1400 ? '100 GPD' : '75 GPD'} at ${area.tdsRange}`,
    },
    {
      item: 'Visit charges',
      freq: `${visitsPerYear}× a year`,
      annual: Math.round(visitsPerYear * SERVICE.visitCharge),
      note: `₹${SERVICE.visitCharge} each; Patna market rate is ₹300–400`,
    },
  ];

  const total = rows.reduce((n, r) => n + r.annual, 0);

  /* Advice follows the arithmetic, not a sales target. Each variant names the
     area's own total and its own hardness so the sentences differ. */
  const amcVerdict =
    total >= 1900
      ? `At roughly ₹${total.toLocaleString('en-IN')} a year in ${area.name}, the ₹1,499 Basic AMC is straightforwardly cheaper than paying per visit, and it adds priority response. The gap is driven by consumables — at ${high} ppm the filters simply do not last as long as they would in ${nb}.`
      : total >= 1450
        ? `At roughly ₹${total.toLocaleString('en-IN')} a year in ${area.name}, an AMC lands close to break-even against the ₹1,499 Basic plan — the gap is under ₹${Math.abs(1499 - total)}. It is worth it if nobody at home tracks when filters were last changed, and not worth it if you already do.`
        : `At roughly ₹${total.toLocaleString('en-IN')} a year in ${area.name}, paying per visit beats the ₹1,499 AMC by about ₹${1499 - total}. We would rather put that in writing than sell a plan the numbers do not support. Revisit it once the machine passes six years, when pumps and boards start failing.`;

  return { rows, total, amcVerdict };
}

export interface FaultRow {
  rank: number;
  fault: string;
  why: string;
  cost: string;
}

/**
 * The three faults actually seen in this locality, ranked.
 * Rank 1 is the area's own recorded commonRepair; 2 and 3 derive from the
 * hardness band but are written with the area's own numbers in them.
 */
export function faultProfile(area: ServiceAreaContent): FaultRow[] {
  const band = tdsBand(area.tdsRange);
  const { low, high, mid } = tdsBounds(area.tdsRange);
  const lm = area.landmarks[1] ?? area.landmarks[0] ?? area.name;
  const nb = area.nearbyAreas[0] ?? 'the next locality';

  const byBand: Record<TdsBand, { fault: string; why: string; cost: string }[]> = {
    soft: [
      {
        fault: 'SMPS / adaptor failure',
        why: `With feed water at ${area.tdsRange} the membrane rarely fails first in ${area.name}. It is the electrics that go — the 24V adaptor is the commonest dead-machine cause we find around ${lm}.`,
        cost: '₹450 – ₹900',
      },
      {
        fault: 'Perished O-ring leak',
        why: `Rubber ages on its own timeline regardless of a ${mid} ppm reading. On older units in ${area.name} a slow seep under the housing is routine — a two-rupee part plus labour, not a machine failure.`,
        cost: '₹200 – ₹700',
      },
    ],
    moderate: [
      {
        fault: 'Sediment pre-filter choking',
        why: `Monsoon turbidity reaches every part of Patna, and at ${area.tdsRange} the sediment stage in ${area.name} takes that load first. Flow drops before any other symptom appears.`,
        cost: '₹150 – ₹400',
      },
      {
        fault: 'Carbon exhaustion behind taste complaints',
        why: `The stage people forget, because carbon cannot be judged by eye. In ${area.name} a flat or stale taste with output TDS still reading normal is almost always this, not the membrane.`,
        cost: '₹180 – ₹500',
      },
    ],
    hard: [
      {
        fault: 'Membrane scaling',
        why: `At ${low}–${high} ppm scale builds on the membrane surface faster than the rating assumes. In ${area.name} this is the costliest fault we attend, and the one a shorter carbon interval genuinely prevents.`,
        cost: '₹1,100 – ₹2,400',
      },
      {
        fault: 'Booster pump strain from a choked pre-filter',
        why: `A pump feeding a blocked filter works against pressure it was never rated for. In hard-water ${area.name} the pump usually dies indirectly, through a sediment stage nobody changed.`,
        cost: '₹900 – ₹1,600',
      },
    ],
    'very-hard': [
      {
        fault: 'Heavy scaling on an undersized membrane',
        why: `${area.tdsRange} is the top of the domestic range. A 75 GPD element fitted in ${area.name} scales up in roughly fourteen months, which is why 100 GPD is our default specification here and not in ${nb}.`,
        cost: '₹1,400 – ₹2,400',
      },
      {
        fault: 'Storage tank crusting and flow loss',
        why: `White deposit inside the tank is expected at ${mid} ppm, not a fault. Left long enough it restricts the outlet, and around ${lm} that gets misread as a dead membrane more often than anything else.`,
        cost: '₹350 – ₹900',
      },
    ],
  };

  const derived = byBand[band];

  /* Four variants, each naming a different local value (monthly volume,
     landmark, pincode, response window) so no two areas emit the same line. */
  const rank1Why = [
    `This is the fault we log most often at ${area.name} addresses specifically — roughly ${area.monthlyJobs} jobs a month pass through this locality and it heads the list. The parts go on the van before the technician leaves, so it usually closes on the first visit.`,
    `Out of about ${area.monthlyJobs} monthly jobs in ${area.name}, this is the one that recurs. Being predictable is what makes it cheap to fix: the van is loaded for it before the call is even taken, which is the difference between a ${area.responseMin}-minute fix and a two-visit job.`,
    `Around ${lm} this comes up more than anything else, which is why it sits at the top of our ${area.name} list. Predictability is the whole advantage — the right part is already in the vehicle rather than three days away on order.`,
    `Our service log for ${area.pincodes[0]} puts this first by a clear margin across roughly ${area.monthlyJobs} jobs a month. We stock for it specifically, so a ${area.name} call rarely turns into a return trip.`,
  ][pick(area.slug, 4)];

  return [
    { rank: 1, fault: area.commonRepair, why: rank1Why, cost: '—' },
    { rank: 2, ...derived[0] },
    { rank: 3, ...derived[1] },
  ];
}

/**
 * Honest logistics for this area's distance band. An inflated response promise
 * is a one-star review, so these are written to be checkable.
 */
export function responseDetail(area: ServiceAreaContent): string {
  const m = area.responseMin;
  const lm = area.landmarks[0] ?? area.name;
  const nb = area.nearbyAreas[0] ?? 'nearby localities';
  const techLine =
    area.technicians > 1
      ? `We keep ${area.technicians} technicians covering ${area.name}, which is why the window here is shorter than most of the city.`
      : `One technician covers ${area.name} and ${nb}.`;

  /* Second clause varies by slug as well as by distance band, so two areas
     that happen to share a response time still read differently. */
  const tail = [
    `If a given day is going to run past that, you hear it on the phone rather than after the wait.`,
    `We quote the realistic window rather than the best case, because an inflated promise is what earns a one-star review.`,
    `Around ${area.monthlyJobs} jobs a month go through ${area.name}, so that figure is an average of real trips, not a marketing number.`,
    `Peak summer afternoons run longer than this across the whole city, ${area.name} included, and we say so when booking.`,
  ][pick(area.slug, 4)];

  if (m <= 45) {
    return `${techLine} For calls before 5 PM we normally reach ${lm} within ${m} minutes, which makes this one of our quicker zones. ${tail}`;
  }
  if (m <= 60) {
    return `${techLine} Typical arrival at ${lm} is ${m} minutes for calls placed before 5 PM. ${tail}`;
  }
  if (m <= 75) {
    return `${techLine} ${area.name} is a ${m}-minute run from base, so we confirm the likely fault on the phone first and load the parts for it — that is what turns a two-trip job into one. ${tail}`;
  }
  return `${techLine} At ${m} minutes, ${area.name} sits at the outer edge of our same-day radius and we are straightforward about that. The symptom gets discussed in detail on the phone, the likely parts travel with the technician, and you get a real slot instead of an hour we cannot hold. ${tail}`;
}

/** Everything at once — used by the page and by the verification script. */
export function depthBlocks(area: ServiceAreaContent) {
  return {
    tds: tdsVerdict(area),
    cost: costForecast(area),
    faults: faultProfile(area),
    response: responseDetail(area),
  };
}
