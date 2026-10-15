'use client';

import { Sparkles, Star, Check, X } from 'lucide-react';
import Button from '@/components/common/Button';

export default function ApproveRequestModal({
  isOpen,
  request,
  targetRank,
  setTargetRank,
  reviewNote,
  setReviewNote,
  starStats,
  isSubmitting,
  onClose,
  onConfirm
}) {
  if (!isOpen || !request) return null;

  const nextRank = starStats?.nextStarRank || 1;
  const currentTargetRank = parseInt(targetRank, 10) || 0;
  const hasExistingStarAtRank = currentTargetRank > 0 && (
    starStats?.pinnedRanks?.includes(currentTargetRank) || 
    currentTargetRank <= (starStats?.contiguousStarRank || starStats?.maxStarRank || 0)
  );
  const isNextStarRank = currentTargetRank === nextRank;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-neutral-200 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-neutral-900">Approve Review Request</h3>
              <p className="text-xs text-neutral-500">Lock product to fixed Star Product position</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info Card */}
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white border border-neutral-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src={request.product?.image}
              alt={request.product?.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-neutral-900 line-clamp-1">
              {request.product?.title}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-2">
              <span>₹{request.product?.salePrice}</span>
              <span className="text-neutral-300">•</span>
              <span>Catalog Position: <strong className="font-mono text-neutral-700">#{request.product?.sortOrder}</strong></span>
            </div>
          </div>
        </div>

        {/* Target Rank Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-neutral-700">
            Select Approved Fixed Star Position:
          </label>

          {/* Quick Select Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Option 1: Next Star Rank */}
            <button
              type="button"
              onClick={() => setTargetRank(nextRank)}
              className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                currentTargetRank === nextRank
                  ? 'bg-black text-white border-black shadow-md ring-2 ring-neutral-400'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Star className={`w-3.5 h-3.5 ${currentTargetRank === nextRank ? 'fill-amber-400 text-amber-400' : 'fill-amber-500 text-amber-500'}`} />
                  <span>Next Star Position</span>
                </div>
                <p className={`text-[10px] mt-0.5 ${currentTargetRank === nextRank ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Sequential (No shift needed)
                </p>
              </div>
              <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg ${
                currentTargetRank === nextRank ? 'bg-neutral-800 text-amber-300' : 'bg-neutral-200 text-neutral-800'
              }`}>
                #{nextRank}
              </span>
            </button>

            {/* Option 2: Rank #1 (Top Position) */}
            <button
              type="button"
              onClick={() => setTargetRank(1)}
              className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                currentTargetRank === 1
                  ? 'bg-black text-white border-black shadow-md ring-2 ring-neutral-400'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Sparkles className={`w-3.5 h-3.5 ${currentTargetRank === 1 ? 'text-amber-400' : 'text-amber-500'}`} />
                  <span>Top Star Position</span>
                </div>
                <p className={`text-[10px] mt-0.5 ${currentTargetRank === 1 ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  {starStats?.pinnedCount > 0 ? 'Shifts others down' : 'First position'}
                </p>
              </div>
              <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg ${
                currentTargetRank === 1 ? 'bg-neutral-800 text-amber-300' : 'bg-neutral-200 text-neutral-800'
              }`}>
                #1
              </span>
            </button>
          </div>

          {/* Custom Rank Input */}
          <div className="pt-1">
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
              Or Specify Custom Star Rank #:
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-neutral-500 pointer-events-none">
                Custom Rank #
              </span>
              <input
                type="number"
                min="1"
                value={targetRank}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                  setTargetRank(val);
                }}
                className="w-full pl-32 pr-4 py-2 text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Live Consequence Explanation */}
          {hasExistingStarAtRank ? (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950 flex items-start gap-2.5">
              <span className="text-base leading-none shrink-0 mt-0.5">⚡</span>
              <div className="leading-relaxed">
                <strong>Automatic Sequence Shift:</strong> Position <strong>#{currentTargetRank}</strong> is currently occupied by a Star product. Approving at <strong>#{currentTargetRank}</strong> will automatically shift existing Star products from <strong>#{currentTargetRank}</strong> onwards down by +1 in sequence (old #{currentTargetRank} &rarr; #{currentTargetRank + 1}, etc.).
              </div>
            </div>
          ) : isNextStarRank ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
              <span className="text-base leading-none shrink-0 mt-0.5">⭐</span>
              <div className="leading-relaxed">
                <strong>Clean Sequential Placement:</strong> Product will become the next Star Product at <strong>Rank #{nextRank}</strong>. All existing sequential Star products (#1 to #{starStats?.contiguousStarRank || 0}) will remain at their exact current ranks.
              </div>
            </div>
          ) : currentTargetRank > nextRank ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
              <span className="text-base leading-none shrink-0 mt-0.5">ℹ️</span>
              <div className="leading-relaxed">
                Product will be locked at Star Position <strong>#{currentTargetRank}</strong>.
              </div>
            </div>
          ) : null}
        </div>

        {/* Approval Note / Feedback */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5">
            Approval Note / Feedback:
          </label>
          <input
            type="text"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Approved for promotion"
            className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
          <Button
            variant="none"
            size="none"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="none"
            size="none"
            onClick={onConfirm}
            disabled={isSubmitting || !targetRank || targetRank < 1}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Approving...'
                : `Confirm & Approve (Star Rank #${targetRank || nextRank})`}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
