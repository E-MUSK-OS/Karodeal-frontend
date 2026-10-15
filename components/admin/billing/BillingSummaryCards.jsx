'use client';

import { IndianRupee, Star, Zap } from 'lucide-react';

export default function BillingSummaryCards({ summary = {} }) {
  const {
    totalBilling = 0,
    totalApprovedClaims = 0,
    withReviewBilling = 0,
    withReviewCount = 0,
    withoutReviewBilling = 0,
    withoutReviewCount = 0
  } = summary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Total Billing */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden group hover:border-[#f96b02] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Billing</span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-neutral-900 tracking-tight">
          ₹{totalBilling.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-neutral-400 font-semibold mt-1.5 flex items-center gap-1.5">
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            {totalApprovedClaims} Approved Orders
          </span>
        </div>
      </div>

      {/* 2. With Review Billing */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden group hover:border-[#f96b02] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">With Review</span>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f96b02] flex items-center justify-center font-bold">
            <Star className="w-5 h-5 fill-orange-400" />
          </div>
        </div>
        <div className="text-2xl font-black text-neutral-900 tracking-tight">
          ₹{withReviewBilling.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-neutral-400 font-semibold mt-1.5 flex items-center gap-1.5">
          <span className="text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full font-bold">
            {withReviewCount} Orders (Higher Cashback)
          </span>
        </div>
      </div>

      {/* 3. Without Review Billing */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden group hover:border-[#f96b02] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Without Review</span>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5 fill-blue-400" />
          </div>
        </div>
        <div className="text-2xl font-black text-neutral-900 tracking-tight">
          ₹{withoutReviewBilling.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-neutral-400 font-semibold mt-1.5 flex items-center gap-1.5">
          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
            {withoutReviewCount} Orders (Standard)
          </span>
        </div>
      </div>
    </div>
  );
}

