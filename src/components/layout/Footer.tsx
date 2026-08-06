import Link from 'next/link';
import Image from 'next/image';
import { BRAND, CONTACT } from '@/lib/constants';

const SHOP = [
  { label: 'New RO Purifiers', href: '/category/new-ro-purifiers' },
  { label: 'Spare Parts', href: '/category/spare-parts' },
  { label: 'Commercial Plants', href: '/category/commercial-plants' },
  { label: 'Accessories', href: '/category/accessories' },
  { label: 'AMC Plans', href: '/amc-plans' },
];

// Local-SEO internal links — every one is an indexable service page
const AREAS = [
  { label: 'RO Service Kankarbagh', href: '/service-patna/kankarbagh' },
  { label: 'RO Service Boring Road', href: '/service-patna/boring-road' },
  { label: 'RO Service Patliputra', href: '/service-patna/patliputra-colony' },
  { label: 'RO Service Rajendra Nagar', href: '/service-patna/rajendra-nagar' },
  { label: 'RO Service Danapur', href: '/service-patna/danapur' },
];

const BRANDS = [
  { label: 'Kent RO Service', href: '/service-patna/brand/kent' },
  { label: 'Aquaguard Service', href: '/service-patna/brand/aquaguard' },
  { label: 'Livpure Service', href: '/service-patna/brand/livpure' },
  { label: 'Pureit Service', href: '/service-patna/brand/pureit' },
  { label: 'AO Smith Service', href: '/service-patna/brand/ao-smith' },
];

const SUPPORT = [
  { label: 'Track Your Order', href: '/track-order' },
  { label: 'Shipping Policy', href: '/contact' },
  { label: 'Returns & Refunds', href: '/contact' },
  { label: 'Warranty Terms', href: '/contact' },
  { label: 'Privacy Policy', href: '/contact' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Footer() {
  return (
    <footer className="bg-navy-700 text-navy-100">
      <div className="container mx-auto px-4 pt-14">
        <div className="grid gap-9 pb-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand + contact */}
          <div className="lg:col-span-1">
            <Image
              src={BRAND.logo}
              alt={BRAND.name}
              width={150}
              height={38}
              className="h-9 w-auto brightness-0 invert"
            />
            <p className="mt-4 text-sm leading-relaxed text-navy-200">
              Pan-India e-commerce for RO purifiers, commercial plants and genuine spare parts —
              plus expert doorstep RO repair and installation across Patna, Bihar.
            </p>

            <div className="mt-5 rounded-xl border border-aqua-500/30 bg-aqua-500/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-aqua-300">
                Service Helpline (Patna)
              </p>
              <a href={CONTACT.primaryTel} className="mt-1 block font-display text-lg font-extrabold text-white hover:text-aqua-300">
                {CONTACT.primaryPhone}
              </a>
              <a href={CONTACT.secondaryTel} className="block font-display text-lg font-extrabold text-white hover:text-aqua-300">
                {CONTACT.secondaryPhone}
              </a>
              <p className="mt-1 text-xs text-navy-200">{CONTACT.hours}</p>
            </div>
          </div>

          <FooterCol title="Shop" links={SHOP} />
          <FooterCol title="RO Service in Patna" links={AREAS} />
          <FooterCol title="Brands We Repair" links={BRANDS} />
          <FooterCol title="Support" links={SUPPORT} />
        </div>

        {/* Local business info block — reinforces NAP consistency for local SEO */}
        <div className="border-t border-white/10 py-6 text-sm">
          <p className="font-semibold text-white">{BRAND.legalName}</p>
          <address className="mt-1 not-italic text-navy-200">
            {CONTACT.showStreetAddress && <>{CONTACT.address.street}, </>}
            {CONTACT.address.locality}, {CONTACT.address.city},{' '}
            {CONTACT.address.state} {CONTACT.address.pincode}
            {CONTACT.emailWorks && <> · {CONTACT.email}</>}
          </address>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-navy-200">
          <span>© {new Date().getFullYear()} {BRAND.name} · {BRAND.domain} — All rights reserved.</span>
          <span>Made for clean water 💧 Patna, Bihar</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-white">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-navy-200 transition hover:text-aqua-300">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
