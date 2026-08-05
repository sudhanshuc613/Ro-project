'use client';

/**
 * Phone verification widget — one component, all four channels.
 *
 * The parent does not care which channel the owner configured; it just
 * renders this and waits for onVerified(). Switching from the free reverse
 * flow to paid SMS later changes nothing in any calling page.
 *
 * The reverse flow polls because there is no way for Meta to push into a
 * browser tab. Poll interval is 3s with a hard stop at expiry, so a forgotten
 * tab cannot hammer the server forever.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type Channel = 'DEV' | 'WHATSAPP_REVERSE' | 'WHATSAPP' | 'SMS';

interface Challenge {
  pollToken: string;
  channel: Channel;
  expiresInSeconds: number;
  sendCode?: string;
  whatsappLink?: string;
  devCode?: string;
  message: string;
}

export default function PhoneVerify({
  phone,
  purpose,
  onVerified,
  onCancel,
  autoStart = false,
}: {
  phone: string;
  purpose: 'LOGIN' | 'ORDER_COD' | 'SERVICE_BOOKING';
  onVerified: (result: { phone: string; pollToken: string }) => void;
  onCancel?: () => void;
  autoStart?: boolean;
}) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const start = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? 'Could not send the code');
        return;
      }
      // Number already proven earlier — do not make them do it again.
      if (data.alreadyVerified) {
        onVerified({ phone, pollToken: '' });
        return;
      }

      setChallenge(data);
      setSecondsLeft(data.expiresInSeconds);
      setCode('');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [phone, purpose, onVerified]);

  useEffect(() => {
    if (autoStart && !challenge) void start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  /* Countdown */
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  /* Reverse flow: poll until the webhook stamps the row. */
  useEffect(() => {
    if (challenge?.channel !== 'WHATSAPP_REVERSE' || !challenge.pollToken) return;

    pollRef.current = setInterval(async () => {
      // Stop when the tab is hidden — no point burning requests in background.
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/auth/otp?token=${challenge.pollToken}`);
        const d = await res.json();
        if (d.verified) {
          clearInterval(pollRef.current);
          toast.success('Number verified');
          onVerified({ phone, pollToken: challenge.pollToken });
        } else if (d.expired) {
          clearInterval(pollRef.current);
          setError('Verification expired. Please start again.');
          setChallenge(null);
        }
      } catch {
        /* transient — next tick retries */
      }
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, [challenge, phone, onVerified]);

  async function submitCode() {
    if (!challenge) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollToken: challenge.pollToken, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Wrong code');
        return;
      }
      toast.success('Number verified');
      onVerified({ phone, pollToken: challenge.pollToken });
    } catch {
      setError('Network error');
    } finally {
      setBusy(false);
    }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  /* ── Not started ── */
  if (!challenge) {
    return (
      <div className="rounded-2xl bg-aqua-50 p-5 ring-1 ring-aqua-200">
        <p className="font-bold text-navy-700">Verify your mobile number</p>
        <p className="mt-1 text-sm text-navy-600">
          We&apos;ll confirm <strong className="tnum">{phone}</strong> is yours — takes a few seconds.
        </p>
        {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button
            onClick={start}
            disabled={busy}
            className="rounded-xl bg-cta-green px-6 py-3 text-sm font-bold text-white shadow-call disabled:opacity-60"
          >
            {busy ? 'Please wait…' : 'Verify number'}
          </button>
          {onCancel && (
            <button onClick={onCancel} className="rounded-xl px-4 py-3 text-sm font-bold text-muted hover:bg-navy-50">
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── WhatsApp reverse: user sends the code TO us ── */
  if (challenge.channel === 'WHATSAPP_REVERSE') {
    return (
      <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
        <p className="font-bold text-emerald-900">Send this code on WhatsApp</p>
        <p className="mt-1 text-sm text-emerald-800">
          Open WhatsApp from <strong className="tnum">{phone}</strong> and send us this code. We verify it automatically.
        </p>

        <div className="mt-4 rounded-xl bg-white p-4 text-center ring-1 ring-emerald-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Your code</p>
          <p className="mt-1 select-all font-display text-3xl font-extrabold tracking-[0.2em] text-navy-700">
            {challenge.sendCode}
          </p>
        </div>

        <a
          href={challenge.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block rounded-xl bg-[#25D366] py-3.5 text-center font-bold text-white"
        >
          💬 Open WhatsApp &amp; send
        </a>

        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-800">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Waiting for your message… {mm}:{ss}
        </div>

        <p className="mt-3 text-center text-xs text-emerald-700">
          Must be sent from {phone} — that&apos;s how we know the number is yours.
        </p>

        {error && <p className="mt-2 text-center text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-3 flex justify-center gap-3 text-xs">
          <button onClick={start} className="font-bold text-emerald-700 hover:underline">
            Start again
          </button>
          {onCancel && (
            <button onClick={onCancel} className="font-bold text-muted hover:underline">
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── Typed code: SMS / WhatsApp / DEV ── */
  return (
    <div className="rounded-2xl bg-aqua-50 p-5 ring-1 ring-aqua-200">
      <p className="font-bold text-navy-700">Enter the code</p>
      <p className="mt-1 text-sm text-navy-600">{challenge.message}</p>

      {challenge.devCode && (
        <div className="mt-3 rounded-xl bg-red-50 p-3 ring-1 ring-red-200">
          <p className="text-xs font-bold text-red-800">⚠️ TEST MODE — this verifies nothing</p>
          <p className="mt-0.5 text-sm text-red-900">
            Code: <strong className="select-all font-mono">{challenge.devCode}</strong>
          </p>
          <p className="mt-1 text-[11px] text-red-700">
            Showing the code on screen proves nothing — anyone can type back what they were just
            shown. Switch to WhatsApp or SMS in Settings before going live.
          </p>
        </div>
      )}

      <input
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        onKeyDown={(e) => e.key === 'Enter' && code.length >= 4 && submitCode()}
        placeholder="6-digit code"
        inputMode="numeric"
        autoComplete="one-time-code"
        className="input mt-4 text-center font-display text-2xl tracking-[0.3em]"
      />

      {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}

      <button
        onClick={submitCode}
        disabled={busy || code.length < 4}
        className="mt-3 w-full rounded-xl bg-cta-green py-3.5 font-bold text-white shadow-call disabled:opacity-50"
      >
        {busy ? 'Checking…' : 'Verify'}
      </button>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="tnum text-muted">{secondsLeft > 0 ? `Expires in ${mm}:${ss}` : 'Expired'}</span>
        <button onClick={start} disabled={busy || secondsLeft > 540} className="font-bold text-aqua-600 hover:underline disabled:opacity-40">
          Resend code
        </button>
      </div>
    </div>
  );
}
