'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import { createSearchIndex, performSearch } from '@/lib/searchEngine';

export default function HeaderSearch({ autoFocus = false, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [hasLoadedProducts, setHasLoadedProducts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Lazy-load products on first focus or when opened
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
      console.error('Failed to load products for header search:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key and add global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        loadProducts();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // MiniSearch index
  const searchIndex = useMemo(() => {
    return createSearchIndex(products);
  }, [products]);

  // Filter products in real time with MiniSearch & Store intent detection
  const searchResults = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed || !searchIndex) return [];
    return performSearch(searchIndex, trimmed).slice(0, 5); // Show top 5 deals in live dropdown
  }, [query, searchIndex]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setIsOpen(false);
      inputRef.current?.blur();
      if (onClose) onClose();
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center group">
          <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#f96b02] transition-colors">
            <Search className="h-4.5 w-4.5" strokeWidth={2.2} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            autoFocus={autoFocus}
            onFocus={() => {
              loadProducts();
              if (query.trim()) setIsOpen(true);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim()) setIsOpen(true);
              else setIsOpen(false);
            }}
            placeholder="Search deals, stores, products..."
            className="w-full pl-11 pr-12 py-2.5 lg:py-2.5 bg-neutral-100/70 hover:bg-neutral-100/90 focus:bg-white dark:bg-neutral-900/80 dark:hover:bg-neutral-900 dark:focus:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-400 rounded-full text-xs sm:text-[13px] lg:text-[14px] font-medium text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none transition-all duration-200 shadow-2xs focus:shadow-md focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5"
          />

          {/* Right Action: Clear Button OR Shortcut Badge */}
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-black dark:hover:text-white transition-colors focus:outline-none cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="absolute inset-y-0 right-3 hidden lg:flex items-center pointer-events-none">
              <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-2xs">
                ⌘K
              </kbd>
            </div>
          )}
        </div>
      </form>

      {/* Modern Live Dropdown (Only appears when user types a query) */}
      {isOpen && query.trim().length > 0 && (
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
          {searchResults.length > 0 ? (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-80 overflow-y-auto">
              {searchResults.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.slug}`}
                  onClick={() => {
                    setIsOpen(false);
                    if (onClose) onClose();
                  }}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <h5 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-black dark:group-hover:text-white">
                      {deal.title}
                    </h5>
                    {deal.storeRel?.name && (
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mt-0.5">
                        {deal.storeRel.name}
                      </span>
                    )}
                  </div>

                  <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
              <p className="font-semibold text-neutral-700 dark:text-neutral-200 mb-1">No instant deals found for &ldquo;{query}&rdquo;</p>
              <p className="text-neutral-400 dark:text-neutral-500">Press Enter or click below to search across all products and categories.</p>
            </div>
          )}

          {/* View All Search Results Footer */}
          <div className="p-2.5 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>View All Results for &ldquo;{query}&rdquo;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
