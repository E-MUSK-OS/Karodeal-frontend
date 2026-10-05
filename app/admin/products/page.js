'use client';
import { useState, useEffect } from 'react';

import {
  Search, Plus, Edit3, Trash2, CheckCircle2, ExternalLink, Tag, RefreshCw, X, Upload, ChevronUp, ChevronDown, ArrowUpDown, Loader2
} from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import ConfirmModal from '@/components/common/ConfirmModal';
import StoreOfferCard from '@/components/deals/StoreOfferCard';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [dbStores, setDbStores] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [imageInputType, setImageInputType] = useState('url'); // 'url' | 'file'
  const [isReloading, setIsReloading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => {}, isDestructive: true });

  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStore, sortConfig]);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    title: '',
    store: '',
    category: '',
    originalPrice: '',
    salePrice: '',
    discount: '',
    cashback: '',
    image: '',
    affiliateUrl: '',
    isTrending: false,
    isActive: true,
    cardType: 'builder',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsReloading(true);
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      const token = adminUserStr ? JSON.parse(adminUserStr).token : null;
      
      let productsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/admin`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (productsRes.status === 404) {
        // Fallback for when backend is not yet updated on Vercel
        productsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      }

      const [storesRes, categoriesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/meta/stores`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/meta/categories`)
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data);
      }
      if (storesRes.ok) {
        const data = await storesRes.json();
        setDbStores(data);
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setDbCategories(data);
      }
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setIsReloading(false);
      setInitialLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
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
        setFormData((prev) => ({
          ...prev,
          image: event.target.result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    const img = product.image || '';
    setImageInputType(img.startsWith('data:') ? 'file' : 'url');
    const isCustom = product.salePrice === 0 && product.discount === 0;
    setFormData({
      title: product.title || '',
      store: product.storeId || '',
      category: product.categoryId || '',
      originalPrice: product.originalPrice || '',
      salePrice: product.salePrice || '',
      discount: product.discount || '',
      cashback: product.cashback !== undefined ? product.cashback : '',
      image: img,
      affiliateUrl: product.affiliateUrl || '',
      isTrending: product.isTrending || false,
      isActive: product.isActive !== undefined ? product.isActive : true,
      cardType: isCustom ? 'custom' : 'builder',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      const token = adminUserStr ? JSON.parse(adminUserStr).token : null;
      const isCustom = formData.cardType === 'custom';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: isCustom ? `Custom Deal ${Date.now()}` : formData.title.trim(),
          store: formData.store,
          category: formData.category,
          originalPrice: isCustom ? 0 : (Number(formData.originalPrice) || 0),
          salePrice: isCustom ? 0 : (Number(formData.salePrice) || 0),
          discount: isCustom ? 0 : (Number(formData.discount) || 0),
          cashback: isCustom ? 0 : (formData.cashback !== '' ? Number(formData.cashback) : 0),
          image: formData.image.trim(),
          affiliateUrl: formData.affiliateUrl.trim(),
          isTrending: formData.isTrending,
          isActive: formData.isActive,
        })
      });

      if (res.ok) {
        loadProducts(); // Refresh list
        setEditingProduct(null);
        showToast('Product card updated successfully!');
      } else {
        alert('Failed to update product');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAdd = () => {
    setImageInputType('url');
    setFormData({
      title: '',
      store: dbStores.length > 0 ? dbStores[0].id : '',
      category: dbCategories.length > 0 ? dbCategories[0].id : '',
      originalPrice: 1999,
      salePrice: 999,
      discount: 50,
      cashback: 5,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      affiliateUrl: 'https://amazon.in',
      isTrending: false,
      isActive: true,
      cardType: 'builder',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      const token = adminUserStr ? JSON.parse(adminUserStr).token : null;
      const isCustom = formData.cardType === 'custom';
      const actualTitle = isCustom ? `Custom Deal ${Date.now()}` : formData.title.trim();
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
          originalPrice: isCustom ? 0 : (Number(formData.originalPrice) || 0),
          salePrice: isCustom ? 0 : (Number(formData.salePrice) || 0),
          discount: isCustom ? 0 : (Number(formData.discount) || 0),
          cashback: isCustom ? 0 : (formData.cashback !== '' ? Number(formData.cashback) : 0),
          rating: '4.5',
          reviews: 120,
          image: formData.image.trim(),
          affiliateUrl: formData.affiliateUrl.trim(),
          isTrending: formData.isTrending,
          isActive: formData.isActive,
          features: ['Best Seller', 'Verified Deal'],
        })
      });

      if (res.ok) {
        loadProducts();
        setIsAddModalOpen(false);
        showToast('New product card added!');
      } else {
        alert('Failed to add product');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product card?',
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const adminUserStr = localStorage.getItem('adminUser');
          const token = adminUserStr ? JSON.parse(adminUserStr).token : null;
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            loadProducts();
            showToast('Product card deleted.');
          } else {
            alert('Failed to delete product');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleToggleActive = async (product) => {
    // Optimistic UI update
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
    
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      const token = adminUserStr ? JSON.parse(adminUserStr).token : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isActive: !product.isActive
        })
      });
      if (res.ok) {
        showToast(`Product ${product.isActive ? 'deactivated' : 'activated'} successfully!`);
      } else {
        // Revert on failure
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: product.isActive } : p));
        alert('Failed to toggle status');
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: product.isActive } : p));
    }
  };


  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStore = selectedStore === 'ALL' || String(p.storeId) === String(selectedStore);
    return matchesSearch && matchesStore;
  }).sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    if (sortConfig.key === 'cashback') {
      const getCB = (item) => item.cashback !== undefined && item.cashback !== '' ? Number(item.cashback) : (((item.id ? item.id.charCodeAt(item.id.length - 1) : 0) % 5) + 2 + ((item.id ? item.id.charCodeAt(item.id.length - 1) : 0) % 2 === 0 ? 0.5 : 0));
      aVal = getCB(a);
      bVal = getCB(b);
    }

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1.5 opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 ml-1.5 text-black" /> : <ChevronDown className="w-3.5 h-3.5 ml-1.5 text-black" />;
  };

  const CustomSelect = ({ value, onChange, options, placeholder, dropdownKey }) => {
    const isOpen = openDropdown === dropdownKey;
    const selectedOption = options.find(opt => opt.id === value);

    return (
      <div className="relative">
        <div
          onClick={() => setOpenDropdown(isOpen ? null : dropdownKey)}
          className="w-full px-4 py-3 pr-10 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black cursor-pointer flex items-center capitalize"
        >
          <span className="truncate">{selectedOption ? selectedOption.name : placeholder}</span>
          <ChevronDown className={`w-4 h-4 text-neutral-500 absolute right-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {options.map(opt => (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setOpenDropdown(null);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-neutral-100 capitalize ${value === opt.id ? 'bg-neutral-50 font-bold' : ''}`}
              >
                {opt.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" onClick={() => setOpenDropdown(null)}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-black text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-neutral-900">Product & Deal Cards</h3>
          <p className="text-sm text-neutral-500">
            Manage product cards shown across the website dynamically from the database.
          </p>
        </div>

        <Button variant="none" size="none"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-black hover:bg-[#f96b02] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Product Card
        </Button>
      </div>

      {/* Search & Store Filters */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product card title..."
            className="w-full px-4 py-2.5 pl-10 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Store Select Dropdown */}
        <div className="w-full sm:w-auto relative">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 pr-10 text-xs font-bold uppercase tracking-wider bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black cursor-pointer text-neutral-900 appearance-none"
          >
            <option value="ALL">All Stores</option>
            {dbStores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Showing {filteredProducts.length} Product Cards
          </span>
          <Button variant="none" size="none"
            onClick={loadProducts}
            disabled={isReloading}
            className="text-xs font-semibold text-neutral-600 hover:text-[#f96b02] flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin text-black' : ''}`} />
            {isReloading ? 'Reloading...' : 'Reload'}
          </Button>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[70vh] w-full">
          <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-neutral-50 text-neutral-500 text-xs font-bold uppercase tracking-wider shadow-[0_1px_0_0_#e5e5e5]">
                <th className="p-4 pl-6 cursor-pointer hover:bg-neutral-200 transition-colors group select-none w-24">
                  <div className="flex items-center">SR NO.</div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-neutral-200 transition-colors group select-none" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center">Product <SortIcon columnKey="createdAt" /></div>
                </th>
                <th className="p-4 select-none">
                  <div className="flex items-center">Store</div>
                </th>
                <th className="p-4 select-none">
                  <div className="flex items-center">Category</div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-neutral-200 transition-colors group select-none" onClick={() => handleSort('discount')}>
                  <div className="flex items-center">Discount <SortIcon columnKey="discount" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-neutral-200 transition-colors group select-none" onClick={() => handleSort('cashback')}>
                  <div className="flex items-center">Cashback <SortIcon columnKey="cashback" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-neutral-200 transition-colors group select-none" onClick={() => handleSort('salePrice')}>
                  <div className="flex items-center">Price <SortIcon columnKey="salePrice" /></div>
                </th>
                <th className="p-4 text-center select-none">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {(initialLoading || isReloading) ? (
                <tr>
                  <td colSpan="9" className="p-8">
                    <PageLoader />
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-neutral-500 font-medium">No product cards found.</td>
                </tr>
              ) : paginatedProducts.map((p, index) => {
                const displayCashback = p.cashback !== undefined && p.cashback !== ''
                  ? p.cashback
                  : (((p.id ? p.id.charCodeAt(p.id.length - 1) : 0) % 5) + 2 + ((p.id ? p.id.charCodeAt(p.id.length - 1) : 0) % 2 === 0 ? 0.5 : 0));

                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                return (
                  <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="p-4 pl-6 font-mono text-sm text-neutral-500 font-bold">
                      {globalIndex}
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="font-bold text-neutral-900 line-clamp-1 max-w-xs">{p.title}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-neutral-100 text-neutral-900 border border-neutral-200">
                        {p.storeRel?.name || p.storeId}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-neutral-600 capitalize">
                      {p.categoryRel?.name || p.categoryId}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                        {p.discount}% OFF
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                        Flat ₹{displayCashback} Cashback
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-neutral-900">₹{p.salePrice}</div>
                      {p.originalPrice > 0 && (
                        <div className="text-xs text-neutral-400 line-through">₹{p.originalPrice}</div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none transition-colors ${p.isActive ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                        title={p.isActive ? 'Click to Deactivate' : 'Click to Activate'}
                      >
                        <span className="sr-only">Toggle active status</span>
                        <span aria-hidden="true" className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${p.isActive ? 'translate-x-2' : '-translate-x-2'}`} />
                      </button>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <Button variant="none" size="none"
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 text-neutral-600 hover:text-[#f96b02] hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Edit Product Card"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="none" size="none"
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-semibold">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
            </span>
            <div className="flex gap-1">
              <Button variant="none" size="none"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-neutral-50 text-neutral-600 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <Button variant="none" size="none"
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg transition-colors ${currentPage === pageNum
                          ? 'bg-black text-white'
                          : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-200'
                        }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button variant="none" size="none"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-neutral-50 text-neutral-600 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-5xl w-full shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
                  <h4 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-neutral-700" />
                    Edit Card Details
                  </h4>
                  <Button variant="none" size="none"
                    onClick={() => setEditingProduct(null)}
                    className="p-1.5 text-neutral-400 hover:text-[#f96b02] hover:bg-neutral-100 rounded-full lg:hidden"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl mb-4 w-fit">
                  <button type="button" onClick={() => setFormData({...formData, cardType: 'builder'})} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${formData.cardType !== 'custom' ? 'bg-white shadow text-black' : 'text-neutral-500 hover:text-[#f96b02]'}`}>Card Builder</button>
                  <button type="button" onClick={() => setFormData({...formData, cardType: 'custom'})} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${formData.cardType === 'custom' ? 'bg-white shadow text-black' : 'text-neutral-500 hover:text-[#f96b02]'}`}>Custom Upload</button>
                </div>

              {formData.cardType !== 'custom' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Product Card Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                    required={formData.cardType !== 'custom'}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Store
                  </label>
                  <div onClick={(e) => e.stopPropagation()}>
                    <CustomSelect
                      value={formData.store}
                      onChange={(val) => setFormData({ ...formData, store: val })}
                      options={dbStores}
                      placeholder="Select Store"
                      dropdownKey="edit-store"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Category
                  </label>
                  <div onClick={(e) => e.stopPropagation()}>
                    <CustomSelect
                      value={formData.category}
                      onChange={(val) => setFormData({ ...formData, category: val })}
                      options={dbCategories}
                      placeholder="Select Category"
                      dropdownKey="edit-category"
                    />
                  </div>
                </div>
              </div>

              {formData.cardType !== 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Sale Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold"
                      required={formData.cardType !== 'custom'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Orig. Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => {
                        const originalPrice = e.target.value;
                        let salePrice = formData.salePrice;
                        if (originalPrice && formData.discount) {
                          salePrice = Math.round(Number(originalPrice) * (1 - Number(formData.discount) / 100));
                        }
                        setFormData({ ...formData, originalPrice, salePrice });
                      }}
                      className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => {
                        const discount = e.target.value;
                        let salePrice = formData.salePrice;
                        if (discount && formData.originalPrice) {
                          salePrice = Math.round(Number(formData.originalPrice) * (1 - Number(discount) / 100));
                        }
                        setFormData({ ...formData, discount, salePrice });
                      }}
                      placeholder="e.g. 62"
                      className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold text-amber-700"
                      required={formData.cardType !== 'custom'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Cashback (₹)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.cashback}
                      onChange={(e) => setFormData({ ...formData, cashback: e.target.value })}
                      placeholder="e.g. 5"
                      className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold text-emerald-700"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Product Image
                  </label>
                  <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl border border-neutral-200">
                    <Button variant="none" size="none"
                      type="button"
                      onClick={() => setImageInputType('url')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${imageInputType === 'url'
                          ? 'bg-white text-black shadow-xs'
                          : 'text-neutral-500 hover:text-[#f96b02]'
                        }`}
                    >
                      Image URL
                    </Button>
                    <Button variant="none" size="none"
                      type="button"
                      onClick={() => setImageInputType('file')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${imageInputType === 'file'
                          ? 'bg-white text-black shadow-xs'
                          : 'text-neutral-500 hover:text-[#f96b02]'
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
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-xs"
                      required
                    />
                    {formData.image && (
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-neutral-300 hover:border-[#f96b02] rounded-2xl p-4 text-center transition-colors cursor-pointer relative bg-neutral-50 flex flex-col items-center justify-center gap-1">
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

                    {formData.image && (
                      <div className="flex items-center gap-3 p-2 bg-neutral-50 border border-neutral-200 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="text-xs text-neutral-700 font-mono truncate flex-1 font-semibold">
                          Image selected
                        </span>
                        <Button variant="none" size="none"
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="text-xs font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Affiliate Link URL
                </label>
                <input
                  type="text"
                  value={formData.affiliateUrl}
                  onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-xs"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button variant="none" size="none"
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-3 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  className="text-xs rounded-xl !px-6 !py-3 normal-case tracking-normal shadow-md"
                >
                  Update Card Data
                </Button>
              </div>
            </form>
            </div>
              {/* Right side: Preview */}
              <div className="w-full lg:w-[420px] shrink-0 hidden lg:flex flex-col border-l border-neutral-100 pl-8 relative">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Live Preview</h4>
                  <Button variant="none" size="none"
                    onClick={() => setEditingProduct(null)}
                    className="p-1.5 text-neutral-400 hover:text-[#f96b02] hover:bg-neutral-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="sticky top-0 flex justify-center">
                  <StoreOfferCard 
                    deal={{
                      title: formData.title || 'Product Title',
                      discount: formData.cardType === 'custom' ? 0 : (formData.discount || 0),
                      salePrice: formData.cardType === 'custom' ? 0 : 999,
                      cashback: formData.cardType === 'custom' ? 0 : formData.cashback,
                      image: formData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
                      affiliateUrl: formData.affiliateUrl || '#'
                    }} 
                    store={dbStores.find(s => s.id === formData.store) || { name: 'Store', logoUrl: '' }}
                    fullWidth={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-5xl w-full shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
                  <h4 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-neutral-700" />
                    Add New Product Card
                  </h4>
                  <Button variant="none" size="none"
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-1.5 text-neutral-400 hover:text-[#f96b02] hover:bg-neutral-100 rounded-full lg:hidden"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleSaveAdd} className="space-y-4">
                <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl mb-4 w-fit">
                  <button type="button" onClick={() => setFormData({...formData, cardType: 'builder'})} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${formData.cardType !== 'custom' ? 'bg-white shadow text-black' : 'text-neutral-500 hover:text-[#f96b02]'}`}>Card Builder</button>
                  <button type="button" onClick={() => setFormData({...formData, cardType: 'custom'})} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${formData.cardType === 'custom' ? 'bg-white shadow text-black' : 'text-neutral-500 hover:text-[#f96b02]'}`}>Custom Upload</button>
                </div>

              {formData.cardType !== 'custom' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Product Card Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Philips Classic Clogs"
                    className="w-full px-4 py-3 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                    required={formData.cardType !== 'custom'}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Store
                  </label>
                  <div onClick={(e) => e.stopPropagation()}>
                    <CustomSelect
                      value={formData.store}
                      onChange={(val) => setFormData({ ...formData, store: val })}
                      options={dbStores}
                      placeholder="Select Store"
                      dropdownKey="add-store"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Category
                  </label>
                  <div onClick={(e) => e.stopPropagation()}>
                    <CustomSelect
                      value={formData.category}
                      onChange={(val) => setFormData({ ...formData, category: val })}
                      options={dbCategories}
                      placeholder="Select Category"
                      dropdownKey="add-category"
                    />
                  </div>
                </div>
              </div>

              {formData.cardType !== 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Sale Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold"
                      required={formData.cardType !== 'custom'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Orig. Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => {
                        const originalPrice = e.target.value;
                        let salePrice = formData.salePrice;
                        if (originalPrice && formData.discount) {
                          salePrice = Math.round(Number(originalPrice) * (1 - Number(formData.discount) / 100));
                        }
                        setFormData({ ...formData, originalPrice, salePrice });
                      }}
                      className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => {
                        const discount = e.target.value;
                        let salePrice = formData.salePrice;
                        if (discount && formData.originalPrice) {
                          salePrice = Math.round(Number(formData.originalPrice) * (1 - Number(discount) / 100));
                        }
                        setFormData({ ...formData, discount, salePrice });
                      }}
                      placeholder="e.g. 62"
                      className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold text-amber-700"
                      required={formData.cardType !== 'custom'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Cashback (₹)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.cashback}
                      onChange={(e) => setFormData({ ...formData, cashback: e.target.value })}
                      placeholder="e.g. 5"
                      className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold text-emerald-700"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Product Image
                  </label>
                  <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl border border-neutral-200">
                    <Button variant="none" size="none"
                      type="button"
                      onClick={() => setImageInputType('url')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${imageInputType === 'url'
                          ? 'bg-white text-black shadow-xs'
                          : 'text-neutral-500 hover:text-[#f96b02]'
                        }`}
                    >
                      Image URL
                    </Button>
                    <Button variant="none" size="none"
                      type="button"
                      onClick={() => setImageInputType('file')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${imageInputType === 'file'
                          ? 'bg-white text-black shadow-xs'
                          : 'text-neutral-500 hover:text-[#f96b02]'
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
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-xs"
                      required
                    />
                    {formData.image && (
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-neutral-300 hover:border-[#f96b02] rounded-2xl p-4 text-center transition-colors cursor-pointer relative bg-neutral-50 flex flex-col items-center justify-center gap-1">
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

                    {formData.image && (
                      <div className="flex items-center gap-3 p-2 bg-neutral-50 border border-neutral-200 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="text-xs text-neutral-700 font-mono truncate flex-1 font-semibold">
                          Image selected
                        </span>
                        <Button variant="none" size="none"
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="text-xs font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Affiliate Link URL
                </label>
                <input
                  type="text"
                  value={formData.affiliateUrl}
                  onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                  placeholder="https://example.com/store/deal"
                  className="w-full px-4 py-3 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-xs"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button variant="none" size="none"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  className="text-xs rounded-xl !px-6 !py-3 normal-case tracking-normal shadow-md"
                >
                  Add Product Card
                </Button>
              </div>
            </form>
            </div>
              {/* Right side: Preview */}
              <div className="w-full lg:w-[420px] shrink-0 hidden lg:flex flex-col border-l border-neutral-100 pl-8 relative">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Live Preview</h4>
                  <Button variant="none" size="none"
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-1.5 text-neutral-400 hover:text-[#f96b02] hover:bg-neutral-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="sticky top-0 flex justify-center">
                  <StoreOfferCard 
                    deal={{
                      title: formData.title || 'Product Title',
                      discount: formData.cardType === 'custom' ? 0 : (formData.discount || 0),
                      salePrice: formData.cardType === 'custom' ? 0 : 999,
                      cashback: formData.cardType === 'custom' ? 0 : formData.cashback,
                      image: formData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
                      affiliateUrl: formData.affiliateUrl || '#'
                    }} 
                    store={dbStores.find(s => s.id === formData.store) || { name: 'Store', logoUrl: '' }}
                    fullWidth={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
    </div>
  );
}
