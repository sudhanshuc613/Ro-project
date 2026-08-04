'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BRAND } from '@/lib/constants';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = k === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((p) => ({ ...p, [k]: [] }));
    setError('');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrors({});

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setError(data.message ?? 'Could not create account');
        setLoading(false);
        return;
      }

      // Auto sign-in after successful signup
      const login = await signIn('password', {
        phone: form.phone,
        password: form.password,
        redirect: false,
      });

      if (login?.error) {
        router.push('/login');
        return;
      }
      router.push('/account');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[85vh] place-items-center bg-navy-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <Link href="/" className="block">
          <Image src={BRAND.logo} alt={BRAND.name} width={150} height={38} className="mx-auto h-9 w-auto" />
        </Link>

        <h1 className="mt-6 text-center font-display text-2xl font-bold text-navy-700">Create Account</h1>
        <p className="mt-1 text-center text-sm text-muted">
          Track your orders and service history in one place
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Full Name" error={errors.fullName?.[0]} required>
            <input
              type="text" value={form.fullName} onChange={set('fullName')}
              placeholder="Rahul Kumar" autoComplete="name" required className="input"
            />
          </Field>

          <Field label="Mobile Number" error={errors.phone?.[0]} required>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-navy-100 bg-navy-50 px-3 text-sm font-semibold text-navy-500">
                +91
              </span>
              <input
                type="tel" inputMode="numeric" maxLength={10}
                value={form.phone} onChange={set('phone')}
                placeholder="98765 43210" autoComplete="tel-national" required
                className="input rounded-l-none"
              />
            </div>
          </Field>

          <Field label="Email (optional)" error={errors.email?.[0]}>
            <input
              type="email" value={form.email} onChange={set('email')}
              placeholder="you@example.com" autoComplete="email" className="input"
            />
          </Field>

          <Field label="Password" error={errors.password?.[0]} required>
            <input
              type="password" value={form.password} onChange={set('password')}
              placeholder="Minimum 6 characters" autoComplete="new-password"
              minLength={6} required className="input"
            />
          </Field>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full rounded-xl bg-cta-orange py-3.5 font-bold text-white shadow-cta transition hover:bg-cta-orangeDark disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-aqua-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}
