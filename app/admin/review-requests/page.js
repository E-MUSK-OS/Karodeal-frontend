'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, Plus, Star } from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import { getSocket } from '@/lib/socket';
import { handleAppError, showSuccessToast } from '@/lib/errorHandler';

import ReviewRequestFilterBar from '@/components/admin/review-requests/ReviewRequestFilterBar';
import ReviewRequestTable from '@/components/admin/review-requests/ReviewRequestTable';
import ApproveRequestModal from '@/components/admin/review-requests/ApproveRequestModal';
import NewRequestModal from '@/components/admin/review-requests/NewRequestModal';
import DeclineRequestModal from '@/components/admin/review-requests/DeclineRequestModal';
import EditRequestModal from '@/components/admin/review-requests/EditRequestModal';
import DeleteRequestModal from '@/components/admin/review-requests/DeleteRequestModal';

export default function ReviewRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [currentRole, setCurrentRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [expandedNoteId, setExpandedNoteId] = useState(null);

  // Modal states
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [approvalModal, setApprovalModal] = useState({ isOpen: false, request: null, targetRank: 1, reviewNote: '' });
  const [declineModal, setDeclineModal] = useState({ isOpen: false, request: null, reviewNote: '' });
  const [editModal, setEditModal] = useState({ isOpen: false, request: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, request: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [starStats, setStarStats] = useState({
    pinnedCount: 0,
    contiguousStarRank: 0,
    maxStarRank: 0,
    nextStarRank: 1,
    pinnedRanks: [],
    pinnedProducts: []
  });

  const showToast = (msg, isError = false) => {
    if (isError) {
      handleAppError(msg, { context: 'Review Requests', title: 'Request Failed' });
    } else {
      showSuccessToast(msg);
    }
  };

  const fetchRequests = useCallback(async (isManualReload = false) => {
    if (isManualReload) {
      setIsReloading(true);
    }
    try {
      const adminStr = localStorage.getItem('adminUser');
      if (!adminStr) return;
      const user = JSON.parse(adminStr);
      setCurrentRole(user.role || 'ADMIN');
      setCurrentUserId(user.id);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
      const statusParam = activeTab === 'ALL' ? '' : `?status=${activeTab}`;
      const res = await fetch(`${apiUrl}/review-requests${statusParam}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        if (data.counts) setCounts(data.counts);
        if (data.starStats) setStarStats(data.starStats);
      }
    } catch (err) {
      console.error('Error fetching review requests:', err);
    } finally {
      setLoading(false);
      setIsReloading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Real-time socket listener
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const handleSocketEvent = () => {
        fetchRequests();
        window.dispatchEvent(new Event('karodeal:star_requests_changed'));
        window.dispatchEvent(new Event('karodeal:review_requests_changed'));
      };
      socket.on('star_requests:changed', handleSocketEvent);
      return () => {
        socket.off('star_requests:changed', handleSocketEvent);
      };
    }
  }, [fetchRequests]);

  // Modal open helpers
  const handleOpenApprovalModal = (req) => {
    const defaultRank = starStats.nextStarRank || 1;
    setApprovalModal({
      isOpen: true,
      request: req,
      targetRank: defaultRank,
      reviewNote: 'Approved for promotion'
    });
  };

  const handleOpenDeclineModal = (req) => {
    setDeclineModal({
      isOpen: true,
      request: req,
      reviewNote: ''
    });
  };

  const handleOpenEditModal = (req) => {
    setEditModal({
      isOpen: true,
      request: req
    });
  };

  const handleOpenDeleteModal = (req) => {
    setDeleteModal({
      isOpen: true,
      request: req
    });
  };

  // Main Admin: Approve Request
  const handleApprove = async () => {
    if (!approvalModal.request) return;
    setIsSubmitting(true);
    try {
      const adminStr = localStorage.getItem('adminUser');
      const user = adminStr ? JSON.parse(adminStr) : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

      const chosenRank = parseInt(approvalModal.targetRank, 10) || starStats.nextStarRank || 1;

      const res = await fetch(`${apiUrl}/review-requests/${approvalModal.request.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          targetRank: chosenRank,
          reviewNote: approvalModal.reviewNote?.trim() || 'Approved for promotion'
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`⭐ Approved! Product is now a Star Product at Rank #${data.approvedRank}.`);
        setApprovalModal({ isOpen: false, request: null, targetRank: 1, reviewNote: '' });
        fetchRequests();
        window.dispatchEvent(new Event('karodeal:star_requests_changed'));
        window.dispatchEvent(new Event('karodeal:review_requests_changed'));
      } else {
        showToast(data.error || 'Failed to approve request', true);
      }
    } catch (err) {
      showToast(err, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main Admin: Decline Request
  const handleDecline = async () => {
    if (!declineModal.request) return;
    setIsSubmitting(true);
    try {
      const adminStr = localStorage.getItem('adminUser');
      const user = adminStr ? JSON.parse(adminStr) : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

      const res = await fetch(`${apiUrl}/review-requests/${declineModal.request.id}/decline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          reviewNote: declineModal.reviewNote || 'Declined by Main Administrator'
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Review request declined.');
        setDeclineModal({ isOpen: false, request: null, reviewNote: '' });
        fetchRequests();
        window.dispatchEvent(new Event('karodeal:star_requests_changed'));
        window.dispatchEvent(new Event('karodeal:review_requests_changed'));
      } else {
        showToast(data.error || 'Failed to decline request', true);
      }
    } catch (err) {
      showToast(err, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Request (Sub-Admin or Main Admin)
  const handleDeleteConfirm = async () => {
    if (!deleteModal.request) return;
    setIsDeleting(true);
    try {
      const adminStr = localStorage.getItem('adminUser');
      const user = adminStr ? JSON.parse(adminStr) : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

      const res = await fetch(`${apiUrl}/review-requests/${deleteModal.request.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Review request deleted successfully.');
        setDeleteModal({ isOpen: false, request: null });
        fetchRequests();
        window.dispatchEvent(new Event('karodeal:star_requests_changed'));
        window.dispatchEvent(new Event('karodeal:review_requests_changed'));
      } else {
        showToast(data.error || 'Failed to delete request', true);
      }
    } catch (err) {
      showToast(err, true);
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination state (25 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Reset pagination on search or status filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Filter requests strictly by Product Title
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const query = searchQuery.toLowerCase().trim();
    return requests.filter(req => {
      return req.product?.title?.toLowerCase().includes(query);
    });
  }, [requests, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = useMemo(() => {
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequests, startIndex, itemsPerPage]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <PageLoader />
      </div>
    );
  }

  const isMainAdmin = currentRole === 'ADMIN';

  const statusOptions = [
    { id: 'ALL', label: 'All Requests', count: counts.total, dot: 'bg-neutral-500' },
    { id: 'PENDING', label: 'Pending Review', count: counts.pending, dot: 'bg-amber-500' },
    { id: 'APPROVED', label: 'Approved', count: counts.approved, dot: 'bg-emerald-500' },
    { id: 'REJECTED', label: 'Declined', count: counts.rejected, dot: 'bg-rose-500' }
  ];

  const currentStatusLabel = statusOptions.find(o => o.id === activeTab)?.label || 'All Requests';

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-black text-neutral-900 tracking-tight">
              Review Requests
            </h2>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              isMainAdmin ? 'bg-neutral-900 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {isMainAdmin ? 'Main Admin' : 'Sub-Admin'}
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            {isMainAdmin 
              ? 'Review, verify, and approve product review requests submitted by sub-administrators.' 
              : 'Submit and track your product review requests for promotional placement.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Reload Button */}
          <Button
            variant="none"
            size="none"
            onClick={() => fetchRequests(true)}
            disabled={isReloading}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-700 rounded-xl border border-neutral-200 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold disabled:opacity-60"
            title="Reload requests"
          >
            <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin text-[#f96b02]' : ''}`} />
            <span>{isReloading ? 'Reloading...' : 'Reload'}</span>
          </Button>

          {/* Sub-Admin Raise Request Button */}
          {!isMainAdmin && (
            <Button
              variant="none"
              size="none"
              onClick={() => setIsNewRequestModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-black hover:bg-[#f96b02] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Review Request</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar Component */}
      <ReviewRequestFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        statusOptions={statusOptions}
        currentStatusLabel={currentStatusLabel}
      />

      {/* Table & Cards Component */}
      <ReviewRequestTable
        requests={paginatedRequests}
        totalItems={filteredRequests.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        startIndex={startIndex}
        totalPages={totalPages}
        isMainAdmin={isMainAdmin}
        isReloading={isReloading}
        searchQuery={searchQuery}
        activeTab={activeTab}
        currentStatusLabel={currentStatusLabel}
        expandedNoteId={expandedNoteId}
        setExpandedNoteId={setExpandedNoteId}
        onOpenApproveModal={handleOpenApprovalModal}
        onOpenDeclineModal={handleOpenDeclineModal}
        onOpenEditModal={handleOpenEditModal}
        onOpenDeleteModal={handleOpenDeleteModal}
      />

      {/* Sub-Admin New Request Modal */}
      <NewRequestModal
        isOpen={isNewRequestModalOpen}
        currentRole={currentRole}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSuccess={() => {
          fetchRequests();
          window.dispatchEvent(new Event('karodeal:star_requests_changed'));
          window.dispatchEvent(new Event('karodeal:review_requests_changed'));
        }}
        showToast={showToast}
      />

      {/* Main Admin Approve Request Modal */}
      <ApproveRequestModal
        isOpen={approvalModal.isOpen}
        request={approvalModal.request}
        targetRank={approvalModal.targetRank}
        setTargetRank={(val) => setApprovalModal((prev) => ({ ...prev, targetRank: val }))}
        reviewNote={approvalModal.reviewNote}
        setReviewNote={(val) => setApprovalModal((prev) => ({ ...prev, reviewNote: val }))}
        starStats={starStats}
        isSubmitting={isSubmitting}
        onClose={() => setApprovalModal({ isOpen: false, request: null, targetRank: 1, reviewNote: '' })}
        onConfirm={handleApprove}
      />

      {/* Main Admin Decline Request Modal */}
      <DeclineRequestModal
        isOpen={declineModal.isOpen}
        request={declineModal.request}
        reviewNote={declineModal.reviewNote}
        setReviewNote={(val) => setDeclineModal((prev) => ({ ...prev, reviewNote: val }))}
        isSubmitting={isSubmitting}
        onClose={() => setDeclineModal({ isOpen: false, request: null, reviewNote: '' })}
        onConfirm={handleDecline}
      />

      {/* Edit Request Modal */}
      <EditRequestModal
        isOpen={editModal.isOpen}
        request={editModal.request}
        onClose={() => setEditModal({ isOpen: false, request: null })}
        onSuccess={() => {
          fetchRequests();
          window.dispatchEvent(new Event('karodeal:star_requests_changed'));
          window.dispatchEvent(new Event('karodeal:review_requests_changed'));
        }}
        showToast={showToast}
      />

      {/* Delete Request Modal */}
      <DeleteRequestModal
        isOpen={deleteModal.isOpen}
        request={deleteModal.request}
        isSubmitting={isDeleting}
        onClose={() => setDeleteModal({ isOpen: false, request: null })}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
