'use client';

/**
 * Google Analytics 4 loader — Aqua Perl.
 *
 * Kyun banaya: ServiceBookingForm aur AmcPurchaseForm pehle se
 * `window.gtag?.(...)` call karte the, par GA ka script kahin load hi
 * nahi hota tha — matlab optional-chain chup-chaap kuch nahi karta tha
 * aur ek bhi lead track nahi ho rahi thi.
 *
 * ID kahan se aati hai:
 *   1. `NEXT_PUBLIC_GA_ID` env var (agar set ho — staging ke liye kaam ka)
 *   2. warna `ANALYTICS.gaId` — code mein likhi hui asli ID
 *
 * GA measurement ID secret nahi hoti (har visitor page source mein dekh
 * sakta hai), isliye code mein rakhna safe hai — aur isse Vercel env var
 * set karna bhool jaane par bhi tracking chalti rehti hai.
 *
 * Localhost aur Vercel preview par jaan-boojh kar band hai, warna apne
 * hi testing ke visits asli report ganda kar dete.
 */
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { ANALYTICS } from '@/lib/constants';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ANALYTICS.gaId;

export default function Analytics() {
  // Host check client par hi ho sakta hai, isliye mount ke baad decide karte hain.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    setEnabled(
      /^G-[A-Z0-9]{8,}$/i.test(GA_ID) &&
        (ANALYTICS.allowedHosts as readonly string[]).includes(host),
    );
  }, []);

  /**
   * Call / WhatsApp click tracking — ek hi global listener.
   *
   * Patna ka customer form nahi bharta, seedha call ya WhatsApp karta hai.
   * Asli conversion yahi hai. Iske bina Analytics sirf "visits" dikhata hai
   * aur pata hi nahi chalta ki paisa kahan se aa raha hai.
   *
   * Components mein `data-analytics="..."` pehle se laga hai, isliye har
   * button par alag onClick lagane ki zaroorat nahi.
   */
  useEffect(() => {
    if (!enabled) return;

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('a[href]');
      if (!el) return;

      const href = el.getAttribute('href') ?? '';
      const label = el.dataset.analytics ?? window.location.pathname;

      if (href.startsWith('tel:')) {
        window.gtag?.('event', 'phone_call_click', {
          event_category: 'contact',
          event_label: label,
          page_path: window.location.pathname,
        });
      } else if (href.includes('wa.me') || href.startsWith('whatsapp:')) {
        window.gtag?.('event', 'whatsapp_click', {
          event_category: 'contact',
          event_label: label,
          page_path: window.location.pathname,
        });
      }
    };

    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
