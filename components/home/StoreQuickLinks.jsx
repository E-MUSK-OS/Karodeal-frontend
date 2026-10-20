'use client';

import { useState } from 'react';
import Link from 'next/link';
import Slider from '@/components/common/Slider';
import { ArrowUpRight } from 'lucide-react';

const STORE_THEMES = {
  amazon: {
    name: 'Amazon',
    slug: 'amazon',
    gradient: 'from-[#FF7A00] via-[#F4511E] to-[#C93800]',
    glowColor: 'rgba(255, 122, 0, 0.45)',
    tagline: 'Electronics & Prime Deals',
    perkText: 'Up to 70% Off',
  },
  flipkart: {
    name: 'Flipkart',
    slug: 'flipkart',
    gradient: 'from-[#2874F0] via-[#1565C0] to-[#0D47A1]',
    glowColor: 'rgba(40, 116, 240, 0.45)',
    tagline: 'Mega Savings & SuperCoins',
    perkText: 'Extra 10% Bank Off',
  },
  myntra: {
    name: 'Myntra',
    slug: 'myntra',
    gradient: 'from-[#FF3F6C] via-[#E91E63] to-[#AD1457]',
    glowColor: 'rgba(255, 63, 108, 0.45)',
    tagline: 'Fashion Edit & Daily Drops',
    perkText: 'Flat 50-80% Off',
  },
  ajio: {
    name: 'Ajio',
    slug: 'ajio',
    gradient: 'from-[#374151] via-[#1F2937] to-[#111827]',
    glowColor: 'rgba(44, 65, 82, 0.45)',
    tagline: 'Trendsetter & Brand Hub',
    perkText: 'Up to 60% Off',
  },
  meesho: {
    name: 'Meesho',
    slug: 'meesho',
    gradient: 'from-[#E91E63] via-[#D81B60] to-[#880E4F]',
    glowColor: 'rgba(219, 39, 119, 0.45)',
    tagline: 'Lowest Prices & Daily Finds',
    perkText: 'Budget Finds',
  },
  nykaa: {
    name: 'Nykaa',
    slug: 'nykaa',
    gradient: 'from-[#FC2779] via-[#E01563] to-[#99003D]',
    glowColor: 'rgba(252, 39, 121, 0.4)',
    tagline: 'Beauty & Cosmetics Deals',
    perkText: 'Up to 60% Off',
  },
  croma: {
    name: 'Croma',
    slug: 'croma',
    gradient: 'from-[#00B5B8] via-[#008A8C] to-[#005D5E]',
    glowColor: 'rgba(0, 181, 184, 0.4)',
    tagline: 'Gadgets & Electronics',
    perkText: 'Best Tech Deals',
  },
  tatacliq: {
    name: 'Tata CLiQ',
    slug: 'tatacliq',
    gradient: 'from-[#1E1E1E] via-[#2A2A2A] to-[#121212]',
    glowColor: 'rgba(50, 50, 50, 0.4)',
    tagline: 'Luxury Brands & Lifestyle',
    perkText: 'Exclusive Drop',
  },
  default: {
    name: 'Partner',
    slug: 'store',
    gradient: 'from-[#f96b02] via-[#ea580c] to-[#c2410c]',
    glowColor: 'rgba(249, 107, 2, 0.4)',
    tagline: 'Verified Partner Store',
    perkText: 'Exclusive Offers',
  },
};

function getStoreKey(store) {
  const raw = `${store.slug || ''} ${store.id || ''} ${store.name || ''}`.toLowerCase();
  if (raw.includes('amazon')) return 'amazon';
  if (raw.includes('flipkart')) return 'flipkart';
  if (raw.includes('myntra')) return 'myntra';
  if (raw.includes('ajio')) return 'ajio';
  if (raw.includes('meesho')) return 'meesho';
  if (raw.includes('nykaa')) return 'nykaa';
  if (raw.includes('croma')) return 'croma';
  if (raw.includes('tata') || raw.includes('cliq')) return 'tatacliq';
  return 'default';
}

function UniqueStoreCard({ store, dealCount = 0 }) {
  const storeKey = getStoreKey(store);
  const theme = STORE_THEMES[storeKey] || STORE_THEMES.default;

  // Exactly matching product deal card (StoreOfferCard) dimensions
  const widthClass = "w-[85vw] max-w-[350px] sm:max-w-none sm:w-[340px] md:w-[420px] lg:w-[460px]";
  const heightClass = "h-[220px] sm:h-[260px] md:h-[295px] lg:h-[325px]";

  return (
    <Link
      href={`/stores/${store.id || store.slug}`}
      prefetch={true}
      className={`group relative flex flex-col items-center justify-between ${widthClass} ${heightClass} p-4 sm:p-5 md:p-6 rounded-[22px] sm:rounded-[26px] md:rounded-[30px] bg-gradient-to-br ${theme.gradient} border border-white/25 hover:border-white/55 transition-all duration-300 ease-out cursor-pointer select-none overflow-hidden touch-manipulation hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/25 active:-translate-y-0.5 shadow-md shrink-0`}
    >
      {/* 1. Subtle Specular & Ambient Lighting Glows */}
      <div className="absolute -top-12 -left-12 w-36 h-36 bg-white/25 rounded-full blur-2xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-60" />
      <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-black/30 rounded-full blur-2xl pointer-events-none" />

      {/* 2. Glossy Holographic Light Sweep Shimmer on hover */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[22px] sm:rounded-[26px] md:rounded-[30px]">
        <div className="w-[200%] h-full absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
      </div>

      {/* 3. Top Status Header (Verified Tag + Deals Pill) */}
      <div className="relative z-10 w-full flex items-center justify-between mb-1.5 sm:mb-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[10px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Verified</span>
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-black/25 backdrop-blur-md text-white border border-white/25 shadow-xs group-hover:bg-black/40 transition-colors">
          <span>{dealCount > 0 ? `${dealCount} Deals` : 'Active'}</span>
        </span>
      </div>

      {/* 4. Center Elevated White Logo Stage */}
      <div className="relative z-10 flex items-center justify-center my-auto py-1 sm:py-2">
        <div className="relative w-18 h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-26 lg:h-26 rounded-2xl bg-white shadow-xl shadow-black/15 border border-white/80 flex items-center justify-center p-3 sm:p-3.5 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
          <img
            src={store.logoUrl}
            alt={store.name}
            className="max-w-full max-h-full object-contain filter drop-shadow-2xs transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.parentElement) {
                e.target.parentElement.innerText = (store.logoText || store.name || '').substring(0, 2);
                e.target.parentElement.className = `w-18 h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-26 lg:h-26 rounded-2xl bg-white text-neutral-900 flex items-center justify-center font-black text-base sm:text-xl md:text-2xl uppercase shadow-md`;
              }
            }}
          />
        </div>
      </div>

      {/* 5. Bottom Info: Store Name & White Action Pill */}
      <div className="relative z-10 w-full flex flex-col items-center text-center mt-1 sm:mt-2">
        <h4 className="text-white font-black text-sm sm:text-base md:text-lg tracking-tight uppercase drop-shadow-sm truncate max-w-full mb-1.5">
          {store.name}
        </h4>

        {/* High-Contrast White Action Pill */}
        <div className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white text-neutral-950 font-black text-[11px] sm:text-xs md:text-[13px] uppercase tracking-wider shadow-lg group-hover:bg-neutral-50 group-hover:scale-104 transition-all duration-200">
          <span className="truncate">{theme.perkText}</span>
          <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] text-neutral-900 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        {/* Micro Tagline */}
        <p className="text-[11px] sm:text-xs text-white/85 font-medium truncate max-w-full mt-2 drop-shadow-xs">
          {theme.tagline}
        </p>
      </div>
    </Link>
  );
}

export default function StoreQuickLinks({ stores, products = [] }) {
  if (!stores || stores.length === 0) return null;

  // Helper to count active deals per store
  const getDealCount = (storeId) => {
    if (!products || products.length === 0) return 0;
    return products.filter((p) => p.store === storeId || p.storeId === storeId).length;
  };

  return (
    <section className="border-b border-neutral-200 dark:border-neutral-800 pb-8 md:pb-12 mb-12 md:mb-20 w-full">
      {/* Slider layout with identical slide width as product deal cards */}
      <Slider
        autoPlay={true}
        autoPlayInterval={4000}
        slideClassName="!w-auto !h-auto"
        slidesPerView="auto"
        breakpoints={{
          0: { spaceBetween: 12 },
          768: { spaceBetween: 20 },
        }}
      >
        {stores.map((store) => (
          <div key={store.id} className="shrink-0 snap-start h-full flex p-1">
            <UniqueStoreCard store={store} dealCount={getDealCount(store.id)} />
          </div>
        ))}
      </Slider>
    </section>
  );
}