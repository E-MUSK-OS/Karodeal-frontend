'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Star, Search, Check, X, ChevronDown, TrendingUp, Sparkles, RotateCcw, Package } from 'lucide-react';
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

export default function NewRequestModal({
  isOpen,
  currentRole,
  onClose,
  onSuccess,
  showToast
}) {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newRequestNote, setNewRequestNote] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Request Type & QTY state
  const [requestType, setRequestType] = useState('Order Increase');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customRequestType, setCustomRequestType] = useState('');
  const [orderQty, setOrderQty] = useState('');
  const [reviewQty, setReviewQty] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProductDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const resetForm = () => {
    setSelectedProductId('');
    setNewRequestNote('');
    setProductSearchTerm('');
    setIsProductDropdownOpen(false);
    setRequestType('Order Increase');
    setIsOtherSelected(false);
    setCustomRequestType('');
    setOrderQty('');
    setReviewQty('');
    setIsTypeDropdownOpen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Fetch only this Sub-Admin's created products when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const fetchAvailableProducts = async () => {
      setLoadingProducts(true);
      try {
        const adminStr = localStorage.getItem('adminUser');
        const user = adminStr ? JSON.parse(adminStr) : null;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

        let res = await fetch(`${apiUrl}/products/admin?limit=250`, {
          headers: { Authorization: `Bearer ${user?.token}` },
          cache: 'no-store'
        });
        if (res.status === 404) {
          res = await fetch(`${apiUrl}/products?raw=true`);
        }

        if (res.ok) {
          const data = await res.json();
          const productsList = Array.isArray(data) ? data : data.products || [];

          // If SUB_ADMIN, ONLY show products created by this specific sub-admin account
          let userProducts = productsList;
          if (user?.role === 'SUB_ADMIN') {
            userProducts = productsList.filter(p => 
              p.createdById === user.id || 
              p.createdBy?.id === user.id
            );
          }

          // Exclude products that are already marked as Star / Pinned
          const unpinned = userProducts.filter(p => !p.isPinned);
          setAvailableProducts(unpinned);
        }
      } catch (e) {
        console.error('Error loading products for request modal:', e);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchAvailableProducts();
  }, [isOpen]);

  const selectedProductObj = useMemo(() => {
    return availableProducts.find(p => p.id === selectedProductId);
  }, [availableProducts, selectedProductId]);

  const filteredAvailableProducts = useMemo(() => {
    if (!productSearchTerm.trim()) return availableProducts;
    if (selectedProductId && productSearchTerm.trim() === selectedProductObj?.title?.trim()) {
      return availableProducts;
    }
    const term = productSearchTerm.toLowerCase().trim();
    return availableProducts.filter(p => 
      p.title?.toLowerCase().includes(term)
    );
  }, [availableProducts, productSearchTerm, selectedProductId, selectedProductObj]);

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
    let finalProductId = selectedProductId;
    if (!finalProductId && productSearchTerm.trim()) {
      const match = availableProducts.find(
        p => p.title?.toLowerCase().trim() === productSearchTerm.toLowerCase().trim()
      );
      if (match) finalProductId = match.id;
    }

    if (!finalProductId) {
      showToast('Please select a product from the dropdown list', true);
      return;
    }

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

    if (!newRequestNote.trim()) {
      showToast('Please enter notes', true);
      return;
    }

    setIsSubmitting(true);
    try {
      const adminStr = localStorage.getItem('adminUser');
      const user = adminStr ? JSON.parse(adminStr) : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

      const res = await fetch(`${apiUrl}/review-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          productId: finalProductId,
          requestType: finalRequestType,
          orderQty: orderQty ? parseInt(orderQty) : null,
          reviewQty: reviewQty ? parseInt(reviewQty) : null,
          note: newRequestNote.trim(),
          suggestedRank: 1
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Review request submitted successfully to Main Admin!');
        handleClose();
        onSuccess?.();
      } else {
        showToast(data.error || 'Could not submit request', true);
      }
    } catch (err) {
      showToast(err, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 sm:p-7 shadow-2xl border border-neutral-200 my-auto max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h2 className="font-black text-base text-neutral-900">Review Request</h2>
              <p className="text-xs text-neutral-500">
                {currentRole === 'SUB_ADMIN' 
                  ? 'Select from your added products for Main Admin review' 
                  : 'Submit product for Main Admin review'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Selector with Autocomplete Dropdown */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Select Product <span className="text-red-500">*</span>
            </label>
            <div ref={dropdownRef} className="relative">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search or select product..."
                  value={productSearchTerm}
                  onClick={() => setIsProductDropdownOpen(true)}
                  onFocus={() => setIsProductDropdownOpen(true)}
                  onChange={(e) => {
                    setProductSearchTerm(e.target.value);
                    setSelectedProductId('');
                    setIsProductDropdownOpen(true);
                  }}
                  className="w-full pl-9 pr-9 py-2.5 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                />
                {productSearchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearchTerm('');
                      setSelectedProductId('');
                      setIsProductDropdownOpen(true);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-0.5 rounded cursor-pointer"
                    title="Clear input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dropdown list */}
              {isProductDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-neutral-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-neutral-100">
                  {loadingProducts ? (
                    <div className="p-4 text-center text-xs text-neutral-400 font-semibold">
                      Loading your products...
                    </div>
                  ) : availableProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400 font-semibold">
                      No eligible products found.
                    </div>
                  ) : filteredAvailableProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400 font-semibold">
                      No product found matching &ldquo;{productSearchTerm}&rdquo;
                    </div>
                  ) : (
                    filteredAvailableProducts.map(p => {
                      const isSelected = selectedProductId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setProductSearchTerm(p.title);
                            setIsProductDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-3 cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-orange-50 text-[#f96b02]' 
                              : 'hover:bg-neutral-50 text-neutral-800'
                          }`}
                          title={p.title}
                        >
                          <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                            <img 
                              src={p.image} 
                              alt={p.title} 
                              className="max-h-full max-w-full object-contain" 
                            />
                          </div>
                          <span className="font-semibold line-clamp-1 truncate flex-1">
                            {p.title}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#f96b02] shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {selectedProductId && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Selected: {selectedProductObj?.title || productSearchTerm}</span>
                </div>
              )}
            </div>
          </div>

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
              value={newRequestNote}
              onChange={(e) => setNewRequestNote(e.target.value)}
              className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="none"
              size="none"
              type="button"
              onClick={handleClose}
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
                (!selectedProductId && !productSearchTerm.trim()) ||
                (isOtherSelected && !customRequestType.trim()) ||
                (!isOtherSelected && requestType === 'Order Increase' && !orderQty) ||
                (!isOtherSelected && requestType === 'Order + Reviews Increase' && (!orderQty || !reviewQty)) ||
                !newRequestNote.trim()
              }
              className="px-5 py-2.5 bg-black hover:bg-[#f96b02] text-white font-bold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
