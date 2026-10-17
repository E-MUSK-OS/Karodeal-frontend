'use client';

import { Trash2, AlertTriangle, X } from 'lucide-react';
import Button from '@/components/common/Button';

export default function DeleteRequestModal({
  isOpen,
  request,
  isSubmitting,
  onClose,
  onConfirm
}) {
  if (!isOpen || !request) return null;

  const wasApproved = request.status === 'APPROVED';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-neutral-200 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-neutral-900">Delete Review Request</h3>
              <p className="text-xs text-neutral-500">Confirm permanent deletion</p>
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

        {/* Product details */}
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white border border-neutral-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src={request.product?.image}
              alt={request.product?.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs text-neutral-900 line-clamp-1">
              {request.product?.title}
            </p>
            <div className="text-[11px] text-neutral-500 font-semibold mt-0.5 flex items-center gap-2">
              <span>{request.product?.storeRel?.name || 'Store'}</span>
              <span>•</span>
              <span className="capitalize">{request.status?.toLowerCase() || 'pending'}</span>
            </div>
          </div>
        </div>

        {/* Warning if approved */}
        {wasApproved && (
          <div className="p-3 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Notice:</strong> This request is currently <strong>Approved</strong>. Deleting it will also remove this product from the pinned Star Products list.
            </p>
          </div>
        )}

        <p className="text-xs text-neutral-600 leading-relaxed">
          Are you sure you want to delete this review request? This action cannot be undone.
        </p>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            variant="none"
            size="none"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="none"
            size="none"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Deleting...' : 'Delete Request'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
