'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import ConfirmModal from '@/components/common/ConfirmModal';
import * as XLSX from 'xlsx';
import PayoutFilterBar from '@/components/admin/payouts/PayoutFilterBar';
import { handleAppError, showSuccessToast, showErrorToast } from '@/lib/errorHandler';

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [processingId, setProcessingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => {}, isDestructive: false });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, payoutId: null, note: '' });

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setIsLoading(true);
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/payouts/admin`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = async (id, status, adminNote = '', skipConfirm = false) => {
    const processAction = async () => {
      setProcessingId(id);
      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
        const user = JSON.parse(userStr);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/payouts/admin/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ status, adminNote })
        });

        if (res.ok) {
          // Update local state
          setPayouts(payouts.map(p => p.id === id ? { ...p, status, adminNote } : p));
          showSuccessToast(`Payout marked as ${status}.`);
        } else {
          const data = await res.json().catch(() => ({}));
          handleAppError(data.error || 'Failed to process payout', {
            context: 'Admin Payouts / Process',
            title: 'Payout Update Failed'
          });
        }
      } catch (err) {
        handleAppError(err, {
          context: 'Admin Payouts / Process Network',
          title: 'Connection Error'
        });
      } finally {
        setProcessingId(null);
      }
    };

    if (skipConfirm) {
      processAction();
    } else {
      setConfirmModal({
        isOpen: true,
        title: 'Process Payout',
        message: `Are you sure you want to mark this payout as ${status === 'APPROVED' ? 'APPROVED' : 'REJECTED'}?`,
        confirmText: status === 'APPROVED' ? 'Yes, Approve' : 'Yes, Reject',
        isDestructive: status === 'REJECTED',
        onConfirm: processAction
      });
    }
  };

  // Reset page to 1 whenever search query or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Filter ONLY by user (name, email, mobile) and transaction status
  const filteredPayouts = payouts.filter(p => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesUser = !searchLower ||
      (p.user?.name && p.user.name.toLowerCase().includes(searchLower)) ||
      (p.user?.email && p.user.email.toLowerCase().includes(searchLower)) ||
      (p.user?.mobile && p.user.mobile.toLowerCase().includes(searchLower));
    return matchesStatus && matchesUser;
  });

  // Calculate status counts for dropdown badges
  const counts = {
    all: payouts.length,
    pending: payouts.filter(p => p.status === 'PENDING').length,
    approved: payouts.filter(p => p.status === 'APPROVED').length,
    rejected: payouts.filter(p => p.status === 'REJECTED').length
  };

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredPayouts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayouts = filteredPayouts.slice(startIndex, startIndex + itemsPerPage);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const handleExportToExcel = () => {
    if (filteredPayouts.length === 0) {
      showErrorToast("No data to export!", "Export Failed");
      return;
    }

    const data = filteredPayouts.map(p => ({
      'Date': new Date(p.createdAt).toLocaleDateString('en-IN'),
      'User Name': p.user?.name || 'Unknown',
      'Email': p.user?.email || '',
      'Amount': p.amount,
      'Method': p.method ? p.method.replace('_', ' ') : 'N/A',
      'Payment UPI': p.paymentDetails || '',
      'Status': p.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payouts");
    XLSX.writeFile(workbook, `Payout_Requests_${new Date().toISOString().split('T')[0]}.xlsx`);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Filter Bar with User-Only Search, Status Dropdown, and Excel Export */}
      <PayoutFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        counts={counts}
        onResetFilters={handleResetFilters}
        onExportExcel={handleExportToExcel}
      />

      {/* Main Payouts Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden w-full">
        {/* Table Summary Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-2 bg-neutral-50/50">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Showing {filteredPayouts.length > 0 ? `${startIndex + 1} - ${Math.min(startIndex + itemsPerPage, filteredPayouts.length)} of ${filteredPayouts.length}` : '0'} Requests
          </span>
          <span className="text-xs text-neutral-400 font-medium">
            Status Filter: <strong className="text-neutral-700 capitalize">{statusFilter.toLowerCase()}</strong>
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <PageLoader />
            <p className="text-xs text-neutral-500 font-semibold mt-3">Loading payout requests...</p>
          </div>
        ) : (
          <>
            {/* MOBILE CARDS VIEW (< md screens) */}
            <div className="block md:hidden divide-y divide-neutral-100">
              {paginatedPayouts.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">
                  No payout requests found matching your filters.
                </div>
              ) : (
                paginatedPayouts.map((payout) => (
                  <div key={payout.id} className="p-4 space-y-3 bg-white hover:bg-neutral-50/60 transition-colors">
                    {/* Header: User & Status */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <div className="font-bold text-sm text-neutral-900">{payout.user?.name || 'No Name'}</div>
                        <div className="text-xs text-neutral-500">{payout.user?.email}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        payout.status === 'PENDING' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                        payout.status === 'APPROVED' ? 'text-green-700 bg-green-50 border-green-200' :
                        'text-red-700 bg-red-50 border-red-200'
                      }`}>
                        {payout.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {payout.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                        {payout.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {payout.status}
                      </span>
                    </div>

                    {/* Amount & UPI ID */}
                    <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">Amount:</span>
                        <div className="font-black text-base text-emerald-600 flex items-center">
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {payout.amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-neutral-500 shrink-0">UPI ID:</span>
                        <span className="text-xs font-mono font-bold text-neutral-900 break-all text-right">
                          {payout.paymentDetails}
                        </span>
                      </div>
                      {payout.adminNote && (
                        <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                          Note: {payout.adminNote}
                        </div>
                      )}
                    </div>

                    {/* Footer: Date & Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-neutral-400">{formatDate(payout.createdAt)}</span>
                      {payout.status === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <Button variant="none" size="none"
                            onClick={() => handleProcess(payout.id, 'APPROVED')}
                            disabled={processingId === payout.id}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Approve
                          </Button>
                          <Button variant="none" size="none"
                            onClick={() => setRejectModal({ isOpen: true, payoutId: payout.id, note: '' })}
                            disabled={processingId === payout.id}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 font-medium">Finalized</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* DESKTOP TABLE VIEW (>= md screens) */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase">User</th>
                    <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase">Amount</th>
                    <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase">UPI ID</th>
                    <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase">Status</th>
                    <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase">Requested Date</th>
                    <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paginatedPayouts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-neutral-500 font-medium">
                        No payout requests found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedPayouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-sm text-neutral-900">{payout.user?.name || 'No Name'}</div>
                          <div className="text-xs text-neutral-500">{payout.user?.email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-black text-sm text-emerald-600 flex items-center">
                            <IndianRupee className="w-4 h-4 mr-0.5" />
                            {payout.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-mono font-bold text-neutral-900 break-all">
                            {payout.paymentDetails}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {payout.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-200">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                          {payout.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full text-xs font-bold border border-green-200">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          )}
                          {payout.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full text-xs font-bold border border-red-200">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          )}

                          {payout.adminNote && (
                            <p className="text-[11px] text-neutral-500 mt-1 max-w-[180px] truncate" title={payout.adminNote}>
                              Note: {payout.adminNote}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-neutral-500">
                          {formatDate(payout.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {payout.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="none" size="none"
                                onClick={() => handleProcess(payout.id, 'APPROVED')}
                                disabled={processingId === payout.id}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                              >
                                Approve
                              </Button>
                              <Button variant="none" size="none"
                                onClick={() => setRejectModal({ isOpen: true, payoutId: payout.id, note: '' })}
                                disabled={processingId === payout.id}
                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-400 font-medium">Finalized</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-3 bg-neutral-50/50">
                <div className="text-xs text-neutral-500 font-semibold">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center justify-center gap-1 sm:gap-1.5 max-w-full overflow-x-auto py-0.5">
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
              </div>
            )}
          </>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col text-left">
              <h4 className="font-extrabold text-neutral-900 mb-2">
                Reject Payout
              </h4>
              <p className="text-sm text-neutral-500 mb-4 font-medium">
                Reason for rejection (optional):
              </p>

              <textarea
                value={rejectModal.note}
                onChange={(e) => setRejectModal({ ...rejectModal, note: e.target.value })}
                placeholder="e.g. Invalid bank details or IFSC"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black mb-6 resize-none text-xs sm:text-sm"
                rows="3"
              />

              <div className="flex items-center gap-3 w-full">
                <Button variant="none" size="none"
                  onClick={() => setRejectModal({ isOpen: false, payoutId: null, note: '' })}
                  className="flex-1 px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </Button>
                <Button variant="none" size="none"
                  onClick={() => {
                    handleProcess(rejectModal.payoutId, 'REJECTED', rejectModal.note, true);
                    setRejectModal({ isOpen: false, payoutId: null, note: '' });
                  }}
                  className="flex-1 px-5 py-3 font-bold text-sm rounded-xl transition-colors text-white bg-red-600 hover:bg-red-700 shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] cursor-pointer"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
}
