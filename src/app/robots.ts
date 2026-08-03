import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/account',
          '/account/*',
          '/checkout',
          '/checkout/*',
          '/cart',
          '/api/*',
          '/*?*sort=',      // avoid crawling filter permutations
          '/*?*page=',
        ],
      },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'Googlebot-Image', allow: '/' },
    ],
    sitemap: `${BRAND.url}/sitemap.xml`,
    host: BRAND.url,
  };
}
