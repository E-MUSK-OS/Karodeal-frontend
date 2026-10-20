'use client';

import { useState, useEffect } from 'react';
import { History, IndianRupee, Clock, CheckCircle2, XCircle, ArrowUpRight, ArrowDownLeft, LogIn, User } from 'lucide-react';
import Link from 'next/link';
import PageLoader from '@/components/common/PageLoader';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

    const fetchHistory = async () => {
      if (!user?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/transactions`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
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
    fetchHistory();
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [user?.token]);

  const formatDate = (dateString) => {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'CONFIRMED': return { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40', border: 'border-green-200 dark:border-green-900/50' };
      case 'CANCELLED':
      case 'REJECTED': return { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-200 dark:border-red-900/50' };
      case 'PENDING':
      default: return { icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-900/50' };
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
        <div className="p-2 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h5 className="font-extrabold text-neutral-900 dark:text-white tracking-tight">Transaction History</h5>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Track your cashback earnings and withdrawal requests.</p>
        </div>
      </div>

      {!user ? (
        <div className="text-center py-10 px-4 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
          <div className="w-14 h-14 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <User className="w-7 h-7 text-neutral-400" />
          </div>
          <h5 className="font-bold text-neutral-900 dark:text-white mb-1">Please log in to view transactions</h5>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-5">
            Log in to view your complete transaction history, cashback credit dates, and withdrawal logs.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black font-medium text-sm rounded-xl transition-colors">
              <LogIn className="w-4 h-4" />
              <span>Login to Account</span>
            </Link>
          </div>
        </div>
      ) : isLoading ? (
        <PageLoader />
      ) : transactions.length > 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 dark:bg-neutral-800/80 border-b border-neutral-100 dark:border-neutral-800">
                  <th className="py-4 px-6 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Amount</th>
                  <th className="py-4 px-6 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Details</th>
                  <th className="py-4 px-6 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {transactions.map((txn) => {
                  const Status = getStatusConfig(txn.status);
                  const Icon = Status.icon;
                  const isEarning = txn.type === 'EARNING' || txn.type === 'BONUS';

                  return (
                    <tr key={txn.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="py-4 px-6 text-sm text-neutral-600 dark:text-neutral-300 font-medium whitespace-nowrap">
                        {formatDate(txn.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          {isEarning ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`font-bold text-lg ${isEarning ? 'text-green-600 dark:text-green-400' : 'text-neutral-900 dark:text-white'}`}>
                            {isEarning ? '+' : ''}₹{Math.abs(txn.amount).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <span className="text-sm lg:text-[15px] xl:text-base font-bold text-neutral-700 dark:text-neutral-200">{txn.type}</span>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]" title={txn.description ? txn.description.split(' - ID:')[0] : ''}>
                            {txn.description ? txn.description.split(' - ID:')[0] : ''}
                          </p>
                          {txn.storeName && (
                            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">Store: {txn.storeName} {txn.orderId ? `(#${txn.orderId})` : ''}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${Status.bg} ${Status.color} border ${Status.border}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {txn.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 border border-neutral-100 dark:border-neutral-700">
            <History className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-white mb-2">No transactions yet</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm text-sm">
            Your cashback earnings and withdrawals will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
