import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import NextTopLoader from 'nextjs-toploader';
import { GoogleAnalytics } from '@next/third-parties/google';

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
  icons: {
    icon: '/images/favicon.png',
    shortcut: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen pb-16 md:pb-0">
        <NextTopLoader
          color="#000000"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
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
      </body>
      <GoogleAnalytics gaId="G-6V8BF2S1R3" />
    </html>
  );
}
