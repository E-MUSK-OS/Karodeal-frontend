'use client';

import { useState, useMemo } from 'react';
import DealGrid from '@/components/deals/DealGrid';

export default function StoreDealFilter({ store, initialDeals }) {
  const [sortBy, setSortBy] = useState('latest');

  const sortedDeals = useMemo(() => {
    let deals = [...initialDeals];
    if (sortBy === 'name') {
      deals.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'category') {
      deals.sort((a, b) => a.category.localeCompare(b.category));
    } else {
      // 'latest' - assuming id is sequential, higher id = newer
      deals.sort((a, b) => b.id - a.id);
    }
    return deals;
  }, [initialDeals, sortBy]);

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0 mb-8 md:mb-12 border-b border-neutral-200 pb-4">
        <h2 className="text-black uppercase tracking-tighter w-full sm:w-auto shrink-0">
          Latest Drops from {store.name}
        </h2>
        
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest shrink-0">
            {initialDeals.length} deals
          </span>
          <select 
            className="border-2 border-black text-[10px] md:text-xs font-bold uppercase tracking-widest p-2 focus:outline-none cursor-pointer bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="name">By Name</option>
            <option value="category">By Category</option>
          </select>
        </div>
      </div>

      <DealGrid deals={sortedDeals} cardType="storeOffer" mobileGrid={true} />
    </section>
  );
}
