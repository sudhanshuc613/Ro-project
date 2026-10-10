'use client';

/**
 * SITE IMAGE MANAGER — har banner aur photo admin se badalne ke liye.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Owner: "sare jagh ke jaha jaha banners ya photo lage hai har jagh ke
 *         option de na admin panel mai taki mai bannerse ya photo change
 *         kar saku"
 *
 * Har slot ke liye:
 *   • abhi kaunsi image lagi hai — preview
 *   • wo kahan-kahan dikhti hai, kitne page par asar padega
 *   • recommended size aur ek kaam ka tip
 *   • upload / alt text badlo / default par wapas
 *
 * 🔴 TEEN CHEEZ JO YE KHUD SAMBHALTA HAI (taaki SEO na gire)
 * ──────────────────────────────────────────────────────────
 *   1. ALT TEXT ZAROORI — bina alt ke save nahi hota. Khaali alt hi wo
 *      cheez hai jo image SEO khatam karti hai.
 *   2. FILE SIZE — upload ke baad size dikhta hai. 300 KB se upar par
 *      warning, 800 KB se upar par laal. Bhaari image LCP girati hai aur
 *      LCP ranking + Google Ads Quality Score dono me ginta hai.
 *   3. DEFAULT PAR WAPAS — galat image chadh gayi to ek click me purani
 *      wali wapas. Kuch permanently nahi tootta.
 */

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import ImageUploader, { type UploadedImage } from '@/components/admin/ImageUploader';
import { IMAGE_GROUPS, type ImageSlot } from '@/lib/seo/site-images';

interface Row extends ImageSlot {
  currentUrl: string;
  currentAlt: string;
  isOverridden: boolean;
}

export default function SiteImageManager({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState<Record<string, string>>({});
  const [sizeInfo, setSizeInfo] = useState<Record<string, number>>({});

  async function save(key: string, url: string, alt: string) {
    if (!alt.trim()) {
      toast.error('Alt text likhna zaroori hai — bina iske Google image ko samajh nahi paata');
      return;
    }
    setBusy(key);
    try {
      const r = await fetch('/api/admin/site-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, url, alt }),
      });
      const d = await r.json();
      if (!r.ok) {
        toast.error(d.message || 'Save nahi hua');
        return;
      }
      setRows((p) => p.map((x) => (x.key === key ? { ...x, currentUrl: url, currentAlt: alt, isOverridden: true } : x)));
      setOpenKey(null);
      toast.success('Lag gaya — site par turant dikhega');
    } catch {
      toast.error('Network problem');
    } finally {
      setBusy(null);
    }
  }

  async function reset(key: string, defaultUrl: string, defaultAlt: string) {
    setBusy(key);
    try {
      const r = await fetch(`/api/admin/site-images?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
      if (!r.ok) { toast.error('Reset nahi hua'); return; }
      setRows((p) => p.map((x) => (x.key === key ? { ...x, currentUrl: defaultUrl, currentAlt: defaultAlt, isOverridden: false } : x)));
      toast.success('Purani wali wapas aa gayi');
    } finally {
      setBusy(null);
    }
  }

  function onUploaded(key: string, imgs: UploadedImage[]) {
    const img = imgs[0];
    if (!img) return;
    setSizeInfo((p) => ({ ...p, [key]: img.bytes }));
    const row = rows.find((x) => x.key === key);
    setRows((p) => p.map((x) => (x.key === key ? { ...x, currentUrl: img.url } : x)));
    setAltDraft((p) => ({ ...p, [key]: p[key] ?? row?.currentAlt ?? '' }));
    toast.success('Upload ho gaya — ab alt text check karke Save dabaiye');
  }

  return (
    <div className="space-y-8">
      {IMAGE_GROUPS.map((g) => {
        const group = rows.filter((r) => r.group === g);
        if (!group.length) return null;
        return (
          <section key={g}>
            <h2 className="mb-3 font-display text-lg font-black text-navy-900">{g}</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {group.map((r) => {
                const open = openKey === r.key;
                const bytes = sizeInfo[r.key];
                const heavy = bytes && bytes > 800 * 1024;
                const warn = bytes && bytes > 300 * 1024 && !heavy;
                return (
                  <article key={r.key} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex gap-4">
                      <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                        <Image
                          src={r.currentUrl}
                          alt={r.currentAlt}
                          fill
                          sizes="128px"
                          className="object-cover"
                          unoptimized={r.currentUrl.startsWith('/api/media/')}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-navy-900">{r.label}</h3>
                          {r.isOverridden && (
                            <span className="rounded-full bg-aqua-100 px-2 py-0.5 text-[10px] font-bold text-aqua-800">
                              badli hui
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted">{r.usedOn}</p>
                        <p className="mt-1 text-xs font-semibold text-navy-700">{r.pages}</p>
                        <p className="mt-1 text-[11px] text-muted">Size: {r.size}</p>
                      </div>
                    </div>

                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
                      💡 {r.tip}
                    </p>

                    {!open ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => { setOpenKey(r.key); setAltDraft((p) => ({ ...p, [r.key]: r.currentAlt })); }}
                          className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-bold text-white hover:bg-navy-800"
                        >
                          Image badlo
                        </button>
                        {r.isOverridden && (
                          <button
                            type="button"
                            disabled={busy === r.key}
                            onClick={() => reset(r.key, r.defaultUrl, r.defaultAlt)}
                            className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-navy-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                          >
                            Purani wali wapas
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                        {/* 🆕 11 Oct 2026 — slot ki asli size uploader ko di ja
                            rahi hai. Isse image BHEJNE SE PEHLE browser me hi
                            isi ratio me cut hoti hai aur WebP ban jaati hai.
                            Owner ka 6.6 MB wala banner isi wajah se fail ho
                            raha tha (Vercel ka 4.5 MB request limit). */}
                        <ImageUploader
                          folder="site"
                          multiple={false}
                          compact
                          targetW={r.targetW}
                          targetH={r.targetH}
                          fit={r.fit}
                          onUploaded={(imgs) => onUploaded(r.key, imgs)}
                        />
                        {bytes != null && (
                          <p className={`text-xs font-bold ${heavy ? 'text-red-700' : warn ? 'text-amber-700' : 'text-emerald-700'}`}>
                            {heavy ? '🔴' : warn ? '⚠️' : '✅'} File {Math.round(bytes / 1024)} KB
                            {heavy && ' — bahut bhaari. Page dheema hoga aur ranking par asar padega. Chhoti image lijiye.'}
                            {warn && ' — thodi bhaari hai, par chal jayegi.'}
                            {!heavy && !warn && ' — size bilkul theek.'}
                          </p>
                        )}
                        <div>
                          <label className="mb-1 block text-xs font-bold text-navy-800" htmlFor={`alt-${r.key}`}>
                            Alt text <span className="text-red-600">*</span>{' '}
                            <span className="font-normal text-muted">— Google isi se image samajhta hai</span>
                          </label>
                          <input
                            id={`alt-${r.key}`}
                            value={altDraft[r.key] ?? ''}
                            onChange={(e) => setAltDraft((p) => ({ ...p, [r.key]: e.target.value }))}
                            maxLength={200}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            placeholder={r.defaultAlt}
                          />
                          <p className="mt-1 text-[11px] text-muted">
                            {(altDraft[r.key] ?? '').length}/200 &middot; Patna aur RO dono shabd rakhna achha rehta hai
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busy === r.key}
                            onClick={() => save(r.key, r.currentUrl, altDraft[r.key] ?? '')}
                            className="rounded-lg bg-cta-green px-4 py-2 text-sm font-bold text-white hover:bg-cta-greenDark disabled:opacity-50"
                          >
                            {busy === r.key ? 'Save ho raha…' : 'Save karo'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenKey(null)}
                            className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-navy-700 ring-1 ring-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
