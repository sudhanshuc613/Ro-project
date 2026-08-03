import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND, CONTACT, SERVICE, SHIPPING } from '@/lib/constants';
import { localBusinessSchema, jsonLd } from '@/lib/seo/schema';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Contact Us — AquaNexa Patna',
  description: `Call ${CONTACT.primaryPhone} or ${CONTACT.secondaryPhone} for RO service in Patna or orders across India. Open ${CONTACT.hours}.`,
  alternates: { canonical: '/contact' },
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
          <h1 className="font-display text-3xl font-extrabold text-navy-700">Contact AquaNexa</h1>
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
            <h2 className="font-display font-bold text-navy-700">Visit or write to us</h2>
            <address className="mt-2 not-italic text-navy-600">
              {BRAND.legalName}<br />
              {CONTACT.address.street}, {CONTACT.address.locality}<br />
              {CONTACT.address.city}, {CONTACT.address.state} — {CONTACT.address.pincode}<br />
              <a href={`mailto:${CONTACT.email}`} className="text-aqua-600 hover:underline">{CONTACT.email}</a>
            </address>
            <p className="mt-3 text-sm font-semibold text-navy-700">🕒 {CONTACT.hours} · All 7 days</p>
          </div>

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
