'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, X, User, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../common/Button';
import ProfileMenu from './ProfileMenu';
export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
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
              // Only redirect if not on an admin page
              if (!window.location.pathname.startsWith('/admin')) {
                router.push('/login');
              }
              throw new Error(res.status === 401 ? 'Token expired' : 'User not found');
            }
            return res.json();
          })
          .then(data => {
            if (data.user) {
              setUser(prev => ({ ...prev, earnings: data.user.availableBalance }));
              // Also update localStorage so it persists
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
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };



  return (
    <header
      className={`sticky page-container top-0 z-50 w-full bg-white border-b border-neutral-200 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''
        }`}
    >
      <div className="">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center mr-4 lg:mr-8">
            <Link href="/" className="flex items-center gap-2 lg:gap-3">
              <img src="/images/logo.png" alt="KaroDeal Logo" className="h-10 lg:h-12 w-auto object-contain" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-4 lg:space-x-10 items-center">
            <Link href="/" className={`text-[11px] lg:text-sm font-bold uppercase tracking-widest transition-colors ${pathname === '/' ? 'text-black' : 'text-neutral-500 hover:text-black'}`}>Home</Link>
            <Link href="/deals" className={`text-[11px] lg:text-sm font-bold uppercase tracking-widest transition-colors ${pathname?.startsWith('/deals') ? 'text-black' : 'text-neutral-500 hover:text-black'}`}>Deals</Link>
            <Link href="/stores" className={`text-[11px] lg:text-sm font-bold uppercase tracking-widest transition-colors ${pathname?.startsWith('/stores') ? 'text-black' : 'text-neutral-500 hover:text-black'}`}>Stores</Link>
            <Link href="/categories" className={`text-[11px] lg:text-sm font-bold uppercase tracking-widest transition-colors ${pathname?.startsWith('/categories') ? 'text-black' : 'text-neutral-500 hover:text-black'}`}>Categories</Link>
          </nav>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-sm ml-4 lg:ml-8 mr-3 lg:mr-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" strokeWidth={2} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 lg:py-2.5 border border-neutral-200 text-xs lg:text-sm leading-5 bg-white placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
                placeholder="Search..."
              />
            </form>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-6 shrink-0">
            {user ? (
              <>
                <Link href="/profile/earnings" className="flex items-center gap-2 text-[15px] font-bold text-black hover:text-neutral-600 transition-colors">
                  <Wallet className="w-5 h-5" />
                  <span>₹{user.earnings || '0.0'}</span>
                </Link>
                <ProfileMenu user={user} />
              </>
            ) : (
              <Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-black hover:text-neutral-600 transition-colors">
                <User className="w-5 h-5" />
                <span>Login / Sign up</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-4">
            <Link href="/search" className="text-black focus:outline-none">
              <Search className="h-5 w-5" strokeWidth={2} />
            </Link>
            <Button variant="none" size="none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" strokeWidth={2} />
              ) : (
                <Menu className="h-6 w-6" strokeWidth={2} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100 p-4">
          <div className="flex flex-col space-y-4">
            <Link href="/" className={`text-lg font-bold uppercase tracking-wider ${pathname === '/' ? 'text-black' : 'text-neutral-500'}`}>Home</Link>
            <Link href="/deals" className={`text-lg font-bold uppercase tracking-wider ${pathname?.startsWith('/deals') ? 'text-black' : 'text-neutral-500'}`}>Deals</Link>
            <Link href="/stores" className={`text-lg font-bold uppercase tracking-wider ${pathname?.startsWith('/stores') ? 'text-black' : 'text-neutral-500'}`}>Stores</Link>
            <Link href="/categories" className={`text-lg font-bold uppercase tracking-wider ${pathname?.startsWith('/categories') ? 'text-black' : 'text-neutral-500'}`}>Categories</Link>
          </div>
          <div className="mt-8">
            {user ? (
              <div className="flex flex-col gap-4">
                <Button variant="none" size="none"
                  onClick={() => {
                    localStorage.removeItem('user');
                    window.dispatchEvent(new Event('auth-change'));
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 text-red-600 font-semibold bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" fullWidth icon={<User className="w-4 h-4" />}>
                  Login / Sign up
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
