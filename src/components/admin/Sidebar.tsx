'use client';

/**
 * AdminSidebar — single source of truth for admin navigation + RBAC visibility.
 *
 * Adding a new admin section = add one entry to NAV_SECTIONS and create the
 * matching folder under src/app/admin/(dashboard)/. Protection is inherited
 * from the layout, so no per-page auth code is ever needed.
 */
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BRAND } from '@/lib/constants';

type Role = 'STAFF' | 'ADMIN' | 'SUPER_ADMIN' | string;

interface NavItem {
  label: string;
  href: string;
  icon: string;            // emoji keeps the bundle tiny; swap for lucide in prod
  roles?: Role[];          // undefined = visible to all admin roles
  badgeKey?: 'pendingServices' | 'newOrders' | 'lowStock';
}

interface NavSection { title: string; items: NavItem[] }

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: '📊' }],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Products',   href: '/admin/products',   icon: '📦' },
      { label: 'Categories', href: '/admin/categories', icon: '🗂️' },
      { label: 'Inventory',  href: '/admin/inventory',  icon: '🏷️', badgeKey: 'lowStock' },
      { label: 'Images',     href: '/admin/media',      icon: '🖼️' },
    ],
  },
  {
    title: 'Sales (Pan-India)',
    items: [
      { label: 'Orders',          href: '/admin/orders',           icon: '🧾', badgeKey: 'newOrders' },
      { label: 'Abandoned Carts', href: '/admin/abandoned-carts',  icon: '🛒' },
      
    ],
  },
  {
    title: 'Service (Patna)',
    items: [
      { label: 'Service Requests', href: '/admin/service-requests', icon: '🔧', badgeKey: 'pendingServices' },
      { label: 'AMC Contracts',    href: '/admin/amc',              icon: '📋' },
      { label: 'Technicians',      href: '/admin/technicians',      icon: '👷' },

    ],
  },
  {
    title: 'Customers',
    items: [
      { label: 'CRM / Customers', href: '/admin/customers', icon: '👥' },
    ],
  },
  {
    title: 'Growth',
    items: [
      { label: 'SEO Manager', href: '/admin/seo', icon: '🔍', roles: ['ADMIN', 'SUPER_ADMIN'] },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings',   href: '/admin/settings',   icon: '⚙️', roles: ['ADMIN', 'SUPER_ADMIN'] },

    ],
  },
];

interface Props {
  role: Role;
  badges?: Partial<Record<NonNullable<NavItem['badgeKey']>, number>>;
}

export default function AdminSidebar({ role, badges = {} }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visible = (item: NavItem) => !item.roles || item.roles.includes(role);
  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-navy-600/40 px-5">
        <Image src={BRAND.logo} alt={BRAND.name} width={130} height={32}
          className="h-8 w-auto brightness-0 invert" />
        <span className="rounded bg-aqua-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-aqua-300">
          Admin
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter(visible);
          if (!items.length) return null;
          return (
            <div key={section.title} className="mb-5">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-navy-300">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = isActive(item.href);
                  const count = item.badgeKey ? badges[item.badgeKey] : undefined;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={[
                          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                          active
                            ? 'bg-aqua-500 text-white shadow-sm'
                            : 'text-navy-100 hover:bg-navy-600/60 hover:text-white',
                        ].join(' ')}
                      >
                        <span className="text-base leading-none">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {typeof count === 'number' && count > 0 && (
                          <span className={[
                            'min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold',
                            active ? 'bg-white text-aqua-700' : 'bg-cta-orange text-white',
                          ].join(' ')}>
                            {count > 99 ? '99+' : count}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-navy-600/40 p-3">
        <Link href="/" target="_blank"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy-200 hover:bg-navy-600/60 hover:text-white">
          🌐 View storefront ↗
        </Link>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] bg-navy-700 lg:block">
        {nav}
      </aside>

      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin menu"
        className="fixed bottom-5 left-5 z-40 rounded-full bg-navy-700 p-4 text-white shadow-xl lg:hidden"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[270px] bg-navy-700">{nav}</aside>
        </div>
      )}
    </>
  );
}
