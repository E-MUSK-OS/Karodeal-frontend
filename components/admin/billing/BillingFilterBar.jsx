'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Calendar, ChevronDown, Check, RotateCcw, Download, ShieldCheck, Filter } from 'lucide-react';
import Button from '@/components/common/Button';

export default function BillingFilterBar({
  searchQuery,
  setSearchQuery,
  period,
  setPeriod,
  claimStatus = 'APPROVED',
  setClaimStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  subAdminId,
  setSubAdminId,
  subAdmins = [],
  isMainAdmin = false,
  lastUpdated,
  onResetFilters,
  onExportExcel,
  onManualRefresh
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

  const periodOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const claimStatusOptions = [
    { id: 'APPROVED', label: 'Approved Claims' },
    { id: 'ALL', label: 'All Tickets (Inc. Pending)' },
    { id: 'PENDING', label: 'Pending Tickets Only' },
  ];

  const currentPeriodLabel = periodOptions.find(p => p.id === period)?.label || 'All Time';
  const currentClaimStatusLabel = claimStatusOptions.find(c => c.id === claimStatus)?.label || 'Approved Claims';
  const currentSubAdminName = subAdmins.find(s => s.id === subAdminId)?.name || 'All Sub-Admins';

  const hasActiveFilters = Boolean(
    searchQuery ||
    period !== 'all' ||
    claimStatus !== 'APPROVED' ||
    (isMainAdmin && subAdminId !== 'ALL') ||
    startDate ||
    endDate
  );

  return (
    <div className="space-y-4 mb-6 pt-3 sm:pt-5">
      {/* Top Header Row with Title, Live Badge and Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-extrabold text-neutral-900">Product Cashback Billing</h3>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </div>
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">
            {isMainAdmin
              ? 'Real-time cashback billing per product for sub-admins with verified claim tickets.'
              : 'Live cashback billing for your products based on verified cashback claim tickets.'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onManualRefresh && (
            <button
              onClick={onManualRefresh}
              type="button"
              className="p-2 text-neutral-500 hover:text-black bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Refresh live billing data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <Button
            onClick={onExportExcel}
            variant="none"
            size="none"
            className="px-4 py-2.5 bg-black hover:bg-[#f96b02] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Filter Bar */}
      <div
        ref={filterBarRef}
        className={`bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 relative transition-all ${
          openDropdown ? 'z-50' : 'z-20'
        }`}
      >
        {/* Search Input (Product Title or Store) */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="Search product title or store..."
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

        {/* Filters Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sub-Admin Switcher Dropdown (Only for Main Admin) */}
          {isMainAdmin && subAdmins.length > 0 && (
            <div className="relative flex-1 sm:flex-initial">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'subadmin' ? null : 'subadmin');
                }}
                className={`w-full sm:w-auto px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs ${
                  subAdminId !== 'ALL'
                    ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
                    : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="truncate max-w-[140px]">{currentSubAdminName}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'subadmin' ? 'rotate-180 text-black' : 'text-neutral-400'}`} />
              </button>

              {openDropdown === 'subadmin' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 min-w-[220px] max-w-sm animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                    Filter by Sub-Admin
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSubAdminId('ALL');
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3.5 py-2 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                        subAdminId === 'ALL' ? 'bg-orange-50 font-bold text-[#f96b02]' : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <span>All Sub-Admins</span>
                      {subAdminId === 'ALL' && <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />}
                    </button>
                    {subAdmins.map((admin) => (
                      <button
                        key={admin.id}
                        type="button"
                        onClick={() => {
                          setSubAdminId(admin.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-3.5 py-2 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                          subAdminId === admin.id ? 'bg-orange-50 font-bold text-[#f96b02]' : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate">{admin.name || admin.email}</span>
                        </div>
                        {subAdminId === admin.id && <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Claim Status Selector (Approved, All, Pending) */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === 'claimStatus' ? null : 'claimStatus');
              }}
              className={`w-full sm:w-auto px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs ${
                claimStatus !== 'APPROVED'
                  ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
                  : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate max-w-[140px]">{currentClaimStatusLabel}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'claimStatus' ? 'rotate-180 text-black' : 'text-neutral-400'}`} />
            </button>

            {openDropdown === 'claimStatus' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 min-w-[200px] animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                  Ticket Status
                </div>
                {claimStatusOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setClaimStatus(opt.id);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3.5 py-2 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                      claimStatus === opt.id ? 'bg-orange-50 font-bold text-[#f96b02]' : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {claimStatus === opt.id && <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Period Selector Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === 'period' ? null : 'period');
              }}
              className={`w-full sm:w-auto px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs ${
                period !== 'all'
                  ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
                  : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate max-w-[130px]">{currentPeriodLabel}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'period' ? 'rotate-180 text-black' : 'text-neutral-400'}`} />
            </button>

            {openDropdown === 'period' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 min-w-[180px] animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                  Time Period
                </div>
                {periodOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setPeriod(opt.id);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3.5 py-2 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                      period === opt.id ? 'bg-orange-50 font-bold text-[#f96b02]' : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {period === opt.id && <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Date Pickers (visible when period is 'custom') */}
          {period === 'custom' && (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                title="Start Date"
              />
              <span className="text-xs text-neutral-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                title="End Date"
              />
            </div>
          )}

          {/* Reset Filters Button */}
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
