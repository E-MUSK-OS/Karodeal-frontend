'use client';

import { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/common/PageLoader';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  X,
  ShieldCheck,
  ChevronDown,
  Check,
  RotateCcw,
  Calendar,
  Clock,
  Users,
  Copy,
  CheckCheck,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Layers
} from 'lucide-react';
import { buildDeduplicatedCreators, matchesCreatorFilter } from '@/lib/adminCreators';
import { cleanProductTitle } from '@/lib/titleSanitizer';

// Timezone-aware date helpers for Asia/Kolkata (IST)
function getKolkataDateKey(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  } catch (e) {
    return '';
  }
}

function formatKolkataDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return '—';
  }
}

function formatKolkataTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return '—';
  }
}

export default function ProductClicksPage() {
  const router = useRouter();
  const [clicks, setClicks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userRole, setUserRole] = useState('ADMIN');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedAdmin, setSelectedAdmin] = useState('ALL');
  const [adminUsersList, setAdminUsersList] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [periodFilter, setPeriodFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'YESTERDAY' | '7DAYS' | '30DAYS' | 'CUSTOM'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const filterBarRef = useRef(null);

  // Reference date keys in Asia/Kolkata
  const todayKey = useMemo(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }), []);
  const yesterdayKey = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return y.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  }, []);
  const last7DaysKey = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  }, []);
  const last30DaysKey = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  }, []);

  useEffect(() => {
    fetchClicks();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchClicks = async () => {
    try {
      setIsRefreshing(true);
      const adminStr = localStorage.getItem('adminUser');
      if (!adminStr) {
        router.push('/admin/login');
        return;
      }
      
      const adminUser = JSON.parse(adminStr);
      setUserRole(adminUser.role || 'ADMIN');
      const token = adminUser.token;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
      const res = await fetch(`${apiUrl}/admin/clicks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setClicks(Array.isArray(data) ? data : []);
      } else {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('adminUser');
          router.push('/admin/login');
        }
      }

      // Fetch admin & sub-admin users list from /auth if ADMIN
      if (adminUser.role === 'ADMIN') {
        try {
          const usersRes = await fetch(`${apiUrl}/auth`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (usersRes.ok) {
            const uData = await usersRes.json();
            const allUsers = Array.isArray(uData) ? uData : uData.users || [];
            const adminUsers = allUsers.filter(u => u.role === 'ADMIN' || u.role === 'SUB_ADMIN');
            setAdminUsersList(adminUsers);
          }
        } catch (err) {
          console.error('Failed to load admin users', err);
        }
      }
    } catch (error) {
      console.error('Failed to fetch clicks:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleAdminSelect = (adminId) => {
    setSelectedAdmin(adminId);
    setOpenDropdown(false);
    setCurrentPage(1);
  };

  const handlePeriodSelect = (period) => {
    setPeriodFilter(period);
    setCurrentPage(1);
    if (period !== 'CUSTOM') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedAdmin('ALL');
    setPeriodFilter('ALL');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handleCopyIp = (ip, e) => {
    e.stopPropagation();
    if (!ip) return;
    try {
      navigator.clipboard.writeText(ip);
      setCopiedId(ip);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {}
  };

  // Build the list of admins/sub-admins for the dropdown filter
  const allCreators = useMemo(() => {
    let currentAdmin = null;
    try {
      const adminStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
      if (adminStr) currentAdmin = JSON.parse(adminStr);
    } catch (e) {}

    return buildDeduplicatedCreators({
      currentAdmin,
      adminUsersList,
      items: clicks,
      getItemCreator: (c) => c.product?.createdBy,
      getItemCreatorId: (c) => c.product?.createdById,
    });
  }, [adminUsersList, clicks]);

  // Scoped clicks based on Admin selection and calculate summary numbers
  const {
    adminScopedClicks,
    totalCount,
    todayCount,
    yesterdayCount,
    last7DaysCount,
    last30DaysCount,
    uniqueClickersCount,
    dateWiseCountMap
  } = useMemo(() => {
    const scoped = clicks.filter((click) => {
      return (
        userRole !== 'ADMIN' ||
        selectedAdmin === 'ALL' ||
        matchesCreatorFilter(click.product?.createdById, selectedAdmin, allCreators)
      );
    });

    let today = 0;
    let yesterday = 0;
    let last7 = 0;
    let last30 = 0;
    const unique = new Set();
    const dateCounts = {};

    scoped.forEach((click) => {
      const dateKey = getKolkataDateKey(click.createdAt);
      if (dateKey) {
        dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
        if (dateKey === todayKey) today++;
        if (dateKey === yesterdayKey) yesterday++;
        if (dateKey >= last7DaysKey && dateKey <= todayKey) last7++;
        if (dateKey >= last30DaysKey && dateKey <= todayKey) last30++;
      }
      const identifier = click.userId || click.ipAddress;
      if (identifier) unique.add(identifier);
    });

    return {
      adminScopedClicks: scoped,
      totalCount: scoped.length,
      todayCount: today,
      yesterdayCount: yesterday,
      last7DaysCount: last7,
      last30DaysCount: last30,
      uniqueClickersCount: unique.size,
      dateWiseCountMap: dateCounts
    };
  }, [clicks, userRole, selectedAdmin, allCreators, todayKey, yesterdayKey, last7DaysKey, last30DaysKey]);

  // Filter clicks by period preset, custom date range, and search query
  const filteredClicks = useMemo(() => {
    return adminScopedClicks.filter((click) => {
      const dateKey = getKolkataDateKey(click.createdAt);

      // Period filter
      if (periodFilter === 'TODAY') {
        if (dateKey !== todayKey) return false;
      } else if (periodFilter === 'YESTERDAY') {
        if (dateKey !== yesterdayKey) return false;
      } else if (periodFilter === '7DAYS') {
        if (dateKey < last7DaysKey || dateKey > todayKey) return false;
      } else if (periodFilter === '30DAYS') {
        if (dateKey < last30DaysKey || dateKey > todayKey) return false;
      } else if (periodFilter === 'CUSTOM') {
        if (startDate && dateKey < startDate) return false;
        if (endDate && dateKey > endDate) return false;
      }

      // Search Filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const productTitle = click.product?.title?.toLowerCase() || '';
      const storeName = click.product?.storeRel?.name?.toLowerCase() || '';
      const userName = click.user?.name?.toLowerCase() || '';
      const userEmail = click.user?.email?.toLowerCase() || '';
      const ipAddress = click.ipAddress?.toLowerCase() || '';
      const creatorName = click.product?.createdBy?.name?.toLowerCase() || '';
      const formattedDate = formatKolkataDate(click.createdAt).toLowerCase();

      return (
        productTitle.includes(term) ||
        storeName.includes(term) ||
        userName.includes(term) ||
        userEmail.includes(term) ||
        ipAddress.includes(term) ||
        creatorName.includes(term) ||
        formattedDate.includes(term) ||
        (dateKey && dateKey.includes(term))
      );
    });
  }, [adminScopedClicks, periodFilter, startDate, endDate, searchTerm, todayKey, yesterdayKey, last7DaysKey, last30DaysKey]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredClicks.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClicks = filteredClicks.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) return <PageLoader />;

  const isFilterActive =
    searchTerm !== '' ||
    periodFilter !== 'ALL' ||
    (userRole === 'ADMIN' && selectedAdmin !== 'ALL') ||
    startDate !== '' ||
    endDate !== '';

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-black text-neutral-900 text-lg sm:text-xl flex items-center gap-2">
                <MousePointerClick className="w-5 h-5 text-neutral-800" />
                Product Click Tracking & Analytics
              </h2>
              {isFilterActive ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Showing {filteredClicks.length} of {totalCount} Clicks
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                  {totalCount} Total Clicks Recorded
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Track user click activity on deals with exact IST dates, times, stores, and visitor IP attribution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchClicks}
              disabled={isRefreshing}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
              title="Refresh click data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Stat Number Cards (Today, Yesterday, 7 Days, Unique Visitors) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-5 border-t border-neutral-100">
          {/* Card 1: Total Clicks */}
          <div
            onClick={() => handlePeriodSelect('ALL')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              periodFilter === 'ALL'
                ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-100 shadow-sm'
                : 'bg-neutral-50/80 hover:bg-neutral-100/70 border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Total Clicks
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <MousePointerClick className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
              {totalCount}
            </div>
            <div className="text-xs text-neutral-500 font-medium mt-0.5">
              All time clicks recorded
            </div>
          </div>

          {/* Card 2: Today's Clicks */}
          <div
            onClick={() => handlePeriodSelect('TODAY')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              periodFilter === 'TODAY'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100 shadow-sm'
                : 'bg-neutral-50/80 hover:bg-neutral-100/70 border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Today's Clicks
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1">
              {todayCount}
            </div>
            <div className="text-xs text-emerald-700 font-medium mt-0.5">
              Live clicks today ({formatKolkataDate(new Date())})
            </div>
          </div>

          {/* Card 3: Yesterday's Clicks */}
          <div
            onClick={() => handlePeriodSelect('YESTERDAY')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              periodFilter === 'YESTERDAY'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100 shadow-sm'
                : 'bg-neutral-50/80 hover:bg-neutral-100/70 border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Yesterday's Clicks
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
              {yesterdayCount}
            </div>
            <div className="text-xs text-neutral-500 font-medium mt-0.5">
              Previous full day clicks
            </div>
          </div>

          {/* Card 4: Unique Visitors / IPs */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Unique Clickers
              </span>
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
              {uniqueClickersCount}
            </div>
            <div className="text-xs text-neutral-500 font-medium mt-0.5">
              Distinct users & IP addresses
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Table & Filters Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        {/* Date Presets, Search & Admin Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 space-y-3.5 bg-neutral-50/50">
          {/* Quick Date Presets */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-neutral-500 mr-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date Filter:
              </span>
              {[
                { id: 'ALL', label: 'All Time', count: totalCount },
                { id: 'TODAY', label: 'Today', count: todayCount },
                { id: 'YESTERDAY', label: 'Yesterday', count: yesterdayCount },
                { id: '7DAYS', label: 'Last 7 Days', count: last7DaysCount },
                { id: '30DAYS', label: 'Last 30 Days', count: last30DaysCount },
                { id: 'CUSTOM', label: 'Custom Range', count: null },
              ].map((preset) => {
                const isActive = periodFilter === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePeriodSelect(preset.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {preset.count !== null && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {preset.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Rows Per Page Selector */}
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="font-semibold">Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-neutral-200 rounded-lg px-2 py-1 text-xs font-bold text-neutral-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Custom Date Pickers (Shown if CUSTOM selected) */}
          {periodFilter === 'CUSTOM' && (
            <div className="p-3 bg-white rounded-xl border border-neutral-200 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150">
              <span className="font-bold text-neutral-700">Select Date Range:</span>
              <div className="flex items-center gap-2">
                <label className="text-neutral-500 font-medium">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-neutral-500 font-medium">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Clear Range
                </button>
              )}
            </div>
          )}

          {/* Search Bar & Admin Dropdown */}
          <div ref={filterBarRef} className="flex flex-wrap items-center gap-2.5">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by product, store, user, IP, or date..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Admin Filter Dropdown (Main Admin only) */}
            {userRole === 'ADMIN' && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs ${
                    selectedAdmin !== 'ALL'
                      ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
                      : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="truncate max-w-[130px]">
                      {selectedAdmin === 'ALL'
                        ? 'All Admins'
                        : (allCreators.find(c => String(c.id) === String(selectedAdmin))?.name || 'Selected Admin')}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown ? 'rotate-180 text-black' : 'text-neutral-400'}`} />
                </button>

                {openDropdown && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 min-w-[220px] max-w-sm animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                      Filter by Deal Creator
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => handleAdminSelect('ALL')}
                        className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                          selectedAdmin === 'ALL'
                            ? 'bg-orange-50 font-bold text-[#f96b02]'
                            : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <span className="font-bold">All Admins & Sub-Admins</span>
                        {selectedAdmin === 'ALL' && <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />}
                      </button>

                      {allCreators.map((creator) => (
                        <button
                          key={creator.id}
                          type="button"
                          onClick={() => handleAdminSelect(creator.id)}
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
            )}
          </div>
        </div>

        {/* 4. Table View with Date-Wise Group Separator Headers */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5 w-16 text-center">#</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5">Date & Time (IST)</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5">Product Name</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5">Store</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5">User</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5">Email / IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {currentClicks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-neutral-500">
                    <MousePointerClick className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <div className="font-semibold text-neutral-700">No clicks found</div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {isFilterActive
                        ? 'Try resetting your search or date filter criteria.'
                        : 'No product clicks recorded in the system yet.'}
                    </div>
                    {isFilterActive && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-3 px-3.5 py-1.5 text-xs font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                currentClicks.map((click, index) => {
                  const globalIndex = startIndex + index + 1;
                  const currentDateKey = getKolkataDateKey(click.createdAt);
                  const prevDateKey = index > 0 ? getKolkataDateKey(currentClicks[index - 1].createdAt) : null;
                  const isNewDateGroup = currentDateKey !== prevDateKey;
                  const isToday = currentDateKey === todayKey;
                  const isYesterday = currentDateKey === yesterdayKey;
                  const clicksOnThisDate = dateWiseCountMap[currentDateKey] || 0;

                  return (
                    <Fragment key={click.id || index}>
                      {/* Date Separator Header Banner when date changes */}
                      {isNewDateGroup && (
                        <tr className="bg-neutral-100/90 border-y border-neutral-200">
                          <td colSpan="6" className="px-4 py-2 sm:px-6">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                                <span className="text-xs font-black text-neutral-900">
                                  {isToday
                                    ? 'Today'
                                    : isYesterday
                                    ? 'Yesterday'
                                    : formatKolkataDate(click.createdAt)}
                                </span>
                                <span className="text-xs text-neutral-500 font-medium">
                                  ({formatKolkataDate(click.createdAt)})
                                </span>
                                {isToday && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active Today
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-bold text-neutral-700 bg-white px-2.5 py-0.5 rounded-full border border-neutral-200 shadow-2xs">
                                {clicksOnThisDate} {clicksOnThisDate === 1 ? 'click' : 'clicks'} on this date
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Click Data Row */}
                      <tr className="hover:bg-neutral-50/80 transition-colors">
                        {/* 1. Global Serial Number (#) */}
                        <td className="px-4 py-3 sm:px-6 sm:py-3.5 text-center">
                          <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 rounded-md bg-neutral-100 text-neutral-700 font-bold text-xs">
                            {globalIndex}
                          </span>
                        </td>

                        {/* 2. Date & Time (IST) */}
                        <td className="px-4 py-3 sm:px-6 sm:py-3.5">
                          <div className="font-bold text-neutral-900 text-xs sm:text-sm">
                            {formatKolkataTime(click.createdAt)}
                          </div>
                          <div className="text-[11px] text-neutral-400 font-medium">
                            {formatKolkataDate(click.createdAt)}
                          </div>
                        </td>

                        {/* 3. Product Name */}
                        <td className="px-4 py-3 sm:px-6 sm:py-3.5 max-w-[220px] sm:max-w-[320px]" title={click.product?.title}>
                          <div className="truncate font-semibold text-neutral-900 text-xs sm:text-sm">
                            {cleanProductTitle(click.product?.title || 'Unknown Product')}
                          </div>
                          {userRole === 'ADMIN' && click.product?.createdBy && (
                            <div className="text-[10px] text-neutral-400 font-normal mt-0.5">
                              Added by: <span className="font-semibold text-neutral-600">{click.product.createdBy.name || click.product.createdBy.email}</span>
                            </div>
                          )}
                        </td>

                        {/* 4. Store */}
                        <td className="px-4 py-3 sm:px-6 sm:py-3.5 text-neutral-600">
                          {click.product?.storeRel?.name ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                              {click.product.storeRel.name}
                            </span>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </td>

                        {/* 5. User */}
                        <td className="px-4 py-3 sm:px-6 sm:py-3.5">
                          {click.userId ? (
                            <span className="font-bold text-neutral-900 text-xs inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              {click.user?.name || 'Registered User'}
                            </span>
                          ) : (
                            <span className="text-neutral-400 italic text-xs">
                              Guest User
                            </span>
                          )}
                        </td>

                        {/* 6. Email / IP Address with 1-click Copy */}
                        <td className="px-4 py-3 sm:px-6 sm:py-3.5">
                          {click.userId ? (
                            <span className="text-neutral-700 text-xs font-medium">
                              {click.user?.email || '—'}
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="font-mono text-xs text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 font-medium">
                                {click.ipAddress || 'Unknown IP'}
                              </span>
                              {click.ipAddress && (
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyIp(click.ipAddress, e)}
                                  className="p-1 rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                                  title="Copy IP Address"
                                >
                                  {copiedId === click.ipAddress ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Controls */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="text-xs sm:text-sm text-neutral-500 font-medium text-center sm:text-left">
            {filteredClicks.length > 0 ? (
              <>
                Showing <span className="font-bold text-neutral-900">{startIndex + 1}</span> to{' '}
                <span className="font-bold text-neutral-900">
                  {Math.min(startIndex + itemsPerPage, filteredClicks.length)}
                </span>{' '}
                of <span className="font-bold text-neutral-900">{filteredClicks.length}</span> entries
                <span className="ml-2 text-neutral-400 font-normal hidden sm:inline">
                  ({itemsPerPage} per page)
                </span>
              </>
            ) : (
              'Showing 0 entries'
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 max-w-full overflow-x-auto py-0.5">
              {/* Prev Button */}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 sm:min-w-[32px] sm:h-8 sm:px-2 flex items-center justify-center text-xs font-bold rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-neutral-900 text-white shadow-2xs'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                title="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
