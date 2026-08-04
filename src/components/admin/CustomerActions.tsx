'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CustomerActions({
  id, name, phone, banned, notes,
}: {
  id: string; name: string; phone: string; banned: boolean; notes: string;
}) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState(notes);
  const router = useRouter();

  async function act(action: 'ban' | 'unban' | 'note', payload?: object) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed');
      toast.success(data.message);
      setEditing(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shrink-0 space-y-2">
      {editing ? (
        <div className="w-56 space-y-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
            placeholder="Internal note about this customer…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => act('note', { notes: noteText })}
              disabled={busy}
              className="flex-1 rounded-lg bg-aqua-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-aqua-600 disabled:opacity-60"
            >
              Save
            </button>
            <button
              onClick={() => { setEditing(false); setNoteText(notes); }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-navy-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <a
            href={`https://wa.me/91${phone}?text=${encodeURIComponent(`Hi ${name.split(' ')[0]}, this is AquaNexa.`)}`}
            target="_blank" rel="noopener noreferrer"
            className="block rounded-lg bg-emerald-50 px-4 py-2 text-center text-xs font-bold text-emerald-700 hover:bg-emerald-100"
          >
            💬 WhatsApp
          </a>
          <button
            onClick={() => setEditing(true)}
            className="block w-full rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-navy-700 hover:bg-slate-50"
          >
            📝 {notes ? 'Edit note' : 'Add note'}
          </button>
          <button
            onClick={() => {
              if (banned || confirm(`Ban ${name}? They will not be able to sign in or order.`)) {
                act(banned ? 'unban' : 'ban');
              }
            }}
            disabled={busy}
            className={`block w-full rounded-lg px-4 py-2 text-xs font-bold disabled:opacity-60 ${
              banned
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            {busy ? '…' : banned ? '✓ Unban' : '🚫 Ban'}
          </button>
        </>
      )}
    </div>
  );
}
