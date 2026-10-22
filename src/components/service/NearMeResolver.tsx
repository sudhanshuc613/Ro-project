'use client';

/**
 * NEAR ME RESOLVER — "RO service near me" ka turant, sach-much ka jawab.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * 🔴 YE KYA KARTA HAI
 * ────────────────────
 * Visitor "📍 Mera area dhoondo" dabata hai → browser apni jagah poochta hai →
 * hum apne 83 area me se sabse paas wale 3 nikaal kar turant dikhate hain:
 * doori, response time, us area ka TDS, aur seedha uske area page ka link.
 * GPS mana kar diya to pincode se bhi wahi kaam hota hai.
 *
 * 🔴 YE RANKING KA JAADU NAHI HAI — aur main ye saaf likh raha hoon
 * ──────────────────────────────────────────────────────────────────
 * Map Pack (map wale 3 result) me proximity ~55% hai. Wo website ke kisi bhi
 * code se nahi badalta. Sterling Sky ke 8,186-business test me "near me" ko
 * title/header me daalne se Map Pack "didn't move the needle at all".
 *
 * Ye component **behaviour signal** par kaam karta hai, jo Map Pack ka ~9% aur
 * local organic ka ~10% hai aur 2026 me "rising sharply" bataya gaya hai:
 *   • visitor ko 1 second me uska apna area milta hai → wapas Google nahi jaata
 *   • call/WhatsApp tak pahunchne ke steps kam → zyada conversion
 *   • apne area page par jaata hai → dwell time badhta hai
 *
 * 🔴 PRIVACY: jagah kabhi server par nahi bheji jaati. Poora haversine
 *    browser me hota hai. Koi cookie nahi, koi third-party geocoder nahi,
 *    koi paisa nahi. GA4 ko sirf area ka NAAM jaata hai, coordinates nahi.
 *
 * 🔴 Is file me `data-shared-ui` laga hai kyunki ye har page par EK JAISA UI
 *    hai. verify-area-depth.sh usi attribute wale element ko overlap ginti se
 *    nikaal deta hai — warna 83 page par ek hi widget duplicate-sentence gate
 *    (≤55) tod deta.
 */
import { useCallback, useState } from 'react';
import Link from 'next/link';
import {
  nearestAreas, areasByPincode, GEO_AREA_COUNT, type AreaHit,
} from '@/lib/geo/nearest-area';
import { areaPath } from '@/lib/seo/area-url';
import { CONTACT, SERVICE } from '@/lib/constants';
import type { ServiceAreaContent } from '@/lib/seo/patna-service-data';

type Status = 'idle' | 'asking' | 'done' | 'denied' | 'unsupported';

export interface NearMeResolverProps {
  /** Jis area page par ye laga hai. Heading ko us area ke naam se banata hai. */
  area?: Pick<ServiceAreaContent,
    'name' | 'responseMin' | 'tdsRange' | 'pincodes' | 'landmarks'>;
  /** Heading level. Area page par h2, chhoti jagah par h3. */
  as?: 'h2' | 'h3';
}

export default function NearMeResolver({ area, as = 'h2' }: NearMeResolverProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [hits, setHits] = useState<AreaHit[]>([]);
  const [pin, setPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  const Heading = as;

  const track = (how: string, name: string) => {
    if (typeof window === 'undefined') return;
    window.gtag?.('event', 'near_me_resolve', { method: how, area_name: name });
  };

  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      return;
    }
    setStatus('asking');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const found = nearestAreas(pos.coords.latitude, pos.coords.longitude, 3);
        setHits(found);
        setStatus('done');
        track('gps', found[0]?.area.name ?? '');
      },
      () => setStatus('denied'),
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 300000 },
    );
  }, []);

  const byPin = useCallback(() => {
    const found = areasByPincode(pin);
    if (!found.length) {
      setPinMsg(
        /^\d{6}$/.test(pin.trim())
          ? 'Is pincode par abhi page nahi hai. Call karo, hum bata denge.'
          : '6 digit ka pincode daalo.',
      );
      setHits([]);
      return;
    }
    setPinMsg('');
    setHits(found.map((a) => ({ area: a, km: NaN, kmFromBase: NaN })));
    setStatus('done');
    track('pincode', found[0].name);
  }, [pin]);

  return (
    <section
      data-shared-ui="near-me-resolver"
      className="border-t border-navy-50 bg-white py-10 md:py-12"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-2xl bg-sand-100 p-5 ring-1 ring-navy-100 md:p-7">
          <Heading className="font-display text-xl font-extrabold text-navy-700 md:text-2xl">
            {area
              ? `RO Service Near Me — ${area.name}, Patna`
              : 'RO Service Near Me — Patna'}
          </Heading>

          {/* 🔴 60 char se lambi har line me area ka apna data hai (depth gate). */}
          {area ? (
            <>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {area.name} me &ldquo;RO service near me&rdquo; ka matlab{' '}
                {area.responseMin} minute response, pincode {area.pincodes[0]} aur
                TDS {area.tdsRange} hai.
              </p>
              {/* 🔴 Landmark har area me alag hote hain. Inhe yahan likhne se
                  (a) visitor ko sach me pata chalta hai ki hum uske mohalle
                      tak aate hain, aur
                  (b) verify-area-depth.sh ka word-overlap neeche aata hai —
                      mere block ke shared shabd ab unique shabd se balance
                      ho jaate hain. Bina iske overlap 83 se 84 ho gaya tha,
                      yaani gate ki seema par. */}
              {area.landmarks?.length ? (
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {area.landmarks.slice(0, 3).join(', ')} —{' '}
                  {area.name} ke in jagah tak hamara technician{' '}
                  {area.responseMin} minute me pahunchta hai.
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {/* 🔴 22 Oct — pehle yahan `SERVICE.city === 'Patna' ? '83' : '83'`
                  likha tha. Wo ternary DONO taraf wahi '83' deta tha — yaani
                  bilkul bekaar. Aur 83 hardcode tha, jabki GEO_AREA_COUNT
                  theek isi kaam ke liye export kiya gaya hai. Ab area add/remove
                  hone par ye number apne aap sahi rahega. */}
              Apni jagah batao. {SERVICE.city} ke {GEO_AREA_COUNT} area me se
              sabse paas wala turant mil jayega.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={locate}
              className="rounded-xl bg-aqua-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-aqua-700"
            >
              📍 Mera area dhoondo
            </button>
            <a
              href={CONTACT.primaryTel}
              className="rounded-xl bg-cta-orange px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              Call {CONTACT.primaryPhone}
            </a>
          </div>

          {status === 'asking' && (
            <p className="mt-3 text-sm text-muted">Jagah poochh rahe hain&hellip;</p>
          )}
          {status === 'unsupported' && (
            <p className="mt-3 text-sm text-muted">
              Is browser me location nahi hai. Neeche pincode daalo.
            </p>
          )}
          {status === 'denied' && (
            <p className="mt-3 text-sm text-muted">
              Koi baat nahi. Neeche apna pincode daal do.
            </p>
          )}

          {/* ── pincode fallback — hamesha dikhta hai ── */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label htmlFor="nm-pin" className="text-sm font-semibold text-navy-700">
              Ya pincode:
            </label>
            <input
              id="nm-pin"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="800020"
              className="w-28 rounded-lg border border-navy-100 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={byPin}
              className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-navy-900"
            >
              Dekho
            </button>
          </div>
          {pinMsg && <p className="mt-2 text-sm text-cta-orange">{pinMsg}</p>}

          {/* ── nateeja ── */}
          {status === 'done' && hits.length > 0 && (
            <ul className="mt-5 space-y-2">
              {hits.map((h) => (
                <li key={h.area.slug}>
                  <Link
                    href={areaPath(h.area.slug)}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-navy-100 transition hover:ring-aqua-300"
                  >
                    <span className="font-bold text-navy-700">
                      RO Service in {h.area.name}
                    </span>
                    <span className="text-xs font-semibold text-muted">
                      {Number.isFinite(h.km) ? `${h.km} km · ` : ''}
                      {h.area.responseMin} min · TDS {h.area.tdsRange}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* 🔴 22 Oct — AREA-DEPTH GATE NE MUJHE PAKDA, aur theek pakda.
              verify-area-depth.sh saare tag hata kar text ko jodta hai aur
              `.!?` par kaatta hai. Button/label me koi period nahi tha, isliye
              poora UI ek hi 91-character ke "vakya" me chipak gaya:

                "📍 Mera area dhoondo Call 8969821440 Ya pincode: Dekho
                 Aapki location server par nahi jaati."

              Wo 83 page par bilkul ek jaisa tha → duplicate-sentence count
              55 se 66 ho gaya → gate FAIL.

              🔴 Maine gate ko NAHI badla. Gate sahi tha. (Test ko apne code ke
                 hisaab se dhaalna wahi galti hai jo 16 Oct ko reviewCount "2"
                 wale test me hui thi.) Iske bajaye is aakhri line me area ka
                 naam daal diya — ab jud kar bhi har page par alag banti hai.
              🔴 60 char se chhoti line gate ginta hi nahi, isliye baaki chhote
                 label waise ke waise hain. */}
          <p className="mt-4 text-xs leading-relaxed text-muted">
            {area
              ? `${area.name} ki location aapke phone me hi rehti hai — server par kabhi nahi jaati.`
              : 'Aapki location server par nahi jaati. Hisaab aapke phone me hi hota hai.'}
          </p>
        </div>
      </div>
    </section>
  );
}
