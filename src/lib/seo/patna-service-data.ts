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
  /** Market position in Patna specifically — no two brands share this. */
  patnaContext?: string;
  /** Brand-specific service intervals / part economics. */
  partsProfile?: string;
  /** The scam or overcharge we actually see on this brand locally. */
  watchOut?: string;
  /** Extra brand-only FAQ pairs, appended to the shared set. */
  extraFaqs?: { q: string; a: string }[];
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
    patnaContext:
      'Kent is the single most common branded RO we see in Patna — roughly one in four service calls in Boring Road, Patliputra and Rajendra Nagar is a Kent unit. The Grand Plus and Supreme dominate in flats built after 2015.',
    partsProfile:
      'Kent uses a proprietary push-fit housing on several models, so a generic 10-inch filter will not seat correctly. A genuine Kent sediment + carbon set runs ₹450–₹700; the 80 GPD membrane ₹1,400–₹2,200. We keep both in the van.',
    watchOut:
      'The commonest overcharge on Kent in Patna is being told the whole \'filter kit\' must be replaced when only the sediment pre-filter is choked. Ask the technician to show you the removed filter — a choked one is visibly brown or grey.',
    extraFaqs: [
      { q: 'My Kent shows the UV lamp indicator off — is that serious?', a: 'It means the UV lamp or its ballast has failed, so water is passing through without UV disinfection. It is not dangerous immediately if your source is municipal supply, but it should be fixed within a few days. Lamp plus ballast is typically ₹650–₹1,200 in Patna.' },
    ]
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
    patnaContext:
      'Aquaguard has the widest installed base in older Patna colonies — Kadamkuan, Bakarganj and Gardanibagh have many units that are eight to twelve years old and still running.',
    partsProfile:
      'Electronic Aquaguard models store a service counter that must be reset after a filter change, otherwise the alarm returns in days. Filter sets run ₹600–₹1,100; SMPS adaptors ₹700–₹1,300.',
    watchOut:
      'If a technician only silences the Aquaguard alarm without resetting the service counter properly, it comes back within a week and you get charged twice. We reset it correctly and show you the display afterwards.',
    extraFaqs: [
      { q: 'What does E1 or E2 mean on my Aquaguard?', a: 'E1 usually indicates low inlet water pressure and E2 a sensor fault. In Patna the E1 case is very often just low municipal pressure at your floor rather than a machine fault — we check the inlet pressure first before recommending any part.' },
    ]
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
    patnaContext:
      'Livpure sells strongly through online channels, so we see it most in newer flats in Bailey Road, Digha and Rukanpura where residents bought during festive sales.',
    partsProfile:
      'Livpure Glo and Bolt share a common pump assembly which we keep in stock — that means same-day replacement in most Patna areas rather than a two-day wait.',
    watchOut:
      'Livpure\'s subscription model means some units are technically rental. If yours is on a Livpure subscription plan, the repair should be free from them — check before paying anyone, including us.',
    extraFaqs: [
      { q: 'My water tastes salty on my Livpure — what is wrong?', a: 'Salty taste almost always means the RO membrane has been punctured or has failed, letting high-TDS water bypass purification. In Patna, where borewell TDS often exceeds 600 ppm, this is the most frequent Livpure fault we see. Membrane replacement is ₹1,400–₹2,600.' },
    ]
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
    patnaContext:
      'Pureit has two very different product lines in Patna homes — the non-electric gravity classic and the RO range. Older Patna households often still run the gravity model as a backup during power cuts.',
    partsProfile:
      'Pureit\'s Germkill Kit is a consumable with a hard usage limit; when it expires the unit genuinely stops dispensing by design. GKK ₹1,100–₹2,200. Gravity model parts are far cheaper at ₹350–₹800.',
    watchOut:
      'Because the Germkill Kit shutdown is by design and not a fault, do not let anyone charge you a big \'repair\' fee for it — it is a cartridge swap plus the visit charge.',
    extraFaqs: [
      { q: 'My Pureit stopped dispensing water completely — is it broken?', a: 'Usually not. Pureit is designed to stop dispensing when the Germkill Kit reaches the end of its rated life, as a safety feature. The fix is a kit replacement, not a repair. Tell us your exact model and we bring the correct kit on the first visit.' },
    ]
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
    patnaContext:
      'AO Smith sells steadily in Patna through electronics showrooms rather than online, and we see it most in three-bedroom flats and small offices. The Z-series with its side-stream technology behaves quite differently from an ordinary RO — it keeps some minerals deliberately, so a customer used to a normal RO sometimes reports the water tastes wrong when nothing is actually broken.',
    partsProfile:
      'The Z-series uses a cartridge format with a specific housing tolerance, so a generic membrane physically fits but bypasses water around the seal. Membranes run ₹1,600–₹3,000 and control PCBs up to ₹2,500. Unlike LG, AO Smith parts are available within Patna, so we can usually complete the job the same day.',
    watchOut:
      'If your AO Smith water suddenly tastes different, get the TDS measured before agreeing to any part replacement. On side-stream models a mineral-retention setting change can explain it entirely, and we have seen Patna customers charged for a membrane they never needed.',
    extraFaqs: [
      { q: 'Why is AO Smith service more expensive than other brands?', a: 'The visit charge is the same ₹200 as every brand. Only parts cost more, because AO Smith uses proprietary cartridge formats with no generic equivalent. We show you the part and its price before fitting so there is no surprise.' },
    ]
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
    patnaContext:
      'Blue Star has grown quickly in Patna over the last few years, mainly through electronics retail rather than online, so we see it in Kankarbagh and Rajendra Nagar households.',
    partsProfile:
      'Blue Star uses standard 10-inch housings on most models, which keeps repairs cheap and fast — filter sets ₹900–₹1,900, and no proprietary lock-in.',
    watchOut:
      'Blue Star\'s TDS controller is adjustable. If your water suddenly tastes different after a service, the controller may have been left mis-set rather than a part having failed.'
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
    patnaContext:
      'Havells sells well in Patna\'s mid-premium segment. We see a distinct pattern in Kumhrar and Bypass Road where voltage fluctuation damages the Digitouch control boards.',
    partsProfile:
      'Control boards on the Digitouch line are the expensive part at ₹1,100–₹2,600. Basic filter work stays affordable at ₹500–₹1,000.',
    watchOut:
      'If your Havells control board has failed more than once, the problem is your power supply, not the machine. A ₹1,500 stabiliser is cheaper than a second board — we will say so rather than selling you another board.'
  },
  {
    slug: 'aquafresh',
    name: 'Aquafresh',
    popularModels: ['Aquafresh Grand Plus', 'Aquafresh Alkalina', 'Aquafresh Nexus Brio', 'Aquafresh Swift', 'Aquafresh Dolphin', 'Aquafresh Epic', 'Aquafresh Seven'],
    commonIssues: [
      { issue: 'Water flow slowed down badly', cause: 'Sediment filter choked — Aquafresh uses standard 10-inch pre-filters that clog fast on Patna borewell water', typicalCost: '₹450 – ₹600' },
      { issue: 'Motor runs but tank does not fill', cause: 'Booster pump losing pressure or membrane blocked', typicalCost: '₹1,200 – ₹2,000' },
      { issue: 'Leakage from filter housing', cause: 'O-ring worn out or housing over-tightened at last service', typicalCost: '₹250 – ₹600' },
      { issue: 'Water tastes flat or salty', cause: 'Membrane past life or TDS controller set wrong', typicalCost: '₹1,100 – ₹1,900' },
    ],
    note:
      'Aquafresh is one of the most widely sold budget RO brands in Patna and uses standard 10-inch housings and 75/80 GPD membranes. That is genuinely good news for you — parts are easily available, cheaper than premium brands, and we finish most Aquafresh repairs on the first visit. Beware of anyone quoting premium-brand prices for Aquafresh parts.',
    patnaContext:
      'Aquafresh is the biggest-selling budget RO in Patna, especially in Kankarbagh, Danapur, Phulwari Sharif and among tenants who bought online. Most units in the ₹4,000–₹8,000 range you see in Patna homes are Aquafresh or an Aquafresh-style assembled unit.',
    partsProfile:
      'This is the good news with Aquafresh: it uses completely standard 10-inch housings and 75/80 GPD membranes. A sediment + carbon set is ₹450–₹600 and a membrane ₹1,100–₹1,900 — roughly half what the same job costs on a premium brand.',
    watchOut:
      'The single most common rip-off in Patna is quoting Kent or Aquaguard part prices for an Aquafresh unit. If someone quotes you ₹2,500 for an Aquafresh filter change, that is two to three times the fair rate. Standard parts, standard price.',
    extraFaqs: [
      { q: 'Are Aquafresh spare parts easily available in Patna?', a: 'Yes, very easily. Aquafresh uses standard 10-inch housings and common 75/80 GPD membranes, which every RO parts dealer in Patna stocks. This means no waiting for a part order and no premium pricing — most Aquafresh repairs finish on the first visit.' },
      { q: 'Is Aquafresh worth repairing or should I buy new?', a: 'Honest answer: if the machine is under five years old and only needs filters or a membrane, repair is clearly worth it — ₹450 to ₹1,900 versus ₹5,000+ for a new unit. If the body is cracked, the pump has failed and the membrane is also finished on a seven-year-old unit, we will tell you a replacement makes more sense rather than selling you three repairs.' },
    ]
  },
  {
    slug: 'aquasure',
    name: 'Aquasure (Eureka Forbes)',
    popularModels: ['Aquasure Delight', 'Aquasure Smart Plus', 'Aquasure Xpert', 'Aquasure Amrit', 'Aquasure Elegant RO'],
    commonIssues: [
      { issue: 'Purifier not starting', cause: 'SMPS adaptor failure — common on Aquasure entry models', typicalCost: '₹700 – ₹1,300' },
      { issue: 'Continuous water drain', cause: 'Solenoid valve stuck open', typicalCost: '₹450 – ₹900' },
      { issue: 'Reduced output after 8-10 months', cause: 'Pre-filter and carbon exhausted', typicalCost: '₹500 – ₹1,100' },
      { issue: 'Noisy operation', cause: 'Pump mounting rubber perished', typicalCost: '₹350 – ₹800' },
    ],
    note:
      'Aquasure is Eureka Forbes\u2019 value range and shares several parts with Aquaguard models, so spares are easy for us to source. Many Patna customers are told they need a full Aquaguard-priced part — usually they do not.',
    patnaContext:
      'Aquasure sits in the value tier of the Eureka Forbes range and is common in Patna rentals and smaller flats where a full Aquaguard was too expensive.',
    partsProfile:
      'Aquasure shares several components with Aquaguard models, so parts are easy for us to source in Patna. Adaptors ₹700–₹1,300, filter sets ₹500–₹1,100.',
    watchOut:
      'Because it carries the Eureka Forbes name, some technicians quote Aquaguard premium pricing for Aquasure parts. Many Aquasure components are shared or standard and should cost less.'
  },
  {
    slug: 'nasaka',
    name: 'Nasaka',
    popularModels: ['Nasaka Tulip', 'Nasaka XL-2', 'Nasaka Aqua', 'Nasaka Silver Star'],
    commonIssues: [
      { issue: 'Low purified water output', cause: 'Membrane scaling from high TDS', typicalCost: '₹1,300 – ₹2,400' },
      { issue: 'Display or indicator not working', cause: 'PCB or sensor fault', typicalCost: '₹800 – ₹1,800' },
      { issue: 'Water leaking at the base', cause: 'Loose elbow connector or cracked tank fitting', typicalCost: '₹300 – ₹850' },
      { issue: 'Purifier switching off repeatedly', cause: 'Faulty pressure switch', typicalCost: '₹450 – ₹950' },
    ],
    note:
      'Nasaka units are common in Patna offices and shops. Their multi-stage cartridges are non-standard on some models, so tell us the model when you call and we bring the correct cartridge on the first visit instead of making you wait.',
    patnaContext:
      'Nasaka appears most in Patna commercial settings — shops, small clinics and coaching centres in Ashok Rajpath and Bakarganj rather than homes.',
    partsProfile:
      'Some Nasaka models use non-standard multi-stage cartridges, so the model number genuinely matters. Tell us the model and we bring the right cartridge instead of making a second trip.',
    watchOut:
      'Several Patna shops refuse Nasaka or guess at the parts. If someone fits a generic cartridge into a non-standard Nasaka housing, it will leak.'
  },
  {
    slug: 'zero-b',
    name: 'Zero B (Ion Exchange)',
    popularModels: ['Zero B Suraksha', 'Zero B Eco RO', 'Zero B Rejuve', 'Zero B Puro'],
    commonIssues: [
      { issue: 'Bad smell in purified water', cause: 'Carbon filter saturated', typicalCost: '₹400 – ₹800' },
      { issue: 'Slow output', cause: 'Pre-filter and sediment choked', typicalCost: '₹450 – ₹900' },
      { issue: 'Storage tank not filling fully', cause: 'Float valve or low inlet pressure', typicalCost: '₹350 – ₹1,100' },
      { issue: 'Membrane replacement needed', cause: 'End of membrane life at high TDS', typicalCost: '₹1,300 – ₹2,300' },
    ],
    note:
      'Zero B is an Ion Exchange brand with a strong presence in older Patna households. Parts remain widely compatible with standard fittings, so servicing is straightforward and affordable.',
    patnaContext:
      'Zero B is an Ion Exchange brand with a long-standing presence in older Patna households, particularly in Gardanibagh and Kadamkuan where units have been running for a decade or more.',
    partsProfile:
      'Zero B remains largely compatible with standard fittings, so servicing an older unit is straightforward and inexpensive — usually ₹350–₹900 for filter work.',
    watchOut:
      'On very old Zero B units the tank itself can develop hairline cracks. Replacing filters on a cracked tank is money wasted; we check the tank first.'
  },
  {
    slug: 'tata-swach',
    name: 'Tata Swach',
    popularModels: ['Tata Swach Ultima', 'Tata Swach Silver Boost', 'Tata Swach Viva', 'Tata Swach Cristella'],
    commonIssues: [
      { issue: 'Bulb / cartridge life over', cause: 'Swach bulb reached rated capacity', typicalCost: '₹400 – ₹1,200' },
      { issue: 'Very slow filtration in gravity models', cause: 'Cartridge clogged with sediment', typicalCost: '₹350 – ₹900' },
      { issue: 'RO model not filling', cause: 'Pump or membrane fault', typicalCost: '₹900 – ₹2,200' },
      { issue: 'Leakage between chambers', cause: 'Gasket worn out', typicalCost: '₹200 – ₹500' },
    ],
    note:
      'Tata Swach has both gravity (non-electric) and RO models — completely different internally. Gravity units usually just need a cartridge, which is a very low-cost job. We will tell you honestly which one you have.',
    patnaContext:
      'Tata Swach is common in Patna as a second or backup purifier, especially the non-electric gravity models that keep working during power cuts — a real consideration in parts of the city.',
    partsProfile:
      'Gravity Swach units need only a bulb or cartridge swap at ₹400–₹1,200. The RO models are conventional and cost more to service.',
    watchOut:
      'Gravity and RO Swach models are completely different inside. Anyone quoting you a big repair figure for a gravity unit without seeing it is guessing — it is almost always just a cartridge.'
  },
  {
    slug: 'lg',
    name: 'LG',
    popularModels: ['LG WW180EP', 'LG WW140NP', 'LG Puricare', 'LG WW121EP'],
    commonIssues: [
      { issue: 'Error code on display', cause: 'Sensor or inlet pressure fault', typicalCost: '₹700 – ₹2,000' },
      { issue: 'Hot water not heating', cause: 'Heating element or thermostat failure', typicalCost: '₹1,400 – ₹3,200' },
      { issue: 'Reduced flow', cause: 'Filter set exhausted', typicalCost: '₹1,200 – ₹2,800' },
      { issue: 'Water tastes different after service', cause: 'Filter not flushed properly', typicalCost: '₹300 – ₹600' },
    ],
    note:
      'LG purifiers use proprietary filter cartridges that cost more than generic ones. We tell you the real part price upfront so you can decide — some customers prefer a compatible-standard conversion, which we can also do and explain honestly.',
    patnaContext:
      'LG water purifiers are uncommon in Patna — we see perhaps two or three a month, almost always in Patliputra Colony and Bailey Road apartments where the buyer already owned LG appliances. Because volume is low, most neighbourhood shops have never opened one, which is why LG owners here often get told their unit is beyond repair when it simply needs a cartridge.',
    partsProfile:
      'LG cartridges are sealed single-piece units rather than the open housing-plus-filter design used by most brands, so they cannot be topped up or cleaned — a full set reaches ₹2,800. We normally order LG parts from Delhi, which adds two to three days. We will always tell you that timeline honestly before you commit.',
    watchOut:
      'Some Patna technicians quietly convert an LG to standard 10-inch housings to save on parts. It does work and it does cut your running cost, but it permanently modifies the machine and voids any remaining LG support. We will not do it without explaining that trade-off to you first and getting your agreement.'
  },
  {
    slug: 'whirlpool',
    name: 'Whirlpool',
    popularModels: ['Whirlpool Purafresh', 'Whirlpool Minerala', 'Whirlpool Purasense', 'Whirlpool Destroyer'],
    commonIssues: [
      { issue: 'Purification indicator red', cause: 'Filter life exhausted', typicalCost: '₹800 – ₹1,800' },
      { issue: 'Water not dispensing', cause: 'Faucet valve or airlock in the line', typicalCost: '₹300 – ₹750' },
      { issue: 'Pump running non-stop', cause: 'High-pressure switch failed', typicalCost: '₹450 – ₹950' },
      { issue: 'Leakage from the top', cause: 'Housing O-ring or loose tubing', typicalCost: '₹250 – ₹700' },
    ],
    note:
      'Whirlpool Minerala models are still in many Patna homes from a few years back. Filters remain available — we keep the common sizes so you are not left waiting for a part order.',
    patnaContext:
      'Whirlpool Minerala units remain in many Patna homes from purchases several years back, so most of our Whirlpool work is on ageing units rather than new installs.',
    partsProfile:
      'Filters for the common Whirlpool sizes are still available and we keep them stocked, so you are not waiting on a part order for a discontinued model.',
    watchOut:
      'Because some Whirlpool models are discontinued, a few shops claim parts are \'unavailable\' and push a new machine. In most cases standard-size replacements fit perfectly.'
  },
  {
    slug: 'panasonic',
    name: 'Panasonic',
    popularModels: ['Panasonic TK-CS200', 'Panasonic TK-AS45', 'Panasonic Alkaline Ionizer'],
    commonIssues: [
      { issue: 'Low water flow', cause: 'Cartridge saturated', typicalCost: '₹900 – ₹2,000' },
      { issue: 'Ionizer function not working', cause: 'Electrode plate scaling', typicalCost: '₹1,200 – ₹2,800' },
      { issue: 'Leakage at inlet connection', cause: 'Worn washer or loose adaptor', typicalCost: '₹200 – ₹550' },
      { issue: 'Unit not powering on', cause: 'Adaptor failure', typicalCost: '₹600 – ₹1,300' },
    ],
    note:
      'Panasonic units are less common in Patna, so many local shops refuse them or guess at repairs. We handle them properly and will tell you upfront if a part needs to be ordered rather than pretending it is in stock.',
    patnaContext:
      'Panasonic purifiers and ionizers are rare in Patna, which is exactly why many local shops turn them away or experiment on them.',
    partsProfile:
      'Cartridges often need to be ordered rather than kept in stock. We tell you upfront if a part will take two to three days instead of pretending it is available.',
    watchOut:
      'Avoid anyone who opens a Panasonic ionizer without knowing the electrode plate cleaning procedure — scaling on the plates is a cleaning job, not a replacement job, in many cases.'
  },
  {
    slug: 'faber',
    name: 'Faber',
    popularModels: ['Faber Galaxy Plus', 'Faber Neptune', 'Faber Vital', 'Faber Aegis'],
    commonIssues: [
      { issue: 'Slow purified water', cause: 'Sediment and carbon filters choked', typicalCost: '₹500 – ₹1,100' },
      { issue: 'Copper / alkaline function inactive', cause: 'Cartridge depleted', typicalCost: '₹800 – ₹1,700' },
      { issue: 'Machine not starting', cause: 'SMPS or wiring fault', typicalCost: '₹650 – ₹1,400' },
      { issue: 'Water overflowing from tank', cause: 'Float or solenoid stuck', typicalCost: '₹400 – ₹950' },
    ],
    note:
      'Faber is a newer entrant with growing sales in Patna. Most models use standard fittings internally, which keeps repair costs closer to budget brands than to premium ones.',
    patnaContext:
      'Faber is a newer entrant gaining ground in Patna through modular kitchen dealers, so we mostly see recent installations rather than old units.',
    partsProfile:
      'Most Faber models use standard fittings internally, keeping repair costs closer to budget brands than premium ones — filter work ₹500–₹1,100.',
    watchOut:
      'Because Faber is often sold bundled with a kitchen fit-out, check whether your installation warranty is still live with the dealer before paying for a repair.'
  },
  {
    slug: 'v-guard',
    name: 'V-Guard',
    popularModels: ['V-Guard Zenora', 'V-Guard Requa', 'V-Guard Serena'],
    commonIssues: [
      { issue: 'Reduced output', cause: 'Membrane or pre-filter exhausted', typicalCost: '₹800 – ₹2,100' },
      { issue: 'Purifier tripping', cause: 'Adaptor or voltage fluctuation damage', typicalCost: '₹700 – ₹1,500' },
      { issue: 'Leakage from housing', cause: 'O-ring worn', typicalCost: '₹250 – ₹600' },
      { issue: 'Noise from pump', cause: 'Pump wear', typicalCost: '₹900 – ₹1,800' },
    ],
    note:
      'V-Guard purifiers are sensitive to the voltage swings common in parts of Patna. If we see repeated adaptor failures we will recommend a stabiliser rather than just replacing the same part again.',
    patnaContext:
      'V-Guard purifiers show up in Patna households that already trust the brand for stabilisers and wiring. We see them across Bailey Road and Danapur.',
    partsProfile:
      'Standard internals keep costs moderate — membrane and pre-filter work runs ₹800–₹2,100.',
    watchOut:
      'Repeated adaptor failure on a V-Guard is a symptom of voltage instability at your address, not a defective purifier. Fix the supply, not the same part twice.'
  },
  {
    slug: 'konvio-neer',
    name: 'Konvio Neer',
    popularModels: ['Konvio Neer AquaPious', 'Konvio Neer Grand', 'Konvio Neer Copper'],
    commonIssues: [
      { issue: 'No water output', cause: 'Pump or membrane blockage', typicalCost: '₹900 – ₹2,000' },
      { issue: 'Leakage from tubing joints', cause: 'Push-fit connectors loosened', typicalCost: '₹200 – ₹550' },
      { issue: 'Water tastes off', cause: 'Carbon filter exhausted', typicalCost: '₹400 – ₹800' },
      { issue: 'Low pressure alarm', cause: 'Inlet pressure below requirement', typicalCost: '₹500 – ₹1,600' },
    ],
    note:
      'Konvio Neer is a value brand sold heavily online. Parts are standard, so repairs are inexpensive — do not let anyone charge you premium-brand rates for these.',
    patnaContext:
      'Konvio Neer is bought almost entirely online and is common among younger Patna households and rented flats where the budget was under ₹7,000.',
    partsProfile:
      'Fully standard parts throughout — push-fit connectors, 10-inch housings, common membranes. Repairs are among the cheapest we do.',
    watchOut:
      'Do not accept premium-brand rates on a Konvio Neer. Every part in it is a commodity part available across Patna.'
  },
  {
    slug: 'aquaultra',
    name: 'AquaUltra / Aqua Grand',
    popularModels: ['AquaUltra A1012', 'Aqua Grand Plus', 'AquaUltra Copper', 'Aqua Grand RO+UV+UF'],
    commonIssues: [
      { issue: 'Water not coming', cause: 'Pump failure or choked pre-filter', typicalCost: '₹500 – ₹1,900' },
      { issue: 'Continuous drain water', cause: 'Solenoid valve fault', typicalCost: '₹400 – ₹850' },
      { issue: 'Leakage', cause: 'Housing O-ring or elbow fitting', typicalCost: '₹200 – ₹600' },
      { issue: 'Bad taste', cause: 'Carbon or membrane exhausted', typicalCost: '₹400 – ₹1,900' },
    ],
    note:
      'These are among the most common online-purchased RO units in Patna homes. Fully standard internals mean fast, cheap repairs — usually completed in a single visit.',
    patnaContext:
      'AquaUltra and Aqua Grand style units are everywhere in Patna — they are the default choice for online buyers looking at the ₹5,000–₹8,000 range.',
    partsProfile:
      'Completely standard internals, so a full service is usually the cheapest of any unit we handle and finishes in a single visit.',
    watchOut:
      'These units are sold under many similar names. What matters is the internals, which are standard — so the price should be standard too.'
  },
  {
    slug: 'commercial-ro',
    name: 'Commercial & Industrial RO Plants',
    popularModels: ['25 LPH', '50 LPH', '100 LPH', '250 LPH', '500 LPH', '1000 LPH plants'],
    commonIssues: [
      { issue: 'Output dropped below rated LPH', cause: 'Membrane fouling or low feed pressure', typicalCost: '₹3,500 – ₹18,000' },
      { issue: 'High pump pressure / trip', cause: 'Scaling in membrane housing or valve fault', typicalCost: '₹2,500 – ₹9,000' },
      { issue: 'Dosing system not working', cause: 'Antiscalant dosing pump failure', typicalCost: '₹3,000 – ₹8,500' },
      { issue: 'High TDS in product water', cause: 'Membrane seal or O-ring bypass', typicalCost: '₹4,000 – ₹15,000' },
    ],
    note:
      'We service commercial plants for hotels, schools, clinics, hostels and shops across Patna — 25 LPH up to 1000 LPH. Downtime costs you money, so we quote AMC contracts with guaranteed response times for commercial customers.',
    patnaContext:
      'We service commercial plants across Patna for hotels on Fraser Road, coaching institutes in Musallahpur, clinics, hostels and shops — from 25 LPH up to 1000 LPH.',
    partsProfile:
      'Commercial servicing is a different discipline: antiscalant dosing, membrane CIP cleaning, pressure logging and pre-treatment. Membrane sets run ₹4,000–₹18,000 depending on plant size.',
    watchOut:
      'A commercial plant losing output is usually a pre-treatment or dosing failure, not a dead membrane. Replacing membranes without fixing the cause means paying again in months.',
    extraFaqs: [
      { q: 'Do you offer AMC for commercial RO plants in Patna?', a: 'Yes. For commercial customers downtime costs money, so our commercial AMC includes scheduled preventive visits, guaranteed response time, membrane monitoring and dosing chemical management. Pricing depends on plant capacity — call us with your LPH rating for a quote.' },
    ]
  },
  {
    slug: 'other-brands',
    name: 'All Other Brands & Local Assembled Units',
    popularModels: ['Bloom', 'Krona', 'Careplus', 'NEO', 'Godrej', 'Hindware', 'Local assembled RO'],
    commonIssues: [
      { issue: 'Any no-water or low-flow issue', cause: 'Membrane, pump or pre-filter', typicalCost: '₹500 – ₹2,500' },
      { issue: 'Leakage anywhere in the unit', cause: 'Fittings, housings or tubing', typicalCost: '₹250 – ₹900' },
      { issue: 'Electrical or motor faults', cause: 'SMPS, pump or wiring', typicalCost: '₹600 – ₹2,000' },
      { issue: 'Taste and odour problems', cause: 'Carbon filter or membrane', typicalCost: '₹400 – ₹2,200' },
    ],
    note:
      'Local assembled units are extremely common in Patna and we service them fully. Because parts are standard 10-inch fittings, repairs are often cheaper and faster than on branded units. No brand is refused.',
    patnaContext:
      'A very large share of Patna homes run locally assembled RO units bought from neighbourhood shops. These have no brand badge but are entirely serviceable, and we treat them exactly like branded units.',
    partsProfile:
      'Assembled units use standard 10-inch housings and 75/80 GPD membranes throughout, which makes them the cheapest of all to maintain.',
    watchOut:
      'Some shops refuse assembled units or claim they are \'not repairable\'. That is not true — they are usually the easiest to fix because every part is a commodity.'
  },
];

/** Shared FAQ set reused across all area pages (with FAQPage schema). */
export function buildAreaFaqs(area: ServiceAreaContent) {
  return [
    {
      q: `What is the RO service visit charge in ${area.name}, Patna?`,
      a: `Our visit charge in ${area.name} is only ₹200 — most other providers in Patna charge ₹350 to ₹399. This covers complete inspection, TDS testing and diagnosis. Parts and repair work are quoted separately and only carried out after you approve the cost.`,
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
