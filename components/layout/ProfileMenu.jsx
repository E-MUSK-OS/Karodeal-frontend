'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';
import {
  User, Settings, Wallet, IndianRupee, History, Ticket, Search, Star, ShieldCheck, LogOut, HelpCircle, Lock, Receipt
} from 'lucide-react';

export default function ProfileMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all focus:outline-none bg-white dark:bg-neutral-900 shadow-2xs group cursor-pointer"
        aria-label="Open User Profile Menu"
      >
        <div className="w-7 h-7 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-xs font-extrabold uppercase shadow-xs">
          {user.name ? user.name.charAt(0) : <User className="w-3.5 h-3.5" />}
        </div>
        <span className="text-xs sm:text-[13px] font-bold text-neutral-800 dark:text-neutral-200 max-w-[95px] truncate">
          {user.name?.split(' ')[0] || 'Profile'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-[340px] max-h-[calc(100vh-90px)] overflow-y-auto bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 z-50 animate-popup transform origin-top-right">
          {/* User Header */}
          <div className="p-5 pb-4">
            <div className="text-[13px] text-neutral-500 dark:text-neutral-400 font-medium">Hello,</div>
            <h5 className="font-bold text-black dark:text-white">
              {user.name || 'User Name'}
            </h5>
          </div>

          {/* Account Settings */}
          <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
            <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-black dark:text-white">
              <Settings className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <span className="text-[14px] font-semibold">Account Settings</span>
            </Link>
          </div>

          {/* Change Password */}
          <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
            <Link href="/profile/change-password" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-black dark:text-white">
              <Lock className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <span className="text-[14px] font-semibold">Change Password</span>
            </Link>
          </div>

          {/* Cashback & Rewards Section */}
          <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="text-[13px] text-neutral-500 dark:text-neutral-400 font-medium mb-4">
              Cashback & Rewards
            </div>
            <div className="flex flex-col gap-4">
              <Link href="/profile/earnings" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white">
                <Wallet className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
                <span className="text-[14px] font-medium">My Earnings</span>
              </Link>
              <Link href="/profile/payments" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white">
                <IndianRupee className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
                <span className="text-[14px] font-medium">Withdraw</span>
              </Link>
              <Link href="/profile/payments-history" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white">
                <History className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
                <span className="text-[14px] font-medium">Payments History</span>
              </Link>
              <Link href="/profile/claim-cashback" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white">
                <Receipt className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
                <span className="text-[14px] font-medium">Claim Cashback</span>
              </Link>
              <Link href="/profile/missing-cashback" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white">
                <Ticket className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
                <span className="text-[14px] font-medium">Missing Cashback</span>
              </Link>
            </div>
          </div>

          {/* Support & feedback Section */}
          <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="text-[13px] text-neutral-500 dark:text-neutral-400 font-medium mb-4">
              Support & feedback
            </div>
            <div className="flex flex-col gap-4">
              <Link href="/profile/help" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white">
                <HelpCircle className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
                <span className="text-[14px] font-medium">Help & Support</span>
              </Link>
              <Link href="/profile/review" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white">
                <Star className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
                <span className="text-[14px] font-medium">Review Us</span>
              </Link>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
            <Link href="/privacy-policy" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white">
              <ShieldCheck className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
              <span className="text-[14px] font-medium">Privacy Policy</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="px-5 py-4 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
            <Button variant="none" size="none" onClick={handleLogout} className="flex items-center justify-start gap-4 text-red-600 dark:text-red-400 w-full text-left cursor-pointer">
              <LogOut className="w-5 h-5" />
              <span className="text-[14px] font-medium">Logout</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
