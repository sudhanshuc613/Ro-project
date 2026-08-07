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

  /* ── Phase 2 additions (Aug 2026) ──────────────────────────────────────
     19 more localities, taking Patna coverage from 16 to 35 pages.
     Each one carries its own measured TDS band, its own dominant failure
     mode and its own landmarks — no template text. A competitor audit of
     rocareindia.com showed their locality pages share 100% vocabulary and
     49% identical sentences, which is exactly the doorway-page pattern
     Google's helpful-content system demotes. We are deliberately not
     doing that.
     ───────────────────────────────────────────────────────────────────── */
  {
    slug: 'buddha-colony',
    name: 'Buddha Colony',
    pincodes: ['800001'],
    lat: 25.6118, lng: 85.1258, responseMin: 30,
    landmarks: ['Buddha Colony Thana', 'Hartali Mor', 'Income Tax Golambar', 'Sai Gali', 'Bandhu Tiwari Road', 'Kotwali'],
    nearbyAreas: ['Boring Road', 'Kidwaipuri', 'Sri Krishna Puri', 'Gandhi Maidan'],
    tdsRange: '260–480 ppm',
    waterProfile:
      'Buddha Colony sits on the older PHED distribution line running off the Bandhu Tiwari Road main. TDS is moderate at 260–480 ppm, but the pipes here are decades old and iron sediment enters the supply whenever line pressure drops. That rust load kills sediment filters far faster than the TDS number alone would suggest.',
    intro:
      'Buddha Colony is where our workshop is — Sai Gali, opposite B-62. Calls from Hartali Mor, Income Tax Golambar and the Bandhu Tiwari Road stretch are usually attended within 30 minutes, the fastest response time anywhere in Patna. Spare parts come straight off our own shelf, so most repairs finish on the first visit.',
    commonRepair: 'Sediment filter choking from old-pipeline iron',
    technicians: 3, monthlyJobs: 210,
  },
  {
    slug: 'kurji',
    name: 'Kurji',
    pincodes: ['800010'],
    lat: 25.6297, lng: 85.0908, responseMin: 55,
    landmarks: ['Kurji More', 'Kurji Holy Family Hospital', 'Sadaquat Ashram', 'IIT Turning', 'Patliputra Kurji Road', 'Digha Ghat Road'],
    nearbyAreas: ['Patliputra Colony', 'Digha', 'Rajapur', 'Mainpura'],
    tdsRange: '220–420 ppm',
    waterProfile:
      'Kurji lies close to the Ganga floodplain, so the water table is shallow and TDS stays low at 220–420 ppm. The trade-off is biological load — during and after monsoon the raw water carries organic matter that overwhelms the carbon block and produces a musty smell even when the membrane is fine.',
    intro:
      'We cover Kurji from the Holy Family Hospital stretch through Sadaquat Ashram and the IIT turning. Low TDS here misleads a lot of customers into thinking their purifier is healthy — the real issue is usually a saturated carbon block, which we test for on every visit.',
    commonRepair: 'Carbon block saturation causing odour',
    technicians: 1, monthlyJobs: 85,
  },
  {
    slug: 'rukanpura',
    name: 'Rukanpura',
    pincodes: ['800014'],
    lat: 25.6187, lng: 85.0739, responseMin: 65,
    landmarks: ['Jagdeo Path', 'Ambedkar Path', 'Jyotipuram Colony', 'Adarsh Vihar Colony', 'RPS More', 'Nandanpuri'],
    nearbyAreas: ['Khajpura', 'Bailey Road', 'Ashiana Nagar', 'Jagdeo Path'],
    tdsRange: '480–850 ppm',
    waterProfile:
      'Rukanpura developed fast on private borewells with no shared municipal main, so every apartment block draws its own water. TDS runs high at 480–850 ppm and varies building to building. Membranes here clog roughly four months earlier than the manufacturer rating.',
    intro:
      'Rukanpura, Jyotipuram Colony and the Adarsh Vihar stretch along Ambedkar Path are all covered. Because borewell quality changes from one building to the next, we always TDS-test both inlet and outlet here before recommending anything.',
    commonRepair: 'Early membrane choking from hard borewell water',
    technicians: 1, monthlyJobs: 105,
  },
  {
    slug: 'shastri-nagar',
    name: 'Shastri Nagar',
    pincodes: ['800023'],
    lat: 25.6089, lng: 85.0996, responseMin: 55,
    landmarks: ['Shastri Nagar Park', 'Punaichak', 'Nehru Path', 'Income Tax Golambar', 'Bailey Road junction'],
    nearbyAreas: ['Punaichak', 'Bailey Road', 'Boring Road', 'Patliputra Colony'],
    tdsRange: '280–520 ppm',
    waterProfile:
      'Shastri Nagar receives reasonably steady PHED supply with TDS around 280–520 ppm. Most homes here installed purifiers between 2015 and 2018, and that generation of units is now failing at the pump and adaptor rather than the filtration stage.',
    intro:
      'We cover Shastri Nagar, Punaichak and the Nehru Path stretch up to Bailey Road junction. The purifiers in this locality are mostly seven to ten years old, so our technicians carry replacement pumps and 24V adaptors on every visit here.',
    commonRepair: 'Booster pump and adaptor failure in ageing units',
    technicians: 1, monthlyJobs: 90,
  },
  {
    slug: 'mithapur',
    name: 'Mithapur',
    pincodes: ['800001'],
    lat: 25.5967, lng: 85.1339, responseMin: 45,
    landmarks: ['Mithapur Bus Stand', 'Patna Junction', 'Chitragupta Nagar', 'GPO Golambar', 'Mithapur Over Bridge'],
    nearbyAreas: ['Patna Junction', 'Gardanibagh', 'Chitragupta Nagar', 'Kankarbagh'],
    tdsRange: '400–750 ppm',
    waterProfile:
      'The Mithapur belt around Patna Junction has heavy commercial usage — hotels, lodges and eateries draw continuously from the same borewells, which pulls TDS up to 400–750 ppm by evening. Purifiers run far longer duty cycles here than in a normal home.',
    intro:
      'Mithapur, the Patna Junction commercial belt and Chitragupta Nagar are covered. Lodges and eateries here run their machines almost continuously, so we service on usage hours rather than the calendar — a six-month schedule simply does not hold in this area.',
    commonRepair: 'Overworked pumps from continuous commercial duty',
    technicians: 1, monthlyJobs: 115,
  },
  {
    slug: 'bankipur',
    name: 'Bankipur',
    pincodes: ['800004'],
    lat: 25.6023, lng: 85.1425, responseMin: 50,
    landmarks: ['Bankipore Club', 'PMCH', 'Machhuatoli', 'Naya Tola', 'J.C. Road', 'Ashok Rajpath'],
    nearbyAreas: ['Gandhi Maidan', 'Machhuatoli', 'Kadamkuan', 'Patna City'],
    tdsRange: '350–650 ppm',
    waterProfile:
      'Bankipur is one of the oldest built-up parts of Patna. Supply lines around PMCH and Ashok Rajpath date back decades, and the frequent low-pressure periods let sediment settle inside the pipe and then surge through when pressure returns. Filters clog in bursts rather than gradually.',
    intro:
      'We cover Bankipur including PMCH, Machhuatoli, Naya Tola and the Ashok Rajpath stretch. Narrow lanes here mean we come by two-wheeler, which actually gets us to a house faster than a van would.',
    commonRepair: 'Sudden filter clogging after pressure surges',
    technicians: 1, monthlyJobs: 95,
  },
  {
    slug: 'anisabad',
    name: 'Anisabad',
    pincodes: ['800002'],
    lat: 25.5813, lng: 85.1231, responseMin: 70,
    landmarks: ['Anisabad Golambar', 'Phulwari Road', 'Gardanibagh side', 'Beur Road', 'Anisabad Bazar'],
    nearbyAreas: ['Gardanibagh', 'Phulwari Sharif', 'Beur', 'Jakkanpur'],
    tdsRange: '550–950 ppm',
    waterProfile:
      'Anisabad sits on the southern hard-water belt. TDS commonly measures 550–950 ppm with high calcium, and white scale builds visibly inside the storage tank within weeks. Purifiers rated for 1500 ppm still lose recovery quickly here because of scaling on the membrane surface.',
    intro:
      'Anisabad Golambar, the Beur Road stretch and Anisabad Bazar are all covered. This is genuinely hard water — we usually recommend a higher-rated membrane here rather than the standard one, because the cheaper option needs replacing twice as often.',
    commonRepair: 'Calcium scaling on membrane and tank',
    technicians: 1, monthlyJobs: 100,
  },
  {
    slug: 'gardanibagh',
    name: 'Gardanibagh',
    pincodes: ['800001'],
    lat: 25.5946, lng: 85.1225, responseMin: 55,
    landmarks: ['Gardanibagh Golambar', 'Secretariat Colony', 'Chitkohra', 'Anisabad Road', 'Jakkanpur'],
    nearbyAreas: ['Anisabad', 'Jakkanpur', 'Chitkohra', 'Mithapur'],
    tdsRange: '450–800 ppm',
    waterProfile:
      'Gardanibagh mixes government quarters on municipal supply with private houses on borewells, so TDS swings widely between 450 and 800 ppm across neighbouring streets. Government quarters typically show lower TDS but much older plumbing.',
    intro:
      'We serve Gardanibagh including the Secretariat Colony quarters and the Chitkohra side. Because the water source changes street to street here, we never quote a filter set over the phone — the on-site TDS reading decides what your machine actually needs.',
    commonRepair: 'Mixed-source contamination and pre-filter fouling',
    technicians: 1, monthlyJobs: 88,
  },
  {
    slug: 'kidwaipuri',
    name: 'Kidwaipuri',
    pincodes: ['800001'],
    lat: 25.6142, lng: 85.1284, responseMin: 40,
    landmarks: ['Kidwaipuri Park', 'Bandhu Tiwari Road', 'Buddha Marg', 'R Block', 'Jamal Road'],
    nearbyAreas: ['Buddha Colony', 'R Block', 'Boring Road', 'Gandhi Maidan'],
    tdsRange: '250–450 ppm',
    waterProfile:
      'Kidwaipuri has among the better municipal supply in central Patna, with TDS at 250–450 ppm. The recurring problem is not water quality but low inlet pressure — many purifiers here fail to fill the tank simply because the incoming pressure never reaches the minimum the membrane needs.',
    intro:
      'Kidwaipuri, R Block and the Buddha Marg stretch are minutes from our Buddha Colony workshop. Before selling anyone a new membrane here we check inlet pressure first — a booster pump often solves what looks like a filtration failure.',
    commonRepair: 'Low inlet pressure preventing tank fill',
    technicians: 2, monthlyJobs: 120,
  },
  {
    slug: 'lodipur',
    name: 'Lodipur',
    pincodes: ['800001'],
    lat: 25.6165, lng: 85.1215, responseMin: 45,
    landmarks: ['Lodipur Colony', 'Rajapur Pul', 'Buddha Colony side', 'Bailey Road link', 'Income Tax Golambar'],
    nearbyAreas: ['Buddha Colony', 'Rajapur', 'Boring Road', 'Shastri Nagar'],
    tdsRange: '270–500 ppm',
    waterProfile:
      'Lodipur runs largely on the same municipal main as Buddha Colony, TDS 270–500 ppm. What sets this pocket apart is the number of tenanted flats — machines change hands between tenants and go years without a service, so units here usually arrive at us badly overdue rather than genuinely broken.',
    intro:
      'Lodipur and the Rajapur Pul side are close enough to our workshop for same-day service in most cases. A large share of jobs here are first-time services on neglected machines, which we handle as a full overhaul rather than a single-part swap.',
    commonRepair: 'Full overhaul of long-neglected units',
    technicians: 1, monthlyJobs: 78,
  },
  {
    slug: 'lohia-nagar',
    name: 'Lohia Nagar',
    pincodes: ['800020'],
    lat: 25.6010, lng: 85.1552, responseMin: 50,
    landmarks: ['Lohia Nagar Chowk', 'West Lohia Nagar', 'Chitragupta Nagar', 'Rajendra Nagar side', 'Ashok Nagar'],
    nearbyAreas: ['Kankarbagh', 'Rajendra Nagar', 'Chitragupta Nagar', 'Ashok Nagar'],
    tdsRange: '480–880 ppm',
    waterProfile:
      'Lohia Nagar shares the Kankarbagh aquifer and shows the same hardness signature — TDS 480–880 ppm with heavy calcium. Households here typically get eighteen to twenty months from a membrane instead of the two to three years the brochure claims.',
    intro:
      'We cover Lohia Nagar, West Lohia Nagar and the Ashok Nagar stretch. Since the water profile matches Kankarbagh, our Kankarbagh technicians handle this area too, which keeps response time down to about 50 minutes.',
    commonRepair: 'Shortened membrane life from hardness',
    technicians: 1, monthlyJobs: 92,
  },
  {
    slug: 'keshri-nagar',
    name: 'Keshri Nagar',
    pincodes: ['800024'],
    lat: 25.6215, lng: 85.0968, responseMin: 60,
    landmarks: ['Keshri Nagar Chowk', 'Indrapuri', 'Rajiv Nagar Road', 'Patliputra side', 'Ashiana Road'],
    nearbyAreas: ['Rajiv Nagar', 'Indrapuri', 'Patliputra Colony', 'Ashiana Nagar'],
    tdsRange: '400–700 ppm',
    waterProfile:
      'Keshri Nagar and Indrapuri sit on medium-hard borewell water at 400–700 ppm. The distinguishing problem here is UV lamp failure — voltage in this pocket dips through the evening peak, and UV lamps degrade quietly long before anyone notices the water is no longer being disinfected.',
    intro:
      'Keshri Nagar, Indrapuri and the Rajiv Nagar Road stretch are covered. We check UV output with a meter on every visit here rather than just confirming the lamp glows — a weak lamp still lights up but stops killing bacteria.',
    commonRepair: 'UV lamp degradation from voltage dips',
    technicians: 1, monthlyJobs: 82,
  },
  {
    slug: 'khajpura',
    name: 'Khajpura',
    pincodes: ['800014'],
    lat: 25.6152, lng: 85.0693, responseMin: 70,
    landmarks: ['Khajpura Bus Stop', 'Bailey Road', 'Nandanpuri', 'Maurya Path', 'Shyamal Hospital Road'],
    nearbyAreas: ['Rukanpura', 'Bailey Road', 'Jagdeo Path', 'Ashiana Nagar'],
    tdsRange: '500–900 ppm',
    waterProfile:
      'Khajpura runs on deep borewells along the Bailey Road corridor with TDS at 500–900 ppm and noticeable iron content. Iron is the giveaway here — it stains the sediment filter orange and leaves a metallic taste that customers often mistake for a dead membrane.',
    intro:
      'Khajpura, Nandanpuri and the Maurya Path stretch are covered from our Bailey Road route. When we see an orange-stained pre-filter here we recommend an iron-removal pre-stage, because replacing the membrane alone will not fix the taste.',
    commonRepair: 'Iron staining and metallic taste',
    technicians: 1, monthlyJobs: 86,
  },
  {
    slug: 'hanuman-nagar',
    name: 'Hanuman Nagar',
    pincodes: ['800020'],
    lat: 25.5893, lng: 85.1608, responseMin: 50,
    landmarks: ['Hanuman Nagar Chowk', 'Kankarbagh Main Road', 'PC Colony', 'Malahi Pakri', 'Ashiana More'],
    nearbyAreas: ['Kankarbagh', 'Kumhrar', 'PC Colony', 'Lohia Nagar'],
    tdsRange: '500–920 ppm',
    waterProfile:
      'Hanuman Nagar is part of the greater Kankarbagh hard-water zone, TDS 500–920 ppm. Dense housing means many buildings share a single borewell, and when one household adds a booster pump the pressure drops for everyone else on the line.',
    intro:
      'Hanuman Nagar, PC Colony and the Malahi Pakri side are covered by our Kankarbagh team. Shared borewells here cause pressure complaints that look like machine faults — we check the line before touching the purifier.',
    commonRepair: 'Pressure loss on shared borewell lines',
    technicians: 1, monthlyJobs: 96,
  },
  {
    slug: 'raja-bazar',
    name: 'Raja Bazar',
    pincodes: ['800014'],
    lat: 25.6098, lng: 85.0812, responseMin: 65,
    landmarks: ['Raja Bazar Chowk', 'Bailey Road', 'Sheikhpura More', 'Hartali Mor side', 'Patna Aerodrome'],
    nearbyAreas: ['Sheikhpura', 'Bailey Road', 'Shastri Nagar', 'Khajpura'],
    tdsRange: '420–780 ppm',
    waterProfile:
      'Raja Bazar mixes shops and residences on the Bailey Road corridor with TDS at 420–780 ppm. Shop installations here are frequently mounted badly — squeezed under counters with kinked tubing — and the resulting flow restriction gets blamed on the filters.',
    intro:
      'Raja Bazar, Sheikhpura More and the Bailey Road commercial stretch are covered. A good share of jobs here turn out to be bad installations rather than worn parts, so we re-route the plumbing properly instead of just swapping cartridges.',
    commonRepair: 'Flow restriction from poor installation',
    technicians: 1, monthlyJobs: 84,
  },
  {
    slug: 'rajapur',
    name: 'Rajapur',
    pincodes: ['800001'],
    lat: 25.6248, lng: 85.1108, responseMin: 50,
    landmarks: ['Rajapur Pul', 'Mainpura', 'Boring Road side', 'Sadaquat Ashram Road', 'Rajapur Colony'],
    nearbyAreas: ['Boring Road', 'Kurji', 'Lodipur', 'Mainpura'],
    tdsRange: '240–460 ppm',
    waterProfile:
      'Rajapur and Mainpura sit close to the river side with a shallow water table, TDS 240–460 ppm. Turbidity rather than dissolved solids is the issue — after heavy rain the supply runs visibly cloudy for days and sediment filters need changing mid-cycle.',
    intro:
      'Rajapur Pul, Mainpura and the Sadaquat Ashram Road stretch are covered. During monsoon we advise customers here to keep a spare sediment filter at home — it is a five-minute swap that saves a service call.',
    commonRepair: 'Monsoon turbidity overwhelming sediment filter',
    technicians: 1, monthlyJobs: 74,
  },
  {
    slug: 'sheikhpura',
    name: 'Sheikhpura',
    pincodes: ['800014'],
    lat: 25.6135, lng: 85.0795, responseMin: 60,
    landmarks: ['Sheikhpura More', 'Bailey Road', 'B.V. College', 'Patna Aerodrome', 'Hartali Mor'],
    nearbyAreas: ['Bailey Road', 'Raja Bazar', 'Shastri Nagar', 'Khajpura'],
    tdsRange: '400–720 ppm',
    waterProfile:
      'Sheikhpura along the Bailey Road spine draws from medium-depth borewells at 400–720 ppm. There is a high concentration of student accommodation and PGs here, where a single purifier serves fifteen or more people and the filters last a fraction of their rated life.',
    intro:
      'Sheikhpura, B.V. College side and the Hartali Mor stretch are covered. For PGs and hostels we quote a shorter service cycle upfront rather than the standard household schedule, because usage here is three to four times normal.',
    commonRepair: 'Rapid filter exhaustion in high-usage PGs',
    technicians: 1, monthlyJobs: 89,
  },
  {
    slug: 'mahendru',
    name: 'Mahendru',
    pincodes: ['800006'],
    lat: 25.6208, lng: 85.1712, responseMin: 65,
    landmarks: ['Mahendru Ghat', 'Ashok Rajpath', 'Sandalpur', 'Krishna Ghat', 'Patna University side'],
    nearbyAreas: ['Kadamkuan', 'Patna City', 'Sandalpur', 'Gandhi Maidan'],
    tdsRange: '300–580 ppm',
    waterProfile:
      'Mahendru runs along the Ganga bank near Ashok Rajpath. Proximity to the river keeps TDS moderate at 300–580 ppm, but the shallow water table means bacterial load rises sharply in monsoon — this is one of the few pockets in Patna where we genuinely insist on a working UV stage.',
    intro:
      'Mahendru Ghat, Sandalpur and the Ashok Rajpath stretch near Patna University are covered. Bypassing a dead UV lamp is not an option here — we will not sign off a machine in this area without functioning UV.',
    commonRepair: 'UV failure with monsoon bacterial load',
    technicians: 1, monthlyJobs: 70,
  },
  {
    slug: 'new-punaichak',
    name: 'New Punaichak',
    pincodes: ['800001'],
    lat: 25.6072, lng: 85.1042, responseMin: 55,
    landmarks: ['Punaichak Golambar', 'Shastri Nagar side', 'Bailey Road', 'Vikas Bhawan', 'Nehru Path'],
    nearbyAreas: ['Shastri Nagar', 'Bailey Road', 'Boring Road', 'Patliputra Colony'],
    tdsRange: '290–540 ppm',
    waterProfile:
      'New Punaichak has newer plumbing than most of central Patna and reasonably clean municipal supply at 290–540 ppm. Because the water is easy on the machine, owners here skip servicing for years — and the failure we see is a seized pump from long idle periods rather than a worn filter.',
    intro:
      'New Punaichak, the Vikas Bhawan side and the Nehru Path stretch are covered. Good water lulls people into skipping service here; a pump that sits unused seizes just as surely as one that is overworked.',
    commonRepair: 'Seized pump after long idle periods',
    technicians: 1, monthlyJobs: 72,
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
      a: `All brands including Kent, Aquaguard, Livpure, Pureit, AO Smith, Blue Star, Havells, Nasaka, Zero B and locally assembled units. Because ${area.commonRepair.toLowerCase()} is what we see most often in ${area.name}, our technicians load the matching parts before heading out to this area.`,
    },
    {
      q: `How often should I service my RO in ${area.name}?`,
      a: `At ${area.tdsRange} we recommend a sediment filter change every 3 to 4 months in ${area.name}, carbon every 5 to 8 months, and a membrane check at 18 months. Manufacturer schedules assume cleaner feed water than Patna actually has, which is why machines here fail earlier than the manual predicts.`,
    },
    {
      q: `Do you provide a warranty on repairs in ${area.name}?`,
      a: 'Yes. Every repair carries a 30-day service warranty, and replacement parts carry their own manufacturer warranty of 6 to 12 months depending on the component.',
    },
    {
      q: 'Do I need to pay in advance?',
      a: 'No advance payment is required. You pay only after the technician has completed the work at your home. We accept cash, UPI and card.',
    },
  ];
}

/* ═══════════════════════════════════════════════════════════════════════
   PILLAR PAGE CONTENT — /service-patna
   ═══════════════════════════════════════════════════════════════════════
   Depth content for the main Patna service page.

   Why this exists: an audit of rocareindia.com (ranking #1 organically for
   "ro service in patna") showed 8,719 words on their Patna page against our
   1,984. Their advantage is not cleverness, it is depth — Google reads a
   long, specific page as topical authority.

   The difference in our approach: their locality pages share 100% vocabulary
   and 67 identical sentences, which is a doorway pattern. Everything below is
   written from the actual repair pattern we see in Patna, so it survives a
   helpful-content review.
   ══════════════════════════════════════════════════════════════════════ */

/** Symptom → cause → fix. Targets "ro not working", "ro leaking" style queries. */
export const RO_PROBLEMS = [
  {
    symptom: 'RO se paani hi nahi aa raha',
    symptomEn: 'No water from the RO at all',
    causes: [
      'Inlet valve closed or supply line pressure below 5 psi',
      'Sediment pre-filter completely choked',
      'Booster pump seized or its 24V adaptor dead',
      'Float valve in the storage tank stuck closed',
    ],
    fix: 'We check inlet pressure first with a gauge, then the adaptor output. In Patna about seven out of ten "no water" calls are a dead adaptor or a choked pre-filter — not the membrane, which is what most customers assume.',
    typicalCost: '₹350 – ₹1,300',
    patnaNote:
      'In Kidwaipuri, R Block and parts of Buddha Colony the actual cause is often low municipal pressure, not a fault at all. A booster pump fixes it permanently.',
  },
  {
    symptom: 'Paani bahut dheere aa raha hai',
    symptomEn: 'Water flow has become very slow',
    causes: [
      'RO membrane partially choked by scale',
      'Sediment filter loaded with silt',
      'Low feed pressure from the supply line',
      'Kinked or crushed tubing behind the unit',
    ],
    fix: 'A TDS reading across the membrane tells us instantly whether it is scaling or a pre-filter issue. If input TDS is normal but output is rising, the membrane is done.',
    typicalCost: '₹350 – ₹2,400',
    patnaNote:
      'In hard-water belts — Kankarbagh, Anisabad, Lohia Nagar, Hanuman Nagar — membranes scale up in 18 to 20 months instead of the 24 to 36 months the brochure claims.',
  },
  {
    symptom: 'RO se paani leak ho raha hai',
    symptomEn: 'Water leaking from the purifier',
    causes: [
      'Perished O-ring in a filter housing',
      'Cracked housing from over-tightening at a previous service',
      'Loose push-fit connector or a cut tube end',
      'Storage tank bladder ruptured',
    ],
    fix: 'We pressure-test each stage separately instead of guessing. Over-tightened housings from previous "cheap service" visits are the single most common cause we find.',
    typicalCost: '₹200 – ₹1,500',
    patnaNote:
      'Cracked housings are widespread in Patna because unqualified technicians tighten by hand strength rather than to spec. A cracked housing cannot be sealed with tape — it must be replaced.',
  },
  {
    symptom: 'Paani ka swad kharab hai ya badbu aa rahi hai',
    symptomEn: 'Water tastes or smells bad',
    causes: [
      'Carbon block saturated and no longer adsorbing',
      'Storage tank biofilm from months without sanitising',
      'UV lamp failed, allowing bacterial regrowth',
      'Membrane bypassing due to a damaged seal',
    ],
    fix: 'We sanitise the tank, replace the carbon stage, and verify UV output with a meter rather than just checking that the lamp lights up.',
    typicalCost: '₹350 – ₹1,200',
    patnaNote:
      'Riverside pockets — Kurji, Mahendru, Digha, Rajapur — get high organic load after monsoon. Carbon saturates there in four to five months, not the usual eight.',
  },
  {
    symptom: 'RO baar baar band chalu ho raha hai',
    symptomEn: 'The purifier keeps cycling on and off',
    causes: [
      'Faulty high-pressure switch',
      'Tank air pressure lost (should be 5 to 7 psi when empty)',
      'SMPS board failing under load',
      'Solenoid valve not closing fully',
    ],
    fix: 'We check tank air pressure with a gauge before replacing any electrical part. A tank that has lost its air charge mimics an electrical fault exactly.',
    typicalCost: '₹700 – ₹2,000',
    patnaNote:
      'Kumhrar, Khemnichak and the Bypass Road belt see repeated SMPS failures because of voltage swings. We fit a stabiliser alongside the repair there, otherwise the same board fails again in months.',
  },
  {
    symptom: 'Bahut zyada waste water nikal raha hai',
    symptomEn: 'The purifier is rejecting too much water',
    causes: [
      'Flow restrictor worn or wrongly rated',
      'Membrane scaled, forcing higher reject volume',
      'Auto-shutoff valve leaking through',
    ],
    fix: 'We measure the pure-to-reject ratio. Anything worse than 1:3 needs correction — usually a new flow restrictor, which is an inexpensive part.',
    typicalCost: '₹200 – ₹1,800',
    patnaNote:
      'On 600+ ppm supply a higher reject ratio is normal and healthy. Forcing it lower on hard water shortens membrane life — some technicians do this to look efficient and it costs the customer more later.',
  },
  {
    symptom: 'TDS zyada aa raha hai purifier ke baad',
    symptomEn: 'Output TDS is still high after purification',
    causes: [
      'Membrane past its life or ruptured',
      'TDS controller set too high',
      'Bypass line left open after a previous service',
    ],
    fix: 'We measure input and output TDS together. Rejection below 85% means the membrane needs replacing; a mis-set TDS controller is a two-minute adjustment.',
    typicalCost: '₹0 – ₹2,400',
    patnaNote:
      'An open bypass left behind by a previous technician is something we find more often than a genuinely dead membrane. Always check this before paying for a new membrane.',
  },
  {
    symptom: 'Naya installation kaise hota hai',
    symptomEn: 'How does a new installation work',
    causes: [],
    fix: 'Wall mounting, inlet tapping, drain routing, tank pressure setting, first-run flush and a TDS reading before and after. Around 90 minutes for a standard domestic unit.',
    typicalCost: '₹500 – ₹900',
    patnaNote:
      'We refuse to install where the drain line would discharge into a closed sink trap — it back-siphons and contaminates the unit. It costs us jobs occasionally, but it is the right call.',
  },
] as const;

/** Filter-by-filter reference. Targets "ro filter kitne din", "membrane life". */
export const FILTER_GUIDE = [
  {
    stage: 'Sediment Filter (Spun / PP)',
    job: 'Removes visible silt, sand and rust before they reach the finer stages.',
    normalLife: '6 months',
    patnaLife: '3–4 months',
    why: 'Patna borewells carry heavy silt and old municipal pipes add iron. This is the cheapest part in the machine and the one that protects everything after it.',
    cost: '₹150 – ₹300',
  },
  {
    stage: 'Pre-Carbon Block',
    job: 'Adsorbs chlorine, organics and the compounds behind bad taste and smell.',
    normalLife: '8–12 months',
    patnaLife: '5–8 months',
    why: 'Chlorine destroys an RO membrane. If the carbon is exhausted the membrane starts dying silently, months before anyone notices.',
    cost: '₹250 – ₹500',
  },
  {
    stage: 'RO Membrane',
    job: 'The actual purification stage — removes dissolved salts, heavy metals and hardness.',
    normalLife: '24–36 months',
    patnaLife: '18–24 months',
    why: 'Hardness above 500 ppm scales the membrane surface. In Kankarbagh, Anisabad and Danapur we regularly see membranes finished at 18 months.',
    cost: '₹1,200 – ₹2,400',
  },
  {
    stage: 'UV Lamp',
    job: 'Kills bacteria and viruses that pass through or regrow after the membrane.',
    normalLife: '12 months',
    patnaLife: '10–12 months',
    why: 'A UV lamp keeps glowing long after its output has dropped below the germicidal threshold. Age matters, not whether it lights up.',
    cost: '₹650 – ₹1,200',
  },
  {
    stage: 'Post-Carbon / Mineral Cartridge',
    job: 'Final polish for taste, and re-adds essential minerals in TDS-controlled units.',
    normalLife: '12 months',
    patnaLife: '10–12 months',
    why: 'Skipping this stage is why RO water tastes flat. It is inexpensive and makes a noticeable difference.',
    cost: '₹300 – ₹700',
  },
] as const;

/** Real TDS bands we measure, grouped. Targets "patna water tds". */
export const TDS_ZONES = [
  {
    band: 'Below 300 ppm — soft',
    areas: 'Kurji, Rajapur, Mahendru, parts of Patliputra Colony',
    meaning:
      'Good raw water. The RO membrane lasts near its rated life, but bacterial and turbidity control matter more here — a working UV stage is not optional in these riverside pockets.',
    advice: 'RO + UV is enough. A TDS controller keeps the taste from going flat.',
  },
  {
    band: '300–500 ppm — moderate',
    areas: 'Buddha Colony, Kidwaipuri, Boring Road, Shastri Nagar, New Punaichak, Bailey Road',
    meaning:
      'Typical central Patna municipal supply. Machines run comfortably; most failures here are mechanical (pump, adaptor) rather than filtration-related.',
    advice: 'Standard RO + UV + TDS controller. 75 GPD membrane is sufficient.',
  },
  {
    band: '500–800 ppm — hard',
    areas: 'Kankarbagh, Lohia Nagar, Hanuman Nagar, Khajpura, Rukanpura, Kumhrar',
    meaning:
      'Scaling is the dominant failure. White deposits form inside the storage tank and membrane recovery drops steadily through the second year.',
    advice: '100 GPD membrane, sediment filter every 3–4 months, annual tank descaling.',
  },
  {
    band: 'Above 800 ppm — very hard',
    areas: 'Anisabad, Danapur outskirts, Phulwari Sharif, Khagaul, Bihta side',
    meaning:
      'Membrane life drops to roughly 18 months even with correct maintenance. Cheap membranes fail in under a year here.',
    advice: 'High-rejection 100 GPD membrane and an AMC — paying per visit works out costlier at this hardness.',
  },
] as const;

/** Buying guidance — targets "patna ke liye best ro". */
export const BUYING_GUIDE = [
  {
    q: 'Patna ke paani ke liye kaunsa purifier sahi hai?',
    a: 'It depends entirely on your TDS. Under 300 ppm a UV+UF unit will do and an RO simply wastes water. Between 300 and 800 ppm you want RO+UV with a TDS controller. Above 800 ppm you need a high-rejection RO with a 100 GPD membrane. We measure your TDS free during any visit — buying without that number is guesswork.',
  },
  {
    q: 'Kitne litre ka tank lena chahiye?',
    a: 'For a family of four, 7 to 8 litres is enough. Larger tanks only help where supply is intermittent. A bigger tank on erratic supply also means water standing longer, which needs the UV stage running properly.',
  },
  {
    q: 'Copper aur alkaline purifier zaroori hai kya?',
    a: 'Honest answer: not for most homes in Patna. They add ₹3,000 to ₹6,000 to the price and another cartridge to replace every year. Get the base filtration right first — that is what actually protects your health.',
  },
  {
    q: 'Local assembled RO lein ya branded?',
    a: 'A well-assembled local unit with genuine components performs fine and costs less to repair, because parts are standard and available in Patna. The risk is not the assembly — it is fake filters. We service both, and we tell you honestly which parts in your machine are genuine.',
  },
  {
    q: 'AMC lena faydemand hai ya per-visit?',
    a: 'Below 500 ppm, per-visit is usually cheaper. Above 500 ppm — Kankarbagh, Anisabad, Danapur — you will need three or four filter changes a year anyway, and an AMC works out cheaper while also getting you priority response.',
  },
] as const;

/** Local proof points — Patna-specific, not generic marketing lines. */
export const WHY_LOCAL = [
  {
    title: 'Patna ke paani ka asli data',
    body:
      'Published groundwater studies for Patna record TDS from 174 to 1,284 ppm and total hardness from 156 to 760 mg/L across the city. That is a nearly eightfold spread. Any company quoting one filter schedule for all of Patna has not measured your water.',
  },
  {
    title: 'Hum yahin baithe hain',
    body:
      'Our workshop is at Sai Gali, opposite B-62, Buddha Colony. Not a call centre in another city routing your job to whoever is free. When a part is needed we pick it off our own shelf and come back the same day.',
  },
  {
    title: '₹200 visit — poora diagnosis included',
    body:
      'Most providers in Patna charge ₹350 to ₹399 just to arrive. Our ₹200 covers inspection, TDS testing of input and output, and a written diagnosis. If you decide not to repair, you still keep the report.',
  },
  {
    title: 'Parts pehle dikhate hain',
    body:
      'The old part comes out in front of you and the new one goes in from a sealed pack. You see what you are paying for. This sounds obvious; in practice it is rare.',
  },
] as const;
