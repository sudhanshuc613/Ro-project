import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND, CONTACT, SERVICE, SHIPPING } from '@/lib/constants';
import { localBusinessSchema, jsonLd } from '@/lib/seo/schema';
import { ogImage } from '@/lib/seo/og-image';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Contact Us — Aqua Perl Patna',
  description: `Call ${CONTACT.primaryPhone} or ${CONTACT.secondaryPhone} for RO service in Patna or orders across India. Open ${CONTACT.hours}.`,
  alternates: { canonical: '/contact' },
  /* 30 Sep 2026 — dekho amc-plans wali wajah. */
  openGraph: {
    title: 'Contact Us — Aqua Perl Patna',
    description: `Call ${CONTACT.primaryPhone} for RO service in Patna or orders across India.`,
    url: `${BRAND.url}/contact`,
    type: 'website',
    images: ogImage(),
  },
};

const POLICIES = [
  {
    title: 'Shipping',
    points: [
      `Free delivery across India on orders above ₹${SHIPPING.freeAbove.toLocaleString('en-IN')}`,
      `Flat ₹${SHIPPING.flatRate} shipping below that`,
      'Standard delivery 3–7 business days',
      'Patna orders usually delivered in 2 days',
    ],
  },
  {
    title: 'Returns & Refunds',
    points: [
      '7-day return window on unused products in original packaging',
      'Damaged-in-transit items replaced free',
      'Refunds processed within 5–7 working days of pickup',
      'Installed products cannot be returned, but are covered by warranty',
    ],
  },
  {
    title: 'Warranty',
    points: [
      'Manufacturer warranty on all new purifiers (12–24 months)',
      `${SERVICE.warrantyDays}-day service warranty on every repair`,
      'Spare parts carry 6–12 month warranty depending on component',
      'Warranty void if serviced by an unauthorised technician',
    ],
  },
  {
    title: 'Privacy',
    points: [
      'We collect only name, phone and address needed to fulfil your order or service',
      'Your number is never sold or shared with third parties',
      'WhatsApp updates can be stopped any time by replying STOP',
      'Payment details are handled by the gateway — we never store card data',
    ],
  },
];

export default function ContactPage() {
  return (
    <>
      <script {...jsonLd(localBusinessSchema())} />

      <main className="bg-white">
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex gap-2 px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">Contact</li>
          </ol>
        </nav>

        <div className="container mx-auto px-4 py-12">
          <h1 className="font-display text-3xl font-extrabold text-navy-700">Contact Aqua Perl</h1>
          <p className="mt-2 max-w-2xl text-muted">
            RO service in Patna, or orders anywhere in India — call us, we answer.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <a href={CONTACT.primaryTel} className="rounded-2xl border border-navy-100 p-6 transition hover:border-aqua-400 hover:shadow-card">
              <p className="text-2xl">📞</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted">Primary line</p>
              <p className="font-display text-xl font-extrabold text-navy-700">{CONTACT.primaryPhone}</p>
            </a>

            <a href={CONTACT.secondaryTel} className="rounded-2xl border border-navy-100 p-6 transition hover:border-aqua-400 hover:shadow-card">
              <p className="text-2xl">📞</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted">Secondary line</p>
              <p className="font-display text-xl font-extrabold text-navy-700">{CONTACT.secondaryPhone}</p>
            </a>

            <a href={CONTACT.whatsappLink()} target="_blank" rel="noopener noreferrer"
               className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 transition hover:shadow-card">
              <p className="text-2xl">💬</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-emerald-700">WhatsApp</p>
              <p className="font-display text-xl font-extrabold text-emerald-800">Chat now</p>
            </a>
          </div>

          <div className="mt-8 rounded-2xl bg-navy-50 p-6">
            <h2 className="font-display font-bold text-navy-700">Where we work</h2>
            <address className="mt-2 not-italic text-navy-600">
              {BRAND.legalName}<br />
              {CONTACT.showStreetAddress && <>{CONTACT.address.street}, </>}
              {CONTACT.address.locality}<br />
              {CONTACT.address.city}, {CONTACT.address.state} — {CONTACT.address.pincode}<br />
              {CONTACT.emailWorks && (
                <a href={`mailto:${CONTACT.email}`} className="text-aqua-600 hover:underline">{CONTACT.email}</a>
              )}
            </address>
            <p className="mt-3 text-sm font-semibold text-navy-700">🕒 {CONTACT.hours} · All 7 days</p>
            <p className="mt-3 text-sm text-navy-600">
              Service ke liye aana zaroori nahi — hum aapke ghar aate hain,
              poore Patna mein. Naya purifier ya spare part dekhna ho to
              upar wale pate par aa sakte hain.
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${CONTACT.address.street}, ${CONTACT.address.locality}, ${CONTACT.address.city} ${CONTACT.address.pincode}`,
              )}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-aqua-600 hover:underline"
            >
              📍 Google Maps par kholo
            </a>
          </div>

          {/* ── 10 Oct 2026 — NAYA BLOCK (kuch hataya nahi, sirf joda) ────────
              Wajah: live audit me /contact sabse kamzor page tha — 523 word
              aur sirf 2 H2. Contact page local SEO ka NAP page hota hai;
              Google isi se naam-pata-phone ki consistency jaanchta hai.
              Yahan jo sawaal hain wo woh hain jo phone par roz poochhe jaate
              hain, isliye ye content asli kaam ka hai, bharti ka nahi. */}
          <h2 className="mt-12 font-display text-2xl font-bold text-navy-700">
            Call Karne Se Pehle Ye 4 Cheez Taiyaar Rakhein
          </h2>
          <p className="mt-2 text-navy-600">
            Phone par pehle hi ye bata dene se technician sahi part leke nikalta hai aur
            kaam ek hi visit me ho jaata hai. Doosri visit ka koi charge nahi lagta, par
            aapka din bach jaata hai.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              {
                t: '1. Machine ka brand aur model',
                d: 'Machine ke peeche ya side me sticker lagi hoti hai. Kent, Aquaguard, Pureit, Livpure, AO Smith, Nasaka ya locally assembled — model number bhi mil jaye to aur achha. Isse pata chal jaata hai ki kaun sa filter housing lagta hai.',
              },
              {
                t: '2. Dikkat kya hai, apne shabdon me',
                d: 'Paani bilkul nahi aa raha, dheema aa raha hai, swad badal gaya, leak ho raha hai, ya machine band hi nahi hoti — jo dikh raha hai wahi bata dijiye. Technical naam jaanna zaroori nahi.',
              },
              {
                t: '3. Aakhri service kab hui thi',
                d: 'Yaad na ho to "lagbhag" bata dijiye. 6 mahine se zyada ho gaye to filter ki ummeed rakhiye; 18 mahine se upar ho to membrane bhi dekhna padega.',
              },
              {
                t: '4. Pata aur landmark',
                d: `${CONTACT.address.city} me gali ka naam Google Maps par kabhi-kabhi galat dikhta hai. Nazdeeki dukaan, school ya mandir ka naam bata dijiye — technician seedha pahunch jayega.`,
              },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-navy-100 p-5">
                <h3 className="font-display text-base font-bold text-navy-700">{x.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{x.d}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 font-display text-2xl font-bold text-navy-700">
            Phone, WhatsApp Ya Form — Kaunsa Kab
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              {
                t: '📞 Phone',
                w: 'Aaj hi technician chahiye',
                d: `Sabse tez. ${CONTACT.hours} ke beech call uthti hai. Patna me technician aam taur par ${SERVICE.responseTime} me pahunch jaata hai, aur visit charge ₹${SERVICE.visitCharge} fixed hai — usme poori checking aur TDS test shaamil hai.`,
              },
              {
                t: '💬 WhatsApp',
                w: 'Machine ka photo bhejna hai',
                d: 'Leak kahan se ho raha hai, ya kaun sa part kharab dikh raha hai — photo bhej dijiye. Aadha diagnosis phone par hi ho jaata hai aur technician sahi spare leke aata hai.',
              },
              {
                t: '🧾 Booking form',
                w: 'Raat ko ya baad me baat karni hai',
                d: `Form bharke chhod dijiye — subah ${CONTACT.hours.split('–')[0].replace('Mon–Sun ', '')} ke baad call aayegi. Order ya spare part ke liye bhi yahi theek hai.`,
              },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl bg-navy-50 p-5">
                <p className="text-lg font-bold text-navy-700">{x.t}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-aqua-700">{x.w}</p>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{x.d}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 font-display text-2xl font-bold text-navy-700">
            Patna Ke Kaunse Area Me Hum Aate Hain
          </h2>
          <p className="mt-2 text-navy-600">
            Buddha Colony hamara base hai. Wahan se {SERVICE.city} ke lagbhag har mohalle tak
            usi din pahunchte hain — Kankarbagh, Boring Road, Patliputra, Rajendra Nagar,
            Bailey Road, Danapur, Kadamkuan, Gardanibagh, Ashok Rajpath, Rukanpura,
            Khagaul, Phulwari Sharif aur beech ke saare chhote mohalle. Shahar se 25 km
            se zyada door (Fatuha, Bihta, Punpun, Naubatpur taraf) abhi service nahi dete —
            jhooth bolne se achha hai pehle hi bata dena.
          </p>
          <p className="mt-3 text-sm text-navy-600">
            Apne area ka TDS, aam dikkat aur rate dekhna ho to{' '}
            <Link href="/ro-service-patna" className="font-semibold text-aqua-600 hover:underline">
              area-wise RO service page
            </Link>{' '}
            kholiye — har mohalle ka apna page hai.
          </p>

          <h2 className="mt-12 font-display text-2xl font-bold text-navy-700">Policies</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {POLICIES.map((p) => (
              <section key={p.title} id={p.title.toLowerCase().split(' ')[0]} className="rounded-2xl border border-navy-100 p-6">
                <h3 className="font-display text-lg font-bold text-navy-700">{p.title}</h3>
                <ul className="mt-3 space-y-2">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-2 text-sm text-navy-600">
                      <span className="text-aqua-500">•</span> {pt}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
