'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Share2, ArrowUpRight, Sparkles } from 'lucide-react';
import ShareDealModal from './ShareDealModal';

import { calculateCashback } from '@/lib/cashbackCalculator';
import { cleanProductTitle } from '@/lib/titleSanitizer';

export default function StoreOfferCard({ deal, product, store: propStore, fullWidth = false, isPreview = false, hideCashback = false }) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Backwards compatibility if called with product instead of deal
  const currentDeal = deal || product;
  if (!currentDeal) return null;

  // Use deal.storeRel first, then propStore, then fallback
  const store = currentDeal.storeRel || propStore || { name: 'Unknown', logoUrl: '' };

  let bgClass = "bg-gradient-to-br from-neutral-800 to-neutral-950";

  // Rich, premium store gradients with modern lighting & depth
  const storeIdStr = store.slug || store.id || '';
  if (storeIdStr === 'amazon') {
    bgClass = "bg-gradient-to-br from-[#FF7A00] via-[#F4511E] to-[#C93800]";
  } else if (storeIdStr === 'flipkart') {
    bgClass = "bg-gradient-to-br from-[#2874F0] via-[#1565C0] to-[#0D47A1]";
  } else if (storeIdStr === 'myntra') {
    bgClass = "bg-gradient-to-br from-[#FF3F6C] via-[#E91E63] to-[#AD1457]";
  } else if (storeIdStr === 'ajio') {
    bgClass = "bg-gradient-to-br from-[#374151] via-[#1F2937] to-[#111827]";
  } else if (storeIdStr === 'meesho') {
    bgClass = "bg-gradient-to-br from-[#E91E63] via-[#D81B60] to-[#880E4F]";
  } else if (storeIdStr === 'nykaa') {
    bgClass = "bg-gradient-to-br from-[#FC2779] via-[#E01563] to-[#99003D]";
  } else if (storeIdStr === 'tatacliq') {
    bgClass = "bg-gradient-to-br from-[#1E1E1E] via-[#2A2A2A] to-[#121212]";
  } else if (storeIdStr === 'croma') {
    bgClass = "bg-gradient-to-br from-[#00B5B8] via-[#008A8C] to-[#005D5E]";
  }

  const logoText = store.logoText || store.name;

  const getCashback = (p) => {
    if (p.cashbackWithReview !== undefined && p.cashbackWithReview !== null && p.cashbackWithReview !== '') {
      return Number(p.cashbackWithReview);
    }
    if (p.cashback !== undefined && p.cashback !== null && p.cashback !== '') {
      return Number(p.cashback);
    }
    if (p.salePrice) {
      return calculateCashback(p.salePrice).withReview;
    }
    const charCode = p.id ? p.id.charCodeAt(p.id.length - 1) : 0;
    return (charCode % 5) + 2 + (charCode % 2 === 0 ? 0.5 : 0);
  };

  const cashback = getCashback(currentDeal);
  const cashbackType = storeIdStr === 'flipkart' ? 'Cashback' : 'Rewards';

  const widthClass = fullWidth ? "w-full" : "w-[280px] sm:w-[340px] md:w-[420px] lg:w-[460px]";
  const heightClass = "h-full";
  const minHeightClass = fullWidth 
    ? "min-h-[240px] sm:min-h-[270px] md:min-h-[300px] lg:min-h-[325px]" 
    : "min-h-[230px] sm:min-h-[260px] md:min-h-[295px] lg:min-h-[325px]";

  const generateSlug = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           
      .replace(/[^\w\-]+/g, '')       
      .replace(/\-\-+/g, '-')         
      .replace(/^-+/, '')             
      .replace(/-+$/, '');            
  };

  const offerPageUrl = `/deals/${generateSlug(currentDeal.title)}-${currentDeal.id}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://karodeal.in';
  const fullShareUrl = `${siteUrl}${offerPageUrl}`;

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareOpen(true);
  };

  // IF IT'S A CUSTOM IMAGE CARD
  if (Number(currentDeal.originalPrice) === 0) {
    return (
      <>
        <div
          className={`block relative flex flex-col justify-center items-center ${widthClass} ${heightClass} ${minHeightClass} rounded-2xl md:rounded-[28px] overflow-hidden shrink-0 bg-neutral-100 p-0 group shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ease-out border border-neutral-200`}
        >
          {/* Stretched Link for Card Navigation */}
          {!isPreview && (
            <Link
              href={offerPageUrl}
              prefetch={true}
              className="absolute inset-0 z-0 cursor-pointer"
              aria-label={cleanProductTitle(currentDeal.title)}
            />
          )}

          <img 
            src={currentDeal.image} 
            alt={cleanProductTitle(currentDeal.title)} 
            className="w-full h-full object-cover pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105" 
            onError={(e) => { e.target.style.display = 'none'; }} 
          />

          {/* Store Logo & Share Overlay */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 pointer-events-none">
            <div className="bg-white rounded-xl sm:rounded-2xl w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center shadow-md shrink-0 p-1.5 border border-white/80 pointer-events-auto group-hover:scale-102 transition-transform">
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

            {!isPreview && (
              <button
                type="button"
                onClick={handleShareClick}
                title="Share deal"
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl sm:rounded-2xl bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md flex items-center justify-center transition-all duration-200 border border-white/20 shadow-md active:scale-95 cursor-pointer group/share pointer-events-auto"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover/share:scale-110" />
              </button>
            )}
          </div>

          {/* Grab Deal Button Overlay */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-neutral-950 font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-lg group-hover:scale-102 transition-all">
              <span>Offer Details</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-neutral-800" />
            </span>
          </div>
        </div>

        {/* Share Modal */}
        <ShareDealModal
          deal={currentDeal}
          store={store}
          shareUrl={fullShareUrl}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={`block relative flex flex-row justify-between items-stretch ${widthClass} ${heightClass} ${minHeightClass} rounded-[22px] sm:rounded-[26px] md:rounded-[30px] overflow-hidden shrink-0 ${bgClass} p-3.5 sm:p-4 md:p-5 group shadow-md hover:shadow-2xl hover:shadow-black/25 hover:-translate-y-1.5 transition-all duration-300 ease-out border border-white/20 hover:border-white/40`}
      >
        {/* Subtle Ambient Specular & Lighting Glows */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-white/20 rounded-full blur-2xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-60" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-black/30 rounded-full blur-2xl pointer-events-none" />

        {/* Stretched Link for Card Navigation */}
        {!isPreview && (
          <Link
            href={offerPageUrl}
            prefetch={true}
            className="absolute inset-0 z-0 cursor-pointer"
            aria-label={cleanProductTitle(currentDeal.title)}
          />
        )}

        {/* Left Column: Logo + Share + All Text + Button */}
        <div className="flex flex-col justify-between w-[54%] h-full z-10 pr-1 sm:pr-2 pointer-events-none">
          {/* Top: Logo + Share Button + Verified Pill */}
          <div className="flex items-center justify-between gap-1.5 shrink-0 pointer-events-auto">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="bg-white rounded-xl sm:rounded-2xl w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center shadow-md shadow-black/10 shrink-0 p-1.5 border border-white/80 group-hover:scale-102 transition-transform">
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

              {!isPreview && (
                <button
                  type="button"
                  onClick={handleShareClick}
                  title="Share deal"
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl sm:rounded-2xl bg-black/15 hover:bg-white text-white hover:text-neutral-900 backdrop-blur-md flex items-center justify-center transition-all duration-200 border border-white/25 shadow-sm active:scale-95 cursor-pointer group/share relative z-20"
                >
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover/share:scale-110" />
                </button>
              )}
            </div>

            {/* Micro Verified Tag */}
            <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[9px] font-bold uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Verified</span>
            </div>
          </div>

          {/* Middle: Title & Punchy Discount */}
          <div className="my-auto py-2 overflow-hidden">
            <p className="text-white/85 text-[11px] sm:text-xs md:text-[13px] font-semibold line-clamp-2 leading-snug tracking-tight mb-1 sm:mb-1.5 drop-shadow-xs">
              {cleanProductTitle(currentDeal.title)}
            </p>

            <div className="shrink-0 mb-1.5 sm:mb-2">
              <div className="text-[19px] sm:text-2xl md:text-[28px] font-black text-white tracking-tight leading-none drop-shadow-sm flex items-baseline gap-1">
                <span>Upto {currentDeal.discount}%</span>
                <span className="text-[11px] sm:text-xs md:text-sm font-extrabold uppercase text-white/90">Off</span>
              </div>
            </div>

            {!hideCashback && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-xs border border-white/80 text-neutral-900 shrink-0 w-fit group-hover:bg-white transition-all">
                <img src="/images/favicon.png" alt="logo" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain rounded shrink-0" />
                <span className="text-[10px] sm:text-[11px] md:text-xs whitespace-nowrap tracking-tight font-black text-neutral-900">
                  Upto ₹{cashback} <span className="font-extrabold text-neutral-600">{cashbackType}</span>
                </span>
              </div>
            )}
          </div>

          {/* Bottom: Modern Pill CTA */}
          <div className="shrink-0 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-neutral-950 font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md group-hover:shadow-lg group-hover:scale-102 transition-all duration-200">
              <span>Offer Details</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-neutral-800 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>

        {/* Right Column: Product Image with Sleek Showcase Housing */}
        <div className={`w-[46%] flex items-stretch z-10 relative pointer-events-none ml-2 sm:ml-3 ${fullWidth ? 'aspect-[4/5] sm:aspect-[4/5] md:aspect-[3/4]' : 'aspect-[4/5] sm:aspect-[1/1] md:aspect-[4/5]'}`}>
          <div className="w-full absolute inset-0 flex items-center justify-center bg-white rounded-xl sm:rounded-2xl md:rounded-[22px] overflow-hidden shadow-lg border border-white/70 p-1.5 sm:p-2">
            <img
              src={currentDeal.image}
              alt={cleanProductTitle(currentDeal.title)}
              className="w-full h-full object-contain sm:object-cover rounded-lg sm:rounded-xl transition-transform duration-500 ease-out group-hover:scale-106"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareDealModal
        deal={currentDeal}
        store={store}
        shareUrl={fullShareUrl}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
}

