import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { BRAND } from '@/lib/constants';
import Providers from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0A1F3C',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: 'AquaNexa — Buy RO Water Purifiers Online India | RO Service in Patna ₹200',
    template: `%s | ${BRAND.name}`,
  },
  description:
    'Shop RO water purifiers, commercial RO plants & genuine spare parts with delivery across India. Expert RO repair & installation in Patna at just ₹200 visit charge.',
  applicationName: BRAND.name,
  authors: [{ name: BRAND.legalName }],
  formatDetection: { telephone: true },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: BRAND.name,
    url: BRAND.url,
  },
  icons: {
    icon: '/brand/logo.png',
    apple: '/brand/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-navy-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
