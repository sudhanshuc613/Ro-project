/* terms — content src/lib/seo/policy-data.ts me hai (ek hi source).
   🔴 2 Nov 2026 — Google Ads "Unacceptable business practices" suspension
   ke baad banaya. Shipping/Refund/Warranty/Privacy to pehle se the, par
   ek AAM Terms & Conditions page nahi tha — reviewer sabse pehle wahi
   dhoondhta hai. */
import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';
import { policyBySlug } from '@/lib/seo/policy-data';
import { ogImage } from '@/lib/seo/og-image';
import PolicyArticle from '@/components/policy/PolicyArticle';

const P = policyBySlug('terms')!;

export const revalidate = 86400;

export const metadata: Metadata = {
  title: P.title,
  description: P.description,
  alternates: { canonical: '/terms' },
  openGraph: {
    title: P.title,
    description: P.description,
    url: `${BRAND.url}/terms`,
    type: 'website',
    images: ogImage(),
  },
};

export default function Page() {
  return <PolicyArticle policy={P} />;
}
