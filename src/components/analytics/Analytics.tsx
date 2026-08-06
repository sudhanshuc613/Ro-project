'use client';

/**
 * Google Analytics 4 loader.
 *
 * Kyun zaroori tha: ServiceBookingForm aur AmcPurchaseForm pehle se
 * `window.gtag?.(...)` call karte the, par GA ka script kahin load hi
 * nahi hota tha — matlab optional-chain chup-chaap kuch nahi karta tha
 * aur ek bhi lead track nahi ho rahi thi.
 *
 * `NEXT_PUBLIC_GA_ID` set nahi hai to kuch bhi render nahi hota —
 * na koi script, na koi network call. Isliye ye local aur preview pe
 * bilkul safe hai.
 */
import { useEffect } from 'react';
import Script from 'next/script';

export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  /**
   * Ek hi global listener — har call/WhatsApp link khud pakad leta hai.
   * Components mein `data-analytics="..."` pehle se laga hua hai, isliye
   * har button mein alag onClick lagane ki zaroorat nahi.
   *
   * Patna ka customer form nahi bharta — call ya WhatsApp karta hai.
   * Isliye asli conversion yahi hai; iske bina Analytics sirf "visits"
   * dikhata hai aur pata hi nahi chalta ki paisa kahan se aa raha hai.
   */
  useEffect(() => {
    if (!gaId) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('a[href]');
      if (!el) return;
      const href = el.getAttribute('href') ?? '';
      const label = el.dataset.analytics ?? window.location.pathname;

      if (href.startsWith('tel:')) {
        window.gtag?.('event', 'phone_call_click', { event_category: 'contact', event_label: label });
      } else if (href.includes('wa.me') || href.startsWith('whatsapp:')) {
        window.gtag?.('event', 'whatsapp_click', { event_category: 'contact', event_label: label });
      }
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [gaId]);

  if (!gaId || !gaId.startsWith('G-')) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}

/**
 * Call / WhatsApp click tracking.
 *
 * Ye is business ka asli conversion hai — Patna mein customer form
 * nahi bharta, seedha call ya WhatsApp karta hai. Ye na track kiya to
 * Analytics mein sirf "visits" dikhte hain aur pata hi nahi chalta ki
 * kaunsa page paisa la raha hai.
 */
export function trackContact(kind: 'call' | 'whatsapp', where: string) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', kind === 'call' ? 'phone_call_click' : 'whatsapp_click', {
    event_category: 'contact',
    event_label: where,
  });
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
