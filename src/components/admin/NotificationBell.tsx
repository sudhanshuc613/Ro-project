'use client';

/**
 * NotificationBell — live alert menu in the admin topbar.
 *
 * Replaces a static 🔔 emoji that did nothing. Now:
 *  • Polls every 25s while the tab is visible; stops entirely when hidden, so
 *    a forgotten background tab is not hammering the database all day.
 *  • Badge count, colour-coded by priority.
 *  • One-tap Call and WhatsApp straight from the alert — for a service
 *    request the fastest useful action is ringing the customer, not opening
 *    a detail page.
 *  • Enable-push button that registers this device for real phone
 *    notifications that arrive even when the browser is closed.
 *  • Plays a short chime on genuinely new high-priority alerts. Muted by
 *    default on first load so it can never blast on page open.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Alert {
  id: string;
  kind: string;
  priority: 'low' | 'normal' | 'high';
  title: string;
  body: string;
  link: string | null;
  phone: string | null;
  amount: number | null;
  isRead: boolean;
  createdAt: string;
}

const KIND_ICON: Record<string, string> = {
  SERVICE_REQUEST: '🔧',
  ORDER: '🛒',
  STOCK: '📦',
  REVIEW: '⭐',
  SYSTEM: 'ℹ️',
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'abhi';
  if (s < 3600) return `${Math.floor(s / 60)} min pehle`;
  if (s < 86400) return `${Math.floor(s / 3600)} ghante pehle`;
  return `${Math.floor(s / 86400)} din pehle`;
}

/** Base64url → Uint8Array, required by PushManager.subscribe. */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unread, setUnread] = useState(0);
  const [pushState, setPushState] = useState<'unknown' | 'unsupported' | 'off' | 'on' | 'unconfigured'>('unknown');
  /** True when the database is missing the admin_alerts table entirely. */
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [busy, setBusy] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const lastTopId = useRef<string | null>(null);
  const firstLoad = useRef(true);

  /* ── Poll ── */
  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/alerts', { cache: 'no-store' });
      if (!res.ok) return;
      const d = await res.json();
      const list: Alert[] = d.alerts ?? [];
      setAlerts(list);
      setUnread(d.unread ?? 0);
      setSetupNeeded(Boolean(d.setupNeeded));

      // Chime only for a genuinely new high-priority alert, never on first load.
      const top = list[0];
      if (
        !firstLoad.current &&
        top &&
        top.id !== lastTopId.current &&
        !top.isRead &&
        top.priority === 'high'
      ) {
        chime();
      }
      if (top) lastTopId.current = top.id;
      firstLoad.current = false;
    } catch { /* silent — the bell must never break the page */ }
  }, []);

  useEffect(() => {
    void load();
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer) return;
      timer = setInterval(() => { void load(); }, 25_000);
    };
    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else { void load(); start(); }
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load]);

  /* ── Push capability ── */
  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined') return;
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setPushState('unsupported');
        return;
      }
      try {
        const res = await fetch('/api/admin/push');
        const d = await res.json();
        if (!d.configured) { setPushState('unconfigured'); return; }
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        setPushState(sub ? 'on' : 'off');
      } catch {
        setPushState('off');
      }
    })();
  }, []);

  /* ── Close on outside click / Escape ── */
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  function chime() {
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      o.start(); o.stop(ctx.currentTime + 0.36);
      setTimeout(() => ctx.close().catch(() => {}), 600);
    } catch { /* autoplay blocked — fine */ }
  }

  async function enablePush() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        toast.error('Notification permission nahi mili. Browser settings me allow karo.');
        return;
      }

      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const cfg = await (await fetch('/api/admin/push')).json();
      if (!cfg.publicKey) {
        toast.error('Push key set nahi hai. Vercel me VAPID keys daalo.');
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(cfg.publicKey),
      });

      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh: string; auth: string } };
      const res = await fetch('/api/admin/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          label: navigator.userAgent.slice(0, 70),
          test: true,
        }),
      });

      if (!res.ok) { toast.error('Save nahi hua'); return; }
      setPushState('on');
      toast.success('Ho gaya! Ab phone pe notification aayega.');
    } catch (err) {
      toast.error(`Push enable nahi hua: ${(err as Error).message.slice(0, 60)}`);
    } finally {
      setBusy(false);
    }
  }

  async function markAllRead() {
    setUnread(0);
    setAlerts((a) => a.map((x) => ({ ...x, isRead: true })));
    await fetch('/api/admin/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {});
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open && unread > 0) void markAllRead(); }}
        aria-label={`Notifications${unread ? ` — ${unread} naye` : ''}`}
        className="relative grid h-10 w-10 place-items-center rounded-xl text-lg transition hover:bg-navy-50 focus-ring"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="anim-scale-in absolute right-0 z-50 mt-2 w-[340px] origin-top-right overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card-hover sm:w-[400px]">
          <div className="flex items-center justify-between border-b border-navy-50 px-4 py-3">
            <p className="font-display text-sm font-bold text-navy-700">Notifications</p>
            {alerts.length > 0 && (
              <button onClick={markAllRead} className="text-xs font-bold text-aqua-600 hover:underline">
                Sab padha hua mark karo
              </button>
            )}
          </div>

          {/* Setup blocker. Shown when the tables were never created, so a
              missing migration can never masquerade as "no alerts yet". */}
          {setupNeeded && (
            <div className="border-b border-navy-50 bg-red-50 px-4 py-3">
              <p className="text-sm font-bold text-red-800">
                🔴 Database setup baaki hai
              </p>
              <p className="mt-1 text-xs leading-relaxed text-red-700">
                <code className="rounded bg-white/70 px-1">admin_alerts</code> table nahi bana.
                Isliye notification save nahi ho rahe. Neon SQL Editor me{' '}
                <code className="rounded bg-white/70 px-1">
                  prisma/migrations/add-notification-tables.sql
                </code>{' '}
                chalao — 30 second ka kaam hai.
              </p>
              <p className="mt-1.5 text-[11px] text-red-600">
                Booking safe hai — sirf alert nahi ban raha.
              </p>
            </div>
          )}

          {/* Push enable prompt */}
          {!setupNeeded && pushState === 'off' && (
            <button
              onClick={enablePush}
              disabled={busy}
              className="block w-full border-b border-navy-50 bg-aqua-50 px-4 py-3 text-left transition hover:bg-aqua-100 disabled:opacity-60"
            >
              <p className="text-sm font-bold text-aqua-800">
                📱 {busy ? 'Chalu ho raha hai…' : 'Phone pe notification chalu karo'}
              </p>
              <p className="mt-0.5 text-xs text-aqua-700">
                Browser band ho tab bhi alert aayega
              </p>
            </button>
          )}
          {pushState === 'on' && (
            <p className="border-b border-navy-50 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              ✅ Phone notification chalu hai
            </p>
          )}
          {pushState === 'unconfigured' && (
            <p className="border-b border-navy-50 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              Phone notification ke liye Vercel me VAPID keys daalni hongi — guide dekho
            </p>
          )}

          <div className="max-h-[400px] overflow-y-auto">
            {alerts.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted">
                Abhi koi notification nahi
              </p>
            )}

            {alerts.map((a) => (
              <div
                key={a.id}
                className={`border-b border-navy-50 px-4 py-3 transition last:border-0 hover:bg-slate-50 ${
                  !a.isRead ? 'bg-aqua-50/40' : ''
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-lg leading-none" aria-hidden="true">
                    {KIND_ICON[a.kind] ?? 'ℹ️'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-snug ${a.priority === 'high' ? 'font-bold text-navy-700' : 'font-semibold text-navy-700'}`}>
                      {a.title}
                    </p>
                    <p className="mt-0.5 whitespace-pre-line text-xs leading-relaxed text-muted">
                      {a.body}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">{timeAgo(a.createdAt)}</p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {a.phone && (
                        <>
                          <a
                            href={`tel:${a.phone}`}
                            className="rounded-lg bg-cta-green px-2.5 py-1 text-[11px] font-bold text-white hover:bg-cta-greenDark"
                          >
                            📞 Call
                          </a>
                          <a
                            href={`https://wa.me/91${a.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-[#25D366] px-2.5 py-1 text-[11px] font-bold text-white"
                          >
                            💬 WhatsApp
                          </a>
                        </>
                      )}
                      {a.link && (
                        <button
                          onClick={() => { setOpen(false); router.push(a.link!); }}
                          className="rounded-lg bg-navy-100 px-2.5 py-1 text-[11px] font-bold text-navy-700 hover:bg-navy-200"
                        >
                          Kholo →
                        </button>
                      )}
                    </div>
                  </div>
                  {!a.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-aqua-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
