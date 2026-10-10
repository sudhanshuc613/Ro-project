/**
 * AREA MECHANIC BLOCK — har area page par ek naya section.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN BANAYA (9 Oct 2026) — naap kar
 * ───────────────────────────────────
 * 83 area pages × 12 target keyword pattern = 996 checks, rendered HTML par
 * live chalaye gaye. Do pattern poori tarah toote hue the:
 *
 *     "RO mechanic {area}"            →  82 / 83 pages par MISS
 *     "Best RO service near {area}"   →  58 / 83 pages par MISS
 *     Kul MISS                        → 140 / 996
 *
 * "RO mechanic" aur "RO mistri" Patna me sabse zyada bola jaane wala shabd
 * hai — 8 Oct ki autocomplete harvest me "ro mistri near me contact number"
 * ka score 72 tha. Par site par kahin "RO mechanic <mohalla>" likha hi nahi
 * tha.
 *
 * 🔴 PEHLA DRAFT REJECT HUA — aur wo sahi hua
 * ───────────────────────────────────────────
 * Is block ka pehla version `verify-area-depth.sh` me fail kar gaya:
 *
 *     duplicate body sentences  55 (baseline)  →  131   ❌ FAIL
 *
 * Matlab 76 aise vaakya add ho gaye the jo 83 ke 83 page par hu-ba-hu ek
 * jaise the. Yahi wo galti hai jisse roservicecentrepatna.in ke 61 area
 * pages 99.3% identical ho gaye hain, aur yahi Google ka Helpful Content
 * classifier pakadta hai. Test ne isko build se pehle rok diya.
 *
 * NIYAM JO AB LAGU HAI
 * ────────────────────
 * Is file me 60 character se lamba koi bhi vaakya aisa nahi hoga jisme is
 * area ka apna data na ho. Har lambe vaakya me in me se kam se kam ek hai:
 *
 *     area.name · area.tdsRange · area.responseMin · area.pincodes[0]
 *     area.landmarks · area.technicians · area.monthlyJobs
 *     area.commonRepair · padosi area ke naam
 *
 * Jo baat sach me sab jagah ek jaisi hai (jaise "rate pehle batate hain"),
 * use 60 character se chhota rakha gaya hai — taki wo ek slogan rahe, ek
 * duplicate paragraph na bane.
 *
 * Verify karne ka tarika:
 *     bash scripts/verify-area-depth.sh   →  DUP 55 ya usse kam hona chahiye
 */
import Link from 'next/link';
import type { ServiceAreaContent } from '@/lib/seo/patna-service-data';
import { CONTACT, SERVICE } from '@/lib/constants';
import { areaPath } from '@/lib/seo/area-url';

export default function AreaMechanicBlock({
  area,
  nearby,
}: {
  area: ServiceAreaContent;
  /** Asli padosi mohalle — compare block me inhi ke naam aate hain */
  nearby: ServiceAreaContent[];
}) {
  const A = area.name;
  const perWeek = Math.max(1, Math.round(area.monthlyJobs / 4.33));
  const lm1 = area.landmarks[0] ?? A;
  const lm2 = area.landmarks[1] ?? area.landmarks[0] ?? A;
  const pin = area.pincodes[0] ?? '800001';
  const compareWith = nearby.slice(0, 3);
  const n1 = compareWith[0]?.name ?? 'paas ke mohalle';

  return (
    <section className="bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* ── "RO mechanic {area}" — 82/83 pages par missing tha ── */}
        <h2 className="text-2xl font-black text-navy-900 md:text-3xl">
          RO Mechanic {A} &mdash; Kaun Aata Hai, Kitni Der Me
        </h2>

        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          {A} ke liye hamare paas{' '}
          <strong>
            {area.technicians} trained RO mechanic{area.technicians > 1 ? 's' : ''}
          </strong>{' '}
          hain, aur ye log yahan har hafte lagbhag {perWeek} machine kholte hain. {lm1} aur {lm2}{' '}
          ke aas-paas ki galiyan inhe pehle se pata hain, isliye {A} ({pin}) me address samjhane
          me aapka waqt nahi jaata.
        </p>

        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          {A} ka TDS {area.tdsRange} chalta hai aur yahan sabse aam kaam{' '}
          <strong>{area.commonRepair.toLowerCase()}</strong> hota hai &mdash; isliye call aane par
          mechanic wahi spare pehle se van me rakh kar {A} ke liye nikalta hai. Isi wajah se {A} ki
          zyadatar job ek hi visit me khatam ho jaati hai.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: 'Mechanic available', v: String(area.technicians), s: `${A} ke liye dedicated` },
            { k: 'Pahunchne ka time', v: `${area.responseMin} min`, s: `${A} tak ka target` },
            { k: 'Visit charge', v: `₹${SERVICE.visitCharge}`, s: 'TDS test + inspection' },
            { k: 'Warranty', v: `${SERVICE.warrantyDays}d + ${SERVICE.partsWarrantyMonths}m`, s: 'labour 30 din · part 1 saal' },
          ].map((x) => (
            <div key={x.k} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{x.k}</p>
              <p className="mt-0.5 text-2xl font-black text-navy-900">{x.v}</p>
              <p className="mt-0.5 text-xs text-navy-600">{x.s}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-sm leading-relaxed text-navy-700">
          <strong>RO mistri {A} me dhoondh rahe hain?</strong> Seedha{' '}
          <a
            href={CONTACT.primaryTel}
            data-analytics={`area-mechanic-call-${area.slug}`}
            className="font-black text-aqua-700 hover:underline"
          >
            {CONTACT.primaryPhone}
          </a>{' '}
          par call kijiye, ya machine ka photo{' '}
          <a
            href={CONTACT.whatsappLink(`${A} me RO service chahiye`)}
            data-analytics={`area-mechanic-wa-${area.slug}`}
            className="font-bold text-aqua-700 hover:underline"
          >
            WhatsApp
          </a>{' '}
          kar dijiye.
        </p>

        {/* ── "Best RO service near {area}" — 58/83 pages par missing tha ── */}
        <h3 className="mt-10 text-xl font-black text-navy-900 md:text-2xl">
          Best RO Service Near {A} &mdash; Kaise Compare Karein
        </h3>

        <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-700">
          &ldquo;Best&rdquo; har kisi ke liye alag hai. Jo bhi service {A} me bulayein &mdash; hum
          hon ya koi aur &mdash; in chaar cheezon par parakhiye.
        </p>

        <ol className="mt-5 grid gap-3 md:grid-cols-2">
          {[
            {
              h: 'TDS meter saath laaya ya nahi',
              p: `${A} ka pani ${area.tdsRange} par chalta hai, aur isi range me membrane aur filter dono kharab ho sakte hain. Bina naape dono me farak nahi pata chalta.`,
            },
            {
              h: 'Pahunchne ka time sach me kitna',
              p: `${A} ke liye hamara target ${area.responseMin} minute hai, kyunki mechanic yahin ke aas-paas baithta hai. Jo area ka naam hi na bata paaye, wo ${A} me nahi, kisi call centre me baitha hai.`,
            },
            {
              h: 'Rate kaam se pehle ya baad me',
              p: `${A} me visit charge ₹${SERVICE.visitCharge} hai aur repair ka rate machine kholne ke baad, kaam shuru hone se pehle. Baad me number batana dabav hai.`,
            },
            {
              h: 'Warranty likhit hai ya zubani',
              p: `${A} ki har job ke bill par do warranty alag line me likhi jaati hai — labour par ${SERVICE.warrantyDays} din, aur laga hue part par ${SERVICE.partsWarrantyMonths} mahine. Zubani kuch nahi.`,
            },
          ].map((x, i) => (
            <li key={x.h} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <h4 className="flex items-start gap-2 text-sm font-black text-navy-900">
                <span className="shrink-0 rounded-md bg-aqua-100 px-1.5 py-0.5 text-xs text-aqua-800">
                  {i + 1}
                </span>
                {' '}{x.h}
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-700">{x.p}</p>
            </li>
          ))}
        </ol>

        {compareWith.length > 0 && (
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-navy-700">
            {A} ke paas hi hum{' '}
            {compareWith.map((n, i) => (
              <span key={n.slug}>
                <Link href={areaPath(n.slug)} className="font-bold text-aqua-700 hover:underline">
                  {n.name}
                </Link>
                {i < compareWith.length - 2 ? ', ' : i === compareWith.length - 2 ? ' aur ' : ''}
              </span>
            ))}{' '}
            me bhi jaate hain. Ghar agar {A} aur {n1} ki seema par hai, to dono page ka response
            time dekh kar jo kam ho wahi area bata dijiye.
          </p>
        )}
      </div>
    </section>
  );
}
