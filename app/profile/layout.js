'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, Lock, Wallet, IndianRupee, History, Ticket, Star, ShieldCheck, ChevronRight, HelpCircle, MousePointerClick, Receipt } from 'lucide-react';

export default function ProfileLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setIsAuthorized(true);
      } else {
        router.push('/login');
      }
    };

    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, [router]);

  // Don't render the layout until we confirm authorization
  if (!isAuthorized) return null;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[80vh] bg-neutral-50/50">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="hidden md:block w-full md:w-64 lg:w-72 shrink-0">
          <div className="bg-white md:rounded-xl md:shadow-sm md:border md:border-neutral-200 overflow-hidden md:sticky top-28 -mx-4 sm:mx-0 px-4 sm:px-0">
            <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible hide-scrollbar gap-2 md:gap-0 pb-4 md:pb-0 md:py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 md:gap-4 px-4 py-3 md:px-6 md:py-4 text-[13px] md:text-[14px] font-medium transition-colors whitespace-nowrap rounded-full md:rounded-none ${isActive
                      ? 'bg-neutral-100 text-black md:border-l-4 md:border-black'
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-black md:border-l-4 md:border-transparent'
                      }`}
                  >
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-black' : 'text-neutral-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="hidden md:block p-4 border-t border-neutral-100">
              <Link href="/profile/review?write=true" className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-black border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                <span>Write us a review</span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
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
