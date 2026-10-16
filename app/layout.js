import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import NextTopLoader from 'nextjs-toploader';
import { GoogleAnalytics } from '@next/third-parties/google';
import GoogleAuthProvider from '@/components/auth/GoogleAuthProvider';

export const metadata = {
  metadataBase: new URL('https://karodeal.in'),
  title: {
    default: 'KaroDeal | Discover. Save. Shop Smart.',
    template: '%s | KaroDeal'
  },
  description: "Discover the latest discounts, offers, coupons, and trending products from India's top shopping platforms like Amazon, Flipkart, Myntra, and more.",
  keywords: ['Deals', 'Coupons', 'Offers', 'Discounts', 'Online Shopping', 'Amazon Deals', 'Flipkart Offers', 'KaroDeal', 'India Shopping'],
  authors: [{ name: 'KaroDeal Team' }],
  creator: 'KaroDeal',
  publisher: 'KaroDeal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'KaroDeal | Discover. Save. Shop Smart.',
    description: "Discover the latest discounts, offers, coupons, and trending products from India's top shopping platforms.",
    url: 'https://karodeal.in',
    siteName: 'KaroDeal',
    images: [
      {
        url: '/og-image.jpg', // Place an og-image.jpg in the public folder
        width: 1200,
        height: 630,
        alt: 'KaroDeal Preview Image',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KaroDeal | Discover. Save. Shop Smart.',
    description: 'Discover the latest discounts, offers, coupons, and trending products.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'qdUja2S1m93HFP5-fCxw6Z2oZ4iY2movGhgGqDKD2pY',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

import RealtimeProductsListener from '@/components/common/RealtimeProductsListener';
import FaviconLoader from '@/components/common/FaviconLoader';
import WebsiteLoader from '@/components/common/WebsiteLoader';
import ToastContainer from '@/components/common/ToastContainer';
import FacebookPixel from '@/components/common/FacebookPixel';
import { Suspense } from 'react';

export default function RootLayout({ children }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KaroDeal',
    url: 'https://karodeal.in',
    logo: 'https://karodeal.in/icon-512.png',
    description: "Discover the latest discounts, offers, coupons, and trending products from India's top shopping platforms.",
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="flex flex-col min-h-screen pb-16 md:pb-0">
        <ToastContainer />
        <WebsiteLoader />
        <Suspense fallback={null}>
          <FaviconLoader />
        </Suspense>
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
        <RealtimeProductsListener />
        <GoogleAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <NextTopLoader
            color="#000000"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #000000,0 0 5px #000000"
          />
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <ScrollToTop />
        </GoogleAuthProvider>
      </body>
      <GoogleAnalytics gaId="G-6V8BF2S1R3" />
    </html>
  );
}
