/**
 * NEAR-ME SELF TEST — ASLI TypeScript function ko chalata hai.
 *
 * 🔴 Kyun alag file: pehle maine haversine ka Python me DOBARA likha hua
 *    version test kiya tha. Wo galat tarika hai — tum us code ko test kar
 *    rahe ho jo ship nahi ho raha. Ye file wahi function import karti hai
 *    jo asli page par chalta hai.
 *
 * chalao:  npx tsx scripts/near-me-selftest.mts
 */
import {
  haversineKm, nearestAreas, areasByPincode, areaByName,
  kmFromBase, patnaBounds, GEO_AREA_COUNT, nearMeSentence,
} from '../src/lib/geo/nearest-area';
import { SERVICE_AREAS } from '../src/lib/seo/patna-service-data';
import { CONTACT } from '../src/lib/constants';

let pass = 0;
let fail = 0;
const chk = (label: string, got: unknown, want: unknown) => {
  if (String(got) === String(want)) { pass++; console.log(`  PASS  ${label} (${got})`); }
  else { fail++; console.log(`  FAIL  ${label} — got '${got}' want '${want}'`); }
};
const ge = (label: string, got: number, want: number) => {
  if (got >= want) { pass++; console.log(`  PASS  ${label} (${got} >= ${want})`); }
  else { fail++; console.log(`  FAIL  ${label} — got ${got} want >= ${want}`); }
};

console.log('── haversine ──');
// Buddha Colony -> Kankarbagh. Do alag tarike se swatantra roop se jaancha:
// haversine 3.116 · equirectangular 3.116
chk('Buddha Colony -> Kankarbagh = 3.1 km',
  haversineKm(25.6093, 85.1376, 25.5941, 85.1637).toFixed(1), '3.1');
chk('ek hi point ki doori 0', haversineKm(25.6, 85.1, 25.6, 85.1).toFixed(3), '0.000');
// 1 degree latitude ~ 111.19 km
chk('1 degree lat ~ 111.2 km',
  haversineKm(25.0, 85.0, 26.0, 85.0).toFixed(1), '111.2');
chk('symmetric (A->B == B->A)',
  haversineKm(25.6093, 85.1376, 25.5941, 85.1637).toFixed(6),
  haversineKm(25.5941, 85.1637, 25.6093, 85.1376).toFixed(6));

console.log('');
console.log('── data ──');
chk('GEO_AREA_COUNT', GEO_AREA_COUNT, 83);
chk('SERVICE_AREAS total', SERVICE_AREAS.length, 83);
const dupe = new Set(SERVICE_AREAS.map((a) => `${a.lat},${a.lng}`));
chk('koi do area ka lat/lng same nahi', dupe.size, 83);
chk('har area ka pincode hai',
  SERVICE_AREAS.filter((a) => a.pincodes?.length).length, 83);

console.log('');
console.log('── nearestAreas ──');
// Kankarbagh ke theek upar khade ho -> pehla nateeja Kankarbagh hona chahiye
const atKb = nearestAreas(25.5941, 85.1637, 3);
chk('Kankarbagh par khade -> #1 Kankarbagh', atKb[0].area.slug, 'kankarbagh');
chk('#1 ki doori ~0', atKb[0].km.toFixed(1), '0.0');
chk('3 nateeje mile', atKb.length, 3);
chk('nateeje paas-se-door kram me', String(atKb[0].km <= atKb[1].km && atKb[1].km <= atKb[2].km), 'true');
// Danapur ke paas (25.6356, 85.0478 ke aas-paas) -> Danapur ya uske paas wala
const atDnp = nearestAreas(25.6356, 85.0478, 1);
ge('Danapur ke paas se doori 5 km se kam', 5 - atDnp[0].km, 0);
// har area par khade ho kar wahi area #1 aana chahiye — 83/83
let selfHit = 0;
for (const a of SERVICE_AREAS) {
  if (nearestAreas(a.lat, a.lng, 1)[0].area.slug === a.slug) selfHit++;
}
chk('har area par khade -> wahi area #1 (83/83)', selfHit, 83);
chk('limit 0 dene par bhi 1 nateeja', nearestAreas(25.6, 85.1, 0).length, 1);

console.log('');
console.log('── pincode ──');
chk('800020 -> kam se kam 1 area', areasByPincode('800020').length > 0, true);
chk('galat pincode -> 0', areasByPincode('12').length, 0);
chk('non-numeric -> 0', areasByPincode('abcdef').length, 0);
chk('space wala pincode chalta hai', areasByPincode(' 800020 ').length > 0, true);

console.log('');
console.log('── areaByName ──');
chk('slug se', areaByName('kankarbagh')?.slug, 'kankarbagh');
chk('naam se', areaByName('Kankarbagh')?.slug, 'kankarbagh');
chk('space wale naam se', areaByName('Boring Road')?.slug, 'boring-road');
chk('na milne par undefined', areaByName('zzz-nahi-hai'), 'undefined');

console.log('');
console.log('── base se doori ──');
chk('base = CONTACT.geo', `${CONTACT.geo.lat},${CONTACT.geo.lng}`, '25.6093,85.1376');
const far = SERVICE_AREAS.map((a) => kmFromBase(a)).sort((x, y) => y - x);
chk('sabse door area 17.5 km', far[0].toFixed(1), '17.5');
// 🔴 33 aur 31 dono "sahi" lag sakte hain — farak sirf rounding ka hai.
// kmFromBase() display ke liye 1 decimal par round karta hai. Shivpuri aur
// AG Colony dono ~4.96 km par hain, round hone par 5.0 ban jaate hain.
// Isliye >=5 inclusive niyam par 33 aate hain, unrounded >5 par 31.
// Poore project me EK hi niyam: rounded, >= 5. scripts/near-me-grid.py bhi
// yahi karta hai, taaki report aur test kabhi alag number na bolein.
chk('5 km+ door area (rounded, >=5)',
  SERVICE_AREAS.filter((a) => kmFromBase(a) >= 5).length, 33);
chk('border par theek 5.0 km wale 2 area',
  SERVICE_AREAS.filter((a) => kmFromBase(a) === 5).map((a) => a.name).sort().join(','),
  'AG Colony,Shivpuri');
chk('sab 25 km GeoCircle ke andar',
  SERVICE_AREAS.filter((a) => kmFromBase(a) > 25).length, 0);

console.log('');
console.log('── bounds + sentence ──');
const b = patnaBounds();
chk('bounds sahi kram me', String(b.minLat < b.maxLat && b.minLng < b.maxLng), 'true');
const s = nearMeSentence(atKb[0]);
chk('sentence me area ka naam', String(s.includes('Kankarbagh')), 'true');
chk('sentence me near me', String(s.includes('near me')), 'true');
chk('sentence me responseMin', String(s.includes(String(atKb[0].area.responseMin))), 'true');

console.log('');
console.log(`  PASS: ${pass}    FAIL: ${fail}`);
process.exit(fail === 0 ? 0 : 1);
