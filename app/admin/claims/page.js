'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Search, Calendar, ArrowRight, Download, ChevronDown, Check, Store, Tag, X, RotateCcw, ShieldCheck } from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import ConfirmModal from '@/components/common/ConfirmModal';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import * as XLSX from 'xlsx';
import { calculateCashback } from '@/lib/cashbackCalculator';

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingClaim, setViewingClaim] = useState(null);

  // Status Update State
  const [awardedCashback, setAwardedCashback] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [selectedAdmin, setSelectedAdmin] = useState('ALL');
  const [adminUsersList, setAdminUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => { }, isDestructive: false });
  const [lightboxImage, setLightboxImage] = useState(null);

  // Custom Dropdown & Filter States
  const [openDropdown, setOpenDropdown] = useState(null);
  const [storeSearchText, setStoreSearchText] = useState('');
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

  const uniqueStoreList = Array.from(new Set(claims.map(c => c.storeName).filter(Boolean))).sort();
  const filteredStoreList = uniqueStoreList.filter(s =>
    !storeSearchText || s.toLowerCase().includes(storeSearchText.toLowerCase())
  );

  const allCreators = (() => {
    const map = new Map();

    // 1. Seed currently logged-in user from localStorage if admin/sub-admin
    try {
      const adminStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
      if (adminStr) {
        const currentAdmin = JSON.parse(adminStr);
        if (currentAdmin?.id && (currentAdmin.role === 'ADMIN' || currentAdmin.role === 'SUB_ADMIN')) {
          map.set(currentAdmin.id, {
            id: currentAdmin.id,
            name: currentAdmin.name || currentAdmin.email || (currentAdmin.role === 'ADMIN' ? 'Main Admin' : 'Sub-Admin'),
            email: currentAdmin.email,
            role: currentAdmin.role
          });
        }
      }
    } catch (e) {}

    // 2. Add fetched admin & sub-admin users from backend (/auth)
    adminUsersList.forEach(u => {
      map.set(u.id, {
        id: u.id,
        name: u.name || u.email || (u.role === 'ADMIN' ? 'Main Admin' : 'Sub-Admin'),
        email: u.email,
        role: u.role
      });
    });

    // 3. Add creators present on existing claims products
    claims.forEach(c => {
      if (c.product?.createdById) {
        if (!map.has(c.product.createdById)) {
          const creator = c.product.createdBy;
          map.set(c.product.createdById, {
            id: c.product.createdById,
            name: creator?.name || creator?.email || (creator?.role === 'SUB_ADMIN' ? 'Sub-Admin' : 'Main Admin'),
            email: creator?.email,
            role: creator?.role || 'ADMIN'
          });
        }
      }
    });

    // 4. Sort: Main Admins first, then Sub-Admins, then alphabetically
    return Array.from(map.values()).sort((a, b) => {
      if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
      if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  })();

  const filteredClaims = claims.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesStore = storeFilter === 'ALL' || c.storeName === storeFilter;
    const matchesAdmin = selectedAdmin === 'ALL' || String(c.product?.createdById) === String(selectedAdmin);
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !searchLower || 
                          c.product?.title?.toLowerCase().includes(searchLower) ||
                          c.storeName?.toLowerCase().includes(searchLower) ||
                          c.orderId?.toLowerCase().includes(searchLower) ||
                          c.user?.name?.toLowerCase().includes(searchLower) ||
                          c.user?.email?.toLowerCase().includes(searchLower);
    return matchesStatus && matchesStore && matchesAdmin && matchesSearch;
  });

  const exportToExcel = () => {
    if (filteredClaims.length === 0) {
      alert("No data to export!");
      return;
    }

    const data = filteredClaims.map(c => ({
      'Claim ID': c.id,
      'Date': new Date(c.createdAt).toLocaleDateString(),
      'User Name': c.user?.name || 'Unknown',
      'User Email': c.user?.email || '',
      'Store': c.storeName,
      'Product': c.product?.title || '',
      'Product Added By': c.product?.createdBy?.name || c.product?.createdBy?.email || 'N/A',
      'Claim Type': c.claimType === 'WITHOUT_REVIEW' ? 'Without Review' : 'With Review',
      'Order ID': c.orderId,
      'Order Date': new Date(c.orderDate).toLocaleDateString(),
      'Order Amount (₹)': c.orderAmount,
      'Status': c.status,
      'Cashback Awarded (₹)': c.awardedCashback || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Claims");
    XLSX.writeFile(workbook, `Cashback_Claims_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const router = useRouter();

  const fetchClaims = async () => {
    const userStr = localStorage.getItem('adminUser');
    if (!userStr) {
      router.push('/admin/login');
      return;
    }
    const user = JSON.parse(userStr);

    if (user.role === 'SUB_ADMIN') {
      router.replace('/admin/dashboard');
      return;
    }

    if (user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/claims/admin`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims || []);
      }

      // Fetch admin & sub-admin users list from /auth to populate filter options
      try {
        const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
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
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [router]);

  const initiateStatusUpdate = (status) => {
    setActionError('');

    if (status === 'APPROVED') {
      if (!awardedCashback || parseFloat(awardedCashback) <= 0) {
        setActionError("Please enter a valid positive cashback amount to approve.");
        return;
      }
    }

    if (status === 'REJECTED' && (!adminNote || !adminNote.trim())) {
      setActionError("Admin Note / Rejection reason is compulsory when rejecting a claim.");
      return;
    }

    if (status === 'APPROVED') {
      setConfirmModal({
        isOpen: true,
        title: 'Confirm Claim Approval',
        message: `Are you sure you want to approve this claim and credit ₹${awardedCashback} to ${viewingClaim.user?.name || 'the user'}?${adminNote.trim() ? ` Note: "${adminNote.trim()}".` : ''} Once approved, this claim CANNOT be modified or reopened.`,
        confirmText: 'Yes, Approve & Credit',
        isDestructive: false,
        onConfirm: () => executeStatusUpdate('APPROVED')
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: 'Confirm Claim Rejection',
        message: `Are you sure you want to reject this claim for ${viewingClaim.user?.name || 'the user'}? Rejection reason: "${adminNote.trim()}". Once rejected, this claim CANNOT be modified or reopened.`,
        confirmText: 'Yes, Reject Claim',
        isDestructive: true,
        onConfirm: () => executeStatusUpdate('REJECTED')
      });
    }
  };

  const executeStatusUpdate = async (status) => {
    const userStr = localStorage.getItem('adminUser');
    const user = JSON.parse(userStr);
    setIsUpdating(true);
    setActionError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/claims/admin/${viewingClaim.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          adminNote: adminNote.trim() || undefined,
          awardedCashback: status === 'APPROVED' ? parseFloat(awardedCashback) : null
        })
      });

      if (res.ok) {
        setViewingClaim(null);
        setAwardedCashback('');
        setAdminNote('');
        setActionError('');
        fetchClaims();
      } else {
        const data = await res.json();
        setActionError(data.error || 'Failed to update claim');
      }
    } catch (error) {
      setActionError('An error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(new Date(dateString));
    } catch (e) {
      return dateString;
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (typeof url !== 'string') return '';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative" onClick={() => setOpenDropdown(null)}>
      {viewingClaim ? (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <Button variant="none" size="none"
            onClick={() => setViewingClaim(null)}
            className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-[#f96b02] transition-colors mb-6"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Claims List
          </Button>

          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-neutral-100 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="font-black text-neutral-900">Review Claim: {viewingClaim.user?.name}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${viewingClaim.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    viewingClaim.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                    {viewingClaim.status}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${viewingClaim.claimType === 'WITHOUT_REVIEW' ? 'bg-neutral-100 text-neutral-600 border border-neutral-200' : 'bg-orange-50 text-[#f96b02] border border-orange-200'}`}>
                    {viewingClaim.claimType === 'WITHOUT_REVIEW' ? '⚡ Without Review Claim' : '🌟 With Review Claim'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                  <Calendar className="w-4 h-4" /> Claimed on {formatDate(viewingClaim.createdAt)}
                  <span className="mx-2">•</span>
                  <span className="text-sm lg:text-[15px] xl:text-base font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 font-bold">
                    #{viewingClaim.ticketId || viewingClaim.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Order Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Store / Product</p>
                    <p className="text-lg font-black text-neutral-900">{viewingClaim.storeName}</p>
                    {!viewingClaim.product && (
                      <p className="text-sm font-semibold text-neutral-400 mt-1">No Product Selected</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Claim Option</p>
                    <p className="text-sm font-bold text-neutral-800">
                      {viewingClaim.claimType === 'WITHOUT_REVIEW' ? 'Without Review (Standard Cashback)' : 'With Review (Higher Cashback)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Order Amount</p>
                    <p className="text-lg font-black text-neutral-900">₹{viewingClaim.orderAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Order ID</p>
                    <p className="text-sm lg:text-[15px] xl:text-base font-mono text-neutral-900">{viewingClaim.orderId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Order Date</p>
                    <p className="text-sm lg:text-[15px] xl:text-base font-medium text-neutral-900">{formatDate(viewingClaim.orderDate)}</p>
                  </div>
                </div>
              </div>

              {viewingClaim.product && (
                <div>
                  <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Product Info</h3>
                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                    <img src={viewingClaim.product.image} alt={viewingClaim.product.title} className="w-full h-32 object-contain bg-white rounded-xl mb-4 border border-neutral-100" />
                    <p className="font-bold text-sm text-neutral-900 line-clamp-2 mb-3">{viewingClaim.product.title}</p>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-neutral-500">Sale Price</p>
                        <p className="text-sm lg:text-[15px] xl:text-base font-bold text-green-600">₹{viewingClaim.product.salePrice}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Original</p>
                        <p className="text-sm lg:text-[15px] xl:text-base font-semibold text-neutral-400 line-through">₹{viewingClaim.product.originalPrice}</p>
                      </div>
                      <div className="col-span-2 pt-2 mt-2 border-t border-neutral-200 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-500 font-medium">With Review:</span>
                          <span className={`font-bold ${viewingClaim.claimType !== 'WITHOUT_REVIEW' ? 'text-green-600 font-black' : 'text-neutral-700'}`}>
                            ₹{viewingClaim.product.cashbackWithReview || calculateCashback(viewingClaim.product.salePrice).withReview}
                            {viewingClaim.claimType !== 'WITHOUT_REVIEW' && ' (Selected)'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-500 font-medium">Without Review:</span>
                          <span className={`font-bold ${viewingClaim.claimType === 'WITHOUT_REVIEW' ? 'text-orange-600 font-black' : 'text-neutral-700'}`}>
                            ₹{viewingClaim.product.cashbackWithoutReview || calculateCashback(viewingClaim.product.salePrice).withoutReview}
                            {viewingClaim.claimType === 'WITHOUT_REVIEW' && ' (Selected)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className={!viewingClaim.product ? "md:col-span-1 lg:col-span-2" : ""}>
                <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Take Action</h3>
                {viewingClaim.status === 'PENDING' ? (
                  <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1.5">Award Cashback (₹) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={awardedCashback}
                        onChange={(e) => {
                          setAwardedCashback(e.target.value);
                          if (actionError) setActionError('');
                        }}
                        placeholder="e.g. 50"
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-white"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1.5 font-medium">* Required if approving</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                        Admin Note <span className="text-neutral-500 font-normal">(Optional for Approve, Compulsory for Reject)</span>
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => {
                          setAdminNote(e.target.value);
                          if (actionError) setActionError('');
                        }}
                        placeholder="Add an optional approval note or required rejection reason..."
                        rows="2"
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1.5 font-medium">* Note is required only when rejecting</p>
                    </div>

                    {actionError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                        {actionError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button variant="none" size="none"
                        onClick={() => initiateStatusUpdate('APPROVED')}
                        disabled={isUpdating}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <CheckCircle className="w-5 h-5" /> Approve & Credit
                      </Button>
                      <Button variant="none" size="none"
                        onClick={() => initiateStatusUpdate('REJECTED')}
                        disabled={isUpdating}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <XCircle className="w-5 h-5" /> Reject
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-6 rounded-2xl border ${viewingClaim.status === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                    <h3 className="font-black mb-2">Claim {viewingClaim.status}</h3>
                    {viewingClaim.status === 'APPROVED' && (
                      <div className="mb-2">
                        <p className="text-sm lg:text-[15px] xl:text-base font-medium mb-1">Cashback Awarded: <span className="font-black text-xl">₹{viewingClaim.awardedCashback}</span></p>
                      </div>
                    )}
                    {viewingClaim.adminNote && (
                      <div className="mt-3 p-3 bg-white/60 rounded-xl border border-black/5">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-60">Admin Note</p>
                        <p className="text-sm font-medium">{viewingClaim.adminNote}</p>
                      </div>
                    )}
                    <p className="text-xs text-neutral-500 font-medium mt-4 italic border-t border-black/5 pt-3">
                      * This claim has been finalized ({viewingClaim.status}) and cannot be modified or reopened.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Submitted Proofs</h3>
              <div className={`grid grid-cols-1 ${viewingClaim.claimType === 'WITHOUT_REVIEW' && !viewingClaim.reviewScreenshot ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-6`}>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-700 mb-3">1. Invoice / Receipt</span>
                  <button onClick={() => setLightboxImage(getImageUrl(viewingClaim.invoiceScreenshot))} className="block aspect-square w-full relative group bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-[#f96b02] transition-colors focus:outline-none">
                    <img src={getImageUrl(viewingClaim.invoiceScreenshot)} className="object-cover w-full h-full" alt="Invoice" />
                  </button>
                </div>
                {viewingClaim.reviewScreenshot && (
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-700 mb-3">2. Product Review</span>
                    <button onClick={() => setLightboxImage(getImageUrl(viewingClaim.reviewScreenshot))} className="block aspect-square w-full relative group bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-[#f96b02] transition-colors focus:outline-none">
                      <img src={getImageUrl(viewingClaim.reviewScreenshot)} className="object-cover w-full h-full" alt="Review" />
                    </button>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-700 mb-3">
                    {viewingClaim.reviewScreenshot ? '3. Non-Return Proof' : '2. Non-Return Proof'}
                  </span>
                  <button onClick={() => setLightboxImage(getImageUrl(viewingClaim.noReturnScreenshot))} className="block aspect-square w-full relative group bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-[#f96b02] transition-colors focus:outline-none">
                    <img src={getImageUrl(viewingClaim.noReturnScreenshot)} className="object-cover w-full h-full" alt="No Return" />
                  </button>
                </div>
              </div>
              {viewingClaim.claimType === 'WITHOUT_REVIEW' && !viewingClaim.reviewScreenshot && (
                <p className="text-xs text-neutral-500 mt-3 italic bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                  ⚡ User submitted this claim without a product review. Review screenshot was not required.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h3 className="font-extrabold text-neutral-900 text-lg">Manage Cashback Claims</h3>
              <p className="text-sm text-neutral-500">Review, verify, and approve user cashback submissions.</p>
            </div>
            <Button
              onClick={exportToExcel}
              variant="none"
              size="none"
              className="px-4 py-2.5 bg-black hover:bg-[#f96b02] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm self-start sm:self-auto cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </Button>
          </div>

          {/* Search & Modern Filter Dropdowns Bar */}
          <div
            ref={filterBarRef}
            className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 relative z-30 mb-6"
          >
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search product, store, order ID, or user email..."
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
                        ? 'Pending Claims'
                        : statusFilter === 'APPROVED'
                        ? 'Approved'
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
                      { id: 'PENDING', label: 'Pending Claims', dot: 'bg-amber-500' },
                      { id: 'APPROVED', label: 'Approved', dot: 'bg-emerald-500' },
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

              {/* Store Custom Dropdown */}
              <div className="relative flex-1 sm:flex-initial">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === 'store' ? null : 'store');
                  }}
                  className={`w-full sm:w-auto px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs ${
                    storeFilter !== 'ALL'
                      ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
                      : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="truncate max-w-[130px]">
                      {storeFilter === 'ALL' ? 'All Stores' : storeFilter}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'store' ? 'rotate-180 text-black' : 'text-neutral-400'}`} />
                </button>

                {openDropdown === 'store' && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 min-w-[210px] max-w-xs animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                      Filter by Store
                    </div>
                    {uniqueStoreList.length > 5 && (
                      <div className="p-2 border-b border-neutral-100">
                        <input
                          type="text"
                          value={storeSearchText}
                          onChange={(e) => setStoreSearchText(e.target.value)}
                          placeholder="Search stores..."
                          className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    )}
                    <div className="max-h-56 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setStoreFilter('ALL');
                          setOpenDropdown(null);
                          setStoreSearchText('');
                        }}
                        className={`w-full px-3.5 py-2 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                          storeFilter === 'ALL'
                            ? 'bg-orange-50 font-bold text-[#f96b02]'
                            : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <span>All Stores</span>
                        {storeFilter === 'ALL' && <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />}
                      </button>
                      {filteredStoreList.map((store) => (
                        <button
                          key={store}
                          type="button"
                          onClick={() => {
                            setStoreFilter(store);
                            setOpenDropdown(null);
                            setStoreSearchText('');
                          }}
                          className={`w-full px-3.5 py-2 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                            storeFilter === store
                              ? 'bg-orange-50 font-bold text-[#f96b02]'
                              : 'hover:bg-neutral-50 text-neutral-700'
                          }`}
                        >
                          <span className="truncate">{store}</span>
                          {storeFilter === store && <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />}
                        </button>
                      ))}
                    </div>
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

                      {/* Only the Admin & Sub-Admin Names */}
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
              {(searchQuery || storeFilter !== 'ALL' || statusFilter !== 'ALL' || selectedAdmin !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStoreFilter('ALL');
                    setStatusFilter('ALL');
                    setSelectedAdmin('ALL');
                    setStoreSearchText('');
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 border border-red-200 cursor-pointer shadow-2xs"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm w-full overflow-hidden">
            {isLoading ? (
              <PageLoader />
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">User</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Store & Claim</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Date</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredClaims.map(claim => (
                      <tr
                        key={claim.id}
                        onClick={() => {
                          setViewingClaim(claim);

                          let defaultCashback = claim.awardedCashback || '';
                          if (!defaultCashback && claim.product) {
                            const isWithoutReview = claim.claimType === 'WITHOUT_REVIEW';
                            if (isWithoutReview && claim.product.cashbackWithoutReview) {
                              defaultCashback = Number(claim.product.cashbackWithoutReview);
                            } else if (!isWithoutReview && claim.product.cashbackWithReview) {
                              defaultCashback = Number(claim.product.cashbackWithReview);
                            } else if (claim.product.cashback) {
                              defaultCashback = Number(claim.product.cashback);
                            } else {
                              const calc = calculateCashback(claim.product.salePrice || 0);
                              defaultCashback = isWithoutReview ? calc.withoutReview : calc.withReview;
                            }
                          }

                          setAwardedCashback(defaultCashback);
                          setAdminNote(claim.adminNote || '');
                        }}
                        className="hover:bg-neutral-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-neutral-900">{claim.user?.name || 'Unknown'}</p>
                            <span className="text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                              #{claim.ticketId || claim.id.slice(-6).toUpperCase()}
                            </span>
                            {claim.status === 'PENDING' && (new Date() - new Date(claim.createdAt)) < 24 * 60 * 60 * 1000 && (
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500">{claim.user?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-neutral-900">{claim.storeName}</p>
                          {claim.product && (
                            <>
                              <p className="text-xs text-blue-500 font-semibold truncate max-w-[200px] mb-0.5">{claim.product.title}</p>
                              {claim.product.createdBy && (
                                <p className="text-[10px] text-neutral-400 font-medium mb-1">
                                  Added by: <span className="font-semibold text-neutral-600">{claim.product.createdBy.name || claim.product.createdBy.email}</span>
                                </p>
                              )}
                            </>
                          )}
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${claim.claimType === 'WITHOUT_REVIEW' ? 'bg-neutral-100 text-neutral-600 border border-neutral-200' : 'bg-orange-50 text-[#f96b02] border border-orange-200'}`}>
                            {claim.claimType === 'WITHOUT_REVIEW' ? '⚡ W/O Review' : '🌟 With Review'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold">₹{claim.orderAmount}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            claim.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-neutral-500">{formatDate(claim.createdAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-[#f96b02] transition-colors inline-block" />
                        </td>
                      </tr>
                    ))}
                    {filteredClaims.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-neutral-500 font-medium">
                          No claims found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
      <Lightbox
        open={!!lightboxImage}
        close={() => setLightboxImage(null)}
        slides={[{ src: lightboxImage }]}
        plugins={[Zoom]}
        zoom={{ scrollToZoom: true, maxZoomPixelRatio: 5 }}
      />
    </div>
  );
}
