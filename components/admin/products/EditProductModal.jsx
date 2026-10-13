'use client';
import { useState, useEffect } from 'react';
import { X, Upload, AlertCircle, Edit3, Lock } from 'lucide-react';
import Button from '@/components/common/Button';
import StoreOfferCard from '@/components/deals/StoreOfferCard';
import CustomSelect from '@/components/common/CustomSelect';
import { calculateCashback } from '@/lib/cashbackCalculator';

export default function EditProductModal({ product, onClose, onSuccess, dbStores, dbCategories, existingProducts = [], currentRole }) {
  const [formData, setFormData] = useState({
    title: '',
    store: '',
    category: '',
    originalPrice: '',
    salePrice: '',
    discount: '',
    cashbackWithoutReview: 0,
    cashbackWithReview: 0,
    image: '',
    affiliateUrl: '',
    isTrending: false,
    isActive: true,
    expiresAt: '',
    cardType: 'builder',
  });
  const [imageInputType, setImageInputType] = useState('url');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const isDuplicateTitle = Boolean(
    formData.title.trim() &&
    existingProducts?.some(
      (p) => p.id !== product?.id && p.title?.trim().toLowerCase() === formData.title.trim().toLowerCase()
    )
  );

  useEffect(() => {
    if (product) {
      const isCustom = Number(product.originalPrice) === 0;
      const salePriceNum = Number(product.salePrice) || 0;
      const defaultSlabs = calculateCashback(salePriceNum);
      const withoutRev = salePriceNum > 0 ? defaultSlabs.withoutReview : 0;
      const withRev = salePriceNum > 0 ? defaultSlabs.withReview : 0;

      setFormData({
        title: product.title || '',
        store: product.storeId || '',
        category: product.categoryId || '',
        originalPrice: product.originalPrice || '',
        salePrice: product.salePrice || '',
        discount: product.discount || '',
        cashbackWithoutReview: withoutRev,
        cashbackWithReview: withRev,
        image: product.image || '',
        affiliateUrl: product.affiliateUrl || '',
        isTrending: product.isTrending || false,
        isActive: product.isActive ?? true,
        expiresAt: product.expiresAt
          ? new Date(new Date(product.expiresAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
          : '',
        cardType: isCustom ? 'custom' : 'builder',
      });
      setImageInputType(product.image?.startsWith('http') ? 'url' : 'file');
    }
  }, [product]);

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4500);
  };

  const updatePricesAndCashback = (updates) => {
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      if (updates.salePrice !== undefined) {
        if (updates.salePrice === '' || updates.salePrice === null) {
          next.cashbackWithoutReview = 0;
          next.cashbackWithReview = 0;
        } else {
          const slabs = calculateCashback(Number(updates.salePrice) || 0);
          next.cashbackWithoutReview = slabs.withoutReview;
          next.cashbackWithReview = slabs.withReview;
        }
      }
      return next;
    });
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({ ...prev, image: event.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const preventNegativeKeys = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    const actualTitle = formData.title.trim();
    if (!actualTitle) return showError("Please enter the Product Card Title!");
    if (isDuplicateTitle) {
      return showError("Another product card with this title already exists! Please choose a unique title.");
    }
    if (!formData.store) return showError("Please select a Store!");
    if (!formData.category) return showError("Please select a Category!");
    
    if (formData.cardType !== 'custom') {
      if (!formData.originalPrice) return showError("Please enter the Original Price!");
      if (Number(formData.originalPrice) < 0) return showError("Original Price cannot be negative!");
    }
    if (!formData.salePrice) return showError("Please enter the Sale Price!");
    if (!formData.discount) return showError("Please enter the Discount!");
    if (Number(formData.discount) < 0) return showError("Discount cannot be negative!");
    if (Number(formData.salePrice) < 0) return showError("Sale Price cannot be negative!");
    if (Number(formData.cashbackWithoutReview) < 0) return showError("Cashback cannot be negative!");
    if (Number(formData.cashbackWithReview) < 0) return showError("Cashback cannot be negative!");
    if (!formData.image.trim()) return showError("Please upload or provide a Product Image!");
    if (!formData.affiliateUrl.trim()) return showError("Please provide the Affiliate Link URL!");

    setIsSubmitting(true);
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      const token = adminUserStr ? JSON.parse(adminUserStr).token : null;
      const isCustom = formData.cardType === 'custom';
      const salePriceNum = Math.max(0, Number(formData.salePrice) || 0);
      const { withoutReview, withReview } = calculateCashback(salePriceNum);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: isCustom ? (actualTitle || `Custom Deal ${Date.now()}`) : actualTitle,
          store: formData.store,
          category: formData.category,
          originalPrice: isCustom ? 0 : (Number(formData.originalPrice) || 0),
          salePrice: salePriceNum,
          discount: Number(formData.discount) || 0,
          cashback: withReview,
          cashbackWithoutReview: withoutReview,
          cashbackWithReview: withReview,
          image: formData.image.trim(),
          affiliateUrl: formData.affiliateUrl.trim(),
          isTrending: formData.isTrending,
          isActive: formData.isActive,
          expiresAt: formData.expiresAt && (!formData.isActive || new Date(formData.expiresAt) > new Date())
            ? new Date(formData.expiresAt).toISOString()
            : null,
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        onSuccess('updated');
      } else {
        showError(data.error || 'Failed to update product. Please check the details and try again.');
      }
    } catch (err) {
      console.error(err);
      showError('Failed to connect to server. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-[1200px] w-full shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto my-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
              <h4 className="font-bold text-neutral-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-neutral-700" />
                Edit Card Details
              </h4>
              <Button variant="none" size="none" onClick={onClose} className="p-1.5 text-neutral-400 hover:text-[#f96b02] hover:bg-neutral-100 rounded-full lg:hidden">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {errorMsg && (
              <div className="fixed top-8 right-6 left-6 sm:left-auto sm:right-8 sm:max-w-md z-[100] bg-white border-2 border-red-500 text-neutral-900 px-5 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] flex items-start gap-3.5 text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-0.5">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-red-700 font-black text-xs uppercase tracking-wider mb-0.5">Error</p>
                  <p className="text-neutral-800 font-semibold text-xs leading-snug">{errorMsg}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="text-neutral-400 hover:text-neutral-700 p-1 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4" noValidate>
              <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl mb-4 w-fit relative group cursor-not-allowed">
                {/* Tooltip on hover to explain why it's locked */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Card type cannot be changed after creation
                </div>
                <button type="button" disabled className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-not-allowed ${formData.cardType !== 'custom' ? 'bg-white shadow text-black' : 'text-neutral-400'}`}>Card Builder</button>
                <button type="button" disabled className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-not-allowed ${formData.cardType === 'custom' ? 'bg-white shadow text-black' : 'text-neutral-400'}`}>Custom Upload</button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Product Card Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-3 text-sm bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 font-semibold transition-colors ${
                    isDuplicateTitle
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                      : 'border-neutral-200 focus:ring-black'
                  }`}
                  required
                />
                {isDuplicateTitle && (
                  <p className="mt-1.5 text-xs text-red-600 font-bold flex items-center gap-1 animate-pulse">
                    <span>⚠️</span> Another product card with this title already exists. Please choose a different title.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Store</label>
                  <CustomSelect value={formData.store} onChange={(val) => setFormData({ ...formData, store: val })} options={dbStores} placeholder="Select Store" dropdownKey="edit-store" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Category</label>
                  <CustomSelect value={formData.category} onChange={(val) => setFormData({ ...formData, category: val })} options={dbCategories} placeholder="Select Category" dropdownKey="edit-category" />
                </div>
              </div>

              <div className={`grid grid-cols-1 ${formData.cardType === 'custom' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3`}>
                {formData.cardType !== 'custom' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Orig. Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      onKeyDown={preventNegativeKeys}
                      value={formData.originalPrice}
                      onChange={(e) => {
                        const cleanOrig = e.target.value.replace(/[^0-9]/g, '');
                        let salePrice = formData.salePrice;
                        if (cleanOrig && formData.discount) {
                          salePrice = Math.round(Number(cleanOrig) * (1 - Number(formData.discount) / 100));
                        }
                        updatePricesAndCashback({ originalPrice: cleanOrig, salePrice });
                      }}
                      className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    onKeyDown={preventNegativeKeys}
                    value={formData.discount}
                    onChange={(e) => {
                      const cleanDisc = e.target.value.replace(/[^0-9]/g, '');
                      let salePrice = formData.salePrice;
                      if (cleanDisc && formData.originalPrice && formData.cardType !== 'custom') {
                        salePrice = Math.round(Number(formData.originalPrice) * (1 - Number(cleanDisc) / 100));
                      }
                      updatePricesAndCashback({ discount: cleanDisc, salePrice });
                    }}
                    placeholder="e.g. 62"
                    className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold text-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Sale Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    onKeyDown={preventNegativeKeys}
                    value={formData.salePrice}
                    onChange={(e) => {
                      const cleanSale = e.target.value.replace(/[^0-9]/g, '');
                      updatePricesAndCashback({ salePrice: cleanSale });
                    }}
                    className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold"
                  />
                </div>
              </div>

              {/* Auto Cashback Slab Display (Only visible to Main Admin - Strictly Auto-Calculated) */}
              {currentRole !== 'SUB_ADMIN' ? (
                <div className="bg-neutral-50/80 p-2.5 sm:p-3 rounded-xl border border-neutral-200/80 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-neutral-400" />
                        Cashback Tiers
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {formData.salePrice 
                          ? `(Auto for ₹${formData.salePrice} • Locked)` 
                          : '(Auto-calculated by slab)'}
                      </span>
                    </div>
                    {formData.salePrice ? (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Smart Slab
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-neutral-500 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded w-fit">
                        Default (₹0)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Tier 1: Without Review */}
                    <div className="bg-white px-3 py-2 rounded-lg border border-neutral-200 shadow-2xs flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            Without Review
                          </span>
                          <span className="text-[9px] text-neutral-400 font-medium bg-neutral-100 px-1 rounded">
                            Std
                          </span>
                        </div>
                        <div className="flex items-baseline gap-0.5 text-neutral-900">
                          <span className="text-xs font-semibold text-neutral-400">₹</span>
                          <span className="text-base font-bold text-neutral-900">
                            {formData.cashbackWithoutReview ?? 0}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-semibold text-neutral-400 bg-neutral-50 border border-neutral-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 text-neutral-400" />
                        Auto
                      </span>
                    </div>

                    {/* Tier 2: With Review */}
                    <div className="bg-emerald-50/30 px-3 py-2 rounded-lg border border-emerald-200/80 shadow-2xs flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                            With Review
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1 rounded">
                            Bonus
                          </span>
                        </div>
                        <div className="flex items-baseline gap-0.5 text-emerald-700">
                          <span className="text-xs font-semibold text-emerald-600">₹</span>
                          <span className="text-base font-bold text-emerald-700">
                            {formData.cashbackWithReview ?? 0}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100/60 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 text-emerald-500" />
                        Auto
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">Product Image</label>
                  <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl border border-neutral-200">
                    <Button variant="none" size="none" type="button" onClick={() => setImageInputType('url')} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${imageInputType === 'url' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-[#f96b02]'}`}>Image URL</Button>
                    <Button variant="none" size="none" type="button" onClick={() => setImageInputType('file')} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${imageInputType === 'file' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-[#f96b02]'}`}>Upload File</Button>
                  </div>
                </div>

                {imageInputType === 'url' ? (
                  <div className="flex gap-2 items-center">
                    <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://images.unsplash.com/..." className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-xs" />
                    {formData.image && (
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                        <img src={formData.image} alt="Preview" className="max-h-full max-w-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-neutral-300 hover:border-[#f96b02] rounded-2xl p-4 text-center transition-colors cursor-pointer relative bg-neutral-50 flex flex-col items-center justify-center gap-1">
                      <input type="file" accept="image/*" onChange={handleImageFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <Upload className="w-5 h-5 text-neutral-600" />
                      <span className="text-xs font-bold text-neutral-800">Click or drag image file here</span>
                      <span className="text-[10px] text-neutral-400">PNG, JPG, WEBP, GIF up to 5MB</span>
                    </div>

                    {formData.image && (
                      <div className="flex items-center gap-3 p-2 bg-neutral-50 border border-neutral-200 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                          <img src={formData.image} alt="Preview" className="max-h-full max-w-full object-contain" />
                        </div>
                        <span className="text-xs text-neutral-700 font-mono truncate flex-1 font-semibold">Image selected</span>
                        <Button variant="none" size="none" type="button" onClick={() => setFormData({ ...formData, image: '' })} className="text-xs font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">Remove</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Affiliate Link URL</label>
                <input type="text" value={formData.affiliateUrl} onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })} className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-xs" />
              </div>

              {/* Active Status & Re-Post Section */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                    <span>Visibility Status:</span>
                    <span className={formData.isActive ? "text-emerald-600 font-extrabold" : "text-neutral-500 font-bold"}>
                      {formData.isActive ? "Active (Live on Website)" : "Deactivated (Hidden from Users)"}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                    {formData.isActive 
                      ? "Publicly visible on categories, stores, and deal pages." 
                      : "Hidden from user panel but safely kept in admin panel so you can re-post anytime."}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  {(!formData.isActive || (formData.expiresAt && new Date(formData.expiresAt) <= new Date())) && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: true, expiresAt: '' })}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                    >
                      Re-Post Now
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                    title={formData.isActive ? "Click to deactivate" : "Click to activate"}
                  >
                    <span className="sr-only">Toggle active</span>
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isActive ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
                  </button>
                </div>
              </div>

              {/* Auto Deactivate Date & Time Selection */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <span className="text-sm">⏰</span> Auto-Deactivate Date & Time <span className="text-neutral-400 font-normal lowercase">(optional)</span>
                  </label>
                  {formData.expiresAt && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, expiresAt: '' })}
                      className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {formData.expiresAt && new Date(formData.expiresAt) <= new Date() && (
                  <div className="text-[11px] text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    ⚠️ This expiry schedule has already passed. Set a new future date & time or click Clear to keep the card active.
                  </div>
                )}
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-semibold text-neutral-800"
                />
                <p className="text-[11px] text-neutral-500 font-medium">
                  The card will automatically deactivate and be hidden from categories, stores, and home deals after this date and time.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button variant="none" size="none" type="button" onClick={onClose} className="px-5 py-3 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">Cancel</Button>
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} className="text-xs rounded-xl !px-6 !py-3 normal-case tracking-normal shadow-md">Update Card Data</Button>
              </div>
            </form>
          </div>
          {/* Preview */}
          <div className="w-full lg:w-[550px] shrink-0 hidden lg:flex flex-col border-l border-neutral-100 pl-8 relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
              <h4 className="font-bold uppercase tracking-wider text-neutral-500">Live Preview</h4>
              <Button variant="none" size="none" onClick={onClose} className="p-1.5 text-neutral-400 hover:text-[#f96b02] hover:bg-neutral-100 rounded-full"><X className="w-5 h-5" /></Button>
            </div>
            <div className="sticky top-0 flex justify-center">
              <StoreOfferCard
                deal={{
                  title: formData.title || 'Product Title',
                  discount: formData.discount || 0,
                  salePrice: formData.salePrice || 0,
                  originalPrice: formData.cardType === 'custom' ? 0 : (formData.originalPrice || 0),
                  cashback: currentRole === 'SUB_ADMIN' ? 0 : (Number(formData.cashbackWithReview) || 0),
                  cashbackWithoutReview: currentRole === 'SUB_ADMIN' ? 0 : (Number(formData.cashbackWithoutReview) || 0),
                  cashbackWithReview: currentRole === 'SUB_ADMIN' ? 0 : (Number(formData.cashbackWithReview) || 0),
                  image: formData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
                  affiliateUrl: formData.affiliateUrl || '#'
                }}
                store={dbStores.find(s => s.id === formData.store) || { name: 'Store', logoUrl: '' }}
                fullWidth={true}
                isPreview={true}
                hideCashback={currentRole === 'SUB_ADMIN'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
