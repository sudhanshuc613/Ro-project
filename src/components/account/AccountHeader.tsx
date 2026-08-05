/**
 * Account page banner.
 *
 * Deliberately shows identity + tenure and NOTHING gamified. No coin balance,
 * no tier progress bar. For a business with a few thousand customers those
 * widgets are always near-empty, and an empty reward counter reads as "this
 * shop is small" — the exact opposite of the intended effect.
 *
 * What is shown instead is what a service customer actually cares about:
 * who they are on record as, and how to reach a human.
 */
import { formatDateIN } from '@/lib/utils/format';
import { getContactSettings, telLink, waLink } from '@/lib/settings';
import SignOutButton from './SignOutButton';

const SEGMENT_LABEL: Record<string, { label: string; cls: string }> = {
  NEW: { label: 'New customer', cls: 'bg-aqua-50 text-aqua-700 ring-aqua-200' },
  ACTIVE: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  REPEAT: { label: 'Repeat customer', cls: 'bg-gold-50 text-gold-700 ring-gold-200' },
  VIP: { label: 'VIP', cls: 'bg-gold-50 text-gold-700 ring-gold-300' },
  AT_RISK: { label: 'We miss you', cls: 'bg-amber-50 text-amber-800 ring-amber-200' },
};

export default async function AccountHeader({
  fullName,
  phone,
  email,
  memberSince,
  segment,
}: {
  fullName: string;
  phone: string;
  email: string | null;
  memberSince: Date;
  segment: string | null;
}) {
  const contact = await getContactSettings();
  const first = fullName.split(' ')[0];
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const seg = SEGMENT_LABEL[segment ?? 'NEW'] ?? SEGMENT_LABEL.NEW;

  return (
    <header className="grain relative overflow-hidden bg-hero-deep">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_20%,rgba(113,206,218,.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      <div className="container relative mx-auto px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 font-display text-xl font-extrabold text-white ring-1 ring-white/20">
              {initials || '👤'}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl font-extrabold text-white">
                  Namaste, {first}
                </h1>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${seg.cls}`}>
                  {seg.label}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-navy-200">
                +91 {phone}
                {email ? ` · ${email}` : ''}
              </p>
              <p className="text-xs text-navy-300">
                Member since {formatDateIN(memberSince)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={telLink(contact.primaryPhone)}
              className="rounded-xl bg-cta-green px-4 py-2.5 text-sm font-bold text-white shadow-call transition hover:bg-cta-greenDark"
            >
              📞 Need help
            </a>
            <a
              href={waLink(contact.whatsapp, 'Hi, I need help with my AquaNexa account.')}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white/95 px-4 py-2.5 text-sm font-bold text-navy-700 transition hover:bg-white"
            >
              💬 WhatsApp
            </a>
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
