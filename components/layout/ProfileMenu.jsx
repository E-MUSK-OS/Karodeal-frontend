'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-semibold text-black hover:text-neutral-600 transition-colors py-6 focus:outline-none"
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[70px] w-[340px] max-h-[calc(100vh-90px)] overflow-y-auto bg-white rounded-xl shadow-xl border border-neutral-200 z-50 animate-popup transform origin-top-right">
          {/* User Header */}
          <div className="p-5 pb-4">
            <div className="text-[13px] text-neutral-500 font-medium">Hello,</div>
            <h5 className="font-bold text-black">
              {user.name || 'User Name'}
            </h5>
          </div>

          {/* Account Settings */}
          <div className="px-5 py-3 border-b border-neutral-100 bg-white hover:bg-neutral-50 transition-colors">
            <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-black">
              <Settings className="w-5 h-5" />
              <span className="text-[14px] font-semibold">Account Settings</span>
            </Link>
          </div>

          {/* Change Password */}
          <div className="px-5 py-3 border-b border-neutral-100 bg-white hover:bg-neutral-50 transition-colors">
            <Link href="/profile/change-password" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-black">
              <Lock className="w-5 h-5" />
              <span className="text-[14px] font-semibold">Change Password</span>
            </Link>
          </div>

          {/* Cashback & Rewards Section */}
          <div className="px-5 py-4 border-b border-neutral-100">
            <div className="text-[13px] text-neutral-500 font-medium mb-4">
              Cashback & Rewards
            </div>
            <div className="flex flex-col gap-4">
              <Link href="/profile/earnings" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 hover:text-black">
                <Wallet className="w-5 h-5 text-neutral-700" />
                <span className="text-[14px] font-medium">My Earnings</span>
              </Link>
              <Link href="/profile/payments" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 hover:text-black">
                <IndianRupee className="w-5 h-5 text-neutral-700" />
                <span className="text-[14px] font-medium">Withdraw</span>
              </Link>
              <Link href="/profile/payments-history" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 hover:text-black">
                <History className="w-5 h-5 text-neutral-700" />
                <span className="text-[14px] font-medium">Payments History</span>
              </Link>
              <Link href="/profile/claim-cashback" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 hover:text-black">
                <Receipt className="w-5 h-5 text-neutral-700" />
                <span className="text-[14px] font-medium">Claim Cashback</span>
              </Link>
              <Link href="/profile/missing-cashback" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 hover:text-black">
                <Ticket className="w-5 h-5 text-neutral-700" />
                <span className="text-[14px] font-medium">Missing Cashback</span>
              </Link>
            </div>
          </div>

          {/* Support & feedback Section */}
          <div className="px-5 py-4 border-b border-neutral-100">
            <div className="text-[13px] text-neutral-500 font-medium mb-4">
              Support & feedback
            </div>
            <div className="flex flex-col gap-4">
              <Link href="/profile/help" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 hover:text-black">
                <HelpCircle className="w-5 h-5 text-neutral-700" />
                <span className="text-[14px] font-medium">Help & Support</span>
              </Link>
              <Link href="/profile/review" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 hover:text-black">
                <Star className="w-5 h-5 text-neutral-700" />
                <span className="text-[14px] font-medium">Review Us</span>
              </Link>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="px-5 py-4 border-b border-neutral-100 bg-white hover:bg-neutral-50 transition-colors">
            <Link href="/privacy-policy" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-neutral-800 hover:text-black">
              <ShieldCheck className="w-5 h-5 text-neutral-700" />
              <span className="text-[14px] font-medium">Privacy Policy</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="px-5 py-4 bg-white hover:bg-neutral-50 transition-colors">
            <button onClick={handleLogout} className="flex items-center gap-4 text-red-600 w-full text-left">
              <LogOut className="w-5 h-5" />
              <span className="text-[14px] font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
