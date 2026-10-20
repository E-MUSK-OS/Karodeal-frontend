'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Sparkles, ShieldCheck, Coins, Tag, CheckCircle2, X } from 'lucide-react';
import Button from '../common/Button';
import { createSearchIndex, performSearch } from '@/lib/searchEngine';

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [hasLoadedProducts, setHasLoadedProducts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const videoRef = useRef(null);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Lazy-load active products when search input is focused or typed into
  const loadProducts = async () => {
    if (hasLoadedProducts) return;
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
      const res = await fetch(`${apiUrl}/products`);
      if (res.ok) {
        const data = await res.json();
        const now = new Date();
        setProducts(data.filter(p => p.isActive !== false && (!p.expiresAt || new Date(p.expiresAt) > now)));
      }
      setHasLoadedProducts(true);
    } catch (err) {
      console.error('Failed to load products for hero search:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize MiniSearch indexing
  const searchIndex = useMemo(() => {
    return createSearchIndex(products);
  }, [products]);

  // Real-time fuzzy / store-intent search results
  const searchResults = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || !searchIndex) return [];
    return performSearch(searchIndex, trimmed).slice(0, 5);
  }, [searchQuery, searchIndex]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Fallback for browsers that enforce user interaction before play
      });
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const query = searchQuery.trim();
    setIsOpen(false);
    inputRef.current?.blur();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/deals');
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const popularSearches = [
    { label: 'Amazon Deals', query: 'Amazon' },
    { label: 'Flipkart 70% Off', query: 'Flipkart' },
    { label: 'Myntra Fashion', query: 'Myntra' },
    { label: 'Cashback Offers', query: 'Cashback' }
  ];

  return (
    <section className="relative bg-gradient-to-b from-neutral-50/70 via-white to-white dark:from-neutral-900/90 dark:via-neutral-950 dark:to-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 lg:p-12 mb-8 sm:mb-12 shadow-[0_2px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Ambient background glow safely clipped to preserve rounded corners without clipping the search dropdown */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-orange-100/40 via-amber-50/20 to-transparent dark:from-orange-500/10 dark:via-amber-500/5 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-50/30 via-transparent to-transparent dark:from-emerald-500/10 dark:via-transparent dark:to-transparent rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
        
        {/* Left Column: Heading, Search & Actions */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col relative z-30">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xs text-neutral-800 dark:text-neutral-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-5 w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Karo Deal (KaroDeal) Official Platform</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="font-black text-black dark:text-white uppercase tracking-tighter mb-3 sm:mb-5 leading-[1.05] sm:leading-[1.0] md:leading-[0.96]">
            The Best Deals. <br />
            <span className="text-neutral-400 dark:text-neutral-500">Zero Clutter.</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="text-sm sm:text-[15px] lg:text-base text-neutral-600 dark:text-neutral-300 mb-6 sm:mb-8 font-medium leading-relaxed max-w-xl">
            Welcome to Karo Deal (KaroDeal) A highly curated selection of verified discounts, daily loot drops, and guaranteed cashback across Amazon, Flipkart, Myntra, and top Indian platforms. Engineered for smart shoppers who value massive savings.
          </p>

          {/* Action Bar: Interactive Search Pill with Real-time Live Dropdown */}
          <div className="mb-6 max-w-xl">
            <div ref={searchContainerRef} className="relative z-40">
              <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-600 focus-within:border-black dark:focus-within:border-neutral-400 rounded-full p-1.5 sm:p-2 shadow-xs transition-all duration-200">
                <div className="flex items-center gap-2 pl-3 sm:pl-4 text-neutral-400">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-neutral-400" />
                  <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-r border-neutral-200 dark:border-neutral-700 pr-3">
                    Find
                  </span>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onFocus={() => {
                    loadProducts();
                    if (searchQuery.trim()) setIsOpen(true);
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    loadProducts();
                    if (val.trim()) setIsOpen(true);
                    else setIsOpen(false);
                  }}
                  placeholder="Search deals, stores, products..."
                  className="w-full bg-transparent px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none font-medium"
                />

                {/* Clear button if text exists */}
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 mr-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors focus:outline-none cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}

                <button
                  type="submit"
                  aria-label="Search deals"
                  className="shrink-0 flex items-center justify-center gap-1.5 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-transform active:scale-95 shadow-sm cursor-pointer"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </form>

            {/* Live Dropdown (same as HeaderSearch) */}
            {isOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Results Header */}
                <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#f96b02]" />
                    <span>Matching Deals</span>
                  </div>
                  {searchResults.length > 0 && (
                    <span className="text-neutral-400 dark:text-neutral-500 font-normal lowercase">
                      {searchResults.length} {searchResults.length === 1 ? 'deal' : 'deals'} shown
                    </span>
                  )}
                </div>

                {/* Deals List */}
                {isLoading && products.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="inline-block animate-spin w-5 h-5 border-2 border-black dark:border-white border-t-transparent rounded-full mb-2"></div>
                    <p className="font-semibold text-neutral-700 dark:text-neutral-200">Searching deals...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-80 overflow-y-auto">
                    {searchResults.map((deal) => (
                      <Link
                        key={deal.id}
                        href={`/deals/${deal.slug}`}
                        onClick={() => {
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          {deal.image && (
                            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={deal.image}
                                alt={deal.title}
                                className="w-full h-full object-contain"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h5 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-black dark:group-hover:text-white">
                              {deal.title}
                            </h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              {deal.storeRel?.name && (
                                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                                  {deal.storeRel.name}
                                </span>
                              )}
                              {deal.salePrice && (
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                  ₹{deal.salePrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
                    <p className="font-semibold text-neutral-700 dark:text-neutral-200 mb-1">No instant deals found for &ldquo;{searchQuery}&rdquo;</p>
                    <p className="text-neutral-400 dark:text-neutral-500">Press Enter or click below to search across all products and categories.</p>
                  </div>
                )}

                {/* View All Search Results Footer */}
                <div className="p-2.5 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>View All Results for &ldquo;{searchQuery}&rdquo;</span>
                  </button>
                </div>
              </div>
            )}
            </div>

            {/* Quick Filter Tags */}
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mt-3 px-1 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              <span className="text-neutral-400 dark:text-neutral-500 flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3 h-3 text-[#f96b02]" /> Popular:
              </span>
              {popularSearches.map((item) => (
                <Link
                  key={item.label}
                  href={`/search?q=${encodeURIComponent(item.query)}`}
                  className="px-2.5 py-1 rounded-full bg-neutral-100/90 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

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
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-5 border-t border-neutral-200/80 dark:border-neutral-800 max-w-xl">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs font-bold text-black dark:text-white leading-tight">100% Verified</div>
                <div className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 font-medium hidden xs:block">Tested deals</div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs font-bold text-black dark:text-white leading-tight">Real Cashback</div>
                <div className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 font-medium hidden xs:block">UPI direct</div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs font-bold text-black dark:text-white leading-tight">100+ Deals</div>
                <div className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 font-medium hidden xs:block">Top brands</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: 3D KaroDeal Store (Transparent Background, No Grey Box) */}
        <div className="lg:col-span-6 xl:col-span-6 relative flex flex-col items-center justify-center pt-4 lg:pt-0">
          <div className="relative w-full max-w-[620px] sm:max-w-[700px] lg:max-w-[800px] xl:max-w-[880px]">
            
            {/* Soft Ambient Radial Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-200/40 via-orange-100/30 to-emerald-100/30 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-emerald-500/10 rounded-full blur-3xl -z-10 transform scale-105 pointer-events-none" />

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
            <div className="absolute -top-3 -right-2 sm:-right-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 shadow-xl border border-neutral-200/80 dark:border-neutral-800 animate-float-slow hidden xs:flex items-center gap-2.5 sm:gap-3 z-20">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Cashback Credited
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-black dark:text-white">
                  ₹500.00 <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500 dark:text-neutral-400">via UPI</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
