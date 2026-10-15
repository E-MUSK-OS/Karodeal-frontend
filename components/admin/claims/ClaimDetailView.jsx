'use client';

import { ArrowRight, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import { calculateCashback } from '@/lib/cashbackCalculator';

export default function ClaimDetailView({
  claim,
  onBack,
  awardedCashback,
  setAwardedCashback,
  adminNote,
  setAdminNote,
  actionError,
  setActionError,
  isUpdating,
  onInitiateStatusUpdate,
  formatDate,
  getImageUrl,
  onOpenLightbox
}) {
  if (!claim) return null;

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      {/* Back Button */}
      <Button
        variant="none"
        size="none"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-[#f96b02] transition-colors mb-6 cursor-pointer"
      >
        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Claims List
      </Button>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-6 sm:p-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-neutral-100 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="font-black text-neutral-900 text-lg sm:text-xl">
                Review Claim: {claim.user?.name || 'Unknown User'}
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                claim.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                claim.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {claim.status}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                claim.claimType === 'WITHOUT_REVIEW'
                  ? 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                  : 'bg-orange-50 text-[#f96b02] border border-orange-200'
              }`}>
                {claim.claimType === 'WITHOUT_REVIEW' ? '⚡ Without Review Claim' : '🌟 With Review Claim'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
              <Calendar className="w-4 h-4" /> Claimed on {formatDate(claim.createdAt)}
              <span className="mx-2">•</span>
              <span className="text-sm lg:text-[15px] xl:text-base font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 font-bold">
                #{claim.ticketId || claim.id.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* 3-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Order Details */}
          <div>
            <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4 text-xs">Order Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Store / Product</p>
                <p className="text-lg font-black text-neutral-900">{claim.storeName}</p>
                {!claim.product && (
                  <p className="text-sm font-semibold text-neutral-400 mt-1">No Product Selected</p>
                )}
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Claim Option</p>
                <p className="text-sm font-bold text-neutral-800">
                  {claim.claimType === 'WITHOUT_REVIEW' ? 'Without Review (Standard Cashback)' : 'With Review (Higher Cashback)'}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Order Amount</p>
                <p className="text-lg font-black text-neutral-900">₹{claim.orderAmount}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Order ID</p>
                <p className="text-sm lg:text-[15px] xl:text-base font-mono text-neutral-900 font-semibold">{claim.orderId}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Order Date</p>
                <p className="text-sm lg:text-[15px] xl:text-base font-medium text-neutral-900">{formatDate(claim.orderDate)}</p>
              </div>
            </div>
          </div>

          {/* Column 2: Product Info */}
          {claim.product && (
            <div>
              <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4 text-xs">Product Info</h3>
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                <img
                  src={claim.product.image}
                  alt={claim.product.title}
                  className="w-full h-32 object-contain bg-white rounded-xl mb-4 border border-neutral-100"
                />
                <p className="font-bold text-sm text-neutral-900 line-clamp-2 mb-3">{claim.product.title}</p>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-neutral-500">Sale Price</p>
                    <p className="text-sm lg:text-[15px] xl:text-base font-bold text-green-600">₹{claim.product.salePrice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Original</p>
                    <p className="text-sm lg:text-[15px] xl:text-base font-semibold text-neutral-400 line-through">₹{claim.product.originalPrice}</p>
                  </div>
                  <div className="col-span-2 pt-2 mt-2 border-t border-neutral-200 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-medium">With Review:</span>
                      <span className={`font-bold ${claim.claimType !== 'WITHOUT_REVIEW' ? 'text-green-600 font-black' : 'text-neutral-700'}`}>
                        ₹{claim.product.cashbackWithReview || calculateCashback(claim.product.salePrice).withReview}
                        {claim.claimType !== 'WITHOUT_REVIEW' && ' (Selected)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-medium">Without Review:</span>
                      <span className={`font-bold ${claim.claimType === 'WITHOUT_REVIEW' ? 'text-orange-600 font-black' : 'text-neutral-700'}`}>
                        ₹{claim.product.cashbackWithoutReview || calculateCashback(claim.product.salePrice).withoutReview}
                        {claim.claimType === 'WITHOUT_REVIEW' && ' (Selected)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Column 3: Take Action Box */}
          <div className={!claim.product ? "md:col-span-1 lg:col-span-2" : ""}>
            <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4 text-xs">Take Action</h3>
            {claim.status === 'PENDING' ? (
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                    Award Cashback (₹) <span className="text-red-500">*</span>
                  </label>
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
                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-xs sm:text-sm"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1.5 font-medium">* Note is required only when rejecting</p>
                </div>

                {actionError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                    {actionError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="none"
                    size="none"
                    onClick={() => onInitiateStatusUpdate('APPROVED')}
                    disabled={isUpdating}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" /> Approve & Credit
                  </Button>
                  <Button
                    variant="none"
                    size="none"
                    onClick={() => onInitiateStatusUpdate('REJECTED')}
                    disabled={isUpdating}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" /> Reject
                  </Button>
                </div>
              </div>
            ) : (
              <div className={`p-6 rounded-2xl border ${
                claim.status === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <h3 className="font-black mb-2">Claim {claim.status}</h3>
                {claim.status === 'APPROVED' && (
                  <div className="mb-2">
                    <p className="text-sm lg:text-[15px] xl:text-base font-medium mb-1">
                      Cashback Awarded: <span className="font-black text-xl">₹{claim.awardedCashback}</span>
                    </p>
                  </div>
                )}
                {claim.adminNote && (
                  <div className="mt-3 p-3 bg-white/60 rounded-xl border border-black/5">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-60">Admin Note</p>
                    <p className="text-sm font-medium">{claim.adminNote}</p>
                  </div>
                )}
                <p className="text-xs text-neutral-500 font-medium mt-4 italic border-t border-black/5 pt-3">
                  * This claim has been finalized ({claim.status}) and cannot be modified or reopened.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submitted Proofs Section */}
        <div>
          <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4 text-xs">Submitted Proofs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Invoice Screenshot */}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-neutral-700 mb-3">1. Invoice / Receipt</span>
              <button
                type="button"
                onClick={() => onOpenLightbox(getImageUrl(claim.invoiceScreenshot))}
                className="block aspect-square w-full relative group bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-[#f96b02] transition-colors focus:outline-none cursor-pointer"
              >
                <img src={getImageUrl(claim.invoiceScreenshot)} className="object-cover w-full h-full" alt="Invoice" />
              </button>
            </div>

            {/* Review Screenshot if provided */}
            {claim.reviewScreenshot && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-neutral-700 mb-3">2. Product Review</span>
                <button
                  type="button"
                  onClick={() => onOpenLightbox(getImageUrl(claim.reviewScreenshot))}
                  className="block aspect-square w-full relative group bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-[#f96b02] transition-colors focus:outline-none cursor-pointer"
                >
                  <img src={getImageUrl(claim.reviewScreenshot)} className="object-cover w-full h-full" alt="Review" />
                </button>
              </div>
            )}

            {/* Non-Return Proof Screenshot */}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-neutral-700 mb-3">
                {claim.reviewScreenshot ? '3. Non-Return Proof' : '2. Non-Return Proof'}
              </span>
              <button
                type="button"
                onClick={() => onOpenLightbox(getImageUrl(claim.noReturnScreenshot))}
                className="block aspect-square w-full relative group bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-[#f96b02] transition-colors focus:outline-none cursor-pointer"
              >
                <img src={getImageUrl(claim.noReturnScreenshot)} className="object-cover w-full h-full" alt="No Return" />
              </button>
            </div>
          </div>

          {claim.claimType === 'WITHOUT_REVIEW' && !claim.reviewScreenshot && (
            <p className="text-xs text-neutral-500 mt-3 italic bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
              ⚡ User submitted this claim without a product review. Review screenshot was not required.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
