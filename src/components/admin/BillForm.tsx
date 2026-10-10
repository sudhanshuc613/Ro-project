'use client';

/**
 * BILL FORM — naya bill banane aur purana badalne wala ek hi form.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Design ke 4 faisle, aur kyun:
 *
 * 1. PHONE PEHLE, BAAKI SAB BAAD ME.
 *    10 ank type karte hi purane grahak ka naam, pata, area apne aap bhar
 *    jaate hain. Repeat customer ka pata dobara likhna RO dukaan me sabse
 *    zyada waqt khaane wala kaam hai.
 *
 * 2. TOTAL LIVE DIKHTA HAI, PAR SERVER APNA HISAAB KHUD KARTA HAI.
 *    Yahan dikhne wala total sirf aankh ke liye hai. Save pe server
 *    `computeTotals()` dobara chalata hai. DevTools se number badalne se
 *    bill nahi badlega.
 *
 * 3. WARRANTY TEMPLATE CHUNO → T&C APNE AAP BHAR JAATI HAI.
 *    Har line edit bhi ho sakti hai, nayi line jod bhi sakte hain. Template
 *    sirf shuruaat deta hai, jail nahi.
 *
 * 4. "MACHINE RECORD BANAO" CHECKBOX BILL KE ANDAR HI HAI.
 *    Warna aadmi bill bana ke bhool jaata hai, aur 9 mahine baad pata hi
 *    nahi chalta ki kiski warranty kab khatm ho rahi hai. Bill aur machine
 *    record ek hi saans me banta hai.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  WARRANTY_TEMPLATES,
  DEFAULT_TEMPLATE_BY_TYPE,
  PAYMENT_MODES,
  BILL_TYPE_LABELS,
  getTemplate,
} from '@/lib/billing/warranty-templates';
import { computeTotals, billINR, toInputDate, addMonths } from '@/lib/billing/compute';
import { amountToWords } from '@/lib/billing/amount-words';
import { emptyItem, type BillItemRow, type BillFormInitial } from '@/lib/billing/bill-form-types';

/* ── types ─────────────────────────────────────────────────────────────── */
/* Data-shape aur emptyItem() `@/lib/billing/bill-form-types` me hain — kyunki
   yeh file 'use client' hai aur client file ka non-component export server pe
   function nahi rehta (ek 500 isi wajah se aa chuka hai). */

type ItemRow = BillItemRow;
export type { BillFormInitial };

/* ── small ui bits ─────────────────────────────────────────────────────── */

function Field({
  label,
  hint,
  error,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</span>
      {children}
      {hint && !error ? <span className="mt-1 block text-[11px] text-slate-500">{hint}</span> : null}
      {error ? <span className="mt-1 block text-[11px] font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy-700 outline-none focus:border-aqua-500 focus:ring-2 focus:ring-aqua-500/20';

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-display text-base font-bold text-navy-700">{title}</h2>
      {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ── main ──────────────────────────────────────────────────────────────── */

export default function BillForm({ initial, mode }: { initial: BillFormInitial; mode: 'create' | 'edit' }) {
  const router = useRouter();
  const [f, setF] = useState<BillFormInitial>(initial);
  const [items, setItems] = useState<ItemRow[]>(initial.items.length ? initial.items : [emptyItem()]);
  const [terms, setTerms] = useState<string[]>(initial.terms);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [clientFound, setClientFound] = useState<string | null>(null);

  /* machine record */
  const [createUnit, setCreateUnit] = useState(false);
  const [unit, setUnit] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    capacity: '',
    machineKind: 'DOMESTIC',
    installedOn: initial.issueDate,
    partsWarrantyMonths: '12',
    serviceWarrantyMonths: '12',
    freeServicesTotal: '4',
    serviceIntervalDays: '90',
    inletTds: '',
    outletTds: '',
  });

  /* amc record */
  const [createAmc, setCreateAmc] = useState(false);
  const [amc, setAmc] = useState({
    planName: '',
    machineBrand: '',
    machineModel: '',
    price: '',
    startsOn: initial.issueDate,
    endsOn: toInputDate(addMonths(initial.issueDate || new Date(), 12)),
    visitsIncluded: '4',
    coversFilters: false,
    coversMembrane: false,
  });

  const set = <K extends keyof BillFormInitial>(k: K, v: BillFormInitial[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  /* ── totals (live preview) ───────────────────────────────────────────── */
  const totals = useMemo(
    () =>
      computeTotals({
        items: items.map((i) => ({ unitPrice: i.unitPrice || 0, quantity: i.quantity || 0 })),
        discountAmount: f.discountAmount || 0,
        taxRate: f.taxRate || 0,
        roundToRupee: f.roundToRupee,
        amountPaid: f.amountPaid || 0,
      }),
    [items, f.discountAmount, f.taxRate, f.roundToRupee, f.amountPaid],
  );

  /* ── grahak khud dhoondo ─────────────────────────────────────────────── */
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lookupPhone = useCallback(async (phone: string) => {
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(clean)) {
      setClientFound(null);
      return;
    }
    try {
      const res = await fetch(`/api/admin/clients?phone=${clean}`);
      const data = await res.json();
      if (data?.client) {
        const c = data.client;
        setClientFound(c.fullName);
        setF((p) => ({
          ...p,
          customerName: p.customerName || c.fullName || '',
          customerAddress: p.customerAddress || c.addressLine || '',
          customerAltPhone: p.customerAltPhone || c.altPhone || '',
          clientArea: p.clientArea || c.area || '',
          clientPincode: p.clientPincode || c.pincode || '',
          customerGstin: p.customerGstin || c.gstin || '',
        }));
      } else {
        setClientFound(null);
      }
    } catch {
      /* lookup fail hone se form nahi rukta */
    }
  }, []);

  useEffect(() => {
    if (mode === 'edit') return;
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    lookupTimer.current = setTimeout(() => lookupPhone(f.customerPhone), 450);
    return () => {
      if (lookupTimer.current) clearTimeout(lookupTimer.current);
    };
  }, [f.customerPhone, lookupPhone, mode]);

  /* ── template badla → terms bhar do ──────────────────────────────────── */
  function applyTemplate(key: string) {
    set('warrantyTemplate', key);
    const t = getTemplate(key);
    if (!t) return;
    setTerms([...t.terms]);
    setUnit((u) => ({
      ...u,
      partsWarrantyMonths: String(t.partsWarrantyMonths),
      serviceWarrantyMonths: String(t.serviceWarrantyMonths),
      freeServicesTotal: String(t.freeServices),
      serviceIntervalDays: String(t.serviceIntervalDays || 90),
    }));
    toast.success(`"${t.label}" ki terms bhar di gayi — ab chahein to edit kar lein`);
  }

  function changeType(newType: string) {
    set('type', newType);
    const key = DEFAULT_TEMPLATE_BY_TYPE[newType];
    if (key && (!f.warrantyTemplate || terms.length === 0)) applyTemplate(key);
    if (newType === 'SALE' || newType === 'INSTALLATION') setCreateUnit(true);
    if (newType === 'AMC') setCreateAmc(true);
  }

  /* ── items ───────────────────────────────────────────────────────────── */
  const setItem = (idx: number, patch: Partial<ItemRow>) =>
    setItems((p) => p.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  /** MRP aur rate dono ho to reference bill wali line khud ban jaati hai. */
  function autoDetail(idx: number) {
    const it = items[idx];
    const mrp = Number(it.mrp);
    const price = Number(it.unitPrice);
    if (mrp > 0 && price > 0 && mrp > price) {
      setItem(idx, {
        detailNote: `(Original Price: ₹${billINR(mrp)}, Discounted Price: ₹${billINR(price)})`,
      });
    }
  }

  /* ── save ────────────────────────────────────────────────────────────── */
  async function save(thenPrint: boolean) {
    setBusy(true);
    setErrors({});

    const payload = {
      billNumber: f.billNumber,
      type: f.type,
      status: f.status,
      customerName: f.customerName,
      customerPhone: f.customerPhone,
      customerAltPhone: f.customerAltPhone,
      customerAddress: f.customerAddress,
      customerGstin: f.customerGstin,
      saveClient: true,
      clientArea: f.clientArea,
      clientPincode: f.clientPincode,
      issueDate: f.issueDate,
      dueDate: f.dueDate,
      items: items
        .filter((i) => i.description.trim())
        .map((i) => ({
          description: i.description,
          detailNote: i.detailNote,
          hsnCode: i.hsnCode,
          brand: i.brand,
          model: i.model,
          serialNumber: i.serialNumber,
          mrp: i.mrp ? Number(i.mrp) : undefined,
          unitPrice: Number(i.unitPrice || 0),
          quantity: Number(i.quantity || 1),
        })),
      discountAmount: Number(f.discountAmount || 0),
      taxRate: Number(f.taxRate || 0),
      taxMode: f.taxMode,
      roundToRupee: f.roundToRupee,
      amountPaid: Number(f.amountPaid || 0),
      paymentMode: f.paymentMode,
      paymentNote: f.paymentNote,
      warrantyTemplate: f.warrantyTemplate,
      terms: terms.filter((t) => t.trim()),
      showStamp: f.showStamp,
      stampText: f.stampText,
      showSign: f.showSign,
      footerNote: f.footerNote,
      shareEnabled: f.shareEnabled,
      internalNote: f.internalNote,
      createUnit,
      unit: createUnit
        ? {
            brand: unit.brand,
            model: unit.model,
            serialNumber: unit.serialNumber,
            capacity: unit.capacity,
            machineKind: unit.machineKind,
            installedOn: unit.installedOn,
            partsWarrantyMonths: Number(unit.partsWarrantyMonths || 0),
            serviceWarrantyMonths: Number(unit.serviceWarrantyMonths || 0),
            freeServicesTotal: Number(unit.freeServicesTotal || 0),
            freeServicesUsed: 0,
            serviceIntervalDays: Number(unit.serviceIntervalDays || 90),
            inletTds: unit.inletTds ? Number(unit.inletTds) : undefined,
            outletTds: unit.outletTds ? Number(unit.outletTds) : undefined,
            status: 'ACTIVE',
          }
        : undefined,
      createAmc,
      amc: createAmc
        ? {
            planName: amc.planName,
            machineBrand: amc.machineBrand,
            machineModel: amc.machineModel,
            price: Number(amc.price || 0),
            startsOn: amc.startsOn,
            endsOn: amc.endsOn,
            visitsIncluded: Number(amc.visitsIncluded || 4),
            visitsUsed: 0,
            coversFilters: amc.coversFilters,
            coversMembrane: amc.coversMembrane,
            status: 'ACTIVE',
          }
        : undefined,
    };

    try {
      const url = mode === 'create' ? '/api/admin/billing' : `/api/admin/billing/${initial.id}`;
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data?.errors?.fieldErrors ?? {});
        toast.error(data?.message ?? 'Save nahi hua');
        return;
      }

      toast.success(mode === 'create' ? `Bill ${data.billNumber} ban gaya` : 'Bill update ho gaya');
      if (thenPrint) router.push(`/admin/print/${data.id}`);
      else router.push('/admin/billing');
      router.refresh();
    } catch {
      toast.error('Server se baat nahi ho payi');
    } finally {
      setBusy(false);
    }
  }

  const tpl = getTemplate(f.warrantyTemplate);

  return (
    <div className="space-y-5 pb-28">
      {/* ── 1. BILL KI BUNIYAD ─────────────────────────────────────────── */}
      <Section title="1. Bill ki basic detail">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Bill number" error={errors.billNumber?.[0]}>
            <input className={inputCls} value={f.billNumber} onChange={(e) => set('billNumber', e.target.value)} />
          </Field>
          <Field label="Bill ki tarikh" error={errors.issueDate?.[0]}>
            <input type="date" className={inputCls} value={f.issueDate} onChange={(e) => set('issueDate', e.target.value)} />
          </Field>
          <Field label="Kis cheez ka bill">
            <select className={inputCls} value={f.type} onChange={(e) => changeType(e.target.value)}>
              {Object.entries(BILL_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Haalat" hint="Paisa kitna mila uske hisaab se khud set hota hai">
            <select className={inputCls} value={f.status} onChange={(e) => set('status', e.target.value)}>
              <option value="PAID">Poora paisa mil gaya</option>
              <option value="UNPAID">Paisa baaki hai</option>
              <option value="PARTIAL">Aadha mila</option>
              <option value="DRAFT">Draft (abhi pakka nahi)</option>
              <option value="CANCELLED">Cancel</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* ── 2. GRAHAK ──────────────────────────────────────────────────── */}
      <Section
        title="2. Grahak"
        subtitle="Phone number daalte hi purana grahak mil gaya to naam-pata khud bhar jayega"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Mobile number *" error={errors.customerPhone?.[0]} hint={clientFound ? `✅ Purana grahak mila: ${clientFound}` : undefined}>
            <input
              className={inputCls}
              inputMode="numeric"
              maxLength={13}
              placeholder="8969821440"
              value={f.customerPhone}
              onChange={(e) => set('customerPhone', e.target.value)}
            />
          </Field>
          <Field label="Grahak ka naam *" error={errors.customerName?.[0]}>
            <input className={inputCls} value={f.customerName} onChange={(e) => set('customerName', e.target.value)} />
          </Field>
          <Field label="Doosra number">
            <input className={inputCls} value={f.customerAltPhone} onChange={(e) => set('customerAltPhone', e.target.value)} />
          </Field>
          <Field label="Pata" className="lg:col-span-2" hint="Enter dabake nayi line — bill pe waise hi chhapega">
            <textarea
              rows={3}
              className={inputCls}
              placeholder={'Ramna Road, Ishrat Mansion,\nAshok Rajpath, Piller No 58,\nOpp. Patna University, Patna'}
              value={f.customerAddress}
              onChange={(e) => set('customerAddress', e.target.value)}
            />
          </Field>
          <div className="grid gap-4">
            <Field label="Area" hint="Kankarbagh, Boring Road…">
              <input className={inputCls} value={f.clientArea} onChange={(e) => set('clientArea', e.target.value)} />
            </Field>
            <Field label="Pincode" error={errors.clientPincode?.[0]}>
              <input className={inputCls} inputMode="numeric" maxLength={6} value={f.clientPincode} onChange={(e) => set('clientPincode', e.target.value)} />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── 3. ITEMS ───────────────────────────────────────────────────── */}
      <Section title="3. Saaman / kaam" subtitle="MRP aur rate dono bharein to bill pe discount wali line khud ban jayegi">
        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start gap-3">
                <span className="mt-2 w-5 shrink-0 text-center text-sm font-bold text-slate-400">{i + 1}</span>
                <div className="grid flex-1 gap-3 md:grid-cols-12">
                  <div className="md:col-span-6">
                    <input
                      className={inputCls}
                      placeholder="Nivisha 50 LPH Commercial RO Machine"
                      value={it.description}
                      onChange={(e) => setItem(i, { description: e.target.value })}
                    />
                    <input
                      className={`${inputCls} mt-2 text-xs`}
                      placeholder="Chhoti line (optional) — jaise (Original Price: ₹36,000, Discounted Price: ₹27,000)"
                      value={it.detailNote}
                      onChange={(e) => setItem(i, { detailNote: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      className={inputCls}
                      inputMode="decimal"
                      placeholder="MRP"
                      value={it.mrp}
                      onChange={(e) => setItem(i, { mrp: e.target.value })}
                      onBlur={() => autoDetail(i)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      className={inputCls}
                      inputMode="decimal"
                      placeholder="Rate *"
                      value={it.unitPrice}
                      onChange={(e) => setItem(i, { unitPrice: e.target.value })}
                      onBlur={() => autoDetail(i)}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <input
                      className={inputCls}
                      inputMode="decimal"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={(e) => setItem(i, { quantity: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-end md:col-span-1">
                    <span className="text-sm font-bold text-navy-700">
                      ₹{billINR(totals.lineTotals[i] ?? 0)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setItems((p) => (p.length === 1 ? [emptyItem()] : p.filter((_, x) => x !== i)))}
                  className="mt-1 shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  title="Line hatao"
                >
                  ✕
                </button>
              </div>

              <details className="mt-2 pl-8">
                <summary className="cursor-pointer text-[11px] font-semibold text-slate-500">
                  Brand / model / serial / HSN (optional)
                </summary>
                <div className="mt-2 grid gap-2 sm:grid-cols-4">
                  <input className={`${inputCls} text-xs`} placeholder="Brand" value={it.brand} onChange={(e) => setItem(i, { brand: e.target.value })} />
                  <input className={`${inputCls} text-xs`} placeholder="Model" value={it.model} onChange={(e) => setItem(i, { model: e.target.value })} />
                  <input className={`${inputCls} text-xs`} placeholder="Serial no." value={it.serialNumber} onChange={(e) => setItem(i, { serialNumber: e.target.value })} />
                  <input className={`${inputCls} text-xs`} placeholder="HSN (GST ke liye)" value={it.hsnCode} onChange={(e) => setItem(i, { hsnCode: e.target.value })} />
                </div>
              </details>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setItems((p) => [...p, emptyItem()])}
          className="mt-3 rounded-lg border border-dashed border-slate-400 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          + Ek aur line jodo
        </button>
        {errors.items?.[0] ? <p className="mt-2 text-xs font-semibold text-red-600">{errors.items[0]}</p> : null}
      </Section>

      {/* ── 4. PAISA ───────────────────────────────────────────────────── */}
      <Section title="4. Paisa">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Discount (₹)">
              <input className={inputCls} inputMode="decimal" value={f.discountAmount} onChange={(e) => set('discountAmount', e.target.value)} />
            </Field>
            <Field label="GST %" hint="0 = bill pe GST nahi">
              <select className={inputCls} value={f.taxRate} onChange={(e) => { set('taxRate', e.target.value); set('taxMode', e.target.value === '0' ? 'NONE' : 'CGST_SGST'); }}>
                <option value="0">GST nahi</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </Field>
            {Number(f.taxRate) > 0 ? (
              <>
                <Field label="GST ka prakar" hint="Bihar ke andar = CGST+SGST">
                  <select className={inputCls} value={f.taxMode} onChange={(e) => set('taxMode', e.target.value)}>
                    <option value="CGST_SGST">CGST + SGST (Bihar)</option>
                    <option value="IGST">IGST (Bihar ke bahar)</option>
                  </select>
                </Field>
                <Field label="Grahak ka GSTIN">
                  <input className={inputCls} value={f.customerGstin} onChange={(e) => set('customerGstin', e.target.value.toUpperCase())} />
                </Field>
              </>
            ) : null}
            <Field label="Kitna paisa mila (₹)" hint="Poora mila to grand total jitna daal dein">
              <input className={inputCls} inputMode="decimal" value={f.amountPaid} onChange={(e) => set('amountPaid', e.target.value)} />
            </Field>
            <Field label="Kaise mila">
              <select className={inputCls} value={f.paymentMode} onChange={(e) => set('paymentMode', e.target.value)}>
                <option value="">— chunein —</option>
                {PAYMENT_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
              <input type="checkbox" className="h-4 w-4" checked={f.roundToRupee} onChange={(e) => set('roundToRupee', e.target.checked)} />
              Poore rupaye me round off karo (paise hata do)
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <Row label="Subtotal" value={`₹${billINR(totals.subtotal)}`} />
            {totals.discountAmount > 0 ? <Row label="Discount" value={`− ₹${billINR(totals.discountAmount)}`} red /> : null}
            {totals.taxAmount > 0 ? (
              f.taxMode === 'CGST_SGST' ? (
                <>
                  <Row label={`CGST ${Number(f.taxRate) / 2}%`} value={`₹${billINR(totals.taxAmount / 2)}`} />
                  <Row label={`SGST ${Number(f.taxRate) / 2}%`} value={`₹${billINR(totals.taxAmount / 2)}`} />
                </>
              ) : (
                <Row label={`IGST ${f.taxRate}%`} value={`₹${billINR(totals.taxAmount)}`} />
              )
            ) : null}
            {totals.roundOff !== 0 ? <Row label="Round off" value={`${totals.roundOff > 0 ? '+' : '−'} ₹${billINR(Math.abs(totals.roundOff))}`} /> : null}
            <div className="my-2 border-t border-slate-300" />
            <Row label="GRAND TOTAL" value={`₹${billINR(totals.grandTotal)}`} big />
            {totals.amountPaid > 0 ? <Row label="Mila" value={`₹${billINR(totals.amountPaid)}`} green /> : null}
            {totals.balanceDue > 0 ? <Row label="Baaki" value={`₹${billINR(totals.balanceDue)}`} red /> : null}
            <p className="mt-3 border-t border-slate-300 pt-2 text-[11px] italic text-slate-600">
              {amountToWords(totals.grandTotal)}
            </p>
          </div>
        </div>
      </Section>

      {/* ── 5. WARRANTY + TERMS ────────────────────────────────────────── */}
      <Section
        title="5. Warranty aur Terms & Conditions"
        subtitle="Template chunein — saari line khud bhar jayengi, phir jo chahein badal lein"
      >
        <Field label="Warranty template">
          <select className={inputCls} value={f.warrantyTemplate} onChange={(e) => applyTemplate(e.target.value)}>
            <option value="">— koi nahi —</option>
            {WARRANTY_TEMPLATES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        {tpl ? (
          <div className={`mt-3 rounded-lg border p-3 text-xs ${tpl.riskNote ? 'border-red-300 bg-red-50' : 'border-aqua-200 bg-aqua-50/50'}`}>
            <p className="text-slate-700">
              <strong>Kyun:</strong> {tpl.adminNote}
            </p>
            {tpl.riskNote ? (
              <p className="mt-2 font-semibold text-red-700">⚠️ {tpl.riskNote}</p>
            ) : null}
            <p className="mt-2 text-slate-600">
              Yeh template machine record pe set karega: parts warranty <strong>{tpl.partsWarrantyMonths} mahine</strong>,
              free service <strong>{tpl.serviceWarrantyMonths} mahine</strong>, <strong>{tpl.freeServices} free visit</strong>.
            </p>
          </div>
        ) : null}

        <div className="mt-4 space-y-2">
          {terms.map((t, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2.5 text-slate-400">•</span>
              <textarea
                rows={2}
                className={`${inputCls} text-xs`}
                value={t}
                onChange={(e) => setTerms((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
              />
              <button
                type="button"
                onClick={() => setTerms((p) => p.filter((_, j) => j !== i))}
                className="mt-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setTerms((p) => [...p, ''])}
            className="rounded-lg border border-dashed border-slate-400 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            + Apni line jodo
          </button>
        </div>
      </Section>

      {/* ── 6. MACHINE RECORD ──────────────────────────────────────────── */}
      <Section
        title="6. Machine record (warranty tracking)"
        subtitle="Tick karne par yeh machine grahak ke record me chadh jayegi — kab lagi, kitni warranty, agli service kab"
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-navy-700">
          <input type="checkbox" className="h-4 w-4" checked={createUnit} onChange={(e) => setCreateUnit(e.target.checked)} />
          Haan, is bill ke saath machine record bhi banao
        </label>

        {createUnit ? (
          <div className="mt-4 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
            <Field label="Brand *">
              <input className={inputCls} placeholder="Nivisha / Kent / Aquaguard" value={unit.brand} onChange={(e) => setUnit({ ...unit, brand: e.target.value })} />
            </Field>
            <Field label="Model">
              <input className={inputCls} value={unit.model} onChange={(e) => setUnit({ ...unit, model: e.target.value })} />
            </Field>
            <Field label="Serial number">
              <input className={inputCls} value={unit.serialNumber} onChange={(e) => setUnit({ ...unit, serialNumber: e.target.value })} />
            </Field>
            <Field label="Capacity" hint="50 LPH / 12 L">
              <input className={inputCls} value={unit.capacity} onChange={(e) => setUnit({ ...unit, capacity: e.target.value })} />
            </Field>
            <Field label="Kis tarah ki">
              <select className={inputCls} value={unit.machineKind} onChange={(e) => setUnit({ ...unit, machineKind: e.target.value })}>
                <option value="DOMESTIC">Ghar ka (Domestic)</option>
                <option value="COMMERCIAL">Commercial plant</option>
              </select>
            </Field>
            <Field label="Kab lagi *">
              <input type="date" className={inputCls} value={unit.installedOn} onChange={(e) => setUnit({ ...unit, installedOn: e.target.value })} />
            </Field>
            <Field label="Parts warranty (mahine)">
              <input className={inputCls} inputMode="numeric" value={unit.partsWarrantyMonths} onChange={(e) => setUnit({ ...unit, partsWarrantyMonths: e.target.value })} />
            </Field>
            <Field label="Free service (mahine)">
              <input className={inputCls} inputMode="numeric" value={unit.serviceWarrantyMonths} onChange={(e) => setUnit({ ...unit, serviceWarrantyMonths: e.target.value })} />
            </Field>
            <Field label="Kitni free visit">
              <input className={inputCls} inputMode="numeric" value={unit.freeServicesTotal} onChange={(e) => setUnit({ ...unit, freeServicesTotal: e.target.value })} />
            </Field>
            <Field label="Service har kitne din" hint="90 = har 3 mahine">
              <input className={inputCls} inputMode="numeric" value={unit.serviceIntervalDays} onChange={(e) => setUnit({ ...unit, serviceIntervalDays: e.target.value })} />
            </Field>
            <Field label="Inlet TDS" hint="Lagate waqt napa hua">
              <input className={inputCls} inputMode="numeric" value={unit.inletTds} onChange={(e) => setUnit({ ...unit, inletTds: e.target.value })} />
            </Field>
            <Field label="Outlet TDS">
              <input className={inputCls} inputMode="numeric" value={unit.outletTds} onChange={(e) => setUnit({ ...unit, outletTds: e.target.value })} />
            </Field>
          </div>
        ) : null}
      </Section>

      {/* ── 7. AMC ─────────────────────────────────────────────────────── */}
      <Section title="7. AMC record" subtitle="AMC becha ho to tick karein — start, end aur service due apne aap set honge">
        <label className="flex items-center gap-2 text-sm font-semibold text-navy-700">
          <input type="checkbox" className="h-4 w-4" checked={createAmc} onChange={(e) => setCreateAmc(e.target.checked)} />
          Haan, AMC record bhi banao
        </label>

        {createAmc ? (
          <div className="mt-4 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
            <Field label="Plan ka naam *" hint="Basic / Standard / Premium">
              <input className={inputCls} value={amc.planName} onChange={(e) => setAmc({ ...amc, planName: e.target.value })} />
            </Field>
            <Field label="Daam (₹)">
              <input className={inputCls} inputMode="decimal" value={amc.price} onChange={(e) => setAmc({ ...amc, price: e.target.value })} />
            </Field>
            <Field label="Kitni visit">
              <input className={inputCls} inputMode="numeric" value={amc.visitsIncluded} onChange={(e) => setAmc({ ...amc, visitsIncluded: e.target.value })} />
            </Field>
            <Field label="Shuru kab se *">
              <input type="date" className={inputCls} value={amc.startsOn} onChange={(e) => setAmc({ ...amc, startsOn: e.target.value, endsOn: toInputDate(addMonths(e.target.value || new Date(), 12)) })} />
            </Field>
            <Field label="Khatm kab *">
              <input type="date" className={inputCls} value={amc.endsOn} onChange={(e) => setAmc({ ...amc, endsOn: e.target.value })} />
            </Field>
            <Field label="Machine">
              <input className={inputCls} placeholder="Brand / model" value={amc.machineBrand} onChange={(e) => setAmc({ ...amc, machineBrand: e.target.value })} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4" checked={amc.coversFilters} onChange={(e) => setAmc({ ...amc, coversFilters: e.target.checked })} />
              Filter bhi shaamil hain
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4" checked={amc.coversMembrane} onChange={(e) => setAmc({ ...amc, coversMembrane: e.target.checked })} />
              Membrane bhi shaamil hai
            </label>
          </div>
        ) : null}
      </Section>

      {/* ── 8. CHHAPNE KI SETTING ──────────────────────────────────────── */}
      <Section title="8. Chhapne ki setting">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4" checked={f.showStamp} onChange={(e) => set('showStamp', e.target.checked)} />
            Laal stamp dikhao
          </label>
          <Field label="Stamp pe kya likha ho">
            <input className={inputCls} value={f.stampText} onChange={(e) => set('stampText', e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4" checked={f.showSign} onChange={(e) => set('showSign', e.target.checked)} />
            Signature ki line dikhao
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4" checked={f.shareEnabled} onChange={(e) => set('shareEnabled', e.target.checked)} />
            WhatsApp link chalu rakho
          </label>
          <Field label="Neeche ka message (optional)" className="sm:col-span-2 lg:col-span-4">
            <input className={inputCls} placeholder="Dhanyawaad! Aqua Perl chunne ke liye shukriya." value={f.footerNote} onChange={(e) => set('footerNote', e.target.value)} />
          </Field>
          <Field label="Apna note (grahak ko nahi dikhega)" className="sm:col-span-2 lg:col-span-4">
            <textarea rows={2} className={inputCls} value={f.internalNote} onChange={(e) => set('internalNote', e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* ── SAVE BAR ───────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:pl-[276px]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Grand total</p>
            <p className="text-xl font-bold text-navy-700">₹{billINR(totals.grandTotal)}</p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => save(false)}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy ? 'Save ho raha…' : 'Save karo'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => save(true)}
            className="rounded-xl bg-[#0056b3] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#004492] disabled:opacity-50"
          >
            {busy ? '…' : 'Save karke print karo →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, big, red, green }: { label: string; value: string; big?: boolean; red?: boolean; green?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`${big ? 'text-sm font-bold text-navy-700' : 'text-xs text-slate-600'}`}>{label}</span>
      <span
        className={[
          big ? 'text-lg font-bold' : 'text-sm font-semibold',
          red ? 'text-red-600' : green ? 'text-green-700' : 'text-navy-700',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}
