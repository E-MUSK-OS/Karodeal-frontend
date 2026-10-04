'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader2, X, Check } from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => {}, isDestructive: true });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);

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
      const res = await fetch('https://karodeal-backend.vercel.app/api/meta/categories');
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
    if (!name) return;
    setIsSubmitting(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('name', name.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('https://karodeal-backend.vercel.app/api/meta/categories', {
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
        setSlug('');
        setImageFile(null);
      } else {
        alert('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This will also delete all associated products.',
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const token = getToken();
          const res = await fetch(`https://karodeal-backend.vercel.app/api/meta/categories/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            setCategories(categories.filter((c) => c.id !== id));
          } else {
            alert('Failed to delete category');
          }
        } catch (error) {
          console.error('Error deleting category:', error);
          alert('Failed to delete category');
        }
      }
    });
  };

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditImageFile(null);
  };

  const handleUpdate = async (id) => {
    if (!editName) return;
    setIsSubmitting(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('name', editName.trim());
      if (editImageFile) {
        formData.append('image', editImageFile);
      }

      const res = await fetch(`https://karodeal-backend.vercel.app/api/meta/categories/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        setCategories(categories.map(c => c.id === id ? { ...c, ...updated } : c));
        setEditingId(null);
      } else {
        alert('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h3 className="text-2xl font-extrabold text-neutral-900">Categories Management</h3>
        <p className="text-sm text-neutral-500">Organize site categories and store classifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Form */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm h-max">
          <h4 className="text-lg font-bold text-neutral-900 mb-4">Add New Category</h4>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Home & Kitchen"
                className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth={true}
              isLoading={isSubmitting}
              icon={!isSubmitting && <Plus className="w-4 h-4" />}
              className="py-3 rounded-xl normal-case tracking-normal shadow-md text-xs"
            >
              {isSubmitting ? 'Adding...' : 'Add Category'}
            </Button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <h4 className="text-lg font-bold text-neutral-900 mb-4">Active Categories</h4>
          <div className="divide-y divide-neutral-100">
            {loading ? (
              <div className="py-4">
                <PageLoader />
              </div>
            ) : categories.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">No categories found. Add one to get started.</div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4 flex-1">
                    {cat.image ? (
                      <img
                        src={cat.image.startsWith('/') ? `http://localhost:5000${cat.image}` : cat.image}
                        alt={cat.name}
                        className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 text-xs">No img</div>
                    )}
                    <div>
                      <div className="font-bold text-neutral-900 text-sm">{cat.name}</div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {cat._count?.products || 0} Products
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <Button variant="none" size="none"
                      onClick={() => startEditing(cat)}
                      className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="none" size="none"
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h4 className="text-lg font-bold text-neutral-900">Edit Category</h4>
              <Button variant="none" size="none"
                onClick={cancelEditing}
                className="text-neutral-400 hover:text-neutral-900 transition-colors bg-neutral-100 hover:bg-neutral-200 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">Update Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImageFile(e.target.files[0])}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex gap-3 justify-end">
              <Button variant="none" size="none"
                onClick={cancelEditing}
                className="px-5 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-200 rounded-xl transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdate(editingId)}
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                icon={!isSubmitting && <Check className="w-4 h-4" />}
                className="text-sm rounded-xl !px-5 !py-2.5 normal-case tracking-normal shadow-md"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
    </div>
  );
}
