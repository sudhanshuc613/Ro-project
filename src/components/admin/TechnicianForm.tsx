'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const SKILLS = ['RO_REPAIR', 'UV', 'UF', 'COMMERCIAL_PLANT', 'PLUMBING', 'INSTALLATION', 'ELECTRICAL'];

const PATNA_PINCODES = [
  '800001','800002','800003','800004','800005','800006','800007','800008',
  '800009','800010','800011','800012','800013','800014','800016','800020',
  '800023','800024','800025','800026','800027','801503','801505','801105',
];

export default function TechnicianForm() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [f, setF] = useState({
    fullName: '', phone: '', employeeCode: '',
    maxDailyJobs: 8, skills: ['RO_REPAIR'] as string[], servicePincodes: [] as string[],
  });

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed');
      toast.success(`${f.fullName} added to the team`);
      setF({ fullName: '', phone: '', employeeCode: '', maxDailyJobs: 8, skills: ['RO_REPAIR'], servicePincodes: [] });
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  const toggle = (key: 'skills' | 'servicePincodes', value: string) =>
    setF((p) => ({
      ...p,
      [key]: p[key].includes(value) ? p[key].filter((x) => x !== value) : [...p[key], value],
    }));

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-aqua-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-aqua-600"
      >
        + Add Technician
      </button>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-aqua-200 bg-white p-5">
      <h2 className="font-display text-lg font-bold text-navy-700">Add Technician</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-navy-700">Full Name *</span>
          <input value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })}
            placeholder="Ramesh Kumar" className={inp} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-navy-700">Mobile *</span>
          <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '') })}
            maxLength={10} inputMode="numeric" placeholder="9876543210" className={inp} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-navy-700">Employee Code *</span>
          <input value={f.employeeCode} onChange={(e) => setF({ ...f, employeeCode: e.target.value.toUpperCase() })}
            placeholder="TECH-004" className={inp} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-navy-700">Max jobs per day</span>
          <input type="number" value={f.maxDailyJobs}
            onChange={(e) => setF({ ...f, maxDailyJobs: Number(e.target.value) })} className={inp} />
        </label>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold text-navy-700">Skills</p>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((s) => (
            <button key={s} type="button" onClick={() => toggle('skills', s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                f.skills.includes(s) ? 'bg-aqua-500 text-white' : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
              }`}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold text-navy-700">
          Pincodes covered
          <span className="ml-2 text-xs font-normal text-muted">
            (jobs in these areas get auto-assigned to them first)
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PATNA_PINCODES.map((p) => (
            <button key={p} type="button" onClick={() => toggle('servicePincodes', p)}
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                f.servicePincodes.includes(p) ? 'bg-aqua-500 text-white' : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button onClick={save} disabled={saving || !f.fullName || !f.phone || !f.employeeCode}
          className="rounded-lg bg-aqua-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-aqua-600 disabled:opacity-50">
          {saving ? 'Saving…' : 'Add Technician'}
        </button>
        <button onClick={() => setOpen(false)}
          className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-bold text-navy-700 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

const inp = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-100';
