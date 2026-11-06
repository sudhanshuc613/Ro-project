/**
 * ANALYTICS TAGS — server se ID padh kar client tags ko deti hai.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN YE BEECH KI PARAT (6 Nov 2026)
 * ───────────────────────────────────
 * `Analytics.tsx` aur `GoogleTagManager.tsx` dono CLIENT component hain —
 * unhe `window` chahiye. Client component database nahi padh sakta.
 *
 * Isliye ye ek SERVER component hai: DB se `analytics` setting padhta hai
 * aur dono client tags ko prop ki tarah de deta hai. Isi ek jagah badalne se
 * poori site ki tag ID badal jaati hai.
 *
 * 🔴 STATIC PAGE TOOTENGE NAHI
 * ────────────────────────────
 * `getAnalyticsSettings()` `unstable_cache` ke andar hai. `unstable_cache`
 * static rendering ko dynamic nahi banata (cookies/headers banate hain, ye
 * nahi) — isliye build ke 217 static page static hi rehte hain. Ye baat
 * build output se naapi gayi hai, maani nahi gayi.
 *
 * 🔴 BADLAV KITNI DER ME DIKHTA HAI
 * ─────────────────────────────────
 * Admin me save karte hi API `revalidateTag('settings')` ke saath
 * `revalidatePath('/', 'layout')` bhi chalata hai — matlab poori site ka
 * cache ek saath purana maan liya jaata hai. Har page agli request par naya
 * tag ke saath banta hai. Bina `revalidatePath` ke static page apne ISR
 * timer (24 ghante tak) ka intezaar karte, aur owner ko lagta ki tag laga
 * hi nahi.
 *
 * 🔴 DB NA CHALE TO BHI SITE CHALTI HAI
 * ─────────────────────────────────────
 * `getAnalyticsSettings()` kabhi throw nahi karti — DB down ho to
 * `constants.ts` wali ID aa jaati hai. Analytics ke liye poora page girana
 * bilkul galat trade hota.
 */
import { getAnalyticsSettings } from '@/lib/settings';
import Analytics from '@/components/analytics/Analytics';
import GoogleTagManager from '@/components/analytics/GoogleTagManager';

export default async function AnalyticsTags() {
  const a = await getAnalyticsSettings();

  return (
    <>
      {a.gtmActive ? <GoogleTagManager gtmId={a.gtmId} /> : null}
      <Analytics config={a} />
    </>
  );
}
