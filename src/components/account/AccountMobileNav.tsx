'use client';

/**
 * Mobile section switcher — horizontal scroller pinned under the header.
 *
 * A vertical sidebar on a 360px phone would push the actual content two
 * screens down. Every large Indian retailer solves this the same way: a
 * scrollable chip row. The active chip auto-scrolls into view so the user
 * never loses their place after navigating.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { buildGroups } from './AccountNav';

export default function AccountMobileNav({
  badges = {},
}: {
  badges?: Parameters<typeof buildGroups>[0];
}) {
  const pathname = usePathname();
  const items = buildGroups(badges).flatMap((g) => g.items);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [pathname]);

  return (
    <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 py-4 lg:hidden">
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            ref={active ? activeRef : undefined}
            aria-current={active ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              active
                ? 'bg-navy-700 text-white shadow-card'
                : 'bg-white text-navy-700 ring-1 ring-navy-100'
            }`}
          >
            <span className={active ? 'text-gold-300' : 'text-aqua-600'}>{it.icon}</span>
            {it.label}
            {it.badge != null && it.badge > 0 && (
              <span
                className={`tnum rounded-full px-1.5 text-[11px] font-bold ${
                  active ? 'bg-white/20' : 'bg-aqua-50 text-aqua-700'
                }`}
              >
                {it.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
