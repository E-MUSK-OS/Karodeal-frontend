'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Ticket, User } from 'lucide-react';
import { useSyncExternalStore, useMemo } from 'react';

function subscribe(callback) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('auth-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('auth-change', callback);
  };
}

function getSnapshot() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user');
}

function getServerSnapshot() {
  return null;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const rawUser = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Validate user and strictly enforce null on login/signup pages
  const user = useMemo(() => {
    if (!rawUser || pathname === '/login' || pathname === '/signup') {
      return null;
    }
    try {
      const parsed = JSON.parse(rawUser);
      return parsed && parsed.token ? parsed : null;
    } catch {
      return null;
    }
  }, [rawUser, pathname]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { name: 'Home', href: '/', icon: Home, isHome: true },
    {
      name: user ? `₹${user?.earnings || '0.00'}` : '₹0.00',
      href: user ? '/profile/earnings' : '/login',
      icon: Wallet,
      type: 'wallet',
    },
    {
      name: 'Missing?',
      href: user ? '/profile/missing-cashback' : '/login',
      icon: Ticket,
      type: 'missing',
    },
    {
      name: 'Profile',
      href: user ? '/profile' : '/login',
      icon: User,
      type: 'profile',
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 px-2 py-2 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;

        let isActive = false;
        if (item.isHome) {
          isActive = pathname === '/';
        } else if (item.type === 'profile') {
          isActive =
            (pathname?.startsWith('/profile') &&
              !pathname?.startsWith('/profile/earnings') &&
              !pathname?.startsWith('/profile/missing-cashback')) ||
            (!user && pathname === '/login');
        } else if (item.type === 'wallet') {
          isActive = Boolean(user && pathname?.startsWith('/profile/earnings'));
        } else if (item.type === 'missing') {
          isActive = Boolean(user && pathname?.startsWith('/profile/missing-cashback'));
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 gap-1 py-1 transition-colors ${
              isActive ? 'text-blue-600' : 'text-neutral-600'
            }`}
          >
            <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
