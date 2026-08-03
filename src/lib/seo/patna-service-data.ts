/**
 * PATNA LOCAL SEO — content source of truth.
 *
 * 16 area pages covering the whole of Patna. Each page has GENUINELY unique
 * content — real landmarks, real pincodes, real water conditions, and the
 * repair pattern we actually see in that locality. This matters because
 * Google's helpful-content system demotes location pages that differ only by
 * a swapped area name.
 *
 * Areas outside this list are covered as text mentions on the homepage and
 * pillar page (keyword coverage without thin pages).
 */

export interface ServiceAreaContent {
  slug: string;
  name: string;
  pincodes: string[];
  lat: number;
  lng: number;
  responseMin: number;
  landmarks: string[];
  nearbyAreas: string[];
  /** Typical TDS range we measure on site — differentiator per area */
  tdsRange: string;
  waterProfile: string;
  intro: string;
  /** The single most common repair in this locality */
  commonRepair: string;
  technicians: number;
  monthlyJobs: number;
}

export const SERVICE_AREAS: ServiceAreaContent[] = [
  {
    slug: 'kankarbagh',
    name: 'Kankarbagh',
    pincodes: ['800020', '800026'],
    lat: 25.5941, lng: 85.1637, responseMin: 45,
    landmarks: ['Ashiana More', 'Malahi Pakri Chowk', 'Kankarbagh Colony More', 'Hanuman Nagar', 'PC Colony', 'Bhootnath Road'],
    nearbyAreas: ['Rajendra Nagar', 'Bahadurpur', 'Lohia Nagar', 'Agamkuan'],
    tdsRange: '450–900 ppm',
    waterProfile:
      'Kankarbagh largely runs on borewell supply with TDS commonly between 450 and 900 ppm. Hardness is the dominant complaint here, which is why membrane choking and white scaling inside the storage tank are the two repairs we perform most often in this locality.',
    intro:
      'Kankarbagh is our busiest service zone in Patna. We keep two technicians stationed inside the colony itself, so calls from Ashiana More, Malahi Pakri and PC Colony are usually attended within 45 minutes.',
    commonRepair: 'Membrane choking due to hard water',
    technicians: 2, monthlyJobs: 180,
  },
  {
    slug: 'boring-road',
    name: 'Boring Road',
    pincodes: ['800001', '800013'],
    lat: 25.6203, lng: 85.1064, responseMin: 60,
    landmarks: ['Boring Road Chauraha', 'Rajapur Pul', 'Sri Krishna Puri', 'Buddha Colony', 'Patna Women\'s College', 'Panchmukhi Hanuman Mandir'],
    nearbyAreas: ['Sri Krishna Puri', 'Buddha Colony', 'Anandpuri', 'Rajapur'],
    tdsRange: '250–500 ppm',
    waterProfile:
      'Boring Road receives a mix of PHED municipal supply and private borewells. TDS is moderate at 250–500 ppm, but seasonal turbidity during monsoon clogs sediment filters within weeks. Pre-filter replacement is by far the most frequent job we handle here.',
    intro:
      'From Boring Road Chauraha to Rajapur Pul we cover the entire stretch including Sri Krishna Puri and Buddha Colony. Apartment complexes here usually prefer scheduled AMC visits over one-off repairs, and we support both.',
    commonRepair: 'Sediment pre-filter clogging (monsoon turbidity)',
    technicians: 2, monthlyJobs: 145,
  },
  {
    slug: 'patliputra-colony',
    name: 'Patliputra Colony',
    pincodes: ['800013'],
    lat: 25.6093, lng: 85.1032, responseMin: 60,
    landmarks: ['Patliputra Golambar', 'Shivpuri', 'Rukanpura', 'Patliputra Industrial Area', 'Nehru Nagar'],
    nearbyAreas: ['Rukanpura', 'Shivpuri', 'Boring Road', 'Rajiv Nagar'],
    tdsRange: '200–400 ppm',
    waterProfile:
      'Patliputra Colony has relatively good municipal supply with TDS around 200–400 ppm. The common problems here are ageing installations — many homes have purifiers over five years old where the booster pump and SMPS board fail well before the membrane does.',
    intro:
      'We service all of Patliputra Colony including Shivpuri, Nehru Nagar and Rukanpura. This area has a high concentration of older RO units, so our technicians always carry spare pumps and SMPS boards on visits here.',
    commonRepair: 'Booster pump and SMPS failure in older units',
    technicians: 1, monthlyJobs: 95,
  },
  {
    slug: 'rajendra-nagar',
    name: 'Rajendra Nagar',
    pincodes: ['800016', '800020'],
    lat: 25.6083, lng: 85.1531, responseMin: 50,
    landmarks: ['Rajendra Nagar Terminal', 'Road No. 1 to 10', 'Thakurbari Road', 'Kadamkuan crossing', 'Rajendra Nagar Flyover'],
    nearbyAreas: ['Kadamkuan', 'Kankarbagh', 'Bhootnath Road', 'Agamkuan'],
    tdsRange: '300–600 ppm',
    waterProfile:
      'Rajendra Nagar sits on older municipal pipelines where iron content is noticeable. Yellow staining on the storage tank and a metallic aftertaste are frequent complaints, usually solved with an iron pre-filter fitted alongside the standard RO service.',
    intro:
      'We cover all ten roads of Rajendra Nagar plus the Terminal area and Thakurbari Road. Iron-related taste complaints are common here, so we stock iron-removal pre-filters specifically for this locality.',
    commonRepair: 'Iron staining — needs iron pre-filter add-on',
    technicians: 1, monthlyJobs: 110,
  },
  {
    slug: 'danapur',
    name: 'Danapur',
    pincodes: ['801503', '801505'],
    lat: 25.6357, lng: 85.0478, responseMin: 90,
    landmarks: ['Danapur Cantonment', 'Danapur Station', 'Saguna More', 'Khagaul Road', 'Nasriganj', 'Ram Jaipal Road'],
    nearbyAreas: ['Saguna More', 'Khagaul', 'Rupaspur', 'Nasriganj'],
    tdsRange: '900–1400 ppm',
    waterProfile:
      'Danapur and the Saguna More belt depend almost entirely on borewells, with TDS frequently exceeding 1000 ppm. This is the highest-TDS zone we serve in greater Patna, so membranes here need replacement every 14–18 months instead of the usual two years.',
    intro:
      'We extend full coverage to Danapur, Saguna More, Khagaul Road and Nasriganj. Given the high TDS here we usually recommend a 100 GPD membrane with a booster pump rather than the standard 75 GPD setup — it lasts noticeably longer.',
    commonRepair: 'Frequent membrane replacement (high TDS)',
    technicians: 1, monthlyJobs: 85,
  },
  {
    slug: 'bailey-road',
    name: 'Bailey Road',
    pincodes: ['800014', '800001'],
    lat: 25.6116, lng: 85.0854, responseMin: 60,
    landmarks: ['Hartali More', 'Raja Bazar', 'Jagdeo Path', 'Sheikhpura More', 'Patna Zoo', 'Vikas Bhawan'],
    nearbyAreas: ['Jagdeo Path', 'Raja Bazar', 'Shekhpura', 'Rukanpura'],
    tdsRange: '280–550 ppm',
    waterProfile:
      'The Bailey Road corridor from Hartali More to Jagdeo Path has mixed supply quality. Commercial establishments dominate here, so we handle a higher share of 50–250 LPH commercial plant servicing than residential repairs.',
    intro:
      'Bailey Road is our main commercial service corridor. Alongside home visits we maintain RO plants for restaurants, coaching institutes and offices between Hartali More and Sheikhpura More.',
    commonRepair: 'Commercial plant filter and pump servicing',
    technicians: 2, monthlyJobs: 130,
  },
  {
    slug: 'kadamkuan',
    name: 'Kadamkuan',
    pincodes: ['800003'],
    lat: 25.6167, lng: 85.1567, responseMin: 55,
    landmarks: ['Kadamkuan Thana', 'Rajendra Nagar Road No. 1', 'Bhootnath Road', 'Chhajju Bagh', 'Naya Tola'],
    nearbyAreas: ['Rajendra Nagar', 'Naya Tola', 'Gandhi Maidan', 'Lohanipur'],
    tdsRange: '350–700 ppm',
    waterProfile:
      'Kadamkuan is one of the older parts of Patna with narrow-lane plumbing and low inlet pressure. Purifiers here often run without a booster pump and simply cannot fill the tank — adding a pump solves the complaint in most cases.',
    intro:
      'We service the whole of Kadamkuan including Naya Tola, Chhajju Bagh and the Bhootnath Road side. Low water pressure is the recurring theme in this area, so our technicians carry booster pumps as standard on Kadamkuan visits.',
    commonRepair: 'Low inlet pressure — booster pump installation',
    technicians: 1, monthlyJobs: 90,
  },
  {
    slug: 'ashiana-nagar',
    name: 'Ashiana Nagar',
    pincodes: ['800025'],
    lat: 25.6280, lng: 85.0790, responseMin: 65,
    landmarks: ['Ashiana-Digha Road', 'Ashiana Nagar Phase 1 & 2', 'Kesari Nagar', 'Indrapuri', 'Rajiv Nagar Road No. 20'],
    nearbyAreas: ['Rajiv Nagar', 'Digha', 'Indrapuri', 'Kesari Nagar'],
    tdsRange: '600–1000 ppm',
    waterProfile:
      'Ashiana Nagar and the Ashiana-Digha Road belt rely heavily on deep borewells. TDS runs 600–1000 ppm with noticeable hardness, so pre-filters and membranes both wear faster than the Patna average.',
    intro:
      'We cover Ashiana Nagar Phase 1 and 2, Kesari Nagar and the full Ashiana-Digha Road stretch. Because water here is hard, we usually advise an AMC plan — paying per service works out costlier in this area.',
    commonRepair: 'Hard-water scaling on membrane and tank',
    technicians: 1, monthlyJobs: 105,
  },
  {
    slug: 'rajiv-nagar',
    name: 'Rajiv Nagar',
    pincodes: ['800024'],
    lat: 25.6220, lng: 85.0910, responseMin: 65,
    landmarks: ['Rajiv Nagar Road No. 1–25', 'Nala Par', 'Indrapuri', 'Patliputra Station Road', 'Shekhar Eye Care'],
    nearbyAreas: ['Ashiana Nagar', 'Indrapuri', 'Rukanpura', 'Patliputra'],
    tdsRange: '500–850 ppm',
    waterProfile:
      'Rajiv Nagar has grown fast with mostly private borewells serving individual houses. TDS averages 500–850 ppm. Because many installations were done cheaply by local fitters, we frequently find wrong fittings and leaking elbows rather than component failure.',
    intro:
      'We service all roads of Rajiv Nagar including the Nala Par side and Indrapuri. A large share of calls here turn out to be poor original installation rather than a faulty machine — we re-do the fitting properly at no extra part cost.',
    commonRepair: 'Leakage from poorly fitted connectors',
    technicians: 1, monthlyJobs: 100,
  },
  {
    slug: 'gola-road',
    name: 'Gola Road',
    pincodes: ['800012'],
    lat: 25.6180, lng: 85.0560, responseMin: 75,
    landmarks: ['Gola Road Crossing', 'Digha Bridge Link Road', 'Rupaspur', 'Lal Market', 'RPS More'],
    nearbyAreas: ['Rupaspur', 'Digha', 'Danapur', 'Khagaul'],
    tdsRange: '700–1200 ppm',
    waterProfile:
      'The Gola Road and Rupaspur belt sits on the same high-TDS aquifer as Danapur, commonly measuring 700–1200 ppm. Purifiers here reject a lot of water, and customers often complain about wastage — a properly set flow restrictor fixes most of it.',
    intro:
      'We serve Gola Road, RPS More, Rupaspur and the Digha Bridge Link Road stretch. High TDS means high reject water here, so we always check and reset the flow restrictor during service.',
    commonRepair: 'High reject water — flow restrictor adjustment',
    technicians: 1, monthlyJobs: 80,
  },
  {
    slug: 'gandhi-maidan',
    name: 'Gandhi Maidan',
    pincodes: ['800001', '800004'],
    lat: 25.6127, lng: 85.1416, responseMin: 55,
    landmarks: ['Gandhi Maidan', 'Fraser Road', 'Exhibition Road', 'Dak Bunglow Chauraha', 'SP Verma Road', 'Golghar'],
    nearbyAreas: ['Fraser Road', 'Exhibition Road', 'Kadamkuan', 'Golghar'],
    tdsRange: '250–450 ppm',
    waterProfile:
      'The Gandhi Maidan and Fraser Road commercial core has decent municipal supply at 250–450 ppm TDS. Most units here are in shops, offices and hotels running long hours, so pumps burn out faster than in homes.',
    intro:
      'We cover the central business district — Gandhi Maidan, Fraser Road, Exhibition Road, Dak Bunglow and SP Verma Road. Commercial units here run all day, so we recommend a quarterly service cycle instead of the usual six-month one.',
    commonRepair: 'Pump burnout from heavy commercial usage',
    technicians: 1, monthlyJobs: 95,
  },
  {
    slug: 'phulwari-sharif',
    name: 'Phulwari Sharif',
    pincodes: ['801505'],
    lat: 25.5830, lng: 85.0570, responseMin: 90,
    landmarks: ['Phulwari Sharif Main Road', 'AIIMS Patna', 'Haroon Nagar', 'Tamtam Padao', 'Khagaul Road'],
    nearbyAreas: ['Khagaul', 'AIIMS area', 'Haroon Nagar', 'Danapur'],
    tdsRange: '800–1300 ppm',
    waterProfile:
      'Phulwari Sharif has some of the hardest water in the Patna region at 800–1300 ppm, with iron also present in several pockets. Machines here need both an iron pre-filter and a higher-capacity membrane to give usable output.',
    intro:
      'We serve Phulwari Sharif including the AIIMS area, Haroon Nagar and Tamtam Padao. Water here is genuinely difficult — we carry iron pre-filters and 100 GPD membranes on every Phulwari visit rather than making a second trip.',
    commonRepair: 'Iron + hardness combination — dual pre-filter setup',
    technicians: 1, monthlyJobs: 75,
  },
  {
    slug: 'khagaul',
    name: 'Khagaul',
    pincodes: ['801105'],
    lat: 25.5790, lng: 85.0430, responseMin: 95,
    landmarks: ['Khagaul Railway Colony', 'Khagaul Bazar', 'Danapur Road', 'Sagar More', 'Parsa Bazar Road'],
    nearbyAreas: ['Danapur', 'Phulwari Sharif', 'Rupaspur', 'Parsa Bazar'],
    tdsRange: '850–1250 ppm',
    waterProfile:
      'Khagaul draws from the same high-TDS belt as Danapur and Phulwari. Railway colony housing here often has shared overhead tanks, which adds sediment on top of the hardness — double filtration is usually needed.',
    intro:
      'We cover Khagaul Bazar, the Railway Colony, Sagar More and the Danapur Road side. Shared overhead tanks mean extra sediment, so we fit an additional pre-filter stage on most Khagaul installations.',
    commonRepair: 'Sediment overload from shared overhead tanks',
    technicians: 1, monthlyJobs: 60,
  },
  {
    slug: 'digha',
    name: 'Digha',
    pincodes: ['800011'],
    lat: 25.6320, lng: 85.0680, responseMin: 70,
    landmarks: ['Digha Ghat', 'Digha Bridge', 'Shanti Vihar Colony', 'Kurji More', 'JP Setu approach'],
    nearbyAreas: ['Kurji', 'Ashiana Nagar', 'Gola Road', 'Rajapur'],
    tdsRange: '550–950 ppm',
    waterProfile:
      'Digha sits close to the Ganga, and shallow borewells here can pick up sand and silt, especially after monsoon. TDS runs 550–950 ppm. Sand entering the pump chamber is a failure mode we see almost only in this belt.',
    intro:
      'We serve Digha Ghat, Shanti Vihar Colony, Kurji More and the JP Setu approach road. Proximity to the river means silt in the supply — we fit a coarse sediment stage before the standard pre-filter on Digha units.',
    commonRepair: 'Sand and silt damaging the pump',
    technicians: 1, monthlyJobs: 70,
  },
  {
    slug: 'patna-city',
    name: 'Patna City',
    pincodes: ['800008', '800007'],
    lat: 25.6000, lng: 85.2100, responseMin: 85,
    landmarks: ['Gulzarbagh', 'Chowk', 'Mangal Talab', 'Ashok Raj Path', 'Gaighat', 'Alamganj'],
    nearbyAreas: ['Gulzarbagh', 'Gaighat', 'Mangal Talab', 'Alamganj'],
    tdsRange: '600–1100 ppm',
    waterProfile:
      'Patna City (the old city) has the oldest pipeline network in the district. Water carries both hardness and occasional bacterial contamination, so UV stages here fail more often and genuinely matter — we never recommend skipping UV in this area.',
    intro:
      'We cover the old city — Chowk, Gulzarbagh, Mangal Talab, Ashok Raj Path and Alamganj. Narrow lanes mean our technicians come by two-wheeler here, and we still reach within 85 minutes on most calls.',
    commonRepair: 'UV lamp failure — critical in this area',
    technicians: 1, monthlyJobs: 85,
  },
  {
    slug: 'kumhrar',
    name: 'Kumhrar',
    pincodes: ['800026'],
    lat: 25.5960, lng: 85.1750, responseMin: 60,
    landmarks: ['Kumhrar Park', 'Bypass Road', 'Sipara', 'Khemnichak', 'Transport Nagar'],
    nearbyAreas: ['Kankarbagh', 'Sipara', 'Khemnichak', 'Agamkuan'],
    tdsRange: '500–900 ppm',
    waterProfile:
      'Kumhrar and the Bypass Road belt run on borewells with TDS in the 500–900 ppm range. Voltage fluctuation is a bigger problem here than water quality — SMPS boards fail repeatedly unless a stabiliser is fitted.',
    intro:
      'We serve Kumhrar, Sipara, Khemnichak and the Bypass Road stretch. Unstable voltage in this belt kills SMPS boards, so we advise a small stabiliser alongside the repair — it prevents the same fault recurring.',
    commonRepair: 'SMPS failure from voltage fluctuation',
    technicians: 1, monthlyJobs: 80,
  },
];

/** Areas covered but without dedicated pages — keyword coverage as text. */
export const ADDITIONAL_AREAS = [
  'Sri Krishna Puri', 'Anandpuri', 'Buddha Colony', 'Rukanpura', 'Shivpuri',
  'Indrapuri', 'Kesari Nagar', 'Jagdeo Path', 'Raja Bazar', 'Sheikhpura',
  'Khajpura', 'Nageshwar Colony', 'Mansarovar Colony', 'New Punaichak',
  'Chandmari', 'Gulzarbagh', 'Gaighat', 'Alamganj', 'Mithapur', 'Beur',
  'Agamkuan', 'Bahadurpur', 'Lohia Nagar', 'Lohanipur', 'Naya Tola',
  'Chhajju Bagh', 'Exhibition Road', 'Fraser Road', 'SP Verma Road',
  'Dak Bunglow', 'Golghar', 'Kurji', 'Rupaspur', 'Saguna More', 'Nasriganj',
  'Sipara', 'Khemnichak', 'Transport Nagar', 'Parsa Bazar', 'AG Colony',
  'Patel Nagar', 'Adarsh Colony', 'Boring Canal Road', 'Bhootnath Road',
];

/* ────────────────────────────────────────────────────────────────────────── */

export interface BrandServiceContent {
  slug: string;
  name: string;
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
      'Kent units use a proprietary push-fit housing on several models. We carry genuine Kent-compatible O-rings and housings, so no jugaad fittings that leak again within a month.',
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
      'Livpure Glo and Bolt share a common pump assembly which we keep in stock — same-day replacement in most Patna areas.',
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
      'Pureit gravity and RO models are quite different internally. Tell us the exact model when you call and we bring the right kit on the first visit.',
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
      'Blue Star units use standard 10-inch housings on most models, so spares are readily available and repairs finish on the first visit.',
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
      'Havells Digitouch models are sensitive to voltage fluctuation — common in Kumhrar and Bypass Road. We recommend a stabiliser and can supply one during the visit.',
  },
  {
    slug: 'other-brands',
    name: 'All Other Brands & Local Assembled Units',
    popularModels: ['Aquafresh', 'Nasaka', 'Zero B', 'Tata Swach', 'LG', 'Panasonic', 'Local assembled RO'],
    commonIssues: [
      { issue: 'Any no-water or low-flow issue', cause: 'Membrane, pump or pre-filter', typicalCost: '₹500 – ₹2,500' },
      { issue: 'Leakage anywhere in the unit', cause: 'Fittings, housings or tubing', typicalCost: '₹250 – ₹900' },
      { issue: 'Electrical or motor faults', cause: 'SMPS, pump or wiring', typicalCost: '₹600 – ₹2,000' },
      { issue: 'Taste and odour problems', cause: 'Carbon filter or membrane', typicalCost: '₹400 – ₹2,200' },
    ],
    note:
      'Local assembled units are extremely common in Patna and we service them fully. Because parts are standard 10-inch fittings, repairs are often cheaper and faster than on branded units.',
  },
];

/** Shared FAQ set reused across all area pages (with FAQPage schema). */
export function buildAreaFaqs(area: ServiceAreaContent) {
  return [
    {
      q: `What is the RO service visit charge in ${area.name}, Patna?`,
      a: `Our visit charge in ${area.name} is only ₹100 — most other providers in Patna charge ₹299 to ₹399. This covers complete inspection, TDS testing and diagnosis. Parts and repair work are quoted separately and only carried out after you approve the cost.`,
    },
    {
      q: `How quickly can a technician reach ${area.name}?`,
      a: `We typically reach ${area.name} within ${area.responseMin} minutes for requests placed before 5 PM, because we have ${area.technicians} technician${area.technicians > 1 ? 's' : ''} covering this area. For urgent cases call 8969821440 directly.`,
    },
    {
      q: `What is the water TDS level in ${area.name}?`,
      a: `We typically measure ${area.tdsRange} in ${area.name}. ${area.waterProfile}`,
    },
    {
      q: `What is the most common RO problem in ${area.name}?`,
      a: `${area.commonRepair}. Because we see this repeatedly in ${area.name}, our technicians carry the required parts on every visit to this area — so it is usually fixed on the first trip.`,
    },
    {
      q: `Which RO brands do you repair in ${area.name}?`,
      a: 'All brands including Kent, Aquaguard, Livpure, Pureit, AO Smith, Blue Star, Havells, Nasaka, Zero B and locally assembled units. Our technicians carry common spare parts for every major brand.',
    },
    {
      q: 'Do you provide a warranty on repairs?',
      a: 'Yes. Every repair carries a 30-day service warranty, and replacement parts carry their own manufacturer warranty of 6 to 12 months depending on the component.',
    },
    {
      q: 'Do I need to pay in advance?',
      a: 'No advance payment is required. You pay only after the technician has completed the work at your home. We accept cash, UPI and card.',
    },
  ];
}
