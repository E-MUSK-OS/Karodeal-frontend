export const metadata = {
  title: 'Today’s Best Deals & Cashback Offers | KaroDeal',
  description: 'Explore verified discounts, trending drops, and real cashback offers across Amazon, Flipkart, Myntra, Ajio, and more on KaroDeal.',
  keywords: [
    'Online Deals India',
    'Best Cashback Offers',
    'Amazon Deals',
    'Flipkart Discounts',
    'Myntra Coupons',
    'Trending Products',
    'KaroDeal Drops',
  ],
  alternates: {
    canonical: 'https://karodeal.in/deals',
  },
  openGraph: {
    title: 'Today’s Best Deals & Cashback Offers | KaroDeal',
    description: 'Explore verified discounts, trending drops, and real cashback offers across top online stores in India.',
    url: 'https://karodeal.in/deals',
    siteName: 'KaroDeal',
    images: [
      {
        url: 'https://karodeal.in/icon-512.png',
        width: 512,
        height: 512,
        alt: 'KaroDeal Deals & Cashback',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Today’s Best Deals & Cashback Offers | KaroDeal',
    description: 'Explore verified discounts, trending drops, and real cashback offers across top online stores in India.',
    images: ['https://karodeal.in/icon-512.png'],
  },
};

export default function DealsLayout({ children }) {
  return children;
}
