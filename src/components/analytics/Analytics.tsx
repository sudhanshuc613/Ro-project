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

/**
 * 🔴 GOOGLE ADS CONVERSION TRACKING — added 10 Sep 2026.
 *
 * The owner was spending ₹80/day on Google Ads and getting almost no calls.
 * A scan of the live site found no `AW-` tag anywhere: Google had no way to
 * know which click produced a phone call, so Smart Bidding was optimising
 * against nothing. Published benchmarks put the cost of broken conversion
 * tracking at roughly +47% CPA and −32% conversion rate — which matches what
 * he is seeing exactly.
 *
 * Empty by default. The moment the two IDs are filled in constants.ts, every
 * tel: and wa.me click on the site reports a conversion with a ₹200 value,
 * and Google can start bidding on the keywords that actually ring the phone.
 */
const ADS_ID = process.env.NEXT_PUBLIC_ADS_ID || ANALYTICS.adsId;
const ADS_READY = /^AW-\d{9,}$/i.test(ADS_ID);

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
        /* Same click, reported a second time as a Google Ads conversion.
           GA4 events and Ads conversions are separate systems — a GA4 event
           alone does NOT feed Smart Bidding, which is why the ad budget was
           being spent blind. */
        if (ADS_READY && ANALYTICS.adsCallLabel) {
          window.gtag?.('event', 'conversion', {
            send_to: `${ADS_ID}/${ANALYTICS.adsCallLabel}`,
            value: ANALYTICS.conversionValue,
            currency: 'INR',
          });
        }
      } else if (href.includes('wa.me') || href.startsWith('whatsapp:')) {
        window.gtag?.('event', 'whatsapp_click', {
          event_category: 'contact',
          event_label: label,
          page_path: window.location.pathname,
        });
        /* WhatsApp counts as a call lead here. In Patna a large share of
           service enquiries arrive this way rather than as a voice call,
           and Google should bid for it the same. */
        if (ADS_READY && ANALYTICS.adsCallLabel) {
          window.gtag?.('event', 'conversion', {
            send_to: `${ADS_ID}/${ANALYTICS.adsCallLabel}`,
            value: ANALYTICS.conversionValue,
            currency: 'INR',
          });
        }
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
          ${ADS_READY ? `gtag('config', '${ADS_ID}');` : ''}
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
