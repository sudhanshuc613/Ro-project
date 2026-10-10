/**
 * /admin/site-images — har banner aur photo ek jagah se badlo.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Owner: "sare jagh ke jaha jaha banners ya photo lage hai har jagh ke option
 *         de na admin panel mai taki mai bannerse ya photo change kar saku"
 *
 * Media Library (/admin/media) sirf files rakhti hai — ye page batata hai ki
 * kaunsi file SITE PAR KAHAN lagi hai, aur usko badalne deta hai.
 *
 * Har badlav `site_settings` me jaata hai aur agle hi request me live hota
 * hai — koi deploy nahi.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { IMAGE_SLOTS, type SiteImageMap } from '@/lib/seo/site-images';
import SiteImageManager from '@/components/admin/SiteImageManager';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Banners & Photos',
  robots: { index: false, follow: false },
};

export default async function SiteImagesPage() {
  let overrides: SiteImageMap = {};
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: 'siteImages' } });
    overrides = (row?.value as unknown as SiteImageMap) ?? {};
  } catch {
    overrides = {};
  }

  const rows = IMAGE_SLOTS.map((s) => {
    const o = overrides[s.key];
    return {
      ...s,
      currentUrl: (o?.url || '').trim() || s.defaultUrl,
      currentAlt: (o?.alt || '').trim() || s.defaultAlt,
      isOverridden: Boolean((o?.url || '').trim()),
    };
  });

  const changed = rows.filter((r) => r.isOverridden).length;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-black text-navy-900">Banners &amp; Photos</h1>
        <p className="mt-1 text-sm text-navy-600">
          Site par jitne bhi banner aur photo lage hain, sab yahan se badal sakte ho.
          Save karte hi live ho jaata hai &mdash; koi deploy nahi.
        </p>
        <p className="mt-2 text-sm">
          <span className="rounded-full bg-navy-900 px-3 py-1 text-xs font-bold text-white">
            {rows.length} jagah
          </span>{' '}
          <span className="rounded-full bg-aqua-100 px-3 py-1 text-xs font-bold text-aqua-800">
            {changed} badli hui
          </span>{' '}
          <Link href="/admin/media" className="ml-1 text-xs font-bold text-aqua-600 hover:underline">
            Media Library kholo &rarr;
          </Link>
        </p>
      </header>

      {/* 🔴 SEO ka imaandar jawab — owner ne poocha tha */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-black text-navy-900">
          Image badalne se SEO girega? &mdash; seedha jawab
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-navy-700">
          <strong>Nahi, agar teen cheez ka dhyaan rahe.</strong> Image ka URL badalna Google ke
          liye koi badi baat nahi &mdash; page ka URL, title aur text wahi rehta hai. Jo cheez
          sach me ranking girati hai wo ye teen hain, aur ye page teeno sambhaalta hai:
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-navy-700">
          <li>
            <strong>1. Alt text khaali chhodna</strong> &mdash; Google image ko alt se samajhta
            hai. Isliye yahan alt bina bhare Save hota hi nahi.
          </li>
          <li>
            <strong>2. Bhaari image</strong> &mdash; 1 MB ki photo page dheema kar deti hai, aur
            page speed ranking me bhi ginti hai aur Google Ads ke Quality Score me bhi. Upload ke
            baad yahan size dikhta hai; 800 KB se upar par laal warning aati hai. Upload hote hi
            image apne aap WebP me badal jaati hai, jo kaafi halki hoti hai.
          </li>
          <li>
            <strong>3. Share wali photo (OG) ka size</strong> &mdash; wo exactly 1200&times;630
            honi chahiye, warna WhatsApp par kati hui dikhti hai.
          </li>
        </ul>
        <p className="mt-2 text-sm leading-relaxed text-navy-700">
          Aur agar koi image galat chadh gayi &mdash;{' '}
          <strong>&ldquo;Purani wali wapas&rdquo;</strong> button se ek click me pehle jaisa ho
          jaata hai. Kuch permanently nahi tootta.
        </p>
      </section>

      <SiteImageManager initial={rows} />
    </div>
  );
}
