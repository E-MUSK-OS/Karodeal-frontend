'use client';

import Link from 'next/link';
import StoreOfferCard from '../deals/StoreOfferCard';
import Slider from '@/components/common/Slider';
import Button from '@/components/common/Button';

export default function StoreDealsSection({ store, deals }) {
  if (!deals || deals.length === 0) return null;

  // Determine section title based on store
  let title = `Top Deals on ${store.name}`;
  if (store.id === 'amazon') {
    title = 'Best at Amazon';
  } else if (store.id === 'flipkart') {
    title = 'FLIPKART - FREEDOM SALE';
  }

  return (
    <section className="mb-2 md:mb-12">
      <div className="flex justify-between items-end mb-2 md:mb-6">
        <h2 className="font-black text-black dark:text-white uppercase tracking-tight">
          {title}
        </h2>
        <Button href={`/stores/${store.id}`} variant="outline">
          View All
          <span className="group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true">&rarr;</span>
        </Button>
      </div>

      <Slider
        breakpoints={{
          0: { spaceBetween: 8 },
          768: { spaceBetween: 12 },
        }}
      >
        {deals.slice(0, 8).map(deal => (
          <div key={deal.id} className="shrink-0 snap-start h-full flex">
            <StoreOfferCard product={deal} store={store} />
          </div>
        ))}
      </Slider>
    </section>
  );
}
