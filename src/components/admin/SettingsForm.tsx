'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { ContactSettings, ServiceSettings, BannerSettings } from '@/lib/settings';

interface Props {
  contact: ContactSettings;
  service: ServiceSettings;
  banner: BannerSettings;
}

export default function SettingsForm({ contact, service, banner }: Props) {
  return (
    <div className="space-y-6">
      <ContactCard initial={contact} />
      <ServiceCard initial={service} />
      <BannerCard initial={banner} />
    </div>
  );
}

/* ── Shared save helper ───────────────────────────────────────────────────── */
async function saveSettings(key: string, value: unknown) {
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  const data = await res.json();
  if (!res.ok) {
    const first = data.errors ? Object.values(data.errors).flat()[0] : null;
    throw new Error((first as string) ?? data.message ?? 'Save failed');
  }
  return data;
}

/* ── Contact ──────────────────────────────────────────────────────────────── */
function ContactCard({ initial }: { initial: ContactSettings }) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof ContactSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = ['primaryPhone', 'secondaryPhone', 'tertiaryPhone', 'whatsapp'].includes(k);
    setF({ ...f, [k]: digitsOnly ? e.target.value.replace(/\D/g, '') : e.target.value });
  };

  async function submit() {
    setSaving(true);
    try {
      await saveSettings('contact', f);
      toast.success('Contact details updated across the site');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Contact Numbers" sub="Shown in the navbar, footer, every service page and all call buttons">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Primary Phone" hint="Main number, shown first everywhere">
          <input value={f.primaryPhone} onChange={set('primaryPhone')} maxLength={10} inputMode="numeric" className={inp} />
        </Field>
        <Field label="Secondary Phone">
          <input value={f.secondaryPhone} onChange={set('secondaryPhone')} maxLength={10} inputMode="numeric" className={inp} />
        </Field>
        <Field label="Third Phone" hint="Optional — leave blank to hide">
          <input value={f.tertiaryPhone} onChange={set('tertiaryPhone')} maxLength={10} inputMode="numeric" className={inp} />
        </Field>
        <Field label="WhatsApp Number" hint="With 91 prefix, e.g. 918969821440">
          <input value={f.whatsapp} onChange={set('whatsapp')} maxLength={12} inputMode="numeric" className={inp} />
        </Field>
        <Field label="Email">
          <input value={f.email} onChange={set('email')} type="email" className={inp} />
        </Field>
        <Field label="Working Hours" hint="e.g. Mon–Sun 08:00–21:00">
          <input value={f.hours} onChange={set('hours')} className={inp} />
        </Field>
      </div>
      <SaveBtn onClick={submit} saving={saving} />
    </Card>
  );
}

/* ── Service ──────────────────────────────────────────────────────────────── */
function ServiceCard({ initial }: { initial: ServiceSettings }) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await saveSettings('service', f);
      toast.success('Service settings updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Service Settings" sub="Visit charge and service promises shown across the site">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Visit Charge (₹)" hint="Your biggest competitive advantage — competitors charge ₹299–399">
          <input
            type="number" value={f.visitCharge}
            onChange={(e) => setF({ ...f, visitCharge: Number(e.target.value) })}
            className={inp}
          />
        </Field>
        <Field label="Emergency Visit Charge (₹)" hint="Premium same-day 2-hour guarantee slot">
          <input
            type="number" value={f.emergencyCharge}
            onChange={(e) => setF({ ...f, emergencyCharge: Number(e.target.value) })}
            className={inp}
          />
        </Field>
        <Field label="Response Time" hint="e.g. 90 minutes">
          <input value={f.responseTime} onChange={(e) => setF({ ...f, responseTime: e.target.value })} className={inp} />
        </Field>
        <Field label="Repair Warranty (days)">
          <input
            type="number" value={f.warrantyDays}
            onChange={(e) => setF({ ...f, warrantyDays: Number(e.target.value) })}
            className={inp}
          />
        </Field>
        <Field label="Service City">
          <input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} className={inp} />
        </Field>
        <Field label="State">
          <input value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })} className={inp} />
        </Field>
      </div>
      <SaveBtn onClick={submit} saving={saving} />
    </Card>
  );
}

/* ── Banner ───────────────────────────────────────────────────────────────── */
function BannerCard({ initial }: { initial: BannerSettings }) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await saveSettings('banner', f);
      toast.success('Homepage banner updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Homepage Banner" sub="Hero text and the announcement strip at the very top">
      <div className="space-y-4">
        <Field label="Hero Headline">
          <input value={f.heroHeadline} onChange={(e) => setF({ ...f, heroHeadline: e.target.value })} className={inp} />
        </Field>
        <Field label="Hero Subline" hint="The orange line under the headline">
          <input value={f.heroSubline} onChange={(e) => setF({ ...f, heroSubline: e.target.value })} className={inp} />
        </Field>
        <Field label="Hero Image Path" hint="Upload to public/banners/ in GitHub, then put the path here">
          <input value={f.heroImage} onChange={(e) => setF({ ...f, heroImage: e.target.value })} className={inp} />
        </Field>
        <Field label="Top Announcement Strip">
          <input value={f.announcementText} onChange={(e) => setF({ ...f, announcementText: e.target.value })} className={inp} />
        </Field>
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox" checked={f.announcementActive}
            onChange={(e) => setF({ ...f, announcementActive: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-aqua-500 focus:ring-aqua-400"
          />
          <span className="text-sm text-navy-700">Show announcement strip</span>
        </label>
      </div>
      <SaveBtn onClick={submit} saving={saving} />
    </Card>
  );
}

/* ── UI atoms ─────────────────────────────────────────────────────────────── */
const inp =
  'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100';

function Card({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-display text-lg font-bold text-navy-700">{title}</h2>
      <p className="mt-0.5 text-sm text-muted">{sub}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-navy-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function SaveBtn({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="mt-5 rounded-lg bg-aqua-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-aqua-600 disabled:opacity-60"
    >
      {saving ? 'Saving…' : 'Save Changes'}
    </button>
  );
}
