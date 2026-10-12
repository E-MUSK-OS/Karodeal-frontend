'use client';
import { useState, useEffect } from 'react';

import {
  Search, Plus, Edit3, Trash2, CheckCircle2, ExternalLink, Tag, RefreshCw, X, Upload, ChevronUp, ChevronDown, ArrowUpDown, Loader2, RotateCcw
} from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import ConfirmModal from '@/components/common/ConfirmModal';
import StoreOfferCard from '@/components/deals/StoreOfferCard';
import * as XLSX from 'xlsx';
import BuilderCardModal from '@/components/admin/products/BuilderCardModal';
import CustomCardModal from '@/components/admin/products/CustomCardModal';
import BulkImportModal from '@/components/admin/products/BulkImportModal';
import EditProductModal from '@/components/admin/products/EditProductModal';
import CustomSelect from '@/components/common/CustomSelect';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentRole, setCurrentRole] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [dbStores, setDbStores] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [imageInputType, setImageInputType] = useState('url'); // 'url' | 'file'
  const [isReloading, setIsReloading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => { }, isDestructive: true });
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStore, statusFilter, sortConfig]);

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
      const adminObj = adminUserStr ? JSON.parse(adminUserStr) : null;
      const token = adminObj ? adminObj.token : null;
      if (adminObj?.role) {
        setCurrentRole(adminObj.role);
      }

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
    setTimeout(() => setToastMessage(''), 5000);
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
    const newActive = !product.isActive;
    const isExpired = product.expiresAt && new Date(product.expiresAt) <= new Date();
    const shouldClearExpiry = newActive && isExpired;

    // Optimistic UI update
    setProducts(prev => prev.map(p => p.id === product.id ? { 
      ...p, 
      isActive: newActive,
      ...(shouldClearExpiry ? { expiresAt: null } : {})
    } : p));

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
          isActive: newActive,
          ...(shouldClearExpiry ? { expiresAt: null } : {})
        })
      });
      if (res.ok) {
        showToast(newActive ? 'Card activated & published live to user site!' : 'Card deactivated (hidden from user site, kept in admin panel).');
      } else {
        // Revert on failure
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
        alert('Failed to toggle status');
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    }
  };

  const handleRepost = async (product) => {
    // Optimistic UI update: make active, clear past expiration, refresh timestamp
    setProducts(prev => prev.map(p => p.id === product.id ? {
      ...p,
      isActive: true,
      expiresAt: null,
      createdAt: new Date().toISOString()
    } : p));

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
          repost: true
        })
      });
      if (res.ok) {
        showToast(`Card re-posted! Now live at the top of the user panel.`);
      } else {
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
        alert('Failed to re-post product card');
      }
    } catch (err) {
      console.error(err);
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      alert('Error re-posting product');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStore = selectedStore === 'ALL' || String(p.storeId) === String(selectedStore);

    let matchesStatus = true;
    const isExpired = p.expiresAt && new Date(p.expiresAt) <= new Date();
    if (statusFilter === 'ACTIVE') {
      matchesStatus = p.isActive && !isExpired;
    } else if (statusFilter === 'INACTIVE') {
      matchesStatus = !p.isActive;
    } else if (statusFilter === 'EXPIRED') {
      matchesStatus = isExpired;
    }

    return matchesSearch && matchesStore && matchesStatus;
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



  return (
    <div className="space-y-6" onClick={() => setOpenDropdown(null)}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-white text-neutral-900 border border-neutral-200 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-bold transition-all">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-neutral-900">Product & Deal Cards</h3>
            {currentRole === 'SUB_ADMIN' && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Your Cards Only
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500">
            {currentRole === 'SUB_ADMIN' 
              ? 'Viewing and managing the cards created by your account.' 
              : 'Manage product cards shown across the website dynamically from the database.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto relative">
          <Button variant="none" size="none"
            onClick={(e) => { e.stopPropagation(); setAddMenuOpen(!addMenuOpen); setOpenDropdown(null); }}
            className="w-full sm:w-auto px-4 py-2.5 bg-black hover:bg-[#f96b02] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Product
            <ChevronDown className="w-4 h-4" />
          </Button>

          {addMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50 py-1" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => { setAddMenuOpen(false); setIsBuilderModalOpen(true); }}
                className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-3 transition-colors border-b border-neutral-100 last:border-0"
              >
                <span className="text-xl">🎨</span>
                <div>
                  <div className="text-sm font-bold text-neutral-800">Card Builder</div>
                  <div className="text-[10px] text-neutral-500">Create standard deal card</div>
                </div>
              </button>
              <button 
                onClick={() => { setAddMenuOpen(false); setIsCustomModalOpen(true); }}
                className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-3 transition-colors border-b border-neutral-100 last:border-0"
              >
                <span className="text-xl">🖼️</span>
                <div>
                  <div className="text-sm font-bold text-neutral-800">Custom Upload</div>
                  <div className="text-[10px] text-neutral-500">Upload direct deal image</div>
                </div>
              </button>
              <button 
                onClick={() => { setAddMenuOpen(false); setIsBulkModalOpen(true); }}
                className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-3 transition-colors border-b border-neutral-100 last:border-0"
              >
                <span className="text-xl">📄</span>
                <div>
                  <div className="text-sm font-bold text-neutral-800">Bulk Import</div>
                  <div className="text-[10px] text-neutral-500">Upload Excel or CSV</div>
                </div>
              </button>
            </div>
          )}
        </div>
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

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Status Select Dropdown */}
          <div className="w-full sm:w-auto relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 px-4 py-2.5 pr-10 text-xs font-bold uppercase tracking-wider bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black cursor-pointer text-neutral-900 appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Deals</option>
              <option value="INACTIVE">Deactivated</option>
              <option value="EXPIRED">Expired Only</option>
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                      <div className="min-w-0">
                        <div className="font-bold text-neutral-900 line-clamp-1 max-w-xs">{p.title}</div>
                        {currentRole === 'ADMIN' && p.createdBy && (
                          <div className="text-[10px] text-neutral-400 font-medium">
                            Added by: <span className="font-semibold text-neutral-600">{p.createdBy.name || p.createdBy.email}</span> {p.createdBy.role === 'SUB_ADMIN' ? '(Sub-Admin)' : ''}
                          </div>
                        )}
                      </div>
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
                        title={p.isActive ? 'Live on User Site (Click to Deactivate)' : 'Deactivated / Hidden from Users (Click to Activate)'}
                      >
                        <span className="sr-only">Toggle active status</span>
                        <span aria-hidden="true" className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${p.isActive ? 'translate-x-2' : '-translate-x-2'}`} />
                      </button>
                      {!p.isActive && (
                        <div className="text-[10px] font-bold mt-0.5 text-neutral-400 uppercase tracking-wider">
                          Inactive
                        </div>
                      )}
                      {p.expiresAt && (
                        <div className={`text-[10px] font-semibold mt-1 flex items-center justify-center gap-1 ${new Date(p.expiresAt) <= new Date() ? 'text-red-500' : 'text-amber-600'}`}>
                          <span>⏰</span>
                          <span>
                            {new Date(p.expiresAt) <= new Date()
                              ? 'Expired'
                              : new Date(p.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        {(!p.isActive || (p.expiresAt && new Date(p.expiresAt) <= new Date())) && (
                          <button
                            onClick={() => handleRepost(p)}
                            className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                            title="Re-post this deal card live to the user panel"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Re-Post
                          </button>
                        )}
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
      <EditProductModal
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={() => { setEditingProduct(null); loadProducts(); showToast('Product card updated successfully!'); }}
        dbStores={dbStores}
        dbCategories={dbCategories}
        existingProducts={products}
      />

      {/* Add Modals */}
      {isBuilderModalOpen && (
        <BuilderCardModal
          isOpen={isBuilderModalOpen}
          onClose={() => setIsBuilderModalOpen(false)}
          onSuccess={() => { setIsBuilderModalOpen(false); loadProducts(); showToast('New product card added!'); }}
          dbStores={dbStores}
          dbCategories={dbCategories}
          existingProducts={products}
        />
      )}

      {isCustomModalOpen && (
        <CustomCardModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onSuccess={() => { setIsCustomModalOpen(false); loadProducts(); showToast('Custom product card added!'); }}
          dbStores={dbStores}
          dbCategories={dbCategories}
          existingProducts={products}
        />
      )}

      {isBulkModalOpen && (
        <BulkImportModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={(result) => { 
            setIsBulkModalOpen(false); 
            loadProducts(); 
            setBulkResult(result);
          }}
          dbStores={dbStores}
          dbCategories={dbCategories}
        />
      )}

      {/* Bulk Import Result Popup */}
      {bulkResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-[400px] w-full shadow-2xl border border-neutral-200 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2 tracking-tight">Import Complete!</h3>
            <div className="text-sm font-medium text-neutral-600 mb-6 space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
              <p className="flex items-center justify-between">
                <span>Successfully Added:</span>
                <span className="font-black text-emerald-600 text-base">{bulkResult.count}</span>
              </p>
              {bulkResult.skippedCount > 0 && (
                <p className="flex items-center justify-between border-t border-neutral-200 pt-3">
                  <span>Duplicates Skipped:</span>
                  <span className="font-black text-amber-500 text-base">{bulkResult.skippedCount}</span>
                </p>
              )}
            </div>
            <Button 
              onClick={() => setBulkResult(null)} 
              variant="primary" 
              className="w-full rounded-xl py-3.5 text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              Okay, Close
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
    </div>
  );
}
