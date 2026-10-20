'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/common/Button';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-neutral-50 dark:bg-neutral-950 font-sans">
      <div className="max-w-md w-full text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-[#f96b02] flex items-center justify-center mx-auto mb-6 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
          Unable to Load This Page
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
          We encountered a temporary connection issue while loading this offer. Please reload to try again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset ? reset() : window.location.reload()}
            className="w-full sm:w-auto px-6 py-3 bg-[#f96b02] hover:bg-[#e05f00] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto px-6 py-3 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
