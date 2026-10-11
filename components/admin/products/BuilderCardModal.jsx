'use client';
import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import Button from '@/components/common/Button';
import StoreOfferCard from '@/components/deals/StoreOfferCard';
import CustomSelect from '@/components/common/CustomSelect';

export default function BuilderCardModal({ isOpen, onClose, onSuccess, dbStores, dbCategories }) {
  const [formData, setFormData] = useState({
    title: '',
    store: dbStores.length > 0 ? dbStores[0].id : '',
    category: dbCategories.length > 0 ? dbCategories[0].id : '',
    originalPrice: '',
    salePrice: '',
    discount: '',
    cashback: '',
    image: '',
    affiliateUrl: '',
    isTrending: false,
    isActive: true,
    expiresAt: '',
  });
  const [imageInputType, setImageInputType] = useState('url');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3500);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a smaller image.');
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

  const handleSaveAdd = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return showError("Please enter the Product Card Title!");
    if (!formData.store) return showError("Please select a Store!");
    if (!formData.category) return showError("Please select a Category!");
    if (!formData.originalPrice) return showError("Please enter the Original Price!");
    if (!formData.discount) return showError("Please enter the Discount!");
    if (!formData.salePrice) return showError("Please enter the Sale Price!");
    if (!formData.cashback) return showError("Please enter the Cashback!");
    if (!formData.image.trim()) return showError("Please upload or provide a Product Image!");
    if (!formData.affiliateUrl.trim()) return showError("Please provide the Affiliate Link URL!");

    setIsSubmitting(true);
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      const token = adminUserStr ? JSON.parse(adminUserStr).token : null;

      const actualTitle = formData.title.trim();
      const slug = actualTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
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
          originalPrice: Number(formData.originalPrice) || 0,
          salePrice: Number(formData.salePrice) || 0,
          discount: Number(formData.discount) || 0,
          cashback: formData.cashback !== '' ? Number(formData.cashback) : 0,
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

      if (res.ok) {
        onSuccess('added');
      } else {
        alert('Failed to add product');
      }
    } catch (err) {
      console.error(err);
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
                <span className="text-xl">🎨</span> Create Card with Builder
              </h4>
              <Button variant="none" size="none" onClick={onClose} className="p-1.5 text-neutral-400 hover:text-[#f96b02] hover:bg-neutral-100 rounded-full lg:hidden">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {errorMsg && (
              <div className="fixed top-24 right-8 z-[100] bg-white border-l-4 border-red-500 text-neutral-800 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-bold animate-bounce">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <span>{errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="ml-2 text-neutral-400 hover:text-neutral-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSaveAdd} className="space-y-4" noValidate>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Product Card Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Philips Classic Clogs" className="w-full px-4 py-3 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-semibold" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Store</label>
                  <CustomSelect value={formData.store} onChange={(val) => setFormData({ ...formData, store: val })} options={dbStores} placeholder="Select Store" dropdownKey="builder-add-store" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Category</label>
                  <CustomSelect value={formData.category} onChange={(val) => setFormData({ ...formData, category: val })} options={dbCategories} placeholder="Select Category" dropdownKey="builder-add-category" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Orig. Price (₹)</label>
                  <input type="number" value={formData.originalPrice} onChange={(e) => {
                    const originalPrice = e.target.value;
                    let salePrice = formData.salePrice;
                    if (originalPrice && formData.discount) {
                      salePrice = Math.round(Number(originalPrice) * (1 - Number(formData.discount) / 100));
                    }
                    setFormData({ ...formData, originalPrice, salePrice });
                  }} className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" required />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Discount (%)</label>
                  <input type="number" value={formData.discount} onChange={(e) => {
                    const discount = e.target.value;
                    let salePrice = formData.salePrice;
                    if (discount && formData.originalPrice) {
                      salePrice = Math.round(Number(formData.originalPrice) * (1 - Number(discount) / 100));
                    }
                    setFormData({ ...formData, discount, salePrice });
                  }} placeholder="e.g. 62" className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold text-amber-700" required />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Sale Price (₹)</label>
                  <input type="number" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold" required />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Cashback (₹)</label>
                  <input type="number" step="0.1" value={formData.cashback} onChange={(e) => setFormData({ ...formData, cashback: e.target.value })} placeholder="e.g. 5" className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold text-emerald-700" />
                </div>
              </div>

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
                      <input type="file" accept="image/*" onChange={handleImageFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <Upload className="w-5 h-5 text-neutral-600" />
                      <span className="text-xs font-bold text-neutral-800">Click or drag image file here</span>
                    </div>
                  </div>
                )}
              </div>

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
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} className="text-xs rounded-xl !px-6 !py-3 normal-case tracking-normal shadow-md">Add Product Card</Button>
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
                  salePrice: formData.salePrice || 999,
                  cashback: formData.cashback,
                  image: formData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
                  affiliateUrl: formData.affiliateUrl || '#'
                }}
                store={dbStores.find(s => s.id === formData.store) || { name: 'Store', logoUrl: '' }}
                fullWidth={true}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
