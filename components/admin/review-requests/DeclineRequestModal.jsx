'use client';

import { XCircle } from 'lucide-react';
import Button from '@/components/common/Button';

export default function DeclineRequestModal({
  isOpen,
  request,
  reviewNote,
  setReviewNote,
  isSubmitting,
  onClose,
  onConfirm
}) {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-neutral-200 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-base text-neutral-900">Decline Review Request</h3>
            <p className="text-xs text-neutral-500">Provide reason for declining this request</p>
          </div>
        </div>

        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2.5">
          <p className="text-xs text-neutral-800">
            Decline review request for <strong>{request.product?.title}</strong>?
          </p>
          {(request.requestType || request.orderQty != null || request.reviewQty != null) && (
            <div className="space-y-2 pt-1.5 border-t border-neutral-200/70">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                  Target Requested
                </span>
                {request.requestType && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    {request.requestType}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded-lg border border-neutral-200 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Orders:</span>
                  <span className="font-mono font-bold text-neutral-800">
                    {request.orderQty != null ? `${request.orderQty} QTY` : '—'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-neutral-200 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Reviews:</span>
                  <span className="font-mono font-bold text-neutral-800">
                    {request.reviewQty != null ? `${request.reviewQty} QTY` : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5">
            Decline Reason / Feedback:
          </label>
          <textarea
            rows="3"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Reason for declining..."
            className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
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
            disabled={isSubmitting}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Declining...' : 'Decline Request'}
          </Button>
        </div>
      </div>
    </div>
  );
}
