'use client';

import { ShieldAlert, Clock, CheckCircle, XCircle, ArrowRight, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

export default function MissingCashbackTable({
  tickets = [],
  totalItems = 0,
  currentPage = 1,
  setCurrentPage,
  itemsPerPage = 25,
  isLoading = false,
  onSelectTicket,
  formatDate
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
        <PageLoader />
        <p className="text-xs text-neutral-500 font-semibold mt-3">Loading missing cashback claims...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm w-full overflow-hidden">
      {/* Table Top Summary Bar */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Showing {totalItems > 0 ? `${startIndex + 1} - ${Math.min(startIndex + itemsPerPage, totalItems)} of ${totalItems}` : '0'} Tickets
        </span>
        <span className="text-xs text-neutral-400 font-medium">
          Page <strong className="text-neutral-700">{currentPage}</strong> of <strong className="text-neutral-700">{totalPages}</strong>
        </span>
      </div>

      {tickets.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-neutral-300 mb-3" />
          <h3 className="font-bold text-neutral-900 mb-1 text-sm">No claims found</h3>
          <p className="text-xs text-neutral-500">There are no missing cashback tickets matching your criteria.</p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS VIEW (< md screens) */}
          <div className="block md:hidden divide-y divide-neutral-100">
            {tickets.map((ticket, index) => {
              const prod = ticket.product || ticket.matchedClaim?.product;
              const serialNo = startIndex + index + 1;

              return (
                <div
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket)}
                  className="p-4 space-y-3 bg-white hover:bg-neutral-50/70 transition-colors cursor-pointer"
                >
                  {/* Card Header: Ticket ID & Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                        #{ticket.ticketId || ticket.id.slice(-6).toUpperCase()}
                      </span>
                      {ticket.adminUnread && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> New Msg
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                      ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                      ticket.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                      'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {ticket.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {ticket.status === 'RESOLVED' && <CheckCircle className="w-3 h-3" />}
                      {ticket.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                      {ticket.status}
                    </span>
                  </div>

                  {/* User & Store details */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-900">{ticket.user?.name || 'Unknown User'}</span>
                      <span className="font-bold text-neutral-900 text-sm">₹{ticket.orderAmount}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500">{ticket.user?.email}</p>
                  </div>

                  {/* Store & Product info */}
                  <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-100 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {ticket.storeName}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        ID: {ticket.orderId}
                      </span>
                    </div>
                    {prod?.title && (
                      <p className="text-xs text-neutral-700 truncate font-semibold">
                        📦 {prod.title}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-1 text-xs text-neutral-400">
                    <span>Raised: {formatDate(ticket.createdAt)}</span>
                    <span className="text-[#f96b02] font-bold flex items-center gap-1">
                      View Ticket <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW (>= md screens) */}
          <div className="hidden md:block overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">User & Store</th>
                  <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Order Details</th>
                  <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Dates</th>
                  <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {tickets.map((ticket) => {
                  const prod = ticket.product || ticket.matchedClaim?.product;
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => onSelectTicket(ticket)}
                      className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-neutral-900">{ticket.user?.name || 'Unknown'}</span>
                          <span className="text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                            #{ticket.ticketId || ticket.id.slice(-6).toUpperCase()}
                          </span>
                          {ticket.adminUnread && (
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1" title="Unread user message"></span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-500 mb-1">{ticket.user?.email}</div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">
                            {ticket.storeName}
                          </span>
                          {prod && (
                            <span className="inline-block bg-neutral-100 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-200 max-w-[170px] truncate" title={prod.title}>
                              📦 {prod.title}
                            </span>
                          )}
                        </div>
                        {prod?.createdBy && (
                          <div className="text-[10px] text-neutral-400 mt-1">
                            Added by: <span className="font-semibold text-neutral-600">{prod.createdBy.name || prod.createdBy.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-sm text-neutral-900">₹{ticket.orderAmount}</div>
                        <div className="text-xs font-mono text-neutral-500">ID: {ticket.orderId}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs text-neutral-500"><span className="text-sm lg:text-[15px] xl:text-base font-medium">Ordered:</span> {formatDate(ticket.orderDate)}</div>
                        <div className="text-xs text-neutral-500"><span className="text-sm lg:text-[15px] xl:text-base font-medium">Raised:</span> {formatDate(ticket.createdAt)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                          ticket.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {ticket.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {ticket.status === 'RESOLVED' && <CheckCircle className="w-3 h-3" />}
                          {ticket.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#f96b02] transition-colors transform group-hover:translate-x-1 inline-block" />
                      </td>
                    </tr>
                  );
                })}
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

          <div className="flex items-center justify-center gap-1 sm:gap-1.5 max-w-full overflow-x-auto py-0.5">
            {/* Previous Button */}
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
        </div>
      )}
    </div>
  );
}
