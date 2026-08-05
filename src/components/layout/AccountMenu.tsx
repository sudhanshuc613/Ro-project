'use client';

/**
 * Navbar account control.
 *
 * Signed out → plain "Sign In" link.
 * Signed in  → hover/click dropdown, the pattern every large Indian retailer
 *              uses because it puts Orders one click from any page.
 *
 * Hover-open has a 160 ms close delay so the pointer can cross the gap
 * between trigger and panel without the menu snapping shut — the single most
 * common flaw in hand-rolled dropdowns.
 */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

const LINKS = [
  { href: '/account', label: 'Dashboard', icon: '📊' },
  { href: '/account/orders', label: 'My Orders', icon: '📦' },
  { href: '/account/services', label: 'Service History', icon: '🔧' },
  { href: '/account/machines', label: 'My RO Machines', icon: '🚰' },
  { href: '/account/wishlist', label: 'Wishlist', icon: '🤍' },
  { href: '/account/addresses', label: 'Addresses', icon: '📍' },
  { href: '/account/profile', label: 'Profile', icon: '👤' },
];

function UserIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.4a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4ZM4.4 20.6a7.6 7.6 0 0 1 15.2 0" />
    </svg>
  );
}

export default function AccountMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  // Avoid a flash of "Sign In" before the session resolves.
  if (status === 'loading') {
    return <span className="h-9 w-9 animate-pulse rounded-xl bg-navy-50" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-navy-700 transition hover:bg-navy-50"
      >
        <UserIcon />
        <span className="hidden text-left text-xs leading-tight lg:block">
          <span className="block text-muted">Account</span>
          <span className="block font-bold">Sign In</span>
        </span>
      </Link>
    );
  }

  const first = (session.user.name ?? 'Account').split(' ')[0];

  return (
    <div
      ref={wrap}
      className="relative"
      onMouseEnter={() => {
        clearTimeout(timer.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        timer.current = setTimeout(() => setOpen(false), 160);
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-navy-700 transition hover:bg-navy-50"
      >
        <UserIcon />
        <span className="hidden text-left text-xs leading-tight lg:block">
          <span className="block text-muted">Hello,</span>
          <span className="block max-w-[92px] truncate font-bold">{first}</span>
        </span>
        <svg className={`hidden h-3 w-3 transition-transform lg:block ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 w-60 overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-navy-100"
        >
          <div className="border-b border-navy-100 bg-sand-100 px-4 py-3">
            <p className="truncate text-sm font-bold text-navy-700">{session.user.name}</p>
            <p className="tnum truncate text-xs text-muted">
              +91 {(session.user as { phone?: string }).phone ?? ''}
            </p>
          </div>

          <ul className="py-1.5">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-navy-700 transition hover:bg-sand-100"
                >
                  <span className="w-5 text-center">{l.icon}</span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-navy-100 p-2">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
