import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import NextTopLoader from 'nextjs-toploader';
import { GoogleAnalytics } from '@next/third-parties/google';
import GoogleAuthProvider from '@/components/auth/GoogleAuthProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export const metadata = {
  metadataBase: new URL('https://karodeal.in'),
  title: {
    default: 'Karo Deal (KaroDeal) | India’s Best Cashback, Deals & Coupons',
    template: '%s | KaroDeal (Karo Deal)'
  },
  description: "Welcome to Karo Deal (KaroDeal) – India's premier cashback and coupon platform. Discover verified discounts, daily drops, and real withdrawable cashback across Amazon, Flipkart, Myntra, and more.",
  keywords: [
    'Karo Deal',
    'karo deal',
    'KaroDeal',
    'karodeal',
    'karodeal.in',
    'Karo Deal Cashback',
    'Karo Deal Offers',
    'Karo Deal Coupons',
    'Karo Deal App',
    'Karo Deal Website',
    'KaroDeal Cashback',
    'KaroDeal Deals',
    'KaroDeal Offers',
    'Cashback Offers India',
    'Best Cashback Sites in India',
    'Real Cashback Apps',
    'Online Cashback Deals',
    'UPI Cashback',
    'Instant Cashback Offers',
    'Earn Cashback Online',
    'Guaranteed Cashback',
    'Amazon Deals Today',
    'Amazon Great Indian Festival Deals',
    'Amazon Offers',
    'Flipkart Offers Today',
    'Flipkart Big Billion Days Deals',
    'Flipkart Cashback',
    'Myntra Coupon Codes',
    'Myntra Fashion Discounts',
    'Ajio Promo Codes',
    'Meesho Deals',
    'Nykaa Beauty Offers',
    'Tata CliQ Discounts',
    'Croma Electronics Offers',
    'Today Best Deals India',
    'Discount Coupons India',
    'Verified Promo Codes',
    'Online Shopping Offers',
    'Loot Deals India',
    'Price Drop Alerts',
    'Daily Drops and Discounts',
    'Electronics Deals',
    'Fashion Discounts',
    'Online Shopping India',
    'India Shopping Offers'
  ],
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
import DisableRightClickAndSelect from '@/components/common/DisableRightClickAndSelect';
import NewUserSignupModal from '@/components/common/NewUserSignupModal';
import WhatsAppNumberPromptModal from '@/components/common/WhatsAppNumberPromptModal';
import { Suspense } from 'react';

export default function RootLayout({ children }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KaroDeal',
    alternateName: ['Karo Deal', 'karo deal', 'karodeal', 'karodeal.in', 'KaroDeal India'],
    url: 'https://karodeal.in',
    logo: 'https://karodeal.in/icon-512.png',
    description: "Welcome to Karo Deal (KaroDeal) – India's premier cashback and coupon platform.",
    sameAs: [
      'https://www.instagram.com/karodeal_/'
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-48.png" type="image/png" sizes="48x48" />
        <link rel="icon" href="/icon-96.png" type="image/png" sizes="96x96" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('karodeal-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="flex flex-col min-h-screen pb-16 md:pb-0 bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          <DisableRightClickAndSelect />
          <ToastContainer />
          <Suspense fallback={null}>
            <NewUserSignupModal />
          </Suspense>
          <Suspense fallback={null}>
            <WhatsAppNumberPromptModal />
          </Suspense>
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
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-6V8BF2S1R3" />
    </html>
  );
}
