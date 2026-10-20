import { getStores, getProducts } from '@/lib/fetchProducts';
import StoreCard from '@/components/stores/StoreCard';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export const metadata = {
  title: 'Top Shopping Stores & Partner Brands | KaroDeal',
  description: 'Shop through verified partner stores on KaroDeal. Earn guaranteed cashback and discover exclusive deals from Amazon, Flipkart, Myntra, Ajio, and top brands.',
  keywords: ['Online Stores India', 'Amazon Offers', 'Flipkart Cashback', 'Myntra Deals', 'Ajio Coupons', 'KaroDeal Stores'],
  alternates: {
    canonical: 'https://karodeal.in/stores',
  },
  openGraph: {
    title: 'Top Shopping Stores & Partner Brands | KaroDeal',
    description: 'Shop through verified partner stores on KaroDeal. Earn guaranteed cashback on top Indian e-commerce platforms.',
    url: 'https://karodeal.in/stores',
    siteName: 'KaroDeal',
    images: [{ url: 'https://karodeal.in/icon-512.png', width: 512, height: 512, alt: 'KaroDeal Stores' }],
  },
};

export default async function StoresPage() {
  const stores = await getStores();
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Modern & Premium Hero Section */}
      <div className="relative pt-12 pb-12 sm:pt-16 sm:pb-16 mb-10 sm:mb-14 bg-white border-b border-neutral-200/80 overflow-hidden">
        {/* Ambient Top Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-orange-100/60 via-amber-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="page-container text-center relative z-10">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#f96b02] text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Partners & Guaranteed Cashback</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-950 uppercase tracking-tighter mb-4 leading-tight">
            Top Shopping Stores
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 font-medium max-w-2xl mx-auto leading-relaxed mb-6">
            Shop directly through India's premier online stores. Unlock exclusive daily discounts, verified promo codes, and real withdrawable KaroDeal cashback.
          </p>

          {/* 3 Trust Pillars */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-bold text-neutral-700">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200/70">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Verified Partners</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200/70">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Store Redirect</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200/70">
              <Sparkles className="w-3.5 h-3.5 text-[#f96b02]" />
              <span>Extra Cashback on Every Order</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="page-container">
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-neutral-950 uppercase tracking-tight">
              All Partner Stores
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#f96b02]/10 text-[#f96b02] border border-[#f96b02]/20">
              {stores.length}
            </span>
          </div>
          <div className="h-px bg-neutral-200/80 flex-grow ml-6 hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
          {stores.map((store) => (
            <div key={store.id} className="h-full">
              <StoreCard store={store} products={products} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
