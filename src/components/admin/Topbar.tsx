'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { CONTACT } from '@/lib/constants';

interface Props {
  user: { name?: string | null; role?: string; phone?: string };
}

export default function Topbar({ user }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (user.name ?? 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="hidden flex-1 md:block">
        <input
          type="search"
          placeholder="Search orders, products, customers, tickets…"
          className="w-full max-w-md rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <a
          href={CONTACT.primaryTel}
          className="hidden rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 sm:block"
        >
          📞 {CONTACT.primaryPhone}
        </a>

        <Link
          href="/admin/service-requests"
          className="rounded-lg p-2 text-lg hover:bg-slate-100"
          aria-label="Service requests"
        >
          🔔
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"
            aria-expanded={menuOpen}
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-aqua-500 text-xs font-bold text-white">
              {initials}
            </span>
            <span className="hidden text-left text-xs leading-tight md:block">
              <span className="block font-bold text-navy-700">{user.name}</span>
              <span className="block text-muted">{user.role}</span>
            </span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-card-hover">
                <Link href="/admin/settings" className="block rounded-lg px-3 py-2 text-sm text-navy-700 hover:bg-slate-50">
                  ⚙️ Settings
                </Link>
                <Link href="/" target="_blank" className="block rounded-lg px-3 py-2 text-sm text-navy-700 hover:bg-slate-50">
                  🌐 View storefront
                </Link>
                <hr className="my-1.5 border-slate-100" />
                <button
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
