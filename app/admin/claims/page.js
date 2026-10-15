'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLoader from '@/components/common/PageLoader';
import ConfirmModal from '@/components/common/ConfirmModal';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import * as XLSX from 'xlsx';
import { calculateCashback } from '@/lib/cashbackCalculator';

import ClaimsFilterBar from '@/components/admin/claims/ClaimsFilterBar';
import ClaimsTable from '@/components/admin/claims/ClaimsTable';
import ClaimDetailView from '@/components/admin/claims/ClaimDetailView';
import ClaimsSummaryCards from '@/components/admin/claims/ClaimsSummaryCards';
import { getSocket } from '@/lib/socket';

function AdminClaimsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');

  const [role, setRole] = useState(null);
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingClaim, setViewingClaim] = useState(null);

  // Status Update State
  const [awardedCashback, setAwardedCashback] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [selectedAdmin, setSelectedAdmin] = useState('ALL');
  const [adminUsersList, setAdminUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [storeSearchText, setStoreSearchText] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Modals & Media State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => { }, isDestructive: false });
  const [lightboxImage, setLightboxImage] = useState(null);

  // Formatters & Helpers
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

  // Helper to open a claim's detail and populate default cashback
  const openClaimDetails = (claim) => {
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
    setActionError('');
  };

  // Select claim handler (Synchronizes URL with ?id=...)
  const handleSelectClaim = (claim) => {
    const ticketParam = claim.ticketId || claim.id;
    router.push(`/admin/claims?id=${encodeURIComponent(ticketParam)}`, { scroll: false });
    openClaimDetails(claim);
  };

  // Back to list handler (Resets URL back to /admin/claims)
  const handleBackToList = () => {
    router.push('/admin/claims', { scroll: false });
    setViewingClaim(null);
  };

  // Fetch Claims from Backend API
  const fetchClaims = useCallback(async (isSilent = false) => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
    if (!userStr) {
      router.push('/admin/login');
      return;
    }
    const user = JSON.parse(userStr);

    if (user.role !== 'ADMIN' && user.role !== 'SUB_ADMIN') {
      router.push('/admin/login');
      return;
    }
    setRole(user.role);

    try {
      if (!isSilent) setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/claims/admin`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims || []);
      }

      // Fetch admin & sub-admin users list from /auth to populate creator filters (only for Main Admin)
      if (user.role === 'ADMIN') {
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
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchClaims(false);
  }, [fetchClaims]);

  // Real-time live updates via WebSockets and periodic polling fallback
  useEffect(() => {
    const socket = getSocket();

    const handleRealtimeChange = () => {
      fetchClaims(true);
    };

    if (socket) {
      socket.on('claims:changed', handleRealtimeChange);
      socket.on('billing:changed', handleRealtimeChange);
      socket.on('products:changed', handleRealtimeChange);
    }

    window.addEventListener('karodeal:claims_changed', handleRealtimeChange);
    window.addEventListener('karodeal:billing_changed', handleRealtimeChange);

    const liveInterval = setInterval(() => {
      fetchClaims(true);
    }, 15000);

    return () => {
      if (socket) {
        socket.off('claims:changed', handleRealtimeChange);
        socket.off('billing:changed', handleRealtimeChange);
        socket.off('products:changed', handleRealtimeChange);
      }
      window.removeEventListener('karodeal:claims_changed', handleRealtimeChange);
      window.removeEventListener('karodeal:billing_changed', handleRealtimeChange);
      clearInterval(liveInterval);
    };
  }, [fetchClaims]);

  // URL Synchronization: Listen to `id` query parameter for deep linking & browser Back/Forward
  useEffect(() => {
    if (!claims || claims.length === 0) return;

    if (idParam) {
      const paramLower = idParam.trim().toLowerCase();
      const found = claims.find(c =>
        (c.ticketId && c.ticketId.toLowerCase() === paramLower) ||
        c.id.toLowerCase() === paramLower ||
        c.id.slice(-6).toUpperCase() === idParam.toUpperCase()
      );

      if (found) {
        if (!viewingClaim || viewingClaim.id !== found.id) {
          openClaimDetails(found);
        }
      }
    } else {
      if (viewingClaim) {
        setViewingClaim(null);
      }
    }
  }, [idParam, claims]);

  // Reset page to 1 whenever any filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, storeFilter, selectedAdmin]);

  // Extract unique and filtered stores
  const uniqueStoreList = Array.from(new Set(claims.map(c => c.storeName).filter(Boolean))).sort();
  const filteredStoreList = uniqueStoreList.filter(s =>
    !storeSearchText || s.toLowerCase().includes(storeSearchText.toLowerCase())
  );

  // Extract all creators for Admin dropdown
  const allCreators = (() => {
    const map = new Map();

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

    adminUsersList.forEach(u => {
      map.set(u.id, {
        id: u.id,
        name: u.name || u.email || (u.role === 'ADMIN' ? 'Main Admin' : 'Sub-Admin'),
        email: u.email,
        role: u.role
      });
    });

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

    return Array.from(map.values()).sort((a, b) => {
      if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
      if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  })();

  // Calculate Claims Summary Metrics based on store, admin, and search
  const claimsSummary = (() => {
    let approvedAmount = 0;
    let approvedCount = 0;
    let pendingAmount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    const baseList = claims.filter(c => {
      const matchesStore = storeFilter === 'ALL' || c.storeName === storeFilter;
      const matchesAdmin = selectedAdmin === 'ALL' || String(c.product?.createdById) === String(selectedAdmin);
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchLower ||
        c.product?.title?.toLowerCase().includes(searchLower) ||
        c.storeName?.toLowerCase().includes(searchLower) ||
        c.orderId?.toLowerCase().includes(searchLower) ||
        c.user?.name?.toLowerCase().includes(searchLower) ||
        c.user?.email?.toLowerCase().includes(searchLower) ||
        (c.ticketId && c.ticketId.toLowerCase().includes(searchLower));
      return matchesStore && matchesAdmin && matchesSearch;
    });

    baseList.forEach(c => {
      if (c.status === 'APPROVED') {
        approvedAmount += Number(c.awardedCashback) || 0;
        approvedCount += 1;
      } else if (c.status === 'PENDING') {
        pendingCount += 1;
        let expCashback = 0;
        if (c.product) {
          const isWithoutReview = c.claimType === 'WITHOUT_REVIEW';
          if (isWithoutReview && c.product.cashbackWithoutReview) {
            expCashback = Number(c.product.cashbackWithoutReview);
          } else if (!isWithoutReview && c.product.cashbackWithReview) {
            expCashback = Number(c.product.cashbackWithReview);
          } else if (c.product.cashback) {
            expCashback = isWithoutReview ? (Number(c.product.cashback) / 2) : Number(c.product.cashback);
          } else {
            const calc = calculateCashback(c.product.salePrice || 0);
            expCashback = isWithoutReview ? calc.withoutReview : calc.withReview;
          }
        }
        pendingAmount += Number(expCashback) || 0;
      } else if (c.status === 'REJECTED') {
        rejectedCount += 1;
      }
    });

    return {
      approvedAmount,
      approvedCount,
      pendingAmount,
      pendingCount,
      rejectedCount
    };
  })();

  // Filtered Claims
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
      c.user?.email?.toLowerCase().includes(searchLower) ||
      (c.ticketId && c.ticketId.toLowerCase().includes(searchLower));
    return matchesStatus && matchesStore && matchesAdmin && matchesSearch;
  });

  // Paginated Claims for Table (25 items per page)
  const paginatedClaims = filteredClaims.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setStoreFilter('ALL');
    setStatusFilter('ALL');
    setSelectedAdmin('ALL');
    setStoreSearchText('');
    setCurrentPage(1);
  };

  // Export to Excel Handler
  const handleExportToExcel = () => {
    if (filteredClaims.length === 0) {
      alert("No data to export!");
      return;
    }

    const data = filteredClaims.map(c => {
      let cashbackAmt = c.awardedCashback || 0;
      if (!cashbackAmt && c.product) {
        const isWithoutReview = c.claimType === 'WITHOUT_REVIEW';
        if (isWithoutReview && c.product.cashbackWithoutReview) {
          cashbackAmt = Number(c.product.cashbackWithoutReview);
        } else if (!isWithoutReview && c.product.cashbackWithReview) {
          cashbackAmt = Number(c.product.cashbackWithReview);
        } else if (c.product.cashback) {
          cashbackAmt = isWithoutReview ? (Number(c.product.cashback) / 2) : Number(c.product.cashback);
        } else {
          const calc = calculateCashback(c.product.salePrice || 0);
          cashbackAmt = isWithoutReview ? calc.withoutReview : calc.withReview;
        }
      }

      return {
        'Ticket ID': c.ticketId || c.id,
        'Claim Date': formatDate(c.createdAt),
        'User Name': c.user?.name || 'Unknown',
        'User Email': c.user?.email || '',
        'User Mobile': c.user?.mobile || '',
        'Store': c.storeName || '',
        'Product': c.product?.title || '',
        'Added By': c.product?.createdBy?.name || c.product?.createdBy?.email || 'Main Admin',
        'Claim Type': c.claimType === 'WITHOUT_REVIEW' ? 'Without Review' : 'With Review',
        'Order ID': c.orderId || '',
        'Order Date': c.orderDate ? new Date(c.orderDate).toLocaleDateString('en-IN') : '',
        'Order Amount (₹)': c.orderAmount || 0,
        'Status': c.status,
        'Cashback Amount (₹)': c.status === 'APPROVED' ? (c.awardedCashback || 0) : (cashbackAmt || 0),
        'Admin Note': c.adminNote || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cashback Claims");
    XLSX.writeFile(workbook, `Cashback_Claims_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Claim Status Update Confirmation
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

  // Execute Claim Status Update via API
  const executeStatusUpdate = async (status) => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
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
        handleBackToList();
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {viewingClaim ? (
        <ClaimDetailView
          claim={viewingClaim}
          onBack={handleBackToList}
          awardedCashback={awardedCashback}
          setAwardedCashback={setAwardedCashback}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          actionError={actionError}
          setActionError={setActionError}
          isUpdating={isUpdating}
          onInitiateStatusUpdate={initiateStatusUpdate}
          formatDate={formatDate}
          getImageUrl={getImageUrl}
          onOpenLightbox={(img) => setLightboxImage(img)}
        />
      ) : (
        <>
          <ClaimsSummaryCards summary={claimsSummary} />

          <ClaimsFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            storeFilter={storeFilter}
            setStoreFilter={setStoreFilter}
            uniqueStoreList={uniqueStoreList}
            filteredStoreList={filteredStoreList}
            storeSearchText={storeSearchText}
            setStoreSearchText={setStoreSearchText}
            selectedAdmin={selectedAdmin}
            setSelectedAdmin={setSelectedAdmin}
            allCreators={allCreators}
            isMainAdmin={role === 'ADMIN'}
            onResetFilters={handleResetFilters}
            onExportExcel={handleExportToExcel}
          />

          <ClaimsTable
            claims={paginatedClaims}
            totalItems={filteredClaims.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            isLoading={isLoading}
            onSelectClaim={handleSelectClaim}
            formatDate={formatDate}
          />
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

      {/* Proof Lightbox */}
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

export default function AdminClaims() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminClaimsContent />
    </Suspense>
  );
}
