'use client';

import { useState, useEffect } from 'react';
import { History, IndianRupee, Clock, CheckCircle2, XCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/common/PageLoader';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/transactions`, {
          headers: { 'Authorization': `Bearer ${JSON.parse(userStr).token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [router]);

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
      case 'CONFIRMED': return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      case 'CANCELLED':
      case 'REJECTED': return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      case 'PENDING':
      default: return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex items-center gap-3 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div className="p-2 bg-green-50 text-green-600 rounded-xl">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h5 className="font-extrabold text-neutral-900 tracking-tight">Transaction History</h5>
          <p className="text-neutral-500 text-sm">Track your cashback earnings and withdrawal requests.</p>
        </div>
      </div>

      {isLoading ? (
              <PageLoader />
            ) : transactions.length > 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-100">
                  <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Amount</th>
                  <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Details</th>
                  <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {transactions.map((txn) => {
                  const Status = getStatusConfig(txn.status);
                  const Icon = Status.icon;
                  const isEarning = txn.type === 'EARNING' || txn.type === 'BONUS';

                  return (
                    <tr key={txn.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm text-neutral-600 font-medium whitespace-nowrap">
                        {formatDate(txn.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          {isEarning ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`font-bold text-lg ${isEarning ? 'text-green-600' : 'text-neutral-900'}`}>
                            {isEarning ? '+' : ''}₹{Math.abs(txn.amount).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <span className="text-sm lg:text-[15px] xl:text-base font-bold text-neutral-700">{txn.type}</span>
                          <p className="text-xs text-neutral-500 truncate max-w-[200px]" title={txn.description ? txn.description.split(' - ID:')[0] : ''}>
                            {txn.description ? txn.description.split(' - ID:')[0] : ''}
                          </p>
                          {txn.storeName && (
                            <p className="text-[10px] text-neutral-400 mt-0.5">Store: {txn.storeName} {txn.orderId ? `(#${txn.orderId})` : ''}</p>
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
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-4 border border-neutral-100">
            <History className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="font-bold text-neutral-900 mb-2">No transactions yet</h3>
          <p className="text-neutral-500 mb-6 max-w-sm text-sm">
            Your cashback earnings and withdrawals will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
