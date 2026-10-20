'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit2, Loader2, X, Check, Search, UploadCloud, ExternalLink, Sparkles, Layers, ArrowUpRight } from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import ConfirmModal from '@/components/common/ConfirmModal';
import ImageCropper from '@/components/admin/common/ImageCropper';
import { handleAppError, showSuccessToast, showErrorToast } from '@/lib/errorHandler';
import { processImageUpload } from '@/lib/imageProcessor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => {}, isDestructive: true });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);

  // Cropper state
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropTarget, setCropTarget] = useState(null); // 'add' or 'edit'

  const handleFileChange = async (e, target) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImageUpload(file, { maxSizeMB: 5.0 });
        const reader = new FileReader();
        reader.onload = (event) => {
          setCropImageSrc(event.target.result);
          setCropTarget(target);
        };
        reader.readAsDataURL(processed?.file || file);
      } catch (err) {
        showErrorToast(err.message || 'Failed to process image');
      }
      e.target.value = ''; // Reset input
    }
  };

  const handleCropComplete = async (croppedBase64) => {
    try {
      const res = await fetch(croppedBase64);
      const blob = await res.blob();
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
      
      if (cropTarget === 'add') {
        setImageFile(file);
        setImagePreviewUrl(croppedBase64);
      } else if (cropTarget === 'edit') {
        setEditImageFile(file);
        setEditPreviewUrl(croppedBase64);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCropImageSrc(null);
      setCropTarget(null);
    }
  };

  const getToken = () => {
    const adminUserStr = localStorage.getItem('adminUser');
    if (adminUserStr) {
      try {
        return JSON.parse(adminUserStr).token;
      } catch (e) { }
    }
    return localStorage.getItem('token');
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/meta/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showErrorToast('Please enter category name.');
      return;
    }
    if (!imageFile) {
      showErrorToast('Category image is compulsory. Please select and crop an image.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('image', imageFile);

      const res = await fetch(`${API_URL}/meta/categories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setCategories([...categories, data]);
        setName('');
        setImageFile(null);
        setImagePreviewUrl(null);
        showSuccessToast('Category created successfully!');
      } else {
        const data = await res.json().catch(() => ({}));
        handleAppError(data.error || 'Failed to create category', {
          context: 'Admin Categories / Create',
          title: 'Category Creation Failed',
          fallback: 'Could not create category. Please try again.'
        });
      }
    } catch (error) {
      handleAppError(error, {
        context: 'Admin Categories / Create Network',
        title: 'Connection Error',
        fallback: 'Unable to connect to server. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This will also affect all associated products.',
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const token = getToken();
          const res = await fetch(`${API_URL}/meta/categories/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            setCategories(categories.filter((c) => c.id !== id));
            showSuccessToast('Category deleted successfully.');
          } else {
            const data = await res.json().catch(() => ({}));
            handleAppError(data.error || 'Failed to delete category', {
              context: 'Admin Categories / Delete',
              title: 'Delete Failed',
              fallback: 'Could not delete category.'
            });
          }
        } catch (error) {
          handleAppError(error, {
            context: 'Admin Categories / Delete Network',
            title: 'Delete Error'
          });
        }
      }
    });
  };

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name || '');
    setEditImageFile(null);
    setEditPreviewUrl(cat.image || null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditImageFile(null);
    setEditPreviewUrl(null);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) {
      showErrorToast('Category name cannot be empty.');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('name', editName.trim());
      if (editImageFile) {
        formData.append('image', editImageFile);
      }

      const res = await fetch(`${API_URL}/meta/categories/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        setCategories(categories.map(c => c.id === id ? { ...c, ...updated } : c));
        cancelEditing();
        showSuccessToast('Category updated successfully!');
      } else {
        const data = await res.json().catch(() => ({}));
        handleAppError(data.error || 'Failed to update category', {
          context: 'Admin Categories / Update',
          title: 'Update Failed'
        });
      }
    } catch (error) {
      handleAppError(error, {
        context: 'Admin Categories / Update Network',
        title: 'Update Error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalProducts = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c._count?.products || 0), 0);
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.slug || '').toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  return (
    <div className="space-y-8 relative pb-12">
      {/* 1. SaaS Dashboard Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#f96b02] text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Taxonomy & Collections Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
            Categories Management
          </h2>
          <p className="text-sm text-neutral-500 font-medium mt-1">
            Create, curate, and organize site categories with responsive 3:4 lifestyle photography.
          </p>
        </div>

        {/* Quick Stat Chips */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white border border-neutral-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Categories</span>
              <span className="block text-base font-black text-neutral-950">{categories.length}</span>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-white border border-neutral-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#f96b02] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Linked Deals</span>
              <span className="block text-base font-black text-neutral-950">{totalProducts}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* 2. Add Category Studio Form */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-7 shadow-sm sticky top-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-base sm:text-lg text-neutral-950 uppercase tracking-tight">
                Add New Category
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                Upload image & assign taxonomy
              </p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <form onSubmit={handleAddCategory} className="space-y-5">
            {/* Category Name Input */}
            <div>
              <label className="block text-[11px] font-black uppercase text-neutral-700 tracking-wider mb-1.5">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Denim, Co Ord Set, Sneakers"
                className="w-full px-4 py-3 text-sm font-semibold bg-neutral-50/70 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f96b02] focus:bg-white transition-all shadow-2xs"
                required
              />
            </div>

            {/* Interactive Image Dropzone / Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-black uppercase text-neutral-700 tracking-wider">
                  Lifestyle Visual <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">3:4 Aspect</span>
              </div>

              {!imagePreviewUrl ? (
                <label className="relative border-2 border-dashed border-neutral-200 hover:border-[#f96b02] rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all bg-neutral-50/60 hover:bg-orange-50/20 group">
                  <input
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={(e) => handleFileChange(e, 'add')}
                    className="sr-only"
                    required={!imageFile}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:text-[#f96b02] group-hover:scale-108 transition-all">
                    <UploadCloud className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-black text-neutral-800 uppercase tracking-wider block">
                      Choose / Drop Photo
                    </span>
                    <span className="text-[10px] text-neutral-500 font-medium block mt-0.5">
                      Auto opens crop tool (JPG, PNG, WebP)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-neutral-200/80 text-neutral-700 uppercase tracking-wider">
                    Compulsory
                  </span>
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-950 aspect-[3/4] max-w-[190px] mx-auto shadow-md group">
                  <img
                    src={imagePreviewUrl}
                    alt="Cropped Preview"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                    <label className="px-3.5 py-1.5 rounded-xl bg-white text-neutral-950 text-xs font-black uppercase tracking-wider shadow-md cursor-pointer hover:bg-neutral-100 transition-all">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*,.heic,.heif"
                        onChange={(e) => handleFileChange(e, 'add')}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-black/75 backdrop-blur-md text-emerald-400 border border-white/20 block text-center shadow-xs">
                      ✓ Ready ({Math.round((imageFile?.size || 0) / 1024)} KB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth={true}
              isLoading={isSubmitting}
              disabled={isSubmitting || !name.trim() || !imageFile}
              icon={!isSubmitting && <Plus className="w-4 h-4 stroke-[2.5]" />}
              className="py-3.5 rounded-2xl normal-case tracking-normal shadow-lg shadow-black/10 hover:shadow-orange-500/25 text-xs font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Creating Category...' : 'Create Category'}
            </Button>
          </form>
        </div>

        {/* 3. Active Categories List & Controls */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-6 sm:p-7">
          {/* List Header with Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100 mb-4">
            <div className="flex items-center gap-2.5">
              <h3 className="font-black text-base sm:text-lg text-neutral-950 uppercase tracking-tight">
                Active Categories
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#f96b02]/10 text-[#f96b02] border border-[#f96b02]/20">
                {filteredCategories.length}
              </span>
            </div>

            {/* Live Search Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-50/70 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#f96b02] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Rows */}
          <div className="divide-y divide-neutral-100">
            {loading ? (
              <div className="py-12">
                <PageLoader />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-bold text-neutral-400">
                  {searchQuery ? `No categories found matching "${searchQuery}".` : 'No categories found. Add one to get started.'}
                </p>
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const catImg = cat.image
                  ? (cat.image.startsWith('/')
                    ? `${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace(/\/api\/?$/, '')}${cat.image}`
                    : cat.image)
                  : null;

                const dealCount = cat._count?.products || 0;

                return (
                  <div
                    key={cat.id}
                    className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-neutral-50/60 px-3 -mx-3 rounded-2xl transition-colors"
                  >
                    {/* Left: Fashion Squircle Thumbnail + Title + Meta */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {catImg ? (
                        <div className="w-14 h-18 sm:w-16 sm:h-20 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/90 shrink-0 shadow-2xs group-hover:shadow-md transition-shadow">
                          <img
                            src={catImg}
                            alt={cat.name}
                            className="w-full h-full object-cover object-top group-hover:scale-106 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-18 sm:w-16 sm:h-20 rounded-2xl bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center text-neutral-400 text-[10px] font-bold uppercase">
                          No Pic
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-neutral-900 text-sm sm:text-base uppercase tracking-tight truncate group-hover:text-[#f96b02] transition-colors">
                            {cat.name}
                          </h4>
                          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono text-neutral-400 bg-neutral-100">
                            /{cat.slug || cat.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-orange-50 text-[#f96b02] border border-orange-200/70">
                            {dealCount} {dealCount === 1 ? 'Product' : 'Products'}
                          </span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            {cat.updatedAt ? new Date(cat.updatedAt).toLocaleDateString() : 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Toolbar */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      <Link
                        href={`/categories/${cat.slug || cat.id}`}
                        target="_blank"
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
                        title="View Live Category Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <Button
                        variant="none"
                        size="none"
                        onClick={() => startEditing(cat)}
                        className="p-2 text-neutral-400 hover:text-[#f96b02] hover:bg-orange-50 rounded-xl transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="none"
                        size="none"
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Luxury Edit Category Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-neutral-100">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h4 className="font-black text-lg text-neutral-950 uppercase tracking-tight">Edit Category</h4>
                <p className="text-xs text-neutral-500 font-medium">Update title or visual lifestyle asset</p>
              </div>
              <Button
                variant="none"
                size="none"
                onClick={cancelEditing}
                className="text-neutral-400 hover:text-neutral-950 transition-colors bg-neutral-100 hover:bg-neutral-200 p-2 rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-black uppercase text-neutral-700 tracking-wider mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-semibold bg-neutral-50/70 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f96b02] focus:bg-white transition-all shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-neutral-700 tracking-wider mb-1.5">
                  Update Lifestyle Photo
                </label>

                {editPreviewUrl && (
                  <div className="mb-3 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-950 aspect-[3/4] max-w-[140px] mx-auto shadow-sm">
                    <img
                      src={editPreviewUrl.startsWith('/') ? `${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace(/\/api\/?$/, '')}${editPreviewUrl}` : editPreviewUrl}
                      alt="Edit Preview"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                )}

                <label className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs">
                  <UploadCloud className="w-4 h-4" />
                  <span>Choose New Image</span>
                  <input
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={(e) => handleFileChange(e, 'edit')}
                    className="sr-only"
                  />
                </label>
                {editImageFile && (
                  <p className="text-[11px] font-bold text-emerald-600 mt-2 text-center">
                    ✓ New image cropped ({Math.round(editImageFile.size / 1024)} KB)
                  </p>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-neutral-100 bg-neutral-50/70 flex gap-3 justify-end">
              <Button
                variant="none"
                size="none"
                onClick={cancelEditing}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-200 rounded-xl transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdate(editingId)}
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                icon={!isSubmitting && <Check className="w-4 h-4 stroke-[2.5]" />}
                className="text-xs font-black uppercase tracking-wider rounded-xl !px-5 !py-2.5 shadow-md hover:shadow-orange-500/25"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Cropper Modal */}
      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          aspectRatio={3 / 4}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropImageSrc(null);
            setCropTarget(null);
          }}
        />
      )}

      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
    </div>
  );
}
