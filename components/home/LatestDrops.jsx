'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import DealGrid from '@/components/deals/DealGrid';
import { getSocket } from '@/lib/socket';
import { getSessionSeed } from '@/lib/sessionSeed';

export default function LatestDrops() {
  const [topDeals, setTopDeals] = useState([]);

  const fetchProducts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
      const seed = getSessionSeed();
      const res = await fetch(`${apiUrl}/products?seed=${seed}&_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const allProducts = await res.json();
        const now = new Date();
        const activeDeals = allProducts.filter(p => p.isActive !== false && (!p.expiresAt || new Date(p.expiresAt) > now));
        setTopDeals(activeDeals.slice(0, 9));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();

    const socket = getSocket();
    if (socket) {
      socket.on('products:changed', fetchProducts);
    }

    const handleWindowChange = () => fetchProducts();
    window.addEventListener('karodeal:products_changed', handleWindowChange);

    return () => {
      if (socket) socket.off('products:changed', fetchProducts);
      window.removeEventListener('karodeal:products_changed', handleWindowChange);
    };
  }, []);

  return (
    <section className="mb-10 md:mb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-12 border-b border-black pb-4">
        <div>
          <h2 className="font-black text-black uppercase tracking-tighter">Latest Drops</h2>
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
