import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT, SERVICE } from '@/lib/constants';
import { faqSchema, localBusinessSchema, jsonLd } from '@/lib/seo/schema';
import FaqAccordion from '@/components/home/FaqAccordion';
import AmcPurchaseForm from '@/components/home/AmcPurchaseForm';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'RO AMC Plans in Patna — From ₹1,499/Year',
  description:
    'Annual Maintenance Contract for your RO purifier in Patna. Scheduled filter changes, priority service, discounted parts. Plans from ₹1,499. Call 8969821440.',
  keywords: ['RO AMC Patna', 'water purifier AMC', 'RO annual maintenance Patna', 'RO service plan Patna'],
  alternates: { canonical: '/amc-plans' },
};

const PLANS = [
  {
    key: 'BASIC',
    name: 'Basic',
    price: 1499,
    popular: false,
    visits: 2,
    features: [
      '2 scheduled service visits',
      'Sediment + carbon filter change',
      'Free TDS testing',
      'Priority booking',
      '10% off on extra parts',
    ],
    excludes: ['RO membrane', 'Pump / SMPS'],
  },
  {
    key: 'GOLD',
    name: 'Gold',
    price: 2799,
    popular: true,
    visits: 4,
    features: [
      '4 scheduled service visits',
      'All pre-filters included',
      'UV lamp replacement included',
      'Free TDS testing every visit',
      'Priority same-day response',
      '15% off on extra parts',
      'Zero visit charge all year',
    ],
    excludes: ['RO membrane'],
  },
  {
    key: 'PLATINUM',
    name: 'Platinum',
    price: 4499,
    popular: false,
    visits: 4,
    features: [
      '4 scheduled service visits',
      'All filters + RO membrane included',
      'UV lamp + pump coverage',
      'Unlimited breakdown visits',
      'Free TDS testing every visit',
      'Emergency 2-hour response',
      '20% off on any extra parts',
      'Zero visit charge all year',
    ],
    excludes: [],
  },
];

const FAQS = [
  {
    q: 'What is an RO AMC and do I need one?',
    a: `An Annual Maintenance Contract covers scheduled servicing of your water purifier for a full year. It makes sense if your area has high TDS — like Danapur or Saguna More where filters clog faster — because individual filter changes across a year usually cost more than the plan.`,
  },
  {
    q: 'Which areas of Patna do AMC plans cover?',
    a: 'All areas we service: Kankarbagh, Boring Road, Patliputra, Rajendra Nagar, Bailey Road, Danapur and surrounding localities. Same coverage as our regular service.',
  },
  {
    q: 'What if my machine breaks between scheduled visits?',
    a: `Gold and Platinum plans include zero visit charge for breakdown calls. On Basic you pay only the ₹${SERVICE.visitCharge} visit charge, and parts are discounted 10%.`,
  },
  {
    q: 'Does the AMC cover all brands?',
    a: 'Yes — Kent, Aquaguard, Livpure, Pureit, AO Smith, Blue Star, Havells and locally assembled units are all covered.',
  },
  {
    q: 'How do I pay for an AMC plan?',
    a: 'Pay after the first service visit — cash, UPI or card. No advance payment needed to start.',
  },
];

export default function AmcPlansPage() {
  return (
    <>
      <script {...jsonLd([localBusinessSchema(), faqSchema(FAQS)])} />

      <main className="bg-white">
        <nav aria-label="Breadcrumb" className="border-b border-navy-50 bg-navy-50/50">
          <ol className="container mx-auto flex gap-2 px-4 py-3 text-sm">
            <li><Link href="/" className="text-navy-600 hover:text-aqua-600">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-muted">AMC Plans</li>
          </ol>
        </nav>

        <section className="bg-[linear-gradient(115deg,#0B2545_0%,#13315C_50%,#0E7490_100%)] py-14">
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
              RO Annual Maintenance Plans
              <span className="mt-2 block text-aqua-300">Patna — from ₹1,499/year</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-navy-100">
              Scheduled servicing so your purifier never breaks down unexpectedly.
              Cheaper than paying for filter changes one by one.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-3">
              {PLANS.map((p) => (
                <div
                  key={p.name}
                  className={`relative rounded-2xl border-2 p-6 ${
                    p.popular ? 'border-aqua-500 shadow-card-hover' : 'border-navy-100'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cta-orange px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      Most Popular
                    </span>
                  )}

                  <h2 className="font-display text-xl font-bold text-navy-700">{p.name}</h2>
                  <p className="mt-2">
                    <span className="font-display text-3xl font-extrabold text-navy-700">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm text-muted"> / year</span>
                  </p>
                  <p className="mt-1 text-sm text-muted">{p.visits} scheduled visits</p>

                  <ul className="mt-5 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-navy-600">
                        <span className="text-cta-green">✓</span> {f}
                      </li>
                    ))}
                    {p.excludes.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-slate-400">
                        <span>✕</span> {f} not included
                      </li>
                    ))}
                  </ul>

                  <AmcPurchaseForm
                    planKey={p.key}
                    planName={`${p.name} AMC`}
                    price={p.price}
                    visits={p.visits}
                    popular={p.popular}
                  />
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl bg-navy-50 p-6 text-center">
              <p className="font-bold text-navy-700">Not sure which plan fits your machine?</p>
              <p className="mt-1 text-sm text-muted">
                Tell us your brand, model and area — we&apos;ll recommend the right one.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <a href={CONTACT.primaryTel} className="rounded-xl bg-cta-green px-6 py-3 font-bold text-white hover:bg-cta-greenDark">
                  📞 {CONTACT.primaryPhone}
                </a>
                <a
                  href={CONTACT.whatsappLink('Hi, which AMC plan is right for my RO?')}
                  target="_blank" rel="noopener noreferrer"
                  className="rounded-xl border border-navy-200 bg-white px-6 py-3 font-bold text-navy-700 hover:bg-navy-50"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        <FaqAccordion faqs={FAQS} title="AMC Plans — Questions" />
      </main>
    </>
  );
}
