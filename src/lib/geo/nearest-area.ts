/**
 * NEAREST AREA RESOLVER — "RO service near me" ka asli jawab.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * 🔴 KYUN BANAYA (22 Oct 2026)
 * ─────────────────────────────
 * Owner: "jab mai 'ro service in patna' search karta hu to site top pe aati
 * hai, par 'ro service near me' alag-alag jagah se search karne par nahi aati."
 *
 * Naapne par asli wajah mili — ye on-page ka problem NAHI hai:
 *
 *   Whitespark 2026 Local Search Ranking Factors (47 expert, 187 factor):
 *     Map Pack  → proximity ~55% · GBP ~32% · reviews ~20% · on-page ~15%
 *     Organic   → on-page 33% · LINKS 24% · behaviour 10% · GBP 7%
 *
 *   Hamara ek hi pata hai: Buddha Colony (25.6093, 85.1376).
 *   83 area me se 31 area 5 km se zyada door hain —
 *     Khagaul 10.1 km · AIIMS Patna 11.0 km · Anandpur 17.5 km
 *   Proximity badla nahi ja sakta. Ek pata poore Patna ke "paas" nahi ho sakta.
 *
 * Sterling Sky ke 8,186-business test ka nateeja:
 *   "near me" ko title/header/URL me daalne se **organic** uthta hai,
 *   **Map Pack bilkul nahi hilta**.
 *
 * Isliye ye file wo cheez karti hai jo code SACH ME kar sakta hai:
 *
 *   1. Visitor ki asli jagah se hamare 83 area me se sabse paas wala nikalna
 *      (haversine, client par, bina kisi API ke, bina kisi paise ke).
 *   2. Use turant uska apna area page, apna response time aur apna TDS dikhana.
 *      → behaviour signal (dwell, pogo-stick na karna, call) sudharta hai, jo
 *        Map Pack ka ~9% aur organic ka ~10% hai, aur 2026 me "rising sharply".
 *   3. Schema me GeoCircle ke SAATH-SAATH har area ka naam dena — research:
 *      "Google's algorithm prefers explicit boundaries over geometric ones."
 *
 * 🔴 Ye koi "trick" nahi hai aur na hi doorway page banata hai. Ye sirf wahi
 *    83 asli area page dikhata hai jo pehle se maujood hain.
 *
 * ZERO DEPENDENCY. Server aur client dono par chalta hai.
 * Is file me koi React nahi hai, isliye `'use client'` file se import karna
 * safe hai (check-client-exports.mjs ka niyam).
 */
import { SERVICE_AREAS, type ServiceAreaContent } from '@/lib/seo/patna-service-data';
import { CONTACT } from '@/lib/constants';

/** Prithvi ki trijya, km. */
const EARTH_KM = 6371;

/**
 * Haversine — do lat/lng ke beech ki seedhi doori, km me.
 * Patna jitne chhote daayre me ye ±0.1% se bhi theek hai.
 */
export function haversineKm(
  lat1: number, lng1: number, lat2: number, lng2: number,
): number {
  const p = Math.PI / 180;
  const a =
    0.5 -
    Math.cos((lat2 - lat1) * p) / 2 +
    (Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lng2 - lng1) * p))) / 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(a));
}

export interface AreaHit {
  area: ServiceAreaContent;
  /** Visitor se doori, km (1 decimal). */
  km: number;
  /** Hamare Buddha Colony base se us area ki doori, km (1 decimal). */
  kmFromBase: number;
}

/** Sirf wahi area jinke paas asli lat/lng hai. */
const GEO_AREAS: ServiceAreaContent[] = SERVICE_AREAS.filter(
  (a) => typeof a.lat === 'number' && typeof a.lng === 'number',
);

/** Kitne area par geo-matching ho sakti hai. Test isi number ko pakadta hai. */
export const GEO_AREA_COUNT = GEO_AREAS.length;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Di gayi jagah se sabse paas ke `limit` area, paas se door ke kram me.
 *
 * 🔴 Koi network call nahi. Koi third-party geocoder nahi. Sab kuch us
 *    `lat/lng` se ginta hai jo pehle se `patna-service-data.ts` me hai.
 */
export function nearestAreas(lat: number, lng: number, limit = 3): AreaHit[] {
  return GEO_AREAS
    .map((area) => ({
      area,
      km: round1(haversineKm(lat, lng, area.lat, area.lng)),
      kmFromBase: round1(
        haversineKm(CONTACT.geo.lat, CONTACT.geo.lng, area.lat, area.lng),
      ),
    }))
    .sort((a, b) => a.km - b.km)
    .slice(0, Math.max(1, limit));
}

/**
 * Pincode se area. Ek pincode kai area me ho sakta hai (jaise 800020 =
 * Kankarbagh + aur), isliye saare lautate hain.
 */
export function areasByPincode(pincode: string): ServiceAreaContent[] {
  const pin = pincode.trim();
  if (!/^\d{6}$/.test(pin)) return [];
  return SERVICE_AREAS.filter((a) => a.pincodes.includes(pin));
}

/** Naam ya slug se area dhoondo (case/space ka farak nahi padta). */
export function areaByName(q: string): ServiceAreaContent | undefined {
  const k = q.trim().toLowerCase().replace(/\s+/g, '-');
  return SERVICE_AREAS.find(
    (a) => a.slug === k || a.name.toLowerCase().replace(/\s+/g, '-') === k,
  );
}

/** Buddha Colony base se us area ki doori. Coverage report ke liye. */
export function kmFromBase(area: ServiceAreaContent): number {
  if (typeof area.lat !== 'number' || typeof area.lng !== 'number') return NaN;
  return round1(haversineKm(CONTACT.geo.lat, CONTACT.geo.lng, area.lat, area.lng));
}

/**
 * Patna ka geo-bounding box, hamare apne 83 area ke lat/lng se bana.
 * Coverage grid tool isi ko grid me kaatta hai.
 */
export function patnaBounds(): {
  minLat: number; maxLat: number; minLng: number; maxLng: number;
} {
  const lats = GEO_AREAS.map((a) => a.lat);
  const lngs = GEO_AREAS.map((a) => a.lng);
  return {
    minLat: Math.min(...lats), maxLat: Math.max(...lats),
    minLng: Math.min(...lngs), maxLng: Math.max(...lngs),
  };
}

/**
 * Ek chhota, saaf vaakya — "aap X me ho, technician Y min me".
 *
 * 🔴 AREA-DEPTH GATE KA NIYAM: 60 character se lamba koi bhi vaakya tabhi
 *    chalega jab usme us area ka apna data ho. Isliye yahan har lambi line me
 *    `area.name` + `responseMin` ya `tdsRange` ya `pincodes[0]` daala gaya hai.
 */
export function nearMeSentence(hit: AreaHit): string {
  const a = hit.area;
  return `${a.name} me RO service near me ka matlab ${a.responseMin} minute response, pincode ${a.pincodes[0]}, TDS ${a.tdsRange}.`;
}
