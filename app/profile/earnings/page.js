'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Info, RefreshCw, Star, Users,
  BadgeCheck, Hourglass, ShoppingBag, ChevronRight
} from 'lucide-react';

export default function EarningsPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchLatestProfile = async (token, cachedUser) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const freshUser = { ...cachedUser, ...data.user };
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      } catch (err) {
        console.error("Failed to fetch fresh profile data", err);
      }
    };

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      fetchLatestProfile(parsedUser.token, parsedUser);
    }
  }, []);
  return (
    <div className="space-y-6">
      {/* Top Black Banner */}
      <div className="bg-black rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-8">

          {/* Left: Total Earnings */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-lg">Available Balance</span>
              <Info className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-4xl lg:text-5xl font-bold tracking-tight">
              ₹{user?.availableBalance !== undefined ? user.availableBalance : '0.00'}
            </div>
          </div>

          {/* Right: Breakdown Cards */}
          <div className="flex gap-4 w-full lg:w-auto">
            {/* Cashback */}
            <div className="flex-1 bg-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center lg:min-w-[140px]">
              <RefreshCw className="w-6 h-6 mb-3 text-neutral-400" />
              <span className="text-xs sm:text-sm font-medium text-neutral-300 mb-1">Total Earned</span>
              <span className="text-lg font-bold text-white">₹{user?.confirmedBalance !== undefined ? user.confirmedBalance : '0.00'}</span>
            </div>

            {/* Rewards */}
            <div className="flex-1 bg-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center lg:min-w-[140px]">
              <Star className="w-6 h-6 mb-3 text-neutral-400" />
              <span className="text-xs sm:text-sm font-medium text-neutral-300 mb-1">Pending</span>
              <span className="text-lg font-bold text-white">₹{user?.pendingBalance !== undefined ? user.pendingBalance : '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-neutral-400 mt-4 border-t border-neutral-800 pt-4">
          *Earnings will show here within 72 hours of your shopping via Dealora app
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Confirmed */}
        <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <BadgeCheck className="w-8 h-8 text-black" />
          </div>
          <span className="text-sm lg:text-[15px] xl:text-base text-neutral-600 font-medium mb-1">Available for Withdrawal</span>
          <span className="text-2xl font-bold text-black mb-6">₹{user?.availableBalance !== undefined ? user.availableBalance : '0.00'}</span>
          <Link href="/profile/payments" className="text-sm lg:text-[15px] xl:text-base w-full max-w-[200px] bg-black hover:bg-neutral-800 text-white font-semibold py-3 rounded-lg transition-colors text-center inline-block">
            Withdraw
          </Link>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <Hourglass className="w-8 h-8 text-orange-500" />
          </div>
          <span className="text-sm lg:text-[15px] xl:text-base text-neutral-600 font-medium mb-1">Pending</span>
          <span className="text-2xl font-bold text-black mb-6">₹{user?.pendingBalance !== undefined ? user.pendingBalance : '0.00'}</span>
          <Link href="/profile/help" className="text-sm lg:text-[15px] xl:text-base w-full max-w-[200px] border-2 border-neutral-300 hover:border-black text-black font-semibold py-2.5 rounded-lg transition-colors text-center inline-block">
            Know Why?
          </Link>
        </div>
      </div>


    </div>
  );
}
