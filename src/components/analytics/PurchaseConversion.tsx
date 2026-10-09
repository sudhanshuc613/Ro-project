'use client';

/**
 * GOOGLE ADS "PURCHASE" CONVERSION — checkout success par ek baar.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN (9 Oct 2026)
 * ─────────────────
 * Owner ne Google Ads se do file bheji:
 *
 *   Google tag.txt            →  gtag('config', 'AW-610913435')
 *   Event snippet - Purchase  →  send_to: 'AW-610913435/a2mmCJe5zfgaEJuZp6MC'
 *
 * Doosra wala ek PURCHASE conversion hai — yaani asli order. Isko tel: click
 * par firing karna seedha nuksan hota: har phone click Google ko "Purchase"
 * dikhta, aur Smart Bidding e-commerce ke peeche bhaagta jabki asli paisa
 * ₹200 wali service visit se aata hai.
 *
 * Isliye ye component SIRF checkout success page par mount hota hai, aur
 * sirf tab firing karta hai jab:
 *   • adsId valid ho (AW- + 9 ya zyada digit)
 *   • purchase label bhara ho
 *   • host asli production domain ho (localhost / Vercel preview par nahi)
 *   • ye order pehle report na hua ho — sessionStorage guard
 *
 * DOUBLE-COUNT GUARD KIYUN
 * ────────────────────────
 * Success page refresh karna, ya back-forward cache se wapas aana, dono
 * India me aam hain. Bina guard ke ek hi order 2–3 conversion ban jaata hai,
 * aur Google ka ROAS data jhooth bolne lagta hai. `transaction_id` Google ke
 * apne de-dup ke liye jaata hai, aur sessionStorage client side par rok deta
 * hai — do layer.
 */
import { useEffect } from 'react';
import { ANALYTICS } from '@/lib/constants';

const ADS_ID = process.env.NEXT_PUBLIC_ADS_ID || ANALYTICS.adsId;
const ADS_READY = /^AW-\d{9,}$/i.test(ADS_ID);

export default function PurchaseConversion({
  orderNumber,
  value,
}: {
  orderNumber: string;
  /** Order ka asli total, INR me */
  value: number;
}) {
  useEffect(() => {
    if (!ADS_READY || !ANALYTICS.adsPurchaseLabel) return;
    if (!orderNumber) return;

    const host = window.location.hostname;
    if (!(ANALYTICS.allowedHosts as readonly string[]).includes(host)) return;

    const key = `aw_purchase_${orderNumber}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, '1');
    } catch {
      /* private mode me sessionStorage throw karta hai — transaction_id
         phir bhi Google ke server-side de-dup ko bacha leta hai. */
    }

    window.gtag?.('event', 'conversion', {
      send_to: `${ADS_ID}/${ANALYTICS.adsPurchaseLabel}`,
      value,
      currency: 'INR',
      transaction_id: orderNumber,
    });

    /* GA4 ka apna standard purchase event — Ads conversion se alag system
       hai, dono chahiye. */
    window.gtag?.('event', 'purchase', {
      transaction_id: orderNumber,
      value,
      currency: 'INR',
    });
  }, [orderNumber, value]);

  return null;
}
