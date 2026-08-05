'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CustomerActions({
  id, name, phone, banned, notes, canResetPassword = false,
}: {
  id: string; name: string; phone: string; banned: boolean; notes: string;
  /** SUPER_ADMIN only — issuing a working credential is the most abusable action here. */
  canResetPassword?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState(notes);
  const [tempPw, setTempPw] = useState('');
  const router = useRouter();

  async function act(action: 'ban' | 'unban' | 'note' | 'reset-password', payload?: object) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed');
      if (data.tempPassword) setTempPw(data.tempPassword);
      toast.success(data.message);
      setEditing(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  /* Shown once, right after a reset. Nobody can read it back later —
     not even from the database — so it must be copied now. */
  if (tempPw) {
    return (
      <div className="w-60 shrink-0 space-y-2 rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
        <p className="text-xs font-bold text-amber-900">Temporary password</p>
        <p className="select-all break-all rounded-lg bg-white px-3 py-2 font-mono text-sm font-bold text-navy-700">
          {tempPw}
        </p>
        <p className="text-[11px] leading-snug text-amber-900">
          Read this out to {name.split(' ')[0]} now. It cannot be shown again.
          Ask them to change it after signing in.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(tempPw);
              toast.success('Copied');
            }}
            className="flex-1 rounded-lg bg-navy-700 px-3 py-1.5 text-xs font-bold text-white"
          >
            Copy
          </button>
          <a
            href={`https://wa.me/91${phone}?text=${encodeURIComponent(
              `Hi ${name.split(' ')[0]}, AquaNexa se. Aapka temporary password hai: ${tempPw}\nLogin karke turant apna naya password set kar lijiye.`,
            )}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-center text-xs font-bold text-white"
          >
            WhatsApp
          </a>
        </div>
        <button
          onClick={() => setTempPw('')}
          className="w-full text-[11px] font-semibold text-muted hover:underline"
        >
          Done — hide it
        </button>
      </div>
    );
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
          {canResetPassword && (
            <button
              onClick={() => {
                if (
                  confirm(
                    `Create a temporary password for ${name}?\n\n` +
                      'Their current password stops working immediately. ' +
                      'You will see the new one once — read it out to them on the phone.',
                  )
                ) {
                  act('reset-password');
                }
              }}
              disabled={busy}
              className="block w-full rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-60"
            >
              🔑 Reset password
            </button>
          )}
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
