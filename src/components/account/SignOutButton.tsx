'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="rounded-xl border border-navy-200 px-5 py-2.5 text-sm font-bold text-navy-700 transition hover:bg-navy-50"
    >
      Sign Out
    </button>
  );
}
