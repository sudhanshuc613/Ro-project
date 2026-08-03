/**
 * PATNA LOCAL SEO — content source of truth.
 *
 * Every area and brand below becomes an indexable landing page. The content is
 * deliberately UNIQUE per page (real landmarks, real pincodes, area-specific
 * water problems) because Google's helpful-content system demotes templated
 * location pages that differ only by a swapped city name.
 */

export interface ServiceAreaContent {
  slug: string;
  name: string;
  pincodes: string[];
  lat: number;
  lng: number;
  responseMin: number;
  /** Real, recognisable landmarks — critical for local relevance signals */
  landmarks: string[];
  nearbyAreas: string[];
  /** Area-specific water context — this is what makes each page genuinely unique */
  waterProfile: string;
  intro: string;
  technicians: number;
  monthlyJobs: number;
}

export const SERVICE_AREAS: ServiceAreaContent[] = [
  {
    slug: 'kankarbagh',
    name: 'Kankarbagh',
    pincodes: ['800020', '800026'],
    lat: 25.5941,
    lng: 85.1637,
    responseMin: 60,
    landmarks: ['Ashiana More', 'Malahi Pakri Chowk', 'Kankarbagh Colony More', 'Hanuman Nagar', 'Rajendra Nagar Terminal'],
    nearbyAreas: ['Rajendra Nagar', 'Bahadurpur', 'Lohia Nagar', 'Agamkuan'],
    waterProfile:
      'Kankarbagh largely runs on borewell supply with TDS commonly measuring between 450 and 900 ppm. Hardness is the dominant complaint here, which is why membrane choking and scaling on the storage tank are the two repairs we perform most often in this locality.',
    intro:
      'Kankarbagh is our busiest service zone in Patna. We keep two technicians stationed within the colony itself, so most calls from Ashiana More, Malahi Pakri and Hanuman Nagar are attended within an hour.',
    technicians: 2,
    monthlyJobs: 180,
  },
  {
    slug: 'boring-road',
    name: 'Boring Road',
    pincodes: ['800001', '800013'],
    lat: 25.6203,
    lng: 85.1064,
    responseMin: 75,
    landmarks: ['Boring Road Chauraha', 'Rajapur Pul', 'Sri Krishna Puri', 'Buddha Colony', 'Patna Womens College'],
    nearbyAreas: ['Sri Krishna Puri', 'Buddha Colony', 'Patliputra Colony', 'Rajapur'],
    waterProfile:
      'Boring Road receives a mix of PHED municipal supply and private borewells. TDS is moderate at 250–500 ppm, but seasonal turbidity during monsoon clogs sediment filters quickly. Pre-filter replacement is the most frequent job we handle in this area.',
    intro:
      'From Boring Road Chauraha to Rajapur Pul, we cover the entire stretch including Sri Krishna Puri and Buddha Colony. Apartment complexes here often need scheduled AMC visits rather than one-off repairs, and we support both.',
    technicians: 2,
    monthlyJobs: 145,
  },
  {
    slug: 'patliputra-colony',
    name: 'Patliputra Colony',
    pincodes: ['800013'],
    lat: 25.6093,
    lng: 85.0032,
    responseMin: 90,
    landmarks: ['Patliputra Golambar', 'Shivpuri', 'Rukanpura', 'Patliputra Industrial Area'],
    nearbyAreas: ['Rukanpura', 'Shivpuri', 'Boring Road', 'Rajiv Nagar'],
    waterProfile:
      'Patliputra Colony has relatively good municipal supply with TDS around 200–400 ppm. The common issues here are ageing installations — many homes have purifiers over five years old where the pump and SMPS fail before the membrane does.',
    intro:
      'We service the whole of Patliputra Colony including Shivpuri and Rukanpura. This area has a high concentration of older RO units, so we always carry replacement pumps and SMPS boards on visits here.',
    technicians: 1,
    monthlyJobs: 95,
  },
  {
    slug: 'rajendra-nagar',
    name: 'Rajendra Nagar',
    pincodes: ['800016', '800020'],
    lat: 25.6083,
    lng: 85.1531,
    responseMin: 70,
    landmarks: ['Rajendra Nagar Terminal', 'Rajendra Nagar Road No. 1-10', 'Thakurbari Road', 'Kadamkuan'],
    nearbyAreas: ['Kadamkuan', 'Kankarbagh', 'Bhootnath Road', 'Agamkuan'],
    waterProfile:
      'Rajendra Nagar sits on older municipal pipelines where iron content is noticeable. Yellow staining and a metallic taste are frequent complaints, usually solved with an iron pre-filter alongside the standard RO service.',
    intro:
      'Covering all ten roads of Rajendra Nagar plus the Terminal area and Thakurbari Road. Iron-related taste complaints are common here and we stock iron removal pre-filters specifically for this locality.',
    technicians: 1,
    monthlyJobs: 110,
  },
  {
    slug: 'danapur',
    name: 'Danapur',
    pincodes: ['801503', '801505'],
    lat: 25.6357,
    lng: 85.0478,
    responseMin: 120,
    landmarks: ['Danapur Cantonment', 'Danapur Station', 'Saguna More', 'Khagaul Road', 'Nasriganj'],
    nearbyAreas: ['Saguna More', 'Khagaul', 'Rupaspur', 'Nasriganj'],
    waterProfile:
      'Danapur and the Saguna More belt depend heavily on borewells with TDS frequently exceeding 1000 ppm. This is the highest-TDS zone we serve in greater Patna, so membranes here need replacement roughly every 14–18 months rather than the usual two years.',
    intro:
      'We extend full service coverage to Danapur, Saguna More, Khagaul Road and Nasriganj. Given the high TDS in this belt, we usually recommend a 100 GPD membrane with a booster pump rather than the standard 75 GPD setup.',
    technicians: 1,
    monthlyJobs: 85,
  },
  {
    slug: 'bailey-road',
    name: 'Bailey Road',
    pincodes: ['800014', '800001'],
    lat: 25.6116,
    lng: 85.0854,
    responseMin: 80,
    landmarks: ['Hartali More', 'Raja Bazar', 'Jagdeo Path', 'Sheikhpura More', 'Patna Zoo'],
    nearbyAreas: ['Jagdeo Path', 'Raja Bazar', 'Shekhpura', 'Rukanpura'],
    waterProfile:
      'The Bailey Road corridor from Hartali More to Jagdeo Path has mixed supply quality. Commercial establishments dominate here, so we handle a higher share of 50–250 LPH commercial plant servicing than residential repairs.',
    intro:
      'Bailey Road is our main commercial service corridor. Alongside home visits we maintain RO plants for restaurants, coaching institutes and offices between Hartali More and Sheikhpura More.',
    technicians: 2,
    monthlyJobs: 130,
  },
];

/* ────────────────────────────────────────────────────────────────────────── */

export interface BrandServiceContent {
  slug: string;
  name: string;
  /** Genuine, model-specific failure patterns — not generic filler */
  commonIssues: { issue: string; cause: string; typicalCost: string }[];
  popularModels: string[];
  note: string;
}

export const SERVICED_BRANDS: BrandServiceContent[] = [
  {
    slug: 'kent',
    name: 'Kent',
    popularModels: ['Kent Grand Plus', 'Kent Supreme', 'Kent Pearl', 'Kent Ace', 'Kent Maxx', 'Kent Prime TC'],
    commonIssues: [
      { issue: 'Water not filling in tank', cause: 'Choked RO membrane or failed booster pump', typicalCost: '₹850 – ₹2,400' },
      { issue: 'Continuous drain / water wastage', cause: 'Faulty solenoid valve or stuck float switch', typicalCost: '₹450 – ₹900' },
      { issue: 'UV lamp indicator off', cause: 'UV lamp end-of-life or ballast failure', typicalCost: '₹650 – ₹1,200' },
      { issue: 'Leakage from filter housing', cause: 'Perished O-ring or hairline crack in housing', typicalCost: '₹250 – ₹700' },
    ],
    note:
      'Kent units use a proprietary push-fit housing on several models. We carry genuine Kent-compatible O-rings and housings, so no jugaad fittings that leak again in a month.',
  },
  {
    slug: 'aquaguard',
    name: 'Aquaguard (Eureka Forbes)',
    popularModels: ['Aquaguard Enhance', 'Aquaguard Reviva', 'Aquaguard Marvel', 'Aquaguard Aura', 'Aquaguard Delight'],
    commonIssues: [
      { issue: 'E1 / E2 error on display', cause: 'Sensor fault or low inlet pressure', typicalCost: '₹500 – ₹1,500' },
      { issue: 'Slow water output', cause: 'Clogged sediment and carbon pre-filters', typicalCost: '₹600 – ₹1,100' },
      { issue: 'Machine not powering on', cause: 'SMPS adaptor failure', typicalCost: '₹700 – ₹1,300' },
      { issue: 'Bad taste after service', cause: 'Carbon filter not flushed correctly', typicalCost: '₹300 – ₹600' },
    ],
    note:
      'Aquaguard electronic models need correct sensor calibration after a filter change. We reset the service indicator properly rather than just clearing the alarm.',
  },
  {
    slug: 'livpure',
    name: 'Livpure',
    popularModels: ['Livpure Glo', 'Livpure Bolt', 'Livpure Pep Pro', 'Livpure Envy', 'Livpure Zinger'],
    commonIssues: [
      { issue: 'Low water flow', cause: 'Membrane scaling from high TDS input', typicalCost: '₹1,400 – ₹2,600' },
      { issue: 'Motor running continuously', cause: 'Faulty high-pressure switch', typicalCost: '₹450 – ₹850' },
      { issue: 'Water tastes salty', cause: 'Punctured membrane allowing TDS bypass', typicalCost: '₹1,400 – ₹2,600' },
      { issue: 'Noise from pump', cause: 'Worn pump diaphragm or loose mounting', typicalCost: '₹900 – ₹1,800' },
    ],
    note:
      'Livpure Glo and Bolt models share a common pump assembly, which we stock as a standard part — same-day replacement in most Patna areas.',
  },
  {
    slug: 'pureit',
    name: 'Pureit (HUL)',
    popularModels: ['Pureit Ultima', 'Pureit Classic', 'Pureit Copper+', 'Pureit Marvella', 'Pureit Eco Water Saver'],
    commonIssues: [
      { issue: 'Germkill kit exhausted warning', cause: 'GKK reached end of rated life', typicalCost: '₹1,100 – ₹2,200' },
      { issue: 'Water not dispensing', cause: 'Blocked dispensing valve or airlock', typicalCost: '₹350 – ₹800' },
      { issue: 'Copper indicator not working', cause: 'Copper cartridge depleted', typicalCost: '₹800 – ₹1,500' },
      { issue: 'Overflow from tank', cause: 'Float valve stuck open', typicalCost: '₹300 – ₹650' },
    ],
    note:
      'Pureit gravity and RO models are quite different internally. Tell us the exact model when you call and we will bring the right kit on the first visit.',
  },
  {
    slug: 'ao-smith',
    name: 'AO Smith',
    popularModels: ['AO Smith Z9', 'AO Smith X7', 'AO Smith ProPlanet P5', 'AO Smith Z8'],
    commonIssues: [
      { issue: 'Filter change indicator stuck', cause: 'Service counter not reset after last change', typicalCost: '₹300 – ₹500' },
      { issue: 'Hot water function failing', cause: 'Heating element or thermostat fault', typicalCost: '₹1,200 – ₹2,800' },
      { issue: 'Reduced purified output', cause: 'Membrane fouling', typicalCost: '₹1,600 – ₹3,000' },
      { issue: 'Display blank', cause: 'Control PCB or adaptor failure', typicalCost: '₹900 – ₹2,500' },
    ],
    note:
      'AO Smith premium models have side-stream and hot-water variants that need careful handling. Our technicians are trained on the Z-series specifically.',
  },
  {
    slug: 'blue-star',
    name: 'Blue Star',
    popularModels: ['Blue Star Aristo', 'Blue Star Excella', 'Blue Star Stella', 'Blue Star Opulus'],
    commonIssues: [
      { issue: 'Purification indicator red', cause: 'Filter life exhausted', typicalCost: '₹900 – ₹1,900' },
      { issue: 'Water leaking from bottom', cause: 'Cracked tank fitting or loose elbow', typicalCost: '₹350 – ₹900' },
      { issue: 'TDS too high in output', cause: 'Membrane failure or TDS controller misadjusted', typicalCost: '₹1,300 – ₹2,500' },
      { issue: 'Unit shuts off intermittently', cause: 'Loose SMPS connector', typicalCost: '₹400 – ₹1,000' },
    ],
    note:
      'Blue Star units use standard 10-inch housings on most models, so spare parts are readily available and repairs are usually completed on the first visit.',
  },
  {
    slug: 'havells',
    name: 'Havells',
    popularModels: ['Havells Max', 'Havells Digitouch', 'Havells Delite', 'Havells Fab'],
    commonIssues: [
      { issue: 'Touch panel unresponsive', cause: 'Control board moisture ingress', typicalCost: '₹1,100 – ₹2,600' },
      { issue: 'Alkaline function not working', cause: 'Alkaline cartridge exhausted', typicalCost: '₹850 – ₹1,700' },
      { issue: 'Slow filling', cause: 'Pre-filter choked with sediment', typicalCost: '₹500 – ₹1,000' },
      { issue: 'Water overflow', cause: 'Level sensor fault', typicalCost: '₹600 – ₹1,300' },
    ],
    note:
      'Havells Digitouch models are sensitive to voltage fluctuation. We recommend a stabiliser in areas of Patna with unstable supply, and we can supply one during the visit.',
  },
  {
    slug: 'other-brands',
    name: 'All Other Brands & Local Assembled Units',
    popularModels: ['Aquafresh', 'Nasaka', 'Zero B', 'Tata Swach', 'Local assembled RO', 'Imported units'],
    commonIssues: [
      { issue: 'Any no-water or low-flow issue', cause: 'Membrane, pump or pre-filter', typicalCost: '₹500 – ₹2,500' },
      { issue: 'Leakage anywhere in the unit', cause: 'Fittings, housings or tubing', typicalCost: '₹250 – ₹900' },
      { issue: 'Electrical or motor faults', cause: 'SMPS, pump or wiring', typicalCost: '₹600 – ₹2,000' },
      { issue: 'Taste and odour problems', cause: 'Carbon filter or membrane', typicalCost: '₹400 – ₹2,200' },
    ],
    note:
      'Local assembled units are extremely common in Patna and we service them fully. Because parts are standard 10-inch fittings, repairs are often cheaper and faster than branded units.',
  },
];

/** Shared FAQ set reused across all Patna service pages (with FAQPage schema). */
export function buildAreaFaqs(area: ServiceAreaContent) {
  return [
    {
      q: `What is the RO service visit charge in ${area.name}, Patna?`,
      a: `Our visit charge in ${area.name} is only ₹100. This covers a complete inspection and diagnosis of your water purifier. Any parts or repair work is quoted separately and only carried out after you approve the cost.`,
    },
    {
      q: `How quickly can a technician reach ${area.name}?`,
      a: `We typically reach ${area.name} within ${area.responseMin} minutes for requests placed before 5 PM, because we have ${area.technicians} technician${area.technicians > 1 ? 's' : ''} covering this area. For urgent cases call 8969821440 directly.`,
    },
    {
      q: `Which RO brands do you repair in ${area.name}?`,
      a: 'We repair all brands including Kent, Aquaguard, Livpure, Pureit, AO Smith, Blue Star, Havells, Nasaka, Zero B and locally assembled units. Our technicians carry common spare parts for every major brand.',
    },
    {
      q: `What is the water quality like in ${area.name}?`,
      a: area.waterProfile,
    },
    {
      q: 'Do you provide a warranty on repairs?',
      a: 'Yes. Every repair carries a 30-day service warranty, and replacement parts carry their own manufacturer warranty of 6 to 12 months depending on the component.',
    },
    {
      q: 'Do I need to pay in advance?',
      a: 'No advance payment is required. You pay only after the technician has completed the work at your home. We accept cash, UPI, and card.',
    },
  ];
}
