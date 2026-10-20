'use client';

import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';

const STORE_THEMES = {
  amazon: {
    name: 'Amazon',
    slug: 'amazon',
    gradient: 'from-[#FF7A00] via-[#F4511E] to-[#C93800]',
    glowColor: 'rgba(255, 122, 0, 0.45)',
    perkText: 'Up to 8% Cashback',
    tagline: 'Electronics, Fashion & Daily Essentials',
    badge: 'Mega Store Deals',
  },
  flipkart: {
    name: 'Flipkart',
    slug: 'flipkart',
    gradient: 'from-[#0066FF] via-[#0284C7] to-[#0369A1]',
    glowColor: 'rgba(0, 102, 255, 0.45)',
    perkText: 'SuperCoins + Extra Cashback',
    tagline: 'Mobiles, Appliances & Top Trends',
    badge: 'Verified Partner',
  },
  myntra: {
    name: 'Myntra',
    slug: 'myntra',
    gradient: 'from-[#E11D48] via-[#FF007A] to-[#BE185D]',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    perkText: 'Extra ₹150 OFF + Cashback',
    tagline: 'Premium Fashion & Streetwear',
    badge: 'Fashion Hub',
  },
  ajio: {
    name: 'AJIO',
    slug: 'ajio',
    gradient: 'from-[#2C3E50] via-[#1E293B] to-[#0F172A]',
    glowColor: 'rgba(44, 62, 80, 0.45)',
    perkText: 'Direct Discount + Rewards',
    tagline: 'Trendy Styles & International Brands',
    badge: 'Official Store',
  },
  meesho: {
    name: 'Meesho',
    slug: 'meesho',
    gradient: 'from-[#A21CAF] via-[#D946EF] to-[#86198F]',
    glowColor: 'rgba(162, 28, 175, 0.45)',
    perkText: 'Lowest Price Guarantee',
    tagline: 'Wholesale Fashion & Home Goods',
    badge: 'Budget Friendly',
  },
  nykaa: {
    name: 'Nykaa',
    slug: 'nykaa',
    gradient: 'from-[#E11D74] via-[#F43F5E] to-[#BE123C]',
    glowColor: 'rgba(225, 29, 116, 0.45)',
    perkText: 'Authentic Beauty Rewards',
    tagline: 'Cosmetics, Skincare & Fragrances',
    badge: '100% Authentic',
  },
  croma: {
    name: 'Croma',
    slug: 'croma',
    gradient: 'from-[#00B5B8] via-[#008A8C] to-[#005D5E]',
    glowColor: 'rgba(0, 181, 184, 0.45)',
    perkText: 'Instant Bank Discounts',
    tagline: 'Gadgets, Laptops & Home Tech',
    badge: 'Tata Enterprise',
  },
  tatacliq: {
    name: 'Tata CLiQ',
    slug: 'tatacliq',
    gradient: 'from-[#1E1E1E] via-[#2A2A2A] to-[#121212]',
    glowColor: 'rgba(30, 30, 30, 0.45)',
    perkText: 'Luxury Drop + Rewards',
    tagline: 'Curated Luxury Lifestyle Brands',
    badge: 'Luxury Partner',
  },
  default: {
    name: 'Partner',
    slug: 'store',
    gradient: 'from-[#f96b02] via-[#ea580c] to-[#c2410c]',
    glowColor: 'rgba(249, 107, 2, 0.45)',
    perkText: 'Verified Cashback & Deals',
    tagline: 'Top Indian Shopping Destination',
    badge: 'Verified Store',
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

export default function StoreCard({ store, products = [] }) {
  const storeKey = getStoreKey(store);
  const theme = STORE_THEMES[storeKey] || STORE_THEMES.default;

  const activeDeals = products.filter(
    (p) => p.store === store.id || p.storeId === store.id || p.store === store.slug
  );
  const activeCategories = [
    ...new Set(activeDeals.map((p) => p.categoryRel?.name || p.category)),
  ]
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Link
      href={`/stores/${store.slug || store.id}`}
      prefetch={true}
      className="group relative flex flex-col justify-between bg-white rounded-[26px] sm:rounded-[30px] border border-neutral-200/90 hover:border-neutral-300 shadow-sm hover:shadow-2xl active:shadow-md transition-all duration-300 overflow-hidden h-full hover:-translate-y-2 active:-translate-y-0.5 touch-manipulation select-none"
    >
      {/* 1. Top Brand Header Bar with Ambient Glow & Shimmer */}
      <div
        className={`relative h-28 sm:h-32 w-full p-3.5 sm:p-4 flex items-start justify-between bg-gradient-to-br ${theme.gradient} overflow-hidden transition-colors`}
      >
        {/* Subtle Ambient Specular & Lighting Glows */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-black/30 rounded-full blur-2xl pointer-events-none" />

        {/* Hover Light Sweep Sweep */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-[200%] h-full absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
        </div>

        {/* Verified Status Tag */}
        <div className="relative z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Verified Partner</span>
        </div>

        {/* Live Deals Badge */}
        <div className="relative z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-black/30 backdrop-blur-md text-white border border-white/20 shadow-xs group-hover:bg-black/45 transition-colors">
          <span>{activeDeals.length > 0 ? `${activeDeals.length} Live Deals` : 'Active'}</span>
        </div>
      </div>

      {/* 2. Floating Overlapping Logo Stage */}
      <div className="px-5 sm:px-6 relative z-10 flex items-center justify-between">
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl sm:rounded-[22px] bg-white shadow-xl shadow-black/10 border-2 border-white p-2.5 sm:p-3 -mt-10 sm:-mt-11 flex items-center justify-center group-hover:scale-108 group-hover:shadow-2xl transition-all duration-300">
          <img
            src={store.logoUrl}
            alt={store.name}
            className="max-w-full max-h-full object-contain filter drop-shadow-2xs transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.parentElement) {
                e.target.parentElement.innerText = (store.logoText || store.name || '').substring(0, 2).toUpperCase();
                e.target.parentElement.className =
                  'w-20 h-20 sm:w-22 sm:h-22 rounded-2xl sm:rounded-[22px] bg-neutral-900 text-white flex items-center justify-center font-black text-xl uppercase shadow-xl -mt-10 sm:-mt-11 border-2 border-white';
              }
            }}
          />
        </div>

        {/* Brand Perk Badge */}
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200/80 -mt-2 shadow-2xs">
          <Sparkles className="w-3 h-3 text-[#f96b02]" />
          <span>{theme.badge}</span>
        </span>
      </div>

      {/* 3. Card Body: Store Title, Tagline & Fintech Reward Pill */}
      <div className="px-5 sm:px-6 pt-3.5 pb-2 flex-grow flex flex-col">
        <h4 className="font-black text-xl sm:text-2xl text-neutral-900 uppercase tracking-tight group-hover:text-[#f96b02] transition-colors leading-none mb-1.5 truncate">
          {store.name}
        </h4>

        <p className="text-xs sm:text-[13px] text-neutral-500 font-medium line-clamp-1 mb-3.5">
          {store.description || theme.tagline}
        </p>

        {/* Fintech Reward Banner */}
        <div className="mb-4 p-2.5 rounded-xl bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-orange-50/40 border border-orange-200/60 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#f96b02] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-black uppercase text-neutral-900 tracking-wide truncate">
              {theme.perkText}
            </span>
            <span className="block text-[9px] font-medium text-neutral-500 -mt-0.5 truncate">
              KaroDeal Guaranteed Cashback
            </span>
          </div>
        </div>

        {/* Category Pills */}
        {activeCategories.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
            {activeCategories.map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold text-neutral-700 bg-neutral-100 border border-neutral-200/60 group-hover:bg-neutral-200/70 transition-colors uppercase tracking-wider"
              >
                {cat}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-auto mb-4">
            <span className="px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold text-neutral-500 bg-neutral-100 border border-neutral-200/60 uppercase tracking-wider">
              Top Verified Deals
            </span>
          </div>
        )}
      </div>

      {/* 4. Full-Width CTA Below */}
      <div className="p-4 sm:p-5 pt-0 mt-auto">
        <div className="w-full py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl bg-neutral-950 group-hover:bg-[#f96b02] text-white text-xs sm:text-[13px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:shadow-orange-500/25">
          <span>Explore {store.name} Deals</span>
          <ArrowUpRight className="w-4 h-4 stroke-[2.5] text-white transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </div>
    </Link>
  );
}
