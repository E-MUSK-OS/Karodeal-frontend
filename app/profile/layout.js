'use client';
import { useEffect, useSyncExternalStore, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Lock, Wallet, IndianRupee, History, Ticket, Star, ShieldCheck, ChevronRight, HelpCircle, Receipt } from 'lucide-react';

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

export default function ProfileLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const rawUser = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isPublic = pathname === '/profile/help' || pathname === '/profile/review';

  const user = useMemo(() => {
    if (!rawUser) return null;
    try {
      const u = JSON.parse(rawUser);
      return u && u.token ? u : null;
    } catch {
      return null;
    }
  }, [rawUser]);

  useEffect(() => {
    if (!isPublic && !user) {
      router.replace('/login');
    }
  }, [isPublic, user, router]);

  if (!isPublic && !user) {
    return null;
  }

  const navItems = [
    { name: 'Account Settings', href: '/profile', icon: User },
    { name: 'Change Password', href: '/profile/change-password', icon: Lock },
    { name: 'My Earnings', href: '/profile/earnings', icon: Wallet },

    { name: 'Withdraw', href: '/profile/payments', icon: IndianRupee },
    { name: 'Transaction History', href: '/profile/payments-history', icon: History },
    { name: 'Claim Cashback', href: '/profile/claim-cashback', icon: Receipt },
    { name: 'Missing Cashback', href: '/profile/missing-cashback', icon: Ticket },
    { name: 'Help & Support', href: '/profile/help', icon: HelpCircle },
    { name: 'Review Us', href: '/profile/review', icon: Star },
    { name: 'Privacy Policy', href: '/privacy-policy', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[80vh] bg-neutral-50/50 dark:bg-neutral-950">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="hidden md:block w-full md:w-64 lg:w-72 shrink-0">
          <div className="bg-white dark:bg-neutral-900 md:rounded-xl md:shadow-sm md:border md:border-neutral-200 dark:md:border-neutral-800 overflow-hidden md:sticky top-28 -mx-4 sm:mx-0 px-4 sm:px-0">
            <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible hide-scrollbar gap-2 md:gap-0 pb-4 md:pb-0 md:py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 md:gap-4 px-4 py-3 md:px-6 md:py-4 text-[13px] md:text-[14px] font-medium transition-colors whitespace-nowrap rounded-full md:rounded-none ${isActive
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white md:border-l-4 md:border-black dark:md:border-white'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-black dark:hover:text-white md:border-l-4 md:border-transparent'
                      }`}
                  >
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-black dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="hidden md:block p-4 border-t border-neutral-100 dark:border-neutral-800">
              <Link href="/profile/review?write=true" className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-black dark:text-white border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <span>Write us a review</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
