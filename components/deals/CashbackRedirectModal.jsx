'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ExternalLink, CheckCircle2, ShieldCheck, X, Sparkles, ArrowRight } from 'lucide-react';

export default function CashbackRedirectModal({
  isOpen,
  onClose,
  store,
  cashbackAmount,
  dealTitle,
  onOpenStore,
}) {
  const [progress, setProgress] = useState(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Animate progress to 100% and auto-close shortly after completion
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    const startTime = Date.now();
    const duration = 1100;
    let autoCloseTimer = null;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        // Automatically dismiss modal 700ms after reaching 100%
        autoCloseTimer = setTimeout(() => {
          if (onCloseRef.current) onCloseRef.current();
        }, 700);
      }
    }, 30);

    return () => {
      clearInterval(interval);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
    };
  }, [isOpen]);

  // Auto-close modal when user switches to the external app and comes back to the website
  useEffect(() => {
    if (!isOpen) return;

    let hasLeftPage = false;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hasLeftPage = true;
      } else if (document.visibilityState === 'visible' && hasLeftPage) {
        // User returned to browser from the store app -> auto close modal immediately
        if (onCloseRef.current) onCloseRef.current();
      }
    };

    const handlePageShow = () => {
      // Triggered when page is restored from back/forward cache
      if (onCloseRef.current) onCloseRef.current();
    };

    const handleWindowBlur = () => {
      hasLeftPage = true;
    };

    const handleWindowFocus = () => {
      if (hasLeftPage) {
        if (onCloseRef.current) onCloseRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const storeName = store?.name || 'Store';
  const storeLogo = store?.logoUrl || '';

  const handleManualOpen = () => {
    if (onOpenStore) onOpenStore();
    setTimeout(() => {
      if (onCloseRef.current) onCloseRef.current();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Logos Animation Row */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2 pb-6">
          {/* KaroDeal Logo */}
          <div className="w-16 h-16 rounded-2xl bg-black dark:bg-neutral-800 p-2.5 flex items-center justify-center shadow-lg shadow-black/10 shrink-0 border border-neutral-800">
            <img src="/images/favicon.png" alt="KaroDeal" className="w-full h-full object-contain rounded-lg" />
          </div>

          {/* Animated Connecting Beam */}
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-150" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mt-0.5">
              Syncing
            </span>
          </div>

          {/* Store Logo */}
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/90 dark:border-neutral-700 p-2.5 flex items-center justify-center shadow-lg shrink-0">
            {storeLogo ? (
              <img src={storeLogo} alt={storeName} className="w-full h-full object-contain" />
            ) : (
              <span className="font-black text-sm uppercase text-neutral-700 dark:text-neutral-200">{storeName.slice(0, 3)}</span>
            )}
          </div>
        </div>

        {/* 2. Headline & Status */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cashback Tracking Activated</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Activating ₹{cashbackAmount} Cashback
          </h3>

          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            Opening <span className="font-bold text-neutral-800 dark:text-neutral-200">{storeName} App</span> or website...
          </p>
        </div>

        {/* 3. Progress Bar */}
        <div className="mt-6 mb-5">
          <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 transition-all duration-75 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-semibold text-neutral-400 mt-1.5 px-0.5">
            <span>Securing deal link</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* 4. Cashback Instructions */}
        <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3.5 border border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 space-y-2 mb-6">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>Complete purchase in the same session without switching apps.</span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span>Cashback will automatically reflect in your KaroDeal wallet.</span>
          </div>
        </div>

        {/* 5. Manual Action Button */}
        <button
          onClick={handleManualOpen}
          className="w-full py-3.5 px-4 rounded-xl bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] text-white dark:text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <span>Open {storeName} Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-[10px] text-neutral-400 dark:text-neutral-500 mt-3 font-medium">
          If the app didn't open automatically, tap the button above.
        </p>
      </div>
    </div>
  );
}
