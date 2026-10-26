/* returns-refunds — content src/lib/seo/policy-data.ts me hai (ek hi source). */
import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';
import { policyBySlug } from '@/lib/seo/policy-data';
import { ogImage } from '@/lib/seo/og-image';
import PolicyArticle from '@/components/policy/PolicyArticle';

const P = policyBySlug('returns-refunds')!;

export const revalidate = 86400;

export const metadata: Metadata = {
  title: P.title,
  description: P.description,
  alternates: { canonical: '/returns-refunds' },
  openGraph: {
    title: P.title,
    description: P.description,
    url: `${BRAND.url}/returns-refunds`,
    type: 'website',
    images: ogImage(),
  },
};

export default function Page() {
  return <PolicyArticle policy={P} />;
}
