'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StoreOfferCard({ deal, product, store: propStore, fullWidth = false }) {
  const router = useRouter();

  // Backwards compatibility if called with product instead of deal
  const currentDeal = deal || product;
  if (!currentDeal) return null;

  // Use deal.storeRel first, then propStore, then fallback
  const store = currentDeal.storeRel || propStore || { name: 'Unknown', logoUrl: '' };

  let bgClass = "bg-neutral-900";
  let tagClass = "bg-blue-500";

  // Simple vibrant gradients
  const storeIdStr = store.slug || store.id || '';
  if (storeIdStr === 'amazon') {
    bgClass = "bg-gradient-to-br from-[#F58529] to-[#D54400]";
    tagClass = "bg-black/15 text-white";
  } else if (storeIdStr === 'flipkart') {
    bgClass = "bg-gradient-to-br from-[#3E8DFF] to-[#0151C8]";
    tagClass = "bg-black/15 text-white";
  } else if (storeIdStr === 'myntra') {
    bgClass = "bg-gradient-to-br from-[#F04D9E] to-[#C90059]";
    tagClass = "bg-black/15 text-white";
  } else if (storeIdStr === 'ajio') {
    bgClass = "bg-gradient-to-br from-[#4b5563] to-[#1f2937]";
    tagClass = "bg-black/20 text-white";
  } else if (storeIdStr === 'meesho') {
    bgClass = "bg-gradient-to-br from-[#db2777] to-[#831843]";
    tagClass = "bg-black/15 text-white";
  }

  const logoText = store.logoText || store.name;

  const getCashback = (p) => {
    if (p.cashback !== undefined && p.cashback !== '') return Number(p.cashback);
    const charCode = p.id ? p.id.charCodeAt(p.id.length - 1) : 0;
    return (charCode % 5) + 2 + (charCode % 2 === 0 ? 0.5 : 0);
  };

  const cashback = getCashback(currentDeal);
  const cashbackType = storeIdStr === 'flipkart' ? 'Cashback' : 'Rewards';

  const widthClass = fullWidth ? "w-full" : "w-[260px] sm:w-[300px] md:w-[360px]";
  const heightClass = "h-[140px] sm:h-[160px] md:h-[200px]";

  const offerPageUrl = `/offer/${currentDeal.id}`;

  // IF IT'S A CUSTOM IMAGE CARD
  if (currentDeal.salePrice === 0 && currentDeal.discount === 0) {
    return (
      <Link
        href={offerPageUrl}
        className={`block relative flex flex-col justify-center items-center ${widthClass} ${heightClass} rounded-2xl md:rounded-[24px] overflow-hidden shrink-0 bg-neutral-100 p-0 group shadow-lg hover:shadow-xl/20 active:shadow-xl/20 hover:-translate-y-2 active:-translate-y-2 transition-all duration-500 ease-out cursor-pointer`}
      >
        <img src={currentDeal.image} alt={currentDeal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.target.style.display = 'none'; }} />
        
        {/* Grab Deal Button Overlay */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20">
          <span
            className="bg-white text-black font-black uppercase text-[9px] sm:text-[10px] md:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full inline-flex items-center justify-center hover:bg-neutral-100 transition-colors duration-200 shadow-sm"
          >
            Offer Details
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={offerPageUrl}
      className={`block relative flex flex-row justify-between items-stretch ${widthClass} ${heightClass} rounded-[20px] md:rounded-[24px] overflow-hidden shrink-0 ${bgClass} p-3 sm:p-4 group shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer`}
    >
      {/* Left Column: Logo + All Text + Button */}
      <div className="flex flex-col justify-between w-[55%] h-full z-10 pr-2">
        {/* Top: Logo */}
        <div className="bg-white rounded-lg sm:rounded-xl w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-sm shrink-0 p-1">
          <img
            src={store.logoUrl}
            alt={store.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span className="hidden text-[8px] font-black uppercase text-black tracking-widest text-center leading-none">{logoText}</span>
        </div>

        {/* Text Area */}
        <div className="flex flex-col flex-1 justify-center mt-1 sm:mt-2">
          <p className="text-white/90 text-[10px] sm:text-[11px] font-bold tracking-wide line-clamp-1 mb-0.5">
            {currentDeal.title}
          </p>
          <h3 className="text-white text-lg sm:text-xl md:text-2xl font-black leading-tight mb-1 sm:mb-2 tracking-tighter">
            Upto {currentDeal.discount}% Off
          </h3>

          <span className={`${tagClass} text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-md flex items-center justify-center w-fit`}>
            Flat ₹{cashback} {cashbackType}
          </span>
        </div>

        {/* Button */}
        <div className="mt-auto pt-1">
          <span className="bg-white text-black font-black uppercase text-[9px] sm:text-[10px] md:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full inline-flex items-center justify-center hover:bg-neutral-100 transition-colors duration-200 shadow-sm">
            Offer Details
          </span>
        </div>
      </div>

      {/* Right Column: Product Image */}
      <div className="w-[45%] h-full flex items-center justify-end z-10 py-2 pr-1">
        <div className="w-full h-full bg-white overflow-hidden shadow-sm rounded-md sm:rounded-lg">
          <img
            src={currentDeal.image}
            alt={currentDeal.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>
    </Link>
  );
}
