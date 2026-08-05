'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import PasswordInput from '@/components/ui/PasswordInput';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const strength = scorePassword(newPassword);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed');
      toast.success(data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-700">Current Password</span>
        <PasswordInput
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="Your password right now"
          required
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-700">New Password</span>
        <PasswordInput
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
        {newPassword && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition ${
                    i < strength.score ? strength.barClass : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className={`mt-1 text-xs font-semibold ${strength.textClass}`}>{strength.label}</p>
          </div>
        )}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-700">Confirm New Password</span>
        <PasswordInput
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Type it again"
          minLength={8}
          required
        />
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="mt-1 text-xs font-semibold text-red-600">Passwords do not match</p>
        )}
      </label>

      <button
        type="submit"
        disabled={busy || !currentPassword || newPassword.length < 8 || newPassword !== confirmPassword}
        className="rounded-xl bg-navy-700 px-6 py-3 font-bold text-white transition hover:bg-navy-800 disabled:opacity-50"
      >
        {busy ? 'Changing…' : 'Change Password'}
      </button>

      <p className="text-xs text-muted">
        You stay signed in on this device. Use the new password from your next sign-in.
      </p>
    </form>
  );
}

function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;

  const table = [
    { label: 'Too weak', barClass: 'bg-red-500', textClass: 'text-red-600' },
    { label: 'Weak', barClass: 'bg-red-500', textClass: 'text-red-600' },
    { label: 'Fair', barClass: 'bg-amber-500', textClass: 'text-amber-600' },
    { label: 'Good', barClass: 'bg-emerald-500', textClass: 'text-emerald-600' },
    { label: 'Strong', barClass: 'bg-emerald-600', textClass: 'text-emerald-700' },
  ];
  return { score, ...table[score] };
}
