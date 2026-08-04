'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Silently re-fetches the server component every N ms so the customer sees
 * status changes (technician assigned, work started, completed) without
 * touching anything. Pauses while the tab is hidden.
 */
export default function TrackingRefresher({ intervalMs = 20000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) router.refresh();
    };
    const id = setInterval(tick, intervalMs);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [router, intervalMs]);

  return null;
}
