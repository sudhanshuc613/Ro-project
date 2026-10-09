/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    /*
     * 🔴 SECURITY — 9 Oct 2026, audit me badla gaya.
     * ──────────────────────────────────────────────
     * Pehle yahan do remotePatterns the:
     *     res.cloudinary.com
     *     **.amazonaws.com        ← ye wildcard khatarnaak tha
     *
     * Dikkat: `**.amazonaws.com` ka matlab hai KOI BHI S3 bucket. Hamlaavar
     * apna bucket bana kar uska URL hamare /_next/image optimizer me daal
     * sakta tha. Next.js 14.2.35 me Image Optimization API ki ek knowni
     * kamzori hai (AVIF file ke zariye), aur hamne `formats` me avif rakha
     * hua hai — matlab wo raasta khula tha.
     *
     * Maine check kiya (9 Oct, live DB):
     *     product_images  →  9 rows, external http URL: 0
     *     src/ me cloudinary ya amazonaws ka koi reference: 0
     *     media upload ka raasta: /api/media/<id> (same-origin) ya Vercel Blob
     *
     * Yaani ye dono pattern kabhi use hi nahi ho rahe the — bas khula darwaza
     * pade the. Hata diye. Site par ek bhi image par koi farak nahi padta.
     *
     * Aage kabhi bahar ka image host chahiye ho, to usi ek exact hostname ko
     * yahan likhna — `**.` wildcard dobara mat lagana.
     */
    remotePatterns: [],
    deviceSizes: [360, 420, 640, 750, 828, 1080, 1200, 1920],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|woff2)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  async redirects() {
    return [
      /* Legacy / common misspellings → canonical service pillar.
         ────────────────────────────────────────────────────────────────
         ⚠️ next.config redirects run BEFORE route matching, so anything
         listed here wins over a real page at the same path. Two entries
         were removed on 8 Sep 2026 because they had started shadowing
         pages that now exist:

           /ro-repair-patna   is now a real service page  → was 308ing away
           /ro-service-patna  is now the area-page parent → would break
                              /ro-service-patna/{area} if left as a prefix

         Before adding to this list, confirm no route exists at that path.
         `/service` has no page and is kept. */
      { source: '/service', destination: '/ro-services-patna', permanent: true },
      /* Bare /ro-service-patna has no page of its own — the areas live at
         /ro-service-patna/{area}. Send the bare form to the pillar. Written
         with an exact source so child paths are untouched. */
      { source: '/ro-service-patna', destination: '/service-patna', permanent: true },
    ];
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns'],
  },
};

export default nextConfig;
