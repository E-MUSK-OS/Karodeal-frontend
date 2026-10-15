'use client';

import { ArrowRight, ChevronLeft, ChevronRight, Inbox, Store, Clock, Calendar, User, FileText } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

export default function ClaimsTable({
  claims = [],
  totalItems = 0,
  currentPage = 1,
  setCurrentPage,
  itemsPerPage = 25,
  isLoading = false,
  onSelectClaim,
  formatDate
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
        <PageLoader />
        <p className="text-xs text-neutral-500 font-semibold mt-3">Loading cashback claims...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm w-full overflow-hidden">
      {/* Table Top Summary Bar */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Showing {totalItems > 0 ? `${startIndex + 1} - ${Math.min(startIndex + itemsPerPage, totalItems)} of ${totalItems}` : '0'} Claims
        </span>
        <span className="text-xs text-neutral-400 font-medium">
          Page <strong className="text-neutral-700">{currentPage}</strong> of <strong className="text-neutral-700">{totalPages}</strong>
        </span>
      </div>

      {claims.length === 0 ? (
        <div className="p-12 text-center text-neutral-500">
          <Inbox className="w-10 h-10 stroke-[1.5] mx-auto mb-2 text-neutral-300" />
          <p className="font-bold text-neutral-700 text-sm">No cashback claims found</p>
          <p className="text-xs text-neutral-400 mt-1">Try adjusting your search or filter options.</p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS VIEW (< md screens) */}
          <div className="block md:hidden divide-y divide-neutral-100">
            {claims.map((claim, index) => {
              const serialNo = startIndex + index + 1;
              const isRecentPending = claim.status === 'PENDING' && (new Date() - new Date(claim.createdAt)) < 24 * 60 * 60 * 1000;

              return (
                <div
                  key={claim.id}
                  onClick={() => onSelectClaim(claim)}
                  className="p-4 space-y-3 bg-white hover:bg-neutral-50/70 transition-colors cursor-pointer"
                >
                  {/* Card Header: Ticket ID & Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                        #{claim.ticketId || claim.id.slice(-6).toUpperCase()}
                      </span>
                      {isRecentPending && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> New
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      claim.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {claim.status}
                    </span>
                  </div>

                  {/* User & Store details */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-900">{claim.user?.name || 'Unknown User'}</span>
                      <span className="font-bold text-neutral-900 text-sm">₹{claim.orderAmount}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500">{claim.user?.email}</p>
                  </div>

                  {/* Store & Product info */}
                  <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-100 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-neutral-400" />
                        {claim.storeName}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        claim.claimType === 'WITHOUT_REVIEW'
                          ? 'bg-neutral-200 text-neutral-700'
                          : 'bg-orange-100 text-[#f96b02]'
                      }`}>
                        {claim.claimType === 'WITHOUT_REVIEW' ? '⚡ W/O Review' : '🌟 With Review'}
                      </span>
                    </div>
                    {claim.product?.title && (
                      <p className="text-xs text-neutral-600 truncate font-medium">{claim.product.title}</p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-1 text-xs text-neutral-400">
                    <span>{formatDate(claim.createdAt)}</span>
                    <span className="text-[#f96b02] font-bold flex items-center gap-1">
                      View Claim <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW (>= md screens) */}
          <div className="hidden md:block overflow-x-auto w-full">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Store & Claim</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Order Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {claims.map((claim) => (
                  <tr
                    key={claim.id}
                    onClick={() => onSelectClaim(claim)}
                    className="hover:bg-neutral-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-neutral-900">{claim.user?.name || 'Unknown'}</p>
                        <span className="text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                          #{claim.ticketId || claim.id.slice(-6).toUpperCase()}
                        </span>
                        {claim.status === 'PENDING' && (new Date() - new Date(claim.createdAt)) < 24 * 60 * 60 * 1000 && (
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Submitted within last 24h"></div>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500">{claim.user?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-neutral-900">{claim.storeName}</p>
                      {claim.product && (
                        <>
                          <p className="text-xs text-blue-500 font-semibold truncate max-w-[220px] mb-0.5" title={claim.product.title}>
                            {claim.product.title}
                          </p>
                          {claim.product.createdBy && (
                            <p className="text-[10px] text-neutral-400 font-medium mb-1">
                              Added by: <span className="font-semibold text-neutral-600">{claim.product.createdBy.name || claim.product.createdBy.email}</span>
                            </p>
                          )}
                        </>
                      )}
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        claim.claimType === 'WITHOUT_REVIEW'
                          ? 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                          : 'bg-orange-50 text-[#f96b02] border border-orange-200'
                      }`}>
                        {claim.claimType === 'WITHOUT_REVIEW' ? '⚡ W/O Review' : '🌟 With Review'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-neutral-900">₹{claim.orderAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
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
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-3 bg-neutral-50/50">
          <div className="text-xs text-neutral-500 font-semibold">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
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
                    className={`min-w-[32px] h-8 px-2 flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
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
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
