'use client';

/**
 * GOOGLE TAG MANAGER — container loader.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN (6 Nov 2026)
 * ─────────────────
 * Owner ne Google se mila naya tag bheja:
 *
 *     <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-WZHCV54L"></script>
 *     <script>
 *       window.dataLayer = window.dataLayer || [];
 *       function gtag(){dataLayer.push(arguments);}
 *       gtag('js', new Date());
 *     </script>
 *
 * Ye hu-ba-hu wahi snippet hai — bas do farak, dono jaan boojh kar:
 *
 *   1. Container ID hard-code nahi hai. Wo /admin/settings se aati hai,
 *      taaki agli baar naya tag aane par deploy na karna pade.
 *
 *   2. Localhost aur Vercel preview par band hai — bilkul GA4 ki tarah.
 *      Warna apni hi testing Google Ads ke conversion data me ghus jaati
 *      hai aur Smart Bidding galat seekhta hai.
 *
 * 🔴 NOSCRIPT IFRAME KYUN NAHI
 * ────────────────────────────
 * Purane GTM snippet me ek `<noscript><iframe ...ns.html...>` bhi hota tha.
 * Google ab "Google tag" install karte waqt jo code deta hai (aur jo owner
 * ne bheja hai) usme wo nahi hai, kyunki GTM ka server-side pixel fallback
 * ab deprecated hai. Googlebot JavaScript chalata hai, isliye SEO par koi
 * asar nahi. Jaan boojh kar hata nahi — Google ne diya hi nahi.
 *
 * 🔴 SCRIPT KA KRAM
 * ─────────────────
 * dataLayer wala inline script PEHLE jaata hai, gtm.js BAAD me. gtm.js
 * `async` hai, to wo waise bhi baad me chalta, par kram pakka likh dena
 * behtar hai — kyunki agar gtm.js pehle chal gaya aur dataLayer abhi bana
 * hi nahi, to pehla event gir jaata hai.
 *
 * 🔴 window.gtag OVERWRITE NAHI KARTE
 * ───────────────────────────────────
 * Analytics.tsx apna `window.gtag` pehle se banata hai (GA4 + Ads ke liye).
 * Dono ek hi `dataLayer` me push karte hain, isliye jo pehle ban gaya wahi
 * rehne dete hain. Dobara banane se kuch tootta nahi, par ek hi cheez ke do
 * malik rakhna baad me dhoondhne layak bug banata hai.
 */
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { ANALYTICS } from '@/lib/constants';
import { GTM_RE } from '@/lib/seo/analytics-overrides';

export default function GoogleTagManager({ gtmId }: { gtmId: string }) {
  /* Host ka pata sirf client par chalta hai, isliye mount ke baad decide. */
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!GTM_RE.test(gtmId)) return;
    const host = window.location.hostname;
    setEnabled((ANALYTICS.allowedHosts as readonly string[]).includes(host));
  }, [gtmId]);

  if (!enabled) return null;

  return (
    <>
      <Script id="gtm-datalayer" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
        `}
      </Script>
      <Script
        id="gtm-container"
        src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
        strategy="afterInteractive"
      />
    </>
  );
}
