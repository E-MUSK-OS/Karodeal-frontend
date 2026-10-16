'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, Landmark, Smartphone, AlertCircle, ArrowRight, BadgeCheck, LogIn, User } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';

export default function Payments() {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleAuthChange = () => {
      const uStr = localStorage.getItem('user');
      setUser(uStr ? JSON.parse(uStr) : null);
    };
    window.addEventListener('auth-change', handleAuthChange);

    const fetchBalance = async () => {
      if (!user?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBalance(data.user?.availableBalance || 0);
        } else if (res.status === 401 || res.status === 404) {
          localStorage.removeItem('user');
          setUser(null);
          window.dispatchEvent(new Event('auth-change'));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBalance();
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [user?.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 1000) {
      setError('Minimum withdrawal amount is ₹1000');
      return;
    }
    if (numAmount > balance) {
      setError('Insufficient available balance');
      return;
    }
    const finalDetails = details;

    if (!details.trim()) {
      setError('Please provide your UPI ID');
      return;
    }

    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/payouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ amount: numAmount, method: 'UPI', paymentDetails: finalDetails })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit request');
        return;
      }

      setSuccess('Withdrawal request submitted successfully!');
      setBalance(prev => prev - numAmount);
      setAmount('');
      setDetails('');
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-neutral-900">Withdraw Money</h4>
          </div>
          <p className="text-neutral-500 text-xs">
            Transfer your available cashback directly to your UPI. Minimum withdrawal amount is ₹1000.
          </p>
        </div>
        <div className="bg-emerald-50/50 px-4 py-2.5 rounded-lg flex flex-col items-end min-w-[140px]">
          <span className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-0.5">Available to Withdraw</span>
          <span className="text-xl font-black text-emerald-600 tracking-tight">
            ₹{isLoading ? '...' : balance.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
        <h5 className="font-bold text-neutral-900 mb-4">Payment Details</h5>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg flex items-start gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg flex items-start gap-2 border border-green-100">
            <BadgeCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs font-medium">{success}</p>
          </div>
        )}

        {!user ? (
          <div className="text-center py-8 px-4 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="w-12 h-12 bg-white border border-neutral-200 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <User className="w-6 h-6 text-neutral-400" />
            </div>
            <h5 className="font-bold text-neutral-900 mb-1">Please log in to withdraw funds</h5>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5">
              You must be logged in to view your withdrawable balance and submit payout requests.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-medium text-sm rounded-xl transition-colors">
                <LogIn className="w-4 h-4" />
                <span>Login to Account</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1.5">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  min="1000"
                  step="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount (Min. 1000)"
                  className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1.5">UPI ID</label>
                <input
                  type="text"
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="e.g., yourname@okaxis"
                  className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>
            </div>

            <Button variant="none" size="none"
              type="submit"
              disabled={balance < 1000 || isLoading}
              className="w-auto inline-flex justify-center items-center gap-1.5 bg-black text-white text-xs font-bold px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Request <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
