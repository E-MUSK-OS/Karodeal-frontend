'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, X, User, Wallet, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProfileMenu from './ProfileMenu';
import HeaderSearch from './HeaderSearch';

const NAV_ITEMS = [
  { label: 'Home', href: '/', exact: true },
  { label: 'Deals', href: '/deals' },
  { label: 'Stores', href: '/stores' },
  { label: 'Categories', href: '/categories' },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 8) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    const checkLogin = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        // Fetch real wallet balance
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${userData.token}` }
        })
          .then(res => {
            if (res.status === 401 || res.status === 404) {
              localStorage.removeItem('user');
              setUser(null);
              window.dispatchEvent(new Event('auth-change'));
              throw new Error(res.status === 401 ? 'Token expired' : 'User not found');
            }
            return res.json();
          })
          .then(data => {
            if (data.user) {
              setUser(prev => ({ ...prev, earnings: data.user.availableBalance }));
              const updatedUser = { ...userData, earnings: data.user.availableBalance };
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          })
          .catch(err => console.warn('Warning: Could not fetch wallet balance (backend may be down)'));
      } else {
        setUser(null);
      }
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    window.addEventListener('auth-change', checkLogin);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('auth-change', checkLogin);
    };
  }, [router]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-b border-neutral-200/90'
          : 'bg-white/90 backdrop-blur-md border-b border-neutral-200/60'
      }`}
    >
      <div className="page-container">
        <div className="flex justify-between items-center h-16 sm:h-17 lg:h-19 gap-3 sm:gap-4 lg:gap-6">

          {/* Left: Brand Logo (Refined Balanced Scale) */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group py-1">
              <img
                src="/images/logo.png"
                alt="KaroDeal Official Platform"
                className="h-8.5 sm:h-9.5 md:h-10 lg:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Center-Left: Modern Segmented Navigation Links (Refined Scale) */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-neutral-100/75 border border-neutral-200/60 shadow-2xs">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-1.75 rounded-full text-xs sm:text-[13.5px] font-bold tracking-tight transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-black font-extrabold shadow-xs'
                      : 'text-neutral-600 hover:text-black hover:bg-white/70'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Center-Right: Elevated Live Autocomplete Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm xl:max-w-md mx-1 lg:mx-2">
            <HeaderSearch />
          </div>

          {/* Right: Actions (Wallet, Profile, Login/Signup) */}
          <div className="hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0">
            {user ? (
              <>
                {/* Live Cashback Wallet Balance Pill */}
                <Link
                  href="/profile/earnings"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 text-xs sm:text-[13px] font-extrabold shadow-2xs transition-all active:scale-95 group"
                  title="Cashback Wallet Balance"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Wallet className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>₹{user.earnings || '0.00'}</span>
                </Link>

                {/* Profile Menu Trigger */}
                <ProfileMenu user={user} />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs sm:text-[13px] font-bold text-neutral-700 hover:text-black px-3.5 py-1.75 rounded-full hover:bg-neutral-100/80 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-1.75 rounded-full bg-neutral-950 hover:bg-black text-white text-xs sm:text-[13px] font-extrabold shadow-xs hover:shadow-md transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Join Free</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Icons (Search & Hamburger) */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
              }}
              className={`p-2 rounded-full transition-colors focus:outline-none border border-neutral-200/80 shadow-2xs ${
                isMobileSearchOpen ? 'bg-black text-white border-black' : 'text-neutral-700 bg-white hover:bg-neutral-100'
              }`}
              aria-label="Toggle Search"
            >
              {isMobileSearchOpen ? (
                <X className="h-4.5 w-4.5" strokeWidth={2.2} />
              ) : (
                <Search className="h-4.5 w-4.5" strokeWidth={2.2} />
              )}
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                if (isMobileSearchOpen) setIsMobileSearchOpen(false);
              }}
              className={`p-2 rounded-full transition-colors focus:outline-none border border-neutral-200/80 shadow-2xs ${
                isMobileMenuOpen ? 'bg-black text-white border-black' : 'text-neutral-700 bg-white hover:bg-neutral-100'
              }`}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-4.5 w-4.5" strokeWidth={2.2} />
              ) : (
                <Menu className="h-4.5 w-4.5" strokeWidth={2.2} />
              )}
            </button>
          </div>

        </div>

        {/* Mobile Search Dropdown */}
        {isMobileSearchOpen && (
          <div className="md:hidden pb-3.5 pt-1 border-t border-neutral-100 animate-in fade-in slide-in-from-top-1">
            <HeaderSearch autoFocus onClose={() => setIsMobileSearchOpen(false)} />
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-t border-neutral-200 p-5 shadow-2xl animate-in fade-in slide-in-from-top-2">
          {/* Mobile Nav Links */}
          <div className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-bold transition-all ${
                    isActive
                      ? 'bg-neutral-100 text-black'
                      : 'text-neutral-600 hover:text-black hover:bg-neutral-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#f96b02]" />}
                </Link>
              );
            })}
          </div>

          {/* Mobile User Section */}
          <div className="mt-5 pt-5 border-t border-neutral-100">
            {user ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/profile/earnings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800"
                >
                  <div className="flex items-center gap-2.5 font-bold">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    <span>Wallet Balance</span>
                  </div>
                  <span className="font-extrabold text-base">₹{user.earnings || '0.00'}</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 text-neutral-800 font-bold bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>My Account</span>
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    setUser(null);
                    window.dispatchEvent(new Event('auth-change'));
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-red-600 font-semibold text-sm hover:bg-red-50 rounded-xl transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center py-3 text-sm font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-3 text-sm font-bold text-white bg-black hover:bg-neutral-800 rounded-xl shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Join Free</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
