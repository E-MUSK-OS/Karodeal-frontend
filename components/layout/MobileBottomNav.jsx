'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Wallet, Ticket, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkLogin = () => {
      const userStr = localStorage.getItem('user');
      setUser(userStr ? JSON.parse(userStr) : null);
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    window.addEventListener('auth-change', checkLogin);

    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('auth-change', checkLogin);
    };
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: `₹${user?.earnings || '0.00'}`, href: '/profile/earnings', icon: Wallet },
    { name: 'Missing?', href: '/profile/missing-cashback', icon: Ticket },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 px-2 py-2 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;

        // Custom active state logic because /profile is a parent of /profile/earnings and /profile/missing-cashback
        let isActive = false;
        if (item.href === '/') {
          isActive = pathname === '/';
        } else if (item.href === '/profile') {
          isActive = pathname === '/profile';
        } else {
          isActive = pathname.startsWith(item.href);
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 gap-1 py-1 transition-colors ${isActive ? 'text-blue-600' : 'text-neutral-600'}`}
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
