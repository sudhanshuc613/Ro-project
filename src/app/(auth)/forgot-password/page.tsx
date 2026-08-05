'use client';

/**
 * /forgot-password — OTP se password reset (3 step).
 *
 * Email link ka rasta nahi liya kyunki:
 *   - business ke paas abhi koi email service nahi hai
 *   - Patna ke customers zyadatar email use hi nahi karte, phone karte hain
 *
 * Steps:
 *   1. phone daalo   → POST /api/auth/otp   (purpose PASSWORD_RESET)
 *   2. code daalo    → PUT  /api/auth/otp
 *   3. naya password → POST /api/auth/reset-password
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BRAND, CONTACT } from '@/lib/constants';
import PasswordInput from '@/components/ui/PasswordInput';

type Step = 'PHONE' | 'CODE' | 'PASSWORD' | 'DONE';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('PHONE');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [pollToken, setPollToken] = useState('');
  const [channel, setChannel] = useState<string>('');
  const [waLink, setWaLink] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  /* Resend cooldown */
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  /* WhatsApp reverse flow: poll until the webhook stamps the row */
  useEffect(() => {
    if (step !== 'CODE' || channel !== 'WHATSAPP_REVERSE' || !pollToken) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/otp?token=${encodeURIComponent(pollToken)}`);
        const data = await res.json();
        if (data.verified) {
          clearInterval(iv);
          setStep('PASSWORD');
          setInfo('');
        }
      } catch {
        /* network blip — keep polling */
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [step, channel, pollToken]);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'PASSWORD_RESET' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Could not send code');

      setPollToken(data.pollToken);
      setChannel(data.channel ?? '');
      setWaLink(data.whatsappLink ?? data.link ?? '');
      setInfo(data.message ?? 'Code sent.');
      setSecondsLeft(45);
      setStep('CODE');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollToken, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Wrong code');
      setStep('PASSWORD');
      setInfo('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Both passwords must match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pollToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Could not update password');
      setStep('DONE');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[85vh] place-items-center bg-navy-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <Link href="/" className="block">
          <Image src={BRAND.logo} alt={BRAND.name} width={150} height={38} className="mx-auto h-9 w-auto" />
        </Link>

        <h1 className="mt-6 text-center font-display text-2xl font-bold text-navy-700">
          {step === 'DONE' ? 'Password Updated' : 'Reset Password'}
        </h1>

        {/* Step indicator */}
        {step !== 'DONE' && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {(['PHONE', 'CODE', 'PASSWORD'] as Step[]).map((s, i) => {
              const order = ['PHONE', 'CODE', 'PASSWORD'];
              const active = order.indexOf(step) >= i;
              return (
                <span
                  key={s}
                  className={`h-1.5 w-12 rounded-full transition ${active ? 'bg-aqua-500' : 'bg-navy-100'}`}
                />
              );
            })}
          </div>
        )}

        {/* ── STEP 1 — phone ── */}
        {step === 'PHONE' && (
          <form onSubmit={sendCode} className="mt-6 space-y-4">
            <p className="text-center text-sm text-muted">
              Enter your registered mobile number. We&apos;ll send you a verification code.
            </p>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy-700">
                Mobile Number <span className="text-red-500">*</span>
              </span>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-navy-100 bg-navy-50 px-3 text-sm font-semibold text-navy-500">
                  +91
                </span>
                <input
                  type="tel" inputMode="numeric" maxLength={10} required
                  value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210" autoComplete="tel-national"
                  className="input rounded-l-none"
                />
              </div>
            </label>

            <Alert error={error} info={info} />

            <button
              type="submit" disabled={loading || phone.length !== 10}
              className="w-full rounded-xl bg-cta-orange py-3.5 font-bold text-white shadow-cta transition hover:bg-cta-orangeDark disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* ── STEP 2 — code ── */}
        {step === 'CODE' && (
          <div className="mt-6 space-y-4">
            {channel === 'WHATSAPP_REVERSE' ? (
              <>
                <p className="text-center text-sm text-muted">
                  Send the code below to us on WhatsApp. This page will move ahead on its own.
                </p>
                <p className="rounded-xl bg-navy-50 py-4 text-center font-mono text-2xl font-bold tracking-widest text-navy-700">
                  {info.match(/\b[A-Z0-9]{4,8}\b/)?.[0] ?? info}
                </p>
                {waLink && (
                  <a
                    href={waLink} target="_blank" rel="noopener noreferrer"
                    className="block w-full rounded-xl bg-emerald-600 py-3.5 text-center font-bold text-white"
                  >
                    Open WhatsApp
                  </a>
                )}
                <p className="text-center text-xs text-muted">Waiting for your message…</p>
              </>
            ) : (
              <form onSubmit={verifyCode} className="space-y-4">
                <p className="text-center text-sm text-muted">
                  Code sent to <strong className="text-navy-700">+91 {phone}</strong>
                </p>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-navy-700">
                    Verification Code <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text" inputMode="numeric" maxLength={8} required autoFocus
                    value={code} onChange={(e) => setCode(e.target.value.trim())}
                    placeholder="Enter code" autoComplete="one-time-code"
                    className="input text-center font-mono text-lg tracking-widest"
                  />
                </label>

                <Alert error={error} info={info} />

                <button
                  type="submit" disabled={loading || code.length < 4}
                  className="w-full rounded-xl bg-cta-orange py-3.5 font-bold text-white shadow-cta transition hover:bg-cta-orangeDark disabled:opacity-60"
                >
                  {loading ? 'Verifying…' : 'Verify Code'}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => sendCode()}
              disabled={secondsLeft > 0 || loading}
              className="w-full text-sm font-semibold text-aqua-600 hover:underline disabled:text-muted disabled:no-underline"
            >
              {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : 'Resend code'}
            </button>
          </div>
        )}

        {/* ── STEP 3 — new password ── */}
        {step === 'PASSWORD' && (
          <form onSubmit={submitPassword} className="mt-6 space-y-4">
            <p className="text-center text-sm text-muted">Choose a new password for your account.</p>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy-700">
                New Password <span className="text-red-500">*</span>
              </span>
              <PasswordInput
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters" autoComplete="new-password"
                minLength={6} required autoFocus
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy-700">
                Confirm Password <span className="text-red-500">*</span>
              </span>
              <PasswordInput
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type it again" autoComplete="new-password"
                minLength={6} required
              />
            </label>

            <Alert error={error} info={info} />

            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl bg-cta-orange py-3.5 font-bold text-white shadow-cta transition hover:bg-cta-orangeDark disabled:opacity-60"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}

        {/* ── DONE ── */}
        {step === 'DONE' && (
          <div className="mt-6 space-y-4 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50">
              <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-muted">
              Your password has been updated. Taking you to sign in…
            </p>
            <Link href="/login" className="block font-bold text-aqua-600 hover:underline">
              Sign in now
            </Link>
          </div>
        )}

        <div className="mt-6 border-t border-navy-50 pt-5 text-center text-sm text-muted">
          <p>
            Remembered it?{' '}
            <Link href="/login" className="font-bold text-aqua-600 hover:underline">Sign In</Link>
          </p>
          <p className="mt-2 text-xs">
            Trouble signing in? Call{' '}
            <a href={CONTACT.primaryTel} className="font-bold text-navy-700">{CONTACT.primaryPhone}</a>
          </p>
        </div>
      </div>
    </main>
  );
}

function Alert({ error, info }: { error: string; info: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
        {error}
      </p>
    );
  }
  if (info) {
    return (
      <p className="rounded-lg bg-aqua-50 px-4 py-2.5 text-sm font-medium text-aqua-700">
        {info}
      </p>
    );
  }
  return null;
}
