'use client';

import { IndianRupee, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function ClaimsSummaryCards({ summary = {} }) {
  const {
    approvedAmount = 0,
    approvedCount = 0,
    pendingAmount = 0,
    pendingCount = 0,
    rejectedCount = 0
  } = summary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* 1. Approved Cashback (કુલ આપેલું કેશબેક) */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden group hover:border-[#f96b02] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Approved Cashback</span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-neutral-900 tracking-tight">
          ₹{approvedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-neutral-400 font-semibold mt-1.5 flex items-center gap-1.5">
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            {approvedCount} Claims Approved (Credited)
          </span>
        </div>
      </div>

      {/* 2. Pending Cashback (આપવાનું બાકી કેશબેક) */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden group hover:border-[#f96b02] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Pending Cashback</span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-neutral-900 tracking-tight">
          ₹{pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-neutral-400 font-semibold mt-1.5 flex items-center gap-1.5">
          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
            {pendingCount} Claims Awaiting Approval
          </span>
        </div>
      </div>

      {/* 3. Rejected Claims (રિજેક્ટ થયેલા) */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden group hover:border-[#f96b02] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Rejected Claims</span>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-neutral-900 tracking-tight">
          {rejectedCount}
        </div>
        <div className="text-xs text-neutral-400 font-semibold mt-1.5 flex items-center gap-1.5">
          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-bold">
            Declined Submissions
          </span>
        </div>
      </div>
    </div>
  );
}
