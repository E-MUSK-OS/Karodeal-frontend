
import Link from 'next/link';
import { getProducts, getStores, getCategories } from '@/lib/fetchProducts';

import Hero from '@/components/home/Hero';
import StoreQuickLinks from '@/components/home/StoreQuickLinks';
import FeaturedBanners from '@/components/home/FeaturedBanners';
import LatestDrops from '@/components/home/LatestDrops';
import TopCategories from '@/components/categories/TopCategories';
import Newsletter from '@/components/home/Newsletter';
import Button from '@/components/common/Button';
import StoreDealsSection from '@/components/home/StoreDealsSection';
import TheProcess from '@/components/home/TheProcess';

async function getBackendStatus() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/health`, { next: { revalidate: 60 } });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Backend is temporarily unavailable.' };
  }
}

const banners = [
  {
    id: "banner-1",
    store: "amazon",
    headline: "Amazon Mega Deals",
    subheadline: "Up to 70% OFF",
    description: "Explore today's top Amazon deals on Electronics, Clothing and more.",
    ctaText: "Shop Amazon Deals",
    color: "bg-gradient-to-r from-slate-900 to-slate-800",
    badgeColor: "bg-rose-500",
    affiliateUrl: "https://example.com/amazon-deals"
  },
  {
    id: "banner-2",
    store: "flipkart",
    headline: "Flipkart Big Savings",
    subheadline: "Extra 10% Bank Discount",
    description: "Upgrade your lifestyle with the biggest discounts of the season.",
    ctaText: "Explore Offers",
    color: "bg-gradient-to-r from-blue-700 to-blue-500",
    badgeColor: "bg-yellow-400 text-black",
    affiliateUrl: "https://example.com/flipkart-deals"
  },
  {
    id: "banner-3",
    store: "myntra",
    headline: "Myntra Clothing Offers",
    subheadline: "Flat 50-80% OFF",
    description: "Refresh your wardrobe with premium brands at unbeatable prices.",
    ctaText: "Shop Clothing",
    color: "bg-gradient-to-r from-fuchsia-600 to-pink-500",
    badgeColor: "bg-white text-black",
    affiliateUrl: "https://example.com/myntra-deals"
  }
];

export default async function Home() {
  const [products, stores, categories, backendStatus] = await Promise.all([
    getProducts(),
    getStores(),
    getCategories(),
    getBackendStatus()
  ]);
  console.log('Live Backend Status:', backendStatus.message);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KaroDeal',
    url: 'https://karodeal.in',
    description: "Discover the latest discounts, offers, coupons, and trending products from India's top shopping platforms like Amazon, Flipkart, Myntra, and more.",
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://karodeal.in/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <div className="flex flex-col page-container ">
      <Hero />

      <div className="w-full mt-8 sm:mt-12">
        <TopCategories categories={categories} />


        <StoreQuickLinks stores={stores} products={products} />

        {/* Store-specific deal sections */}
        <div className="mb-8 md:mb-16">
          {stores.map(store => {
            const storeDeals = products.filter(p => p.store === store.id);
            if (storeDeals.length > 0) {
              return <StoreDealsSection key={store.id} store={store} deals={storeDeals} />;
            }
            return null;
          })}
        </div>

        <section className="mb-10 md:mb-20">
          <FeaturedBanners banners={banners} stores={stores} products={products} />
        </section>

        {/* Today's Best Deals */}
        <LatestDrops />


        <TheProcess />

      </div>

      {/* Edge-to-edge Newsletter */}
      <Newsletter />
    </div>
    </>
  );
}
