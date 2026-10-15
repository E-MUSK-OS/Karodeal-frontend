'use client';

import { IndianRupee, Star, Zap, ChevronLeft, ChevronRight, Inbox, Store } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

export default function BillingTable({
  products = [],
  totalItems = 0,
  currentPage = 1,
  setCurrentPage,
  itemsPerPage = 25,
  isLoading = false
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
        <PageLoader />
        <p className="text-xs text-neutral-500 font-semibold mt-3">Calculating product billing data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm w-full overflow-hidden">
      {/* Table Top Summary Bar */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-2 bg-neutral-50/50">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Showing {totalItems > 0 ? `${startIndex + 1} - ${Math.min(startIndex + itemsPerPage, totalItems)} of ${totalItems}` : '0'} Products
        </span>
        <span className="text-xs text-neutral-400 font-medium">
          Page <strong className="text-neutral-700">{currentPage}</strong> of <strong className="text-neutral-700">{totalPages}</strong>
        </span>
      </div>

      {products.length === 0 ? (
        <div className="p-12 text-center text-neutral-500">
          <Inbox className="w-10 h-10 stroke-[1.5] mx-auto mb-2 text-neutral-300" />
          <p className="font-bold text-neutral-700 text-sm">No products found</p>
          <p className="text-xs text-neutral-400 mt-1">There are no products matching your search criteria.</p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS VIEW (< md screens) */}
          <div className="block md:hidden divide-y divide-neutral-100">
            {products.map((prod, index) => {
              const serialNo = startIndex + index + 1;
              return (
                <div key={prod.id} className="p-4 space-y-3 bg-white hover:bg-neutral-50/70 transition-colors">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                      #{serialNo}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                      <Store className="w-3 h-3" /> {prod.storeName}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                      <img src={prod.image} alt={prod.title} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-neutral-900 line-clamp-2">{prod.title}</p>
                      <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                        Added by: <span className="font-semibold text-neutral-600">{prod.createdByName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Billing Breakdown Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">With Review</span>
                      <span className="font-bold text-orange-600 flex items-center mt-0.5">
                        <IndianRupee className="w-3 h-3 mr-0.5" />
                        {prod.withReviewBilling.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-medium">({prod.withReviewCount} {prod.withReviewCount === 1 ? 'claim' : 'claims'})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">Without Review</span>
                      <span className="font-bold text-blue-600 flex items-center mt-0.5">
                        <IndianRupee className="w-3 h-3 mr-0.5" />
                        {prod.withoutReviewBilling.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-medium">({prod.withoutReviewCount} {prod.withoutReviewCount === 1 ? 'claim' : 'claims'})</span>
                    </div>
                  </div>

                  {/* Card Total Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                    <span className="text-xs font-bold text-neutral-600">Total Product Billing:</span>
                    <span className="text-base font-black text-emerald-600 flex items-center">
                      <IndianRupee className="w-4 h-4 mr-0.5" />
                      {prod.totalBilling.toFixed(2)}
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
                  <th className="py-3.5 px-4 text-xs font-bold text-neutral-500 uppercase">Product & Store</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-neutral-500 uppercase">With Review Billing</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-neutral-500 uppercase">Without Review Billing</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-neutral-500 uppercase text-center">Total Orders</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-neutral-500 uppercase text-right">Total Billing (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((prod, index) => {
                  const serialNo = startIndex + index + 1;
                  return (
                    <tr key={prod.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Product & Store Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-neutral-400 w-6 shrink-0">
                            #{serialNo}
                          </span>
                          <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                            <img src={prod.image} alt={prod.title} className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="min-w-0 max-w-[320px]">
                            <p className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-2" title={prod.title}>
                              {prod.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-100">
                                {prod.storeName}
                              </span>
                              {prod.createdByName && (
                                <span className="text-[10px] text-neutral-400 font-medium">
                                  by <strong className="text-neutral-600">{prod.createdByName}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* With Review Billing */}
                      <td className="py-4 px-4">
                        <div className="font-black text-sm text-orange-600 flex items-center">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                          {prod.withReviewBilling.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">
                          {prod.withReviewCount} {prod.withReviewCount === 1 ? 'order' : 'orders'}
                        </div>
                      </td>

                      {/* Without Review Billing */}
                      <td className="py-4 px-4">
                        <div className="font-black text-sm text-blue-600 flex items-center">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                          {prod.withoutReviewBilling.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">
                          {prod.withoutReviewCount} {prod.withoutReviewCount === 1 ? 'order' : 'orders'}
                        </div>
                      </td>

                      {/* Total Orders */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block font-extrabold text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                          {prod.totalClaimsCount} Orders
                        </span>
                      </td>

                      {/* Total Billing */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-black text-base text-emerald-600 flex items-center justify-end">
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {prod.totalBilling.toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-3 bg-neutral-50/50">
          <div className="text-xs text-neutral-500 font-semibold">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
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
