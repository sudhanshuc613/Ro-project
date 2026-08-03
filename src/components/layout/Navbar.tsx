'use client';

/**
 * Navbar — sticky, 3-tier (top strip → main bar → category bar).
 * Includes: logo, smart autosuggest search, mega-menu dropdowns,
 * "Book Service" CTA, account menu, cart badge, mobile drawer.
 */
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND, CONTACT, PRODUCT_TYPES } from '@/lib/constants';
import { useCartStore } from '@/store/cart';
import SearchAutosuggest from './SearchAutosuggest';

const MEGA_MENU: Record<string, { heading: string; links: { label: string; href: string }[] }[]> = {
  'New RO': [
    { heading: 'By Type', links: [
      { label: 'RO + UV + UF Purifiers', href: '/category/new-ro-purifiers?tech=RO,UV,UF' },
      { label: 'Alkaline & Copper', href: '/category/new-ro-purifiers?tech=ALKALINE,COPPER' },
      { label: 'Under-Sink Purifiers', href: '/category/new-ro-purifiers' },
      { label: 'Wall-Mounted', href: '/category/new-ro-purifiers' },
    ]},
    { heading: 'By Brand', links: [
      { label: 'Kent', href: '/service-patna/brand/kent' }, { label: 'Aquaguard', href: '/service-patna/brand/aquaguard' },
      { label: 'Livpure', href: '/service-patna/brand/livpure' }, { label: 'AquaNexa', href: '/category/new-ro-purifiers' },
    ]},
    { heading: 'By Budget', links: [
      { label: 'Under ₹8,000', href: '/category/new-ro-purifiers?price=0-8000' },
      { label: '₹8,000 – ₹15,000', href: '/category/new-ro-purifiers?price=8000-15000' },
      { label: 'Premium ₹15,000+', href: '/category/new-ro-purifiers?price=15000-' },
    ]},
  ],
  'Spare Parts': [
    { heading: 'Filtration', links: [
      { label: 'RO Membranes', href: '/category/ro-membranes' },
      { label: 'Sediment Filters', href: '/category/spare-parts' },
      { label: 'Carbon Filters', href: '/category/spare-parts' },
      { label: 'UV Lamps', href: '/category/spare-parts' },
    ]},
    { heading: 'Electricals', links: [
      { label: 'Booster Pumps', href: '/category/booster-pumps' },
      { label: 'SMPS & Adaptors', href: '/category/spare-parts' },
      { label: 'Solenoid Valves', href: '/category/spare-parts' },
    ]},
    { heading: 'Fittings', links: [
      { label: 'Filter Housings', href: '/category/spare-parts' },
      { label: 'Pipes & Connectors', href: '/category/spare-parts' },
      { label: 'Storage Tanks', href: '/category/spare-parts' },
    ]},
  ],
  'Commercial Plants': [
    { heading: 'By Capacity', links: [
      { label: '25–100 LPH', href: '/category/commercial-plants?capacity=25-100' },
      { label: '250–500 LPH', href: '/category/commercial-plants?capacity=250-500' },
      { label: '1000 LPH & above', href: '/category/commercial-plants?capacity=1000-' },
    ]},
    { heading: 'By Use Case', links: [
      { label: 'Hotels & Restaurants', href: '/category/commercial-plants' },
      { label: 'Schools & Offices', href: '/category/commercial-plants' },
      { label: 'Water Plants (ATM)', href: '/category/commercial-plants' },
    ]},
  ],
};

export default function Navbar() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hoverOpen = (k: string) => { clearTimeout(closeTimer.current); setOpenMenu(k); };
  const hoverClose = () => { closeTimer.current = setTimeout(() => setOpenMenu(null), 160); };

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow ${scrolled ? 'shadow-nav' : ''}`}>
      {/* ── Tier 1: announcement strip ── */}
      <div className="bg-navy-700 text-white">
        <div className="container mx-auto flex h-9 items-center justify-between px-4 text-xs">
          <p className="hidden sm:block">
            🔧 RO Service in Patna — Visit charge only ₹100 · Same-day visit
          </p>
          <p className="sm:hidden">RO Service Patna — ₹100 visit</p>
          <div className="flex items-center gap-4">
            <a href={CONTACT.primaryTel} className="font-semibold hover:text-aqua-300">
              📞 {CONTACT.primaryPhone}
            </a>
            <span className="hidden text-navy-200 md:inline">|</span>
            <Link href="/track-order" className="hidden hover:text-aqua-300 md:inline">Track Order</Link>
          </div>
        </div>
      </div>

      {/* ── Tier 2: main bar ── */}
      <div className="border-b border-navy-50">
        <div className="container mx-auto flex h-[70px] items-center gap-4 px-4">
          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu"
            className="rounded-lg p-2 text-navy-700 hover:bg-navy-50 lg:hidden">
            <Burger />
          </button>

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center" aria-label={`${BRAND.name} home`}>
            <Image src={BRAND.logo} alt={`${BRAND.name} logo`} width={168} height={44}
              priority className="h-9 w-auto object-contain sm:h-11" />
          </Link>

          {/* Smart search — desktop */}
          <div className="hidden flex-1 md:block">
            <SearchAutosuggest />
          </div>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link href="/#book-service"
              className="hidden items-center gap-2 rounded-xl bg-cta-green px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cta-greenDark sm:inline-flex"
              data-analytics="nav_book_service">
              <WrenchIcon /> Book Service
            </Link>

            <Link href="/account" className="flex items-center gap-2 rounded-xl px-3 py-2 text-navy-700 transition hover:bg-navy-50">
              <UserIcon />
              <span className="hidden text-left text-xs leading-tight lg:block">
                <span className="block text-muted">Account</span>
                <span className="block font-bold">Sign In</span>
              </span>
            </Link>

            <Link href="/cart" className="relative flex items-center gap-2 rounded-xl px-3 py-2 text-navy-700 transition hover:bg-navy-50" aria-label={`Cart, ${itemCount} items`}>
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute left-6 top-1 min-w-[19px] rounded-full bg-cta-orange px-1 text-center text-[11px] font-bold leading-[19px] text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
              <span className="hidden text-left text-xs leading-tight lg:block">
                <span className="block text-muted">My</span>
                <span className="block font-bold">Cart</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Search — mobile */}
        <div className="border-t border-navy-50 px-4 py-2.5 md:hidden">
          <SearchAutosuggest />
        </div>
      </div>

      {/* ── Tier 3: category bar with mega-menus ── */}
      <nav className="hidden border-b border-navy-50 bg-white lg:block" aria-label="Product categories">
        <div className="container mx-auto flex items-center gap-1 px-4">
          <Link href="/service-patna" className="px-4 py-3 text-sm font-bold text-cta-green hover:text-cta-greenDark">
            🔧 RO Service Patna
          </Link>
          <Link href="/amc-plans" className="px-4 py-3 text-sm font-bold text-navy-700 hover:text-aqua-600">
            AMC Plans
          </Link>
          <Link href="/products" className="px-4 py-3 text-sm font-bold text-navy-700 hover:text-aqua-600">
            Shop Products
          </Link>

          {Object.keys(MEGA_MENU).map((key) => (
            <div key={key} className="relative" onMouseEnter={() => hoverOpen(key)} onMouseLeave={hoverClose}>
              <button
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold transition ${
                  openMenu === key ? 'text-aqua-600' : 'text-navy-700 hover:text-aqua-600'
                }`}
                aria-expanded={openMenu === key} aria-haspopup="true"
              >
                {key} <ChevronDown className={openMenu === key ? 'rotate-180' : ''} />
              </button>

              {openMenu === key && (
                <div className="absolute left-0 top-full z-50 w-[620px] rounded-2xl border border-navy-50 bg-white p-6 shadow-card-hover">
                  <div className="grid grid-cols-3 gap-6">
                    {MEGA_MENU[key].map((col) => (
                      <div key={col.heading}>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-aqua-600">{col.heading}</p>
                        <ul className="space-y-2">
                          {col.links.map((l) => (
                            <li key={l.href}>
                              <Link href={l.href} className="block text-sm text-navy-600 transition hover:translate-x-0.5 hover:text-aqua-600">
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between rounded-xl bg-aqua-50 px-4 py-3">
                    <p className="text-sm font-semibold text-navy-700">Need help choosing the right purifier?</p>
                    <a href={CONTACT.primaryTel} className="rounded-lg bg-cta-green px-4 py-2 text-xs font-bold text-white hover:bg-cta-greenDark">
                      Talk to an expert
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}


          <span className="ml-auto flex items-center gap-2 py-3 text-xs font-semibold text-cta-orange">
            <SparkIcon /> Same-day service in Patna
          </span>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-white p-5">
            <div className="mb-6 flex items-center justify-between">
              <Image src={BRAND.logo} alt={BRAND.name} width={140} height={36} className="h-9 w-auto" />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="rounded-lg p-2 hover:bg-navy-50">
                <CloseIcon />
              </button>
            </div>

            <Link href="/#book-service" onClick={() => setMobileOpen(false)}
              className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-cta-green py-3.5 font-bold text-white">
              <WrenchIcon /> Book RO Service — ₹100
            </Link>

            {PRODUCT_TYPES.map((t) => (
              <Link key={t.key} href={t.href} onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between border-b border-navy-50 py-3.5 font-semibold text-navy-700">
                {t.label} <ChevronRight />
              </Link>
            ))}
            <Link href="/service-patna" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between border-b border-navy-50 py-3.5 font-semibold text-navy-700">
              RO Service in Patna <ChevronRight />
            </Link>
            <Link href="/amc-plans" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between border-b border-navy-50 py-3.5 font-semibold text-navy-700">
              AMC Plans <ChevronRight />
            </Link>

            <div className="mt-6 space-y-2 rounded-xl bg-navy-50 p-4">
              <p className="text-xs font-bold uppercase text-muted">Talk to us</p>
              <a href={CONTACT.primaryTel} className="block font-bold text-navy-700">📞 {CONTACT.primaryPhone}</a>
              <a href={CONTACT.secondaryTel} className="block font-bold text-navy-700">📞 {CONTACT.secondaryPhone}</a>
              <a href={CONTACT.whatsappLink()} className="block font-bold text-emerald-700">💬 WhatsApp Chat</a>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────────── */
const Burger = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const CloseIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const UserIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.1a8.25 8.25 0 0115 0" /></svg>;
const CartIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.4c.5 0 .94.35 1.05.84L5.4 6m0 0l1.7 7.9c.11.5.55.85 1.06.85h8.3c.5 0 .93-.34 1.05-.83l1.6-6.6a.75.75 0 00-.73-.93H5.4zM8.25 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm10.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>;
const WrenchIcon = () => <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.5 2a4.5 4.5 0 00-4.24 6L3.3 14.96a1.5 1.5 0 002.12 2.12l6.96-6.96A4.5 4.5 0 1014.5 2z" clipRule="evenodd" /></svg>;
const SparkIcon = () => <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 1l2.2 5.3L18 8l-5.8 1.7L10 15l-2.2-5.3L2 8l5.8-1.7L10 1z" /></svg>;
const ChevronDown = ({ className = '' }) => <svg className={`h-4 w-4 transition-transform ${className}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>;
const ChevronRight = () => <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 5l7 7-7 7" /></svg>;
