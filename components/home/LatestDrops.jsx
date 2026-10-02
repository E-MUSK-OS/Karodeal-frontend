'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import DealGrid from '@/components/deals/DealGrid';


export default function LatestDrops() {
  const [topDeals, setTopDeals] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/products`);
        if (res.ok) {
          const allProducts = await res.json();
          setTopDeals(allProducts.slice(0, 6));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="mb-10 md:mb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-12 border-b border-black pb-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter">Latest Drops</h2>
        </div>
        
        <div className="mt-6 md:mt-0">
          <Link href="/deals" className="hidden md:block">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
      </div>
      
      {/* Use the StoreOfferCard */}
      <DealGrid deals={topDeals} cardType="storeOffer" mobileGrid={true} />
      
      <div className="mt-12 md:hidden text-center">
        <Link href="/deals">
          <Button variant="outline" fullWidth>View All Deals</Button>
        </Link>
      </div>
    </section>
  );
}
