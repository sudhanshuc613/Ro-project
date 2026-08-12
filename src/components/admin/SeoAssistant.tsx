'use client';

/**
 * SeoAssistant — live SEO coach inside the product form.
 *
 * Shows, in real time as the admin types:
 *   • a hard SEO score with every failing check spelled out in Hinglish
 *   • 3 ready-made meta titles built on the Google Shopping title formula
 *     (Brand → Product Type → Key Attribute → Capacity), each one click-to-apply
 *   • a meta description sized to the 158-char SERP cut-off
 *   • the keyword bank Indian RO buyers actually type
 *   • a live Google SERP preview with real truncation
 *
 * Purely additive — it never changes anything unless the admin clicks Apply.
 */
import { useMemo, useState } from 'react';
import {
  scoreProductSeo, suggestMetaTitles, suggestMetaDescription, suggestKeywords,
  suggestProductName, type ProductSeoInput,
} from '@/lib/seo/product-seo';

export default function SeoAssistant({
  data, onApplyTitle, onApplyDescription, onApplyKeywords, onApplyName, onGoTo,
}: {
  data: ProductSeoInput;
  onApplyTitle: (v: string) => void;
  onApplyDescription: (v: string) => void;
  onApplyKeywords: (v: string) => void;
  onApplyName?: (v: string) => void;
  onGoTo?: (tab: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const report = useMemo(() => scoreProductSeo(data), [data]);
  const titles = useMemo(() => suggestMetaTitles(data), [data]);
  const desc = useMemo(() => suggestMetaDescription(data), [data]);
  const keywords = useMemo(() => suggestKeywords(data), [data]);
  const names = useMemo(() => suggestProductName(data), [data]);

  const failing = report.checks.filter((c) => !c.ok);
  const shown = showAll ? report.checks : failing;

  const ring =
    report.score >= 85 ? 'text-emerald-600' :
    report.score >= 60 ? 'text-amber-600' : 'text-red-600';
  const bar =
    report.score >= 85 ? 'bg-emerald-500' :
    report.score >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-4">
      {/* ── Score header ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">SEO score</p>
            <p className={`font-display text-3xl font-bold ${ring}`}>{report.score}<span className="text-lg text-slate-300">/100</span></p>
          </div>
          <div className="text-right text-sm">
            {report.criticalOpen > 0 ? (
              <p className="font-bold text-red-600">{report.criticalOpen} zaroori cheez baaki hai</p>
            ) : report.score >= 85 ? (
              <p className="font-bold text-emerald-600">Publish karne layak ✓</p>
            ) : (
              <p className="font-bold text-amber-600">Chalega, par aur better ho sakta hai</p>
            )}
            <p className="text-xs text-muted">{report.checks.filter((c) => c.ok).length} / {report.checks.length} check pass</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${report.score}%` }} />
        </div>
      </div>

      {/* ── Google preview ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted">
          Google me aisa dikhega
        </p>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-[#5f6368]">rokadoctor.in › products › {data.slug || 'slug'}</p>
          <p className="mt-0.5 truncate text-[17px] leading-snug text-[#1a0dab]">
            {(data.seo?.metaTitle || data.name || 'Product title').slice(0, 60)}
            {(data.seo?.metaTitle || data.name || '').length > 60 && '…'}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[#4d5156]">
            {(data.seo?.metaDescription || data.shortDescription || 'Koi description set nahi hai').slice(0, 160)}
          </p>
        </div>
      </div>

      {/* ── Failing checks ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-navy-700">
            {failing.length === 0 ? 'Sab check pass ✓' : `${failing.length} cheez theek karni hai`}
          </p>
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className="text-xs font-bold text-aqua-600 hover:underline"
          >
            {showAll ? 'Sirf problem dikhao' : 'Poori list dikhao'}
          </button>
        </div>

        <ul className="space-y-2">
          {shown.map((c) => (
            <li
              key={c.id}
              className={`rounded-lg p-2.5 text-sm ring-1 ${
                c.ok ? 'bg-emerald-50 ring-emerald-100'
                  : c.severity === 'critical' ? 'bg-red-50 ring-red-100'
                  : c.severity === 'important' ? 'bg-amber-50 ring-amber-100'
                  : 'bg-slate-50 ring-slate-100'
              }`}
            >
              <p className="font-semibold text-navy-700">
                {c.ok ? '✓' : c.severity === 'critical' ? '🔴' : c.severity === 'important' ? '🟡' : '⚪'} {c.label}
              </p>
              {!c.ok && <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{c.detail}</p>}
            </li>
          ))}
          {shown.length === 0 && (
            <li className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              Sab kuch bhara hua hai. Ab Status → Active karke save kar do.
            </li>
          )}
        </ul>
      </div>

      {/* ── Product name suggestions ── */}
      {onApplyName && names.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-navy-700">Product name ka behtar version</p>
          <p className="mt-0.5 text-xs text-muted">
            Formula: Brand → kya cheez hai → khaas feature → size. Yahi Flipkart aur Amazon use karte hain.
          </p>
          <div className="mt-3 space-y-2">
            {names.map((n) => (
              <div key={n} className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5">
                <p className="flex-1 text-sm text-navy-700">{n}</p>
                <button
                  type="button"
                  onClick={() => onApplyName(n)}
                  className="shrink-0 rounded-md bg-aqua-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-aqua-600"
                >
                  Lagao
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Title suggestions ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-bold text-navy-700">Meta title — teen option</p>
        <p className="mt-0.5 text-xs text-muted">
          50–58 character wale title Google sabse kam badalta hai. Har option pe length likhi hai.
        </p>
        <div className="mt-3 space-y-2">
          {titles.map((t) => (
            <div key={t.value} className="rounded-lg bg-slate-50 p-2.5">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm text-navy-700">{t.value}</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    <span className={t.len >= 45 && t.len <= 60 ? 'font-bold text-emerald-600' : 'font-bold text-amber-600'}>
                      {t.len} chars
                    </span>
                    {' · '}{t.label} · {t.note}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onApplyTitle(t.value)}
                  className="shrink-0 rounded-md bg-aqua-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-aqua-600"
                >
                  Lagao
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Description suggestion ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-bold text-navy-700">Meta description</p>
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 p-2.5">
          <div className="flex-1">
            <p className="text-sm leading-relaxed text-navy-700">{desc}</p>
            <p className="mt-1 text-[11px] font-bold text-emerald-600">{desc.length} chars</p>
          </div>
          <button
            type="button"
            onClick={() => onApplyDescription(desc)}
            className="shrink-0 rounded-md bg-aqua-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-aqua-600"
          >
            Lagao
          </button>
        </div>
      </div>

      {/* ── Keyword bank ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-navy-700">Log Google pe ye type karte hain</p>
            <p className="mt-0.5 text-xs text-muted">Kisi bhi word pe click karke keywords field me daal do.</p>
          </div>
          <button
            type="button"
            onClick={() => onApplyKeywords(keywords.flatMap((g) => g.items).slice(0, 14).join(', '))}
            className="shrink-0 rounded-md border border-aqua-200 px-2.5 py-1 text-xs font-bold text-aqua-700 hover:bg-aqua-50"
          >
            Sab lagao
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {keywords.map((g) => (
            <div key={g.group}>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">{g.group}</p>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      const cur = (data.seo?.metaKeywords || '').split(',').map((x) => x.trim()).filter(Boolean);
                      if (!cur.includes(k)) onApplyKeywords([...cur, k].join(', '));
                    }}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-navy-700 transition hover:bg-aqua-100 hover:text-aqua-700"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {onGoTo && (
        <p className="text-center text-xs text-muted">
          Title / description{' '}
          <button type="button" onClick={() => onGoTo('SEO')} className="font-bold text-aqua-600 hover:underline">
            SEO tab
          </button>{' '}
          me edit hote hain · images{' '}
          <button type="button" onClick={() => onGoTo('Images')} className="font-bold text-aqua-600 hover:underline">
            Images tab
          </button>{' '}
          me
        </p>
      )}
    </div>
  );
}
