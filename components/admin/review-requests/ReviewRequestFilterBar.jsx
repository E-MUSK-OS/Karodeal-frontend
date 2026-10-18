'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Tag, ChevronDown } from 'lucide-react';

export default function ReviewRequestFilterBar({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  counts,
  statusOptions,
  currentStatusLabel
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-20">
      {/* Search Input: strictly filters by product title */}
      <div className="relative flex-1 min-w-[240px]">
        <input
          type="text"
          placeholder="Search by product title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 pl-10 pr-9 text-xs sm:text-sm bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
        />
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-0.5 rounded cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Status Dropdown Menu */}
      <div ref={dropdownRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer shadow-2xs ${
            activeTab !== 'ALL'
              ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
              : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-neutral-500" />
            <span>Status: {currentStatusLabel}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              activeTab !== 'ALL' ? 'bg-[#f96b02] text-white' : 'bg-neutral-200 text-neutral-700'
            }`}>
              {counts[activeTab.toLowerCase()] ?? counts.total}
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-black' : 'text-neutral-400'}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 left-0 sm:left-auto top-full mt-1.5 z-60 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 w-full sm:w-56">
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
              Filter by Status
            </div>
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setActiveTab(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2 text-xs flex items-center justify-between font-semibold transition-colors cursor-pointer ${
                  activeTab === opt.id
                    ? 'bg-orange-50 text-[#f96b02] font-bold'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                  <span>{opt.label}</span>
                </div>
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                  activeTab === opt.id ? 'bg-[#f96b02] text-white' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {opt.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
