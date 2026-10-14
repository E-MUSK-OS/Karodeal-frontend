'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';

export default function RealtimeProductsListener() {
  const router = useRouter();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleProductsChange = (data) => {
      // 1. Re-render Next.js Server Components on the current page (Home, Store sections, etc.)
      router.refresh();

      // 2. Dispatch a window event for client components that maintain their own state
      window.dispatchEvent(new CustomEvent('karodeal:products_changed', { detail: data }));
    };

    socket.on('products:changed', handleProductsChange);

    return () => {
      socket.off('products:changed', handleProductsChange);
    };
  }, [router]);

  return null;
}
