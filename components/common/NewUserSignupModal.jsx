'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Gift, 
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';

export default function NewUserSignupModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // 1. Do not trigger on auth pages or admin pages
    if (
      pathname === '/login' || 
      pathname === '/signup' || 
      pathname?.startsWith('/admin')
    ) {
      return;
    }

    // 2. Check if user is already logged in or previously dismissed in this session
    const isUserLoggedIn = () => {
      try {
        const u = localStorage.getItem('user');
        return Boolean(u && JSON.parse(u)?.token);
      } catch (e) {
        return Boolean(localStorage.getItem('user'));
      }
    };

    const isDismissed = () => {
      try {
        return sessionStorage.getItem('karodeal_signup_prompt_dismissed') === 'true';
      } catch (e) {
        return false;
      }
    };

    if (isUserLoggedIn() || isDismissed()) {
      return;
    }

    // 3. Start 10-second timer for new / guest visitors
    timerRef.current = setTimeout(() => {
      if (!isUserLoggedIn() && !isDismissed()) {
        // Ensure user hasn't navigated to an excluded route in the meantime
        const currentPath = window.location.pathname;
        if (
          currentPath !== '/login' && 
          currentPath !== '/signup' && 
          !currentPath.startsWith('/admin')
        ) {
          setIsOpen(true);
        }
      }
    }, 10000); // 10 seconds

    // 4. Listen for auth changes (if user logs in in another tab or component)
    const handleAuthChange = () => {
      if (isUserLoggedIn()) {
        setIsOpen(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [pathname]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('karodeal_signup_prompt_dismissed', 'true');
    } catch (e) {
      // ignore
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-modal-title"
    >
      <div 
        className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xl max-w-md w-full p-6 sm:p-8 relative overflow-hidden text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Ambient Brand Glow in Background */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#f96b02]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon Badge */}
        <div className="relative mb-4 flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f96b02] to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 ring-4 ring-orange-100 animate-bounce duration-1000">
            <Gift className="w-8 h-8 stroke-[2.2]" />
          </div>
        </div>

        {/* Welcome Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-[#f96b02] text-[11px] font-black uppercase tracking-wider mb-2.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Special Welcome Offer</span>
        </div>

        {/* Headline */}
        <h3 
          id="signup-modal-title"
          className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase tracking-tight leading-tight mb-2"
        >
          Join KaroDeal & <br />
          <span className="text-[#f96b02]">Get Real Cashback!</span>
        </h3>

        {/* Message Description */}
        <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed mb-5 max-w-xs mx-auto">
          Sign up free today to unlock exclusive drops, guaranteed cashback on every order, and withdraw money directly to your UPI!
        </p>

        {/* Value Perks */}
        <div className="space-y-2 mb-6 text-left bg-neutral-50/80 p-3.5 rounded-2xl border border-neutral-100">
          <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Real Cashback across Amazon, Flipkart, Myntra & more</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-800">
            <Zap className="w-4 h-4 text-[#f96b02] shrink-0" />
            <span>Instant & direct payouts to UPI & Bank account</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-800">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>100% Free Lifetime Account • Zero fees</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Main Signup CTA */}
          <Link
            href="/signup"
            onClick={handleDismiss}
            className="w-full py-3.5 px-6 bg-black hover:bg-[#f96b02] text-white rounded-2xl font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:shadow-orange-500/20 active:scale-98 group cursor-pointer"
          >
            <span>Create Free Account Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Already have an account */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-medium pt-1">
            <span>Already have an account?</span>
            <Link
              href="/login"
              onClick={handleDismiss}
              className="font-bold text-black hover:text-[#f96b02] hover:underline transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Dismiss subtle footer link */}
        <button
          type="button"
          onClick={handleDismiss}
          className="mt-4 text-[11px] font-bold text-neutral-400 hover:text-neutral-700 uppercase tracking-widest transition-colors cursor-pointer"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
