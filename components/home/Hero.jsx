'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Sparkles, ShieldCheck, Coins, Tag, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Fallback for browsers that enforce user interaction before play
      });
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/deals');
    }
  };

  const popularSearches = [
    { label: 'Amazon Deals', query: 'Amazon' },
    { label: 'Flipkart 70% Off', query: 'Flipkart' },
    { label: 'Myntra Fashion', query: 'Myntra' },
    { label: 'Cashback Offers', query: 'Cashback' }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-neutral-50/70 via-white to-white border-b border-neutral-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 lg:p-12 mb-8 sm:mb-12 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-orange-100/40 via-amber-50/20 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-50/30 via-transparent to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
        
        {/* Left Column: Heading, Search & Actions */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col z-10">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-2xs text-neutral-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-5 w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Karo Deal (KaroDeal) Official Platform</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="font-black text-black uppercase tracking-tighter mb-3 sm:mb-5 leading-[1.05] sm:leading-[1.0] md:leading-[0.96]">
            The Best Deals. <br />
            <span className="text-neutral-400">Zero Clutter.</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="text-sm sm:text-[15px] lg:text-base text-neutral-600 mb-6 sm:mb-8 font-medium leading-relaxed max-w-xl">
            Welcome to Karo Deal (KaroDeal) A highly curated selection of verified discounts, daily loot drops, and guaranteed cashback across Amazon, Flipkart, Myntra, and top Indian platforms. Engineered for smart shoppers who value massive savings.
          </p>

          {/* Action Bar: Interactive Search Pill (inspired by etail design) */}
          <form onSubmit={handleSearchSubmit} className="mb-6 max-w-xl">
            <div className="flex items-center bg-white border-2 border-neutral-200 hover:border-black focus-within:border-black rounded-full p-1.5 sm:p-2 shadow-xs transition-all duration-200">
              <div className="flex items-center gap-2 pl-3 sm:pl-4 text-neutral-400">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-neutral-400" />
                <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-r border-neutral-200 pr-3">
                  Find
                </span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals, coupons or paste product link..."
                className="w-full bg-transparent px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-black placeholder:text-neutral-400 focus:outline-none font-medium"
              />
              <button
                type="submit"
                aria-label="Search deals"
                className="shrink-0 flex items-center justify-center gap-1.5 bg-black hover:bg-neutral-800 text-white rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-transform active:scale-95 shadow-sm cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mt-3 px-1 text-xs text-neutral-500 font-medium">
              <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3 h-3 text-[#f96b02]" /> Popular:
              </span>
              {popularSearches.map((item) => (
                <Link
                  key={item.label}
                  href={`/search?q=${encodeURIComponent(item.query)}`}
                  className="px-2.5 py-1 rounded-full bg-neutral-100/90 hover:bg-neutral-200 text-neutral-700 text-[11px] font-semibold transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </form>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-8">
            <Link href="/deals" className="w-full sm:w-auto">
              <Button size="md" fullWidth className="gap-2 px-6">
                Explore Deals
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/stores" className="w-full sm:w-auto">
              <Button variant="outline" size="md" fullWidth className="px-6">
                View Platforms
              </Button>
            </Link>
          </div>

          {/* Trust Highlights / Social Proof */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-5 border-t border-neutral-200/80 max-w-xl">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs font-bold text-black leading-tight">100% Verified</div>
                <div className="text-[9px] sm:text-[10px] text-neutral-500 font-medium hidden xs:block">Tested deals</div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs font-bold text-black leading-tight">Real Cashback</div>
                <div className="text-[9px] sm:text-[10px] text-neutral-500 font-medium hidden xs:block">UPI direct</div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs font-bold text-black leading-tight">100+ Deals</div>
                <div className="text-[9px] sm:text-[10px] text-neutral-500 font-medium hidden xs:block">Top brands</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: 3D KaroDeal Store (Transparent Background, No Grey Box) */}
        <div className="lg:col-span-6 xl:col-span-6 relative flex flex-col items-center justify-center pt-4 lg:pt-0">
          <div className="relative w-full max-w-[620px] sm:max-w-[700px] lg:max-w-[800px] xl:max-w-[880px]">
            
            {/* Soft Ambient Radial Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-200/40 via-orange-100/30 to-emerald-100/30 rounded-full blur-3xl -z-10 transform scale-105 pointer-events-none" />

            {/* 3D KaroDeal Store Animation Video (Enlarged, Autoplay, Loop, Transparent Alpha) */}
            <div className="relative w-full flex items-center justify-center py-1 sm:py-2 transform scale-100 sm:scale-105 lg:scale-110">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                className="w-full h-auto object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.10)] select-none pointer-events-none hover:scale-[1.02] transition-transform duration-500 ease-out"
              >
                <source src="/video/hero.webm" type="video/webm" />
                <source src="/video/hero.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Floating Live Badge 1: Top Right - Cashback Credited */}
            <div className="absolute -top-3 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 shadow-xl border border-neutral-200/80 animate-float-slow hidden xs:flex items-center gap-2.5 sm:gap-3 z-20">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Cashback Credited
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-black">
                  ₹500.00 <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500">via UPI</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
