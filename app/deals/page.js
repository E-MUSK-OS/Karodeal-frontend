'use client';
import { useState, useEffect } from 'react';

import DealGrid from '@/components/deals/DealGrid';
import Button from '@/components/common/Button';

export default function DealsPage() {
  const [allDeals, setAllDeals] = useState([]);
  const [filters, setFilters] = useState([{ id: 'all', label: 'All Deals' }]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        // Fetch products and stores in parallel
        const [productsRes, storesRes] = await Promise.all([
          fetch(`${apiUrl}/products`),
          fetch(`${apiUrl}/meta/stores`)
        ]);
        
        if (productsRes.ok) {
          setAllDeals(await productsRes.json());
        }
        
        if (storesRes.ok) {
          const storesData = await storesRes.json();
          const dynamicFilters = storesData.map(store => ({
            id: store.slug,
            label: store.name || store.slug
          }));
          setFilters([{ id: 'all', label: 'All Deals' }, ...dynamicFilters]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const filteredDeals = activeFilter === 'all'
    ? allDeals
    : allDeals.filter(deal => deal.storeRel?.slug === activeFilter);

  const visibleDeals = filteredDeals.slice(0, visibleCount);
  const hasMore = visibleCount < filteredDeals.length;

  const handleViewMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    setVisibleCount(6); // Reset visible count on filter change
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 md:py-20 mb-12 md:mb-20 max-w-[1920px] mx-auto">
      <div className="w-full text-center mb-10 sm:mb-16 border-b border-neutral-200 pb-10 sm:pb-14">
        <h2 className="text-black uppercase tracking-tighter mb-6 leading-none">All Deals</h2>
        <p className="text-sm lg:text-[15px] xl:text-base text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed">Explore best offers from top platforms</p>
      </div>

      <div className="flex justify-end mb-6 sm:mb-8">
        {/* Filter Dropdown */}
        <div className="relative w-full sm:w-auto sm:min-w-[160px] md:min-w-[180px] shrink-0">
          <select
            value={activeFilter}
            onChange={(e) => handleFilterClick(e.target.value)}
            className="w-full appearance-none bg-white hover:bg-neutral-50 border-2 border-neutral-200 text-black px-4 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-black cursor-pointer rounded-full shadow-sm hover:shadow-md transition-all duration-300"
          >
            {filters.map(filter => (
              <option key={filter.id} value={filter.id}>
                {filter.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black transition-transform group-hover:translate-y-1">
            <svg className="fill-current h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* cardType="storeOffer" renders the Amazon-style cards. mobileGrid={true} disables slider and uses grid */}
      <DealGrid deals={visibleDeals} cardType="storeOffer" mobileGrid={true} />

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <Button onClick={handleViewMore} size="md" variant="primary">
            View More
          </Button>
        </div>
      )}
    </div>
  );
}
