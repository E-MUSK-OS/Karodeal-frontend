'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Store, 
  Mail, 
  Trash2, 
  ExternalLink, 
  MessageSquare, 
  CheckCircle2, 
  Phone, 
  Eye, 
  X,
  Building2,
  Calendar,
  Globe2,
  Tag,
  ChevronDown,
  Check
} from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import { handleAppError, showSuccessToast } from '@/lib/errorHandler';
import { parseSellerMessage } from '@/lib/sellerParser';

export default function AdminSellerRequestsPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const platformDropdownRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    confirmText: '', 
    onConfirm: () => {}, 
    isDestructive: true 
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (platformDropdownRef.current && !platformDropdownRef.current.contains(e.target)) {
        setIsPlatformDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMessages = async () => {
    try {
      const adminStr = localStorage.getItem('adminUser');
      if (!adminStr) {
        router.push('/admin/login');
        return;
      }
      const adminUser = JSON.parse(adminStr);

      const allowedModules = adminUser.permissions?.allowedModules || ['dashboard', 'products', 'billing', 'review-requests', 'clicks'];
      if (adminUser.role === 'SUB_ADMIN' && !allowedModules.includes('seller-requests')) {
        router.replace('/admin/dashboard');
        return;
      }

      if (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUB_ADMIN') {
        router.push('/admin/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
      const res = await fetch(`${apiUrl}/contact/messages`, {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch seller requests', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Parse and filter only seller application requests
  const sellerRequests = useMemo(() => {
    return messages
      .map((m) => {
        const parsed = parseSellerMessage(m.message);
        if (!parsed) return null;
        return {
          ...m,
          sellerData: parsed,
        };
      })
      .filter(Boolean);
  }, [messages]);

  // Extract unique platforms for the filter dropdown
  const uniquePlatforms = useMemo(() => {
    const set = new Set();
    sellerRequests.forEach((r) => {
      if (r.sellerData.platform) {
        set.add(r.sellerData.platform);
      }
    });
    return Array.from(set);
  }, [sellerRequests]);

  // Filter by search query and platform
  const filteredRequests = useMemo(() => {
    return sellerRequests.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.sellerData?.storeName?.toLowerCase().includes(q) ||
        r.sellerData?.platform?.toLowerCase().includes(q) ||
        r.sellerData?.category?.toLowerCase().includes(q);

      const matchesPlatform =
        platformFilter === 'ALL' ||
        r.sellerData?.platform?.toLowerCase() === platformFilter.toLowerCase();

      return matchesSearch && matchesPlatform;
    });
  }, [sellerRequests, searchQuery, platformFilter]);

  const handleDeleteRequest = (requestId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Seller Application',
      message: 'Are you sure you want to remove this seller application? This action cannot be undone.',
      confirmText: 'Delete Application',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const adminStr = localStorage.getItem('adminUser');
          const adminUser = adminStr ? JSON.parse(adminStr) : {};
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

          const res = await fetch(`${apiUrl}/contact/messages/${requestId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${adminUser.token}`,
            },
          });

          if (res.ok) {
            setMessages((prev) => prev.filter((m) => m.id !== requestId));
            if (selectedRequest?.id === requestId) {
              setSelectedRequest(null);
            }
            showSuccessToast('Seller application deleted successfully.');
          } else {
            const data = await res.json().catch(() => ({}));
            handleAppError(data.error || 'Failed to delete application', {
              context: 'Seller Requests / Delete',
              title: 'Delete Failed',
            });
          }
        } catch (err) {
          handleAppError(err, {
            context: 'Seller Requests / Delete Network',
            title: 'Delete Error',
          });
        }
      },
    });
  };

  const cleanPhoneForWhatsApp = (phoneStr) => {
    if (!phoneStr) return '';
    return phoneStr.replace(/[^0-9]/g, '');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="font-extrabold text-neutral-900 text-xl sm:text-2xl tracking-tight">
              E-Commerce Seller Requests
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-[#f96b02] text-white">
              {sellerRequests.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500">
            Review and onboard online stores requesting to feature their products on KaroDeal
          </p>
        </div>

        {/* Search & Platform Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Platform Custom Filter */}
          <div ref={platformDropdownRef} className="relative w-full sm:w-56">
            <button
              type="button"
              onClick={() => setIsPlatformDropdownOpen((prev) => !prev)}
              className={`w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs ${
                platformFilter !== 'ALL'
                  ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
                  : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Globe2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="truncate">
                  {platformFilter === 'ALL' ? 'All Platforms' : platformFilter}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold shrink-0 ${
                  platformFilter !== 'ALL' ? 'bg-[#f96b02] text-white' : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {platformFilter === 'ALL'
                    ? sellerRequests.length
                    : sellerRequests.filter((r) => r.parsed.platform === platformFilter).length}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                  isPlatformDropdownOpen ? 'rotate-180 text-black' : 'text-neutral-400'
                }`}
              />
            </button>

            {isPlatformDropdownOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 right-0 sm:right-auto sm:w-60 top-full mt-1.5 z-40 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto"
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                  Filter by Platform
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPlatformFilter('ALL');
                    setIsPlatformDropdownOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-xs flex items-center justify-between gap-2.5 text-left transition-colors cursor-pointer ${
                    platformFilter === 'ALL'
                      ? 'bg-orange-50 font-bold text-[#f96b02]'
                      : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
                    <span className="truncate">All Platforms</span>
                  </div>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                    platformFilter === 'ALL' ? 'bg-[#f96b02] text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {sellerRequests.length}
                  </span>
                </button>
                {uniquePlatforms.map((p) => {
                  const count = sellerRequests.filter((r) => r.parsed.platform === p).length;
                  const isSelected = platformFilter === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPlatformFilter(p);
                        setIsPlatformDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-xs flex items-center justify-between gap-2.5 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 font-bold text-[#f96b02]'
                          : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-[#f96b02]' : 'bg-neutral-300'}`} />
                        <span className="truncate">{p}</span>
                      </div>
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-[#f96b02] text-white' : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store, brand, email..."
              className="w-full px-4 py-2.5 pl-10 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-medium"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          </div>
        </div>
      </div>

      {/* 2. Main Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden w-full">
        {/* Table Summary Bar */}
        <div className="px-4 sm:px-6 py-3 bg-neutral-50/50 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-neutral-500 font-medium">
          <span className="font-bold text-neutral-700">
            Showing {filteredRequests.length} of {sellerRequests.length} Applications
          </span>
          {platformFilter !== 'ALL' && (
            <span className="bg-neutral-200/70 text-neutral-800 px-2 py-0.5 rounded text-[11px] font-semibold w-fit">
              Filter: {platformFilter}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-12">
            <PageLoader />
          </div>
        ) : (
          <>
            {/* Mobile View: Clean, Touch-Friendly Application Cards (block md:hidden) */}
            <div className="block md:hidden divide-y divide-neutral-100">
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                    <Store className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-neutral-800 text-sm mb-1">
                    No Seller Requests Found
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    {searchQuery || platformFilter !== 'ALL'
                      ? 'Try adjusting your search query or platform filter.'
                      : 'When sellers submit product listing inquiries from the homepage, they will appear here.'}
                  </p>
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const data = req.sellerData;
                  const whatsappNumber = cleanPhoneForWhatsApp(data.phone);

                  return (
                    <div
                      key={req.id}
                      className="p-4 hover:bg-neutral-50/60 transition-colors space-y-3 cursor-pointer"
                      onClick={() => setSelectedRequest(req)}
                    >
                      {/* Top Bar: Store info & Platform Badge */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-800 font-black flex items-center justify-center shrink-0 uppercase text-xs shadow-2xs">
                            {data.storeName?.charAt(0) || 'S'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-neutral-900 truncate text-sm">
                              {data.storeName}
                            </div>
                            <div className="text-[11px] font-bold text-neutral-500 truncate capitalize">
                              {data.category || 'E-Commerce Store'}
                            </div>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200/80 shrink-0 whitespace-nowrap">
                          <Globe2 className="w-3 h-3 text-[#f96b02] shrink-0" />
                          <span>{data.platform}</span>
                        </span>
                      </div>

                      {/* Middle: Store Link & Contact Info Details */}
                      <div className="space-y-1.5 text-xs bg-neutral-50/80 p-3 rounded-xl border border-neutral-100">
                        {data.storeUrl && (
                          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-neutral-200/60">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                              Storefront
                            </span>
                            <a
                              href={data.storeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f96b02] hover:underline truncate max-w-[200px]"
                            >
                              <span className="truncate">{data.storeUrl.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            Contact
                          </span>
                          <span className="font-semibold text-neutral-800 truncate">
                            {data.contactPerson || req.name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            Email
                          </span>
                          <a
                            href={`mailto:${req.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-mono text-neutral-600 hover:text-black truncate text-[11px]"
                          >
                            {req.email}
                          </a>
                        </div>

                        {data.phone && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                              Phone
                            </span>
                            <a
                              href={`tel:${data.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium text-neutral-700 hover:text-black text-[11px]"
                            >
                              {data.phone}
                            </a>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-200/60 text-[10px] text-neutral-400">
                          <span>Submitted:</span>
                          <span>
                            {new Date(req.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Actions Bar (100% visible, no horizontal scroll) */}
                      <div
                        className="flex items-center gap-2 pt-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className="flex-1 py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-neutral-600" />
                          <span>View Details</span>
                        </button>

                        {whatsappNumber && (
                          <a
                            href={`https://wa.me/${whatsappNumber}?text=Hello%20${encodeURIComponent(data.contactPerson || req.name)}%2C%20this%20is%20KaroDeal%20regarding%20your%20seller%20listing%20request%20for%20${encodeURIComponent(data.storeName)}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 border border-emerald-200/70 rounded-xl transition-all shrink-0"
                            title="Chat on WhatsApp"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                            </svg>
                          </a>
                        )}

                        <a
                          href={`mailto:${req.email}?subject=KaroDeal%20Seller%20Partnership%20-%20${encodeURIComponent(data.storeName)}`}
                          className="p-2.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200/70 rounded-xl transition-all shrink-0"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(req.id)}
                          className="p-2.5 bg-neutral-50 hover:bg-rose-600 hover:text-white text-neutral-400 hover:border-rose-600 border border-neutral-200 rounded-xl transition-all shrink-0 cursor-pointer"
                          title="Delete Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop View: Full Proportional Table (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6 w-[26%]">Brand / Online Store</th>
                  <th className="py-3.5 px-4 w-[18%]">E-Commerce Platform</th>
                  <th className="py-3.5 px-4 w-[14%]">Store Link</th>
                  <th className="py-3.5 px-4 w-[22%]">Contact Person</th>
                  <th className="py-3.5 px-4 w-[12%]">Date Submitted</th>
                  <th className="py-3.5 px-6 w-[8%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-neutral-500">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                        <Store className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-neutral-800 text-base mb-1">
                        No Seller Requests Found
                      </h4>
                      <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                        {searchQuery || platformFilter !== 'ALL'
                          ? 'Try adjusting your search query or platform filter.'
                          : 'When sellers submit product listing inquiries from the homepage, they will appear here.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const data = req.sellerData;
                    const whatsappNumber = cleanPhoneForWhatsApp(data.phone);

                    return (
                      <tr 
                        key={req.id} 
                        className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedRequest(req)}
                      >
                        {/* 1. Brand / Store Name with Store Avatar */}
                        <td className="py-4 px-6 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-800 font-black flex items-center justify-center shrink-0 uppercase text-sm shadow-2xs group-hover:bg-[#f96b02] group-hover:text-white group-hover:border-[#f96b02] transition-all">
                              {data.storeName?.charAt(0) || 'S'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold text-neutral-900 group-hover:text-[#f96b02] transition-colors truncate text-sm">
                                {data.storeName}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600 capitalize">
                                  {data.category || 'E-Commerce Store'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Platform Badge */}
                        <td className="py-4 px-4 align-middle">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-200/80 shadow-2xs whitespace-nowrap">
                            <Globe2 className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />
                            <span>{data.platform}</span>
                          </span>
                        </td>

                        {/* 3. Online Store Link */}
                        <td className="py-4 px-4 align-middle" onClick={(e) => e.stopPropagation()}>
                          {data.storeUrl ? (
                            <a
                              href={data.storeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-black hover:text-white border border-neutral-200 text-xs font-bold text-neutral-700 transition-all shadow-2xs whitespace-nowrap group/link"
                              title={data.storeUrl}
                            >
                              <span>Visit Store</span>
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover/link:text-white" />
                            </a>
                          ) : (
                            <span className="text-neutral-400 text-xs italic font-medium">No Link Provided</span>
                          )}
                        </td>

                        {/* 4. Contact Person */}
                        <td className="py-4 px-4 align-middle">
                          <div className="font-bold text-neutral-900 text-xs sm:text-sm">
                            {data.contactPerson || req.name}
                          </div>
                          <a
                            href={`mailto:${req.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-neutral-500 hover:text-black font-mono text-[11px] flex items-center gap-1 mt-0.5 transition-colors truncate"
                            title={req.email}
                          >
                            <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span className="truncate">{req.email}</span>
                          </a>
                          {data.phone ? (
                            <div className="text-neutral-600 text-xs font-medium flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span>{data.phone}</span>
                            </div>
                          ) : (
                            <div className="text-neutral-400 text-[11px] italic mt-0.5">No phone provided</div>
                          )}
                        </td>

                        {/* 5. Date Submitted */}
                        <td className="py-4 px-4 text-xs align-middle whitespace-nowrap">
                          <div className="font-semibold text-neutral-800">
                            {new Date(req.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-neutral-400 text-[11px] font-medium mt-0.5">
                            {new Date(req.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        {/* 6. Actions */}
                        <td className="py-4 px-6 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            {/* View Full Application */}
                            <button
                              type="button"
                              onClick={() => setSelectedRequest(req)}
                              className="p-2 rounded-xl bg-white hover:bg-black hover:text-white text-neutral-600 border border-neutral-200 transition-all shadow-2xs cursor-pointer"
                              title="View Full Application"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* WhatsApp Direct */}
                            {whatsappNumber && (
                              <a
                                href={`https://wa.me/${whatsappNumber}?text=Hello%20${encodeURIComponent(data.contactPerson || req.name)}%2C%20this%20is%20KaroDeal%20regarding%20your%20seller%20listing%20request%20for%20${encodeURIComponent(data.storeName)}.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 border border-emerald-200/70 transition-all shadow-2xs"
                                title="Chat on WhatsApp"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                                </svg>
                              </a>
                            )}

                            {/* Email Direct */}
                            <a
                              href={`mailto:${req.email}?subject=KaroDeal%20Seller%20Partnership%20-%20${encodeURIComponent(data.storeName)}&body=Hello%20${encodeURIComponent(data.contactPerson || req.name)}%2C%0A%0AThank%20you%20for%20applying%20to%20list%20your%20products%20on%20KaroDeal.`}
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200/70 transition-all shadow-2xs"
                              title="Send Email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(req.id)}
                              className="p-2 rounded-xl bg-neutral-50 hover:bg-rose-600 hover:text-white text-neutral-400 hover:border-rose-600 border border-neutral-200 transition-all shadow-2xs cursor-pointer"
                              title="Delete Application"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* 3. Detail View Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 shadow-2xl max-w-xl w-full p-4 sm:p-6 sm:p-8 max-h-[92vh] overflow-y-auto relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedRequest(null)}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-neutral-100 pr-8">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-[#f96b02] text-white">
                  {selectedRequest.sellerData?.platform || 'E-Commerce'}
                </span>
                <span className="text-xs text-neutral-400">
                  {new Date(selectedRequest.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 uppercase tracking-tight">
                {selectedRequest.sellerData?.storeName || 'Store Details'}
              </h2>
            </div>

            {/* Structured Details */}
            <div className="space-y-3.5">
              
              {/* Online Store URL */}
              {selectedRequest.sellerData?.storeUrl && (
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Online Storefront Link
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                      {selectedRequest.sellerData.storeUrl}
                    </div>
                  </div>
                  <a
                    href={selectedRequest.sellerData.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto shrink-0 justify-center px-3 py-1.5 bg-black hover:bg-[#f96b02] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <span>Visit Store</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Contact Person Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Contact Person
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-neutral-900 mt-0.5 truncate">
                    {selectedRequest.sellerData?.contactPerson || selectedRequest.name}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Work Email
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-neutral-900 truncate mt-0.5">
                    {selectedRequest.email}
                  </div>
                </div>
              </div>

              {/* Phone / WhatsApp */}
              {selectedRequest.sellerData?.phone && (
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Phone / WhatsApp
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-neutral-900 mt-0.5">
                      {selectedRequest.sellerData.phone}
                    </div>
                  </div>
                  {cleanPhoneForWhatsApp(selectedRequest.sellerData.phone) && (
                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(selectedRequest.sellerData.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              )}

              {/* Product Categories / Notes */}
              {selectedRequest.sellerData?.category && (
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Product Categories & Notes
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {selectedRequest.sellerData.category}
                  </p>
                </div>
              )}

              {/* Full Raw Message */}
              <div className="pt-1">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Original Message Submission
                </div>
                <div className="p-3 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                  {selectedRequest.message}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDeleteRequest(selectedRequest.id)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center justify-center sm:justify-start gap-1 cursor-pointer py-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Application</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`mailto:${selectedRequest.email}?subject=KaroDeal%20Seller%20Partnership%20-%20${encodeURIComponent(selectedRequest.sellerData?.storeName || '')}`}
                  className="w-full sm:w-auto justify-center px-4 py-2.5 bg-black hover:bg-[#f96b02] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-4 h-4" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

    </div>
  );
}
