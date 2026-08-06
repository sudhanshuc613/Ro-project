'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BRAND } from '@/lib/constants';
import PasswordInput from '@/components/ui/PasswordInput';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-[85vh] place-items-center bg-navy-50">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('password', { phone, password, redirect: false });
    setLoading(false);

    if (res?.error) {
      setError('Invalid mobile number or password.');
      return;
    }
    router.push(params.get('callbackUrl') ?? '/account');
    router.refresh();
  }

  return (
    <main className="grid min-h-[85vh] place-items-center bg-navy-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <Link href="/" className="block">
          <Image src={BRAND.logo} alt={BRAND.name} width={240} height={58} priority className="mx-auto h-12 w-auto" />
        </Link>

        <h1 className="mt-6 text-center font-display text-2xl font-bold text-navy-700">Sign In</h1>
        <p className="mt-1 text-center text-sm text-muted">Access your orders and service history</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-700">
              Mobile Number <span className="text-red-500">*</span>
            </span>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-navy-100 bg-navy-50 px-3 text-sm font-semibold text-navy-500">
                +91
              </span>
              <input
                type="tel" inputMode="numeric" maxLength={10}
                value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210" autoComplete="tel-national" required
                className="input rounded-l-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-700">
              Password <span className="text-red-500">*</span>
            </span>
            <PasswordInput
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" required
            />
            <div className="mt-1.5 text-right">
              <Link href="/forgot-password" className="text-sm font-semibold text-aqua-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full rounded-xl bg-cta-orange py-3.5 font-bold text-white shadow-cta transition hover:bg-cta-orangeDark disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          New here?{' '}
          <Link href="/register" className="font-bold text-aqua-600 hover:underline">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
