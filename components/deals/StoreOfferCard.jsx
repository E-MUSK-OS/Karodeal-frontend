'use client';

import { useRouter } from 'next/navigation';

export default function StoreOfferCard({ deal, product, store: propStore, fullWidth = false }) {
  const router = useRouter();

  // Backwards compatibility if called with product instead of deal
  const currentDeal = deal || product;
  if (!currentDeal) return null;

  // Use deal.storeRel first, then propStore, then fallback
  const store = currentDeal.storeRel || propStore || { name: 'Unknown', logoUrl: '' };

  let bgClass = "bg-neutral-900";
  let tagClass = "bg-blue-500";

  // Ultra-premium, multi-stop linear gradients with deep, rich colors
  const storeIdStr = store.slug || store.id || '';
  if (storeIdStr === 'amazon') {
    bgClass = "bg-gradient-to-br from-[#ff9a44] via-[#fc6011] to-[#b33900]";
    tagClass = "bg-black/20 text-white backdrop-blur-md border border-white/20";
  } else if (storeIdStr === 'flipkart') {
    bgClass = "bg-gradient-to-br from-[#4da0ff] via-[#0066cc] to-[#003d7a]";
    tagClass = "bg-black/20 text-white backdrop-blur-md border border-white/20";
  } else if (storeIdStr === 'myntra') {
    bgClass = "bg-gradient-to-br from-[#ff75b8] via-[#e61e7a] to-[#80003b]";
    tagClass = "bg-black/20 text-white backdrop-blur-md border border-white/20";
  } else if (storeIdStr === 'ajio') {
    bgClass = "bg-gradient-to-br from-[#4a5f73] via-[#243340] to-[#0f171e]";
    tagClass = "bg-black/20 text-white backdrop-blur-md border border-white/20";
  } else if (storeIdStr === 'meesho') {
    bgClass = "bg-gradient-to-br from-[#9b2175] via-[#580a46] to-[#2a0220]";
    tagClass = "bg-black/20 text-white backdrop-blur-md border border-white/20";
  }

  const logoText = store.logoText || store.name;

  const getCashback = (p) => {
    if (p.cashback !== undefined && p.cashback !== '') return Number(p.cashback);
    const charCode = p.id ? p.id.charCodeAt(p.id.length - 1) : 0;
    return (charCode % 5) + 2 + (charCode % 2 === 0 ? 0.5 : 0);
  };

  const cashback = getCashback(currentDeal);
  const cashbackType = storeIdStr === 'flipkart' ? 'Cashback' : 'Rewards';

  const widthClass = fullWidth ? "w-full" : "w-[280px] sm:w-[350px] md:w-[420px]";
  const heightClass = "h-auto min-h-[180px] sm:min-h-[300px] md:min-h-[320px] h-full";

  const dealUrl = currentDeal.affiliateUrl || `https://www.${storeIdStr}.com`;

  const handleDealClick = () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      fetch(`${apiUrl}/products/${currentDeal.id}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      }).catch(err => console.error(err));
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  // IF IT'S A CUSTOM IMAGE CARD
  if (currentDeal.salePrice === 0 && currentDeal.discount === 0) {
    return (
      <a
        href={dealUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleDealClick}
        className={`block relative flex flex-col justify-center items-center ${widthClass} ${heightClass} rounded-2xl md:rounded-[32px] overflow-hidden shrink-0 bg-neutral-100 p-0 group shadow-lg hover:shadow-xl/20 active:shadow-xl/20 hover:-translate-y-2 active:-translate-y-2 transition-all duration-500 ease-out cursor-pointer`}
      >
        <img src={currentDeal.image} alt={currentDeal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.target.style.display = 'none'; }} />
        
        {/* Grab Deal Button Overlay */}
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20">
          <span
            className="btn group/btn bg-white/95 text-black font-black uppercase !text-[12px] !px-[10px] !py-[5px] sm:!text-[14px] sm:!px-6 sm:!py-3 md:!px-8 md:!py-3.5 rounded-full w-fit hover:bg-white hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95 flex items-center gap-2 whitespace-nowrap"
          >
            Grab Deal
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={dealUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleDealClick}
      className={`block relative flex flex-col justify-between ${widthClass} ${heightClass} rounded-2xl md:rounded-[32px] overflow-hidden shrink-0 ${bgClass} p-3 md:p-6 group shadow-lg hover:shadow-xl/20 active:shadow-xl/20 hover:-translate-y-2 active:-translate-y-2 transition-all duration-500 ease-out cursor-pointer`}
    >
      {/* Noise Texture Overlay for that premium tactile feel */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Decorative Lighting elements */}
      <div className="absolute -top-24 -left-24 w-56 h-56 bg-white opacity-10 rounded-full blur-3xl pointer-events-none group-hover:opacity-30 group-active:opacity-30 transition-opacity duration-700"></div>
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-700 z-0 pointer-events-none"></div>

      {/* Main Container - 2 Columns */}
      <div className="relative z-10 flex flex-row w-full h-full">

        {/* Left Column: Logo + All Text + Button */}
        <div className="flex flex-col justify-between w-[55%] h-full pr-2">
          {/* Top: Logo */}
          <div className="mb-2 md:mb-4">
            <div className="bg-white/90 backdrop-blur-xl p-2 rounded-xl sm:rounded-2xl w-fit max-w-[90px] sm:max-w-[100px] md:max-w-[180px] h-9 sm:h-10 md:h-13 flex items-center justify-center shadow-[0_8px_16px_-6px_rgba(0,0,0,0.2)] border border-white/50">
              <img
                src={store.logoUrl}
                alt={store.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="hidden text-[9px] sm:text-[10px] font-black uppercase text-black tracking-widest">{logoText}</span>
            </div>
          </div>

          {/* Bottom: Text & Button */}
          <div className="flex flex-col flex-1 justify-end">
            <p className="text-white/90 text-[13px] sm:text-base font-bold tracking-widest mb-1 sm:mb-3 truncate drop-shadow-sm">
              {currentDeal.title}
            </p>
            <h3 className="text-white font-bold leading-none mb-2 md:mb-5 tracking-tighter drop-shadow-lg">
              Upto {currentDeal.discount}% <span className="text-white/80">Off</span>
            </h3>

            <div className="flex items-center gap-2 mb-3 md:mb-7">
              <span className={`${tagClass} text-[13px] sm:text-xs md:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.1)]`}>
                Flat ₹{cashback} {cashbackType}
              </span>
            </div>

            <span
              className="btn group/btn bg-white/95 text-black font-black uppercase !text-[12px] !px-[10px] !py-[5px] sm:!text-[14px] sm:!px-6 sm:!py-3 md:!px-8 md:!py-3.5 rounded-full w-fit hover:bg-white hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              Grab Deal
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>

        {/* Right Column: Product Image */}
        <div className="w-[45%] h-full flex items-center justify-center my-auto group-hover:scale-[1.1] group-active:scale-[1.1] transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] pointer-events-none relative">
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-50 group-hover:scale-100 group-active:scale-100 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-700"></div>
          <img
            src={currentDeal.image}
            alt={currentDeal.title}
            className="m-auto object-center max-w-[100%] max-h-[100%] object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.6)] mix-blend-multiply relative z-10"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>
    </a>
  );
}
