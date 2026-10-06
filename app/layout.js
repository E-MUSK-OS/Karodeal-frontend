import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import NextTopLoader from 'nextjs-toploader';
import Script from 'next/script';

export const metadata = {
  title: 'KaroDeal | Discover. Save. Shop Smart.',
  description: 'Discover the latest discounts, offers and trending products from India\'s top shopping platforms like Amazon, Flipkart, Myntra, and more.',
  verification: {
    google: 'qdUja2S1m93HFP5-fCxw6Z2oZ4iY2movGhgGqDKD2pY',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-6V8BF2S1R3" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6V8BF2S1R3');
          `}
        </Script>
      </head>
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
    </html>
  );
}
