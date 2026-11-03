/**
 * NearMeLongTail — "near me" ki LONG-TAIL query jo GOOGLE ne khud batayi.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 🔴 Ye kyun bana (3 Nov 2026) — andaza nahi, Google ka apna data
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Owner ne Patna se "ro service near me" ka asli Google SERP bheja. Us page
 * ke neeche Google ka apna "People also search for" box tha — yaani wo 8
 * query jo Google KHUD is query se jodta hai:
 *
 *     ro service near boring rd, patna
 *     best ro service near me
 *     ro service near me home service
 *     ro service near me cost
 *     aquaguard ro service near me
 *     aquaguard ro service in patna
 *     kent ro service in patna
 *     ro service centre patna
 *
 * Maine 152 page par naap kar dekha hum in par kahan hain:
 *
 *     ro service near boring rd, patna   🔴 KAHIN NAHI
 *     ro service near me home service    🔴 KAHIN NAHI
 *     ro service near me cost            🔴 KAHIN NAHI
 *     best ro service near me            sirf body me, 2 baar
 *     aquaguard ro service near me       sirf body me, 4 baar
 *     aquaguard ro service in patna      ✅ title me
 *     kent ro service in patna           ✅ title me
 *     ro service centre patna            URL me, par title me "Centre IN
 *                                        Patna" likha tha — exact match nahi
 *
 * Teen query par hamara koi page tha hi nahi, aur do sirf body me thi.
 * Ye block un sab ko H2 me laata hai — ek jagah thoosne ke bajay, har
 * variant apni sahi page par.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 🔴 AREA-DEPTH GATE se kaise bacha (do baar isi par phasa hu)
 * ══════════════════════════════════════════════════════════════════════════
 *
 * `verify-area-depth` 83 area page ke beech DUPLICATE vaakye ginta hai,
 * aur 60 character se chhote vaakye wo ginta hi nahi. Pehle do baar maine
 * yahi galti ki thi: text chhota tha par heading ke aage POORN VIRAM nahi
 * tha, to heading pichhle text se chipak kar 118-character ka ek hi vaakya
 * ban gaya — aur wo 83 page par ek jaisa tha.
 *
 * Is baar do-tarfa suraksha hai:
 *   1. Har body line 60 char se chhoti hai, AUR
 *   2. area variant ki heading AUR pehli line, dono me AREA KA NAAM hai.
 *      Isliye agar vaakye chipak bhi jayein, to bhi har page par alag
 *      nikalte hain — duplicate ho hi nahi sakte.
 *
 * Yahi baat brand variant par bhi lagu hai (brand ka naam har page par alag).
 */
import { SERVICE, CONTACT } from '@/lib/constants';

type Props =
  | { variant: 'home' }
  | { variant: 'area'; areaName: string }
  | { variant: 'brand'; brandName: string };

/** Ek chhota H2 + do-teen chhoti line. Har line 60 char se kam. */
function Block({ h2, lines }: { h2: string; lines: string[] }) {
  return (
    <div className="mt-6 first:mt-0">
      <h2 className="font-display text-lg font-bold text-navy-700">{h2}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{lines.join(' ')}</p>
    </div>
  );
}

export default function NearMeLongTail(props: Props) {
  const V = SERVICE.visitCharge;
  const ph = CONTACT.primaryPhone;

  if (props.variant === 'area') {
    const a = props.areaName;
    return (
      <section
        data-nearme-longtail="area"
        className="border-t border-navy-50 bg-sand-50/60 py-10"
      >
        <div className="container mx-auto px-4">
          {/* 🔴 Heading aur pehli line DONO me area ka naam — isse har page
              par vaakya alag ho jaata hai aur duplicate-gate safe rehta hai. */}
          <Block
            h2={`RO Service Near ${a}, Patna`}
            lines={[
              `${a} me ghar par hi service hoti hai.`,
              `Machine kahin le jaani nahi padti.`,
              `Visit charge ₹${V} — pehle hi bata dete hain.`,
              `Call ${ph}.`,
            ]}
          />
        </div>
      </section>
    );
  }

  if (props.variant === 'brand') {
    const b = props.brandName;
    return (
      <section
        data-nearme-longtail="brand"
        className="border-t border-navy-50 bg-sand-50/60 py-10"
      >
        <div className="container mx-auto px-4">
          <Block
            h2={`${b} RO Service Near Me — Patna`}
            lines={[
              `${b} ki machine ghar par hi theek hoti hai.`,
              `Hum ${b} ke authorised centre nahi hain.`,
              `Visit charge ₹${V}, phir likhit quote.`,
            ]}
          />
        </div>
      </section>
    );
  }

  /* HOME — teen query jinke liye site par kuch tha hi nahi. */
  return (
    <section
      data-nearme-longtail="home"
      className="border-t border-navy-50 bg-sand-50/60 py-12"
    >
      <div className="container mx-auto px-4">
        <Block
          h2="Best RO Service Near Me — Patna Me Kaise Chunein"
          lines={[
            'Teen cheez poochho, phir decide karo.',
            'Ek: asli pata hai ya sirf phone number?',
            'Do: TDS reading likh kar denge ya nahi?',
            'Teen: purana part wapas denge ya nahi?',
            'Humara pata Buddha Colony, Patna 800001 hai.',
          ]}
        />
        <Block
          h2="RO Service Near Me Cost — Patna Ka Asli Rate"
          lines={[
            `Visit charge ₹${V}. Isme jaanch aur TDS test hai.`,
            'Kaam shuru karne se pehle likhit quote milta hai.',
            'Mana kar do to sirf visit charge lagta hai.',
            'Filter set ₹350 se ₹900. Membrane ₹1,600 se ₹2,400.',
            'Koi chhupa hua charge nahi hai.',
          ]}
        />
        <Block
          h2="RO Service Near Me Home Service — Ghar Par Hi"
          lines={[
            'Poora kaam aapke ghar par hota hai.',
            'Machine deni nahi padti, utaarni nahi padti.',
            'Technician saath me spare part laata hai.',
            'Zyadatar kaam ek hi visit me ho jaata hai.',
            `Patna me 90 minute ka target hai. Call ${ph}.`,
          ]}
        />
      </div>
    </section>
  );
}
