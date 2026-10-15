'use client';

import { 
  Star, CheckCircle2, XCircle, Clock, Store, 
  MessageSquare, Check, X, ChevronLeft, ChevronRight,
  TrendingUp, Sparkles
} from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';

export default function ReviewRequestTable({
  requests,
  totalItems,
  currentPage,
  setCurrentPage,
  itemsPerPage = 25,
  startIndex = 0,
  totalPages = 1,
  isMainAdmin,
  isReloading,
  searchQuery,
  activeTab,
  currentStatusLabel,
  expandedNoteId,
  setExpandedNoteId,
  onOpenApproveModal,
  onOpenDeclineModal
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* Table Header Summary Bar */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Showing {totalItems > 0 ? `${startIndex + 1} - ${Math.min(startIndex + itemsPerPage, totalItems)} of ${totalItems}` : '0'} Requests
        </span>
        <span className="text-xs text-neutral-400">
          Status Filter: <strong className="text-neutral-700">{currentStatusLabel}</strong>
        </span>
      </div>

      {/* MOBILE CARDS VIEW (visible on screen widths < 768px) */}
      <div className="block md:hidden divide-y divide-neutral-100">
        {isReloading ? (
          <div className="p-8 text-center">
            <PageLoader />
            <p className="text-xs text-neutral-500 font-semibold mt-2">Refreshing requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <Star className="w-8 h-8 stroke-[1.5] mx-auto mb-2 text-neutral-300" />
            <p className="font-bold text-neutral-700">No review requests found</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {searchQuery 
                ? `No product title matches "${searchQuery}".` 
                : activeTab === 'PENDING' 
                ? 'No pending review requests at this moment.' 
                : 'No records match your filter.'}
            </p>
          </div>
        ) : (
          requests.map((req, index) => {
            const isPending = req.status === 'PENDING';
            const isApproved = req.status === 'APPROVED';
            const isRejected = req.status === 'REJECTED';
            const serialNo = startIndex + index + 1;

            return (
              <div 
                key={req.id}
                className="p-4 space-y-3 bg-white hover:bg-neutral-50/50 transition-colors"
              >
                {/* Card Header: Serial, Store, Status */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                      #{serialNo}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                      <Store className="w-3 h-3 text-neutral-500" />
                      {req.product?.storeRel?.name || 'Store'}
                    </span>
                  </div>

                  <div>
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3" />
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                    <img
                      src={req.product?.image}
                      alt={req.product?.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-neutral-900 line-clamp-2">
                      {req.product?.title}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-semibold mt-0.5 flex items-center gap-2">
                      <span>₹{req.product?.salePrice}</span>
                      {isMainAdmin && req.product?.sortOrder && (
                        <span className="font-mono text-neutral-800 font-black">
                          Rank #{req.product.sortOrder}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requested by (MAIN ADMIN ONLY) */}
                {isMainAdmin && (
                  <div className="flex items-center gap-2 text-xs bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                    <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-bold text-[10px] shrink-0">
                      {req.requestedBy?.name?.[0] || 'A'}
                    </div>
                    <span className="font-bold text-neutral-900 text-[11px]">
                      {req.requestedBy?.name || 'Administrator'}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase">
                      ({req.requestedBy?.role || 'SUB_ADMIN'})
                    </span>
                  </div>
                )}

                {/* Target / QTY Requested Section (Mobile) */}
                {(req.requestType || req.orderQty != null || req.reviewQty != null) && (
                  <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                        Requested Target
                      </span>
                      {req.requestType && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white text-amber-900 border border-amber-200 shadow-2xs">
                          {req.requestType}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {req.orderQty != null ? (
                        <div className="bg-white p-2 rounded-lg border border-blue-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase">Order:</span>
                          <span className="font-mono font-black text-blue-700">{req.orderQty} QTY</span>
                        </div>
                      ) : (
                        <div className="bg-white p-2 rounded-lg border border-neutral-100 flex items-center justify-between opacity-50">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">Order:</span>
                          <span className="text-xs text-neutral-400">-</span>
                        </div>
                      )}
                      {req.reviewQty != null ? (
                        <div className="bg-white p-2 rounded-lg border border-purple-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase">Reviews:</span>
                          <span className="font-mono font-black text-purple-700">{req.reviewQty} QTY</span>
                        </div>
                      ) : (
                        <div className="bg-white p-2 rounded-lg border border-neutral-100 flex items-center justify-between opacity-50">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">Reviews:</span>
                          <span className="text-xs text-neutral-400">-</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="text-xs text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <div className="flex items-start gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs text-neutral-800 break-words break-all whitespace-pre-wrap leading-relaxed ${
                        expandedNoteId === req.id ? '' : 'line-clamp-2'
                      }`}>
                        {req.note}
                      </p>
                      {req.note && req.note.length > 60 && (
                        <button
                          type="button"
                          onClick={() => setExpandedNoteId(expandedNoteId === req.id ? null : req.id)}
                          className="text-[11px] font-bold text-[#f96b02] hover:underline mt-1 cursor-pointer block"
                        >
                          {expandedNoteId === req.id ? 'Show less' : 'Read more...'}
                        </button>
                      )}
                    </div>
                  </div>
                  {req.reviewNote && (
                    <div className="text-[11px] text-neutral-600 mt-2 pt-2 border-t border-neutral-200/70 italic break-words break-all">
                      <span className="font-semibold text-neutral-700 not-italic">Admin note:</span> {req.reviewNote}
                    </div>
                  )}
                </div>

                {/* Main Admin Action Buttons on mobile */}
                {isMainAdmin && isPending && (
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="none"
                      size="none"
                      onClick={() => onOpenApproveModal(req)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </Button>
                    <Button
                      variant="none"
                      size="none"
                      onClick={() => onOpenDeclineModal(req)}
                      className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW (visible on screen widths >= 768px) */}
      <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[70vh] w-full">
        <table className={`w-full text-left border-collapse text-sm ${isMainAdmin ? 'min-w-[1050px]' : 'min-w-[750px]'}`}>
          <thead className="sticky top-0 z-20">
            <tr className="bg-neutral-50 text-neutral-500 text-xs font-bold uppercase tracking-wider shadow-[0_1px_0_0_#e5e5e5]">
              <th className="p-4 pl-6 w-20">SR. NO.</th>
              <th className="p-4">PRODUCT</th>
              <th className="p-4">STORE</th>
              {isMainAdmin && <th className="p-4">CURRENT RANK</th>}
              {isMainAdmin && <th className="p-4">REQUESTED BY</th>}
              <th className="p-4">TARGET QTY</th>
              <th className="p-4">NOTES</th>
              <th className="p-4 text-center">STATUS</th>
              {isMainAdmin && <th className="p-4 pr-6 text-right">ACTIONS</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isReloading ? (
              <tr>
                <td colSpan={isMainAdmin ? 9 : 6} className="p-12 text-center">
                  <PageLoader />
                  <p className="text-xs text-neutral-500 font-semibold mt-2">Refreshing requests...</p>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={isMainAdmin ? 9 : 6} className="p-12 text-center text-neutral-500">
                  <Star className="w-8 h-8 stroke-[1.5] mx-auto mb-2 text-neutral-300" />
                  <p className="font-bold text-neutral-700">No review requests found</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {searchQuery 
                      ? `No product title matches "${searchQuery}".` 
                      : activeTab === 'PENDING' 
                      ? 'No pending review requests at this moment.' 
                      : 'No records match your filter.'}
                  </p>
                </td>
              </tr>
            ) : (
              requests.map((req, index) => {
                const isPending = req.status === 'PENDING';
                const isApproved = req.status === 'APPROVED';
                const isRejected = req.status === 'REJECTED';
                const serialNo = startIndex + index + 1;

                return (
                  <tr 
                    key={req.id}
                    className="bg-white hover:bg-neutral-50/80 transition-colors"
                  >
                    {/* SR. NO. in series matching current page (e.g. 1..25, 26..50) */}
                    <td className="p-4 pl-6 font-mono text-xs font-bold text-neutral-500">
                      {serialNo}
                    </td>

                    {/* Product Thumbnail & Title */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                          <img
                            src={req.product?.image}
                            alt={req.product?.title}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <div className="font-bold text-xs text-neutral-900 line-clamp-1">
                            {req.product?.title}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">
                            ₹{req.product?.salePrice}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Store */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                        <Store className="w-3 h-3 text-neutral-500" />
                        {req.product?.storeRel?.name || 'Store'}
                      </span>
                    </td>

                    {/* Current Rank (Main Admin view only) */}
                    {isMainAdmin && (
                      <td className="p-4">
                        <span className="font-mono text-xs font-black text-neutral-800">
                          #{req.product?.sortOrder ?? '-'}
                        </span>
                      </td>
                    )}

                    {/* Requested By (Main Admin view only) */}
                    {isMainAdmin && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-bold text-xs shrink-0">
                            {req.requestedBy?.name?.[0] || 'A'}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-neutral-900">
                              {req.requestedBy?.name || 'Administrator'}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-semibold uppercase">
                              ({req.requestedBy?.role || 'SUB_ADMIN'})
                            </div>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Target QTY Requested (Main Admin & Sub-Admin view) */}
                    <td className="p-4 whitespace-nowrap min-w-[190px]">
                      {req.requestType || req.orderQty != null || req.reviewQty != null ? (
                        <div className="space-y-1.5">
                          {req.requestType && (
                            <div>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                req.requestType === 'Order + Reviews Increase'
                                  ? 'bg-[#fffbeb] text-[#92400e] border-[#fde047]'
                                  : req.requestType === 'Order Increase'
                                  ? 'bg-blue-50 text-blue-900 border-blue-200'
                                  : 'bg-purple-50 text-purple-900 border-purple-200'
                              }`}>
                                {req.requestType === 'Order + Reviews Increase' ? (
                                  <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b] shrink-0" />
                                ) : req.requestType === 'Order Increase' ? (
                                  <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                )}
                                <span>{req.requestType}</span>
                              </span>
                            </div>
                          )}
                          {(req.orderQty != null || req.reviewQty != null) ? (
                            <div className="flex items-center gap-1.5 pt-0.5">
                              {req.orderQty != null && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200">
                                  <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-wide">ORDER:</span>
                                  <span className="font-mono font-black text-neutral-900">{req.orderQty}</span>
                                </span>
                              )}
                              {req.reviewQty != null && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200">
                                  <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-wide">REVIEWS:</span>
                                  <span className="font-mono font-black text-neutral-900">{req.reviewQty}</span>
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-neutral-300 text-xs font-medium pl-1">—</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="p-4 max-w-sm min-w-[200px]">
                      <div className="text-xs text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                        <div className="flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs text-neutral-800 break-words break-all whitespace-pre-wrap leading-relaxed ${
                              expandedNoteId === req.id ? '' : 'line-clamp-2'
                            }`}>
                              {req.note}
                            </p>
                            {req.note && req.note.length > 60 && (
                              <button
                                type="button"
                                onClick={() => setExpandedNoteId(expandedNoteId === req.id ? null : req.id)}
                                className="text-[11px] font-bold text-[#f96b02] hover:underline mt-1 cursor-pointer block"
                              >
                                {expandedNoteId === req.id ? 'Show less' : 'Read more...'}
                              </button>
                            )}
                          </div>
                        </div>
                        {req.reviewNote && (
                          <div className="text-[11px] text-neutral-600 mt-2 pt-2 border-t border-neutral-200/70 italic break-words break-all">
                            <span className="font-semibold text-neutral-700 not-italic">Admin note:</span> {req.reviewNote}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          Declined
                        </span>
                      )}
                    </td>

                    {/* Actions (Main Admin only) */}
                    {isMainAdmin && (
                      <td className="p-4 pr-6 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="none"
                              size="none"
                              onClick={() => onOpenApproveModal(req)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Approve Request"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </Button>
                            <Button
                              variant="none"
                              size="none"
                              onClick={() => onOpenDeclineModal(req)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="Decline Request"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-neutral-400 font-semibold italic">
                            Resolved
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls (25 items per page) */}
      <div className="px-4 py-3.5 sm:px-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
        <div className="text-xs text-neutral-500 font-medium">
          {totalItems > 0 ? (
            <>
              Showing <strong className="text-neutral-900">{startIndex + 1}</strong> to{' '}
              <strong className="text-neutral-900">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </strong>{' '}
              of <strong className="text-neutral-900">{totalItems}</strong> entries
              <span className="ml-2 text-neutral-400 font-normal hidden sm:inline">(25 per page)</span>
            </>
          ) : (
            'Showing 0 entries'
          )}
        </div>

        {totalPages > 1 && (
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
        )}
      </div>
    </div>
  );
}
