'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Trash2, Edit3, ExternalLink, CheckCircle2, Upload, X, Loader2 } from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';

export default function AdminStoresPage() {
  const [stores, setStores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [imageInputType, setImageInputType] = useState('url'); // 'url' | 'file'
  const [isReloading, setIsReloading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setIsReloading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meta/stores`);
      if (res.ok) {
        const data = await res.json();
        setStores(data);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setIsReloading(false);
      setInitialLoading(false);
    }
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
        setLogoUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      const token = adminUserStr ? JSON.parse(adminUserStr).token : null;

      const method = editingStoreId ? 'PUT' : 'POST';
      const url = editingStoreId
        ? `${process.env.NEXT_PUBLIC_API_URL}/meta/stores/${editingStoreId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/meta/stores`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          logoUrl: logoUrl.trim()
        })
      });

      if (res.ok) {
        loadStores();
        setName('');
        setSlug('');
        setLogoUrl('');
        setEditingStoreId(null);
        setIsModalOpen(false);
      } else {
        alert(editingStoreId ? 'Failed to update store' : 'Failed to add store');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (store) => {
    setEditingStoreId(store.id);
    setName(store.name);
    setSlug(store.slug || '');
    const img = store.logoUrl || '';
    setLogoUrl(img);
    setImageInputType(img.startsWith('data:') ? 'file' : 'url');
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingStoreId(null);
    setName('');
    setSlug('');
    setLogoUrl('');
    setImageInputType('url');
    setIsModalOpen(true);
  };

  const handleDeleteStore = async (id) => {
    if (!confirm('Are you sure you want to delete this store?')) return;
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      const token = adminUserStr ? JSON.parse(adminUserStr).token : null;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meta/stores/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        loadStores();
      } else {
        alert('Failed to delete store');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-neutral-900">Stores Management</h3>
          <p className="text-sm text-neutral-500">Manage affiliate stores and cashback rates</p>
        </div>

        <Button variant="none" size="none"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-medium text-xs rounded-xl transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Store
        </Button>
      </div>

      {/* Stores Table - Simple Design */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden mt-8 w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm min-w-[600px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6 w-24">Sr No.</th>
                <th className="py-4 px-6 w-32">Logo</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6 pr-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {initialLoading ? (
                <tr>
                  <td colSpan="4" className="p-8">
                    <PageLoader />
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-neutral-500 font-medium">No stores found.</td>
                </tr>
              ) : stores.map((store, index) => (
                <tr key={store.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-4 px-6 font-mono text-sm text-neutral-500 font-bold">
                    {index + 1}
                  </td>
                  <td className="py-4 px-6">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                      {store.logoUrl ? (
                        <img
                          src={store.logoUrl}
                          alt={store.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="font-extrabold text-sm text-neutral-900 uppercase">
                          {store.name?.charAt(0) || 'S'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-neutral-900 ">
                    {store.name}
                  </td>
                  <td className="py-4 px-6 pr-8">
                    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                      <Button variant="none" size="none"
                        onClick={() => handleOpenEdit(store)}
                        className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Edit Store"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="none" size="none"
                        onClick={() => handleDeleteStore(store.id)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Store"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-neutral-900">{editingStoreId ? 'Edit Store' : 'Add New Affiliate Store'}</h4>
              <Button variant="none" size="none"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleAddStore} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingStoreId) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Nykaa"
                  className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">Store Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. nykaa"
                  className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-[10px] text-neutral-500 mt-1">Leave blank to auto-generate from name.</p>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Store Logo
                  </label>
                  <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl border border-neutral-200">
                    <Button variant="none" size="none"
                      type="button"
                      onClick={() => setImageInputType('url')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${imageInputType === 'url'
                          ? 'bg-white text-black shadow-xs'
                          : 'text-neutral-500 hover:text-black'
                        }`}
                    >
                      Image URL
                    </Button>
                    <Button variant="none" size="none"
                      type="button"
                      onClick={() => setImageInputType('file')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${imageInputType === 'file'
                          ? 'bg-white text-black shadow-xs'
                          : 'text-neutral-500 hover:text-black'
                        }`}
                    >
                      Upload File
                    </Button>
                  </div>
                </div>

                {imageInputType === 'url' ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-xs"
                    />
                    {logoUrl && (
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                        <img
                          src={logoUrl}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-neutral-300 hover:border-black rounded-2xl p-4 text-center transition-colors cursor-pointer relative bg-neutral-50 flex flex-col items-center justify-center gap-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload className="w-5 h-5 text-neutral-600" />
                      <span className="text-xs font-bold text-neutral-800">Click or drag image file here</span>
                      <span className="text-[10px] text-neutral-400">PNG, JPG, WEBP, GIF up to 5MB</span>
                    </div>

                    {logoUrl && logoUrl.startsWith('data:') && (
                      <div className="flex items-center gap-3 p-2 bg-neutral-50 border border-neutral-200 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                          <img
                            src={logoUrl}
                            alt="Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="text-xs text-neutral-700 font-mono truncate flex-1 font-semibold">
                          Image selected
                        </span>
                        <Button variant="none" size="none"
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="text-xs font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button variant="none" size="none"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  className="text-xs rounded-xl !px-5 !py-2.5 normal-case tracking-normal"
                >
                  {editingStoreId ? 'Update Store' : 'Save Store'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
