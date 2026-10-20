'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { Search as SearchIcon, X, AlertCircle } from 'lucide-react';
import DealGrid from '@/components/deals/DealGrid';
import { useSearchParams, useRouter } from 'next/navigation';
import { createSearchIndex, performSearch } from '@/lib/searchEngine';
import Button from '@/components/common/Button';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(urlQuery);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch active deals on mount
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
        const res = await fetch(`${apiUrl}/products`);
        if (res.ok) {
          const data = await res.json();
          const now = new Date();
          const active = data.filter(p => p.isActive !== false && (!p.expiresAt || new Date(p.expiresAt) > now));
          if (isMounted) setProducts(active);
        }
      } catch (err) {
        console.error('Search fetch error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  // 2. Keep local query input in sync with URL ?q= query param
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  // 3. MiniSearch full-text engine index
  const searchIndex = useMemo(() => {
    return createSearchIndex(products);
  }, [products]);

  // 4. Combined search execution using MiniSearch with store intent
  const executeSearch = useCallback((searchTerm) => {
    const trimmed = searchTerm?.trim();
    if (!trimmed || !searchIndex) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const finalResults = performSearch(searchIndex, trimmed);
    setResults(finalResults);
    setHasSearched(true);
  }, [searchIndex]);

  // 5. Run search whenever URL query or search index changes
  useEffect(() => {
    if (urlQuery.trim()) {
      executeSearch(urlQuery);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [urlQuery, executeSearch]);

  // 6. Handle search submission from the input field
  const handleSearch = (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/search');
    }
  };

  const handleClear = () => {
    setQuery('');
    router.push('/search');
  };

  return (
    <div className="page-container py-8 md:py-12 mb-10">
      {/* Search Header and Input */}
      <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
        <h1 className="font-black text-black dark:text-white uppercase tracking-tight mb-6 text-3xl sm:text-4xl md:text-5xl">
          Search Deals
        </h1>

        <form onSubmit={handleSearch} className="relative w-full">
          <div className="relative flex items-center border-b-2 border-black dark:border-white focus-within:border-[#f96b02] dark:focus-within:border-[#f96b02] transition-colors pb-2">
            <input
              type="text"
              className="block w-full py-2 pl-0 pr-16 bg-transparent text-lg sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none transition-colors"
              placeholder="Search by product, brand, or store..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="absolute right-0 bottom-2 flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <Button
                variant="none"
                size="none"
                type="submit"
                className="p-1 text-black dark:text-white hover:text-[#f96b02] dark:hover:text-[#f96b02] transition-colors focus:outline-none"
                aria-label="Submit search"
              >
                <SearchIcon className="h-6 w-6" strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 text-center text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest text-sm">
          Loading deals...
        </div>
      )}

      {/* Search Results */}
      {!isLoading && hasSearched && (
        <section className="w-full animate-in fade-in duration-200">
          <div className="flex justify-between items-end mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div>
              <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-1">
                Search Results
              </span>
              <h2 className="font-black text-black dark:text-white uppercase tracking-tight text-xl sm:text-2xl">
                &ldquo;{urlQuery}&rdquo;
              </h2>
            </div>
            <span className="text-neutral-500 dark:text-neutral-300 text-xs font-bold uppercase tracking-widest px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full">
              {results.length} {results.length === 1 ? 'deal found' : 'deals found'}
            </span>
          </div>

          {results.length > 0 ? (
            <DealGrid deals={results} cardType="storeOffer" mobileGrid={true} />
          ) : (
            <div className="py-16 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50 dark:bg-neutral-900 p-8 max-w-lg mx-auto">
              <AlertCircle className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-white mb-2">
                No Deals Found
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                We couldn&apos;t find any active deals matching &ldquo;{urlQuery}&rdquo;. Try checking for typos or searching a broader term like &ldquo;Amazon&rdquo; or &ldquo;Trousers&rdquo;.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Default State: When user hasn't searched anything yet */}
      {!isLoading && !hasSearched && (
        <div className="py-12 text-center text-neutral-400 dark:text-neutral-500 text-sm">
          <p>Type a keyword above to discover verified cashback deals.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold tracking-widest uppercase text-neutral-400">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
