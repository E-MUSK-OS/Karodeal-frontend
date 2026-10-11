'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import DealGrid from '@/components/deals/DealGrid';
import { useSearchParams, useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import Button from '@/components/common/Button';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(urlQuery);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
        const res = await fetch(`${apiUrl}/products`);
        if (res.ok) {
          const data = await res.json();
          const now = new Date();
          setProducts(data.filter(p => p.isActive !== false && (!p.expiresAt || new Date(p.expiresAt) > now)));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const fuse = useMemo(() => new Fuse(products, {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'categoryRel.name', weight: 0.3 },
      { name: 'storeRel.name', weight: 0.2 }
    ],
    threshold: 0.2,
    ignoreLocation: true,
    minMatchCharLength: 3,
    includeScore: true
  }), [products]);

  // Debounced real-time search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        const searchResults = fuse.search(query.trim()).map(result => result.item);
        setResults(searchResults);
        setHasSearched(true);

        // Update URL to match search state without refreshing
        const currentUrlQuery = searchParams.get('q') || '';
        if (query.trim() !== currentUrlQuery) {
          router.replace(`/search?q=${encodeURIComponent(query.trim())}`, { scroll: false });
        }
      } else if (hasSearched) {
        setResults([]);
        setHasSearched(false);
        router.replace(`/search`, { scroll: false });
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [query, fuse, router, searchParams, hasSearched]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled automatically by the debounced useEffect above.
    // This is just to prevent form submission from reloading the page if they press Enter.
  };

  return (
    <div className="py-8 md:py-12 mb-10 px-4">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="font-black text-black uppercase tracking-tighter mb-8">Search</h1>

        <form onSubmit={handleSearch} className="relative w-full">
          <input
            type="text"
            className="block w-full py-4 pl-0 pr-12 md:pr-16 border-b-2 border-black bg-transparent text-lg md:text-2xl font-black uppercase tracking-tighter placeholder-neutral-300 focus:outline-none transition-colors"
            placeholder="TYPE TO SEARCH..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="none" size="none"
            type="submit"
            className="absolute right-0 bottom-4 text-black hover:text-[#f96b02] transition-colors focus:outline-none"
          >
            <SearchIcon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={3} />
          </Button>
        </form>
      </div>

      {hasSearched && (
        <section>
          <div className="flex justify-between items-end mb-8 border-b border-black pb-3">
            <h2 className="font-black text-black uppercase tracking-tighter">
              Results
            </h2>
            <span className="text-neutral-500 text-xs font-bold uppercase tracking-widest">{results.length} found</span>
          </div>

          <DealGrid deals={results} cardType="storeOffer" mobileGrid={true} />
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold tracking-widest uppercase">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
