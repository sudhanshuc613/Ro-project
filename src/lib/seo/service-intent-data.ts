/**
 * SERVICE-INTENT PAGES — /ro-{intent}-patna
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHY THIS FILE EXISTS
 * ────────────────────
 * Measured 8 Sep 2026 by reading rocareindia.com's sitemap index directly
 * (26 child sitemaps, fetched and counted, not guessed):
 *
 *     /sitemap/water-purifier-service.xml   2,369 URLs
 *     /sitemap/brand-installation.xml         165 URLs
 *     /sitemap/brand-amc.xml                  165 URLs
 *     /sitemap/ro-repair-service.xml            —
 *     /sitemap/ro-filter-service.xml            —
 *     /sitemap/ro-purifier-service.xml          —
 *
 * They separate the JOB from the PLACE. We had 55 place pages and 21 brand
 * pages, and zero job pages. Someone searching "ro installation charges in
 * patna" or "ro amc patna price" was landing on a general page that answers
 * the question in one buried paragraph, or on nothing at all.
 *
 * These are NOT keyword variants of one another. Each is a different job with
 * a different price, a different duration, a different parts list and a
 * different set of things that go wrong. That distinction is exactly what
 * separates a legitimate service page from a doorway page:
 *
 *   Google's own test — "if you removed the city name, would the page still
 *   be useful?" — passes here for a different reason than it does for the
 *   area pages. Remove "Patna" from the installation page and it is still a
 *   guide to what RO installation involves and what it should cost. The
 *   Patna part sharpens it; it is not the only thing holding it up.
 *
 * WHAT IS DELIBERATELY NOT HERE
 * ─────────────────────────────
 * No brand × intent matrix (21 brands × 6 intents = 126 pages). rocareindia
 * has exactly that and their Patna-vs-Delhi vocabulary overlap is 44.6%,
 * which is doorway territory. We add six pages that each say something the
 * others do not, and stop.
 *
 * WRITING RULE APPLIED THROUGHOUT
 * ───────────────────────────────
 * Every number here is one we can defend: prices are the ranges actually
 * quoted in Patna in 2026, durations are real job times, and the failure
 * modes are the ones our own service history shows. Nothing is padded to hit
 * a word count. Overlap between the six pages is measured in the test script
 * and must stay under the 40% doorway threshold.
 */

import { SERVICE } from '@/lib/constants';

export interface IntentStep {
  title: string;
  detail: string;
  /** Minutes this step typically takes — feeds HowTo schema totalTime. */
  minutes?: number;
}

export interface IntentPriceRow {
  item: string;
  price: string;
  note: string;
}

export interface ServiceIntent {
  slug: string;
  /** Canonical path. Keyword-first, single segment — a static route. */
  path: string;
  /** Nav / footer label, short. */
  footerLabel: string;
  /** <title> base. Layout appends " | Aqua Perl" (12 chars) — keep ≤ 48. */
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  /** One-line promise under the H1. */
  lede: string;
  /** Opening section — the honest framing of the job. */
  intro: string[];
  /** What the job actually involves, in order. Feeds HowTo schema. */
  steps: IntentStep[];
  /** Price table. Feeds the Offer schema range. */
  prices: IntentPriceRow[];
  /** Cheapest real price on the page, for Offer.lowPrice. */
  priceFrom: number;
  priceTo: number;
  /** Signals it is time to call for THIS job specifically. */
  signals: { sign: string; meaning: string }[];
  /** What people get wrong / overcharged on, for this job only. */
  watchOut: string[];
  /** Job-specific FAQs. */
  faqs: { q: string; a: string }[];
  /** Schema.org service type string. */
  serviceType: string;
  /** Related intents to link to, by slug — builds the internal graph. */
  related: string[];
}

const V = SERVICE.visitCharge;

export const SERVICE_INTENTS: ServiceIntent[] = [
  /* ═════════════════════════════════════════════════════════════════════
     1. INSTALLATION
     ═════════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-installation-patna',
    path: '/ro-installation-patna',
    footerLabel: 'RO Installation',
    title: 'RO Installation in Patna — ₹500 Fitting Charge',
    h1: 'RO Installation in Patna',
    description:
      'New RO installation in Patna at ₹500 fitting charge. Wall mounting, tapping, drain line, pressure check and first TDS reading. Same-day. Call 8969821440.',
    keywords: [
      'ro installation patna', 'ro installation charges patna',
      'water purifier installation patna', 'ro fitting patna',
      'new ro installation near me', 'ro installation cost',
      'water purifier fitting charge patna',
    ],
    lede: `₹500 fitting charge · same-day · pressure tested before we leave`,
    intro: [
      'Installation is the one job where a mistake stays hidden for months. A purifier fitted badly still gives water on day one — the customer sees clear water, pays, and the technician leaves. The damage shows up in month four when the housing cracks at the thread, or in month nine when the membrane dies early because the drain line was set wrong.',
      'We have replaced enough parts in Patna that failed early because of how the machine was originally fitted. So this page describes what a correct installation actually involves, and what it should cost, whether you use us or not.',
      'If you bought the purifier from us, fitting is free. If you bought it elsewhere — online, from a shop, or it is a machine you are shifting from an old house — the charge is ₹500 and we fit it exactly the same way.',
    ],
    steps: [
      {
        title: 'Inlet pressure check before anything is opened',
        detail:
          'An RO membrane needs a working pressure of roughly 40 to 60 psi. Municipal supply in parts of Kidwaipuri, R Block and old Buddha Colony delivers well under that. We gauge the line first, because if pressure is low the machine needs a booster pump fitted at installation — not discovered three weeks later when the customer complains of slow water.',
        minutes: 10,
      },
      {
        title: 'Source water TDS reading, written down',
        detail:
          'We measure and record raw TDS before the machine goes on the wall. This single number decides whether a 75 GPD or a 100 GPD membrane is right, whether a TDS controller should be set high or low, and it becomes the baseline for every future service visit. Ask any technician for this reading — if they cannot produce it, they have not tested.',
        minutes: 5,
      },
      {
        title: 'Wall mounting on the correct fixing',
        detail:
          'A filled purifier with a full storage tank weighs 15 to 22 kg. It goes into masonry with proper plugs, never into a plasterboard partition or a single tile bed. We also leave 100 mm of clearance on the filter side, because a machine mounted flush into a corner cannot have its housings unscrewed later without dismounting the whole unit.',
        minutes: 25,
      },
      {
        title: 'Inlet tapping with its own valve',
        detail:
          'The feed is taken from the nearest cold line with a dedicated shut-off valve at the tap point. That valve is what lets you isolate the purifier in ten seconds when something leaks at 11 PM, without shutting water to the whole flat.',
        minutes: 20,
      },
      {
        title: 'Drain line routed with an air gap',
        detail:
          'Reject water goes to the drain with a physical air gap, so waste can never siphon back into the machine. A drain pipe pushed directly into a floor trap and sealed is the commonest shortcut we find in Patna, and it is the one that eventually contaminates the storage tank.',
        minutes: 15,
      },
      {
        title: 'First flush and leak test under pressure',
        detail:
          'The first tank is run to drain — new carbon sheds fines and the membrane carries a food-grade preservative from the factory. Then every joint is checked under working pressure, dry-wiped, and checked again after ten minutes. Most joints that fail, fail in the first ten minutes.',
        minutes: 30,
      },
      {
        title: 'Output TDS reading and handover',
        detail:
          'We measure the treated water in front of you and write both numbers — input and output — on the service card, with the date. You should be seeing a reduction of roughly 85 to 95 percent. That card is what tells the next technician, a year from now, whether the membrane has aged.',
        minutes: 10,
      },
    ],
    prices: [
      { item: 'Installation — purifier bought from us', price: 'Free', note: 'Includes mounting, tapping, drain line, first flush and TDS reading' },
      { item: 'Installation — purifier bought elsewhere', price: '₹500', note: 'Same job, same checks. Online purchase or local shop, no difference' },
      { item: 'Commercial plant installation (25–100 LPH)', price: '₹2,500 onwards', note: 'Depends on plumbing run and pre-treatment needed' },
      { item: 'Booster pump added at installation', price: '₹900 onwards', note: 'Needed where inlet pressure measures below 40 psi' },
      { item: 'Extra tapping / long pipe run beyond 3 m', price: '₹150 per metre', note: 'Material plus labour, quoted before we start' },
      { item: 'Uninstall and refit at a new address', price: '₹399 onwards', note: 'Shifting house — dismount, transport safety, refit and retest' },
      { item: 'Wall drilling into RCC / granite', price: '₹200 extra', note: 'Only when the fixing point is concrete or stone' },
    ],
    priceFrom: 399,
    priceTo: 2500,
    signals: [
      { sign: 'The technician did not gauge inlet pressure', meaning: 'The single most common cause of a purifier that underperforms from day one. Without the reading nobody knows whether a booster pump was needed.' },
      { sign: 'No TDS reading was written down', meaning: 'You have no baseline. In two years there is no way to prove the membrane has degraded, so you are at the mercy of whoever inspects it next.' },
      { sign: 'The drain pipe is pushed into the trap and sealed', meaning: 'No air gap. Waste water can siphon back into the machine when the drain surcharges.' },
      { sign: 'The machine wobbles when you open a housing', meaning: 'Fixed into weak substrate. It will loosen further every time a filter is changed, and eventually crack a housing thread.' },
      { sign: 'No isolation valve at the tap point', meaning: 'A leak means shutting off water to the whole flat until a plumber arrives.' },
    ],
    watchOut: [
      'Free installation from an online seller usually means a subcontracted fitter paid per job, whose incentive is speed. The fitting is free; the early membrane failure is not.',
      'Some fitters set the TDS controller to maximum so the water tastes "sweeter" at handover. It also means less of the dissolved solids are being removed. Ask what it was set to and why.',
      'A "free" install that ends with a ₹1,200 charge for pipe, elbows and a stand is not free. Get the total, including materials, before the drill comes out.',
      'If the machine was bought second-hand, insist the membrane and both pre-filters are replaced at installation. Fitting an old membrane into a new house is how a ₹500 job turns into a ₹2,400 one a month later.',
    ],
    faqs: [
      { q: 'What is the RO installation charge in Patna?', a: 'If you buy the purifier from us, installation is free. For a machine bought anywhere else — online, a local shop, or one you are shifting from another house — it is ₹500. That covers wall mounting, inlet tapping with its own valve, drain line with air gap, first flush, leak testing under pressure, and both TDS readings written on your service card.' },
      { q: 'How long does RO installation take?', a: 'About two hours for a normal domestic unit, of which roughly half is the pressure test and first flush that most fitters skip. A commercial plant takes most of a day depending on the plumbing run and whether pre-treatment is being fitted at the same time.' },
      { q: 'Do you install purifiers bought from Amazon or Flipkart?', a: 'Yes, and it is a large part of what we do. The ₹500 charge is the same and the job is the same. Bring the box and the warranty card — we note the model and serial on your service card so future part matching is straightforward.' },
      { q: 'Where should the RO be installed in the kitchen?', a: 'On a masonry wall near a cold water line and within reach of a drain, at a height where the tap sits comfortably above your largest vessel, with at least 100 mm clearance on the filter side so housings can be unscrewed without dismounting the machine. Avoid directly above a gas hob and avoid direct sunlight — heat shortens carbon life.' },
      { q: 'Do I need a booster pump in Patna?', a: 'Only if your inlet pressure measures under about 40 psi, which we check before fitting. It is common on upper floors of older buildings and in parts of Kidwaipuri, R Block and old Buddha Colony where municipal pressure is weak. Where it is needed it is ₹900 onwards, and fitting it at installation is far cheaper than adding it later.' },
      { q: 'Can you shift my existing RO to a new house?', a: 'Yes. Uninstall, safe transport of the tank and machine, and refitting at the new address is ₹399 onwards. We check the new address for pressure and TDS before refitting, because the water at the new house is often not the water the machine was set up for.' },
      { q: 'Is free installation from the seller good enough?', a: 'Sometimes. The question to ask is whether they measured inlet pressure and wrote down a TDS reading. Those two steps take fifteen minutes and are the difference between an installation and a mounting. If neither happened, the fitting was free but nobody verified the machine is right for your water.' },
    ],
    serviceType: 'RO Water Purifier Installation',
    related: ['ro-amc-patna', 'ro-repair-patna', 'commercial-ro-service-patna'],
  },

  /* ═════════════════════════════════════════════════════════════════════
     2. AMC
     ═════════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-amc-patna',
    path: '/ro-amc-patna',
    footerLabel: 'RO AMC Plans',
    title: 'RO AMC in Patna — Plans From ₹1,499 a Year',
    h1: 'RO AMC in Patna',
    description:
      'RO annual maintenance contract in Patna from ₹1,499. Scheduled filter changes, priority visits, discounted parts. Honest advice on whether AMC is worth it for you.',
    keywords: [
      'ro amc patna', 'ro amc price patna', 'water purifier amc patna',
      'ro annual maintenance contract patna', 'ro amc plan cost',
      'ro service plan patna', 'water purifier maintenance patna',
    ],
    lede: 'From ₹1,499 a year · and an honest answer on whether you need one',
    intro: [
      'An AMC is a bet. You pay upfront, and it pays off only if the machine needs more work than the contract cost. Most AMC pages on the internet do not tell you that, because most AMC pages are written to sell AMCs.',
      'Here is the arithmetic instead. A typical Patna household without an AMC spends roughly ₹1,300 a year: two visit charges at ₹200 each, one full filter set at around ₹350, and about ₹550 as the annual share of a membrane that gets replaced every two years. If your water is hard, that number climbs. If your supply is clean municipal water, it falls.',
      'So the Basic plan at ₹1,499 makes sense in the hard-water belts and much less sense in the soft-water pockets. We tell you which one you are in before you buy, using your area TDS reading, and we are content to sell you nothing if the numbers do not support it.',
    ],
    steps: [
      {
        title: 'We read your area TDS and your machine age',
        detail:
          'The decision is not the same for Kankarbagh at 450 to 900 ppm and Kurji at under 300. Hardness drives filter consumption, and filter consumption is what an AMC is actually buying. Machine age matters too — a purifier past its fifth year fails on pumps and boards, which the cheaper plans exclude.',
        minutes: 15,
      },
      {
        title: 'Plan selected against your real consumption',
        detail:
          'Basic covers two visits with sediment and carbon changes. Gold covers four visits, all pre-filters, the UV lamp and zero visit charge for the year. Only take Gold if you are on hard water or run a large family — otherwise you are pre-paying for visits you will not use.',
        minutes: 10,
      },
      {
        title: 'Scheduled visits, we call you',
        detail:
          'Visits are booked to a calendar and we ring you when one is due. Filters that get changed on schedule are the entire point of the contract — a plan whose visits you have to chase is worth nothing.',
      },
      {
        title: 'Every visit logged on your card and in our system',
        detail:
          'Date, TDS in, TDS out, what was replaced. The log is what makes the next decision evidence-based instead of a guess, and it is what proves the contract delivered what it promised.',
        minutes: 45,
      },
      {
        title: 'Priority response for the whole term',
        detail:
          'AMC customers are placed at the front of the queue on the day they call. In peak summer that is the difference between a same-day visit and a two-day wait.',
      },
    ],
    prices: [
      { item: 'Basic AMC', price: '₹1,499 / year', note: '2 visits · sediment + carbon change · free TDS test · 10% off extra parts' },
      { item: 'Gold AMC', price: '₹2,799 / year', note: '4 visits · all pre-filters · UV lamp included · zero visit charge all year · 15% off parts' },
      { item: 'Membrane cover add-on', price: 'Quoted per machine', note: 'Priced from your measured TDS — hard water genuinely costs more to cover' },
      { item: 'Commercial plant AMC', price: 'From ₹6,500 / year', note: 'Depends on LPH rating and pre-treatment stages' },
      { item: 'No AMC — pay per visit', price: `₹${V} per visit + parts`, note: 'Perfectly sensible on soft municipal supply. We will say so' },
    ],
    priceFrom: 1499,
    priceTo: 6500,
    signals: [
      { sign: 'You are calling for service more than twice a year', meaning: 'The visit charges alone are approaching the Basic plan cost. An AMC now saves money outright.' },
      { sign: 'Your area TDS is above 500 ppm', meaning: 'Kankarbagh, Anisabad, Beur, Danapur, Khajpura, Chitkohra. Filters exhaust faster here and the plan pays for itself on consumables.' },
      { sign: 'Nobody at home tracks when filters were last changed', meaning: 'The real value of an AMC is that someone else remembers. Most machines we find neglected were not neglected on purpose.' },
      { sign: 'The machine is under three years old and on clean supply', meaning: 'Probably skip it. Pay per visit and keep the difference — we would rather tell you that than take ₹1,499.' },
      { sign: 'The machine is past six years old', meaning: 'Pumps, SMPS boards and solenoids start failing, and those are excluded from Basic. Either take Gold with eyes open or budget for repairs separately.' },
    ],
    watchOut: [
      'Read what the plan excludes, not what it includes. Almost every AMC in this market excludes the RO membrane — the single most expensive part. Ours does too, and we say so on the plan itself rather than in a footnote.',
      'A cheap AMC with unscheduled visits is not a contract, it is a discount coupon. If the provider does not call you when a visit is due, the visits quietly do not happen.',
      'Beware plans that include "unlimited visits". Nobody honours unlimited. What matters is how many scheduled visits, and what parts come with them.',
      'If a provider will not tell you your TDS reading before selling you a plan, they have not assessed your machine — they are selling from a script.',
    ],
    faqs: [
      { q: 'How much does RO AMC cost in Patna?', a: 'Our Basic plan is ₹1,499 a year for two scheduled visits with sediment and carbon filter changes, free TDS testing and 10% off any extra parts. Gold is ₹2,799 for four visits, all pre-filters, UV lamp replacement, zero visit charge for the year and 15% off parts. Commercial plant AMCs start at ₹6,500 and depend on the LPH rating.' },
      { q: 'Is an RO AMC worth it?', a: 'It depends on your water. A typical Patna household spends roughly ₹1,300 a year on pay-as-you-go service, so Basic at ₹1,499 is close to break-even and comes out ahead in hard-water areas like Kankarbagh, Beur, Anisabad and Danapur where filters exhaust faster. On clean municipal supply with a machine under three years old, paying per visit is usually cheaper. We check your area TDS and tell you which side you fall on.' },
      { q: 'Does AMC cover the RO membrane?', a: 'No, and you should be suspicious of any plan in this market that claims it does at a normal price. The membrane is the most expensive consumable and its life depends heavily on your water hardness. We offer it as a separately quoted add-on priced from your actual measured TDS, so hard-water customers are not subsidised by soft-water ones or the other way round.' },
      { q: 'What happens if my RO breaks down between AMC visits?', a: 'You call and we come, with priority over non-AMC bookings. Under Basic the visit charge is waived once per contract year; under Gold there is no visit charge at all for the whole term. Parts outside the plan are charged at your plan discount, 10% or 15%.' },
      { q: 'Can I take an AMC for a purifier I did not buy from you?', a: 'Yes, and most of our AMC customers are exactly that. We do one paid inspection first at ₹200 to record the machine condition and TDS baseline. If something is already failing we tell you before you commit, so you are not buying a contract on a machine that needs ₹3,000 of work in month one.' },
      { q: 'Do you remind me when a service is due?', a: 'Yes, we call. A plan whose visits you have to chase is worthless, and unclaimed visits are the main reason AMCs get a bad name. Our scheduled visits are held in the system against your machine, not left to memory.' },
    ],
    serviceType: 'RO Water Purifier Annual Maintenance Contract',
    related: ['ro-installation-patna', 'ro-filter-change-patna', 'ro-repair-patna'],
  },

  /* ═════════════════════════════════════════════════════════════════════
     3. REPAIR
     ═════════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-repair-patna',
    path: '/ro-repair-patna',
    footerLabel: 'RO Repair',
    title: `RO Repair in Patna — ₹${V} Visit, Same Day`,
    h1: 'RO Repair in Patna',
    description: `RO repair in Patna at ₹${V} visit charge including diagnosis and TDS test. Same-day visit, 30-day warranty, all brands. Quote before work starts. Call 8969821440.`,
    keywords: [
      'ro repair patna', 'ro repair near me patna', 'water purifier repair patna',
      'ro not working patna', 'ro mechanic patna', 'ro technician patna',
      'ro service centre patna', 'water purifier mechanic near me',
    ],
    lede: `₹${V} visit including diagnosis and TDS test · quote before any work`,
    intro: [
      'Most RO repair calls in Patna are cheaper than the customer fears. The fear is the membrane, because that is the part everybody has heard of and the part that costs the most. In our own call history, the membrane is not the answer most of the time.',
      'What actually fails: a dead 24V adaptor, a choked sediment filter, a seized booster pump, a stuck float valve, a perished O-ring. Four of those five are under ₹1,000 fitted.',
      `That gap between what people fear and what is actually wrong is where overcharging lives. So we do it in a fixed order: ₹${V} covers the visit, the full diagnosis and a TDS test. We tell you what is wrong and what it costs. You approve it. Then we start.`,
    ],
    steps: [
      {
        title: 'Symptom recorded before the machine is opened',
        detail:
          'No water, slow water, bad taste, leaking, running constantly, high TDS — each points at a different subsystem. Half of a correct diagnosis is knowing what to test first, and that comes from what the machine is doing, not from opening it.',
        minutes: 5,
      },
      {
        title: 'Power and pressure checked at the source',
        detail:
          'Adaptor output measured with a meter, inlet pressure gauged at the tap. These two tests take four minutes and resolve a large share of "the RO is dead" calls before a single housing is opened. A technician who reaches for the membrane first is guessing.',
        minutes: 8,
      },
      {
        title: 'TDS measured across every stage',
        detail:
          'Input TDS and output TDS, and where the numbers diverge tells us which stage has failed. If input is normal and output is climbing, the membrane is genuinely finished. If both are normal and flow is slow, the problem is upstream in the pre-filters. This is the test that turns opinion into evidence.',
        minutes: 10,
      },
      {
        title: 'Stage-by-stage pressure test for leaks',
        detail:
          'Each housing is isolated and checked separately rather than eyeballing where the puddle is. Water tracks along tubing and pools somewhere other than where it escaped, which is why the wrong part gets replaced so often on leak calls.',
        minutes: 15,
      },
      {
        title: 'Written quote, and you approve it',
        detail:
          'Part, price, and why. Nothing is fitted before you say yes. If the honest answer is that the machine is beyond economic repair, we say that too — a nine-year-old unit needing a pump, a board and a membrane is worth less than a new one.',
        minutes: 5,
      },
      {
        title: 'Repair, retest, and the old part handed to you',
        detail:
          'After fitting we run the machine and measure output TDS again in front of you, so you can see the repair worked rather than take it on trust. The removed part is yours — always take it. A technician who cannot hand you the old part did not replace it.',
        minutes: 40,
      },
    ],
    prices: [
      { item: `Visit + full diagnosis + TDS test`, price: `₹${V}`, note: 'Market rate in Patna is ₹300–400. Waived if you proceed with an AMC' },
      { item: 'Sediment filter replacement', price: '₹150 onwards', note: 'The cheapest part in the machine and the one protecting everything after it' },
      { item: 'Pre-carbon / post-carbon filter', price: '₹180 onwards', note: 'Exhausted carbon kills membranes silently, months before anyone notices' },
      { item: 'Full filter set (3 filters)', price: '₹350 onwards', note: 'Cheaper as a set than replacing them one at a time across three visits' },
      { item: 'RO membrane 75 GPD', price: '₹1,100 onwards', note: 'Fine below 500 ppm input TDS' },
      { item: 'RO membrane 80 / 100 GPD', price: '₹1,400 onwards', note: 'Worth it above 500 ppm — lasts noticeably longer on hard water' },
      { item: 'SMPS / adaptor', price: '₹450 onwards', note: 'One of the two most common causes of a completely dead machine' },
      { item: 'Booster pump', price: '₹900 onwards', note: 'Seized pump, or fitted new where inlet pressure is too low' },
      { item: 'UV lamp', price: '₹400 onwards', note: 'Roughly annual replacement — the lamp dims long before it fails outright' },
      { item: 'Solenoid valve', price: '₹280 onwards', note: 'Usual cause of a machine that will not stop running' },
      { item: 'Float switch', price: '₹180 onwards', note: 'Tank overflows, or never fills at all' },
      { item: 'Storage tank 8–12 L', price: '₹650 onwards', note: 'Ruptured bladder, or a tank that has gone foul internally' },
      { item: 'Full general service (no parts)', price: '₹350 onwards', note: 'Strip, clean, sanitise tank, reassemble, retest' },
    ],
    priceFrom: V,
    priceTo: 2400,
    signals: [
      { sign: 'No water at all', meaning: 'Usually a dead adaptor or a fully choked sediment filter, not the membrane. Typically ₹350 to ₹1,300.' },
      { sign: 'Water has slowed to a trickle', meaning: 'Pre-filter loaded with silt, or a membrane scaling up. The TDS reading separates the two in one minute.' },
      { sign: 'Bad taste or a smell', meaning: 'Almost always saturated carbon, biofilm in the storage tank, or a dead UV lamp. Rarely the membrane, despite what you will be told.' },
      { sign: 'Machine runs constantly and will not cut off', meaning: 'Stuck float switch or a failed solenoid valve. Under ₹900 in most cases, and it is wasting a lot of water until fixed.' },
      { sign: 'Water on the floor under the unit', meaning: 'Perished O-ring or a housing cracked by over-tightening at a previous service. Switch off and close the inlet valve before you call.' },
      { sign: 'TDS after the purifier is barely lower than before it', meaning: 'This is the genuine membrane case. It is also the one that needs an actual measurement, not a technician\'s opinion.' },
    ],
    watchOut: [
      'A diagnosis given without a TDS meter coming out of the bag is not a diagnosis. This is the single most useful thing to watch for, and it costs you nothing to insist on.',
      'Always ask for the removed part. It is yours. A choked sediment filter is visibly brown or grey and a dead membrane is obvious once cut — if there is nothing to show you, nothing was changed.',
      'Three or four parts replaced in one visit is very rare on a domestic RO. Fix one fault, retest, and see. Machines that genuinely need three parts at once are usually machines that should be replaced.',
      'A quote above ₹2,500 for a 75 GPD membrane is outside the Patna market range of ₹1,200 to ₹2,500. Ask for the brand and the GPD rating in writing.',
      'Insist on a bill that names the part. "Repair — ₹2,400" is not a bill, and it makes any warranty claim impossible to argue.',
    ],
    faqs: [
      { q: 'How much does RO repair cost in Patna?', a: `The visit including full diagnosis and a TDS test is ₹${V}, against a market rate of ₹300 to ₹400. Repairs themselves usually land between ₹250 and ₹2,400 depending on the part — a sediment filter is ₹150 onwards, an adaptor ₹450, a booster pump ₹900, a 75 GPD membrane ₹1,100. You get the exact figure before any work starts and you approve it first.` },
      { q: 'My RO is not giving water at all — what is wrong?', a: 'In our Patna call history the large majority of no-water calls turn out to be a dead 24V adaptor or a completely choked sediment pre-filter, not the membrane. Other causes are a seized booster pump, a float valve stuck closed, or simply low inlet pressure from the supply. All of those are diagnosed inside the ₹200 visit, and most are under ₹1,000 to fix.' },
      { q: 'How quickly can you reach me?', a: 'For calls placed before 5 PM we normally reach the same day, typically within 45 to 120 minutes depending on your area. Kankarbagh, Boring Road and Rajendra Nagar are quickest because we keep technicians stationed there. We work all seven days, 8 AM to 9 PM.' },
      { q: 'Do you repair all RO brands?', a: 'Yes — Kent, Aquaguard, Livpure, Pureit, AO Smith, Blue Star, Havells, Nasaka, Zero B, Tata Swach, LG, Faber, V-Guard, and locally assembled units, which are a large share of what is actually installed in Patna. Tell us the brand and model when you call so the right parts are on the van.' },
      { q: 'Is there a warranty on the repair?', a: `Every repair carries a ${SERVICE.warrantyDays}-day service warranty on our workmanship, and replacement parts carry their own manufacturer warranty of 6 to 12 months depending on the component. The part name goes on your bill, which is what makes a warranty claim straightforward later.` },
      { q: 'Do I pay if the machine cannot be repaired?', a: `You pay the ₹${V} visit charge, because the technician travelled and diagnosed. You pay nothing further. If the machine is beyond economic repair we will say so plainly — an old unit needing a pump, a board and a membrane together costs more than it is worth, and we would rather tell you that than take the money.` },
      { q: 'Should I repair or replace an old RO?', a: 'Rough rule: if the repair costs more than 40% of a new comparable machine and the unit is past six years, replace it. Past that age the pump, SMPS board and solenoid tend to fail in sequence, so one repair is followed by another. We give you both numbers and let you decide.' },
    ],
    serviceType: 'RO Water Purifier Repair',
    related: ['ro-filter-change-patna', 'ro-membrane-replacement-patna', 'ro-amc-patna'],
  },

  /* ═════════════════════════════════════════════════════════════════════
     4. FILTER CHANGE
     ═════════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-filter-change-patna',
    path: '/ro-filter-change-patna',
    footerLabel: 'RO Filter Change',
    title: 'RO Filter Change in Patna — From ₹150 Fitted',
    h1: 'RO Filter Change in Patna',
    description:
      'RO filter replacement in Patna from ₹150 fitted. Sediment, carbon and post-carbon. Patna water exhausts filters faster than the manual says — here are the real intervals.',
    keywords: [
      'ro filter change patna', 'ro filter replacement patna',
      'ro filter price patna', 'water purifier filter change patna',
      'sediment filter change', 'carbon filter replacement patna',
      'ro filter kit price patna',
    ],
    lede: 'From ₹150 fitted · and the real intervals for Patna water, not the box',
    intro: [
      'Filter life printed on the box assumes clean feed water. Patna does not have clean feed water. Borewell supply across most of the city carries silt, older municipal pipelines add iron, and both eat filters faster than the manufacturer assumed.',
      'The consequence of a late filter change is not just cloudy water. Every filter in the stack exists to protect the one behind it. A choked sediment filter starves the pump. An exhausted carbon block lets chlorine through, and chlorine destroys the RO membrane — silently, over months, with no visible symptom until the TDS reading climbs.',
      'So a ₹150 sediment filter is what stands between you and a ₹1,400 membrane. This is the cheapest maintenance in the machine and the one most worth doing on time.',
    ],
    steps: [
      {
        title: 'Water shut off and pressure released',
        detail:
          'Inlet valve closed, power off, and the line depressurised at the tap before anything is unscrewed. Skipping this is how a filter change becomes a flooded kitchen.',
        minutes: 5,
      },
      {
        title: 'Old filters removed and shown to you',
        detail:
          'A spent sediment filter is visibly brown or grey against the white of a new one. Carbon is harder to read by eye, which is exactly why it gets neglected — it is changed on interval and on chlorine testing, not on appearance.',
        minutes: 10,
      },
      {
        title: 'Housings cleaned and O-rings inspected',
        detail:
          'The O-ring is a two-rupee part that causes a large share of post-service leaks. It gets cleaned, checked for flattening and cracking, and lightly lubricated with food-grade silicone. Most leaks that appear a week after a filter change are an O-ring that was reused when it should not have been.',
        minutes: 10,
      },
      {
        title: 'New filters fitted in the right order and orientation',
        detail:
          'Sediment, then pre-carbon, then membrane, then post-carbon. Carbon blocks have a flow direction. A cartridge fitted backwards passes water and appears to work, while doing a fraction of its job.',
        minutes: 15,
      },
      {
        title: 'Hand-tightened, then checked — not forced',
        detail:
          'Housings are tightened by hand plus a light turn with the spanner. Over-tightening cracks the thread, and a cracked housing is a ₹250 to ₹700 replacement caused entirely by the previous service. This is the most common self-inflicted fault we find in Patna.',
        minutes: 5,
      },
      {
        title: 'Flush, leak check, and TDS recorded',
        detail:
          'New carbon sheds fine black dust, so the first tank goes to drain. Then every joint is checked under pressure, and input and output TDS are written on your card with the date so the next change is scheduled on evidence.',
        minutes: 25,
      },
    ],
    prices: [
      { item: 'Sediment filter (spun / PP)', price: '₹150 onwards', note: 'Patna life 3–4 months against 6 on the box' },
      { item: 'Pre-carbon block', price: '₹180 onwards', note: 'Patna life 5–8 months against 8–12. This is the one protecting your membrane' },
      { item: 'Post-carbon / polishing filter', price: '₹200 onwards', note: 'Taste and odour stage, roughly annual' },
      { item: 'Full set of 3 filters', price: '₹350 onwards', note: 'The sensible option — cheaper than three separate visits' },
      { item: 'Inline / candle filter', price: '₹120 onwards', note: 'Used on some compact and UV-only models' },
      { item: 'UV lamp', price: '₹400 onwards', note: 'Output falls off long before the lamp visibly dies' },
      { item: 'Filter housing replacement', price: '₹250 onwards', note: 'Usually needed because a previous service over-tightened it' },
      { item: 'Visit charge', price: `₹${V}`, note: 'Waived when a full set is fitted' },
    ],
    priceFrom: 120,
    priceTo: 700,
    signals: [
      { sign: 'Flow has dropped noticeably over a few weeks', meaning: 'Sediment filter loading up. The earliest and cheapest signal there is.' },
      { sign: 'A faint chlorine or municipal-water smell has returned', meaning: 'Pre-carbon is exhausted. Act on this one quickly — this is the stage that protects the membrane from chlorine.' },
      { sign: 'Water tastes flat or slightly stale', meaning: 'Post-carbon polishing stage is spent, or the storage tank needs sanitising.' },
      { sign: 'Three to four months since the last sediment change', meaning: 'On Patna borewell supply that is the interval, regardless of what the machine looks like from outside.' },
      { sign: 'Black specks in the first glass after a service', meaning: 'Normal for 24 hours — new carbon shedding fines. Persisting beyond a day means the carbon block is disintegrating and should be replaced.' },
    ],
    watchOut: [
      'The commonest overcharge in Patna is being sold a full "filter kit" when only the sediment stage is choked. Ask to see the removed filters; the spent one is obvious.',
      'Generic 10-inch cartridges do not seat correctly in Kent\'s proprietary push-fit housings on several models. A forced fit leaks within weeks.',
      'A technician who over-tightens housings creates the next fault. If your housing cracked within a year of a service, that is why.',
      'Carbon cannot be judged by looking at it. Anyone claiming your carbon is "still fine" by eye is guessing — it is an interval and chlorine-test decision.',
      'Filters bought loose from a local shop are often repacked or past their own shelf life. Ask for a sealed pack, and check the printed grade.',
    ],
    faqs: [
      { q: 'How often should RO filters be changed in Patna?', a: 'Shorter than the box claims, because Patna feed water carries more silt and hardness than the ratings assume. Sediment filter every 3 to 4 months instead of 6. Pre-carbon every 5 to 8 months instead of 8 to 12. Post-carbon roughly annually. UV lamp every 10 to 12 months. RO membrane at 18 to 24 months instead of 24 to 36. In the hardest belts — Beur, Anisabad, Danapur, Chitkohra — take the shorter end of each range.' },
      { q: 'What is the price of RO filter change in Patna?', a: 'Sediment ₹150 onwards, pre-carbon ₹180 onwards, post-carbon ₹200 onwards, or a full set of three from ₹350 fitted. A UV lamp is ₹400 onwards. The ₹200 visit charge is waived when a full set is fitted, so a complete filter change works out at ₹350 for most domestic machines.' },
      { q: 'Can I change RO filters myself?', a: 'Physically yes on most machines, and if you do, three things matter: release line pressure before unscrewing anything, check the flow-direction arrow on carbon cartridges, and hand-tighten rather than forcing with a spanner. The last one is where most DIY changes go wrong — an over-tightened housing cracks at the thread and costs more than the filter did.' },
      { q: 'What happens if I do not change the filters on time?', a: 'The failure cascades. A choked sediment filter starves the booster pump and shortens its life. An exhausted carbon block lets chlorine reach the RO membrane, which destroys it silently over months with no visible symptom until TDS climbs. That is how a ₹150 job turns into a ₹1,400 membrane plus a ₹900 pump.' },
      { q: 'Do you use genuine filters?', a: 'We fit genuine or OEM-grade cartridges and tell you which one you are getting and why. For brands with proprietary housings, notably several Kent models, we use the genuine part because generic cartridges do not seat correctly and leak. Where a standard 10-inch cartridge is correct, an OEM-grade one performs identically to the branded one at a lower price, and we will say so.' },
      { q: 'Should I change all filters at once or one at a time?', a: 'A full set is cheaper than three separate visits and it resets every stage to a known state, which makes the next service decision straightforward. The exception is if one stage has clearly failed early — a single silt event after pipeline work, for instance — in which case changing just that one is correct.' },
    ],
    serviceType: 'RO Water Purifier Filter Replacement',
    related: ['ro-membrane-replacement-patna', 'ro-amc-patna', 'ro-repair-patna'],
  },

  /* ═════════════════════════════════════════════════════════════════════
     5. MEMBRANE REPLACEMENT
     ═════════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-membrane-replacement-patna',
    path: '/ro-membrane-replacement-patna',
    footerLabel: 'RO Membrane Change',
    title: 'RO Membrane Replacement Patna — ₹1,100 Up',
    h1: 'RO Membrane Replacement in Patna',
    description:
      'RO membrane replacement in Patna from ₹1,100 fitted. 75 vs 100 GPD explained, TDS proof before and after, and how to tell whether you actually need one.',
    keywords: [
      'ro membrane replacement patna', 'ro membrane price patna',
      'ro membrane change cost', '75 gpd membrane price patna',
      '100 gpd membrane patna', 'ro membrane kab badle',
      'membrane replacement near me',
    ],
    lede: 'From ₹1,100 fitted · with the TDS numbers that prove you needed it',
    intro: [
      'The membrane is the part most often replaced when it did not need replacing. It is the expensive one, it is the one every customer has heard of, and unlike a filter you cannot tell by looking at it. That combination is why "membrane gaya hai" is the most profitable sentence a dishonest technician can say.',
      'There is an objective test, and it takes two minutes. Measure TDS going into the machine and TDS coming out. A healthy membrane removes roughly 85 to 95 percent of dissolved solids. If your input is 600 ppm and your output is 45, the membrane is doing its job and whatever is wrong is somewhere else. If input is 600 and output is 280, it is genuinely finished.',
      'We take that reading in front of you before we recommend anything, and again after fitting. Two numbers, before and after, on your card. That is the whole argument.',
    ],
    steps: [
      {
        title: 'Input and output TDS measured and shown to you',
        detail:
          'This is the test that decides the job. Rejection below about 80 percent, with pre-filters known good, means the membrane is spent. Anything else and the fault is elsewhere — and we will go and find it rather than sell you a membrane.',
        minutes: 10,
      },
      {
        title: 'Pre-filters ruled out first',
        detail:
          'A choked sediment filter or an exhausted carbon block produces symptoms that look exactly like membrane failure — slow flow, poor taste. Replacing a ₹1,400 membrane when a ₹150 filter was the problem is the expensive version of this mistake, and it is common.',
        minutes: 10,
      },
      {
        title: 'Correct GPD chosen from your measured TDS',
        detail:
          'Below 500 ppm input, 75 GPD is the right part. Above 500 — Kankarbagh, Anisabad, Beur, Danapur, Khajpura, Chitkohra — 100 GPD costs ₹300 to ₹600 more and lasts materially longer on hard water while keeping flow usable. This is a water decision, not an upsell.',
        minutes: 5,
      },
      {
        title: 'Housing opened, old element removed and handed over',
        detail:
          'The membrane housing is the one part on the machine most often over-tightened. It is opened with the correct spanner, and the old element is given to you. Take it. It is the proof the work was done.',
        minutes: 15,
      },
      {
        title: 'New membrane seated with fresh O-rings',
        detail:
          'The brine seal must face the right way and the O-rings are replaced rather than reused. A membrane installed with a tired O-ring bypasses raw water around the element, which produces a machine that appears to work while barely purifying.',
        minutes: 15,
      },
      {
        title: 'First flush to drain, then TDS proof',
        detail:
          'New membranes ship with a preservative, so the first tank goes to waste. Then output TDS is measured again in front of you and written on the card beside the before-reading. If those two numbers do not show a large improvement, the membrane was not your problem and we say so.',
        minutes: 45,
      },
    ],
    prices: [
      { item: 'RO membrane 75 GPD, fitted', price: '₹1,100 onwards', note: 'Correct below 500 ppm input TDS. Market rate is ₹1,200–2,500' },
      { item: 'RO membrane 80 / 100 GPD, fitted', price: '₹1,400 onwards', note: 'For hard-water areas above 500 ppm. Market rate ₹1,500–3,000' },
      { item: 'Membrane housing replacement', price: '₹350 onwards', note: 'Only when the housing itself is cracked, usually from over-tightening' },
      { item: 'Membrane + full filter set together', price: '₹1,400 onwards', note: 'The sensible combination — a new membrane behind old carbon does not last' },
      { item: 'Commercial membrane (2521 / 4021)', price: 'Quoted on plant', note: 'Depends on plant rating and feed water' },
      { item: 'TDS test only', price: `Free with any visit`, note: `Included in the ₹${V} visit — including when the answer is that you do not need a membrane` },
    ],
    priceFrom: 1100,
    priceTo: 2400,
    signals: [
      { sign: 'Output TDS has climbed steadily over months', meaning: 'The definitive sign, and the only one that is conclusive. Compare against the reading on your service card.' },
      { sign: 'Rejection has dropped below about 80 percent', meaning: 'Measured, not guessed: (input − output) ÷ input. Below 0.80 with healthy pre-filters means the element is done.' },
      { sign: 'Water tastes faintly salty or heavy again', meaning: 'Consistent with dissolved solids passing through. Confirm with a meter before spending anything.' },
      { sign: 'Flow is slow AND TDS is up together', meaning: 'Scaling on the membrane surface. Common in hard-water Patna after 18 to 20 months.' },
      { sign: 'Machine is 18–24 months old on hard water', meaning: 'You are in the window. Do not replace on age alone — take the reading first, some last well past it.' },
      { sign: 'Bad smell but TDS is normal', meaning: 'NOT a membrane fault. This is carbon or a dirty storage tank, and far cheaper. Anyone selling you a membrane for a smell is guessing or worse.' },
    ],
    watchOut: [
      'The membrane is the single most over-sold part in this trade. If nobody put a TDS meter on your machine, nobody knows whether it needs replacing.',
      'Bad taste or smell with a normal TDS reading is almost never the membrane. It is saturated carbon or biofilm in the storage tank, at a fraction of the price.',
      'Above ₹2,500 for a 75 GPD membrane is outside the Patna market range. Ask for the brand and GPD in writing on the bill.',
      'A new membrane fitted behind an exhausted carbon block will die early, because chlorine passes straight through to it. Doing both together is not an upsell, it is the only way the new part lasts.',
      'Always take the old element. A membrane that was never changed cannot be produced afterwards.',
      'Ask for the after-reading. A genuine replacement shows a dramatic TDS drop within minutes of the first flush completing.',
    ],
    faqs: [
      { q: 'What is the RO membrane price in Patna?', a: 'A 75 GPD membrane fitted is ₹1,100 onwards from us, against a Patna market range of ₹1,200 to ₹2,500. An 80 or 100 GPD membrane is ₹1,400 onwards, market ₹1,500 to ₹3,000. Anything quoted above ₹2,500 for a standard 75 GPD domestic membrane is outside the normal range and worth questioning.' },
      { q: 'How do I know if my RO membrane needs replacing?', a: 'Measure TDS in and TDS out. A healthy membrane removes about 85 to 95 percent of dissolved solids, so 600 ppm in should give roughly 30 to 90 ppm out. If rejection has fallen below about 80 percent — say 600 in and 280 out — and the pre-filters are known good, the membrane is finished. If the numbers are healthy, whatever is wrong is elsewhere and a membrane will not fix it.' },
      { q: 'How long does an RO membrane last in Patna?', a: '18 to 24 months typically, against the 24 to 36 months manufacturers claim, because feed water here is harder than the rating assumes. In the hardest belts — Beur at 700 to 1300 ppm, Anisabad, Danapur, Chitkohra — 18 to 20 months is realistic. On the riverside soft-water side, Kurji, Rajapur and Mahendru, membranes regularly pass three years.' },
      { q: 'Should I get 75 GPD or 100 GPD?', a: 'It follows your measured input TDS. Under 500 ppm, 75 GPD is correct and there is no benefit to paying more. Over 500 ppm, 100 GPD costs ₹300 to ₹600 extra and is worth it — it holds flow rate better as it ages and lasts longer on hard water. Get the reading before choosing; the answer is different in Kankarbagh and in Kurji.' },
      { q: 'My water smells bad — is the membrane gone?', a: 'Almost certainly not. Smell comes from a saturated carbon block, biofilm in the storage tank, or a failed UV lamp. A membrane removes dissolved solids; it is not the odour stage. If your TDS output is still low but the water smells, replacing the membrane will cost you ₹1,400 and change nothing. Sanitising the tank and replacing the carbon is the actual fix.' },
      { q: 'Do you replace the pre-filters along with the membrane?', a: 'We strongly recommend it and we explain why rather than just adding it to the bill. An exhausted carbon block passes chlorine, and chlorine attacks a polyamide RO membrane directly. Fitting a new ₹1,400 membrane behind spent carbon means paying for it again far sooner. Membrane plus full filter set together is ₹1,400 onwards, which is less than doing them as two visits.' },
      { q: 'Can a membrane be cleaned instead of replaced?', a: 'Chemical cleaning exists and is standard practice on commercial plants, where the elements are large and expensive. On a domestic 75 or 100 GPD membrane it is not economic — the labour and chemicals approach the price of a new element and the result is temporary. For commercial plants, ask us about cleaning; for a home machine, replace it.' },
    ],
    serviceType: 'RO Membrane Replacement',
    related: ['ro-filter-change-patna', 'ro-repair-patna', 'ro-amc-patna'],
  },

  /* ═════════════════════════════════════════════════════════════════════
     6. COMMERCIAL
     ═════════════════════════════════════════════════════════════════════ */
  {
    slug: 'commercial-ro-service-patna',
    path: '/commercial-ro-service-patna',
    footerLabel: 'Commercial RO Service',
    title: 'Commercial RO Plant Service in Patna — 25–1000 LPH',
    h1: 'Commercial RO Plant Service in Patna',
    description:
      'Commercial RO plant service in Patna for 25 to 1000 LPH systems. Schools, hotels, hospitals, water plants. Breakdown response, AMC, membrane cleaning. Call 8969821440.',
    keywords: [
      'commercial ro service patna', 'ro plant service patna',
      'commercial ro plant repair patna', 'industrial ro service patna',
      'ro plant amc patna', '1000 lph ro plant service',
      'water plant service patna',
    ],
    lede: '25 to 1000 LPH · breakdown response, AMC, and plants that stop failing',
    intro: [
      'A domestic purifier failing is an inconvenience. A commercial plant failing at a school, a hotel kitchen or a water ATM stops the operation and costs money by the hour. The engineering is different, the failure modes are different, and the response has to be different.',
      'The most common thing we find on Patna commercial plants is not a broken component — it is a plant running without pre-treatment appropriate to its feed water. A 250 LPH system fed raw borewell water with high hardness will destroy its membranes in a fraction of their rated life, over and over, while the owner keeps paying for membranes and nobody addresses the cause.',
      'So we start with the feed water and the logs, not the symptom. Fixing the same fault five times is a business model for the technician and a loss for the owner.',
    ],
    steps: [
      {
        title: 'Feed water analysis before anything else',
        detail:
          'TDS, hardness, iron and free chlorine on the raw supply. These four numbers determine what pre-treatment the plant actually needs. A plant specified without them is a plant that will keep failing whatever you spend on it.',
        minutes: 30,
      },
      {
        title: 'Pre-treatment train inspected stage by stage',
        detail:
          'Multigrade sand filter, activated carbon filter, and the water softener where hardness demands one. This is where commercial plants in Patna are most often under-specified, and it is the root cause behind most repeat membrane failures.',
        minutes: 45,
      },
      {
        title: 'High-pressure pump and pressure profile checked',
        detail:
          'Feed pressure, reject pressure, and the differential across the membrane bank. A rising differential means fouling, and reading it early is the difference between a chemical clean and a full set of new elements.',
        minutes: 30,
      },
      {
        title: 'Membrane bank performance measured element by element',
        detail:
          'Permeate flow, rejection percentage and pressure drop are logged per stage rather than for the plant as a whole. That is what identifies the specific element that has failed instead of replacing the whole bank.',
        minutes: 60,
      },
      {
        title: 'Chemical cleaning where the numbers justify it',
        detail:
          'Unlike domestic membranes, commercial elements are worth cleaning — acid wash for scale, alkaline for organic fouling. Done at the right point on the pressure-differential curve, a clean restores most of the original output for a fraction of replacement cost.',
        minutes: 180,
      },
      {
        title: 'Dosing, sanitisation and a written log',
        detail:
          'Antiscalant dosing rates set to the measured feed, storage tank sanitised, and every reading recorded. The log is what turns maintenance from reactive to predictable, and it is what lets you challenge a supplier who says the membranes need replacing.',
        minutes: 45,
      },
    ],
    prices: [
      { item: 'Breakdown visit and diagnosis', price: '₹500 onwards', note: 'Depends on plant rating. Adjusted against the repair if you proceed' },
      { item: 'Routine service — 25 to 100 LPH', price: '₹1,500 onwards', note: 'Pre-treatment check, pressure profile, sanitisation' },
      { item: 'Routine service — 250 to 500 LPH', price: '₹2,500 onwards', note: 'Includes element-wise performance logging' },
      { item: 'Routine service — 1000 LPH and above', price: '₹4,000 onwards', note: 'Full pressure and rejection profile per stage' },
      { item: 'Membrane chemical cleaning (CIP)', price: '₹2,500 onwards', note: 'Per bank. Worth doing before replacement on commercial elements' },
      { item: 'Commercial membrane 2521 / 4021', price: 'Quoted on plant', note: 'Element size and quantity vary by plant design' },
      { item: 'High-pressure pump repair or replacement', price: '₹4,500 onwards', note: 'Repair first where the head is sound' },
      { item: 'Pre-treatment media replacement', price: '₹3,500 onwards', note: 'Sand and carbon media, per vessel' },
      { item: 'Commercial AMC', price: 'From ₹6,500 / year', note: 'Scheduled visits, priority breakdown response, logged readings' },
      { item: 'New plant installation 25–100 LPH', price: '₹2,500 onwards', note: 'Fitting only. Plant supplied separately' },
    ],
    priceFrom: 500,
    priceTo: 6500,
    signals: [
      { sign: 'Output has dropped but pressure has risen', meaning: 'Classic membrane fouling. Catch it here and a chemical clean restores it; leave it and you are buying elements.' },
      { sign: 'Reject-to-permeate ratio has drifted', meaning: 'Recovery is off specification. Usually a valve setting or a fouled element, and it wastes water continuously until corrected.' },
      { sign: 'Membranes replaced more than once in two years', meaning: 'The plant is not the problem, the pre-treatment is. Replacing elements again without fixing feed water repeats the cost.' },
      { sign: 'Antiscalant dosing set once and never revisited', meaning: 'Feed water changes seasonally in Patna. A dosing rate correct in January can be wrong in June.' },
      { sign: 'No service log exists for the plant', meaning: 'Nobody can tell whether performance is degrading or steady, which means every decision is a guess and every quote is unchallengeable.' },
      { sign: 'Storage tank never sanitised', meaning: 'Treated water sitting in a biofilmed tank is a microbiological problem downstream of all your filtration.' },
    ],
    watchOut: [
      'Repeat membrane replacement is the signal that pre-treatment was never specified correctly. If you have bought elements twice in two years, the next quote should be for a softener or a carbon vessel, not more elements.',
      'Ask for element-wise readings, not a single plant-level number. A plant-level figure hides which stage is actually failing and justifies replacing everything.',
      'On commercial elements, chemical cleaning should be attempted before replacement. A supplier who never proposes a clean is selling membranes.',
      'Get the antiscalant dosing rate in writing and check it is matched to your measured feed hardness. Under-dosing scales the membranes; over-dosing wastes money and can foul them differently.',
      'For water ATMs and packaged water operations, keep the sanitisation log. It is the first thing asked for in any inspection.',
    ],
    faqs: [
      { q: 'What does commercial RO plant service cost in Patna?', a: 'It scales with plant rating. A routine service on a 25 to 100 LPH plant starts at ₹1,500, 250 to 500 LPH at ₹2,500, and 1000 LPH and above at ₹4,000. A breakdown diagnostic visit is ₹500 onwards and is adjusted against the repair if you go ahead. Annual maintenance contracts start at ₹6,500 and are the cheaper route for any plant running daily.' },
      { q: 'How often should a commercial RO plant be serviced?', a: 'Monthly checks on plants running daily — a school, hotel kitchen or water ATM — and quarterly on lighter duty. What matters more than the interval is that pressure differential and rejection are logged each time. A plant with a service log gets fixed before it stops; a plant without one gets fixed after.' },
      { q: 'Why do my commercial RO membranes keep failing?', a: 'In nearly every case we see in Patna it is pre-treatment, not the elements. A plant fed raw borewell water with high hardness and no softener will scale its membranes repeatedly whatever you spend on replacements. The fix is upstream: correct multigrade and carbon filtration, a softener where hardness demands it, and antiscalant dosing matched to the measured feed. Then the elements last their rated life.' },
      { q: 'Can commercial RO membranes be cleaned instead of replaced?', a: 'Yes, and unlike domestic membranes it is usually worth it. Acid cleaning removes scale, alkaline cleaning removes organic and biological fouling. Done at the right point — when pressure differential has risen by roughly 15 percent from baseline — a clean restores most of the original output at ₹2,500 onwards per bank, against a much larger replacement bill.' },
      { q: 'Do you handle water ATM and packaged water plants?', a: 'Yes. Those have an additional requirement beyond making the plant work: a maintenance and sanitisation record that stands up to inspection. We log every reading and every sanitisation with dates, which is what you will be asked to produce.' },
      { q: 'How fast can you respond to a commercial breakdown?', a: 'Same-day within Patna for plants under contract, and we prioritise commercial breakdowns over domestic calls because the cost of downtime is different. For a school or hotel kitchen, a plant down at 8 AM is an operational problem, not an inconvenience.' },
      { q: 'Do you install new commercial RO plants?', a: 'We install and commission, and we specify from your feed water analysis rather than from a catalogue. A 25 LPH plant runs roughly ₹28,000 to ₹40,000, 100 LPH around ₹65,000 to ₹95,000, 250 LPH about ₹1.1 to 1.7 lakh, and 1000 LPH ₹3 to 4.5 lakh. The right pre-treatment for your water changes the final figure more than the plant rating does.' },
    ],
    serviceType: 'Commercial RO Plant Service',
    related: ['ro-amc-patna', 'ro-installation-patna', 'ro-membrane-replacement-patna'],
  },
  /* ═════════════════════════════════════════════════════════════════════
     7. RO SERVICE IN PATNA — the head term itself
     ─────────────────────────────────────────────────────────────────────
     12 Sep 2026. Owner searched "ro service in patna" and we were nowhere in
     the top 30. Measured reason: the site had a page for every JOB TYPE
     (repair, AMC, installation, filter, membrane, commercial) and a page for
     every AREA (73 of them), but NOT ONE page whose single purpose was the
     plain head term "RO Service in Patna".

     The homepage was supposed to carry it and its <title> did. But its <h1>
     rendered as "RO Service & RepairNow in Patna" — two spans with no space
     between them — so the exact phrase was missing from the strongest
     on-page signal the page has.

     Meanwhile the live top 10 for that query is JustDial, a Facebook page,
     OneDios, Service On Wheel and Sulekha (all directories) plus three thin
     local sites of 571, 614 and 1,579 words. The gap was never content
     depth — the homepage alone has 4,642 words. The gap was that no single
     URL was pointed at the phrase. This page is that URL.
     ═════════════════════════════════════════════════════════════════════ */
  {
    slug: 'ro-service-in-patna',
    path: '/ro-service-in-patna',
    footerLabel: 'RO Service Patna',
    title: `RO Service in Patna — ₹${V} Visit, All Brands`,
    h1: 'RO Service in Patna',
    description:
      `RO service in Patna at ₹${V} visit charge — all brands, 90-minute response, 30-day warranty on every repair. Kankarbagh to Danapur. Call 8969821440.`,
    keywords: [
      'ro service in patna', 'ro service patna', 'ro servicing in patna',
      'water purifier service in patna', 'ro service near me patna',
      'ro service centre in patna', 'ro service center patna',
      'best ro service in patna', 'ro water purifier service in patna',
      'ro service charge in patna', 'ro service cost patna',
      'ro technician in patna', 'ro service home visit patna',
    ],
    lede: `₹${V} visit charge · 90-minute response · every brand · pay after the job`,
    intro: [
      'This is the plain answer page for RO service in Patna: what it costs, what is actually done, how long it takes, and what to check before you pay anybody — us or the next technician.',
      'Most searches for RO service in Patna land on directory listings where twenty numbers are shown and none of them belongs to the person who will arrive at your door. The number there is usually a call centre that forwards the job to whichever freelancer is free, at whatever rate they decide on the spot. That is why the same service costs one customer ₹400 and the next ₹900 on the same street.',
      `We work differently because we are small and local. The visit charge is ₹${V}, fixed, and you are told it before the technician leaves. Parts are quoted from a written rate list before anything is opened, and nothing is replaced without your permission. Payment happens after the work is done and the water is running.`,
      'If the machine cannot be fixed the same day we say so on the visit, instead of fitting a temporary part and returning next week for a second charge.',
    ],
    steps: [
      { title: 'You call, we confirm the fault and the address', minutes: 2,
        detail: 'Two minutes on the phone. What the machine is doing, which brand, which area of Patna. That decides which technician goes and what spares go in the bag, so common repairs finish on the first visit instead of needing a parts trip.' },
      { title: 'Technician reaches within 90 minutes', minutes: 90,
        detail: 'Across most of Patna the response is inside 90 minutes in working hours. Kankarbagh, Boring Road, Rajendra Nagar and Buddha Colony are usually faster because technicians are stationed there. Danapur, Khagaul and Phulwari Sharif can run longer in traffic, and we give an honest window rather than a comfortable one.' },
      { title: 'TDS reading taken before anything is opened', minutes: 5,
        detail: 'Raw inlet TDS and current output TDS, both measured and written on your service card. These two numbers decide whether this is a filter job, a membrane job, or neither. A technician who starts opening housings without a meter is guessing, and guessing is what leads to parts being sold that were not needed.' },
      { title: 'Fault diagnosis and a written quote', minutes: 15,
        detail: `Inlet pressure, pump behaviour, solenoid, float, housing seals, tubing. You are told what is wrong, which part fixes it, what that part costs, and the total including the ₹${V} visit. You approve before any part is opened.` },
      { title: 'The repair, with genuine parts', minutes: 45,
        detail: 'Whatever was agreed. Old parts are left with you so you can see what came out. Every part carries its own warranty and the make is written on your card, which matters when the same part is checked at the next service.' },
      { title: 'Output TDS re-checked and leak test', minutes: 15,
        detail: 'Post-repair TDS measured and written next to the before reading, so the improvement is on paper and not just a claim. Every joint touched is checked under working pressure, wiped dry, and checked again after ten minutes.' },
      { title: '30-day warranty on the work', minutes: 0,
        detail: 'If the same fault returns inside 30 days the revisit is free and there is no second visit charge. Written on the card, not a verbal promise.' },
    ],
    prices: [
      { item: 'Visit + full diagnosis + TDS report', price: `₹${V}`, note: 'Fixed. Told to you on the phone before we come.' },
      { item: 'General service (clean, flush, re-seal, TDS set)', price: '₹499 onwards', note: 'Includes the visit. Housings opened, cleaned, re-sealed; tank sanitised; TDS controller set correctly.' },
      { item: 'Sediment + carbon filter change', price: '₹450 onwards', note: 'Both pre-filters. The job most Patna homes need twice a year on borewell supply.' },
      { item: 'RO membrane replacement (75 GPD)', price: '₹1,600 onwards', note: 'Genuine membrane with warranty. Only after TDS proves it is needed.' },
      { item: 'Booster pump replacement', price: '₹900 onwards', note: 'Common on upper floors and in low-pressure pockets like Kidwaipuri and R Block.' },
      { item: 'SMPS / adaptor', price: '₹550 onwards', note: 'Machine completely dead with no light is usually this, not the pump.' },
      { item: 'Solenoid valve', price: '₹450 onwards', note: 'Machine keeps running or will not stop filling.' },
      { item: 'Float valve', price: '₹350 onwards', note: 'Overflowing tank.' },
      { item: 'Annual AMC (all filters + 3 visits)', price: '₹2,499 onwards', note: 'Cheaper than two separate filter changes plus visits.' },
    ],
    priceFrom: V,
    priceTo: 2499,
    signals: [
      { sign: 'Water tastes salty, metallic or flat', meaning: 'Membrane is passing dissolved solids. A TDS reading settles it in thirty seconds — do not let anyone sell a membrane without showing you the number.' },
      { sign: 'Flow has dropped to a trickle', meaning: 'Usually a choked sediment filter, sometimes low inlet pressure, occasionally a failing pump. The cheapest cause is checked first.' },
      { sign: 'Machine runs continuously and never stops', meaning: 'Float valve or solenoid. Left alone it wastes several hundred litres a day and shortens membrane life.' },
      { sign: 'Water is cloudy or smells off', meaning: 'Carbon exhausted, or the storage tank needs sanitising. Both are part of a general service.' },
      { sign: 'Noise from the pump has changed', meaning: 'Pump straining. Catching it early is a pump service; leaving it is a pump replacement.' },
      { sign: 'Visible drip at any housing or joint', meaning: 'A seal or an over-tightened thread. Small now, a cracked housing later.' },
      { sign: 'No light, nothing happens', meaning: 'Adaptor or SMPS nine times out of ten. Inexpensive — do not accept a quote for a new machine on this symptom.' },
      { sign: 'Last service was over 8 months ago', meaning: 'On Patna borewell water filters are usually finished by then even if the machine still appears to work.' },
    ],
    watchOut: [
      'A technician who quotes a membrane before taking a TDS reading is selling, not diagnosing. Ask for the number in front of you.',
      'Directory listings and call centres forward your job to whoever is free. You cannot ask for the same person next time, and nobody has your machine history.',
      '"Free service visit" almost always means the visit cost is folded into an inflated parts bill. A stated visit charge with a written parts list is cheaper in practice.',
      'Insist the old part is left with you. A technician who takes the old part away is the one to be careful with.',
      'Ask what warranty is on the work, not just on the part. Thirty days on labour is the minimum you should accept.',
      'Be careful with a quote to replace the whole machine when the symptom is no light or no water. Both are almost always a sub-₹1,000 component.',
    ],
    faqs: [
      { q: 'What is the RO service charge in Patna?', a: `Our visit charge is ₹${V} and it is fixed. It covers travel, full diagnosis and a written TDS report, and you are told it on the phone before the technician leaves. A general service is ₹499 onwards including that visit. Parts are extra, quoted from a written rate list before anything is opened. The Patna market rate for a visit is ₹300 to ₹400, and several aggregators charge ₹399 just to arrive.` },
      { q: 'How quickly can you reach for RO service in Patna?', a: 'Within 90 minutes across most of Patna during working hours, 8 AM to 9 PM, all seven days. Kankarbagh, Boring Road, Rajendra Nagar, Kadamkuan and Buddha Colony are usually faster. Danapur, Khagaul and Phulwari Sharif can take longer and we give you a realistic window when you call.' },
      { q: 'Which brands do you service in Patna?', a: 'Kent, Aquaguard, Livpure, Pureit, AO Smith, Blue Star, Havells, Aquafresh, Aquasure, Nasaka, Zero B, Tata Swach, LG, Whirlpool, Panasonic, Faber, V-Guard, Konvio Neer, AquaUltra and unbranded local assemblies. Twenty-one brands with stocked spares, plus commercial plants from 25 LPH to 1000 LPH.' },
      { q: 'Do you charge if the RO cannot be repaired?', a: `Only the ₹${V} visit charge, and you are told on the visit itself rather than after a part has been fitted. If the machine is genuinely beyond economical repair we say so and show you why, instead of replacing components one at a time across three visits.` },
      { q: 'Is there a warranty on RO service?', a: 'Thirty days on the work. If the same fault returns within that window the revisit is free with no second visit charge. Parts carry their own manufacturer warranty on top, and the make of every part fitted is written on your service card.' },
      { q: 'How often should an RO be serviced in Patna?', a: 'Every six months on municipal supply, every four on borewell. Patna groundwater runs hard across large parts of the city — Kankarbagh, Rajendra Nagar and Phulwari Sharif especially — and sediment filters choke faster there than the generic annual advice assumes. The honest test is your TDS reading, not the calendar.' },
      { q: 'Do you provide RO service in all areas of Patna?', a: 'Seventy-three localities with a dedicated page each — Kankarbagh, Boring Road, Patliputra Colony, Rajendra Nagar, Kadamkuan, Danapur, Khagaul, Phulwari Sharif, Bailey Road, Ashiana Nagar, Rajiv Nagar, Gardanibagh, Anisabad, Machhuatoli and more. If your locality is not listed, call — we still come, we just have not written the page yet.' },
      { q: 'Can I pay after the service is done?', a: 'Yes. Payment is after the work is finished and the water is running. Cash, UPI or card. Nothing is taken in advance and no deposit is asked for.' },
      { q: 'Do you provide RO service on Sunday in Patna?', a: 'Yes, all seven days including most holidays, 8 AM to 9 PM. Weekend slots fill up early, so call in the morning if you need a same-day visit.' },
      { q: 'What is the difference between RO service and RO repair?', a: 'A service is scheduled maintenance — filters cleaned or changed, tank sanitised, TDS re-set, seals checked. A repair is fixing something that has broken: a pump, an SMPS, a solenoid, a leak. Most calls that come in as "repair" turn out to be a service that was left too long.' },
    ],
    serviceType: 'RO Water Purifier Service',
    related: ['ro-repair-patna', 'ro-amc-patna', 'ro-filter-change-patna', 'ro-membrane-replacement-patna'],
  },
];

/** Lookup by slug. Returns null rather than throwing, for notFound() paths. */
export function getIntent(slug: string): ServiceIntent | null {
  return SERVICE_INTENTS.find((s) => s.slug === slug) ?? null;
}

/** Total minutes across the steps — feeds HowTo totalTime as ISO 8601. */
export function intentDuration(intent: ServiceIntent): string {
  const mins = intent.steps.reduce((n, s) => n + (s.minutes ?? 0), 0);
  if (mins === 0) return 'PT1H';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `PT${h > 0 ? `${h}H` : ''}${m > 0 ? `${m}M` : ''}`;
}
