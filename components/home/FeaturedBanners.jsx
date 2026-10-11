'use client';

import React from 'react';
import Link from 'next/link';

const BANNER_THEMES = {
  amazon: {
    bgGradient: "bg-gradient-to-br from-[#0a0e17] via-[#101726] to-[#1c2436]",
    borderAccent: "border-amber-500/30 hover:border-amber-400/80",
    glowOrb: "bg-amber-500/25",
    ambientLight: "from-amber-500/10 via-orange-500/5 to-transparent",
    badgeBg: "bg-amber-400 text-black font-black",
    badgeLabel: "Prime Mega Deals",
    discountTag: "UP TO 70% OFF",
    discountBadgeBg: "bg-gradient-to-r from-amber-400 to-orange-500 text-black",
    buttonBg: "bg-white text-black hover:bg-amber-400 group-hover:shadow-[0_0_25px_rgba(255,153,0,0.4)]",
    hoverShadow: "hover:shadow-[0_25px_50px_-15px_rgba(255,153,0,0.35)]",
    accentColor: "#FF9900",
  },
  flipkart: {
    bgGradient: "bg-gradient-to-br from-[#043396] via-[#0845c4] to-[#145df0]",
    borderAccent: "border-blue-300/30 hover:border-yellow-300/80",
    glowOrb: "bg-yellow-400/30",
    ambientLight: "from-yellow-400/10 via-blue-400/5 to-transparent",
    badgeBg: "bg-yellow-400 text-black font-black",
    badgeLabel: "Big Billion Savings",
    discountTag: "EXTRA 10% BANK OFF",
    discountBadgeBg: "bg-gradient-to-r from-yellow-300 to-yellow-500 text-black",
    buttonBg: "bg-white text-black hover:bg-yellow-400 group-hover:shadow-[0_0_25px_rgba(255,210,0,0.4)]",
    hoverShadow: "hover:shadow-[0_25px_50px_-15px_rgba(8,69,196,0.5)]",
    accentColor: "#2874F0",
  },
  myntra: {
    bgGradient: "bg-gradient-to-br from-[#680237] via-[#94084f] to-[#ce126b]",
    borderAccent: "border-pink-300/30 hover:border-pink-200/80",
    glowOrb: "bg-pink-400/30",
    ambientLight: "from-pink-400/10 via-rose-400/5 to-transparent",
    badgeBg: "bg-white text-black font-black",
    badgeLabel: "Fashion Carnival",
    discountTag: "FLAT 50-80% OFF",
    discountBadgeBg: "bg-gradient-to-r from-pink-300 to-rose-400 text-black",
    buttonBg: "bg-white text-black hover:bg-pink-100 group-hover:shadow-[0_0_25px_rgba(206,18,107,0.4)]",
    hoverShadow: "hover:shadow-[0_25px_50px_-15px_rgba(206,18,107,0.5)]",
    accentColor: "#FF3F6C",
  },
  default: {
    bgGradient: "bg-gradient-to-br from-neutral-900 via-neutral-800 to-black",
    borderAccent: "border-white/20 hover:border-white/50",
    glowOrb: "bg-orange-500/25",
    ambientLight: "from-orange-500/10 to-transparent",
    badgeBg: "bg-white text-black font-black",
    badgeLabel: "Featured Offers",
    discountTag: "SPECIAL DROP",
    discountBadgeBg: "bg-white text-black",
    buttonBg: "bg-white text-black hover:bg-neutral-100",
    hoverShadow: "hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.5)]",
    accentColor: "#f96b02",
  },
};

export default function FeaturedBanners({ banners = [], stores = [] }) {
  if (!banners || banners.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      {banners.map((banner) => {
        const storeKey = (banner.store || '').toLowerCase();
        const theme = BANNER_THEMES[storeKey] || BANNER_THEMES.default;
        
        // Find matching store
        const store = stores.find((s) => (s.slug || s.id || '').toLowerCase() === storeKey);

        return (
          <Link
            key={banner.id}
            href={`/stores/${banner.store}`}
            className={`group relative ${theme.bgGradient} p-6 sm:p-8 md:p-9 rounded-[30px] sm:rounded-[36px] overflow-hidden flex flex-col justify-between min-h-[360px] md:min-h-[380px] border ${theme.borderAccent} shadow-xl ${theme.hoverShadow} transition-all duration-500 hover:-translate-y-2 cursor-pointer select-none`}
          >
            {/* 1. Ambient Radial Glow Orb */}
            <div className={`absolute -top-16 -right-16 w-64 h-64 ${theme.glowOrb} rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700`} />

            {/* 2. Shimmer Light Sweep Effect on Hover */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[30px] sm:rounded-[36px]">
              <div className="w-[200%] h-full absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out" />
            </div>

            {/* 3. Subtle Geometric Background Watermark */}
            <div className="absolute -bottom-2 -right-2 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity duration-500 font-black text-7xl sm:text-8xl md:text-9xl uppercase tracking-tighter text-white select-none">
              {banner.store}
            </div>

            {/* Top Bar: Store Emblem + Pill Tag + Discount Badge */}
            <div className="relative z-10 flex items-center justify-between w-full mb-6">
              <div className="flex items-center gap-2.5">
                {store?.logoUrl ? (
                  <div className="w-8 h-8 rounded-full bg-white p-1.5 flex items-center justify-center shadow-md shrink-0">
                    <img
                      src={store.logoUrl}
                      alt={banner.store}
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                ) : null}
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.badgeBg} shadow-xs border border-white/20`}>
                  {banner.store}
                </span>
              </div>

              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.discountBadgeBg} shadow-md`}>
                {theme.discountTag}
              </span>
            </div>

            {/* Middle Section: Typography (Clean, Full-Width, No Product Photo) */}
            <div className="relative z-10 flex flex-col my-auto py-2">
              <h3 className="font-black text-white uppercase tracking-tighter text-2xl sm:text-3xl md:text-4xl leading-[1.08] drop-shadow-md mb-2.5 group-hover:translate-x-1 transition-transform duration-300">
                {banner.headline}
              </h3>
              <div className="inline-block w-fit px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-white/95 font-black text-xs sm:text-[13px] uppercase tracking-wider mb-3">
                {banner.subheadline}
              </div>
              <p className="text-xs sm:text-sm text-white/75 font-medium line-clamp-2 max-w-md leading-relaxed">
                {banner.description}
              </p>
            </div>

            {/* Bottom Section: High-Contrast CTA Button */}
            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between w-full">
              <span className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider ${theme.buttonBg} shadow-lg transition-all duration-300 group-hover:scale-105 active:scale-95 group/btn`}>
                <span>{banner.ctaText}</span>
                <svg
                  className="w-4 h-4 transform group-hover/btn:translate-x-1.5 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>

              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 group-hover:text-white transition-colors hidden sm:inline-block">
                Tap to Explore &rarr;
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
