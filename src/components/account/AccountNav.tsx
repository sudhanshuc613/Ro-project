'use client';

/**
 * Account sidebar navigation.
 *
 * ── WHY THIS SHAPE ────────────────────────────────────────────────────────
 * Studied Flipkart / Amazon / Myntra account pages and deliberately kept only
 * what earns its place for an RO business:
 *
 *   KEPT   Orders, Addresses, Wishlist, Reviews, Profile, Notifications
 *          — every large retailer has these because customers look for them.
 *
 *   ADDED  "My RO Machines" and "Service History" and "AMC Plans".
 *          Flipkart has no equivalent because they don't service what they
 *          sell. This is the whole differentiator: we know the customer's
 *          machine and when its filters are due.
 *
 *   CUT    SuperCoins, Gift Cards, Plus Zone, Saved Cards, Coupons.
 *          Owner's call and it is the right one — a loyalty-points economy
 *          needs scale to mean anything, and storing card details would drag
 *          in PCI-DSS obligations for zero benefit (Razorpay already vaults
 *          cards on their side). Empty reward screens actively erode trust.
 *
 * Groups are ordered service-first because that is where the revenue is.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Item {
  label: string;
  href: string;
  icon: React.ReactNode;
  desc: string;
  badge?: number;
}

interface Group {
  title: string;
  items: Item[];
}

const ic = (d: string) => (
  <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

export const ICONS = {
  home: 'M3.6 10.4 12 3.8l8.4 6.6V20a1 1 0 0 1-1 1h-4.6v-6H9.2v6H4.6a1 1 0 0 1-1-1v-9.6Z',
  wrench: 'M11.4 15.2 9 12.8m0 0a3.4 3.4 0 1 1 4.8-4.8l5.6 5.6-2.4 2.4-5.6-5.6M9 12.8 4.6 17.2a1.7 1.7 0 0 0 2.4 2.4L11.4 15.2',
  machine: 'M7 3.6h10v4.2H7V3.6Zm-1.4 4.2h12.8v12.6H5.6V7.8Zm3 4.2h6.8m-6.8 3.4h6.8',
  shield: 'M12 3.2 4.8 6v5.4c0 4.4 3 8.5 7.2 9.5 4.2-1 7.2-5.1 7.2-9.5V6L12 3.2Z',
  box: 'M3.2 7.6 12 12l8.8-4.4M12 12v9M20.8 7.6v8.8L12 21l-8.8-4.6V7.6L12 3l8.8 4.6Z',
  heart: 'M12 20.4 4.4 13a4.6 4.6 0 0 1 6.5-6.5l1.1 1.1 1.1-1.1A4.6 4.6 0 1 1 19.6 13L12 20.4Z',
  star: 'm12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8L12 3.6Z',
  pin: 'M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Zm0-8.4a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z',
  user: 'M12 12.4a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4ZM4.4 20.6a7.6 7.6 0 0 1 15.2 0',
  bell: 'M6.6 9.4a5.4 5.4 0 1 1 10.8 0c0 5 2 6.4 2 6.4H4.6s2-1.4 2-6.4ZM10 19.4a2.2 2.2 0 0 0 4 0',
} as const;

export function buildGroups(badges: {
  services?: number; machines?: number; orders?: number;
  wishlist?: number; reviews?: number; addresses?: number; unread?: number;
}): Group[] {
  return [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: '/account', icon: ic(ICONS.home), desc: 'Everything at a glance' },
      ],
    },
    {
      title: 'Service',
      items: [
        { label: 'Service History', href: '/account/services', icon: ic(ICONS.wrench), desc: 'Past & live repairs', badge: badges.services },
        { label: 'My RO Machines', href: '/account/machines', icon: ic(ICONS.machine), desc: 'Filter age & TDS', badge: badges.machines },
        { label: 'AMC Plans', href: '/account/amc', icon: ic(ICONS.shield), desc: 'Your maintenance cover' },
      ],
    },
    {
      title: 'Shopping',
      items: [
        { label: 'My Orders', href: '/account/orders', icon: ic(ICONS.box), desc: 'Track & invoices', badge: badges.orders },
        { label: 'Wishlist', href: '/account/wishlist', icon: ic(ICONS.heart), desc: 'Saved for later', badge: badges.wishlist },
        { label: 'My Reviews', href: '/account/reviews', icon: ic(ICONS.star), desc: 'Rate what you bought', badge: badges.reviews },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Addresses', href: '/account/addresses', icon: ic(ICONS.pin), desc: 'Delivery & service', badge: badges.addresses },
        { label: 'Profile', href: '/account/profile', icon: ic(ICONS.user), desc: 'Name, email, password' },
        { label: 'Notifications', href: '/account/notifications', icon: ic(ICONS.bell), desc: 'WhatsApp & alerts', badge: badges.unread },
      ],
    },
  ];
}

export default function AccountNav({
  badges = {},
}: {
  badges?: Parameters<typeof buildGroups>[0];
}) {
  const pathname = usePathname();
  const groups = buildGroups(badges);

  return (
    <nav aria-label="Account sections" className="space-y-5">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            {g.title}
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {g.items.map((it) => {
              const active = pathname === it.href;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={active ? 'page' : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                      active
                        ? 'bg-navy-700 text-white shadow-card'
                        : 'text-navy-700 hover:bg-white hover:shadow-card'
                    }`}
                  >
                    <span className={active ? 'text-gold-300' : 'text-aqua-600'}>{it.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{it.label}</span>
                      <span className={`block truncate text-[11px] ${active ? 'text-navy-200' : 'text-muted'}`}>
                        {it.desc}
                      </span>
                    </span>
                    {it.badge != null && it.badge > 0 && (
                      <span
                        className={`tnum shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          active ? 'bg-white/20 text-white' : 'bg-aqua-50 text-aqua-700'
                        }`}
                      >
                        {it.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
