'use client';

/**
 * GOOGLE TAG CARD — /admin/settings
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN (6 Nov 2026)
 * ─────────────────
 * Owner: "admin panel mai ek aisa option bhi de dena taki mai future mai
 *         khud se tag ka code badal saku samza"
 *
 * Ab tak har Google tag ki ID `constants.ts` me likhi thi. Google Ads me
 * naya conversion banate hi code change + git push + deploy — 20 minute ka
 * kaam aur har baar mere bharose. Ab yahan se, 20 second me.
 *
 * 🔴 SABSE ZAROORI HISSA — "PASTE KARO" WALA BOX
 * ──────────────────────────────────────────────
 * Google kabhi khaali ID nahi deta, hamesha poora `<script>` code deta hai.
 * Owner se ye ummeed karna ki wo us code me se `GTM-WZHCV54L` chhaant kar
 * nikaale — yahin galti hoti hai (ek akshar chhoot gaya to tracking
 * chup-chaap band, mahino pata nahi chalta).
 *
 * Isliye poora code jaisa ka taisa paste karne ka box diya hai. Code me se
 * ID khud nikal jaati hai aur neeche bhar jaati hai. Bharne ke baad bhi
 * dikhti hai, taaki owner mila sake.
 *
 * 🔴 GALAT ID SAVE HI NAHI HOTI
 * ─────────────────────────────
 * Format ki jaanch `validateAnalytics()` karta hai — wahi function API bhi
 * bulata hai. Do jagah do alag niyam nahi hain.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import {
  validateAnalytics,
  duplicateRisk,
  resolveAnalytics,
  extractIds,
  GTM_RE,
  GA_RE,
  AW_RE,
  type AnalyticsValues,
} from '@/lib/seo/analytics-overrides';

type Form = {
  gtmId: string;
  gtmEnabled: boolean;
  gaId: string;
  gaEnabled: boolean;
  adsId: string;
  adsEnabled: boolean;
  adsCallLabel: string;
  adsFormLabel: string;
  adsPurchaseLabel: string;
};

export default function AnalyticsTagCard({ initial }: { initial: AnalyticsValues }) {
  const [f, setF] = useState<Form>({
    gtmId: initial.gtmId,
    gtmEnabled: initial.gtmEnabled,
    gaId: initial.gaId,
    gaEnabled: initial.gaEnabled,
    adsId: initial.adsId,
    adsEnabled: initial.adsEnabled,
    adsCallLabel: initial.adsCallLabel,
    adsFormLabel: initial.adsFormLabel,
    adsPurchaseLabel: initial.adsPurchaseLabel,
  });
  const [paste, setPaste] = useState('');
  const [saving, setSaving] = useState(false);

  const errs = validateAnalytics(f);
  const preview = resolveAnalytics(f);
  const dupes = duplicateRisk(preview);

  function applyPaste() {
    const found = extractIds(paste);
    /* Sirf wahi field chhuo jo sach me mili. `...found` seedha spread karna
       galat hota: TypeScript ke liye har field `string | undefined` hai,
       aur `undefined` spread hone par bhari hui ID mit jaati. */
    const patch: Partial<Form> = {};
    const shown: string[] = [];
    if (found.gtmId) { patch.gtmId = found.gtmId; shown.push(found.gtmId); }
    if (found.gaId) { patch.gaId = found.gaId; shown.push(found.gaId); }
    if (found.adsId) { patch.adsId = found.adsId; shown.push(found.adsId); }
    if (found.adsPurchaseLabel) {
      patch.adsPurchaseLabel = found.adsPurchaseLabel;
      shown.push(found.adsPurchaseLabel);
    }

    if (shown.length === 0) {
      toast.error('Is code me koi Google ID nahi mili. Poora script block paste karo.');
      return;
    }
    setF((p) => ({ ...p, ...patch }));
    setPaste('');
    toast.success(`Mil gayi: ${shown.join(' · ')}`);
  }

  async function submit() {
    if (errs.length) {
      toast.error(errs[0]);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'analytics', value: f }),
      });
      const data = await res.json();
      if (!res.ok) {
        const first = data.errors ? Object.values(data.errors).flat()[0] : null;
        throw new Error((first as string) ?? data.message ?? 'Save failed');
      }
      toast.success('Google tag update ho gaya — site par 1 minute me live');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  const live = [
    preview.gtmActive ? `GTM ${preview.gtmId}` : null,
    preview.gaActive ? `GA4 ${preview.gaId}` : null,
    preview.adsActive ? `Ads ${preview.adsId}` : null,
  ].filter(Boolean) as string[];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-display text-lg font-bold text-navy-700">🏷️ Google Tag (GTM · GA4 · Ads)</h2>
      <p className="mt-0.5 text-sm text-muted">
        Google se naya tag mile to yahin badlo — koi code, koi deploy nahi.
      </p>

      {/* ── Paste box ─────────────────────────────────────────────────── */}
      <div className="mt-4 rounded-xl border-2 border-dashed border-aqua-300 bg-aqua-50/50 p-4">
        <p className="text-sm font-bold text-navy-700">
          Google ka poora code yahan paste karo
        </p>
        <p className="mt-1 text-xs text-muted">
          ID khud nikal jayegi. Chhaant kar nikaalne ki zaroorat nahi — wahin
          galti hoti hai.
        </p>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder={'<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX"></script>'}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-aqua-500"
        />
        <button
          type="button"
          onClick={applyPaste}
          disabled={!paste.trim()}
          className="mt-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
        >
          ID nikaalo
        </button>
      </div>

      {/* ── Fields ────────────────────────────────────────────────────── */}
      <div className="mt-5 space-y-4">
        <Row
          label="GTM Container ID"
          hint="Google Tag Manager ka container. Jaise GTM-WZHCV54L. Khaali chhodo to GTM lagega hi nahi."
          value={f.gtmId}
          onChange={(v) => setF({ ...f, gtmId: v.toUpperCase() })}
          on={f.gtmEnabled}
          onToggle={(b) => setF({ ...f, gtmEnabled: b })}
          ok={f.gtmId === '' || GTM_RE.test(f.gtmId)}
          placeholder="GTM-XXXXXXX"
        />
        <Row
          label="GA4 Measurement ID"
          hint="Google Analytics 4 ka data stream. Jaise G-JP9HDZ9SE3."
          value={f.gaId}
          onChange={(v) => setF({ ...f, gaId: v.toUpperCase() })}
          on={f.gaEnabled}
          onToggle={(b) => setF({ ...f, gaEnabled: b })}
          ok={f.gaId === '' || GA_RE.test(f.gaId)}
          placeholder="G-XXXXXXXXXX"
        />
        <Row
          label="Google Ads Conversion ID"
          hint="Google Ads ka base tag. Jaise AW-610913435."
          value={f.adsId}
          onChange={(v) => setF({ ...f, adsId: v.toUpperCase() })}
          on={f.adsEnabled}
          onToggle={(b) => setF({ ...f, adsEnabled: b })}
          ok={f.adsId === '' || AW_RE.test(f.adsId)}
          placeholder="AW-XXXXXXXXX"
        />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-bold text-navy-700">Conversion label</p>
        <p className="mt-1 text-xs text-muted">
          Google Ads me conversion banane par milte hain. Bina Ads ID ke ye
          kaam nahi karte.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Small
            label="Call / WhatsApp"
            hint="tel: aur wa.me click par"
            value={f.adsCallLabel}
            onChange={(v) => setF({ ...f, adsCallLabel: v })}
          />
          <Small
            label="Booking form"
            hint="form bharne par"
            value={f.adsFormLabel}
            onChange={(v) => setF({ ...f, adsFormLabel: v })}
          />
          <Small
            label="Purchase"
            hint="order complete par"
            value={f.adsPurchaseLabel}
            onChange={(v) => setF({ ...f, adsPurchaseLabel: v })}
          />
        </div>
      </div>

      {/* ── Live preview ──────────────────────────────────────────────── */}
      <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50/60 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Site par abhi ye chalega
        </p>
        {live.length > 0 ? (
          <ul className="mt-1 space-y-0.5 text-sm text-navy-800">
            {live.map((l) => (
              <li key={l}>✅ {l}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm font-bold text-red-700">
            ⚠️ Koi tag chalu nahi hai — site par kuch bhi track nahi hoga
          </p>
        )}
        <p className="mt-2 text-xs text-muted">
          Tag sirf rokadoctor.in par chalta hai. Localhost aur Vercel preview
          par jaan boojh kar band hai, taaki apni testing asli report kharab
          na kare.
        </p>
      </div>

      {dupes.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-bold">⚠️ Do baar ginne ka khatra</p>
          <ul className="mt-1 space-y-1">
            {dupes.map((d) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs">
            Check karne ka tarika: tagmanager.google.com kholo → apna
            container → Tags. Agar wahan wahi ID dikhe jo upar likhi hai, to
            upar wala switch OFF kar do.
          </p>
        </div>
      )}

      {errs.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-red-700">
          {errs.map((m) => (
            <li key={m}>• {m}</li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={saving || errs.length > 0}
        className="mt-5 rounded-xl bg-aqua-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-aqua-600 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Google Tag'}
      </button>
    </section>
  );
}

/* ── chhote local helpers ──────────────────────────────────────────────── */

function Row({
  label,
  hint,
  value,
  onChange,
  on,
  onToggle,
  ok,
  placeholder,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  on: boolean;
  onToggle: (b: boolean) => void;
  ok: boolean;
  placeholder: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-bold text-navy-700">{label}</label>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted">
          <input
            type="checkbox"
            checked={on}
            onChange={(e) => onToggle(e.target.checked)}
            className="h-4 w-4 rounded text-aqua-500"
          />
          {on ? 'Chalu' : 'Band'}
        </label>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        placeholder={placeholder}
        spellCheck={false}
        className={`mt-2 w-full rounded-lg border px-3 py-2 font-mono text-sm outline-none ${
          ok ? 'border-slate-300 focus:border-aqua-500' : 'border-red-400 bg-red-50'
        }`}
      />
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

function Small({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-navy-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        placeholder="khaali"
        spellCheck={false}
        className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs outline-none focus:border-aqua-500"
      />
      <p className="mt-0.5 text-[11px] text-muted">{hint}</p>
    </div>
  );
}
