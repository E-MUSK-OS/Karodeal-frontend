'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Edit3, Star, Check, X, ChevronDown, TrendingUp, Sparkles, RotateCcw, Package, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';

const REQUEST_TYPE_OPTIONS = [
  {
    id: 'Order Increase',
    label: 'Order Increase',
    subLabel: 'Request promotion to increase order volume',
    icon: TrendingUp,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border border-blue-200'
  },
  {
    id: 'Order + Reviews Increase',
    label: 'Order + Reviews Increase',
    subLabel: 'Request order boost along with product reviews',
    icon: Star,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border border-amber-200'
  },
  {
    id: 'OTHER',
    label: 'Other',
    subLabel: 'Enter custom request type',
    icon: Sparkles,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border border-purple-200'
  }
];

export default function EditRequestModal({
  isOpen,
  request,
  onClose,
  onSuccess,
  showToast
}) {
  const [requestType, setRequestType] = useState('Order Increase');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customRequestType, setCustomRequestType] = useState('');
  const [orderQty, setOrderQty] = useState('');
  const [reviewQty, setReviewQty] = useState('');
  const [note, setNote] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const typeDropdownRef = useRef(null);

  // Sync form state when request changes
  useEffect(() => {
    if (!isOpen || !request) return;

    const currentType = request.requestType || '';
    if (currentType === 'Order Increase' || currentType === 'Order + Reviews Increase') {
      setRequestType(currentType);
      setIsOtherSelected(false);
      setCustomRequestType('');
    } else if (currentType) {
      setRequestType('OTHER');
      setIsOtherSelected(true);
      setCustomRequestType(currentType);
    } else {
      setRequestType('Order Increase');
      setIsOtherSelected(false);
      setCustomRequestType('');
    }

    setOrderQty(request.orderQty != null ? String(request.orderQty) : '');
    setReviewQty(request.reviewQty != null ? String(request.reviewQty) : '');
    setNote(request.note || '');
    setIsTypeDropdownOpen(false);
  }, [isOpen, request]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedTypeObj = useMemo(() => {
    return REQUEST_TYPE_OPTIONS.find(opt => opt.id === requestType) || REQUEST_TYPE_OPTIONS[0];
  }, [requestType]);

  const handleSelectOption = (optId) => {
    if (optId === 'OTHER') {
      setIsOtherSelected(true);
      setRequestType('OTHER');
      setCustomRequestType('');
    } else {
      setIsOtherSelected(false);
      setRequestType(optId);
    }
    setIsTypeDropdownOpen(false);
  };

  const handleSwitchBackToDropdown = () => {
    setIsOtherSelected(false);
    setRequestType('Order Increase');
    setCustomRequestType('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!request) return;

    const finalRequestType = isOtherSelected ? customRequestType.trim() : requestType;

    if (isOtherSelected && !customRequestType.trim()) {
      showToast('Please enter your custom request type', true);
      return;
    }

    if (!isOtherSelected && requestType === 'Order Increase' && !orderQty) {
      showToast('Please enter QTY of order', true);
      return;
    }

    if (!isOtherSelected && requestType === 'Order + Reviews Increase') {
      if (!orderQty) {
        showToast('Please enter QTY of order', true);
        return;
      }
      if (!reviewQty) {
        showToast('Please enter QTY of reviews', true);
        return;
      }
    }

    if (!note.trim()) {
      showToast('Please enter notes / reasoning', true);
      return;
    }

    setIsSubmitting(true);
    try {
      const adminStr = localStorage.getItem('adminUser');
      const user = adminStr ? JSON.parse(adminStr) : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

      const res = await fetch(`${apiUrl}/review-requests/${request.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          requestType: finalRequestType,
          orderQty: orderQty ? parseInt(orderQty) : null,
          reviewQty: reviewQty ? parseInt(reviewQty) : null,
          note: note.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Request updated! Status has been reset to Pending for Main Admin review.');
        onClose();
        onSuccess?.();
      } else {
        showToast(data.error || 'Failed to update request', true);
      }
    } catch (err) {
      showToast(err, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  const wasApproved = request.status === 'APPROVED';
  const wasRejected = request.status === 'REJECTED';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 sm:p-7 shadow-2xl border border-neutral-200 my-auto max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-neutral-900">Edit Review Request</h2>
              <p className="text-xs text-neutral-500">
                Update target order/review quantities and notes
              </p>
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

        {/* Product Preview (Read-only) */}
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3 mb-4">
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
              <span>₹{request.product?.salePrice}</span>
            </div>
          </div>
        </div>

        {/* Status Reset Alert */}
        <div className="p-3 rounded-xl border bg-amber-50/80 border-amber-200 text-amber-900 text-xs flex items-start gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold block mb-0.5">Approval Flow Notice:</strong>
            {wasApproved ? (
              <span>
                This request was previously <strong>Approved</strong>. Saving edits will change its status back to <strong>Pending</strong> and submit it to Main Admin for approval again.
              </span>
            ) : wasRejected ? (
              <span>
                This request was previously <strong>Declined</strong>. Saving edits will re-open it as <strong>Pending</strong> for Main Admin review.
              </span>
            ) : (
              <span>
                Saving changes will keep this request in <strong>Pending</strong> status for Main Admin review.
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Request Type Custom Dropdown OR Text Input for Other */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                Request Type <span className="text-red-500">*</span>
              </label>
              {isOtherSelected && (
                <button
                  type="button"
                  onClick={handleSwitchBackToDropdown}
                  className="text-[11px] font-bold text-[#f96b02] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Switch back to dropdown list"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Choose from list</span>
                </button>
              )}
            </div>

            {isOtherSelected ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter custom request type..."
                  value={customRequestType}
                  onChange={(e) => setCustomRequestType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  autoFocus
                />
              </div>
            ) : (
              <div ref={typeDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 rounded-xl flex items-center justify-between gap-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1 rounded-lg shrink-0 ${selectedTypeObj?.bg || 'bg-neutral-100'}`}>
                      {selectedTypeObj?.icon ? (
                        <selectedTypeObj.icon className={`w-3.5 h-3.5 ${selectedTypeObj.color}`} />
                      ) : (
                        <Package className="w-3.5 h-3.5 text-neutral-500" />
                      )}
                    </div>
                    <span className="font-bold text-neutral-900 truncate">
                      {selectedTypeObj?.label || 'Select request type...'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${isTypeDropdownOpen ? 'rotate-180 text-black' : ''}`} />
                </button>

                {isTypeDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 divide-y divide-neutral-100 animate-in fade-in zoom-in-95 duration-100">
                    {REQUEST_TYPE_OPTIONS.map((opt) => {
                      const isSelected = requestType === opt.id;
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(opt.id)}
                          className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-orange-50 text-[#f96b02]' 
                              : 'hover:bg-neutral-50 text-neutral-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`p-1.5 rounded-lg shrink-0 ${opt.bg}`}>
                              <Icon className={`w-4 h-4 ${opt.color}`} />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-neutral-900">
                                {opt.label}
                              </div>
                              <div className="text-[10px] text-neutral-500 font-normal">
                                {opt.subLabel}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#f96b02] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* QTY of Order / QTY of Reviews Inputs */}
          {requestType === 'Order Increase' && !isOtherSelected && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                QTY of Order <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="Enter order quantity (e.g. 50)"
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          )}

          {requestType === 'Order + Reviews Increase' && !isOtherSelected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  QTY of Order <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter order QTY (e.g. 50)"
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  QTY of Reviews <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter reviews QTY (e.g. 20)"
                  value={reviewQty}
                  onChange={(e) => setReviewQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          )}

          {isOtherSelected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  QTY of Order <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Order QTY (optional, e.g. 50)"
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  QTY of Reviews <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Review QTY (optional, e.g. 20)"
                  value={reviewQty}
                  onChange={(e) => setReviewQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="3"
              required
              placeholder="Provide marketing reasoning or context for Main Admin..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="none"
              size="none"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="none"
              size="none"
              type="submit"
              disabled={
                isSubmitting ||
                (isOtherSelected && !customRequestType.trim()) ||
                (!isOtherSelected && requestType === 'Order Increase' && !orderQty) ||
                (!isOtherSelected && requestType === 'Order + Reviews Increase' && (!orderQty || !reviewQty)) ||
                !note.trim()
              }
              className="px-5 py-2.5 bg-black hover:bg-[#f96b02] text-white font-bold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Update Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
