'use client';

/**
 * useLiveAdmin — polling-based live feed for the admin dashboard.
 *
 * Behaves like a WebSocket subscription from the component's point of view,
 * but works on Vercel's serverless platform (which cannot hold sockets open).
 *
 * Smart behaviour:
 *   - Pauses when the browser tab is hidden (saves function invocations)
 *   - Backs off to 30s after 5 consecutive empty polls, resets on activity
 *   - Plays a sound + browser notification on genuinely new items
 *   - Survives network blips without spamming errors
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export interface LiveOrder {
  id: string; orderNumber: string; customer: string; phone: string;
  city: string; amount: number; status: string; at: string;
}
export interface LiveService {
  id: string; ticketNumber: string; customer: string; phone: string;
  area: string; type: string; issue: string; priority: string; at: string;
}
export interface LiveCounters {
  pendingServices: number; unassignedServices: number; ordersToShip: number;
  todayRevenue: number; todayOrders: number; todayServices: number;
}

const FAST_MS = 10_000;   // active polling
const SLOW_MS = 30_000;   // idle backoff
const IDLE_AFTER = 5;     // empty polls before slowing down

export function useLiveAdmin(initialCounters?: Partial<LiveCounters>) {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [services, setServices] = useState<LiveService[]>([]);
  const [counters, setCounters] = useState<LiveCounters>({
    pendingServices: 0, unassignedServices: 0, ordersToShip: 0,
    todayRevenue: 0, todayOrders: 0, todayServices: 0,
    ...initialCounters,
  });
  const [connected, setConnected] = useState(true);
  const [lastPoll, setLastPoll] = useState<Date | null>(null);

  const sinceRef = useRef<string>(new Date().toISOString());
  const emptyCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const mountedRef = useRef(true);

  const notify = useCallback((title: string, body: string) => {
    // Sound: short beep via Web Audio — no asset file needed
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } catch { /* autoplay blocked — silent is fine */ }

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/brand/logo.png' });
    }
  }, []);

  const poll = useCallback(async () => {
    if (document.hidden) {
      timerRef.current = setTimeout(poll, FAST_MS);
      return;
    }

    try {
      const res = await fetch(`/api/admin/live?since=${encodeURIComponent(sinceRef.current)}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(String(res.status));

      const data = await res.json();
      if (!mountedRef.current) return;

      setConnected(true);
      setLastPoll(new Date());
      setCounters(data.counters);

      const gotOrders: LiveOrder[] = data.newOrders ?? [];
      const gotServices: LiveService[] = data.newServices ?? [];

      if (gotOrders.length) {
        setOrders((prev) => [...gotOrders, ...prev].slice(0, 25));
        notify(
          `${gotOrders.length} new order${gotOrders.length > 1 ? 's' : ''}`,
          `${gotOrders[0].customer} — ₹${gotOrders[0].amount.toLocaleString('en-IN')}`,
        );
      }
      if (gotServices.length) {
        setServices((prev) => [...gotServices, ...prev].slice(0, 25));
        notify(
          `${gotServices.length} new service request${gotServices.length > 1 ? 's' : ''}`,
          `${gotServices[0].customer} — ${gotServices[0].area}`,
        );
      }

      // Advance the cursor so we never re-fetch the same rows
      sinceRef.current = data.serverTime;

      emptyCountRef.current =
        gotOrders.length + gotServices.length > 0 ? 0 : emptyCountRef.current + 1;
    } catch {
      if (mountedRef.current) setConnected(false);
    }

    const delay = emptyCountRef.current >= IDLE_AFTER ? SLOW_MS : FAST_MS;
    timerRef.current = setTimeout(poll, delay);
  }, [notify]);

  useEffect(() => {
    mountedRef.current = true;

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    // Poll immediately when the operator returns to the tab
    const onVisible = () => {
      if (!document.hidden) {
        emptyCountRef.current = 0;
        clearTimeout(timerRef.current);
        void poll();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    void poll();

    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [poll]);

  const dismissOrder = (id: string) => setOrders((p) => p.filter((o) => o.id !== id));
  const dismissService = (id: string) => setServices((p) => p.filter((s) => s.id !== id));

  return { orders, services, counters, connected, lastPoll, dismissOrder, dismissService };
}
