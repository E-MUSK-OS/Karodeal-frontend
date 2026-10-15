'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Tag, ShieldCheck, ChevronDown, Check, RotateCcw } from 'lucide-react';

export default function MissingCashbackFilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedAdmin,
  setSelectedAdmin,
  allCreators = [],
  onResetFilters
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const filterBarRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const hasActiveFilters = searchQuery || statusFilter !== 'ALL' || selectedAdmin !== 'ALL';

  return (
    <div className="space-y-4 mb-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-neutral-900">Missing Cashback Claims</h3>
          <p className="text-sm text-neutral-500">Manage and resolve user missing cashback tickets.</p>
        </div>
      </div>

      {/* Search & Modern Filter Dropdowns Bar */}
      <div
        ref={filterBarRef}
        className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 relative z-20"
      >
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search email, store, order ID, or product..."
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

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Custom Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === 'status' ? null : 'status');
              }}
              className={`w-full sm:w-auto px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs ${
                statusFilter !== 'ALL'
                  ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
                  : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate max-w-[130px]">
                  {statusFilter === 'ALL'
                    ? 'All Statuses'
                    : statusFilter === 'PENDING'
                    ? 'Pending'
                    : statusFilter === 'RESOLVED'
                    ? 'Resolved'
                    : 'Rejected'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'status' ? 'rotate-180 text-black' : 'text-neutral-400'}`} />
            </button>

            {openDropdown === 'status' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 min-w-[200px] animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                  Filter by Status
                </div>
                {[
                  { id: 'ALL', label: 'All Statuses', dot: 'bg-neutral-400' },
                  { id: 'PENDING', label: 'Pending Tickets', dot: 'bg-amber-500' },
                  { id: 'RESOLVED', label: 'Resolved', dot: 'bg-emerald-500' },
                  { id: 'REJECTED', label: 'Rejected', dot: 'bg-rose-500' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.id);
                      setOpenDropdown(null);
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
                    {statusFilter === opt.id && <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin / Sub-Admin Filter Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === 'admin' ? null : 'admin');
              }}
              className={`w-full sm:w-auto px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs ${
                selectedAdmin !== 'ALL'
                  ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
                  : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate max-w-[140px]">
                  {selectedAdmin === 'ALL'
                    ? 'All Admins'
                    : (allCreators.find(c => String(c.id) === String(selectedAdmin))?.name || 'Selected Admin')}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'admin' ? 'rotate-180 text-black' : 'text-neutral-400'}`} />
            </button>

            {openDropdown === 'admin' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 min-w-[220px] max-w-sm animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1 flex items-center justify-between">
                  <span>Admin / Sub-Admin</span>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {/* All Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAdmin('ALL');
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                      selectedAdmin === 'ALL'
                        ? 'bg-orange-50 font-bold text-[#f96b02]'
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span className="font-bold">All Admins & Sub-Admins</span>
                    {selectedAdmin === 'ALL' && <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />}
                  </button>

                  {/* Only Admin & Sub-Admin Names */}
                  {allCreators.map((creator) => (
                    <button
                      key={creator.id}
                      type="button"
                      onClick={() => {
                        setSelectedAdmin(creator.id);
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                        String(selectedAdmin) === String(creator.id)
                          ? 'bg-orange-50 font-bold text-[#f96b02]'
                          : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate font-semibold">{creator.name}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
                          creator.role === 'ADMIN' ? 'bg-neutral-900 text-white' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {creator.role === 'ADMIN' ? 'Main Admin' : 'Sub-Admin'}
                        </span>
                      </div>
                      {String(selectedAdmin) === String(creator.id) && (
                        <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reset Filter Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 border border-red-200 cursor-pointer shadow-2xs"
              title="Reset all filters"
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
