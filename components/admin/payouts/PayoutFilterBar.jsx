'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Tag, ChevronDown, Check, RotateCcw, Download, User } from 'lucide-react';
import Button from '@/components/common/Button';

export default function PayoutFilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  counts = { all: 0, pending: 0, approved: 0, rejected: 0 },
  onResetFilters,
  onExportExcel
}) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const filterBarRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const hasActiveFilters = Boolean(searchQuery || statusFilter !== 'ALL');

  const statusOptions = [
    { id: 'ALL', label: 'All Statuses', dot: 'bg-neutral-400', count: counts.all },
    { id: 'PENDING', label: 'Pending', dot: 'bg-amber-500', count: counts.pending },
    { id: 'APPROVED', label: 'Approved', dot: 'bg-emerald-500', count: counts.approved },
    { id: 'REJECTED', label: 'Declined', dot: 'bg-rose-500', count: counts.rejected },
  ];

  const currentLabel = statusOptions.find(o => o.id === statusFilter)?.label || 'All Statuses';

  return (
    <div className="space-y-4 mb-6">
      {/* Top Header Row with Title and Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-neutral-900">Payout Requests</h3>
          <p className="text-sm text-neutral-500">Manage, verify, and approve user withdrawal requests.</p>
        </div>
        <Button
          onClick={onExportExcel}
          variant="none"
          size="none"
          className="px-4 py-2.5 bg-black hover:bg-[#f96b02] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </Button>
      </div>

      {/* Search & Status Filter Dropdown Bar */}
      <div
        ref={filterBarRef}
        className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-20"
      >
        {/* Search Input: Strictly searches ONLY by User (name, email, mobile) */}
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 pr-9 text-xs sm:text-sm bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
          <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-0.5 rounded cursor-pointer"
              title="Clear user search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Custom Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(!openDropdown);
              }}
              className={`w-full sm:w-auto px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs ${
                statusFilter !== 'ALL'
                  ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
                  : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate max-w-[130px]">Status: {currentLabel}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  statusFilter !== 'ALL' ? 'bg-[#f96b02] text-white' : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {counts[statusFilter.toLowerCase()] ?? counts.all}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown ? 'rotate-180 text-black' : 'text-neutral-400'}`} />
            </button>

            {openDropdown && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 min-w-[210px] animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                  Filter by Transaction Status
                </div>
                {statusOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.id);
                      setOpenDropdown(false);
                    }}
                    className={`w-full px-3.5 py-2 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                      statusFilter === opt.id
                        ? 'bg-orange-50 font-bold text-[#f96b02]'
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`}></span>
                      <span className="truncate">{opt.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        statusFilter === opt.id ? 'bg-[#f96b02] text-white' : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {opt.count}
                      </span>
                      {statusFilter === opt.id && <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 border border-red-200 cursor-pointer shadow-2xs"
              title="Reset filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
