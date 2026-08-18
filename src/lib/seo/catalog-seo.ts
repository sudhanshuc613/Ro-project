/**
 * PAN-INDIA CATALOG SEO — content for the e-commerce side of the site.
 * ────────────────────────────────────────────────────────────────────────────
 * The service pages (35 areas, 21 brands, 5,488-word pillar) target Patna.
 * The shop side had almost nothing: /products carried no schema at all and
 * ~1,180 words of mostly UI chrome; /category pages carried only a
 * BreadcrumbList and ~985 words. Measured on the live site, 18 Aug 2026.
 *
 * That is why spare parts and purifiers get no national traffic — there is
 * no text on the page for a national query to match against.
 *
 * Everything here is India-wide on purpose. No "Patna" in the buying copy,
 * except one clearly-labelled local advantage block at the end, because a
 * buyer in Ranchi searching "80 gpd ro membrane price" should not be shown
 * a page that reads like a Patna service ad.
 *
 * Pure data. No DB, no imports beyond types. Safe anywhere.
 */

export interface CategorySeoBlock {
  /** Matches Category.slug in the database. */
  slug: string;
  /** 45–60 chars — the band with the lowest Google rewrite rate. */
  metaTitle: string;
  /** ≤158 chars so the SERP never truncates it. */
  metaDescription: string;
  /** Visible H1. Should read naturally, not like a keyword string. */
  heading: string;
  /** 2–3 sentence intro shown above the grid. */
  intro: string;
  /** Buying-guide bullets. This is the body text national queries match. */
  guide: { title: string; body: string }[];
  /** Price bands — "X price in India" is the highest-volume query pattern. */
  priceTable?: { item: string; range: string; note: string }[];
  /** FAQs → FAQ schema → eligible for the FAQ rich result. */
  faqs: { q: string; a: string }[];
  /** Keywords a national buyer actually types. */
  keywords: string[];
}

export const CATEGORY_SEO: Record<string, CategorySeoBlock> = {
  /* ══════════════════════════════════════════════════════════════════════ */
  'spare-parts': {
    slug: 'spare-parts',
    metaTitle: 'RO Spare Parts Online — Price List India 2026',
    metaDescription:
      'Buy genuine RO spare parts online — membranes, filters, SMPS, pumps, housings. Fits Kent, Aquaguard, Pureit, Livpure. Delivery across India. Call 8969821440.',
    heading: 'RO Spare Parts — Genuine Components, Delivered Across India',
    intro:
      'Every part listed here is the same component our technicians fit on service calls, so nothing on this page is a part we would not install ourselves. Standard fittings mean most items work with Kent, Aquaguard, Pureit, Livpure, AO Smith, Blue Star, Havells and locally assembled units alike. Order the part alone, or ask us which one your symptom actually points to before you spend anything.',
    guide: [
      {
        title: 'Which part has actually failed?',
        body:
          'Water stopped completely and the pump is silent — that is usually the SMPS or the adaptor, not the membrane. Water flows but tastes flat and the TDS reading has climbed — that is the membrane. Slow trickle with a humming pump — a choked sediment or carbon pre-filter. Continuous drain flow that never stops — the solenoid valve or float switch. Replacing a membrane when the SMPS is dead is the single most common waste of money in this category.',
      },
      {
        title: 'Membrane sizing — GPD is not a quality rating',
        body:
          'GPD (gallons per day) describes throughput, not purity. A 75 GPD membrane suits most homes on municipal supply. Choose 80–100 GPD only where input TDS runs high or the family draws heavily through the day. Fitting a 100 GPD membrane to a system whose pump was built for 75 GPD does not give cleaner water; it shortens pump life.',
      },
      {
        title: 'Replacement intervals that actually hold',
        body:
          'Sediment filter: 4–6 months. Pre-carbon: 6 months. Post-carbon: 12 months. RO membrane: 18–24 months on normal supply, closer to 12 where input TDS exceeds 800 ppm. UV lamp: 12 months — a UV lamp keeps glowing long after it stops sterilising, so replace on schedule, not on appearance.',
      },
      {
        title: 'Compatible vs branded parts',
        body:
          'RO fittings are largely standardised, so a good compatible part performs identically to the branded one at a fraction of the price. The exceptions are proprietary cartridge housings used by some Kent and AO Smith models, where the branded part is the only one that seats correctly. Product listings state compatibility explicitly — read it before ordering.',
      },
      {
        title: 'Fitting it yourself',
        body:
          'Sediment, pre-carbon and post-carbon changes are genuinely DIY: turn off the inlet, release the pressure, swap, flush for ten minutes. Membranes, SMPS and pumps involve electrical connections and pressure seals; a bad seal floods a kitchen slowly and quietly. If you are within our Patna service area, fitting is covered by the ₹200 visit.',
      },
    ],
    priceTable: [
      { item: 'RO membrane 75–80 GPD', range: '₹700 – ₹1,600', note: 'Vontron, CSM, compatible' },
      { item: 'Sediment filter (spun, 10")', range: '₹60 – ₹150', note: 'Change every 4–6 months' },
      { item: 'Pre / post carbon filter', range: '₹90 – ₹250', note: 'Change every 6–12 months' },
      { item: 'SMPS adaptor 24V', range: '₹350 – ₹700', note: '24V / 1.5A–2.5A common' },
      { item: 'Booster pump 75–100 GPD', range: '₹700 – ₹1,500', note: 'Diaphragm type' },
      { item: 'UV lamp + choke', range: '₹350 – ₹900', note: '11W / 14W' },
      { item: 'Solenoid valve (SV)', range: '₹200 – ₹450', note: 'Stops drain-side leak' },
      { item: 'Full service kit', range: '₹850 – ₹2,000', note: 'All filters + membrane' },
    ],
    faqs: [
      {
        q: 'Will these RO spare parts fit my brand of purifier?',
        a: 'Most will. RO fittings follow common standards, so membranes, filters, pumps and SMPS units fit Kent, Aquaguard, Pureit, Livpure, AO Smith, Blue Star, Havells and locally assembled systems. Each listing states its compatibility. If you are unsure, send us a photo of your unit on WhatsApp at 8969821440 and we will confirm before you order.',
      },
      {
        q: 'How often should an RO membrane be replaced?',
        a: 'Every 18–24 months on normal municipal supply. Where input TDS runs above 800 ppm, closer to 12 months. The honest test is a TDS reading: if output has risen above 60–70 ppm from its original value, the membrane is done regardless of age.',
      },
      {
        q: 'Do you deliver RO spare parts across India?',
        a: 'Yes. Parts ship pan-India. Delivery is free on orders above ₹1,999; below that a flat shipping rate applies. Patna customers can collect directly or have the part fitted during a ₹200 service visit.',
      },
      {
        q: 'Are compatible parts as good as branded ones?',
        a: 'For membranes, filters, pumps and SMPS units, a good compatible part performs the same as the branded equivalent and costs considerably less. The exception is proprietary cartridge housings on certain Kent and AO Smith models, where only the branded part seats correctly.',
      },
      {
        q: 'My RO has stopped giving water. Which part do I need?',
        a: 'If the pump is completely silent, suspect the SMPS or adaptor. If the pump hums but flow is a trickle, suspect a choked pre-filter. If flow is normal but the water tastes flat and TDS has risen, suspect the membrane. Replacing the membrane when the SMPS has failed is the most common wasted purchase.',
      },
    ],
    keywords: [
      'ro spare parts online', 'ro spare parts price list', 'ro membrane price',
      'ro filter price', 'ro smps price', 'ro booster pump price',
      'ro service kit online', 'water purifier spare parts', 'ro parts for kent',
      'ro parts for aquaguard', '80 gpd membrane price', 'ro uv lamp price',
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════ */
  'new-ro-purifiers': {
    slug: 'new-ro-purifiers',
    metaTitle: 'RO Water Purifier Price in India — Buy Online 2026',
    metaDescription:
      'Buy RO water purifiers online at genuine prices. RO + UV + UF, alkaline and copper models with TDS control. Delivery across India, expert support. Call 8969821440.',
    heading: 'RO Water Purifiers — Buy Online at Genuine Prices',
    intro:
      'We repair water purifiers every day, which means we see exactly which models keep running at five years and which ones become a parts problem at eighteen months. The purifiers listed here are chosen on that basis, not on brochure claims. Read the TDS guidance below before you pick a model — buying the wrong purification type for your water is the most expensive mistake in this category.',
    guide: [
      {
        title: 'Test your TDS before choosing anything',
        body:
          'TDS (total dissolved solids) decides the technology you need, and nothing else should override it. Below 200 ppm, a UV or UF purifier is sufficient and an RO unit will strip minerals unnecessarily. Between 200 and 500 ppm, RO+UV is the standard choice. Above 500 ppm, RO is essential and a TDS controller becomes worth having. Above 1,200 ppm, you need RO with a pre-filtration stage. A TDS meter costs around ₹300 and prevents a ₹15,000 mistake.',
      },
      {
        title: 'What each technology actually removes',
        body:
          'RO removes dissolved salts, heavy metals and hardness — it is the only stage that lowers TDS. UV kills bacteria and viruses but changes nothing dissolved. UF removes suspended particles and larger microbes and works without electricity. A TDS controller blends a measured amount of unpurified water back in so the output is not stripped flat. Alkaline and copper stages adjust taste and pH; they are comfort features, not purification.',
      },
      {
        title: 'Storage size against household size',
        body:
          'Five to seven litres suits two or three people. Seven to nine litres suits a family of four. Ten to twelve litres suits five or more, or any home with an unreliable supply. Oversizing is not harmful, but stored water sitting several days is worse than a smaller tank refilled often.',
      },
      {
        title: 'Running cost is the number that matters',
        body:
          'The sticker price is roughly a third of five-year ownership cost. Filters run ₹1,200–2,500 a year, a membrane ₹800–1,600 every 18–24 months, and servicing ₹200–600 a visit. A ₹9,000 purifier with cheap standard cartridges frequently costs less over five years than a ₹18,000 unit locked to proprietary consumables. Ask what a full filter set costs before you buy, not after.',
      },
      {
        title: 'Service availability beats brand name',
        body:
          'A purifier is only as good as the person who can fix it next month. Before buying, check that spares for that model are actually available in your city. Premium imported models with no local parts supply sit dead for weeks waiting on a courier — we see this constantly.',
      },
    ],
    priceTable: [
      { item: 'RO + UF (entry)', range: '₹5,500 – ₹8,000', note: 'Municipal supply, low TDS' },
      { item: 'RO + UV + UF', range: '₹8,000 – ₹13,000', note: 'Most common household choice' },
      { item: 'RO + UV + TDS controller', range: '₹10,000 – ₹16,000', note: 'For high-TDS areas' },
      { item: 'RO + alkaline / copper', range: '₹13,000 – ₹22,000', note: 'Taste and pH features' },
      { item: 'Under-sink RO', range: '₹14,000 – ₹25,000', note: 'Hidden install, needs space' },
      { item: 'Commercial 25–50 LPH', range: '₹28,000 – ₹55,000', note: 'Shop, clinic, small office' },
    ],
    faqs: [
      {
        q: 'Which RO water purifier is best for home use in India?',
        a: 'It depends entirely on your input TDS. Below 200 ppm a UV or UF purifier is enough. Between 200 and 500 ppm, RO+UV is the sensible choice. Above 500 ppm you need RO with a TDS controller. Test your water with a ₹300 TDS meter before choosing any model.',
      },
      {
        q: 'What is the price of an RO water purifier in India?',
        a: 'Entry RO+UF models start around ₹5,500. The mainstream RO+UV+UF range runs ₹8,000–13,000. Alkaline and copper models run ₹13,000–22,000. Commercial units for a shop or clinic start near ₹28,000.',
      },
      {
        q: 'Is a TDS controller necessary?',
        a: 'It matters when your input TDS is above roughly 500 ppm. RO strips dissolved solids indiscriminately, and a controller blends a measured amount back so the water is not left tasting flat and mineral-free. Below 300 ppm input, it makes little practical difference.',
      },
      {
        q: 'How much does it cost to run an RO purifier each year?',
        a: 'Budget ₹1,200–2,500 a year for filters, plus ₹800–1,600 every 18–24 months for the membrane, plus service visits. Confirm the price of a full filter set for your chosen model before buying — proprietary consumables can double the five-year cost.',
      },
      {
        q: 'Do you deliver purifiers outside Patna?',
        a: 'Yes, purifiers ship across India with free delivery above ₹1,999. Installation is included free within Patna. Outside Patna we support installation over phone and WhatsApp, and most units come with a manufacturer installation option.',
      },
    ],
    keywords: [
      'ro water purifier price', 'best ro water purifier india',
      'ro uv water purifier price', 'water purifier for home',
      'alkaline ro water purifier', 'copper ro water purifier',
      'ro with tds controller', 'ro purifier online', '8 litre ro purifier',
      'water purifier price list',
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════ */
  'commercial-plants': {
    slug: 'commercial-plants',
    metaTitle: 'Commercial RO Plant Price — 25 to 1000 LPH India',
    metaDescription:
      'Commercial RO plants from 25 to 1000 LPH for shops, schools, hotels and factories. Installation, AMC and spares. Genuine pricing. Call 8969821440.',
    heading: 'Commercial RO Plants — 25 LPH to 1000 LPH',
    intro:
      'Commercial systems are sized on output per hour, not tank capacity, and getting that number wrong is expensive in both directions. The guidance below is what we walk buyers through before quoting. We install, service and stock spares for these systems, so the plant you buy is one we can keep running.',
    guide: [
      {
        title: 'Sizing by actual peak draw',
        body:
          'Size on peak-hour demand, not daily total. A 50-seat restaurant drawing hard over two lunch hours needs more instantaneous output than an office using the same daily volume spread over eight hours. As a rough guide: small shop or clinic 25–50 LPH; school or mid-size restaurant 100–250 LPH; hotel or factory 500–1000 LPH; packaged water operation 1000 LPH and up.',
      },
      {
        title: 'Feed water testing decides the pre-treatment',
        body:
          'Commercial plants live or die on pre-treatment. High hardness needs a softener ahead of the membranes or they scale within months. High iron needs an iron removal filter. High turbidity needs a sand filter. A plant sized correctly but fed untreated bore water will lose its membranes in a single season — and membranes are the most expensive consumable in the system.',
      },
      {
        title: 'What the quoted price should include',
        body:
          'A complete quotation covers the membrane housings and membranes, high-pressure pump, pre-treatment vessels, dosing where required, SS or FRP frame, pressure gauges, and installation. Quotes that look unusually cheap usually exclude pre-treatment, the storage tank, or plumbing to the point of use. Ask for the line items.',
      },
      {
        title: 'AMC is not optional at this scale',
        body:
          'Domestic purifiers tolerate a missed service. Commercial plants do not — a scaled membrane stack is a five-figure replacement. A basic AMC covering quarterly filter changes, membrane cleaning and pressure checks costs a fraction of one avoidable membrane replacement.',
      },
    ],
    priceTable: [
      { item: '25 LPH', range: '₹28,000 – ₹40,000', note: 'Small shop, clinic' },
      { item: '50 LPH', range: '₹40,000 – ₹60,000', note: 'Restaurant, small office' },
      { item: '100 LPH', range: '₹65,000 – ₹95,000', note: 'School, mid restaurant' },
      { item: '250 LPH', range: '₹1,10,000 – ₹1,70,000', note: 'Hotel, hostel' },
      { item: '500 LPH', range: '₹1,80,000 – ₹2,80,000', note: 'Factory, large hotel' },
      { item: '1000 LPH', range: '₹3,00,000 – ₹4,50,000', note: 'Packaged water unit' },
    ],
    faqs: [
      {
        q: 'What is the price of a commercial RO plant in India?',
        a: 'A 25 LPH plant runs roughly ₹28,000–40,000, 100 LPH around ₹65,000–95,000, 250 LPH about ₹1.1–1.7 lakh, and 1000 LPH ₹3–4.5 lakh. Final pricing depends on feed water quality, because pre-treatment requirements change the specification.',
      },
      {
        q: 'How do I choose the right LPH capacity?',
        a: 'Size on peak-hour demand rather than daily total. Small shop or clinic: 25–50 LPH. School or mid-size restaurant: 100–250 LPH. Hotel or factory: 500–1000 LPH. Send us your daily usage and peak hours and we will size it properly.',
      },
      {
        q: 'Is pre-treatment always required?',
        a: 'It depends on your feed water. High hardness requires a softener, high iron an iron removal filter, high turbidity a sand filter. Running a commercial plant on untreated bore water without pre-treatment destroys the membranes within months.',
      },
      {
        q: 'Do you install commercial RO plants outside Patna?',
        a: 'Plants ship across India. Full installation and AMC are handled directly within Patna and nearby districts. Outside that radius we supply the plant with commissioning support and coordinate with a local technician.',
      },
    ],
    keywords: [
      'commercial ro plant price', 'industrial ro plant', '100 lph ro plant price',
      '250 lph ro plant', 'ro plant for shop', 'water plant setup cost',
      'commercial water purifier price', 'ro plant manufacturer',
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════ */
  'ro-membranes': {
    slug: 'ro-membranes',
    metaTitle: 'RO Membrane Price — 75, 80, 100 GPD Online India',
    metaDescription:
      'Buy RO membranes online — 75, 80 and 100 GPD. Vontron, CSM and compatible. Fits Kent, Aquaguard, Pureit, Livpure. Delivery across India. Call 8969821440.',
    heading: 'RO Membranes — 75, 80 and 100 GPD',
    intro:
      'The membrane is the only component that actually lowers TDS, and it is also the part most often replaced when something else has failed. Check the symptoms below before ordering — if your pump is silent, the membrane is not your problem.',
    guide: [
      {
        title: 'Confirm the membrane is genuinely the fault',
        body:
          'A failing membrane shows one clear signature: output TDS climbing while flow stays roughly normal. If flow has collapsed but TDS is unchanged, the fault is a choked pre-filter or a weak pump. If there is no flow at all and the pump is silent, it is the SMPS. Take a TDS reading before you buy — it takes thirty seconds and settles the question.',
      },
      {
        title: 'Choosing the GPD rating',
        body:
          '75 GPD suits most homes on municipal supply and pairs with the pump fitted to the majority of domestic systems. 80–100 GPD suits high input TDS or heavy daily draw, but only where the pump can sustain the required pressure. Fitting a higher-GPD membrane to an underpowered pump gives worse output, not better.',
      },
      {
        title: 'Brand differences that are real',
        body:
          'Vontron, CSM and Dow Filmtec are the elements most commonly fitted in Indian domestic systems and perform comparably at the same GPD. What separates a good membrane from a poor one is the wrap and the seal, not the label. Very cheap unbranded elements typically fail at the seal within eight to ten months.',
      },
      {
        title: 'Getting full life out of a new membrane',
        body:
          'Change the sediment and carbon pre-filters at the same time as the membrane. A new membrane fed through exhausted pre-filters can lose half its life. Flush the new element for fifteen to twenty minutes before drinking, and discard the first tank.',
      },
    ],
    priceTable: [
      { item: '75 GPD membrane', range: '₹650 – ₹1,200', note: 'Standard domestic' },
      { item: '80 GPD membrane', range: '₹750 – ₹1,400', note: 'Higher TDS input' },
      { item: '100 GPD membrane', range: '₹1,000 – ₹1,800', note: 'Needs matched pump' },
      { item: 'Membrane housing', range: '₹250 – ₹600', note: 'Replace if cracked or leaking' },
    ],
    faqs: [
      {
        q: 'How do I know my RO membrane needs replacing?',
        a: 'Output TDS rising while flow stays roughly normal is the signature of a spent membrane. If output has climbed 60–70 ppm above its original reading, replace it. If flow has dropped but TDS is unchanged, the problem is a pre-filter or the pump, not the membrane.',
      },
      {
        q: 'What is the difference between 75 GPD and 100 GPD?',
        a: 'GPD is throughput, not purity. 75 GPD suits most homes. 100 GPD is worth it only where input TDS is high or draw is heavy, and only if your pump can sustain the pressure — otherwise output actually gets worse.',
      },
      {
        q: 'Which membrane brand should I buy?',
        a: 'Vontron, CSM and Dow Filmtec are the standard elements in Indian domestic systems and perform comparably at the same GPD rating. Avoid very cheap unbranded elements; they typically fail at the seal within eight to ten months.',
      },
      {
        q: 'How long does an RO membrane last?',
        a: '18–24 months on normal municipal supply, closer to 12 months where input TDS exceeds 800 ppm. Changing pre-filters on schedule is the single biggest factor in reaching the upper end of that range.',
      },
    ],
    keywords: [
      'ro membrane price', '75 gpd ro membrane', '80 gpd membrane price',
      '100 gpd ro membrane', 'vontron membrane price', 'csm ro membrane',
      'ro membrane for kent', 'ro membrane online',
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════ */
  'booster-pumps': {
    slug: 'booster-pumps',
    metaTitle: 'RO Booster Pump Price — 24V 75 to 100 GPD Online',
    metaDescription:
      'Buy RO booster pumps online — 24V DC diaphragm pumps, 75 to 100 GPD. Fits most domestic purifiers. Mounting bracket included. Delivery across India.',
    heading: 'RO Booster Pumps — 24V DC, 75 to 100 GPD',
    intro:
      'The booster pump provides the pressure an RO membrane needs to work at all. Below roughly 60 psi, a membrane produces very little water regardless of its condition — which is why a weak pump is so often mistaken for a dead membrane.',
    guide: [
      {
        title: 'Pump failure versus membrane failure',
        body:
          'A failing pump makes itself heard: louder running, pulsing, or a hum with almost no output. Output TDS stays where it was — that is the tell. If TDS has risen instead, the membrane is the culprit. A pump that has gone completely silent points to the SMPS rather than the pump itself.',
      },
      {
        title: 'Matching the pump to the membrane',
        body:
          'Use a 75 GPD pump for a 75 GPD membrane and a 100 GPD pump for a 100 GPD membrane. An underpowered pump on a larger membrane produces poor output and shortens both components. Voltage is almost always 24V DC on domestic systems; confirm on the existing SMPS label before ordering.',
      },
      {
        title: 'Install detail people get wrong',
        body:
          'Mount the pump on its bracket with the rubber grommets fitted. Mounting it hard against the cabinet transmits vibration into the panel and the noise gets blamed on the pump. Check that the inlet is fully primed before switching on; running dry damages the diaphragm quickly.',
      },
    ],
    priceTable: [
      { item: '75 GPD booster pump', range: '₹700 – ₹1,200', note: 'Standard domestic' },
      { item: '100 GPD booster pump', range: '₹900 – ₹1,500', note: 'Matched to 100 GPD membrane' },
      { item: 'SMPS 24V adaptor', range: '₹350 – ₹700', note: 'Common companion failure' },
      { item: 'Pump mounting bracket', range: '₹80 – ₹200', note: 'With rubber grommets' },
    ],
    faqs: [
      {
        q: 'How do I know if my RO booster pump has failed?',
        a: 'A failing pump runs louder, pulses, or hums with very little water coming through, while output TDS stays roughly the same. If TDS has risen instead, the membrane is the problem. If the pump is completely silent, check the SMPS adaptor first.',
      },
      {
        q: 'Which booster pump fits my purifier?',
        a: 'Most domestic RO systems use a 24V DC diaphragm pump. Match the GPD rating to your membrane — 75 GPD pump with a 75 GPD membrane, 100 GPD with 100 GPD. Confirm the voltage on your existing SMPS label before ordering.',
      },
      {
        q: 'Can I replace the booster pump myself?',
        a: 'It involves both electrical connections and pressure fittings, so it is a step beyond a filter change. If you are comfortable with both, the swap takes about twenty minutes. Within Patna, fitting is covered by the ₹200 visit charge.',
      },
    ],
    keywords: [
      'ro booster pump price', '24v ro pump', '75 gpd booster pump',
      '100 gpd ro pump', 'ro pump online', 'water purifier pump price',
      'ro diaphragm pump',
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════ */
  accessories: {
    slug: 'accessories',
    metaTitle: 'RO Accessories Online — Pipes, Taps, Fittings India',
    metaDescription:
      'RO accessories online — tubing, taps, elbows, connectors, tanks and mounting kits. Standard sizes fit all brands. Delivery across India. Call 8969821440.',
    heading: 'RO Accessories — Tubing, Taps, Fittings and Tanks',
    intro:
      'Small parts, but they are behind a surprising share of service calls. A ₹40 elbow that has hardened and cracked causes the same slow kitchen flood as a serious component failure. Standard sizing means these fit essentially every domestic system.',
    guide: [
      {
        title: 'Tube sizing',
        body:
          'Domestic RO systems use 1/4 inch tubing almost universally, with 3/8 inch appearing on some higher-flow and commercial units. Measure the outer diameter of your existing tube before ordering. Food-grade LLDPE tubing is the correct material — general-purpose PVC hardens and cracks within a year or two.',
      },
      {
        title: 'Push-fit connectors',
        body:
          'Push-fit connectors need the tube cut square and pushed fully home. A slanted cut is the most common cause of a slow drip that appears days after a service. Cut with a proper tube cutter, not scissors, and push until it stops moving.',
      },
      {
        title: 'When to replace the storage tank',
        body:
          'Tanks develop a stale taste over time as biofilm builds on the internal bladder. If water tastes off straight from the tank but fine at the membrane outlet, the tank is the source. Replacement is usually more sensible than repeated cleaning once it reaches that stage.',
      },
    ],
    priceTable: [
      { item: 'RO tubing 1/4" (per metre)', range: '₹20 – ₹45', note: 'Food-grade LLDPE' },
      { item: 'Purifier tap / faucet', range: '₹180 – ₹600', note: 'Long-neck and short' },
      { item: 'Elbow / connector', range: '₹25 – ₹80', note: 'Push-fit, standard' },
      { item: 'Storage tank 8–12 L', range: '₹500 – ₹1,200', note: 'Food-grade plastic' },
      { item: 'Wall mounting kit', range: '₹120 – ₹350', note: 'Screws and brackets' },
    ],
    faqs: [
      {
        q: 'What size tubing does my RO purifier use?',
        a: '1/4 inch is standard on essentially all domestic RO systems. Some higher-flow and commercial units use 3/8 inch. Measure the outer diameter of your existing tube before ordering, and always use food-grade LLDPE rather than general PVC.',
      },
      {
        q: 'My RO tap is dripping. Do I replace the tap or the connector?',
        a: 'If the drip comes from the spout, the tap cartridge has worn and the tap should be replaced. If it comes from where the tube meets the tap, it is almost always a push-fit connector with a slanted tube cut — re-cut the tube square and refit.',
      },
      {
        q: 'How often should the RO storage tank be replaced?',
        a: 'Tanks last several years, but biofilm builds on the internal bladder over time. If water tastes stale from the tank while tasting fine at the membrane outlet, replace the tank rather than repeatedly cleaning it.',
      },
    ],
    keywords: [
      'ro accessories online', 'ro pipe price', 'ro tap price',
      'ro tank price', 'ro fittings online', 'water purifier tap',
      'ro tubing 1/4 inch',
    ],
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   ALL-PRODUCTS PAGE — the /products listing had zero schema and no body copy
   ══════════════════════════════════════════════════════════════════════════ */
export const PRODUCTS_PAGE_SEO = {
  metaTitle: 'Buy RO Purifier & Spare Parts Online — India 2026',
  metaDescription:
    'Shop RO water purifiers, commercial plants and genuine spare parts online. Free delivery across India above ₹1,999. Expert help on call — 8969821440.',
  heading: 'RO Water Purifiers, Spare Parts & Commercial Plants',
  intro:
    'Everything listed here is a product we install and service ourselves, which is a narrower filter than most catalogues apply. Delivery is pan-India; installation and same-day fitting are available in Patna.',
  trustPoints: [
    {
      title: 'Chosen by people who repair them',
      body:
        'We service purifiers every day. Anything that turns into a recurring parts problem does not stay on this list, whatever the brand.',
    },
    {
      title: 'Standard fittings, honestly stated',
      body:
        'Most parts here fit Kent, Aquaguard, Pureit, Livpure, AO Smith, Blue Star, Havells and locally assembled units. Where a part is model-specific, the listing says so plainly.',
    },
    {
      title: 'Delivery across India',
      body:
        'Free delivery above ₹1,999, flat rate below. Orders dispatch within one working day and typically arrive in two to seven days depending on location.',
    },
    {
      title: 'Advice before you spend',
      body:
        'Tell us the symptom on WhatsApp and we will tell you which part it actually points to. Replacing a membrane when the SMPS has failed is the most common wasted purchase in this category.',
    },
  ],
  faqs: [
    {
      q: 'Do you deliver RO products across India?',
      a: 'Yes. All purifiers, spare parts and accessories ship pan-India. Delivery is free on orders above ₹1,999, with a flat rate below that. Dispatch is within one working day and delivery typically takes two to seven days.',
    },
    {
      q: 'Are the products genuine?',
      a: 'Every item is a product our own technicians install on service calls. Listings state clearly whether a part is a branded original or a standard-fit compatible component, along with which brands it works with.',
    },
    {
      q: 'Can I get installation with my order?',
      a: 'Installation is free within Patna on new purifiers, and spare-part fitting is covered by the ₹200 visit charge. Outside Patna we support installation over phone and WhatsApp at no cost.',
    },
    {
      q: 'What if I order the wrong part?',
      a: 'Returns are accepted within seven days on unused parts in their original packaging. The better path is to message us on WhatsApp at 8969821440 with a photo of your unit before ordering, and we will confirm the correct part.',
    },
    {
      q: 'Do you offer bulk or dealer pricing?',
      a: 'Yes, for bulk orders of spare parts and for commercial plant purchases. Call 8969821440 with your requirement and quantity for a quotation.',
    },
  ],
};

/** Look up a category's SEO block, or null when none is defined. */
export function getCategorySeo(slug: string): CategorySeoBlock | null {
  return CATEGORY_SEO[slug] ?? null;
}
