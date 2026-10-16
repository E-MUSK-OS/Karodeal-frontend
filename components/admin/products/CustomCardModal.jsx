'use client';
import { useState } from 'react';
import { X, Upload, AlertCircle, Lock } from 'lucide-react';
import Button from '@/components/common/Button';
import StoreOfferCard from '@/components/deals/StoreOfferCard';
import CustomSelect from '@/components/common/CustomSelect';
import { calculateCashback } from '@/lib/cashbackCalculator';
import { handleAppError, showSuccessToast, showErrorToast } from '@/lib/errorHandler';
import { processImageUpload } from '@/lib/imageProcessor';

export default function CustomCardModal({ isOpen, onClose, onSuccess, dbStores, dbCategories, existingProducts = [], currentRole }) {
  const [formData, setFormData] = useState({
    title: '',
    store: dbStores.length > 0 ? dbStores[0].id : '',
    category: dbCategories.length > 0 ? dbCategories[0].id : '',
    discount: '',
    salePrice: '',
    cashbackWithoutReview: 0,
    cashbackWithReview: 0,
    image: '',
    affiliateUrl: '',
    isTrending: false,
    isActive: true,
    expiresAt: '',
  });
  const [imageInputType, setImageInputType] = useState('url');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const isDuplicateTitle = Boolean(
    formData.title.trim() &&
    existingProducts?.some(
      (p) => p.title?.trim().toLowerCase() === formData.title.trim().toLowerCase()
    )
  );

  const showError = (msg) => {
    showErrorToast(msg);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const processed = await processImageUpload(file, { maxSizeMB: 5.0 });
      if (processed?.file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormData((prev) => ({ ...prev, image: event.target.result }));
          }
        };
        reader.readAsDataURL(processed.file);
      }
    } catch (err) {
      showError(err.message || 'Failed to process image');
    }
  };

  const preventNegativeKeys = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    
    const actualTitle = formData.title.trim();
    if (!actualTitle) return showError("Please enter the Product Card Title!");
    if (isDuplicateTitle) {
      return showError("A product card with this title already exists! Please choose a unique title.");
    }
    if (!formData.store) return showError("Please select a Store!");
    if (!formData.category) return showError("Please select a Category!");
    if (!formData.discount) return showError("Please enter the Discount!");
    if (!formData.salePrice) return showError("Please enter the Sale Price!");
    if (Number(formData.discount) < 0) return showError("Discount cannot be negative!");
    if (Number(formData.salePrice) < 0) return showError("Sale Price cannot be negative!");
    if (Number(formData.cashbackWithoutReview) < 0) return showError("Cashback cannot be negative!");
    if (Number(formData.cashbackWithReview) < 0) return showError("Cashback cannot be negative!");
    if (!formData.image.trim()) return showError("Please upload or provide a Product Image!");
    if (!formData.affiliateUrl.trim()) return showError("Please provide the Affiliate Link URL!");

    const salePriceNum = Math.max(0, Number(formData.salePrice) || 0);
    const { withoutReview, withReview } = calculateCashback(salePriceNum);

    setIsSubmitting(true);
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      const token = adminUserStr ? JSON.parse(adminUserStr).token : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

      const slug = actualTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const res = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          slug,
          title: actualTitle,
          store: formData.store,
          category: formData.category,
          originalPrice: 0,
          salePrice: salePriceNum,
          discount: Number(formData.discount) || 0,
          cashback: withReview,
          cashbackWithoutReview: withoutReview,
          cashbackWithReview: withReview,
          rating: '4.5',
          reviews: 120,
          image: formData.image.trim(),
          affiliateUrl: formData.affiliateUrl.trim(),
          isTrending: formData.isTrending,
          isActive: formData.isActive,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
          features: ['Best Seller', 'Verified Deal'],
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showSuccessToast('Custom product card added!');
        onSuccess('added');
      } else {
        const userMsg = handleAppError(data.error || 'Failed to add product. Please check the details and try again.', {
          context: 'Admin / Add Custom Product',
          title: 'Product Not Added'
        });
        showError(userMsg);
      }
    } catch (err) {
      const userMsg = handleAppError(err, {
        context: 'Admin / Add Custom Product Network',
        title: 'Connection Error',
        fallback: 'Unable to connect to server. Please try again.'
      });
      showError(userMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-[1200px] w-full shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto my-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
              <h4 className="font-bold text-neutral-900 flex items-center gap-2">
                <span className="text-xl">🖼️</span> Upload Custom Card
              </h4>
              <Button variant="none" size="none" onClick={onClose} className="p-1.5 text-neutral-400 hover:text-[#f96b02] hover:bg-neutral-100 rounded-full lg:hidden">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4" noValidate>
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">Product Image (Full Card Image)</label>
                  <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl border border-neutral-200">
                    <Button variant="none" size="none" type="button" onClick={() => setImageInputType('url')} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${imageInputType === 'url' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-[#f96b02]'}`}>Image URL</Button>
                    <Button variant="none" size="none" type="button" onClick={() => setImageInputType('file')} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${imageInputType === 'file' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-[#f96b02]'}`}>Upload File</Button>
                  </div>
                </div>

                {imageInputType === 'url' ? (
                  <div className="flex gap-2 items-center">
                    <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://images.unsplash.com/..." className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-xs" required />
                    {formData.image && (
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                        <img src={formData.image} alt="Preview" className="max-h-full max-w-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-neutral-300 hover:border-[#f96b02] rounded-2xl p-4 text-center transition-colors cursor-pointer relative bg-neutral-50 flex flex-col items-center justify-center gap-1">
                      <input type="file" accept="image/*,.heic,.heif" onChange={handleImageFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <Upload className="w-5 h-5 text-neutral-600" />
                      <span className="text-xs font-bold text-neutral-800">Click or drag image file here</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Product Card Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Philips Classic Clogs"
                  className={`w-full px-4 py-3 text-sm bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 font-semibold transition-colors ${
                    isDuplicateTitle
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                      : 'border-neutral-200 focus:ring-black'
                  }`}
                  required
                />
                {isDuplicateTitle && (
                  <p className="mt-1.5 text-xs text-red-600 font-bold flex items-center gap-1 animate-pulse">
                    <span>⚠️</span> A product card with this title already exists. Please choose a different title.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Store</label>
                  <CustomSelect value={formData.store} onChange={(val) => setFormData({ ...formData, store: val })} options={dbStores} placeholder="Select Store" dropdownKey="custom-add-store" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Category</label>
                  <CustomSelect value={formData.category} onChange={(val) => setFormData({ ...formData, category: val })} options={dbCategories} placeholder="Select Category" dropdownKey="custom-add-category" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    onKeyDown={preventNegativeKeys}
                    value={formData.discount}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      setFormData(prev => ({ ...prev, discount: clean }));
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
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      if (clean === '') {
                        setFormData(prev => ({
                          ...prev,
                          salePrice: '',
                          cashbackWithoutReview: 0,
                          cashbackWithReview: 0
                        }));
                      } else {
                        const slabs = calculateCashback(Number(clean) || 0);
                        setFormData(prev => ({
                          ...prev,
                          salePrice: clean,
                          cashbackWithoutReview: slabs.withoutReview,
                          cashbackWithReview: slabs.withReview
                        }));
                      }
                    }}
                    placeholder="e.g. 499"
                    className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold"
                    required
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
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Affiliate Link URL</label>
                <input type="text" value={formData.affiliateUrl} onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })} placeholder="https://example.com/store/deal" className="w-full px-4 py-3 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-xs" />
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
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} className="text-xs rounded-xl !px-6 !py-3 normal-case tracking-normal shadow-md">Upload Custom Card</Button>
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
                  originalPrice: 0,
                  salePrice: formData.salePrice || 0,
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
