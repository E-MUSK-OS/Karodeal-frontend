'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';

export default function RealtimeProductsListener() {
  const router = useRouter();
  const lastSignatureRef = useRef(null);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    // 1. Dispatcher for triggering Next.js server component refreshes and client component state updates
    const handleProductsChange = (data) => {
      try {
        router.refresh();
      } catch (e) {
        // Safe router refresh catch
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('karodeal:products_changed', { detail: data }));
      }
    };

    // 2. WebSockets listener (works in local dev & persistent servers)
    const socket = getSocket();
    if (socket) {
      socket.on('products:changed', handleProductsChange);
    }

    // 3. Smart Background Polling (works on Vercel Serverless & all environments)
    const checkSyncState = async () => {
      if (typeof document !== 'undefined' && document.hidden) {
        return; // Don't burn network when user has tab minimized/in background
      }
      if (isCheckingRef.current) return;

      isCheckingRef.current = true;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
        
        // Try the ultra-fast lightweight sync-state endpoint first (~100 bytes)
        const res = await fetch(`${apiUrl}/products/sync-state?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          const data = await res.json();
          const currentSignature = data.signature;

          if (lastSignatureRef.current === null) {
            // First mount: store current state without triggering unnecessary re-renders
            lastSignatureRef.current = currentSignature;
          } else if (lastSignatureRef.current !== currentSignature) {
            // Changes detected! (Rank reordered, product added/updated/deleted)
            lastSignatureRef.current = currentSignature;
            handleProductsChange({ type: 'sync_state_change', data });
          }
        } else if (res.status === 404) {
          // Graceful fallback if backend /sync-state is still propagating on Vercel
          const fallbackRes = await fetch(`${apiUrl}/products?_t=${Date.now()}`, {
            cache: 'no-store'
          });
          if (fallbackRes.ok) {
            const products = await fallbackRes.json();
            const topProducts = products.slice(0, 15);
            const fallbackSig = `${products.length}:` + topProducts.map(p => `${p.id}-${p.sortOrder || 0}`).join(',');

            if (lastSignatureRef.current === null) {
              lastSignatureRef.current = fallbackSig;
            } else if (lastSignatureRef.current !== fallbackSig) {
              lastSignatureRef.current = fallbackSig;
              handleProductsChange({ type: 'fallback_change' });
            }
          }
        }
      } catch (err) {
        // Silently catch background network hiccups
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Initial check on mount
    checkSyncState();

    // Check every 6 seconds in background
    const intervalId = setInterval(checkSyncState, 6000);

    // Immediate check when user switches back to this tab / window focus
    const onVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        checkSyncState();
      }
    };

    window.addEventListener('focus', onVisibilityOrFocus);
    document.addEventListener('visibilitychange', onVisibilityOrFocus);

    return () => {
      if (socket) {
        socket.off('products:changed', handleProductsChange);
      }
      clearInterval(intervalId);
      window.removeEventListener('focus', onVisibilityOrFocus);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
    };
  }, [router]);

  return null;
}
