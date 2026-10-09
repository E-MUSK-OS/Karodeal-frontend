'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';

export default function StoreOfferCard({ deal, product, store: propStore, fullWidth = false, isPreview = false }) {
  const router = useRouter();

  // Backwards compatibility if called with product instead of deal
  const currentDeal = deal || product;
  if (!currentDeal) return null;

  // Use deal.storeRel first, then propStore, then fallback
  const store = currentDeal.storeRel || propStore || { name: 'Unknown', logoUrl: '' };

  let bgClass = "bg-neutral-900";

  // Simple vibrant gradients
  const storeIdStr = store.slug || store.id || '';
  if (storeIdStr === 'amazon') {
    bgClass = "bg-gradient-to-br from-[#F58529] to-[#D54400]";
  } else if (storeIdStr === 'flipkart') {
    bgClass = "bg-gradient-to-br from-[#3E8DFF] to-[#0151C8]";
  } else if (storeIdStr === 'myntra') {
    bgClass = "bg-gradient-to-br from-[#F04D9E] to-[#C90059]";
  } else if (storeIdStr === 'ajio') {
    bgClass = "bg-gradient-to-br from-[#4b5563] to-[#1f2937]";
  } else if (storeIdStr === 'meesho') {
    bgClass = "bg-gradient-to-br from-[#db2777] to-[#831843]";
  }

  const logoText = store.logoText || store.name;

  const getCashback = (p) => {
    if (p.cashback !== undefined && p.cashback !== '') return Number(p.cashback);
    const charCode = p.id ? p.id.charCodeAt(p.id.length - 1) : 0;
    return (charCode % 5) + 2 + (charCode % 2 === 0 ? 0.5 : 0);
  };

  const cashback = getCashback(currentDeal);
  const cashbackType = storeIdStr === 'flipkart' ? 'Cashback' : 'Rewards';

  const widthClass = fullWidth ? "w-full" : "w-[280px] sm:w-[340px] md:w-[420px] lg:w-[460px]";
  const heightClass = "h-full";
  const minHeightClass = fullWidth 
    ? "min-h-[210px] sm:min-h-[240px] md:min-h-[260px] lg:min-h-[280px]" 
    : "min-h-[180px] sm:min-h-[210px] md:min-h-[260px] lg:min-h-[280px]";

  const generateSlug = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           
      .replace(/[^\w\-]+/g, '')       
      .replace(/\-\-+/g, '-')         
      .replace(/^-+/, '')             
      .replace(/-+$/, '');            
  };

  const offerPageUrl = `/deals/${generateSlug(currentDeal.title)}-${currentDeal.id}`;

  const Wrapper = isPreview ? 'div' : Link;
  const wrapperProps = isPreview ? {} : { href: offerPageUrl };

  // IF IT'S A CUSTOM IMAGE CARD
  if (currentDeal.originalPrice === 0 && currentDeal.salePrice === 0) {
    return (
      <Wrapper
        {...wrapperProps}
        className={`block relative flex flex-col justify-center items-center ${widthClass} ${heightClass} ${minHeightClass} rounded-2xl md:rounded-[24px] overflow-hidden shrink-0 bg-neutral-100 p-0 group shadow-lg hover:shadow-xl/20 active:shadow-xl/20 hover:-translate-y-2 active:-translate-y-2 transition-all duration-500 ease-out ${isPreview ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <img src={currentDeal.image} alt={currentDeal.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />

        {/* Store Logo Overlay */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none">
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 flex items-center justify-center shadow-md shrink-0 p-1 md:p-2">
            <img
              src={store.logoUrl || null}
              alt={store.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="hidden text-[8px] font-black uppercase text-black tracking-widest text-center leading-none">{logoText}</span>
          </div>
        </div>

        {/* Grab Deal Button Overlay */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 pointer-events-none">
          <Button as="span" variant="outline" size="none" className="pointer-events-auto border-none text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-10 px-2 sm:px-3 md:px-4 bg-white text-black shadow-lg">
            Offer Details
          </Button>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      {...wrapperProps}
      className={`block relative flex flex-row justify-between items-stretch ${widthClass} ${heightClass} rounded-[20px] md:rounded-[24px] lg:rounded-[32px] overflow-hidden shrink-0 ${bgClass} p-3 sm:p-4 md:p-5 group shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out ${isPreview ? 'cursor-default' : 'cursor-pointer'}`}
    >
      {/* Left Column: Logo + All Text + Button */}
      <div className="flex flex-col w-[55%] h-full z-10 pr-1 md:pr-2">
        {/* Top: Logo */}
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 flex items-center justify-center shadow-sm shrink-0 p-1 md:p-2">
          <img
            src={store.logoUrl || null}
            alt={store.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span className="hidden text-[8px] font-black uppercase text-black tracking-widest text-center leading-none">{logoText}</span>
        </div>

        {/* Text Area & Button */}
        <div className="flex flex-col my-auto overflow-hidden">
          <p className="text-white/90 text-[12px] md:text-sm font-bold tracking-wide line-clamp-2 sm:line-clamp-1 mb-1.5 sm:mb-2 md:mb-3 leading-tight mt-4 md:mt-6">
            {currentDeal.title}
          </p>
          <h3 className="text-white font-black leading-tight mb-2 sm:mb-3 md:mb-4 lg:mb-5 tracking-tighter shrink-0">
            Upto {currentDeal.discount}% Off
          </h3>

          <span className="bg-[rgba(255,255,255,0.7)] text-black font-bold rounded-md flex items-center justify-center w-fit mb-3 sm:mb-4 md:mb-5 lg:mb-6 px-1.5 sm:px-2 shrink-0 gap-1 sm:gap-1.5">
            <img src="/images/favicon.png" alt="logo" className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 object-contain rounded" />
            <span className="text-[12px] md:text-xs lg:text-sm whitespace-nowrap">Flat ₹{cashback} {cashbackType}</span>
          </span>

          {/* Button */}
          <div className="shrink-0">
            <Button as="span" variant="outline" size="none" className="pointer-events-none border-none !text-[12px] md:!text-sm h-7 sm:h-8 md:h-10 px-2 sm:px-3 md:px-4">
              Offer Details
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column: Product Image */}
      <div className={`w-[45%] flex items-stretch z-10 relative ${fullWidth ? 'aspect-[4/5] sm:aspect-[4/5] md:aspect-[3/4]' : 'aspect-[4/5] sm:aspect-[1/1] md:aspect-[4/5]'}`}>
        <div className="w-full absolute inset-0 flex items-center justify-center">
          <img
            src={currentDeal.image}
            alt={currentDeal.title}
            className="w-full h-full object-cover rounded-lg sm:rounded-xl md:rounded-2xl"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>
    </Wrapper>
  );
}
