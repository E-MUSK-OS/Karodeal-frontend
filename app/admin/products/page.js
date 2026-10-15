'use client';
import { useState, useEffect, useRef } from 'react';

import {
  Search, Plus, Edit3, Trash2, CheckCircle2, ExternalLink, Tag, RefreshCw, X, ChevronUp, ChevronDown, ArrowUpDown, RotateCcw, Store, ShieldCheck, Check, Users, GripVertical, Star
} from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import ConfirmModal from '@/components/common/ConfirmModal';
import * as XLSX from 'xlsx';
import BuilderCardModal from '@/components/admin/products/BuilderCardModal';
import CustomCardModal from '@/components/admin/products/CustomCardModal';
import BulkImportModal from '@/components/admin/products/BulkImportModal';
import EditProductModal from '@/components/admin/products/EditProductModal';
import CustomSelect from '@/components/common/CustomSelect';
import { calculateCashback } from '@/lib/cashbackCalculator';
import { getSocket } from '@/lib/socket';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  const [selectedAdmin, setSelectedAdmin] = useState('ALL'); // 'ALL' | 'ROLE_ADMIN' | 'ROLE_SUB_ADMIN' | creatorId
  const [adminUsersList, setAdminUsersList] = useState([]);
  const [storeSearchText, setStoreSearchText] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'sortOrder', direction: 'asc' });
  const [currentRole, setCurrentRole] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [draggedProductId, setDraggedProductId] = useState(null);
  const [dragOverProductId, setDragOverProductId] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const [moveRankModal, setMoveRankModal] = useState({ isOpen: false, product: null, targetRank: '' });
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [dbStores, setDbStores] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [isReloading, setIsReloading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => { }, isDestructive: true });
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(null);
  const filterBarRef = useRef(null);

  useEffect(() => {
    const adminUserStr = localStorage.getItem('adminUser');
    if (adminUserStr) {
      try {
        const adminObj = JSON.parse(adminUserStr);
        if (adminObj?.role) setCurrentRole(adminObj.role);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStore, statusFilter, selectedAdmin, sortConfig]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleProductsChange = () => {
      if (isReordering) return;
      loadProducts();
    };

    if (socket) {
      socket.on('products:changed', handleProductsChange);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('karodeal:products_changed', handleProductsChange);
    }

    return () => {
      if (socket) {
        socket.off('products:changed', handleProductsChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('karodeal:products_changed', handleProductsChange);
      }
    };
  }, [isReordering]);

  const loadProducts = async () => {
    setIsReloading(true);
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      const adminObj = adminUserStr ? JSON.parse(adminUserStr) : null;
      const token = adminObj ? adminObj.token : null;
      if (adminObj?.role) {
        setCurrentRole(adminObj.role);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      let productsRes = await fetch(`${apiUrl}/products/admin`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (productsRes.status === 404) {
        // Fallback for when backend is not yet updated on Vercel
        productsRes = await fetch(`${apiUrl}/products?raw=true`);
      }

      const [storesRes, categoriesRes] = await Promise.all([
        fetch(`${apiUrl}/meta/stores`),
        fetch(`${apiUrl}/meta/categories`)
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

      // If Main Admin, fetch admin & sub-admin users list from /auth to populate filter options
      if (adminObj?.role === 'ADMIN') {
        try {
          const usersRes = await fetch(`${apiUrl}/auth`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (usersRes.ok) {
            const uData = await usersRes.json();
            const allUsers = Array.isArray(uData) ? uData : uData.users || [];
            const adminUsers = allUsers.filter(u => u.role === 'ADMIN' || u.role === 'SUB_ADMIN');
            setAdminUsersList(adminUsers);
          }
        } catch (err) {
          console.error('Failed to load admin users', err);
        }
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

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
  };

  const handleDragStart = (e, product) => {
    if (currentRole !== 'ADMIN') return;
    setDraggedProductId(product.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', product.id);
  };

  const handleDragOver = (e, product) => {
    e.preventDefault();
    if (currentRole !== 'ADMIN' || !draggedProductId || draggedProductId === product.id) return;
    setDragOverProductId(product.id);
  };

  const handleDrop = async (e, targetProduct) => {
    e.preventDefault();
    setDragOverProductId(null);
    if (!draggedProductId || draggedProductId === targetProduct.id) {
      setDraggedProductId(null);
      return;
    }

    const draggedProd = products.find(p => p.id === draggedProductId);
    if (!draggedProd) {
      setDraggedProductId(null);
      return;
    }

    const targetRank = targetProduct.sortOrder;
    setDraggedProductId(null);

    await executeMoveRank(draggedProd, targetRank);
  };

  const executeMoveRank = async (product, targetRank) => {
    const target = Math.max(1, parseInt(targetRank, 10));
    if (isNaN(target) || product.sortOrder === target) {
      setMoveRankModal({ isOpen: false, product: null, targetRank: '' });
      return;
    }

    setIsReordering(true);
    setMoveRankModal({ isOpen: false, product: null, targetRank: '' });

    // Optimistic UI update
    const oldRank = product.sortOrder;
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === product.id) {
          return { ...p, sortOrder: target };
        }
        if (target < oldRank) {
          if (p.sortOrder >= target && p.sortOrder < oldRank) {
            return { ...p, sortOrder: p.sortOrder + 1 };
          }
        } else {
          if (p.sortOrder > oldRank && p.sortOrder <= target) {
            return { ...p, sortOrder: p.sortOrder - 1 };
          }
        }
        return p;
      });
      return updated.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    });

    try {
      const adminUserStr = localStorage.getItem('adminUser');
      const token = adminUserStr ? JSON.parse(adminUserStr).token : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const res = await fetch(`${apiUrl}/products/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          targetRank: target
        })
      });

      if (res.ok) {
        showToast(`Moved "${product.title.slice(0, 25)}..." to Rank #${target}`);
        loadProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reorder product');
        loadProducts();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reorder product');
      loadProducts();
    } finally {
      setIsReordering(false);
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
      showToast('Error re-posting product');
    }
  };

  const handleTogglePin = async (product) => {
    if (currentRole !== 'ADMIN') return;

    const previousStatus = !!product.isPinned;
    const nextStatus = !previousStatus;

    // Optimistic UI update
    setProducts(prev =>
      prev.map(p => (p.id === product.id ? { ...p, isPinned: nextStatus } : p))
    );

    try {
      const adminUserStr = localStorage.getItem('adminUser');
      const adminObj = adminUserStr ? JSON.parse(adminUserStr) : null;
      const token = adminObj?.token;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/products/${product.id}/pin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPinned: nextStatus })
      });

      if (!res.ok) {
        // Revert on error
        setProducts(prev =>
          prev.map(p => (p.id === product.id ? { ...p, isPinned: previousStatus } : p))
        );
        const data = await res.json().catch(() => ({}));
        showToast(`Failed: ${data.error || 'Could not update star pin'}`);
      } else {
        showToast(nextStatus ? `⭐ Locked to Rank #${product.sortOrder} for ALL users!` : 'Unlocked from fixed rank.');
      }
    } catch (err) {
      console.error(err);
      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, isPinned: previousStatus } : p))
      );
      showToast('Error updating star status');
    }
  };

  const allCreators = (() => {
    const map = new Map();

    // 1. Seed currently logged-in user from localStorage if admin/sub-admin
    try {
      const adminStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
      if (adminStr) {
        const currentAdmin = JSON.parse(adminStr);
        if (currentAdmin?.id && (currentAdmin.role === 'ADMIN' || currentAdmin.role === 'SUB_ADMIN')) {
          map.set(currentAdmin.id, {
            id: currentAdmin.id,
            name: currentAdmin.name || currentAdmin.email || (currentAdmin.role === 'ADMIN' ? 'Main Admin' : 'Sub-Admin'),
            email: currentAdmin.email,
            role: currentAdmin.role
          });
        }
      }
    } catch (e) {}

    // 2. Add fetched admin & sub-admin users from backend (/auth)
    adminUsersList.forEach(u => {
      map.set(u.id, {
        id: u.id,
        name: u.name || u.email || (u.role === 'ADMIN' ? 'Main Admin' : 'Sub-Admin'),
        email: u.email,
        role: u.role
      });
    });

    // 3. Add creators present on existing products
    products.forEach(p => {
      if (p.createdById && p.createdBy) {
        if (!map.has(p.createdById)) {
          map.set(p.createdById, {
            id: p.createdById,
            name: p.createdBy.name || p.createdBy.email || (p.createdBy.role === 'SUB_ADMIN' ? 'Sub-Admin' : 'Main Admin'),
            email: p.createdBy.email,
            role: p.createdBy.role || 'ADMIN'
          });
        }
      }
    });

    // 4. Sort: Main Admins first, then Sub-Admins, then alphabetically by name
    return Array.from(map.values()).sort((a, b) => {
      if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
      if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  })();

  const filteredStoreList = dbStores.filter(store => 
    !storeSearchText || store.name.toLowerCase().includes(storeSearchText.toLowerCase())
  );

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

    let matchesAdmin = true;
    if (currentRole === 'ADMIN' && selectedAdmin !== 'ALL') {
      matchesAdmin = String(p.createdById) === String(selectedAdmin);
    }

    return matchesSearch && matchesStore && matchesStatus && matchesAdmin;
  }).sort((a, b) => {
    if (sortConfig.key === 'sortOrder') {
      const aRank = a.sortOrder !== undefined && a.sortOrder !== null ? a.sortOrder : 999999;
      const bRank = b.sortOrder !== undefined && b.sortOrder !== null ? b.sortOrder : 999999;
      return sortConfig.direction === 'asc' ? aRank - bRank : bRank - aRank;
    }

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

      {/* Search & Modern Filter Dropdowns Bar */}
      <div 
        ref={filterBarRef}
        className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 relative z-20"
      >
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product card title..."
            className="w-full px-4 py-2.5 pl-10 pr-9 text-xs sm:text-sm bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Custom Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === 'status' ? null : 'status');
              }}
              className={`w-full sm:w-auto px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs ${
                statusFilter !== 'ALL'
                  ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
                  : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate max-w-[120px]">
                  {statusFilter === 'ALL' ? 'All Statuses' : statusFilter === 'ACTIVE' ? 'Active Deals' : statusFilter === 'INACTIVE' ? 'Deactivated' : 'Expired Only'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'status' ? 'rotate-180 text-black' : 'text-neutral-400'}`} />
            </button>

            {openDropdown === 'status' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 min-w-[200px] animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                  Filter by Status
                </div>
                {[
                  { id: 'ALL', label: 'All Statuses', dot: 'bg-neutral-400' },
                  { id: 'ACTIVE', label: 'Active Deals', dot: 'bg-emerald-500' },
                  { id: 'INACTIVE', label: 'Deactivated', dot: 'bg-neutral-300' },
                  { id: 'EXPIRED', label: 'Expired Only', dot: 'bg-amber-500' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.id);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3.5 py-2 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                      statusFilter === opt.id
                        ? 'bg-orange-50 font-bold text-[#f96b02]'
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`}></span>
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {statusFilter === opt.id && <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Store Custom Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === 'store' ? null : 'store');
              }}
              className={`w-full sm:w-auto px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs ${
                selectedStore !== 'ALL'
                  ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
                  : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate max-w-[130px]">
                  {selectedStore === 'ALL' ? 'All Stores' : (dbStores.find(s => String(s.id) === String(selectedStore))?.name || 'Selected Store')}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'store' ? 'rotate-180 text-black' : 'text-neutral-400'}`} />
            </button>

            {openDropdown === 'store' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 min-w-[200px] max-w-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                  Filter by Store
                </div>
                {dbStores.length > 5 && (
                  <div className="p-2 border-b border-neutral-100">
                    <input
                      type="text"
                      value={storeSearchText}
                      onChange={(e) => setStoreSearchText(e.target.value)}
                      placeholder="Search stores..."
                      className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                )}
                <div className="max-h-56 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStore('ALL');
                      setOpenDropdown(null);
                      setStoreSearchText('');
                    }}
                    className={`w-full px-3.5 py-2 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                      selectedStore === 'ALL'
                        ? 'bg-orange-50 font-bold text-[#f96b02]'
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span>All Stores</span>
                    {selectedStore === 'ALL' && <Check className="w-3.5 h-3.5 text-[#f96b02]" />}
                  </button>
                  {filteredStoreList.map((store) => (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => {
                        setSelectedStore(store.id);
                        setOpenDropdown(null);
                        setStoreSearchText('');
                      }}
                      className={`w-full px-3.5 py-2 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                        String(selectedStore) === String(store.id)
                          ? 'bg-orange-50 font-bold text-[#f96b02]'
                          : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <span className="truncate">{store.name}</span>
                      {String(selectedStore) === String(store.id) && <Check className="w-3.5 h-3.5 text-[#f96b02]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin / Sub-Admin Filter Dropdown (MAIN ADMIN ONLY) */}
          {currentRole === 'ADMIN' && (
            <div className="relative flex-1 sm:flex-initial">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'admin' ? null : 'admin');
                }}
                className={`w-full sm:w-auto px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs ${
                  selectedAdmin !== 'ALL'
                    ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
                    : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="truncate max-w-[140px]">
                    {selectedAdmin === 'ALL'
                      ? 'All Admins'
                      : (allCreators.find(c => String(c.id) === String(selectedAdmin))?.name || 'Selected Admin')}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'admin' ? 'rotate-180 text-black' : 'text-neutral-400'}`} />
              </button>

              {openDropdown === 'admin' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 min-w-[220px] max-w-sm animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1 flex items-center justify-between">
                    <span>Admin / Sub-Admin</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {/* All Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAdmin('ALL');
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                        selectedAdmin === 'ALL'
                          ? 'bg-orange-50 font-bold text-[#f96b02]'
                          : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <span className="font-bold">All Admins & Sub-Admins</span>
                      {selectedAdmin === 'ALL' && <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />}
                    </button>

                    {/* Only the Admin & Sub-Admin Names */}
                    {allCreators.map((creator) => (
                      <button
                        key={creator.id}
                        type="button"
                        onClick={() => {
                          setSelectedAdmin(creator.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                          String(selectedAdmin) === String(creator.id)
                            ? 'bg-orange-50 font-bold text-[#f96b02]'
                            : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate font-semibold">{creator.name}</span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
                            creator.role === 'ADMIN' ? 'bg-neutral-900 text-white' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {creator.role === 'ADMIN' ? 'Main Admin' : 'Sub-Admin'}
                          </span>
                        </div>
                        {String(selectedAdmin) === String(creator.id) && (
                          <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reset All Filters Button */}
          {(searchQuery || selectedStore !== 'ALL' || statusFilter !== 'ALL' || selectedAdmin !== 'ALL') && (
            <Button
              variant="none"
              size="none"
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedStore('ALL');
                setStatusFilter('ALL');
                setSelectedAdmin('ALL');
                setStoreSearchText('');
              }}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 border border-red-200 cursor-pointer shadow-2xs"
              title="Reset all filters to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Showing {filteredProducts.length} Product Cards
            </span>
            {currentRole === 'ADMIN' && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200">
                <GripVertical className="w-3 h-3 text-neutral-400" />
                Drag ⠿ handle to reorder, or click any #Rank to jump
              </span>
            )}
          </div>
          <Button variant="none" size="none"
            onClick={loadProducts}
            disabled={isReloading}
            className="text-xs font-semibold text-neutral-600 hover:text-[#f96b02] flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin text-black' : ''}`} />
            {isReloading ? 'Reloading...' : 'Reload'}
          </Button>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[70vh] w-full">
          <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-neutral-50 text-neutral-500 text-xs font-bold uppercase tracking-wider shadow-[0_1px_0_0_#e5e5e5]">
                <th 
                  className={`p-4 pl-6 ${currentRole === 'ADMIN' ? 'cursor-pointer hover:bg-neutral-200' : ''} transition-colors group select-none ${currentRole === 'ADMIN' ? 'w-32' : 'w-24'}`}
                  onClick={() => currentRole === 'ADMIN' && handleSort('sortOrder')}
                >
                  <div className="flex items-center gap-1">
                    <span>{currentRole === 'ADMIN' ? 'RANK / SR.' : 'SR. NO.'}</span>
                    {currentRole === 'ADMIN' && <SortIcon columnKey="sortOrder" />}
                  </div>
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
                {currentRole !== 'SUB_ADMIN' && (
                  <th className="p-4 cursor-pointer hover:bg-neutral-200 transition-colors group select-none" onClick={() => handleSort('cashback')}>
                    <div className="flex items-center">Cashback <SortIcon columnKey="cashback" /></div>
                  </th>
                )}
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
                  <td colSpan={currentRole !== 'SUB_ADMIN' ? 9 : 8} className="p-8">
                    <PageLoader />
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={currentRole !== 'SUB_ADMIN' ? 9 : 8} className="p-8 text-center text-neutral-500 font-medium">No product cards found.</td>
                </tr>
              ) : paginatedProducts.map((p, index) => {
                const wReview = p.cashbackWithReview ?? calculateCashback(p.salePrice).withReview;
                const woReview = p.cashbackWithoutReview ?? calculateCashback(p.salePrice).withoutReview;

                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                const currentRank = p.sortOrder !== undefined && p.sortOrder !== null ? p.sortOrder : globalIndex;
                const isDragDropEnabled = currentRole === 'ADMIN' && sortConfig.key === 'sortOrder';

                return (
                  <tr 
                    key={p.id}
                    draggable={isDragDropEnabled}
                    onDragStart={(e) => handleDragStart(e, p)}
                    onDragOver={(e) => handleDragOver(e, p)}
                    onDrop={(e) => handleDrop(e, p)}
                    className={`transition-colors ${
                      draggedProductId === p.id 
                        ? 'opacity-30 bg-orange-100' 
                        : dragOverProductId === p.id 
                        ? 'border-t-2 border-[#f96b02] bg-orange-50/50' 
                        : 'hover:bg-neutral-50/70'
                    }`}
                  >
                    <td className="p-4 pl-6 font-mono text-sm">
                      <div className="flex items-center gap-1.5">
                        {currentRole === 'ADMIN' ? (
                          <>
                            <div 
                              className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-black p-1 -ml-2 rounded hover:bg-neutral-200/60 transition-colors"
                              title="Drag to rearrange position"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMoveRankModal({
                                  isOpen: true,
                                  product: p,
                                  targetRank: String(currentRank)
                                });
                              }}
                              className="font-mono text-xs font-bold px-2 py-1 rounded-lg transition-all bg-neutral-100 hover:bg-orange-50 text-neutral-800 hover:text-[#f96b02] border border-neutral-200 hover:border-orange-300 cursor-pointer shadow-2xs"
                              title="Click to change rank / jump position"
                            >
                              #{currentRank}
                            </button>

                            {/* Star / Fixed Rank Toggle for Main Admin */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePin(p);
                              }}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                p.isPinned
                                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 border border-amber-300 shadow-2xs ring-2 ring-amber-100'
                                  : 'text-neutral-300 hover:text-amber-500 hover:bg-neutral-100 border border-transparent'
                              }`}
                              title={
                                p.isPinned
                                  ? `⭐ LOCKED to Rank #${currentRank} for ALL users (Click to unlock)`
                                  : `☆ Click to LOCK to Rank #${currentRank} for ALL users`
                              }
                            >
                              <Star className={`w-3.5 h-3.5 transition-transform active:scale-125 ${p.isPinned ? 'fill-amber-400 text-amber-500' : ''}`} />
                            </button>
                          </>
                        ) : (
                          /* Sub-Admin: ONLY simple sequential serial number 1, 2, 3... in series */
                          <span className="font-mono text-xs font-bold text-neutral-500 pl-1">
                            {globalIndex}
                          </span>
                        )}
                      </div>
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
                    {currentRole !== 'SUB_ADMIN' && (
                      <td className="p-4">
                        <div className="flex flex-col gap-1 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-emerald-700">₹{wReview}</span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              With Review
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-neutral-800">₹{woReview}</span>
                            <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 border border-neutral-200/60 px-1.5 py-0.5 rounded">
                              Without Review
                            </span>
                          </div>
                        </div>
                      </td>
                    )}
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
        currentRole={currentRole}
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
          currentRole={currentRole}
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
          currentRole={currentRole}
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
          currentRole={currentRole}
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

      {/* Change Card Rank / Move Position Modal */}
      {moveRankModal.isOpen && moveRankModal.product && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setMoveRankModal({ isOpen: false, product: null, targetRank: '' })}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#f96b02]">
                  <ArrowUpDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-neutral-900 text-base leading-tight">Change Card Rank</h3>
                  <p className="text-[11px] text-neutral-500">Set position in user listing & homepage</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMoveRankModal({ isOpen: false, product: null, targetRank: '' })}
                className="text-neutral-400 hover:text-black p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-100 mb-5">
              <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                <img
                  src={moveRankModal.product.image}
                  alt={moveRankModal.product.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-neutral-900 line-clamp-1">{moveRankModal.product.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-neutral-500">Current Position:</span>
                  <span className="text-xs font-mono font-black text-[#f96b02] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                    #{moveRankModal.product.sortOrder}
                  </span>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeMoveRank(moveRankModal.product, moveRankModal.targetRank);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Target Position (1 to {products.length}):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-neutral-400">#</span>
                  <input
                    type="number"
                    min="1"
                    max={products.length}
                    autoFocus
                    value={moveRankModal.targetRank}
                    onChange={(e) => setMoveRankModal({ ...moveRankModal, targetRank: e.target.value })}
                    placeholder={`e.g. 2 or 3 (Current is ${moveRankModal.product.sortOrder})`}
                    className="w-full pl-8 pr-4 py-2.5 text-sm font-bold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  Cards between current and target position will automatically shift up or down.
                </p>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">Quick Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Top (#1)', val: 1 },
                    { label: 'Rank #2', val: 2 },
                    { label: 'Rank #3', val: 3 },
                    { label: 'Rank #5', val: 5 },
                    { label: 'Rank #8 (Home)', val: 8 },
                    { label: 'Rank #10', val: 10 },
                    { label: `Last (#${products.length})`, val: products.length },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setMoveRankModal({ ...moveRankModal, targetRank: String(preset.val) })}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        String(moveRankModal.targetRank) === String(preset.val)
                          ? 'bg-black text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="none"
                  size="none"
                  onClick={() => setMoveRankModal({ isOpen: false, product: null, targetRank: '' })}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="none"
                  size="none"
                  disabled={!moveRankModal.targetRank || Number(moveRankModal.targetRank) < 1 || isReordering}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-black hover:bg-[#f96b02] text-white shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isReordering ? 'Moving...' : `Move to Position #${moveRankModal.targetRank || ''}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
