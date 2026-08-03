'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { BRAND } from '@/lib/constants';

/**
 * useSearchParams() forces client-side bailout, so the form must sit inside a
 * Suspense boundary or the production build fails to prerender this route.
 */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-navy-700 text-white">Loading…</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('password', { phone, password, redirect: false });

    setLoading(false);
    if (res?.error) {
      setError('Invalid phone number or password.');
      return;
    }
    router.push(params.get('callbackUrl') ?? '/admin');
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-navy-700 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <Image src={BRAND.logo} alt={BRAND.name} width={160} height={40} className="mx-auto h-10 w-auto" />
        <h1 className="mt-6 text-center font-display text-xl font-bold text-navy-700">Admin Sign In</h1>
        <p className="mt-1 text-center text-sm text-muted">Authorised staff only</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-700">Phone Number</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              required
              className="input"
              placeholder="8969821440"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-navy-700 py-3.5 font-bold text-white transition hover:bg-navy-600 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
