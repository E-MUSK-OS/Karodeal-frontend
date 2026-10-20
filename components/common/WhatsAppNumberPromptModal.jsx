'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  X, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  CheckCircle2,
  ShieldCheck,
  BellRing
} from 'lucide-react';
import { showSuccessToast } from '@/lib/errorHandler';

export default function WhatsAppNumberPromptModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    // 1. Exclude auth or admin routes, or settings page where user can edit directly
    if (
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname?.startsWith('/admin') ||
      pathname === '/profile/settings'
    ) {
      return;
    }

    // 2. Check if user is logged in
    const getUserData = () => {
      try {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
      } catch (e) {
        return null;
      }
    };

    const isDismissed = () => {
      try {
        return sessionStorage.getItem('karodeal_whatsapp_prompt_dismissed') === 'true';
      } catch (e) {
        return false;
      }
    };

    const userData = getUserData();

    // If user is NOT logged in, or already has phone/mobile, or already dismissed, do nothing
    if (!userData?.token || userData.mobile || userData.phone || isDismissed()) {
      return;
    }

    // 3. Start a friendly 7-second timer for logged-in users who haven't added mobile yet
    timerRef.current = setTimeout(() => {
      const freshUser = getUserData();
      if (
        freshUser?.token && 
        !freshUser.mobile && 
        !freshUser.phone && 
        !isDismissed()
      ) {
        const currentPath = window.location.pathname;
        if (
          currentPath !== '/login' && 
          currentPath !== '/signup' && 
          !currentPath.startsWith('/admin') &&
          currentPath !== '/profile/settings'
        ) {
          setIsOpen(true);
        }
      }
    }, 7000); // 7 seconds after page load

    // 4. Listen for auth-change in case user adds mobile in another component
    const handleAuthChange = () => {
      const u = getUserData();
      if (!u?.token || u.mobile || u.phone) {
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
      sessionStorage.setItem('karodeal_whatsapp_prompt_dismissed', 'true');
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

  const handleSavePhone = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.trim();

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit WhatsApp number');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const userStr = localStorage.getItem('user');
      const userData = userStr ? JSON.parse(userStr) : null;

      if (!userData?.token) {
        setIsOpen(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
      const res = await fetch(`${apiUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData.token}`,
        },
        body: JSON.stringify({
          name: userData.name || '',
          mobile: cleanPhone,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update user state in localStorage
        const updatedUser = {
          ...userData,
          mobile: cleanPhone,
          phone: cleanPhone,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        try {
          sessionStorage.setItem('karodeal_whatsapp_prompt_dismissed', 'true');
        } catch (e) {}

        window.dispatchEvent(new Event('auth-change'));
        showSuccessToast('WhatsApp number saved! You will receive new collection and deal alerts.');
        setIsOpen(false);
      } else {
        setError(data.error || 'Failed to save number. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
    >
      <div 
        className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xl max-w-md w-full p-6 sm:p-8 relative overflow-hidden text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Ambient Green Glow in Background */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-[#f96b02]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top WhatsApp Icon Badge */}
        <div className="relative mb-4 flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-[#25D366] text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-100 animate-bounce duration-1000">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
            </svg>
          </div>
        </div>

        {/* Tag Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-black uppercase tracking-wider mb-2.5">
          <BellRing className="w-3.5 h-3.5" />
          <span>New Collection Drop Alerts</span>
        </div>

        {/* Headline */}
        <h3 
          id="whatsapp-modal-title"
          className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase tracking-tight leading-tight mb-2"
        >
          Add Your <br />
          <span className="text-emerald-600">WhatsApp Number</span>
        </h3>

        {/* Message */}
        <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed mb-5 max-w-xs mx-auto">
          Whenever our <strong className="text-neutral-900 font-bold">new collection & secret deal drops</strong> arrive, we will send an instant WhatsApp notification so you never miss the best loot!
        </p>

        {/* Form to enter mobile number */}
        <form onSubmit={handleSavePhone} className="space-y-4">
          <div className="text-left space-y-1">
            <label htmlFor="whatsapp-modal-input" className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
              WhatsApp Mobile Number *
            </label>
            <div className="flex items-center rounded-2xl border border-neutral-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 bg-neutral-50/60 overflow-hidden transition-all">
              <div className="px-3.5 py-3 bg-neutral-100 text-xs sm:text-sm font-bold text-neutral-700 border-r border-neutral-200 flex items-center gap-1.5 select-none shrink-0">
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                id="whatsapp-modal-input"
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 10) setPhone(val);
                  if (error) setError('');
                }}
                placeholder="Enter 10-digit number"
                required
                autoFocus
                className="w-full px-3.5 py-3 bg-transparent text-neutral-900 font-bold text-sm sm:text-base tracking-wider placeholder-neutral-400 focus:outline-none"
              />
            </div>
            {error && (
              <p className="text-xs text-rose-600 font-semibold pt-0.5">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white rounded-2xl font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Number...</span>
              </>
            ) : (
              <>
                <span>Save & Get Collection Alerts</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Perks / Privacy note */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Strictly no spam • Only fresh collection & discount alerts</span>
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="mt-3 text-[11px] font-bold text-neutral-400 hover:text-neutral-700 uppercase tracking-widest transition-colors cursor-pointer"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
