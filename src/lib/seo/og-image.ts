/**
 * OPEN GRAPH IMAGE — WhatsApp / Facebook pe link bhejne par jo tasveer dikhti hai.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 YE FILE KYU BANI (30 Sep 2026)
 * ─────────────────────────────────
 * Poore site ka page-by-page audit chalaya. Result:
 *
 *     143 pages me se 136 pe `og:image` THA HI NAHI.
 *
 * Sirf homepage aur /service-patna pe tha. Baaki sab — saare 83 area pages,
 * 21 brand pages, 7 intent pages, blog, products — sab khali.
 *
 * ── Iska matlab kya tha ────────────────────────────────────────────────────
 * Jab koi customer WhatsApp pe link bhejta:
 *
 *     rokadoctor.in/ro-service-patna/kankarbagh
 *
 * ...to WhatsApp par sirf ek suna-sa text link dikhta tha — koi photo nahi.
 * Patna me kaam WhatsApp se hi failta hai. Photo wala link 2-3 guna zyada
 * khulta hai. Ye seedha leads ka nuksan tha, SEO se pehle.
 *
 * ── Wajah ──────────────────────────────────────────────────────────────────
 * Next.js App Router me child page ka `openGraph` parent layout ke
 * `openGraph` ko REPLACE kar deta hai, merge nahi karta. Root layout me
 * `images` tha hi nahi, aur har page apna `openGraph` likh raha tha bina
 * `images` ke. Isliye 136 pages khali reh gaye.
 *
 * ── Ab kya karna hai ───────────────────────────────────────────────────────
 * Koi bhi naya page banao to `openGraph` me `images: ogImage()` zaroor daalna.
 * `scripts/verify-og-image.sh` ab har page pe ye check karta hai, isliye
 * bhoolne par test FAIL hoga.
 */

import { BRAND } from '@/lib/constants';

/** Facebook/WhatsApp ka recommended size — 1200×630 (1.91:1). */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/**
 * Open Graph image array.
 *
 * @param src   Page-specific image (public/ se path, jaise '/banners/x.png').
 *              Na do to site ka default og image lagta hai.
 * @param alt   Alt text — screen reader aur kuch platforms ise dikhate hain.
 */
export function ogImage(src?: string, alt?: string) {
  const url = src
    ? src.startsWith('http')
      ? src
      : `${BRAND.url}${src}`
    : `${BRAND.url}${BRAND.ogImage}`;

  return [
    {
      url,
      width: OG_WIDTH,
      height: OG_HEIGHT,
      alt: alt ?? `${BRAND.name} — RO service in Patna`,
    },
  ];
}
