'use client';

import { useState } from 'react';
import Link from 'next/link';
import Slider from '@/components/common/Slider';

const STORE_THEMES = {
  amazon: {
    name: 'Amazon',
    slug: 'amazon',
    accentColor: '#FF9900',
    gradient: 'from-[#FF9900] via-[#FF8000] to-[#E65100]',
    glowColor: 'rgba(255, 153, 0, 0.45)',
    hoverBorder: 'hover:border-[#FF9900] active:border-[#FF9900] focus-visible:border-[#FF9900]',
    radialBg: 'radial-gradient(circle at 50% 35%, rgba(255, 153, 0, 0.22) 0%, rgba(255, 110, 0, 0.08) 50%, transparent 75%)',
    tagline: 'Electronics & Prime Deals',
    perkText: 'Up to 70% Off',
  },
  flipkart: {
    name: 'Flipkart',
    slug: 'flipkart',
    accentColor: '#2874F0',
    gradient: 'from-[#2874F0] via-[#1A65E0] to-[#0A4BB7]',
    glowColor: 'rgba(40, 116, 240, 0.45)',
    hoverBorder: 'hover:border-[#2874F0] active:border-[#2874F0] focus-visible:border-[#2874F0]',
    radialBg: 'radial-gradient(circle at 50% 35%, rgba(40, 116, 240, 0.22) 0%, rgba(0, 150, 255, 0.08) 50%, transparent 75%)',
    tagline: 'Mega Savings & SuperCoins',
    perkText: 'Extra 10% Bank Off',
  },
  myntra: {
    name: 'Myntra',
    slug: 'myntra',
    accentColor: '#FF3F6C',
    gradient: 'from-[#FF3F6C] via-[#FF527B] to-[#FF8A00]',
    glowColor: 'rgba(255, 63, 108, 0.45)',
    hoverBorder: 'hover:border-[#FF3F6C] active:border-[#FF3F6C] focus-visible:border-[#FF3F6C]',
    radialBg: 'radial-gradient(circle at 50% 35%, rgba(255, 63, 108, 0.22) 0%, rgba(255, 138, 0, 0.08) 50%, transparent 75%)',
    tagline: 'Fashion Edit & Daily Drops',
    perkText: 'Flat 50-80% Off',
  },
  ajio: {
    name: 'Ajio',
    slug: 'ajio',
    accentColor: '#2C4152',
    gradient: 'from-[#2C4152] via-[#3A506B] to-[#1E293B]',
    glowColor: 'rgba(44, 65, 82, 0.45)',
    hoverBorder: 'hover:border-[#2C4152] active:border-[#2C4152] focus-visible:border-[#2C4152]',
    radialBg: 'radial-gradient(circle at 50% 35%, rgba(44, 65, 82, 0.22) 0%, rgba(74, 100, 125, 0.08) 50%, transparent 75%)',
    tagline: 'Trendsetter & Brand Hub',
    perkText: 'Up to 60% Off',
  },
  meesho: {
    name: 'Meesho',
    slug: 'meesho',
    accentColor: '#DB2777',
    gradient: 'from-[#DB2777] via-[#BE185D] to-[#831843]',
    glowColor: 'rgba(219, 39, 119, 0.45)',
    hoverBorder: 'hover:border-[#DB2777] active:border-[#DB2777] focus-visible:border-[#DB2777]',
    radialBg: 'radial-gradient(circle at 50% 35%, rgba(219, 39, 119, 0.22) 0%, rgba(131, 24, 67, 0.08) 50%, transparent 75%)',
    tagline: 'Lowest Prices & Daily Essentials',
    perkText: 'Budget Finds',
  },
  default: {
    name: 'Partner',
    slug: 'store',
    accentColor: '#f96b02',
    gradient: 'from-[#f96b02] via-[#ea580c] to-[#c2410c]',
    glowColor: 'rgba(249, 107, 2, 0.4)',
    hoverBorder: 'hover:border-[#f96b02] active:border-[#f96b02] focus-visible:border-[#f96b02]',
    radialBg: 'radial-gradient(circle at 50% 35%, rgba(249, 107, 2, 0.2) 0%, rgba(249, 107, 2, 0.06) 50%, transparent 75%)',
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
  return 'default';
}

function UniqueStoreCard({ store, dealCount = 0 }) {
  const [isInteracting, setIsInteracting] = useState(false);
  const storeKey = getStoreKey(store);
  const theme = STORE_THEMES[storeKey] || STORE_THEMES.default;

  return (
    <Link
      href={`/stores/${store.id || store.slug}`}
      prefetch={true}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => setTimeout(() => setIsInteracting(false), 500)}
      className={`group relative flex flex-col items-center justify-between w-full h-full min-h-[148px] sm:min-h-[210px] md:min-h-[245px] py-3 sm:py-5 md:py-6 px-2.5 sm:px-4 md:px-5 rounded-2xl md:rounded-[28px] bg-white border border-neutral-200/90 transition-all duration-300 ease-out cursor-pointer select-none overflow-hidden touch-manipulation ${theme.hoverBorder} ${
        isInteracting
          ? '-translate-y-2 shadow-xl'
          : 'hover:-translate-y-2 active:-translate-y-1 hover:shadow-xl active:shadow-md'
      }`}
      style={{
        boxShadow: isInteracting
          ? `0 18px 36px -10px ${theme.glowColor}, 0 6px 12px -2px rgba(0,0,0,0.06)`
          : undefined,
        borderColor: isInteracting ? theme.accentColor : undefined,
      }}
    >
      {/* 1. Ambient Radial Aurora Backdrop */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isInteracting ? 'opacity-100' : 'opacity-30 group-hover:opacity-100 group-active:opacity-100'
        }`}
        style={{ background: theme.radialBg }}
      />

      {/* 2. Top Sleek Architectural Accent Bar with Brand Gradient */}
      <div
        className={`absolute top-0 inset-x-0 bg-gradient-to-r ${theme.gradient} transition-all duration-300 ${
          isInteracting ? 'h-2 opacity-100' : 'h-1 sm:h-1.5 group-hover:h-2 group-active:h-2 opacity-90 group-hover:opacity-100'
        }`}
      />

      {/* 3. Glossy Light Sweep Beam (Holographic Shimmer on hover) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl md:rounded-[28px]">
        <div
          className={`w-[200%] h-full absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-in-out ${
            isInteracting
              ? 'translate-x-[150%]'
              : '-translate-x-[150%] group-hover:translate-x-[150%] group-active:translate-x-[150%]'
          }`}
        />
      </div>

      {/* 4. Top Status Header (Deals Badge) */}
      <div className="relative z-10 w-full flex items-center justify-end min-h-[16px] sm:min-h-[20px] mb-0.5 sm:mb-1">
        {dealCount > 0 ? (
          <span
            className={`text-[8.5px] sm:text-[9.5px] md:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-900 text-white shadow-xs transition-transform duration-300 ${
              isInteracting ? 'scale-105' : 'group-hover:scale-105 group-active:scale-105'
            }`}
          >
            {dealCount} Deals
          </span>
        ) : null}
      </div>

      {/* 5. Center Logo Stage */}
      <div className="relative z-10 flex items-center justify-center my-auto py-0.5 sm:py-1">
        <div
          className={`relative w-12 h-12 sm:w-18 sm:h-18 md:w-22 md:h-22 flex items-center justify-center p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
            isInteracting
              ? 'bg-white scale-110 shadow-md border-neutral-200'
              : 'bg-neutral-50/80 border-neutral-100 group-hover:bg-white group-active:bg-white group-hover:scale-110 group-active:scale-105 group-hover:shadow-md'
          }`}
        >
          <img
            src={store.logoUrl}
            alt={store.name}
            className="max-w-full max-h-full object-contain filter drop-shadow-xs transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.parentElement) {
                e.target.parentElement.innerText = (store.logoText || store.name || '').substring(0, 2);
                e.target.parentElement.className = `w-12 h-12 sm:w-18 sm:h-18 md:w-22 md:h-22 rounded-xl sm:rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center font-black text-xs sm:text-base md:text-lg uppercase text-white shadow-xs`;
              }
            }}
          />
        </div>
      </div>

      {/* 6. Store Name & Micro CTA */}
      <div className="relative z-10 w-full flex flex-col items-center mt-1 sm:mt-2">
        <h4 className="text-black font-black text-[11px] sm:text-xs md:text-[13px] tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-colors truncate max-w-full text-center">
          {store.name}
        </h4>
        <div
          className={`mt-0.5 flex items-center justify-center gap-1 text-[9px] sm:text-[10px] md:text-[11px] font-bold transition-colors truncate max-w-full text-center ${
            isInteracting ? 'text-black' : 'text-neutral-500 group-hover:text-black group-active:text-black'
          }`}
        >
          <span className="truncate">{theme.perkText}</span>
          <svg
            className={`w-2.5 h-2.5 shrink-0 transform transition-transform duration-300 ${
              isInteracting ? 'translate-x-1' : 'group-hover:translate-x-1 group-active:translate-x-1'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
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
    <section className="border-b border-neutral-200 pb-8 md:pb-12 mb-12 md:mb-20 w-full">
      {/* Slider layout with responsive hover and touch optimization */}
      <Slider
        autoPlay={true}
        autoPlayInterval={4000}
        slidesPerView={2}
        breakpoints={{
          0: { slidesPerView: 2, spaceBetween: 12 },
          480: { slidesPerView: 3, spaceBetween: 16 },
          768: { slidesPerView: 4, spaceBetween: 20 },
          1280: { slidesPerView: 5, spaceBetween: 20 },
        }}
        slideClassName="!h-auto"
      >
        {stores.map((store) => (
          <div key={store.id} className="w-full h-full flex p-1">
            <UniqueStoreCard store={store} dealCount={getDealCount(store.id)} />
          </div>
        ))}
      </Slider>
    </section>
  );
}