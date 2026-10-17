'use client';

import Link from 'next/link';

const STORE_THEMES = {
  amazon: {
    headerBg: 'bg-gradient-to-br from-amber-100/80 via-orange-50 to-amber-100/40',
    headerBorder: 'border-amber-200/60',
  },
  flipkart: {
    headerBg: 'bg-gradient-to-br from-blue-100/80 via-sky-50 to-blue-100/40',
    headerBorder: 'border-blue-200/60',
  },
  myntra: {
    headerBg: 'bg-gradient-to-br from-pink-100/80 via-rose-50 to-orange-50/60',
    headerBorder: 'border-pink-200/60',
  },
  ajio: {
    headerBg: 'bg-gradient-to-br from-slate-200/80 via-slate-100 to-slate-200/50',
    headerBorder: 'border-slate-300/60',
  },
  default: {
    headerBg: 'bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-100',
    headerBorder: 'border-neutral-200/70',
  },
};

export default function StoreCard({ store, products = [] }) {
  const storeKey = (store.slug || store.id || '').toLowerCase();
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
      className="group relative flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 hover:border-neutral-300 shadow-xs hover:shadow-xl active:shadow-md transition-all duration-300 overflow-hidden h-full hover:-translate-y-1.5 active:-translate-y-0.5 active:scale-[0.99] touch-manipulation select-none"
    >
      {/* 1. Top Brand Header Bar */}
      <div
        className={`relative h-24 sm:h-28 w-full p-4 flex items-start justify-between ${theme.headerBg} border-b ${theme.headerBorder} transition-colors`}
      >
        {/* Verified Status Tag */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-neutral-800 shadow-2xs border border-white/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Verified Partner</span>
        </span>

        {/* Live Deals Badge */}
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-neutral-900 text-white shadow-2xs group-hover:bg-[#f96b02] transition-colors">
          {activeDeals.length} Deals
        </span>
      </div>

      {/* 2. Floating Overlapping Logo Stage */}
      <div className="px-5 sm:px-6 relative z-10">
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-md border border-neutral-100 p-2.5 -mt-9 sm:-mt-10 flex items-center justify-center group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
          <img
            src={store.logoUrl}
            alt={store.name}
            className="max-w-full max-h-full object-contain filter"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.parentElement) {
                e.target.parentElement.innerText = (store.name || '').substring(0, 2).toUpperCase();
                e.target.parentElement.className =
                  'w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-black text-white flex items-center justify-center font-black text-xl uppercase';
              }
            }}
          />
        </div>
      </div>

      {/* 3. Card Body: Store Title, Tagline & Category Pills */}
      <div className="px-5 sm:px-6 pt-3 flex-grow flex flex-col">
        <h4 className="font-black text-xl sm:text-2xl text-neutral-900 uppercase tracking-tight group-hover:text-[#f96b02] transition-colors leading-none mb-1.5">
          {store.name}
        </h4>

        <p className="text-xs sm:text-[13px] text-neutral-500 font-medium line-clamp-1 mb-4">
          {store.description || 'Exclusive discounts & verified cashback offers'}
        </p>

        {/* Category Pills */}
        {activeCategories.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-auto mb-5">
            {activeCategories.map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-neutral-600 bg-neutral-100 group-hover:bg-neutral-200/70 transition-colors uppercase tracking-wider"
              >
                {cat}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-auto mb-5">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-neutral-400 bg-neutral-100 uppercase tracking-wider">
              Trending Deals
            </span>
          </div>
        )}
      </div>

      {/* 4. Full-Width CTA Below */}
      <div className="p-4 sm:p-5 pt-0 mt-auto">
        <div className="w-full py-3 px-4 rounded-xl bg-neutral-900 group-hover:bg-[#f96b02] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-xs group-hover:shadow-md">
          <span>Explore Deals</span>
          <svg
            className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
