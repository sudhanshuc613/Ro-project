/**
 * LEGACY AREA URL — /service-patna/[area]
 *
 * This path is Google-indexed and has earned rankings, so it must never 404.
 * It now permanently redirects to the keyword-first canonical URL:
 *
 *     /service-patna/kankarbagh  →  301  →  /ro-service-patna/kankarbagh
 *
 * A 301 passes essentially all ranking signal to the destination, so nothing
 * that was earned on the old URL is lost. The page markup itself lives in
 * src/app/(shop)/ro-service-patna/[area]/page.tsx — there is exactly one copy
 * of it, so the two URLs can never drift into duplicate content.
 *
 * generateStaticParams is intentionally NOT exported here: these routes only
 * ever redirect, so pre-rendering them would waste build time and disk.
 */
import { permanentRedirect, notFound } from 'next/navigation';
import { SERVICE_AREAS } from '@/lib/seo/patna-service-data';
import { areaPath } from '@/lib/seo/area-url';

export default function LegacyAreaRedirect({ params }: { params: { area: string } }) {
  const area = SERVICE_AREAS.find((a) => a.slug === params.area);
  if (!area) notFound();
  permanentRedirect(areaPath(area.slug));
}
