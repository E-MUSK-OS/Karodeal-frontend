'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/common/PageLoader';
import { getSocket } from '@/lib/socket';
import {
  Activity,
  Search,
  RefreshCw,
  Clock,
  Eye,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Radio,
  Timer,
  ShieldCheck
} from 'lucide-react';

function formatKolkataTime(dateStr, includeSeconds = false) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: true
    });
  } catch (e) {
    return '—';
  }
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 15) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  } catch (e) {
    return '—';
  }
}

function formatDuration(seconds = 0) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const remS = s % 60;
  if (m < 60) {
    return remS > 0 ? `${m}m ${remS}s` : `${m}m`;
  }
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}h ${remM}m`;
}

function getTrafficBadge(source, medium, campaign) {
  const s = source || 'Direct / Chrome Search';
  const m = (medium || 'direct').toLowerCase();

  // Paid Ads / Campaigns
  if (m === 'cpc' || m === 'paid_social' || m === 'ads' || m === 'ppc' || s.toLowerCase().includes('ads')) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/90 shadow-2xs"
        title={`Paid Campaign: ${campaign || s}`}
      >
        <span>🎯</span>
        <span className="truncate max-w-[140px]">{s}</span>
        {campaign ? (
          <span className="text-[9px] bg-amber-200/90 text-amber-900 font-black px-1 rounded">
            Ad: {campaign}
          </span>
        ) : (
          <span className="text-[9px] bg-amber-200/90 text-amber-900 font-black px-1 rounded">
            Paid Ad
          </span>
        )}
      </span>
    );
  }

  // Google & Search Engines
  if (s.toLowerCase().includes('google') || s.toLowerCase().includes('search') || m === 'organic') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/90 shadow-2xs"
        title="Organic Search Engine"
      >
        <span>🔎</span>
        <span className="truncate max-w-[140px]">{s}</span>
      </span>
    );
  }

  // WhatsApp (Dedicated emerald green badge for WhatsApp Marketing / Shares)
  if (/whatsapp/i.test(s) || /whatsapp/i.test(m)) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-2xs"
        title={`WhatsApp: ${campaign || s}`}
      >
        <span>📱</span>
        <span className="truncate max-w-[120px]">WhatsApp</span>
        {campaign && (
          <span className="text-[9px] bg-emerald-200/90 text-emerald-950 font-black px-1 rounded truncate max-w-[110px]" title={campaign}>
            {campaign}
          </span>
        )}
      </span>
    );
  }

  // Social Media (Instagram, Facebook, etc.)
  if (m === 'social' || /instagram|facebook|youtube|twitter|x\.com|linkedin|pinterest|reddit/i.test(s)) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200/90 shadow-2xs"
        title="Social Media Referral"
      >
        <span>📱</span>
        <span className="truncate max-w-[140px]">{s}</span>
        {campaign && (
          <span className="text-[9px] bg-purple-200/90 text-purple-950 font-black px-1 rounded truncate max-w-[100px]">
            {campaign}
          </span>
        )}
      </span>
    );
  }

  // External Referral
  if (m === 'referral') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/90 shadow-2xs"
        title="External Referral Website"
      >
        <span>🔗</span>
        <span className="truncate max-w-[140px]">{s}</span>
      </span>
    );
  }

  // Direct / Chrome Search
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200 shadow-2xs"
      title="Direct URL / Chrome Search"
    >
      <span>🌐</span>
      <span className="truncate max-w-[140px]">{s}</span>
    </span>
  );
}

export default function VisitorAnalyticsPage() {
  const router = useRouter();

  // Auth & Roles
  const [userRole, setUserRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Data & State
  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState({
    liveVisitorsCount: 0,
    totalVisitorsCount: 0,
    totalPageVisitsCount: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'live'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'INACTIVE', 'ENDED'
  const [sourceFilter, setSourceFilter] = useState('ALL'); // 'ALL', 'DIRECT', 'SEARCH', 'SOCIAL', 'ADS'
  const [pagePathFilter, setPagePathFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [periodPreset, setPeriodPreset] = useState('ALL');
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);

  // Quick Period Presets (Today, Yesterday, Last 7 Days, Last 30 Days)
  const handlePeriodChange = (val) => {
    setPeriodPreset(val);
    const now = new Date();
    if (val === 'TODAY') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (val === 'YESTERDAY') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (val === '7DAYS') {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (val === '30DAYS') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (val === 'ALL') {
      setStartDate('');
      setEndDate('');
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    setPeriodPreset('CUSTOM');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEndDateChange = (val) => {
    setEndDate(val);
    setPeriodPreset('CUSTOM');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Realtime Socket.IO Connection & Sync State
  const [socketConnected, setSocketConnected] = useState(false);
  const debounceTimerRef = useRef(null);

  // Expandable Visitor Detail Drawer/Modal
  const [selectedVisitorId, setSelectedVisitorId] = useState(null);
  const [visitorDetail, setVisitorDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState(null);

  // 1. Check Main-Admin Authorization
  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        const adminStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
        if (!adminStr) {
          router.push('/admin/login');
          return;
        }
        const adminUser = JSON.parse(adminStr);
        const role = adminUser.role || 'USER';

        // Strictly Main Admin only ("aa only main admin hoy tane panal ma ja show thavu pade")
        if (role !== 'ADMIN') {
          router.replace('/admin/dashboard');
          return;
        }

        if (isMounted) {
          setUserRole(role);
          setIsAuthorized(true);
        }
      } catch (e) {
        router.push('/admin/login');
      }
    };

    verifyAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // 2. Fetch Visitor List
  const fetchVisitors = useCallback(async (isSilent = false) => {
    setIsRefreshing(true);

    try {
      const adminStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
      if (!adminStr) return;
      const adminUser = JSON.parse(adminStr);

      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (activeTab === 'live') params.append('tab', 'live');
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (pagePathFilter.trim()) params.append('pagePath', pagePathFilter.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (sourceFilter !== 'ALL') params.append('source', sourceFilter);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
      const res = await fetch(`${apiUrl}/admin/analytics/visitors?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${adminUser.token}`
        },
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        setVisitors(data.visitors || []);
        if (data.pagination) setPagination(data.pagination);
        if (data.stats) setStats(data.stats);
      } else if (res.status === 401 || res.status === 403) {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch visitor analytics:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [pagination.page, pagination.limit, activeTab, statusFilter, sourceFilter, searchTerm, pagePathFilter, startDate, endDate, router]);

  // Initial and reactive data fetch
  useEffect(() => {
    if (!isAuthorized) return;
    let isCancelled = false;

    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchVisitors(true);
      if (!isCancelled) {
        setIsLoading(false);
      }
    };

    loadInitialData();
    return () => {
      isCancelled = true;
    };
  }, [isAuthorized, fetchVisitors]);

  // 3. Fetch Visitor Detail
  const openVisitorDetail = useCallback(async (visitorId) => {
    setSelectedVisitorId(visitorId);
    setLoadingDetail(true);
    try {
      const adminStr = localStorage.getItem('adminUser');
      if (!adminStr) return;
      const adminUser = JSON.parse(adminStr);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
      const res = await fetch(`${apiUrl}/admin/analytics/visitors/${visitorId}`, {
        headers: { 'Authorization': `Bearer ${adminUser.token}` },
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        setVisitorDetail(data);
      }
    } catch (err) {
      console.error('Failed to load visitor details', err);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // 4. Realtime Socket.IO Event Listener
  useEffect(() => {
    if (!isAuthorized) return;

    const socket = getSocket();
    if (!socket) return;

    const handleConnect = () => {
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleAnalyticsChange = (data) => {
      // Debounce updates by 500ms to avoid thrashing during rapid events
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        fetchVisitors(true);
        // If drawer is currently open for the visitor whose data changed, update detail
        if (selectedVisitorId && data?.payload?.visitorId === selectedVisitorId) {
          openVisitorDetail(selectedVisitorId);
        }
      }, 500);
    };

    queueMicrotask(() => {
      if (socket.connected) {
        setSocketConnected(true);
      }
    });

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('analytics:changed', handleAnalyticsChange);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('analytics:changed', handleAnalyticsChange);
    };
  }, [isAuthorized, fetchVisitors, selectedVisitorId, openVisitorDetail]);

  // 5. Fallback Live Auto-Sync (Runs every 10 seconds when running without WebSockets, e.g. on Vercel Serverless)
  useEffect(() => {
    if (!isAuthorized || socketConnected) return;

    const interval = setInterval(() => {
      fetchVisitors(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthorized, socketConnected, fetchVisitors]);

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setSourceFilter('ALL');
    setPagePathFilter('');
    setStartDate('');
    setEndDate('');
    setPeriodPreset('ALL');
    setActiveTab('all');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  if (!isAuthorized) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12 w-full">
      {/* Top Welcome Header - Matching MainAdminDashboard design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider bg-black text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Main Admin
            </span>
            <span className="text-xs font-bold text-neutral-400">Live Traffic & Audience Tracking</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Visitor Time Tracking & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Real-time tracking of anonymous visitors, live presence, page visits, and active engagement duration.
          </p>
        </div>

        {/* Realtime Live Status Badge & Manual Refresh */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-2xs select-none bg-emerald-50 text-emerald-800 border-emerald-200"
            title={socketConnected ? 'Real-time WebSocket connected via Socket.IO' : 'Live Auto-Sync active (syncs every 10 seconds)'}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>{socketConnected ? 'Live Realtime (Socket.IO)' : 'Live Auto-Sync (10s)'}</span>
          </div>

          <button
            type="button"
            onClick={() => fetchVisitors(false)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
            title="Manual refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-5">
        {/* 1. Live Active Visitors */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Visitors</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
              {stats.liveVisitorsCount}
            </div>
            <div className="text-xs text-neutral-500 font-medium mt-1">
              Currently active on site
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6" />
          </div>
        </div>

        {/* 2. Total Unique Visitors */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Total Visitors
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
              {stats.totalVisitorsCount}
            </div>
            <div className="text-xs text-neutral-500 font-medium mt-1">
              Unique browser profiles
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        {/* 3. Total Page Visits */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Total Page Visits
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
              {stats.totalPageVisitsCount}
            </div>
            <div className="text-xs text-neutral-500 font-medium mt-1">
              Route transitions tracked
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* 4. Timezone & Tracking Reference */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider">
              Timezone (IST)
            </div>
            <div className="text-xl sm:text-2xl font-black text-neutral-900 mt-1 truncate">
              Asia/Kolkata
            </div>
            <div className="text-xs text-neutral-500 font-medium mt-1">
              Indian Standard Time
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Modern Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
        {/* Row 1: Live/All Tabs + Search Box */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl self-start">
            <button
              type="button"
              onClick={() => { setActiveTab('all'); setPagination((p) => ({ ...p, page: 1 })); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              All Visitors ({stats.totalVisitorsCount})
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('live'); setPagination((p) => ({ ...p, page: 1 })); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Now ({stats.liveVisitorsCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Visitor ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-500 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Secondary Filters (Path, Status, Date Range, Reset) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Page Path Filter */}
          <div className="relative flex-1 min-w-[200px]">
            <Globe className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter Page (e.g. /deals, /stores)..."
              value={pagePathFilter}
              onChange={(e) => setPagePathFilter(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-500 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
            />
            {pagePathFilter && (
              <button
                type="button"
                onClick={() => setPagePathFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 p-0.5 cursor-pointer"
                title="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown Filter */}
          <div className="w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-neutral-900 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">🟢 Active (Live Engaged)</option>
              <option value="INACTIVE">🟡 Inactive (Idle &gt; 60s)</option>
              <option value="ENDED">⚪ Ended (Left Page)</option>
            </select>
          </div>

          {/* Traffic Source Filter */}
          <div className="w-full sm:w-48">
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full px-3 py-2 text-xs font-semibold text-neutral-900 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all cursor-pointer shadow-2xs"
            >
              <option value="ALL">🌐 All Traffic Sources</option>
              <option value="DIRECT">🔍 Direct / Chrome Search</option>
              <option value="SEARCH">🔎 Google Search (Organic)</option>
              <option value="SOCIAL">📱 Social Media (IG, FB...)</option>
              <option value="ADS">🎯 Paid Ads (Google/Meta)</option>
            </select>
          </div>

          {/* Date Presets Dropdown */}
          <div className="w-full sm:w-36">
            <select
              value={periodPreset}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-neutral-900 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all cursor-pointer shadow-2xs"
            >
              <option value="ALL">📅 All Time</option>
              <option value="TODAY">⚡ Today</option>
              <option value="YESTERDAY">⏮ Yesterday</option>
              <option value="7DAYS">📊 Last 7 Days</option>
              <option value="30DAYS">🗓 Last 30 Days</option>
              <option value="CUSTOM">🎯 Custom Range</option>
            </select>
          </div>

          {/* From Date Picker Box */}
          <div
            onClick={() => {
              try {
                startDateInputRef.current?.showPicker();
              } catch {
                startDateInputRef.current?.focus();
              }
            }}
            className="flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-300 hover:border-neutral-400 rounded-xl px-3 py-1.5 shadow-2xs cursor-pointer transition-all"
            title="Click to select Start Date"
          >
            <Calendar className="w-4 h-4 text-neutral-500 shrink-0 pointer-events-none" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-500 font-bold text-[11px] pointer-events-none uppercase">From:</span>
              <input
                ref={startDateInputRef}
                type="date"
                value={startDate}
                style={{ colorScheme: 'light' }}
                onChange={(e) => handleStartDateChange(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    e.currentTarget.showPicker();
                  } catch {}
                }}
                className="bg-transparent text-neutral-900 font-semibold text-xs focus:outline-none cursor-pointer"
              />
            </div>
            {startDate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartDateChange('');
                }}
                className="text-neutral-400 hover:text-neutral-800 p-0.5 rounded cursor-pointer transition-colors"
                title="Clear From date"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* To Date Picker Box */}
          <div
            onClick={() => {
              try {
                endDateInputRef.current?.showPicker();
              } catch {
                endDateInputRef.current?.focus();
              }
            }}
            className="flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-300 hover:border-neutral-400 rounded-xl px-3 py-1.5 shadow-2xs cursor-pointer transition-all"
            title="Click to select End Date"
          >
            <Calendar className="w-4 h-4 text-neutral-500 shrink-0 pointer-events-none" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-500 font-bold text-[11px] pointer-events-none uppercase">To:</span>
              <input
                ref={endDateInputRef}
                type="date"
                value={endDate}
                style={{ colorScheme: 'light' }}
                onChange={(e) => handleEndDateChange(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    e.currentTarget.showPicker();
                  } catch {}
                }}
                className="bg-transparent text-neutral-900 font-semibold text-xs focus:outline-none cursor-pointer"
              />
            </div>
            {endDate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEndDateChange('');
                }}
                className="text-neutral-400 hover:text-neutral-800 p-0.5 rounded cursor-pointer transition-colors"
                title="Clear To date"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reset Filters Button */}
          {(searchTerm || statusFilter !== 'ALL' || sourceFilter !== 'ALL' || pagePathFilter || startDate || endDate || periodPreset !== 'ALL') && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ml-auto sm:ml-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            <span className="text-xs font-semibold text-neutral-500">Loading visitor sessions...</span>
          </div>
        ) : visitors.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto text-neutral-400">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">No visitor records found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {activeTab === 'live'
                ? 'There are currently no active visitors on the site. Switch to "All Visitors" to view historical visits.'
                : 'No visits match your filter criteria. Try resetting search filters or opening Karodeal.in in an incognito tab to test tracking.'}
            </p>
            {(searchTerm || statusFilter !== 'ALL' || pagePathFilter || startDate || endDate) && (
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5">Visitor & Source</th>
                  <th className="py-3 px-3.5">Current / Last Page</th>
                  <th className="py-3 px-3.5">Visit Timing</th>
                  <th className="py-3 px-3.5">Page Duration</th>
                  <th className="py-3 px-3.5">Active Time (Total Site)</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {visitors.map((v) => {
                  const p = v.currentOrLastPage;
                  const isLive = v.isLive;
                  const isCopied = copiedId === v.visitorId;

                  // Device Icon
                  const DeviceIcon = v.deviceType === 'Mobile' ? Smartphone : v.deviceType === 'Tablet' ? Tablet : Monitor;

                  // Calculate total site seconds
                  const totalSiteSec = Math.max(
                    Number(v.totalActiveSeconds) || 0,
                    Number(p?.activeSeconds) || 0,
                    (v.totalVisits <= 1 && p?.status === 'ENDED') ? (Number(p?.durationSeconds) || 0) : 0
                  );

                  return (
                    <tr
                      key={v.visitorId}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        isLive ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* 1. Visitor & Source */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => copyToClipboard(v.visitorId, v.visitorId)}
                            title="Click to copy full Visitor ID"
                            className="flex items-center gap-1 font-mono font-bold text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer"
                          >
                            <span>{v.visitorId.slice(0, 11)}...</span>
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-neutral-400 hover:text-neutral-700" />
                            )}
                          </button>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          {getTrafficBadge(v.trafficSource, v.trafficMedium, v.utmCampaign)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-neutral-500">
                          <span className="flex items-center gap-1">
                            <DeviceIcon className="w-3 h-3 text-neutral-400" />
                            {v.browser}
                          </span>
                          <span>•</span>
                          <span className="bg-neutral-100 px-1.5 py-0.2 rounded text-neutral-600 font-semibold">
                            {v.totalVisits} {v.totalVisits === 1 ? 'visit' : 'visits'}
                          </span>
                        </div>
                      </td>

                      {/* 2. Current / Last Page */}
                      <td className="py-3 px-3.5 max-w-[200px]">
                        {p ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-neutral-900 truncate" title={p.pageTitle || p.pagePath}>
                              {p.pageTitle || p.pagePath}
                            </div>
                            <div className="text-[11px] font-mono text-neutral-500 truncate" title={p.pagePath}>
                              {p.pagePath}
                            </div>
                          </div>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>

                      {/* 3. Visit Timing (Entry + Exit + Relative) */}
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-neutral-900 text-xs">
                          {formatKolkataTime(p?.enteredAt || v.lastVisitAt)}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-1 flex-wrap">
                          <span className="font-semibold text-neutral-700">{formatRelativeTime(v.lastVisitAt)}</span>
                          <span>•</span>
                          {p ? (
                            p.status === 'ENDED' ? (
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                p.isExactEndTime ? 'bg-neutral-100 text-neutral-700' : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {p.isExactEndTime ? 'Confirmed Exit' : 'Estimated Exit'}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active Now
                              </span>
                            )
                          ) : null}
                        </div>
                      </td>

                      {/* 4. Page Duration */}
                      <td className="py-3 px-3.5 font-mono font-semibold text-neutral-900">
                        {p ? formatDuration(p.durationSeconds) : '0s'}
                      </td>

                      {/* 5. Active Time (Total Time on Website) */}
                      <td className="py-3 px-3.5">
                        <div>
                          <div className="font-mono font-bold text-emerald-700 text-[13px] flex items-center gap-1.5">
                            <Timer className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{formatDuration(totalSiteSec)}</span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-1 py-0.2 rounded">
                              {totalSiteSec}s
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-0.5 font-medium">
                            {v.totalVisits > 1 ? (
                              <span>Total on site • Page: {formatDuration(p?.activeSeconds || 0)}</span>
                            ) : (
                              <span>Total on site</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 6. Status */}
                      <td className="py-3 px-3.5">
                        {v.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            ACTIVE
                          </span>
                        ) : v.status === 'INACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            IDLE
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-600">
                            ENDED
                          </span>
                        )}
                      </td>

                      {/* 7. Actions */}
                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={() => openVisitorDetail(v.visitorId)}
                          title="View complete visitor history & timeline"
                          className="px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 text-xs font-semibold transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>History ({v.totalPageVisits})</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!isLoading && visitors.length > 0 && (
          <div className="p-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <div>
              Showing page <span className="font-bold text-neutral-900">{pagination.page}</span> of{' '}
              <span className="font-bold text-neutral-900">{pagination.totalPages}</span> ({pagination.total} visitors)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="p-2 rounded-lg border border-neutral-200 disabled:opacity-30 hover:bg-neutral-50 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="p-2 rounded-lg border border-neutral-200 disabled:opacity-30 hover:bg-neutral-50 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer / Modal for Visitor History */}
      {selectedVisitorId && (
        <div
          onClick={() => { setSelectedVisitorId(null); setVisitorDetail(null); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 cursor-default"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-neutral-900">Visitor Journey & History</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800 font-bold">
                    Chronological
                  </span>
                </div>
                <p className="text-xs font-mono text-neutral-500 mt-1 break-all select-all">
                  ID: {selectedVisitorId}
                </p>
              </div>

              <button
                onClick={() => { setSelectedVisitorId(null); setVisitorDetail(null); }}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-6">
              {loadingDetail ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-neutral-500">Loading visit history...</span>
                </div>
              ) : visitorDetail ? (
                <>
                  {/* Visitor Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                      <span className="text-[10px] font-bold uppercase text-neutral-500">Total Visits</span>
                      <div className="text-xl font-black text-neutral-900 mt-0.5">
                        {visitorDetail.summary?.totalSessions || 1}
                      </div>
                    </div>
                    <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                      <span className="text-[10px] font-bold uppercase text-neutral-500">Pages Visited</span>
                      <div className="text-xl font-black text-neutral-900 mt-0.5">
                        {visitorDetail.summary?.totalPageVisits || 0}
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                      <span className="text-[10px] font-bold uppercase text-emerald-800">Total Active Time</span>
                      <div className="text-xl font-black text-emerald-700 mt-0.5 flex items-baseline gap-2">
                        <span>{formatDuration(visitorDetail.summary?.totalActiveSeconds || 0)}</span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded">
                          {visitorDetail.summary?.totalActiveSeconds || 0} seconds
                        </span>
                      </div>
                    </div>
                    <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                      <span className="text-[10px] font-bold uppercase text-neutral-500">Total Elapsed</span>
                      <div className="text-xl font-black text-neutral-900 mt-0.5 flex items-baseline gap-2">
                        <span>{formatDuration(visitorDetail.summary?.totalDurationSeconds || 0)}</span>
                        <span className="text-xs font-bold text-neutral-700 bg-neutral-200/80 px-2 py-0.5 rounded">
                          {visitorDetail.summary?.totalDurationSeconds || 0} seconds
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Device & Client Info */}
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs space-y-2">
                    <h4 className="font-bold text-neutral-900 uppercase text-[10px] tracking-wider">Device Profile</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-neutral-600">
                      <div><strong className="text-neutral-900">Device:</strong> {visitorDetail.visitor?.deviceType || 'Desktop'}</div>
                      <div><strong className="text-neutral-900">Browser:</strong> {visitorDetail.visitor?.browser || 'Unknown'}</div>
                      <div><strong className="text-neutral-900">OS:</strong> {visitorDetail.visitor?.os || 'Unknown'}</div>
                      <div className="col-span-2">
                        <strong className="text-neutral-900">First Arrived:</strong> {formatKolkataTime(visitorDetail.visitor?.firstVisitAt, true)}
                      </div>
                      <div className="col-span-2">
                        <strong className="text-neutral-900">Last Active:</strong> {formatKolkataTime(visitorDetail.visitor?.lastVisitAt, true)}
                      </div>
                    </div>
                  </div>

                  {/* Traffic Acquisition Source Profile */}
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-bold text-neutral-900 uppercase text-[10px] tracking-wider">
                        Traffic Source & How User Arrived
                      </h4>
                      {getTrafficBadge(
                        visitorDetail.visitor?.firstTrafficSource,
                        visitorDetail.visitor?.firstTrafficMedium,
                        visitorDetail.sessions?.[0]?.utmCampaign
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600 mt-1">
                      <div>
                        <strong className="text-neutral-900">Acquisition Source:</strong>{' '}
                        <span className="font-semibold text-neutral-900">
                          {visitorDetail.visitor?.firstTrafficSource || 'Direct / Chrome Search'}
                        </span>
                      </div>
                      <div>
                        <strong className="text-neutral-900">Channel / Medium:</strong>{' '}
                        <span className="uppercase text-[11px] font-bold text-neutral-700 bg-neutral-200/80 px-1.5 py-0.5 rounded">
                          {visitorDetail.visitor?.firstTrafficMedium || 'direct'}
                        </span>
                      </div>
                      {visitorDetail.sessions?.[0]?.utmCampaign && (
                        <div className="col-span-1 sm:col-span-2">
                          <strong className="text-neutral-900">Ad Campaign:</strong>{' '}
                          <span className="font-mono text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                            🎯 {visitorDetail.sessions[0].utmCampaign}
                          </span>
                        </div>
                      )}
                      {visitorDetail.sessions?.[0]?.referrer && (
                        <div className="col-span-1 sm:col-span-2">
                          <strong className="text-neutral-900">Referrer URL:</strong>{' '}
                          <span className="font-mono text-neutral-500 break-all text-[11px]">
                            {visitorDetail.sessions[0].referrer}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chronological Page Visits Timeline */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-neutral-900 uppercase text-[10px] tracking-wider flex items-center justify-between">
                      <span>Timeline of Visited Pages</span>
                      <span className="text-neutral-400 font-normal">Newest to Oldest</span>
                    </h4>

                    {visitorDetail.pageVisits?.length === 0 ? (
                      <p className="text-xs text-neutral-400">No page visits recorded yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {visitorDetail.pageVisits?.map((visit, index) => (
                          <div
                            key={visit.id}
                            className="p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all shadow-2xs space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-xs font-bold text-neutral-900">
                                  {visit.pageTitle || visit.pagePath}
                                </span>
                                <div className="text-[11px] font-mono text-neutral-500">
                                  {visit.pagePath}
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                visit.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : visit.status === 'INACTIVE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}>
                                {visit.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-100 text-[11px]">
                              <div>
                                <span className="text-neutral-400 block text-[9px] uppercase font-bold">Entered At</span>
                                <span className="font-medium text-neutral-800">{formatKolkataTime(visit.enteredAt, true)}</span>
                              </div>
                              <div>
                                <span className="text-neutral-400 block text-[9px] uppercase font-bold">
                                  {visit.isExactEndTime ? 'Left At' : 'Est. End Time'}
                                </span>
                                <span className="font-medium text-neutral-800">
                                  {formatKolkataTime(visit.leftAt || visit.estimatedEndTime, true)}
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-400 block text-[9px] uppercase font-bold">Duration</span>
                                <span className="font-mono font-bold text-neutral-900">{formatDuration(visit.durationSeconds)}</span>
                              </div>
                              <div>
                                <span className="text-emerald-600 block text-[9px] uppercase font-bold">Active Time</span>
                                <span className="font-mono font-bold text-emerald-700">
                                  {formatDuration(visit.activeSeconds)} ({visit.activeSeconds}s)
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-neutral-500">
                  Unable to load details for this visitor.
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-end">
              <button
                onClick={() => { setSelectedVisitorId(null); setVisitorDetail(null); }}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
