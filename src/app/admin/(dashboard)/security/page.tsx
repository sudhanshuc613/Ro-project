import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { formatDateIN, relativeTime } from '@/lib/utils/format';
import ChangePasswordForm from '@/components/admin/ChangePasswordForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Security' };

export default async function AdminSecurityPage() {
  const session = await getServerSession(authOptions);

  const me = session?.user
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          fullName: true, phone: true, role: true,
          lastLoginAt: true, updatedAt: true,
        },
      })
    : null;

  const recent = await prisma.auditLog
    .findMany({
      where: {
        action: { in: ['ADMIN_PASSWORD_CHANGE', 'PASSWORD_RESET', 'customer.reset-password'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, action: true, createdAt: true, ipAddress: true },
    })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Security</h1>
        <p className="mt-0.5 text-sm text-muted">
          Your sign-in password and recent password activity.
        </p>
      </div>

      {/* Who am I */}
      <section className="rounded-2xl border border-navy-100 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-navy-700">Signed in as</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="font-semibold text-navy-700">{me?.fullName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted">Phone (your username)</dt>
            <dd className="font-semibold text-navy-700">{me?.phone ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted">Role</dt>
            <dd className="font-semibold text-navy-700">{me?.role ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted">Last sign-in</dt>
            <dd className="font-semibold text-navy-700">
              {me?.lastLoginAt ? relativeTime(me.lastLoginAt) : '—'}
            </dd>
          </div>
        </dl>
      </section>

      {/* Change password */}
      <section className="rounded-2xl border border-navy-100 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-navy-700">Change your password</h2>
        <p className="mb-5 mt-1 text-sm text-muted">
          Pick something only you know. Never reuse your bank or email password here.
        </p>
        <ChangePasswordForm />
      </section>

      {/* Honest explainer — this question comes up, so answer it in the product */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-display text-lg font-bold text-amber-900">
          Why you cannot see customer passwords
        </h2>
        <div className="mt-2 space-y-2 text-sm text-amber-900">
          <p>
            Passwords are never stored on this site. What is stored is a
            one-way <strong>bcrypt hash</strong> — a scrambled fingerprint that
            cannot be turned back into the original text. When someone signs in,
            their typed password is scrambled the same way and the two
            fingerprints are compared.
          </p>
          <p>
            This is deliberate, and it protects <em>you</em>: if the database is
            ever stolen, the thief gets fingerprints, not working passwords —
            and cannot walk into your customers&apos; other accounts.
          </p>
          <p className="font-semibold">
            What you can do instead: open{' '}
            <strong>Customers</strong>, find the person, and use{' '}
            <strong>Reset Password</strong>. That creates a one-time temporary
            password you can read out on the phone. They sign in with it and
            set their own afterwards.
          </p>
          <p>
            Customers can also reset themselves at{' '}
            <code className="rounded bg-white/70 px-1.5 py-0.5">/forgot-password</code>{' '}
            using an OTP — no call needed.
          </p>
        </div>
      </section>

      {/* Audit trail */}
      <section className="rounded-2xl border border-navy-100 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-navy-700">Recent password activity</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Nothing yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-navy-50 text-sm">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-navy-700">{LABELS[r.action] ?? r.action}</span>
                <span className="text-muted">
                  {formatDateIN(r.createdAt)}
                  {r.ipAddress ? ` · ${r.ipAddress}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const LABELS: Record<string, string> = {
  ADMIN_PASSWORD_CHANGE: 'Admin changed their own password',
  PASSWORD_RESET: 'Customer reset their own password (OTP)',
  'customer.reset-password': 'Admin issued a temporary customer password',
};
